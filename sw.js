// JCSM Service Worker - Enhanced PWA Support v25
const STATIC_CACHE = 'jcsm-static-v25';
const DYNAMIC_CACHE = 'jcsm-dynamic-v25';
const API_CACHE = 'jcsm-api-v25';

// Assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/js/config.js',
    '/js/public.js',
    '/js/utils.js',
    '/js/wow-effects.js',
    '/js/analytics.js',
    '/images/logo.png',
    '/manifest.json',
    '/offline.html',
    '/404.html',
    '/exploitation.html',
    '/installation-conformite.html',
    '/pilotage-projets.html',
    '/a-propos.html',
    '/securisation-installations.html',
    '/centre-appel.html',
    '/carrieres.html',
    '/mentions-legales.html',
    '/confidentialite.html',
    '/cgv.html',
    '/js/landing.js',
    '/interne.html',
    '/zones/ile-de-france.html',
    '/zones/paca.html',
    '/zones/occitanie.html',
    '/zones/auvergne-rhone-alpes.html',
    '/zones/hauts-de-france.html',
    '/zones/nouvelle-aquitaine.html',
    '/zones/belgique.html',
    '/contact.html'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE && key !== API_CACHE)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - stale-while-revalidate for HTML, cache-first for assets, network-first for API
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip external requests
    if (url.origin !== location.origin) return;

    // API requests - network first, cache fallback for offline
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Cache successful API GET responses
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(API_CACHE).then(cache => cache.put(request, clone));
                    }
                    return response;
                })
                .catch(() => {
                    // Fallback to cached API response when offline
                    return caches.match(request).then(cached => {
                        if (cached) return cached;
                        return new Response(JSON.stringify({ error: 'offline', message: 'Mode hors ligne' }), {
                            headers: { 'Content-Type': 'application/json' }
                        });
                    });
                })
        );
        return;
    }

    // HTML pages - network first, fallback to cache
    if (request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    const clone = response.clone();
                    caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, clone));
                    return response;
                })
                .catch(() => caches.match(request).then(cached => cached || caches.match('/offline.html')))
        );
        return;
    }

    // Static assets - cache first, fallback to network
    if (url.pathname.match(/\.(css|js|png|jpg|jpeg|svg|webp|woff2?)$/)) {
        event.respondWith(
            caches.match(request).then(cached => {
                if (cached) return cached;
                return fetch(request).then(response => {
                    const clone = response.clone();
                    caches.open(STATIC_CACHE).then(cache => cache.put(request, clone));
                    return response;
                });
            })
        );
        return;
    }

    // Default - network first
    event.respondWith(
        fetch(request).catch(() => caches.match(request))
    );
});
