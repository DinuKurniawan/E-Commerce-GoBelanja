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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->unsignedInteger('price');
            $table->unsignedInteger('stock')->default(0);
            $table->boolean('is_available')->default(true);
            $table->integer('low_stock_threshold')->default(5);
            $table->unsignedInteger('weight')->default(500); // grams
            $table->decimal('rating', 2, 1)->default(5.0);
            $table->integer('views_count')->default(0);
            $table->timestamp('last_restocked_at')->nullable();
            $table->boolean('is_new')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_popular')->default(false);
            $table->boolean('allow_pre_order')->default(false);
            $table->decimal('pre_order_deposit_percent', 5, 2)->nullable();
            $table->date('pre_order_availability_date')->nullable();
            $table->string('emoji')->nullable();
            $table->string('image_url')->nullable();
            $table->timestamps();

            $table->index('name');
            $table->index('price');
            $table->index('rating');
            $table->index('stock');
            $table->index('views_count');
            $table->index('allow_pre_order');
            $table->index('created_at');
            $table->index(['category_id', 'price']);
            $table->index(['category_id', 'rating']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
