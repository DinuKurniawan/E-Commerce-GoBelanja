<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('order_number')->unique();
            $table->unsignedInteger('total_amount');
            $table->enum('status', ['pending', 'diproses', 'dikirim', 'selesai'])
                ->default('pending');
            $table->string('shipping_courier')->nullable();
            $table->string('tracking_number')->nullable();
            $table->text('shipping_address')->nullable();
            $table->enum('payment_status', ['pending', 'menunggu_verifikasi', 'paid', 'failed'])->default('pending');
            $table->text('notes')->nullable();
            $table->string('delivery_proof')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
