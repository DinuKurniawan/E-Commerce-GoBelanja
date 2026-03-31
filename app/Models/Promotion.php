<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Promotion extends Model
{
    protected $fillable = [
        'name',
        'code',
        'promotion_type',
        'discount_percent',
        'minimum_purchase',
        'expires_at',
        'is_active',
        'buy_quantity',
        'get_quantity',
        'get_discount_percent',
        'bundle_products',
        'bundle_price',
        'category_id',
        'tier_levels',
        'shipping_free_above',
        'shipping_courier',
        'shipping_regions',
        'applies_to',
        'applicable_product_ids',
        'usage_limit',
        'usage_count',
        'per_user_limit',
        'max_discount_amount',
        'can_stack',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'expires_at' => 'datetime',
            'bundle_products' => 'array',
            'tier_levels' => 'array',
            'shipping_regions' => 'array',
            'applicable_product_ids' => 'array',
            'can_stack' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function usages(): HasMany
    {
        return $this->hasMany(PromotionUsage::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    // Scope methods for each type
    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true)
              ->where(function ($q) {
                  $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
              });
    }

    public function scopeVoucher(Builder $query): void
    {
        $query->where('promotion_type', 'voucher');
    }

    public function scopeBogo(Builder $query): void
    {
        $query->where('promotion_type', 'bogo');
    }

    public function scopeBundle(Builder $query): void
    {
        $query->where('promotion_type', 'bundle');
    }

    public function scopeFreeShipping(Builder $query): void
    {
        $query->where('promotion_type', 'free_shipping');
    }

    public function scopeCategory(Builder $query): void
    {
        $query->where('promotion_type', 'category');
    }

    public function scopeTiered(Builder $query): void
    {
        $query->where('promotion_type', 'tiered');
    }

    public function scopeFirstPurchase(Builder $query): void
    {
        $query->where('promotion_type', 'first_purchase');
    }

    public function scopeBulk(Builder $query): void
    {
        $query->where('promotion_type', 'bulk');
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function isUsageLimitReached(): bool
    {
        return $this->usage_limit && $this->usage_count >= $this->usage_limit;
    }

    public function getUserUsageCount(int $userId): int
    {
        return $this->usages()->where('user_id', $userId)->count();
    }

    public function canBeUsedByUser(int $userId): bool
    {
        if (!$this->per_user_limit) {
            return true;
        }

        return $this->getUserUsageCount($userId) < $this->per_user_limit;
    }

    public function isValid(): bool
    {
        return $this->is_active && !$this->isExpired() && !$this->isUsageLimitReached();
    }

    public function incrementUsageCount(): void
    {
        $this->increment('usage_count');
    }
}
