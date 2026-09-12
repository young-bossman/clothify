@php
    $navBase = 'flex items-center gap-3 px-3 py-2 rounded-lg transition focus-ring';
    $navActive = 'bg-indigo-500/15 text-indigo-300 font-medium';
    $navIdle = 'text-slate-300 hover:bg-slate-800 hover:text-white';

    $settingsLinks = [
        'Payments' => 'M17 9V7a5 5 0 00-10 0v2M5 9h14l1 12H4L5 9z',
        'Shipping' => 'M3 7h13l4 4v6a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1z',
        'Tax' => 'M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z',
        'Users & Roles' => 'M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-5.13a4 4 0 11-8 0 4 4 0 018 0zm6 0a4 4 0 11-8 0 4 4 0 018 0z',
        'Security' => 'M12 1l8 4v6c0 5-3.4 9.4-8 10.5C7.4 20.4 4 16 4 11V5l8-4z',
        'Inventory' => 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0l-2 5H6l-2-5m16 0H4',
    ];
@endphp

<div id="sidebarOverlay" class="fixed inset-0 bg-black/50 z-20 hidden lg:hidden"></div>

{{-- lg:sticky + an explicit h-dvh: as a flex child the aside would otherwise
     stretch to the full page height and scroll away with the content, taking
     the logout button with it. The height is what gives sticky something to
     pin. Below lg the drawer rules take over and shell.js owns `collapsed`. --}}
<aside id="sidebar"
    class="sidebar collapsed fixed lg:sticky top-0 lg:top-0 left-0 z-30 w-64 h-dvh shrink-0 flex flex-col bg-slate-925 border-r border-slate-800/80">

    {{-- Brand and logout are pinned; only the nav between them scrolls. --}}
    <div class="h-16 shrink-0 flex items-center gap-2 px-5 border-b border-slate-800/80">
        <div class="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">C</div>
        <span class="text-lg font-bold text-white tracking-tight">Clothify</span>
    </div>

    {{-- min-h-0 is load-bearing: a flex child defaults to min-height:auto and
         refuses to shrink below its content, so the scrollbar never appears. --}}
    <div class="flex-1 min-h-0 overflow-y-auto">
        <nav class="px-3 py-4 space-y-0.5 text-sm">
            <a href="{{ route('dashboard') }}" class="{{ $navBase }} {{ request()->routeIs('dashboard') ? $navActive : $navIdle }}">
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                Dashboard
            </a>
            <a href="{{ route('products') }}" class="{{ $navBase }} {{ request()->routeIs('products') ? $navActive : $navIdle }}">
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                Products
            </a>
            <a href="{{ route('orders') }}" class="{{ $navBase }} {{ request()->routeIs('orders') ? $navActive : $navIdle }}">
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 2a1 1 0 00-1 1v1H6a2 2 0 00-2 2v13a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2V3a1 1 0 00-1-1H9z"/></svg>
                Orders
            </a>
            <a href="{{ route('shop') }}" class="{{ $navBase }} {{ request()->routeIs('shop') ? $navActive : $navIdle }}">
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h18v18H3V3zm4 4h10M7 12h10M7 17h6"/></svg>
                Online Shop
            </a>

            <div class="pt-4 mt-4 border-t border-slate-800/80">
                <p class="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Settings</p>
                @foreach ($settingsLinks as $label => $icon)
                    <span aria-disabled="true" title="Not available yet"
                        class="{{ $navBase }} text-slate-600 cursor-not-allowed select-none">
                        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{{ $icon }}"/></svg>
                        {{ $label }}
                    </span>
                @endforeach
            </div>
        </nav>
    </div>

    <div class="shrink-0 p-3 border-t border-slate-800/80">
        <button id="logoutBtn"
            class="w-full {{ $navBase }} text-rose-400 hover:bg-rose-500/10 text-sm font-medium">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 5v1a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h6a2 2 0 012 2v1"/></svg>
            Logout
        </button>
    </div>
</aside>
