<?php

use App\Http\Controllers\Admin\AdminCustomerController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminOrderController;
use App\Http\Controllers\Admin\AdminProductController;
use App\Http\Controllers\Admin\AdminRetailerReviewController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CustomerPortalController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\RetailerController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\WishlistController;
use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\EnsureUserIsRetailer;
use Illuminate\Support\Facades\Route;

// Public Shop Routes
Route::get('/', [ShopController::class, 'index'])->name('home');
Route::get('/catalog', [ShopController::class, 'catalog'])->name('catalog');
Route::get('/product/{product:slug}', [ShopController::class, 'show'])->name('product.show');

// Cart & Wishlist Routes
Route::post('/cart/add', [CartController::class, 'store'])->name('cart.add');
Route::post('/cart/update', [CartController::class, 'update'])->name('cart.update');
Route::post('/cart/remove', [CartController::class, 'destroy'])->name('cart.remove');
Route::post('/cart/clear', [CartController::class, 'clear'])->name('cart.clear');

Route::post('/wishlist/{product:id}/toggle', [WishlistController::class, 'toggle'])->name('wishlist.toggle');
Route::delete('/wishlist/{product:id}', [WishlistController::class, 'destroy'])->name('wishlist.destroy');

// Authenticated Customer Portal & Checkout
Route::middleware(['auth'])->group(function () {
    Route::get('/checkout', [ShopController::class, 'checkout'])->name('checkout');
    Route::post('/checkout', [OrderController::class, 'store'])->name('checkout.place-order');
    Route::get('/order-success/{order}', [ShopController::class, 'orderSuccess'])->name('ordersuccess');

    Route::get('/dashboard', [CustomerPortalController::class, 'dashboard'])->name('dashboard');
    Route::get('/my-orders', [CustomerPortalController::class, 'orders'])->name('myorders');
    Route::get('/order-view/{order}', [CustomerPortalController::class, 'orderView'])->name('orderview');
    Route::get('/my-addresses', [CustomerPortalController::class, 'addresses'])->name('myaddresses');
    Route::post('/my-addresses', [CustomerPortalController::class, 'storeAddress'])->name('myaddresses.store');
    Route::delete('/my-addresses/{address}', [CustomerPortalController::class, 'deleteAddress'])->name('myaddresses.destroy');
    Route::post('/my-addresses/{address}/default', [CustomerPortalController::class, 'setDefaultAddress'])->name('myaddresses.default');

    Route::get('/profile', [CustomerPortalController::class, 'profile'])->name('profile');
    Route::post('/profile', [CustomerPortalController::class, 'updateProfile'])->name('profile.update');
    Route::get('/wishlist', [CustomerPortalController::class, 'wishlist'])->name('wishlist');
    Route::get('/apply-to-retailer', [CustomerPortalController::class, 'applyRetailer'])->name('applytoretailer');
    Route::post('/apply-to-retailer', [CustomerPortalController::class, 'submitRetailer'])->name('applytoretailer.submit');
    Route::get('/accounts', [CustomerPortalController::class, 'accounts'])->name('accounts');
});

// Admin Routes
Route::middleware(['auth', 'verified', EnsureUserIsAdmin::class])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

        Route::get('/products', [AdminProductController::class, 'index'])->name('products.index');
        Route::get('/products/create', [AdminProductController::class, 'create'])->name('products.create');
        Route::post('/products', [AdminProductController::class, 'store'])->name('products.store');
        Route::get('/products/{product:id}/edit', [AdminProductController::class, 'edit'])->name('products.edit');
        Route::put('/products/{product:id}', [AdminProductController::class, 'update'])->name('products.update');
        Route::delete('/products/{product:id}', [AdminProductController::class, 'destroy'])->name('products.destroy');

        Route::get('/orders', [AdminOrderController::class, 'index'])->name('orders.index');
        Route::get('/orders/{order}', [AdminOrderController::class, 'show'])->name('orders.show');
        Route::post('/orders/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('orders.status');
        Route::post('/orders/{order}/payment-status', [AdminOrderController::class, 'updatePaymentStatus'])->name('orders.payment-status');

        Route::get('/review-retailer', [AdminRetailerReviewController::class, 'index'])->name('reviewretailer');
        Route::post('/review-retailer/{user}/approve', [AdminRetailerReviewController::class, 'approve'])->name('reviewretailer.approve');
        Route::post('/review-retailer/{user}/reject', [AdminRetailerReviewController::class, 'reject'])->name('reviewretailer.reject');

        Route::get('/customers', [AdminCustomerController::class, 'index'])->name('customers');
        Route::post('/customers/{user}/toggle-active', [AdminCustomerController::class, 'toggleActive'])->name('customers.toggle-active');
    });

// Retailer Routes
Route::middleware(['auth', 'verified', EnsureUserIsRetailer::class])
    ->prefix('retailer')
    ->name('retailer.')
    ->group(function () {
        Route::get('/dashboard', [RetailerController::class, 'dashboard'])->name('dashboard');
    });
