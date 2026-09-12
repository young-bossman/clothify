<x-app title="Products">

{{-- No background or text colour here — .admin-shell on <body> owns both. --}}
<div class="min-h-screen flex">

    {{-- Sidebar --}}
    <x-sidebar />

    <div class="flex-1 min-w-0">

        <x-topbar />

    {{-- Main --}}
    <main class="p-4 sm:p-6 max-w-[1400px] space-y-6">

        <div class="flex flex-wrap items-center justify-between gap-3 fade-in">
            <h1 class="text-2xl font-bold text-white">Products</h1>
            <button id="openCreateModal"
                    class="focus-ring flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 transition text-white text-sm font-semibold px-4 py-1.5 rounded-lg">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                Add Product
            </button>
        </div>

        {{-- One card holds the filters and the table. The filter bar is divided
             off by a border instead of floating in its own box, so the whole
             control surface reads as a single panel. --}}
        <div class="bg-slate-850 border border-slate-800 rounded-xl overflow-hidden fade-in">

            {{-- FILTERS --}}
            <div class="flex flex-wrap items-center gap-2 p-4 sm:p-5 border-b border-slate-800">

                {{-- Grows to fill whatever the selects leave behind, but never
                     below 180px, so the four controls wrap instead of crushing. --}}
                <div class="relative flex-1 min-w-[180px]">
                    <svg class="w-4 h-4 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    <label for="searchInput" class="sr-only">Search name or SKU</label>
                    <input id="searchInput" type="text" placeholder="Search name or SKU"
                           class="focus-ring w-full bg-slate-900 border border-slate-700 text-sm rounded-lg pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-500">
                </div>

                {{-- Values must be the literal strings the API compares against:
                     ProductController@index does `where('is_active', $request->status === 'active')`.
                     Sending 1/0 here made both options resolve to false and return
                     inactive products either way. --}}
                <label for="statusFilter" class="sr-only">Filter by status</label>
                <select id="statusFilter"
                        class="focus-ring bg-slate-900 border border-slate-700 text-sm rounded-lg px-3 py-1.5 text-slate-300">
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>

                {{-- Category options are appended by populateCategorySelects(),
                     keyed by category id — this placeholder is the only static one. --}}
                <label for="categoryFilter" class="sr-only">Filter by category</label>
                <select id="categoryFilter"
                        class="focus-ring bg-slate-900 border border-slate-700 text-sm rounded-lg px-3 py-1.5 text-slate-300">
                    <option value="">All Categories</option>
                </select>

                <label for="sortSelect" class="sr-only">Sort</label>
                <select id="sortSelect"
                        class="focus-ring bg-slate-900 border border-slate-700 text-sm rounded-lg px-3 py-1.5 text-slate-300">
                    <option value="created_at:desc">Newest</option>
                    <option value="name:asc">Name A–Z</option>
                    <option value="price:asc">Price Low → High</option>
                    <option value="price:desc">Price High → Low</option>
                </select>
            </div>

            {{-- Bare scroller: the card owns the padding and the rounding, so the
                 horizontal scrollbar never clips a rounded corner. --}}
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    {{-- Eight columns. Cost and Description were dropped from the
                         list view to stop the table scrolling sideways on a laptop;
                         both remain editable in the create and edit modals. --}}
                    <thead class="bg-slate-900/60 text-slate-400 text-xs uppercase tracking-wide">
                        <tr>
                            <th class="text-left px-4 py-3 font-medium">Image</th>
                            <th class="text-left px-4 py-3 font-medium">Name</th>
                            <th class="text-left px-4 py-3 font-medium">SKU</th>
                            <th class="text-left px-4 py-3 font-medium">Category</th>
                            <th class="text-left px-4 py-3 font-medium">Stock</th>
                            <th class="text-left px-4 py-3 font-medium">Price</th>
                            <th class="text-left px-4 py-3 font-medium">Status</th>
                            <th class="text-right px-4 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="productsTable" class="divide-y divide-slate-800"></tbody>
                </table>
            </div>

            {{-- Pagination footer. Lives inside the card so the summary and the
                 page buttons sit on the same surface as the rows they describe. --}}
            <div class="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-3 border-t border-slate-800 text-sm">
                <span id="paginationSummary" class="text-slate-500 text-xs"></span>
                <div id="paginationContainer" class="flex items-center gap-1"></div>
            </div>
        </div>

        </main>
    </div>
