/* Carte publique : reperes de couverture, jamais les adresses des techniciens. */
(function () {
    'use strict';
    // Libellés dans la langue de la page (repli : français).
    var I18N = {
        fr: { many: ' repères : zoomer', tip: ' · Repère géographique', detail: 'Repère géographique. Disponibilité et délai à confirmer avec JCSM.', reset: "Vue d'ensemble", status: ' repères géographiques · France et Belgique. Zoomez pour les distinguer.', error: 'La carte est indisponible. Consultez la page Couverture ou contactez JCSM.', load: 'Carte indisponible. Consultez notre page Couverture.' },
        en: { many: ' locations: zoom in', tip: ' · Reference location', detail: 'Reference location. Availability and lead time to be confirmed with JCSM.', reset: 'Overview', status: ' reference locations · France and Belgium. Zoom in to tell them apart.', error: 'The map is unavailable. See our Coverage page or contact JCSM.', load: 'Map unavailable. See our Coverage page.' },
        de: { many: ' Standorte: zoomen', tip: ' · Referenzstandort', detail: 'Referenzstandort. Verfügbarkeit und Frist mit JCSM abzustimmen.', reset: 'Übersicht', status: ' Referenzstandorte · Frankreich und Belgien. Zoomen Sie, um sie zu unterscheiden.', error: 'Die Karte ist nicht verfügbar. Kontaktieren Sie JCSM.', load: 'Karte nicht verfügbar.' },
        es: { many: ' ubicaciones: acercar', tip: ' · Ubicación de referencia', detail: 'Ubicación de referencia. Disponibilidad y plazo a confirmar con JCSM.', reset: 'Vista general', status: ' ubicaciones de referencia · Francia y Bélgica. Acerque para distinguirlas.', error: 'El mapa no está disponible. Contacte con JCSM.', load: 'Mapa no disponible.' },
        it: { many: ' località: ingrandire', tip: ' · Località di riferimento', detail: 'Località di riferimento. Disponibilità e tempi da confermare con JCSM.', reset: 'Panoramica', status: ' località di riferimento · Francia e Belgio. Ingrandite per distinguerle.', error: 'La mappa non è disponibile. Contattate JCSM.', load: 'Mappa non disponibile.' },
        nl: { many: ' locaties: inzoomen', tip: ' · Referentielocatie', detail: 'Referentielocatie. Beschikbaarheid en termijn te bevestigen met JCSM.', reset: 'Overzicht', status: ' referentielocaties · Frankrijk en België. Zoom in om ze te onderscheiden.', error: 'De kaart is niet beschikbaar. Neem contact op met JCSM.', load: 'Kaart niet beschikbaar.' },
        pl: { many: ' lokalizacji: przybliż', tip: ' · Lokalizacja referencyjna', detail: 'Lokalizacja referencyjna. Dostępność i termin do potwierdzenia z JCSM.', reset: 'Widok ogólny', status: ' lokalizacji referencyjnych · Francja i Belgia. Przybliż, aby je rozróżnić.', error: 'Mapa jest niedostępna. Skontaktuj się z JCSM.', load: 'Mapa niedostępna.' },
        pt: { many: ' localizações: aproximar', tip: ' · Localização de referência', detail: 'Localização de referência. Disponibilidade e prazo a confirmar com a JCSM.', reset: 'Vista geral', status: ' localizações de referência · França e Bélgica. Aproxime para as distinguir.', error: 'O mapa não está disponível. Contacte a JCSM.', load: 'Mapa indisponível.' }
    };
    var T = I18N[(document.documentElement.lang || 'fr').slice(0, 2).toLowerCase()] || I18N.fr;
    async function initCoverageMap() {
        var host = document.getElementById('coverage-map');
        if (!host || host.dataset.ready || typeof L === 'undefined') return;
        host.dataset.ready = 'true';
        try {
            var response = await fetch('/js/coverage-points.json?v=91');
            if (!response.ok) throw new Error('coverage unavailable');
            var data = await response.json();
            var points = data.points.filter(function (p) {
                return Number.isFinite(p.lat) && Number.isFinite(p.lng) && p.lat > 40 && p.lat < 53 && p.lng > -6 && p.lng < 11;
            });
            var map = L.map(host, { scrollWheelZoom: false, attributionControl: true });
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(map);
            var bounds = L.latLngBounds(points.map(function (p) { return [p.lat, p.lng]; }));
            var layer = L.layerGroup().addTo(map);
            function overview() { map.closePopup(); map.fitBounds(bounds, { padding: [26, 26], maxZoom: 6 }); }
            function draw() {
                layer.clearLayers();
                var groups = new Map();
                points.forEach(function (p) {
                    var pixel = map.project([p.lat, p.lng], map.getZoom());
                    var key = map.getZoom() >= 9 ? p.code : Math.floor(pixel.x / 42) + ':' + Math.floor(pixel.y / 42);
                    if (!groups.has(key)) groups.set(key, []);
                    groups.get(key).push(p);
                });
                groups.forEach(function (group) {
                    var lat = group.reduce(function (s, p) { return s + p.lat; }, 0) / group.length;
                    var lng = group.reduce(function (s, p) { return s + p.lng; }, 0) / group.length;
                    var label = group.length > 1 ? group.length + T.many : group[0].name;
                    var icon = L.divIcon({ className: 'jcsm-coverage-marker', iconSize: [44, 44], iconAnchor: [22, 22],
                        html: '<span>' + (group.length > 1 ? group.length : '<i></i>') + '</span>' });
                    var marker = L.marker([lat, lng], { icon: icon, title: label, alt: label, keyboard: true }).addTo(layer);
                    var text = document.createElement('span');
                    text.textContent = group.length > 1 ? label : group[0].name + T.tip;
                    marker.bindTooltip(text, { direction: 'top', offset: [0, -15] });
                    marker.on('click', function () {
                        if (group.length > 1) map.fitBounds(group.map(function (p) { return [p.lat, p.lng]; }), { padding: [45, 45], maxZoom: Math.min(map.getZoom() + 3, 12) });
                        else {
                            var popup = document.createElement('div');
                            var title = document.createElement('strong'); title.textContent = group[0].name;
                            var detail = document.createElement('p'); detail.textContent = T.detail;
                            popup.append(title, detail); marker.bindPopup(popup).openPopup();
                        }
                    });
                });
            }
            overview(); map.on('zoomend', draw); draw();
            var reset = L.control({ position: 'topright' });
            reset.onAdd = function () {
                var button = L.DomUtil.create('button', 'jcsm-map-reset');
                button.type = 'button'; button.textContent = T.reset;
                L.DomEvent.disableClickPropagation(button); button.addEventListener('click', overview);
                return button;
            };
            reset.addTo(map);
            var status = document.getElementById('coverage-map-status');
            if (status) status.textContent = points.length + T.status;
            host.dataset.pointCount = String(points.length);
            var search = document.getElementById('coverage-city');
            var results = document.getElementById('coverage-search-results');
            var searchStatus = document.getElementById('coverage-search-status');
            function normalize(value) {
                return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
            }
            if (search && results && searchStatus) {
                search.disabled = false;
                search.addEventListener('input', function () {
                    results.replaceChildren();
                    var query = normalize(search.value);
                    if (query.length < 2) { searchStatus.textContent = ''; return; }
                    var matches = points.filter(function (p) { return normalize(p.name).includes(query); }).slice(0, 5);
                    searchStatus.textContent = matches.length ? matches.length + ' résultat(s). Choisissez une ville pour la voir sur la carte.' : 'Aucun repère trouvé. Consultez notre couverture ou contactez-nous pour votre commune.';
                    matches.forEach(function (point) {
                        var item = document.createElement('li');
                        var button = document.createElement('button');
                        button.type = 'button'; button.textContent = point.name;
                        button.addEventListener('click', function () {
                            map.setView([point.lat, point.lng], 10, { animate: false });
                            var label = document.createElement('span'); label.textContent = point.name + ' · Repère géographique';
                            L.popup().setLatLng([point.lat, point.lng]).setContent(label).openOn(map);
                            searchStatus.textContent = point.name + ' affiché sur la carte. Disponibilité à confirmer avec JCSM.';
                            host.scrollIntoView({ block: 'center', behavior: 'instant' });
                        });
                        item.appendChild(button); results.appendChild(item);
                    });
                });
                search.addEventListener('keydown', function (event) {
                    if (event.key === 'ArrowDown') { var first = results.querySelector('button'); if (first) { event.preventDefault(); first.focus(); } }
                    if (event.key === 'Enter') { var match = results.querySelector('button'); if (match) { event.preventDefault(); match.click(); } }
                    if (event.key === 'Escape') { search.value = ''; results.replaceChildren(); searchStatus.textContent = ''; }
                });
            }
            if (typeof ResizeObserver !== 'undefined') new ResizeObserver(function () { map.invalidateSize(); }).observe(host);
        } catch (_error) {
            host.dataset.ready = '';
            var status = document.getElementById('coverage-map-status');
            if (status) status.textContent = T.error;
        }
    }
    function load() {
        if (typeof L !== 'undefined') return initCoverageMap();
        var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = '/css/leaflet.css'; document.head.appendChild(css);
        var script = document.createElement('script'); script.src = '/js/vendor/leaflet.js'; script.onload = initCoverageMap;
        script.onerror = function () { var status = document.getElementById('coverage-map-status'); if (status) status.textContent = T.load; };
        document.head.appendChild(script);
    }
    function setup() {
        var host = document.getElementById('coverage-map'); if (!host) return;
        if (typeof IntersectionObserver === 'undefined') return load();
        var observer = new IntersectionObserver(function (entries) {
            if (entries.some(function (entry) { return entry.isIntersecting; })) { observer.disconnect(); load(); }
        }, { rootMargin: '200px' });
        observer.observe(host);
        var search = document.getElementById('coverage-city');
        if (search) observer.observe(search);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
