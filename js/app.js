/**
 * JCSM Internal Portal - App Module
 * Logique principale: Auth, Gestion des données, UI Globale, Formulaires
 */

// ==========================================
// VARIABLES GLOBALES
// ==========================================
let ALL_INTERVENTIONS = [];
let cachedInterventions = [];
let technicien = null;
let selectedInterventionId = null;

// URL de l'API - utilise l'API locale ou Google Sheets
const GOOGLE_SHEETS_API_URL = typeof JCSM_CONFIG !== 'undefined'
    ? JCSM_CONFIG.api.googleSheets
    : 'https://script.google.com/macros/s/AKfycbzZxvFsy4yb1gsAdL70zhhMJCdZN-fGUZY4qHct3wMergx6hNX2qTOB0nH86ohBgEjmqA/exec';

// API locale comme fallback
const LOCAL_API_URL = typeof JCSM_CONFIG !== 'undefined'
    ? JCSM_CONFIG.api.interventions
    : '/api/interventions.php';

// ==========================================
// INITIALISATION
// ==========================================

async function startApp() {
    // console.log('🚀 Démarrage de l\'application JCSM...');

    // 1. Initialiser les utilitaires UI
    initTabs();
    if (window.initFiches) window.initFiches(); // Init Fiches Méthodes

    // 2. Vérifier Auth
    if (!checkAuth()) {
        // console.log('🔒 Non authentifié, attente de connexion...');
        return;
    }

    // 3. Charger les données
    await initData();

    // 4. Initialiser la carte (Map Module)
    if (window.initMap) {
        await window.initMap();
    }

    // 5. Initialiser les listeners globaux
    initEventListeners();

    // 6. Charger les brouillons
    checkDrafts();

    // 7. WOW Features pour techniciens
    initKeyboardShortcuts();
    initDashboardAnimations();

    // 8. Auto Refresh
    initAutoRefresh();
}

// ==========================================
// KEYBOARD SHORTCUTS (WOW Feature)
// ==========================================
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ignore if typing in input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        // Ctrl/Cmd + N = New intervention modal
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            const newBtn = document.querySelector('[data-action="new-intervention"]');
            if (newBtn) newBtn.click();
            showToast('🆕 Nouvelle intervention', 'info', 1500);
        }

        // Ctrl/Cmd + F = Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            const search = document.getElementById('search-input');
            if (search) {
                search.focus();
                search.select();
            }
        }

        // Escape = Close modals
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal, [id$="-modal"]').forEach(m => {
                if (m.style.display !== 'none') m.style.display = 'none';
            });
        }

        // 1-5 = Quick tab switch
        if (e.key >= '1' && e.key <= '5' && !e.ctrlKey && !e.metaKey) {
            const tabs = document.querySelectorAll('.tab-button');
            const index = parseInt(e.key) - 1;
            if (tabs[index]) tabs[index].click();
        }
    });

    // console.log('⌨️ Raccourcis clavier activés: Ctrl+N, Ctrl+F, Esc, 1-5');
}

