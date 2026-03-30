<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\Payment;
use App\Models\UserAddress;
use App\Models\UserNotification;
use App\Models\Wishlist;
use Inertia\Inertia;
use Inertia\Response;

class UserDashboardController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();

        $totalOrders = Order::query()
            ->where('user_id', $user->id)
            ->count();

        $lastOrder = Order::query()
            ->where('user_id', $user->id)
            ->latest()
            ->first();

        $wishlistCount = Wishlist::query()
            ->where('user_id', $user->id)
            ->count();

        $cartCount = CartItem::query()
            ->where('user_id', $user->id)
            ->sum('quantity');

        $unreadNotifications = UserNotification::query()
            ->where('user_id', $user->id)
            ->where('is_read', false)
            ->count();

        $pendingPayments = Payment::query()
            ->whereHas('order', fn ($query) => $query->where('user_id', $user->id))
            ->where('status', 'pending')
            ->count();

        $defaultAddress = UserAddress::query()
            ->where('user_id', $user->id)
            ->where('is_default', true)
            ->first();

        $recentOrders = Order::query()
            ->where('user_id', $user->id)
            ->latest()
            ->limit(5)
            ->get(['id', 'order_number', 'status', 'total_amount', 'payment_status', 'created_at']);

        return Inertia::render('User/Dashboard', [
            'overview' => [
                'totalOrders' => $totalOrders,
                'latestOrderStatus' => $lastOrder?->status,
                'latestOrderNumber' => $lastOrder?->order_number,
                'wishlistCount' => $wishlistCount,
                'cartCount' => (int) $cartCount,
                'unreadNotifications' => (int) $unreadNotifications,
                'pendingPayments' => (int) $pendingPayments,
                'hasDefaultAddress' => (bool) $defaultAddress,
            ],
            'recentOrders' => $recentOrders,
        ]);
    }
}
