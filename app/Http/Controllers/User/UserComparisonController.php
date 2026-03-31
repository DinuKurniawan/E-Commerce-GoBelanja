<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductComparison;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserComparisonController extends Controller
{
    private const MAX_COMPARISON_ITEMS = 4;

    /**
     * Display the user's comparison list.
     */
    public function index(): Response
    {
        $comparisons = ProductComparison::with([
            'product.category',
            'product.images' => function ($query) {
                $query->orderBy('sort_order', 'asc');
            },
            'product.sizes',
            'product.reviews',
            'product.flashSales' => function ($query) {
                $query->where('start_time', '<=', now())
                    ->where('end_time', '>=', now())
                    ->where('is_active', true);
            }
        ])
            ->where('user_id', auth()->id())
            ->latest()
            ->get()
            ->map(function ($comparison) {
                $product = $comparison->product;
                $flashSale = $product->flashSales->first();

                return [
                    'id' => $comparison->id,
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'emoji' => $product->emoji,
                    'image_url' => $product->image_url,
                    'price' => $product->price,
                    'stock' => $product->stock,
                    'weight' => $product->weight,
                    'rating' => $product->rating,
                    'description' => $product->description ?? 'No description available',
                    'category' => $product->category ? [
                        'id' => $product->category->id,
                        'name' => $product->category->name,
                    ] : null,
                    'images' => $product->images->map(fn($img) => [
                        'id' => $img->id,
                        'image_url' => $img->image_url,
                        'is_primary' => $img->is_primary,
                    ]),
                    'sizes' => $product->sizes->map(fn($size) => [
                        'name' => $size->size_name,
                        'stock' => $size->stock,
                    ]),
                    'reviews_count' => $product->reviews->count(),
                    'flash_sale' => $flashSale ? [
                        'discount_percent' => $flashSale->discount_percent,
                        'discounted_price' => $product->price * (1 - $flashSale->discount_percent / 100),
                        'end_time' => $flashSale->end_time,
                    ] : null,
                    'is_new' => $product->is_new,
                    'is_featured' => $product->is_featured,
                    'allow_pre_order' => $product->allow_pre_order,
                    'added_at' => $comparison->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('User/Comparisons', [
            'comparisons' => $comparisons,
            'maxItems' => self::MAX_COMPARISON_ITEMS,
        ]);
    }

    /**
     * Add a product to comparison list.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $userId = auth()->id();
        $productId = $request->product_id;

        // Check if already exists
        $exists = ProductComparison::where('user_id', $userId)
            ->where('product_id', $productId)
            ->exists();

        if ($exists) {
            return back()->with('error', 'Product already in comparison list');
        }

        // Check max limit
        $count = ProductComparison::where('user_id', $userId)->count();
        if ($count >= self::MAX_COMPARISON_ITEMS) {
            return back()->with('error', 'Maximum ' . self::MAX_COMPARISON_ITEMS . ' products allowed in comparison');
        }

        // Optional: Check if products are from same category
        $existingComparisons = ProductComparison::where('user_id', $userId)->with('product')->get();
        if ($existingComparisons->isNotEmpty()) {
            $product = Product::find($productId);
            $firstCategoryId = $existingComparisons->first()->product->category_id;

            if ($product->category_id !== $firstCategoryId) {
                return back()->with('warning', 'Product added. Note: Products from different categories may have different features to compare.');
            }
        }

        ProductComparison::create([
            'user_id' => $userId,
            'product_id' => $productId,
        ]);

        return back()->with('success', 'Product added to comparison');
    }

    /**
     * Remove a product from comparison list.
     */
    public function destroy(Product $product): RedirectResponse
    {
        $deleted = ProductComparison::where('user_id', auth()->id())
            ->where('product_id', $product->id)
            ->delete();

        if ($deleted) {
            return back()->with('success', 'Product removed from comparison');
        }

        return back()->with('error', 'Product not found in comparison list');
    }

    /**
     * Clear all products from comparison list.
     */
    public function clear(): RedirectResponse
    {
        ProductComparison::where('user_id', auth()->id())->delete();

        return back()->with('success', 'Comparison list cleared');
    }

    /**
     * Get comparison count (for API/AJAX requests).
     */
    public function count(): array
    {
        $count = ProductComparison::where('user_id', auth()->id())->count();

        return [
            'count' => $count,
            'max' => self::MAX_COMPARISON_ITEMS,
            'canAddMore' => $count < self::MAX_COMPARISON_ITEMS,
        ];
    }

    /**
     * Check if a product is in comparison list.
     */
    public function check(Product $product): array
    {
        $exists = ProductComparison::where('user_id', auth()->id())
            ->where('product_id', $product->id)
            ->exists();

        return [
            'in_comparison' => $exists,
        ];
    }
}
