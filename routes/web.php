<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\RajaOngkirController;
use App\Http\Controllers\WilayahController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\CategoryManagementController;
use App\Http\Controllers\Admin\OrderManagementController;
use App\Http\Controllers\Admin\ProductManagementController;
use App\Http\Controllers\Admin\PromotionManagementController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\ReviewManagementController;
use App\Http\Controllers\Admin\SettingsManagementController;
use App\Http\Controllers\Admin\ShippingManagementController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\User\UserAddressController;
use App\Http\Controllers\User\UserCartController;
use App\Http\Controllers\User\UserCheckoutController;
use App\Http\Controllers\User\UserDashboardController;
use App\Http\Controllers\User\UserNotificationController;
use App\Http\Controllers\User\UserOrderController;
use App\Http\Controllers\User\UserPaymentController;
use App\Http\Controllers\User\UserReviewController;
use App\Http\Controllers\User\UserWishlistController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index']);

// Raja Ongkir proxy (requires auth to prevent API abuse)
Route::middleware('auth')->prefix('rajaongkir')->name('rajaongkir.')->group(function () {
    Route::get('/provinces', [RajaOngkirController::class, 'provinces'])->name('provinces');
    Route::get('/cities', [RajaOngkirController::class, 'cities'])->name('cities');
    Route::get('/destinations', [RajaOngkirController::class, 'destinations'])->name('destinations');
    Route::post('/cost', [RajaOngkirController::class, 'cost'])->name('cost');
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

        Route::get('/products', [ProductManagementController::class, 'index'])->name('products.index');
        Route::post('/products', [ProductManagementController::class, 'store'])->name('products.store');
        Route::put('/products/{product}', [ProductManagementController::class, 'update'])->name('products.update');
        Route::delete('/products/{product}', [ProductManagementController::class, 'destroy'])->name('products.destroy');
        Route::delete('/product-images/{image}', [ProductManagementController::class, 'destroyImage'])->name('products.images.destroy');

        Route::get('/categories', [CategoryManagementController::class, 'index'])->name('categories.index');
        Route::post('/categories', [CategoryManagementController::class, 'store'])->name('categories.store');
        Route::put('/categories/{category}', [CategoryManagementController::class, 'update'])->name('categories.update');
        Route::delete('/categories/{category}', [CategoryManagementController::class, 'destroy'])->name('categories.destroy');

        Route::get('/orders', [OrderManagementController::class, 'index'])->name('orders.index');
        Route::patch('/orders/{order}/status', [OrderManagementController::class, 'updateStatus'])->name('orders.update-status');
        Route::patch('/orders/{order}/verify-payment', [OrderManagementController::class, 'verifyPayment'])->name('orders.verify-payment');

        Route::get('/users', [UserManagementController::class, 'index'])->name('users.index');
        Route::patch('/users/{user}/role', [UserManagementController::class, 'updateRole'])->name('users.update-role');
        Route::patch('/users/{user}/toggle-active', [UserManagementController::class, 'toggleActive'])->name('users.toggle-active');

        Route::get('/promotions', [PromotionManagementController::class, 'index'])->name('promotions.index');
        Route::post('/promotions', [PromotionManagementController::class, 'store'])->name('promotions.store');
        Route::delete('/promotions/{promotion}', [PromotionManagementController::class, 'destroy'])->name('promotions.destroy');

        Route::get('/shipping', [ShippingManagementController::class, 'index'])->name('shipping.index');
        Route::post('/shipping', [ShippingManagementController::class, 'store'])->name('shipping.store');
        Route::delete('/shipping/{shippingMethod}', [ShippingManagementController::class, 'destroy'])->name('shipping.destroy');

        Route::get('/reviews', [ReviewManagementController::class, 'index'])->name('reviews.index');
        Route::delete('/reviews/{review}', [ReviewManagementController::class, 'destroy'])->name('reviews.destroy');
        Route::patch('/reviews/{review}/reply', [ReviewManagementController::class, 'reply'])->name('reviews.reply');

        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/export/csv', [ReportController::class, 'exportCsv'])->name('reports.export-csv');
        Route::get('/reports/export/excel', [ReportController::class, 'exportExcel'])->name('reports.export-excel');
        Route::get('/reports/export/pdf', [ReportController::class, 'exportPdfView'])->name('reports.export-pdf');

        Route::get('/settings', [SettingsManagementController::class, 'index'])->name('settings.index');
        Route::patch('/settings', [SettingsManagementController::class, 'update'])->name('settings.update');
    });

Route::middleware(['auth', 'verified', 'role:user'])
    ->prefix('user')
    ->name('user.')
    ->group(function () {
        Route::get('/', [UserDashboardController::class, 'index'])->name('dashboard');

        Route::get('/orders', [UserOrderController::class, 'index'])->name('orders.index');
        Route::get('/orders/{order}', [UserOrderController::class, 'show'])->name('orders.show');
        Route::post('/orders/{order}/delivery-proof', [UserOrderController::class, 'uploadDeliveryProof'])->name('orders.delivery-proof');

        Route::get('/wishlist', [UserWishlistController::class, 'index'])->name('wishlist.index');
        Route::post('/wishlist', [UserWishlistController::class, 'store'])->name('wishlist.store');
        Route::post('/wishlist/toggle', [UserWishlistController::class, 'toggleByProduct'])->name('wishlist.toggle');
        Route::delete('/wishlist/{wishlist}', [UserWishlistController::class, 'destroy'])->name('wishlist.destroy');
        Route::patch('/wishlist/{wishlist}/move-to-cart', [UserWishlistController::class, 'moveToCart'])->name('wishlist.move-to-cart');

        Route::get('/cart', [UserCartController::class, 'index'])->name('cart.index');
        Route::post('/cart', [UserCartController::class, 'store'])->name('cart.store');
        Route::put('/cart/{cart}', [UserCartController::class, 'update'])->name('cart.update');
        Route::delete('/cart/{cart}', [UserCartController::class, 'destroy'])->name('cart.destroy');

        Route::get('/checkout', [UserCheckoutController::class, 'index'])->name('checkout.index');
        Route::post('/checkout', [UserCheckoutController::class, 'store'])->name('checkout.store');

        Route::get('/addresses', [UserAddressController::class, 'index'])->name('addresses.index');
        Route::post('/addresses', [UserAddressController::class, 'store'])->name('addresses.store');
        Route::put('/addresses/{address}', [UserAddressController::class, 'update'])->name('addresses.update');
        Route::delete('/addresses/{address}', [UserAddressController::class, 'destroy'])->name('addresses.destroy');
        Route::patch('/addresses/{address}/default', [UserAddressController::class, 'setDefault'])->name('addresses.set-default');

        Route::get('/payments', [UserPaymentController::class, 'index'])->name('payments.index');
        Route::patch('/payments/{payment}/proof', [UserPaymentController::class, 'uploadProof'])->name('payments.upload-proof');

        Route::get('/reviews', [UserReviewController::class, 'index'])->name('reviews.index');
        Route::post('/reviews', [UserReviewController::class, 'store'])->name('reviews.store');
        Route::delete('/reviews/{review}', [UserReviewController::class, 'destroy'])->name('reviews.destroy');

        Route::get('/notifications', [UserNotificationController::class, 'index'])->name('notifications.index');
        Route::patch('/notifications/{notification}/read', [UserNotificationController::class, 'markRead'])->name('notifications.mark-read');
    });

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
