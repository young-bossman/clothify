/**
 * dashboard/ui.js
 * ─────────────────────────────────────────────
 * DOM references and all render functions.
 * Nothing in here makes network calls.
 */

/* =========================================================
   DOM REFERENCES
========================================================= */
export const dom = {
    logoutBtn:        document.getElementById('logoutBtn'),
    logoutBtnTop:     document.getElementById('logoutBtnTop'),
    userNameEls:      document.querySelectorAll('.userName'),
    profileToggle:    document.getElementById('profileToggle'),
    profileDropdown:  document.getElementById('profileDropdown'),
    productCount:     document.getElementById('productCount'),
    orderCount:       document.getElementById('orderCount'),
    revenue:          document.getElementById('revenue'),
    lowStockCount:    document.getElementById('lowStockCount'),
    lowStockList:     document.getElementById('lowStockList'),
    recentOrdersBody: document.getElementById('recentOrdersBody'),
};

/* =========================================================
   STATUS BADGE HELPER
========================================================= */
export const statusClass = (status) => {
    switch (status) {
        case 'pending':    return 'bg-yellow-900 text-yellow-300';
        case 'processing': return 'bg-blue-900 text-blue-300';
        case 'completed':  return 'bg-green-900 text-green-300';
        case 'cancelled':  return 'bg-red-900 text-red-300';
        default:           return 'bg-gray-700 text-gray-300';
    }
};

/* =========================================================
   RENDER USER NAME
========================================================= */
export const renderUserName = (name) => {
    dom.userNameEls.forEach(el => { el.innerText = name; });
};

/* =========================================================
   RENDER STAT CARDS
========================================================= */
export const renderStatCards = (data) => {
    if (dom.productCount)  dom.productCount.innerText  = data.total_products;
    if (dom.orderCount)    dom.orderCount.innerText    = data.total_orders;
    if (dom.revenue)       dom.revenue.innerText       = `GHS ${parseFloat(data.total_revenue).toFixed(2)}`;
    if (dom.lowStockCount) dom.lowStockCount.innerText = data.low_stock_count;
};

/* =========================================================
   RENDER LOW STOCK ALERTS
========================================================= */
export const renderLowStock = (items) => {
    if (!dom.lowStockList) return;

    if (items.length === 0) {
        dom.lowStockList.innerHTML = `<p class="text-gray-400 text-sm">All products are well stocked.</p>`;
        return;
    }

    dom.lowStockList.innerHTML = items.map(p => `
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
};

/* =========================================================
   RENDER RECENT ORDERS
========================================================= */
export const renderRecentOrders = (orders) => {
    if (!dom.recentOrdersBody) return;

    if (orders.length === 0) {
        dom.recentOrdersBody.innerHTML = `<tr><td colspan="5" class="text-center text-gray-400 py-4">No orders yet.</td></tr>`;
        return;
    }

    dom.recentOrdersBody.innerHTML = orders.map(o => `
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
};
