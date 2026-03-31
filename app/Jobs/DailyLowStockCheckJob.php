<?php

namespace App\Jobs;

use App\Models\Product;
use App\Models\User;
use App\Notifications\DailyLowStockReport;
use App\Services\StockService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class DailyLowStockCheckJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job.
     */
    public function handle(StockService $stockService): void
    {
        $lowStockProducts = $stockService->getLowStockProducts();
        $outOfStockProducts = $stockService->getOutOfStockProducts();

        // Only send report if there are products to report
        if ($lowStockProducts->isEmpty() && $outOfStockProducts->isEmpty()) {
            Log::info('Daily low stock check: No low or out of stock products');
            return;
        }

        // Get all admin users
        $admins = User::where('role', 'admin')->get();

        if ($admins->isEmpty()) {
            Log::warning('No admin users found for daily low stock report');
            return;
        }

        // Send daily report to admins
        Notification::send($admins, new DailyLowStockReport(
            $lowStockProducts,
            $outOfStockProducts
        ));

        Log::info('Daily low stock report sent', [
            'low_stock_count' => $lowStockProducts->count(),
            'out_of_stock_count' => $outOfStockProducts->count(),
            'admin_count' => $admins->count(),
        ]);
    }
}
