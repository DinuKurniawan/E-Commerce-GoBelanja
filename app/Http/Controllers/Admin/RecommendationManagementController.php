<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\RecommendationService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

class RecommendationManagementController extends Controller
{
    public function __construct(
        private RecommendationService $recommendationService
    ) {}

    /**
     * Manually trigger recommendation generation
     */
    public function generate(Request $request): RedirectResponse
    {
        $productId = $request->integer('product_id');

        if ($productId) {
            $this->recommendationService->calculateRecommendations($productId);
            
            return back()->with('success', 'Recommendations generated for product successfully.');
        }

        // Generate for all products (run in background if possible)
        $this->recommendationService->calculateAllRecommendations();

        return back()->with('success', 'Recommendations generation started for all products.');
    }
}
