<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\FlashSaleController;
use App\Http\Controllers\ProductSearchController;
use App\Http\Controllers\ProductReviewController;
use App\Http\Controllers\RecommendationController;
use App\Http\Controllers\RajaOngkirController;
use App\Http\Controllers\WilayahController;
use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\EmailTrackingController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\CategoryManagementController;
use App\Http\Controllers\Admin\FlashSaleManagementController;
use App\Http\Controllers\Admin\OrderManagementController;
use App\Http\Controllers\Admin\ProductManagementController;
use App\Http\Controllers\Admin\ProductColorController;
use App\Http\Controllers\Admin\ProductVariantController;
use App\Http\Controllers\Admin\AdminPreOrderController;
use App\Http\Controllers\Admin\PromotionManagementController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\ReviewManagementController;
use App\Http\Controllers\Admin\SettingsManagementController;
use App\Http\Controllers\Admin\ShippingManagementController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\AdminChatController;
use App\Http\Controllers\Admin\BulkOperationController;
use App\Http\Controllers\Admin\LoyaltyController as AdminLoyaltyController;
use App\Http\Controllers\Admin\EmailCampaignController;
use App\Http\Controllers\Admin\RecommendationManagementController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\User\UserAddressController;
use App\Http\Controllers\User\UserCartController;
use App\Http\Controllers\User\UserCheckoutController;
use App\Http\Controllers\User\UserComparisonController;
use App\Http\Controllers\User\UserDashboardController;
use App\Http\Controllers\User\UserNotificationController;
use App\Http\Controllers\User\UserOrderController;
use App\Http\Controllers\User\UserPaymentController;
use App\Http\Controllers\User\UserReviewController;
use App\Http\Controllers\User\ReviewVoteController;
use App\Http\Controllers\User\UserWishlistController;
use App\Http\Controllers\User\UserChatController;
use App\Http\Controllers\User\PreOrderController;
use App\Http\Controllers\User\TwoFactorController;
use App\Http\Controllers\User\MidtransController;
use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\IpBlockingController;
use App\Http\Controllers\Admin\SecurityDashboardController;
use App\Http\Controllers\Admin\BannerManagementController;
use App\Http\Controllers\User\LoyaltyController;
use App\Http\Controllers\User\ReturnRequestController;
use App\Http\Controllers\User\DeliveryScheduleController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\Admin\ReturnRequestManagementController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

// Locale Routes (Public)
Route::post('/locale', [LocaleController::class, 'setLocale'])->name('locale.set');
Route::get('/locale', [LocaleController::class, 'getLocale'])->name('locale.get');

// Shared hosting fallback for /storage URLs when public/storage symlink is unavailable.
Route::get('/storage/{path}', function (string $path) {
    $normalizedPath = ltrim(str_replace('\\', '/', $path), '/');

    if ($normalizedPath === '' || str_contains($normalizedPath, '..')) {
        abort(404);
    }

    $disk = Storage::disk('public');
    if (! $disk->exists($normalizedPath)) {
        abort(404);
    }

    return response()->file($disk->path($normalizedPath), [
        'Cache-Control' => 'public, max-age=31536000',
    ]);
})->where('path', '.*')->name('storage.fallback');

Route::get('/', [HomeController::class, 'index']);

// Public Product Reviews
Route::get('/products/{product}/reviews', [ProductReviewController::class, 'index'])->name('products.reviews');

// Public flash sales page
Route::get('/flash-sales', [FlashSaleController::class, 'index'])->name('flash-sales.index');


// Product Search & Autocomplete
Route::get('/products/search', [ProductSearchController::class, 'search'])->name('products.search');
Route::get('/api/products/autocomplete', [ProductSearchController::class, 'autocomplete'])->name('products.autocomplete');

// Product Variants API
Route::get('/api/products/{product}/variants', [ProductVariantController::class, 'getVariants'])->name('api.products.variants');
Route::post('/api/products/variants/check-availability', [ProductVariantController::class, 'checkAvailability'])->name('api.products.variants.check');

