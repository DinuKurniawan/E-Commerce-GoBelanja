<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Contracts\View\View;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    protected $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    public function index(): Response
    {
        $salesReport = [
            'totalRevenue' => (int) Order::query()->sum('total_amount'),
            'totalOrders' => (int) Order::query()->count(),
            'bestProducts' => OrderItem::query()
                ->selectRaw('product_id, SUM(quantity) as sold_count')
                ->with('product:id,name,rating')
                ->groupBy('product_id')
                ->orderByDesc('sold_count')
                ->limit(5)
                ->get()
                ->map(fn ($item) => [
                    'id' => $item->product_id,
                    'name' => $item->product?->name ?? '-',
                    'rating' => $item->product?->rating ?? 0,
                    'sold_count' => (int) $item->sold_count,
                ]),
        ];

        return Inertia::render('Admin/Reports', [
            'report' => $salesReport,
        ]);
    }

    /**
     * Customer Lifetime Value Report
     */
    public function customerLifetimeValue(Request $request): \Illuminate\Http\JsonResponse
    {
        $cacheKey = 'report_clv_' . ($request->get('start_date') ?? 'all') . '_' . ($request->get('end_date') ?? 'all');
        
        $data = Cache::remember($cacheKey, 3600, function () use ($request) {
            $topCustomers = $this->analyticsService->getTopCustomers(50);
            $segments = $this->analyticsService->getCustomerSegments();
            
            // Calculate average CLV
            $avgCLV = count($topCustomers) > 0 
                ? collect($topCustomers)->avg('clv') 
                : 0;

            return [
                'top_customers' => $topCustomers,
                'customer_segments' => $segments,
                'average_clv' => round($avgCLV, 2),
                'total_customers' => $segments['total'],
            ];
        });

        return response()->json($data);
    }

    /**
     * Product Performance Analytics
     */
    public function productPerformance(Request $request): \Illuminate\Http\JsonResponse
    {
        $startDate = $request->get('start_date', Carbon::now()->subDays(30));
        $endDate = $request->get('end_date', Carbon::now());

        $cacheKey = "report_product_performance_{$startDate}_{$endDate}";
        
        $data = Cache::remember($cacheKey, 3600, function () use ($startDate, $endDate) {
            return $this->analyticsService->getProductPerformance($startDate, $endDate);
        });

        return response()->json($data);
    }

    /**
     * Conversion Funnel Report
     */
    public function conversionFunnel(Request $request): \Illuminate\Http\JsonResponse
    {
        $startDate = $request->get('start_date', Carbon::now()->subDays(30));
        $endDate = $request->get('end_date', Carbon::now());

        $cacheKey = "report_conversion_{$startDate}_{$endDate}";
        
        $data = Cache::remember($cacheKey, 3600, function () use ($startDate, $endDate) {
            return $this->analyticsService->getConversionRates($startDate, $endDate);
        });

        return response()->json($data);
    }

    /**
     * Abandoned Carts Report
     */
    public function abandonedCarts(Request $request): \Illuminate\Http\JsonResponse
    {
        $days = $request->get('days', 7);

        $cacheKey = "report_abandoned_carts_{$days}";
        
        $data = Cache::remember($cacheKey, 1800, function () use ($days) {
            return $this->analyticsService->getAbandonedCarts($days);
        });

        return response()->json($data);
    }

    /**
     * Revenue Analysis Report
     */
    public function revenueAnalysis(Request $request): \Illuminate\Http\JsonResponse
    {
        $startDate = $request->get('start_date', Carbon::now()->subDays(30));
        $endDate = $request->get('end_date', Carbon::now());
        $period = $request->get('period', 'day');

        $cacheKey = "report_revenue_{$period}_{$startDate}_{$endDate}";
        
        $data = Cache::remember($cacheKey, 3600, function () use ($startDate, $endDate, $period) {
            $byCategory = $this->analyticsService->getRevenueByCategory($startDate, $endDate);
            $byPeriod = $this->analyticsService->getRevenueByPeriod($period, $startDate, $endDate);
            
            // Calculate growth rate vs previous period
            $currentRevenue = collect($byPeriod)->sum('revenue');
            $start = Carbon::parse($startDate);
            $end = Carbon::parse($endDate);
            $daysDiff = $start->diffInDays($end);
            
            $previousStart = $start->copy()->subDays($daysDiff);
            $previousEnd = $end->copy()->subDays($daysDiff);
            $previousRevenue = Order::query()
                ->where('status', 'completed')
                ->whereBetween('created_at', [$previousStart, $previousEnd])
                ->sum('total_amount');

            $growthRate = $previousRevenue > 0 
                ? (($currentRevenue - $previousRevenue) / $previousRevenue) * 100 
                : 0;

            return [
                'revenue_by_category' => $byCategory,
                'revenue_by_period' => $byPeriod,
                'total_revenue' => $currentRevenue,
                'growth_rate' => round($growthRate, 2),
                'previous_period_revenue' => $previousRevenue,
            ];
        });

        return response()->json($data);
    }

    /**
     * Customer Segmentation Report
     */
    public function customerSegmentation(Request $request): \Illuminate\Http\JsonResponse
    {
        $startDate = $request->get('start_date', Carbon::now()->subDays(30));
        $endDate = $request->get('end_date', Carbon::now());

        $cacheKey = "report_segmentation_{$startDate}_{$endDate}";
        
        $data = Cache::remember($cacheKey, 3600, function () use ($startDate, $endDate) {
            $segments = $this->analyticsService->getCustomerSegments();
            $newVsReturning = $this->analyticsService->getNewVsReturningCustomers($startDate, $endDate);
            $retentionRate = $this->analyticsService->getCustomerRetentionRate();

            return [
                'segments' => $segments,
                'new_vs_returning' => $newVsReturning,
                'retention' => $retentionRate,
            ];
        });

        return response()->json($data);
    }

    /**
     * Marketing Campaign Performance
     */
    public function marketingPerformance(Request $request): \Illuminate\Http\JsonResponse
    {
        $startDate = $request->get('start_date', Carbon::now()->subDays(30));
        $endDate = $request->get('end_date', Carbon::now());

        $cacheKey = "report_marketing_{$startDate}_{$endDate}";
        
        $data = Cache::remember($cacheKey, 3600, function () use ($startDate, $endDate) {
            return $this->analyticsService->getMarketingPerformance($startDate, $endDate);
        });

        return response()->json($data);
    }

    /**
     * Export any report type
     */
    public function exportReport(Request $request, string $type): StreamedResponse
    {
        $format = $request->get('format', 'csv');
        $startDate = $request->get('start_date', Carbon::now()->subDays(30));
        $endDate = $request->get('end_date', Carbon::now());

        // Get data based on report type
        $data = match($type) {
            'clv' => $this->analyticsService->getTopCustomers(100),
            'product-performance' => $this->analyticsService->getProductPerformance($startDate, $endDate),
            'conversion' => [$this->analyticsService->getConversionRates($startDate, $endDate)],
            'abandoned-carts' => [$this->analyticsService->getAbandonedCarts(30)],
            'revenue' => $this->analyticsService->getRevenueByCategory($startDate, $endDate),
            'segmentation' => [$this->analyticsService->getCustomerSegments()],
            'marketing' => [$this->analyticsService->getMarketingPerformance($startDate, $endDate)],
            default => [],
        };

        if ($format === 'csv') {
            return $this->exportToCsv($data, $type);
        } elseif ($format === 'excel') {
            return $this->exportToExcel($data, $type);
        }

        return $this->exportToCsv($data, $type);
    }

    private function exportToCsv($data, $type): StreamedResponse
    {
        $headers = [
            'Content-type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=report_{$type}_" . date('Y-m-d') . '.csv',
        ];

        $callback = function () use ($data, $type) {
            $file = fopen('php://output', 'w');

            // Write headers based on type
            if ($type === 'clv' && !empty($data)) {
                fputcsv($file, ['Name', 'Email', 'Total Orders', 'Total Spent', 'Avg Order Value', 'CLV', 'Tier']);
                foreach ($data as $row) {
                    fputcsv($file, [
                        $row['name'] ?? '',
                        $row['email'] ?? '',
                        $row['total_orders'] ?? 0,
                        $row['total_spent'] ?? 0,
                        $row['average_order_value'] ?? 0,
                        $row['clv'] ?? 0,
                        $row['loyalty_tier'] ?? 'Bronze',
                    ]);
                }
            } elseif ($type === 'product-performance' && isset($data['best_sellers'])) {
                fputcsv($file, ['Product', 'Price', 'Stock', 'Total Sold', 'Total Revenue']);
                foreach ($data['best_sellers'] as $row) {
                    fputcsv($file, [
                        $row->name ?? '',
                        $row->price ?? 0,
                        $row->stock ?? 0,
                        $row->total_sold ?? 0,
                        $row->total_revenue ?? 0,
                    ]);
                }
            } elseif ($type === 'revenue' && !empty($data)) {
                fputcsv($file, ['Category', 'Revenue', 'Items Sold']);
                foreach ($data as $row) {
                    fputcsv($file, [
                        $row['name'] ?? '',
                        $row['total_revenue'] ?? 0,
                        $row['total_items_sold'] ?? 0,
                    ]);
                }
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportToExcel($data, $type): StreamedResponse
    {
        $headers = [
            'Content-type' => 'application/vnd.ms-excel',
            'Content-Disposition' => "attachment; filename=report_{$type}_" . date('Y-m-d') . '.xls',
        ];

        $callback = function () use ($data, $type) {
            echo "<table border='1'>";
            
            if ($type === 'clv' && !empty($data)) {
                echo '<tr><th>Name</th><th>Email</th><th>Total Orders</th><th>Total Spent</th><th>Avg Order Value</th><th>CLV</th><th>Tier</th></tr>';
                foreach ($data as $row) {
                    echo '<tr>';
                    echo '<td>' . ($row['name'] ?? '') . '</td>';
                    echo '<td>' . ($row['email'] ?? '') . '</td>';
                    echo '<td>' . ($row['total_orders'] ?? 0) . '</td>';
                    echo '<td>' . ($row['total_spent'] ?? 0) . '</td>';
                    echo '<td>' . ($row['average_order_value'] ?? 0) . '</td>';
                    echo '<td>' . ($row['clv'] ?? 0) . '</td>';
                    echo '<td>' . ($row['loyalty_tier'] ?? 'Bronze') . '</td>';
                    echo '</tr>';
                }
            } elseif ($type === 'product-performance' && isset($data['best_sellers'])) {
                echo '<tr><th>Product</th><th>Price</th><th>Stock</th><th>Total Sold</th><th>Total Revenue</th></tr>';
                foreach ($data['best_sellers'] as $row) {
                    echo '<tr>';
                    echo '<td>' . ($row->name ?? '') . '</td>';
                    echo '<td>' . ($row->price ?? 0) . '</td>';
                    echo '<td>' . ($row->stock ?? 0) . '</td>';
                    echo '<td>' . ($row->total_sold ?? 0) . '</td>';
                    echo '<td>' . ($row->total_revenue ?? 0) . '</td>';
                    echo '</tr>';
                }
            } elseif ($type === 'revenue' && !empty($data)) {
                echo '<tr><th>Category</th><th>Revenue</th><th>Items Sold</th></tr>';
                foreach ($data as $row) {
                    echo '<tr>';
                    echo '<td>' . ($row['name'] ?? '') . '</td>';
                    echo '<td>' . ($row['total_revenue'] ?? 0) . '</td>';
                    echo '<td>' . ($row['total_items_sold'] ?? 0) . '</td>';
                    echo '</tr>';
                }
            }

            echo '</table>';
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportCsv(): StreamedResponse
    {
        $orders = Order::query()->with('user:id,name,email')->get();

        $headers = [
            'Content-type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename=laporan-penjualan.csv',
        ];

        $callback = function () use ($orders) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Order Number', 'User', 'Email', 'Status', 'Total']);

            foreach ($orders as $order) {
                fputcsv($file, [
                    $order->order_number,
                    $order->user?->name,
                    $order->user?->email,
                    $order->status,
                    $order->total_amount,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportExcel(): StreamedResponse
    {
        $orders = Order::query()->with('user:id,name,email')->get();

        $headers = [
            'Content-type' => 'application/vnd.ms-excel',
            'Content-Disposition' => 'attachment; filename=laporan-penjualan.xls',
        ];

        $callback = function () use ($orders) {
            echo "<table border='1'>";
            echo '<tr><th>Order Number</th><th>User</th><th>Email</th><th>Status</th><th>Total</th></tr>';
            foreach ($orders as $order) {
                echo '<tr>';
                echo '<td>'.$order->order_number.'</td>';
                echo '<td>'.($order->user?->name ?? '').'</td>';
                echo '<td>'.($order->user?->email ?? '').'</td>';
                echo '<td>'.$order->status.'</td>';
                echo '<td>'.$order->total_amount.'</td>';
                echo '</tr>';
            }
            echo '</table>';
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportPdfView(): View
    {
        $orders = Order::query()->with('user:id,name,email')->get();

        return view('reports.sales-pdf', [
            'orders' => $orders,
        ]);
    }
}
