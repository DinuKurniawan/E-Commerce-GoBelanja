<?php

namespace Tests\Feature;

use App\Mail\OrderConfirmationMail;
use App\Mail\WelcomeEmail;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class EmailSystemTest extends TestCase
{
    use RefreshDatabase;

    public function test_welcome_email_can_be_sent()
    {
        Mail::fake();

        $user = User::factory()->create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
        ]);

        Mail::to($user->email)->queue(new WelcomeEmail($user));

        Mail::assertQueued(WelcomeEmail::class, function ($mail) use ($user) {
            return $mail->user->is($user);
        });
    }

    public function test_order_confirmation_email_can_be_sent()
    {
        Mail::fake();

        $user = User::factory()->create();
        $order = Order::query()->create([
            'user_id' => $user->id,
            'order_number' => 'ORD-TEST-0001',
            'total_amount' => 100000,
            'status' => 'pending',
            'payment_status' => 'pending',
        ]);

        Mail::to($user->email)->queue(new OrderConfirmationMail($order));

        Mail::assertQueued(OrderConfirmationMail::class, function ($mail) use ($order) {
            return $mail->order->is($order);
        });
    }

    public function test_email_commands_are_registered()
    {
        $this->artisan('email:send-review-reminders')
            ->assertExitCode(0);

        $this->artisan('email:send-abandoned-cart')
            ->assertExitCode(0);
    }
}
