<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'store_name',
    'store_logo',
    'payment_method',
    'bank_accounts',
    'api_key',
    'origin_city_id',
    'origin_city_name',
    'whatsapp_number',
])]
class StoreSetting extends Model
{
    protected $table = 'store_settings';

    protected $casts = [
        'bank_accounts' => 'array',
    ];
}
