<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ $title ?? 'Clothify' }}</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white">

    <div class="min-h-screen flex">
        {{-- LEFT BRAND SECTION --}}
        <div class="hidden lg:flex w-1/2 items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700">
            <div class="text-center px-10">
                <h1 class="text-5xl font-extrabold tracking-tight">Clothify</h1>
                <p class="mt-4 text-lg opacity-90">
                    Manage products, orders & profits effortlessly.
                </p>
            </div>
        </div>

        {{-- FORM SECTION --}}
        <div class="flex w-full lg:w-1/2 items-center justify-center">
            {{ $slot }}
        </div>
    </div>

</body>
</html>
