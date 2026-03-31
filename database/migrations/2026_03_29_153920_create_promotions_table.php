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
        Schema::create('promotions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->enum('promotion_type', [
                'voucher', 'discount_product', 'bogo', 'bundle',
                'free_shipping', 'category', 'tiered', 'first_purchase', 'bulk'
            ])->default('voucher');
            $table->unsignedTinyInteger('discount_percent');
            $table->unsignedInteger('minimum_purchase')->default(0);

            // BOGO fields
            $table->unsignedInteger('buy_quantity')->nullable();
            $table->unsignedInteger('get_quantity')->nullable();
            $table->unsignedTinyInteger('get_discount_percent')->nullable();

            // Bundle fields
            $table->json('bundle_products')->nullable();
            $table->unsignedInteger('bundle_price')->nullable();

            // Category discount fields
            $table->unsignedBigInteger('category_id')->nullable();

            // Tiered discount fields
            $table->json('tier_levels')->nullable();

            // Free shipping fields
            $table->unsignedInteger('shipping_free_above')->nullable();
            $table->string('shipping_courier')->nullable();
            $table->json('shipping_regions')->nullable();

            // Scope
            $table->enum('applies_to', ['all', 'category', 'product', 'bundle'])->default('all');
            $table->json('applicable_product_ids')->nullable();

            // Usage limits
            $table->unsignedInteger('usage_limit')->nullable();
            $table->unsignedInteger('usage_count')->default(0);
            $table->unsignedInteger('per_user_limit')->nullable();
            $table->unsignedInteger('max_discount_amount')->nullable();
            $table->boolean('can_stack')->default(false);
            $table->text('description')->nullable();

            $table->timestamp('expires_at');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promotions');
    }
};
