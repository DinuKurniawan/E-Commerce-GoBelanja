<?php

namespace App\Console\Commands;

use App\Services\StockService;
use Illuminate\Console\Command;

class TestInventorySystem extends Command
{
    protected $signature = 'inventory:test';
    protected $description = 'Test the inventory management system';

    public function handle(StockService $stockService)
    {
        $this->info('Testing Inventory Management System...');
        $this->newLine();

        try {
            // Test 1: Get Statistics
            $this->info('Test 1: Getting Stock Statistics...');
            $stats = $stockService->getStockStatistics();
            
            $this->table(
                ['Metric', 'Value'],
                [
                    ['Total Products', $stats['total_products']],
                    ['In Stock', $stats['in_stock']],
                    ['Low Stock', $stats['low_stock']],
                    ['Out of Stock', $stats['out_of_stock']],
                    ['Total Items', number_format($stats['total_items_in_stock'])],
                    ['Total Value', 'Rp ' . number_format($stats['total_stock_value'])],
                ]
            );
            $this->newLine();

            // Test 2: Get Low Stock Products
            $this->info('Test 2: Getting Low Stock Products...');
            $lowStock = $stockService->getLowStockProducts();
            $this->info("Found {$lowStock->count()} low stock products");
            
            if ($lowStock->count() > 0) {
                $this->table(
                    ['ID', 'Name', 'Stock', 'Threshold'],
                    $lowStock->take(5)->map(fn($p) => [
                        $p->id,
                        $p->name,
                        $p->stock,
                        $p->low_stock_threshold
                    ])
                );
            }
            $this->newLine();

            // Test 3: Get Out of Stock Products
            $this->info('Test 3: Getting Out of Stock Products...');
            $outOfStock = $stockService->getOutOfStockProducts();
            $this->info("Found {$outOfStock->count()} out of stock products");
            
            if ($outOfStock->count() > 0) {
                $this->table(
                    ['ID', 'Name', 'Stock'],
                    $outOfStock->take(5)->map(fn($p) => [
                        $p->id,
                        $p->name,
                        $p->stock
                    ])
                );
            }

            $this->newLine();
            $this->info('✅ All tests completed successfully!');
            $this->info('Inventory Management System is working correctly.');
            
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('❌ Test failed: ' . $e->getMessage());
            $this->error($e->getTraceAsString());
            return Command::FAILURE;
        }
    }
}
