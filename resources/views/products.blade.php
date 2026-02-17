<x-app title="Products">

<div class="min-h-screen flex bg-gray-900 text-white">

    {{-- Sidebar --}}
    <aside class="w-64 bg-gray-800 p-6">
        <h2 class="text-2xl font-bold text-indigo-400 mb-8">Clothify</h2>

        <nav class="space-y-4">
            <a href="{{ route('dashboard') }}" class="block text-gray-300 hover:text-white">Dashboard</a>
            <a href="{{ route('products') }}" class="block text-white font-semibold">Products</a>
            <a href="#" class="block text-gray-300 hover:text-white">Orders</a>

            <button id="logoutBtn" class="mt-10 w-full text-left text-red-400 hover:text-red-500">
                Logout
            </button>
        </nav>
    </aside>

    {{-- Main --}}
    <main class="flex-1 p-10">

        <div class="flex justify-between items-center mb-4">
            <h1 class="text-3xl font-bold">Products</h1>
            <button id="openCreateModal" class="bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700">
                + Add Product
            </button>
        </div>

        {{-- 🔍 FILTERS --}}
        <div class="flex gap-4 mb-4">
            <input id="searchInput" placeholder="Search name or SKU" class="bg-gray-800 p-2 rounded w-64">

            <select id="statusFilter" class="bg-gray-800 p-2 rounded">
                <option value="">All</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
            </select>

            <select id="sortSelect" class="bg-gray-800 p-2 rounded">
                <option value="created_at:desc">Newest</option>
                <option value="name:asc">Name A–Z</option>
                <option value="price:asc">Price Low → High</option>
                <option value="price:desc">Price High → Low</option>
            </select>
        </div>

        <div class="bg-gray-800 rounded-xl p-6 overflow-x-auto">
            <table class="w-full text-left">
                <thead class="text-gray-400 border-b border-gray-700">
                    <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>SKU</th>
                        <th>Price</th>
                        <th>Cost</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th class="text-right">Actions</th>
                    </tr>
                </thead>
                <tbody id="productsTable"></tbody>
            </table>
        </div>

    </main>
</div>

{{-- ================= CREATE PRODUCT MODAL ================= --}}
<div id="createModal" class="hidden fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <form id="productForm" class="bg-gray-800 p-6 rounded-lg w-96 space-y-4">
        <h2 class="text-xl font-bold">Add Product</h2>

        <input name="name" placeholder="Product name" class="w-full p-2 bg-gray-700 rounded" required>
        <input name="sku" placeholder="SKU" class="w-full p-2 bg-gray-700 rounded" required>
        <input name="price" type="number" step="0.01" placeholder="Price" class="w-full p-2 bg-gray-700 rounded" required>
        <input name="cost_price" type="number" step="0.01" placeholder="Cost Price" class="w-full p-2 bg-gray-700 rounded" required>
        <textarea name="description" placeholder="Description" class="w-full p-2 bg-gray-700 rounded"></textarea>
         <label class="block text-sm mb-1">Product Image</label>

<!-- CREATE IMAGE WRAPPER -->
<div id="createImageWrapper"
     class="flex flex-col items-center justify-center border-2 border-dashed border-gray-500 rounded h-32 cursor-pointer mb-2">
    <img id="createImagePreview" src="" alt="Preview" class="hidden h-28 w-auto rounded mb-1">
    <span id="createImageText" class="text-gray-400 text-sm">Click or drag an image here</span>
    <input type="file" id="createImage" name="image" accept="image/*" class="hidden">
</div>

        <label class="flex items-center gap-2">
            <input type="checkbox" name="is_active" value="1" checked>
            Active
        </label>

        <div class="flex justify-end gap-3 pt-2">
            <button type="button" id="closeCreateModal" class="text-gray-400">Cancel</button>
            <button type="submit" class="bg-indigo-600 px-4 py-2 rounded">Save</button>
        </div>
    </form>
</div>

{{-- ================= EDIT PRODUCT MODAL ================= --}}
<div id="editModal" class="hidden fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <form id="editProductForm" class="bg-gray-800 p-6 rounded-lg w-96 space-y-4">
        <h2 class="text-xl font-bold">Edit Product</h2>

        <input type="hidden" id="editProductId">

        <input id="editName" placeholder="Product name" class="w-full p-2 bg-gray-700 rounded" required>
        <input id="editSku" placeholder="SKU" class="w-full p-2 bg-gray-700 rounded" required>
        <input id="editPrice" type="number" step="0.01" placeholder="Price" class="w-full p-2 bg-gray-700 rounded" required>
        <input id="editCostPrice" type="number" step="0.01" placeholder="Cost Price" class="w-full p-2 bg-gray-700 rounded" required>
        <textarea id="editDescription" placeholder="Description" class="w-full p-2 bg-gray-700 rounded"></textarea>
         
      <label class="block text-sm mb-1">Product Image</label>
        <div id="editImageWrapper"
     class="flex flex-col items-center justify-center border-2 border-dashed border-gray-500 rounded h-32 cursor-pointer mb-2">
    <img id="editImagePreview" src="" alt="Preview" class="hidden h-28 w-auto rounded mb-1">
    <span id="editImageText" class="text-gray-400 text-sm">Click or drag an image here</span>
    <input type="file" id="editImage" name="image" accept="image/*" class="hidden">
</div>


        <label class="flex items-center gap-2">
            <input type="checkbox" id="editIsActive">
            Active
        </label>

        <div class="flex justify-end gap-3 pt-2">
            <button type="button" id="closeEditModal" class="text-gray-400">Cancel</button>
            <button type="submit" class="bg-indigo-600 px-4 py-2 rounded">Update</button>
        </div>
    </form>
</div>

{{-- JS --}}
@vite('resources/js/products.js')

</x-app>
