// Bleachers & Seats - Service Worker (Level 1: App Shell Caching)
// Makes the app installable and caches core files for fast loading

const CACHE_NAME = 'bleachers-v1';
const APP_SHELL = [
    '/bleachers-app/',
    '/bleachers-app/index.html',
    '/bleachers-app/css/app.css',
    '/bleachers-app/js/auth.js',
    '/bleachers-app/js/app.js',
    '/bleachers-app/js/data.js',
    '/bleachers-app/js/views/admin.js',
    '/bleachers-app/js/views/browse.js',
    '/bleachers-app/js/views/create.js',
    '/bleachers-app/js/views/dashboard.js',
    '/bleachers-app/js/views/estimate-builder.js',
    '/bleachers-app/js/views/field.js',
    '/bleachers-app/js/views/inspection.js',
    '/bleachers-app/js/views/my-jobs.js',
    '/bleachers-app/js/views/office.js',
    '/bleachers-app/js/views/ops-review.js',
    '/bleachers-app/js/views/scheduling.js',
    '/bleachers-app/js/utils/api-base.js',
    '/bleachers-app/js/utils/parts-api.js',
    '/bleachers-app/js/utils/jobs-api.js',
    '/bleachers-app/js/utils/estimates-api.js',
    '/bleachers-app/js/utils/customers-api.js',
    '/bleachers-app/js/utils/parts-catalog.js',
    '/bleachers-app/js/utils/search.js',
    '/bleachers-app/bleachers-logo-icon.png',
    '/bleachers-app/bleachers-logo-full.png',
    '/bleachers-app/menu-logo-wide.png',
    '/bleachers-app/icons/icon-192.png',
    '/bleachers-app/icons/icon-512.png'
];

// Install: cache the app shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(APP_SHELL);
        })
    );
    self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch: serve from cache first, fall back to network
// API calls always go to network (never cached)
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Never cache API calls or auth requests
    if (url.hostname.includes('vercel.app') ||
        url.hostname.includes('clerk') ||
        url.pathname.includes('/api/')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cached) => {
            // Return cached version, but also fetch fresh copy for next time
            const fetchPromise = fetch(event.request).then((response) => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clone);
                    });
                }
                return response;
            }).catch(() => {
                // Network failed, cached version (if any) already returned
            });

            return cached || fetchPromise;
        })
    );
});
