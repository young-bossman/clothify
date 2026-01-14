<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;




class AuthUIController extends Controller
{
    //
    public function showLogin()
    {
        return view('auth.login');
    }

    public function showRegister()
    {
        return view('auth.register');
    }

    public function register(Request $request)
    {
        $response = Http::acceptJson()->post(
            config('app.url') . '/api/v1/register',
            $request->only('name', 'email', 'password')
        );

        if ($response->failed()) {
            return back()->withErrors($response->json());
        }

        Session::put('token', $response['token']);

        return redirect('/dashboard');
    }

    public function login(Request $request)
    {
        $response = Http::acceptJson()->post(
            config('app.url') . '/api/v1/login',
            $request->only('email', 'password')
        );

        if ($response->failed()) {
            return back()->withErrors(['login' => 'Invalid credentials']);
        }

        Session::put('token', $response['token']);

        return redirect('/dashboard');
    }

    public function dashboard()
    {
        if (!Session::has('token')) {
            return redirect('/login');
        }

        $user = Http::withToken(Session::get('token'))
            ->acceptJson()
            ->get(config('app.url') . '/api/v1/me')
            ->json();

        return view('dashboard', compact('user'));
    }

    public function logout()
    {
        if (Session::has('token')) {
            Http::withToken(Session::get('token'))
                ->post(config('app.url') . '/api/v1/logout');
        }

        Session::forget('token');

        return redirect('/login');
    }
}
