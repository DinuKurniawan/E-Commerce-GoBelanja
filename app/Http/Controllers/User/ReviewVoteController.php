<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\ReviewVote;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ReviewVoteController extends Controller
{
    public function vote(Request $request, Review $review): RedirectResponse
    {
        // Prevent voting on own reviews
        if ($review->user_id === auth()->id()) {
            return back()->with('error', 'Anda tidak dapat memberikan vote pada review Anda sendiri.');
        }

        $validated = $request->validate([
            'is_helpful' => 'required|boolean',
        ]);

        $existingVote = ReviewVote::query()
            ->where('review_id', $review->id)
            ->where('user_id', auth()->id())
            ->first();

        if ($existingVote) {
            // Update existing vote if different
            if ($existingVote->is_helpful !== $validated['is_helpful']) {
                // Decrement old count
                if ($existingVote->is_helpful) {
                    $review->decrement('helpful_count');
                } else {
                    $review->decrement('not_helpful_count');
                }

                // Increment new count
                if ($validated['is_helpful']) {
                    $review->increment('helpful_count');
                } else {
                    $review->increment('not_helpful_count');
                }

                $existingVote->update(['is_helpful' => $validated['is_helpful']]);
            }
        } else {
            // Create new vote
            ReviewVote::create([
                'review_id' => $review->id,
                'user_id' => auth()->id(),
                'is_helpful' => $validated['is_helpful'],
            ]);

            // Increment count
            if ($validated['is_helpful']) {
                $review->increment('helpful_count');
            } else {
                $review->increment('not_helpful_count');
            }
        }

        return back()->with('success', 'Vote berhasil disimpan.');
    }
}
