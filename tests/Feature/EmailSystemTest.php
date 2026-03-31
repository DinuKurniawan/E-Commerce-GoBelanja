<?php

namespace Tests\Feature;

use App\Mail\WelcomeEmail;
use App\Mail\OrderConfirmationMail;
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

        Mail::to($user->email)->send(new WelcomeEmail($user));

        Mail::assertSent(WelcomeEmail::class, function ($mail) use ($user) {
            return $mail->user->id === $user->id;
        });
    }

    public function test_order_confirmation_email_can_be_sent()
    {
        Mail::fake();

        $user = User::factory()->create();
        $order = Order::factory()->create(['user_id' => $user->id]);

        Mail::to($user->email)->send(new OrderConfirmationMail($order));

        Mail::assertSent(OrderConfirmationMail::class, function ($mail) use ($order) {
            return $mail->order->id === $order->id;
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
