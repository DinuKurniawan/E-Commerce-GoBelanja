<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::query()->where('email', 'user@gobelanja.test')->first();
        $product = Product::query()->first();

        if (! $user || ! $product) {
            return;
        }

        $reviews = [
            [
                'user_id' => $user->id,
                'product_id' => $product->id,
                'rating' => 5,
                'comment' => 'Produk sangat bagus dan pengiriman cepat.',
                'admin_reply' => 'Terima kasih atas ulasannya.',
            ],
            [
                'user_id' => $user->id,
                'product_id' => $product->id,
                'rating' => 1,
                'comment' => 'Spam promo tidak relevan.',
                'admin_reply' => null,
            ],
        ];

        foreach ($reviews as $review) {
            Review::query()->updateOrCreate(
                [
                    'user_id' => $review['user_id'],
                    'product_id' => $review['product_id'],
                    'comment' => $review['comment'],
                ],
                [
                    ...$review,
                    'is_spam' => str_contains(strtolower($review['comment']), 'spam'),
                ],
            );
        }
    }
}
