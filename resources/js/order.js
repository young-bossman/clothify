document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/login'; return; }

    const baseUrl = window.location.origin;
    const headers = { Accept: 'application/json', Authorization: `Bearer ${token}` };

    const openModal  = (m) => { m.classList.remove('hidden'); m.classList.add('flex'); };
    const closeModal = (m) => { m.classList.add('hidden');    m.classList.remove('flex'); };

    const ordersBody    = document.getElementById('ordersBody');
    const pagination    = document.getElementById('pagination');
    const filterStatus  = document.getElementById('filterStatus');
    const filterPayment = document.getElementById('filterPayment');
    const orderModal    = document.getElementById('orderModal');
    const logoutBtn     = document.getElementById('logoutBtn');

    let currentPage    = 1;
    let currentOrderId = null;

    // Status badge classes
    const statusClass = (s) => ({
        pending:    'bg-yellow-900 text-yellow-300',
        processing: 'bg-blue-900 text-blue-300',
        completed:  'bg-green-900 text-green-300',
        cancelled:  'bg-red-900 text-red-300',
    }[s] ?? 'bg-gray-700 text-gray-300');

    const paymentClass = (s) => ({
        unpaid:   'bg-red-900 text-red-300',
        paid:     'bg-green-900 text-green-300',
        refunded: 'bg-purple-900 text-purple-300',
    }[s] ?? 'bg-gray-700 text-gray-300');

    // Load orders
    const loadOrders = (page = 1) => {
        currentPage = page;
        const status  = filterStatus.value;
        const payment = filterPayment.value;

        let url = `${baseUrl}/api/v1/orders?page=${page}`;
        if (status)  url += `&status=${status}`;
        if (payment) url += `&payment_status=${payment}`;

        ordersBody.innerHTML = `<tr><td colspan="7" class="text-center text-gray-400 py-6">Loading...</td></tr>`;

        fetch(url, { headers })
            .then(res => res.json())
            .then(data => {
                if (data.data.length === 0) {
                    ordersBody.innerHTML = `<tr><td colspan="7" class="text-center text-gray-400 py-6">No orders found.</td></tr>`;
                    pagination.innerHTML = '';
                    return;
                }

                ordersBody.innerHTML = data.data.map(o => `
                    <tr class="border-b border-gray-700 hover:bg-gray-700/40 cursor-pointer" data-id="${o.id}">
                        <td class="py-3 px-4 text-gray-300">#${o.id}</td>
                        <td class="py-3 px-4">${o.delivery_name ?? '—'}</td>
                        <td class="py-3 px-4">GHS ${parseFloat(o.total_amount).toFixed(2)}</td>
                        <td class="py-3 px-4">
                            <span class="text-xs px-2 py-1 rounded-full font-semibold ${statusClass(o.status)}">${o.status}</span>
                        </td>
                        <td class="py-3 px-4">
                            <span class="text-xs px-2 py-1 rounded-full font-semibold ${paymentClass(o.payment_status)}">${o.payment_status}</span>
                        </td>
                        <td class="py-3 px-4 text-gray-400 text-sm">${new Date(o.created_at).toLocaleDateString()}</td>
                        <td class="py-3 px-4">
                            <button class="text-indigo-400 hover:text-indigo-300 text-sm viewBtn" data-id="${o.id}">View</button>
                        </td>
                    </tr>
                `).join('');

                // Pagination
                renderPagination(data);

                // Row click → open modal
                document.querySelectorAll('.viewBtn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        openOrderModal(btn.dataset.id);
                    });
                });
            })
            .catch(err => console.error('Orders fetch failed:', err));
    };

    const renderPagination = (data) => {
        if (data.last_page <= 1) { pagination.innerHTML = ''; return; }

        pagination.innerHTML = Array.from({ length: data.last_page }, (_, i) => i + 1).map(p => `
            <button class="px-3 py-1 rounded text-sm ${p === data.current_page ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}" data-page="${p}">${p}</button>
        `).join('');

        pagination.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => loadOrders(parseInt(btn.dataset.page)));
        });
    };

    // Open order detail modal
    const openOrderModal = (id) => {
        currentOrderId = id;

        fetch(`${baseUrl}/api/v1/orders/${id}`, { headers })
            .then(res => res.json())
            .then(order => {
                document.getElementById('modalTitle').innerText = `Order #${order.id}`;

                document.getElementById('modalMeta').innerHTML = `
                    <p>Customer: ${order.delivery_name ?? '—'}</p>
                    <p>Phone: ${order.delivery_phone ?? '—'}</p>
                    <p>Address: ${order.delivery_address ?? '—'}${order.city ? ', ' + order.city : ''}${order.region ? ', ' + order.region : ''}</p>
                    <p>Total: GHS ${parseFloat(order.total_amount).toFixed(2)}</p>
                    <p>Date: ${new Date(order.created_at).toLocaleString()}</p>
                `;

                // Order items
                // TODO: update this when productVariant.product is wired up to show product name, size, color
                const tbody = document.getElementById('modalItems');
                if (order.order_items.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="4" class="text-gray-400 py-2">No items.</td></tr>`;
                } else {
                    tbody.innerHTML = order.order_items.map((item, i) => `
                        <tr class="border-b border-gray-700">
                            <td class="py-2">Item ${i + 1}</td>
                            <td class="py-2">${item.quantity}</td>
                            <td class="py-2">GHS ${parseFloat(item.price_at_purchase).toFixed(2)}</td>
                            <td class="py-2">GHS ${(item.quantity * item.price_at_purchase).toFixed(2)}</td>
                        </tr>
                    `).join('');
                }

                // Set current status values
                document.getElementById('modalStatus').value        = order.status;
                document.getElementById('modalPaymentStatus').value = order.payment_status;

                openModal(orderModal);
            });
    };

    // Save status changes
    document.getElementById('saveStatus').addEventListener('click', async () => {
        if (!currentOrderId) return;

        const status        = document.getElementById('modalStatus').value;
        const paymentStatus = document.getElementById('modalPaymentStatus').value;

        await Promise.all([
            fetch(`${baseUrl}/api/v1/orders/${currentOrderId}/status`, {
                method: 'PATCH',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            }),
            fetch(`${baseUrl}/api/v1/orders/${currentOrderId}/payment-status`, {
                method: 'PATCH',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ payment_status: paymentStatus }),
            }),
        ]);

        closeModal(orderModal);
        loadOrders(currentPage);
    });

    // Delete order
    document.getElementById('deleteOrder').addEventListener('click', async () => {
        if (!currentOrderId) return;
        if (!confirm('Delete this order? This cannot be undone.')) return;

        await fetch(`${baseUrl}/api/v1/orders/${currentOrderId}`, {
            method: 'DELETE',
            headers,
        });

        closeModal(orderModal);
        loadOrders(currentPage);
    });

    // Close modal
    document.getElementById('closeModal').addEventListener('click', () => closeModal(orderModal));
    orderModal.addEventListener('click', (e) => { if (e.target === orderModal) closeModal(orderModal); });

    // Filters
    filterStatus.addEventListener('change',  () => loadOrders(1));
    filterPayment.addEventListener('change', () => loadOrders(1));

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await fetch(`${baseUrl}/api/v1/logout`, { method: 'POST', headers });
            } finally {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        });
    }

    // Also update dashboard sidebar Orders link
    loadOrders();
});