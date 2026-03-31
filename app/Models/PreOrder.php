<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class PreOrder extends Model
{
    protected $fillable = [
        'user_id',
        'product_id',
        'color_id',
        'size_id',
        'quantity',
        'deposit_amount',
        'remaining_amount',
        'status',
        'estimated_arrival_date',
        'notified_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'deposit_amount' => 'decimal:2',
            'remaining_amount' => 'decimal:2',
            'estimated_arrival_date' => 'date',
            'notified_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function color(): BelongsTo
    {
        return $this->belongsTo(ProductColor::class);
    }

    public function size(): BelongsTo
    {
        return $this->belongsTo(ProductSize::class);
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }

    public function scopeConfirmed(Builder $query): Builder
    {
        return $query->where('status', 'confirmed');
    }

    public function scopeReady(Builder $query): Builder
    {
        return $query->where('status', 'ready');
    }

    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', 'completed');
    }

    public function getTotalAmount(): float
    {
        return $this->deposit_amount + $this->remaining_amount;
    }

    public function isReady(): bool
    {
        return $this->status === 'ready';
    }
}
