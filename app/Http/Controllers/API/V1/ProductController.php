<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // GET /api/v1/products
    public function index()
    {
        return response()->json(
            Product::with('variants')->get()
        );
    }

    // POST /api/v1/products
    public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string',
        'sku' => 'required|string|unique:products',
        'price' => 'required|numeric',
        'cost_price' => 'required|numeric',
        'description' => 'nullable|string',
        'image' => 'nullable|image|max:2048',
    ]);

    if ($request->hasFile('image')) {
        $validated['image'] = $request->file('image')
            ->store('products', 'public');
    }

    $product = Product::create($validated);

    return response()->json($product, 201);
}


    // GET /api/v1/products/{id}
    public function show(Product $product)
    {
        return response()->json(
            $product->load('variants')
        );
    }

    // PUT /api/v1/products/{id}
   public function update(Request $request, Product $product)
{
    $validated = $request->validate([
        'name' => 'sometimes|string',
        'price' => 'sometimes|numeric',
        'cost_price' => 'sometimes|numeric',
        'description' => 'nullable|string',
        'is_active' => 'boolean',
        'image' => 'nullable|image|max:2048',
    ]);

    if ($request->hasFile('image')) {
        $validated['image'] = $request->file('image')
            ->store('products', 'public');
    }

    $product->update($validated);

    return response()->json($product);
}


    // DELETE /api/v1/products/{id}
    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully'
        ]);
    }
}
