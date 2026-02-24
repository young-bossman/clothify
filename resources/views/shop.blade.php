<!DOCTYPE html>
<html lang="en" data-theme="dark" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Clothify — Shop</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
    @vite(['resources/css/app.css', 'resources/css/shop.css', 'resources/js/shop.js'])
</head>
<body class="bg-theme text-theme theme-transition overflow-x-hidden">

    {{-- =====================================================
         NAVBAR
    ====================================================== --}}
    <nav class="sticky top-0 z-[100] bg-theme border-b border-theme theme-transition">
        <div class="max-w-[1320px] mx-auto px-5 h-[58px] flex items-center justify-between gap-3">

            {{-- Logo --}}
            <a href="{{ route('shop') }}" class="font-display text-[1.65rem] font-semibold tracking-widest text-theme no-underline flex-shrink-0 theme-transition">
                Cloth<span class="text-accent">ify</span>
            </a>

            {{-- Desktop nav links --}}
            <ul class="hidden md:flex gap-8 list-none">
                <li><a href="#shop" class="text-[.72rem] font-medium tracking-[.14em] uppercase text-theme2 no-underline hover:text-theme transition-colors">Shop</a></li>
                <li><a href="#" class="text-[.72rem] font-medium tracking-[.14em] uppercase text-theme2 no-underline hover:text-theme transition-colors">New In</a></li>
                <li><a href="#" class="text-[.72rem] font-medium tracking-[.14em] uppercase text-theme2 no-underline hover:text-theme transition-colors">About</a></li>
            </ul>

            {{-- Right controls --}}
            <div class="flex items-center gap-[.65rem]">

                {{-- Theme switcher (desktop) --}}
                <div id="themeSwitcher" class="hidden sm:flex bg-theme2 border border-theme rounded-full p-[3px] gap-[2px] theme-transition">
                    <button class="t-btn w-[27px] h-[27px] rounded-full border-none bg-transparent cursor-pointer text-theme3 flex items-center justify-center transition-all" data-t="dark" title="Dark">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                    </button>
                    <button class="t-btn w-[27px] h-[27px] rounded-full border-none bg-transparent cursor-pointer text-theme3 flex items-center justify-center transition-all" data-t="dim" title="Dim">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="4"/></svg>
                    </button>
                    <button class="t-btn w-[27px] h-[27px] rounded-full border-none bg-transparent cursor-pointer text-theme3 flex items-center justify-center transition-all" data-t="light" title="Light">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/></svg>
                    </button>
                </div>

                {{-- Cart button --}}
                <button id="openCart" class="flex items-center gap-[.4rem] bg-transparent border border-theme rounded-lg py-[.38rem] px-[.8rem] text-theme font-sans text-[.75rem] cursor-pointer transition-all hover:border-accent flex-shrink-0 theme-transition">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                    <span class="hidden xs:inline">Cart</span>
                    <span id="cartBadge" class="bg-accent text-white text-[.58rem] font-bold w-[16px] h-[16px] rounded-full flex items-center justify-center">0</span>
                </button>

                {{-- Hamburger (mobile) --}}
                <button id="menuBtn" class="md:hidden bg-transparent border border-theme rounded-lg p-[.38rem] text-theme cursor-pointer">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <line x1="3" y1="12" x2="21" y2="12"/>
                        <line x1="3" y1="18" x2="21" y2="18"/>
                    </svg>
                </button>
            </div>
        </div>
    </nav>

    {{-- Mobile nav --}}
    <div id="mobileNav" class="hidden fixed top-[58px] left-0 right-0 bg-theme2 border-b border-theme z-[99] px-5 py-4 flex-col gap-[.85rem] theme-transition">
        <a href="#shop" class="text-[.82rem] font-medium tracking-[.1em] uppercase text-theme2 no-underline py-[.45rem] border-b border-theme hover:text-accent transition-colors" onclick="document.getElementById('mobileNav').classList.add('hidden')">Shop</a>
        <a href="#" class="text-[.82rem] font-medium tracking-[.1em] uppercase text-theme2 no-underline py-[.45rem] border-b border-theme hover:text-accent transition-colors">New In</a>
        <a href="#" class="text-[.82rem] font-medium tracking-[.1em] uppercase text-theme2 no-underline py-[.45rem] border-b border-theme hover:text-accent transition-colors">About</a>
        {{-- Theme toggle inside mobile nav --}}
        <div class="flex gap-[.45rem] pt-[.3rem]">
            <button class="mob-t-btn flex-1 py-[.42rem] border border-theme rounded-md bg-transparent cursor-pointer font-mono-dm text-[.62rem] tracking-[.1em] uppercase text-theme2 transition-all" data-t="dark">Dark</button>
            <button class="mob-t-btn flex-1 py-[.42rem] border border-theme rounded-md bg-transparent cursor-pointer font-mono-dm text-[.62rem] tracking-[.1em] uppercase text-theme2 transition-all" data-t="dim">Dim</button>
            <button class="mob-t-btn flex-1 py-[.42rem] border border-theme rounded-md bg-transparent cursor-pointer font-mono-dm text-[.62rem] tracking-[.1em] uppercase text-theme2 transition-all" data-t="light">Light</button>
        </div>
    </div>

    {{-- =====================================================
         HERO
    ====================================================== --}}
    <section class="grid md:grid-cols-[1.1fr_1fr] min-h-[calc(100vh-58px)]">

        {{-- Left --}}
        <div class="flex flex-col justify-center px-5 py-11 md:pl-16 md:pr-14">

            <div class="eyebrow-line font-mono-dm text-[.62rem] tracking-[.22em] uppercase text-accent flex items-center mb-[1.4rem]">
                New Collection 2025
            </div>

            <h1 class="font-display text-[clamp(2.6rem,4.8vw,5rem)] font-light leading-[1.06] mb-[1.2rem] text-theme">
                Dress with<br>
                <em class="italic text-accent">intention,</em><br>
                live in style.
            </h1>

            <p class="text-[.88rem] text-theme2 leading-[1.75] max-w-[340px] font-light mb-8">
                Curated fashion and accessories for those who believe
                clothing is a form of self-expression.
            </p>

            <div class="flex gap-3 flex-wrap">
                <button onclick="document.getElementById('shop').scrollIntoView({behavior:'smooth'})"
                    class="bg-accent text-white border-none py-3 px-6 font-sans text-[.75rem] font-medium tracking-[.1em] uppercase rounded cursor-pointer transition-all hover:-translate-y-px">
                    Shop Now
                </button>
                <button class="bg-transparent border border-bdr2 text-theme py-3 px-6 font-sans text-[.75rem] font-medium tracking-[.1em] uppercase rounded cursor-pointer transition-all hover:border-accent">
                    Lookbook
                </button>
            </div>

            <div class="flex gap-8 mt-12 pt-7 border-t border-theme flex-wrap">
                <div>
                    <div class="font-display text-[1.75rem] font-semibold leading-none text-theme" id="heroProductCount">—</div>
                    <div class="font-mono-dm text-[.62rem] tracking-[.1em] uppercase text-theme3 mt-[.2rem]">Products</div>
                </div>
                <div>
                    <div class="font-display text-[1.75rem] font-semibold leading-none text-theme" id="heroCategoryCount">—</div>
                    <div class="font-mono-dm text-[.62rem] tracking-[.1em] uppercase text-theme3 mt-[.2rem]">Categories</div>
                </div>
                <div>
                    <div class="font-display text-[1.75rem] font-semibold leading-none text-theme">GHS</div>
                    <div class="font-mono-dm text-[.62rem] tracking-[.1em] uppercase text-theme3 mt-[.2rem]">Local Currency</div>
                </div>
            </div>
        </div>

        {{-- Right — editorial mosaic (hidden on mobile) --}}
        <div class="hidden md:block bg-theme2 relative overflow-hidden theme-transition">
            <div class="hero-deco">C</div>
            <div class="absolute inset-8 grid grid-cols-[1.4fr_1fr] grid-rows-2 gap-2">
                <div class="bg-theme3 border border-theme rounded-md row-span-2 flex items-end p-3 theme-transition">
                    <span class="font-mono-dm text-[.56rem] tracking-[.14em] uppercase text-theme3 bg-theme py-[.2rem] px-[.48rem] rounded-sm theme-transition">SS '25</span>
                </div>
                <div class="bg-theme3 border border-theme rounded-md flex items-end p-3 theme-transition">
                    <span class="font-mono-dm text-[.56rem] tracking-[.14em] uppercase text-theme3 bg-theme py-[.2rem] px-[.48rem] rounded-sm theme-transition">Accessories</span>
                </div>
                <div class="bg-theme3 border border-theme rounded-md flex items-end p-3 theme-transition">
                    <span class="font-mono-dm text-[.56rem] tracking-[.14em] uppercase text-theme3 bg-theme py-[.2rem] px-[.48rem] rounded-sm theme-transition">New In</span>
                </div>
            </div>
        </div>
    </section>

    {{-- =====================================================
         CATEGORY PILLS
    ====================================================== --}}
    <div class="bg-theme2 border-b border-theme theme-transition">
        <div class="max-w-[1320px] mx-auto px-5 py-[.85rem] flex gap-[.45rem] overflow-x-auto scrollbar-none" id="pillBar" style="-webkit-overflow-scrolling:touch;scrollbar-width:none;">
            <button class="pill flex-shrink-0 py-[.4rem] px-[.95rem] border border-theme rounded-full text-[.7rem] font-medium text-theme2 bg-theme3 cursor-pointer whitespace-nowrap transition-all on" data-category="">All</button>
            {{-- More pills injected by JS from API --}}
        </div>
    </div>

    {{-- =====================================================
         SHOP SECTION
    ====================================================== --}}
    <section id="shop">
        <div class="max-w-[1320px] mx-auto px-5 pt-10 pb-20">

            {{-- Header --}}
            <div class="flex justify-between items-end mb-6 flex-wrap gap-1">
                <h2 class="font-display text-[clamp(1.5rem,3vw,2rem)] font-light text-theme">
                    The <em class="italic text-accent">Collection</em>
                </h2>
                <span id="prodCount" class="font-mono-dm text-[.62rem] tracking-[.1em] text-theme3 uppercase"></span>
            </div>

            {{-- Filter bar --}}
            <div class="bg-theme2 border border-theme rounded-[10px] p-[.85rem_1rem] flex gap-[.6rem] items-center flex-wrap mb-8 theme-transition">

                {{-- Search --}}
                <div class="flex-1 min-w-[150px] relative">
                    <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-theme3 w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                    </svg>
                    <input id="searchInput" type="text" placeholder="Search products…"
                        class="w-full bg-theme border border-theme rounded-[7px] py-2 pr-3 pl-9 font-sans text-[.82rem] text-theme placeholder-theme3 outline-none focus:border-accent theme-transition">
                </div>

                <div class="hidden md:block w-px h-[18px] bg-bdr flex-shrink-0"></div>

                {{-- Category --}}
                <select id="categorySelect" class="bg-theme border border-theme rounded-[7px] py-2 px-[.85rem] font-sans text-[.8rem] text-theme outline-none cursor-pointer transition-all focus:border-accent min-w-[125px] theme-transition md:flex-none flex-1">
                    <option value="">All Categories</option>
                    {{-- Populated by JS --}}
                </select>

                <div class="hidden md:block w-px h-[18px] bg-bdr flex-shrink-0"></div>

                {{-- Price range — desktop always visible --}}
                <div class="price-wrap hidden md:flex items-center gap-[.4rem]">
                    <span class="font-mono-dm text-[.65rem] text-theme3 whitespace-nowrap">GHS</span>
                    <input id="priceMin" type="number" placeholder="Min"
                        class="bg-theme border border-theme rounded-[7px] py-2 px-[.62rem] font-mono-dm text-[.72rem] text-theme outline-none w-[72px] transition-all focus:border-accent theme-transition">
                    <span class="font-mono-dm text-[.65rem] text-theme3">—</span>
                    <input id="priceMax" type="number" placeholder="Max"
                        class="bg-theme border border-theme rounded-[7px] py-2 px-[.62rem] font-mono-dm text-[.72rem] text-theme outline-none w-[72px] transition-all focus:border-accent theme-transition">
                </div>

                {{-- Price toggle button — mobile only --}}
                <button id="priceToggle" type="button"
                    class="price-toggle md:hidden flex items-center gap-[.45rem] bg-theme border border-theme rounded-[7px] py-2 px-[.85rem] font-mono-dm text-[.72rem] text-theme2 cursor-pointer w-full transition-all hover:border-accent theme-transition">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="4" y1="6" x2="20" y2="6"/>
                        <line x1="8" y1="12" x2="16" y2="12"/>
                        <line x1="11" y1="18" x2="13" y2="18"/>
                    </svg>
                    Price Range
                    <svg class="price-toggle-chevron" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M6 9l6 6 6-6"/>
                    </svg>
                </button>

                {{-- Expanded price row — mobile only --}}
                <div id="priceExpanded" class="hidden w-full items-center gap-[.4rem]">
                    <span class="font-mono-dm text-[.65rem] text-theme3 whitespace-nowrap flex-shrink-0">GHS</span>
                    <input id="priceMinMob" type="number" placeholder="Min"
                        class="flex-1 min-w-0 bg-theme border border-theme rounded-[7px] py-2 px-[.62rem] font-mono-dm text-[.72rem] text-theme outline-none transition-all focus:border-accent theme-transition">
                    <span class="font-mono-dm text-[.65rem] text-theme3 flex-shrink-0">—</span>
                    <input id="priceMaxMob" type="number" placeholder="Max"
                        class="flex-1 min-w-0 bg-theme border border-theme rounded-[7px] py-2 px-[.62rem] font-mono-dm text-[.72rem] text-theme outline-none transition-all focus:border-accent theme-transition">
                </div>

                <div class="hidden md:block w-px h-[18px] bg-bdr flex-shrink-0"></div>

                {{-- Sort --}}
                <select id="sortSelect" class="bg-theme border border-theme rounded-[7px] py-2 px-[.85rem] font-sans text-[.8rem] text-theme outline-none cursor-pointer transition-all focus:border-accent theme-transition md:min-w-[148px] md:flex-none flex-1">
                    <option value="created_at:desc">Newest First</option>
                    <option value="price:asc">Price: Low → High</option>
                    <option value="price:desc">Price: High → Low</option>
                    <option value="name:asc">Name: A → Z</option>
                </select>
            </div>

            {{-- Product grid --}}
            {{-- 1 col < 380px | 2 cols phones | 3 cols tablets | 4 cols desktop --}}
            <div id="productGrid"
                class="grid grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[.85rem] md:gap-4">
                {{-- Populated by JS --}}
            </div>

            {{-- Pagination --}}
            <div id="pagination" class="flex justify-center gap-[.4rem] mt-10 flex-wrap"></div>

        </div>
    </section>

    {{-- =====================================================
         FOOTER
    ====================================================== --}}
    <footer class="bg-theme2 border-t border-theme theme-transition">
        <div class="max-w-[1320px] mx-auto px-5 pt-11 pb-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-9">
            <div>
                <div class="font-display text-[1.45rem] font-semibold tracking-widest text-theme mb-[.5rem]">
                    Cloth<span class="text-accent">ify</span>
                </div>
                <p class="text-[.78rem] text-theme3 leading-[1.7]">
                    Fashion and accessories for those who wear their identity. Curated with intention.
                </p>
            </div>
            <div>
                <div class="font-mono-dm text-[.58rem] tracking-[.2em] uppercase text-theme3 mb-3">Shop</div>
                <ul class="list-none flex flex-col gap-[.42rem]">
                    <li><a href="#" class="text-[.78rem] text-theme2 no-underline hover:text-accent transition-colors">New Arrivals</a></li>
                    <li><a href="#" class="text-[.78rem] text-theme2 no-underline hover:text-accent transition-colors">Women</a></li>
                    <li><a href="#" class="text-[.78rem] text-theme2 no-underline hover:text-accent transition-colors">Men</a></li>
                    <li><a href="#" class="text-[.78rem] text-theme2 no-underline hover:text-accent transition-colors">Accessories</a></li>
                </ul>
            </div>
            <div>
                <div class="font-mono-dm text-[.58rem] tracking-[.2em] uppercase text-theme3 mb-3">Info</div>
                <ul class="list-none flex flex-col gap-[.42rem]">
                    <li><a href="#" class="text-[.78rem] text-theme2 no-underline hover:text-accent transition-colors">About Us</a></li>
                    <li><a href="#" class="text-[.78rem] text-theme2 no-underline hover:text-accent transition-colors">Shipping</a></li>
                    <li><a href="#" class="text-[.78rem] text-theme2 no-underline hover:text-accent transition-colors">Returns</a></li>
                    <li><a href="#" class="text-[.78rem] text-theme2 no-underline hover:text-accent transition-colors">FAQ</a></li>
                </ul>
            </div>
            <div>
                <div class="font-mono-dm text-[.58rem] tracking-[.2em] uppercase text-theme3 mb-3">Contact</div>
                <ul class="list-none flex flex-col gap-[.42rem]">
                    <li><a href="#" class="text-[.78rem] text-theme2 no-underline hover:text-accent transition-colors">Instagram</a></li>
                    <li><a href="#" class="text-[.78rem] text-theme2 no-underline hover:text-accent transition-colors">Twitter</a></li>
                    <li><a href="#" class="text-[.78rem] text-theme2 no-underline hover:text-accent transition-colors">Email Us</a></li>
                </ul>
            </div>
        </div>
        <div class="max-w-[1320px] mx-auto px-5 py-4 border-t border-theme flex justify-between flex-wrap gap-2 theme-transition">
            <span class="font-mono-dm text-[.62rem] text-theme3">© {{ date('Y') }} Clothify. All rights reserved.</span>
            <span class="font-mono-dm text-[.62rem] text-theme3">Made in Ghana 🇬🇭</span>
        </div>
    </footer>

    {{-- =====================================================
         PRODUCT DETAIL MODAL
    ====================================================== --}}
    <div id="productModal"
        class="fixed inset-0 bg-black/70 backdrop-blur-modal z-[200] flex items-center justify-center p-5 opacity-0 pointer-events-none transition-opacity duration-300">
        <div id="modalInner"
            class="bg-theme2 border border-bdr2 rounded-[14px] max-w-[780px] w-full max-h-[92vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 relative scale-[.98] translate-y-4 transition-all duration-300 theme-transition">

            <button id="modalClose"
                class="absolute top-3 right-3 w-[30px] h-[30px] rounded-full border border-theme bg-theme2 text-theme2 cursor-pointer flex items-center justify-center text-[.9rem] transition-all hover:border-accent hover:text-accent z-10 theme-transition">
                ✕
            </button>

            {{-- Image --}}
            <div id="modalImage"
                class="bg-theme3 rounded-[14px] md:rounded-r-none flex items-center justify-center min-h-[200px] md:min-h-[340px] theme-transition">
                <span class="font-display text-[7rem] font-light text-bdr2 opacity-40">C</span>
            </div>

            {{-- Info --}}
            <div class="p-7 flex flex-col">
                <div id="modalCategory" class="font-mono-dm text-[.58rem] tracking-[.2em] uppercase text-accent mb-[.4rem]"></div>
                <div id="modalName" class="font-display text-[1.7rem] font-light leading-[1.2] text-theme mb-[.25rem]"></div>
                <div id="modalSku" class="font-mono-dm text-[.58rem] text-theme3 tracking-[.1em] mb-4"></div>
                <div id="modalPrice" class="font-display text-[1.8rem] font-normal text-theme mb-[.85rem]"></div>
                <div id="modalStock" class="flex items-center gap-[.38rem] text-[.72rem] mb-[.9rem]"></div>
                <p id="modalDesc" class="text-[.8rem] text-theme2 leading-[1.75] flex-1 mb-6"></p>
                <button id="modalAddBtn"
                    class="w-full bg-accent text-white border-none py-[.85rem] font-sans text-[.75rem] font-medium tracking-[.12em] uppercase rounded-lg cursor-pointer transition-all hover:bg-ac2 hover:-translate-y-px disabled:bg-bdr disabled:text-theme3 disabled:cursor-not-allowed disabled:translate-y-0">
                    Add to Cart
                </button>
            </div>
        </div>
    </div>

    {{-- =====================================================
         CART DRAWER
    ====================================================== --}}
    <div id="cartOverlay" class="fixed inset-0 bg-black/45 backdrop-blur-cart z-[300] opacity-0 pointer-events-none transition-opacity duration-300"></div>

    <div id="cartDrawer"
        class="fixed top-0 right-0 bottom-0 w-full md:w-[360px] bg-theme2 border-l-0 md:border-l border-theme z-[301] flex flex-col translate-x-full transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)] theme-transition">

        <div class="px-5 pt-[1.1rem] pb-[.8rem] border-b border-theme flex items-center justify-between theme-transition">
            <div class="font-display text-[1.25rem] text-theme">Your Cart</div>
            <button id="closeCart" class="bg-transparent border border-theme rounded-md py-[.32rem] px-[.62rem] text-theme2 text-[.7rem] cursor-pointer transition-all hover:border-accent">Close</button>
        </div>

        <div id="cartBody" class="flex-1 overflow-y-auto px-5 py-[.85rem]"></div>

        <div class="px-5 pt-[.95rem] pb-[1rem] border-t border-theme theme-transition">
            <div class="flex justify-between items-center mb-[.8rem]">
                <span class="font-mono-dm text-[.68rem] uppercase tracking-[.1em] text-theme3">Total</span>
                <span id="cartTotal" class="font-display text-[1.3rem] text-theme">GHS 0.00</span>
            </div>
            <button class="w-full bg-accent text-white border-none py-[.85rem] font-sans text-[.73rem] font-medium tracking-[.12em] uppercase rounded-[7px] cursor-pointer transition-all hover:bg-ac2">
                Proceed to Checkout
            </button>
        </div>
    </div>

    {{-- =====================================================
         TOAST
    ====================================================== --}}
    <div id="toast"
        class="fixed bottom-8 left-1/2 -translate-x-1/2 translate-y-[60px] bg-theme3 border border-bdr2 rounded-full py-[.52rem] px-5 text-[.73rem] text-theme shadow-theme z-[9998] transition-transform duration-300 pointer-events-none whitespace-nowrap theme-transition">
    </div>




    
</body>
</html>