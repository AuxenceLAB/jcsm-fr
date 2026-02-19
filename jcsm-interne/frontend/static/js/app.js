/**
 * JCSM Interne — Application JavaScript
 * Utilitaires communs pour toutes les vues.
 */

const API = {
    async request(url, options = {}) {
        const defaults = {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
        };
        const res = await fetch(url, { ...defaults, ...options });
        if (res.status === 401) {
            window.location.href = '/interne';
            return null;
        }
        if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: 'Erreur serveur' }));
            throw new Error(err.detail || `Erreur ${res.status}`);
        }
        if (res.status === 204) return null;
        return res.json();
    },

    get(url) { return this.request(url); },

    post(url, body) {
        return this.request(url, { method: 'POST', body: JSON.stringify(body) });
    },

    put(url, body) {
        return this.request(url, { method: 'PUT', body: JSON.stringify(body) });
    },

    delete(url) {
        return this.request(url, { method: 'DELETE' });
    },

    async uploadFiles(url, files) {
        const formData = new FormData();
        for (const file of files) {
            formData.append('files', file);
        }
        const res = await fetch(url, {
            method: 'POST',
            credentials: 'include',
            body: formData,
        });
        if (!res.ok) throw new Error('Erreur upload');
        return res.json();
    },
};

// ── Statuts ──
const STATUTS = {
    a_planifier: { label: 'A planifier', class: 'badge-a_planifier', icon: '' },
    assignee: { label: 'Assignee', class: 'badge-assignee', icon: '' },
    notifiee: { label: 'Notifiee', class: 'badge-notifiee', icon: '' },
    en_route: { label: 'En route', class: 'badge-en_route', icon: '' },
    sur_site: { label: 'Sur site', class: 'badge-sur_site', icon: '' },
    terminee: { label: 'Terminee', class: 'badge-terminee', icon: '' },
    rapport_fait: { label: 'Rapport fait', class: 'badge-rapport_fait', icon: '' },
    facturee: { label: 'Facturee', class: 'badge-facturee', icon: '' },
    payee: { label: 'Payee', class: 'badge-payee', icon: '' },
};

function statutBadge(statut) {
    const s = STATUTS[statut] || { label: statut, class: '', icon: '' };
    return `<span class="badge ${s.class}">${s.icon} ${s.label}</span>`;
}

// ── Toast ──
function toast(message, type = 'success') {
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.textContent = message;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
        el.classList.remove('show');
        setTimeout(() => el.remove(), 300);
    }, 3000);
}

// ── Formatage ──
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR');
}

function formatMoney(amount) {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
}

// ── User info ──
async function getCurrentUser() {
    try {
        return await API.get('/api/auth/me');
    } catch {
        window.location.href = '/interne';
        return null;
    }
}

async function logout() {
    await API.post('/api/auth/logout');
    window.location.href = '/interne';
}
