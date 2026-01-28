<x-app title="Store">

<div class="max-w-7xl mx-auto p-8">

    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold">Clothify Store</h1>
        <div class="space-x-4">
            <a href="/login" class="text-gray-300 hover:text-white">Login</a>
            <a href="/register" class="text-indigo-400 hover:underline">Register</a>
        </div>
    </div>

    <!-- Products -->
    <div id="productGrid"
         class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    </div>

    <p id="emptyState"
       class="hidden text-center text-gray-400 mt-10">
        No products available.
    </p>

</div>

@vite('resources/js/storefront.js')
</x-app>
