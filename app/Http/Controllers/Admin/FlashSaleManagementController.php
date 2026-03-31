<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FlashSale;
use App\Models\Product;
use App\Services\FlashSaleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FlashSaleManagementController extends Controller
{
    public function __construct(
        private FlashSaleService $flashSaleService
    ) {}

    public function index(): Response
    {
        $flashSales = FlashSale::query()
            ->with(['product:id,name,slug,price,image_url,emoji'])
            ->latest()
            ->get()
            ->map(function ($flashSale) {
                return [
                    'id' => $flashSale->id,
                    'name' => $flashSale->name,
                    'product' => $flashSale->product,
                    'discount_percent' => $flashSale->discount_percent,
                    'flash_price' => $flashSale->flash_price,
                    'max_quantity' => $flashSale->max_quantity,
                    'sold_quantity' => $flashSale->sold_quantity,
                    'remaining_quantity' => $flashSale->remaining_quantity,
                    'progress_percent' => $flashSale->progress_percent,
                    'starts_at' => $flashSale->starts_at->toISOString(),
                    'ends_at' => $flashSale->ends_at->toISOString(),
                    'is_active' => $flashSale->is_active,
                    'has_started' => $flashSale->hasStarted(),
                    'has_ended' => $flashSale->hasEnded(),
                    'is_sold_out' => $flashSale->isSoldOut(),
                    'status' => $this->getStatus($flashSale),
                ];
            });

        $products = Product::query()
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'price', 'emoji']);

        return Inertia::render('Admin/FlashSales', [
            'flashSales' => $flashSales,
            'products' => $products,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'name' => 'required|string|max:255',
            'discount_percent' => 'required|numeric|min:1|max:99',
            'max_quantity' => 'nullable|integer|min:1',
            'starts_at' => 'required|date',
            'ends_at' => 'required|date|after:starts_at',
            'is_active' => 'boolean',
        ]);

        $product = Product::findOrFail($validated['product_id']);

        // Calculate flash price
        $flashPrice = $product->price * (1 - ($validated['discount_percent'] / 100));

        // Validate flash price is less than original
        if ($flashPrice >= $product->price) {
            return back()->withErrors([
                'discount_percent' => 'Harga flash sale harus lebih rendah dari harga asli.',
            ]);
        }

        // Check for overlapping flash sales
        if ($this->flashSaleService->checkOverlappingFlashSales(
            $validated['product_id'],
            $validated['starts_at'],
            $validated['ends_at']
        )) {
            return back()->withErrors([
                'starts_at' => 'Terdapat flash sale yang masih aktif untuk produk ini pada periode waktu yang sama.',
            ]);
        }

        FlashSale::create([
            'product_id' => $validated['product_id'],
            'name' => $validated['name'],
            'discount_percent' => $validated['discount_percent'],
            'flash_price' => round($flashPrice, 2),
            'max_quantity' => $validated['max_quantity'] ?? null,
            'sold_quantity' => 0,
            'starts_at' => $validated['starts_at'],
            'ends_at' => $validated['ends_at'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('admin.flash-sales.index')
            ->with('success', 'Flash sale berhasil dibuat.');
    }

    public function update(Request $request, FlashSale $flashSale): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'name' => 'required|string|max:255',
            'discount_percent' => 'required|numeric|min:1|max:99',
            'max_quantity' => 'nullable|integer|min:1',
            'starts_at' => 'required|date',
            'ends_at' => 'required|date|after:starts_at',
            'is_active' => 'boolean',
        ]);

        $product = Product::findOrFail($validated['product_id']);

        // Calculate flash price
        $flashPrice = $product->price * (1 - ($validated['discount_percent'] / 100));

        // Validate flash price is less than original
        if ($flashPrice >= $product->price) {
            return back()->withErrors([
                'discount_percent' => 'Harga flash sale harus lebih rendah dari harga asli.',
            ]);
        }

        // Check for overlapping flash sales (excluding current flash sale)
        if ($this->flashSaleService->checkOverlappingFlashSales(
            $validated['product_id'],
            $validated['starts_at'],
            $validated['ends_at'],
            $flashSale->id
        )) {
            return back()->withErrors([
                'starts_at' => 'Terdapat flash sale yang masih aktif untuk produk ini pada periode waktu yang sama.',
            ]);
        }

        $flashSale->update([
            'product_id' => $validated['product_id'],
            'name' => $validated['name'],
            'discount_percent' => $validated['discount_percent'],
            'flash_price' => round($flashPrice, 2),
            'max_quantity' => $validated['max_quantity'] ?? null,
            'starts_at' => $validated['starts_at'],
            'ends_at' => $validated['ends_at'],
            'is_active' => $validated['is_active'] ?? $flashSale->is_active,
        ]);

        return redirect()->route('admin.flash-sales.index')
            ->with('success', 'Flash sale berhasil diperbarui.');
    }

    public function destroy(FlashSale $flashSale): RedirectResponse
    {
        $flashSale->delete();

        return redirect()->route('admin.flash-sales.index')
            ->with('success', 'Flash sale berhasil dihapus.');
    }

    public function toggle(FlashSale $flashSale): RedirectResponse
    {
        $flashSale->update([
            'is_active' => !$flashSale->is_active,
        ]);

        $status = $flashSale->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return redirect()->route('admin.flash-sales.index')
            ->with('success', "Flash sale berhasil {$status}.");
    }

    private function getStatus(FlashSale $flashSale): string
    {
        if (!$flashSale->is_active) {
            return 'inactive';
        }

        if (!$flashSale->hasStarted()) {
            return 'upcoming';
        }

        if ($flashSale->hasEnded()) {
            return 'ended';
        }

        if ($flashSale->isSoldOut()) {
            return 'sold_out';
        }

        return 'active';
    }
}
