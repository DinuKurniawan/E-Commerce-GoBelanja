<?php

namespace App\Notifications;

use App\Models\PreOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PreOrderPlaced extends Notification
{
    use Queueable;

    protected $preOrder;

    public function __construct(PreOrder $preOrder)
    {
        $this->preOrder = $preOrder;
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Pre-Order Confirmed')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Your pre-order has been placed successfully.')
            ->line('Product: ' . $this->preOrder->product->name)
            ->line('Quantity: ' . $this->preOrder->quantity)
            ->line('Deposit Paid: Rp ' . number_format($this->preOrder->deposit_amount, 0, ',', '.'))
            ->line('Remaining Amount: Rp ' . number_format($this->preOrder->remaining_amount, 0, ',', '.'))
            ->line('Estimated Arrival: ' . ($this->preOrder->estimated_arrival_date ? $this->preOrder->estimated_arrival_date->format('d M Y') : 'TBA'))
            ->action('View Pre-Order', route('user.pre-orders.show', $this->preOrder->id))
            ->line('We will notify you when your product is ready!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'pre_order_id' => $this->preOrder->id,
            'product_id' => $this->preOrder->product_id,
            'product_name' => $this->preOrder->product->name,
            'message' => 'Your pre-order for ' . $this->preOrder->product->name . ' has been placed.',
        ];
    }
}