// ==========================================
// DASHBOARD ANIMATIONS (WOW Feature)
// ==========================================
function initDashboardAnimations() {
    // Add pulse animation to stat cards when values change
    const statCards = document.querySelectorAll('.stat-card, [data-stat]');

    statCards.forEach(card => {
        // Add initial entrance animation
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        setTimeout(() => {
            card.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, parseInt(card.dataset.delay || 0));

        // Add hover micro-interaction
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px) scale(1.02)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Intervention item micro-interactions
    const style = document.createElement('style');
    style.textContent = `
        .intervention-item {
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .intervention-item:hover {
            transform: translateX(8px) !important;
            box-shadow: -4px 0 0 #2563EB, 0 4px 12px rgba(0,0,0,0.08) !important;
        }
        .intervention-item.selected {
            animation: selectPulse 0.3s ease-out;
        }
        @keyframes selectPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
        }
        .stat-card::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(0,112,243,0.05), transparent);
            opacity: 0;
            transition: opacity 0.3s;
            pointer-events: none;
            border-radius: inherit;
        }
        .stat-card:hover::after {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
}

async function initData() {
    try {
        // Tenter de charger depuis le cache d'abord (PWA)
        const cached = localStorage.getItem('jcsm_interventions_cache');
        if (cached) {
            const data = JSON.parse(cached);
            // Vérifier si le cache est récent (< 1h)
            const cacheTime = localStorage.getItem('jcsm_cache_time');
            const isRecent = cacheTime && (Date.now() - parseInt(cacheTime) < 3600000);

            if (isRecent) {
                // console.log('📦 Chargement depuis le cache local');
                processData(data);
                // Charger le réseau en arrière-plan pour mise à jour
                const url = GOOGLE_SHEETS_API_URL;

                fetch(url)
                    .then(response => {
                        if (!response.ok) throw new Error('Erreur réseau');
                        return response.json();
                    })
                    .then(networkData => {
                        // console.log('🔄 Données réseau chargées en arrière-plan.');
                        processData(networkData); // Mettre à jour le cache et l'UI avec les dernières données
                    })
                    .catch(() => { /* Silently fail for background refresh */ });
                return;
            }
        }

        // Sinon charger depuis le réseau
        await fetchData();
    } catch (e) {
        showToast('Erreur de chargement des données', 'error');
    }
}

async function fetchData() {
    const loadingIndicator = document.getElementById('loading-indicator');

    // Afficher le Skeleton au lieu du loader texte basique si possible
    renderSkeleton();
    if (loadingIndicator && !document.getElementById('interventions-list').children.length) {
        loadingIndicator.classList.remove('hidden');
    }

    try {
        // console.log("🔄 Chargement des données...");

        let url = GOOGLE_SHEETS_API_URL;
        // On récupère tout et on filtre après pour la sécurité "client-side" (si API limitées)

        const response = await fetch(url);
        if (!response.ok) throw new Error('Erreur réseau');

        let data = await response.json();

        // FILTRAGE STRICT CÔTÉ CLIENT (Securité UX)
        // Si c'est un technicien, on ne garde que ce qui le concerne
        if (technicien && !technicien.isAdmin) {
            // console.log(`🔒 Filtrage pour technicien: ${technicien.region}`);
            // Adaptez 'Technicien' ou 'Region' selon vos colonnes exactes dans le Sheet
            // Ici on suppose une colonne 'Technicien' ou 'Region'
            data = data.filter(item => {
                const techName = (item.Technicien || item.technicien || '').toLowerCase();
                const region = (item.Region || item.region || '').toLowerCase();
                const userRegion = (technicien.region || '').toLowerCase();

                // Logique : soit ça matche la région, soit le nom (simplifié ici à région pour l'exemple)
                return techName.includes(userRegion) || region.includes(userRegion);
            });
        }

        processData(data);

        showToast('Données actualisées', 'success', 1000);

    } catch (e) {
        showToast('Erreur chargement (Mode hors ligne)', 'warning');

        // Fallback cache si échec réseau
        const cached = localStorage.getItem('jcsm_interventions_cache');
        if (cached) {
            // console.log('⚠️ Utilisation du cache');
            processData(JSON.parse(cached));
        }
    } finally {
        if (loadingIndicator) loadingIndicator.classList.add('hidden');
    }
}

function processData(data) {
    if (!data) return;
    ALL_INTERVENTIONS = data;

    // Sauvegarder en cache
    localStorage.setItem('jcsm_interventions_cache', JSON.stringify(data));
    localStorage.setItem('jcsm_cache_time', Date.now());

    // Mettre à jour UI
    renderInterventionsList();
    if (window.updateDashboard) window.updateDashboard();
}

function fetchDataInBackground() {
    // ... Logique similaire à fetchData mais silencieuse
}

// ==========================================
// AUTHENTIFICATION
// ==========================================

function checkAuth(suppressModal = false) {
    const region = localStorage.getItem('tech_region');
    const isAdmin = localStorage.getItem('is_admin') === 'true';

    if (!region) {
        technicien = null;
        if (!suppressModal) showAuthModal();
        return false;
    }

    technicien = { region, isAdmin };
    updateUserInterface(technicien);
    return true;
}

function showAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.style.display = 'flex';
        modal.style.pointerEvents = 'auto';
    }
}

function updateUserInterface(user) {
    const regionEl = document.getElementById('tech-region');
    if (regionEl) regionEl.textContent = user.isAdmin ? 'Administrateur' : user.region;

    const adminTab = document.getElementById('dashboard-tab-button');
    if (adminTab) adminTab.style.display = user.isAdmin ? 'flex' : 'none';

    const reportsTab = document.getElementById('rapports-tab-button'); // Si existe
    if (reportsTab) reportsTab.style.display = 'flex'; // Toujours afficher pour auth
}

// ==========================================
// GESTION DES LISTES (UI)
// ==========================================

function applyFilters() {
    // Re-render list with current filters
    renderInterventionsList();

    // Update map if it exists
    if (window.initMap) {
        // initMap re-calls getFilteredInterventions internally
        window.initMap();
    }
}

function renderInterventionsList() {
    const container = document.getElementById('interventions-list');
    if (!container) return;

    container.innerHTML = '';

    const interventions = getFilteredInterventions();

    // Update count if element exists
    const countEl = document.getElementById('intervention-count');
    if (countEl) countEl.textContent = interventions.length;

    if (interventions.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-64 text-gray-400">
                <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p>Aucune intervention trouvée</p>
            </div>`;
        return;
    }

    interventions.forEach(item => {
        // Determine status badge style
        let statusBadge = '';
        const delais = String(item.delais || '').toLowerCase();

        if (delais.includes('urgent') || delais === '1') {
            statusBadge = '<span class="delai-badge delai-urgent">URGENT</span>';
        } else if (delais.includes('standard') || delais === '5') {
            statusBadge = '<span class="delai-badge delai-standard">Standard</span>';
        } else {
            statusBadge = '<span class="delai-badge delai-rapide">J+1</span>';
        }

        // Status Check
        if (item.rapportFait) {
            statusBadge = '<span class="delai-badge" style="background:#D1FAE5; color:#065F46;">Terminé</span>';
        }

        const div = document.createElement('div');
        div.className = `intervention-item p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${selectedInterventionId === item.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`;
        div.onclick = () => selectIntervention(item.id);

        div.innerHTML = `
            <div class="flex justify-between items-start mb-1">
                <span class="font-bold text-gray-900 line-clamp-1">#${item.ticket}</span>
                ${statusBadge}
            </div>
            <div class="text-sm font-medium text-gray-800 mb-1 line-clamp-1">${item.nomSite}</div>
            <div class="text-xs text-gray-500 flex items-center gap-1 mb-1">
                <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span class="truncate">${item.adresse}</span>
            </div>
            <div class="text-xs text-gray-400">
                ${item.dateProposee || item.dateDemande || ''}
            </div>
        `;

        container.appendChild(div);
    });
}

function getFilteredInterventions() {
    if (!technicien) return [];

    let filtered = ALL_INTERVENTIONS;

    // Filtre Admin vs Région : DESACTIVÉ (Demande user: "pas d'histoire de région")
    // if (!technicien.isAdmin && technicien.region !== 'Admin') {
    //    ...
    // }

    // Search Filter
    const searchInput = document.getElementById('search-input');
    if (searchInput && searchInput.value) {
        const term = searchInput.value.toLowerCase();
        filtered = filtered.filter(i =>
            String(i.ticket || '').toLowerCase().includes(term) ||
            String(i.nomSite || '').toLowerCase().includes(term) ||
            String(i.adresse || '').toLowerCase().includes(term)
        );
    }

    // Status Filter
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter && statusFilter.value !== 'all') {
        const val = statusFilter.value;
        if (val === 'todo') {
            filtered = filtered.filter(i => !i.rapportFait);
        } else if (val === 'done') {
            filtered = filtered.filter(i => i.rapportFait);
        }
    }

    // Tri par date (plus récent en premier)
    return filtered.sort((a, b) => {
        // Fallback date logic
        const dateA = new Date(a.dateIntervention || a.dateProposee || a.dateDemande || 0);
        const dateB = new Date(b.dateIntervention || b.dateProposee || b.dateDemande || 0);
        return dateB - dateA;
    });
}

