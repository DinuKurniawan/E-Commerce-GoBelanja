<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductColor;
use App\Models\ProductSize;
use Illuminate\Http\Request;

class ProductVariantController extends Controller
{
    public function getVariants($productId)
    {
        $product = Product::with(['colors', 'sizes', 'variants.color', 'variants.size'])
            ->findOrFail($productId);
        
        $variants = [];
        
        foreach ($product->colors as $color) {
            foreach ($product->sizes as $size) {
                $variant = $product->variants()
                    ->where('color_id', $color->id)
                    ->where('size_id', $size->id)
                    ->first();
                
                $variants[] = [
                    'id' => $variant->id ?? null,
                    'color_id' => $color->id,
                    'color_name' => $color->name,
                    'color_hex' => $color->hex_code,
                    'size_id' => $size->id,
                    'size_name' => $size->name,
                    'stock' => $variant->stock ?? 0,
                ];
            }
        }
        
        return response()->json([
            'variants' => $variants,
            'colors' => $product->colors,
            'sizes' => $product->sizes,
        ]);
    }

    public function checkAvailability(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'color_id' => 'required|exists:product_colors,id',
            'size_id' => 'required|exists:product_sizes,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $variant = ProductVariant::where('product_id', $validated['product_id'])
            ->where('color_id', $validated['color_id'])
            ->where('size_id', $validated['size_id'])
            ->first();

        if (!$variant) {
            return response()->json([
                'available' => false,
                'message' => 'This combination is not available',
                'stock' => 0,
            ]);
        }

        $available = $variant->stock >= $validated['quantity'];

        return response()->json([
            'available' => $available,
            'stock' => $variant->stock,
            'message' => $available 
                ? 'Available' 
                : 'Only ' . $variant->stock . ' items in stock',
        ]);
    }

    public function updateVariantStock(Request $request)
    {
        $validated = $request->validate([
            'variants' => 'required|array',
            'variants.*.color_id' => 'required|exists:product_colors,id',
            'variants.*.size_id' => 'required|exists:product_sizes,id',
            'variants.*.stock' => 'required|integer|min:0',
        ]);

        $productId = $request->input('product_id');
        $product = Product::findOrFail($productId);

        foreach ($validated['variants'] as $variantData) {
            ProductVariant::updateOrCreate(
                [
                    'product_id' => $productId,
                    'color_id' => $variantData['color_id'],
                    'size_id' => $variantData['size_id'],
                ],
                [
                    'stock' => $variantData['stock'],
                ]
            );
        }

        return response()->json([
            'message' => 'Variant stocks updated successfully',
        ]);
    }
}

