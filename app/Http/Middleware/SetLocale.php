<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $this->getPreferredLocale($request);
        
        // Validate locale
        if (!in_array($locale, config('app.available_locales', ['id', 'en']))) {
            $locale = config('app.locale', 'id');
        }
        
        // Set application locale
        App::setLocale($locale);
        
        // Store in session for future requests
        Session::put('locale', $locale);
        
        return $next($request);
    }
    
    /**
     * Get user's preferred locale based on priority
     */
    protected function getPreferredLocale(Request $request): string
    {
        // 1. Check session
        if (Session::has('locale')) {
            return Session::get('locale');
        }
        
        // 2. Check authenticated user's preference
        if ($request->user() && isset($request->user()->locale)) {
            return $request->user()->locale;
        }
        
        // 3. Check cookie
        if ($request->hasCookie('locale')) {
            return $request->cookie('locale');
        }
        
        // 4. Check browser language
        $browserLocale = $this->getBrowserLocale($request);
        if ($browserLocale) {
            return $browserLocale;
        }
        
        // 5. Return default locale
        return config('app.locale', 'id');
    }
    
    /**
     * Get locale from browser's Accept-Language header
     */
    protected function getBrowserLocale(Request $request): ?string
    {
        $acceptLanguage = $request->header('Accept-Language');
        
        if (!$acceptLanguage) {
            return null;
        }
        
        // Parse Accept-Language header
        $languages = explode(',', $acceptLanguage);
        
        foreach ($languages as $language) {
            $locale = strtolower(substr(trim($language), 0, 2));
            
            if (in_array($locale, config('app.available_locales', ['id', 'en']))) {
                return $locale;
            }
        }
        
        return null;
    }
}