// ==========================================
// SELECTION & DETAILS
// ==========================================

function selectIntervention(id) {
    selectedInterventionId = id;

    // Refresh list to show selection state
    renderInterventionsList();

    const item = ALL_INTERVENTIONS.find(i => i.id === id);
    if (item) {
        showInterventionDetails(item);

        // Center map if available
        if (window.map && item.lat && item.lng) {
            window.map.setView([item.lat, item.lng], 16);
            // Open associated popup if possible
            // We would need to reference markers map, but simplifying here
        }

        // Mobile view switch
        if (window.innerWidth < 1024) {
            // Logic to switch to map view or details view on mobile
            // For now, assuming map view is where details might also be shown or user manually switches
        }
    }
}

function showInterventionDetails(item) {
    const detailsPanel = document.getElementById('details-panel');
    if (!detailsPanel) return;

    detailsPanel.classList.remove('hidden');

    // Fill static details
    setText('detail-ticket', item.ticket);
    setText('detail-site', item.nomSite);
    setText('detail-adresse', item.adresse);
    setText('detail-desc', item.descriptionProbleme || 'Aucune description disponible.');
    setText('detail-date', item.dateProposee || item.dateDemande || '-');
    setText('detail-technicien', item.technicien || '-');

    // Dynamic Fields (Form)
    // Pre-fill form if report already exists? 
    // Usually reports are separate actions.
    // Ensure form is reset or clear for new action

    // Setup Report Form context
    const reportForm = document.getElementById('report-form');
    if (reportForm) {
        // Pre-fill ticket info in form header
        setText('form-ticket', `Ticket: ${item.ticket}`);
        setText('form-site-name', item.nomSite);
        setText('form-address', item.adresse);

        // If editing an existing report (if we support that):
        // (Logic omitted for simplicity, treating as new report entry)
    }
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text || '-';
}

