/**
 * JCSM Internal Portal - Map Module
 * Gère l'affichage de la carte Leaflet, les marqueurs, et le filtrage géographique.
 */

let map = null;
let markers = [];
// Les deux vues (liste et carte) sont toujours affichées ensemble
let showAllInterventions = false; // false = en cours (14 jours), true = toutes

// ==========================================
// INITIALISATION CARTE
// ==========================================

async function initMap() {
    let interventions = getFilteredInterventions(); // Fonction globale définie dans app.js ou utils.js (à migrer)

    // Si showAllInterventions est false, filtrer pour ne garder que les interventions en cours (14 jours)
    if (!showAllInterventions) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        const sevenDaysLater = new Date(today);
        sevenDaysLater.setDate(today.getDate() + 7);

        const startStr = sevenDaysAgo.toISOString().split('T')[0];
        const endStr = sevenDaysLater.toISOString().split('T')[0];

        interventions = interventions.filter(intv => {
            const intvDate = intv.dateProposee || intv.dateDemande || '';
            if (!intvDate) return false;
            return intvDate >= startStr && intvDate <= endStr;
        });
    }

    // Matcher les coordonnées depuis la base de données des sites
    let matchedCount = 0;
    for (const intv of interventions) {
        if (!intv.lat || !intv.lng) {
            const matchedCoords = matchInterventionCoordinates(intv);
            if (matchedCoords) {
                intv.lat = matchedCoords.lat;
                intv.lng = matchedCoords.lng;
                matchedCount++;
            }
        }
    }

    // Filtrer les interventions avec coordonnées pour la carte
    const locations = interventions.filter(i => i.lat && i.lng);
    const noCoordsCount = interventions.length - locations.length;

    // UI Feedback pour les sans coordonnées
    const noCoordsMsg = document.getElementById('no-coords-message');
    const noCoordsText = document.getElementById('no-coords-text');

    if (locations.length === 0) {
        if (noCoordsMsg && noCoordsText) {
            noCoordsMsg.classList.remove('hidden');
            noCoordsText.textContent = interventions.length > 0
                ? `${interventions.length} intervention(s) listée(s) mais sans coordonnées GPS.`
                : "Aucune intervention à afficher.";
        }
    } else {
        if (noCoordsMsg) noCoordsMsg.classList.add('hidden');
    }

    // Initialiser Leaflet si pas fait
    if (!map) {
        map = L.map('map', {
            zoomControl: false // On déplace le zoom
        }).setView([46.603354, 1.888334], 6); // Centre France

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        L.control.zoom({
            position: 'bottomright'
        }).addTo(map);
    }

    // Nettoyer marqueurs existants
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    // Créer les icones
    const createIcon = (color, isUrgent, isDone) => {
        // SVG personnalisé pour un look premium
        const pulseClass = isUrgent && !isDone ? 'pulse-ring' : '';
        const opacity = isDone ? '0.6' : '1';

        return L.divIcon({
            className: 'custom-marker',
            html: `
                <div class="marker-container ${isDone ? 'marker-done' : ''}" style="opacity: ${opacity}">
                    ${!isDone && isUrgent ? '<div class="marker-pulse"></div>' : ''}
                    <div class="marker-pin" style="background-color: ${color}; box-shadow: 0 2px 5px ${color}80;"></div>
                    <div class="marker-core"></div>
                </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            popupAnchor: [0, -12]
        });
    };

    // Ajouter les marqueurs
    const bounds = L.latLngBounds();

    locations.forEach(loc => {
        // Couleur selon région ou urgence
        // Ici on privilégie l'urgence ou le statut
        let color = '#3B82F6'; // Bleu standard

        if (loc.rapportFait) color = '#10B981'; // Vert (Fait)
        else if (String(loc.delais || '').toLowerCase().includes('urgent')) color = '#EF4444'; // Rouge (Urgent)
        else if (String(loc.delais || '').toLowerCase().includes('rapide')) color = '#F59E0B'; // Orange
        else color = getRegionColor(loc.region); // Fallback région

        const marker = L.marker([loc.lat, loc.lng], {
            icon: createIcon(color, String(loc.delais || '').toLowerCase().includes('urgent'), loc.rapportFait)
        })
            .bindPopup(`
            <div class="text-sm font-sans">
                <div class="font-bold text-gray-900 mb-1">${loc.nomSite}</div>
                <div class="text-gray-600 mb-2">${loc.adresse}</div>
                <div class="flex gap-2">
                    <span class="px-2 py-0.5 rounded text-xs font-medium ${loc.rapportFait ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}">
                        ${loc.rapportFait ? 'Terminé' : 'À faire'}
                    </span>
                    <button onclick="selectIntervention('${loc.id}')" class="text-blue-600 hover:underline text-xs font-medium">
                        Voir détails
                    </button>
                </div>
            </div>
        `)
            .addTo(map);

        markers.push(marker);
        bounds.extend([loc.lat, loc.lng]);
    });

    // Ajuster le zoom pour tout voir
    if (locations.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
    }
}

// Helper pour les couleurs régions (Copie de la logique existante)
function getRegionColor(region) {
    if (!region) return '#6B7280';
    const regionColors = {
        'Île-de-France': '#3B82F6',
        'Auvergne-Rhône-Alpes': '#10B981',
        'Nouvelle-Aquitaine': '#F59E0B',
        'Occitanie': '#8B5CF6',
        'Provence-Alpes-Côte d\'Azur': '#EC4899',
        'Grand Est': '#EF4444',
        'Hauts-de-France': '#14B8A6',
        'Normandie': '#F97316',
        'Bretagne': '#06B6D4',
        'Pays de la Loire': '#84CC16',
        'Bourgogne-Franche-Comté': '#A855F7',
        'Centre-Val de Loire': '#22C55E',
        'Corse': '#F43F5E',
        'La Réunion': '#0EA5E9',
        'Martinique': '#A3E635',
        'Guadeloupe': '#FB7185',
        'Guyane': '#34D399',
        'Mayotte': '#818CF8',
        'Admin': '#6366F1'
    };
    const normalized = String(region).trim();
    if (regionColors[normalized]) return regionColors[normalized];

    // Hash fallback
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
        hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 50%)`;
}

// Fonction de matching coordonnées (Doit avoir accès à SITES_DB global)
function matchInterventionCoordinates(intervention) {
    if (!typeof SITES_DB === 'undefined' || !SITES_DB) return null;

    // Normalisation
    const normalize = str => String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const searchNom = normalize(intervention.nomSite);
    const searchCP = normalize(intervention.cp || '');

    // 1. Match exact nom
    let match = SITES_DB.find(site => normalize(site.nom) === searchNom);

    // 2. Match partiel nom + CP
    if (!match && searchCP) {
        match = SITES_DB.find(site => normalize(site.nom).includes(searchNom) && normalize(site.cp) === searchCP);
    }

    if (match) {
        return { lat: parseFloat(match.lat), lng: parseFloat(match.lng) };
    }
    return null;
}

// Exposer globalement pour compatibilité
window.initMap = initMap;
window.map = map;
window.getRegionColor = getRegionColor;
