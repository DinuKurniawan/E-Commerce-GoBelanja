<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ReturnRequest;
use App\Models\ReturnTrackingEvent;
use App\Models\UserNotification;
use App\Services\StockService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReturnRequestManagementController extends Controller
{
    public function __construct(private StockService $stockService) {}

    public function index(): Response
    {
        return Inertia::render('Admin/Returns/Index', [
            'returnRequests' => ReturnRequest::query()
                ->with([
                    'user:id,name,email',
                    'order:id,order_number,status,total_amount',
                    'items.product:id,name,image_url,emoji',
                    'trackingEvents',
                ])
                ->latest()
                ->get(),
        ]);
    }

    public function show(ReturnRequest $returnRequest): Response
    {
        $returnRequest->load([
            'user:id,name,email',
            'order.items.product:id,name,image_url,emoji',
            'items.product:id,name,image_url,emoji',
            'trackingEvents',
        ]);

        return Inertia::render('Admin/Returns/Show', [
            'returnRequest' => $returnRequest,
        ]);
    }

    public function updateStatus(Request $request, ReturnRequest $returnRequest): RedirectResponse
    {
        $validated = $request->validate([
            'action' => 'required|in:approve,reject,receive,refund,complete',
            'admin_notes' => 'nullable|string|max:2000',
            'refund_reference' => 'nullable|string|max:255',
            'refund_amount' => 'nullable|integer|min:0',
        ]);

        switch ($validated['action']) {
            case 'approve':
                $returnRequest->update([
                    'status' => 'approved',
                    'approved_at' => now(),
                    'admin_notes' => $validated['admin_notes'] ?? $returnRequest->admin_notes,
                ]);
                $this->createTrackingEvent($returnRequest, 'approved', 'Disetujui', 'Permintaan retur disetujui admin.', 'admin');
                $message = 'Permintaan retur disetujui.';
                break;

            case 'reject':
                $returnRequest->update([
                    'status' => 'rejected',
                    'refund_status' => 'rejected',
                    'admin_notes' => $validated['admin_notes'] ?? $returnRequest->admin_notes,
                ]);
                $this->createTrackingEvent($returnRequest, 'rejected', 'Ditolak', 'Permintaan retur ditolak admin.', 'admin');
                $message = 'Permintaan retur ditolak.';
                break;

            case 'receive':
                if ($returnRequest->status !== 'approved') {
                    return back()->withErrors(['return' => 'Retur harus disetujui sebelum diterima.']);
                }

                foreach ($returnRequest->items()->with('product')->get() as $item) {
                    if ($item->product) {
                        $this->stockService->incrementForReturn(
                            $item->product,
                            $item->quantity,
                            $returnRequest->order_id,
                            'Barang retur diterima admin'
                        );
                    }
                }

                $returnRequest->update([
                    'status' => 'received',
                    'received_at' => now(),
                    'admin_notes' => $validated['admin_notes'] ?? $returnRequest->admin_notes,
                ]);
                $this->createTrackingEvent($returnRequest, 'received', 'Barang Diterima', 'Barang retur telah diterima dan diperiksa admin.', 'admin');
                $message = 'Barang retur diterima dan stok dikembalikan.';
                break;

            case 'refund':
                if (! in_array($returnRequest->status, ['approved', 'received'], true)) {
                    return back()->withErrors(['return' => 'Refund hanya bisa diproses setelah retur disetujui/diterima.']);
                }

                $returnRequest->update([
                    'status' => 'refunded',
                    'refund_status' => 'refunded',
                    'refund_reference' => $validated['refund_reference'] ?? $returnRequest->refund_reference,
                    'refund_amount' => $validated['refund_amount'] ?? $returnRequest->refund_amount,
                    'refunded_at' => now(),
                    'admin_notes' => $validated['admin_notes'] ?? $returnRequest->admin_notes,
                ]);
                $this->createTrackingEvent($returnRequest, 'refunded', 'Refund Diproses', 'Refund telah diproses oleh admin.', 'admin');
                $message = 'Refund berhasil diproses.';
                break;

            case 'complete':
                if ($returnRequest->refund_status !== 'refunded') {
                    return back()->withErrors(['return' => 'Permintaan retur belum selesai refund.']);
                }

                $returnRequest->update([
                    'status' => 'completed',
                    'completed_at' => now(),
                    'admin_notes' => $validated['admin_notes'] ?? $returnRequest->admin_notes,
                ]);
                $this->createTrackingEvent($returnRequest, 'completed', 'Selesai', 'Retur dan refund telah selesai.', 'admin');
                $message = 'Permintaan retur diselesaikan.';
                break;
        }

        UserNotification::query()->create([
            'user_id' => $returnRequest->user_id,
            'type' => 'return',
            'title' => 'Update retur & refund',
            'message' => "Status {$returnRequest->request_number} diperbarui menjadi {$returnRequest->fresh()->status}.",
            'is_read' => false,
        ]);

        return back()->with('success', $message);
    }

    protected function createTrackingEvent(ReturnRequest $returnRequest, string $status, string $label, string $description, string $actorType): void
    {
        ReturnTrackingEvent::create([
            'return_request_id' => $returnRequest->id,
            'status' => $status,
            'status_label' => $label,
            'description' => $description,
            'actor_type' => $actorType,
            'event_time' => now(),
        ]);
    }
}
