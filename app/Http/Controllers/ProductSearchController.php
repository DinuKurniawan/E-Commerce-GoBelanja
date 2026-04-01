<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;

class ProductSearchController extends Controller
{
    public function search(Request $request)
    {
        $minRating = $request->filled('min_rating') ? (float) $request->min_rating : null;

        $query = Product::query()
            ->with(['category', 'images'])
            ->withAvg('reviews as reviews_avg_rating', 'rating')
            ->withCount('reviews');

        // Keyword search (name)
        if ($request->filled('q')) {
            $searchTerm = $request->q;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'LIKE', "%{$searchTerm}%");
            });
        }

        // Price range filter
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Category filter
        if ($request->filled('categories')) {
            $categories = is_array($request->categories) 
                ? $request->categories 
                : explode(',', $request->categories);
            $query->whereIn('category_id', $categories);
        }

        // Rating filter
        if ($minRating !== null) {
            $query->whereRaw(
                '(SELECT AVG(reviews.rating) FROM reviews WHERE reviews.product_id = products.id) >= ?',
                [$minRating]
            );
        }

        // Availability filter
        if ($request->filled('availability')) {
            switch ($request->availability) {
                case 'in_stock':
                    $query->where('stock', '>', 0)
                          ->where('allow_pre_order', false);
                    break;
                case 'pre_order':
                    $query->where('allow_pre_order', true);
                    break;
            }
        }

        // Flash sale filter
        if ($request->boolean('flash_sale')) {
            $query->whereHas('flashSales', function ($q) {
                $q->where('is_active', true)
                  ->where('starts_at', '<=', now())
                  ->where('ends_at', '>=', now())
                  ->where(function ($q) {
                      $q->whereNull('max_quantity')
                        ->orWhereRaw('sold_quantity < max_quantity');
                  });
            });
        }

        // Sort options
        $sortBy = $request->get('sort', 'newest');
        switch ($sortBy) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            case 'rating':
                $query->orderByDesc('reviews_avg_rating');
                break;
            case 'popular':
                $query->orderBy('views_count', 'desc');
                break;
            default:
                $query->orderBy('created_at', 'desc');
        }

        // Pagination
        $products = $query->paginate(12)->withQueryString();
        $products->getCollection()->transform(function ($product) {
            $product->rating = $product->reviews_avg_rating !== null
                ? round((float) $product->reviews_avg_rating, 1)
                : null;

            return $product;
        });

        // Get categories for filters
        $categories = Category::withCount('products')->get();

        // Get price range
        $priceRange = Product::selectRaw('MIN(price) as min, MAX(price) as max')->first();

        return inertia('User/ProductSearch', [
            'products' => $products,
            'categories' => $categories,
            'priceRange' => $priceRange,
            'filters' => [
                'q' => $request->q,
                'min_price' => $request->min_price,
                'max_price' => $request->max_price,
                'categories' => $request->categories,
                'min_rating' => $request->min_rating,
                'availability' => $request->availability,
                'flash_sale' => $request->boolean('flash_sale'),
                'sort' => $sortBy,
            ],
        ]);
    }

    public function autocomplete(Request $request)
    {
        $request->validate([
            'q' => 'required|string|min:1|max:100',
        ]);

        $searchTerm = $request->q;

        $products = Product::where('name', 'LIKE', "%{$searchTerm}%")
            ->select('id', 'name', 'slug', 'price', 'image_url')
            ->limit(10)
            ->get();

        // Get matching categories
        $categories = Category::where('name', 'LIKE', "%{$searchTerm}%")
            ->select('id', 'name', 'slug', 'icon')
            ->limit(5)
            ->get();

        return response()->json([
            'products' => $products,
            'categories' => $categories,
        ]);
    }
}
