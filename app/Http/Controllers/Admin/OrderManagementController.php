<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Models\UserNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderManagementController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Orders', [
            'orders'   => Order::query()
                ->with(['user:id,name,email', 'payment'])
                ->latest()
                ->get(),
            'statuses' => ['pending', 'diproses', 'dikirim', 'selesai'],
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status'          => 'required|in:pending,diproses,dikirim,selesai',
            'tracking_number' => 'nullable|string|max:255',
        ]);

        $order->update([
            'status'          => $validated['status'],
            'tracking_number' => $validated['tracking_number'] ?? $order->tracking_number,
        ]);

        return back()->with('success', 'Status order berhasil diperbarui.');
    }

    public function verifyPayment(Request $request, Order $order)
    {
        $validated = $request->validate([
            'action' => 'required|in:approve,reject',
        ]);

        $payment = $order->payment;

        if (! $payment) {
            return back()->withErrors(['payment' => 'Data pembayaran tidak ditemukan.']);
        }

        if ($validated['action'] === 'approve') {
            $payment->update([
                'status' => 'paid',
                'paid_at' => now(),
            ]);
            $order->update(['payment_status' => 'paid']);

            UserNotification::query()->create([
                'user_id' => $order->user_id,
                'type'    => 'payment',
                'title'   => 'Pembayaran dikonfirmasi',
                'message' => "Pembayaran untuk pesanan {$order->order_number} telah dikonfirmasi oleh admin.",
                'is_read' => false,
            ]);

            return back()->with('success', 'Pembayaran berhasil dikonfirmasi.');
        }

        // reject
        $payment->update(['status' => 'failed']);
        $order->update(['payment_status' => 'pending']);

        UserNotification::query()->create([
            'user_id' => $order->user_id,
            'type'    => 'payment',
            'title'   => 'Bukti transfer ditolak',
            'message' => "Bukti transfer untuk pesanan {$order->order_number} ditolak. Silakan upload ulang.",
            'is_read' => false,
        ]);

        return back()->with('success', 'Bukti transfer ditolak, user perlu upload ulang.');
    }
}
