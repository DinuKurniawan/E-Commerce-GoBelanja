<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\PageView;
use Illuminate\Support\Str;

class TrackPageViews
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only track GET requests
        if ($request->isMethod('get') && !$request->ajax()) {
            $path = $request->path();
            
            // Determine page type and ID
            $pageType = 'other';
            $pageId = null;
            
            if (Str::startsWith($path, 'products/') || Str::contains($path, '/products/')) {
                $pageType = 'product';
                // Extract product ID from URL if possible
                if (preg_match('/products\/(\d+)/', $path, $matches)) {
                    $pageId = $matches[1];
                }
            } elseif (Str::startsWith($path, 'categories/') || Str::contains($path, '/categories/')) {
                $pageType = 'category';
            } elseif ($path === '/' || $path === 'home') {
                $pageType = 'home';
            } elseif (Str::contains($path, 'cart')) {
                $pageType = 'cart';
            } elseif (Str::contains($path, 'checkout')) {
                $pageType = 'checkout';
            }
            
            // Track the page view asynchronously (optional, can be queued)
            try {
                PageView::create([
                    'user_id' => auth()->id(),
                    'session_id' => session()->getId(),
                    'page_type' => $pageType,
                    'page_id' => $pageId,
                    'url' => $request->fullUrl(),
                    'referrer' => $request->header('referer'),
                    'user_agent' => $request->userAgent(),
                    'ip_address' => $request->ip(),
                ]);
            } catch (\Exception $e) {
                // Silently fail if tracking fails
                \Log::error('Page view tracking failed: ' . $e->getMessage());
            }
        }

        return $next($request);
    }
}
