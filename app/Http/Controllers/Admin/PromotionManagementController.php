<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PromotionManagementController extends Controller
{
    public function index(): Response
    {
        $promotions = Promotion::with(['category', 'usages'])
            ->withCount('usages')
            ->latest()
            ->get()
            ->map(function ($promotion) {
                return [
                    'id' => $promotion->id,
                    'name' => $promotion->name,
                    'code' => $promotion->code,
                    'promotion_type' => $promotion->promotion_type,
                    'discount_percent' => $promotion->discount_percent,
                    'minimum_purchase' => $promotion->minimum_purchase,
                    'expires_at' => $promotion->expires_at?->format('Y-m-d H:i:s'),
                    'is_active' => $promotion->is_active,
                    'usage_count' => $promotion->usage_count,
                    'usage_limit' => $promotion->usage_limit,
                    'per_user_limit' => $promotion->per_user_limit,
                    'can_stack' => $promotion->can_stack,
                    'description' => $promotion->description,
                    'category_name' => $promotion->category?->name,
                    'is_expired' => $promotion->isExpired(),
                    'is_valid' => $promotion->isValid(),
                    'created_at' => $promotion->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('Admin/Promotions', [
            'promotions' => $promotions,
            'categories' => Category::select('id', 'name')->get(),
            'products' => Product::select('id', 'name', 'price')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:promotions,code',
            'promotion_type' => 'required|in:voucher,discount_product,bogo,bundle,free_shipping,category,tiered,first_purchase,bulk',
            'discount_percent' => 'nullable|integer|min:1|max:100',
            'minimum_purchase' => 'nullable|integer|min:0',
            'expires_at' => 'required|date',
            'is_active' => 'boolean',
            'description' => 'nullable|string',
            
            // BOGO fields
            'buy_quantity' => 'nullable|integer|min:1',
            'get_quantity' => 'nullable|integer|min:1',
            'get_discount_percent' => 'nullable|integer|min:1|max:100',
            
            // Bundle fields
            'bundle_products' => 'nullable|array',
            'bundle_products.*' => 'exists:products,id',
            'bundle_price' => 'nullable|integer|min:0',
            
            // Category fields
            'category_id' => 'nullable|exists:categories,id',
            
            // Tiered fields
            'tier_levels' => 'nullable|array',
            'tier_levels.*.amount' => 'required|integer|min:0',
            'tier_levels.*.discount_percent' => 'required|integer|min:1|max:100',
            
            // Free shipping fields
            'shipping_free_above' => 'nullable|integer|min:0',
            'shipping_courier' => 'nullable|string',
            'shipping_regions' => 'nullable|array',
            
            // Applies to
            'applies_to' => 'nullable|in:all,category,product,bundle',
            'applicable_product_ids' => 'nullable|array',
            'applicable_product_ids.*' => 'exists:products,id',
            
            // Usage limits
            'usage_limit' => 'nullable|integer|min:1',
            'per_user_limit' => 'nullable|integer|min:1',
            'max_discount_amount' => 'nullable|integer|min:0',
            'can_stack' => 'boolean',
        ]);

        // Type-specific validation
        $this->validatePromotionType($request->promotion_type, $validated);

        Promotion::create($validated);

        return back()->with('success', 'Promosi berhasil ditambahkan.');
    }

    public function update(Request $request, Promotion $promotion)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:promotions,code,' . $promotion->id,
            'promotion_type' => 'required|in:voucher,discount_product,bogo,bundle,free_shipping,category,tiered,first_purchase,bulk',
            'discount_percent' => 'nullable|integer|min:1|max:100',
            'minimum_purchase' => 'nullable|integer|min:0',
            'expires_at' => 'required|date',
            'is_active' => 'boolean',
            'description' => 'nullable|string',
            
            'buy_quantity' => 'nullable|integer|min:1',
            'get_quantity' => 'nullable|integer|min:1',
            'get_discount_percent' => 'nullable|integer|min:1|max:100',
            'bundle_products' => 'nullable|array',
            'bundle_products.*' => 'exists:products,id',
            'bundle_price' => 'nullable|integer|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'tier_levels' => 'nullable|array',
            'tier_levels.*.amount' => 'required|integer|min:0',
            'tier_levels.*.discount_percent' => 'required|integer|min:1|max:100',
            'shipping_free_above' => 'nullable|integer|min:0',
            'shipping_courier' => 'nullable|string',
            'shipping_regions' => 'nullable|array',
            'applies_to' => 'nullable|in:all,category,product,bundle',
            'applicable_product_ids' => 'nullable|array',
            'applicable_product_ids.*' => 'exists:products,id',
            'usage_limit' => 'nullable|integer|min:1',
            'per_user_limit' => 'nullable|integer|min:1',
            'max_discount_amount' => 'nullable|integer|min:0',
            'can_stack' => 'boolean',
        ]);

        $promotion->update($validated);

        return back()->with('success', 'Promosi berhasil diperbarui.');
    }

    public function destroy(Promotion $promotion)
    {
        $promotion->delete();

        return back()->with('success', 'Promosi berhasil dihapus.');
    }

    public function toggle(Promotion $promotion)
    {
        $promotion->update(['is_active' => !$promotion->is_active]);

        return back()->with('success', 'Status promosi berhasil diubah.');
    }

    protected function validatePromotionType(string $type, array $validated): void
    {
        $errors = [];

        switch ($type) {
            case 'bogo':
                if (empty($validated['buy_quantity'])) {
                    $errors['buy_quantity'] = 'Buy quantity is required for BOGO promotions.';
                }
                if (empty($validated['get_quantity'])) {
                    $errors['get_quantity'] = 'Get quantity is required for BOGO promotions.';
                }
                break;

            case 'bundle':
                if (empty($validated['bundle_products']) || count($validated['bundle_products']) < 2) {
                    $errors['bundle_products'] = 'At least 2 products are required for bundle promotions.';
                }
                if (empty($validated['bundle_price'])) {
                    $errors['bundle_price'] = 'Bundle price is required.';
                }
                break;

            case 'category':
                if (empty($validated['category_id'])) {
                    $errors['category_id'] = 'Category is required for category promotions.';
                }
                if (empty($validated['discount_percent'])) {
                    $errors['discount_percent'] = 'Discount percent is required.';
                }
                break;

            case 'tiered':
                if (empty($validated['tier_levels']) || count($validated['tier_levels']) < 2) {
                    $errors['tier_levels'] = 'At least 2 tiers are required for tiered promotions.';
                }
                break;

            case 'free_shipping':
                if (empty($validated['shipping_free_above'])) {
                    $errors['shipping_free_above'] = 'Minimum amount is required for free shipping promotions.';
                }
                break;

            case 'bulk':
                if (empty($validated['buy_quantity'])) {
                    $errors['buy_quantity'] = 'Minimum quantity is required for bulk promotions.';
                }
                if (empty($validated['discount_percent'])) {
                    $errors['discount_percent'] = 'Discount percent is required.';
                }
                break;

            case 'voucher':
            case 'discount_product':
            case 'first_purchase':
                if (empty($validated['discount_percent'])) {
                    $errors['discount_percent'] = 'Discount percent is required.';
                }
                break;
        }

        if (!empty($errors)) {
            throw \Illuminate\Validation\ValidationException::withMessages($errors);
        }
    }
}

