<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductRecommendation;
use App\Models\ProductView;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

class RecommendationService
{
    /**
     * Generate frequently bought together recommendations
     */
    public function generateFrequentlyBoughtTogether(int $productId): void
    {
        // Find orders containing this product
        $orders = OrderItem::where('product_id', $productId)
            ->whereHas('order', function ($query) {
                $query->where('status', 'completed');
            })
            ->pluck('order_id')
            ->unique();

        if ($orders->isEmpty()) {
            return;
        }

        // Find other products in those orders
        $products = OrderItem::whereIn('order_id', $orders)
            ->where('product_id', '!=', $productId)
            ->select('product_id', DB::raw('COUNT(*) as count'))
            ->groupBy('product_id')
            ->orderByDesc('count')
            ->limit(10)
            ->get();

        // Delete old recommendations
        ProductRecommendation::where('product_id', $productId)
            ->where('type', 'frequently_bought')
            ->delete();

        // Store new recommendations
        foreach ($products as $p) {
            ProductRecommendation::create([
                'product_id' => $productId,
                'recommended_product_id' => $p->product_id,
                'type' => 'frequently_bought',
                'score' => $p->count,
            ]);
        }
    }

    /**
     * Generate also viewed recommendations
     */
    public function generateAlsoViewed(int $productId): void
    {
        // Get users/sessions who viewed this product
        $viewers = ProductView::where('product_id', $productId)
            ->where('created_at', '>=', now()->subDays(90))
            ->select(DB::raw('COALESCE(user_id, session_id) as viewer_id'))
            ->pluck('viewer_id')
            ->unique();

        if ($viewers->isEmpty()) {
            return;
        }

        // Find other products they viewed
        $products = ProductView::where('product_id', '!=', $productId)
            ->where('created_at', '>=', now()->subDays(90))
            ->where(function ($query) use ($viewers) {
                $query->whereIn('user_id', $viewers->filter())
                    ->orWhereIn('session_id', $viewers->filter());
            })
            ->select('product_id', DB::raw('COUNT(*) as count'))
            ->groupBy('product_id')
            ->orderByDesc('count')
            ->limit(10)
            ->get();

        // Delete old recommendations
        ProductRecommendation::where('product_id', $productId)
            ->where('type', 'also_viewed')
            ->delete();

        // Store new recommendations
        foreach ($products as $p) {
            ProductRecommendation::create([
                'product_id' => $productId,
                'recommended_product_id' => $p->product_id,
                'type' => 'also_viewed',
                'score' => $p->count,
            ]);
        }
    }

    /**
     * Generate similar products recommendations
     */
    public function generateSimilarProducts(int $productId): void
    {
        $product = Product::find($productId);

        if (!$product) {
            return;
        }

        // Same category, similar price range
        $priceMin = $product->price * 0.7;
        $priceMax = $product->price * 1.3;

        $similar = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $productId)
            ->where('is_available', true)
            ->whereBetween('price', [$priceMin, $priceMax])
            ->orderByDesc('rating')
            ->orderByDesc('views_count')
            ->limit(10)
            ->get();

        // Delete old recommendations
        ProductRecommendation::where('product_id', $productId)
            ->where('type', 'similar')
            ->delete();

