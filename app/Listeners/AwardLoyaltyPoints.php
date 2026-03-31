<?php

namespace App\Listeners;

use App\Events\OrderCompleted;
use App\Services\LoyaltyService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class AwardLoyaltyPoints implements ShouldQueue
{
    use InteractsWithQueue;

    public function __construct(private LoyaltyService $loyaltyService)
    {
    }

    public function handle(OrderCompleted $event): void
    {
        $order = $event->order;
        
        if ($order->payment_status === 'paid' && $order->user) {
            $this->loyaltyService->awardOrderPoints(
                $order->user,
                $order->id,
                $order->total_amount
            );
        }
    }
}
