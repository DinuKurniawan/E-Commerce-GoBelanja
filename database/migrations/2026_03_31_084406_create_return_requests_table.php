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
        Schema::create('return_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('request_number')->unique();
            $table->enum('status', ['requested', 'approved', 'rejected', 'received', 'refunded', 'completed'])->default('requested');
            $table->enum('refund_status', ['pending', 'processing', 'refunded', 'rejected'])->default('pending');
            $table->string('reason');
            $table->text('customer_notes')->nullable();
            $table->text('admin_notes')->nullable();
            $table->string('evidence_image')->nullable();
            $table->unsignedInteger('refund_amount')->default(0);
            $table->string('refund_reference')->nullable();
            $table->timestamp('requested_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('received_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['order_id', 'status']);
            $table->index(['user_id', 'refund_status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('return_requests');
    }
};
