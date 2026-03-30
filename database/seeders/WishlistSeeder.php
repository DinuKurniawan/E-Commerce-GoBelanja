<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\User;
use App\Models\Wishlist;
use Illuminate\Database\Seeder;

class WishlistSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::query()->where('email', 'user@gobelanja.test')->first();
        $products = Product::query()->orderBy('id')->limit(3)->get();

        if (! $user || $products->isEmpty()) {
            return;
        }

        foreach ($products as $product) {
            Wishlist::query()->updateOrCreate(
                [
                    'user_id' => $user->id,
                    'product_id' => $product->id,
                ],
                [],
            );
        }
    }
}
