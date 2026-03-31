<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\PreOrder;
use App\Models\Product;
use App\Services\PreOrderService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PreOrderController extends Controller
{
    protected $preOrderService;

    public function __construct(PreOrderService $preOrderService)
    {
        $this->preOrderService = $preOrderService;
    }

    public function index()
    {
        $preOrders = PreOrder::with(['product.images', 'color', 'size'])
            ->where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($preOrder) {
                return [
                    'id' => $preOrder->id,
                    'product' => [
                        'id' => $preOrder->product->id,
                        'name' => $preOrder->product->name,
                        'image' => $preOrder->product->image_url,
                    ],
                    'color' => $preOrder->color ? [
                        'name' => $preOrder->color->name,
                        'hex' => $preOrder->color->hex_code,
                    ] : null,
                    'size' => $preOrder->size?->name,
                    'quantity' => $preOrder->quantity,
                    'deposit_amount' => $preOrder->deposit_amount,
                    'remaining_amount' => $preOrder->remaining_amount,
                    'total_amount' => $preOrder->getTotalAmount(),
                    'status' => $preOrder->status,
                    'estimated_arrival_date' => $preOrder->estimated_arrival_date?->format('Y-m-d'),
                    'created_at' => $preOrder->created_at->format('Y-m-d H:i'),
                ];
            });

        return Inertia::render('User/PreOrders', [
            'preOrders' => $preOrders,
        ]);
    }

    public function show($id)
    {
        $preOrder = PreOrder::with(['product.images', 'color', 'size'])
            ->where('user_id', auth()->id())
            ->findOrFail($id);

        return response()->json([
            'preOrder' => [
                'id' => $preOrder->id,
                'product' => [
                    'id' => $preOrder->product->id,
                    'name' => $preOrder->product->name,
                    'image' => $preOrder->product->image_url,
                    'price' => $preOrder->product->price,
                ],
                'color' => $preOrder->color ? [
                    'name' => $preOrder->color->name,
                    'hex' => $preOrder->color->hex_code,
                ] : null,
                'size' => $preOrder->size?->name,
                'quantity' => $preOrder->quantity,
                'deposit_amount' => $preOrder->deposit_amount,
                'remaining_amount' => $preOrder->remaining_amount,
                'total_amount' => $preOrder->getTotalAmount(),
                'status' => $preOrder->status,
                'estimated_arrival_date' => $preOrder->estimated_arrival_date?->format('Y-m-d'),
                'notes' => $preOrder->notes,
                'created_at' => $preOrder->created_at->format('Y-m-d H:i'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'color_id' => 'nullable|exists:product_colors,id',
            'size_id' => 'nullable|exists:product_sizes,id',
            'quantity' => 'required|integer|min:1|max:10',
        ]);

        $product = Product::findOrFail($validated['product_id']);

        if (!$product->allow_pre_order) {
            return response()->json([
                'message' => 'Pre-orders are not available for this product',
            ], 422);
        }

        $preOrder = $this->preOrderService->createPreOrder(
            auth()->user(),
            $product,
            $validated['quantity'],
            $validated['color_id'] ?? null,
            $validated['size_id'] ?? null
        );

        return response()->json([
            'message' => 'Pre-order created successfully',
            'preOrder' => $preOrder,
        ], 201);
    }

    public function cancel($id)
    {
        $preOrder = PreOrder::where('user_id', auth()->id())
            ->findOrFail($id);

        if (!in_array($preOrder->status, ['pending', 'confirmed'])) {
            return response()->json([
                'message' => 'Cannot cancel pre-order in current status',
            ], 422);
        }

        $preOrder->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Pre-order cancelled successfully',
        ]);
    }

    public function complete($id)
    {
        $preOrder = PreOrder::where('user_id', auth()->id())
            ->findOrFail($id);

        if ($preOrder->status !== 'ready') {
            return response()->json([
                'message' => 'Pre-order is not ready for completion',
            ], 422);
        }

        $order = $this->preOrderService->convertToOrder($preOrder);

        return response()->json([
            'message' => 'Pre-order completed successfully',
            'order_id' => $order->id,
        ]);
    }
}

