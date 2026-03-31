<?php

namespace App\Services;

use App\Models\Product;
use App\Models\StockHistory;
use App\Jobs\LowStockAlertJob;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StockService
{
    /**
     * Track stock change and create history record
     */
    public function trackStockChange(
        Product $product,
        int $quantity,
        string $type,
        ?string $reason = null,
        ?int $orderId = null,
        ?int $userId = null
    ): StockHistory {
        $quantityBefore = $product->stock;
        $quantityAfter = $quantityBefore + $quantity;

        // Create stock history record
        $history = StockHistory::create([
            'product_id' => $product->id,
            'quantity_change' => $quantity,
            'quantity_before' => $quantityBefore,
            'quantity_after' => $quantityAfter,
            'type' => $type,
            'reason' => $reason,
            'order_id' => $orderId,
            'user_id' => $userId ?? auth()->id(),
        ]);

        // Update product stock
        $product->update(['stock' => $quantityAfter]);

        // Check low stock and trigger alerts
        $this->checkLowStock($product);

        // Auto-disable/enable based on stock
        $this->autoToggleAvailability($product);

        Log::info("Stock change tracked", [
            'product_id' => $product->id,
            'product_name' => $product->name,
            'quantity_change' => $quantity,
            'type' => $type,
            'quantity_after' => $quantityAfter,
        ]);

        return $history;
    }

    /**
     * Check if product has low stock and dispatch alert
     */
    public function checkLowStock(Product $product): bool
    {
        if ($product->stock <= $product->low_stock_threshold && $product->stock > 0) {
            LowStockAlertJob::dispatch($product);
            return true;
        }

        return false;
    }

    /**
     * Auto-disable product when out of stock, re-enable when restocked
     */
    public function autoToggleAvailability(Product $product): void
    {
        // Don't modify products with pre-order enabled
        if ($product->allow_pre_order) {
            return;
        }

        $shouldBeAvailable = $product->stock > 0;
        
        // Only update if status needs to change
        if ($product->is_available !== $shouldBeAvailable) {
            $product->update(['is_available' => $shouldBeAvailable]);
            
            $status = $shouldBeAvailable ? 'enabled' : 'disabled';
            Log::info("Product auto-{$status}", [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'stock' => $product->stock,
            ]);
        }
    }

    /**
     * Restock product
     */
    public function restock(Product $product, int $quantity, ?string $reason = null): StockHistory
    {
        if ($quantity <= 0) {
            throw new \InvalidArgumentException('Restock quantity must be positive');
        }

        $product->update(['last_restocked_at' => now()]);

        return $this->trackStockChange(
            $product,
            $quantity,
            'restock',
            $reason ?? 'Manual restock by admin',
            null,
            auth()->id()
        );
    }

    /**
     * Adjust stock (can be positive or negative)
     */
    public function adjustStock(Product $product, int $quantity, string $reason): StockHistory
    {
        if ($quantity === 0) {
            throw new \InvalidArgumentException('Adjustment quantity cannot be zero');
        }

        if (empty($reason)) {
            throw new \InvalidArgumentException('Reason is required for stock adjustments');
        }

        // Prevent negative stock
        if (($product->stock + $quantity) < 0) {
            throw new \InvalidArgumentException('Adjustment would result in negative stock');
        }

        return $this->trackStockChange(
            $product,
            $quantity,
            'adjustment',
            $reason,
            null,
            auth()->id()
        );
    }

    /**
     * Decrement stock for sale
     */
    public function decrementForSale(Product $product, int $quantity, int $orderId): StockHistory
    {
        if ($quantity <= 0) {
            throw new \InvalidArgumentException('Sale quantity must be positive');
        }

        if ($product->stock < $quantity) {
            throw new \InvalidArgumentException("Insufficient stock for product: {$product->name}");
        }

        return $this->trackStockChange(
            $product,
            -$quantity,
            'sale',
            "Order #" . str_pad($orderId, 6, '0', STR_PAD_LEFT),
            $orderId,
            auth()->id()
        );
    }

    /**
     * Increment stock for return/cancellation
     */
    public function incrementForReturn(Product $product, int $quantity, int $orderId, string $reason = 'Order cancelled'): StockHistory
    {
        if ($quantity <= 0) {
            throw new \InvalidArgumentException('Return quantity must be positive');
        }

        return $this->trackStockChange(
            $product,
            $quantity,
            'return',
            $reason . " - Order #" . str_pad($orderId, 6, '0', STR_PAD_LEFT),
            $orderId,
            auth()->id()
        );
    }

    /**
     * Mark items as damaged
     */
    public function markDamaged(Product $product, int $quantity, string $reason): StockHistory
    {
        if ($quantity <= 0) {
            throw new \InvalidArgumentException('Damaged quantity must be positive');
        }

        if ($product->stock < $quantity) {
            throw new \InvalidArgumentException('Not enough stock to mark as damaged');
        }

        return $this->trackStockChange(
            $product,
            -$quantity,
            'damaged',
            $reason,
            null,
            auth()->id()
        );
    }

    /**
     * Get products with low stock
     */
    public function getLowStockProducts()
    {
        return Product::whereColumn('stock', '<=', 'low_stock_threshold')
            ->where('stock', '>', 0)
            ->with('category')
            ->orderBy('stock', 'asc')
            ->get();
    }

    /**
     * Get out of stock products
     */
    public function getOutOfStockProducts()
    {
        return Product::where('stock', 0)
            ->where('allow_pre_order', false)
            ->with('category')
            ->orderBy('updated_at', 'desc')
            ->get();
    }

    /**
     * Get stock statistics
     */
    public function getStockStatistics(): array
    {
        return [
            'total_products' => Product::count(),
            'in_stock' => Product::where('stock', '>', 0)->count(),
            'low_stock' => Product::whereColumn('stock', '<=', 'low_stock_threshold')
                ->where('stock', '>', 0)
                ->count(),
            'out_of_stock' => Product::where('stock', 0)->count(),
            'total_stock_value' => Product::sum(DB::raw('stock * price')),
            'total_items_in_stock' => Product::sum('stock'),
        ];
    }
}
