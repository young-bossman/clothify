<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\V1\AuthController;
use App\Http\Controllers\API\V1\ProductController;
use App\Http\Controllers\API\V1\ProductVariantController;
use App\Http\Controllers\API\V1\CategoryController;
use App\Http\Controllers\API\V1\StatsController;
use App\Http\Controllers\API\V1\OrderController;

Route::prefix('v1')->group(function () {

    // Public auth routes — web clients get session, mobile clients get Bearer tokens
    // Ensure web middleware runs for these so session cookies are created for browser clients
    Route::middleware('web')->post('/register', [AuthController::class, 'register']);
    Route::middleware('web')->post('/login',    [AuthController::class, 'login']);

    // Public storefront reads — intentionally unauthenticated
    Route::get('/products',           [ProductController::class, 'index']);
    Route::get('/products/{product}', [ProductController::class, 'show']);
    Route::get('/categories',         [CategoryController::class, 'index']);

    // Authenticated routes
    Route::middleware(['auth:sanctum'])->group(function () {

        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me',      [AuthController::class, 'me']);

        // Customer — any authenticated user can place orders
        Route::post('/orders', [OrderController::class, 'store']);

        // Admin / Staff only
        Route::middleware('admin')->group(function () {

            Route::get('/stats', [StatsController::class, 'index']);

            // Products
            Route::post('/products',                        [ProductController::class, 'store']);
            Route::put('/products/{product}',               [ProductController::class, 'update']);
            Route::delete('/products/{product}',            [ProductController::class, 'destroy']);
            Route::post('/products/{product}/adjust-stock', [ProductController::class, 'adjustStock']);

            // Variants
            Route::post('/product-variants', [ProductVariantController::class, 'store']);

            // Categories
            Route::post('/categories',              [CategoryController::class, 'store']);
            Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

            // Orders management
            Route::get('/orders',                          [OrderController::class, 'index']);
            Route::get('/orders/{order}',                  [OrderController::class, 'show']);
            Route::patch('/orders/{order}/status',         [OrderController::class, 'updateStatus']);
            Route::patch('/orders/{order}/payment-status', [OrderController::class, 'updatePaymentStatus']);
            Route::delete('/orders/{order}',               [OrderController::class, 'destroy']);
        });
    });
});