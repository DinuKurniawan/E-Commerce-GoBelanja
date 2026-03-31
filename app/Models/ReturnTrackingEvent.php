<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'return_request_id',
    'status',
    'status_label',
    'description',
    'actor_type',
    'event_time',
])]
class ReturnTrackingEvent extends Model
{
    protected function casts(): array
    {
        return [
            'event_time' => 'datetime',
        ];
    }

    public function returnRequest(): BelongsTo
    {
        return $this->belongsTo(ReturnRequest::class);
    }
}
