<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlockedIp;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IpBlockingController extends Controller
{
    public function __construct(protected ActivityLogService $activityLog)
    {
    }

    public function index()
    {
        $blockedIps = BlockedIp::orderBy('blocked_at', 'desc')->paginate(50);

        return Inertia::render('Admin/Security/BlockedIps', [
            'blockedIps' => $blockedIps,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ip_address' => ['required', 'ip', 'unique:blocked_ips,ip_address'],
            'reason' => ['required', 'string', 'max:500'],
            'expires_at' => ['nullable', 'date', 'after:now'],
        ]);

        $blockedIp = BlockedIp::create([
            'ip_address' => $validated['ip_address'],
            'reason' => $validated['reason'],
            'expires_at' => $validated['expires_at'] ?? null,
            'blocked_at' => now(),
        ]);

        $this->activityLog->log('ip_blocked', BlockedIp::class, $blockedIp->id, null, $validated);

        return back()->with('success', 'IP address has been blocked successfully.');
    }

    public function destroy($id)
    {
        $blockedIp = BlockedIp::findOrFail($id);
        
        $this->activityLog->log('ip_unblocked', BlockedIp::class, $blockedIp->id, [
            'ip_address' => $blockedIp->ip_address,
        ], null);

        $blockedIp->delete();

        return back()->with('success', 'IP address has been unblocked successfully.');
    }
}
