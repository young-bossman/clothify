/**
 * dashboard/handlers.js
 * ─────────────────────────────────────────────
 * All event handlers and data-loading actions.
 * Imports from api.js and ui.js only.
 */

import { fetchUser, fetchStats } from './api.js';
import { clearAuthData } from '../shared/auth.js';
import { renderUserName, renderStatCards, renderLowStock, renderRecentOrders } from './ui.js';

/* =========================================================
   SHARED AUTH CONTEXT
   Set once by main.js via init(), read by every handler.
========================================================= */
let ctx = { baseUrl: '', headers: {} };

export const init = (baseUrl, headers) => {
    ctx = { baseUrl, headers };
};

/* =========================================================
   LOAD USER
========================================================= */
export const loadUser = async () => {
    try {
        const user = await fetchUser(ctx);

        // Role guard — customers cannot access dashboard
        if (!['admin', 'staff'].includes(user.role)) {
            clearAuthData();
            window.location.href = '/login';
            return;
        }

        renderUserName(user.name);
    } catch (err) {
        clearAuthData();
        window.location.href = '/login';
    }
};
/* =========================================================
   LOAD STATS
========================================================= */
export const loadStats = async () => {
    try {
        const data = await fetchStats(ctx);
        renderStatCards(data);
        renderLowStock(data.low_stock_items);
        renderRecentOrders(data.recent_orders);
    } catch (err) {
        console.error('Stats fetch failed:', err);
    }
};
