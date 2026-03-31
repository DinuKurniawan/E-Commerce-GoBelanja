<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class LocaleController extends Controller
{
    /**
     * Change application locale
     */
    public function setLocale(Request $request)
    {
        $request->validate([
            'locale' => 'required|in:id,en',
        ]);

        $locale = $request->input('locale');
        
        // Set in session
        Session::put('locale', $locale);
        
        // Set in app
        App::setLocale($locale);
        
        // If user is authenticated, update their preference
        if ($request->user()) {
            $request->user()->update([
                'locale' => $locale,
            ]);
        }
        
        // Return success response for AJAX calls
        return response()->json([
            'success' => true,
            'locale' => $locale,
            'message' => __('general.success'),
        ]);
    }
    
    /**
     * Get current locale
     */
    public function getLocale()
    {
        return response()->json([
            'locale' => App::getLocale(),
            'available_locales' => config('app.available_locales'),
            'locale_names' => config('app.locale_names'),
        ]);
    }
}