// Make selectIntervention global for map onclick
window.selectIntervention = selectIntervention;

// ==========================================
// INTERACTION FORMULAIRE
// ==========================================

function initEventListeners() {
    // Auth Form
    const authForm = document.getElementById('auth-form');
    if (authForm) {
        authForm.addEventListener('submit', handleAuthSubmit);
    }

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Tabs
    initTabsListeners();

    // Search & Filter Listeners
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }

    // Quick Actions & Dictée (Productivity)
    initProductivityFeatures();
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    const pass = document.getElementById('password').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');

    if (!pass) {
        showToast('Veuillez entrer un mot de passe', 'error');
        return;
    }

    // Désactiver le bouton pendant la vérification
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Vérification...';
    }

    try {
        // Utiliser la fonction de vérification centralisée
        const userInfo = typeof verifyPassword === 'function'
            ? await verifyPassword(pass)
            : null;

        let role, isAdmin;

        if (userInfo) {
            role = userInfo.role;
            isAdmin = userInfo.isAdmin;
        } else {
            // Fallback direct si verifyPassword n'existe pas
            if (pass === 'JCSM2025') {
                role = 'Admin';
                isAdmin = true;
            } else if (pass === 'technicien') {
                role = 'Technicien';
                isAdmin = false;
            } else {
                showToast('Mot de passe incorrect', 'error');
                return;
            }
        }

        // Créer une session sécurisée
        if (typeof createSession === 'function') {
            createSession(role, isAdmin);
        }

        // Success!
        if (window.triggerConfetti) window.triggerConfetti();

        // Store auth data (compatibilité)
        localStorage.setItem('tech_region', isAdmin ? 'Admin' : 'Technicien');
        localStorage.setItem('is_admin', isAdmin);
        localStorage.setItem('user_role', role);

        document.getElementById('auth-modal').style.display = 'none';
        showToast(`Connexion réussie (${role})`, 'success');

        // Recharger app
        location.reload();
    } catch (err) {
        console.error('Erreur auth:', err);
        showToast('Erreur de connexion', 'error');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Se connecter';
        }
    }
}

function handleLogout() {
    localStorage.removeItem('tech_region');
    localStorage.removeItem('is_admin');
    localStorage.removeItem('user_role');
    location.reload();
}

// ==========================================
// TABS & NAVIGATION
// ==========================================

function initTabsListeners() {
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
}

function switchTab(tabId) {
    // UI Update Buttons
    document.querySelectorAll('.tab-button').forEach(b => {
        b.classList.remove('active', 'text-blue-600', 'border-b-2', 'border-blue-600');
        b.classList.add('text-gray-500');
    });
    const activeBtn = document.querySelector(`[data-tab="${tabId}"]`);
    if (activeBtn) activeBtn.classList.add('active', 'text-blue-600', 'border-b-2', 'border-blue-600');

    // UI Update Content
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const content = document.getElementById(`tab-${tabId}`);
    if (content) content.classList.add('active');

    // Special Actions
    if (tabId === 'map' && window.map) {
        setTimeout(() => window.map.invalidateSize(), 100);
    } else if (tabId === 'dashboard' && window.updateDashboard) {
        window.updateDashboard();
    }
}

