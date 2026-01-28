<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    // GET /api/v1/products
    public function index(Request $request)
    {
        $query = Product::query();

        // 🔍 SEARCH
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // ✅ FILTER ACTIVE / INACTIVE
        if ($request->filled('status')) {
            $query->where('is_active', $request->status);
        }

        // 🔃 SORTING
        $sortBy  = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');

        if (in_array($sortBy, ['name', 'price', 'created_at'])) {
            $query->orderBy($sortBy, $sortDir);
        }

        return response()->json(
            $query->latest()->paginate(10)
        );
    }

    // POST /api/v1/products
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'sku'         => 'required|string|max:255|unique:products,sku',
            'price'       => 'required|numeric|min:0',
            'cost_price'  => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'image'       => 'nullable|image|max:2048',
            'is_active'   => 'required|boolean',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        return response()->json(
            Product::create($validated),
            201
        );
    }

    // GET /api/v1/products/{product}
    public function show(Product $product)
    {
        return response()->json($product);
    }

    // PUT /api/v1/products/{product}
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'sku'         => 'sometimes|string|max:255|unique:products,sku,' . $product->id,
            'price'       => 'sometimes|numeric|min:0',
            'cost_price'  => 'sometimes|numeric|min:0',
            'description' => 'nullable|string',
            'is_active'   => 'sometimes|boolean',
            'image'       => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($validated);

        return response()->json($product->fresh());
    }

    // DELETE /api/v1/products/{product}
    public function destroy(Product $product)
    {
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted']);
    }
}
