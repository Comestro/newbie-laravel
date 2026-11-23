<?php

use App\Http\Controllers\Admin\AdminCategoryController;
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

        Route::get('/categories', [AdminCategoryController::class, 'index'])->name('categories.index');
        Route::get('/categories/create', [AdminCategoryController::class, 'create'])->name('categories.create');
        Route::post('/categories', [AdminCategoryController::class, 'store'])->name('categories.store');
        Route::get('/categories/{category}/edit', [AdminCategoryController::class, 'edit'])->name('categories.edit');
        Route::put('/categories/{category}', [AdminCategoryController::class, 'update'])->name('categories.update');
        Route::post('/categories/{category}/toggle-active', [AdminCategoryController::class, 'toggleActive'])->name('categories.toggle-active');
        Route::delete('/categories/{category}', [AdminCategoryController::class, 'destroy'])->name('categories.destroy');

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






    Route::prefix('artisan')->middleware(['auth', 'admin'])->group(function () {
        Route::get('/', function () {
            $csrf = e(csrf_token());
            $html = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LearnSyntax - Artisan Tools</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px 20px; margin: 0; }
        .container { max-width: 680px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 24px; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
        h1 { margin-top: 0; font-size: 20px; color: #38bdf8; display: flex; align-items: center; gap: 8px; }
        p { color: #94a3b8; font-size: 14px; line-height: 1.5; }
        .btn-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 24px; }
        .btn-grid form { margin: 0; }
        button.btn { width: 100%; display: flex; align-items: center; justify-content: center; text-align: center; background: #2563eb; color: white; padding: 14px 12px; border-radius: 8px; font-weight: 700; font-size: 13px; transition: 0.2s; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; }
        button.btn:hover { background: #1d4ed8; transform: translateY(-1px); }
        button.btn-danger { background: #dc2626; }
        button.btn-danger:hover { background: #b91c1c; }
        button.btn-warning { background: #d97706; color: #ffffff; }
        button.btn-warning:hover { background: #b45309; }
        button.btn-success { background: #059669; }
        button.btn-success:hover { background: #047857; }
        .footer { margin-top: 24px; text-align: center; color: #64748b; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🛠️ LearnSyntax - Artisan Utilities</h1>
        <p>Click any action below to safely execute the Artisan command directly from the browser.</p>
        <div class="btn-grid">
            <form method="POST" action="/artisan/migrate"><input type="hidden" name="_token" value="{$csrf}"><button type="submit" class="btn">🚀 php artisan migrate</button></form>
            <form method="POST" action="/artisan/migrate-fresh-seed" onsubmit="return confirm('WARNING: This will drop ALL database tables and re-seed everything. Are you sure you want to proceed?')"><input type="hidden" name="_token" value="{$csrf}"><button type="submit" class="btn btn-danger">⚠️ migrate:fresh --seed</button></form>
            <form method="POST" action="/artisan/optimize-clear"><input type="hidden" name="_token" value="{$csrf}"><button type="submit" class="btn btn-warning">🧹 optimize:clear</button></form>
            <form method="POST" action="/artisan/cache-clear"><input type="hidden" name="_token" value="{$csrf}"><button type="submit" class="btn btn-warning">⚡ cache:clear</button></form>
            <form method="POST" action="/artisan/route-clear"><input type="hidden" name="_token" value="{$csrf}"><button type="submit" class="btn">🛣️ route:clear</button></form>
            <form method="POST" action="/artisan/config-clear"><input type="hidden" name="_token" value="{$csrf}"><button type="submit" class="btn">⚙️ config:clear</button></form>
            <form method="POST" action="/artisan/storage-link"><input type="hidden" name="_token" value="{$csrf}"><button type="submit" class="btn btn-success">🔗 storage:link</button></form>
        </div>
        <div class="footer">LearnSyntax Development Environment (Admin Only)</div>
    </div>
</body>
</html>
HTML;

            return response($html)->header('Content-Type', 'text/html');
        });

        Route::post('/migrate', function () {
            Artisan::call('migrate', ['--force' => true]);
            $output = Artisan::output();

            return response('<div style="background:#0f172a;color:#f8fafc;padding:30px;min-height:100vh;font-family:system-ui;"><div style="max-width:700px;margin:0 auto;"><h2 style="color:#38bdf8;">🚀 php artisan migrate Output:</h2><pre style="background:#1e293b;color:#4ade80;padding:16px;border-radius:8px;border:1px solid #334155;font-family:monospace;white-space:pre-wrap;">'.e($output ?: 'Migrations ran successfully. Nothing to migrate.').'</pre><br><a href="/artisan" style="color:#38bdf8;text-decoration:none;font-weight:bold;">← Back to Artisan Tools</a></div></div>');
        });

        Route::post('/migrate-fresh-seed', function () {
            Artisan::call('migrate:fresh', ['--seed' => true, '--force' => true]);
            $output = Artisan::output();

            return response('<div style="background:#0f172a;color:#f8fafc;padding:30px;min-height:100vh;font-family:system-ui;"><div style="max-width:700px;margin:0 auto;"><h2 style="color:#ef4444;">⚠️ php artisan migrate:fresh --seed Output:</h2><pre style="background:#1e293b;color:#4ade80;padding:16px;border-radius:8px;border:1px solid #334155;font-family:monospace;white-space:pre-wrap;">'.e($output ?: 'Database refreshed and seeded successfully.').'</pre><br><a href="/artisan" style="color:#38bdf8;text-decoration:none;font-weight:bold;">← Back to Artisan Tools</a></div></div>');
        });

        Route::post('/optimize-clear', function () {
            Artisan::call('optimize:clear');
            $output = Artisan::output();

            return response('<div style="background:#0f172a;color:#f8fafc;padding:30px;min-height:100vh;font-family:system-ui;"><div style="max-width:700px;margin:0 auto;"><h2 style="color:#f59e0b;">🧹 php artisan optimize:clear Output:</h2><pre style="background:#1e293b;color:#4ade80;padding:16px;border-radius:8px;border:1px solid #334155;font-family:monospace;white-space:pre-wrap;">'.e($output ?: 'All caches cleared successfully.').'</pre><br><a href="/artisan" style="color:#38bdf8;text-decoration:none;font-weight:bold;">← Back to Artisan Tools</a></div></div>');
        });

        Route::post('/cache-clear', function () {
            Artisan::call('cache:clear');
            $output = Artisan::output();

            return response('<div style="background:#0f172a;color:#f8fafc;padding:30px;min-height:100vh;font-family:system-ui;"><div style="max-width:700px;margin:0 auto;"><h2 style="color:#f59e0b;">⚡ php artisan cache:clear Output:</h2><pre style="background:#1e293b;color:#4ade80;padding:16px;border-radius:8px;border:1px solid #334155;font-family:monospace;white-space:pre-wrap;">'.e($output ?: 'Cache cleared successfully.').'</pre><br><a href="/artisan" style="color:#38bdf8;text-decoration:none;font-weight:bold;">← Back to Artisan Tools</a></div></div>');
        });

        Route::post('/route-clear', function () {
            Artisan::call('route:clear');
            $output = Artisan::output();

            return response('<div style="background:#0f172a;color:#f8fafc;padding:30px;min-height:100vh;font-family:system-ui;"><div style="max-width:700px;margin:0 auto;"><h2 style="color:#38bdf8;">🛣️ php artisan route:clear Output:</h2><pre style="background:#1e293b;color:#4ade80;padding:16px;border-radius:8px;border:1px solid #334155;font-family:monospace;white-space:pre-wrap;">'.e($output ?: 'Route cache cleared successfully.').'</pre><br><a href="/artisan" style="color:#38bdf8;text-decoration:none;font-weight:bold;">← Back to Artisan Tools</a></div></div>');
        });

        Route::post('/config-clear', function () {
            Artisan::call('config:clear');
            $output = Artisan::output();

            return response('<div style="background:#0f172a;color:#f8fafc;padding:30px;min-height:100vh;font-family:system-ui;"><div style="max-width:700px;margin:0 auto;"><h2 style="color:#38bdf8;">⚙️ php artisan config:clear Output:</h2><pre style="background:#1e293b;color:#4ade80;padding:16px;border-radius:8px;border:1px solid #334155;font-family:monospace;white-space:pre-wrap;">'.e($output ?: 'Config cache cleared successfully.').'</pre><br><a href="/artisan" style="color:#38bdf8;text-decoration:none;font-weight:bold;">← Back to Artisan Tools</a></div></div>');
        });

        Route::post('/storage-link', function () {
            Artisan::call('storage:link');
            $output = Artisan::output();

            return response('<div style="background:#0f172a;color:#f8fafc;padding:30px;min-height:100vh;font-family:system-ui;"><div style="max-width:700px;margin:0 auto;"><h2 style="color:#10b981;">🔗 php artisan storage:link Output:</h2><pre style="background:#1e293b;color:#4ade80;padding:16px;border-radius:8px;border:1px solid #334155;font-family:monospace;white-space:pre-wrap;">'.e($output ?: 'Storage link created successfully.').'</pre><br><a href="/artisan" style="color:#38bdf8;text-decoration:none;font-weight:bold;">← Back to Artisan Tools</a></div></div>');
        });
    });