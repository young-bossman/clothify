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
import { requireAdminAuth, getAuthHeaders } from '../shared/auth.js';

document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================
       AUTH CHECK
    ========================================================= */
    requireAdminAuth();

    /* =========================================================
       SHARED CONTEXT
       Applied to every fetch call so Laravel always returns
       JSON errors instead of HTML redirects.
    ========================================================= */
    const baseUrl = window.location.origin;
    const headers = {
        Accept: 'application/json',
        ...getAuthHeaders(),
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
