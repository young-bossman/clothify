# Security Follow-Ups

Tracks security work that has been scoped, partially addressed, or deliberately
deferred. See `docs/SECURITY_ARCHITECTURE.md` for the design write-up, which
now reflects the single-guard, session+CSRF architecture below.

## SEC-003 — CSRF protection disabled for cookie-session-authenticated routes

**Status: Closed for the cart / session-cookie path.**

### What was wrong
`bootstrap/app.php` exempted the entire `api/*` prefix from CSRF validation on
the theory that all API routes use stateless Bearer tokens. That was false for
`resources/js/shop/cart.js`: its five cart calls (`initializeCart`, `addToCart`,
`removeFromCart`, `changeQty`, `clearCart`) authenticate with the session
cookie (`credentials: 'include'`, no `Authorization` header). With `api/*`
CSRF-exempt, any site could forge cross-origin requests that added, changed,
or cleared a logged-in user's cart.

### What was fixed
- `bootstrap/app.php`: `validateCsrfTokens(except: ['api/*'])` narrowed to an
  explicit list of the Bearer-token-only paths (`api/v1/products*`,
  `api/v1/categories*`, `api/v1/product-variants*`, `api/v1/stats`,
  `api/v1/orders*`, `api/v1/me`, `api/v1/logout`). `api/v1/cart*` is no longer
  exempt, so CSRF is now enforced there.
- `resources/js/shop/cart.js`: `initializeCart()` now calls the existing
  `fetchCsrfCookie()` helper before the cart mutations run, and the four
  mutating calls (`cart/add`, `cart/item/{id}` PATCH/DELETE, `cart` DELETE)
  send `X-XSRF-TOKEN` via the existing `getFormHeaders()` helper.
- Regression tests added in `tests/Feature/CartCsrfProtectionTest.php`,
  covering: valid session + CSRF token succeeds; valid session with no CSRF
  token is rejected 419; Bearer-token routes (dashboard/products/orders) are
  unaffected; login/register still return both a session and a Bearer token.

### Why a blanket `except()` removal wasn't the fix
Sanctum's `statefulApi()` reuses the same `ValidateCsrfToken` class inside its
own frontend pipeline (`EnsureFrontendRequestsAreStateful`), which classifies
a request as "frontend" by `Origin`/`Referer` alone — not by whether a
session cookie is present. Since `fetchJson()` (used by dashboard/products/
order.js) never sets `credentials`, a same-origin `fetch()` still attaches the
session cookie by default. Verified with a real HTTP request test: removing
`api/*` from the except list entirely returned `419` on a Bearer-token route
(`/api/v1/logout`) that never sends `X-XSRF-TOKEN`. The explicit-path except
list avoids that regression while still closing the cart gap.

### Explicitly out of scope for this fix (tracked below instead)
`AuthController.php` token issuance / `X-Mobile-App` branching, `dashboard/main.js`,
`products/main.js`, `order.js`, and `shared/auth.js`'s `getAuthHeaders()` /
localStorage logic were not touched.

---

## SEC-003 Split 2 — Auth architecture consolidation (session + CSRF only)

**Status: Closed.**

Split 1 closed the cart-specific CSRF gap but left the root cause in place:
the app issued **both** a session cookie and a Bearer token on every
login/register, with pages inconsistently relying on one or the other
(dashboard/products/orders used Bearer only, shop/cart used the session
only) via a manually maintained CSRF except-list. This pass removed the
Bearer-token mechanism entirely — every route is now session-cookie + CSRF
authenticated, uniformly, with no except-list to maintain.

### What was fixed
- `AuthController`: `register`/`login` no longer call `createToken()` or
  return a `token` key; session login is now unconditional (the
  `X-Mobile-App` branch is gone — nothing ever sent that header). `logout`
  always invalidates the session; the Bearer-token-revocation branch is gone.
- `resources/js/dashboard/api.js`, `products/api.js`, `shop/api.js`
  (`placeOrderRequest`), and `order.js` now use `credentials: 'include'` +
  `X-XSRF-TOKEN` (via the existing `fetchCsrfCookie()`/`getFormHeaders()`
  helpers) instead of an `Authorization: Bearer` header.
