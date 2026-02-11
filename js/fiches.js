/**
 * JCSM Internal Portal - Fiches Méthodes
 * Gère l'affichage, la création et le stockage local des fiches méthodes.
 */

let ALL_FICHES = [];

// HTML escape — utilise la fonction centralisée de utils.js, fallback local
const escF = typeof window.escapeHtml === 'function'
    ? window.escapeHtml
    : (s => { if (s == null) return ''; const d = document.createElement('div'); d.textContent = String(s); return d.innerHTML; });

// Données par défaut si le localStorage est vide
const DEFAULT_FICHES = [
    {
        id: 'f1',
        titre: 'Procédure Installation Borne IRVE',
        categorie: 'Installation',
        auteur: 'JCSM Tech',
        date: '2024-01-01',
        description: 'Étapes standard pour la pose et le raccordement d\'une borne 22kW.',
        image: 'https://images.unsplash.com/photo-1669223789304-7a13bd5ce81e?q=80&w=600&auto=format&fit=crop'
    },
    {
        id: 'f2',
        titre: 'Remplacement Connecteur T2',
        categorie: 'Maintenance',
        auteur: 'JCSM Tech',
        date: '2024-02-15',
        description: 'Guide sécurité pour le changement de prise T2 endommagée.',
        image: 'https://images.unsplash.com/photo-1544724569-5f546fd6dd2d?q=80&w=600&auto=format&fit=crop'
    }
];

function initFiches() {
    loadFiches();
    renderFiches();
    initFichesListeners();
}

function loadFiches() {
    try {
        const stored = localStorage.getItem('fiches_v1');
        if (stored) {
            ALL_FICHES = JSON.parse(stored);
        } else {
            ALL_FICHES = [...DEFAULT_FICHES];
            saveFiches(); // Initialiser le storage
        }
    } catch (e) {
        // Erreur chargement fiches
        ALL_FICHES = [...DEFAULT_FICHES];
    }
}

function saveFiches() {
    try {
        localStorage.setItem('fiches_v1', JSON.stringify(ALL_FICHES));
    } catch (e) {
        // Erreur sauvegarde fiches
        if (typeof showToast === 'function') showToast('Espace de stockage plein ou erreur locale.', 'error');
    }
}

function renderFiches() {
    const container = document.getElementById('fiches-container');
    if (!container) return;

    container.innerHTML = '';

    if (ALL_FICHES.length === 0) {
        container.innerHTML = `<div class="text-center text-gray-400 p-8">Aucune fiche disponible.</div>`;
        return;
    }

    ALL_FICHES.forEach(fiche => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col md:flex-row';

        // Image placeholder si pas d'image
        const imgUrl = fiche.image || 'https://via.placeholder.com/150?text=JCSM';

        card.innerHTML = `
            <div class="md:w-1/4 h-48 md:h-auto bg-gray-200 relative">
                <img src="${escF(imgUrl)}" alt="${escF(fiche.titre)}" class="absolute inset-0 w-full h-full object-cover">
            </div>
            <div class="p-6 flex-1 flex flex-col justify-between">
                <div>
                    <div class="flex justify-between items-start mb-2">
                        <span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded uppercase tracking-wide">${escF(fiche.categorie || 'Général')}</span>
                        <span class="text-xs text-gray-500">${escF(fiche.date || '-')}</span>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2">${escF(fiche.titre)}</h3>
                    <p class="text-gray-600 line-clamp-2 mb-4">${escF(fiche.description || 'Pas de description.')}</p>
                </div>
                <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                    <span class="text-sm text-gray-500 flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        ${escF(fiche.auteur || 'Anonyme')}
                    </span>
                    <button class="btn-lire-fiche text-blue-600 hover:text-blue-800 font-medium text-sm">Lire la fiche →</button>
                </div>
            </div>
        `;
        card.querySelector('.btn-lire-fiche')?.addEventListener('click', () => {
            if (typeof showToast === 'function') showToast('Fonctionnalité de visualisation complète à venir', 'info');
        });
        container.appendChild(card);
    });
}

function initFichesListeners() {
    // Bouton "+"
    const btnAdd = document.getElementById('btn-add-fiche');
    const modal = document.getElementById('modal-fiche');
    const btnClose = document.getElementById('close-modal-fiche');
    const form = document.getElementById('fiche-form');

    // ARIA for modal
    if (modal) {
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-label', 'Nouvelle fiche méthode');
    }

    if (btnAdd && modal) {
        btnAdd.addEventListener('click', () => {
            modal.style.display = 'flex';
        });
    }

    if (btnClose && modal) {
        btnClose.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // Gestion soumission formulaire
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const titre = (document.getElementById('fiche-titre').value || '').trim();
            const cat = document.getElementById('fiche-categorie') ? document.getElementById('fiche-categorie').value.trim() : 'Divers';
            const desc = document.getElementById('fiche-contenu') ? document.getElementById('fiche-contenu').value.trim() : '';

            // Validate required fields
            if (!titre || titre.length < 2) {
                if (typeof showToast === 'function') showToast('Le titre doit contenir au moins 2 caractères', 'warning');
                return;
            }
            if (titre.length > 200) {
                if (typeof showToast === 'function') showToast('Le titre ne doit pas dépasser 200 caractères', 'warning');
                return;
            }

            // Création nouvelle fiche
            const newFiche = {
                id: 'f_' + Date.now(),
                titre: titre,
                categorie: cat,
                auteur: (localStorage.getItem('tech_region') === 'Admin' ? 'Admin' : 'Technicien'),
                date: new Date().toLocaleDateString('fr-FR'),
                description: desc,
                image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?q=80&w=600&auto=format&fit=crop' // Image générique par défaut
            };

            ALL_FICHES.unshift(newFiche); // Ajouter au début
            saveFiches();
            renderFiches();

            // Reset & Close
            form.reset();
            modal.style.display = 'none';
            if (window.showToast) showToast('Fiche créée avec succès', 'success');
        });
    }
}

// Expose to global scope
window.initFiches = initFiches;
