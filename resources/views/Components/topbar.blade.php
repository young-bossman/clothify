@php
    $breadcrumb = match (true) {
        request()->routeIs('dashboard') => 'Dashboard',
        request()->routeIs('products') => 'Products',
        request()->routeIs('orders') => 'Orders',
        default => 'Clothify',
    };
@endphp

<header class="sticky top-0 z-10 h-16 flex items-center justify-between gap-3 px-4 sm:px-6 border-b border-slate-800/80 bg-slate-925/90 backdrop-blur">

    <div class="flex items-center gap-3">
        <button id="sidebarToggle" type="button"
            class="lg:hidden -ml-2 p-2 rounded-lg text-slate-300 hover:bg-slate-800 transition focus-ring"
            aria-label="Toggle sidebar" aria-expanded="false" aria-controls="sidebar">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>

        <nav class="hidden sm:flex items-center gap-1.5 text-sm text-slate-500">
            <span>Clothify</span>
            <span>/</span>
            <span class="text-slate-200 font-medium">{{ $breadcrumb }}</span>
        </nav>
    </div>

    <div class="relative">
        <button id="profileToggle" type="button"
            class="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-slate-800 transition focus-ring">
            <span class="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            </span>
            <span class="userName hidden sm:block text-sm font-medium text-slate-200">Account</span>
            <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </button>

        <div id="profileDropdown"
            class="hidden absolute right-0 mt-2 w-44 rounded-lg border border-slate-800 bg-slate-850 py-1 shadow-lg shadow-black/40">
            <a href="#" class="block px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 transition">Profile</a>
            <button id="logoutBtnTop"
                class="w-full text-left px-3 py-2 text-sm text-rose-400 hover:bg-slate-800 transition">Logout</button>
        </div>
    </div>
</header>
