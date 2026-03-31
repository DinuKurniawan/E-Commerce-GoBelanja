<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class CourierService extends Model
{
    protected $fillable = [
        'code',
        'name',
        'service_type',
        'service_name',
        'description',
        'etd',
        'supports_tracking',
        'tracking_url_template',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'supports_tracking' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeWithTracking(Builder $query): Builder
    {
        return $query->where('supports_tracking', true);
    }

    public function scopeByCourier(Builder $query, string $courier): Builder
    {
        return $query->where('code', $courier);
    }

    public function getTrackingUrlForNumber(string $trackingNumber): ?string
    {
        if (!$this->supports_tracking || !$this->tracking_url_template) {
            return null;
        }

        return str_replace('{tracking_number}', $trackingNumber, $this->tracking_url_template);
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->name} {$this->service_type}";
    }

    public function getDisplayNameAttribute(): string
    {
        return "{$this->name} - {$this->service_name}";
    }
}
