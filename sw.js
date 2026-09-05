// JCSM Service Worker - Enhanced PWA Support v92
const STATIC_CACHE = 'jcsm-static-v92';
const DYNAMIC_CACHE = 'jcsm-dynamic-v92';

// Chemins privés : jamais mis en cache, jamais servis depuis le cache
// (API authentifiée, portail interne, rapports d'intervention). L'API reste
// en réseau seul : le portail gère lui-même son cache localStorage (chaîne de
// repli documentée dans CLAUDE.md).
const PRIVATE_DIR_PREFIXES = ['/api/', '/rapports/'];
const PRIVATE_PAGES = new Set(['/interne', '/internedemo', '/rapport-intervention', '/ca', '/ca1', '/ca2']);
function isPrivatePath(pathname) {
    if (PRIVATE_DIR_PREFIXES.some(prefix => pathname.startsWith(prefix))) return true;
    return PRIVATE_PAGES.has(pathname.replace(/\.html$/, ''));
}
// Ne jamais mettre en cache une réponse que le serveur déclare non stockable
function isCacheable(response) {
    if (!response || !response.ok) return false;
    const cc = response.headers.get('Cache-Control') || '';
    return !/no-store|private/i.test(cc);
}

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
    '/images/logo.webp',
    '/icon-192.png',
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
    '/zones/ile-de-france',
    '/zones/paca',
    '/zones/occitanie',
    '/zones/auvergne-rhone-alpes',
    '/zones/hauts-de-france',
    '/zones/grand-est',
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
                keys.filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
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

    // API requests - network only (réponses authentifiées : jamais en cache)
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .catch(() => new Response(JSON.stringify({ error: 'offline', message: 'Mode hors ligne' }), {
                    headers: { 'Content-Type': 'application/json' }
                }))
        );
        return;
    }

    // Pages / fichiers privés - network only, page hors ligne en repli
    if (isPrivatePath(url.pathname)) {
        event.respondWith(
            fetch(request).catch(() => {
                if (request.headers.get('accept')?.includes('text/html')) {
                    return caches.match('/offline.html');
                }
                return Response.error();
            })
        );
        return;
    }

    // HTML pages - network first, fallback to cache
    if (request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (isCacheable(response)) {
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
                    if (isCacheable(response)) {
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
                if (isCacheable(response) && LAZY_CACHE_URLS.has(url.pathname)) {
                    const clone = response.clone();
                    caches.open(STATIC_CACHE).then(cache => cache.put(request, clone));
                }
                return response;
            })
            .catch(() => caches.match(request).then(r => r || caches.match('/offline.html')))
    );
});
