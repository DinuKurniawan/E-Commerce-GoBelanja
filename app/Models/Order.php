<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'user_id',
    'order_number',
    'total_amount',
    'status',
    'shipping_courier',
    'tracking_number',
    'shipping_address',
    'payment_status',
    'notes',
    'delivery_proof',
])]
class Order extends Model
{
    protected function casts(): array
    {
        return [
            'total_amount' => 'integer',
            'shipping_address' => 'string',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }
}
