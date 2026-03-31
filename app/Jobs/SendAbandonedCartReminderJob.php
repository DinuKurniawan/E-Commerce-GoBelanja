<?php

namespace App\Jobs;

use App\Mail\AbandonedCartEmail;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class SendAbandonedCartReminderJob implements ShouldQueue
{
    use Queueable;

    public function __construct(public User $user, public $cartItems)
    {
        $this->delay(now()->addHours(24));
    }

    public function handle(): void
    {
        if ($this->cartItems->isNotEmpty()) {
            Mail::to($this->user->email)->send(new AbandonedCartEmail($this->user, $this->cartItems));
        }
    }
}
