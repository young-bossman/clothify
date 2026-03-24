/**
 * dashboard/handlers.js
 * ─────────────────────────────────────────────
 * All event handlers and data-loading actions.
 * Imports from api.js and ui.js only.
 */

import { fetchUser, fetchStats, logoutRequest } from './api.js';
import { dom, renderUserName, renderStatCards, renderLowStock, renderRecentOrders } from './ui.js';

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
        renderUserName(user.name);
    } catch (err) {
        // 401 means token is invalid — force re-login
        if (err.message === 'Unauthorized') {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
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

/* =========================================================
   LOGOUT
========================================================= */
export const bindLogout = () => {
    const handleLogout = async () => {
        try {
            await logoutRequest(ctx);
        } finally {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    };

    if (dom.logoutBtn)    dom.logoutBtn.addEventListener('click', handleLogout);
    if (dom.logoutBtnTop) dom.logoutBtnTop.addEventListener('click', handleLogout);
};

/* =========================================================
   PROFILE DROPDOWN
========================================================= */
export const bindProfileDropdown = () => {
    if (!dom.profileToggle || !dom.profileDropdown) return;

    dom.profileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        dom.profileDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
        dom.profileDropdown.classList.add('hidden');
    });
};
