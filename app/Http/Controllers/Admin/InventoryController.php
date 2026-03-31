<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockHistory;
use App\Services\StockService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    protected StockService $stockService;

    public function __construct(StockService $stockService)
    {
        $this->stockService = $stockService;
    }

    /**
     * Display inventory dashboard
     */
    public function index(Request $request): Response
    {
        $query = Product::query()->with('category');

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhereHas('category', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by stock status
        if ($request->filled('status')) {
            switch ($request->status) {
                case 'out_of_stock':
                    $query->where('stock', 0);
                    break;
                case 'low_stock':
                    $query->whereColumn('stock', '<=', 'low_stock_threshold')
                        ->where('stock', '>', 0);
                    break;
                case 'in_stock':
                    $query->whereColumn('stock', '>', 'low_stock_threshold');
                    break;
            }
        }

        // Sort
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $products = $query->paginate(20)->withQueryString();

        // Add stock status to each product
        $products->getCollection()->transform(function ($product) {
            $product->stock_status = $this->getStockStatus($product);
            return $product;
        });

        $statistics = $this->stockService->getStockStatistics();

        return Inertia::render('Admin/Inventory/Index', [
            'products' => $products,
            'statistics' => $statistics,
            'filters' => $request->only(['search', 'status', 'sort_by', 'sort_order']),
        ]);
    }

    /**
     * Display low stock products
     */
    public function lowStock(): Response
    {
        $lowStockProducts = $this->stockService->getLowStockProducts();
        $outOfStockProducts = $this->stockService->getOutOfStockProducts();

        $lowStockProducts->transform(function ($product) {
            $product->stock_status = 'low';
            return $product;
        });

        $outOfStockProducts->transform(function ($product) {
            $product->stock_status = 'out';
            return $product;
        });

        return Inertia::render('Admin/Inventory/LowStock', [
            'lowStockProducts' => $lowStockProducts,
            'outOfStockProducts' => $outOfStockProducts,
        ]);
    }

    /**
     * Display stock history for a product
     */
    public function stockHistory(Request $request, Product $product): Response
    {
        $query = $product->stockHistory()->with(['user', 'order']);

        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filter by date range
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $history = $query->paginate(50)->withQueryString();

        return Inertia::render('Admin/Inventory/StockHistory', [
            'product' => $product->load('category'),
            'history' => $history,
            'filters' => $request->only(['type', 'from_date', 'to_date']),
            'types' => ['sale', 'restock', 'adjustment', 'return', 'damaged'],
        ]);
    }

    /**
     * Restock product
     */
    public function restock(Request $request, Product $product)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1|max:100000',
            'reason' => 'nullable|string|max:500',
        ]);

        try {
            $this->stockService->restock(
                $product,
                $validated['quantity'],
                $validated['reason'] ?? null
            );

            return back()->with('success', "Successfully restocked {$validated['quantity']} units of {$product->name}");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Adjust product stock
     */
    public function adjust(Request $request, Product $product)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:-100000|max:100000|not_in:0',
            'reason' => 'required|string|max:500',
        ]);

        try {
            $this->stockService->adjustStock(
                $product,
                $validated['quantity'],
                $validated['reason']
            );

            $action = $validated['quantity'] > 0 ? 'increased' : 'decreased';
            $amount = abs($validated['quantity']);
            
            return back()->with('success', "Successfully {$action} stock by {$amount} units for {$product->name}");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Mark items as damaged
     */
    public function damaged(Request $request, Product $product)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1|max:' . $product->stock,
            'reason' => 'required|string|max:500',
        ]);

        try {
            $this->stockService->markDamaged(
                $product,
                $validated['quantity'],
                $validated['reason']
            );

            return back()->with('success', "Marked {$validated['quantity']} units as damaged for {$product->name}");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Export stock history to CSV
     */
    public function exportHistory(Request $request, Product $product)
    {
        $history = $product->stockHistory()
            ->with(['user', 'order'])
            ->orderBy('created_at', 'desc')
            ->get();

        $filename = "stock-history-{$product->slug}-" . now()->format('Y-m-d') . ".csv";

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($history) {
            $file = fopen('php://output', 'w');
            
            // Headers
            fputcsv($file, [
                'Date',
                'Type',
                'Quantity Change',
                'Quantity Before',
                'Quantity After',
                'Reason',
                'Order ID',
                'User',
            ]);

            // Data
            foreach ($history as $record) {
                fputcsv($file, [
                    $record->created_at->format('Y-m-d H:i:s'),
                    ucfirst($record->type),
                    $record->quantity_change,
                    $record->quantity_before,
                    $record->quantity_after,
                    $record->reason ?? '-',
                    $record->order_id ?? '-',
                    $record->user ? $record->user->name : '-',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Get stock status for a product
     */
    private function getStockStatus(Product $product): string
    {
        if ($product->stock === 0) {
            return 'out';
        } elseif ($product->stock <= $product->low_stock_threshold) {
            return 'low';
        } else {
            return 'good';
        }
    }
}
