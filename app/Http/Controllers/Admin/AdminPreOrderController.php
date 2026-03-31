<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PreOrder;
use App\Models\Product;
use App\Services\PreOrderService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminPreOrderController extends Controller
{
    protected $preOrderService;

    public function __construct(PreOrderService $preOrderService)
    {
        $this->preOrderService = $preOrderService;
    }

    public function index(Request $request)
    {
        $query = PreOrder::with(['user', 'product', 'color', 'size']);

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        $preOrders = $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->through(function ($preOrder) {
                return [
                    'id' => $preOrder->id,
                    'user' => [
                        'id' => $preOrder->user->id,
                        'name' => $preOrder->user->name,
                        'email' => $preOrder->user->email,
                    ],
                    'product' => [
                        'id' => $preOrder->product->id,
                        'name' => $preOrder->product->name,
                        'image' => $preOrder->product->image_url,
                    ],
                    'color' => $preOrder->color?->name,
                    'size' => $preOrder->size?->name,
                    'quantity' => $preOrder->quantity,
                    'deposit_amount' => $preOrder->deposit_amount,
                    'remaining_amount' => $preOrder->remaining_amount,
                    'status' => $preOrder->status,
                    'estimated_arrival_date' => $preOrder->estimated_arrival_date?->format('Y-m-d'),
                    'notified_at' => $preOrder->notified_at?->format('Y-m-d H:i'),
                    'created_at' => $preOrder->created_at->format('Y-m-d H:i'),
                ];
            });

        return Inertia::render('Admin/PreOrders', [
            'preOrders' => $preOrders,
            'filters' => [
                'status' => $request->status ?? 'all',
                'product_id' => $request->product_id,
            ],
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,ready,completed,cancelled',
            'estimated_arrival_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $preOrder = PreOrder::findOrFail($id);
        $preOrder->update($validated);

        return response()->json([
            'message' => 'Pre-order status updated successfully',
            'preOrder' => $preOrder,
        ]);
    }

    public function notifyAvailable($id)
    {
        $preOrder = PreOrder::findOrFail($id);

        if ($this->preOrderService->notifyProductAvailable($preOrder)) {
            return response()->json([
                'message' => 'Customer notified successfully',
            ]);
        }

        return response()->json([
            'message' => 'Customer already notified',
        ], 422);
    }

    public function bulkNotify($productId)
    {
        $product = Product::findOrFail($productId);
        $notifiedCount = $this->preOrderService->bulkNotify($product);

        return response()->json([
            'message' => "{$notifiedCount} customers notified successfully",
            'count' => $notifiedCount,
        ]);
    }
}

