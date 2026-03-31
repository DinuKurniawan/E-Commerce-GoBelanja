<?php

namespace App\Console\Commands;

use App\Mail\AbandonedCartEmail;
use App\Models\CartItem;
use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

#[Signature('email:send-abandoned-cart')]
#[Description('Send abandoned cart reminder emails to users with items in cart')]
class SendAbandonedCartReminders extends Command
{
    public function handle()
    {
        $oneDayAgo = now()->subHours(24);

        $cartItems = CartItem::where('updated_at', '<=', $oneDayAgo)
            ->with(['user', 'product'])
            ->get()
            ->groupBy('user_id');

        $count = 0;

        foreach ($cartItems as $userId => $items) {
            $user = $items->first()->user;
            
            if ($user && $user->email) {
                try {
                    Mail::to($user->email)->send(new AbandonedCartEmail($user, $items));
                    $count++;
                } catch (\Exception $e) {
                    $this->error("Failed to send email to {$user->email}: " . $e->getMessage());
                }
            }
        }

        $this->info("Sent {$count} abandoned cart reminder emails.");
        return 0;
    }
}
