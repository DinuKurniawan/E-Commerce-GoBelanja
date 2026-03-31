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
        Schema::create('delivery_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->date('delivery_date');
            $table->string('time_slot'); // 09:00-12:00, 12:00-15:00, 15:00-18:00, 18:00-21:00
            $table->boolean('is_same_day')->default(false);
            $table->text('special_instructions')->nullable();
            $table->string('status')->default('scheduled'); // scheduled, in_transit, delivered, failed
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_schedules');
    }
};
