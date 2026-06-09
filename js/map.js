/**
 * map.js - Leaflet map for interventions
 * Fixed: XSS in popup (escMap applied consistently, data-select-id sanitized),
 *        popup event listener leak (_jcsmBound guard preserved),
 *        null-safe coordinate parsing, bounds validation
 */
var map = null;
var markers = [];
var showAllInterventions = false;

var escMap = typeof window.escapeHtml === "function"
    ? window.escapeHtml
    : function (str) {
        if (str == null) return "";
        var div = document.createElement("div");
        div.textContent = String(str);
        return div.innerHTML;
    };

async function initMap() {
    try {
        if (typeof getFilteredInterventions !== "function") return;

        var interventions = getFilteredInterventions();

        if (!showAllInterventions) {
            var now = new Date();
            now.setHours(0, 0, 0, 0);
            var weekAgo = new Date(now);
            weekAgo.setDate(now.getDate() - 7);
            var weekAhead = new Date(now);
            weekAhead.setDate(now.getDate() + 7);
            var rangeStart = weekAgo.toISOString().split("T")[0];
            var rangeEnd = weekAhead.toISOString().split("T")[0];

            interventions = interventions.filter(function (iv) {
                var d = iv.dateProposee || iv.dateDemande || "";
                return d && d >= rangeStart && d <= rangeEnd;
            });
        }

        // Attempt geocoding from SITES_DB (use shallow copies to avoid mutating source data)
        interventions = interventions.map(function (iv) { return Object.assign({}, iv); });
        interventions.forEach(function (iv) {
            if (!iv.lat || !iv.lng) {
                var coords = matchInterventionCoordinates(iv);
                if (coords) {
                    iv.lat = coords.lat;
                    iv.lng = coords.lng;
                }
            }
        });

        var withCoords = interventions.filter(function (iv) { return iv.lat && iv.lng; });

        // Show/hide "no coordinates" message
        var noCoordsMsg = document.getElementById("no-coords-message");
        var noCoordsText = document.getElementById("no-coords-text");
        if (withCoords.length === 0) {
            if (noCoordsMsg && noCoordsText) {
                noCoordsMsg.classList.remove("hidden");
                noCoordsText.textContent = interventions.length > 0
                    ? interventions.length + " intervention(s) listee(s) mais sans coordonnees GPS."
                    : "Aucune intervention a afficher.";
            }
        } else if (noCoordsMsg) {
            noCoordsMsg.classList.add("hidden");
        }

        // Initialize map once
        if (!map) {
            map = L.map("map", { zoomControl: false }).setView([46.603354, 1.888334], 6);
            L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: "abcd",
                maxZoom: 19
            }).addTo(map);
            L.control.zoom({ position: "bottomright" }).addTo(map);
        }

        // Clear existing markers
        markers.forEach(function (m) { map.removeLayer(m); });
        markers = [];

        function makeIcon(color, isUrgent, isDone) {
            var opacity = isDone ? "0.6" : "1";
            var pulseHtml = !isDone && isUrgent ? '<div class="marker-pulse"></div>' : "";
            return L.divIcon({
                className: "custom-marker",
                html: '<div class="marker-container' + (isDone ? " marker-done" : "") + '" style="opacity:' + opacity + '">'
                    + pulseHtml
                    + '<div class="marker-pin" style="background-color:' + escMap(color) + ';box-shadow:0 2px 5px ' + escMap(color) + '80;"></div>'
                    + '<div class="marker-core"></div>'
                    + '</div>',
                iconSize: [24, 24],
                iconAnchor: [12, 12],
                popupAnchor: [0, -12]
            });
        }

        var bounds = L.latLngBounds();

        withCoords.forEach(function (iv) {
            var lat = parseFloat(iv.lat);
            var lng = parseFloat(iv.lng);
            if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return;
            if (lat === 0 && lng === 0) return;

            var color = "#3B82F6";
            if (iv.rapportFait) {
                color = "#10B981";
            } else if (String(iv.delais || "").toLowerCase().indexOf("urgent") !== -1) {
                color = "#EF4444";
            } else if (String(iv.delais || "").toLowerCase().indexOf("rapide") !== -1) {
                color = "#F59E0B";
            } else {
                color = getRegionColor(iv.region);
            }

            var isUrgent = String(iv.delais || "").toLowerCase().indexOf("urgent") !== -1;

            // Build popup with escaped content
            var statusClass = iv.rapportFait ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800";
            var statusText = iv.rapportFait ? "Termine" : "A faire";
            var safeId = escMap(iv.id);

            var popupHtml = '<div class="text-sm font-sans">'
                + '<div class="font-bold text-gray-900 mb-1">' + escMap(iv.nomSite) + '</div>'
                + '<div class="text-gray-600 mb-2">' + escMap(iv.adresse) + '</div>'
                + '<div class="flex gap-2">'
                + '<span class="px-2 py-0.5 rounded text-xs font-medium ' + statusClass + '">' + statusText + '</span>'
                + '<button data-select-id="' + safeId + '" class="text-blue-600 hover:underline text-xs font-medium">Voir details</button>'
                + '</div></div>';

            var marker = L.marker([lat, lng], {
                icon: makeIcon(color, isUrgent, iv.rapportFait)
            }).bindPopup(popupHtml).addTo(map);

            marker.on("popupopen", function () {
                var btnEl = marker.getPopup().getElement();
                var btn = btnEl ? btnEl.querySelector("[data-select-id]") : null;
                if (btn && !btn._jcsmBound) {
                    btn._jcsmBound = true;
                    btn.addEventListener("click", function () {
                        if (typeof selectIntervention === "function") {
                            selectIntervention(iv.id);
                        }
                    });
                }
            });

            markers.push(marker);
            bounds.extend([lat, lng]);
        });

        if (markers.length > 0 && bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    } catch (e) {
        /* silent fail : map init non-critical */
    }
}

