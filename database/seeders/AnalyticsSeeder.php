<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PageView;
use App\Models\ProductView;
use App\Models\ConversionEvent;
use App\Models\CartAbandonment;
use App\Models\Product;
use App\Models\User;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Support\Str;

class AnalyticsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = Product::limit(20)->get();
        $users = User::where('role', 'user')->limit(50)->get();
        $orders = Order::limit(100)->get();

        // Generate page views for the last 30 days
        for ($i = 0; $i < 500; $i++) {
            PageView::create([
                'user_id' => $users->random()->id ?? null,
                'session_id' => Str::random(32),
                'page_type' => ['product', 'category', 'home', 'cart', 'checkout'][array_rand(['product', 'category', 'home', 'cart', 'checkout'])],
                'page_id' => $products->random()->id ?? null,
                'url' => '/products/' . ($products->random()->id ?? 1),
                'referrer' => ['google.com', 'facebook.com', 'direct', null][array_rand(['google.com', 'facebook.com', 'direct', null])],
                'user_agent' => 'Mozilla/5.0',
                'ip_address' => '127.0.0.1',
                'created_at' => Carbon::now()->subDays(rand(0, 30)),
            ]);
        }

        // Generate product views
        foreach ($products as $product) {
            for ($i = 0; $i < rand(10, 100); $i++) {
                ProductView::create([
                    'product_id' => $product->id,
                    'user_id' => $users->random()->id ?? null,
                    'session_id' => Str::random(32),
                    'created_at' => Carbon::now()->subDays(rand(0, 30)),
                ]);
            }
        }

        // Generate conversion events (funnel tracking)
        $sessionIds = [];
        for ($i = 0; $i < 200; $i++) {
            $sessionId = Str::random(32);
            $sessionIds[] = $sessionId;
            $user = $users->random();
            $product = $products->random();
            $createdAt = Carbon::now()->subDays(rand(0, 30));

            // View product
            ConversionEvent::create([
                'user_id' => $user->id,
                'session_id' => $sessionId,
                'event_type' => 'view_product',
                'product_id' => $product->id,
                'created_at' => $createdAt,
            ]);

            // 60% add to cart
            if (rand(1, 100) <= 60) {
                ConversionEvent::create([
                    'user_id' => $user->id,
                    'session_id' => $sessionId,
                    'event_type' => 'add_to_cart',
                    'product_id' => $product->id,
                    'created_at' => $createdAt->copy()->addMinutes(rand(1, 10)),
                ]);

                // 40% start checkout
                if (rand(1, 100) <= 40) {
                    ConversionEvent::create([
                        'user_id' => $user->id,
                        'session_id' => $sessionId,
                        'event_type' => 'checkout_start',
                        'created_at' => $createdAt->copy()->addMinutes(rand(10, 20)),
                    ]);

                    // 70% complete purchase
                    if (rand(1, 100) <= 70) {
                        $order = $orders->random();
                        ConversionEvent::create([
                            'user_id' => $user->id,
                            'session_id' => $sessionId,
                            'event_type' => 'order_complete',
                            'order_id' => $order->id,
                            'created_at' => $createdAt->copy()->addMinutes(rand(20, 30)),
                        ]);
                    }
                }
            }
        }

        // Generate abandoned carts
        for ($i = 0; $i < 50; $i++) {
            $abandonedAt = Carbon::now()->subDays(rand(0, 30));
            $recovered = rand(1, 100) <= 20; // 20% recovery rate

            $cartItems = [
                ['product_id' => $products->random()->id, 'quantity' => rand(1, 3), 'price' => rand(50000, 500000)],
                ['product_id' => $products->random()->id, 'quantity' => rand(1, 3), 'price' => rand(50000, 500000)],
            ];

            $cartValue = array_sum(array_map(fn($item) => $item['price'] * $item['quantity'], $cartItems));

            CartAbandonment::create([
                'user_id' => $users->random()->id ?? null,
                'session_id' => Str::random(32),
                'cart_value' => $cartValue,
                'items_count' => count($cartItems),
                'cart_items' => $cartItems,
                'abandoned_at' => $abandonedAt,
                'recovered_at' => $recovered ? $abandonedAt->copy()->addDays(rand(1, 3)) : null,
                'recovered_order_id' => $recovered ? $orders->random()->id : null,
                'abandonment_stage' => ['cart', 'checkout', 'payment'][array_rand(['cart', 'checkout', 'payment'])],
                'recovery_method' => $recovered ? ['email', 'notification'][array_rand(['email', 'notification'])] : null,
            ]);
        }

        $this->command->info('Analytics data seeded successfully!');
    }
}
