<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ $title ?? 'Clothify' }}</title>
    @vite('resources/css/app.css')
</head>
<body class="bg-gray-900 text-white min-h-screen">

    {{ $slot }}

    @vite('resources/js/app.js')
</body>
</html>
