<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthUIController;

Route::get('/login', [AuthUIController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthUIController::class, 'login']);

Route::get('/register', [AuthUIController::class, 'showRegister']);
Route::post('/register', [AuthUIController::class, 'register']);

Route::post('/logout', [AuthUIController::class, 'logout']);

Route::get('/dashboard', [AuthUIController::class, 'dashboard']);



Route::get('/', function () {
    return view('welcome');
});
