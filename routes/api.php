<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\V1\AuthController;
use App\Http\Controllers\API\V1\ProductController;
use App\Http\Controllers\API\V1\ProductVariantController;
use App\Http\Controllers\API\V1\CategoryController;

Route::prefix('v1')->group(function () {

    // ----------------------------------------
    // Public Auth Routes
    // ----------------------------------------
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);

    // ----------------------------------------
    // Public Storefront Routes (no token needed)
    // ----------------------------------------

    // Products — index handles ?public=1 to filter active only
    // show — customers need to view individual product detail
    // categories — needed to populate filters and pills on storefront
    Route::get('/products',           [ProductController::class, 'index']);
    Route::get('/products/{product}', [ProductController::class, 'show']);
    Route::get('/categories',         [CategoryController::class, 'index']);

    // ----------------------------------------
    // Protected Routes (token required)
    // ----------------------------------------
    Route::middleware('auth:sanctum')->group(function () {

        Route::post('/logout', [AuthController::class, 'logout']);

        Route::get('/me', function (Request $request) {
            return response()->json([
                'id'    => $request->user()->id,
                'name'  => $request->user()->name,
                'email' => $request->user()->email,
            ]);
        });

        // Products — write operations (admin only)
        Route::post('/products',                          [ProductController::class, 'store']);
        Route::put('/products/{product}',                 [ProductController::class, 'update']);
        Route::delete('/products/{product}',              [ProductController::class, 'destroy']);
        Route::post('/products/{product}/adjust-stock',   [ProductController::class, 'adjustStock']);

        // Product variants
        Route::post('/product-variants', [ProductVariantController::class, 'store']);

        // Categories — write operations (admin only)
        Route::post('/categories',              [CategoryController::class, 'store']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

    });

});