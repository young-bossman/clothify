warning: in the working copy of 'app/Http/Controllers/API/V1/AuthController.php', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'resources/views/auth/login.blade.php', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'resources/views/auth/register.blade.php', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'resources/views/dashboard.blade.php', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'routes/api.php', CRLF will be replaced by LF the next time Git touches it
[1mdiff --git a/app/Http/Controllers/API/V1/AuthController.php b/app/Http/Controllers/API/V1/AuthController.php[m
[1mindex 2cec338..ed7f14f 100644[m
[1m--- a/app/Http/Controllers/API/V1/AuthController.php[m
[1m+++ b/app/Http/Controllers/API/V1/AuthController.php[m
[36m@@ -6,6 +6,7 @@[m
 use Illuminate\Http\Request;[m
 use App\Models\User;[m
 use Illuminate\Support\Facades\Hash;[m
[32m+[m[32muse function Laravel\Prompts\confirm;[m
 [m
 class AuthController extends Controller[m
 {[m
[36m@@ -14,7 +15,7 @@[m [mpublic function register(Request $request)[m
         $data = $request->validate([[m
             'name' => 'required|string|max:255',[m
             'email' => 'required|email|unique:users',[m
[31m-            'password' => 'required|min:6'[m
[32m+[m[32m            'password' => 'required|min:6|confirmed'[m
         ]);[m
 [m
         $user = User::create([[m
[1mdiff --git a/resources/js/app.js b/resources/js/app.js[m
[1mindex e59d6a0..52415c0 100644[m
[1m--- a/resources/js/app.js[m
[1m+++ b/resources/js/app.js[m
[36m@@ -1 +1,7 @@[m
[32m+[m
 import './bootstrap';[m
[32m+[m[32mimport './auth';[m
[41m+[m
[41m+[m
[41m+[m
[41m+[m
[1mdiff --git a/resources/views/auth/login.blade.php b/resources/views/auth/login.blade.php[m
[1mindex 5aead51..23a6de1 100644[m
[1m--- a/resources/views/auth/login.blade.php[m
[1m+++ b/resources/views/auth/login.blade.php[m
[36m@@ -1,13 +1,45 @@[m
[31m-<h2>Login</h2>[m
[32m+[m[32m<x-auth title="Login">[m
[32m+[m[32m    <div class="w-full max-w-md px-6">[m
 [m
[31m-<form method="POST" action="/login">[m
[31m-    @csrf[m
[32m+[m[32m        <h2 class="text-3xl font-bold mb-2">Welcome back</h2>[m
[32m+[m[32m        <p class="text-gray-400 mb-8">Login to manage your store</p>[m
 [m
[31m-    <input type="email" name="email" placeholder="Email" required><br><br>[m
[31m-    <input type="password" name="password" placeholder="Password" required><br><br>[m
[32m+[m[32m        <form id="loginForm" class="space-y-6">[m
 [m
[31m-    <button type="submit">Login</button>[m
[31m-</form>[m
[32m+[m[32m            <div>[m
[32m+[m[32m                <label class="block mb-1 text-sm">Email</label>[m
[32m+[m[32m                <input[m
[32m+[m[32m                    type="email"[m
[32m+[m[32m                    name="email"[m
[32m+[m[32m                    required[m
[32m+[m[32m                    class="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"[m
[32m+[m[32m                >[m
[32m+[m[32m            </div>[m
 [m
[31m-<a href="/register">Register</a>[m
[31m-<a href="/password/reset">Forgot Your Password?</a>[m
[32m+[m[32m            <div>[m
[32m+[m[32m                <label class="block mb-1 text-sm">Password</label>[m
[32m+[m[32m                <input[m
[32m+[m[32m                    type="password"[m
[32m+[m[32m                    name="password"[m
[32m+[m[32m                    required[m
[32m+[m[32m                    class="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"[m
[32m+[m[32m                >[m
[32m+[m[32m            </div>[m
[32m+[m
[32m+[m[32m            <button[m
[32m+[m[32m                type="submit"[m
[32m+[m[32m                class="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition font-semibold"[m
[32m+[m[32m            >[m
[32m+[m[32m                Login[m
[32m+[m[32m            </button>[m
[32m+[m
[32m+[m[32m            <p class="text-center text-sm text-gray-400">[m
[32m+[m[32m                Don’t have an account?[m
[32m+[m[32m                <a href="/register" class="text-indigo-400 hover:underline">Register</a>[m
[32m+[m[32m            </p>[m
[32m+[m[32m        </form>[m
[32m+[m
[32m+[m[32m        <p id="loginError" class="mt-4 text-sm text-red-500 hidden"></p>[m
[32m+[m
[32m+[m[32m    </div>[m
[32m+[m[32m</x-auth>[m
[1mdiff --git a/resources/views/auth/register.blade.php b/resources/views/auth/register.blade.php[m
[1mindex 94c7e69..933dc60 100644[m
[1m--- a/resources/views/auth/register.blade.php[m
[1m+++ b/resources/views/auth/register.blade.php[m
[36m@@ -1,13 +1,65 @@[m
[31m-<h2>Register</h2>[m
[32m+[m[32m<x-auth title="Register">[m
[32m+[m[32m    <div class="w-full max-w-md px-6">[m
 [m
[31m-<form method="POST" action="/register">[m
[31m-    @csrf[m
[32m+[m[32m        <h2 class="text-3xl font-bold mb-2">Create account</h2>[m
[32m+[m[32m        <p class="text-gray-400 mb-8">Start selling and shopping smarter</p>[m
 [m
[31m-    <input type="text" name="name" placeholder="Name" required><br><br>[m
[31m-    <input type="email" name="email" placeholder="Email" required><br><br>[m
[31m-    <input type="password" name="password" placeholder="Password" required><br><br>[m
[32m+[m[32m        <form id="registerForm" class="space-y-6">[m
 [m
[31m-    <button type="submit">Register</button>[m
[31m-</form>[m
[32m+[m[32m            <div>[m
[32m+[m[32m                <label class="block mb-1 text-sm">Name</label>[m
[32m+[m[32m                <input[m
[32m+[m[32m                    type="text"[m
[32m+[m[32m                    name="name"[m
[32m+[m[32m                    required[m
[32m+[m[32m                    class="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"[m
[32m+[m[32m                >[m
[32m+[m[32m            </div>[m
 [m
[31m-<a href="/login">Login</a>[m
[32m+[m[32m            <div>[m
[32m+[m[32m                <label class="block mb-1 text-sm">Email</label>[m
[32m+[m[32m                <input[m
[32m+[m[32m                    type="email"[m
[32m+[m[32m                    name="email"[m
[32m+[m[32m                    required[m
[32m+[m[32m                    class="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"[m
[32m+[m[32m                >[m
[32m+[m[32m            </div>[m
[32m+[m
[32m+[m[32m            <div>[m
[32m+[m[32m                <label class="block mb-1 text-sm">Password</label>[m
[32m+[m[32m                <input[m
[32m+[m[32m                    type="password"[m
[32m+[m[32m                    name="password"[m
[32m+[m[32m                    required[m
[32m+[m[32m                    class="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"[m
[32m+[m[32m                >[m
[32m+[m[32m            </div>[m
[32m+[m
[32m+[m[32m            <div>[m
[32m+[m[32m                <label class="block mb-1 text-sm">Confirm Password</label>[m
[32m+[m[32m                <input[m
[32m+[m[32m                    type="password"[m
[32m+[m[32m                    name="password_confirmation"[m
[32m+[m[32m                    required[m
[32m+[m[32m                    class="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"[m
[32m+[m[32m                >[m
[32m+[m[32m            </div>[m
[32m+[m
[32m+[m[32m            <button[m
[32m+[m[32m                type="submit"[m
[32m+[m[32m                class="w-f