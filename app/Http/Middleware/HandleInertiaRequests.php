<?php

namespace App\Http\Middleware;

use App\Models\CartItem;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $isUserRole = $user && $user->role === 'user';

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            'appName' => config('app.name'),
            'cartPreview' => $isUserRole ? function () use ($user) {
                $items = CartItem::query()
                    ->where('user_id', $user->id)
                    ->with('product:id,name,price,emoji,stock')
                    ->latest()
                    ->limit(5)
                    ->get();

                return [
                    'count' => (int) $items->sum('quantity'),
                    'total' => (int) $items->sum(fn ($item) => ($item->product?->price ?? 0) * $item->quantity),
                    'items' => $items,
                ];
            } : null,
        ];
    }
}
