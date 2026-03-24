/**
 * shop/handlers.js
 * ─────────────────────────────────────────────
 * All event handlers and data-loading actions.
 * Imports from api.js, cart.js, and ui.js only.
 */

import {
    fetchCategories,
    fetchProducts,
    fetchProductById,
    loginRequest,
    registerRequest,
    placeOrderRequest,
} from './api.js';

import {
    addToCart,
    removeFromCart,
    changeQty,
    clearCart,
    getCart,
    cartCount,
    cartTotal,
} from './cart.js';

import {
    showToast,
    updateCartBadge,
    renderCart,
    openCart,
    closeCart,
    openProductModal,
    closeProductModal,
    openAuthModal,
    closeAuthModal,
    openCheckoutModal,
    closeCheckoutModal,
    populateCheckoutSummary,
    renderLoadingGrid,
    renderEmptyGrid,
    renderErrorGrid,
    renderProductGrid,
    renderPagination,
} from './ui.js';

/* =========================================================
   SHARED CONTEXT
   Set once by main.js via init()
========================================================= */
let baseUrl     = '';
let currentPage = 1;

// Cache fetched products by ID to avoid re-fetching on card click
const productCache = {};

export const init = (url) => { baseUrl = url; };

/* =========================================================
   BUILD QUERY STRING
========================================================= */
const buildQuery = () => {
    const params = new URLSearchParams();

    const search   = document.getElementById('searchInput').value.trim();
    const category = document.getElementById('categorySelect').value;
    const sort     = document.getElementById('sortSelect').value;
    const [sortBy, sortDir] = sort.split(':');

    // Price — read from whichever inputs are visible
    const priceMin = document.getElementById('priceMin').value
        || document.getElementById('priceMinMob').value;
    const priceMax = document.getElementById('priceMax').value
        || document.getElementById('priceMaxMob').value;

    if (search)   params.append('search',      search);
    if (category) params.append('category_id', category);
    if (sortBy)   params.append('sort_by',     sortBy);
    if (sortDir)  params.append('sort_dir',    sortDir);
    if (priceMin) params.append('price_min',   priceMin);
    if (priceMax) params.append('price_max',   priceMax);

    // Tell the backend we're on the public storefront
    // so it only returns active products
    params.append('public', '1');
    params.append('page',   currentPage);

    return params.toString();
};

/* =========================================================
   LOAD CATEGORIES
========================================================= */
export const loadCategories = async () => {
    try {
        const categories = await fetchCategories(baseUrl);

        // Update hero count
        document.getElementById('heroCategoryCount').textContent = categories.length;

        // Populate category select
        const select = document.getElementById('categorySelect');
        categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value       = cat.id;
            opt.textContent = cat.name;
            select.appendChild(opt);
        });

        // Populate pill bar
        const pillBar = document.getElementById('pillBar');
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className        = 'pill flex-shrink-0 py-[.4rem] px-[.95rem] border border-theme rounded-full text-[.7rem] font-medium text-theme2 bg-theme3 cursor-pointer whitespace-nowrap transition-all';
            btn.textContent      = cat.name;
            btn.dataset.category = cat.id;
            btn.addEventListener('click', () => {
                document.querySelectorAll('.pill').forEach(p => p.classList.remove('on'));
                btn.classList.add('on');
                document.getElementById('categorySelect').value = cat.id;
                currentPage = 1;
                loadProducts();
            });
            pillBar.appendChild(btn);
        });

        // Wire the "All" pill
        document.querySelector('.pill[data-category=""]')?.addEventListener('click', () => {
            document.querySelectorAll('.pill').forEach(p => p.classList.remove('on'));
            document.querySelector('.pill[data-category=""]').classList.add('on');
            document.getElementById('categorySelect').value = '';
            currentPage = 1;
            loadProducts();
        });

    } catch (err) {
        // Categories failing silently is acceptable — filters still work
        console.warn('Failed to load categories:', err);
    }
};

