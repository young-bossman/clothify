<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Concerns\SimulatesBrowserCsrf;
use Tests\TestCase;

/**
 * SEC-003 Split 2: the app no longer issues Bearer tokens at all — every
 * route (dashboard, products, orders, cart, auth) is session-cookie +
 * CSRF authenticated. These tests exercise the real CSRF middleware
 * end-to-end (see SimulatesBrowserCsrf) because Laravel skips CSRF
 * verification entirely while running unit tests by default.
 */
class AuthConsolidationTest extends TestCase
{
    use RefreshDatabase;
    use SimulatesBrowserCsrf;

    private function makeProduct(string $sku = 'SKU-1'): Product
    {
        return Product::create([
            'name' => 'Test Product',
            'sku' => $sku,
            'price' => 49.99,
            'cost_price' => 20,
            'stock_quantity' => 10,
            'is_active' => true,
        ]);
    }

    public function test_login_authenticates_via_session_with_no_token_key_in_response(): void
    {
        $this->disableTestCsrfBypass();

        $user = User::factory()->create(['role' => 'customer']);
        ['response' => $response] = $this->browserLogin($user->email, 'password');

        $response->assertOk();
        $response->assertJsonMissingPath('token');
        $this->assertArrayNotHasKey('token', $response->json());
        $this->assertNotNull($this->cookieFrom($response, config('session.cookie')));
    }

    public function test_register_authenticates_via_session_with_no_token_key_in_response(): void
    {
        $this->disableTestCsrfBypass();

        $csrf = $this->freshCsrf();

        $response = $this->withUnencryptedCookies(['XSRF-TOKEN' => $csrf['cookie']])
            ->postJson('/api/v1/register', [
                'name' => 'New Customer',
                'email' => 'new.customer.test@gmail.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ], [
                'Origin' => 'http://localhost',
                'X-XSRF-TOKEN' => $csrf['header'],
            ]);

        $response->assertCreated();
        $response->assertJsonMissingPath('token');
        $this->assertArrayNotHasKey('token', $response->json());
        $this->assertNotNull($this->cookieFrom($response, config('session.cookie')));
    }

    /**
     * SEC-004: 108 legacy personal_access_tokens rows (some still unexpired)
     * were found and purged from this app's database on 2026-09-02 — see
     * docs/SECURITY_FOLLOWUPS.md. This asserts the root cause stays fixed:
     * login/register must never create a new row, or the exposure recurs.
     */
    public function test_login_and_register_never_create_personal_access_token_rows(): void
    {
        $this->disableTestCsrfBypass();

        $this->assertSame(0, \Laravel\Sanctum\PersonalAccessToken::count());

        $user = User::factory()->create(['role' => 'customer']);
        $this->browserLogin($user->email, 'password');

        $this->assertSame(0, \Laravel\Sanctum\PersonalAccessToken::count());

        $csrf = $this->freshCsrf();
        $this->withUnencryptedCookies(['XSRF-TOKEN' => $csrf['cookie']])
            ->postJson('/api/v1/register', [
                'name' => 'No Token Customer',
                'email' => 'no.token.customer@gmail.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ], [
                'Origin' => 'http://localhost',
                'X-XSRF-TOKEN' => $csrf['header'],
            ])->assertCreated();

        $this->assertSame(0, \Laravel\Sanctum\PersonalAccessToken::count());
    }

    /**
     * SEC-004: `auth:sanctum` is deliberately kept (not swapped for plain
     * `auth`) to support a future mobile Bearer-token client, so its
     * Bearer-token fallback path is still live. This proves that fallback
     * doesn't silently accept a fabricated/arbitrary token.
     */
    public function test_protected_route_rejects_fabricated_bearer_token(): void
    {
        $this->disableTestCsrfBypass();

        $this->withHeaders(['Authorization' => 'Bearer this-token-does-not-exist-and-was-never-issued'])
            ->getJson('/api/v1/me')
            ->assertStatus(401);
    }

