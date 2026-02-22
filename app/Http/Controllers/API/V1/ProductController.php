<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\StockMovement;
use App\Models\Category; // ADDED: for category validation

class ProductController extends Controller
{
    // GET /api/v1/products
    // List products with pagination, search, and sorting
    public function index(Request $request)
    {
        // ADDED: eager load category
        $query = Product::with('category');

        // 🔍 SEARCH
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // ADDED: search/filter by category
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // FILTER ACTIVE / INACTIVE
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
    // Handle product creation with validation and image upload
    public function store(Request $request)
    {
        
    // 🔥 HANDLE NEW CATEGORY CREATION
if ($request->category_id === 'new' && $request->new_category) {
    $newCategory = Category::create([
        'name' => $request->new_category
    ]);

    $request->merge([
        'category_id' => $newCategory->id
    ]);
}

        
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'sku'            => 'required|string|max:255|unique:products,sku',
            'price'          => 'required|numeric|min:0',
            'cost_price'     => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0', // ADDED
            'category_id'    => 'nullable|exists:categories,id', // ADDED
            'description'    => 'nullable|string',
            'image'          => 'nullable|image|max:2048|mimes:jpeg,png,jpg',
            'is_active'      => 'required|boolean',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        // ADDED: create product first
        $product = Product::create($validated);

        // ADDED: create initial stock movement if stock > 0
        if ($product->stock_quantity > 0) {
            StockMovement::create([
                'product_id' => $product->id,
                'quantity'   => $product->stock_quantity,
                'type'       => 'restock',
                'note'       => 'Initial stock',
                'user_id'    => auth()->id()
            ]);
        }

        return response()->json(
            $product->load('category'),
            201
        );
    }

    // GET /api/v1/products/{product}
    public function show(Product $product)
    {
        // ADDED: include category relation
        return response()->json(
            $product->load('category')
        );
    }

    // PUT /api/v1/products/{product}
    public function update(Request $request, Product $product)
    {

    // 🔥 HANDLE NEW CATEGORY CREATION
if ($request->category_id === 'new' && $request->new_category) {
    $newCategory = Category::create([
        'name' => $request->new_category
    ]);

    $request->merge([
        'category_id' => $newCategory->id
    ]);
}
        $validated = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'sku'         => 'sometimes|string|max:255|unique:products,sku,' . $product->id,
            'price'       => 'sometimes|numeric|min:0',
            'cost_price'  => 'sometimes|numeric|min:0',
            'category_id' => 'nullable|exists:categories,id', // ADDED
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

        return response()->json($product->fresh()->load('category'));
    }

    // POST /api/v1/products/{product}/adjust-stock
    public function adjustStock(Request $request, Product $product)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer',
            'type' => 'required|in:adjustment,restock,damage,return',
            'note' => 'nullable|string|max:255'
        ]);

        // Update product stock
        $product->stock_quantity += $validated['quantity'];
        $product->save();

        // Record movement
        StockMovement::create([
            'product_id' => $product->id,
            'quantity' => $validated['quantity'],
            'type' => $validated['type'],
            'note' => $validated['note'] ?? null,
            'user_id' => auth()->id()
        ]);

        return response()->json([
            'message' => 'Stock updated successfully',
            'stock_quantity' => $product->stock_quantity
        ]);
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
