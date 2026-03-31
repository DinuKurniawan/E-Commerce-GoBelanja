<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ReviewManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Review::query()
            ->with(['user:id,name', 'product:id,name,slug,image_url', 'media']);

        // Filter by spam status
        if ($request->filled('status')) {
            if ($request->input('status') === 'spam') {
                $query->where('is_spam', true);
            } elseif ($request->input('status') === 'pending') {
                $query->whereNull('admin_reply')->where('is_spam', false);
            }
        }

        $reviews = $query->latest()->paginate(20);

        return Inertia::render('Admin/Reviews', [
            'reviews' => $reviews,
            'filters' => [
                'status' => $request->input('status'),
            ],
        ]);
    }

    public function destroy(Review $review)
    {
        // Delete associated media files
        foreach ($review->media as $media) {
            Storage::disk('public')->delete($media->media_url);
        }

        $review->delete();

        return back()->with('success', 'Review berhasil dihapus.');
    }

    public function reply(Request $request, Review $review)
    {
        $validated = $request->validate([
            'admin_reply' => 'required|string|max:1000',
        ]);

        $review->update(['admin_reply' => $validated['admin_reply']]);

        return back()->with('success', 'Balasan review berhasil disimpan.');
    }

    public function flagSpam(Review $review)
    {
        $review->update(['is_spam' => !$review->is_spam]);

        $message = $review->is_spam 
            ? 'Review berhasil ditandai sebagai spam.' 
            : 'Review berhasil dikembalikan dari spam.';

        return back()->with('success', $message);
    }
}
