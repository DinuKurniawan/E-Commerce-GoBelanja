<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class CheckAccountBlocked
{
    public function handle(Request $request, Closure $next): Response
    {
        $email = $request->input('email');
        
        if (!$email) {
            return $next($request);
        }

        $user = \App\Models\User::where('email', $email)->first();

        if ($user && $user->blocked_until && $user->blocked_until->isFuture()) {
            $minutesRemaining = now()->diffInMinutes($user->blocked_until);
            
            throw ValidationException::withMessages([
                'email' => "Too many failed login attempts. Account is locked. Please try again in {$minutesRemaining} minutes.",
            ]);
        }

        return $next($request);
    }
}
