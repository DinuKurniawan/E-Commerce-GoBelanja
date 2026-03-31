<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Collection;

class DailyLowStockReport extends Notification implements ShouldQueue
{
    use Queueable;

    protected Collection $lowStockProducts;
    protected Collection $outOfStockProducts;

    /**
     * Create a new notification instance.
     */
    public function __construct(Collection $lowStockProducts, Collection $outOfStockProducts)
    {
        $this->lowStockProducts = $lowStockProducts;
        $this->outOfStockProducts = $outOfStockProducts;
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
        $mail = (new MailMessage)
            ->subject('Daily Inventory Report - ' . now()->format('Y-m-d'))
            ->greeting('Daily Inventory Alert');

        if ($this->outOfStockProducts->isNotEmpty()) {
            $mail->line('**Out of Stock Products: ' . $this->outOfStockProducts->count() . '**');
            foreach ($this->outOfStockProducts->take(5) as $product) {
                $mail->line('- ' . $product->name);
            }
            if ($this->outOfStockProducts->count() > 5) {
                $mail->line('...and ' . ($this->outOfStockProducts->count() - 5) . ' more');
            }
            $mail->line('');
        }

        if ($this->lowStockProducts->isNotEmpty()) {
            $mail->line('**Low Stock Products: ' . $this->lowStockProducts->count() . '**');
            foreach ($this->lowStockProducts->take(10) as $product) {
                $mail->line('- ' . $product->name . ' (Stock: ' . $product->stock . ')');
            }
            if ($this->lowStockProducts->count() > 10) {
                $mail->line('...and ' . ($this->lowStockProducts->count() - 10) . ' more');
            }
        }

        return $mail
            ->action('View Inventory', url('/admin/inventory'))
            ->line('Please review and restock these products.');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'low_stock_count' => $this->lowStockProducts->count(),
            'out_of_stock_count' => $this->outOfStockProducts->count(),
            'message' => "Daily inventory report: {$this->lowStockProducts->count()} low stock, {$this->outOfStockProducts->count()} out of stock",
        ];
    }
}
