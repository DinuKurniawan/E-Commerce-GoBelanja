<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class UserCartController extends Controller
{
    public function index(): Response
    {
        $cartItems = CartItem::query()
            ->where('user_id', auth()->id())
            ->with(['product:id,name,slug,price,stock,image_url,emoji', 'product.images'])
            ->latest()
            ->get();

        $products = Product::query()
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'price', 'emoji', 'stock']);

        $cartTotal = $cartItems->sum(fn ($item) => ($item->product?->price ?? 0) * $item->quantity);

        return Inertia::render('User/Cart', [
            'cartItems' => $cartItems,
            'products' => $products,
            'cartTotal' => (int) $cartTotal,
        ]);
    }

    public function store(): RedirectResponse
    {
        $validated = request()->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'nullable|integer|min:1|max:99',
            'size'       => 'nullable|string|max:20',
        ]);

        $product  = Product::query()->with('sizes')->findOrFail($validated['product_id']);
        $quantity = (int) ($validated['quantity'] ?? 1);
        $size     = trim($validated['size'] ?? '');

        // If product has sizes, size selection is required
        if ($product->sizes->isNotEmpty() && $size === '') {
            return back()->withErrors(['size' => 'Silakan pilih ukuran terlebih dahulu.']);
        }

        if ($product->stock < 1) {
            return back()->withErrors(['product_id' => 'Stok produk habis.']);
        }

        $cartItem = CartItem::query()->firstOrNew([
            'user_id'    => auth()->id(),
            'product_id' => $product->id,
            'size'       => $size,
        ]);

        $nextQuantity = min(($cartItem->quantity ?? 0) + $quantity, $product->stock);
        $cartItem->quantity = $nextQuantity;
        $cartItem->save();

        return back()->with('success', 'Produk ditambahkan ke keranjang.');
    }

    public function update(CartItem $cart): RedirectResponse
    {
        abort_unless($cart->user_id === auth()->id(), 403);

        $validated = request()->validate([
            'quantity' => 'required|integer|min:1|max:99',
        ]);

        $productStock = (int) ($cart->product?->stock ?? 0);
        $requestedQuantity = (int) $validated['quantity'];

        if ($productStock < 1) {
            return back()->withErrors([
                'quantity' => 'Produk sudah tidak memiliki stok.',
            ]);
        }

        if ($requestedQuantity > $productStock) {
            return back()->withErrors([
                'quantity' => "Stok produk hanya tersisa {$productStock}.",
            ]);
        }

        $cart->update([
            'quantity' => $requestedQuantity,
        ]);

        return back()->with('success', 'Jumlah item keranjang diperbarui.');
    }

    public function destroy(CartItem $cart): RedirectResponse
    {
        abort_unless($cart->user_id === auth()->id(), 403);

        $cart->delete();

        return back()->with('success', 'Item berhasil dihapus dari keranjang.');
    }
}
