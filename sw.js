// JCSM Service Worker - Enhanced PWA Support v5
const CACHE_NAME = 'jcsm-v5';
const STATIC_CACHE = 'jcsm-static-v5';
const DYNAMIC_CACHE = 'jcsm-dynamic-v5';

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
    '/zones/ile-de-france.html',
    '/zones/paca.html',
    '/zones/occitanie.html',
    '/zones/auvergne-rhone-alpes.html',
    '/zones/hauts-de-france.html',
    '/zones/nouvelle-aquitaine.html'
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
                keys.filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - stale-while-revalidate for HTML, cache-first for assets
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip external requests
    if (url.origin !== location.origin) return;

    // HTML pages - network first, fallback to cache
    if (request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    const clone = response.clone();
                    caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, clone));
                    return response;
                })
                .catch(() => caches.match(request).then(cached => cached || caches.match('/index.html')))
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
