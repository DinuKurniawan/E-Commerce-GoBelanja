<?php

namespace Database\Seeders;

use App\Models\Promotion;
use Illuminate\Database\Seeder;

class PromotionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $promotions = [
            [
                'name' => 'Voucher New User',
                'code' => 'NEWUSER10',
                'type' => 'voucher',
                'discount_percent' => 10,
                'minimum_purchase' => 200000,
                'expires_at' => now()->addMonths(2),
                'is_active' => true,
            ],
            [
                'name' => 'Diskon Elektronik',
                'code' => 'ELEK25',
                'type' => 'discount_product',
                'discount_percent' => 25,
                'minimum_purchase' => 500000,
                'expires_at' => now()->addMonth(),
                'is_active' => true,
            ],
        ];

        foreach ($promotions as $promotion) {
            Promotion::query()->updateOrCreate(
                ['code' => $promotion['code']],
                $promotion,
            );
        }
    }
}
