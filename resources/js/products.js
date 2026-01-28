document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) return window.location.href = '/login';

    const baseUrl = window.location.origin;
    const productsTable = document.getElementById('productsTable');
    if (!productsTable) return;

    const productForm = document.getElementById('productForm');
    const editProductForm = document.getElementById('editProductForm');

    const createModal = document.getElementById('createModal');
    const editModal = document.getElementById('editModal');

    const openCreateModalBtn = document.getElementById('openCreateModal');
    const closeCreateModalBtn = document.getElementById('closeCreateModal');
    const closeEditModalBtn = document.getElementById('closeEditModal');

    /* ================= LOAD PRODUCTS ================= */
    const loadProducts = async () => {
        const res = await fetch(`${baseUrl}/api/v1/products`, {
            headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }
        });

        const json = await res.json();
        const products = json.data ?? json;

        productsTable.innerHTML = products.map(product => {
            const imageUrl = product.image
                ? product.image.startsWith('http') ? product.image : `${baseUrl}/storage/${product.image}`
                : null;

            return `
                <tr class="border-b border-gray-700">
                    <td>${imageUrl ? `<img src="${imageUrl}" class="h-12 w-12 object-cover rounded">` : `<div class="h-12 w-12 bg-gray-700 rounded"></div>`}</td>
                    <td>${product.name}</td>
                    <td>${product.sku}</td>
                    <td>GHS ${product.price}</td>
                    <td>GHS ${product.cost_price ?? 0}</td>
                    <td>${product.description ?? ''}</td>
                    <td><span class="${product.is_active ? 'text-green-400' : 'text-red-400'}">${product.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td class="text-right space-x-3">
                        <button class="text-indigo-400 hover:underline editBtn" data-id="${product.id}">Edit</button>
                        <button class="text-red-400 hover:underline deleteBtn" data-id="${product.id}">Delete</button>
                    </td>
                </tr>
            `;
        }).join('');

        bindActionButtons();
    };

    /* ================= BIND EDIT / DELETE BUTTONS ================= */
    const bindActionButtons = () => {
        document.querySelectorAll('.editBtn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const res = await fetch(`${baseUrl}/api/v1/products/${id}`, {
                    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }
                });
                const product = await res.json();

                document.getElementById('editProductId').value = product.id;
                document.getElementById('editName').value = product.name;
                document.getElementById('editSku').value = product.sku;
                document.getElementById('editPrice').value = product.price;
                document.getElementById('editCostPrice').value = product.cost_price ?? 0;
                document.getElementById('editDescription').value = product.description ?? '';
                document.getElementById('editIsActive').checked = !!product.is_active;

                editModal.classList.remove('hidden');
            });
        });

        document.querySelectorAll('.deleteBtn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('Delete this product?')) return;
                const id = btn.dataset.id;
                const res = await fetch(`${baseUrl}/api/v1/products/${id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) return alert('Failed to delete product');
                loadProducts();
            });
        });
    };

    /* ================= CREATE PRODUCT ================= */
    if (productForm) {
        openCreateModalBtn.addEventListener('click', () => createModal.classList.remove('hidden'));
        closeCreateModalBtn.addEventListener('click', () => createModal.classList.add('hidden'));

        productForm.addEventListener('submit', async e => {
            e.preventDefault();
            const formData = new FormData(productForm);

            // Ensure is_active field is sent
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

    /* ================= EDIT PRODUCT ================= */
    if (editProductForm) {
        closeEditModalBtn.addEventListener('click', () => editModal.classList.add('hidden'));

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

    loadProducts();
});
