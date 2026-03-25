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
   bindLogout, bindCreateImageUpload, 
   bindEditImageUpload, bindCategoryToggles, 
   bindCreateProduct, bindUpdateProduct, 
   bindFilters, bindVariants } from './handlers.js';

document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================
       AUTH CHECK
    ========================================================= */
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/login'; return; }

    /* =========================================================
       SHARED CONTEXT
       Applied to every fetch call so Laravel always returns
       JSON errors instead of HTML redirects.
    ========================================================= */
    const baseUrl = window.location.origin;
    const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
    };

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
