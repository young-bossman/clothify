<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    // GET /api/v1/orders
    public function index(Request $request)
    {
        $query = Order::with('orderItems')
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        return response()->json($query->paginate(15));
    }

    // GET /api/v1/orders/{order}
    public function show(Order $order)
    {
        $order->load('orderItems');
        // TODO: eager load orderItems.productVariant.product when variants are wired up

        return response()->json($order);
    }

    // PATCH /api/v1/orders/{order}/status
    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:pending,processing,completed,cancelled',
        ]);

        // If changing to cancelled, restore stock
        if ($request->status === 'cancelled' && $order->status !== 'cancelled') {
            DB::transaction(function () use ($order) {
                $order->orderItems->each(function ($item) {
                    if ($item->productVariant) {
                        $item->productVariant->increment('stock_quantity', $item->quantity);
                    }
                });
            });
        }

        $order->update(['status' => $request->status]);

        return response()->json($order);
    }

    // PATCH /api/v1/orders/{order}/payment-status
    public function updatePaymentStatus(Request $request, Order $order)
    {
        $request->validate([
            'payment_status' => 'required|in:unpaid,paid,refunded',
        ]);

        $order->update(['payment_status' => $request->payment_status]);

        return response()->json($order);
    }

    // POST /api/v1/orders
    // SEC-001: order items and pricing are sourced exclusively from the
    // authenticated user's server-side cart — never from client-submitted
    // item/price fields, which are trivially tampered with by any caller.
    public function store(Request $request)
    {
        $request->validate([
            'delivery_name' => 'required|string|max:255',
            'delivery_phone' => 'required|string|max:20',
            'delivery_address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'region' => 'required|string|max:100',
            'ghana_post_gps' => 'nullable|string|max:20',
            'landmark' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
            'payment_method' => 'required|in:cash_on_delivery,mobile_money,paystack',
        ]);

        $cart = $request->user()->cart()->with('items')->first();

        if (! $cart || $cart->items->isEmpty()) {
            return response()->json([
                'message' => 'Order creation failed',
                'error' => 'Your cart is empty',
            ], 422);
        }

        // Every order item needs a variant (order_items.product_variant_id is NOT NULL);
        // cart items added without one can't be checked out under the current schema.
        $missingVariant = $cart->items->firstWhere('variant_id', null);
        if ($missingVariant) {
            return response()->json([
                'message' => 'Order creation failed',
                'error' => "\"{$missingVariant->name}\" is missing a selected variant. Remove it and add it again.",
            ], 422);
        }

        try {
            $order = DB::transaction(function () use ($request, $cart) {
                // Lock all variants (and their product for authoritative pricing) to
                // prevent race conditions with concurrent checkouts/stock adjustments.
                $variantIds = $cart->items->pluck('variant_id')->all();
                $variants = ProductVariant::whereIn('id', $variantIds)
                    ->lockForUpdate()
                    ->with('product')
                    ->get()
                    ->keyBy('id');

                // Validate existence, product linkage and stock availability for all items
                foreach ($cart->items as $item) {
                    $variant = $variants->get($item->variant_id);

                    if (! $variant) {
                        throw new \Exception("Product variant {$item->variant_id} not found");
                    }

                    if (! $variant->product) {
                        throw new \Exception("Product for variant {$item->variant_id} not found");
                    }

                    if ($variant->stock_quantity < $item->qty) {
                        throw new \Exception("Insufficient stock for {$item->name}. Available: {$variant->stock_quantity}, Requested: {$item->qty}");
                    }
                }

                // Total is computed exclusively from the DB-sourced product price, never client input.
                $totalAmount = $cart->items->sum(fn ($item) => $variants->get($item->variant_id)->product->price * $item->qty);

                // Create order
                $order = Order::create([
                    'user_id' => $request->user()->id,
                    'total_amount' => $totalAmount,
                    'status' => 'pending',
                    'payment_status' => 'unpaid',
                    'delivery_name' => $request->delivery_name,
                    'delivery_phone' => $request->delivery_phone,
                    'delivery_address' => $request->delivery_address,
                    'city' => $request->city,
                    'region' => $request->region,
                    'ghana_post_gps' => $request->ghana_post_gps,
                    'landmark' => $request->landmark,
                    'notes' => $request->notes,
                    'payment_method' => $request->payment_method,
                ]);

                // Create order items and decrement stock
                foreach ($cart->items as $item) {
                    $variant = $variants->get($item->variant_id);

                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_variant_id' => $item->variant_id,
                        'quantity' => $item->qty,
                        'price_at_purchase' => $variant->product->price,
                        'cost_at_purchase' => 0,
                    ]);

                    // Decrement variant stock
                    $variant->decrement('stock_quantity', $item->qty);

                    // Keep product-level stock display in sync if the product uses the same aggregate
                    $variant->product->stock_quantity = max(0, $variant->product->stock_quantity - $item->qty);
                    $variant->product->save();
                }

                // Cart is consumed by the order — clear it inside the same transaction
                // so a placed order can never be checked out twice from the same cart.
                $cart->items()->delete();

                return $order;
            });

            return response()->json($order, 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Order creation failed',
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    // DELETE /api/v1/orders/{order}
    public function destroy(Order $order)
    {
        DB::transaction(function () use ($order) {
            // Restore stock when order is cancelled
            $order->orderItems->each(function ($item) {
                if ($item->productVariant) {
                    $item->productVariant->increment('stock_quantity', $item->quantity);
                }
            });

            $order->delete();
        });

        return response()->json(['message' => 'Order deleted and stock restored']);
    }
}
