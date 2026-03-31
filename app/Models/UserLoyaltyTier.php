<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable([
    'user_id',
    'tier',
    'total_points',
    'lifetime_points',
    'total_spent',
    'referral_code',
    'referrals_count',
    'tier_upgraded_at',
])]
class UserLoyaltyTier extends Model
{
    protected function casts(): array
    {
        return [
            'total_points' => 'integer',
            'lifetime_points' => 'integer',
            'total_spent' => 'decimal:2',
            'referrals_count' => 'integer',
            'tier_upgraded_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getTierDiscountAttribute(): int
    {
        return match($this->tier) {
            'Bronze' => 5,
            'Silver' => 10,
            'Gold' => 15,
            'Platinum' => 20,
            default => 0,
        };
    }

    public function getNextTierAttribute(): ?string
    {
        return match($this->tier) {
            'Bronze' => 'Silver',
            'Silver' => 'Gold',
            'Gold' => 'Platinum',
            'Platinum' => null,
            default => 'Bronze',
        };
    }

    public function getPointsToNextTierAttribute(): ?int
    {
        return match($this->tier) {
            'Bronze' => 500 - $this->lifetime_points,
            'Silver' => 1500 - $this->lifetime_points,
            'Gold' => 3000 - $this->lifetime_points,
            'Platinum' => null,
            default => 500,
        };
    }

    public function getTierColorAttribute(): string
    {
        return match($this->tier) {
            'Bronze' => 'amber',
            'Silver' => 'gray',
            'Gold' => 'yellow',
            'Platinum' => 'purple',
            default => 'gray',
        };
    }
}