</div>

{{-- ================= CREATE PRODUCT MODAL =================
     All three modals are siblings of the shell wrapper, never nested inside
     it. .sidebar carries `transition: transform`, and a transformed ancestor
     makes position:fixed resolve against that ancestor instead of the
     viewport — which would break these only on mobile, only while the drawer
     animates. Centring utilities stay on the root; the hidden↔flex swap in
     openModal()/closeModal() is what reveals them. --}}
<div id="createModal" class="hidden fixed inset-0 bg-black/60 z-50 items-center justify-center p-4">
    {{-- The scrolling element is the <form> itself. showErrors() calls
         closest('form').scrollTo() to bring 422 messages back into view, and
         moving the scroll to an inner wrapper makes that a silent no-op. --}}
    <form id="productForm" role="dialog" aria-modal="true" aria-labelledby="createModalTitle"
          class="bg-slate-850 border border-slate-800 p-5 sm:p-6 rounded-xl w-full max-w-sm space-y-3 max-h-[90vh] overflow-y-auto">
        <h2 id="createModalTitle" class="text-lg font-bold text-white">Add product</h2>

        {{-- Error container — scroll target; must stay inside the form --}}
        <div id="createErrors" class="hidden text-rose-300 text-sm space-y-1 bg-rose-500/10 border border-rose-500/30 rounded-lg p-3"></div>

        {{-- Every field keeps its `name`: the submit path is new FormData(productForm).
             The ids exist only so each <label for> has something to point at. --}}
        <div class="space-y-1">
            <label for="createName" class="block text-xs font-medium text-slate-400">Product name</label>
            <input id="createName" name="name" placeholder="Men Hoodie"
                   class="focus-ring w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500" required>
        </div>

        <div class="space-y-1">
            <label for="createSku" class="block text-xs font-medium text-slate-400">SKU</label>
            <input id="createSku" name="sku" placeholder="HOOD-001"
                   class="focus-ring w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 font-mono" required>
        </div>

        <div class="grid grid-cols-2 gap-2">
            <div class="space-y-1">
                <label for="createPrice" class="block text-xs font-medium text-slate-400">Price</label>
                <input id="createPrice" name="price" type="number" step="0.01"
                       class="focus-ring w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200" required>
            </div>
            <div class="space-y-1">
                <label for="createCostPrice" class="block text-xs font-medium text-slate-400">Cost price</label>
                <input id="createCostPrice" name="cost_price" type="number" step="0.01"
                       class="focus-ring w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200" required>
            </div>
        </div>

        <div class="space-y-1">
            <label for="createStock" class="block text-xs font-medium text-slate-400">Initial stock</label>
            <input id="createStock" name="stock_quantity" type="number" min="0"
                   class="focus-ring w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200" required>
        </div>

        <div class="space-y-1">
            <label for="createCategorySelect" class="block text-xs font-medium text-slate-400">Category</label>
            <select id="createCategorySelect" name="category_id"
                    class="focus-ring w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-300">
                <option value="">Select Category</option>
            </select>
        </div>

        {{-- The `hidden` class on this input is the flag bindCategoryToggles()
             and the submit handler read to decide category_id = 'new'. --}}
        <div class="flex items-center gap-2">
            <label for="createNewCategory" class="sr-only">New category name</label>
            <input type="text" id="createNewCategory" name="new_category"
                   placeholder="Enter new category name"
                   class="focus-ring w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 hidden">
            <button type="button" id="toggleCreateCategory"
                    class="focus-ring text-indigo-400 text-sm whitespace-nowrap hover:text-indigo-300 rounded">
                + New category
            </button>
        </div>

        <div class="space-y-1">
            <label for="createDescription" class="block text-xs font-medium text-slate-400">Description</label>
            <textarea id="createDescription" name="description" placeholder="Optional"
                      class="focus-ring w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg h-20 text-slate-200 placeholder-slate-500"></textarea>
        </div>

        <div class="space-y-1">
            <label for="createImage" class="block text-xs font-medium text-slate-400">Product image</label>
            <div id="createImageWrapper"
                 class="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-slate-600 transition rounded-lg h-28 cursor-pointer">
                <img id="createImagePreview" src="" alt="Preview" class="hidden h-24 w-auto rounded mb-1">
                <span id="createImageText" class="text-slate-500 text-xs">Click or drag an image here</span>
                <input type="file" id="createImage" name="image" accept="image/*" class="hidden">
            </div>
        </div>

        <label class="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" name="is_active" value="1" checked
                   class="focus-ring rounded border-slate-700 bg-slate-900"> Active
        </label>

        <div class="flex justify-end gap-3 pt-2">
            <button type="button" id="closeCreateModal" class="focus-ring text-slate-400 hover:text-slate-200 text-sm rounded px-2">Cancel</button>
            <button type="submit" id="createSubmitBtn" class="focus-ring bg-indigo-600 hover:bg-indigo-700 transition px-4 py-2 text-sm font-semibold rounded-lg text-white">Save</button>
        </div>
    </form>
