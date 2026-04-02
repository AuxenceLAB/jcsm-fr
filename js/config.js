const JCSM_CONFIG = {
    api: {
        googleSheets: "/api/proxy-sheets.php",
        loginEndpoint: "/api/login.php",
        interventions: "/api/interventions.php",
        fiches: "/api/fiches.php",
        rapports: "/api/save-rapport.php",
        listRapports: "/api/list-rapports.php",
        webhookProxy: "/api/webhook-proxy.php",
        aiReformulate: "/api/ai-reformulate.php",
        twilioProxy: "/api/twilio-proxy.php",
        twilioVoiceToken: "/api/twilio-voice-token.php",
        conversations: "/api/conversations.php",
        callLogs: "/api/call-logs.php",
        interventionLink: "/api/intervention-link.php"
    },
    auth: {
        loginEndpoint: "/api/login.php",
        sessionKey: "jcsm_auth_session",
        sessionDuration: 8 * 60 * 60 * 1000   /* 8 hours in ms */
    },
    cache: {
        prefix: "jcsm_",
        interventionsTTL: 60 * 60 * 1000,      /* 1 hour */
        fichesTTL: 30 * 60 * 1000               /* 30 minutes */
    },
    refresh: {
        interval: 60 * 60 * 1000,               /* 1 hour */
        backgroundSync: true
    },
    chatbot: {
        apiEndpoint: "/api/chatbot.php",
        apiTimeout: 35000,                       /* 35s (must exceed backend 30s curl timeout) */
        maxMessageLength: 1000,
        leadThreshold: 3,                        /* show lead form after N user messages */
        historyLimit: 20,                        /* max messages sent to API for context */
        sessionKey: "jcsm_chatbot",
        hintDelay: 15000,                        /* ms before showing notification badge */
        greeting: "Bonjour ! Je suis l'assistant JCSM, sp\u00e9cialiste en bornes de recharge \u00e9lectrique (IRVE). Comment puis-je vous aider ?"
    },
    version: "2.43.0",
    buildDate: "2026-04-02"
};

async function verifyPassword(e) {
    try {
        const t = await fetch(JCSM_CONFIG.api.loginEndpoint || "/api/login.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: e })
        });
        if (!t.ok) return null;
        const o = await t.json();
        if (o.success && o.token) return { role: o.role, isAdmin: o.isAdmin, token: o.token };
    } catch (e) { /* auth error */ }
    return null;
}

function getAuthHeaders() {
    const e = localStorage.getItem(JCSM_CONFIG.auth.sessionKey);
    if (!e) return {};
    try {
        const t = JSON.parse(e);
        if (t.token) return { Authorization: "Bearer " + t.token, "X-Requested-With": "XMLHttpRequest" };
    } catch (e) { /* parse error */ }
    return {};
}

function isSessionValid() {
    const e = localStorage.getItem(JCSM_CONFIG.auth.sessionKey);
    if (!e) return false;
    try {
        const t = JSON.parse(e);
        if (Date.now() > t.expires) {
            localStorage.removeItem(JCSM_CONFIG.auth.sessionKey);
            return false;
        }
        return t;
    } catch (e) {
        localStorage.removeItem(JCSM_CONFIG.auth.sessionKey);
        return false;
    }
}

function createSession(e, t, o) {
    const n = {
        role: e,
        isAdmin: t,
        created: Date.now(),
        expires: Date.now() + JCSM_CONFIG.auth.sessionDuration,
        token: o || (typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : Array.from(crypto.getRandomValues(new Uint8Array(16)), e => e.toString(16).padStart(2, "0")).join(""))
    };
    localStorage.setItem(JCSM_CONFIG.auth.sessionKey, JSON.stringify(n));
    return n;
}

function destroySession() {
    try {
        localStorage.removeItem(JCSM_CONFIG.auth.sessionKey);
        localStorage.removeItem("tech_region");
        localStorage.removeItem("is_admin");
        localStorage.removeItem("user_role");
        localStorage.removeItem("jcsm_user");
        Object.keys(localStorage).filter(k => k.startsWith("jcsm_")).forEach(k => localStorage.removeItem(k));
    } catch (e) {
        /* silent fail — cleanup best-effort */
    }
}

window.JCSM_CONFIG = JCSM_CONFIG;
window.verifyPassword = verifyPassword;
window.isSessionValid = isSessionValid;
window.createSession = createSession;
window.destroySession = destroySession;
window.getAuthHeaders = getAuthHeaders;

if (!document.querySelector("#jcsm-toast-styles")) {
    const e = document.createElement("style");
    e.id = "jcsm-toast-styles";
    e.textContent = "\n        @keyframes slideIn {\n            from { transform: translateX(100%); opacity: 0; }\n            to { transform: translateX(0); opacity: 1; }\n        }\n        @keyframes slideOut {\n            from { transform: translateX(0); opacity: 1; }\n            to { transform: translateX(100%); opacity: 0; }\n        }\n    ";
    document.head.appendChild(e);
}
