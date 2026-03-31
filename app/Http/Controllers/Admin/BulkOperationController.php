<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Order;
use App\Models\User;
use App\Models\Category;
use App\Services\ImportExportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class BulkOperationController extends Controller
{
    protected $importExportService;

    public function __construct(ImportExportService $importExportService)
    {
        $this->importExportService = $importExportService;
    }

    public function index()
    {
        $categories = Category::select('id', 'name')->get();
        
        return Inertia::render('Admin/BulkOperations', [
            'categories' => $categories,
            'orderStatuses' => ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            'paymentStatuses' => ['pending', 'paid', 'failed']
        ]);
    }

    public function exportProducts(Request $request)
    {
        $filters = $request->only(['category_id', 'is_available', 'date_from', 'date_to']);
        
        $csv = $this->importExportService->exportProductsToCSV($filters);
        
        $filename = 'products_export_' . now()->format('Y-m-d_His') . '.csv';
        
        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    public function importProducts(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:10240', // 10MB max
        ]);

        try {
            $results = $this->importExportService->importProductsFromCSV($request->file('file'));
            
            $message = "Successfully imported {$results['success']} products";
            if ($results['created'] > 0) {
                $message .= " ({$results['created']} created";
            }
            if ($results['updated'] > 0) {
                $message .= ($results['created'] > 0 ? ', ' : ' (') . "{$results['updated']} updated";
            }
            if ($results['success'] > 0) {
                $message .= ")";
            }
            
            if (count($results['errors']) > 0) {
                $message .= ". " . count($results['errors']) . " errors occurred.";
            }
            
            return back()->with([
                'success' => $message,
                'importResults' => $results
            ]);
            
        } catch (\Exception $e) {
            return back()->with('error', 'Import failed: ' . $e->getMessage());
        }
    }

    public function downloadTemplate()
    {
        $csv = $this->importExportService->getImportTemplate();
        
        $filename = 'product_import_template.csv';
        
        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    public function bulkUpdatePrices(Request $request)
    {
        $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'exists:products,id',
            'update_type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric',
        ]);

        DB::beginTransaction();
        
        try {
            $products = Product::whereIn('id', $request->product_ids)->get();
            $updated = 0;
            
            foreach ($products as $product) {
                $newPrice = $product->price;
                
                if ($request->update_type === 'percentage') {
                    // Apply percentage change
                    $newPrice = $product->price * (1 + ($request->value / 100));
                } else {
                    // Apply fixed amount change
                    $newPrice = $product->price + $request->value;
                }
                
                // Ensure price doesn't go below 0
                $newPrice = max(0, $newPrice);
                
                $product->update(['price' => round($newPrice)]);
                $updated++;
            }
            
            DB::commit();
            
            return back()->with('success', "Successfully updated prices for {$updated} products.");
            
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Bulk price update failed: ' . $e->getMessage());
        }
    }

    public function bulkUpdateStock(Request $request)
    {
        $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'exists:products,id',
            'update_type' => 'required|in:add,subtract,set',
            'value' => 'required|integer|min:0',
        ]);

        DB::beginTransaction();
        
        try {
            $products = Product::whereIn('id', $request->product_ids)->get();
            $updated = 0;
            
            foreach ($products as $product) {
                $newStock = $product->stock;
                
                if ($request->update_type === 'add') {
                    $newStock = $product->stock + $request->value;
                } elseif ($request->update_type === 'subtract') {
                    $newStock = max(0, $product->stock - $request->value);
                } else {
                    $newStock = $request->value;
                }
                
                $product->update(['stock' => $newStock]);
                $updated++;
            }
            
            DB::commit();
            
            return back()->with('success', "Successfully updated stock for {$updated} products.");
            
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Bulk stock update failed: ' . $e->getMessage());
        }
    }

    public function bulkDelete(Request $request)
    {
        $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'exists:products,id',
        ]);

        DB::beginTransaction();
        
        try {
            $count = Product::whereIn('id', $request->product_ids)->delete();
            
            DB::commit();
            
            return back()->with('success', "Successfully deleted {$count} products.");
            
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Bulk delete failed: ' . $e->getMessage());
        }
    }

    public function bulkToggleStatus(Request $request)
    {
        $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'exists:products,id',
            'status' => 'required|boolean',
        ]);

        DB::beginTransaction();
        
        try {
            $updated = Product::whereIn('id', $request->product_ids)
                ->update(['is_available' => $request->status]);
            
            DB::commit();
            
            $action = $request->status ? 'enabled' : 'disabled';
            return back()->with('success', "Successfully {$action} {$updated} products.");
            
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Bulk status update failed: ' . $e->getMessage());
        }
    }

    public function bulkAssignCategory(Request $request)
    {
        $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'exists:products,id',
            'category_id' => 'required|exists:categories,id',
        ]);

        DB::beginTransaction();
        
        try {
            $updated = Product::whereIn('id', $request->product_ids)
                ->update(['category_id' => $request->category_id]);
            
            DB::commit();
            
            return back()->with('success', "Successfully assigned category to {$updated} products.");
            
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Bulk category assignment failed: ' . $e->getMessage());
        }
    }

    public function exportOrders(Request $request)
    {
        $filters = $request->only(['status', 'payment_status', 'date_from', 'date_to']);
        
        $csv = $this->importExportService->exportOrdersToCSV($filters);
        
        $filename = 'orders_export_' . now()->format('Y-m-d_His') . '.csv';
        
        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    public function exportCustomers(Request $request)
    {
        $csv = $this->importExportService->exportCustomersToCSV();
        
        $filename = 'customers_export_' . now()->format('Y-m-d_His') . '.csv';
        
        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }
}
