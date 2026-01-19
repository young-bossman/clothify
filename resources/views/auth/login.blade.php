<x-auth title="Login">
    <div class="w-full max-w-md px-6">

        <h2 class="text-3xl font-bold mb-2">Welcome back</h2>
        <p class="text-gray-400 mb-8">Login to manage your store</p>

        <form id="loginForm" class="space-y-6">

            <div>
                <label class="block mb-1 text-sm">Email</label>
                <input
                    type="email"
                    name="email"
                    required
                    class="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
            </div>

            <div>
                <label class="block mb-1 text-sm">Password</label>
                <input
                    type="password"
                    name="password"
                    required
                    class="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
            </div>

            <button
                type="submit"
                class="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition font-semibold"
            >
                Login
            </button>

            <p class="text-center text-sm text-gray-400">
                Don’t have an account?
                <a href="/register" class="text-indigo-400 hover:underline">Register</a>
            </p>
        </form>

        <p id="loginError" class="mt-4 text-sm text-red-500 hidden"></p>

    </div>
</x-auth>
