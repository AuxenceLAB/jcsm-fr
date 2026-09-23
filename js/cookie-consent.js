/**
 * cookie-consent.js - GDPR cookie banner with GTM conditional loading
 * Safe DOM construction (no innerHTML), non-modal keyboard support and ARIA,
 * responsive design matching site premium style.
 */
!function () {
    try {
        var STORAGE_KEY = "jcsm_cookie_consent";
        var STORAGE_TS_KEY = "jcsm_cookie_consent_ts";
        var MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000; // 12 months
        var consent = localStorage.getItem(STORAGE_KEY);
        var consentTs = Number(localStorage.getItem(STORAGE_TS_KEY));
        var consentAge = Date.now() - consentTs;
        // Missing, invalid, future or expired choices require a fresh decision.
        if (consent && ((consent !== "accepted" && consent !== "rejected")
            || !Number.isFinite(consentTs) || consentTs <= 0
            || consentAge < 0 || consentAge >= MAX_AGE_MS)) {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(STORAGE_TS_KEY);
            consent = null;
        }

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

            // Inject styles once
            if (!document.getElementById("cookie-banner-styles")) {
                var style = document.createElement("style");
                style.id = "cookie-banner-styles";
                style.textContent = [
                    "#cookie-banner{position:fixed;bottom:0;left:0;right:0;z-index:9999;padding:1rem 1.5rem;background:#fff;border-top:1px solid rgba(32,91,196,0.08);box-shadow:0 -8px 32px rgba(0,0,0,0.06);transform:translateY(100%);animation:cookieSlideUp .4s cubic-bezier(.22,1,.36,1) forwards;animation-delay:.5s;opacity:0}",
                    "@keyframes cookieSlideUp{to{transform:translateY(0);opacity:1}}",
                    "body:has(#mobile-menu.open) #cookie-banner{display:none}",
                    "#cookie-banner .cookie-inner{max-width:72rem;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1rem}",
                    "#cookie-banner .cookie-text{font-size:0.875rem;color:#374151;flex:1;min-width:240px;margin:0;line-height:1.6}",
                    "#cookie-banner .cookie-link{color:#205BC4;text-decoration:underline;text-underline-offset:2px;transition:color .2s ease}",
                    "#cookie-banner .cookie-link:hover{color:#19499F}",
                    "#cookie-banner .cookie-btns{display:flex;gap:0.5rem;flex-shrink:0}",
                    "#cookie-banner .cookie-btn{padding:0.5rem 1.25rem;min-height:44px;font-size:0.875rem;font-weight:500;border-radius:0.5rem;cursor:pointer;transition:all .2s ease;font-family:inherit;line-height:1.4}",
                    "#cookie-banner .cookie-btn:focus-visible{outline:2px solid #205BC4;outline-offset:2px}",
                    "#cookie-banner .cookie-reject{border:1.5px solid #d1d5db;background:#fff;color:#374151}",
                    "#cookie-banner .cookie-reject:hover{border-color:#205BC4;color:#19499F;background:#EAF1FF}",
                    "#cookie-banner .cookie-accept{border:none;background:#205BC4;color:#fff;box-shadow:0 2px 8px rgba(32,91,196,0.25)}",
                    "#cookie-banner .cookie-accept:hover{background:#19499F;box-shadow:0 4px 12px rgba(32,91,196,0.35);transform:translateY(-1px)}",
                    "@media(max-width:640px){#cookie-banner{padding:1rem}#cookie-banner .cookie-inner{flex-direction:column;text-align:center;gap:0.75rem}#cookie-banner .cookie-btns{width:100%;justify-content:center}#cookie-banner .cookie-btn{flex:1;min-height:44px;justify-content:center}}"
                ].join("");
                document.head.appendChild(style);
            }

            // Textes dans la langue de la page (repli : français). Seules fr et en ont une page de confidentialité.
            var TEXTS = {
                fr: ["On utilise des cookies pour analyser notre trafic. Rien de plus. ", "Politique de confidentialité", "Refuser", "Accepter", "Gestion des cookies", "/confidentialite"],
                en: ["We use cookies to analyse our traffic. Nothing more. ", "Privacy policy", "Decline", "Accept", "Cookie settings", "/en/privacy"],
                de: ["Wir verwenden Cookies, um unseren Traffic zu analysieren. Mehr nicht. ", "Datenschutzerklärung (EN)", "Ablehnen", "Akzeptieren", "Cookie-Einstellungen", "/en/privacy"],
                es: ["Usamos cookies para analizar nuestro tráfico. Nada más. ", "Política de privacidad (EN)", "Rechazar", "Aceptar", "Gestión de cookies", "/en/privacy"],
                it: ["Utilizziamo i cookie per analizzare il nostro traffico. Niente di più. ", "Informativa privacy (EN)", "Rifiuta", "Accetta", "Gestione dei cookie", "/en/privacy"],
                nl: ["We gebruiken cookies om ons verkeer te analyseren. Meer niet. ", "Privacybeleid (EN)", "Weigeren", "Accepteren", "Cookiebeheer", "/en/privacy"],
                pl: ["Używamy plików cookie do analizy ruchu na stronie. Nic więcej. ", "Polityka prywatności (EN)", "Odrzuć", "Akceptuj", "Zarządzanie plikami cookie", "/en/privacy"],
                pt: ["Usamos cookies para analisar o nosso tráfego. Nada mais. ", "Política de privacidade (EN)", "Recusar", "Aceitar", "Gestão de cookies", "/en/privacy"]
            };
            var lang = (document.documentElement.lang || "fr").slice(0, 2).toLowerCase();
            if (!TEXTS[lang]) lang = "fr";
            var t = TEXTS[lang];

            var banner = document.createElement("div");
            banner.id = "cookie-banner";
            banner.lang = lang;
            banner.setAttribute("role", "dialog");
            banner.setAttribute("aria-label", t[4]);
            banner.setAttribute("aria-describedby", "cookie-desc");

            var wrapper = document.createElement("div");
            wrapper.className = "cookie-inner";

            var text = document.createElement("p");
            text.className = "cookie-text";
            text.id = "cookie-desc";
            text.textContent = t[0];
            var link = document.createElement("a");
            link.href = t[5];
            if (lang !== "fr" && lang !== "en") link.hreflang = "en";
            link.className = "cookie-link";
            link.textContent = t[1];
            text.appendChild(link);
            wrapper.appendChild(text);

            var btnGroup = document.createElement("div");
            btnGroup.className = "cookie-btns";

            var rejectBtn = document.createElement("button");
            rejectBtn.className = "cookie-btn cookie-reject";
            rejectBtn.textContent = t[2];
            btnGroup.appendChild(rejectBtn);

            var acceptBtn = document.createElement("button");
            acceptBtn.className = "cookie-btn cookie-accept";
            acceptBtn.textContent = t[3];
            btnGroup.appendChild(acceptBtn);

            wrapper.appendChild(btnGroup);
            banner.appendChild(wrapper);
            // Tôt dans l'ordre de tabulation (juste après le lien d'évitement) : pas besoin de
            // parcourir toute la page pour atteindre Refuser / Accepter.
            var skip = document.querySelector(".skip-link");
            if (skip && skip.parentNode === document.body) skip.after(banner);
            else document.body.insertBefore(banner, document.body.firstChild);

            // Tant que le bandeau est affiché, le défilement au clavier garde l'élément
            // focalisé au-dessus de lui (WCAG 2.4.11).
            var root = document.documentElement;
            function reserve() { root.style.scrollPaddingBottom = (banner.offsetHeight + 16) + "px"; }
            reserve();
            window.addEventListener("resize", reserve, { passive: true });

            // Non-modal banner: preserve DOM tab order and never steal focus.
            // Escape rejects optional cookies only when focus is inside the banner.
            banner.addEventListener("keydown", function (e) {
                if (e.key === "Escape") {
                    e.preventDefault();
                    rejectBtn.click();
                    return;
                }
            });

            function dismiss() {
                window.removeEventListener("resize", reserve);
                root.style.scrollPaddingBottom = "";
                banner.style.animation = "none";
                banner.style.transform = "translateY(100%)";
                banner.style.opacity = "0";
                banner.style.transition = "transform .3s ease, opacity .3s ease";
                setTimeout(function () { banner.remove(); }, 350);
            }

            acceptBtn.addEventListener("click", function () {
                localStorage.setItem(STORAGE_KEY, "accepted");
                localStorage.setItem(STORAGE_TS_KEY, String(Date.now()));
                dismiss();
                window.dispatchEvent(new Event('jcsm:consent-change'));
                loadGTM();
            });

            rejectBtn.addEventListener("click", function () {
                localStorage.setItem(STORAGE_KEY, "rejected");
                localStorage.setItem(STORAGE_TS_KEY, String(Date.now()));
                dismiss();
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
        /* silent fail : cookie consent non-critical */
    }
}();
