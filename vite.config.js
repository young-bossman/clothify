import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input:  [
                'resources/css/app.css',
                'resources/css/shop.css',
                'resources/js/app.js',
                //'resources/js/dashboard.js',
                //'resources/js/products.js',
                //'resources/js/shop.js',
                'resources/js/order.js',
                'resources/js/products/main.js',
                'resources/js/dashboard/main.js',
                'resources/js/shop/main.js',
            ],
            refresh: true,
        }),
        tailwindcss(),
    ],
});
