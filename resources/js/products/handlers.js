/**
 * products/handlers.js
 * ─────────────────────────────────────────────
 * All event handlers and business-logic actions.
 * Imports from api.js and ui.js — never touches
 * the network or the DOM directly.
 */

import {
    fetchCategories,
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    logoutRequest,
} from './api.js';

import {
    dom,
    openModal,
    closeModal,
    showToast,
    previewImage,
    resetImagePreview,
    showErrors,
    clearErrors,
    populateCategorySelects,
    renderLoadingRow,
    renderEmptyRow,
    renderErrorRow,
    renderProductRows,
    renderPagination,
} from './ui.js';

/* =========================================================
   SHARED AUTH CONTEXT
   Set once by index.js via init(), read by every handler.
========================================================= */
let ctx = { baseUrl: '', headers: {} };
let currentPage = 1;

export const init = (baseUrl, headers) => {
    ctx = { baseUrl, headers };
};

/* =========================================================
   BUILD QUERY STRING
========================================================= */
const buildQuery = () => {
    const params = new URLSearchParams();
    if (dom.searchInput?.value)           params.append('search',      dom.searchInput.value);
    if (dom.statusFilter?.value !== '')   params.append('status',      dom.statusFilter.value);
    if (dom.categoryFilter?.value !== '') params.append('category_id', dom.categoryFilter.value);
    if (dom.sortSelect?.value) {
        const [sortBy, sortDir] = dom.sortSelect.value.split(':');
        params.append('sort_by',  sortBy);
        params.append('sort_dir', sortDir);
    }
    params.append('page', currentPage);
    return params.toString();
};

/* =========================================================
   LOAD CATEGORIES
========================================================= */
export const loadCategories = async () => {
    try {
        const categories = await fetchCategories(ctx);
        populateCategorySelects(categories, {
            createCategorySelect: dom.createCategorySelect,
            editCategorySelect:   dom.editCategorySelect,
            categoryFilter:       dom.categoryFilter,
        });
    } catch {
        showToast('Failed to load categories. Please refresh.', 'error');
    }
};

/* =========================================================
   LOAD PRODUCTS
========================================================= */
export const loadProducts = async () => {
    renderLoadingRow(dom.productsTable);
    try {
        const json     = await fetchProducts({ ...ctx, query: buildQuery() });
        const products = json.data ?? [];

        if (!products.length) {
            renderEmptyRow(dom.productsTable);
            dom.paginationContainer.innerHTML = '';
            return;
        }

        renderProductRows(products, ctx.baseUrl, dom.productsTable);
        renderPagination(json, dom.paginationContainer, (page) => {
            currentPage = page;
            loadProducts();
        });
        bindTableActions();

    } catch {
        renderErrorRow(dom.productsTable);
    }
};

/* =========================================================
   BIND TABLE ACTIONS  (delete + edit buttons per row)
========================================================= */
const bindTableActions = () => {

    document.querySelectorAll('.deleteBtn').forEach(btn => {
        btn.onclick = async () => {
            if (!confirm('Are you sure you want to delete this product?')) return;
            try {
                await deleteProduct({ ...ctx, id: btn.dataset.id });
                showToast('Product deleted successfully.');
                loadProducts();
            } catch {
                showToast('Failed to delete product. Please try again.', 'error');
            }
        };
    });

    document.querySelectorAll('.editBtn').forEach(btn => {
        btn.onclick = async () => {
            try {
                const p = await fetchProductById({ ...ctx, id: btn.dataset.id });

                document.getElementById('editProductId').value   = p.id;
                document.getElementById('editName').value        = p.name;
                document.getElementById('editSku').value         = p.sku;
                document.getElementById('editPrice').value       = p.price;
                document.getElementById('editCostPrice').value   = p.cost_price ?? 0;
                document.getElementById('editDescription').value = p.description ?? '';
                document.getElementById('editIsActive').checked  = !!p.is_active;

                if (dom.editCategorySelect) dom.editCategorySelect.value = p.category_id ?? '';

                const editNewCategoryInput = document.getElementById('editNewCategory');
                editNewCategoryInput.classList.add('hidden');
                editNewCategoryInput.value      = '';
                dom.editCategorySelect.disabled = false;

                if (p.image) {
                    dom.editImagePreview.src = `${ctx.baseUrl}/storage/${p.image}`;
                    dom.editImagePreview.classList.remove('hidden');
                    dom.editImageText.classList.add('hidden');
                } else {
                    resetImagePreview(dom.editImagePreview, dom.editImageText);
                }

                clearErrors(dom.editErrors);
                openModal(dom.editModal);

            } catch {
                showToast('Failed to load product data. Please try again.', 'error');
            }
        };
    });
};

