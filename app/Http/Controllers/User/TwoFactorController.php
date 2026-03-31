<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class TwoFactorController extends Controller
{
    public function __construct(protected ActivityLogService $activityLog)
    {
    }

    public function index()
    {
        $user = auth()->user();

        return Inertia::render('User/Security/TwoFactor', [
            'two_factor_enabled' => $user->two_factor_enabled,
        ]);
    }

    public function enable(Request $request)
    {
        $user = auth()->user();

        if ($user->two_factor_enabled) {
            return back()->with('error', '2FA is already enabled for your account.');
        }

        $user->two_factor_enabled = true;
        $user->save();

        $this->activityLog->log('2fa_enabled', User::class, $user->id);

        return back()->with('success', '2FA has been enabled. You will receive a code on your next login.');
    }

    public function disable(Request $request)
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = auth()->user();

        $user->update([
            'two_factor_enabled' => false,
            'two_factor_secret' => null,
            'two_factor_verified_at' => null,
        ]);

        $this->activityLog->log('2fa_disabled', User::class, $user->id);

        return back()->with('success', '2FA has been disabled for your account.');
    }

    public function sendCode()
    {
        $user = auth()->user();

        if (!$user->two_factor_enabled) {
            return back()->with('error', '2FA is not enabled for your account.');
        }

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

        return back()->with('success', 'Verification code sent to your email.');
    }

    public function verify(Request $request)
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ]);

        $user = auth()->user();

        if (!$user->two_factor_secret) {
            throw ValidationException::withMessages([
                'code' => 'No verification code found. Please request a new code.',
            ]);
        }

        try {
            $decrypted = Crypt::decryptString($user->two_factor_secret);
            [$storedCode, $expiresAt] = explode('|', $decrypted);

            if (now()->timestamp > $expiresAt) {
                throw ValidationException::withMessages([
                    'code' => 'Verification code has expired. Please request a new code.',
                ]);
            }

            if ($request->code !== $storedCode) {
                $user->increment('failed_login_attempts');

                if ($user->failed_login_attempts >= 3) {
                    $user->update([
                        'two_factor_secret' => null,
                        'failed_login_attempts' => 0,
                    ]);

                    throw ValidationException::withMessages([
                        'code' => 'Too many failed attempts. Please request a new code.',
                    ]);
                }

                throw ValidationException::withMessages([
                    'code' => 'Invalid verification code.',
                ]);
            }

            $user->update([
                'two_factor_verified_at' => now(),
                'two_factor_secret' => null,
                'failed_login_attempts' => 0,
            ]);

            $this->activityLog->log('2fa_verified', User::class, $user->id);

            if ($request->session()->get('2fa_pending_login')) {
                $request->session()->forget('2fa_pending_login');
                return redirect()->intended(route('dashboard'));
            }

            return back()->with('success', 'Verification successful.');
        } catch (\Exception $e) {
            throw ValidationException::withMessages([
                'code' => 'Invalid verification code.',
            ]);
        }
    }

    public function verifyLogin(Request $request)
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ]);

        $userId = $request->session()->get('2fa_user_id');

        if (!$userId) {
            throw ValidationException::withMessages([
                'code' => 'Session expired. Please login again.',
            ]);
        }

        $user = User::find($userId);

        if (!$user || !$user->two_factor_secret) {
            throw ValidationException::withMessages([
                'code' => 'No verification code found. Please login again.',
            ]);
        }

        try {
            $decrypted = Crypt::decryptString($user->two_factor_secret);
            [$storedCode, $expiresAt] = explode('|', $decrypted);

            if (now()->timestamp > $expiresAt) {
                throw ValidationException::withMessages([
                    'code' => 'Verification code has expired. Please login again.',
                ]);
            }

            if ($request->code !== $storedCode) {
                $user->increment('failed_login_attempts');

                if ($user->failed_login_attempts >= 3) {
                    $user->update([
                        'two_factor_secret' => null,
                        'blocked_until' => now()->addMinutes(15),
                        'failed_login_attempts' => 0,
                    ]);

                    $request->session()->forget(['2fa_user_id', '2fa_remember']);

                    throw ValidationException::withMessages([
                        'code' => 'Too many failed attempts. Account locked for 15 minutes.',
                    ]);
                }

                throw ValidationException::withMessages([
                    'code' => 'Invalid verification code. ' . (3 - $user->failed_login_attempts) . ' attempts remaining.',
                ]);
            }

            $user->update([
                'two_factor_secret' => null,
                'failed_login_attempts' => 0,
                'last_login_at' => now(),
                'last_login_ip' => $request->ip(),
            ]);

            auth()->login($user, $request->session()->get('2fa_remember', false));

            $request->session()->forget(['2fa_user_id', '2fa_remember']);
            $request->session()->regenerate();

            $this->activityLog->log('login_with_2fa', User::class, $user->id);

            return redirect()->intended(route('dashboard'));
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            throw ValidationException::withMessages([
                'code' => 'Invalid verification code.',
            ]);
        }
    }

    public function resendLoginCode(Request $request)
    {
        $userId = $request->session()->get('2fa_user_id');

        if (!$userId) {
            return back()->with('error', 'Session expired. Please login again.');
        }

        $user = User::find($userId);

        if (!$user) {
            return back()->with('error', 'User not found. Please login again.');
        }

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

        return back()->with('success', 'New verification code sent to your email.');
    }

    public function showVerifyForm()
    {
        $userId = session('2fa_user_id');

        if (!$userId) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/TwoFactorVerify');
    }
}
