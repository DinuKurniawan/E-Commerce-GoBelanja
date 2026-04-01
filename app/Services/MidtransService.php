<?php

namespace App\Services;

use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Transaction;
use Midtrans\Notification;

class MidtransService
{
    public function __construct()
    {
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized = config('midtrans.is_sanitized');
        Config::$is3ds = config('midtrans.is_3ds');
    }

    public function createTransaction($order)
    {
        $params = [
            'transaction_details' => [
                'order_id' => $order->order_number,
                'gross_amount' => (int) $order->total_amount,
            ],
            'customer_details' => [
                'first_name' => $order->user->name,
                'email' => $order->user->email,
                'phone' => $order->user->phone ?? '',
            ],
            'item_details' => $this->buildItemDetails($order),
        ];

        try {
            $snapToken = Snap::getSnapToken($params);
            return [
                'success' => true,
                'snap_token' => $snapToken,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    private function buildItemDetails($order)
    {
        $items = [];

        // Add product items
        foreach ($order->items as $item) {
            $items[] = [
                'id' => $item->product_id,
                'price' => (int) $item->unit_price,
                'quantity' => $item->quantity,
                'name' => $item->product->name,
            ];
        }

        // Add shipping cost
        if ($order->shipping_cost > 0) {
            $items[] = [
                'id' => 'SHIPPING',
                'price' => (int) $order->shipping_cost,
                'quantity' => 1,
                'name' => 'Biaya Pengiriman - ' . $order->shipping_courier,
            ];
        }

        // Add insurance cost
        if ($order->has_insurance && $order->insurance_cost > 0) {
            $items[] = [
                'id' => 'INSURANCE',
                'price' => (int) $order->insurance_cost,
                'quantity' => 1,
                'name' => 'Asuransi Pengiriman',
            ];
        }

        // Add discount (as negative amount)
        if ($order->discount_amount > 0) {
            $items[] = [
                'id' => 'DISCOUNT',
                'price' => -(int) $order->discount_amount,
                'quantity' => 1,
                'name' => 'Diskon' . ($order->promotion_code ? ' - ' . $order->promotion_code : ''),
            ];
        }

        return $items;
    }

    public function getTransactionStatus($orderId)
    {
        try {
            $status = Transaction::status($orderId);
            return [
                'success' => true,
                'status' => $status,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function handleNotification($notification)
    {
        $orderId = $notification->order_id;
        $transactionStatus = $notification->transaction_status;
        $fraudStatus = $notification->fraud_status ?? null;

        $paymentStatus = 'pending';

        if ($transactionStatus == 'capture') {
            if ($fraudStatus == 'accept') {
                $paymentStatus = 'paid';
            }
        } elseif ($transactionStatus == 'settlement') {
            $paymentStatus = 'paid';
        } elseif ($transactionStatus == 'pending') {
            $paymentStatus = 'pending';
        } elseif ($transactionStatus == 'deny' || $transactionStatus == 'expire' || $transactionStatus == 'cancel') {
            $paymentStatus = 'failed';
        }

        return [
            'order_id' => $orderId,
            'payment_status' => $paymentStatus,
            'transaction_status' => $transactionStatus,
            'fraud_status' => $fraudStatus,
        ];
    }
}
