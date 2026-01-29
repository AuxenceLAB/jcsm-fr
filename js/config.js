/**
 * JCSM Configuration Centralisée
 * Gestion des API, authentification et paramètres globaux
 */

const JCSM_CONFIG = {
    // ==========================================
    // API Endpoints
    // ==========================================
    api: {
        // API Google Sheets (pour portail interne admin)
        googleSheets: 'https://script.google.com/macros/s/AKfycbzZxvFsy4yb1gsAdL70zhhMJCdZN-fGUZY4qHct3wMergx6hNX2qTOB0nH86ohBgEjmqA/exec',

        // API locales PHP
        loginEndpoint: '/api/login.php',
        interventions: '/api/interventions.php',
        fiches: '/api/fiches.php',
        rapports: '/api/save-rapport.php',
        listRapports: '/api/list-rapports.php',

        // Webhooks n8n
        webhooks: {
            rapport: 'https://n8n.jcsm.fr/webhook/rapport',
            paiement: 'https://n8n.jcsm.fr/webhook/paiement',
            sms: 'https://n8n.jcsm.fr/webhook/sms',
            notification: 'https://n8n.jcsm.fr/webhook/notification'
        }
    },

    // ==========================================
    // Authentification sécurisée
    // ==========================================
    auth: {
        // Server-side authentication endpoint
        loginEndpoint: '/api/login.php',

        // Clé de session
        sessionKey: 'jcsm_auth_session',
        sessionDuration: 8 * 60 * 60 * 1000, // 8 heures
    },

    // ==========================================
    // Cache et synchronisation
    // ==========================================
    cache: {
        prefix: 'jcsm_',
        interventionsTTL: 60 * 60 * 1000, // 1 heure
        fichesTTL: 30 * 60 * 1000 // 30 minutes
    },

    // ==========================================
    // Auto-refresh
    // ==========================================
    refresh: {
        interval: 60 * 60 * 1000, // 1 heure
        backgroundSync: true
    },

    // ==========================================
    // Version
    // ==========================================
    version: '2.1.0',
    buildDate: '2026-01-28'
};

// ==========================================
// FONCTIONS UTILITAIRES D'AUTHENTIFICATION
// ==========================================

/**
 * Hash un mot de passe avec SHA-256
 * @param {string} password - Mot de passe à hasher
 * @returns {Promise<string>} Hash hexadécimal
 */
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Vérifie un mot de passe via l'API serveur
 * @param {string} password - Mot de passe en clair
 * @returns {Promise<object|null>} Infos utilisateur { role, isAdmin, token } ou null si invalide
 */
async function verifyPassword(password) {
    try {
        const response = await fetch(JCSM_CONFIG.api.loginEndpoint || '/api/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });
        if (!response.ok) return null;
        const data = await response.json();
        if (data.success && data.token) {
            return { role: data.role, isAdmin: data.isAdmin, token: data.token };
        }
    } catch (e) {
        // Auth verification failed silently
    }
    return null;
}

/**
 * Retourne les headers d'authentification pour les appels API protégés
 * @returns {object} Headers avec Authorization Bearer
 */
function getAuthHeaders() {
    const session = localStorage.getItem(JCSM_CONFIG.auth.sessionKey);
    if (!session) return {};
    try {
        const data = JSON.parse(session);
        if (data.token) {
            return { 'Authorization': 'Bearer ' + data.token };
        }
    } catch (e) {}
    return {};
}

/**
 * Vérifie si une session est valide
 * @returns {object|false} Données de session ou false
 */
function isSessionValid() {
    const session = localStorage.getItem(JCSM_CONFIG.auth.sessionKey);
    if (!session) return false;

    try {
        const data = JSON.parse(session);
        const now = Date.now();

        if (now > data.expires) {
            localStorage.removeItem(JCSM_CONFIG.auth.sessionKey);
            return false;
        }

        return data;
    } catch (e) {
        localStorage.removeItem(JCSM_CONFIG.auth.sessionKey);
        return false;
    }
}

/**
 * Crée une nouvelle session
 * @param {string} role - Rôle de l'utilisateur
 * @param {boolean} isAdmin - Est administrateur
 * @returns {object} Données de session
 */
function createSession(role, isAdmin, serverToken) {
    const session = {
        role: role,
        isAdmin: isAdmin,
        created: Date.now(),
        expires: Date.now() + JCSM_CONFIG.auth.sessionDuration,
        token: serverToken || (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36))
    };

    localStorage.setItem(JCSM_CONFIG.auth.sessionKey, JSON.stringify(session));
    return session;
}

/**
 * Détruit la session courante
 */
function destroySession() {
    localStorage.removeItem(JCSM_CONFIG.auth.sessionKey);
    localStorage.removeItem('tech_region');
    localStorage.removeItem('is_admin');
    localStorage.removeItem('user_role');
    localStorage.removeItem('jcsm_user');
}

/**
 * Affiche une notification toast
 * @param {string} message - Message à afficher
 * @param {string} type - Type: success, error, warning, info
 * @param {number} duration - Durée en ms
 */
function showToast(message, type = 'info', duration = 3000) {
    // Utiliser la fonction globale si disponible
    if (typeof window.showToast === 'function' && window.showToast !== showToast) {
        window.showToast(message, type, duration);
        return;
    }

    // Fallback simple
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#2563EB'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-size: 14px;
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ==========================================
// EXPORT GLOBAL
// ==========================================
window.JCSM_CONFIG = JCSM_CONFIG;
window.hashPassword = hashPassword;
window.verifyPassword = verifyPassword;
window.isSessionValid = isSessionValid;
window.createSession = createSession;
window.destroySession = destroySession;
window.getAuthHeaders = getAuthHeaders;

// Style pour les toasts
if (!document.querySelector('#jcsm-toast-styles')) {
    const style = document.createElement('style');
    style.id = 'jcsm-toast-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Config loaded
