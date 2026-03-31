<?php

namespace App\Listeners;

use App\Events\UserRegistered;
use App\Services\LoyaltyService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class AwardSignupBonus implements ShouldQueue
{
    use InteractsWithQueue;

    public function __construct(private LoyaltyService $loyaltyService)
    {
    }

    public function handle(UserRegistered $event): void
    {
        $user = $event->user;
        
        // Award signup bonus
        $this->loyaltyService->awardSignupBonus($user);
        
        // Process referral if code provided
        if ($event->referralCode) {
            $this->loyaltyService->processReferral($event->referralCode, $user);
        }
        
        // Generate referral code for new user
        $this->loyaltyService->generateReferralCode($user);
    }
}
