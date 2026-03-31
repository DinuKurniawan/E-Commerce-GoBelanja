<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmailCampaign extends Model
{
    protected $fillable = [
        'name',
        'subject',
        'content',
        'type',
        'recipient_filter',
        'scheduled_at',
        'sent_at',
        'recipients_count',
        'opened_count',
        'clicked_count',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'recipient_filter' => 'json',
            'scheduled_at' => 'datetime',
            'sent_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function scopeDraft(Builder $query): Builder
    {
        return $query->where('status', 'draft');
    }

    public function scopeScheduled(Builder $query): Builder
    {
        return $query->where('status', 'scheduled');
    }

    public function scopeSent(Builder $query): Builder
    {
        return $query->where('status', 'sent');
    }

    public function getOpenRate(): float
    {
        if ($this->recipients_count === 0) {
            return 0;
        }

        return ($this->opened_count / $this->recipients_count) * 100;
    }

    public function getClickRate(): float
    {
        if ($this->recipients_count === 0) {
            return 0;
        }

        return ($this->clicked_count / $this->recipients_count) * 100;
    }

    public function tracking(): HasMany
    {
        return $this->hasMany(EmailCampaignTracking::class);
    }

    public function opens(): HasMany
    {
        return $this->hasMany(EmailCampaignTracking::class)->where('event_type', 'opened');
    }

    public function clicks(): HasMany
    {
        return $this->hasMany(EmailCampaignTracking::class)->where('event_type', 'clicked');
    }
}
