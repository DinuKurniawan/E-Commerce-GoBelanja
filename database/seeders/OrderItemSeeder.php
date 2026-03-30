<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Database\Seeder;

class OrderItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $orders = Order::query()->orderBy('id')->get();
        $products = Product::query()->orderBy('id')->limit(3)->get();

        if ($orders->isEmpty() || $products->isEmpty()) {
            return;
        }

        foreach ($orders as $order) {
            $pickedProducts = $products->take(min(2, $products->count()));
            $total = 0;

            foreach ($pickedProducts as $index => $product) {
                $quantity = $index + 1;
                $subtotal = $product->price * $quantity;
                $total += $subtotal;

                OrderItem::query()->updateOrCreate(
                    [
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                    ],
                    [
                        'quantity' => $quantity,
                        'unit_price' => $product->price,
                        'subtotal' => $subtotal,
                    ],
                );
            }

            $order->update(['total_amount' => $total]);
        }
    }
}