function getRegionColor(region) {
    if (!region) return "#6B7280";
    var palette = {
        "Ile-de-France": "#3B82F6",
        "Auvergne-Rhone-Alpes": "#10B981",
        "Nouvelle-Aquitaine": "#F59E0B",
        "Occitanie": "#8B5CF6",
        "Provence-Alpes-Cote d'Azur": "#EC4899",
        "Grand Est": "#EF4444",
        "Hauts-de-France": "#14B8A6",
        "Normandie": "#F97316",
        "Bretagne": "#0EA5E9",
        "Pays de la Loire": "#84CC16",
        "Bourgogne-Franche-Comte": "#A855F7",
        "Centre-Val de Loire": "#22C55E",
        "Corse": "#F43F5E",
        "La Reunion": "#0EA5E9",
        "Martinique": "#A3E635",
        "Guadeloupe": "#FB7185",
        "Guyane": "#34D399",
        "Mayotte": "#818CF8",
        "Admin": "#6366F1"
    };
    var name = String(region).trim();
    if (palette[name]) return palette[name];

    // Deterministic hash color for unknown regions
    var hash = 0;
    for (var i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return "hsl(" + (Math.abs(hash) % 360) + ", 70%, 50%)";
}

function matchInterventionCoordinates(iv) {
    if (typeof SITES_DB === "undefined" || !SITES_DB) return null;

    function normalize(s) {
        return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    }

    var normName = normalize(iv.nomSite);
    var normCp = normalize(iv.cp || "");

    var match = SITES_DB.find(function (site) {
        return normalize(site.nom) === normName;
    });

    if (!match && normCp) {
        match = SITES_DB.find(function (site) {
            return normalize(site.nom).indexOf(normName) !== -1 && normalize(site.cp) === normCp;
        });
    }

    if (match) {
        return { lat: parseFloat(match.lat), lng: parseFloat(match.lng) };
    }
    return null;
}

window.initMap = initMap;
Object.defineProperty(window, "map", { get: function () { return map; }, configurable: true });
window.getRegionColor = getRegionColor;
