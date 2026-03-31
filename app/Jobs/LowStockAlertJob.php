<?php

namespace App\Jobs;

use App\Models\Product;
use App\Models\User;
use App\Notifications\LowStockNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class LowStockAlertJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected Product $product;

    /**
     * Create a new job instance.
     */
    public function __construct(Product $product)
    {
        $this->product = $product;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Only alert if stock is low
        if ($this->product->stock > $this->product->low_stock_threshold) {
            return;
        }

        // Get all admin users
        $admins = User::where('role', 'admin')->get();

        if ($admins->isEmpty()) {
            Log::warning('No admin users found to send low stock alert', [
                'product_id' => $this->product->id,
                'product_name' => $this->product->name,
                'stock' => $this->product->stock,
            ]);
            return;
        }

        // Send notification to all admins
        Notification::send($admins, new LowStockNotification($this->product));

        Log::info('Low stock alert sent', [
            'product_id' => $this->product->id,
            'product_name' => $this->product->name,
            'stock' => $this->product->stock,
            'threshold' => $this->product->low_stock_threshold,
            'admin_count' => $admins->count(),
        ]);
    }
}
