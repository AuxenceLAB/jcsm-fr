/**
 * utils.js - Shared utilities: toast, escapeHtml, date formatting, offline indicator
 * Fixed: toast uses textContent (XSS-safe), proper DOM construction,
 *        offline listeners properly scoped, escapeHtml uses standard pattern
 */

/**
 * Show a toast notification (XSS-safe: uses textContent, not innerHTML).
 */
function showToast(message, type, duration) {
    type = type || "info";
    duration = duration || 3000;

    var container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.className = "fixed top-4 right-4 z-[99999] flex flex-col gap-2";
        document.body.appendChild(container);
    }

    var styles = {
        success: { bg: "bg-green-500", icon: "\u2705" },
        error:   { bg: "bg-red-500",   icon: "\u274C" },
        warning: { bg: "bg-orange-500", icon: "\u26A0\uFE0F" },
        info:    { bg: "bg-blue-500",   icon: "\u2139\uFE0F" }
    };
    var s = styles[type] || styles.info;

    var toast = document.createElement("div");
    toast.className = s.bg + " text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] transform transition-all duration-300 translate-x-full opacity-0";
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");

    var iconSpan = document.createElement("span");
    iconSpan.className = "text-xl";
    iconSpan.setAttribute("aria-hidden", "true");
    iconSpan.textContent = s.icon;

    var textDiv = document.createElement("div");
    textDiv.className = "flex-1 text-sm font-medium";
    textDiv.textContent = message;

    toast.appendChild(iconSpan);
    toast.appendChild(textDiv);
    container.appendChild(toast);

    requestAnimationFrame(function () {
        toast.classList.remove("translate-x-full", "opacity-0");
    });

    setTimeout(function () {
        toast.classList.add("translate-x-full", "opacity-0");
        setTimeout(function () {
            toast.remove();
            if (container.children.length === 0) {
                container.remove();
            }
        }, 300);
    }, duration);
}

/**
 * Escape HTML entities to prevent XSS.
 */
function escapeHtml(str) {
    if (str == null) return "";
    var div = document.createElement("div");
    div.textContent = String(str);
    return div.innerHTML;
}

/**
 * Format a date string in French locale (dd/mm/yyyy).
 */
function formatDateFr(dateStr) {
    if (!dateStr) return "";
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
}

/**
 * Show online/offline toast notifications.
 */
function initOfflineIndicator() {
    try {
        var t = window.JCSM_I18N ? window.JCSM_I18N.t : function (k) { return k; };

        window.addEventListener("online", function () {
            showToast(t("onlineRestored"), "success");
            document.body.classList.remove("offline-mode");
        });

        window.addEventListener("offline", function () {
            showToast(t("offlineMode"), "warning", 5000);
            document.body.classList.add("offline-mode");
        });

        if (!navigator.onLine) {
            document.body.classList.add("offline-mode");
        }
    } catch (e) {
        /* silent fail — offline indicator non-critical */
    }
}

window.escapeHtml = escapeHtml;
window.showToast = showToast;
window.formatDateFr = formatDateFr;
initOfflineIndicator();
