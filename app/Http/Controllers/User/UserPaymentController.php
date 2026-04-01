<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Models\UserNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class UserPaymentController extends Controller
{
    public function index(): Response
    {
        $payments = Payment::query()
            ->whereHas('order', fn ($query) => $query->where('user_id', auth()->id()))
            ->with('order:id,order_number,user_id,total_amount,payment_status')
            ->latest()
            ->get();

        $orders = Order::query()
            ->where('user_id', auth()->id())
            ->latest()
            ->get(['id', 'order_number', 'total_amount', 'payment_status']);

        return Inertia::render('User/Payments', [
            'payments' => $payments,
            'paymentSummary' => [
                'pending' => (int) $payments->where('status', 'pending')->count(),
                'paid' => (int) $payments->where('status', 'paid')->count(),
                'failed' => (int) $payments->where('status', 'failed')->count(),
            ],
            'pendingOrderCount' => (int) $orders->where('payment_status', 'pending')->count(),
        ]);
    }

    public function uploadProof(Payment $payment): RedirectResponse
    {
        $payment->load('order:id,user_id');
        abort_unless((int) ($payment->order?->user_id ?? 0) === (int) auth()->id(), 403);

        if ($payment->status === 'paid') {
            return back()->withErrors([
                'proof_image' => 'Pembayaran ini sudah dikonfirmasi.',
            ]);
        }

        $validated = request()->validate([
            'proof_image' => 'required|image|max:2048',
        ]);

        if ($payment->proof_image) {
            $currentPath = str_replace('/storage/', '', $payment->proof_image);
            if ($currentPath !== $payment->proof_image && Storage::disk('public')->exists($currentPath)) {
                Storage::disk('public')->delete($currentPath);
            }
        }

        $path = $validated['proof_image']->store('payment-proofs', 'public');

        $payment->update([
            'proof_image' => Storage::url($path),
        ]);

        $payment->order?->update(['payment_status' => 'menunggu_verifikasi']);

        if ($payment->order) {
            UserNotification::query()->create([
                'user_id' => auth()->id(),
                'type' => 'payment',
                'title' => 'Bukti transfer dikirim',
                'message' => "Bukti pembayaran untuk order {$payment->order->order_number} sedang diverifikasi admin.",
                'is_read' => false,
            ]);
        }

        return back()->with('success', 'Bukti transfer berhasil diupload. Menunggu verifikasi admin.');
    }
}
