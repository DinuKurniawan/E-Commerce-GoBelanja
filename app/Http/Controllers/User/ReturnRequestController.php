<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\ReturnRequest;
use App\Models\ReturnTrackingEvent;
use App\Models\UserNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ReturnRequestController extends Controller
{
    public function index(): Response
    {
        $returnRequests = ReturnRequest::query()
            ->where('user_id', auth()->id())
            ->with([
                'order:id,order_number,status,total_amount',
                'items.product:id,name,image_url,emoji',
                'trackingEvents',
            ])
            ->latest()
            ->get();

        return Inertia::render('User/Returns/Index', [
            'returnRequests' => $returnRequests,
        ]);
    }

    public function show(ReturnRequest $returnRequest): Response
    {
        abort_unless((int) $returnRequest->user_id === (int) auth()->id(), 403);

        $returnRequest->load([
            'order.items.product:id,name,image_url,emoji',
            'items.product:id,name,image_url,emoji',
            'trackingEvents',
        ]);

        return Inertia::render('User/Returns/Show', [
            'returnRequest' => $returnRequest,
        ]);
    }

    public function store(Request $request, Order $order): RedirectResponse
    {
        abort_unless((int) $order->user_id === (int) auth()->id(), 403);
        abort_unless($order->status === 'selesai', 403);

        $validated = $request->validate([
            'reason' => 'required|string|max:255',
            'customer_notes' => 'nullable|string|max:2000',
            'evidence_image' => 'nullable|image|max:4096',
            'items' => 'required|array|min:1',
            'items.*.order_item_id' => 'required|integer|exists:order_items,id',
            'items.*.quantity' => 'required|integer|min:0',
        ]);

        $selectedItems = collect($validated['items'])
            ->filter(fn ($item) => (int) ($item['quantity'] ?? 0) > 0)
            ->values();

        if ($selectedItems->isEmpty()) {
            throw ValidationException::withMessages([
                'items' => 'Pilih minimal satu item untuk diretur.',
            ]);
        }

        $order->load('items.product');
        $orderItems = $order->items->keyBy('id');

        DB::transaction(function () use ($validated, $selectedItems, $request, $order, $orderItems) {
            $path = $request->hasFile('evidence_image')
                ? $request->file('evidence_image')->store('return-requests', 'public')
                : null;

            $returnRequest = ReturnRequest::create([
                'user_id' => auth()->id(),
                'order_id' => $order->id,
                'request_number' => 'RTRN-' . strtoupper(Str::random(10)),
                'status' => 'requested',
                'refund_status' => 'pending',
                'reason' => $validated['reason'],
                'customer_notes' => $validated['customer_notes'] ?? null,
                'evidence_image' => $path ? Storage::url($path) : null,
                'requested_at' => now(),
            ]);

            $totalRefundAmount = 0;

            foreach ($selectedItems as $itemData) {
                $orderItem = $orderItems->get($itemData['order_item_id']);
                abort_unless($orderItem !== null, 422);

                $alreadyRequested = $orderItem->returnRequestItems()
                    ->whereHas('returnRequest', fn ($query) => $query->whereNotIn('status', ['rejected']))
                    ->sum('quantity');

                $remainingQty = $orderItem->quantity - $alreadyRequested;
                abort_if($itemData['quantity'] > $remainingQty, 422, 'Jumlah retur melebihi kuantitas yang tersedia.');

                $refundAmount = (int) $orderItem->unit_price * (int) $itemData['quantity'];
                $totalRefundAmount += $refundAmount;

                $returnRequest->items()->create([
                    'order_item_id' => $orderItem->id,
                    'product_id' => $orderItem->product_id,
                    'quantity' => $itemData['quantity'],
                    'refund_amount' => $refundAmount,
                    'reason' => $validated['reason'],
                ]);
            }

            $returnRequest->update([
                'refund_amount' => $totalRefundAmount,
            ]);

            $this->createTrackingEvent(
                $returnRequest,
                'requested',
                'Permintaan Dibuat',
                'Permintaan retur dan refund dibuat oleh pelanggan.',
                'user'
            );

            UserNotification::query()->create([
                'user_id' => auth()->id(),
                'type' => 'return',
                'title' => 'Permintaan retur dibuat',
                'message' => "Permintaan retur {$returnRequest->request_number} telah dibuat dan menunggu review admin.",
                'is_read' => false,
            ]);
        });

        return back()->with('success', 'Permintaan retur berhasil dibuat.');
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