        // Store new recommendations with calculated score
        $maxScore = $similar->count();
        foreach ($similar as $index => $p) {
            $score = $maxScore - $index; // Higher score for better matches
            ProductRecommendation::create([
                'product_id' => $productId,
                'recommended_product_id' => $p->id,
                'type' => 'similar',
                'score' => $score,
            ]);
        }
    }

    /**
     * Generate personalized recommendations for a user
     */
    public function generatePersonalizedRecommendations(int $userId): Collection
    {
        $user = User::find($userId);

        if (!$user) {
            return collect();
        }

        // Get categories from user's purchase history
        $purchasedCategories = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('orders.user_id', $userId)
            ->where('orders.status', 'completed')
            ->pluck('products.category_id')
            ->unique();

        // Get categories from user's view history
        $viewedCategories = ProductView::where('user_id', $userId)
            ->join('products', 'product_views.product_id', '=', 'products.id')
            ->pluck('products.category_id')
            ->unique();

        // Merge categories
        $interestedCategories = $purchasedCategories->merge($viewedCategories)->unique();

        if ($interestedCategories->isEmpty()) {
            // Fall back to trending products
            return $this->getTrendingProducts(12);
        }

        // Get products user already purchased
        $purchasedProducts = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.user_id', $userId)
            ->pluck('order_items.product_id')
            ->unique();

        // Recommend popular products from those categories
        $recommendations = Product::whereIn('category_id', $interestedCategories)
            ->whereNotIn('id', $purchasedProducts)
            ->where('is_available', true)
            ->orderByDesc('rating')
            ->orderByDesc('views_count')
            ->limit(12)
            ->get();

        return $recommendations;
    }

    /**
     * Get trending products
     */
    public function getTrendingProducts(int $limit = 12, int $days = 7): Collection
    {
        return Product::where('is_available', true)
            ->where(function ($query) use ($days) {
                $query->where('created_at', '>=', now()->subDays($days))
                    ->orWhere('updated_at', '>=', now()->subDays($days));
            })
            ->orderByDesc('views_count')
            ->orderByDesc('rating')
            ->limit($limit)
            ->get();
    }

    /**
     * Calculate all recommendations for a product
     */
    public function calculateRecommendations(int $productId): void
    {
        $this->generateFrequentlyBoughtTogether($productId);
        $this->generateAlsoViewed($productId);
        $this->generateSimilarProducts($productId);

        // Clear cache for this product
        $this->clearProductCache($productId);
    }

    /**
     * Calculate recommendations for all products
     */
    public function calculateAllRecommendations(): void
    {
        $products = Product::where('is_available', true)->pluck('id');

        foreach ($products as $productId) {
            $this->calculateRecommendations($productId);
        }

        Cache::forget('recommendations_last_calculated');
        Cache::put('recommendations_last_calculated', now(), now()->addDays(30));
    }

    /**
     * Get frequently bought together products (cached)
     */
    public function getFrequentlyBoughtTogether(int $productId, int $limit = 6): Collection
    {
        return Cache::remember("recommendations.frequently_bought.{$productId}", 3600, function () use ($productId, $limit) {
            return Product::whereIn('id', function ($query) use ($productId, $limit) {
                $query->select('recommended_product_id')
                    ->from('product_recommendations')
                    ->where('product_id', $productId)
                    ->where('type', 'frequently_bought')
                    ->orderByDesc('score')
                    ->limit($limit);
            })
            ->where('is_available', true)
            ->with(['category', 'images'])
            ->get();
        });
    }

    /**
     * Get also viewed products (cached)
     */
    public function getAlsoViewed(int $productId, int $limit = 8): Collection
    {
        return Cache::remember("recommendations.also_viewed.{$productId}", 3600, function () use ($productId, $limit) {
            return Product::whereIn('id', function ($query) use ($productId, $limit) {
                $query->select('recommended_product_id')
                    ->from('product_recommendations')
                    ->where('product_id', $productId)
                    ->where('type', 'also_viewed')
                    ->orderByDesc('score')
                    ->limit($limit);
            })
            ->where('is_available', true)
            ->with(['category', 'images'])
            ->get();
        });
    }

    /**
     * Get similar products (cached)
     */
    public function getSimilarProducts(int $productId, int $limit = 8): Collection
    {
        return Cache::remember("recommendations.similar.{$productId}", 3600, function () use ($productId, $limit) {
            return Product::whereIn('id', function ($query) use ($productId, $limit) {
                $query->select('recommended_product_id')
                    ->from('product_recommendations')
                    ->where('product_id', $productId)
                    ->where('type', 'similar')
                    ->orderByDesc('score')
                    ->limit($limit);
            })
            ->where('is_available', true)
            ->with(['category', 'images'])
            ->get();
        });
    }

    /**
     * Get personalized recommendations (cached)
     */
    public function getPersonalizedRecommendationsForUser(int $userId, int $limit = 12): Collection
    {
        return Cache::remember("recommendations.personalized.{$userId}", 1800, function () use ($userId, $limit) {
            $recommendations = $this->generatePersonalizedRecommendations($userId);
            
            return $recommendations->take($limit);
        });
    }

    /**
     * Update recommendation score
     */
    public function updateRecommendationScore(int $productId, int $recommendedId, string $type, int $increment = 1): void
    {
        ProductRecommendation::updateOrCreate(
            [
                'product_id' => $productId,
                'recommended_product_id' => $recommendedId,
                'type' => $type,
            ],
            [
                'score' => DB::raw("score + {$increment}"),
            ]
        );

        $this->clearProductCache($productId);
    }

    /**
     * Track product view
     */
    public function trackProductView(int $productId, ?int $userId = null, ?string $sessionId = null): void
    {
        ProductView::create([
            'product_id' => $productId,
            'user_id' => $userId,
            'session_id' => $sessionId,
        ]);

        // Increment views count on product
        Product::where('id', $productId)->increment('views_count');
    }

    /**
     * Clear product recommendation cache
     */
    private function clearProductCache(int $productId): void
    {
        Cache::forget("recommendations.frequently_bought.{$productId}");
        Cache::forget("recommendations.also_viewed.{$productId}");
        Cache::forget("recommendations.similar.{$productId}");
    }
}