</div>


{{-- ================= EDIT PRODUCT MODAL =================
     Every id here is read by getElementById in handlers.js — none may change.
     No stock field: ProductController@update does not validate stock_quantity. --}}
<div id="editModal" class="hidden fixed inset-0 bg-black/60 z-50 items-center justify-center p-4">
    <form id="editProductForm" role="dialog" aria-modal="true" aria-labelledby="editModalTitle"
          class="bg-slate-850 border border-slate-800 p-5 sm:p-6 rounded-xl w-full max-w-sm space-y-3 max-h-[90vh] overflow-y-auto">
        <h2 id="editModalTitle" class="text-lg font-bold text-white">Edit product</h2>

        <div id="editErrors" class="hidden text-rose-300 text-sm space-y-1 bg-rose-500/10 border border-rose-500/30 rounded-lg p-3"></div>

        <input type="hidden" id="editProductId">

        <div class="space-y-1">
            <label for="editName" class="block text-xs font-medium text-slate-400">Product name</label>
            <input id="editName"
                   class="focus-ring w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200" required>
        </div>

        <div class="space-y-1">
            <label for="editSku" class="block text-xs font-medium text-slate-400">SKU</label>
            <input id="editSku"
                   class="focus-ring w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono" required>
        </div>

        <div class="grid grid-cols-2 gap-2">
            <div class="space-y-1">
                <label for="editPrice" class="block text-xs font-medium text-slate-400">Price</label>
                <input id="editPrice" type="number" step="0.01"
                       class="focus-ring w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200" required>
            </div>
            <div class="space-y-1">
                <label for="editCostPrice" class="block text-xs font-medium text-slate-400">Cost price</label>
                <input id="editCostPrice" type="number" step="0.01"
                       class="focus-ring w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200" required>
            </div>
        </div>

        <div class="space-y-1">
            <label for="editCategorySelect" class="block text-xs font-medium text-slate-400">Category</label>
            <select id="editCategorySelect" name="category_id"
                    class="focus-ring w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-300">
                <option value="">Select Category</option>
            </select>
        </div>

        {{-- As in the create modal, `hidden` here is the category_id = 'new' flag. --}}
        <div class="flex items-center gap-2">
            <label for="editNewCategory" class="sr-only">New category name</label>
            <input type="text" id="editNewCategory" name="new_category"
                   placeholder="Enter new category name"
                   class="focus-ring w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 hidden">
            <button type="button" id="toggleEditCategory"
                    class="focus-ring text-indigo-400 text-sm whitespace-nowrap hover:text-indigo-300 rounded">
                + New category
            </button>
        </div>

        <div class="space-y-1">
            <label for="editDescription" class="block text-xs font-medium text-slate-400">Description</label>
            <textarea id="editDescription"
                      class="focus-ring w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg h-20 text-slate-200"></textarea>
        </div>

        <div class="space-y-1">
            <label for="editImage" class="block text-xs font-medium text-slate-400">Product image</label>
            <div id="editImageWrapper"
                 class="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-slate-600 transition rounded-lg h-28 cursor-pointer">
                <img id="editImagePreview" src="" alt="Preview" class="hidden h-24 w-auto rounded mb-1">
                <span id="editImageText" class="text-slate-500 text-xs">Click or drag an image here</span>
                <input type="file" id="editImage" name="image" accept="image/*" class="hidden">
            </div>
        </div>

        <label class="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" id="editIsActive"
                   class="focus-ring rounded border-slate-700 bg-slate-900"> Active
        </label>

        <div class="flex justify-end gap-3 pt-2">
            <button type="button" id="closeEditModal" class="focus-ring text-slate-400 hover:text-slate-200 text-sm rounded px-2">Cancel</button>
            <button type="submit" id="editSubmitBtn" class="focus-ring bg-indigo-600 hover:bg-indigo-700 transition px-4 py-2 text-sm font-semibold rounded-lg text-white">Update</button>
        </div>
    </form>