/* =========================================================
   LOAD PRODUCTS
========================================================= */
export const loadProducts = async () => {
    renderLoadingGrid();

    try {
        const json     = await fetchProducts(baseUrl, buildQuery());
        const products = json.data ?? [];

        // Update hero product count on unfiltered first load
        if (currentPage === 1 && !document.getElementById('searchInput').value) {
            document.getElementById('heroProductCount').textContent = json.total ?? products.length;
        }

        // Update result count label
        document.getElementById('prodCount').textContent =
            `Showing ${products.length} of ${json.total} products`;

        // Cache products for quick modal open
        products.forEach(p => { productCache[p.id] = p; });

        if (!products.length) {
            renderEmptyGrid();
            document.getElementById('pagination').innerHTML = '';
            return;
        }

        renderProductGrid(products);
        renderPagination(json, (page) => {
            currentPage = page;
            loadProducts();
            document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
        });

    } catch (err) {
        renderErrorGrid();
        console.error('Failed to load products:', err);
    }
};

/* =========================================================
   OPEN PRODUCT (card click)
   Uses cache if available, otherwise fetches from API
========================================================= */
export const openProduct = async (id) => {
    try {
        let product = productCache[id];
        if (!product) {
            product = await fetchProductById(baseUrl, id);
            productCache[id] = product;
        }
        openProductModal(product);
    } catch {
        showToast('Could not load product details');
    }
};

/* =========================================================
   QUICK ADD (hover button on card)
   Uses cache so it never makes an extra API call
========================================================= */
export const quickAdd = async (id) => {
    try {
        let product = productCache[id];
        if (!product) {
            product = await fetchProductById(baseUrl, id);
            productCache[id] = product;
        }
        addToCart(product);
        updateCartBadge();
        renderCart();
        showToast(`${product.name} added to cart`);
    } catch {
        showToast('Could not add to cart');
    }
};

/* =========================================================
   BIND PRODUCT MODAL
========================================================= */
export const bindProductModal = () => {
    document.getElementById('modalClose').addEventListener('click', closeProductModal);

    document.getElementById('productModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('productModal')) closeProductModal();
    });

    document.getElementById('modalAddBtn').addEventListener('click', () => {
        // currentProduct is tracked inside ui.js openProductModal;
        // we re-read it from the modal's data attribute set during open
        const name = document.getElementById('modalName').textContent;
        const id   = parseInt(document.getElementById('modalAddBtn').dataset.productId);
        const product = productCache[id];
        if (product) {
            addToCart(product);
            updateCartBadge();
            renderCart();
            showToast(`${product.name} added to cart`);
            closeProductModal();
        }
    });
};

/* =========================================================
   BIND CART INLINE HANDLERS
   Exposed to window for onclick attributes in rendered HTML
========================================================= */
export const bindCartInlineHandlers = () => {
    window.removeFromCart = (id) => {
        removeFromCart(id);
        updateCartBadge();
        renderCart();
    };

    window.changeQty = (id, delta) => {
        changeQty(id, delta);
        updateCartBadge();
        renderCart();
    };
};

/* =========================================================
   BIND CHECKOUT BUTTON (in cart drawer)
========================================================= */
export const bindCheckoutButton = () => {
    document.getElementById('checkoutBtn').addEventListener('click', () => {
        if (!cartCount()) { showToast('Your cart is empty'); return; }

        const customerToken = localStorage.getItem('customer_token');
        if (!customerToken) {
            closeCart();
            setTimeout(() => openAuthModal(), 320);
        } else {
            closeCart();
            setTimeout(() => {
                openCheckoutModal();
                populateCheckoutSummary();
            }, 320);
        }
    });
};

/* =========================================================
   BIND AUTH MODAL (login + signup)
========================================================= */
export const bindAuthModal = () => {
    document.getElementById('closeAuthModal').addEventListener('click', closeAuthModal);

    document.getElementById('authModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('authModal')) closeAuthModal();
    });

    // Tab switching
    const tabLogin  = document.getElementById('tabLogin');
    const tabSignup = document.getElementById('tabSignup');

    tabLogin.addEventListener('click', () => {
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('signupForm').classList.add('hidden');
        tabLogin.classList.add('text-accent', 'border-accent');
        tabLogin.classList.remove('text-theme2', 'border-transparent');
        tabSignup.classList.add('text-theme2', 'border-transparent');
        tabSignup.classList.remove('text-accent', 'border-accent');
    });

    tabSignup.addEventListener('click', () => {
        document.getElementById('signupForm').classList.remove('hidden');
        document.getElementById('loginForm').classList.add('hidden');
        tabSignup.classList.add('text-accent', 'border-accent');
        tabSignup.classList.remove('text-theme2', 'border-transparent');
        tabLogin.classList.add('text-theme2', 'border-transparent');
        tabLogin.classList.remove('text-accent', 'border-accent');
    });

    // Login submit
    document.getElementById('loginSubmit').addEventListener('click', async () => {
        const email    = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const errorEl  = document.getElementById('loginError');
        errorEl.classList.add('hidden');

        try {
            const data = await loginRequest(baseUrl, { email, password });
            localStorage.setItem('customer_token', data.token);
            closeAuthModal();
            openCheckoutModal();
            populateCheckoutSummary();
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.classList.remove('hidden');
        }
    });

    // Signup submit
    document.getElementById('signupSubmit').addEventListener('click', async () => {
        const name     = document.getElementById('signupName').value.trim();
        const email    = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const errorEl  = document.getElementById('signupError');
        errorEl.classList.add('hidden');

        try {
            const data = await registerRequest(baseUrl, { name, email, password });
            localStorage.setItem('customer_token', data.token);
            closeAuthModal();
            openCheckoutModal();
            populateCheckoutSummary();
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.classList.remove('hidden');
        }
    });
};

