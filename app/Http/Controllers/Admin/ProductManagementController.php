<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductSize;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProductManagementController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Products', [
            'products' => Product::query()
                ->with(['category:id,name', 'images', 'sizes'])
                ->latest()
                ->get(),
            'categories' => Category::query()->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id'   => 'required|exists:categories,id',
            'name'          => 'required|string|max:255',
            'slug'          => 'required|string|max:255|unique:products,slug',
            'price'         => 'required|integer|min:0',
            'stock'         => 'required|integer|min:0',
            'emoji'         => 'nullable|string|max:10',
            'image_files'   => 'nullable|array',
            'image_files.*' => 'image|max:4096',
            'sizes'         => 'nullable|array',
            'sizes.*'       => 'string|max:20',
            'is_new'        => 'nullable|boolean',
            'is_featured'   => 'nullable|boolean',
            'is_popular'    => 'nullable|boolean',
        ]);

        $sizes = $validated['sizes'] ?? [];
        unset($validated['image_files'], $validated['sizes']);

        $product = Product::query()->create($validated);

        $this->syncSizes($product, $sizes);
        $this->storeImages($request, $product);

        return back()->with('success', 'Produk berhasil ditambahkan.');
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'category_id'   => 'required|exists:categories,id',
            'name'          => 'required|string|max:255',
            'slug'          => 'required|string|max:255|unique:products,slug,'.$product->id,
            'price'         => 'required|integer|min:0',
            'stock'         => 'required|integer|min:0',
            'emoji'         => 'nullable|string|max:10',
            'image_files'   => 'nullable|array',
            'image_files.*' => 'image|max:4096',
            'sizes'         => 'nullable|array',
            'sizes.*'       => 'string|max:20',
            'is_new'        => 'nullable|boolean',
            'is_featured'   => 'nullable|boolean',
            'is_popular'    => 'nullable|boolean',
        ]);

        $sizes = $validated['sizes'] ?? [];
        unset($validated['image_files'], $validated['sizes']);

        $product->update($validated);

        $this->syncSizes($product, $sizes);
        $this->storeImages($request, $product);

        return back()->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroyImage(ProductImage $image)
    {
        $product = $image->product;

        // Remove file from storage
        $storagePath = str_replace('/storage/', 'public/', $image->image_url);
        Storage::delete($storagePath);

        $image->delete();

        // If deleted image was the primary, set new primary from remaining images
        $firstImage = $product->images()->first();
        $product->update(['image_url' => $firstImage?->image_url]);

        return back()->with('success', 'Gambar berhasil dihapus.');
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return back()->with('success', 'Produk berhasil dihapus.');
    }

    private function syncSizes(Product $product, array $sizes): void
    {
        $product->sizes()->delete();
        foreach (array_unique(array_filter($sizes)) as $name) {
            $product->sizes()->create(['name' => trim($name)]);
        }
    }

    private function storeImages(Request $request, Product $product): void
    {
        if (! $request->hasFile('image_files')) {
            return;
        }

        $sortOrder = $product->images()->max('sort_order') ?? -1;

        foreach ($request->file('image_files') as $file) {
            $path     = $file->store('products', 'public');
            $imageUrl = Storage::url($path);
            $sortOrder++;

            $product->images()->create([
                'image_url'  => $imageUrl,
                'sort_order' => $sortOrder,
            ]);
        }

        // Always keep product.image_url in sync with first image
        $product->update(['image_url' => $product->images()->orderBy('sort_order')->value('image_url')]);
    }
}
