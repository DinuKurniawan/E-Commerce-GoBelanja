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
        Schema::create('tracking_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->string('status'); // picked_up, in_transit, out_for_delivery, delivered, etc.
            $table->string('status_label'); // Picked Up, In Transit, Out for Delivery, Delivered
            $table->text('description')->nullable(); // Package has been picked up by courier
            $table->string('location')->nullable(); // Jakarta Selatan, Bandung, etc.
            $table->timestamp('event_time');
            $table->timestamps();
            
            $table->index('order_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tracking_events');
    }
};
