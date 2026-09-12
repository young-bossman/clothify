/**
 * dashboard/ui.js
 * ─────────────────────────────────────────────
 * DOM references and all render functions.
 * Nothing in here makes network calls.
 */

import { escapeHtml } from '../shared/escape.js';

/* =========================================================
   DOM REFERENCES
========================================================= */
export const dom = {
    userNameEls:      document.querySelectorAll('.userName'),
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
        case 'completed':  return 'bg-emerald-500/15 text-emerald-400';
        case 'processing':
        case 'pending':    return 'bg-amber-500/15 text-amber-400';
        case 'cancelled':  return 'bg-rose-500/15 text-rose-400';
        default:           return 'bg-slate-700/50 text-slate-300';
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
        dom.lowStockList.innerHTML = `<p class="text-slate-500 text-sm">All products are well stocked.</p>`;
        return;
    }

    dom.lowStockList.innerHTML = items.map(p => `
        <div class="flex items-center justify-between py-2.5 border-b border-slate-800 last:border-0">
            <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-md bg-slate-800 shrink-0"></div>
                <div>
                    <p class="font-medium text-white leading-tight">${escapeHtml(p.name)}</p>
                    <p class="text-xs text-slate-500">${escapeHtml(p.sku)}</p>
                </div>
            </div>
            <span class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${p.stock_quantity === 0 ? 'bg-rose-500/15 text-rose-400' : 'bg-amber-500/15 text-amber-400'}">${p.stock_quantity === 0 ? 'Out of stock' : `${p.stock_quantity} left`}</span>
        </div>
    `).join('');
};

/* =========================================================
   RENDER RECENT ORDERS
========================================================= */
export const renderRecentOrders = (orders) => {
    if (!dom.recentOrdersBody) return;

    if (orders.length === 0) {
        dom.recentOrdersBody.innerHTML = `<tr><td colspan="5" class="text-center text-slate-500 py-4">No orders yet.</td></tr>`;
        return;
    }

    dom.recentOrdersBody.innerHTML = '';

    orders.forEach(o => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-slate-800 last:border-0 hover:bg-slate-800/40 transition';

        // delivery_name is free text from checkout — never interpolate it
        // into an innerHTML template string. The customer cell is left
        // empty here and filled via textContent below.
        tr.innerHTML = `
            <td class="px-1 py-2.5 font-medium text-white">#${o.id}</td>
            <td class="px-1 py-2.5 text-slate-300"></td>
            <td class="px-1 py-2.5 text-slate-300">GHS ${parseFloat(o.total_amount).toFixed(2)}</td>
            <td class="px-1 py-2.5">
                <span class="rounded-full px-2 py-0.5 text-xs ${statusClass(o.status)}">${o.status}</span>
            </td>
            <td class="px-1 py-2.5 text-slate-500">${new Date(o.created_at).toLocaleDateString()}</td>
        `;

        tr.children[1].textContent = o.delivery_name;
        dom.recentOrdersBody.appendChild(tr);
    });
};
