<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'user_id',
    'promotion_id',
    'promotion_code',
    'order_number',
    'total_amount',
    'discount_amount',
    'subtotal_before_discount',
    'applied_promotions',
    'free_shipping_applied',
    'status',
    'shipping_courier',
    'courier_code',
    'courier_service',
    'shipping_cost',
    'has_insurance',
    'insurance_cost',
    'estimated_delivery',
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
            'discount_amount' => 'integer',
            'subtotal_before_discount' => 'integer',
            'shipping_cost' => 'integer',
            'insurance_cost' => 'integer',
            'applied_promotions' => 'array',
            'free_shipping_applied' => 'boolean',
            'has_insurance' => 'boolean',
            'shipping_address' => 'string',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function promotion(): BelongsTo
    {
        return $this->belongsTo(Promotion::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function deliverySchedule(): HasOne
    {
        return $this->hasOne(DeliverySchedule::class);
    }

    public function loyaltyPoints(): HasMany
    {
        return $this->hasMany(LoyaltyPoint::class);
    }

    public function stockHistory(): HasMany
    {
        return $this->hasMany(StockHistory::class);
    }

    public function returnRequests(): HasMany
    {
        return $this->hasMany(ReturnRequest::class)->latest();
    }

    public function promotionUsages(): HasMany
    {
        return $this->hasMany(PromotionUsage::class);
    }

    public function trackingEvents(): HasMany
    {
        return $this->hasMany(TrackingEvent::class)->orderBy('event_time', 'desc');
    }

    public function courierService(): BelongsTo
    {
        return $this->belongsTo(CourierService::class, 'courier_code', 'code');
    }
}
