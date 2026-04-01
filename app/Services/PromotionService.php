<?php

namespace App\Services;

use App\Models\Promotion;
use App\Models\User;
use App\Models\Order;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class PromotionService
{
    public function validatePromoCode(string $code, Collection $cartItems, User $user): array
    {
        $promotion = Promotion::where('code', $code)->first();

        if (!$promotion) {
            return [
                'valid' => false,
                'message' => 'Kode promosi tidak valid.',
            ];
        }

        if (!$promotion->is_active) {
            return [
                'valid' => false,
                'message' => 'Kode promosi tidak aktif.',
            ];
        }

        if ($promotion->isExpired()) {
            return [
                'valid' => false,
                'message' => 'Kode promosi telah kadaluarsa.',
            ];
        }

        if ($promotion->isUsageLimitReached()) {
            return [
                'valid' => false,
                'message' => 'Kode promosi telah mencapai batas penggunaan.',
            ];
        }

        if (!$promotion->canBeUsedByUser($user->id)) {
            return [
                'valid' => false,
                'message' => 'Anda telah mencapai batas penggunaan kode promosi ini.',
            ];
        }

        // Check if cart meets minimum purchase
        $subtotal = $this->calculateCartSubtotal($cartItems);
        if ($promotion->minimum_purchase > 0 && $subtotal < $promotion->minimum_purchase) {
            return [
                'valid' => false,
                'message' => 'Minimum pembelian Rp ' . number_format($promotion->minimum_purchase, 0, ',', '.') . ' untuk menggunakan kode promosi ini.',
            ];
        }

        // Check first purchase promotion
        if ($promotion->promotion_type === 'first_purchase' && !$this->checkFirstPurchase($user)) {
            return [
                'valid' => false,
                'message' => 'Promosi ini hanya untuk pembelian pertama.',
            ];
        }

        // Calculate discount
        $discountResult = $this->calculateDiscount($promotion, $cartItems, $user);

        return [
            'valid' => true,
            'message' => 'Kode promosi berhasil diterapkan!',
            'promotion' => $promotion,
            'discount' => $discountResult,
        ];
    }

    public function calculateDiscount(Promotion $promotion, Collection $cartItems, User $user): array
    {
        $result = [
            'type' => $promotion->promotion_type,
            'discount_amount' => 0,
            'free_items' => [],
            'free_shipping' => false,
            'affected_items' => [],
        ];

        switch ($promotion->promotion_type) {
            case 'voucher':
            case 'discount_product':
                $result = array_merge($result, $this->applyVoucherDiscount($promotion, $cartItems));
                break;

            case 'bogo':
                $result = array_merge($result, $this->applyBogoDiscount($promotion, $cartItems));
                break;

            case 'bundle':
                $result = array_merge($result, $this->applyBundleDiscount($promotion, $cartItems));
                break;

            case 'free_shipping':
                $result = array_merge($result, $this->checkFreeShipping($promotion, $cartItems));
                break;

            case 'category':
                $result = array_merge($result, $this->applyCategoryDiscount($promotion, $cartItems));
                break;

            case 'tiered':
                $result = array_merge($result, $this->applyTieredDiscount($promotion, $cartItems));
                break;

            case 'first_purchase':
                $result = array_merge($result, $this->applyFirstPurchaseDiscount($promotion, $cartItems, $user));
                break;

            case 'bulk':
                $result = array_merge($result, $this->applyBulkDiscount($promotion, $cartItems));
                break;
        }

        // Apply max discount limit if set
        if ($promotion->max_discount_amount && $result['discount_amount'] > $promotion->max_discount_amount) {
            $result['discount_amount'] = $promotion->max_discount_amount;
        }

        return $result;
    }

    protected function applyVoucherDiscount(Promotion $promotion, Collection $cartItems): array
    {
        $subtotal = $this->calculateCartSubtotal($cartItems);
        $discountAmount = ($subtotal * $promotion->discount_percent) / 100;

        return [
            'discount_amount' => (int) $discountAmount,
            'affected_items' => $cartItems->pluck('id')->toArray(),
        ];
    }

    public function applyBogoDiscount(Promotion $promotion, Collection $cartItems): array
    {
        $buyQuantity = $promotion->buy_quantity ?? 1;
        $getQuantity = $promotion->get_quantity ?? 1;
        $getDiscountPercent = $promotion->get_discount_percent ?? 100;

        $discountAmount = 0;
        $freeItems = [];
        $affectedItems = [];

        // Filter applicable items
        $applicableItems = $this->filterApplicableItems($promotion, $cartItems);

        foreach ($applicableItems as $cartItem) {
            $product = $cartItem->product;
            $sets = floor($cartItem->quantity / ($buyQuantity + $getQuantity));
            
            if ($sets > 0) {
                $freeItemsCount = $sets * $getQuantity;
                $discountPerItem = ($product->price * $getDiscountPercent) / 100;
                $itemDiscount = $freeItemsCount * $discountPerItem;
                
                $discountAmount += $itemDiscount;
                $freeItems[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $freeItemsCount,
                    'discount_percent' => $getDiscountPercent,
                ];
                $affectedItems[] = $cartItem->id;
            }
        }

        return [
            'discount_amount' => (int) $discountAmount,
            'free_items' => $freeItems,
            'affected_items' => $affectedItems,
        ];
    }

    public function applyBundleDiscount(Promotion $promotion, Collection $cartItems): array
    {
        if (!$promotion->bundle_products || empty($promotion->bundle_products)) {
            return ['discount_amount' => 0];
        }

        $bundleProducts = $promotion->bundle_products;
        $cartProductIds = $cartItems->pluck('product_id')->toArray();

        // Check if all bundle products are in cart
        $hasBundleComplete = empty(array_diff($bundleProducts, $cartProductIds));

        if (!$hasBundleComplete) {
            return ['discount_amount' => 0];
        }

        // Calculate bundle discount
        $bundleProductsTotal = 0;
        $affectedItems = [];

        foreach ($cartItems as $cartItem) {
            if (in_array($cartItem->product_id, $bundleProducts)) {
                $bundleProductsTotal += $cartItem->product->price * $cartItem->quantity;
                $affectedItems[] = $cartItem->id;
            }
        }

        $bundlePrice = $promotion->bundle_price ?? 0;
        $discountAmount = max(0, $bundleProductsTotal - $bundlePrice);

        return [
            'discount_amount' => (int) $discountAmount,
            'affected_items' => $affectedItems,
        ];
    }

    public function checkFreeShipping(Promotion $promotion, Collection $cartItems): array
    {
        $subtotal = $this->calculateCartSubtotal($cartItems);
        $freeShippingThreshold = $promotion->shipping_free_above ?? 0;

        $qualifiesForFreeShipping = $subtotal >= $freeShippingThreshold;

        return [
            'free_shipping' => $qualifiesForFreeShipping,
            'discount_amount' => 0, // Shipping discount applied separately
        ];
    }

    protected function applyCategoryDiscount(Promotion $promotion, Collection $cartItems): array
    {
        if (!$promotion->category_id) {
            return ['discount_amount' => 0];
        }

        $discountAmount = 0;
        $affectedItems = [];

        foreach ($cartItems as $cartItem) {
            if ($cartItem->product->category_id == $promotion->category_id) {
                $itemDiscount = ($cartItem->product->price * $cartItem->quantity * $promotion->discount_percent) / 100;
                $discountAmount += $itemDiscount;
                $affectedItems[] = $cartItem->id;
            }
        }

        return [
            'discount_amount' => (int) $discountAmount,
            'affected_items' => $affectedItems,
        ];
    }

    public function applyTieredDiscount(Promotion $promotion, Collection $cartItems): array
    {
        if (!$promotion->tier_levels || empty($promotion->tier_levels)) {
            return ['discount_amount' => 0];
        }

        $subtotal = $this->calculateCartSubtotal($cartItems);
        
        // Sort tiers by amount descending
        $tiers = collect($promotion->tier_levels)->sortByDesc('amount');

        $applicableTier = null;
        foreach ($tiers as $tier) {
            if ($subtotal >= $tier['amount']) {
                $applicableTier = $tier;
                break;
            }
        }

        if (!$applicableTier) {
            return ['discount_amount' => 0, 'next_tier' => $tiers->last()];
        }

        $discountAmount = ($subtotal * $applicableTier['discount_percent']) / 100;

        return [
            'discount_amount' => (int) $discountAmount,
            'applied_tier' => $applicableTier,
            'affected_items' => $cartItems->pluck('id')->toArray(),
        ];
    }

    public function checkFirstPurchase(User $user): bool
    {
        return Order::where('user_id', $user->id)
            ->where('status', '!=', 'cancelled')
            ->count() === 0;
    }

    protected function applyFirstPurchaseDiscount(Promotion $promotion, Collection $cartItems, User $user): array
    {
        if (!$this->checkFirstPurchase($user)) {
            return ['discount_amount' => 0];
        }

        $subtotal = $this->calculateCartSubtotal($cartItems);
        $discountAmount = ($subtotal * $promotion->discount_percent) / 100;

        return [
            'discount_amount' => (int) $discountAmount,
            'affected_items' => $cartItems->pluck('id')->toArray(),
        ];
    }

    public function applyBulkDiscount(Promotion $promotion, Collection $cartItems): array
    {
        $totalQuantity = $cartItems->sum('quantity');
        $minQuantity = $promotion->buy_quantity ?? 0;

        if ($totalQuantity < $minQuantity) {
            return [
                'discount_amount' => 0,
                'items_needed' => $minQuantity - $totalQuantity,
            ];
        }

        $subtotal = $this->calculateCartSubtotal($cartItems);
        $discountAmount = ($subtotal * $promotion->discount_percent) / 100;

        return [
            'discount_amount' => (int) $discountAmount,
            'affected_items' => $cartItems->pluck('id')->toArray(),
        ];
    }

    public function getAvailablePromotions(Collection $cartItems, User $user): Collection
    {
        $subtotal = $this->calculateCartSubtotal($cartItems);
        $categoryIds = $cartItems
            ->map(fn ($item) => $this->getCartItemCategoryId($item))
            ->filter(fn ($id) => $id !== null)
            ->unique()
            ->values()
            ->toArray();

        $productIds = $cartItems
            ->map(fn ($item) => $this->getCartItemProductId($item))
            ->filter(fn ($id) => $id !== null)
            ->values()
            ->toArray();

        return Promotion::active()
            ->where(function ($query) use ($subtotal, $categoryIds, $productIds, $user) {
                // Auto-applicable promotions
                $query->where('minimum_purchase', '<=', $subtotal)
                    ->where(function ($q) use ($categoryIds, $productIds, $user) {
                        $q->where('applies_to', 'all')
                          ->orWhere(function ($sq) use ($categoryIds) {
                              $sq->where('applies_to', 'category')
                                 ->whereIn('category_id', $categoryIds);
                          })
                          ->orWhere(function ($sq) use ($productIds) {
                              $sq->where('applies_to', 'product')
                                 ->where(function ($psq) use ($productIds) {
                                     foreach ($productIds as $productId) {
                                         $psq->orWhereJsonContains('applicable_product_ids', $productId);
                                     }
                                 });
                          });
                    });
            })
            ->where(function ($query) use ($user) {
                // Check per-user limits
                $query->whereDoesntHave('usages', function ($q) use ($user) {
                    $q->where('user_id', $user->id)
                      ->groupBy('promotion_id')
                      ->havingRaw('COUNT(*) >= promotions.per_user_limit');
                })->orWhereNull('per_user_limit');
            })
            ->get();
    }

    protected function calculateCartSubtotal(Collection $cartItems): int
    {
        return $cartItems->sum(function ($item) {
            $price = (int) data_get($item, 'product.price', 0);
            $quantity = max((int) data_get($item, 'quantity', 0), 0);

            return $price * $quantity;
        });
    }

    protected function filterApplicableItems(Promotion $promotion, Collection $cartItems): Collection
    {
        if ($promotion->applies_to === 'all') {
            return $cartItems;
        }

        if ($promotion->applies_to === 'category' && $promotion->category_id) {
            return $cartItems->filter(function ($item) use ($promotion) {
                return $this->getCartItemCategoryId($item) == $promotion->category_id;
            });
        }

        if ($promotion->applies_to === 'product' && $promotion->applicable_product_ids) {
            return $cartItems->filter(function ($item) use ($promotion) {
                $productId = $this->getCartItemProductId($item);
                return $productId !== null && in_array($productId, $promotion->applicable_product_ids);
            });
        }

        return $cartItems;
    }

    public function recordPromotionUsage(Promotion $promotion, Order $order, int $discountAmount): void
    {
        DB::transaction(function () use ($promotion, $order, $discountAmount) {
            $promotion->usages()->create([
                'user_id' => $order->user_id,
                'order_id' => $order->id,
                'discount_amount' => $discountAmount,
            ]);

            $promotion->incrementUsageCount();
        });
    }

    protected function getCartItemProductId(mixed $item): ?int
    {
        $id = data_get($item, 'product_id', data_get($item, 'product.id'));
        return is_numeric($id) ? (int) $id : null;
    }

    protected function getCartItemCategoryId(mixed $item): ?int
    {
        $id = data_get($item, 'product.category_id');
        return is_numeric($id) ? (int) $id : null;
    }
}
