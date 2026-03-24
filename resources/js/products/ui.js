/**
 * products/ui.js
 * ─────────────────────────────────────────────
 * DOM references, modal helpers, toast,
 * image preview helpers, pagination renderer,
 * and validation-error display.
 *
 * Nothing in here makes network calls.
 */

/* =========================================================
   DOM REFERENCES
========================================================= */
export const dom = {
    productsTable:        document.getElementById('productsTable'),
    searchInput:          document.getElementById('searchInput'),
    statusFilter:         document.getElementById('statusFilter'),
    sortSelect:           document.getElementById('sortSelect'),
    categoryFilter:       document.getElementById('categoryFilter'),
    paginationContainer:  document.getElementById('paginationContainer'),
    createModal:          document.getElementById('createModal'),
    editModal:            document.getElementById('editModal'),
    productForm:          document.getElementById('productForm'),
    editProductForm:      document.getElementById('editProductForm'),
    createErrors:         document.getElementById('createErrors'),
    editErrors:           document.getElementById('editErrors'),
    createSubmitBtn:      document.getElementById('createSubmitBtn'),
    editSubmitBtn:        document.getElementById('editSubmitBtn'),
    createCategorySelect: document.getElementById('createCategorySelect'),
    editCategorySelect:   document.getElementById('editCategorySelect'),
    openCreateModalBtn:   document.getElementById('openCreateModal'),
    closeCreateModalBtn:  document.getElementById('closeCreateModal'),
    closeEditModalBtn:    document.getElementById('closeEditModal'),
    createImageWrapper:   document.getElementById('createImageWrapper'),
    createImageInput:     document.getElementById('createImage'),
    createImagePreview:   document.getElementById('createImagePreview'),
    createImageText:      document.getElementById('createImageText'),
    editImageWrapper:     document.getElementById('editImageWrapper'),
    editImageInput:       document.getElementById('editImage'),
    editImagePreview:     document.getElementById('editImagePreview'),
    editImageText:        document.getElementById('editImageText'),
    logoutBtn:            document.getElementById('logoutBtn'),
};

/* =========================================================
   MODAL HELPERS
   Using flex/hidden toggle so "hidden" always wins over flex
   when closed, and flex is explicitly set when opened.
========================================================= */
export const openModal  = (modal) => { modal.classList.remove('hidden'); modal.classList.add('flex'); };
export const closeModal = (modal) => { modal.classList.add('hidden');    modal.classList.remove('flex'); };

/* =========================================================
   TOAST
========================================================= */
export const showToast = (message, type = 'success') => {
    document.getElementById('toast')?.remove();
    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = `fixed top-5 right-5 z-[999] px-5 py-3 rounded-lg text-sm text-white shadow-lg transition-opacity duration-300 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
};

/* =========================================================
   IMAGE HELPERS
========================================================= */
export const previewImage = (file, previewEl, textEl) => {
    const reader = new FileReader();
    reader.onload = e => {
        previewEl.src = e.target.result;
        previewEl.classList.remove('hidden');
        textEl.classList.add('hidden');
    };
    reader.readAsDataURL(file);
};

export const resetImagePreview = (previewEl, textEl) => {
    previewEl.src = '';
    previewEl.classList.add('hidden');
    textEl.classList.remove('hidden');
};

/* =========================================================
   VALIDATION ERRORS
   Shows errors and scrolls the form back to the top
   so the user can actually see them.
========================================================= */
export const showErrors = (container, errors) => {
    container.innerHTML = '';
    container.classList.remove('hidden');
    Object.values(errors).forEach(errArray => {
        errArray.forEach(msg => {
            const div = document.createElement('div');
            div.className = 'flex items-center gap-1';
            div.innerHTML = `<span>•</span> ${msg}`;
            container.appendChild(div);
        });
    });
    // Scroll the form to the top so errors are visible
    container.closest('form').scrollTo({ top: 0, behavior: 'smooth' });
};

export const clearErrors = (container) => {
    container.innerHTML = '';
    container.classList.add('hidden');
};

/* =========================================================
   CATEGORY DROPDOWNS
   Populates both the form selects and the filter select.
========================================================= */
export const populateCategorySelects = (categories, { createCategorySelect, editCategorySelect, categoryFilter }) => {
    [createCategorySelect, editCategorySelect].forEach(sel => {
        if (!sel) return;
        sel.innerHTML = `<option value="">Select Category</option>`;
        categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.name;
            sel.appendChild(opt);
        });
    });

    if (categoryFilter) {
        categoryFilter.innerHTML = `<option value="">All Categories</option>`;
        categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.name;
            categoryFilter.appendChild(opt);
        });
    }
};

/* =========================================================
   PRODUCTS TABLE
========================================================= */
export const renderLoadingRow = (productsTable) => {
    productsTable.innerHTML = `
        <tr>
            <td colspan="10" class="py-10 text-center text-gray-400 text-sm">
                <svg class="animate-spin h-5 w-5 mx-auto mb-2 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                Loading products...
            </td>
        </tr>`;
};

export const renderEmptyRow = (productsTable) => {
    productsTable.innerHTML = `<tr><td colspan="10" class="py-10 text-center text-gray-400 text-sm">No products found.</td></tr>`;
};

export const renderErrorRow = (productsTable) => {
    productsTable.innerHTML = `<tr><td colspan="10" class="py-10 text-center text-red-400 text-sm">Failed to load products. Please check your connection and try again.</td></tr>`;
};

export const renderProductRows = (products, baseUrl, productsTable) => {
    productsTable.innerHTML = products.map(p => {
        const imageUrl = p.image ? `${baseUrl}/storage/${p.image}` : null;
        let stockBadge = p.stock_quantity <= 0
            ? `<span class="text-red-400">Out of Stock</span>`
            : p.stock_quantity < 5
            ? `<span class="text-yellow-400">Low (${p.stock_quantity})</span>`
            : `<span class="text-green-400">${p.stock_quantity}</span>`;

        return `
            <tr class="border-b border-gray-700 text-sm">
                <td class="py-2 px-2">${imageUrl ? `<img src="${imageUrl}" class="h-8 w-8 object-cover rounded">` : `<div class="h-8 w-8 bg-gray-700 rounded"></div>`}</td>
                <td class="py-2 px-2">${p.name}</td>
                <td class="py-2 px-2">${p.sku}</td>
                <td class="py-2 px-2">${p.category?.name ?? '-'}</td>
                <td class="py-2 px-2">${stockBadge}</td>
                <td class="py-2 px-2">GHS ${p.price}</td>
                <td class="py-2 px-2">GHS ${p.cost_price}</td>
                <td class="py-2 px-2 max-w-[120px] truncate">${p.description ?? ''}</td>
                <td class="py-2 px-2 ${p.is_active ? 'text-green-400' : 'text-red-400'}">${p.is_active ? 'Active' : 'Inactive'}</td>
                <td class="py-2 px-2 text-right space-x-3">
                    <button class="editBtn text-indigo-400" data-id="${p.id}">Edit</button>
                    <button class="deleteBtn text-red-400" data-id="${p.id}">Delete</button>
                </td>
            </tr>`;
    }).join('');
};

/* =========================================================
   PAGINATION
========================================================= */
export const renderPagination = (json, paginationContainer, onPageChange) => {
    if (!paginationContainer) return;
    paginationContainer.innerHTML = '';
    for (let i = 1; i <= json.last_page; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = `px-3 py-1 text-sm rounded ${i === json.current_page ? 'bg-indigo-600' : 'bg-gray-700'}`;
        btn.onclick = () => onPageChange(i);
        paginationContainer.appendChild(btn);
    }
};
