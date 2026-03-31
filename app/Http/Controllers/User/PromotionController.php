<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use App\Services\PromotionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PromotionController extends Controller
{
    protected PromotionService $promotionService;

    public function __construct(PromotionService $promotionService)
    {
        $this->promotionService = $promotionService;
    }

    public function validate(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string',
            'cart_items' => 'required|array',
        ]);

        $user = $request->user();
        
        // Load cart items with product relationship
        $cartItems = $user->cartItems()->with('product')->get();

        if ($cartItems->isEmpty()) {
            return response()->json([
                'valid' => false,
                'message' => 'Keranjang belanja kosong.',
            ], 422);
        }

        $result = $this->promotionService->validatePromoCode(
            $request->code,
            $cartItems,
            $user
        );

        if (!$result['valid']) {
            return response()->json($result, 422);
        }

        return response()->json([
            'valid' => true,
            'message' => $result['message'],
            'promotion' => [
                'id' => $result['promotion']->id,
                'code' => $result['promotion']->code,
                'name' => $result['promotion']->name,
                'description' => $result['promotion']->description,
                'promotion_type' => $result['promotion']->promotion_type,
                'discount_percent' => $result['promotion']->discount_percent,
            ],
            'discount' => $result['discount'],
        ]);
    }

    public function available(Request $request): JsonResponse
    {
        $user = $request->user();
        $cartItems = $user->cartItems()->with('product.category')->get();

        if ($cartItems->isEmpty()) {
            return response()->json([
                'promotions' => [],
            ]);
        }

        $availablePromotions = $this->promotionService->getAvailablePromotions($cartItems, $user);

        $promotions = $availablePromotions->map(function ($promotion) use ($cartItems, $user) {
            $discount = $this->promotionService->calculateDiscount($promotion, $cartItems, $user);
            
            return [
                'id' => $promotion->id,
                'code' => $promotion->code,
                'name' => $promotion->name,
                'description' => $promotion->description,
                'promotion_type' => $promotion->promotion_type,
                'discount_percent' => $promotion->discount_percent,
                'minimum_purchase' => $promotion->minimum_purchase,
                'expires_at' => $promotion->expires_at?->format('Y-m-d H:i:s'),
                'discount_amount' => $discount['discount_amount'],
                'free_shipping' => $discount['free_shipping'] ?? false,
            ];
        });

        return response()->json([
            'promotions' => $promotions,
        ]);
    }
}
