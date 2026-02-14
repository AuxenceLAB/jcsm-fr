/**
 * JCSM Public Pages Logic
 * Gère le menu mobile, les particules, et les animations de base.
 */

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initMobileMenu();
    initScrollAnimations();
    initSmoothScroll();
    initPageTransitions();
    initPreloader();
    initScrollToTop();
    initLazyLoading();
    initCookieConsent();
    initMagneticButtons();
    initScrollProgress();
    initStatsCounters();
    initParallax();
    initSpotlightCards();
    initSmoothHoverTransitions();
    initFAQAccessibility();
    initAccessibilityEnhancements();
    initToastNotifications();
    // Professional features
    initFormValidation();
    initButtonLoadingStates();
    initScrollSpy();
    initKeyboardNavigation();
    initTouchFeedback();
    initLiveFormFeedback();
});

// ==========================================
// FAQ ACCESSIBILITY
// ==========================================
function initFAQAccessibility() {
    const details = document.querySelectorAll('details');
    details.forEach(detail => {
        const summary = detail.querySelector('summary');
        if (summary) {
            // Update aria-expanded on toggle
            detail.addEventListener('toggle', () => {
                summary.setAttribute('aria-expanded', detail.open);
            });
            // Set initial state
            summary.setAttribute('aria-expanded', detail.open);
        }
    });
}

// ==========================================
// LAZY LOADING
// ==========================================
function initLazyLoading() {
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    } else {
        // Fallback pour les vieux navigateurs
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
        document.body.appendChild(script);
    }
}

// ==========================================
// DARK MODE (Désactivé - mode clair forcé)
// ==========================================
// Force le mode clair au chargement
(function forceLightMode() {
    document.documentElement.classList.remove('dark');
    localStorage.theme = 'light';
})();

// ==========================================
// COOKIE CONSENT
// ==========================================
function initCookieConsent() {
    if (localStorage.getItem('cookieConsent') === 'true') return;

    const banner = document.createElement('div');
    banner.className = 'fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white p-6 rounded-2xl shadow-2xl border border-gray-100 z-[10000] transform transition-all duration-500 translate-y-full opacity-0';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Consentement cookies');
    banner.innerHTML = `
        <h4 class="text-lg font-bold mb-2">Confidentialité</h4>
        <p class="text-sm text-gray-600 mb-4">Nous utilisons des cookies pour améliorer votre expérience. En continuant, vous acceptez notre politique de confidentialité.</p>
        <div class="flex space-x-3">
            <button id="acceptCookies" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Accepter</button>
            <button id="declineCookies" class="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">Refuser</button>
        </div>
    `;

    document.body.appendChild(banner);
    const scrollBtn = document.getElementById('scrollTop');

    // Push scroll-to-top button above cookie banner
    function shiftScrollBtn(up) {
        if (!scrollBtn) return;
        scrollBtn.style.bottom = up ? 'calc(12rem + env(safe-area-inset-bottom, 0px))' : '';
    }

    // Animate in
    setTimeout(() => {
        banner.classList.remove('translate-y-full', 'opacity-0');
        shiftScrollBtn(true);
    }, 1000);

    function dismissBanner() {
        banner.classList.add('translate-y-full', 'opacity-0');
        shiftScrollBtn(false);
        setTimeout(() => banner.remove(), 500);
    }

    document.getElementById('acceptCookies')?.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'true');
        dismissBanner();
    });

    document.getElementById('declineCookies')?.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'false');
        dismissBanner();
    });
}

// ==========================================
// MAGNETIC BUTTONS
// ==========================================
function initMagneticButtons() {
    // Skip if wow-effects.js already handles magnetic elements
    if (document.getElementById('jcsm-wow-styles')) return;
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, [data-magnetic]');
    if (window.innerWidth > 1024) { // Only on desktop
        buttons.forEach(btn => {
            btn.addEventListener('mousemove', function (e) {
                requestAnimationFrame(() => {
                    const rect = btn.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
                });
            });

            btn.addEventListener('mouseleave', function () {
                requestAnimationFrame(() => {
                    btn.style.transform = 'translate(0, 0)';
                });
            });
        });
    }
}

