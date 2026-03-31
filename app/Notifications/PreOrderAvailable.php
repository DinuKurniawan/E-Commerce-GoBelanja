<?php

namespace App\Notifications;

use App\Models\PreOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PreOrderAvailable extends Notification
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
            ->subject('Your Pre-Order is Ready!')
            ->greeting('Great News, ' . $notifiable->name . '!')
            ->line('Your pre-ordered product is now available!')
            ->line('Product: ' . $this->preOrder->product->name)
            ->line('Quantity: ' . $this->preOrder->quantity)
            ->line('Deposit Already Paid: Rp ' . number_format($this->preOrder->deposit_amount, 0, ',', '.'))
            ->line('Remaining to Pay: Rp ' . number_format($this->preOrder->remaining_amount, 0, ',', '.'))
            ->action('Complete Your Order', route('user.pre-orders.show', $this->preOrder->id))
            ->line('Please complete your payment to finalize your order.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'pre_order_id' => $this->preOrder->id,
            'product_id' => $this->preOrder->product_id,
            'product_name' => $this->preOrder->product->name,
            'message' => 'Your pre-order for ' . $this->preOrder->product->name . ' is now available!',
        ];
    }
}

