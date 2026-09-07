/**
 * products/index.js
 * ─────────────────────────────────────────────
 * Entry point for the Products page.
 *
 * Responsibilities:
 *   1. Auth check
 *   2. Build shared auth context (baseUrl + headers)
 *   3. Wire up all handlers
 *   4. Trigger initial data load
 */

import { init, loadCategories, loadProducts,
   bindCreateImageUpload,
   bindEditImageUpload, bindCategoryToggles,
   bindCreateProduct, bindUpdateProduct,
   bindFilters, bindVariants } from './handlers.js';
import { requireAdminAuth, fetchCsrfCookie } from '../shared/auth.js';
import { bindLogout, bindProfileDropdown, bindDrawer, renderChromeUser } from '../shared/chrome.js';

document.addEventListener('DOMContentLoaded', async () => {

    /* =========================================================
       AUTH CHECK
    ========================================================= */
    requireAdminAuth();

    /* Chrome UI needs no network state — bind before the CSRF await
       so the drawer and dropdown respond on first paint. */
    bindDrawer();
    bindProfileDropdown();
    renderChromeUser();

    /* =========================================================
       SHARED CONTEXT
       Session-cookie authenticated; the XSRF-TOKEN cookie must be
       in place before any mutating request fires.
    ========================================================= */
    const baseUrl = window.location.origin;
    const headers = { Accept: 'application/json' };
    await fetchCsrfCookie();

    // Pass auth context to handlers once
    init(baseUrl, headers);

    /* =========================================================
       WIRE UP ALL HANDLERS
    ========================================================= */
    bindLogout();
    bindCreateImageUpload();
    bindEditImageUpload();
    bindCategoryToggles();
    bindCreateProduct();
    bindUpdateProduct();
    bindFilters();
    bindVariants();

    /* =========================================================
       INITIAL DATA LOAD
    ========================================================= */
    loadCategories();
    loadProducts();

});
