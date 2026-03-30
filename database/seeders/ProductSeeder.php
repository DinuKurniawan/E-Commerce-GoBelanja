<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            ['name' => 'Headphone Noise Cancelling', 'slug' => 'headphone-noise-cancelling', 'category' => 'elektronik', 'price' => 899000, 'stock' => 20, 'rating' => 4.9, 'is_new' => true, 'is_featured' => true, 'is_popular' => true, 'emoji' => '🎧', 'image_url' => null],
            ['name' => 'Sneakers Urban Classic', 'slug' => 'sneakers-urban-classic', 'category' => 'sepatu', 'price' => 599000, 'stock' => 35, 'rating' => 4.8, 'is_new' => false, 'is_featured' => false, 'is_popular' => true, 'emoji' => '👟', 'image_url' => null],
            ['name' => 'Smartwatch Pro X', 'slug' => 'smartwatch-pro-x', 'category' => 'elektronik', 'price' => 1299000, 'stock' => 16, 'rating' => 4.7, 'is_new' => true, 'is_featured' => true, 'is_popular' => true, 'emoji' => '⌚', 'image_url' => null],
            ['name' => 'Tas Minimalist Premium', 'slug' => 'tas-minimalist-premium', 'category' => 'aksesoris', 'price' => 349000, 'stock' => 44, 'rating' => 4.6, 'is_new' => false, 'is_featured' => false, 'is_popular' => true, 'emoji' => '👜', 'image_url' => null],
            ['name' => 'Jaket Streetwear', 'slug' => 'jaket-streetwear', 'category' => 'fashion', 'price' => 449000, 'stock' => 30, 'rating' => 4.8, 'is_new' => true, 'is_featured' => true, 'is_popular' => false, 'emoji' => '🧥', 'image_url' => null],
            ['name' => 'Kacamata Anti UV', 'slug' => 'kacamata-anti-uv', 'category' => 'aksesoris', 'price' => 179000, 'stock' => 50, 'rating' => 4.5, 'is_new' => false, 'is_featured' => false, 'is_popular' => false, 'emoji' => '🕶️', 'image_url' => null],
        ];

        foreach ($products as $product) {
            $category = Category::query()->where('slug', $product['category'])->firstOrFail();

            Product::query()->updateOrCreate(
                ['slug' => $product['slug']],
                [
                    'category_id' => $category->id,
                    'name' => $product['name'],
                    'price' => $product['price'],
                    'stock' => $product['stock'],
                    'rating' => $product['rating'],
                    'is_new' => $product['is_new'],
                    'is_featured' => $product['is_featured'],
                    'is_popular' => $product['is_popular'],
                    'emoji' => $product['emoji'],
                    'image_url' => $product['image_url'],
                ],
            );
        }
    }
}
