<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Database\Seeder;

class PaymentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $orders = Order::query()->orderBy('id')->get();

        foreach ($orders as $order) {
            Payment::query()->updateOrCreate(
                ['order_id' => $order->id],
                [
                    'method' => 'Transfer Bank',
                    'status' => $order->status === 'selesai' ? 'paid' : 'pending',
                    'proof_image' => null,
                    'amount' => $order->total_amount,
                    'paid_at' => $order->status === 'selesai' ? now()->subDays(2) : null,
                ],
            );

            $order->update([
                'payment_status' => $order->status === 'selesai' ? 'paid' : 'pending',
            ]);
        }
    }
}
