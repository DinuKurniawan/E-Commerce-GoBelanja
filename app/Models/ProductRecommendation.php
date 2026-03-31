<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class ProductRecommendation extends Model
{
    protected $fillable = [
        'product_id',
        'recommended_product_id',
        'type',
        'score',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function recommendedProduct(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'recommended_product_id');
    }

    public function scopeFrequentlyBought(Builder $query): Builder
    {
        return $query->where('type', 'frequently_bought');
    }

    public function scopeAlsoViewed(Builder $query): Builder
    {
        return $query->where('type', 'also_viewed');
    }

    public function scopeSimilar(Builder $query): Builder
    {
        return $query->where('type', 'similar');
    }

    public function scopePersonalized(Builder $query): Builder
    {
        return $query->where('type', 'personalized');
    }

    public function scopeHighScore(Builder $query): Builder
    {
        return $query->orderBy('score', 'desc');
    }
}
