document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================
       AUTH CHECK
    ========================================================= */
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = '/login';
        return;
    }

    const baseUrl = window.location.origin;

    /* =========================================================
       DOM ELEMENT REFERENCES
    ========================================================= */
    const productsTable       = document.getElementById('productsTable');

    const searchInput         = document.getElementById('searchInput');
    const statusFilter        = document.getElementById('statusFilter');
    const sortSelect          = document.getElementById('sortSelect');
    const categoryFilter      = document.getElementById('categoryFilter');

    const paginationContainer = document.getElementById('paginationContainer');

    const createModal         = document.getElementById('createModal');
    const editModal           = document.getElementById('editModal');

    const productForm         = document.getElementById('productForm');
    const editProductForm     = document.getElementById('editProductForm');

    const createErrors        = document.getElementById('createErrors');
    const editErrors          = document.getElementById('editErrors');

    const createSubmitBtn     = document.getElementById('createSubmitBtn');
    const editSubmitBtn       = document.getElementById('editSubmitBtn');

    const createCategorySelect = document.getElementById('createCategorySelect');
    const editCategorySelect   = document.getElementById('editCategorySelect');

    const openCreateModalBtn  = document.getElementById('openCreateModal');
    const closeCreateModalBtn = document.getElementById('closeCreateModal');
    const closeEditModalBtn   = document.getElementById('closeEditModal');

    // --- Image elements: CREATE MODAL ---
    const createImageWrapper = document.getElementById('createImageWrapper');
    const createImageInput   = document.getElementById('createImage');
    const createImagePreview = document.getElementById('createImagePreview');
    const createImageText    = document.getElementById('createImageText');

    // --- Image elements: EDIT MODAL ---
    const editImageWrapper   = document.getElementById('editImageWrapper');
    const editImageInput     = document.getElementById('editImage');
    const editImagePreview   = document.getElementById('editImagePreview');
    const editImageText      = document.getElementById('editImageText');

    let currentPage = 1;

    /* =========================================================
       LOGOUT
       Wires the sidebar logout button — calls the API to
       invalidate the token then clears local storage
    ========================================================= */
    const logoutBtn = document.getElementById('logoutBtn');

    const handleLogout = async () => {
        try {
            await fetch(`${baseUrl}/api/v1/logout`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
        } finally {
            // Always clear token and redirect regardless of API response
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    };

    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    /* =========================================================
       TOAST NOTIFICATION
       Shows a temporary success or error message at the
       top-right of the screen, auto-dismisses after 3 seconds
    ========================================================= */
    const showToast = (message, type = 'success') => {
        document.getElementById('toast')?.remove();

        const toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = `
            fixed top-5 right-5 z-[999] px-5 py-3 rounded-lg text-sm text-white shadow-lg
            transition-opacity duration-300
            ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    /* =========================================================
       PREVIEW HELPER
       Reads a File object and shows a thumbnail in the given
       preview <img>, hiding the placeholder text
    ========================================================= */
    const previewImage = (file, previewEl, textEl) => {
        const reader = new FileReader();
        reader.onload = e => {
            previewEl.src = e.target.result;
            previewEl.classList.remove('hidden');
            textEl.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    };

    /* =========================================================
       RESET IMAGE PREVIEW HELPER
       Clears the preview and restores the placeholder text
    ========================================================= */
    const resetImagePreview = (previewEl, textEl) => {
        previewEl.src = '';
        previewEl.classList.add('hidden');
        textEl.classList.remove('hidden');
    };

    /* =========================================================
       IMAGE UPLOAD — CREATE MODAL
       Wires click and drag-drop on the wrapper to the hidden
       file input, then shows a preview on selection
    ========================================================= */
    createImageWrapper?.addEventListener('click', () => createImageInput.click());

    createImageWrapper?.addEventListener('dragover', e => {
        e.preventDefault();
        createImageWrapper.classList.add('border-indigo-400');
    });

    createImageWrapper?.addEventListener('dragleave', () => {
        createImageWrapper.classList.remove('border-indigo-400');
    });

    createImageWrapper?.addEventListener('drop', e => {
        e.preventDefault();
        createImageWrapper.classList.remove('border-indigo-400');
        const file = e.dataTransfer.files[0];
        if (file) {
            createImageInput.files = e.dataTransfer.files;
            previewImage(file, createImagePreview, createImageText);
        }
    });

    createImageInput?.addEventListener('change', () => {
        const file = createImageInput.files[0];
        if (file) previewImage(file, createImagePreview, createImageText);
    });

    /* =========================================================
       IMAGE UPLOAD — EDIT MODAL
       Same pattern as create modal above
    ========================================================= */
    editImageWrapper?.addEventListener('click', () => editImageInput.click());

    editImageWrapper?.addEventListener('dragover', e => {
        e.preventDefault();
        editImageWrapper.classList.add('border-indigo-400');
    });

    editImageWrapper?.addEventListener('dragleave', () => {
        editImageWrapper.classList.remove('border-indigo-400');
    });

    editImageWrapper?.addEventListener('drop', e => {
        e.preventDefault();
        editImageWrapper.classList.remove('border-indigo-400');
        const file = e.dataTransfer.files[0];
        if (file) {
            editImageInput.files = e.dataTransfer.files;
            previewImage(file, editImagePreview, editImageText);
        }
    });

    editImageInput?.addEventListener('change', () => {
        const file = editImageInput.files[0];
        if (file) previewImage(file, editImagePreview, editImageText);
    });

    /* =========================================================
       FETCH & LOAD CATEGORIES
       Populates create modal select, edit modal select, and
       the filter dropdown on the main page
    ========================================================= */
    const loadCategories = async () => {
        try {
            const res = await fetch(`${baseUrl}/api/v1/categories`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to load categories');

            const categories = await res.json();

            // ---------- CREATE MODAL ----------
            if (createCategorySelect) {
                createCategorySelect.innerHTML = `<option value="">Select Category</option>`;
                categories.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat.id;
                    option.textContent = cat.name;
                    createCategorySelect.appendChild(option);
                });
            }

            // ---------- EDIT MODAL ----------
            if (editCategorySelect) {
                editCategorySelect.innerHTML = `<option value="">Select Category</option>`;
                categories.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat.id;
                    option.textContent = cat.name;
                    editCategorySelect.appendChild(option);
                });
            }

            // ---------- FILTER DROPDOWN ----------
            if (categoryFilter) {
                categoryFilter.innerHTML = `<option value="">All Categories</option>`;
                categories.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat.id;
                    option.textContent = cat.name;
                    categoryFilter.appendChild(option);
                });
            }

        } catch (err) {
            showToast('Failed to load categories. Please refresh.', 'error');
        }
    };

    /* =========================================================
       NEW CATEGORY TOGGLE — CREATE MODAL
       Button click toggles the text input visibility and disables
       the select so both can't be active at the same time
    ========================================================= */
    document.getElementById('toggleCreateCategory')?.addEventListener('click', () => {
        const input    = document.getElementById('createNewCategory');
        const isHidden = input.classList.toggle('hidden');
        createCategorySelect.disabled = !isHidden;
        if (!isHidden) createCategorySelect.value = '';
    });

    /* =========================================================
       NEW CATEGORY TOGGLE — EDIT MODAL
       Same pattern as create modal toggle above
    ========================================================= */
    document.getElementById('toggleEditCategory')?.addEventListener('click', () => {
        const input    = document.getElementById('editNewCategory');
        const isHidden = input.classList.toggle('hidden');
        editCategorySelect.disabled = !isHidden;
        if (!isHidden) editCategorySelect.value = '';
    });

    /* =========================================================
       BUILD QUERY
       Assembles URL params for the products list API call
    ========================================================= */
    const buildQuery = () => {
        const params = new URLSearchParams();

        if (searchInput?.value)           params.append('search', searchInput.value);
        if (statusFilter?.value !== '')   params.append('status', statusFilter.value);
        if (categoryFilter?.value !== '') params.append('category_id', categoryFilter.value);

        if (sortSelect?.value) {
            const [sortBy, sortDir] = sortSelect.value.split(':');
            params.append('sort_by', sortBy);
            params.append('sort_dir', sortDir);
        }

        params.append('page', currentPage);
        return params.toString();
    };

    /* =========================================================
       LOAD PRODUCTS
       Fetches paginated products and renders them into the table.
       Shows a loading spinner while fetching, empty state when
       no results, and error state on network failure.
    ========================================================= */
    const loadProducts = async () => {

        // Show loading spinner while fetching
        productsTable.innerHTML = `
            <tr>
                <td colspan="10" class="py-10 text-center text-gray-400 text-sm">
                    <svg class="animate-spin h-5 w-5 mx-auto mb-2 text-indigo-400"
                         xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10"
                                stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor"
                              d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    Loading products...
                </td>
            </tr>
        `;

        try {
            const res = await fetch(`${baseUrl}/api/v1/products?${buildQuery()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to load products');

            const json     = await res.json();
            const products = json.data ?? [];

            // Empty state when no products match filters
            if (products.length === 0) {
                productsTable.innerHTML = `
                    <tr>
                        <td colspan="10" class="py-10 text-center text-gray-400 text-sm">
                            No products found.
                        </td>
                    </tr>
                `;
                paginationContainer.innerHTML = '';
                return;
            }

            productsTable.innerHTML = products.map(p => {

                const imageUrl = p.image
                    ? `${baseUrl}/storage/${p.image}`
                    : null;

                // Stock badge — colour coded by quantity
                let stockBadge = '';
                if (p.stock_quantity <= 0) {
                    stockBadge = `<span class="text-red-400">Out of Stock</span>`;
                } else if (p.stock_quantity < 5) {
                    stockBadge = `<span class="text-yellow-400">Low (${p.stock_quantity})</span>`;
                } else {
                    stockBadge = `<span class="text-green-400">${p.stock_quantity}</span>`;
                }

                return `
                    <tr class="border-b border-gray-700 text-sm">
                        <td class="py-2 px-2">
                            ${imageUrl
                                ? `<img src="${imageUrl}" class="h-8 w-8 object-cover rounded">`
                                : `<div class="h-8 w-8 bg-gray-700 rounded"></div>`}
                        </td>
                        <td class="py-2 px-2">${p.name}</td>
                        <td class="py-2 px-2">${p.sku}</td>
                        <td class="py-2 px-2">${p.category?.name ?? '-'}</td>
                        <td class="py-2 px-2">${stockBadge}</td>
                        <td class="py-2 px-2">GHS ${p.price}</td>
                        <td class="py-2 px-2">GHS ${p.cost_price}</td>
                        <td class="py-2 px-2 max-w-[120px] truncate">${p.description ?? ''}</td>
                        <td class="py-2 px-2 ${p.is_active ? 'text-green-400' : 'text-red-400'}">
                            ${p.is_active ? 'Active' : 'Inactive'}
                        </td>
                        <td class="py-2 px-2 text-right space-x-3">
                            <button class="editBtn text-indigo-400" data-id="${p.id}">Edit</button>
                            <button class="deleteBtn text-red-400" data-id="${p.id}">Delete</button>
                        </td>
                    </tr>
                `;
            }).join('');

            renderPagination(json);
            bindActions();

        } catch (err) {
            // Error state in table on network failure
            productsTable.innerHTML = `
                <tr>
                    <td colspan="10" class="py-10 text-center text-red-400 text-sm">
                        Failed to load products. Please check your connection and try again.
                    </td>
                </tr>
            `;
        }
    };

    /* =========================================================
       PAGINATION
       Renders numbered page buttons below the table
    ========================================================= */
    const renderPagination = (json) => {
        if (!paginationContainer) return;

        paginationContainer.innerHTML = '';

        for (let i = 1; i <= json.last_page; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.className = `px-3 py-1 text-sm rounded ${i === json.current_page ? 'bg-indigo-600' : 'bg-gray-700'}`;
            btn.onclick = () => {
                currentPage = i;
                loadProducts();
            };
            paginationContainer.appendChild(btn);
        }
    };

    /* =========================================================
       BIND TABLE ACTIONS (Edit / Delete)
       Called after every loadProducts() to re-attach listeners
       to freshly rendered rows
    ========================================================= */
    const bindActions = () => {

        // DELETE — confirm before removing
        document.querySelectorAll('.deleteBtn').forEach(btn => {
            btn.onclick = async () => {

                if (!confirm('Are you sure you want to delete this product?')) return;

                try {
                    const res = await fetch(`${baseUrl}/api/v1/products/${btn.dataset.id}`, {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (!res.ok) throw new Error('Delete failed');

                    showToast('Product deleted successfully.');
                    loadProducts();

                } catch (err) {
                    showToast('Failed to delete product. Please try again.', 'error');
                }
            };
        });

        // EDIT — fetch product data and populate the edit modal
        document.querySelectorAll('.editBtn').forEach(btn => {
            btn.onclick = async () => {
                try {
                    const res = await fetch(`${baseUrl}/api/v1/products/${btn.dataset.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (!res.ok) throw new Error('Failed to load product');

                    const p = await res.json();

                    document.getElementById('editProductId').value   = p.id;
                    document.getElementById('editName').value        = p.name;
                    document.getElementById('editSku').value         = p.sku;
                    document.getElementById('editPrice').value       = p.price;
                    document.getElementById('editCostPrice').value   = p.cost_price ?? 0;
                    document.getElementById('editDescription').value = p.description ?? '';
                    document.getElementById('editIsActive').checked  = !!p.is_active;

                    // Set the category select to the product's current category
                    if (editCategorySelect) {
                        editCategorySelect.value = p.category_id ?? '';
                    }

                    // Reset new category toggle state when opening edit modal
                    const editNewCategoryInput = document.getElementById('editNewCategory');
                    editNewCategoryInput.classList.add('hidden');
                    editNewCategoryInput.value  = '';
                    editCategorySelect.disabled = false;

                    // Show existing image or reset to placeholder
                    if (p.image) {
                        editImagePreview.src = `${baseUrl}/storage/${p.image}`;
                        editImagePreview.classList.remove('hidden');
                        editImageText.classList.add('hidden');
                    } else {
                        resetImagePreview(editImagePreview, editImageText);
                    }

                    editModal.classList.remove('hidden');

                } catch (err) {
                    showToast('Failed to load product data. Please try again.', 'error');
                }
            };
        });
    };

    /* =========================================================
       HANDLE VALIDATION ERRORS
       Renders Laravel 422 validation error messages inline
    ========================================================= */
    const showErrors = (container, errors) => {
        container.innerHTML = '';
        Object.values(errors).forEach(errArray => {
            errArray.forEach(msg => {
                const div = document.createElement('div');
                div.textContent = msg;
                container.appendChild(div);
            });
        });
    };

    /* =========================================================
       CREATE PRODUCT
    ========================================================= */
    if (productForm) {

        openCreateModalBtn?.addEventListener('click', () => {
            createModal.classList.remove('hidden');
        });

        closeCreateModalBtn?.addEventListener('click', () => {
            const createNewCategoryInput = document.getElementById('createNewCategory');
            createNewCategoryInput.classList.add('hidden');
            createNewCategoryInput.value  = '';
            createCategorySelect.disabled = false;
            resetImagePreview(createImagePreview, createImageText);
            createModal.classList.add('hidden');
        });

        productForm.addEventListener('submit', async e => {
            e.preventDefault();

            createErrors.innerHTML      = '';
            createSubmitBtn.disabled    = true;
            createSubmitBtn.textContent = 'Saving...';

            const formData = new FormData(productForm);

            formData.set(
                'is_active',
                productForm.querySelector('[name="is_active"]').checked ? 1 : 0
            );

            // If new category input is visible, set category_id to 'new'
            // so the backend knows to create a new category
            const createNewCategoryInput = document.getElementById('createNewCategory');
            if (!createNewCategoryInput.classList.contains('hidden')) {
                formData.set('category_id', 'new');
            }

            try {
                const res = await fetch(`${baseUrl}/api/v1/products`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData
                });

                if (res.status === 422) {
                    const data = await res.json();
                    showErrors(createErrors, data.errors);
                    createSubmitBtn.disabled    = false;
                    createSubmitBtn.textContent = 'Save';
                    return;
                }

                if (!res.ok) throw new Error('Failed to create product');

                // Reload categories so newly created category appears
                // in the filter dropdown and edit modal immediately
                await loadCategories();

                productForm.reset();
                createNewCategoryInput.classList.add('hidden');
                createCategorySelect.disabled = false;
                resetImagePreview(createImagePreview, createImageText);

                createSubmitBtn.disabled    = false;
                createSubmitBtn.textContent = 'Save';
                createModal.classList.add('hidden');

                showToast('Product created successfully.');
                loadProducts();

            } catch (err) {
                showToast('Something went wrong. Please try again.', 'error');
                createSubmitBtn.disabled    = false;
                createSubmitBtn.textContent = 'Save';
            }
        });
    }

    /* =========================================================
       UPDATE PRODUCT
    ========================================================= */
    if (editProductForm) {

        closeEditModalBtn?.addEventListener('click', () => {
            const editNewCategoryInput = document.getElementById('editNewCategory');
            editNewCategoryInput.classList.add('hidden');
            editNewCategoryInput.value  = '';
            editCategorySelect.disabled = false;
            resetImagePreview(editImagePreview, editImageText);
            editModal.classList.add('hidden');
        });

        editProductForm.addEventListener('submit', async e => {
            e.preventDefault();

            editErrors.innerHTML      = '';
            editSubmitBtn.disabled    = true;
            editSubmitBtn.textContent = 'Updating...';

            const id       = document.getElementById('editProductId').value;
            const formData = new FormData();
            formData.append('_method', 'PUT');

            formData.append('name',        document.getElementById('editName').value);
            formData.append('sku',         document.getElementById('editSku').value);
            formData.append('price',       document.getElementById('editPrice').value);
            formData.append('cost_price',  document.getElementById('editCostPrice').value);
            formData.append('description', document.getElementById('editDescription').value);

            const editNewCategoryInput = document.getElementById('editNewCategory');

            // If new category input is visible, send category_id as 'new'
            // and include the new category name — backend will create it
            if (!editNewCategoryInput.classList.contains('hidden')) {
                formData.append('category_id',  'new');
                formData.append('new_category', editNewCategoryInput.value);
            } else {
                formData.append('category_id', editCategorySelect?.value || '');
            }

            formData.append(
                'is_active',
                document.getElementById('editIsActive').checked ? 1 : 0
            );

            // Only append image if a new one was selected
            if (editImageInput && editImageInput.files.length > 0) {
                formData.append('image', editImageInput.files[0]);
            }

            try {
                const res = await fetch(`${baseUrl}/api/v1/products/${id}`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData
                });

                if (res.status === 422) {
                    const data = await res.json();
                    showErrors(editErrors, data.errors);
                    editSubmitBtn.disabled    = false;
                    editSubmitBtn.textContent = 'Update';
                    return;
                }

                if (!res.ok) throw new Error('Failed to update product');

                // Reload categories so newly created category appears
                // in the filter dropdown and create modal immediately
                await loadCategories();

                editNewCategoryInput.classList.add('hidden');
                editNewCategoryInput.value  = '';
                editCategorySelect.disabled = false;

                editSubmitBtn.disabled    = false;
                editSubmitBtn.textContent = 'Update';
                editModal.classList.add('hidden');

                showToast('Product updated successfully.');
                loadProducts();

            } catch (err) {
                showToast('Something went wrong. Please try again.', 'error');
                editSubmitBtn.disabled    = false;
                editSubmitBtn.textContent = 'Update';
            }
        });
    }

    /* =========================================================
       FILTER AUTO RELOAD
       Re-fetches products whenever any filter/sort changes
    ========================================================= */
    [searchInput, statusFilter, sortSelect, categoryFilter].forEach(el => {
        el?.addEventListener('input', () => {
            currentPage = 1;
            loadProducts();
        });
    });

    /* =========================================================
       INITIAL LOAD
    ========================================================= */
    loadCategories();
    loadProducts();

});