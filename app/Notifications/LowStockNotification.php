<?php

namespace App\Notifications;

use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LowStockNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected Product $product;

    /**
     * Create a new notification instance.
     */
    public function __construct(Product $product)
    {
        $this->product = $product;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Low Stock Alert: ' . $this->product->name)
            ->line('Product **' . $this->product->name . '** is running low on stock.')
            ->line('Current Stock: **' . $this->product->stock . '** units')
            ->line('Low Stock Threshold: **' . $this->product->low_stock_threshold . '** units')
            ->action('View Product', url('/admin/products/' . $this->product->id . '/edit'))
            ->line('Please restock this product to avoid running out.');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'product_id' => $this->product->id,
            'product_name' => $this->product->name,
            'current_stock' => $this->product->stock,
            'threshold' => $this->product->low_stock_threshold,
            'message' => "Low stock alert: {$this->product->name} has only {$this->product->stock} units left",
        ];
    }
}