// Product Recommendations (Public API)
Route::prefix('api/recommendations')->name('recommendations.')->group(function () {
    Route::get('/frequently-bought/{productId}', [RecommendationController::class, 'frequentlyBought'])->name('frequently-bought');
    Route::get('/also-viewed/{productId}', [RecommendationController::class, 'alsoViewed'])->name('also-viewed');
    Route::get('/similar/{productId}', [RecommendationController::class, 'similar'])->name('similar');
    Route::get('/trending', [RecommendationController::class, 'trending'])->name('trending');
    Route::post('/track-view/{productId}', [RecommendationController::class, 'trackView'])->name('track-view');
});

// Personalized Recommendations (requires auth)
Route::middleware('auth')->get('/api/recommendations/for-you', [RecommendationController::class, 'forYou'])->name('recommendations.for-you');


// Newsletter Routes (Public)
Route::post('/newsletter/subscribe', [NewsletterController::class, 'subscribe'])->name('newsletter.subscribe');
Route::match(['get', 'post'], '/newsletter/unsubscribe/{token}', [NewsletterController::class, 'unsubscribe'])->name('newsletter.unsubscribe');
Route::match(['get', 'post'], '/newsletter/preferences/{token}', [NewsletterController::class, 'preferences'])->name('newsletter.preferences');
Route::get('/newsletter/resubscribe/{token}', [NewsletterController::class, 'resubscribe'])->name('newsletter.resubscribe');

// Email Tracking Routes (Public)
Route::get('/email/track/open/{campaign}/{email}', [EmailTrackingController::class, 'trackOpen'])->name('email.track.open');
Route::get('/email/track/click/{campaign}/{email}', [EmailTrackingController::class, 'trackClick'])->name('email.track.click');

// Midtrans Webhook (Public - untuk menerima notifikasi dari Midtrans)
Route::post('/midtrans/notification', [\App\Http\Controllers\User\MidtransController::class, 'notification'])->name('midtrans.notification');

// Raja Ongkir proxy (requires auth to prevent API abuse)
Route::middleware('auth')->prefix('rajaongkir')->name('rajaongkir.')->group(function () {
    Route::get('/provinces', [RajaOngkirController::class, 'provinces'])->name('provinces');
    Route::get('/cities', [RajaOngkirController::class, 'cities'])->name('cities');
    Route::get('/destinations', [RajaOngkirController::class, 'destinations'])->name('destinations');
    Route::post('/cost', [RajaOngkirController::class, 'cost'])->name('cost');
});

// Shipping Routes (requires auth)
Route::middleware('auth')->prefix('shipping')->name('shipping.')->group(function () {
    Route::get('/calculate', [\App\Http\Controllers\ShippingController::class, 'calculateCost'])->name('calculate');
    Route::get('/compare', [\App\Http\Controllers\ShippingController::class, 'compare'])->name('compare');
    Route::get('/track/{orderNumber}', [\App\Http\Controllers\ShippingController::class, 'track'])->name('track');
    Route::get('/insurance/calculate', [\App\Http\Controllers\ShippingController::class, 'calculateInsurance'])->name('insurance.calculate');
});

// Wilayah Indonesia proxy (thecloudalert.com – province / kabkota / kecamatan / kelurahan)
Route::middleware('auth')->prefix('wilayah')->name('wilayah.')->group(function () {
    Route::get('/provinces',  [WilayahController::class, 'provinces'])->name('provinces');
    Route::get('/kabkota',    [WilayahController::class, 'kabkota'])->name('kabkota');
    Route::get('/kecamatan',  [WilayahController::class, 'kecamatan'])->name('kecamatan');
    Route::get('/kelurahan',  [WilayahController::class, 'kelurahan'])->name('kelurahan');
});

