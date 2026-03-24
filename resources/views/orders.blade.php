<x-app title="Orders">

<div class="min-h-screen flex">

    <!-- Sidebar -->
    <aside class="w-64 bg-gray-800 p-6 flex-shrink-0">
        <h2 class="text-2xl font-bold text-indigo-400 mb-8">Clothify</h2>
        <nav class="space-y-4">
            <a href="{{ route('dashboard') }}" class="block text-gray-300 hover:text-white">Dashboard</a>
            <a href="{{ route('products') }}"  class="block text-gray-300 hover:text-white">Products</a>
            <a href="{{ route('orders') }}"    class="block text-white font-semibold">Orders</a>
            <a href="{{ route('shop') }}" class="block text-gray-300 hover:text-white">Online Shop</a>
            <button id="logoutBtn" class="mt-10 w-full text-left text-red-400 hover:text-red-500">Logout</button>
        </nav>
    </aside>

    <!-- Main -->
    <main class="flex-1 p-10 space-y-6">

        <div class="flex items-center justify-between">
            <h1 class="text-3xl font-bold">Orders</h1>
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap gap-4">
            <select id="filterStatus" class="bg-gray-800 border border-gray-700 rounded px-4 py-2 text-sm">
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
            </select>

            <select id="filterPayment" class="bg-gray-800 border border-gray-700 rounded px-4 py-2 text-sm">
                <option value="">All Payment Statuses</option>
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
            </select>
        </div>

        <!-- Orders Table -->
        <div class="bg-gray-800 rounded-xl shadow-lg overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead>
                    <tr class="text-gray-400 border-b border-gray-700">
                        <th class="py-3 px-4">Order</th>
                        <th class="py-3 px-4">Customer</th>
                        <th class="py-3 px-4">Amount</th>
                        <th class="py-3 px-4">Status</th>
                        <th class="py-3 px-4">Payment</th>
                        <th class="py-3 px-4">Date</th>
                        <th class="py-3 px-4">Actions</th>
                    </tr>
                </thead>
                <tbody id="ordersBody">
                    <tr><td colspan="7" class="text-center text-gray-400 py-6">Loading...</td></tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div id="pagination" class="flex gap-2 justify-end"></div>

    </main>
</div>

<!-- Order Detail Modal -->
<div id="orderModal" class="fixed inset-0 bg-black/60 hidden items-center justify-center z-50">
    <div class="bg-gray-800 rounded-xl p-8 w-full max-w-2xl mx-4 space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold" id="modalTitle">Order #</h2>
            <button id="closeModal" class="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>

        <div id="modalMeta" class="text-sm text-gray-400 space-y-1"></div>

        <div>
            <h3 class="font-semibold mb-2">Order Items</h3>
            <table class="w-full text-sm">
                <thead>
                    <tr class="text-gray-400 border-b border-gray-700">
                        <th class="py-2 text-left">Item</th>
                        <th class="py-2 text-left">Qty</th>
                        <th class="py-2 text-left">Price</th>
                        <th class="py-2 text-left">Subtotal</th>
                    </tr>
                </thead>
                <tbody id="modalItems"></tbody>
            </table>
        </div>

        <!-- Status Updates -->
        <div class="flex flex-wrap gap-4 pt-4 border-t border-gray-700">
            <div class="flex-1">
                <label class="block text-sm text-gray-400 mb-1">Order Status</label>
                <select id="modalStatus" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm">
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>
            <div class="flex-1">
                <label class="block text-sm text-gray-400 mb-1">Payment Status</label>
                <select id="modalPaymentStatus" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm">
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                </select>
            </div>
        </div>

        <div class="flex justify-between pt-2">
            <button id="saveStatus" class="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded text-sm font-semibold">
                Save Changes
            </button>
            <button id="deleteOrder" class="bg-red-700 hover:bg-red-800 px-4 py-2 rounded text-sm font-semibold">
                Delete Order
            </button>
        </div>
    </div>
</div>

@vite('resources/js/order.js')

</x-app>