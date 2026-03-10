<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

    use App\Models\OrderItem;
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
public function store(Request $request)
{
    $request->validate([
        'delivery_name'    => 'required|string|max:255',
        'delivery_phone'   => 'required|string|max:20',
        'delivery_address' => 'required|string|max:255',
        'city'             => 'required|string|max:100',
        'region'           => 'required|string|max:100',
        'ghana_post_gps'   => 'nullable|string|max:20',
        'landmark'         => 'nullable|string|max:255',
        'notes'            => 'nullable|string|max:1000',
        'payment_method'   => 'required|in:cash_on_delivery,mobile_money,paystack',
        'items'            => 'required|array|min:1',
        'items.*.id'       => 'required|integer',
        'items.*.name'     => 'required|string',
        'items.*.price'    => 'required|numeric|min:0',
        'items.*.qty'      => 'required|integer|min:1',
    ]);

    $items       = $request->items;
    $totalAmount = collect($items)->sum(fn($i) => $i['price'] * $i['qty']);

    $order = DB::transaction(function () use ($request, $items, $totalAmount) {
        $order = Order::create([
            'user_id'          => $request->user()->id,
            'total_amount'     => $totalAmount,
            'status'           => 'pending',
            'payment_status'   => 'unpaid',
            'delivery_name'    => $request->delivery_name,
            'delivery_phone'   => $request->delivery_phone,
            'delivery_address' => $request->delivery_address,
            'city'             => $request->city,
            'region'           => $request->region,
            'ghana_post_gps'   => $request->ghana_post_gps,
            'landmark'         => $request->landmark,
            'notes'            => $request->notes,
            'payment_method'   => $request->payment_method,
        ]);

        foreach ($items as $item) {
            OrderItem::create([
                'order_id'           => $order->id,
                'product_variant_id' => 1, // TODO: replace with real variant_id when variants wired to cart
                'quantity'           => $item['qty'],
                'price_at_purchase'  => $item['price'],
                'cost_at_purchase'   => 0, // TODO: pull from product cost_price when available
            ]);
        }

        return $order;
    });

    return response()->json($order, 201);
}


    // DELETE /api/v1/orders/{order}
    public function destroy(Order $order)
    {
        $order->delete();

        return response()->json(['message' => 'Order deleted']);
    }
}