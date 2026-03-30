<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Contracts\View\View;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
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
