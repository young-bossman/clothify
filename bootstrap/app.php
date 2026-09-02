<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Enables Sanctum SPA cookie auth for stateful domains (web browser).
        // No mobile client exists today — every current caller is session-authenticated.
        // auth:sanctum is retained so a future Bearer-token mobile client can be added
        // without a routing change; see docs/SECURITY_FOLLOWUPS.md.
        $middleware->statefulApi();

        // CSRF Protection Configuration:
        // ────────────────────────────────────────────────────────────────
        // SEC-003 (Split 1) found /api/v1/cart* was forgeable cross-site because
        // api/* was blanket-exempted from CSRF on the assumption that all API
        // routes were Bearer-token-only. Split 1 fixed cart specifically by
        // excepting the (then-legitimate) Bearer-only routes explicitly instead.
        //
        // This pass (Split 2) removed Bearer-token auth entirely — every route
        // is now session-cookie authenticated (see AuthController, shared/auth.js)
        // — so there is no longer a Bearer-only path to except. No except() list
        // at all, on purpose: a manually maintained list is itself a standing
        // risk (a new route can silently land on the wrong side of it). Every
        // api/v1/* and web/* route is uniformly CSRF-checked.
        $middleware->validateCsrfTokens();

        $middleware->alias([
            'admin' => \App\Http\Middleware\IsAdminOrStaff::class,
            'security.headers' => \App\Http\Middleware\SecurityHeaders::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Always return JSON for API errors
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
        });

        $exceptions->render(function (\Illuminate\Auth\Access\AuthorizationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => 'Forbidden.'], 403);
            }
        });

        $exceptions->render(function (\Illuminate\Validation\ValidationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Validation failed.',
                    'errors'  => $e->errors(),
                ], 422);
            }
        });

        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => 'Resource not found.'], 404);
            }
        });
    })->create();