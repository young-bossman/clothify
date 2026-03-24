/**
 * shop/main.js
 * ─────────────────────────────────────────────
 * Entry point for the Shop page.
 *
 * Responsibilities:
 *   1. Set baseUrl on ui.js and handlers.js
 *   2. Wire up all UI initialisers
 *   3. Wire up all event handlers
 *   4. Expose window globals needed by inline onclick attributes
 *   5. Trigger initial data loads
 */

import { setBaseUrl, initTheme, initMobileNav, initPriceToggle, initCartDrawer, injectStyles, updateCartBadge, renderCart } from './ui.js';
import {
    init,
    loadCategories,
    loadProducts,
    openProduct,
    quickAdd,
    bindProductModal,
    bindCartInlineHandlers,
    bindCheckoutButton,
    bindAuthModal,
    bindCheckoutModal,
    bindFilters,
} from './handlers.js';

document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================
       SHARED CONTEXT
    ========================================================= */
    const baseUrl = window.location.origin;
    setBaseUrl(baseUrl);
    init(baseUrl);

    /* =========================================================
       UI INITIALISERS
    ========================================================= */
    injectStyles();
    initTheme();
    initMobileNav();
    initPriceToggle();
    initCartDrawer();

    /* =========================================================
       WIRE UP HANDLERS
    ========================================================= */
    bindCartInlineHandlers();
    bindProductModal();
    bindCheckoutButton();
    bindAuthModal();
    bindCheckoutModal();
    bindFilters();

    /* =========================================================
       EXPOSE GLOBALS
       Required by onclick attributes in dynamically rendered HTML
       (product cards use openProduct and quickAdd inline)
    ========================================================= */
    window.openProduct = openProduct;
    window.quickAdd    = quickAdd;

    /* =========================================================
       INITIAL LOAD
    ========================================================= */
    updateCartBadge();
    renderCart();
    loadCategories();
    loadProducts();

});
