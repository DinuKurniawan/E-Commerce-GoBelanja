<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class UserWishlistController extends Controller
{
    public function index(): Response
    {
        $wishlists = Wishlist::query()
            ->where('user_id', auth()->id())
            ->with(['product:id,name,slug,price,image_url,emoji,stock,rating', 'product.images'])
            ->latest()
            ->get();

        $products = Product::query()
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'price', 'emoji']);

        return Inertia::render('User/Wishlist', [
            'wishlists' => $wishlists,
            'products' => $products,
        ]);
    }

    public function store(): RedirectResponse
    {
        $validated = request()->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        Wishlist::query()->firstOrCreate([
            'user_id' => auth()->id(),
            'product_id' => $validated['product_id'],
        ]);

        return back()->with('success', 'Produk ditambahkan ke wishlist.');
    }

    public function destroy(Wishlist $wishlist): RedirectResponse
    {
        abort_unless($wishlist->user_id === auth()->id(), 403);

        $wishlist->delete();

        return back()->with('success', 'Produk dihapus dari wishlist.');
    }

    public function toggleByProduct(): RedirectResponse
    {
        $validated = request()->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $existing = Wishlist::query()->where('user_id', auth()->id())
            ->where('product_id', $validated['product_id'])
            ->first();

        if ($existing) {
            $existing->delete();
            return back()->with('success', 'Produk dihapus dari wishlist.');
        }

        Wishlist::create([
            'user_id' => auth()->id(),
            'product_id' => $validated['product_id'],
        ]);

        return back()->with('success', 'Produk ditambahkan ke wishlist.');
    }

    public function moveToCart(Wishlist $wishlist): RedirectResponse
    {
        abort_unless($wishlist->user_id === auth()->id(), 403);

        $wishlist->load('product:id,stock');
        $stock = (int) ($wishlist->product?->stock ?? 0);

        if ($stock < 1) {
            return back()->withErrors([
                'wishlist' => 'Produk pada wishlist sedang habis stok.',
            ]);
        }

        $cartItem = CartItem::query()->firstOrNew([
            'user_id' => auth()->id(),
            'product_id' => $wishlist->product_id,
        ]);

        $nextQuantity = min(($cartItem->quantity ?? 0) + 1, $stock);
        $cartItem->quantity = $nextQuantity;
        $cartItem->save();

        if ($nextQuantity >= $stock) {
            $wishlist->delete();

            return back()->with('success', 'Produk dipindahkan ke cart. Jumlah mengikuti batas stok.');
        }

        $wishlist->delete();

        return back()->with('success', 'Produk dipindahkan ke cart.');
    }
}
