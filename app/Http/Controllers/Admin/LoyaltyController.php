<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserLoyaltyTier;
use App\Services\LoyaltyService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LoyaltyController extends Controller
{
    public function __construct(private LoyaltyService $loyaltyService)
    {
    }

    public function index(Request $request)
    {
        $search = $request->input('search');
        $tier = $request->input('tier');
        
        $query = UserLoyaltyTier::with('user')
            ->when($search, function ($q) use ($search) {
                $q->whereHas('user', function ($userQuery) use ($search) {
                    $userQuery->where('name', 'like', "%{$search}%")
                             ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($tier, function ($q) use ($tier) {
                $q->where('tier', $tier);
            });
        
        $users = $query->orderBy('lifetime_points', 'desc')
                      ->paginate(20)
                      ->through(function ($loyaltyTier) {
                          return [
                              'id' => $loyaltyTier->user->id,
                              'name' => $loyaltyTier->user->name,
                              'email' => $loyaltyTier->user->email,
                              'tier' => $loyaltyTier->tier,
                              'total_points' => $loyaltyTier->total_points,
                              'lifetime_points' => $loyaltyTier->lifetime_points,
                              'total_spent' => $loyaltyTier->total_spent,
                              'referrals_count' => $loyaltyTier->referrals_count,
                              'tier_color' => $loyaltyTier->tier_color,
                          ];
                      });
        
        $statistics = $this->loyaltyService->getStatistics();
        
        return Inertia::render('Admin/Loyalty/Index', [
            'users' => $users,
            'statistics' => $statistics,
            'filters' => [
                'search' => $search,
                'tier' => $tier,
            ],
        ]);
    }

    public function adjustPoints(Request $request, $userId)
    {
        $request->validate([
            'points' => 'required|integer',
            'reason' => 'required|string|max:255',
            'type' => 'required|in:add,deduct',
        ]);

        $user = User::findOrFail($userId);
        $points = $request->input('points');
        $reason = $request->input('reason');
        $type = $request->input('type');

        if ($type === 'add') {
            $this->loyaltyService->awardPoints(
                $user,
                $points,
                'bonus',
                'admin_adjustment',
                null,
                $reason
            );
            $message = "Successfully added {$points} points to {$user->name}";
        } else {
            $success = $this->loyaltyService->deductPoints($user, $points, $reason);
            if (!$success) {
                return back()->with('error', 'Failed to deduct points. User may not have enough points.');
            }
            $message = "Successfully deducted {$points} points from {$user->name}";
        }

        return back()->with('success', $message);
    }

    public function statistics()
    {
        $statistics = $this->loyaltyService->getStatistics();
        
        $topUsers = UserLoyaltyTier::with('user')
            ->orderBy('lifetime_points', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($loyaltyTier) {
                return [
                    'name' => $loyaltyTier->user->name,
                    'tier' => $loyaltyTier->tier,
                    'lifetime_points' => $loyaltyTier->lifetime_points,
                    'total_spent' => $loyaltyTier->total_spent,
                ];
            });
        
        return Inertia::render('Admin/Loyalty/Statistics', [
            'statistics' => $statistics,
            'topUsers' => $topUsers,
        ]);
    }
}
