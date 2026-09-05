/* Carte publique : reperes de couverture, jamais les adresses des techniciens. */
(function () {
    'use strict';
    async function initCoverageMap() {
        var host = document.getElementById('coverage-map');
        if (!host || host.dataset.ready || typeof L === 'undefined') return;
        host.dataset.ready = 'true';
        try {
            var response = await fetch('/js/coverage-points.json?v=90');
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
            function overview() { map.fitBounds(bounds, { padding: [26, 26], maxZoom: 6 }); }
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
                    var label = group.length > 1 ? group.length + ' repères : zoomer' : group[0].name;
                    var icon = L.divIcon({ className: 'jcsm-coverage-marker', iconSize: [44, 44], iconAnchor: [22, 22],
                        html: '<span>' + (group.length > 1 ? group.length : '<i></i>') + '</span>' });
                    var marker = L.marker([lat, lng], { icon: icon, title: label, alt: label, keyboard: true }).addTo(layer);
                    var text = document.createElement('span');
                    text.textContent = group.length > 1 ? label : group[0].name + ' · Repère géographique';
                    marker.bindTooltip(text, { direction: 'top', offset: [0, -15] });
                    marker.on('click', function () {
                        if (group.length > 1) map.fitBounds(group.map(function (p) { return [p.lat, p.lng]; }), { padding: [45, 45], maxZoom: Math.min(map.getZoom() + 3, 12) });
                        else {
                            var popup = document.createElement('div');
                            var title = document.createElement('strong'); title.textContent = group[0].name;
                            var detail = document.createElement('p'); detail.textContent = 'Repère géographique. Disponibilité et délai à confirmer avec JCSM.';
                            popup.append(title, detail); marker.bindPopup(popup).openPopup();
                        }
                    });
                });
            }
            overview(); map.on('zoomend', draw); draw();
            var reset = L.control({ position: 'topright' });
            reset.onAdd = function () {
                var button = L.DomUtil.create('button', 'jcsm-map-reset');
                button.type = 'button'; button.textContent = "Vue d'ensemble";
                L.DomEvent.disableClickPropagation(button); button.addEventListener('click', overview);
                return button;
            };
            reset.addTo(map);
            var status = document.getElementById('coverage-map-status');
            if (status) status.textContent = points.length + ' repères géographiques · France et Belgique. Zoomez pour les distinguer.';
            host.dataset.pointCount = String(points.length);
            if (typeof ResizeObserver !== 'undefined') new ResizeObserver(function () { map.invalidateSize(); }).observe(host);
        } catch (_error) {
            host.dataset.ready = '';
            var status = document.getElementById('coverage-map-status');
            if (status) status.textContent = 'La carte est indisponible. Consultez la page Couverture ou contactez JCSM.';
        }
    }
    function load() {
        if (typeof L !== 'undefined') return initCoverageMap();
        var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = '/css/leaflet.css'; document.head.appendChild(css);
        var script = document.createElement('script'); script.src = '/js/vendor/leaflet.js'; script.onload = initCoverageMap;
        script.onerror = function () { var status = document.getElementById('coverage-map-status'); if (status) status.textContent = 'Carte indisponible. Consultez notre page Couverture.'; };
        document.head.appendChild(script);
    }
    function setup() {
        var host = document.getElementById('coverage-map'); if (!host) return;
        if (typeof IntersectionObserver === 'undefined') return load();
        var observer = new IntersectionObserver(function (entries) {
            if (entries.some(function (entry) { return entry.isIntersecting; })) { observer.disconnect(); load(); }
        }, { rootMargin: '200px' });
        observer.observe(host);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
