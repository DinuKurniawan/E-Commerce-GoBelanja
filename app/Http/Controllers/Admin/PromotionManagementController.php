<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PromotionManagementController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Promotions', [
            'promotions' => Promotion::query()->latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:promotions,code',
            'type' => 'required|in:voucher,discount_product',
            'discount_percent' => 'required|integer|min:1|max:100',
            'minimum_purchase' => 'required|integer|min:0',
            'expires_at' => 'required|date',
            'is_active' => 'boolean',
        ]);

        Promotion::query()->create($validated);

        return back()->with('success', 'Promo berhasil ditambahkan.');
    }

    public function destroy(Promotion $promotion)
    {
        $promotion->delete();

        return back()->with('success', 'Promo berhasil dihapus.');
    }
}
