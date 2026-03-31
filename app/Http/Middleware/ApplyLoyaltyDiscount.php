<?php

namespace App\Http\Middleware;

use App\Services\LoyaltyService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApplyLoyaltyDiscount
{
    public function __construct(private LoyaltyService $loyaltyService)
    {
    }

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->check()) {
            $user = auth()->user()->load('loyaltyTier');
            
            if ($user->loyaltyTier) {
                $request->merge([
                    'loyalty_tier' => $user->loyaltyTier->tier,
                    'loyalty_discount_percentage' => $user->loyaltyTier->tier_discount,
                    'available_points' => $this->loyaltyService->getAvailablePoints($user),
                ]);
            }
        }

        return $next($request);
    }
}
