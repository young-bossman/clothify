<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;

class StatsController extends Controller
{
    public function index()
    {
        return response()->json([
            'total_products'  => Product::count(),
            'total_orders'    => Order::count(),
            'total_revenue'   => (float) Order::sum('total_amount'),
            'low_stock_count' => Product::where('stock_quantity', '<=', 2)->count(),
            'low_stock_items' => Product::where('stock_quantity', '<=', 2)
                                    ->select('id', 'name', 'sku', 'stock_quantity')
                                    ->orderBy('stock_quantity')
                                    ->get(),
            'recent_orders'   => Order::latest()
                                    ->limit(5)
                                    ->select('id', 'delivery_name', 'total_amount', 'status', 'created_at')
                                    ->get(),
        ]);
    }
}