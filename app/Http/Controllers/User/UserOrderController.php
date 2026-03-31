<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class UserOrderController extends Controller
{
    public function index(): Response
    {
        $orders = Order::query()
            ->where('user_id', auth()->id())
            ->with(['items.product:id,name,slug,image_url,emoji', 'payment', 'deliverySchedule', 'returnRequests'])
            ->latest()
            ->get();

        return Inertia::render('User/Orders/Index', [
            'orders' => $orders,
            'orderSummary' => [
                'pending'    => (int) Order::query()->where('user_id', auth()->id())->where('status', 'pending')->count(),
                'processing' => (int) Order::query()->where('user_id', auth()->id())->where('status', 'diproses')->count(),
                'shipping'   => (int) Order::query()->where('user_id', auth()->id())->where('status', 'dikirim')->count(),
                'completed'  => (int) Order::query()->where('user_id', auth()->id())->where('status', 'selesai')->count(),
            ],
        ]);
    }

    public function show(Order $order): Response
    {
        abort_unless($order->user_id === auth()->id(), 403);

        $order->load([
            'items.product:id,name,slug,image_url,emoji',
            'payment',
            'deliverySchedule',
            'returnRequests.items',
            'returnRequests.trackingEvents',
        ]);

        // Load user's existing reviews for products in this order
        $productIds = $order->items->pluck('product_id');
        $userReviews = Review::query()
            ->where('user_id', auth()->id())
            ->whereIn('product_id', $productIds)
            ->get(['id', 'product_id', 'rating', 'comment'])
            ->keyBy('product_id');

        return Inertia::render('User/Orders/Show', [
            'order'          => $order,
            'userReviews'    => $userReviews,
            'returnRequests' => $order->returnRequests,
        ]);
    }

    public function uploadDeliveryProof(Order $order): RedirectResponse
    {
        abort_unless($order->user_id === auth()->id(), 403);
        abort_unless($order->status === 'selesai', 403);

        request()->validate([
            'delivery_proof' => 'required|image|max:3072',
        ]);

        if ($order->delivery_proof) {
            $old = str_replace('/storage/', '', $order->delivery_proof);
            if (Storage::disk('public')->exists($old)) {
                Storage::disk('public')->delete($old);
            }
        }

        $path = request()->file('delivery_proof')->store('delivery-proofs', 'public');
        $order->update(['delivery_proof' => Storage::url($path)]);

        return back()->with('success', 'Bukti penerimaan paket berhasil diupload.');
    }
}
