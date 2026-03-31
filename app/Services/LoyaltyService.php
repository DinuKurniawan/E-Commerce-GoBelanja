<?php

namespace App\Services;

use App\Models\User;
use App\Models\LoyaltyPoint;
use App\Models\UserLoyaltyTier;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LoyaltyService
{
    const POINTS_PER_IDR = 10000; // 1 point per 10,000 IDR
    const REDEMPTION_RATE = 10000; // 100 points = 10,000 IDR
    const POINTS_EXPIRY_DAYS = 365;
    
    const TIER_THRESHOLDS = [
        'Bronze' => 0,
        'Silver' => 500,
        'Gold' => 1500,
        'Platinum' => 3000,
    ];
    
    const TIER_DISCOUNTS = [
        'Bronze' => 5,
        'Silver' => 10,
        'Gold' => 15,
        'Platinum' => 20,
    ];

    const BONUS_SIGNUP = 100;
    const BONUS_BIRTHDAY = 200;
    const BONUS_REFERRER = 500;
    const BONUS_REFEREE = 100;

    /**
     * Calculate points from amount
     */
    public function calculatePoints(int $amount): int
    {
        return (int) floor($amount / self::POINTS_PER_IDR);
    }

    /**
     * Award points to a user
     */
    public function awardPoints(
        User $user,
        int $points,
        string $type = 'earned',
        ?string $source = null,
        ?int $orderId = null,
        ?string $description = null
    ): LoyaltyPoint {
        // Create loyalty tier if not exists
        $this->ensureLoyaltyTier($user);

        $expiresAt = $type === 'earned' ? now()->addDays(self::POINTS_EXPIRY_DAYS) : null;

        $loyaltyPoint = LoyaltyPoint::create([
            'user_id' => $user->id,
            'points' => $points,
            'type' => $type,
            'source' => $source,
            'order_id' => $orderId,
            'description' => $description,
            'expires_at' => $expiresAt,
        ]);

        // Update user's loyalty tier
        $loyaltyTier = $user->loyaltyTier;
        $loyaltyTier->total_points += $points;
        $loyaltyTier->lifetime_points += $points;
        $loyaltyTier->save();

        // Check for tier upgrade
        $this->checkTier($user);

        return $loyaltyPoint;
    }

    /**
     * Deduct points from a user
     */
    public function deductPoints(User $user, int $points, string $reason = 'Redeemed'): bool
    {
        $availablePoints = $this->getAvailablePoints($user);

        if ($availablePoints < $points) {
            return false;
        }

        // Create deduction record
        LoyaltyPoint::create([
            'user_id' => $user->id,
            'points' => -$points,
            'type' => 'redeemed',
            'source' => 'redemption',
            'description' => $reason,
        ]);

        // Update total points
        $loyaltyTier = $user->loyaltyTier;
        $loyaltyTier->total_points -= $points;
        $loyaltyTier->save();

        return true;
    }

    /**
     * Check and update user tier
     */
    public function checkTier(User $user): void
    {
        $loyaltyTier = $user->loyaltyTier;
        $currentTier = $loyaltyTier->tier;
        $lifetimePoints = $loyaltyTier->lifetime_points;

        $newTier = $this->determineTier($lifetimePoints);

        if ($newTier !== $currentTier) {
            $this->upgradeTier($user, $newTier);
        }
    }

    /**
     * Determine tier based on lifetime points
     */
    public function determineTier(int $lifetimePoints): string
    {
        if ($lifetimePoints >= self::TIER_THRESHOLDS['Platinum']) {
            return 'Platinum';
        } elseif ($lifetimePoints >= self::TIER_THRESHOLDS['Gold']) {
            return 'Gold';
        } elseif ($lifetimePoints >= self::TIER_THRESHOLDS['Silver']) {
            return 'Silver';
        }
        return 'Bronze';
    }

    /**
     * Upgrade user tier
     */
    public function upgradeTier(User $user, string $newTier): void
    {
        $loyaltyTier = $user->loyaltyTier;
        $oldTier = $loyaltyTier->tier;
        
        $loyaltyTier->tier = $newTier;
        $loyaltyTier->tier_upgraded_at = now();
        $loyaltyTier->save();

        // Create activity log
        LoyaltyPoint::create([
            'user_id' => $user->id,
            'points' => 0,
            'type' => 'bonus',
            'source' => 'tier_upgrade',
            'description' => "Tier upgraded from {$oldTier} to {$newTier}",
        ]);
    }

    /**
     * Generate unique referral code
     */
    public function generateReferralCode(User $user): string
    {
        $loyaltyTier = $this->ensureLoyaltyTier($user);

        if ($loyaltyTier->referral_code) {
            return $loyaltyTier->referral_code;
        }

        do {
            $code = strtoupper(Str::random(8));
        } while (UserLoyaltyTier::where('referral_code', $code)->exists());

        $loyaltyTier->referral_code = $code;
        $loyaltyTier->save();

        return $code;
    }

    /**
     * Process referral when new user signs up
     */
    public function processReferral(string $referralCode, User $newUser): bool
    {
        $referrerTier = UserLoyaltyTier::where('referral_code', $referralCode)->first();

        if (!$referrerTier) {
            return false;
        }

        $referrer = $referrerTier->user;

        // Award points to referrer
        $this->awardPoints(
            $referrer,
            self::BONUS_REFERRER,
            'bonus',
            'referral',
            null,
            "Referral bonus for inviting {$newUser->name}"
        );

        // Award points to referee
        $this->awardPoints(
            $newUser,
            self::BONUS_REFEREE,
            'bonus',
            'referral',
            null,
            "Welcome bonus from referral code {$referralCode}"
        );

        // Update referral count
        $referrerTier->increment('referrals_count');

        // Set referred_by relationship
        $newUser->referred_by = $referrer->id;
        $newUser->save();

        return true;
    }

    /**
     * Expire old points
     */
    public function expirePoints(): int
    {
        $expiredPoints = LoyaltyPoint::where('type', 'earned')
            ->where('expires_at', '<=', now())
            ->whereNotIn('id', function ($query) {
                $query->select('id')
                      ->from('loyalty_points')
                      ->where('type', 'expired');
            })
            ->get();

        $count = 0;
        foreach ($expiredPoints as $point) {
            // Create expiry record
            LoyaltyPoint::create([
                'user_id' => $point->user_id,
                'points' => -$point->points,
                'type' => 'expired',
                'source' => 'expiration',
                'description' => "Points expired from {$point->created_at->format('Y-m-d')}",
            ]);

            // Update user's total points
            $loyaltyTier = User::find($point->user_id)->loyaltyTier;
            if ($loyaltyTier) {
                $loyaltyTier->total_points -= $point->points;
                $loyaltyTier->save();
            }

            $count++;
        }

        return $count;
    }

    /**
     * Get available (non-expired) points for user
     */
    public function getAvailablePoints(User $user): int
    {
        $earnedPoints = LoyaltyPoint::where('user_id', $user->id)
            ->where('type', 'earned')
            ->active()
            ->sum('points');

        $deductedPoints = LoyaltyPoint::where('user_id', $user->id)
            ->whereIn('type', ['redeemed', 'expired'])
            ->sum('points');

        return $earnedPoints + $deductedPoints; // deductedPoints is negative
    }

    /**
     * Calculate discount for user based on tier
     */
    public function calculateDiscount(User $user, int $orderAmount): int
    {
        $loyaltyTier = $user->loyaltyTier;

        if (!$loyaltyTier) {
            return 0;
        }

        $discountPercentage = self::TIER_DISCOUNTS[$loyaltyTier->tier] ?? 0;

        return (int) floor($orderAmount * $discountPercentage / 100);
    }

    /**
     * Calculate discount from redeemed points
     */
    public function calculatePointsDiscount(int $points): int
    {
        return (int) floor($points * self::REDEMPTION_RATE / 100);
    }

    /**
     * Ensure user has loyalty tier record
     */
    public function ensureLoyaltyTier(User $user): UserLoyaltyTier
    {
        $loyaltyTier = $user->loyaltyTier()->first();

        if (!$loyaltyTier) {
            $loyaltyTier = UserLoyaltyTier::create([
                'user_id' => $user->id,
                'tier' => 'Bronze',
                'total_points' => 0,
                'lifetime_points' => 0,
                'total_spent' => 0,
            ]);
            
            // Refresh the user's relationship
            $user->load('loyaltyTier');
        }

        return $loyaltyTier;
    }

    /**
     * Award signup bonus
     */
    public function awardSignupBonus(User $user): void
    {
        $this->awardPoints(
            $user,
            self::BONUS_SIGNUP,
            'bonus',
            'signup',
            null,
            'Welcome bonus for new account'
        );
    }

    /**
     * Award birthday bonus
     */
    public function awardBirthdayBonus(User $user): void
    {
        // Check if already awarded this year
        $alreadyAwarded = LoyaltyPoint::where('user_id', $user->id)
            ->where('source', 'birthday')
            ->whereYear('created_at', now()->year)
            ->exists();

        if (!$alreadyAwarded) {
            $this->awardPoints(
                $user,
                self::BONUS_BIRTHDAY,
                'bonus',
                'birthday',
                null,
                'Happy Birthday bonus!'
            );
        }
    }

    /**
     * Award points for order completion
     */
    public function awardOrderPoints(User $user, int $orderId, int $orderAmount): void
    {
        $points = $this->calculatePoints($orderAmount);

        if ($points > 0) {
            $this->awardPoints(
                $user,
                $points,
                'earned',
                'order',
                $orderId,
                "Points earned from order #{$orderId}"
            );

            // Update total spent
            $loyaltyTier = $user->loyaltyTier;
            $loyaltyTier->total_spent += $orderAmount;
            $loyaltyTier->save();
        }
    }

    /**
     * Get points history for user
     */
    public function getPointsHistory(User $user, ?string $type = null, int $limit = 50)
    {
        $query = LoyaltyPoint::where('user_id', $user->id)
            ->with('order')
            ->orderBy('created_at', 'desc');

        if ($type) {
            $query->where('type', $type);
        }

        return $query->limit($limit)->get();
    }

    /**
     * Get loyalty statistics
     */
    public function getStatistics(): array
    {
        return [
            'total_users' => UserLoyaltyTier::count(),
            'tiers' => [
                'Bronze' => UserLoyaltyTier::where('tier', 'Bronze')->count(),
                'Silver' => UserLoyaltyTier::where('tier', 'Silver')->count(),
                'Gold' => UserLoyaltyTier::where('tier', 'Gold')->count(),
                'Platinum' => UserLoyaltyTier::where('tier', 'Platinum')->count(),
            ],
            'total_points_awarded' => LoyaltyPoint::where('type', 'earned')->sum('points'),
            'total_points_redeemed' => abs(LoyaltyPoint::where('type', 'redeemed')->sum('points')),
            'total_referrals' => UserLoyaltyTier::sum('referrals_count'),
        ];
    }

    /**
     * Check for birthday users and award bonuses
     */
    public function processBirthdayBonuses(): int
    {
        $users = User::whereMonth('birthday', now()->month)
                     ->whereDay('birthday', now()->day)
                     ->with('loyaltyTier')
                     ->get();

        $count = 0;
        foreach ($users as $user) {
            $this->awardBirthdayBonus($user);
            $count++;
        }

        return $count;
    }

    /**
     * Recalculate all user tiers
     */
    public function recalculateAllTiers(): int
    {
        $users = User::with('loyaltyTier')->get();
        $count = 0;

        foreach ($users as $user) {
            if ($user->loyaltyTier) {
                $this->checkTier($user);
                $count++;
            }
        }

        return $count;
    }
}
