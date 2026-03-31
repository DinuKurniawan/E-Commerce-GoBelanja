<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Services\LoyaltyService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LoyaltyController extends Controller
{
    public function __construct(private LoyaltyService $loyaltyService)
    {
    }

    public function index()
    {
        $user = auth()->user()->load('loyaltyTier');
        $loyaltyTier = $user->loyaltyTier ?? $this->loyaltyService->ensureLoyaltyTier($user);
        
        $availablePoints = $this->loyaltyService->getAvailablePoints($user);
        $recentHistory = $this->loyaltyService->getPointsHistory($user, null, 10);
        
        return Inertia::render('User/Loyalty/Dashboard', [
            'loyaltyTier' => $loyaltyTier->append(['tier_discount', 'next_tier', 'points_to_next_tier', 'tier_color']),
            'availablePoints' => $availablePoints,
            'recentHistory' => $recentHistory,
            'referralCode' => $loyaltyTier->referral_code,
        ]);
    }

    public function history(Request $request)
    {
        $user = auth()->user();
        $type = $request->input('type');
        
        $history = $this->loyaltyService->getPointsHistory($user, $type, 100);
        
        return Inertia::render('User/Loyalty/History', [
            'history' => $history,
            'filterType' => $type,
        ]);
    }

    public function redeem(Request $request)
    {
        $request->validate([
            'points' => 'required|integer|min:100|multiple_of:100',
        ]);

        $user = auth()->user();
        $points = $request->input('points');
        
        $availablePoints = $this->loyaltyService->getAvailablePoints($user);
        
        if ($availablePoints < $points) {
            return back()->with('error', 'Insufficient points. You have ' . $availablePoints . ' points available.');
        }

        $success = $this->loyaltyService->deductPoints(
            $user,
            $points,
            "Redeemed {$points} points for discount"
        );

        if ($success) {
            $discount = $this->loyaltyService->calculatePointsDiscount($points);
            return back()->with('success', "Successfully redeemed {$points} points for " . number_format($discount) . " IDR discount!");
        }

        return back()->with('error', 'Failed to redeem points. Please try again.');
    }

    public function referral()
    {
        $user = auth()->user()->load('loyaltyTier', 'referrals.loyaltyTier');
        $loyaltyTier = $user->loyaltyTier ?? $this->loyaltyService->ensureLoyaltyTier($user);
        
        $referralCode = $loyaltyTier->referral_code ?? $this->loyaltyService->generateReferralCode($user);
        
        $referrals = $user->referrals->map(function ($referral) {
            return [
                'id' => $referral->id,
                'name' => $referral->name,
                'email' => $referral->email,
                'joined_at' => $referral->created_at,
                'tier' => $referral->loyaltyTier?->tier ?? 'Bronze',
            ];
        });
        
        return Inertia::render('User/Loyalty/Referral', [
            'referralCode' => $referralCode,
            'referralsCount' => $loyaltyTier->referrals_count,
            'referrals' => $referrals,
            'bonusAmount' => LoyaltyService::BONUS_REFERRER,
        ]);
    }
}