// ==========================================
// PRODUCTIVITÉ (VOIX & ACTIONS)
// ==========================================

// ==========================================
// AUTO-REFRESH
// ==========================================
function initAutoRefresh() {
    // Actualisation automatique toutes les 60 minutes (3600000 ms)
    const REFRESH_INTERVAL = 3600000;

    setInterval(() => {
        // console.log('⏰ Auto-refresh des données...');
        fetchData();
    }, REFRESH_INTERVAL);

    // Listener sur bouton actualiser
    const refreshBtn = document.getElementById('import-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Animation spin
            const icon = refreshBtn.querySelector('svg');
            if (icon) icon.classList.add('animate-spin');

            fetchData().then(() => {
                if (icon) icon.classList.remove('animate-spin');
            });
        });
    }
}

// ==========================================
// PRODUCTIVITÉ (VOIX & ACTIONS)
// ==========================================

function initProductivityFeatures() {
    // Chips
    document.querySelectorAll('.quick-action-chip').forEach(chip => {
        chip.addEventListener('click', function () {
            const textToAdd = this.getAttribute('data-text');
            const textarea = document.getElementById('action-realisee');
            if (textarea) {
                textarea.value += (textarea.value ? '\n- ' : '- ') + textToAdd;
                showToast('Action ajoutée', 'info', 1000);
            }
        });
    });
}

// Voice
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    document.querySelectorAll('.mic-btn').forEach(btn => {
        const recognition = new SpeechRecognition();
        recognition.lang = 'fr-FR';

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            recognition.start();
            btn.classList.add('text-red-500', 'animate-pulse');
        });

        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (input) input.value += (input.value ? ' ' : '') + text;
        };

        recognition.onend = () => {
            btn.classList.remove('text-red-500', 'animate-pulse');
            showToast('Dictée terminée', 'success');
        };
    });
}

// ==========================================
// HELPERS UI
// ==========================================

function renderSkeleton() {
    const list = document.getElementById('interventions-list');
    if (!list) return;

    let html = '';
    for (let i = 0; i < 5; i++) {
        html += `
            <div class="skeleton-card">
                <div class="flex justify-between items-start mb-2">
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-text" style="width: 20px;"></div>
                </div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text" style="width: 40%;"></div>
            </div>
        `;
    }
    list.innerHTML = html;
}

// ==========================================
// EXPORT CSV (Admin)
// ==========================================
// Fonctionnalité déplacée ici pour centraliser les events
const btnExportCsv = document.getElementById('btn-export-csv');
if (btnExportCsv) {
    btnExportCsv.addEventListener('click', function () {
        if (!confirm("Voulez-vous exporter l'ensemble des interventions en CSV ?")) return;

        if (localStorage.getItem('user_role') !== 'Admin') {
            showToast("Fonctionnalité réservée aux administrateurs.", "error");
            return;
        }

        if (typeof ALL_INTERVENTIONS !== 'undefined' && ALL_INTERVENTIONS.length > 0) {
            exportToCSV(ALL_INTERVENTIONS);
            showToast("Export CSV généré !", "success");
        } else {
            showToast("Aucune donnée à exporter.", "warning");
        }
    });
}

function exportToCSV(data) {
    const headers = ['Ticket', 'Date', 'Site', 'Adresse', 'Technicien', 'Statut', 'Problème', 'Action Réalisée', 'Lat', 'Lng'];
    const csvRows = [headers.join(';')];

    for (const row of data) {
        const clean = (text) => text ? text.toString().replace(/;/g, ',').replace(/\n/g, ' ').trim() : '';
        const values = [
            clean(row.ticket),
            clean(row.dateIntervention),
            clean(row.nomSite),
            clean(row.adresse),
            clean(row.tech),
            clean(row.statut),
            clean(row.probleme),
            clean(row.actionRealisee),
            clean(row.lat),
            clean(row.lng)
        ];
        csvRows.push(values.join(';'));
    }

    const csvString = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'jcsm_export_' + new Date().toISOString().slice(0, 10) + '.csv';
    link.click();
}

// ==========================================
// AUTO-START
// ==========================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}

// Exposer pour les autres modules
window.ALL_INTERVENTIONS = ALL_INTERVENTIONS;
// Note: Comme ce sont des modules scripts (non ES6 modules pour l'instant), les vars globales sont partagées.