/* =========================================================
   BIND CHECKOUT MODAL (place order)
========================================================= */
export const bindCheckoutModal = () => {
    document.getElementById('closeCheckoutModal').addEventListener('click', closeCheckoutModal);

    document.getElementById('checkoutModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('checkoutModal')) closeCheckoutModal();
    });

    // Payment method visual selection
    document.querySelectorAll('.payment-opt').forEach(label => {
        label.addEventListener('click', () => {
            document.querySelectorAll('.payment-opt').forEach(l => {
                l.classList.remove('border-accent', 'bg-theme3');
            });
            label.classList.add('border-accent', 'bg-theme3');
        });
    });

    // Default highlight cash on delivery
    document.querySelector('.payment-opt')?.classList.add('border-accent', 'bg-theme3');

    // Place order
    document.getElementById('placeOrderBtn').addEventListener('click', async () => {
        const customerToken = localStorage.getItem('customer_token');
        if (!customerToken) { openAuthModal(); return; }

        const errorEl = document.getElementById('checkoutError');
        errorEl.classList.add('hidden');

        const paymentMethod = document.querySelector('input[name="payment_method"]:checked')?.value || 'cash_on_delivery';

        const payload = {
            delivery_name:    document.getElementById('co_name').value.trim(),
            delivery_phone:   document.getElementById('co_phone').value.trim(),
            delivery_address: document.getElementById('co_address').value.trim(),
            city:             document.getElementById('co_city').value.trim(),
            region:           document.getElementById('co_region').value,
            ghana_post_gps:   document.getElementById('co_gps').value.trim(),
            landmark:         document.getElementById('co_landmark').value.trim(),
            notes:            document.getElementById('co_notes').value.trim(),
            payment_method:   paymentMethod,
            items:            getCart().map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
        };

        try {
            const data = await placeOrderRequest(baseUrl, customerToken, payload);

            // Success — clear cart
            clearCart();
            updateCartBadge();
            renderCart();
            closeCheckoutModal();
            showToast(`Order #${data.id} placed successfully!`);

        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.classList.remove('hidden');
        }
    });
};

/* =========================================================
   BIND FILTERS
   Debounced for search and price, instant for select changes
========================================================= */
export const bindFilters = () => {
    let filterDebounce;

    const onFilterChange = (debounced = false) => {
        clearTimeout(filterDebounce);
        const run = () => { currentPage = 1; loadProducts(); };
        if (debounced) {
            filterDebounce = setTimeout(run, 350);
        } else {
            run();
        }
    };

    document.getElementById('searchInput').addEventListener('input',  () => onFilterChange(true));
    document.getElementById('priceMin').addEventListener('input',     () => onFilterChange(true));
    document.getElementById('priceMax').addEventListener('input',     () => onFilterChange(true));
    document.getElementById('priceMinMob').addEventListener('input',  () => onFilterChange(true));
    document.getElementById('priceMaxMob').addEventListener('input',  () => onFilterChange(true));
    document.getElementById('sortSelect').addEventListener('change',  () => onFilterChange());

    document.getElementById('categorySelect').addEventListener('change', () => {
        // Sync pills with select
        const val = document.getElementById('categorySelect').value;
        document.querySelectorAll('.pill').forEach(p => {
            p.classList.toggle('on', p.dataset.category === val);
        });
        onFilterChange();
    });
};
