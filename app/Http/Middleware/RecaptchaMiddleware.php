<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class RecaptchaMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!config('services.recaptcha.enabled', false)) {
            return $next($request);
        }

        $recaptchaToken = $request->input('recaptcha_token');

        if (!$recaptchaToken) {
            throw ValidationException::withMessages([
                'recaptcha' => 'reCAPTCHA verification is required.',
            ]);
        }

        $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
            'secret' => config('services.recaptcha.secret_key'),
            'response' => $recaptchaToken,
            'remoteip' => $request->ip(),
        ]);

        $result = $response->json();

        if (!$result['success'] || ($result['score'] ?? 1) < 0.5) {
            throw ValidationException::withMessages([
                'recaptcha' => 'reCAPTCHA verification failed. Please try again.',
            ]);
        }

        return $next($request);
    }
}