Route::get('/dashboard', function () {
    $user = auth()->user();

    if ($user->isAdmin()) {
        return redirect()->route('admin.dashboard');
    }

    return redirect()->route('user.dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');

        // Banner Management
        Route::get('/banners', [BannerManagementController::class, 'index'])->name('banners.index');
        Route::post('/banners', [BannerManagementController::class, 'store'])->name('banners.store');
        Route::post('/banners/{banner}', [BannerManagementController::class, 'update'])->name('banners.update');
        Route::delete('/banners/{banner}', [BannerManagementController::class, 'destroy'])->name('banners.destroy');
        Route::patch('/banners/{banner}/toggle', [BannerManagementController::class, 'toggle'])->name('banners.toggle');
        Route::post('/banners/reorder', [BannerManagementController::class, 'reorder'])->name('banners.reorder');

        Route::get('/products', [ProductManagementController::class, 'index'])->name('products.index');
        Route::post('/products', [ProductManagementController::class, 'store'])->name('products.store');
        Route::put('/products/{product}', [ProductManagementController::class, 'update'])->name('products.update');
        Route::delete('/products/{product}', [ProductManagementController::class, 'destroy'])->name('products.destroy');
        Route::delete('/product-images/{image}', [ProductManagementController::class, 'destroyImage'])->name('products.images.destroy');
        
        // Product Colors Routes
        Route::get('/products/{product}/colors', [ProductColorController::class, 'index'])->name('products.colors.index');
        Route::post('/products/{product}/colors', [ProductColorController::class, 'store'])->name('products.colors.store');
        Route::put('/products/colors/{color}', [ProductColorController::class, 'update'])->name('products.colors.update');
        Route::delete('/products/colors/{color}', [ProductColorController::class, 'destroy'])->name('products.colors.destroy');
        Route::post('/products/colors/{color}/images', [ProductColorController::class, 'uploadImages'])->name('products.colors.images');
        Route::delete('/products/colors/images/{image}', [ProductColorController::class, 'deleteImage'])->name('products.colors.images.delete');
        
        // Product Variants Routes
        Route::get('/products/{product}/variants', [ProductVariantController::class, 'getVariants'])->name('products.variants.index');
        Route::post('/products/{product}/variants/stock', [ProductVariantController::class, 'updateVariantStock'])->name('products.variants.stock');
        
        // Pre-Orders Management Routes
        Route::get('/pre-orders', [AdminPreOrderController::class, 'index'])->name('pre-orders.index');
        Route::put('/pre-orders/{preOrder}/status', [AdminPreOrderController::class, 'updateStatus'])->name('pre-orders.status');
        Route::post('/pre-orders/{preOrder}/notify', [AdminPreOrderController::class, 'notifyAvailable'])->name('pre-orders.notify');
        Route::post('/pre-orders/product/{product}/notify-all', [AdminPreOrderController::class, 'bulkNotify'])->name('pre-orders.notify-all');

        Route::get('/categories', [CategoryManagementController::class, 'index'])->name('categories.index');
        Route::post('/categories', [CategoryManagementController::class, 'store'])->name('categories.store');
        Route::put('/categories/{category}', [CategoryManagementController::class, 'update'])->name('categories.update');
        Route::delete('/categories/{category}', [CategoryManagementController::class, 'destroy'])->name('categories.destroy');

        Route::get('/orders', [OrderManagementController::class, 'index'])->name('orders.index');
        Route::patch('/orders/{order}/status', [OrderManagementController::class, 'updateStatus'])->name('orders.update-status');
        Route::patch('/orders/{order}/verify-payment', [OrderManagementController::class, 'verifyPayment'])->name('orders.verify-payment');
        Route::post('/orders/{order}/cancel', [OrderManagementController::class, 'cancelOrder'])->name('orders.cancel');
        Route::get('/returns', [ReturnRequestManagementController::class, 'index'])->name('returns.index');
        Route::get('/returns/{returnRequest}', [ReturnRequestManagementController::class, 'show'])->name('returns.show');
        Route::patch('/returns/{returnRequest}/status', [ReturnRequestManagementController::class, 'updateStatus'])->name('returns.update-status');
        Route::get('/returns', [ReturnRequestManagementController::class, 'index'])->name('returns.index');
        Route::get('/returns/{returnRequest}', [ReturnRequestManagementController::class, 'show'])->name('returns.show');
        Route::patch('/returns/{returnRequest}/status', [ReturnRequestManagementController::class, 'updateStatus'])->name('returns.update-status');

        // Inventory Management Routes
        Route::get('/inventory', [\App\Http\Controllers\Admin\InventoryController::class, 'index'])->name('inventory.index');
        Route::get('/inventory/low-stock', [\App\Http\Controllers\Admin\InventoryController::class, 'lowStock'])->name('inventory.low-stock');
        Route::get('/inventory/{product}/history', [\App\Http\Controllers\Admin\InventoryController::class, 'stockHistory'])->name('inventory.history');
        Route::post('/inventory/{product}/restock', [\App\Http\Controllers\Admin\InventoryController::class, 'restock'])->name('inventory.restock');
        Route::post('/inventory/{product}/adjust', [\App\Http\Controllers\Admin\InventoryController::class, 'adjust'])->name('inventory.adjust');
        Route::post('/inventory/{product}/damaged', [\App\Http\Controllers\Admin\InventoryController::class, 'damaged'])->name('inventory.damaged');
        Route::get('/inventory/{product}/export-history', [\App\Http\Controllers\Admin\InventoryController::class, 'exportHistory'])->name('inventory.export-history');

        Route::get('/users', [UserManagementController::class, 'index'])->name('users.index');
        Route::patch('/users/{user}/role', [UserManagementController::class, 'updateRole'])->name('users.update-role');
        Route::patch('/users/{user}/toggle-active', [UserManagementController::class, 'toggleActive'])->name('users.toggle-active');

        Route::get('/promotions', [PromotionManagementController::class, 'index'])->name('promotions.index');
        Route::post('/promotions', [PromotionManagementController::class, 'store'])->name('promotions.store');
        Route::put('/promotions/{promotion}', [PromotionManagementController::class, 'update'])->name('promotions.update');
        Route::patch('/promotions/{promotion}/toggle', [PromotionManagementController::class, 'toggle'])->name('promotions.toggle');
        Route::delete('/promotions/{promotion}', [PromotionManagementController::class, 'destroy'])->name('promotions.destroy');

        Route::get('/shipping', [ShippingManagementController::class, 'index'])->name('shipping.index');
        Route::post('/shipping', [ShippingManagementController::class, 'store'])->name('shipping.store');
        Route::delete('/shipping/{shippingMethod}', [ShippingManagementController::class, 'destroy'])->name('shipping.destroy');

        // Courier Services Management
        Route::get('/courier-services', [\App\Http\Controllers\Admin\CourierServiceController::class, 'index'])->name('courier-services.index');
        Route::post('/courier-services', [\App\Http\Controllers\Admin\CourierServiceController::class, 'store'])->name('courier-services.store');
        Route::put('/courier-services/{courierService}', [\App\Http\Controllers\Admin\CourierServiceController::class, 'update'])->name('courier-services.update');
        Route::delete('/courier-services/{courierService}', [\App\Http\Controllers\Admin\CourierServiceController::class, 'destroy'])->name('courier-services.destroy');
        Route::post('/courier-services/{courierService}/toggle', [\App\Http\Controllers\Admin\CourierServiceController::class, 'toggle'])->name('courier-services.toggle');

        Route::get('/reviews', [ReviewManagementController::class, 'index'])->name('reviews.index');
        Route::delete('/reviews/{review}', [ReviewManagementController::class, 'destroy'])->name('reviews.destroy');
        Route::patch('/reviews/{review}/reply', [ReviewManagementController::class, 'reply'])->name('reviews.reply');
        Route::patch('/reviews/{review}/flag-spam', [ReviewManagementController::class, 'flagSpam'])->name('reviews.flag-spam');

        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/export/csv', [ReportController::class, 'exportCsv'])->name('reports.export-csv');
        Route::get('/reports/export/excel', [ReportController::class, 'exportExcel'])->name('reports.export-excel');
        Route::get('/reports/export/pdf', [ReportController::class, 'exportPdfView'])->name('reports.export-pdf');
        
        // Enhanced Analytics Reports
        Route::get('/reports/clv', [ReportController::class, 'customerLifetimeValue'])->name('reports.clv');
        Route::get('/reports/product-performance', [ReportController::class, 'productPerformance'])->name('reports.product-performance');
        Route::get('/reports/conversion-funnel', [ReportController::class, 'conversionFunnel'])->name('reports.conversion-funnel');
        Route::get('/reports/abandoned-carts', [ReportController::class, 'abandonedCarts'])->name('reports.abandoned-carts');
        Route::get('/reports/revenue-analysis', [ReportController::class, 'revenueAnalysis'])->name('reports.revenue-analysis');
        Route::get('/reports/customer-segmentation', [ReportController::class, 'customerSegmentation'])->name('reports.customer-segmentation');
        Route::get('/reports/marketing-performance', [ReportController::class, 'marketingPerformance'])->name('reports.marketing-performance');
        Route::get('/reports/export/{type}', [ReportController::class, 'exportReport'])->name('reports.export');

        Route::get('/settings', [SettingsManagementController::class, 'index'])->name('settings.index');
        Route::patch('/settings', [SettingsManagementController::class, 'update'])->name('settings.update');

        Route::get('/flash-sales', [FlashSaleManagementController::class, 'index'])->name('flash-sales.index');
        Route::post('/flash-sales', [FlashSaleManagementController::class, 'store'])->name('flash-sales.store');
        Route::put('/flash-sales/{flashSale}', [FlashSaleManagementController::class, 'update'])->name('flash-sales.update');
        Route::delete('/flash-sales/{flashSale}', [FlashSaleManagementController::class, 'destroy'])->name('flash-sales.destroy');
        Route::post('/flash-sales/{flashSale}/toggle', [FlashSaleManagementController::class, 'toggle'])->name('flash-sales.toggle');

        // Bulk Operations Routes
        Route::get('/bulk-operations', [BulkOperationController::class, 'index'])->name('bulk-operations.index');
        Route::post('/products/export', [BulkOperationController::class, 'exportProducts'])->name('products.export');
        Route::post('/products/import', [BulkOperationController::class, 'importProducts'])->name('products.import');
        Route::get('/products/import-template', [BulkOperationController::class, 'downloadTemplate'])->name('products.import-template');
        Route::post('/products/bulk-update-prices', [BulkOperationController::class, 'bulkUpdatePrices'])->name('products.bulk-update-prices');
        Route::post('/products/bulk-update-stock', [BulkOperationController::class, 'bulkUpdateStock'])->name('products.bulk-update-stock');
        Route::post('/products/bulk-delete', [BulkOperationController::class, 'bulkDelete'])->name('products.bulk-delete');
        Route::post('/products/bulk-toggle-status', [BulkOperationController::class, 'bulkToggleStatus'])->name('products.bulk-toggle-status');
        Route::post('/products/bulk-assign-category', [BulkOperationController::class, 'bulkAssignCategory'])->name('products.bulk-assign-category');
        Route::post('/orders/export', [BulkOperationController::class, 'exportOrders'])->name('orders.export');
        Route::post('/customers/export', [BulkOperationController::class, 'exportCustomers'])->name('customers.export');

        // Chat routes
        Route::get('/chat', [AdminChatController::class, 'index'])->name('chat.index');
        Route::get('/chat/conversations', [AdminChatController::class, 'conversations'])->name('chat.conversations');
        Route::get('/chat/{user}/messages', [AdminChatController::class, 'messages'])->name('chat.messages');
        Route::post('/chat/{user}/reply', [AdminChatController::class, 'reply'])->name('chat.reply');
        Route::post('/chat/{user}/attachment', [AdminChatController::class, 'uploadAttachment'])->name('chat.attachment');
        Route::patch('/chat/{user}/mark-read', [AdminChatController::class, 'markAsRead'])->name('chat.mark-read');
        Route::get('/chat/active-users', [AdminChatController::class, 'activeUsers'])->name('chat.active-users');

        // Loyalty Program Management
        Route::get('/loyalty', [AdminLoyaltyController::class, 'index'])->name('loyalty.index');
        Route::post('/loyalty/{user}/adjust', [AdminLoyaltyController::class, 'adjustPoints'])->name('loyalty.adjust');
        Route::get('/loyalty/statistics', [AdminLoyaltyController::class, 'statistics'])->name('loyalty.statistics');

        // Security Routes
        Route::get('/security', [SecurityDashboardController::class, 'index'])->name('security.index');
        Route::get('/activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');
        Route::get('/activity-logs/user/{userId}', [ActivityLogController::class, 'userActivity'])->name('activity-logs.user');
        Route::post('/activity-logs/export', [ActivityLogController::class, 'export'])->name('activity-logs.export');
        Route::get('/security/blocked-ips', [IpBlockingController::class, 'index'])->name('security.blocked-ips');
        Route::post('/security/blocked-ips', [IpBlockingController::class, 'store'])->name('security.blocked-ips.store');
        Route::delete('/security/blocked-ips/{id}', [IpBlockingController::class, 'destroy'])->name('security.blocked-ips.destroy');

        // Email Campaign Management
        Route::get('/email-campaigns', [EmailCampaignController::class, 'index'])->name('email-campaigns.index');
        Route::get('/email-campaigns/create', [EmailCampaignController::class, 'create'])->name('email-campaigns.create');
        Route::post('/email-campaigns', [EmailCampaignController::class, 'store'])->name('email-campaigns.store');
        Route::get('/email-campaigns/{id}/edit', [EmailCampaignController::class, 'edit'])->name('email-campaigns.edit');
        Route::put('/email-campaigns/{id}', [EmailCampaignController::class, 'update'])->name('email-campaigns.update');
        Route::delete('/email-campaigns/{id}', [EmailCampaignController::class, 'destroy'])->name('email-campaigns.destroy');
        Route::post('/email-campaigns/{id}/send', [EmailCampaignController::class, 'send'])->name('email-campaigns.send');
        Route::post('/email-campaigns/{id}/schedule', [EmailCampaignController::class, 'schedule'])->name('email-campaigns.schedule');
        
        // Recommendation Management
        Route::post('/recommendations/generate', [RecommendationManagementController::class, 'generate'])->name('recommendations.generate');
    });

