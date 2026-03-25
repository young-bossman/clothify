<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\ProductVariant;

class ProductVariantController extends Controller
{
    // GET /api/v1/products/{product}/variants
    public function index(Product $product)
    {
        return response()->json($product->variants);
    }

    // POST /api/v1/products/{product}/variants
    public function store(Request $request, Product $product)
    {
        $validated = $request->validate([
            'size'           => 'required|string',
            'color'          => 'required|string',
            'stock_quantity' => 'required|integer|min:0',
        ]);

        $variant = $product->variants()->create($validated);

        return response()->json($variant, 201);
    }

    // PATCH /api/v1/products/{product}/variants/{variant}
    public function update(Request $request, Product $product, ProductVariant $variant)
    {
        $validated = $request->validate([
            'size'           => 'sometimes|string',
            'color'          => 'sometimes|string',
            'stock_quantity' => 'sometimes|integer|min:0',
        ]);

        $variant->update($validated);

        return response()->json($variant);
    }

    // DELETE /api/v1/products/{product}/variants/{variant}
    public function destroy(Product $product, ProductVariant $variant)
    {
        $variant->delete();

        return response()->json(['message' => 'Variant deleted']);
    }
}