</div>


{{-- ================= VARIANTS MODAL =================
     Shell restyle only. The /api/v1/products/{id}/variants routes this talks
     to do not exist yet and return 404 — a known work-in-progress, deliberately
     left alone in this pass. --}}
<div id="variantsModal" class="hidden fixed inset-0 bg-black/60 z-50 items-center justify-center p-4">
    <div role="dialog" aria-modal="true" aria-labelledby="variantsModalTitle"
         class="bg-slate-850 border border-slate-800 p-5 sm:p-6 rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-4">
        <div class="flex justify-between items-center">
            <h2 class="text-lg font-bold text-white" id="variantsModalTitle">Variants</h2>
            <button id="closeVariantsModal" aria-label="Close"
                    class="focus-ring text-slate-400 hover:text-white text-2xl leading-none rounded">&times;</button>
        </div>

        <!-- Variants table -->
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead class="text-slate-400 text-xs uppercase tracking-wide border-b border-slate-800">
                    <tr>
                        <th class="py-2 px-2 text-left font-medium">Size</th>
                        <th class="py-2 px-2 text-left font-medium">Color</th>
                        <th class="py-2 px-2 text-left font-medium">Stock</th>
                        <th class="py-2 px-2"></th>
                        <th class="py-2 px-2"></th>
                    </tr>
                </thead>
                <tbody id="variantsList" class="divide-y divide-slate-800"></tbody>
            </table>
        </div>

        <!-- Add new variant -->
        <form id="variantForm" class="border-t border-slate-800 pt-4 space-y-2">
            <p class="text-sm text-slate-400 font-semibold">Add new variant</p>
            <div class="flex flex-wrap gap-2">
                <label for="newVariantSize" class="sr-only">Size</label>
                <input id="newVariantSize" placeholder="Size"
                       class="focus-ring flex-1 min-w-[90px] px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500" required>
                <label for="newVariantColor" class="sr-only">Color</label>
                <input id="newVariantColor" placeholder="Color"
                       class="focus-ring flex-1 min-w-[90px] px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500" required>
                <label for="newVariantStock" class="sr-only">Stock</label>
                <input id="newVariantStock" type="number" min="0" placeholder="Stock"
                       class="focus-ring w-24 px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500" required>
                <button type="submit" class="focus-ring bg-indigo-600 hover:bg-indigo-700 transition px-4 py-2 text-sm font-semibold rounded-lg text-white">Add</button>
            </div>
        </form>
    </div>
</div>



{{-- JS --}}
@vite('resources/js/products/main.js')

</x-app>