Route::middleware(['auth', 'verified', 'role:user'])
    ->prefix('user')
    ->name('user.')
    ->group(function () {
        Route::get('/', [UserDashboardController::class, 'index'])->name('dashboard');

        Route::get('/orders', [UserOrderController::class, 'index'])->name('orders.index');
        Route::get('/orders/{order}', [UserOrderController::class, 'show'])->name('orders.show');
        Route::post('/orders/{order}/delivery-proof', [UserOrderController::class, 'uploadDeliveryProof'])->name('orders.delivery-proof');
        Route::post('/orders/{order}/returns', [ReturnRequestController::class, 'store'])->name('orders.returns.store');
        Route::get('/returns', [ReturnRequestController::class, 'index'])->name('returns.index');
        Route::get('/returns/{returnRequest}', [ReturnRequestController::class, 'show'])->name('returns.show');
        Route::post('/orders/{order}/returns', [ReturnRequestController::class, 'store'])->name('orders.returns.store');
        Route::get('/returns', [ReturnRequestController::class, 'index'])->name('returns.index');
        Route::get('/returns/{returnRequest}', [ReturnRequestController::class, 'show'])->name('returns.show');

        Route::get('/wishlist', [UserWishlistController::class, 'index'])->name('wishlist.index');
        Route::post('/wishlist', [UserWishlistController::class, 'store'])->name('wishlist.store');
        Route::post('/wishlist/toggle', [UserWishlistController::class, 'toggleByProduct'])->name('wishlist.toggle');
        Route::delete('/wishlist/{wishlist}', [UserWishlistController::class, 'destroy'])->name('wishlist.destroy');
        Route::patch('/wishlist/{wishlist}/move-to-cart', [UserWishlistController::class, 'moveToCart'])->name('wishlist.move-to-cart');

        Route::get('/cart', [UserCartController::class, 'index'])->name('cart.index');
        Route::post('/cart', [UserCartController::class, 'store'])->name('cart.store');
        Route::put('/cart/{cart}', [UserCartController::class, 'update'])->name('cart.update');
        Route::delete('/cart/{cart}', [UserCartController::class, 'destroy'])->name('cart.destroy');
        
        // Pre-Order Routes
        Route::get('/pre-orders', [PreOrderController::class, 'index'])->name('pre-orders.index');
        Route::post('/pre-orders', [PreOrderController::class, 'store'])->name('pre-orders.store');
        Route::get('/pre-orders/{preOrder}', [PreOrderController::class, 'show'])->name('pre-orders.show');
        Route::post('/pre-orders/{preOrder}/cancel', [PreOrderController::class, 'cancel'])->name('pre-orders.cancel');
        Route::post('/pre-orders/{preOrder}/complete', [PreOrderController::class, 'complete'])->name('pre-orders.complete');

        Route::get('/checkout', [UserCheckoutController::class, 'index'])->name('checkout.index');
        Route::post('/checkout', [UserCheckoutController::class, 'store'])->name('checkout.store');

        // Order Tracking
        Route::get('/track-order', function () {
            return inertia('User/OrderTracking');
        })->name('track-order');

        // Promotion routes
        Route::post('/promotions/validate', [\App\Http\Controllers\User\PromotionController::class, 'validate'])->name('promotions.validate');
        Route::get('/promotions/available', [\App\Http\Controllers\User\PromotionController::class, 'available'])->name('promotions.available');

        // Delivery Schedule Routes
        Route::get('/delivery/available-dates', [DeliveryScheduleController::class, 'getAvailableDates'])->name('delivery.available-dates');
        Route::get('/delivery/available-slots', [DeliveryScheduleController::class, 'getAvailableSlots'])->name('delivery.available-slots');
        Route::post('/delivery/check-same-day', [DeliveryScheduleController::class, 'checkSameDayAvailability'])->name('delivery.check-same-day');
        Route::post('/delivery/validate-schedule', [DeliveryScheduleController::class, 'validateSchedule'])->name('delivery.validate-schedule');
        Route::put('/orders/{order}/update-schedule', [DeliveryScheduleController::class, 'updateSchedule'])->name('orders.update-schedule');

        Route::get('/addresses', [UserAddressController::class, 'index'])->name('addresses.index');
        Route::post('/addresses', [UserAddressController::class, 'store'])->name('addresses.store');
        Route::put('/addresses/{address}', [UserAddressController::class, 'update'])->name('addresses.update');
        Route::delete('/addresses/{address}', [UserAddressController::class, 'destroy'])->name('addresses.destroy');
        Route::patch('/addresses/{address}/default', [UserAddressController::class, 'setDefault'])->name('addresses.set-default');

        Route::get('/payments', [UserPaymentController::class, 'index'])->name('payments.index');
        Route::patch('/payments/{payment}/proof', [UserPaymentController::class, 'uploadProof'])->name('payments.upload-proof');

        // Midtrans Payment Routes
        Route::post('/midtrans/create-snap-token/{order}', [\App\Http\Controllers\User\MidtransController::class, 'createSnapToken'])->name('midtrans.create-snap-token');
        Route::get('/midtrans/check-status/{order}', [\App\Http\Controllers\User\MidtransController::class, 'checkStatus'])->name('midtrans.check-status');

        Route::get('/reviews', [UserReviewController::class, 'index'])->name('reviews.index');
        Route::post('/reviews', [UserReviewController::class, 'store'])->name('reviews.store');
        Route::delete('/reviews/{review}', [UserReviewController::class, 'destroy'])->name('reviews.destroy');
        Route::post('/reviews/{review}/vote', [ReviewVoteController::class, 'vote'])->name('reviews.vote');

        Route::get('/comparison', [UserComparisonController::class, 'index'])->name('comparison.index');
        Route::post('/comparison', [UserComparisonController::class, 'store'])->name('comparison.store');
        Route::delete('/comparison/{product}', [UserComparisonController::class, 'destroy'])->name('comparison.destroy');
        Route::delete('/comparison', [UserComparisonController::class, 'clear'])->name('comparison.clear');
        Route::get('/comparison/count', [UserComparisonController::class, 'count'])->name('comparison.count');
        Route::get('/comparison/check/{product}', [UserComparisonController::class, 'check'])->name('comparison.check');

        Route::get('/notifications', [UserNotificationController::class, 'index'])->name('notifications.index');
        Route::patch('/notifications/{notification}/read', [UserNotificationController::class, 'markRead'])->name('notifications.mark-read');

        // Chat routes
        Route::get('/chat', [UserChatController::class, 'index'])->name('chat.index');
        Route::post('/chat/send', [UserChatController::class, 'store'])->name('chat.send');
        Route::post('/chat/attachment', [UserChatController::class, 'uploadAttachment'])->name('chat.attachment');
        Route::patch('/chat/{message}/read', [UserChatController::class, 'markAsRead'])->name('chat.mark-read');
        Route::patch('/chat/read-all', [UserChatController::class, 'markAllAsRead'])->name('chat.read-all');
        Route::get('/chat/check', [UserChatController::class, 'checkNewMessages'])->name('chat.check');

        // Loyalty Program
        Route::get('/loyalty', [LoyaltyController::class, 'index'])->name('loyalty.index');
        Route::get('/loyalty/history', [LoyaltyController::class, 'history'])->name('loyalty.history');
        Route::post('/loyalty/redeem', [LoyaltyController::class, 'redeem'])->name('loyalty.redeem');
        Route::get('/loyalty/referral', [LoyaltyController::class, 'referral'])->name('loyalty.referral');
    });

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Two-Factor Authentication Routes
Route::middleware('guest')->group(function () {
    Route::get('/two-factor/verify', [TwoFactorController::class, 'showVerifyForm'])->name('two-factor.verify');
    Route::post('/two-factor/verify', [TwoFactorController::class, 'verifyLogin'])->name('two-factor.verify.post');
    Route::post('/two-factor/resend', [TwoFactorController::class, 'resendLoginCode'])->name('two-factor.resend');
});

Route::middleware(['auth', 'verified'])->prefix('user/security')->name('user.security.')->group(function () {
    Route::get('/2fa', [TwoFactorController::class, 'index'])->name('2fa');
    Route::post('/2fa/enable', [TwoFactorController::class, 'enable'])->name('2fa.enable');
    Route::post('/2fa/disable', [TwoFactorController::class, 'disable'])->name('2fa.disable');
    Route::post('/2fa/send-code', [TwoFactorController::class, 'sendCode'])->name('2fa.send-code');
    Route::post('/2fa/verify', [TwoFactorController::class, 'verify'])->name('2fa.verify');
});

require __DIR__.'/auth.php';
