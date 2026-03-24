<x-app title="Products">

<div class="min-h-screen flex bg-gray-900 text-white">

    {{-- Sidebar --}}
    <aside class="w-64 bg-gray-800 p-6">
        <h2 class="text-2xl font-bold text-indigo-400 mb-8">Clothify</h2>

        <nav class="space-y-4">
            <a href="{{ route('dashboard') }}" class="block text-gray-300 hover:text-white">Dashboard</a>
            <a href="{{ route('products') }}" class="block text-white font-semibold">Products</a>
            <a href="{{ route('orders') }}" class="block text-gray-300 hover:text-white">Orders</a>
            <a href="{{ route('shop') }}" class="block text-gray-300 hover:text-white">Online Shop</a>

            <button id="logoutBtn" class="mt-10 w-full text-left text-red-400 hover:text-red-500">
                Logout
            </button>
        </nav>
    </aside>

    {{-- Main --}}
    <main class="flex-1 p-6">

        <div class="flex justify-between items-center mb-4">
            <h1 class="text-2xl font-bold">Products</h1>
            <button id="openCreateModal" class="bg-indigo-600 px-3 py-2 text-sm rounded-lg hover:bg-indigo-700">
                + Add Product
            </button>
        </div>

        {{-- FILTERS --}}
        <div class="flex gap-2 mb-4 flex-wrap">

            <input id="searchInput" placeholder="Search name or SKU"
                   class="bg-gray-800 p-2 text-sm rounded w-48">

            <select id="statusFilter" class="bg-gray-800 p-2 text-sm rounded">
                <option value="">All</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
            </select>

            {{-- Category Filter --}}
            <select id="categoryFilter" class="bg-gray-800 p-2 text-sm rounded">
                <option value="">All Categories</option>
            </select>

            <select id="sortSelect" class="bg-gray-800 p-2 text-sm rounded">
                <option value="created_at:desc">Newest</option>
                <option value="name:asc">Name A–Z</option>
                <option value="price:asc">Price Low → High</option>
                <option value="price:desc">Price High → Low</option>
            </select>
        </div>

        <div class="bg-gray-800 rounded-xl p-4 overflow-x-auto">
            <table class="w-full text-left text-sm">
                {{-- CHANGED: tighter padding and smaller text on headers --}}
                <thead class="text-gray-400 border-b border-gray-700 text-xs uppercase tracking-wide">
                    <tr>
                        <th class="py-2 px-2">Image</th>
                        <th class="py-2 px-2">Name</th>
                        <th class="py-2 px-2">SKU</th>
                        <th class="py-2 px-2">Category</th>
                        <th class="py-2 px-2">Stock</th>
                        <th class="py-2 px-2">Price</th>
                        <th class="py-2 px-2">Cost</th>
                        <th class="py-2 px-2">Description</th>
                        <th class="py-2 px-2">Status</th>
                        <th class="py-2 px-2 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody id="productsTable"></tbody>
            </table>
        </div>

        {{-- Pagination container --}}
        <div id="paginationContainer" class="flex justify-center mt-4 space-x-2"></div>

    </main>
</div>

