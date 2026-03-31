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
        Schema::create('courier_services', function (Blueprint $table) {
            $table->id();
            $table->string('code'); // jne, tiki, sicepat, jnt, pos
            $table->string('name');
            $table->string('service_type'); // REG, YES, OKE, etc.
            $table->string('service_name')->nullable();
            $table->text('description')->nullable();
            $table->string('etd')->nullable(); // 2-3, 1-2
            $table->boolean('supports_tracking')->default(true);
            $table->string('tracking_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('estimated_days')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['code', 'service_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courier_services');
    }
};
