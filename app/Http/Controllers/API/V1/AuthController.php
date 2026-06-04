<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255|regex:/^[\pL\s\-]+$/u',
            'email'    => 'required|email:rfc,dns|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ], [
            'name.regex'         => 'Name may only contain letters, spaces, and hyphens.',
            'email.unique'       => 'An account with this email already exists.',
            'password.confirmed' => 'Password confirmation does not match.',
        ]);

        $user = User::create([
            'name'     => strip_tags(trim($request->name)),
            'email'    => strtolower(trim($request->email)),
            'password' => Hash::make($request->password),
            'role'     => 'customer', // never allow role to be set via API
        ]);

        // Create token for the new user
        $token = $user->createToken('customer_token', ['*'], now()->addDays(7))->plainTextToken;

        // For web clients, set session and cookie
        if (!$request->hasHeader('X-Mobile-App')) {
            // Ensure session is started so a Set-Cookie will be returned
            try {
                if (!session()->isStarted()) {
                    session()->start();
                }
            } catch (\Throwable $e) {
                // Ignore failures to start session; best-effort
            }

            if ($request->hasSession()) {
                Auth::login($user);
                $request->session()->regenerate();
            } else {
                // If session middleware not applied, still login the web guard
                Auth::guard('web')->login($user);
            }
        }

        return response()->json([
            'message' => 'Account created successfully.',
            'token'   => $token,
            'user'    => $this->formatUser($user),
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email|max:255',
            'password' => 'required|string',
        ]);

        // Rate limiting — 5 attempts per minute per IP+email
        $key = 'login:' . Str::lower($request->email) . '|' . $request->ip();

        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            return response()->json([
                'message' => "Too many login attempts. Please try again in {$seconds} seconds.",
            ], 429);
        }

        $user = User::where('email', strtolower(trim($request->email)))->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            RateLimiter::hit($key, 60);
            return response()->json([
                'message' => 'Invalid email or password.',
            ], 401);
        }

        RateLimiter::clear($key);

        // Create Bearer token for all clients (mobile and web)
        $tokenName = match($user->role) {
            'admin', 'staff' => 'admin_token',
            default          => 'customer_token',
        };

        $expiration = match($user->role) {
            'admin', 'staff' => now()->addDay(),    // 1 day for admin/staff
            default          => now()->addDays(7),  // 7 days for customers
        };

        $token = $user->createToken($tokenName, ['*'], $expiration)->plainTextToken;

        // For web clients, set session and cookie for SPA access to dashboard
        if (!$request->hasHeader('X-Mobile-App')) {
            // Ensure session is started so a Set-Cookie will be returned
            try {
                if (!session()->isStarted()) {
                    session()->start();
                }
            } catch (\Throwable $e) {
                // Ignore failures to start session; best-effort
            }

            if ($request->hasSession()) {
                Auth::login($user);
                $request->session()->regenerate();
            } else {
                // If session middleware not applied, log in guard directly
                Auth::guard('web')->login($user);
            }
        }

        return response()->json([
            'message' => 'Login successful.',
            'token'   => $token,
            'user'    => $this->formatUser($user),
        ]);
    }

    public function logout(Request $request)
    {
        if ($request->hasHeader('X-Mobile-App')) {
            // Mobile — revoke the Bearer token
            $request->user()->currentAccessToken()->delete();
        } else {
            // Web — invalidate session if available
            Auth::guard('web')->logout();
            if ($request->hasSession()) {
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }
        }

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }

    public function me(Request $request): \Illuminate\Http\JsonResponse
    {
        return response()->json($this->formatUser($request->user()));
    }

    private function formatUser(User $user): array
    {
        return [
            'id'    => $user->id,
            'name'  => $user->name,
            'email' => $user->email,
            'role'  => $user->role,
        ];
    }
}