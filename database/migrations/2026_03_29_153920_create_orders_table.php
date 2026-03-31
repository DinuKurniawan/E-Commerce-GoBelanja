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
            $table->unsignedBigInteger('promotion_id')->nullable();
            $table->string('promotion_code')->nullable();
            $table->string('order_number')->unique();
            $table->unsignedInteger('total_amount');
            $table->unsignedInteger('discount_amount')->default(0);
            $table->unsignedInteger('subtotal_before_discount')->default(0);
            $table->json('applied_promotions')->nullable();
            $table->boolean('free_shipping_applied')->default(false);
            $table->enum('status', ['pending', 'diproses', 'dikirim', 'selesai', 'cancelled'])
                ->default('pending');
            $table->string('shipping_courier')->nullable();
            $table->string('courier_code')->nullable();
            $table->string('courier_service')->nullable();
            $table->unsignedInteger('shipping_cost')->default(0);
            $table->boolean('has_insurance')->default(false);
            $table->unsignedInteger('insurance_cost')->default(0);
            $table->string('estimated_delivery')->nullable();
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