{{-- ================= CREATE PRODUCT MODAL ================= --}}
<div id="createModal" class="hidden fixed inset-0 bg-black/60 z-50 items-center justify-center">
    <form id="productForm"
          class="bg-gray-800 p-6 rounded-lg w-96 space-y-3 max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-bold">Add Product</h2>

        {{-- Error container — scroll target --}}
        <div id="createErrors" class="hidden text-red-400 text-sm space-y-1 bg-red-900/30 border border-red-500/40 rounded p-3"></div>

        <input name="name" placeholder="Product name"
               class="w-full p-2 text-sm bg-gray-700 rounded" required>
        <input name="sku" placeholder="SKU"
               class="w-full p-2 text-sm bg-gray-700 rounded" required>
        <input name="price" type="number" step="0.01" placeholder="Price"
               class="w-full p-2 text-sm bg-gray-700 rounded" required>
        <input name="cost_price" type="number" step="0.01" placeholder="Cost Price"
               class="w-full p-2 text-sm bg-gray-700 rounded" required>
        <input name="stock_quantity" type="number" min="0" placeholder="Initial Stock Quantity"
               class="w-full p-2 text-sm bg-gray-700 rounded" required>

        <select id="createCategorySelect" name="category_id"
                class="w-full p-2 text-sm bg-gray-700 rounded">
            <option value="">Select Category</option>
        </select>

        <div class="flex items-center gap-2">
            <input type="text" id="createNewCategory" name="new_category"
                   placeholder="Enter new category name"
                   class="w-full p-2 text-sm bg-gray-700 rounded hidden">
            <button type="button" id="toggleCreateCategory"
                    class="text-indigo-400 text-sm whitespace-nowrap hover:text-indigo-300">
                + New Category
            </button>
        </div>

        <textarea name="description" placeholder="Description"
                  class="w-full p-2 text-sm bg-gray-700 rounded h-20"></textarea>

        <label class="block text-sm mb-1">Product Image</label>
        <div id="createImageWrapper"
             class="flex flex-col items-center justify-center border-2 border-dashed border-gray-500 rounded h-28 cursor-pointer">
            <img id="createImagePreview" src="" alt="Preview" class="hidden h-24 w-auto rounded mb-1">
            <span id="createImageText" class="text-gray-400 text-xs">Click or drag an image here</span>
            <input type="file" id="createImage" name="image" accept="image/*" class="hidden">
        </div>

        <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_active" value="1" checked> Active
        </label>

        <div class="flex justify-end gap-3 pt-2">
            <button type="button" id="closeCreateModal" class="text-gray-400 text-sm">Cancel</button>
            <button type="submit" id="createSubmitBtn" class="bg-indigo-600 px-4 py-2 text-sm rounded">Save</button>
        </div>
    </form>
</div>


{{-- ================= EDIT PRODUCT MODAL ================= --}}
<div id="editModal" class="hidden fixed inset-0 bg-black/60 z-50 items-center justify-center">
    <form id="editProductForm"
          class="bg-gray-800 p-6 rounded-lg w-96 space-y-3 max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-bold">Edit Product</h2>

        <div id="editErrors" class="hidden text-red-400 text-sm space-y-1 bg-red-900/30 border border-red-500/40 rounded p-3"></div>

        <input type="hidden" id="editProductId">
        <input id="editName" placeholder="Product name" class="w-full p-2 text-sm bg-gray-700 rounded" required>
        <input id="editSku" placeholder="SKU" class="w-full p-2 text-sm bg-gray-700 rounded" required>
        <input id="editPrice" type="number" step="0.01" placeholder="Price" class="w-full p-2 text-sm bg-gray-700 rounded" required>
        <input id="editCostPrice" type="number" step="0.01" placeholder="Cost Price" class="w-full p-2 text-sm bg-gray-700 rounded" required>

        <select id="editCategorySelect" name="category_id" class="w-full p-2 text-sm bg-gray-700 rounded">
            <option value="">Select Category</option>
        </select>

        <div class="flex items-center gap-2">
            <input type="text" id="editNewCategory" name="new_category"
                   placeholder="Enter new category name"
                   class="w-full p-2 text-sm bg-gray-700 rounded hidden">
            <button type="button" id="toggleEditCategory"
                    class="text-indigo-400 text-sm whitespace-nowrap hover:text-indigo-300">
                + New Category
            </button>
        </div>

        <textarea id="editDescription" placeholder="Description"
                  class="w-full p-2 text-sm bg-gray-700 rounded h-20"></textarea>

        <label class="block text-sm mb-1">Product Image</label>
        <div id="editImageWrapper"
             class="flex flex-col items-center justify-center border-2 border-dashed border-gray-500 rounded h-28 cursor-pointer">
            <img id="editImagePreview" src="" alt="Preview" class="hidden h-24 w-auto rounded mb-1">
            <span id="editImageText" class="text-gray-400 text-xs">Click or drag an image here</span>
            <input type="file" id="editImage" name="image" accept="image/*" class="hidden">
        </div>

        <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" id="editIsActive"> Active
        </label>

        <div class="flex justify-end gap-3 pt-2">
            <button type="button" id="closeEditModal" class="text-gray-400 text-sm">Cancel</button>
            <button type="submit" id="editSubmitBtn" class="bg-indigo-600 px-4 py-2 text-sm rounded">Update</button>
        </div>
    </form>
</div>



{{-- JS --}}
@vite('resources/js/products/main.js')

</x-app>