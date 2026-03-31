<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Product;
use App\Services\FlashSaleService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class UserCartController extends Controller
{
    public function __construct(
        private FlashSaleService $flashSaleService
    ) {}

    public function index(): Response
    {
        $cartItems = CartItem::query()
            ->where('user_id', auth()->id())
            ->with(['product:id,name,slug,price,stock,image_url,emoji', 'product.images', 'color'])
            ->latest()
            ->get()
            ->map(function ($item) {
                $product = $item->product;
                $flashSale = $this->flashSaleService->getActiveFlashSaleForProduct($product);

                return [
                    'id' => $item->id,
                    'product' => $product,
                    'quantity' => $item->quantity,
                    'size' => $item->size,
                    'color' => $item->color ? [
                        'id' => $item->color->id,
                        'name' => $item->color->name,
                        'hex_code' => $item->color->hex_code,
                    ] : null,
                    'flash_sale' => $flashSale ? [
                        'id' => $flashSale->id,
                        'flash_price' => $flashSale->flash_price,
                        'discount_percent' => $flashSale->discount_percent,
                        'ends_at' => $flashSale->ends_at->toISOString(),
                    ] : null,
                ];
            });

        $products = Product::query()
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'price', 'emoji', 'stock']);

        $cartTotal = $cartItems->sum(function ($item) {
            $price = $item['flash_sale'] ? $item['flash_sale']['flash_price'] : $item['product']->price;
            if ($item['color'] && $item['color']['price_adjustment'] ?? false) {
                $price += $item['color']['price_adjustment'];
            }
            return $price * $item['quantity'];
        });

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
            'color_id' => 'nullable|exists:product_colors,id',
            'quantity'   => 'nullable|integer|min:1|max:99',
            'size'       => 'nullable|string|max:20',
        ]);

        $product  = Product::query()->with(['sizes', 'colors'])->findOrFail($validated['product_id']);
        $quantity = (int) ($validated['quantity'] ?? 1);
        $size     = trim($validated['size'] ?? '');
        $colorId  = $validated['color_id'] ?? null;

        // If product has colors, color selection is required
        if ($product->colors->isNotEmpty() && !$colorId) {
            return back()->withErrors(['color_id' => 'Silakan pilih warna terlebih dahulu.']);
        }

        // If product has sizes, size selection is required
        if ($product->sizes->isNotEmpty() && $size === '') {
            return back()->withErrors(['size' => 'Silakan pilih ukuran terlebih dahulu.']);
        }

        // Check variant stock if both color and size are selected
        if ($colorId && $size) {
            $sizeModel = $product->sizes()->where('name', $size)->first();
            if ($sizeModel) {
                $variant = $product->variants()
                    ->where('color_id', $colorId)
                    ->where('size_id', $sizeModel->id)
                    ->first();
                
                if ($variant) {
                    if ($variant->stock < 1) {
                        return back()->withErrors(['product_id' => 'Kombinasi warna dan ukuran ini habis stok.']);
                    }
                    if ($variant->stock < $quantity) {
                        return back()->withErrors(['product_id' => "Stok kombinasi ini hanya tersisa {$variant->stock}."]);
                    }
                }
            }
        } elseif ($product->stock < 1) {
            return back()->withErrors(['product_id' => 'Stok produk habis.']);
        }

        // Check flash sale availability if active
        $flashSale = $this->flashSaleService->getActiveFlashSaleForProduct($product);
        if ($flashSale) {
            $availability = $this->flashSaleService->checkFlashSaleAvailability($flashSale, $quantity);
            if (!$availability['available']) {
                return back()->withErrors(['product_id' => $availability['reason']]);
            }
        }

        $cartItem = CartItem::query()->firstOrNew([
            'user_id'    => auth()->id(),
            'product_id' => $product->id,
            'color_id'   => $colorId,
            'size'       => $size,
        ]);

        $maxStock = $product->stock;
        if ($colorId && $size) {
            $sizeModel = $product->sizes()->where('name', $size)->first();
            if ($sizeModel) {
                $variant = $product->variants()
                    ->where('color_id', $colorId)
                    ->where('size_id', $sizeModel->id)
                    ->first();
                if ($variant) {
                    $maxStock = $variant->stock;
                }
            }
        }

        $nextQuantity = min(($cartItem->quantity ?? 0) + $quantity, $maxStock);
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

        // Check flash sale availability if active
        $flashSale = $this->flashSaleService->getActiveFlashSaleForProduct($cart->product);
        if ($flashSale) {
            $availability = $this->flashSaleService->checkFlashSaleAvailability($flashSale, $requestedQuantity);
            if (!$availability['available']) {
                return back()->withErrors(['quantity' => $availability['reason']]);
            }
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
