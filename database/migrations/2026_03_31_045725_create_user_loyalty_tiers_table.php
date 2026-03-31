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
        Schema::create('user_loyalty_tiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('tier')->default('Bronze'); // Bronze, Silver, Gold, Platinum
            $table->integer('total_points')->default(0);
            $table->integer('lifetime_points')->default(0);
            $table->decimal('total_spent', 15, 2)->default(0);
            $table->string('referral_code')->unique()->nullable();
            $table->integer('referrals_count')->default(0);
            $table->timestamp('tier_upgraded_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_loyalty_tiers');
    }
};
