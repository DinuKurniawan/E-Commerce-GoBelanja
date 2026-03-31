<?php

namespace App\Console\Commands;

use App\Mail\ReviewReminderMail;
use App\Models\Order;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

#[Signature('email:send-review-reminders')]
#[Description('Send review reminder emails to customers 7 days after delivery')]
class SendReviewReminders extends Command
{
    public function handle()
    {
        $sevenDaysAgo = now()->subDays(7)->startOfDay();
        $eightDaysAgo = now()->subDays(8)->startOfDay();

        $orders = Order::where('status', 'delivered')
            ->whereBetween('updated_at', [$eightDaysAgo, $sevenDaysAgo])
            ->with(['user', 'items.product'])
            ->get();

        $count = 0;

        foreach ($orders as $order) {
            try {
                Mail::to($order->user->email)->send(new ReviewReminderMail($order));
                $count++;
            } catch (\Exception $e) {
                $this->error("Failed to send email to {$order->user->email}: " . $e->getMessage());
            }
        }

        $this->info("Sent {$count} review reminder emails.");
        return 0;
    }
}
