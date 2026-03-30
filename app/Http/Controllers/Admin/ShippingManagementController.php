<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ShippingMethod;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShippingManagementController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Shipping', [
            'shippingMethods' => ShippingMethod::query()->latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'cost' => 'required|integer|min:0',
            'tracking_url' => 'nullable|url',
            'is_active' => 'boolean',
        ]);

        ShippingMethod::query()->create($validated);

        return back()->with('success', 'Metode pengiriman berhasil ditambahkan.');
    }

    public function destroy(ShippingMethod $shippingMethod)
    {
        $shippingMethod->delete();

        return back()->with('success', 'Metode pengiriman berhasil dihapus.');
    }
}
