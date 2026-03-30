<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::query()->where('email', 'user@gobelanja.test')->first();

        if (! $user) {
            return;
        }

        $orders = [
            [
                'user_id' => $user->id,
                'order_number' => 'INV-GB-1001',
                'total_amount' => 1299000,
                'status' => 'pending',
                'shipping_courier' => 'JNE',
                'tracking_number' => null,
                'shipping_address' => 'Jl. Merdeka No. 10, Bandung, Jawa Barat',
                'payment_status' => 'pending',
                'notes' => 'Mohon kirim sore hari.',
            ],
            [
                'user_id' => $user->id,
                'order_number' => 'INV-GB-1002',
                'total_amount' => 899000,
                'status' => 'diproses',
                'shipping_courier' => 'SiCepat',
                'tracking_number' => null,
                'shipping_address' => 'Jl. Sudirman No. 88, Jakarta Pusat',
                'payment_status' => 'pending',
                'notes' => null,
            ],
            [
                'user_id' => $user->id,
                'order_number' => 'INV-GB-1003',
                'total_amount' => 449000,
                'status' => 'dikirim',
                'shipping_courier' => 'J&T',
                'tracking_number' => 'JT1234567890',
                'shipping_address' => 'Jl. Merdeka No. 10, Bandung, Jawa Barat',
                'payment_status' => 'pending',
                'notes' => 'Titip satpam.',
            ],
            [
                'user_id' => $user->id,
                'order_number' => 'INV-GB-1004',
                'total_amount' => 349000,
                'status' => 'selesai',
                'shipping_courier' => 'AnterAja',
                'tracking_number' => 'AA1234567890',
                'shipping_address' => 'Jl. Sudirman No. 88, Jakarta Pusat',
                'payment_status' => 'paid',
                'notes' => null,
            ],
        ];

        foreach ($orders as $order) {
            Order::query()->updateOrCreate(
                ['order_number' => $order['order_number']],
                $order,
            );
        }
    }
}
