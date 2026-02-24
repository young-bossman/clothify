document.addEventListener('DOMContentLoaded', () => {

    const baseUrl = window.location.origin;

    /* =========================================================
       THEME SYSTEM
       Three modes: dark / dim / light
       Persisted in localStorage across sessions
    ========================================================= */
    const html       = document.documentElement;
    const allTBtns   = document.querySelectorAll('.t-btn, .mob-t-btn');
    const savedTheme = localStorage.getItem('clothify-theme') || 'dark';

    const setTheme = (theme) => {
        html.setAttribute('data-theme', theme);
        localStorage.setItem('clothify-theme', theme);
        allTBtns.forEach(btn => {
            btn.classList.toggle('on', btn.dataset.t === theme);
            // Active styling: highlight active button
            if (btn.dataset.t === theme) {
                btn.style.background = 'var(--ac)';
                btn.style.color = '#fff';
            } else {
                btn.style.background = '';
                btn.style.color = '';
            }
        });
    };

    setTheme(savedTheme);
    allTBtns.forEach(btn => btn.addEventListener('click', () => setTheme(btn.dataset.t)));

    /* =========================================================
       MOBILE NAV TOGGLE
    ========================================================= */
    const mobileNav = document.getElementById('mobileNav');
    document.getElementById('menuBtn').addEventListener('click', () => {
        mobileNav.classList.toggle('hidden');
        mobileNav.classList.toggle('flex');
    });

    /* =========================================================
       PRICE TOGGLE (mobile)
       Collapses/expands the price min/max row on small screens
    ========================================================= */
    const priceToggle   = document.getElementById('priceToggle');
    const priceExpanded = document.getElementById('priceExpanded');

    priceToggle?.addEventListener('click', () => {
        const isOpen = priceExpanded.classList.contains('flex');
        priceExpanded.classList.toggle('hidden', isOpen);
        priceExpanded.classList.toggle('flex', !isOpen);
        priceToggle.classList.toggle('active', !isOpen);
    });

    /* =========================================================
       TOAST
       Brief notification at the bottom of the screen
    ========================================================= */
    const toastEl = document.getElementById('toast');
    let toastTimer;

    const showToast = (message) => {
        toastEl.textContent = message;
        toastEl.classList.add('toast-enter');
        toastEl.classList.remove('translate-y-[60px]');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toastEl.classList.remove('toast-enter');
        }, 2800);
    };

    /* =========================================================
       CART STATE
       Persisted in localStorage so it survives page refresh
    ========================================================= */
    let cart = JSON.parse(localStorage.getItem('clothify-cart') || '[]');

    const saveCart = () => {
        localStorage.setItem('clothify-cart', JSON.stringify(cart));
    };

    const cartTotal = () => cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    const cartCount = () => cart.reduce((sum, i) => sum + i.qty, 0);

    const updateCartBadge = () => {
        document.getElementById('cartBadge').textContent = cartCount();
    };

    const addToCart = (product) => {
        const existing = cart.find(i => i.id === product.id);
        if (existing) {
            existing.qty++;
        } else {
            cart.push({
                id:    product.id,
                name:  product.name,
                price: parseFloat(product.price),
                image: product.image ?? null,
                qty:   1,
            });
        }
        saveCart();
        updateCartBadge();
        renderCart();
        showToast(`${product.name} added to cart`);
    };

    const removeFromCart = (id) => {
        cart = cart.filter(i => i.id !== id);
        saveCart();
        updateCartBadge();
        renderCart();
    };

    const changeQty = (id, delta) => {
        const item = cart.find(i => i.id === id);
        if (!item) return;
        item.qty += delta;
        if (item.qty <= 0) {
            removeFromCart(id);
        } else {
            saveCart();
            updateCartBadge();
            renderCart();
        }
    };

    // Expose to window for inline onclick handlers in rendered HTML
    window.removeFromCart = removeFromCart;
    window.changeQty      = changeQty;

    /* =========================================================
       RENDER CART
    ========================================================= */
    const renderCart = () => {
        const body    = document.getElementById('cartBody');
        const totalEl = document.getElementById('cartTotal');

        totalEl.textContent = `GHS ${cartTotal().toFixed(2)}`;

        if (!cart.length) {
            body.innerHTML = `
                <div class="h-full flex flex-col items-center justify-center gap-2 text-theme3">
                    <div class="font-display text-[2.6rem]">∅</div>
                    <p class="text-[.78rem]">Your cart is empty</p>
                </div>`;
            return;
        }

        body.innerHTML = cart.map(item => {
            const imgHtml = item.image
                ? `<img src="${baseUrl}/storage/${item.image}" alt="${item.name}" class="w-full h-full object-cover">`
                : `<span class="font-display text-[1.2rem] text-bdr2">${item.name.charAt(0)}</span>`;

            return `
                <div class="grid gap-3 py-3 border-b border-theme theme-transition" style="grid-template-columns:48px 1fr auto;align-items:center;">
                    <div class="w-[48px] h-[60px] bg-theme3 rounded-[5px] flex items-center justify-center overflow-hidden flex-shrink-0 theme-transition">
                        ${imgHtml}
                    </div>
                    <div>
                        <div class="font-display text-[.92rem] leading-[1.3] text-theme mb-[.15rem]">${item.name}</div>
                        <div class="font-mono-dm text-[.68rem] text-accent mb-[.28rem]">GHS ${item.price.toFixed(2)}</div>
                        <div class="flex items-center gap-[.28rem]">
                            <button onclick="changeQty(${item.id}, -1)"
                                class="w-[19px] h-[19px] border border-theme bg-transparent text-theme rounded cursor-pointer flex items-center justify-center text-[.8rem] hover:border-accent transition-colors">−</button>
                            <span class="font-mono-dm text-[.72rem] text-theme min-w-[15px] text-center">${item.qty}</span>
                            <button onclick="changeQty(${item.id}, +1)"
                                class="w-[19px] h-[19px] border border-theme bg-transparent text-theme rounded cursor-pointer flex items-center justify-center text-[.8rem] hover:border-accent transition-colors">+</button>
                        </div>
                    </div>
                    <button onclick="removeFromCart(${item.id})"
                        class="bg-transparent border-none text-theme3 cursor-pointer text-[.65rem] p-1 self-start hover:text-red-400 transition-colors">✕</button>
                </div>`;
        }).join('');
    };

    /* =========================================================
       CART DRAWER OPEN / CLOSE
    ========================================================= */
    const cartOverlay = document.getElementById('cartOverlay');
    const cartDrawer  = document.getElementById('cartDrawer');

    const openCart = () => {
        cartOverlay.classList.remove('opacity-0', 'pointer-events-none');
        cartOverlay.classList.add('opacity-100');
        cartDrawer.classList.remove('translate-x-full');
    };

    const closeCart = () => {
        cartOverlay.classList.add('opacity-0', 'pointer-events-none');
        cartOverlay.classList.remove('opacity-100');
        cartDrawer.classList.add('translate-x-full');
    };

    document.getElementById('openCart').addEventListener('click', openCart);
    document.getElementById('closeCart').addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    /* =========================================================
       PRODUCT MODAL
    ========================================================= */
    const modalOverlay = document.getElementById('productModal');
    const modalInner   = document.getElementById('modalInner');
    let   currentProduct = null;

    const openModal = (product) => {
        currentProduct = product;

        // Image
        const imageEl = document.getElementById('modalImage');
        imageEl.innerHTML = product.image
            ? `<img src="${baseUrl}/storage/${product.image}" alt="${product.name}" class="w-full h-full object-cover rounded-[14px] md:rounded-r-none">`
            : `<span class="font-display text-[7rem] font-light text-bdr2 opacity-40">${product.name.charAt(0).toUpperCase()}</span>`;

        document.getElementById('modalCategory').textContent = product.category?.name ?? 'Uncategorised';
        document.getElementById('modalName').textContent     = product.name;
        document.getElementById('modalSku').textContent      = `SKU: ${product.sku}`;
        document.getElementById('modalPrice').innerHTML      = `<small class="font-mono-dm text-[.72rem] text-theme2">GHS</small> ${parseFloat(product.price).toFixed(2)}`;
        document.getElementById('modalDesc').textContent     = product.description || 'No description available.';

        // Stock status
        const stockEl = document.getElementById('modalStock');
        const addBtn  = document.getElementById('modalAddBtn');
        const qty     = product.stock_quantity ?? 0;

        if (qty <= 0) {
            stockEl.innerHTML = `<span class="w-[7px] h-[7px] rounded-full bg-red-400 flex-shrink-0"></span><span class="text-red-400">Out of stock</span>`;
            addBtn.disabled   = true;
            addBtn.textContent = 'Out of Stock';
        } else if (qty < 5) {
            stockEl.innerHTML = `<span class="w-[7px] h-[7px] rounded-full bg-yellow-400 flex-shrink-0"></span><span class="text-yellow-400">Only ${qty} left</span>`;
            addBtn.disabled   = false;
            addBtn.textContent = 'Add to Cart';
        } else {
            stockEl.innerHTML = `<span class="w-[7px] h-[7px] rounded-full bg-green-400 flex-shrink-0"></span><span class="text-green-400">In stock</span>`;
            addBtn.disabled   = false;
            addBtn.textContent = 'Add to Cart';
        }

        // Show modal
        modalOverlay.classList.remove('opacity-0', 'pointer-events-none');
        modalOverlay.classList.add('opacity-100');
        modalInner.classList.remove('scale-[.98]', 'translate-y-4');
    };

    const closeModal = () => {
        modalOverlay.classList.add('opacity-0', 'pointer-events-none');
        modalOverlay.classList.remove('opacity-100');
        modalInner.classList.add('scale-[.98]', 'translate-y-4');
        currentProduct = null;
    };

    document.getElementById('modalClose').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
    document.getElementById('modalAddBtn').addEventListener('click', () => {
        if (currentProduct) {
            addToCart(currentProduct);
            closeModal();
        }
    });

    /* =========================================================
       CATEGORIES
       Fetches categories from the API and populates the pill bar
       and the category dropdown filter
    ========================================================= */
    let categories = [];

    const loadCategories = async () => {
        try {
            const res  = await fetch(`${baseUrl}/api/v1/categories`, {
                headers: { Accept: 'application/json' }
            });

            if (!res.ok) return;

            categories = await res.json();

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
                btn.className    = 'pill flex-shrink-0 py-[.4rem] px-[.95rem] border border-theme rounded-full text-[.7rem] font-medium text-theme2 bg-theme3 cursor-pointer whitespace-nowrap transition-all';
                btn.textContent  = cat.name;
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
       PRODUCTS
    ========================================================= */
    let currentPage = 1;

    // Cache fetched products by ID to avoid re-fetching on card click
    const productCache = {};

    const buildQuery = () => {
        const params = new URLSearchParams();

        const search    = document.getElementById('searchInput').value.trim();
        const category  = document.getElementById('categorySelect').value;
        const sort      = document.getElementById('sortSelect').value;
        const [sortBy, sortDir] = sort.split(':');

        // Price — read from whichever inputs are visible
        const priceMin = document.getElementById('priceMin').value
            || document.getElementById('priceMinMob').value;
        const priceMax = document.getElementById('priceMax').value
            || document.getElementById('priceMaxMob').value;

        if (search)    params.append('search',      search);
        if (category)  params.append('category_id', category);
        if (sortBy)    params.append('sort_by',     sortBy);
        if (sortDir)   params.append('sort_dir',    sortDir);
        if (priceMin)  params.append('price_min',   priceMin);
        if (priceMax)  params.append('price_max',   priceMax);

        // Tell the backend we're on the public storefront
        // so it only returns active products
        params.append('public', '1');
        params.append('page',   currentPage);

        return params.toString();
    };

    const loadProducts = async () => {
        const grid = document.getElementById('productGrid');

        // Loading state
        grid.innerHTML = `
            <div class="col-span-full py-16 text-center">
                <div class="w-8 h-8 border-2 border-bdr border-t-accent rounded-full animate-spin mx-auto mb-3"></div>
                <div class="font-display text-[1.2rem] font-light text-theme2">Loading collection…</div>
            </div>`;

        try {
            const res = await fetch(
                `${baseUrl}/api/v1/products?${buildQuery()}`,
                { headers: { Accept: 'application/json' } }
            );

            if (!res.ok) throw new Error('Failed to fetch products');

            const json     = await res.json();
            const products = json.data ?? [];

            // Update hero product count on unfiltered first load
            if (currentPage === 1 && !document.getElementById('searchInput').value) {
                document.getElementById('heroProductCount').textContent =
                    json.total ?? products.length;
            }

            // Update result count label
            document.getElementById('prodCount').textContent =
                `Showing ${products.length} of ${json.total} products`;

            // Cache products for quick modal open
            products.forEach(p => { productCache[p.id] = p; });

            if (!products.length) {
                grid.innerHTML = `
                    <div class="col-span-full py-16 text-center">
                        <div class="font-display text-[2.5rem] text-bdr2 mb-2">∅</div>
                        <div class="font-display text-[1.3rem] font-light text-theme2">No products found</div>
                        <div class="text-[.78rem] text-theme3 mt-1">Try adjusting your search or filters</div>
                    </div>`;
                document.getElementById('pagination').innerHTML = '';
                return;
            }

            grid.innerHTML = products.map((p, i) => {
                const imageHtml = p.image
                    ? `<img src="${baseUrl}/storage/${p.image}" alt="${p.name}" loading="lazy" class="w-full h-full object-cover">`
                    : `<div class="w-full h-full flex items-center justify-center" style="background:linear-gradient(135deg,var(--bg2) 0%,var(--bg3) 100%)">
                           <span class="font-display text-[3.5rem] font-light opacity-60" style="color:var(--bdr2)">${p.name.charAt(0).toUpperCase()}</span>
                       </div>`;

                const qty = p.stock_quantity ?? 0;

                const stockHtml = qty <= 0
                    ? `<span class="text-[.62rem] text-red-400">Out of stock</span>`
                    : qty < 5
                    ? `<span class="text-[.62rem] text-yellow-400">Only ${qty} left</span>`
                    : `<span class="text-[.62rem] text-green-400">In stock</span>`;

                const badgeHtml = qty <= 0
                    ? ''
                    : p.created_at && new Date(p.created_at) > new Date(Date.now() - 7 * 86400000)
                    ? `<span class="absolute top-[.55rem] left-[.55rem] font-mono-dm text-[.54rem] tracking-[.1em] uppercase py-[.18rem] px-[.48rem] rounded-sm bg-accent text-white">New</span>`
                    : qty < 5
                    ? `<span class="absolute top-[.55rem] left-[.55rem] font-mono-dm text-[.54rem] tracking-[.1em] uppercase py-[.18rem] px-[.48rem] rounded-sm" style="background:#78350f;color:#fcd34d">Low</span>`
                    : '';

                const quickAddHtml = qty > 0
                    ? `<button class="quick-add absolute bottom-0 left-0 right-0 bg-accent text-white border-none py-[.58rem] font-sans text-[.65rem] font-medium tracking-[.1em] uppercase cursor-pointer"
                           onclick="event.stopPropagation(); quickAdd(${p.id})">
                           + Quick Add
                       </button>`
                    : '';

                // Stagger card entrance animation
                const delay = `${(i % 12) * 0.04}s`;

                return `
                    <div class="product-card bg-theme2 border border-theme rounded-[10px] overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-[3px] hover:shadow-theme hover:border-bdr2 theme-transition"
                         style="animation:fadeInUp .45s ease both;animation-delay:${delay}"
                         onclick="openProduct(${p.id})">
                        <div class="aspect-[3/4] bg-theme3 relative overflow-hidden flex items-center justify-center theme-transition">
                            ${imageHtml}
                            ${badgeHtml}
                            ${quickAddHtml}
                        </div>
                        <div class="p-[.75rem_.85rem_.9rem]">
                            <div class="font-mono-dm text-[.56rem] tracking-[.15em] uppercase text-theme3 mb-[.22rem]">${p.category?.name ?? ''}</div>
                            <div class="font-display text-[1rem] font-normal leading-[1.3] text-theme mb-[.45rem]">${p.name}</div>
                            <div class="flex justify-between items-center">
                                <span class="font-mono-dm text-[.78rem] text-accent font-medium">GHS ${parseFloat(p.price).toFixed(2)}</span>
                                ${stockHtml}
                            </div>
                        </div>
                    </div>`;
            }).join('');

            renderPagination(json);

        } catch (err) {
            grid.innerHTML = `
                <div class="col-span-full py-16 text-center">
                    <div class="font-display text-[2.5rem] text-bdr2 mb-2">!</div>
                    <div class="font-display text-[1.3rem] font-light text-theme2">Could not load products</div>
                    <div class="text-[.78rem] text-theme3 mt-1">Check your connection and try again</div>
                </div>`;
            console.error('Failed to load products:', err);
        }
    };

    /* =========================================================
       OPEN PRODUCT (card click)
       Uses cache if available, otherwise fetches from API
    ========================================================= */
    window.openProduct = async (id) => {
        try {
            let product = productCache[id];
            if (!product) {
                const res = await fetch(`${baseUrl}/api/v1/products/${id}`, {
                    headers: { Accept: 'application/json' }
                });
                product = await res.json();
                productCache[id] = product;
            }
            openModal(product);
        } catch (err) {
            showToast('Could not load product details');
        }
    };

    /* =========================================================
       QUICK ADD (hover button on card)
       Uses cache so it never makes an extra API call
    ========================================================= */
    window.quickAdd = async (id) => {
        try {
            let product = productCache[id];
            if (!product) {
                const res = await fetch(`${baseUrl}/api/v1/products/${id}`, {
                    headers: { Accept: 'application/json' }
                });
                product = await res.json();
                productCache[id] = product;
            }
            addToCart(product);
        } catch (err) {
            showToast('Could not add to cart');
        }
    };

    /* =========================================================
       PAGINATION
    ========================================================= */
    const renderPagination = (json) => {
        const container = document.getElementById('pagination');
        container.innerHTML = '';

        if (json.last_page <= 1) return;

        for (let i = 1; i <= json.last_page; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.className   = `py-[.4rem] px-[.85rem] rounded-md border font-mono-dm text-[.7rem] cursor-pointer transition-all ${
                i === json.current_page
                    ? 'bg-accent border-accent text-white'
                    : 'bg-theme2 border-theme text-theme2 hover:border-accent hover:text-accent'
            }`;
            btn.addEventListener('click', () => {
                currentPage = i;
                loadProducts();
                document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
            });
            container.appendChild(btn);
        }
    };

    /* =========================================================
       FILTER LISTENERS
       Debounced for search and price, instant for select changes
    ========================================================= */
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

    document.getElementById('searchInput').addEventListener('input', () => onFilterChange(true));
    document.getElementById('priceMin').addEventListener('input', () => onFilterChange(true));
    document.getElementById('priceMax').addEventListener('input', () => onFilterChange(true));
    document.getElementById('priceMinMob').addEventListener('input', () => onFilterChange(true));
    document.getElementById('priceMaxMob').addEventListener('input', () => onFilterChange(true));
    document.getElementById('categorySelect').addEventListener('change', () => {
        // Sync pills with select
        const val = document.getElementById('categorySelect').value;
        document.querySelectorAll('.pill').forEach(p => {
            p.classList.toggle('on', p.dataset.category === val);
        });
        onFilterChange();
    });
    document.getElementById('sortSelect').addEventListener('change', () => onFilterChange());

    /* Pill active style — injected dynamically via JS */
    const pillStyle = document.createElement('style');
    pillStyle.textContent = `.pill.on { border-color:var(--ac); color:var(--ac); background:var(--acg); }`;
    document.head.appendChild(pillStyle);

    /* Card entrance animation */
    const animStyle = document.createElement('style');
    animStyle.textContent = `
        @keyframes fadeInUp {
            from { opacity:0; transform:translateY(18px); }
            to   { opacity:1; transform:translateY(0); }
        }`;
    document.head.appendChild(animStyle);

    /* =========================================================
       INITIAL LOAD
    ========================================================= */
    updateCartBadge();
    renderCart();
    loadCategories();
    loadProducts();






    
});