- `shared/auth.js`: removed `getAuthToken`, `getAdminToken`,
  `getCustomerToken`, `isTokenExpired`, `getAuthHeaders`, and the token half
  of `storeAuthSession`/`clearAuthData`. `auth_user` (profile info, used for
  client-side UI gating) is kept. `requireAdminAuth`/`requireCustomerAuth`/
  `requireAuth` now gate on `getAuthUser()` presence instead of a token +
  client-computed expiry — this was already just a pre-check to avoid a flash
  of the wrong page before a real request confirms the session server-side
  (e.g. dashboard's `loadUser()` already redirected on a failed `/me` call),
  not the actual security boundary.
- `shop/handlers.js` had its own direct `getAuthToken()` reads (checkout
  button + place-order gate) not caught by the original investigation —
  found during Step 1 re-verification and switched to `getAuthUser()` too.
- `bootstrap/app.php`: `validateCsrfTokens(except: [...])` (Split 1's
  Bearer-only path list) is gone. No except-list at all — every `api/v1/*`
  and `web/*` route is uniformly CSRF-checked. Verified via a real request
  that this genuinely closes the gap: a CSRF-less mutation to every
  formerly-Bearer-only route (products, categories, product-variants,
  orders) now correctly returns 419 instead of going straight through.
- Deleted `resources/js/{shop,dashboard,products}.bak.js` (superseded,
  confirmed via `git log` and a repo-wide reference search — untouched since
  the single commit that created them, never built by `vite.config.js`,
  never referenced by any blade view).
- `config/sanctum.php`: corrected the stale "expiry set per token in
  AuthController" comment — no code sets token expiry anymore.

### Deliberately left alone
- `personal_access_tokens` table and its migration: harmless, standard
  Sanctum scaffolding. Nothing issues new tokens going forward, but existing
  tokens (if any were issued before this deploy) are not purged automatically
  — see the open item below.
- `statefulApi()` in `bootstrap/app.php`: evaluated moving `routes/api.php`
  fully under the `web` middleware group instead, but `->withRouting(api:
  ...)` bakes the `api` group in at the routing-registration level, so this
  would mean either stacking `web` group middleware on top (double
  `StartSession`/`EncryptCookies` per request — a known source of session
  bugs) or physically moving the route file's contents into `routes/web.php`
  (a much larger, riskier structural change). `statefulApi()` already
  provides everything needed once the except-list is gone; kept as-is.

## SEC-004 — Purge pre-existing Bearer tokens + harden future token expiration

**Status: Closed, 2026-09-02.**

### What was verified before acting
`personal_access_tokens` held **108 rows**, spanning 2026-04-14 through
2026-08-31, all named `admin_token` (1-day expiry) / `customer_token`
(7-day expiry) — the exact pattern from the pre-consolidation `createToken()`
calls, several with non-null `last_used_at` confirming real historical use,
not test noise. **3 rows were still unexpired at the time of the check**
(server clock `2026-09-02 15:50:51`): two live `customer_token` rows for
`test1@gmail.com` (expiring 2026-09-04) and one orphaned row referencing a
since-deleted user (expiring 2026-09-07). This meant the exposure wasn't
theoretical — two rows were valid, reusable Bearer credentials at the moment
of the check.

### What was done
- Ran `DB::table('personal_access_tokens')->truncate()` (verified `count()`
  is 0 afterward). Safe because no current code path (`login`/`register` in
  `AuthController`) issues tokens, so nothing depends on any existing row.
- `config/sanctum.php`: changed `'expiration' => null` to
  `'expiration' => 60 * 24 * 7` (7 days), so that if a token is ever created
  in the future — by a mobile client, a test script, or anything else — it
  automatically expires instead of living forever. Comment updated in place
  explaining why.
- Corrected stale comments claiming mobile clients currently get Bearer
  tokens (`routes/api.php`, `bootstrap/app.php`) — no such client exists;
  `auth:sanctum`/`statefulApi()` are intentionally retained for a future
  mobile client (see below), not because one exists today.
- Added a comment directly above `POST /api/v1/logout` in `routes/api.php`
  flagging that mobile/Bearer-token logout will need its own branch (or
  route) calling `currentAccessToken()->delete()` once that client exists —
  today's `logout()` only handles session invalidation.

### Decision: keep `auth:sanctum` (supersedes the "swap for plain `auth`"
item previously listed here)
Rather than switching to the plain `auth` middleware to permanently close
the Bearer-token fallback, the decision is to **keep `auth:sanctum`**
specifically so a future mobile client can authenticate via Bearer token
without a routing change. This is safe now that the token table is purged
and future tokens expire automatically (above) — the fallback has nothing
to fall back to. See "Future: Mobile Client Auth" below for the intended
pattern when that client is actually built.

## Future: Mobile Client Auth (not built — pattern to follow when it is)

Captured now so this isn't rediscovered later. No mobile endpoints exist
yet; this is not a task to build them.

