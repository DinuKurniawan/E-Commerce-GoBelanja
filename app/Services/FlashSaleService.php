<?php

namespace App\Services;

use App\Models\FlashSale;
use App\Models\Product;
use Illuminate\Support\Collection;

class FlashSaleService
{
    public function getActiveFlashSales(): Collection
    {
        return FlashSale::query()
            ->with(['product:id,name,slug,price,stock,image_url,emoji'])
            ->where('is_active', true)
            ->where('starts_at', '<=', now())
            ->where('ends_at', '>', now())
            ->whereRaw('(max_quantity IS NULL OR sold_quantity < max_quantity)')
            ->orderBy('ends_at')
            ->get();
    }

    public function checkFlashSaleAvailability(FlashSale $flashSale, int $requestedQuantity = 1): array
    {
        if (!$flashSale->is_active) {
            return [
                'available' => false,
                'reason' => 'Flash sale sudah tidak aktif.',
            ];
        }

        if (!$flashSale->hasStarted()) {
            return [
                'available' => false,
                'reason' => 'Flash sale belum dimulai.',
            ];
        }

        if ($flashSale->hasEnded()) {
            return [
                'available' => false,
                'reason' => 'Flash sale sudah berakhir.',
            ];
        }

        if ($flashSale->max_quantity !== null) {
            $remainingQuantity = $flashSale->remaining_quantity;

            if ($remainingQuantity <= 0) {
                return [
                    'available' => false,
                    'reason' => 'Flash sale sudah habis terjual.',
                ];
            }

            if ($requestedQuantity > $remainingQuantity) {
                return [
                    'available' => false,
                    'reason' => "Hanya tersisa {$remainingQuantity} item untuk flash sale ini.",
                ];
            }
        }

        return [
            'available' => true,
            'reason' => null,
        ];
    }

    public function incrementSoldQuantity(FlashSale $flashSale, int $quantity): void
    {
        $flashSale->increment('sold_quantity', $quantity);
    }

    public function decrementSoldQuantity(FlashSale $flashSale, int $quantity): void
    {
        $flashSale->decrement('sold_quantity', max(0, $quantity));
    }

    public function getFlashSalePrice(Product $product): ?float
    {
        $activeFlashSale = $this->getActiveFlashSaleForProduct($product);

        if ($activeFlashSale) {
            return (float) $activeFlashSale->flash_price;
        }

        return null;
    }

    public function isFlashSaleActive(Product $product): bool
    {
        return $this->getActiveFlashSaleForProduct($product) !== null;
    }

    public function getActiveFlashSaleForProduct(Product $product): ?FlashSale
    {
        return FlashSale::query()
            ->where('product_id', $product->id)
            ->where('is_active', true)
            ->where('starts_at', '<=', now())
            ->where('ends_at', '>', now())
            ->whereRaw('(max_quantity IS NULL OR sold_quantity < max_quantity)')
            ->first();
    }

    public function deactivateExpiredFlashSales(): int
    {
        return FlashSale::query()
            ->where('is_active', true)
            ->where('ends_at', '<', now())
            ->update(['is_active' => false]);
    }

    public function checkOverlappingFlashSales(int $productId, $startsAt, $endsAt, ?int $excludeId = null): bool
    {
        $query = FlashSale::query()
            ->where('product_id', $productId)
            ->where('is_active', true)
            ->where(function ($q) use ($startsAt, $endsAt) {
                $q->whereBetween('starts_at', [$startsAt, $endsAt])
                  ->orWhereBetween('ends_at', [$startsAt, $endsAt])
                  ->orWhere(function ($q2) use ($startsAt, $endsAt) {
                      $q2->where('starts_at', '<=', $startsAt)
                         ->where('ends_at', '>=', $endsAt);
                  });
            });

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }
}
