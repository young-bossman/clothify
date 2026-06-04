<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Frontend Pages (API-first, token auth handled in JS)
|--------------------------------------------------------------------------
*/

// Public routes — no auth required
Route::get('/', fn() => redirect()->route('login'))->name('welcome');
Route::get('/login', fn() => view('auth.login'))->name('login');
Route::get('/register', fn() => view('auth.register'))->name('register');

// Customer routes — must be logged in
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/shop', fn() => view('shop'))->name('shop');
    Route::get('/products', fn() => view('products'))->name('products');
    Route::get('/orders', fn() => view('orders'))->name('orders');
});

// Admin/Staff routes — must be logged in AND pass IsAdminOrStaff check
Route::middleware(['auth:sanctum', 'admin', 'security.headers'])->group(function () {
    Route::get('/dashboard', fn() => view('dashboard'))->name('dashboard');
});