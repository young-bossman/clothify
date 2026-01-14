<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ProductVariant;

class ProductVariantController extends Controller
{
    //
    public function store(Request $request)
{
    $validated = $request->validate([
        'product_id' => 'required|exists:products,id',
        'size' => 'required|string',
        'color' => 'required|string',
        'stock_quantity' => 'required|integer|min:0',
    ]);

    return response()->json(
        ProductVariant::create($validated),
        201
    );
}


}
