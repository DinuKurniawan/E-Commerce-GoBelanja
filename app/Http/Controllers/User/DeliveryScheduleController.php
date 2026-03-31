<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\UserAddress;
use App\Services\DeliveryScheduleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeliveryScheduleController extends Controller
{
    public function __construct(
        private DeliveryScheduleService $scheduleService
    ) {}

    /**
     * Get available delivery dates
     */
    public function getAvailableDates(Request $request): JsonResponse
    {
        $addressId = $request->get('address_id');
        $address = null;

        if ($addressId) {
            $address = UserAddress::query()
                ->where('user_id', auth()->id())
                ->find($addressId);
        }

        $dates = $this->scheduleService->getAvailableDates($address);

        return response()->json([
            'dates' => $dates,
        ]);
    }

    /**
     * Get available time slots for a specific date
     */
    public function getAvailableSlots(Request $request): JsonResponse
    {
        $request->validate([
            'date' => 'required|date',
        ]);

        $slots = $this->scheduleService->getAvailableTimeSlots($request->date);

        return response()->json([
            'slots' => $slots,
        ]);
    }

    /**
     * Check same-day delivery availability
     */
    public function checkSameDayAvailability(Request $request): JsonResponse
    {
        $addressId = $request->get('address_id');
        $address = null;

        if ($addressId) {
            $address = UserAddress::query()
                ->where('user_id', auth()->id())
                ->find($addressId);
        }

        $cartItems = CartItem::query()
            ->where('user_id', auth()->id())
            ->with('product:id,name,stock')
            ->get();

        $availability = $this->scheduleService->isSameDayAvailable($address, $cartItems);

        // Get time until cutoff
        $cutoffInfo = $this->scheduleService->getTimeUntilCutoff();

        return response()->json([
            'available' => $availability['eligible'] ?? false,
            'reason' => $availability['reason'] ?? null,
            'fee' => $availability['fee'] ?? 0,
            'cutoff' => $cutoffInfo,
            'cities' => $this->scheduleService->getSameDayCities(),
        ]);
    }

    /**
     * Validate delivery schedule selection
     */
    public function validateSchedule(Request $request): JsonResponse
    {
        $request->validate([
            'date' => 'required|date',
            'time_slot' => 'required|string',
            'is_same_day' => 'boolean',
        ]);

        $validation = $this->scheduleService->validateSchedule(
            $request->date,
            $request->time_slot,
            $request->boolean('is_same_day')
        );

        return response()->json($validation);
    }

    /**
     * Update delivery schedule for an order
     */
    public function updateSchedule(Request $request, Order $order): JsonResponse
    {
        // Check if order belongs to user
        if ($order->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        // Check if order can be rescheduled
        if (!in_array($order->status, ['pending', 'processing'])) {
            return response()->json([
                'success' => false,
                'message' => 'Order cannot be rescheduled at this stage',
            ], 400);
        }

        $validated = $request->validate([
            'delivery_date' => 'required|date',
            'time_slot' => 'required|string',
            'special_instructions' => 'nullable|string|max:200',
            'is_same_day' => 'boolean',
        ]);

        // Validate the schedule
        $validation = $this->scheduleService->validateSchedule(
            $validated['delivery_date'],
            $validated['time_slot'],
            $validated['is_same_day'] ?? false
        );

        if (!$validation['valid']) {
            return response()->json([
                'success' => false,
                'message' => $validation['error'],
            ], 400);
        }

        // Update or create delivery schedule
        $order->deliverySchedule()->updateOrCreate(
            ['order_id' => $order->id],
            [
                'delivery_date' => $validated['delivery_date'],
                'time_slot' => $validated['time_slot'],
                'is_same_day' => $validated['is_same_day'] ?? false,
                'special_instructions' => $validated['special_instructions'] ?? null,
                'status' => 'scheduled',
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Delivery schedule updated successfully',
        ]);
    }
}
