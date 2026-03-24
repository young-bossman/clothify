/**
 * dashboard/main.js
 * ─────────────────────────────────────────────
 * Entry point for the Dashboard page.
 *
 * Responsibilities:
 *   1. Guard: bail early if no userName elements exist on the page
 *   2. Auth check
 *   3. Build shared auth context (baseUrl + headers)
 *   4. Wire up all handlers
 *   5. Trigger initial data loads
 */

import { init, loadUser, loadStats, bindLogout, bindProfileDropdown } from './handlers.js';

document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================
       PAGE GUARD
       Mirrors the original early-return when no userName
       elements are found on the page.
    ========================================================= */
    const userNameEls = document.querySelectorAll('.userName');
    if (userNameEls.length === 0) return;

    /* =========================================================
       AUTH CHECK
    ========================================================= */
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/login'; return; }

    /* =========================================================
       SHARED CONTEXT
    ========================================================= */
    const baseUrl = window.location.origin;
    const headers = {
        Accept:        'application/json',
        Authorization: `Bearer ${token}`,
    };

    init(baseUrl, headers);

    /* =========================================================
       WIRE UP HANDLERS
    ========================================================= */
    bindLogout();
    bindProfileDropdown();

    /* =========================================================
       INITIAL DATA LOAD
    ========================================================= */
    loadUser();
    loadStats();

});
