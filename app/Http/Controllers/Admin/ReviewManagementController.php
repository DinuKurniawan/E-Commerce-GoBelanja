<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewManagementController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Reviews', [
            'reviews' => Review::query()
                ->with(['user:id,name', 'product:id,name'])
                ->latest()
                ->get(),
        ]);
    }

    public function destroy(Review $review)
    {
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
}
