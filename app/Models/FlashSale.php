<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'product_id',
    'name',
    'discount_percent',
    'flash_price',
    'max_quantity',
    'sold_quantity',
    'starts_at',
    'ends_at',
    'is_active',
])]
class FlashSale extends Model
{
    protected function casts(): array
    {
        return [
            'discount_percent' => 'decimal:2',
            'flash_price' => 'decimal:2',
            'max_quantity' => 'integer',
            'sold_quantity' => 'integer',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function isActive(): bool
    {
        return $this->is_active 
            && now()->between($this->starts_at, $this->ends_at)
            && ($this->max_quantity === null || $this->sold_quantity < $this->max_quantity);
    }

    public function hasEnded(): bool
    {
        return now()->greaterThan($this->ends_at);
    }

    public function hasStarted(): bool
    {
        return now()->greaterThanOrEqualTo($this->starts_at);
    }

    public function isSoldOut(): bool
    {
        return $this->max_quantity !== null && $this->sold_quantity >= $this->max_quantity;
    }

    public function getRemainingQuantityAttribute(): ?int
    {
        if ($this->max_quantity === null) {
            return null;
        }

        return max(0, $this->max_quantity - $this->sold_quantity);
    }

    public function getProgressPercentAttribute(): float
    {
        if ($this->max_quantity === null || $this->max_quantity === 0) {
            return 0;
        }

        return round(($this->sold_quantity / $this->max_quantity) * 100, 2);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where('starts_at', '<=', now())
            ->where('ends_at', '>=', now());
    }

    public function scopeUpcoming($query)
    {
        return $query->where('is_active', true)
            ->where('starts_at', '>', now());
    }

    public function scopeAvailable($query)
    {
        return $query->where('is_active', true)
            ->where('starts_at', '<=', now())
            ->where('ends_at', '>=', now())
            ->where(function ($q) {
                $q->whereNull('max_quantity')
                    ->orWhereRaw('sold_quantity < max_quantity');
            });
    }
}
