<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductReviewController extends Controller
{
    public function index(Request $request, Product $product): Response
    {
        $query = Review::query()
            ->where('product_id', $product->id)
            ->where('is_spam', false)
            ->with(['user:id,name', 'media', 'votes']);

        // Filter by rating
        if ($request->filled('rating')) {
            $query->where('rating', $request->input('rating'));
        }

        // Filter by verified purchase
        if ($request->boolean('verified_only')) {
            $query->where('verified_purchase', true);
        }

        // Filter by media
        if ($request->boolean('with_media')) {
            $query->whereHas('media');
        }

        // Sort
        $sortBy = $request->input('sort', 'recent');
        switch ($sortBy) {
            case 'helpful':
                $query->orderByDesc('helpful_count');
                break;
            case 'rating_high':
                $query->orderByDesc('rating');
                break;
            case 'rating_low':
                $query->orderBy('rating');
                break;
            default:
                $query->latest();
        }

        $reviews = $query->paginate(10)->through(function ($review) {
            return [
                'id' => $review->id,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'verified_purchase' => $review->verified_purchase,
                'helpful_count' => $review->helpful_count,
                'not_helpful_count' => $review->not_helpful_count,
                'admin_reply' => $review->admin_reply,
                'created_at' => $review->created_at,
                'user' => $review->user,
                'media' => $review->media,
                'user_vote' => auth()->check() 
                    ? $review->votes()->where('user_id', auth()->id())->first()?->is_helpful
                    : null,
            ];
        });

        // Rating breakdown
        $ratingStats = [
            'average' => $product->reviews()->where('is_spam', false)->avg('rating') ?? 0,
            'total' => $product->reviews()->where('is_spam', false)->count(),
            'breakdown' => [],
        ];

        for ($i = 5; $i >= 1; $i--) {
            $count = $product->reviews()->where('is_spam', false)->where('rating', $i)->count();
            $ratingStats['breakdown'][$i] = [
                'count' => $count,
                'percentage' => $ratingStats['total'] > 0 
                    ? round(($count / $ratingStats['total']) * 100) 
                    : 0,
            ];
        }

        return Inertia::render('Product/Reviews', [
            'product' => $product->only(['id', 'name', 'slug', 'image_url']),
            'reviews' => $reviews,
            'ratingStats' => $ratingStats,
            'filters' => [
                'rating' => $request->input('rating'),
                'verified_only' => $request->boolean('verified_only'),
                'with_media' => $request->boolean('with_media'),
                'sort' => $sortBy,
            ],
        ]);
    }
}