    public function test_logout_invalidates_the_session(): void
    {
        $this->disableTestCsrfBypass();

        $user = User::factory()->create(['role' => 'customer']);
        ['cookies' => $cookies] = $this->browserLogin($user->email, 'password');
        $xsrf = urldecode($cookies['XSRF-TOKEN']);

        $this->withUnencryptedCookies($cookies)
            ->postJson('/api/v1/logout', [], ['Origin' => 'http://localhost', 'X-XSRF-TOKEN' => $xsrf])
            ->assertOk();

        // AuthManager caches resolved guards (incl. the resolved user) on
        // $this->app for the life of the test process; a real browser's next
        // request would hit a fresh PHP process, so forget the cached guard
        // to accurately simulate that rather than reading a stale in-process
        // "still logged in" guard instance.
        $this->app['auth']->forgetGuards();

        // Same session cookie no longer authenticates a protected route.
        $this->withUnencryptedCookies($cookies)
            ->getJson('/api/v1/me', ['Origin' => 'http://localhost'])
            ->assertStatus(401);
    }

    public function test_dashboard_and_products_and_categories_succeed_via_session_csrf_with_no_authorization_header(): void
    {
        $this->disableTestCsrfBypass();

        $admin = User::factory()->create(['role' => 'admin']);
        ['cookies' => $cookies] = $this->browserLogin($admin->email, 'password');
        $xsrf = urldecode($cookies['XSRF-TOKEN']);
        // Origin + XSRF-TOKEN only — no Authorization header anywhere below,
        // proving these routes no longer need or accept a Bearer token.
        $headers = ['Origin' => 'http://localhost', 'X-XSRF-TOKEN' => $xsrf];

        // --- Dashboard ---
        $this->withUnencryptedCookies($cookies)->getJson('/api/v1/me', $headers)->assertOk();
        $this->withUnencryptedCookies($cookies)->getJson('/api/v1/stats', $headers)->assertOk();

        // --- Products ---
        $category = Category::create(['name' => 'Outerwear']);

        $created = $this->withUnencryptedCookies($cookies)->postJson('/api/v1/products', [
            'name' => 'Session Jacket',
            'sku' => 'JACKET-SESSION-1',
            'price' => 120,
            'cost_price' => 60,
            'stock_quantity' => 5,
            'category_id' => $category->id,
            'is_active' => true,
        ], $headers);
        $created->assertCreated();
        $productId = $created->json('id');

        $this->withUnencryptedCookies($cookies)->putJson("/api/v1/products/{$productId}", [
            'price' => 130,
        ], $headers)->assertOk();

        $this->withUnencryptedCookies($cookies)->postJson("/api/v1/products/{$productId}/adjust-stock", [
            'quantity' => 3,
            'type' => 'restock',
        ], $headers)->assertOk();

        // --- Categories ---
        $catCreate = $this->withUnencryptedCookies($cookies)->postJson('/api/v1/categories', [
            'name' => 'Session Category',
        ], $headers);
        $catCreate->assertCreated();

        $this->withUnencryptedCookies($cookies)
            ->deleteJson("/api/v1/categories/{$catCreate->json('id')}", [], $headers)
            ->assertOk();

        $this->withUnencryptedCookies($cookies)
            ->deleteJson("/api/v1/products/{$productId}", [], $headers)
            ->assertOk();
    }

