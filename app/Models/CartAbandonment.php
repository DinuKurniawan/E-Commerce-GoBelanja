<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartAbandonment extends Model
{
    protected $fillable = [
        'user_id',
        'session_id',
        'cart_value',
        'items_count',
        'cart_items',
        'abandoned_at',
        'recovered_at',
        'recovered_order_id',
        'abandonment_stage',
        'recovery_method',
    ];

    protected function casts(): array
    {
        return [
            'cart_items' => 'array',
            'abandoned_at' => 'datetime',
            'recovered_at' => 'datetime',
            'cart_value' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function recoveredOrder(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'recovered_order_id');
    }
}
