<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class DeliverySchedule extends Model
{
    protected $fillable = [
        'order_id',
        'delivery_date',
        'time_slot',
        'is_same_day',
        'special_instructions',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'delivery_date' => 'date',
            'is_same_day' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function scopeScheduled(Builder $query): Builder
    {
        return $query->where('status', 'scheduled');
    }

    public function scopeInTransit(Builder $query): Builder
    {
        return $query->where('status', 'in_transit');
    }

    public function scopeDelivered(Builder $query): Builder
    {
        return $query->where('status', 'delivered');
    }

    public function scopeToday(Builder $query): Builder
    {
        return $query->whereDate('delivery_date', today());
    }

    public function scopeSameDay(Builder $query): Builder
    {
        return $query->where('is_same_day', true);
    }

    public function isDelivered(): bool
    {
        return $this->status === 'delivered';
    }
}
