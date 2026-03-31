<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\TrackingEvent;
use App\Services\RajaOngkirService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ShippingController extends Controller
{
    protected $rajaOngkir;

    public function __construct(RajaOngkirService $rajaOngkir)
    {
        $this->rajaOngkir = $rajaOngkir;
    }

    /**
     * Calculate shipping cost for a single courier.
     */
    public function calculateCost(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'destination' => 'required|string',
            'weight' => 'required|integer|min:1',
            'courier' => 'required|string|in:jne,tiki,pos,sicepat,jnt',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors(),
            ], 422);
        }

        $services = $this->rajaOngkir->getCost(
            $request->destination,
            $request->weight,
            $request->courier
        );

        if (empty($services)) {
            return response()->json([
                'success' => false,
                'message' => $this->rajaOngkir->getLastError() ?? 'Gagal menghitung ongkir',
            ], 400);
        }

        return response()->json([
            'success' => true,
            'data' => $services,
        ]);
    }

    /**
     * Compare shipping costs across multiple couriers.
     */
    public function compare(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'destination' => 'required|string',
            'weight' => 'required|integer|min:1',
            'couriers' => 'nullable|array',
            'couriers.*' => 'string|in:jne,tiki,pos,sicepat,jnt',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors(),
            ], 422);
        }

        $couriers = $request->couriers ?? ['jne', 'tiki', 'pos', 'sicepat', 'jnt'];
        
        $services = $this->rajaOngkir->compareAllCouriers(
            $request->destination,
            $request->weight,
            $couriers
        );

        if (empty($services)) {
            return response()->json([
                'success' => false,
                'message' => $this->rajaOngkir->getLastError() ?? 'Gagal membandingkan ongkir',
            ], 400);
        }

        // Sort by cost (ascending)
        usort($services, fn($a, $b) => $a['cost'] <=> $b['cost']);

        return response()->json([
            'success' => true,
            'data' => $services,
        ]);
    }

    /**
     * Track shipment by order number.
     */
    public function track(Request $request, string $orderNumber)
    {
        $order = Order::where('order_number', $orderNumber)->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak ditemukan',
            ], 404);
        }

        if (!$order->tracking_number) {
            return response()->json([
                'success' => false,
                'message' => 'Nomor resi belum tersedia',
            ], 400);
        }

        // Get tracking from RajaOngkir (mock data)
        $tracking = $this->rajaOngkir->trackShipment(
            $order->courier_code ?? 'jne',
            $order->tracking_number
        );

        // Get tracking events from database if available
        $dbEvents = $order->trackingEvents;

        return response()->json([
            'success' => true,
            'data' => [
                'order' => [
                    'order_number' => $order->order_number,
                    'status' => $order->status,
                    'courier' => $order->shipping_courier,
                    'tracking_number' => $order->tracking_number,
                    'estimated_delivery' => $order->estimated_delivery,
                ],
                'tracking' => $tracking,
                'events' => $dbEvents,
            ],
        ]);
    }

    /**
     * Get tracking history for an order.
     */
    public function trackingHistory(string $orderId)
    {
        $order = Order::with('trackingEvents')->findOrFail($orderId);

        return response()->json([
            'success' => true,
            'data' => $order->trackingEvents,
        ]);
    }

    /**
     * Calculate insurance cost.
     */
    public function calculateInsurance(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_value' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors(),
            ], 422);
        }

        $orderValue = $request->order_value;
        $rate = 0.005; // 0.5%
        $insurance = $orderValue * $rate;
        $insuranceCost = max($insurance, 5000); // minimum Rp 5,000

        return response()->json([
            'success' => true,
            'data' => [
                'order_value' => $orderValue,
                'insurance_rate' => '0.5%',
                'insurance_cost' => $insuranceCost,
                'coverage_amount' => $orderValue,
            ],
        ]);
    }
}
