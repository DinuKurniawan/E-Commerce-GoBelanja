<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Promotion;
use App\Models\Category;
use App\Models\Product;

class AdvancedPromotionSeeder extends Seeder
{
    public function run(): void
    {
        // Clear existing promotions
        Promotion::query()->delete();

        // Get some categories and products for testing
        $categories = Category::all();
        $products = Product::take(5)->get();

        $promotions = [
            // 1. Standard Voucher
            [
                'name' => 'Diskon 15% untuk Semua Produk',
                'code' => 'DISKON15',
                'promotion_type' => 'voucher',
                'discount_percent' => 15,
                'minimum_purchase' => 100000,
                'expires_at' => now()->addDays(30),
                'is_active' => true,
                'description' => 'Dapatkan diskon 15% untuk semua produk dengan minimum pembelian Rp 100.000',
                'applies_to' => 'all',
                'max_discount_amount' => 50000,
                'usage_limit' => 100,
                'per_user_limit' => 3,
                'can_stack' => false,
            ],

            // 2. BOGO (Buy 2 Get 1 Free)
            [
                'name' => 'Beli 2 Gratis 1',
                'code' => 'BOGO21',
                'promotion_type' => 'bogo',
                'discount_percent' => 0,
                'minimum_purchase' => 0,
                'buy_quantity' => 2,
                'get_quantity' => 1,
                'get_discount_percent' => 100,
                'expires_at' => now()->addDays(15),
                'is_active' => true,
                'description' => 'Beli 2 produk gratis 1 produk',
                'applies_to' => 'all',
                'usage_limit' => 50,
                'can_stack' => false,
            ],

            // 3. Bundle Deal
            [
                'name' => 'Bundle Hemat 3 Produk',
                'code' => 'BUNDLE3',
                'promotion_type' => 'bundle',
                'discount_percent' => 0,
                'minimum_purchase' => 0,
                'bundle_products' => $products->take(3)->pluck('id')->toArray(),
                'bundle_price' => 250000,
                'expires_at' => now()->addDays(20),
                'is_active' => true,
                'description' => 'Beli 3 produk pilihan dengan harga spesial Rp 250.000',
                'applies_to' => 'bundle',
                'usage_limit' => 30,
                'can_stack' => false,
            ],

            // 4. Free Shipping
            [
                'name' => 'Gratis Ongkir Belanja 150rb',
                'code' => 'FREESHIPJKT',
                'promotion_type' => 'free_shipping',
                'discount_percent' => 0,
                'minimum_purchase' => 150000,
                'shipping_free_above' => 150000,
                'shipping_courier' => null, // All couriers
                'expires_at' => now()->addDays(45),
                'is_active' => true,
                'description' => 'Gratis ongkir untuk semua kurir dengan belanja minimal Rp 150.000',
                'applies_to' => 'all',
                'can_stack' => true,
            ],

            // 5. Category Discount
            [
                'name' => 'Diskon 20% Kategori Electronics',
                'code' => 'ELECTRONICS20',
                'promotion_type' => 'category',
                'discount_percent' => 20,
                'minimum_purchase' => 0,
                'category_id' => $categories->first()?->id,
                'expires_at' => now()->addDays(10),
                'is_active' => true,
                'description' => 'Diskon 20% untuk semua produk kategori Electronics',
                'applies_to' => 'category',
                'usage_limit' => null,
                'can_stack' => false,
            ],

            // 6. Tiered Discount
            [
                'name' => 'Diskon Berjenjang - Semakin Banyak Semakin Hemat',
                'code' => 'TIERED2025',
                'promotion_type' => 'tiered',
                'discount_percent' => 0,
                'minimum_purchase' => 100000,
                'tier_levels' => [
                    ['amount' => 100000, 'discount_percent' => 5],
                    ['amount' => 300000, 'discount_percent' => 10],
                    ['amount' => 500000, 'discount_percent' => 15],
                    ['amount' => 1000000, 'discount_percent' => 20],
                ],
                'expires_at' => now()->addDays(60),
                'is_active' => true,
                'description' => 'Belanja lebih banyak, hemat lebih besar! Mulai dari 5% hingga 20%',
                'applies_to' => 'all',
                'max_discount_amount' => 200000,
                'can_stack' => false,
            ],

            // 7. First Purchase Discount
            [
                'name' => 'Selamat Datang! Diskon 20% Pembelian Pertama',
                'code' => 'WELCOME20',
                'promotion_type' => 'first_purchase',
                'discount_percent' => 20,
                'minimum_purchase' => 50000,
                'expires_at' => now()->addDays(90),
                'is_active' => true,
                'description' => 'Khusus pelanggan baru! Diskon 20% untuk pembelian pertama Anda',
                'applies_to' => 'all',
                'max_discount_amount' => 100000,
                'per_user_limit' => 1,
                'can_stack' => false,
            ],

            // 8. Bulk Purchase Discount
            [
                'name' => 'Beli Banyak Hemat Banyak - Diskon 15%',
                'code' => 'BULK15',
                'promotion_type' => 'bulk',
                'discount_percent' => 15,
                'minimum_purchase' => 0,
                'buy_quantity' => 5,
                'expires_at' => now()->addDays(30),
                'is_active' => true,
                'description' => 'Beli minimal 5 item dapat diskon 15% untuk seluruh belanja',
                'applies_to' => 'all',
                'can_stack' => false,
            ],

            // 9. Flash Sale Voucher
            [
                'name' => 'Flash Sale 50% - Limited Time!',
                'code' => 'FLASH50',
                'promotion_type' => 'voucher',
                'discount_percent' => 50,
                'minimum_purchase' => 200000,
                'expires_at' => now()->addHours(24),
                'is_active' => true,
                'description' => 'Flash Sale 24 jam! Diskon 50% dengan minimal belanja Rp 200.000',
                'applies_to' => 'all',
                'max_discount_amount' => 150000,
                'usage_limit' => 20,
                'per_user_limit' => 1,
                'can_stack' => false,
            ],

            // 10. Weekend Special
            [
                'name' => 'Weekend Special - Gratis Ongkir + Diskon 10%',
                'code' => 'WEEKEND10',
                'promotion_type' => 'voucher',
                'discount_percent' => 10,
                'minimum_purchase' => 100000,
                'expires_at' => now()->endOfWeek(),
                'is_active' => true,
                'description' => 'Promo akhir pekan! Diskon 10% + gratis ongkir',
                'applies_to' => 'all',
                'usage_limit' => 100,
                'can_stack' => true,
            ],
        ];

        foreach ($promotions as $promo) {
            Promotion::create($promo);
        }

        $this->command->info('✅ ' . count($promotions) . ' sample promotions created successfully!');
    }
}

