document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) return window.location.href = '/login';

    const baseUrl = window.location.origin;
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

    /* ================= QUERY BUILD ================= */
    const buildQuery = () => {
        const params = new URLSearchParams();

        if (searchInput.value) params.append('search', searchInput.value);
        if (statusFilter.value !== '') params.append('status', statusFilter.value);

        const [sortBy, sortDir] = sortSelect.value.split(':');
        params.append('sort_by', sortBy);
        params.append('sort_dir', sortDir);

        return params.toString();
    };

    /* ================= LOAD PRODUCTS ================= */
    const loadProducts = async () => {
        const res = await fetch(`${baseUrl}/api/v1/products?${buildQuery()}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const json = await res.json();
        const products = json.data ?? [];

        productsTable.innerHTML = products.map(p => `
            <tr class="border-b border-gray-700">
                <td>${p.image ? `<img src="${baseUrl}/storage/${p.image}" class="h-10 w-10 rounded">` : ''}</td>
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
        `).join('');

        bindActions();
    };

    /* ================= BIND BUTTONS ================= */
    const bindActions = () => {
        // DELETE
        document.querySelectorAll('.deleteBtn').forEach(btn => {
            btn.onclick = async () => {
                if (!confirm('Delete product?')) return;
                await fetch(`${baseUrl}/api/v1/products/${btn.dataset.id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                });
                loadProducts();
            };
        });

        // EDIT
        document.querySelectorAll('.editBtn').forEach(btn => {
            btn.onclick = async () => {
                const id = btn.dataset.id;
                const res = await fetch(`${baseUrl}/api/v1/products/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const p = await res.json();

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

    /* ================= MODAL HANDLERS ================= */
    if (productForm) {
        openCreateModalBtn?.addEventListener('click', () => createModal.classList.remove('hidden'));
        closeCreateModalBtn?.addEventListener('click', () => createModal.classList.add('hidden'));

        productForm.addEventListener('submit', async e => {
            e.preventDefault();
            const formData = new FormData(productForm);
            formData.append('is_active', productForm.querySelector('[name="is_active"]').checked ? 1 : 0);

            const res = await fetch(`${baseUrl}/api/v1/products`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            if (!res.ok) return alert('Failed to add product');
            productForm.reset();
            createModal.classList.add('hidden');
            loadProducts();
        });
    }

    if (editProductForm) {
        closeEditModalBtn?.addEventListener('click', () => editModal.classList.add('hidden'));

        editProductForm.addEventListener('submit', async e => {
            e.preventDefault();
            const id = document.getElementById('editProductId').value;

            const formData = new FormData();
            formData.append('name', document.getElementById('editName').value);
            formData.append('sku', document.getElementById('editSku').value);
            formData.append('price', document.getElementById('editPrice').value);
            formData.append('cost_price', document.getElementById('editCostPrice').value);
            formData.append('description', document.getElementById('editDescription').value);

            const imageInput = document.getElementById('editImage');
            if (imageInput.files.length > 0) formData.append('image', imageInput.files[0]);

            formData.append('is_active', document.getElementById('editIsActive').checked ? 1 : 0);

            const res = await fetch(`${baseUrl}/api/v1/products/${id}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'X-HTTP-Method-Override': 'PUT'
                },
                body: formData
            });

            if (!res.ok) return alert('Failed to update product');
            editModal.classList.add('hidden');
            loadProducts();
        });
    }

    /* ================= FILTER / SORT ================= */
    [searchInput, statusFilter, sortSelect].forEach(el => {
        el.addEventListener('input', loadProducts);
    });

    loadProducts();
});