- Mobile gets its **own** login/logout endpoints, not the shared web
  `login`/`logout` in `AuthController` — issuing a named + scoped token via
  `createToken($name, $abilities)`, not a bare `createToken($name)`.
- The `admin` route group should explicitly **exclude** Bearer-token auth
  (session-cookie only) unless a deliberate decision is made to allow mobile
  admin access — don't let admin routes silently inherit Bearer-token access
  just because they sit under `auth:sanctum`.
- The mobile client stores the token in OS-level secure storage (e.g.
  Flutter's `flutter_secure_storage` / iOS Keychain / Android Keystore),
  never in plaintext local storage.
- Mobile logout must call `$request->user()->currentAccessToken()->delete()`
  — the shared `AuthController::logout()` does not and should not do this
  (see the comment above the `/logout` route).

## SEC-004 — Stored XSS via unsanitized order free-text fields

**Status: Closed for the live sink; candidates noted below for future sinks.**

### What was wrong
`OrderController::store()` persisted `delivery_name`, `landmark`, and `notes`
straight from client input with only length/type validation (`max:255`,
`max:1000`) — no tag stripping. `dashboard/ui.js`'s `renderRecentOrders()`
then interpolated `o.delivery_name` directly into an `innerHTML` template
string, so a customer-controlled `delivery_name` like
`<img src=x onerror=...>` executed as script in the admin's browser the next
time they viewed the dashboard's recent-orders table — a stored XSS reachable
by any authenticated customer, executing in an authenticated admin session.

### What was fixed
- `OrderController::store()`: `delivery_name`, `landmark`, and `notes` are
  now run through `strip_tags(trim(...))` after validation and before the
  order is persisted, mirroring `AuthController::register()`'s existing
  `strip_tags(trim($request->name))` pattern. Validation rules are unchanged
  — this is sanitization in addition to, not instead of, `required|string|max:*`.
- `resources/js/dashboard/ui.js`'s `renderRecentOrders()`: stopped
  interpolating `o.delivery_name` into the `innerHTML` template string;
  it's now set via `textContent` on the row's DOM element instead.
- Regression tests added in `tests/Feature/AuthConsolidationTest.php`
  (`test_order_creation_strips_html_tags_from_free_text_fields`), asserting
  an order created with `<img src=x onerror=alert(1)>` embedded in
  `delivery_name`/`landmark`/`notes` is stored with tags stripped.

### Impact, now that it's fixed
Auth is session-cookie based post-SEC-003 (see above) — there is no
`localStorage` token for injected script to steal. The practical impact of
this XSS was **arbitrary same-origin `fetch()`/DOM access as the logged-in
admin** (e.g. silently issuing admin API calls, reading the dashboard DOM),
not portable token theft — an attacker couldn't lift a credential and reuse
it elsewhere, but could act as the admin for the duration of the XSS
execution against same-origin endpoints.

### Explicitly out of scope for this fix
- `delivery_phone`, `delivery_address`, `city`, `region`, `ghana_post_gps`:
  not sanitized — no current view renders them via `innerHTML`. Candidates
  for the same `strip_tags(trim(...))` treatment if a future dashboard/admin
  view ever renders them that way.
- CSP hardening (tightening `script-src`'s `'unsafe-inline'` on
  `/dashboard`) — tracked separately as SEC-005, not touched here.

## Open — pre-existing bugs discovered incidentally (unrelated to auth)

Found while working on the above; none touched, all out of scope for an
auth-consolidation pass:

- `routes/api.php` registers `POST /api/v1/product-variants` with no
  `{product}` segment, but `ProductVariantController::store()` expects a
  route-bound `Product $product`. `products/api.js`'s variant functions
  (`fetchVariants`/`createVariant`/`updateVariant`/`deleteVariant`) call
  `/api/v1/products/{id}/variants...` — a path that has no matching route at
  all. The product-variants admin feature is effectively non-functional.
- `resources/js/shop/ui.js` had a missing closing brace on `openProductModal`
  that also swallowed `closeProductModal`, the `authModal` declaration, and
  the modal-open classList calls — broke `npm run build` entirely, present
  since before Split 1. Restored from the last commit where it was intact
  (`27fcb40`) as a Split-2 Step 0 prerequisite (needed to verify these JS
  changes actually build); diffed against that commit to confirm nothing else
  was lost.
- `tests/Feature/ExampleTest.php` asserts `GET /` returns 200; the app
  redirects `/` to `/login` (302). Fails on `main`, unrelated to this work.
- `database/migrations/2026_03_05_173448_add_payment_status_to_orders_table.php.php`
  has a duplicated `.php` extension in its filename.