/* =========================================================
   LOGOUT
========================================================= */
export const bindLogout = () => {
    dom.logoutBtn?.addEventListener('click', async () => {
        try {
            await logoutRequest(ctx);
        } finally {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    });
};

/* =========================================================
   IMAGE UPLOAD — CREATE
========================================================= */
export const bindCreateImageUpload = () => {
    dom.createImageWrapper?.addEventListener('click', () => dom.createImageInput.click());

    dom.createImageWrapper?.addEventListener('dragover', e => {
        e.preventDefault();
        dom.createImageWrapper.classList.add('border-indigo-400');
    });

    dom.createImageWrapper?.addEventListener('dragleave', () => {
        dom.createImageWrapper.classList.remove('border-indigo-400');
    });

    dom.createImageWrapper?.addEventListener('drop', e => {
        e.preventDefault();
        dom.createImageWrapper.classList.remove('border-indigo-400');
        const file = e.dataTransfer.files[0];
        if (file) {
            dom.createImageInput.files = e.dataTransfer.files;
            previewImage(file, dom.createImagePreview, dom.createImageText);
        }
    });

    dom.createImageInput?.addEventListener('change', () => {
        const file = dom.createImageInput.files[0];
        if (file) previewImage(file, dom.createImagePreview, dom.createImageText);
    });
};

/* =========================================================
   IMAGE UPLOAD — EDIT
========================================================= */
export const bindEditImageUpload = () => {
    dom.editImageWrapper?.addEventListener('click', () => dom.editImageInput.click());

    dom.editImageWrapper?.addEventListener('dragover', e => {
        e.preventDefault();
        dom.editImageWrapper.classList.add('border-indigo-400');
    });

    dom.editImageWrapper?.addEventListener('dragleave', () => {
        dom.editImageWrapper.classList.remove('border-indigo-400');
    });

    dom.editImageWrapper?.addEventListener('drop', e => {
        e.preventDefault();
        dom.editImageWrapper.classList.remove('border-indigo-400');
        const file = e.dataTransfer.files[0];
        if (file) {
            dom.editImageInput.files = e.dataTransfer.files;
            previewImage(file, dom.editImagePreview, dom.editImageText);
        }
    });

    dom.editImageInput?.addEventListener('change', () => {
        const file = dom.editImageInput.files[0];
        if (file) previewImage(file, dom.editImagePreview, dom.editImageText);
    });
};

/* =========================================================
   CATEGORY TOGGLES
========================================================= */
export const bindCategoryToggles = () => {
    document.getElementById('toggleCreateCategory')?.addEventListener('click', () => {
        const input   = document.getElementById('createNewCategory');
        const isHidden = input.classList.toggle('hidden');
        dom.createCategorySelect.disabled = !isHidden;
        if (!isHidden) dom.createCategorySelect.value = '';
    });

    document.getElementById('toggleEditCategory')?.addEventListener('click', () => {
        const input    = document.getElementById('editNewCategory');
        const isHidden = input.classList.toggle('hidden');
        dom.editCategorySelect.disabled = !isHidden;
        if (!isHidden) dom.editCategorySelect.value = '';
    });
};

/* =========================================================
   CREATE PRODUCT MODAL + FORM
========================================================= */
export const bindCreateProduct = () => {
    if (!dom.productForm) return;

    dom.openCreateModalBtn?.addEventListener('click', () => {
        clearErrors(dom.createErrors);
        openModal(dom.createModal);
    });

    dom.closeCreateModalBtn?.addEventListener('click', () => {
        document.getElementById('createNewCategory').classList.add('hidden');
        document.getElementById('createNewCategory').value = '';
        dom.createCategorySelect.disabled = false;
        resetImagePreview(dom.createImagePreview, dom.createImageText);
        closeModal(dom.createModal);
    });

    dom.productForm.addEventListener('submit', async e => {
        e.preventDefault();
        clearErrors(dom.createErrors);
        dom.createSubmitBtn.disabled    = true;
        dom.createSubmitBtn.textContent = 'Saving...';

        const formData = new FormData(dom.productForm);
        formData.set('is_active', dom.productForm.querySelector('[name="is_active"]').checked ? 1 : 0);

        const createNewCategoryInput = document.getElementById('createNewCategory');
        if (!createNewCategoryInput.classList.contains('hidden')) {
            formData.set('category_id', 'new');
        }

        try {
            const res = await createProduct({ ...ctx, formData });

            if (res.status === 422) {
                const data = await res.json();
                showErrors(dom.createErrors, data.errors);
                dom.createSubmitBtn.disabled    = false;
                dom.createSubmitBtn.textContent = 'Save';
                return;
            }

            if (!res.ok) throw new Error();

            await loadCategories();
            dom.productForm.reset();
            createNewCategoryInput.classList.add('hidden');
            dom.createCategorySelect.disabled   = false;
            dom.createSubmitBtn.disabled        = false;
            dom.createSubmitBtn.textContent     = 'Save';
            resetImagePreview(dom.createImagePreview, dom.createImageText);
            closeModal(dom.createModal);
            showToast('Product created successfully.');
            loadProducts();

        } catch {
            showToast('Something went wrong. Please try again.', 'error');
            dom.createSubmitBtn.disabled    = false;
            dom.createSubmitBtn.textContent = 'Save';
        }
    });
};

/* =========================================================
   UPDATE PRODUCT MODAL + FORM
========================================================= */
export const bindUpdateProduct = () => {
    if (!dom.editProductForm) return;

    dom.closeEditModalBtn?.addEventListener('click', () => {
        document.getElementById('editNewCategory').classList.add('hidden');
        document.getElementById('editNewCategory').value = '';
        dom.editCategorySelect.disabled = false;
        resetImagePreview(dom.editImagePreview, dom.editImageText);
        closeModal(dom.editModal);
    });

    dom.editProductForm.addEventListener('submit', async e => {
        e.preventDefault();
        clearErrors(dom.editErrors);
        dom.editSubmitBtn.disabled    = true;
        dom.editSubmitBtn.textContent = 'Updating...';

        const id       = document.getElementById('editProductId').value;
        const formData = new FormData();
        formData.append('_method',     'PUT');
        formData.append('name',        document.getElementById('editName').value);
        formData.append('sku',         document.getElementById('editSku').value);
        formData.append('price',       document.getElementById('editPrice').value);
        formData.append('cost_price',  document.getElementById('editCostPrice').value);
        formData.append('description', document.getElementById('editDescription').value);
        formData.append('is_active',   document.getElementById('editIsActive').checked ? 1 : 0);

        const editNewCategoryInput = document.getElementById('editNewCategory');
        if (!editNewCategoryInput.classList.contains('hidden')) {
            formData.append('category_id',  'new');
            formData.append('new_category', editNewCategoryInput.value);
        } else {
            formData.append('category_id', dom.editCategorySelect?.value || '');
        }

        if (dom.editImageInput?.files.length > 0) {
            formData.append('image', dom.editImageInput.files[0]);
        }

        try {
            const res = await updateProduct({ ...ctx, id, formData });

            if (res.status === 422) {
                const data = await res.json();
                showErrors(dom.editErrors, data.errors);
                dom.editSubmitBtn.disabled    = false;
                dom.editSubmitBtn.textContent = 'Update';
                return;
            }

            if (!res.ok) throw new Error();

            await loadCategories();
            editNewCategoryInput.classList.add('hidden');
            editNewCategoryInput.value          = '';
            dom.editCategorySelect.disabled     = false;
            dom.editSubmitBtn.disabled          = false;
            dom.editSubmitBtn.textContent       = 'Update';
            closeModal(dom.editModal);
            showToast('Product updated successfully.');
            loadProducts();

        } catch {
            showToast('Something went wrong. Please try again.', 'error');
            dom.editSubmitBtn.disabled    = false;
            dom.editSubmitBtn.textContent = 'Update';
        }
    });
};

/* =========================================================
   FILTER AUTO RELOAD
========================================================= */
export const bindFilters = () => {
    [dom.searchInput, dom.statusFilter, dom.sortSelect, dom.categoryFilter].forEach(el => {
        el?.addEventListener('input', () => { currentPage = 1; loadProducts(); });
    });
};
