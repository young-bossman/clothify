<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (! $response instanceof Response) {
            return $response;
        }

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'geolocation=()');
        $response->headers->set('Content-Security-Policy', $this->contentSecurityPolicy());

        return $response;
    }

    /**
     * Build the CSP for this request.
     *
     * The strict policy below is the default and the fallback. The only thing that
     * can widen it is a running Vite dev server, and then only by the exact origin
     * that server advertises.
     */
    private function contentSecurityPolicy(): string
    {
        $scriptSrc = "'self' 'unsafe-inline' https://www.google-analytics.com https://www.googletagmanager.com";
        $styleSrc = "'self' 'unsafe-inline' https://fonts.googleapis.com";

        $directives = [
            "default-src 'self'",
            "script-src {$scriptSrc}",
            "style-src {$styleSrc}",
            'font-src https://fonts.gstatic.com',
            "img-src 'self' data: https://www.google-analytics.com",
        ];

        $devOrigin = $this->viteDevOrigin();

        if ($devOrigin !== null) {
            [$httpOrigin, $wsOrigin] = $devOrigin;

            $directives[1] = "script-src {$scriptSrc} {$httpOrigin}";
            $directives[2] = "style-src {$styleSrc} {$httpOrigin}";
            // There is no connect-src in the strict policy, so it inherits
            // default-src 'self' and would block Vite's HMR websocket. Without
            // the ws origin here the page styles correctly but hot reload is
            // silently dead.
            $directives[] = "connect-src 'self' {$httpOrigin} {$wsOrigin}";
        }

        return implode('; ', $directives).';';
    }

    /**
     * Resolve the running Vite dev server as [http origin, websocket origin],
     * or null when the dev server is not running or advertises something we
     * refuse to trust.
     *
     * The gate is the hot file, not APP_ENV or APP_DEBUG: the hot file is the
     * same input Laravel's @vite directive uses to decide whether to emit
     * absolute dev-server URLs, so deriving the policy from it guarantees the
     * header and the markup always agree.
     *
     * @return array{0: string, 1: string}|null
     */
    private function viteDevOrigin(): ?array
    {
        $hotFile = public_path('hot');

        if (! is_file($hotFile) || ! is_readable($hotFile)) {
            return null;
        }

        $contents = @file_get_contents($hotFile);

        if ($contents === false) {
            return null;
        }

        // The hot file ends in a newline (Laravel rtrims it for the same reason).
        // An untrimmed value spliced into a header silently breaks the directive.
        $url = trim($contents);

        if ($url === '') {
            return null;
        }

        $parts = parse_url($url);

        if ($parts === false) {
            return null;
        }

        $scheme = strtolower($parts['scheme'] ?? '');
        $host = $parts['host'] ?? '';

        if (! in_array($scheme, ['http', 'https'], true) || $host === '') {
            return null;
        }

        // Reconstruct a clean origin from the parsed parts rather than passing the
        // raw file contents through into the header.
        $authority = $host.(isset($parts['port']) ? ':'.$parts['port'] : '');

        return [
            $scheme.'://'.$authority,
            ($scheme === 'https' ? 'wss' : 'ws').'://'.$authority,
        ];
    }
}
