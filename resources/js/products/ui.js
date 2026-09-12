/**
 * products/ui.js
 * ─────────────────────────────────────────────
 * DOM references, modal helpers, toast,
 * image preview helpers, pagination renderer,
 * and validation-error display.
 *
 * Nothing in here makes network calls.
 */

import { escapeHtml } from '../shared/escape.js';

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
    paginationSummary:    document.getElementById('paginationSummary'),
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
    variantsModal: document.getElementById('variantsModal'),
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
    toast.className = `fixed top-5 right-5 z-[999] px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg border transition-opacity duration-300 ${
        type === 'success'
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/15 border-rose-500/30 text-rose-300'}`;
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

            const bullet = document.createElement('span');
            bullet.textContent = '•';

            // Validation messages quote the submitted value back at the user
            // ("The sku has already been taken."), so the string is not ours
            // to trust — build it as a text node rather than innerHTML.
            const text = document.createElement('span');
            text.textContent = msg;

            div.append(bullet, text);
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
/* The table is eight columns wide; every full-width state row spans all of it. */
const TABLE_COLUMNS = 8;

export const renderLoadingRow = (productsTable) => {
    productsTable.innerHTML = `
        <tr>
            <td colspan="${TABLE_COLUMNS}" class="py-12 text-center text-slate-400 text-sm">
                <svg class="animate-spin h-5 w-5 mx-auto mb-2 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                Loading products...
            </td>
        </tr>`;
};

export const renderEmptyRow = (productsTable) => {
    productsTable.innerHTML = `<tr><td colspan="${TABLE_COLUMNS}" class="py-12 text-center text-slate-400 text-sm">No products found.</td></tr>`;
};

export const renderErrorRow = (productsTable) => {
    productsTable.innerHTML = `<tr><td colspan="${TABLE_COLUMNS}" class="py-12 text-center text-rose-400 text-sm">Failed to load products. Please check your connection and try again.</td></tr>`;
};

/* =========================================================
   ROW CELL HELPERS
========================================================= */
const stockCell = (quantity) => {
    if (quantity <= 0) return `<span class="text-rose-400 font-medium">Out of stock</span>`;
    if (quantity < 5)  return `<span class="text-amber-400 font-medium">Low (${quantity})</span>`;
    return `<span class="text-emerald-400 font-medium">${quantity}</span>`;
};

/* Inactive is slate, not rose. Rose means "out of stock" in the column next
   door, and an inactive product is a deliberate state, not a problem. */
const statusPill = (isActive) => isActive
    ? `<span class="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-medium">Active</span>`
    : `<span class="px-2 py-0.5 rounded-full bg-slate-500/15 text-slate-400 text-xs font-medium">Inactive</span>`;

const IMAGE_PLACEHOLDER = `<div class="w-9 h-9 rounded-md bg-slate-700"></div>`;

/* Rows are rebuilt wholesale with innerHTML on every render, so there is no
   stable element to bind an error listener to — the fallback has to be an
   inline handler. Single quotes only: a double quote would close the
   attribute and swallow the rest of the tag. */
const IMAGE_FALLBACK = `this.replaceWith(Object.assign(document.createElement('div'), { className: 'w-9 h-9 rounded-md bg-slate-700' }))`;

/*
 * Product fields are free text typed in the admin, and every one of them
 * lands in an innerHTML string here, so each goes through escapeHtml on the
 * way in — including the ones sitting inside attributes, where an unescaped
 * quote would break out of the attribute entirely.
 *
 * The row's border comes from `divide-y` on the <tbody>, not from the <tr>.
 */
export const renderProductRows = (products, baseUrl, productsTable) => {
    productsTable.innerHTML = products.map(p => {
        const imageUrl = p.image ? `${baseUrl}/storage/${p.image}` : null;

        return `
            <tr class="hover:bg-slate-800/40 transition">
                <td class="px-4 py-3">${imageUrl
                    ? `<img src="${escapeHtml(imageUrl)}" alt="" class="w-9 h-9 rounded-md object-cover bg-slate-700" onerror="${IMAGE_FALLBACK}">`
                    : IMAGE_PLACEHOLDER}</td>
                <td class="px-4 py-3 font-medium text-white">${escapeHtml(p.name)}</td>
                <td class="px-4 py-3 text-slate-400 font-mono text-xs">${escapeHtml(p.sku)}</td>
                <td class="px-4 py-3 text-slate-400">${escapeHtml(p.category?.name ?? '—')}</td>
                <td class="px-4 py-3">${stockCell(p.stock_quantity)}</td>
                <td class="px-4 py-3 text-slate-300">GHS ${Number(p.price).toFixed(2)}</td>
                <td class="px-4 py-3">${statusPill(p.is_active)}</td>
                <td class="px-4 py-3 text-right whitespace-nowrap space-x-3">
                    <button class="variantsBtn focus-ring text-emerald-400 hover:text-emerald-300 text-xs font-medium rounded" data-id="${p.id}" data-name="${escapeHtml(p.name)}">Variants</button>
                    <button class="editBtn focus-ring text-indigo-400 hover:text-indigo-300 text-xs font-medium rounded" data-id="${p.id}">Edit</button>
                    <button class="deleteBtn focus-ring text-rose-400 hover:text-rose-300 text-xs font-medium rounded" data-id="${p.id}">Delete</button>
                </td>
            </tr>`;
    }).join('');
};

/* =========================================================
   PAGINATION
========================================================= */
/* Button styling is shared by Prev, Next and the numbers so the disabled and
   hover states cannot drift apart between them. */
const pageButton = (label, { active = false, disabled = false, onClick }) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.disabled = disabled;

    const base = 'focus-ring rounded-lg text-xs font-medium';
    btn.className = disabled
        ? `${base} px-2.5 py-1 text-slate-600 cursor-not-allowed`
        : active
        ? `${base} w-7 h-7 bg-indigo-600 text-white`
        : `${base} px-2.5 py-1 text-slate-300 hover:bg-slate-800`;

    if (!disabled) btn.onclick = onClick;
    return btn;
};

/*
 * Summary counts come straight from the paginator (from/to/total) rather than
 * being recomputed here — the API owns the page size, and duplicating that
 * arithmetic is how the two drift apart.
 *
 * Prev/Next disabled state reads prev_page_url/next_page_url being null, which
 * is the paginator's own answer to "is there another page", rather than
 * comparing current_page against last_page ourselves.
 */
export const renderPagination = (json, paginationContainer, paginationSummary, onPageChange) => {
    if (!paginationContainer) return;
    paginationContainer.innerHTML = '';

    if (paginationSummary) {
        paginationSummary.textContent = json.total === 0
            ? ''
            : `Showing ${json.from}–${json.to} of ${json.total}`;
    }

    paginationContainer.appendChild(pageButton('Prev', {
        disabled: json.prev_page_url === null,
        onClick: () => onPageChange(json.current_page - 1),
    }));

    for (let i = 1; i <= json.last_page; i++) {
        paginationContainer.appendChild(pageButton(i, {
            active: i === json.current_page,
            onClick: () => onPageChange(i),
        }));
    }

    paginationContainer.appendChild(pageButton('Next', {
        disabled: json.next_page_url === null,
        onClick: () => onPageChange(json.current_page + 1),
    }));
};
