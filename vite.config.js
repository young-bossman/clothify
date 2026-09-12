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
                'resources/js/order.js',
                'resources/js/products/main.js',
                'resources/js/dashboard/main.js',
                'resources/js/shop/main.js',
            ],
            refresh: true,
        }),
        tailwindcss(),
    ],

    // Runs inside the node container against a Windows bind mount.
    server: {
        host: '0.0.0.0',        // reachable from outside the container
        port: 5173,
        hmr: { host: 'localhost' },  // the browser is on the host, not the network
        watch: {
            // inotify events do not cross the Windows bind mount, so the
            // watcher never fires and edits silently stop rebuilding.
            usePolling: true,
            // Polling stats every watched file on an interval. These three
            // trees are tens of thousands of files we never edit, and leaving
            // them in makes the first compile crawl.
            ignored: ['**/vendor/**', '**/storage/**', '**/node_modules/**'],
        },
    },
});
