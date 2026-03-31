<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class StockHistory extends Model
{
    protected $table = 'stock_history';

    protected $fillable = [
        'product_id',
        'quantity_change',
        'quantity_before',
        'quantity_after',
        'type',
        'reason',
        'order_id',
        'user_id',
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

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeSale(Builder $query): Builder
    {
        return $query->where('type', 'sale');
    }

    public function scopeRestock(Builder $query): Builder
    {
        return $query->where('type', 'restock');
    }

    public function scopeAdjustment(Builder $query): Builder
    {
        return $query->where('type', 'adjustment');
    }

    public function scopeReturn(Builder $query): Builder
    {
        return $query->where('type', 'return');
    }
}