// ==========================================
// SCROLL TO TOP & SCROLL PROGRESS
// ==========================================
function initScrollToTop() {
    const scrollTopBtn = document.getElementById('scrollTop');
    if (!scrollTopBtn) return;

    // Use a single scroll listener for multiple scroll effects if possible, or keep them separate but throttled
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                // Scroll Top Visibility
                if (window.pageYOffset > 300) {
                    scrollTopBtn.classList.add('visible');
                } else {
                    scrollTopBtn.classList.remove('visible');
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function initScrollProgress() {
    const scrollProgress = document.getElementById('scroll-progress');
    if (!scrollProgress) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrolled = (window.pageYOffset / windowHeight) * 100;
                scrollProgress.style.width = scrolled + '%';
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}


// ==========================================
// PARTICLES
// ==========================================
function initParticles() {
    const particlesBg = document.getElementById('particles-bg');
    if (!particlesBg) return;
    // Skip particles on mobile to save battery
    if (window.innerWidth < 768) return;
    // Prevent duplicate particles on re-init
    if (particlesBg.children.length > 0) return;

    const particleCount = 20;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 25 + 's';
        particle.style.animationDuration = (20 + Math.random() * 10) + 's';
        fragment.appendChild(particle);
    }
    particlesBg.appendChild(fragment);
}

// ==========================================
// PRELOADER
// ==========================================
function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => preloader.classList.add('hide'), 100);
        });
        // Fallback safety
        setTimeout(() => preloader.classList.add('hide'), 3000);
    }
}

// ==========================================
// MOBILE MENU
// ==========================================
function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    const close = document.getElementById('mobile-menu-close');
    const overlay = document.getElementById('mobile-menu-overlay');

    // Reset state on page load (prevents stale overflow:hidden after refresh)
    if (menu) menu.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';

    if (btn && menu && overlay) {
        btn.addEventListener('click', () => {
            menu.classList.add('open');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            menu.setAttribute('aria-hidden', 'false');
            btn.setAttribute('aria-expanded', 'true');
            const main = document.querySelector('main');
            const footer = document.querySelector('footer');
            if (main) main.inert = true;
            if (footer) footer.inert = true;
        });
    }

    function closeMenu() {
        if (menu) {
            menu.classList.remove('open');
            menu.setAttribute('aria-hidden', 'true');
        }
        if (overlay) overlay.classList.remove('active');
        if (btn) btn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        const main = document.querySelector('main');
        const footer = document.querySelector('footer');
        if (main) main.inert = false;
        if (footer) footer.inert = false;
    }

    [close, overlay].forEach(el => {
        if (el) el.addEventListener('click', closeMenu);
    });
}

// ==========================================
// SCROLL ANIMATIONS
// ==========================================
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section-appear').forEach(el => observer.observe(el));
}

// ==========================================
// SMOOTH SCROLL
// ==========================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#contact') {
                // Laissez le comportement par défaut ou gérez spécifiquement
                // Si c'est juste '#' on annule
                if (href === '#') return;
            }

            // Check if element exists on current page
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });

                // Close mobile menu if open
                const menu = document.getElementById('mobile-menu');
                if (menu && menu.classList.contains('open')) {
                    menu.classList.remove('open');
                    document.getElementById('mobile-menu-overlay').classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        });
    });
}

// ==========================================
// PAGE TRANSITIONS
// ==========================================
function initPageTransitions() {
    document.documentElement.classList.remove('loading');

    // Add fade-in on load
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 50);

    // Fix bfcache blank page: restore opacity when returning via back/forward button
    window.addEventListener('pageshow', (e) => {
        if (e.persisted) {
            document.body.style.opacity = '';
            document.body.style.transition = '';
            document.body.classList.add('loaded');
        }
    });

    document.querySelectorAll('a[href$=".html"], a[href^="/"], a[href^="./"]').forEach(link => {
        link.addEventListener('click', function (e) {
            // Check if it's a same-origin link and not opening in new tab
            if (this.hostname === window.location.hostname &&
                !this.getAttribute('target') &&
                !this.getAttribute('href').startsWith('#') &&
                !this.getAttribute('href').startsWith('mailto:') &&
                !this.getAttribute('href').startsWith('tel:')) {

                e.preventDefault();
                document.body.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
                document.body.style.opacity = '0';

                const href = this.getAttribute('href');
                setTimeout(() => {
                    window.location.href = href;
                }, 300);
            }
        });
    });
}

