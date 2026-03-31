<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendReviewReminderJob;
use App\Mail\OrderDeliveredMail;
use App\Mail\OrderShippedMail;
use App\Mail\PaymentVerifiedMail;
use App\Models\Order;
use App\Models\Payment;
use App\Models\UserNotification;
use App\Notifications\OrderStatusChanged;
use App\Notifications\PaymentStatusChanged;
use App\Services\StockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class OrderManagementController extends Controller
{
    public function __construct(private StockService $stockService) {}
    public function index(): Response
    {
        return Inertia::render('Admin/Orders', [
            'orders'   => Order::query()
                ->with(['user:id,name,email', 'payment', 'deliverySchedule'])
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

        $oldStatus = $order->status;
        
        $order->update([
            'status'          => $validated['status'],
            'tracking_number' => $validated['tracking_number'] ?? $order->tracking_number,
        ]);

        // Send notification
        $order->load(['user', 'items.product']);
        $order->user->notify(new OrderStatusChanged($order, $oldStatus, $validated['status']));

        // Send specific emails based on status
        if ($validated['status'] === 'dikirim') {
            Mail::to($order->user->email)->send(new OrderShippedMail($order));
        } elseif ($validated['status'] === 'selesai') {
            Mail::to($order->user->email)->send(new OrderDeliveredMail($order));
            // Schedule review reminder for 7 days later
            SendReviewReminderJob::dispatch($order);
        }

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

        $oldStatus = $payment->status;

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

            // Send payment verified email and notification
            $order->load(['user', 'items.product', 'payment']);
            $order->user->notify(new PaymentStatusChanged($order, $oldStatus, 'approved'));
            Mail::to($order->user->email)->send(new PaymentVerifiedMail($order));

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

    /**
     * Cancel order and restore stock
     */
    public function cancelOrder(Request $request, Order $order)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        if (in_array($order->status, ['dikirim', 'selesai'])) {
            return back()->withErrors(['error' => 'Cannot cancel order that has been shipped or completed.']);
        }

        // Return stock to inventory
        foreach ($order->items as $item) {
            $this->stockService->incrementForReturn(
                $item->product,
                $item->quantity,
                $order->id,
                $validated['reason']
            );
        }

        // Update order status
        $order->update([
            'status' => 'cancelled',
            'notes' => ($order->notes ? $order->notes . "\n\n" : '') . 
                      "Cancelled by admin: " . $validated['reason'],
        ]);

        // Notify user
        UserNotification::query()->create([
            'user_id' => $order->user_id,
            'type'    => 'order',
            'title'   => 'Pesanan dibatalkan',
            'message' => "Pesanan {$order->order_number} telah dibatalkan. Alasan: {$validated['reason']}",
            'is_read' => false,
        ]);

        return back()->with('success', 'Order cancelled and stock returned to inventory.');
    }
}
