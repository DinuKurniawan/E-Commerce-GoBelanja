<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductColor;
use App\Models\ProductVariantImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductColorController extends Controller
{
    public function index($productId)
    {
        $product = Product::with(['colors.variantImages'])->findOrFail($productId);
        
        return response()->json([
            'colors' => $product->colors->map(function ($color) {
                return [
                    'id' => $color->id,
                    'name' => $color->name,
                    'hex_code' => $color->hex_code,
                    'stock' => $color->stock,
                    'price_adjustment' => $color->price_adjustment,
                    'is_available' => $color->is_available,
                    'images' => $color->variantImages->map(function ($image) {
                        return [
                            'id' => $image->id,
                            'url' => Storage::url($image->image_url),
                        ];
                    }),
                ];
            }),
        ]);
    }

    public function store(Request $request, $productId)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'hex_code' => 'nullable|string|max:7',
            'stock' => 'required|integer|min:0',
            'price_adjustment' => 'nullable|numeric|min:0',
            'is_available' => 'boolean',
        ]);

        $product = Product::findOrFail($productId);
        
        $color = $product->colors()->create([
            'name' => $validated['name'],
            'hex_code' => $validated['hex_code'] ?? null,
            'stock' => $validated['stock'],
            'price_adjustment' => $validated['price_adjustment'] ?? 0,
            'is_available' => $validated['is_available'] ?? true,
        ]);

        return response()->json([
            'message' => 'Color added successfully',
            'color' => $color,
        ], 201);
    }

    public function update(Request $request, $colorId)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'hex_code' => 'nullable|string|max:7',
            'stock' => 'sometimes|integer|min:0',
            'price_adjustment' => 'nullable|numeric|min:0',
            'is_available' => 'boolean',
        ]);

        $color = ProductColor::findOrFail($colorId);
        $color->update($validated);

        return response()->json([
            'message' => 'Color updated successfully',
            'color' => $color,
        ]);
    }

    public function destroy($colorId)
    {
        $color = ProductColor::with('variantImages')->findOrFail($colorId);
        
        foreach ($color->variantImages as $image) {
            if ($image->image_url) {
                Storage::disk('public')->delete($image->image_url);
            }
            $image->delete();
        }
        
        $color->delete();

        return response()->json([
            'message' => 'Color deleted successfully',
        ]);
    }

    public function uploadImages(Request $request, $colorId)
    {
        $request->validate([
            'images' => 'required|array|max:10',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $color = ProductColor::findOrFail($colorId);
        $uploadedImages = [];

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('products/variants', 'public');
                
                $variantImage = ProductVariantImage::create([
                    'product_id' => $color->product_id,
                    'product_color_id' => $color->id,
                    'image_url' => $path,
                ]);
                
                $uploadedImages[] = [
                    'id' => $variantImage->id,
                    'url' => Storage::url($path),
                ];
            }
        }

        return response()->json([
            'message' => 'Images uploaded successfully',
            'images' => $uploadedImages,
        ]);
    }

    public function deleteImage($imageId)
    {
        $image = ProductVariantImage::findOrFail($imageId);
        
        if ($image->image_url) {
            Storage::disk('public')->delete($image->image_url);
        }
        
        $image->delete();

        return response()->json([
            'message' => 'Image deleted successfully',
        ]);
    }
}