// ==========================================
// STATS COUNTERS
// ==========================================
function initStatsCounters() {
    const animateCounter = (element, target) => {
        const duration = 2000;
        const easeOutQuad = t => t * (2 - t);
        let start = null;

        function step(timestamp) {
            if (!start) start = timestamp;
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.round(target * easeOutQuad(progress));

            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                element.textContent = target;
            }
        }
        requestAnimationFrame(step);
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = entry.target.querySelectorAll('.counter');
                counters.forEach(counter => {
                    const target = parseInt(counter.dataset.target);
                    if (!isNaN(target) && counter.textContent === '0') {
                        counter.setAttribute('aria-label', target.toString());
                        animateCounter(counter, target);
                    }
                });
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    const allSections = document.querySelectorAll('section');
    allSections.forEach(section => {
        if (section.textContent.includes('Crédibilité') || section.querySelector('.counter')) {
            statsObserver.observe(section);
        }
    });
}

// ==========================================
// LOGO MARQUEE
// ==========================================
function initLogoMarquee() {
    const marquee = document.querySelector('.logo-marquee');
    const track = document.querySelector('.logo-marquee-track');
    if (!marquee || !track) return;

    let offset = 0;
    let lastTime = 0;
    const baseSpeed = 40; // pixels per second

    function step(timestamp) {
        if (!lastTime) lastTime = timestamp;
        const delta = (timestamp - lastTime) / 1000;
        lastTime = timestamp;

        if (delta > 0.1) { // Prevent huge jump if tab was inactive
            requestAnimationFrame(step);
            return;
        }

        const isMobile = window.innerWidth <= 768;
        const speed = isMobile ? baseSpeed * 1.2 : baseSpeed;

        const trackWidth = track.scrollWidth / 2; // Assuming content is duplicated
        if (trackWidth > 0) {
            offset -= speed * delta;
            if (Math.abs(offset) >= trackWidth) {
                offset = 0;
            }
            track.style.transform = `translate3d(${offset}px, 0, 0)`;
        }

        requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

// ==========================================
// HERO PARALLAX
// ==========================================
function initParallax() {
    const heroImage = document.getElementById('hero-image');
    if (!heroImage) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                if (scrolled < window.innerHeight) { // Only animate when visible
                    const translateY = Math.min(scrolled * 0.2, 50);
                    heroImage.style.transform = `translate3d(0, ${translateY}px, 0)`;
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// ==========================================
// SPOTLIGHT CARDS
// ==========================================
function initSpotlightCards() {
    // Skip if wow-effects.js already handles spotlight
    if (document.getElementById('jcsm-wow-styles')) return;
    const cards = document.querySelectorAll('.card-hover, .card-premium, .spotlight, .service-step');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mouse-x', x + '%');
            card.style.setProperty('--mouse-y', y + '%');
        });
    });
}

// ==========================================
// SMOOTH HOVER TRANSITIONS
// ==========================================
function initSmoothHoverTransitions() {
    // Skip if wow-effects.js already handles hover feedback
    if (document.getElementById('jcsm-wow-styles')) return;
    const elements = document.querySelectorAll('.btn-primary, .btn-secondary, .card-hover, a, button');

    elements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            el.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
        });

        el.addEventListener('mouseleave', () => {
            el.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        });
    });
}

// ==========================================
// PROFESSIONAL FEATURES
// ==========================================

// Professional features (initialized in main DOMContentLoaded above)

// ---- FORM VALIDATION WITH VISUAL FEEDBACK ----
function initFormValidation() {
    const forms = document.querySelectorAll('form:not(#contactForm)');

    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            // Add validation on blur
            input.addEventListener('blur', () => validateInput(input));

            // Real-time validation for inputs being typed
            input.addEventListener('input', () => {
                if (input.classList.contains('input-error')) {
                    validateInput(input);
                }
            });
        });

        form.addEventListener('submit', (e) => {
            let isValid = true;
            inputs.forEach(input => {
                if (!validateInput(input)) isValid = false;
            });

            if (!isValid) {
                e.preventDefault();
                // Focus first error
                const firstError = form.querySelector('.input-error');
                if (firstError) firstError.focus();
            }
        });
    });
}

