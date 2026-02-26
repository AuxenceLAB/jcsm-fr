/**
 * JCSM Internal Portal - Utilities
 * Version 2.0 (Modular)
 */

// ==========================================
// TOAST NOTIFICATIONS (Remplacement alert)
// ==========================================

/**
 * Affiche une notification non-bloquante (Toast)
 * @param {string} message - Le message à afficher
 * @param {string} type - 'success', 'error', 'info', 'warning'
 * @param {number} duration - Durée en ms (défaut 3000)
 */
function showToast(message, type = 'info', duration = 3000) {
    // Créer le conteneur s'il n'existe pas
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed top-4 right-4 z-[99999] flex flex-col gap-2';
        document.body.appendChild(container); // Utiliser body pour être sûr d'être au dessus
    }

    // Config couleurs/icones
    const configs = {
        success: { bg: 'bg-green-500', icon: '✅' },
        error: { bg: 'bg-red-500', icon: '❌' },
        warning: { bg: 'bg-orange-500', icon: '⚠️' },
        info: { bg: 'bg-blue-500', icon: 'ℹ️' }
    };
    const config = configs[type] || configs.info;

    // Créer le toast
    const toast = document.createElement('div');
    toast.className = `${config.bg} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] transform transition-all duration-300 translate-x-full opacity-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    const iconSpan = document.createElement('span');
    iconSpan.className = 'text-xl';
    iconSpan.setAttribute('aria-hidden', 'true');
    iconSpan.textContent = config.icon;
    const msgDiv = document.createElement('div');
    msgDiv.className = 'flex-1 text-sm font-medium';
    msgDiv.textContent = message;
    toast.appendChild(iconSpan);
    toast.appendChild(msgDiv);

    // Ajouter au DOM
    container.appendChild(toast);

    // Animation Entrée
    requestAnimationFrame(() => {
        toast.classList.remove('translate-x-full', 'opacity-0');
    });

    // Animation Sortie & Suppression
    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => {
            toast.remove();
            if (container.children.length === 0) {
                container.remove();
            }
        }, 300);
    }, duration);
}

// ==========================================
// HTML ESCAPE (Prévention XSS)
// ==========================================

/**
 * Échappe les caractères HTML dangereux
 * @param {*} str - Valeur à échapper
 * @returns {string} Chaîne échappée
 */
function escapeHtml(str) {
    if (str == null) return '';
    const d = document.createElement('div');
    d.textContent = String(str);
    return d.innerHTML;
}
window.escapeHtml = escapeHtml;

// ==========================================
// DATE FORMATTERS
// ==========================================

function formatDateFr(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    }).format(date);
}

// ==========================================
// EXPORTS GLOBALS (Pour compatibilité)
// ==========================================
window.showToast = showToast;
window.formatDateFr = formatDateFr;

// ==========================================
// OFFLINE INDICATOR (UX Premium)
// ==========================================
function initOfflineIndicator() {
    window.addEventListener('online', () => {
        showToast("Connexion rétablie ! 🚀", 'success');
        document.body.classList.remove('offline-mode');
    });

    window.addEventListener('offline', () => {
        showToast("Vous êtes hors ligne. Mode dégradé activé. 📡", 'warning', 5000);
        document.body.classList.add('offline-mode');
    });

    if (!navigator.onLine) {
        document.body.classList.add('offline-mode');
    }
}

// Auto-init si chargé
initOfflineIndicator();

