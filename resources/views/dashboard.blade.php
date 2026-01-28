<x-app title="Dashboard">

<div class="min-h-screen flex">

    <!-- Sidebar -->
    <aside class="w-64 bg-gray-800 p-6">
        <h2 class="text-2xl font-bold text-indigo-400 mb-8">
            Clothify
        </h2>

        <nav class="space-y-4">
            <a href="{{ route('dashboard') }}" class="block text-gray-300 hover:text-white">
                Dashboard
            </a>

            <a href="{{ route('products') }}" class="block text-gray-300 hover:text-white">
                Products
            </a>

            <a href="#" class="block text-gray-300 hover:text-white">
                Orders
            </a>

            <button
                id="logoutBtn"
                class="mt-10 w-full text-left text-red-400 hover:text-red-500"
            >
                Logout
            </button>
        </nav>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-10 space-y-6">

        <!-- Top Bar -->
        <div class="flex justify-end">
            <div class="relative">
                <button id="profileToggle" class="flex items-center space-x-2">
                    <span class="userName font-semibold">Loading...</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M19 9l-7 7-7-7"/>
                    </svg>
                </button>

                <div
                    id="profileDropdown"
                    class="absolute right-0 mt-2 w-40 bg-gray-800 rounded shadow-lg hidden"
                >
                    <a href="#" class="block px-4 py-2 hover:bg-gray-700">
                        Profile
                    </a>

                    <button
                        id="logoutBtnTop"
                        class="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>

        <!-- Dashboard Overview -->
        <div class="bg-gray-800 rounded-xl p-8 shadow-lg">
            <h1 class="text-3xl font-bold mb-2">
                Welcome, <span class="userName">Loading...</span>
            </h1>

            <p class="text-gray-400 mb-6">
                Manage your store from here
            </p>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-gray-900 p-6 rounded-lg">
                    <h3 class="text-lg font-semibold">Products</h3>
                    <p class="text-2xl mt-2" id="productCount">0</p>
                </div>

                <div class="bg-gray-900 p-6 rounded-lg">
                    <h3 class="text-lg font-semibold">Orders</h3>
                    <p class="text-2xl mt-2">0</p>
                </div>

                <div class="bg-gray-900 p-6 rounded-lg">
                    <h3 class="text-lg font-semibold">Revenue</h3>
                    <p class="text-2xl mt-2">GHS 0.00</p>
                </div>
            </div>
        </div>

    </main>
</div>

@vite('resources/js/dashboard.js')

</x-app>
