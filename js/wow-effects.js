/**
 * wow-effects.js - une seule séquence de mouvement : l'apparition des sections
 * sous la ligne de flottaison (fondu d'opacité 0,3 s), et le défilement doux
 * vers les ancres. Rien au premier écran, rien sous prefers-reduced-motion.
 * Plus de compteurs, de barre de progression, de logos qui défilent ni de rebonds.
 */
!function () {
    "use strict";

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (!document.getElementById("jcsm-wow-styles")) {
        var styleEl = document.createElement("style");
        styleEl.id = "jcsm-wow-styles";
        styleEl.textContent = ".js-loaded .will-reveal { opacity: 0; transition: opacity .3s ease-out; }\n.revealed { opacity: 1 !important; }";
        document.head.appendChild(styleEl);
    }

    document.documentElement.classList.add("js-loaded");

    document.addEventListener("DOMContentLoaded", function () {

        // ─── Apparition des sections (une fois) ───
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("revealed");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0, rootMargin: "0px 0px -10% 0px" });

        var viewport = window.innerHeight;
        var pending = [];
        document.querySelectorAll(".section-appear").forEach(function (el) {
            // Déjà à l'écran ou plus haut que la fenêtre : jamais masqué.
            var rect = el.getBoundingClientRect();
            if (rect.top < viewport || rect.height > viewport * 0.9) return;
            pending.push(el);
        });
        pending.forEach(function (el) {
            el.classList.add("will-reveal");
            observer.observe(el);
        });

        // Filet de sécurité : tout est visible après 3,5 s
        setTimeout(function () {
            document.querySelectorAll(".will-reveal:not(.revealed)").forEach(function (el) {
                el.classList.add("revealed");
            });
        }, 3500);

        // ─── Défilement doux vers les ancres ───
        document.querySelectorAll('a[href^="#"]').forEach(function (link) {
            link.addEventListener("click", function (e) {
                var href = this.getAttribute("href");
                if (href === "#" || this.classList.contains("skip-link")) return;
                var target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    var top = target.getBoundingClientRect().top + window.pageYOffset - 100;
                    window.scrollTo({ top: top, behavior: "smooth" });

                    var mobileMenu = document.getElementById("mobile-menu");
                    if (mobileMenu && mobileMenu.classList.contains("open")) {
                        mobileMenu.classList.remove("open");
                        var overlay = document.getElementById("mobile-menu-overlay");
                        if (overlay) overlay.classList.remove("active");
                        document.body.style.overflow = "";
                    }
                }
            });
        });
    });
}();