function validateInput(input) {
    const value = input.value.trim();
    let isValid = true;
    let errorMsg = '';

    // Remove existing error state
    input.classList.remove('input-error', 'input-success');
    input.removeAttribute('aria-invalid');
    const existingError = input.parentElement.querySelector('.error-message');
    if (existingError) existingError.remove();

    // Skip validation if not required and empty
    if (!input.required && !value) {
        return true;
    }

    // Check required
    if (input.required && !value) {
        isValid = false;
        errorMsg = 'Ce champ est requis';
    }

    // Check email format
    else if (input.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMsg = 'Email invalide';
        }
    }

    // Check phone format (French)
    else if (input.type === 'tel' && value) {
        const cleaned = value.replace(/[\s.\-]/g, '');
        const phoneRegex = /^(?:(?:\+|00)33[1-9]\d{8}|0[1-9]\d{8})$/;
        if (!phoneRegex.test(cleaned)) {
            isValid = false;
            errorMsg = 'Numéro invalide';
        }
    }

    // Apply visual feedback
    if (!isValid) {
        input.classList.add('input-error');
        input.setAttribute('aria-invalid', 'true');
        const error = document.createElement('span');
        error.className = 'error-message text-red-500 text-xs mt-1 block animate-fadeIn';
        error.setAttribute('role', 'alert');
        error.textContent = errorMsg;
        input.parentElement.appendChild(error);
    } else if (value) {
        input.classList.add('input-success');
    }

    return isValid;
}

// ---- BUTTON LOADING STATES ----
function initButtonLoadingStates() {
    document.querySelectorAll('form:not(#contactForm)').forEach(form => {
        form.addEventListener('submit', function (e) {
            const submitBtn = form.querySelector('[type="submit"], button:not([type="button"])');
            if (submitBtn && !submitBtn.classList.contains('loading')) {
                submitBtn.classList.add('loading');
                submitBtn.dataset.originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = `
                    <svg class="animate-spin h-5 w-5 inline mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Envoi...
                `;
                submitBtn.disabled = true;

                // Announce to screen readers
                if (window.announceToScreenReader) {
                    window.announceToScreenReader('Formulaire en cours d\'envoi');
                }

                // Reset after 5s (fallback)
                setTimeout(() => resetButton(submitBtn), 5000);
            }
        });
    });
}

function resetButton(btn) {
    if (btn && btn.dataset.originalText) {
        btn.innerHTML = btn.dataset.originalText;
        btn.disabled = false;
        btn.classList.remove('loading');
    }
}

// ---- SCROLL SPY NAVIGATION ----
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');

    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('nav-link-active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('nav-link-active');
                    }
                });
            }
        });
    }, { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' });

    sections.forEach(section => observer.observe(section));
}

// ---- KEYBOARD NAVIGATION ----
function initKeyboardNavigation() {
    // Escape closes mobile menu
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const mobileMenu = document.getElementById('mobile-menu');
            const overlay = document.getElementById('mobile-menu-overlay');
            if (mobileMenu?.classList.contains('open')) {
                mobileMenu.classList.remove('open');
                overlay?.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });

    // Focus trap in mobile menu
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && mobileMenu.classList.contains('open')) {
                const focusable = mobileMenu.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });
    }
}

// ---- TOUCH FEEDBACK ----
function initTouchFeedback() {
    if (!('ontouchstart' in window)) return;

    document.querySelectorAll('.btn-primary, .btn-secondary, .card-hover, a').forEach(el => {
        el.addEventListener('touchstart', () => {
            el.style.transform = 'scale(0.97)';
            el.style.opacity = '0.9';
        }, { passive: true });

        el.addEventListener('touchend', () => {
            el.style.transform = '';
            el.style.opacity = '';
        }, { passive: true });
    });
}

// ---- LIVE FORM FEEDBACK ----
function initLiveFormFeedback() {
    // Character count for textareas
    document.querySelectorAll('textarea[maxlength]').forEach(textarea => {
        const max = parseInt(textarea.getAttribute('maxlength'));
        const counter = document.createElement('div');
        counter.className = 'text-xs text-gray-400 text-right mt-1';
        counter.textContent = `0 / ${max}`;
        textarea.parentElement.appendChild(counter);

        textarea.addEventListener('input', () => {
            const len = textarea.value.length;
            counter.textContent = `${len} / ${max}`;
            counter.classList.toggle('text-red-500', len > max * 0.9);
        });
    });

    // Auto-format phone numbers
    document.querySelectorAll('input[type="tel"]').forEach(input => {
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 10) value = value.slice(0, 10);

            // Format as XX XX XX XX XX
            if (value.length > 0) {
                value = value.match(/.{1,2}/g)?.join(' ') || value;
            }
            e.target.value = value;
        });
    });
}