    public function test_customer_order_placement_succeeds_via_session_csrf_with_no_authorization_header(): void
    {
        $this->disableTestCsrfBypass();

        $customer = User::factory()->create(['role' => 'customer']);
        $product = $this->makeProduct('ORDER-SKU-1');
        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'size' => 'M',
            'color' => 'Black',
            'stock_quantity' => 10,
        ]);
        $cart = Cart::create(['user_id' => $customer->id]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'variant_id' => $variant->id,
            'name' => $product->name,
            'price' => $product->price,
            'qty' => 1,
        ]);

        ['cookies' => $cookies] = $this->browserLogin($customer->email, 'password');
        $xsrf = urldecode($cookies['XSRF-TOKEN']);
        $headers = ['Origin' => 'http://localhost', 'X-XSRF-TOKEN' => $xsrf];

        $order = $this->withUnencryptedCookies($cookies)->postJson('/api/v1/orders', [
            'delivery_name' => 'Jane Doe',
            'delivery_phone' => '0555555555',
            'delivery_address' => '123 Test Street',
            'city' => 'Accra',
            'region' => 'Greater Accra',
            'payment_method' => 'cash_on_delivery',
        ], $headers);

        $order->assertCreated();
    }

    /**
     * SEC-004: delivery_name/landmark/notes are free text rendered via
     * innerHTML in dashboard/ui.js's renderRecentOrders(). OrderController
     * must strip_tags() them (in addition to the existing validation) so a
     * stored payload can't execute in the admin's browser.
     */
    public function test_order_creation_strips_html_tags_from_free_text_fields(): void
    {
        $this->disableTestCsrfBypass();

        $customer = User::factory()->create(['role' => 'customer']);
        $product = $this->makeProduct('XSS-SKU-1');
        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'size' => 'M',
            'color' => 'Black',
            'stock_quantity' => 10,
        ]);
        $cart = Cart::create(['user_id' => $customer->id]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'variant_id' => $variant->id,
            'name' => $product->name,
            'price' => $product->price,
            'qty' => 1,
        ]);

        ['cookies' => $cookies] = $this->browserLogin($customer->email, 'password');
        $xsrf = urldecode($cookies['XSRF-TOKEN']);
        $headers = ['Origin' => 'http://localhost', 'X-XSRF-TOKEN' => $xsrf];

        $payload = '<img src=x onerror=alert(1)>';

        $order = $this->withUnencryptedCookies($cookies)->postJson('/api/v1/orders', [
            'delivery_name' => "Jane{$payload}Doe",
            'delivery_phone' => '0555555555',
            'delivery_address' => '123 Test Street',
            'city' => 'Accra',
            'region' => 'Greater Accra',
            'landmark' => "Near the mall{$payload}",
            'notes' => "Leave at the door{$payload}",
            'payment_method' => 'cash_on_delivery',
        ], $headers);

        $order->assertCreated();

        $stored = \App\Models\Order::findOrFail($order->json('id'));

        $this->assertSame('JaneDoe', $stored->delivery_name);
        $this->assertSame('Near the mall', $stored->landmark);
        $this->assertSame('Leave at the door', $stored->notes);
        $this->assertStringNotContainsString('<img', $stored->delivery_name);
        $this->assertStringNotContainsString('<img', $stored->landmark);
        $this->assertStringNotContainsString('<img', $stored->notes);
    }

    public function test_admin_order_management_succeeds_via_session_csrf_with_no_authorization_header(): void
    {
        $this->disableTestCsrfBypass();

        $admin = User::factory()->create(['role' => 'admin']);
        $customer = User::factory()->create(['role' => 'customer']);
        $order = \App\Models\Order::create([
            'user_id' => $customer->id,
            'total_amount' => 49.99,
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'delivery_name' => 'Jane Doe',
            'delivery_phone' => '0555555555',
            'delivery_address' => '123 Test Street',
        ]);

        ['cookies' => $cookies] = $this->browserLogin($admin->email, 'password');
        $xsrf = urldecode($cookies['XSRF-TOKEN']);
        $headers = ['Origin' => 'http://localhost', 'X-XSRF-TOKEN' => $xsrf];

        $this->withUnencryptedCookies($cookies)
            ->patchJson("/api/v1/orders/{$order->id}/status", ['status' => 'processing'], $headers)
            ->assertOk();

        $this->withUnencryptedCookies($cookies)
            ->patchJson("/api/v1/orders/{$order->id}/payment-status", ['payment_status' => 'paid'], $headers)
            ->assertOk();

        $this->withUnencryptedCookies($cookies)
            ->deleteJson("/api/v1/orders/{$order->id}", [], $headers)
            ->assertOk();
    }

    /**
     * Every one of these was, before this consolidation, reachable via a
     * Bearer token alone and explicitly except()'d from CSRF checking —
     * meaning a valid session cookie plus a forged cross-site request
     * (no CSRF token) would previously have gone straight through. This
     * is the actual proof the consolidation closes that gap.
     */
    public function test_formerly_bearer_only_endpoints_reject_mutations_without_csrf_token(): void
    {
        $this->disableTestCsrfBypass();

        $admin = User::factory()->create(['role' => 'admin']);
        ['cookies' => $cookies] = $this->browserLogin($admin->email, 'password');
        // Deliberately no X-XSRF-TOKEN header on any of the requests below.
        $noCsrfHeaders = ['Origin' => 'http://localhost'];

        $product = $this->makeProduct('BEARER-GAP-1');
        $category = Category::create(['name' => 'Bearer Gap Category']);

        $customer = User::factory()->create(['role' => 'customer']);
        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'size' => 'L',
            'color' => 'Blue',
            'stock_quantity' => 5,
        ]);
        $cart = Cart::create(['user_id' => $customer->id]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'variant_id' => $variant->id,
            'name' => $product->name,
            'price' => $product->price,
            'qty' => 1,
        ]);
        $order = \App\Models\Order::create([
            'user_id' => $customer->id,
            'total_amount' => 49.99,
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'delivery_name' => 'Jane Doe',
            'delivery_phone' => '0555555555',
            'delivery_address' => '123 Test Street',
        ]);

        $requests = [
            'products.store' => ['POST', '/api/v1/products'],
            'products.update' => ['PUT', "/api/v1/products/{$product->id}"],
            'products.adjustStock' => ['POST', "/api/v1/products/{$product->id}/adjust-stock"],
            'productVariants.store' => ['POST', '/api/v1/product-variants'],
            'categories.store' => ['POST', '/api/v1/categories'],
            'orders.store' => ['POST', '/api/v1/orders'],
            'orders.updateStatus' => ['PATCH', "/api/v1/orders/{$order->id}/status"],
            'orders.updatePaymentStatus' => ['PATCH', "/api/v1/orders/{$order->id}/payment-status"],
            // Destructive ones last so earlier cases still have their rows.
            'categories.destroy' => ['DELETE', "/api/v1/categories/{$category->id}"],
            'orders.destroy' => ['DELETE', "/api/v1/orders/{$order->id}"],
            'products.destroy' => ['DELETE', "/api/v1/products/{$product->id}"],
        ];

        foreach ($requests as $name => [$method, $uri]) {
            $response = $this->withUnencryptedCookies($cookies)->json($method, $uri, [], $noCsrfHeaders);
            $this->assertSame(419, $response->getStatusCode(), "Expected 419 for {$name}, got {$response->getStatusCode()}");
        }
    }

    public function test_bootstrap_no_longer_maintains_a_csrf_except_list(): void
    {
        $contents = file_get_contents(base_path('bootstrap/app.php'));

        // Note: 'api/*' legitimately appears elsewhere in this file (the
        // exception-rendering closures use $request->is('api/*')) — assert
        // against the specific former except-list entries instead.
        $this->assertStringContainsString('validateCsrfTokens();', $contents);
        $this->assertStringNotContainsString('except:', $contents);
        $this->assertStringNotContainsString("'api/v1/products*'", $contents);
        $this->assertStringNotContainsString("'api/v1/orders*'", $contents);
        $this->assertStringNotContainsString("'api/v1/logout'", $contents);
    }
}
