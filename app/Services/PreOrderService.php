<?php

namespace App\Services;

use App\Models\PreOrder;
use App\Models\Product;
use App\Models\User;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use App\Notifications\PreOrderPlaced;
use App\Notifications\PreOrderAvailable;

class PreOrderService
{
    public function createPreOrder(User $user, Product $product, int $quantity, $colorId = null, $sizeId = null)
    {
        $totalPrice = $product->price * $quantity;
        $depositPercent = $product->pre_order_deposit_percent ?? 30;
        $depositAmount = ($totalPrice * $depositPercent) / 100;
        $remainingAmount = $totalPrice - $depositAmount;

        $preOrder = PreOrder::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'color_id' => $colorId,
            'size_id' => $sizeId,
            'quantity' => $quantity,
            'deposit_amount' => $depositAmount,
            'remaining_amount' => $remainingAmount,
            'status' => 'pending',
            'estimated_arrival_date' => $product->pre_order_availability_date,
        ]);

        // Send notification
        try {
            $user->notify(new PreOrderPlaced($preOrder));
        } catch (\Exception $e) {
            // Log error but don't fail the pre-order
            \Log::error('Failed to send pre-order notification: ' . $e->getMessage());
        }

        return $preOrder;
    }

    public function calculateDeposit(Product $product, int $quantity): array
    {
        $totalPrice = $product->price * $quantity;
        $depositPercent = $product->pre_order_deposit_percent ?? 30;
        $depositAmount = ($totalPrice * $depositPercent) / 100;
        $remainingAmount = $totalPrice - $depositAmount;

        return [
            'total_price' => $totalPrice,
            'deposit_percent' => $depositPercent,
            'deposit_amount' => $depositAmount,
            'remaining_amount' => $remainingAmount,
        ];
    }

    public function notifyProductAvailable(PreOrder $preOrder)
    {
        if ($preOrder->notified_at) {
            return false;
        }

        $preOrder->update([
            'status' => 'ready',
            'notified_at' => now(),
        ]);

        try {
            $preOrder->user->notify(new PreOrderAvailable($preOrder));
        } catch (\Exception $e) {
            \Log::error('Failed to send pre-order available notification: ' . $e->getMessage());
        }

        return true;
    }

    public function convertToOrder(PreOrder $preOrder): Order
    {
        return DB::transaction(function () use ($preOrder) {
            // Create order
            $order = Order::create([
                'user_id' => $preOrder->user_id,
                'order_number' => 'ORD-' . strtoupper(uniqid()),
                'status' => 'pending',
                'total_amount' => $preOrder->getTotalAmount(),
                'subtotal' => $preOrder->getTotalAmount(),
                'shipping_cost' => 0,
                'payment_status' => 'pending',
            ]);

            // Create order item
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $preOrder->product_id,
                'quantity' => $preOrder->quantity,
                'price' => $preOrder->product->price,
                'subtotal' => $preOrder->getTotalAmount(),
            ]);

            // Update pre-order status
            $preOrder->update([
                'status' => 'completed',
            ]);

            // Deduct stock if variant exists
            if ($preOrder->color_id && $preOrder->size_id) {
                $variant = $preOrder->product->variants()
                    ->where('color_id', $preOrder->color_id)
                    ->where('size_id', $preOrder->size_id)
                    ->first();
                
                if ($variant) {
                    $variant->decrement('stock', $preOrder->quantity);
                }
            }

            return $order;
        });
    }

    public function bulkNotify(Product $product)
    {
        $preOrders = PreOrder::where('product_id', $product->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->whereNull('notified_at')
            ->get();

        $notifiedCount = 0;
        foreach ($preOrders as $preOrder) {
            if ($this->notifyProductAvailable($preOrder)) {
                $notifiedCount++;
            }
        }

        return $notifiedCount;
    }
}
