<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class UserReviewController extends Controller
{
    public function index(): Response
    {
        $reviews = Review::query()
            ->where('user_id', auth()->id())
            ->with('product:id,name,slug')
            ->latest()
            ->get();

        $products = Product::query()
            ->orderBy('name')
            ->get(['id', 'name', 'slug']);

        return Inertia::render('User/Reviews', [
            'reviews' => $reviews,
            'products' => $products,
        ]);
    }

    public function store(): RedirectResponse
    {
        $validated = request()->validate([
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|max:1000',
        ]);

        Review::query()->updateOrCreate(
            [
                'user_id' => auth()->id(),
                'product_id' => $validated['product_id'],
            ],
            [
                'rating' => $validated['rating'],
                'comment' => $validated['comment'],
                'is_spam' => false,
            ],
        );

        return back()->with('success', 'Review berhasil disimpan.');
    }

    public function destroy(Review $review): RedirectResponse
    {
        abort_unless($review->user_id === auth()->id(), 403);

        $review->delete();

        return back()->with('success', 'Review berhasil dihapus.');
    }
}
