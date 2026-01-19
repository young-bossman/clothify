<x-app title="Dashboard">
    

    <div class="min-h-screen flex">

        <!-- Sidebar -->
        <aside class="w-64 bg-gray-800 p-6">
            <h2 class="text-2xl font-bold text-indigo-400 mb-8">
                Clothify
            </h2>

            <nav class="space-y-4">
                <a href="/dashboard" class="block text-gray-300 hover:text-white">
                    Dashboard
                </a>
                <a href="#" class="block text-gray-300 hover:text-white">
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
        <main class="flex-1 p-10">
            <div class="bg-gray-800 rounded-xl p-8 shadow-lg">
                <h1 class="text-3xl font-bold mb-2">
                    Welcome, <span id="userName">Loading...</span>
                </h1>

                <p class="text-gray-400 mb-6">
                    Manage your store from here
                </p>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-gray-900 p-6 rounded-lg">
                        <h3 class="text-lg font-semibold">Products</h3>
                        <p class="text-2xl mt-2">0</p>
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
 <!-- Include the dashboard.js via Vite -->
    @vite('resources/js/dashboard.js')



</x-app>
