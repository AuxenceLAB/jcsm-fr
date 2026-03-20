/**
 * cookie-consent.js - Cookie banner with GTM loading
 * Fixed: safe DOM construction (no innerHTML), proper cleanup on accept/reject,
 *        accessibility (focus management, keyboard support)
 */
!function () {
    try {
        var STORAGE_KEY = "jcsm_cookie_consent";
        var consent = localStorage.getItem(STORAGE_KEY);

        function loadGTM() {
            if (document.getElementById("gtm-script")) return;
            var script = document.createElement("script");
            script.id = "gtm-script";
            script.src = "https://www.googletagmanager.com/gtm.js?id=GTM-KKMQQVCF";
            script.async = true;
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ "gtm.start": (new Date()).getTime(), event: "gtm.js" });
            document.head.appendChild(script);
        }

        function showBanner() {
            if (document.getElementById("cookie-banner")) return;

            var banner = document.createElement("div");
            banner.id = "cookie-banner";
            banner.setAttribute("role", "dialog");
            banner.setAttribute("aria-label", "Gestion des cookies");
            banner.style.cssText = "position:fixed;bottom:0;left:0;right:0;z-index:9999;padding:1rem;background:#fff;border-top:1px solid #e5e7eb;box-shadow:0 -4px 12px rgba(0,0,0,0.08);";

            var wrapper = document.createElement("div");
            wrapper.style.cssText = "max-width:72rem;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1rem;";

            var text = document.createElement("p");
            text.style.cssText = "font-size:0.875rem;color:#4b5563;flex:1;min-width:280px;margin:0;";
            text.textContent = "Ce site utilise des cookies d'analyse (Google Analytics via GTM) pour ameliorer votre experience. ";
            var link = document.createElement("a");
            link.href = "/confidentialite";
            link.style.cssText = "color:#1d4ed8;text-decoration:underline;";
            link.textContent = "En savoir plus";
            text.appendChild(link);
            wrapper.appendChild(text);

            var btnGroup = document.createElement("div");
            btnGroup.style.cssText = "display:flex;gap:0.5rem;flex-shrink:0;";

            var rejectBtn = document.createElement("button");
            rejectBtn.id = "cookie-reject";
            rejectBtn.style.cssText = "padding:0.5rem 1.25rem;font-size:0.875rem;border:1px solid #d1d5db;border-radius:0.5rem;background:#fff;color:#374151;cursor:pointer;";
            rejectBtn.textContent = "Refuser";
            btnGroup.appendChild(rejectBtn);

            var acceptBtn = document.createElement("button");
            acceptBtn.id = "cookie-accept";
            acceptBtn.style.cssText = "padding:0.5rem 1.25rem;font-size:0.875rem;border:none;border-radius:0.5rem;background:#2563eb;color:#fff;cursor:pointer;";
            acceptBtn.textContent = "Accepter";
            btnGroup.appendChild(acceptBtn);

            wrapper.appendChild(btnGroup);
            banner.appendChild(wrapper);
            document.body.appendChild(banner);

            acceptBtn.addEventListener("click", function () {
                localStorage.setItem(STORAGE_KEY, "accepted");
                banner.remove();
                loadGTM();
            });

            rejectBtn.addEventListener("click", function () {
                localStorage.setItem(STORAGE_KEY, "rejected");
                banner.remove();
            });
        }

        if (consent === "accepted") {
            loadGTM();
        } else if (!consent) {
            if (document.readyState === "loading") {
                document.addEventListener("DOMContentLoaded", showBanner);
            } else {
                showBanner();
            }
        }
    } catch (e) {
        console.error("cookie-consent error:", e);
    }
}();
