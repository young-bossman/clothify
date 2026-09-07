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

import { init, loadUser, loadStats } from './handlers.js';
import { requireAdminAuth, fetchCsrfCookie } from '../shared/auth.js';
import { bindLogout, bindProfileDropdown, bindDrawer, renderShellUser } from '../shared/shell.js';

document.addEventListener('DOMContentLoaded', async () => {

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
    requireAdminAuth();

    /* Shell UI needs no network state — bind before the CSRF await
       so the drawer and dropdown respond on first paint. */
    bindDrawer();
    bindProfileDropdown();
    renderShellUser();

    /* =========================================================
       SHARED CONTEXT
       Session-cookie authenticated; the XSRF-TOKEN cookie must be
       in place before the logout POST fires.
    ========================================================= */
    const baseUrl = window.location.origin;
    const headers = { Accept: 'application/json' };
    await fetchCsrfCookie();

    init(baseUrl, headers);

    /* =========================================================
       WIRE UP HANDLERS
    ========================================================= */
    bindLogout();

    /* =========================================================
       INITIAL DATA LOAD
    ========================================================= */
    loadUser();
    loadStats();

});
