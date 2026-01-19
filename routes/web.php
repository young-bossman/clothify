<?php /*

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
}); */



use Illuminate\Support\Facades\Route;

// Frontend Pages (no auth session required)
Route::get('/', function () {
    return view('welcome');
})->name('welcome');

Route::get('/login', function () {
    return view('auth.login');
})->name('login');

Route::get('/register', function () {
    return view('auth.register');
})->name('register');

// Dashboard Page (frontend SPA, token auth handled in JS)
Route::get('/dashboard', function () {
    return view('dashboard');
})->name('dashboard');