// ---- INJECT PROFESSIONAL STYLES ----
(function injectProfessionalStyles() {
    if (document.getElementById('jcsm-pro-styles')) return;
    const style = document.createElement('style');
    style.id = 'jcsm-pro-styles';
    style.textContent = `
        /* Input States — body prefix for specificity */
        body .input-error {
            border-color: #ef4444;
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        body .input-success {
            border-color: #10b981;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        /* Focus Ring */
        input:focus, textarea:focus, select:focus, button:focus-visible {
            outline: none;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
            border-color: #2563EB;
        }

        /* Button Loading */
        .btn-primary.loading, .btn-secondary.loading {
            pointer-events: none;
            opacity: 0.8;
        }

        /* Animate fade in (form errors) */
        @keyframes fadeInSlide {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
            animation: fadeInSlide 0.2s ease-out;
        }

        /* Touch Active State */
        @media (hover: none) {
            .btn-primary:active, .btn-secondary:active, .card-hover:active {
                transform: scale(0.97);
                opacity: 0.9;
            }
        }

        /* Print Styles — body prefix for specificity */
        @media print {
            body .preloader, body nav, body .particles-bg, body .scroll-top, body #scroll-progress, body .cookie-banner { display: none; }
            body { background: white; }
            body a { color: inherit; text-decoration: underline; }
        }

        /* High Contrast Mode Support */
        @media (prefers-contrast: high) {
            .btn-primary { border: 2px solid currentColor; }
            .card-hover { border: 2px solid #000; }
        }

        /* Selection */
        ::selection {
            background: #2563EB;
            color: white;
        }
    `;
    document.head.appendChild(style);
})();

// ==========================================
// ACCESSIBILITY ENHANCEMENTS
// ==========================================
function initAccessibilityEnhancements() {
    // Announce page changes for screen readers
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0;';
    document.body.appendChild(announcer);
    window.announceToScreenReader = (message) => {
        announcer.textContent = '';
        setTimeout(() => { announcer.textContent = message; }, 100);
    };

    // Add ARIA labels to buttons without text
    document.querySelectorAll('button:not([aria-label])').forEach(btn => {
        if (!btn.textContent.trim() && !btn.querySelector('span')) {
            const svg = btn.querySelector('svg');
            if (svg) {
                const title = svg.querySelector('title');
                if (title) btn.setAttribute('aria-label', title.textContent);
            }
        }
    });

    // Ensure links open in new tab have warning
    document.querySelectorAll('a[target="_blank"]').forEach(link => {
        if (!link.querySelector('.sr-only') && !link.getAttribute('aria-label')?.includes('nouvel onglet')) {
            const srSpan = document.createElement('span');
            srSpan.className = 'sr-only';
            srSpan.textContent = ' (ouvre dans un nouvel onglet)';
            link.appendChild(srSpan);
        }
    });

    // Add role="img" to decorative SVGs
    document.querySelectorAll('svg:not([role])').forEach(svg => {
        if (!svg.closest('button') && !svg.closest('a')) {
            svg.setAttribute('role', 'img');
            svg.setAttribute('aria-hidden', 'true');
        }
    });

    // Focus management for modals
    document.querySelectorAll('[role="dialog"], .modal').forEach(modal => {
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                modal.style.display = 'none';
                const trigger = document.querySelector('[data-modal-trigger]');
                if (trigger) trigger.focus();
            }
        });
    });
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
function initToastNotifications() {
    // Create toast container (showToast function provided by utils.js)
    if (!document.getElementById('toast-container')) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'true');
        container.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 8px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }
}

// ==========================================
// SCREEN READER ONLY CLASS
// ==========================================
(function addSrOnlyStyle() {
    if (!document.querySelector('style[data-sr-only]')) {
        const style = document.createElement('style');
        style.setAttribute('data-sr-only', 'true');
        style.textContent = `
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            }
        `;
        document.head.appendChild(style);
    }
})();
