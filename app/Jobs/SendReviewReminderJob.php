<?php

namespace App\Jobs;

use App\Mail\ReviewReminderMail;
use App\Models\Order;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class SendReviewReminderJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public Order $order)
    {
        $this->delay(now()->addDays(7));
    }

    public function handle(): void
    {
        if ($this->order->status === 'delivered') {
            Mail::to($this->order->user->email)->send(new ReviewReminderMail($this->order));
        }
    }
}
