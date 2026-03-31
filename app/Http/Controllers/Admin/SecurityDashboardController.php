<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\BlockedIp;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SecurityDashboardController extends Controller
{
    public function index()
    {
        $recentFailedLogins = User::where('failed_login_attempts', '>', 0)
            ->orWhere('blocked_until', '>', now())
            ->orderBy('failed_login_attempts', 'desc')
            ->limit(10)
            ->get(['id', 'name', 'email', 'failed_login_attempts', 'blocked_until', 'last_login_ip']);

        $blockedIpsCount = BlockedIp::where(function ($query) {
            $query->whereNull('expires_at')
                ->orWhere('expires_at', '>', now());
        })->count();

        $recentActivityLogs = ActivityLog::with('user:id,name,email')
            ->whereIn('action', ['login', 'login_with_2fa', 'logout'])
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        $suspiciousActivity = ActivityLog::where('created_at', '>=', now()->subHours(24))
            ->selectRaw('ip_address, COUNT(*) as count')
            ->groupBy('ip_address')
            ->having('count', '>', 50)
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        $twoFactorStats = [
            'enabled' => User::where('two_factor_enabled', true)->count(),
            'total' => User::count(),
            'percentage' => User::count() > 0 ? round((User::where('two_factor_enabled', true)->count() / User::count()) * 100, 2) : 0,
        ];

        $recommendations = [];

        if ($twoFactorStats['percentage'] < 50) {
            $recommendations[] = [
                'type' => 'warning',
                'message' => 'Less than 50% of users have enabled 2FA. Consider encouraging users to enable it.',
            ];
        }

        if ($suspiciousActivity->count() > 0) {
            $recommendations[] = [
                'type' => 'danger',
                'message' => 'Suspicious activity detected from multiple IP addresses. Review the activity logs.',
            ];
        }

        if ($recentFailedLogins->count() > 5) {
            $recommendations[] = [
                'type' => 'warning',
                'message' => 'Multiple failed login attempts detected. Monitor for brute force attacks.',
            ];
        }

        return Inertia::render('Admin/Security/Dashboard', [
            'recentFailedLogins' => $recentFailedLogins,
            'blockedIpsCount' => $blockedIpsCount,
            'recentActivityLogs' => $recentActivityLogs,
            'suspiciousActivity' => $suspiciousActivity,
            'twoFactorStats' => $twoFactorStats,
            'recommendations' => $recommendations,
        ]);
    }
}
