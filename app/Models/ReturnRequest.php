<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'user_id',
    'order_id',
    'request_number',
    'status',
    'refund_status',
    'reason',
    'customer_notes',
    'admin_notes',
    'evidence_image',
    'refund_amount',
    'refund_reference',
    'requested_at',
    'approved_at',
    'received_at',
    'refunded_at',
    'completed_at',
])]
class ReturnRequest extends Model
{
    protected function casts(): array
    {
        return [
            'refund_amount' => 'integer',
            'requested_at' => 'datetime',
            'approved_at' => 'datetime',
            'received_at' => 'datetime',
            'refunded_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(ReturnRequestItem::class);
    }

    public function trackingEvents(): HasMany
    {
        return $this->hasMany(ReturnTrackingEvent::class)->orderBy('event_time');
    }
}
