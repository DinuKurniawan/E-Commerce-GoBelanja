<?php

namespace Database\Seeders;

use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class CartItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::query()->where('email', 'user@gobelanja.test')->first();
        $products = Product::query()->limit(2)->get();

        if (! $user || $products->isEmpty()) {
            return;
        }

        foreach ($products as $index => $product) {
            CartItem::query()->updateOrCreate(
                [
                    'user_id' => $user->id,
                    'product_id' => $product->id,
                ],
                [
                    'quantity' => $index + 1,
                ],
            );
        }
    }
}
