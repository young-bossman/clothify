<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    /**
     * GET /api/v1/cart
     * Get the authenticated user's cart
     */
    public function get(Request $request)
    {
        $cart = $request->user()->cart()->with('items')->first();

        if (!$cart) {
            return response()->json([
                'items' => [],
                'total' => 0,
                'count' => 0,
            ]);
        }

        return response()->json([
            'items' => $cart->items,
            'total' => $cart->total(),
            'count' => $cart->count(),
        ]);
    }

    /**
     * POST /api/v1/cart/add
     * Add item to cart
     */
    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'nullable|exists:product_variants,id',
            'qty' => 'integer|min:1',
        ]);

        $product = Product::findOrFail($request->product_id);
        $variantId = $request->variant_id;
        $qty = $request->qty ?? 1;

        // Get or create cart for user
        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);

        // Check if item already in cart
        $existingItem = $cart->items()
            ->where('product_id', $product->id)
            ->where('variant_id', $variantId)
            ->first();

        if ($existingItem) {
            $existingItem->increment('qty', $qty);
        } else {
            CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $product->id,
                'variant_id' => $variantId,
                'name' => $product->name,
                'price' => $product->price,
                'image' => $product->image,
                'qty' => $qty,
            ]);
        }

        $cart->load('items');

        return response()->json([
            'message' => 'Added to cart',
            'items' => $cart->items,
            'total' => $cart->total(),
            'count' => $cart->count(),
        ]);
    }

    /**
     * PATCH /api/v1/cart/item/{cartItem}
     * Update cart item quantity
     */
    public function updateItem(Request $request, CartItem $cartItem)
    {
        // Verify user owns this cart item
        if ($cartItem->cart->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'qty' => 'required|integer|min:0',
        ]);

        $qty = $request->qty;

        if ($qty <= 0) {
            $cartItem->delete();
        } else {
            $cartItem->update(['qty' => $qty]);
        }

        $cart = $cartItem->cart;
        $cart->load('items');

        return response()->json([
            'message' => 'Cart updated',
            'items' => $cart->items,
            'total' => $cart->total(),
            'count' => $cart->count(),
        ]);
    }

    /**
     * DELETE /api/v1/cart/item/{cartItem}
     * Remove item from cart
     */
    public function removeItem(Request $request, CartItem $cartItem)
    {
        // Verify user owns this cart item
        if ($cartItem->cart->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $cart = $cartItem->cart;
        $cartItem->delete();
        $cart->load('items');

        return response()->json([
            'message' => 'Item removed',
            'items' => $cart->items,
            'total' => $cart->total(),
            'count' => $cart->count(),
        ]);
    }

    /**
     * DELETE /api/v1/cart
     * Clear entire cart
     */
    public function clear(Request $request)
    {
        $cart = $request->user()->cart;

        if ($cart) {
            $cart->items()->delete();
        }

        return response()->json([
            'message' => 'Cart cleared',
            'items' => [],
            'total' => 0,
            'count' => 0,
        ]);
    }
}
