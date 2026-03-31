<?php

namespace App\Http\Controllers;

use App\Services\RecommendationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class RecommendationController extends Controller
{
    public function __construct(
        private RecommendationService $recommendationService
    ) {}

    /**
     * Get frequently bought together products
     */
    public function frequentlyBought(int $productId): JsonResponse
    {
        $products = $this->recommendationService->getFrequentlyBoughtTogether($productId);

        return response()->json([
            'products' => $products,
        ]);
    }

    /**
     * Get also viewed products
     */
    public function alsoViewed(int $productId): JsonResponse
    {
        $products = $this->recommendationService->getAlsoViewed($productId);

        return response()->json([
            'products' => $products,
        ]);
    }

    /**
     * Get similar products
     */
    public function similar(int $productId): JsonResponse
    {
        $products = $this->recommendationService->getSimilarProducts($productId);

        return response()->json([
            'products' => $products,
        ]);
    }

    /**
     * Get personalized recommendations for logged-in user
     */
    public function forYou(Request $request): JsonResponse
    {
        if (!auth()->check()) {
            return response()->json([
                'products' => [],
                'message' => 'Login required for personalized recommendations',
            ], 401);
        }

        $products = $this->recommendationService->getPersonalizedRecommendationsForUser(
            auth()->id()
        );

        return response()->json([
            'products' => $products,
        ]);
    }

    /**
     * Get trending products
     */
    public function trending(Request $request): JsonResponse
    {
        $days = $request->integer('days', 7);
        $limit = $request->integer('limit', 12);

        $products = $this->recommendationService->getTrendingProducts($limit, $days);

        return response()->json([
            'products' => $products,
        ]);
    }

    /**
     * Track product view
     */
    public function trackView(int $productId, Request $request): JsonResponse
    {
        $userId = auth()->id();
        $sessionId = session()->getId();

        $this->recommendationService->trackProductView($productId, $userId, $sessionId);

        return response()->json([
            'success' => true,
        ]);
    }
}
