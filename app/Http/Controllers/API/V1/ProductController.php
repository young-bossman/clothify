<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\StockMovement;
use App\Models\Category;

class ProductController extends Controller
{
    // GET /api/v1/products
    // List products with pagination, search, and sorting
    public function index(Request $request)
    {
        $query = Product::with('category');

        // Only show active products on the public storefront
        // Admin panel passes no `public` param so it sees everything
        if ($request->boolean('public')) {
            $query->where('is_active', true);
        }

        // Search by name or SKU
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('sku', 'like', '%' . $request->search . '%');
            });
        }

        // Filter by active status (admin panel only)
        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        // Filter by category
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by price range (storefront)
        if ($request->filled('price_min')) {
            $query->where('price', '>=', $request->price_min);
        }

        if ($request->filled('price_max')) {
            $query->where('price', '<=', $request->price_max);
        }

        // Sorting
        $sortBy  = in_array($request->sort_by, ['name', 'price', 'created_at'])
            ? $request->sort_by
            : 'created_at';
        $sortDir = $request->sort_dir === 'asc' ? 'asc' : 'desc';

        $query->orderBy($sortBy, $sortDir);

        return response()->json(
            $query->paginate(12)
        );
    }

    // POST /api/v1/products
    // Handle product creation with validation and image upload
    public function store(Request $request)
    {
        // Validate FIRST before touching the database.
        // category_id is nullable here — new category creation
        // happens after validation passes inside the transaction.
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'sku'            => 'required|string|max:255|unique:products,sku',
            'price'          => 'required|numeric|min:0',
            'cost_price'     => 'required|numeric|min:0',
            'stock_quantity' => 'required|integer|min:0',
            'category_id'    => 'nullable',
            'description'    => 'nullable|string',
            'image'          => 'nullable|image|max:2048|mimes:jpeg,png,jpg',
            'is_active'      => 'required|boolean',
        ]);

        return DB::transaction(function () use ($request, $validated) {

            // 🔥 HANDLE NEW CATEGORY CREATION
            // Runs after validation so a failed SKU check never
            // leaves an orphan category in the database.
            if ($request->category_id === 'new' && $request->new_category) {
                $newCategory = Category::create(['name' => $request->new_category]);
                $validated['category_id'] = $newCategory->id;
            }

            if ($request->hasFile('image')) {
                $validated['image'] = $request->file('image')->store('products', 'public');
            }

            $product = Product::create($validated);

            // Auto-create a default variant linked to this product
                \App\Models\ProductVariant::create([
                    'product_id'     => $product->id,
                    'size'           => 'Default',
                    'color'          => 'Default',
                    'stock_quantity' => $validated['stock_quantity'],
                ]);

            // Record initial stock movement if stock > 0
            if ($product->stock_quantity > 0) {
                StockMovement::create([
                    'product_id' => $product->id,
                    'quantity'   => $product->stock_quantity,
                    'type'       => 'restock',
                    'note'       => 'Initial stock',
                    'user_id'    => auth()->id()
                ]);
            }

            return response()->json($product->load('category'), 201);
        });
    }

    // GET /api/v1/products/{product}
    public function show(Product $product)
    {
        return response()->json(
            $product->load('category', 'variants')
        );
    }

    // PUT /api/v1/products/{product}
    public function update(Request $request, Product $product)
    {
        // Validate FIRST before touching the database.
        $validated = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'sku'         => 'sometimes|string|max:255|unique:products,sku,' . $product->id,
            'price'       => 'sometimes|numeric|min:0',
            'cost_price'  => 'sometimes|numeric|min:0',
            'category_id' => 'nullable',
            'description' => 'nullable|string',
            'is_active'   => 'sometimes|boolean',
            'image'       => 'nullable|image|max:2048',
        ]);

        return DB::transaction(function () use ($request, $validated, $product) {

            // 🔥 HANDLE NEW CATEGORY CREATION
            // Runs after validation so a failed SKU check never
            // leaves an orphan category in the database.
            if ($request->category_id === 'new' && $request->new_category) {
                $newCategory = Category::create(['name' => $request->new_category]);
                $validated['category_id'] = $newCategory->id;
            }

            if ($request->hasFile('image')) {
                if ($product->image) {
                    Storage::disk('public')->delete($product->image);
                }
                $validated['image'] = $request->file('image')->store('products', 'public');
            }

            $product->update($validated);

            return response()->json($product->fresh()->load('category'));
        });
    }

    // POST /api/v1/products/{product}/adjust-stock
    public function adjustStock(Request $request, Product $product)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer',
            'type'     => 'required|in:adjustment,restock,damage,return',
            'note'     => 'nullable|string|max:255'
        ]);

        // Update product stock
        $product->stock_quantity += $validated['quantity'];
        $product->save();

        // Record movement
        StockMovement::create([
            'product_id' => $product->id,
            'quantity'   => $validated['quantity'],
            'type'       => $validated['type'],
            'note'       => $validated['note'] ?? null,
            'user_id'    => auth()->id()
        ]);

        return response()->json([
            'message'        => 'Stock updated successfully',
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