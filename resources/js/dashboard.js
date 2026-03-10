document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn       = document.getElementById('logoutBtn');
    const logoutBtnTop    = document.getElementById('logoutBtnTop');
    const userNameEls     = document.querySelectorAll('.userName');
    const profileToggle   = document.getElementById('profileToggle');
    const profileDropdown = document.getElementById('profileDropdown');

    if (userNameEls.length === 0) return;

    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/login'; return; }

    const baseUrl = window.location.origin;
    const headers = { Accept: 'application/json', Authorization: `Bearer ${token}` };

    // Fetch logged-in user
    fetch(`${baseUrl}/api/v1/me`, { headers })
        .then(res => { if (res.status === 401) throw new Error('Unauthorized'); return res.json(); })
        .then(user => { userNameEls.forEach(el => { el.innerText = user.name; }); })
        .catch(() => { localStorage.removeItem('token'); window.location.href = '/login'; });

    // Fetch stats
    fetch(`${baseUrl}/api/v1/stats`, { headers })
        .then(res => { if (res.status === 401) throw new Error('Unauthorized'); return res.json(); })
        .then(data => {
            // Stat cards
            document.getElementById('productCount').innerText  = data.total_products;
            document.getElementById('orderCount').innerText    = data.total_orders;
            document.getElementById('revenue').innerText       = `GHS ${parseFloat(data.total_revenue).toFixed(2)}`;
            document.getElementById('lowStockCount').innerText = data.low_stock_count;

            // Low stock alerts
            const lowStockList = document.getElementById('lowStockList');
            if (data.low_stock_items.length === 0) {
                lowStockList.innerHTML = `<p class="text-gray-400 text-sm">All products are well stocked.</p>`;
            } else {
                lowStockList.innerHTML = data.low_stock_items.map(p => `
                    <div class="flex justify-between items-center py-2 border-b border-gray-700 last:border-0">
                        <div>
                            <span class="font-medium">${p.name}</span>
                            <span class="text-gray-400 text-sm ml-2">${p.sku}</span>
                        </div>
                        <span class="text-sm font-semibold px-2 py-1 rounded ${p.stock_quantity === 0 ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'}">
                            ${p.stock_quantity === 0 ? 'Out of stock' : `${p.stock_quantity} left`}
                        </span>
                    </div>
                `).join('');
            }

            // Recent orders
            const ordersTbody = document.getElementById('recentOrdersBody');
            if (data.recent_orders.length === 0) {
                ordersTbody.innerHTML = `<tr><td colspan="5" class="text-center text-gray-400 py-4">No orders yet.</td></tr>`;
            } else {
                ordersTbody.innerHTML = data.recent_orders.map(o => `
                    <tr class="border-b border-gray-700 hover:bg-gray-700/40">
                        <td class="py-3 px-4 text-gray-300">#${o.id}</td>
                        <td class="py-3 px-4">${o.delivery_name}</td>
                        <td class="py-3 px-4">GHS ${parseFloat(o.total_amount).toFixed(2)}</td>
                        <td class="py-3 px-4">
                            <span class="text-xs px-2 py-1 rounded-full font-semibold ${statusClass(o.status)}">
                                ${o.status}
                            </span>
                        </td>
                        <td class="py-3 px-4 text-gray-400 text-sm">${new Date(o.created_at).toLocaleDateString()}</td>
                    </tr>
                `).join('');
            }
        })
        .catch(err => console.error('Stats fetch failed:', err));

    // Logout handler
    const handleLogout = async () => {
        try {
            await fetch(`${baseUrl}/api/v1/logout`, { method: 'POST', headers });
        } finally {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    };

    if (logoutBtn)    logoutBtn.addEventListener('click', handleLogout);
    if (logoutBtnTop) logoutBtnTop.addEventListener('click', handleLogout);

    // Profile dropdown
    if (profileToggle && profileDropdown) {
        profileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('hidden');
        });
        document.addEventListener('click', () => { profileDropdown.classList.add('hidden'); });
    }
});

function statusClass(status) {
    switch (status) {
        case 'pending':    return 'bg-yellow-900 text-yellow-300';
        case 'processing': return 'bg-blue-900 text-blue-300';
        case 'completed':  return 'bg-green-900 text-green-300';
        case 'cancelled':  return 'bg-red-900 text-red-300';
        default:           return 'bg-gray-700 text-gray-300';
    }
}