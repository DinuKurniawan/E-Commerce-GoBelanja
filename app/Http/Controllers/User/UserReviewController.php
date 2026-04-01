<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\ReviewMedia;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserReviewController extends Controller
{
    public function index(): Response
    {
        $reviews = Review::query()
            ->where('user_id', auth()->id())
            ->with(['product:id,name,slug,image_url', 'media'])
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

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:10|max:1000',
            'media' => 'nullable|array|max:5',
            'media.*' => 'file|mimes:jpg,jpeg,png,mp4|max:51200', // 50MB max
        ]);

        // Check if user has purchased this product
        $verifiedPurchase = Order::query()
            ->where('user_id', auth()->id())
            ->where('status', 'selesai')
            ->whereHas('items', function ($query) use ($validated) {
                $query->where('product_id', $validated['product_id']);
            })
            ->exists();

        $review = Review::query()->updateOrCreate(
            [
                'user_id' => auth()->id(),
                'product_id' => $validated['product_id'],
            ],
            [
                'rating' => $validated['rating'],
                'comment' => $validated['comment'],
                'verified_purchase' => $verifiedPurchase,
                'is_spam' => false,
            ],
        );

        // Handle media uploads
        if ($request->hasFile('media')) {
            // Delete existing media
            foreach ($review->media as $media) {
                Storage::disk('public')->delete($media->media_url);
                $media->delete();
            }

            // Upload new media
            foreach ($request->file('media') as $index => $file) {
                $mediaType = str_starts_with($file->getMimeType(), 'image/') ? 'image' : 'video';
                $path = $file->store('reviews', 'public');

                ReviewMedia::create([
                    'review_id' => $review->id,
                    'media_type' => $mediaType,
                    'media_url' => $path,
                    'sort_order' => $index,
                ]);
            }
        }

        return back()->with('success', 'Review berhasil disimpan.');
    }

    public function destroy(Review $review): RedirectResponse
    {
        abort_unless((int) $review->user_id === (int) auth()->id(), 403);

        // Delete associated media files
        foreach ($review->media as $media) {
            Storage::disk('public')->delete($media->media_url);
        }

        $review->delete();

        return back()->with('success', 'Review berhasil dihapus.');
    }
}
