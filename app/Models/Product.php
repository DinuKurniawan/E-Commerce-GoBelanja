<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;
#[Fillable([
    'category_id',
    'name',
    'slug',
    'price',
    'stock',
    'weight',
    'rating',
    'is_new',
    'is_featured',
    'is_popular',
    'emoji',
    'image_url',
    'low_stock_threshold',
    'is_available',
    'last_restocked_at',
    'allow_pre_order',
    'pre_order_deposit_percent',
    'pre_order_availability_date',
    'views_count',
])]
class Product extends Model
{
    protected function casts(): array
    {
        return [
            'is_new' => 'boolean',
            'is_featured' => 'boolean',
            'is_popular' => 'boolean',
            'is_available' => 'boolean',
            'allow_pre_order' => 'boolean',
            'rating' => 'float',
            'pre_order_deposit_percent' => 'decimal:2',
            'last_restocked_at' => 'datetime',
            'pre_order_availability_date' => 'date',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function sizes(): HasMany
    {
        return $this->hasMany(ProductSize::class)->orderBy('id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function flashSales(): HasMany
    {
        return $this->hasMany(FlashSale::class);
    }

    public function comparisons(): HasMany
    {
        return $this->hasMany(ProductComparison::class);
    }

    public function flashSale()
    {
        return $this->hasOne(FlashSale::class)->latestOfMany();
    }

    public function activeFlashSale()
    {
        return $this->hasOne(FlashSale::class)
            ->where('is_active', true)
            ->where('starts_at', '<=', now())
            ->where('ends_at', '>=', now());
    }

    public function stockHistory(): HasMany
    {
        return $this->hasMany(StockHistory::class)->orderBy('created_at', 'desc');
    }

    public function colors(): HasMany
    {
        return $this->hasMany(ProductColor::class);
    }

    public function preOrders(): HasMany
    {
        return $this->hasMany(PreOrder::class);
    }

    public function recommendations(): HasMany
    {
        return $this->hasMany(ProductRecommendation::class);
    }

    public function variantImages(): HasMany
    {
        return $this->hasMany(ProductVariantImage::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    /**
     * Check if product has low stock
     */
    public function hasLowStock(): bool
    {
        return $this->stock <= $this->low_stock_threshold && $this->stock > 0;
    }

    /**
     * Check if product is out of stock
     */
    public function isOutOfStock(): bool
    {
        return $this->stock === 0 && !$this->allow_pre_order;
    }

    /**
     * Check if product is available for purchase
     */
    public function isAvailableForPurchase(): bool
    {
        return ($this->stock > 0 || $this->allow_pre_order) && $this->is_available;
    }
}
