<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'user_id',
    'label',
    'recipient_name',
    'phone',
    'province_id',
    'province_name',
    'city_id',
    'city_name',
    'district_id',
    'district_name',
    'village_name',
    'postal_code',
    'rajaongkir_city_id',
    'full_address',
    'is_default',
])]
class UserAddress extends Model
{
    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
