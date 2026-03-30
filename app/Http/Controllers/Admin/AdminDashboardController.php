<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(): Response
    {
        $driver = DB::connection()->getDriverName();

        // Daily revenue & orders for the last 30 days
        $from = Carbon::now()->subDays(29)->startOfDay();
        $to   = Carbon::now()->endOfDay();

        $dateExpr  = $driver === 'sqlite'
            ? "strftime('%Y-%m-%d', created_at)"
            : "DATE(created_at)";

        $monthExpr = $driver === 'sqlite'
            ? "strftime('%Y-%m', created_at)"
            : "DATE_FORMAT(created_at, '%Y-%m')";

        // Last 30 days – daily
        $rawDaily = Order::query()
            ->selectRaw("{$dateExpr} as day, SUM(total_amount) as total, COUNT(*) as orders")
            ->whereBetween('created_at', [$from, $to])
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->keyBy('day');

        // Fill gaps so every day appears in the chart
        $daily = [];
        for ($i = 29; $i >= 0; $i--) {
            $date        = Carbon::now()->subDays($i)->format('Y-m-d');
            $daily[]     = [
                'day'    => $date,
                'label'  => Carbon::parse($date)->format('d M'),
                'total'  => (int) ($rawDaily[$date]->total ?? 0),
                'orders' => (int) ($rawDaily[$date]->orders ?? 0),
            ];
        }

        // Monthly – last 12 months
        $salesByMonth = Order::query()
            ->selectRaw("{$monthExpr} as period, SUM(total_amount) as total, COUNT(*) as orders")
            ->where('created_at', '>=', Carbon::now()->subMonths(11)->startOfMonth())
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        // Top 5 products by revenue
        $topProducts = OrderItem::query()
            ->selectRaw('product_id, SUM(subtotal) as revenue, SUM(quantity) as qty')
            ->groupBy('product_id')
            ->orderByDesc('revenue')
            ->limit(5)
            ->with('product:id,name,emoji')
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'overview' => [
                'totalSales'   => (int) Order::query()->sum('total_amount'),
                'totalOrders'  => (int) Order::query()->count(),
                'totalUsers'   => (int) User::query()->count(),
                'productsSold' => (int) OrderItem::query()->sum('quantity'),
                'totalProducts'=> (int) Product::query()->count(),
                'pendingOrders'=> (int) Order::query()->where('status', 'pending')->count(),
            ],
            'dailyChart'  => $daily,
            'salesChart'  => $salesByMonth,
            'topProducts' => $topProducts,
        ]);
    }
}
