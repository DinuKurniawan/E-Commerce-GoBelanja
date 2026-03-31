<?php

namespace App\Services;

use App\Models\ConversionEvent;
use App\Models\ProductView;
use App\Models\CartAbandonment;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EventTracker
{
    /**
     * Track product view
     */
    public static function trackProductView($productId, $userId = null, $sessionId = null)
    {
        try {
            ProductView::create([
                'product_id' => $productId,
                'user_id' => $userId ?? auth()->id(),
                'session_id' => $sessionId ?? session()->getId(),
            ]);
            
            // Also track as conversion event
            self::trackConversionEvent('view_product', $productId, $userId, $sessionId);
        } catch (\Exception $e) {
            \Log::error('Product view tracking failed: ' . $e->getMessage());
        }
    }

    /**
     * Track conversion event
     */
    public static function trackConversionEvent(
        string $eventType, 
        $productId = null, 
        $userId = null, 
        $sessionId = null,
        $orderId = null,
        array $eventData = null
    ) {
        try {
            ConversionEvent::create([
                'user_id' => $userId ?? auth()->id(),
                'session_id' => $sessionId ?? session()->getId(),
                'event_type' => $eventType,
                'product_id' => $productId,
                'order_id' => $orderId,
                'event_data' => $eventData,
            ]);
        } catch (\Exception $e) {
            \Log::error('Conversion event tracking failed: ' . $e->getMessage());
        }
    }

    /**
     * Track add to cart
     */
    public static function trackAddToCart($productId, $userId = null, $sessionId = null)
    {
        self::trackConversionEvent('add_to_cart', $productId, $userId, $sessionId);
    }

    /**
     * Track checkout start
     */
    public static function trackCheckoutStart($userId = null, $sessionId = null)
    {
        self::trackConversionEvent('checkout_start', null, $userId, $sessionId);
    }

    /**
     * Track order complete
     */
    public static function trackOrderComplete($orderId, $userId = null, $sessionId = null)
    {
        self::trackConversionEvent('order_complete', null, $userId, $sessionId, $orderId);
    }

    /**
     * Track cart abandonment
     */
    public static function trackCartAbandonment(
        $cartValue,
        $itemsCount,
        array $cartItems,
        $userId = null,
        $sessionId = null,
        $stage = 'cart'
    ) {
        try {
            // Check if abandonment already exists for this session
            $existing = CartAbandonment::where('session_id', $sessionId ?? session()->getId())
                ->whereNull('recovered_at')
                ->latest()
                ->first();

            if ($existing) {
                // Update existing abandonment
                $existing->update([
                    'cart_value' => $cartValue,
                    'items_count' => $itemsCount,
                    'cart_items' => $cartItems,
                    'abandoned_at' => now(),
                    'abandonment_stage' => $stage,
                ]);
            } else {
                // Create new abandonment record
                CartAbandonment::create([
                    'user_id' => $userId ?? auth()->id(),
                    'session_id' => $sessionId ?? session()->getId(),
                    'cart_value' => $cartValue,
                    'items_count' => $itemsCount,
                    'cart_items' => $cartItems,
                    'abandoned_at' => now(),
                    'abandonment_stage' => $stage,
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Cart abandonment tracking failed: ' . $e->getMessage());
        }
    }

    /**
     * Mark cart as recovered
     */
    public static function markCartRecovered($sessionId, $orderId, $method = 'organic')
    {
        try {
            CartAbandonment::where('session_id', $sessionId)
                ->whereNull('recovered_at')
                ->update([
                    'recovered_at' => now(),
                    'recovered_order_id' => $orderId,
                    'recovery_method' => $method,
                ]);
        } catch (\Exception $e) {
            \Log::error('Cart recovery tracking failed: ' . $e->getMessage());
        }
    }

    /**
     * Batch track events (for performance)
     */
    public static function batchTrackEvents(array $events)
    {
        try {
            DB::beginTransaction();
            
            foreach ($events as $event) {
                ConversionEvent::create($event);
            }
            
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Batch event tracking failed: ' . $e->getMessage());
        }
    }

    /**
     * Clean old analytics data (for maintenance)
     */
    public static function cleanOldData($daysToKeep = 365)
    {
        try {
            $cutoffDate = Carbon::now()->subDays($daysToKeep);
            
            ProductView::where('created_at', '<', $cutoffDate)->delete();
            ConversionEvent::where('created_at', '<', $cutoffDate)->delete();
            CartAbandonment::where('abandoned_at', '<', $cutoffDate)->delete();
            
            \Log::info("Cleaned analytics data older than {$daysToKeep} days");
        } catch (\Exception $e) {
            \Log::error('Analytics data cleanup failed: ' . $e->getMessage());
        }
    }
}
