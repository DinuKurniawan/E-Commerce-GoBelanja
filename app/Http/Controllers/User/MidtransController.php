<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Services\MidtransService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Midtrans\Notification;

class MidtransController extends Controller
{
    public function __construct(private MidtransService $midtransService)
    {
    }

    public function createSnapToken($orderId): JsonResponse
    {
        $order = Order::with(['user', 'items.product'])->findOrFail($orderId);

        // Only allow user to create token for their own order
        if ($order->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Check if order is still pending payment
        if ($order->payment_status !== 'pending') {
            return response()->json(['error' => 'Order sudah dibayar atau dibatalkan'], 400);
        }

        $result = $this->midtransService->createTransaction($order);

        if ($result['success']) {
            // Update payment with snap token
            $payment = Payment::where('order_id', $order->id)->first();
            if ($payment) {
                $payment->update([
                    'snap_token' => $result['snap_token'],
                ]);
            }

            return response()->json([
                'snap_token' => $result['snap_token'],
                'client_key' => config('midtrans.client_key'),
            ]);
        }

        return response()->json(['error' => $result['message']], 500);
    }

    public function notification(Request $request): JsonResponse
    {
        try {
            $notification = new Notification();

            $result = $this->midtransService->handleNotification($notification);

            $order = Order::where('order_number', $result['order_id'])->first();

            if (!$order) {
                Log::warning('Order not found for Midtrans notification', ['order_id' => $result['order_id']]);
                return response()->json(['message' => 'Order not found'], 404);
            }

            DB::transaction(function () use ($order, $result, $notification) {
                $payment = Payment::where('order_id', $order->id)->first();

                if ($payment) {
                    $payment->update([
                        'status' => $result['payment_status'],
                        'transaction_id' => $notification->transaction_id ?? null,
                        'payment_type' => $notification->payment_type ?? null,
                        'paid_at' => $result['payment_status'] === 'paid' ? now() : null,
                    ]);
                }

                // Update order payment status
                $order->update([
                    'payment_status' => $result['payment_status'],
                ]);

                // If payment is successful, update order status
                if ($result['payment_status'] === 'paid' && $order->status === 'pending') {
                    $order->update(['status' => 'processing']);
                }
            });

            Log::info('Midtrans notification processed', [
                'order_id' => $result['order_id'],
                'status' => $result['payment_status'],
            ]);

            return response()->json(['message' => 'Notification processed']);
        } catch (\Exception $e) {
            Log::error('Midtrans notification error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    public function checkStatus($orderId): JsonResponse
    {
        $order = Order::findOrFail($orderId);

        // Only allow user to check their own order
        if ($order->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $result = $this->midtransService->getTransactionStatus($order->order_number);

        if ($result['success']) {
            return response()->json([
                'transaction_status' => $result['status']->transaction_status,
                'payment_status' => $order->payment_status,
            ]);
        }

        return response()->json(['error' => $result['message']], 500);
    }
}

