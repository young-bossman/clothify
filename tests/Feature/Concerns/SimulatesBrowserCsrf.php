<?php

namespace Tests\Feature\Concerns;

/**
 * Shared helpers for exercising the real CSRF middleware end-to-end.
 * Laravel skips CSRF verification entirely while running unit tests by
 * default (VerifyCsrfToken::runningUnitTests()), so disableTestCsrfBypass()
 * swaps in a subclass that forces real enforcement for the test.
 */
trait SimulatesBrowserCsrf
{
    private function disableTestCsrfBypass(): void
    {
        $this->app->bind(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class, function ($app) {
            return new class($app, $app->make(\Illuminate\Contracts\Encryption\Encrypter::class))
                extends \Illuminate\Foundation\Http\Middleware\ValidateCsrfToken
            {
                protected function runningUnitTests()
                {
                    return false;
                }
            };
        });
    }

    private function cookieFrom($response, string $name): ?string
    {
        $cookie = collect($response->headers->getCookies())
            ->first(fn ($c) => $c->getName() === $name);

        return $cookie?->getValue();
    }

    /**
     * Fetches a fresh XSRF-TOKEN cookie, mirroring fetchCsrfCookie().
     */
    private function freshCsrf(): array
    {
        $csrf = $this->get('/sanctum/csrf-cookie', ['Origin' => 'http://localhost']);
        $token = $this->cookieFrom($csrf, 'XSRF-TOKEN');

        return ['cookie' => $token, 'header' => urldecode($token)];
    }

    /**
     * Logs in like a real browser: fetch the XSRF cookie, send it back on
     * the login POST, and return the session + XSRF cookies to replay on
     * later requests. No Bearer token — Split 2 removed token issuance.
     */
    private function browserLogin(string $email, string $password): array
    {
        $csrf = $this->freshCsrf();

        $login = $this->withUnencryptedCookies(['XSRF-TOKEN' => $csrf['cookie']])
            ->postJson('/api/v1/login', [
                'email' => $email,
                'password' => $password,
            ], [
                'Origin' => 'http://localhost',
                'X-XSRF-TOKEN' => $csrf['header'],
            ]);

        $login->assertOk();

        $sessionName = config('session.cookie');

        return [
            'response' => $login,
            'cookies' => [
                $sessionName => $this->cookieFrom($login, $sessionName),
                'XSRF-TOKEN' => $this->cookieFrom($login, 'XSRF-TOKEN') ?? $csrf['cookie'],
            ],
        ];
    }
}
