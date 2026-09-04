<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Concerns\SimulatesBrowserCsrf;
use Tests\TestCase;

/**
 * SEC-003: shop/cart.js authenticates cart mutations with the session
 * cookie (credentials: 'include'), not a Bearer token, so CSRF protection
 * has to actually engage for /api/v1/cart*. These tests exercise the real
 * CSRF middleware end-to-end (see SimulatesBrowserCsrf) because Laravel
 * skips CSRF verification entirely while running unit tests by default.
 */
class CartCsrfProtectionTest extends TestCase
{
    use RefreshDatabase;
    use SimulatesBrowserCsrf;

    public function test_session_user_with_csrf_token_can_manage_cart(): void
    {
        $this->disableTestCsrfBypass();

        $user = User::factory()->create(['role' => 'customer']);
        $product = Product::create([
            'name' => 'Test Hoodie',
            'sku' => 'HOODIE-1',
            'price' => 49.99,
            'cost_price' => 20,
            'stock_quantity' => 10,
            'is_active' => true,
        ]);

        ['cookies' => $cookies] = $this->browserLogin($user->email, 'password');
        $xsrf = urldecode($cookies['XSRF-TOKEN']);
        $headers = ['Origin' => 'http://localhost', 'X-XSRF-TOKEN' => $xsrf];

        $add = $this->withUnencryptedCookies($cookies)->postJson('/api/v1/cart/add', [
            'product_id' => $product->id,
            'qty' => 2,
        ], $headers);
        $add->assertOk();
        $cartItemId = $add->json('items.0.id');

        $update = $this->withUnencryptedCookies($cookies)->patchJson("/api/v1/cart/item/{$cartItemId}", [
            'qty' => 5,
        ], $headers);
        $update->assertOk();
        $update->assertJsonPath('items.0.qty', 5);

        $remove = $this->withUnencryptedCookies($cookies)->deleteJson("/api/v1/cart/item/{$cartItemId}", [], $headers);
        $remove->assertOk();
        $remove->assertJsonPath('items', []);

        $this->withUnencryptedCookies($cookies)->postJson('/api/v1/cart/add', [
            'product_id' => $product->id,
            'qty' => 1,
        ], $headers)->assertOk();

        $clear = $this->withUnencryptedCookies($cookies)->deleteJson('/api/v1/cart', [], $headers);
        $clear->assertOk();
        $clear->assertJsonPath('items', []);
    }

    public function test_session_user_without_csrf_token_is_rejected_with_419(): void
    {
        $this->disableTestCsrfBypass();

        $user = User::factory()->create(['role' => 'customer']);
        $product = Product::create([
            'name' => 'Test Hoodie',
            'sku' => 'HOODIE-2',
            'price' => 49.99,
            'cost_price' => 20,
            'stock_quantity' => 10,
            'is_active' => true,
        ]);

        ['cookies' => $cookies] = $this->browserLogin($user->email, 'password');

        // Session cookie present, but no X-XSRF-TOKEN header — exactly what
        // shop/cart.js sent before the fix (credentials: 'include' only).
        $response = $this->withUnencryptedCookies($cookies)->postJson('/api/v1/cart/add', [
            'product_id' => $product->id,
            'qty' => 1,
        ], ['Origin' => 'http://localhost']);

        $response->assertStatus(419);
    }
}
