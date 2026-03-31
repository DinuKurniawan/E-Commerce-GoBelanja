<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Order;
use App\Models\User;
use App\Models\Category;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use League\Csv\Reader;
use League\Csv\Writer;

class ImportExportService
{
    public function exportProductsToCSV($filters = [])
    {
        $query = Product::with('category');

        // Apply filters
        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (isset($filters['is_available'])) {
            $query->where('is_available', $filters['is_available']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        $products = $query->get();

        // Create CSV
        $csv = Writer::createFromString('');
        
        // Add header
        $csv->insertOne([
            'ID',
            'Name',
            'Slug',
            'Category',
            'Price',
            'Stock',
            'Weight',
            'Is New',
            'Is Featured',
            'Is Popular',
            'Is Available',
            'Low Stock Threshold',
            'Allow Pre Order',
            'Pre Order Deposit %',
            'Pre Order Date',
            'Created At'
        ]);

        // Add data rows
        foreach ($products as $product) {
            $csv->insertOne([
                $product->id,
                $product->name,
                $product->slug,
                $product->category ? $product->category->name : '',
                $product->price,
                $product->stock,
                $product->weight,
                $product->is_new ? 'Yes' : 'No',
                $product->is_featured ? 'Yes' : 'No',
                $product->is_popular ? 'Yes' : 'No',
                $product->is_available ? 'Yes' : 'No',
                $product->low_stock_threshold,
                $product->allow_pre_order ? 'Yes' : 'No',
                $product->pre_order_deposit_percent,
                $product->pre_order_availability_date?->format('Y-m-d'),
                $product->created_at->format('Y-m-d H:i:s')
            ]);
        }

        return $csv->toString();
    }

    public function importProductsFromCSV($file)
    {
        $csv = Reader::createFromPath($file->getRealPath(), 'r');
        $csv->setHeaderOffset(0);
        
        $records = $csv->getRecords();
        
        $results = [
            'success' => 0,
            'errors' => [],
            'created' => 0,
            'updated' => 0
        ];

        DB::beginTransaction();
        
        try {
            foreach ($records as $offset => $record) {
                $rowNumber = $offset + 2; // +2 because offset starts at 0 and we have header
                
                // Validate record
                $validation = $this->validateImportData($record, $rowNumber);
                
                if (!$validation['valid']) {
                    $results['errors'][] = $validation['error'];
                    continue;
                }

                // Process import
                try {
                    $result = $this->processProductImport($record);
                    if ($result['created']) {
                        $results['created']++;
                    } else {
                        $results['updated']++;
                    }
                    $results['success']++;
                } catch (\Exception $e) {
                    $results['errors'][] = "Row {$rowNumber}: " . $e->getMessage();
                }
            }

            DB::commit();
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }

        return $results;
    }

    public function validateImportData($data, $rowNumber)
    {
        $requiredFields = ['name', 'price', 'stock'];
        
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || trim($data[$field]) === '') {
                return [
                    'valid' => false,
                    'error' => "Row {$rowNumber}: Missing required field '{$field}'"
                ];
            }
        }

        // Validate price
        if (!is_numeric($data['price']) || $data['price'] < 0) {
            return [
                'valid' => false,
                'error' => "Row {$rowNumber}: Price must be a positive number"
            ];
        }

        // Validate stock
        if (!is_numeric($data['stock']) || $data['stock'] < 0) {
            return [
                'valid' => false,
                'error' => "Row {$rowNumber}: Stock must be a positive number"
            ];
        }

        return ['valid' => true];
    }

