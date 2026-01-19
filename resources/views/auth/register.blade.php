<x-auth title="Register">
    <div class="w-full max-w-md px-6">

        <h2 class="text-3xl font-bold mb-2">Create account</h2>
        <p class="text-gray-400 mb-8">Start selling and shopping smarter</p>

        <form id="registerForm" class="space-y-6">

            <div>
                <label class="block mb-1 text-sm">Name</label>
                <input
                    type="text"
                    name="name"
                    required
                    class="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
            </div>

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

            <div>
                <label class="block mb-1 text-sm">Confirm Password</label>
                <input
                    type="password"
                    name="password_confirmation"
                    required
                    class="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
            </div>

            <button
                type="submit"
                class="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition font-semibold"
            >
                Create account
            </button>

            <p class="text-center text-sm text-gray-400">
                Already have an account?
                <a href="/login" class="text-indigo-400 hover:underline">Login</a>
            </p>
        </form>

        <p id="registerError" class="mt-4 text-sm text-red-500 hidden"></p>

    </div>
</x-auth>
