<x-app title="Dashboard">

<div class="min-h-screen flex">

    <x-sidebar />

    <div class="flex-1 min-w-0">

        <x-topbar />

        <main class="p-4 sm:p-6 max-w-[1400px] space-y-6">

            <div class="fade-in">
                <h1 class="text-2xl font-bold text-white">Welcome, <span class="userName">Loading...</span></h1>
                <p class="text-sm text-slate-400 mt-1">Here's what's happening with your store today.</p>
            </div>

            <!-- Stat Cards -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 fade-in">
                <div class="bg-slate-850 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition">
                    <div class="flex items-center justify-between">
                        <p class="text-xs text-slate-400 font-medium">Products</p>
                        <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                    </div>
                    <p id="productCount" class="text-2xl font-bold text-white mt-2">—</p>
                </div>

                <div class="bg-slate-850 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition">
                    <div class="flex items-center justify-between">
                        <p class="text-xs text-slate-400 font-medium">Orders</p>
                        <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 2a1 1 0 00-1 1v1H6a2 2 0 00-2 2v13a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2V3a1 1 0 00-1-1H9z"/></svg>
                    </div>
                    <p id="orderCount" class="text-2xl font-bold text-white mt-2">—</p>
                </div>

                <div class="bg-slate-850 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition">
                    <div class="flex items-center justify-between">
                        <p class="text-xs text-slate-400 font-medium">Revenue</p>
                        <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 10v2"/></svg>
                    </div>
                    <p id="revenue" class="text-2xl font-bold text-white mt-2">—</p>
                </div>

                <div class="bg-slate-850 border border-amber-800/40 rounded-xl p-4 hover:border-amber-700/60 transition">
                    <div class="flex items-center justify-between">
                        <p class="text-xs text-slate-400 font-medium">Low Stock</p>
                        <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3.75m0 3.75h.008M4.062 19h15.876c1.05 0 1.706-1.14 1.18-2.05L13.18 4.05c-.525-.91-1.836-.91-2.36 0L2.882 16.95c-.525.91.13 2.05 1.18 2.05z"/></svg>
                    </div>
                    <p id="lowStockCount" class="text-2xl font-bold text-amber-400 mt-2">—</p>
                    <p class="text-[11px] text-slate-500 mt-1">Needs attention</p>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-5 gap-4 fade-in">

                <!-- Low Stock Alerts -->
                <div class="lg:col-span-2 bg-slate-850 border border-slate-800 rounded-xl p-4 sm:p-5">
                    <div class="flex items-center gap-2 mb-4">
                        <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3.75m0 3.75h.008M4.062 19h15.876c1.05 0 1.706-1.14 1.18-2.05L13.18 4.05c-.525-.91-1.836-.91-2.36 0L2.882 16.95c-.525.91.13 2.05 1.18 2.05z"/></svg>
                        <h2 class="font-semibold text-white text-sm">Low Stock Alerts</h2>
                    </div>
                    <div id="lowStockList" class="text-sm">
                        <p class="text-slate-500 text-sm">Loading...</p>
                    </div>
                </div>

                <!-- Recent Orders -->
                <div class="lg:col-span-3 bg-slate-850 border border-slate-800 rounded-xl p-4 sm:p-5">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="font-semibold text-white text-sm">Recent Orders</h2>
                        <a href="{{ route('orders') }}" class="focus-ring text-xs text-indigo-400 hover:text-indigo-300 font-medium">View all</a>
                    </div>
                    <div class="overflow-x-auto -mx-1">
                        <table class="w-full text-sm">
                            <thead class="text-slate-500 text-xs uppercase tracking-wide">
                                <tr>
                                    <th class="text-left px-1 py-2 font-medium">Order</th>
                                    <th class="text-left px-1 py-2 font-medium">Customer</th>
                                    <th class="text-left px-1 py-2 font-medium">Amount</th>
                                    <th class="text-left px-1 py-2 font-medium">Status</th>
                                    <th class="text-left px-1 py-2 font-medium">Date</th>
                                </tr>
                            </thead>
                            <tbody id="recentOrdersBody">
                                <tr><td colspan="5" class="text-center text-slate-500 py-4">Loading...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </main>
    </div>
</div>

@vite('resources/js/dashboard/main.js')

</x-app>