    public function processProductImport($data)
    {
        // Generate slug if not provided
        $slug = !empty($data['slug']) ? $data['slug'] : Str::slug($data['name']);
        
        // Find or create category
        $categoryId = null;
        if (!empty($data['category'])) {
            $category = Category::firstOrCreate(
                ['name' => $data['category']],
                ['slug' => Str::slug($data['category'])]
            );
            $categoryId = $category->id;
        } elseif (!empty($data['category_id'])) {
            $categoryId = $data['category_id'];
        }

        // Check if product exists by slug
        $product = Product::where('slug', $slug)->first();
        
        $productData = [
            'name' => $data['name'],
            'slug' => $slug,
            'price' => $data['price'],
            'stock' => $data['stock'],
            'category_id' => $categoryId,
            'weight' => $data['weight'] ?? 0,
            'is_new' => $this->parseBooleanField($data['is_new'] ?? false),
            'is_featured' => $this->parseBooleanField($data['is_featured'] ?? false),
            'is_popular' => $this->parseBooleanField($data['is_popular'] ?? false),
            'is_available' => $this->parseBooleanField($data['is_available'] ?? true),
            'low_stock_threshold' => $data['low_stock_threshold'] ?? 10,
            'allow_pre_order' => $this->parseBooleanField($data['allow_pre_order'] ?? false),
        ];

        if (!empty($data['pre_order_deposit_percent'])) {
            $productData['pre_order_deposit_percent'] = $data['pre_order_deposit_percent'];
        }

        if (!empty($data['pre_order_date'])) {
            $productData['pre_order_availability_date'] = $data['pre_order_date'];
        }

        $created = false;
        
        if ($product) {
            $product->update($productData);
        } else {
            $product = Product::create($productData);
            $created = true;
        }

        return ['product' => $product, 'created' => $created];
    }

    private function parseBooleanField($value)
    {
        if (is_bool($value)) {
            return $value;
        }

        $value = strtolower(trim($value));
        return in_array($value, ['1', 'yes', 'true', 'y']);
    }

    public function exportOrdersToCSV($filters = [])
    {
        $query = Order::with(['user', 'items.product', 'payment']);

        // Apply filters
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['payment_status'])) {
            $query->where('payment_status', $filters['payment_status']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        $orders = $query->orderBy('created_at', 'desc')->get();

        // Create CSV
        $csv = Writer::createFromString('');
        
        // Add header
        $csv->insertOne([
            'Order Number',
            'Customer Name',
            'Customer Email',
            'Order Date',
            'Status',
            'Payment Status',
            'Total Amount',
            'Shipping Courier',
            'Tracking Number',
            'Items Count',
            'Products',
        ]);

        // Add data rows
        foreach ($orders as $order) {
            $products = $order->items->map(function($item) {
                return $item->product->name . ' x' . $item->quantity;
            })->join(', ');

            $csv->insertOne([
                $order->order_number,
                $order->user->name,
                $order->user->email,
                $order->created_at->format('Y-m-d H:i:s'),
                $order->status,
                $order->payment_status,
                $order->total_amount,
                $order->shipping_courier,
                $order->tracking_number,
                $order->items->count(),
                $products
            ]);
        }

        return $csv->toString();
    }

    public function exportCustomersToCSV()
    {
        $users = User::where('role', 'user')
            ->withCount('orders')
            ->with('loyaltyTier')
            ->get();

        // Create CSV
        $csv = Writer::createFromString('');
        
        // Add header
        $csv->insertOne([
            'ID',
            'Name',
            'Email',
            'Loyalty Tier',
            'Total Orders',
            'Total Spent',
            'Is Active',
            'Registered At'
        ]);

        // Add data rows
        foreach ($users as $user) {
            $totalSpent = $user->orders()
                ->where('payment_status', 'paid')
                ->sum('total_amount');

            $csv->insertOne([
                $user->id,
                $user->name,
                $user->email,
                $user->loyaltyTier?->tier_name ?? 'None',
                $user->orders_count,
                $totalSpent,
                $user->is_active ? 'Yes' : 'No',
                $user->created_at->format('Y-m-d H:i:s')
            ]);
        }

        return $csv->toString();
    }

    public function getImportTemplate()
    {
        $csv = Writer::createFromString('');
        
        // Add header
        $csv->insertOne([
            'name',
            'slug',
            'price',
            'stock',
            'category',
            'weight',
            'is_new',
            'is_featured',
            'is_popular',
            'is_available',
            'low_stock_threshold',
            'allow_pre_order',
            'pre_order_deposit_percent',
            'pre_order_date'
        ]);

        // Add sample row
        $csv->insertOne([
            'Sample Product',
            'sample-product',
            '100000',
            '50',
            'Electronics',
            '500',
            'yes',
            'no',
            'no',
            'yes',
            '10',
            'no',
            '50',
            ''
        ]);

        return $csv->toString();
    }
}
