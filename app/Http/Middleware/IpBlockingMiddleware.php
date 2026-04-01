<?php

namespace App\Http\Middleware;

use App\Models\BlockedIp;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\HttpFoundation\Response;

class IpBlockingMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!Schema::hasTable('blocked_ips')) {
            return $next($request);
        }

        $ip = $request->ip();

        $blockedIp = BlockedIp::where('ip_address', $ip)->first();

        if ($blockedIp) {
            if ($blockedIp->isExpired()) {
                $blockedIp->delete();
            } elseif ($blockedIp->isActive()) {
                abort(403, 'Your IP address has been blocked. Reason: ' . $blockedIp->reason);
            }
        }

        return $next($request);
    }
}
