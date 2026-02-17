document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================
       AUTH CHECK
    ========================================================= */
    const token = localStorage.getItem('token');

    // If no token, redirect to login
    if (!token) {
        window.location.href = '/login';
        return;
    }

    const baseUrl = window.location.origin;

    /* =========================================================
       DOM ELEMENT REFERENCES
    ========================================================= */
    const productsTable = document.getElementById('productsTable');

    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const sortSelect = document.getElementById('sortSelect');

    const createModal = document.getElementById('createModal');
    const editModal = document.getElementById('editModal');

    const productForm = document.getElementById('productForm');
    const editProductForm = document.getElementById('editProductForm');

    const openCreateModalBtn = document.getElementById('openCreateModal');
    const closeCreateModalBtn = document.getElementById('closeCreateModal');
    const closeEditModalBtn = document.getElementById('closeEditModal');


    /* =========================================================
       BUILD QUERY FOR SEARCH / FILTER / SORT
       This builds the URL parameters dynamically
    ========================================================= */
    const buildQuery = () => {
        const params = new URLSearchParams();

        // Search
        if (searchInput?.value) {
            params.append('search', searchInput.value);
        }

        // Filter by status
        if (statusFilter?.value !== '') {
            params.append('status', statusFilter.value);
        }

        // Sorting (format: column:direction)
        if (sortSelect?.value) {
            const [sortBy, sortDir] = sortSelect.value.split(':');
            params.append('sort_by', sortBy);
            params.append('sort_dir', sortDir);
        }

        return params.toString();
    };


    /* =========================================================
       LOAD PRODUCTS FROM API
    ========================================================= */
    const loadProducts = async () => {

        const res = await fetch(`${baseUrl}/api/v1/products?${buildQuery()}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const json = await res.json();
        const products = json.data ?? [];

        // Render table rows dynamically
        productsTable.innerHTML = products.map(p => {

            // Build image URL properly
            const imageUrl = p.image
                ? `${baseUrl}/storage/${p.image}`
                : null;

            return `
                <tr class="border-b border-gray-700">
                    <td>
                        ${
                            imageUrl
                                ? `<img src="${imageUrl}" class="h-10 w-10 object-cover rounded">`
                                : `<div class="h-10 w-10 bg-gray-700 rounded"></div>`
                        }
                    </td>
                    <td>${p.name}</td>
                    <td>${p.sku}</td>
                    <td>GHS ${p.price}</td>
                    <td>GHS ${p.cost_price}</td>
                    <td>${p.description ?? ''}</td>
                    <td class="${p.is_active ? 'text-green-400' : 'text-red-400'}">
                        ${p.is_active ? 'Active' : 'Inactive'}
                    </td>
                    <td class="text-right space-x-3">
                        <button class="editBtn text-indigo-400" data-id="${p.id}">Edit</button>
                        <button class="deleteBtn text-red-400" data-id="${p.id}">Delete</button>
                    </td>
                </tr>
            `;
        }).join('');

        bindActions();
    };


    /* =========================================================
       BIND EDIT & DELETE BUTTONS
       Since rows are dynamically rendered, we rebind every time
    ========================================================= */
    const bindActions = () => {

        /* ---------------- DELETE ---------------- */
        document.querySelectorAll('.deleteBtn').forEach(btn => {
            btn.onclick = async () => {

                if (!confirm('Delete product?')) return;

                await fetch(`${baseUrl}/api/v1/products/${btn.dataset.id}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                loadProducts();
            };
        });


        /* ---------------- EDIT ---------------- */
        document.querySelectorAll('.editBtn').forEach(btn => {
            btn.onclick = async () => {

                const id = btn.dataset.id;

                // Fetch product details
                const res = await fetch(`${baseUrl}/api/v1/products/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const p = await res.json();

                // Populate edit modal fields
                document.getElementById('editProductId').value = p.id;
                document.getElementById('editName').value = p.name;
                document.getElementById('editSku').value = p.sku;
                document.getElementById('editPrice').value = p.price;
                document.getElementById('editCostPrice').value = p.cost_price ?? 0;
                document.getElementById('editDescription').value = p.description ?? '';
                document.getElementById('editIsActive').checked = !!p.is_active;

                editModal.classList.remove('hidden');
            };
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
            createModal.classList.add('hidden');
        });

        productForm.addEventListener('submit', async e => {
            e.preventDefault();

            const formData = new FormData(productForm);

            // Ensure checkbox always sends value
            formData.set(
                'is_active',
                productForm.querySelector('[name="is_active"]').checked ? 1 : 0
            );

            const res = await fetch(`${baseUrl}/api/v1/products`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) {
                alert('Failed to add product');
                return;
            }

            productForm.reset();
            createModal.classList.add('hidden');
            loadProducts();
        });
    }

    /* ================= CREATE IMAGE PREVIEW & DRAG ================= */
const createImageWrapper = document.getElementById('createImageWrapper');
const createImageInput = document.getElementById('createImage');
const createImagePreview = document.getElementById('createImagePreview');
const createImageText = document.getElementById('createImageText');

if (createImageWrapper) {
    createImageWrapper.addEventListener('click', () => createImageInput.click());

    createImageInput.addEventListener('change', () => {
        if (createImageInput.files && createImageInput.files[0]) {
            const reader = new FileReader();
            reader.onload = e => {
                createImagePreview.src = e.target.result;
                createImagePreview.classList.remove('hidden');
                createImageText.classList.add('hidden');
            };
            reader.readAsDataURL(createImageInput.files[0]);
        } else {
            createImagePreview.classList.add('hidden');
            createImageText.classList.remove('hidden');
        }
    });

    createImageWrapper.addEventListener('dragover', e => {
        e.preventDefault();
        createImageWrapper.classList.add('border-indigo-500');
    });

    createImageWrapper.addEventListener('dragleave', e => {
        e.preventDefault();
        createImageWrapper.classList.remove('border-indigo-500');
    });

    createImageWrapper.addEventListener('drop', e => {
        e.preventDefault();
        createImageWrapper.classList.remove('border-indigo-500');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            createImageInput.files = e.dataTransfer.files;
            createImageInput.dispatchEvent(new Event('change'));
        }
    });
}



    /* =========================================================
       UPDATE PRODUCT (FIXED VERSION)
       Uses Laravel method spoofing (_method = PUT)
    ========================================================= */
    if (editProductForm) {

        closeEditModalBtn?.addEventListener('click', () => {
            editModal.classList.add('hidden');
        });

        editProductForm.addEventListener('submit', async e => {
            e.preventDefault();

            const id = document.getElementById('editProductId').value;

            const formData = new FormData();

            // IMPORTANT: Laravel method spoofing
            formData.append('_method', 'PUT');

            formData.append('name', document.getElementById('editName').value);
            formData.append('sku', document.getElementById('editSku').value);
            formData.append('price', document.getElementById('editPrice').value);
            formData.append('cost_price', document.getElementById('editCostPrice').value);
            formData.append('description', document.getElementById('editDescription').value);

            // Only send image if user selected one
            const imageInput = document.getElementById('editImage');
            if (imageInput.files.length > 0) {
                formData.append('image', imageInput.files[0]);
            }

            formData.append(
                'is_active',
                document.getElementById('editIsActive').checked ? 1 : 0
            );

            const res = await fetch(`${baseUrl}/api/v1/products/${id}`, {
                method: 'POST', // must be POST when using _method
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) {
                alert('Failed to update product');
                return;
            }

            editModal.classList.add('hidden');
            loadProducts();
        });
    }

    /* ================= EDIT IMAGE PREVIEW & DRAG ================= */
const editImageWrapper = document.getElementById('editImageWrapper');
const editImageInput = document.getElementById('editImage');
const editImagePreview = document.getElementById('editImagePreview');
const editImageText = document.getElementById('editImageText');

if (editImageWrapper) {

    
    // Click wrapper to open file dialog
    editImageWrapper.addEventListener('click', () => editImageInput.click());

    // File selection triggers preview
    editImageInput.addEventListener('change', () => {
        if (editImageInput.files && editImageInput.files[0]) {
            const reader = new FileReader();
            reader.onload = e => {
                editImagePreview.src = e.target.result;
                editImagePreview.classList.remove('hidden');
                editImageText.classList.add('hidden');
            };
            reader.readAsDataURL(editImageInput.files[0]);
        } else {
            editImagePreview.classList.add('hidden');
            editImageText.classList.remove('hidden');
        }
    });

    // Drag over
    editImageWrapper.addEventListener('dragover', e => {
        e.preventDefault();
        editImageWrapper.classList.add('border-indigo-500');
    });

    // Drag leave
    editImageWrapper.addEventListener('dragleave', e => {
        e.preventDefault();
        editImageWrapper.classList.remove('border-indigo-500');
    });

    // Drop file
    editImageWrapper.addEventListener('drop', e => {
        e.preventDefault();
        editImageWrapper.classList.remove('border-indigo-500');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            editImageInput.files = e.dataTransfer.files;
            editImageInput.dispatchEvent(new Event('change')); // trigger preview
        }
    });
}

//show current image in edit modal when opened
// Inside editBtn.onclick after fetching product `p`
/*
if (p.image) {
    editImagePreview.src = `${baseUrl}/storage/${p.image}`;
    editImagePreview.classList.remove('hidden');
    editImageText.classList.add('hidden');
} else {
    editImagePreview.classList.add('hidden');
    editImageText.classList.remove('hidden');
}

*/



    /* =========================================================
       FILTER / SEARCH / SORT AUTO RELOAD
    ========================================================= */
    [searchInput, statusFilter, sortSelect].forEach(el => {
        el?.addEventListener('input', loadProducts);
    });


    /* =========================================================
       INITIAL LOAD
    ========================================================= */
    loadProducts();

});
