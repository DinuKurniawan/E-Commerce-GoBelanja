<?php

namespace App\Services;

use App\Models\User;
use App\Models\Order;
use App\Models\Product;
use App\Models\OrderItem;
use App\Models\Promotion;
use App\Models\CartItem;
use App\Models\EmailCampaign;
use App\Models\EmailCampaignTracking;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class AnalyticsService
{
    /**
     * Calculate Customer Lifetime Value for a specific user
     */
    public function calculateCLV($userId): array
    {
        $user = User::with(['orders' => function($query) {
            $query->where('status', 'completed');
        }])->find($userId);

        if (!$user) {
            return ['clv' => 0, 'total_orders' => 0, 'average_order_value' => 0];
        }

        $totalRevenue = $user->orders->sum('total_amount');
        $totalOrders = $user->orders->count();
        $averageOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

        // Calculate purchase frequency (orders per month since first order)
        $firstOrder = $user->orders->min('created_at');
        $monthsSinceFirstOrder = $firstOrder ? Carbon::parse($firstOrder)->diffInMonths(now()) + 1 : 1;
        $purchaseFrequency = $totalOrders / $monthsSinceFirstOrder;

        // Simple CLV: Total Revenue (for existing customers)
        // Predictive CLV could be: Average Order Value * Purchase Frequency * Average Customer Lifespan
        $clv = $totalRevenue;

        return [
            'clv' => $clv,
            'total_revenue' => $totalRevenue,
            'total_orders' => $totalOrders,
            'average_order_value' => $averageOrderValue,
            'purchase_frequency' => $purchaseFrequency,
            'months_active' => $monthsSinceFirstOrder,
        ];
    }

    /**
     * Get customer segments (high, medium, low value)
     */
    public function getCustomerSegments(): array
    {
        $customers = User::where('role', 'user')
            ->withCount(['orders as completed_orders_count' => function($query) {
                $query->where('status', 'completed');
            }])
            ->withSum(['orders as total_spent' => function($query) {
                $query->where('status', 'completed');
            }], 'total_amount')
            ->having('completed_orders_count', '>', 0)
            ->get();

        $totalSpent = $customers->pluck('total_spent')->filter();
        
        if ($totalSpent->isEmpty()) {
            return [
                'high_value' => 0,
                'medium_value' => 0,
                'low_value' => 0,
                'total' => 0,
            ];
        }

        $percentile75 = $totalSpent->percentile(75);
        $percentile25 = $totalSpent->percentile(25);

        $segments = [
            'high_value' => $customers->filter(fn($c) => $c->total_spent >= $percentile75)->count(),
            'medium_value' => $customers->filter(fn($c) => $c->total_spent >= $percentile25 && $c->total_spent < $percentile75)->count(),
            'low_value' => $customers->filter(fn($c) => $c->total_spent < $percentile25)->count(),
            'total' => $customers->count(),
        ];

        return $segments;
    }

    /**
     * Get conversion rates for the sales funnel
     */
    public function getConversionRates($startDate, $endDate): array
    {
        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        // Get unique visitors (sessions with any activity)
        $visitors = DB::table('conversion_events')
            ->where('created_at', '>=', $start)
            ->where('created_at', '<=', $end)
            ->distinct('session_id')
            ->count('session_id');

        // Sessions that added to cart
        $addedToCart = DB::table('conversion_events')
            ->where('created_at', '>=', $start)
            ->where('created_at', '<=', $end)
            ->where('event_type', 'add_to_cart')
            ->distinct('session_id')
            ->count('session_id');

        // Sessions that started checkout
        $startedCheckout = DB::table('conversion_events')
            ->where('created_at', '>=', $start)
            ->where('created_at', '<=', $end)
            ->where('event_type', 'checkout_start')
            ->distinct('session_id')
            ->count('session_id');

        // Sessions that completed purchase
        $completedPurchase = DB::table('conversion_events')
            ->where('created_at', '>=', $start)
            ->where('created_at', '<=', $end)
            ->where('event_type', 'order_complete')
            ->distinct('session_id')
            ->count('session_id');

        // Calculate conversion rates
        $visitorToCartRate = $visitors > 0 ? ($addedToCart / $visitors) * 100 : 0;
        $cartToCheckoutRate = $addedToCart > 0 ? ($startedCheckout / $addedToCart) * 100 : 0;
        $checkoutToPurchaseRate = $startedCheckout > 0 ? ($completedPurchase / $startedCheckout) * 100 : 0;
        $overallConversionRate = $visitors > 0 ? ($completedPurchase / $visitors) * 100 : 0;

        return [
            'visitors' => $visitors,
            'added_to_cart' => $addedToCart,
            'started_checkout' => $startedCheckout,
            'completed_purchase' => $completedPurchase,
            'visitor_to_cart_rate' => round($visitorToCartRate, 2),
            'cart_to_checkout_rate' => round($cartToCheckoutRate, 2),
            'checkout_to_purchase_rate' => round($checkoutToPurchaseRate, 2),
            'overall_conversion_rate' => round($overallConversionRate, 2),
            'drop_off_cart' => $visitors > 0 ? round((($visitors - $addedToCart) / $visitors) * 100, 2) : 0,
            'drop_off_checkout' => $addedToCart > 0 ? round((($addedToCart - $startedCheckout) / $addedToCart) * 100, 2) : 0,
            'drop_off_purchase' => $startedCheckout > 0 ? round((($startedCheckout - $completedPurchase) / $startedCheckout) * 100, 2) : 0,
        ];
    }

    /**
     * Get abandoned carts
     */
    public function getAbandonedCarts($days = 7): array
    {
        $startDate = Carbon::now()->subDays($days);

        $abandonedCarts = DB::table('cart_abandonments')
            ->where('abandoned_at', '>=', $startDate)
            ->where('recovered_at', null)
            ->get();

        $recoveredCarts = DB::table('cart_abandonments')
            ->where('abandoned_at', '>=', $startDate)
            ->whereNotNull('recovered_at')
            ->get();

        $totalAbandoned = $abandonedCarts->count();
        $totalRecovered = $recoveredCarts->count();
        $totalValue = $abandonedCarts->sum('cart_value');
        $recoveredValue = $recoveredCarts->sum('cart_value');
        $lostValue = $totalValue - $recoveredValue;

        $recoveryRate = ($totalAbandoned + $totalRecovered) > 0 
            ? ($totalRecovered / ($totalAbandoned + $totalRecovered)) * 100 
            : 0;

        return [
            'total_abandoned' => $totalAbandoned,
            'total_recovered' => $totalRecovered,
            'total_value' => $totalValue,
            'recovered_value' => $recoveredValue,
            'lost_value' => $lostValue,
            'recovery_rate' => round($recoveryRate, 2),
            'abandoned_carts' => $abandonedCarts,
        ];
    }

    /**
     * Get product performance analytics
     */
    public function getProductPerformance($startDate, $endDate): array
    {
        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        // Best selling products by revenue
        $bestByRevenue = OrderItem::query()
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('orders.status', 'completed')
            ->where('orders.created_at', '>=', $start)
            ->where('orders.created_at', '<=', $end)
            ->select(
                'products.id',
                'products.name',
                'products.price',
                'products.stock',
                DB::raw('SUM(order_items.quantity) as total_sold'),
                DB::raw('SUM(order_items.price * order_items.quantity) as total_revenue')
            )
            ->groupBy('products.id', 'products.name', 'products.price', 'products.stock')
            ->orderByDesc('total_revenue')
            ->limit(10)
            ->get();

        // Worst selling products (by quantity)
        $worstSellers = OrderItem::query()
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('orders.status', 'completed')
            ->where('orders.created_at', '>=', $start)
            ->where('orders.created_at', '<=', $end)
            ->select(
                'products.id',
                'products.name',
                'products.price',
                'products.stock',
                DB::raw('SUM(order_items.quantity) as total_sold'),
                DB::raw('SUM(order_items.price * order_items.quantity) as total_revenue')
            )
            ->groupBy('products.id', 'products.name', 'products.price', 'products.stock')
            ->orderBy('total_sold', 'asc')
            ->limit(10)
            ->get();

        // Product views vs purchases (conversion rate)
        $productConversions = DB::table('product_views')
            ->leftJoin('order_items', 'product_views.product_id', '=', 'order_items.product_id')
            ->leftJoin('orders', function($join) use ($start, $end) {
                $join->on('order_items.order_id', '=', 'orders.id')
                     ->where('orders.status', '=', 'completed')
                     ->where('orders.created_at', '>=', $start)
                     ->where('orders.created_at', '<=', $end);
            })
            ->join('products', 'product_views.product_id', '=', 'products.id')
            ->where('product_views.created_at', '>=', $start)
            ->where('product_views.created_at', '<=', $end)
            ->select(
                'products.id',
                'products.name',
                DB::raw('COUNT(DISTINCT product_views.id) as view_count'),
                DB::raw('COUNT(DISTINCT orders.id) as purchase_count')
            )
            ->groupBy('products.id', 'products.name')
            ->havingRaw('COUNT(DISTINCT product_views.id) > 0')
            ->get()
            ->map(function($item) {
                $item->conversion_rate = $item->view_count > 0 
                    ? round(($item->purchase_count / $item->view_count) * 100, 2) 
                    : 0;
                return $item;
            });

        return [
            'best_sellers' => $bestByRevenue,
            'worst_sellers' => $worstSellers,
            'product_conversions' => $productConversions,
        ];
    }

    /**
     * Get revenue by category
     */
    public function getRevenueByCategory($startDate, $endDate): array
    {
        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        return OrderItem::query()
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->where('orders.status', 'completed')
            ->where('orders.created_at', '>=', $start)
            ->where('orders.created_at', '<=', $end)
            ->select(
                'categories.id',
                'categories.name',
                DB::raw('SUM(order_items.price * order_items.quantity) as total_revenue'),
                DB::raw('SUM(order_items.quantity) as total_items_sold')
            )
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('total_revenue')
            ->get()
            ->toArray();
    }

    /**
     * Get revenue by period (day, week, month, year)
     */
    public function getRevenueByPeriod($period, $startDate, $endDate): array
    {
        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        $dateFormat = match($period) {
            'day' => '%Y-%m-%d',
            'week' => '%Y-%u',
            'month' => '%Y-%m',
            'year' => '%Y',
            default => '%Y-%m-%d',
        };

        $results = Order::query()
            ->where('status', 'completed')
            ->where('created_at', '>=', $start)
            ->where('created_at', '<=', $end)
            ->select(
                DB::raw("DATE_FORMAT(created_at, '$dateFormat') as period"),
                DB::raw('SUM(total_amount) as revenue'),
                DB::raw('COUNT(*) as order_count')
            )
            ->groupBy('period')
            ->orderBy('period')
            ->get()
            ->toArray();

        return $results;
    }

    /**
     * Get top customers by total spent
     */
    public function getTopCustomers($limit = 10): array
    {
        return User::where('role', 'user')
            ->withCount(['orders as completed_orders_count' => function($query) {
                $query->where('status', 'completed');
            }])
            ->withSum(['orders as total_spent' => function($query) {
                $query->where('status', 'completed');
            }], 'total_amount')
            ->with('loyaltyTier')
            ->having('completed_orders_count', '>', 0)
            ->orderByDesc('total_spent')
            ->limit($limit)
            ->get()
            ->map(function($user) {
                $clv = $this->calculateCLV($user->id);
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'total_orders' => $user->completed_orders_count,
                    'total_spent' => $user->total_spent ?? 0,
                    'average_order_value' => $clv['average_order_value'],
                    'loyalty_tier' => $user->loyaltyTier?->tier_name ?? 'Bronze',
                    'clv' => $clv['clv'],
                ];
            })
            ->toArray();
    }

    /**
     * Get customer retention rate
     */
    public function getCustomerRetentionRate(): array
    {
        // Customers who made their first purchase 3+ months ago
        $threeMonthsAgo = Carbon::now()->subMonths(3);
        
        $firstTimeCustomers = User::where('role', 'user')
            ->whereHas('orders', function($query) use ($threeMonthsAgo) {
                $query->where('status', 'completed')
                      ->where('created_at', '<=', $threeMonthsAgo);
            })
            ->get();

        // Customers who made repeat purchases
        $repeatCustomers = $firstTimeCustomers->filter(function($user) use ($threeMonthsAgo) {
            return $user->orders()
                ->where('status', 'completed')
                ->where('created_at', '>', $threeMonthsAgo)
                ->count() > 0;
        });

        $retentionRate = $firstTimeCustomers->count() > 0 
            ? ($repeatCustomers->count() / $firstTimeCustomers->count()) * 100 
            : 0;

        return [
            'first_time_customers' => $firstTimeCustomers->count(),
            'repeat_customers' => $repeatCustomers->count(),
            'retention_rate' => round($retentionRate, 2),
        ];
    }

    /**
     * Get marketing performance metrics
     */
    public function getMarketingPerformance($startDate, $endDate): array
    {
        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        // Promotion code usage
        $promotionUsage = DB::table('orders')
            ->join('promotions', function($join) {
                $join->on(DB::raw("JSON_UNQUOTE(JSON_EXTRACT(orders.notes, '$.promotion_code'))"), '=', 'promotions.code');
            })
            ->where('orders.status', 'completed')
            ->where('orders.created_at', '>=', $start)
            ->where('orders.created_at', '<=', $end)
            ->select(
                'promotions.code',
                'promotions.discount_type',
                'promotions.discount_value',
                DB::raw('COUNT(orders.id) as usage_count'),
                DB::raw('SUM(orders.total_amount) as total_revenue')
            )
            ->groupBy('promotions.id', 'promotions.code', 'promotions.discount_type', 'promotions.discount_value')
            ->get()
            ->map(function($promo) {
                // Estimate discount given
                $discountGiven = 0;
                if ($promo->discount_type === 'percentage') {
                    $discountGiven = ($promo->total_revenue * $promo->discount_value) / (100 - $promo->discount_value);
                }
                
                $promo->discount_given = round($discountGiven, 2);
                $promo->roi = $discountGiven > 0 ? round(($promo->total_revenue / $discountGiven) * 100, 2) : 0;
                return $promo;
            });

        // Email campaign performance
        $emailCampaigns = EmailCampaign::query()
            ->where('created_at', '>=', $start)
            ->where('created_at', '<=', $end)
            ->withCount([
                'tracking as sent_count',
                'tracking as opened_count' => function($query) {
                    $query->whereNotNull('opened_at');
                },
                'tracking as clicked_count' => function($query) {
                    $query->whereNotNull('clicked_at');
                },
            ])
            ->get()
            ->map(function($campaign) {
                $campaign->open_rate = $campaign->sent_count > 0 
                    ? round(($campaign->opened_count / $campaign->sent_count) * 100, 2) 
                    : 0;
                $campaign->click_rate = $campaign->sent_count > 0 
                    ? round(($campaign->clicked_count / $campaign->sent_count) * 100, 2) 
                    : 0;
                return $campaign;
            });

        // Referral program stats
        $referralStats = User::where('role', 'user')
            ->whereNotNull('referred_by')
            ->where('created_at', '>=', $start)
            ->where('created_at', '<=', $end)
            ->count();

        $referralRevenue = User::where('role', 'user')
            ->whereNotNull('referred_by')
            ->where('created_at', '>=', $start)
            ->where('created_at', '<=', $end)
            ->withSum(['orders as referred_revenue' => function($query) {
                $query->where('status', 'completed');
            }], 'total_amount')
            ->get()
            ->sum('referred_revenue');

        return [
            'promotion_usage' => $promotionUsage,
            'email_campaigns' => $emailCampaigns,
            'referral_stats' => [
                'total_referrals' => $referralStats,
                'referral_revenue' => $referralRevenue ?? 0,
            ],
        ];
    }

    /**
     * Get new vs returning customers
     */
    public function getNewVsReturningCustomers($startDate, $endDate): array
    {
        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        $ordersInPeriod = Order::query()
            ->where('status', 'completed')
            ->where('created_at', '>=', $start)
            ->where('created_at', '<=', $end)
            ->with('user')
            ->get();

        $newCustomers = 0;
        $returningCustomers = 0;

        foreach ($ordersInPeriod as $order) {
            $firstOrder = Order::where('user_id', $order->user_id)
                ->where('status', 'completed')
                ->orderBy('created_at')
                ->first();

            if ($firstOrder && $firstOrder->id === $order->id) {
                $newCustomers++;
            } else {
                $returningCustomers++;
            }
        }

        return [
            'new_customers' => $newCustomers,
            'returning_customers' => $returningCustomers,
            'total' => $newCustomers + $returningCustomers,
            'new_percentage' => ($newCustomers + $returningCustomers) > 0 
                ? round(($newCustomers / ($newCustomers + $returningCustomers)) * 100, 2) 
                : 0,
            'returning_percentage' => ($newCustomers + $returningCustomers) > 0 
                ? round(($returningCustomers / ($newCustomers + $returningCustomers)) * 100, 2) 
                : 0,
        ];
    }
}
