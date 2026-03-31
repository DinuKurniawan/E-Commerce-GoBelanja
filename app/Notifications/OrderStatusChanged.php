<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderStatusChanged extends Notification implements ShouldQueue
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
            ->subject('Order Status Update - ' . $this->order->order_number)
            ->greeting('Hi ' . $notifiable->name . ',')
            ->line('Your order status has been updated.');

        if ($this->newStatus === 'shipped') {
            $message->line('Your order has been shipped!')
                ->line('Tracking Number: ' . $this->order->tracking_number)
                ->line('Courier: ' . ucfirst($this->order->shipping_courier));
        } elseif ($this->newStatus === 'delivered') {
            $message->line('Your order has been delivered!')
                ->line('We hope you love your purchase.');
        } elseif ($this->newStatus === 'cancelled') {
            $message->line('Your order has been cancelled.')
                ->line('If you have any questions, please contact our support team.');
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
            'message' => 'Your order status has been updated to ' . ucfirst($this->newStatus),
        ];
    }
}
