<?php

namespace App\Services;

use App\Models\CartItem;
use App\Models\UserAddress;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class DeliveryScheduleService
{
    private const SAME_DAY_CITIES = ['Jakarta', 'Bandung', 'Surabaya'];
    private const SAME_DAY_FEE = 25000;
    private const SAME_DAY_CUTOFF_HOUR = 10;
    private const MIN_DELIVERY_DAYS = 2;
    private const MAX_DELIVERY_DAYS = 14;

    private const TIME_SLOTS = [
        ['value' => '09:00-12:00', 'label' => 'Morning (09:00 - 12:00)', 'icon' => '🌅'],
        ['value' => '12:00-15:00', 'label' => 'Afternoon (12:00 - 15:00)', 'icon' => '☀️'],
        ['value' => '15:00-18:00', 'label' => 'Evening (15:00 - 18:00)', 'icon' => '🌤️'],
        ['value' => '18:00-21:00', 'label' => 'Night (18:00 - 21:00)', 'icon' => '🌙'],
    ];

    /**
     * Get available delivery dates for the given address
     */
    public function getAvailableDates(?UserAddress $address = null): array
    {
        $dates = [];
        $startDate = now()->addDays(self::MIN_DELIVERY_DAYS);
        $endDate = now()->addDays(self::MAX_DELIVERY_DAYS);

        $current = $startDate->copy();
        while ($current <= $endDate) {
            // You can add logic here to skip fully booked dates or public holidays
            $dates[] = [
                'date' => $current->format('Y-m-d'),
                'formatted' => $current->translatedFormat('l, d F Y'),
                'is_weekend' => $current->isWeekend(),
            ];
            $current->addDay();
        }

        return $dates;
    }

    /**
     * Get available time slots for a specific date
     */
    public function getAvailableTimeSlots(string $date): array
    {
        $slots = self::TIME_SLOTS;
        $targetDate = Carbon::parse($date);

        // If date is today, filter out past time slots
        if ($targetDate->isToday()) {
            $slots = array_filter($slots, function ($slot) {
                $slotStart = (int) explode(':', explode('-', $slot['value'])[0])[0];
                return now()->hour < $slotStart;
            });
            $slots = array_values($slots);
        }

        return $slots;
    }

    /**
     * Check if same-day delivery is available
     */
    public function isSameDayAvailable(?UserAddress $address, ?Collection $cartItems = null): array
    {
        // Check current time
        if (now()->hour >= self::SAME_DAY_CUTOFF_HOUR) {
            return [
                'eligible' => false,
                'reason' => 'Same-day delivery cutoff time passed (10:00 AM)',
            ];
        }

        // Check if address is provided and in coverage area
        if (!$address) {
            return [
                'eligible' => false,
                'reason' => 'No address selected',
            ];
        }

        if (!in_array($address->city_name, self::SAME_DAY_CITIES)) {
            return [
                'eligible' => false,
                'reason' => 'Same-day delivery not available in ' . $address->city_name,
            ];
        }

        // Check if cart items are provided
        if ($cartItems === null) {
            $cartItems = CartItem::query()
                ->where('user_id', auth()->id())
                ->with('product:id,name,stock')
                ->get();
        }

        if ($cartItems->isEmpty()) {
            return [
                'eligible' => false,
                'reason' => 'Cart is empty',
            ];
        }

        // Check if all items are in stock
        foreach ($cartItems as $item) {
            if (!$item->product || $item->product->stock < $item->quantity) {
                return [
                    'eligible' => false,
                    'reason' => 'Some items are out of stock',
                ];
            }
        }

        return [
            'eligible' => true,
            'fee' => self::SAME_DAY_FEE,
        ];
    }

    /**
     * Calculate same-day delivery fee
     */
    public function calculateSameDayFee(): int
    {
        return self::SAME_DAY_FEE;
    }

    /**
     * Validate delivery schedule selection
     */
    public function validateSchedule(string $date, string $timeSlot, bool $isSameDay = false): array
    {
        $targetDate = Carbon::parse($date);
        $today = now()->startOfDay();

        // Validate date format
        if (!$targetDate) {
            return [
                'valid' => false,
                'error' => 'Invalid date format',
            ];
        }

        // Check if same-day delivery
        if ($isSameDay) {
            // Must be today
            if (!$targetDate->isToday()) {
                return [
                    'valid' => false,
                    'error' => 'Same-day delivery must be for today',
                ];
            }

            // Check cutoff time
            if (now()->hour >= self::SAME_DAY_CUTOFF_HOUR) {
                return [
                    'valid' => false,
                    'error' => 'Same-day delivery cutoff time has passed',
                ];
            }
        } else {
            // Regular delivery: minimum 2 days from now
            $minDate = $today->copy()->addDays(self::MIN_DELIVERY_DAYS);
            if ($targetDate < $minDate) {
                return [
                    'valid' => false,
                    'error' => 'Delivery date must be at least 2 days from now',
                ];
            }

            // Maximum 14 days ahead
            $maxDate = $today->copy()->addDays(self::MAX_DELIVERY_DAYS);
            if ($targetDate > $maxDate) {
                return [
                    'valid' => false,
                    'error' => 'Delivery date cannot be more than 14 days ahead',
                ];
            }
        }

        // Validate time slot
        $validSlots = array_column(self::TIME_SLOTS, 'value');
        if (!in_array($timeSlot, $validSlots)) {
            return [
                'valid' => false,
                'error' => 'Invalid time slot',
            ];
        }

        // Check if time slot is in the future (for today's delivery)
        if ($targetDate->isToday()) {
            $slotStart = (int) explode(':', explode('-', $timeSlot)[0])[0];
            if (now()->hour >= $slotStart) {
                return [
                    'valid' => false,
                    'error' => 'Selected time slot has passed',
                ];
            }
        }

        return ['valid' => true];
    }

    /**
     * Get time until cutoff (for same-day delivery)
     */
    public function getTimeUntilCutoff(): array
    {
        $cutoffTime = now()->copy()->setHour(self::SAME_DAY_CUTOFF_HOUR)->setMinute(0)->setSecond(0);
        $now = now();

        if ($now >= $cutoffTime) {
            return [
                'passed' => true,
                'hours' => 0,
                'minutes' => 0,
            ];
        }

        $diff = $now->diff($cutoffTime);

        return [
            'passed' => false,
            'hours' => $diff->h,
            'minutes' => $diff->i,
            'total_minutes' => ($diff->h * 60) + $diff->i,
        ];
    }

    /**
     * Get same-day delivery cities
     */
    public function getSameDayCities(): array
    {
        return self::SAME_DAY_CITIES;
    }

    /**
     * Get all time slots
     */
    public function getAllTimeSlots(): array
    {
        return self::TIME_SLOTS;
    }
}
