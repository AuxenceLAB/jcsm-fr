/**
 * JCSM DEMO — Fluidity layer
 * Améliore la circulation entre pages SANS modifier le visuel.
 *
 * 1. Prefetch des pages au hover des liens (navigation quasi-instantanée)
 * 2. Body fade-in/out doux entre pages
 * 3. Preloader rapide (250ms)
 * 4. Smooth scroll natif + ancres fluides
 * 5. Images : fade-in au chargement
 */
(function () {
  'use strict';

  // ========================================================================
  // 1. PREFETCH AU HOVER (style instant.page)
  // ========================================================================
  // Quand l'utilisateur survole un lien interne > 65ms, on précharge la page.
  // Quand il clique, la page est déjà en cache → navigation instantanée.
  const prefetched = new Set();
  const HOVER_DELAY = 65; // ms — assez court pour être réactif, assez long pour éviter le bruit

  function shouldPrefetch(href) {
    if (!href) return false;
    if (prefetched.has(href)) return false;
    try {
      const url = new URL(href, window.location.href);
      // Same origin only
      if (url.origin !== window.location.origin) return false;
      // Skip anchors, mailto, tel, downloads
      if (url.pathname === window.location.pathname && url.hash) return false;
      // Skip non-html (assets)
      if (/\.(jpg|jpeg|png|webp|svg|gif|css|js|pdf|zip|mp4|webm)$/i.test(url.pathname)) return false;
      return true;
    } catch (e) {
      return false;
    }
  }

  function prefetch(href) {
    if (!shouldPrefetch(href)) return;
    prefetched.add(href);
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    link.as = 'document';
    document.head.appendChild(link);
  }

  let hoverTimer = null;
  document.addEventListener(
    'mouseover',
    (e) => {
      const a = e.target.closest('a[href]');
      if (!a) return;
      const href = a.href;
      if (!shouldPrefetch(href)) return;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => prefetch(href), HOVER_DELAY);
    },
    { passive: true }
  );
  document.addEventListener(
    'mouseout',
    () => clearTimeout(hoverTimer),
    { passive: true }
  );

  // Touch devices : prefetch au touchstart (avant le clic)
  document.addEventListener(
    'touchstart',
    (e) => {
      const a = e.target.closest('a[href]');
      if (a) prefetch(a.href);
    },
    { passive: true, capture: true }
  );

  // ========================================================================
  // 2. PRELOADER RAPIDE (250ms au lieu de 600ms)
  // ========================================================================
  function killPreloader() {
    const p = document.getElementById('preloader');
    if (p) p.classList.add('preloader-auto-hide');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(killPreloader, 250);
    });
  } else {
    setTimeout(killPreloader, 100);
  }

  // ========================================================================
  // 3. BODY FADE-IN AU CHARGEMENT (évite le saut visuel)
  // ========================================================================
  // Le body part à opacity:0 (via CSS) et fade-in dès que le DOM est prêt.
  function fadeInBody() {
    document.body.classList.add('demo-body-ready');
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fadeInBody);
  } else {
    fadeInBody();
  }

  // ========================================================================
  // 4. FADE-OUT au clic sur lien interne (transition entre pages)
  // ========================================================================
  // Subtle : 120ms de fade avant la navigation. L'utilisateur perçoit
  // une transition au lieu d'un "flash blanc".
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // open in new tab
    if (a.target && a.target !== '_self') return;

    try {
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return; // ancres, idem page
      if (/\.(pdf|zip|mp4|webm|jpg|jpeg|png|webp)$/i.test(url.pathname)) return;

      e.preventDefault();
      document.body.classList.add('demo-body-leaving');
      setTimeout(() => {
        window.location.href = a.href;
      }, 120);
    } catch (err) {
      // noop
    }
  });

  // ========================================================================
  // 5. IMAGES : fade-in au chargement
  // ========================================================================
  function fadeInImages() {
    const imgs = document.querySelectorAll('img:not([data-fluid-loaded])');
    imgs.forEach((img) => {
      if (img.complete && img.naturalWidth > 0) {
        img.setAttribute('data-fluid-loaded', '1');
        img.classList.add('demo-img-loaded');
      } else {
        img.addEventListener(
          'load',
          () => {
            img.setAttribute('data-fluid-loaded', '1');
            img.classList.add('demo-img-loaded');
          },
          { once: true }
        );
      }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fadeInImages);
  } else {
    fadeInImages();
  }
  // Re-scan en cas d'images injectées dynamiquement
  new MutationObserver(() => fadeInImages()).observe(document.body, {
    childList: true,
    subtree: true,
  });

  // ========================================================================
  // 6. SMOOTH SCROLL pour les ancres (#anchor)
  // ========================================================================
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const targetId = a.getAttribute('href').slice(1);
    if (!targetId) return;
    const target = document.getElementById(targetId);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // ========================================================================
  // 7. FOCUS visible mais discret au tab
  // ========================================================================
  // (Géré par le CSS, juste ajouter classe sur tab pour différencier de la souris)
  function onTab(e) {
    if (e.key === 'Tab') {
      document.body.classList.add('demo-using-keyboard');
      window.removeEventListener('keydown', onTab);
      window.addEventListener('mousedown', onMouse);
    }
  }
  function onMouse() {
    document.body.classList.remove('demo-using-keyboard');
    window.removeEventListener('mousedown', onMouse);
    window.addEventListener('keydown', onTab);
  }
  window.addEventListener('keydown', onTab);
})();
