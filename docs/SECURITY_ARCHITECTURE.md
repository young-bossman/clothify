# Security Architecture Documentation

## Authentication & CSRF Protection

### Model: single guard, session cookie + CSRF, everywhere

Every route — `web/*` pages and `api/v1/*` alike — is authenticated the same
way: a session cookie (set by `Auth::login()` on the `web` guard) plus CSRF
verification on every state-changing request. There is no Bearer-token path.
This is deliberate, not incidental: an earlier design issued a Bearer token
*alongside* the session on every login, and pages inconsistently relied on
one or the other. That split was the root cause of SEC-003 (a manually
maintained CSRF except-list for the "Bearer-only" routes, which silently left
`/api/v1/cart*` unprotected because it was actually session-authenticated).
The fix was to remove the second mechanism rather than keep reconciling the
list — see `docs/SECURITY_FOLLOWUPS.md` for that history.

### How a request gets authenticated

1. **Page load**: the browser fetches `/sanctum/csrf-cookie`, which sets an
   encrypted `XSRF-TOKEN` cookie (`shared/auth.js`'s `fetchCsrfCookie()`,
   called on every page's entry point before any mutating request can fire).
2. **Login/register** (`POST /api/v1/login` or `/register`, in the `web`
   middleware group): validates credentials, calls `Auth::login($user)`,
   regenerates the session. Response is `{ message, user }` — no token.
   `shared/auth.js`'s `storeAuthSession()` keeps `user` in `localStorage`
   purely for client-side UI gating/display (see below); it is not a
   credential.
3. **Every subsequent request** (cart, dashboard, products, orders, logout):
   `fetch(..., { credentials: 'include', headers: { 'X-XSRF-TOKEN': ... } })`.
   The session cookie authenticates the user; the CSRF header proves the
   request originated from a page that could read `document.cookie` for this
   origin, which a cross-site attacker cannot forge.
4. **Server-side**: `Route::middleware(['auth:sanctum'])` resolves the user
   from the session (Sanctum's `guard => ['web']`); `bootstrap/app.php`'s
   `$middleware->statefulApi()` plus `$middleware->validateCsrfTokens()`
   (**no except-list**) enforce CSRF uniformly across every route.

### Why CSRF enforcement needed `statefulApi()`, not just the `web` group

Laravel's `ValidateCsrfToken` middleware only runs inside the `web`
middleware group by default — `routes/api.php` is registered under the `api`
group, which doesn't include it. Sanctum's `statefulApi()` closes that gap:
it adds `EnsureFrontendRequestsAreStateful` to the `api` group, which — for
any request whose `Origin`/`Referer` matches a configured stateful domain —
runs an inner pipeline (`EncryptCookies`, `StartSession`, the *same*
`ValidateCsrfToken` class, `AuthenticateSession`) before the route executes.
Because it's the same class, `$middleware->validateCsrfTokens(except: [...])`
controls CSRF enforcement for `api/v1/*` routes too, not just `web/*` — which
is exactly the mechanism SEC-003 (Split 1) exploited to fix cart specifically,
before Split 2 removed the need for an except-list at all.

One consequence worth knowing: `EnsureFrontendRequestsAreStateful` classifies
a request as "frontend" by the `Origin`/`Referer` header alone — **not** by
whether it carries a session cookie. A same-origin `fetch()` also sends the
session cookie by default even without `credentials: 'include'` explicitly
set. In other words, CSRF enforcement here isn't opt-in per request; it's
uniform for anything that looks like it came from the browser, which is why
a single `validateCsrfTokens()` call with no exceptions is sufficient and
correct for this app now that nothing is Bearer-only.

### What `auth_user` in localStorage is (and isn't)

`shared/auth.js` keeps the logged-in user's `{ id, name, email, role }` in
`localStorage` after login/register, and clears it on logout. This is:

- **Used for**: client-side page guards (`requireAdminAuth`,
  `requireCustomerAuth`, `requireAuth`) that redirect to `/login` before a
  protected page even starts rendering, and role-based UI branches
  (`isAdminUser`, `isCustomerUser`, `redirectAfterAuth`).
- **Not used as**: a credential. It's never sent to the server and never
  checked server-side. The *actual* authorization boundary is the session
  cookie + CSRF token on each request — e.g. dashboard's `loadUser()` makes a
  real `GET /api/v1/me` call and redirects to `/login` on failure regardless
  of what `auth_user` says. The client-side guards exist purely to avoid a
  flash of the wrong page while that real check is in flight; a stale or
  tampered `auth_user` value cannot grant access to anything, since every
  protected server response depends on the session, which the client cannot
  forge.

### Error handling

- **Security**: error messages don't leak sensitive info (e.g. "user doesn't
  exist" vs. a generic "Invalid email or password").
- **UX**: specific validation errors are shown (required fields, format
  issues).
- **Debugging**: console warnings for non-fatal client-side failures (e.g. a
  failed CSRF-cookie fetch), prefixed `[Auth]`.

---

## Authentication Flows

### Login / register
```
Page load → fetchCsrfCookie() (sets XSRF-TOKEN cookie)
    ↓
User submits form
    ↓
POST /api/v1/login (or /register) with X-XSRF-TOKEN header + credentials: 'include'
    ↓
Backend validates CSRF token + credentials, calls Auth::login(), regenerates session
    ↓
Success: { message, user } — no token
    ↓
Frontend stores user (localStorage, for UI gating/display only)
    ↓
Redirect based on role (admin/staff → /dashboard, customer → /shop)
```

### Cart / dashboard / products / order mutations
```
Page load → fetchCsrfCookie()
    ↓
User action (add to cart, save product, update order status, ...)
    ↓
fetch(url, { method, credentials: 'include', headers: { 'X-XSRF-TOKEN': ... }, body })
    ↓
Server: session identifies the user, CSRF token is verified, auth:sanctum + (where
applicable) the `admin` middleware authorize the action
    ↓
Success/failure JSON response
```

### Logout
```
User clicks logout
    ↓
POST /api/v1/logout with credentials: 'include' + X-XSRF-TOKEN
    ↓
Backend: Auth::guard('web')->logout(), session invalidated, CSRF token regenerated
    ↓
Frontend clears auth_user from localStorage, redirects to /login
```

---

## Security Validation Checklist

- CSRF tokens enforced uniformly across `web/*` and `api/v1/*` — no except-list
- Every authenticated route uses the same guard (session cookie); no Bearer-token path
- `auth_user` in localStorage is UI-gating only, never a credential, never sent to the server
- Stale session data cleared before storing a new one (`clearAuthData()` before `storeAuthSession()`)
- Role-based redirect after login/register (admin/staff vs. customer)
- Error messages don't leak sensitive info
- CSRF cookie fetched on every page's entry point before any mutating request
- `X-XSRF-TOKEN` header included on every mutating fetch, via one shared helper (`getFormHeaders()`)

---

## Future Enhancements

1. **Tighten CSP's `script-src`** on `/dashboard` — `SecurityHeaders`
   middleware currently allows `'unsafe-inline'`; removing it would further
   reduce the blast radius of any future XSS. Tracked as SEC-005 in
   `docs/SECURITY_FOLLOWUPS.md`.
2. **Implement rate limiting** more broadly on auth endpoints beyond the
   existing login rate limiter.
3. **Add 2FA** for admin/staff accounts.

Two items formerly listed here are now closed — see SEC-004 in
`docs/SECURITY_FOLLOWUPS.md`: the pre-existing Bearer token table was purged
and future tokens now expire automatically (7 days), and the decision was
made to deliberately *keep* `auth:sanctum` (rather than swap to plain `auth`)
for a possible future mobile client, since the purge already closed the
fallback risk.
