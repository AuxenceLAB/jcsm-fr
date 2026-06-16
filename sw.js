// JCSM Service Worker - Enhanced PWA Support v75
const STATIC_CACHE = 'jcsm-static-v75';
const DYNAMIC_CACHE = 'jcsm-dynamic-v75';
const API_CACHE = 'jcsm-api-v75';

// Critical assets pre-cached on install (small set for fast startup)
const CRITICAL_URLS = [
    '/',
    '/a-propos',
    '/contact',
    '/css/critical.css',
    '/styles.css',
    '/js/public.js',
    '/js/config.js',
    '/js/utils.js',
    '/js/i18n.js',
    '/js/analytics.js',
    '/js/cookie-consent.js',
    '/images/logo.png',
    '/images/logo.webp',
    '/manifest.json',
    '/offline.html'
];

// Known site URLs that should be lazily cached into STATIC_CACHE on first fetch
const LAZY_CACHE_URLS = new Set([
    '/index.html',
    '/css/tailwind.css',
    '/js/wow-effects.js',
    '/404.html',
    '/exploitation',
    '/installation-conformite',
    '/pilotage-projets',
    '/securisation-installations',
    '/centre-appel',
    '/carrieres',
    '/mentions-legales',
    '/confidentialite',
    '/cgv',
    '/js/landing.js',
    '/js/dashboard.js',
    '/js/fiches.js',
    '/js/map.js',
    '/interne.html',
    '/zones/ile-de-france',
    '/zones/paca',
    '/zones/occitanie',
    '/zones/auvergne-rhone-alpes',
    '/zones/hauts-de-france',
    '/zones/nouvelle-aquitaine',
    '/zones/belgique',
    '/zones/france',
    '/blog',
    '/css/leaflet.css',
    '/js/vendor/leaflet.js',
    '/solutions/',
    '/solutions/cpo-operateurs',
    '/solutions/entreprises-flottes',
    '/solutions/fabricants-bornes',
    '/solutions/retail-grande-distribution',
    '/en/',
    '/en/about',
    '/en/become-partner',
    '/en/call-center',
    '/en/careers',
    '/en/contact',
    '/en/coverage',
    '/en/installation-compliance',
    '/en/installation-security',
    '/en/legal-notice',
    '/en/operations-maintenance',
    '/en/privacy',
    '/en/project-management',
    '/en/terms',
    '/de/',
    '/de/anlagensicherung',
    '/de/betrieb-wartung',
    '/de/callcenter',
    '/de/installation-konformitaet',
    '/de/kontakt',
    '/de/projektmanagement',
    '/de/ueber-uns',
    '/es/',
    '/es/centro-llamadas',
    '/es/contacto',
    '/es/gestion-proyectos',
    '/es/instalacion-conformidad',
    '/es/nosotros',
    '/es/operacion-mantenimiento',
    '/es/seguridad-instalaciones',
    '/it/',
    '/it/centro-chiamate',
    '/it/chi-siamo',
    '/it/contatti',
    '/it/gestione-manutenzione',
    '/it/gestione-progetti',
    '/it/installazione-conformita',
    '/it/sicurezza-installazioni',
    '/nl/',
    '/nl/beveiliging-installaties',
    '/nl/callcenter',
    '/nl/contact',
    '/nl/exploitatie-onderhoud',
    '/nl/installatie-conformiteit',
    '/nl/over-ons',
    '/nl/projectbeheer',
    '/pl/',
    '/pl/centrum-telefoniczne',
    '/pl/eksploatacja-konserwacja',
    '/pl/instalacja-zgodnosc',
    '/pl/kontakt',
    '/pl/o-nas',
    '/pl/zabezpieczenie-instalacji',
    '/pl/zarzadzanie-projektami',
    '/pt/',
    '/pt/central-atendimento',
    '/pt/cobertura',
    '/pt/contato',
    '/pt/gestao-projetos',
    '/pt/instalacao-conformidade',
    '/pt/operacao-manutencao',
    '/pt/seguranca-instalacoes',
    '/pt/sobre-nos',
    '/couverture',
    '/devenir-partenaire',
    '/virta',
    '/powerdot'
]);

// Install event - cache only critical assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => cache.addAll(CRITICAL_URLS))
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

// Fetch event - network-first for HTML, cache-first for assets, network-first for API
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
                    if (response.ok) {
                        const clone = response.clone();
                        // Cache into STATIC_CACHE if it's a known site URL, otherwise DYNAMIC_CACHE
                        const cacheName = LAZY_CACHE_URLS.has(url.pathname) ? STATIC_CACHE : DYNAMIC_CACHE;
                        caches.open(cacheName).then(cache => cache.put(request, clone));
                    }
                    return response;
                })
                .catch(() => caches.match(request).then(cached => cached || caches.match('/offline.html')))
        );
        return;
    }

    // Static assets - cache first, fallback to network (lazy-cache on fetch)
    if (url.pathname.match(/\.(css|js|png|jpg|jpeg|svg|webp|woff2?)$/)) {
        event.respondWith(
            caches.match(request).then(cached => {
                if (cached) return cached;
                return fetch(request).then(response => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(STATIC_CACHE).then(cache => cache.put(request, clone));
                    }
                    return response;
                });
            })
        );
        return;
    }

    // Default - network first, lazy-cache known URLs
    event.respondWith(
        fetch(request)
            .then(response => {
                if (response.ok && LAZY_CACHE_URLS.has(url.pathname)) {
                    const clone = response.clone();
                    caches.open(STATIC_CACHE).then(cache => cache.put(request, clone));
                }
                return response;
            })
            .catch(() => caches.match(request).then(r => r || caches.match('/offline.html')))
    );
});
