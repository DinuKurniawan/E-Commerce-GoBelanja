<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentStatusChanged extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Order $order, public string $oldStatus, public string $newStatus)
    {
        //
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $message = (new MailMessage)
            ->subject('Payment Status Update - ' . $this->order->order_number)
            ->greeting('Hi ' . $notifiable->name . ',')
            ->line('Your payment status has been updated.');

        if ($this->newStatus === 'approved') {
            $message->line('Your payment has been verified and approved!')
                ->line('We are now processing your order.')
                ->line('Payment Amount: Rp ' . number_format($this->order->payment->amount, 0, ',', '.'));
        } elseif ($this->newStatus === 'rejected') {
            $message->line('Unfortunately, your payment could not be verified.')
                ->line('Please contact our support team for assistance.');
        } else {
            $message->line('Status changed from ' . ucfirst($this->oldStatus) . ' to ' . ucfirst($this->newStatus));
        }

        return $message->action('View Order', url('/user/orders/' . $this->order->id))
            ->line('Thank you for shopping with us!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'old_status' => $this->oldStatus,
            'new_status' => $this->newStatus,
            'message' => 'Your payment status has been updated to ' . ucfirst($this->newStatus),
        ];
    }
}
