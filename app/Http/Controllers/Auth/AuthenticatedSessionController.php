<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\ActivityLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function __construct(protected ActivityLogService $activityLog)
    {
    }

    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $user = $request->user();

        if (! $user->is_active) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            throw ValidationException::withMessages([
                'email' => 'Akun Anda nonaktif. Hubungi admin.',
            ]);
        }

        if ($user->two_factor_enabled) {
            Auth::guard('web')->logout();

            $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            $encrypted = Crypt::encryptString($code . '|' . now()->addMinutes(10)->timestamp);

            $user->update([
                'two_factor_secret' => $encrypted,
            ]);

            Mail::raw(
                "Your 2FA verification code is: {$code}\n\nThis code will expire in 10 minutes.",
                function ($message) use ($user) {
                    $message->to($user->email)
                        ->subject('Your 2FA Verification Code');
                }
            );

            $request->session()->put('2fa_user_id', $user->id);
            $request->session()->put('2fa_remember', $request->boolean('remember'));

            return redirect()->route('two-factor.verify');
        }

        $user->update([
            'failed_login_attempts' => 0,
            'blocked_until' => null,
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ]);

        $request->session()->regenerate();

        $this->activityLog->log('login', \App\Models\User::class, $user->id);

        return redirect()->intended(route('dashboard', absolute: false));
    }

    public function destroy(Request $request): RedirectResponse
    {
        $this->activityLog->log('logout', \App\Models\User::class, auth()->id());

        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
