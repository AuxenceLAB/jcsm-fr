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
    initDarkMode();
    initCookieConsent();
    initMagneticButtons();
    initScrollProgress();
    initLogoMarquee();
    initStatsCounters();
    initParallax();
});

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
// DARK MODE
// ==========================================
function initDarkMode() {
    // Check local storage or system preference
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    // Add toggle button to nav if not present
    const navContainer = document.querySelector('nav .flex');
    if (navContainer && !document.getElementById('darkModeToggle')) {
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'darkModeToggle';
        toggleBtn.className = 'ml-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none';
        toggleBtn.setAttribute('aria-label', 'Activer le mode sombre');
        toggleBtn.innerHTML = `
            <svg class="w-5 h-5 hidden dark:block text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
            <svg class="w-5 h-5 block dark:hidden text-gray-700" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
        `;

        // Find existing buttons to place before or after
        const existingBtn = navContainer.querySelector('button') || navContainer.lastElementChild;
        if (existingBtn) {
            existingBtn.parentNode.insertBefore(toggleBtn, existingBtn);
        } else {
            navContainer.appendChild(toggleBtn);
        }

        toggleBtn.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            if (document.documentElement.classList.contains('dark')) {
                localStorage.theme = 'dark';
            } else {
                localStorage.theme = 'light';
            }
        });
    }
}

// ==========================================
// COOKIE CONSENT
// ==========================================
function initCookieConsent() {
    if (localStorage.getItem('cookieConsent') === 'true') return;

    const banner = document.createElement('div');
    banner.className = 'fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-[10000] transform transition-all duration-500 translate-y-full opacity-0';
    banner.innerHTML = `
        <h4 class="text-lg font-bold mb-2 dark:text-white">Confidentialité</h4>
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">Nous utilisons des cookies pour améliorer votre expérience. En continuant, vous acceptez notre politique de confidentialité.</p>
        <div class="flex space-x-3">
            <button id="acceptCookies" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Accepter</button>
            <button id="declineCookies" class="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Refuser</button>
        </div>
    `;

    document.body.appendChild(banner);

    // Animate in
    setTimeout(() => {
        banner.classList.remove('translate-y-full', 'opacity-0');
    }, 1000);

    document.getElementById('acceptCookies')?.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'true');
        banner.classList.add('translate-y-full', 'opacity-0');
        setTimeout(() => banner.remove(), 500);
    });

    document.getElementById('declineCookies')?.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'false'); // Or specific logic
        banner.classList.add('translate-y-full', 'opacity-0');
        setTimeout(() => banner.remove(), 500);
    });
}

// ==========================================
// MAGNETIC BUTTONS
// ==========================================
function initMagneticButtons() {
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
    });

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
    });
}


// ==========================================
// PARTICLES
// ==========================================
function initParticles() {
    const particlesBg = document.getElementById('particles-bg');
    if (!particlesBg) return;

    const particleCount = 20; // Reduced for performance
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

    if (btn && menu && overlay) {
        btn.addEventListener('click', () => {
            menu.classList.add('open');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
    }

    [close, overlay].forEach(el => {
        if (el && menu && overlay) {
            el.addEventListener('click', () => {
                menu.classList.remove('open');
                overlay.classList.remove('active');
                document.body.style.overflow = ''; // Restore scrolling
            });
        }
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

    // Target all internal links that don't have an extension (or have .html)
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function (e) {
            let href = this.getAttribute('href');
            if (!href) return;

            // Skip absolute external links, anchors, and protocols
            const isExternal = href.startsWith('http') && !href.includes(window.location.hostname);
            const isSpecial = href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:');
            const isNewTab = this.getAttribute('target') === '_blank';

            if (isExternal || isSpecial || isNewTab) return;

            // LOCAL FALLBACK LOGIC
            const isLocal = window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1' ||
                window.location.protocol === 'file:';

            // Check if it's a "clean" internal link (no dot in the last segment)
            const pathParts = href.split('/');
            const lastPart = pathParts[pathParts.length - 1];
            const isCleanLink = lastPart && !lastPart.includes('.') && !lastPart.startsWith('#');

            if (isLocal && isCleanLink && href !== '/') {
                // If it's a local file or local server, we force .html
                // We keep relative paths relative, and absolute paths absolute
                let newHref = href.endsWith('/') ? href.slice(0, -1) : href;
                newHref += '.html';

                // If the link starts with '/', on file:// it would go to root. 
                // We fix it to be relative if path is file://
                if (window.location.protocol === 'file:' && newHref.startsWith('/')) {
                    newHref = newHref.substring(1);
                }

                href = newHref;
                console.log(`JCSM Local Redirect: ${this.getAttribute('href')} -> ${href}`);
            }

            e.preventDefault();
            document.body.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
            document.body.style.opacity = '0';

            const targetHref = href;
            setTimeout(() => {
                window.location.href = targetHref;
            }, 300);
        });
    });
}

// ==========================================
// STATS COUNTERS
// ==========================================
function initStatsCounters() {
    const animateCounter = (element, target) => {
        const duration = 2000;
        const frameDuration = 1000 / 60;
        const totalFrames = Math.round(duration / frameDuration);
        const easeOutQuad = t => t * (2 - t);

        let frame = 0;

        const counter = setInterval(() => {
            frame++;
            const progress = easeOutQuad(frame / totalFrames);
            const current = Math.round(target * progress);

            if (parseInt(element.textContent) !== current) {
                element.textContent = current;
            }

            if (frame === totalFrames) {
                clearInterval(counter);
                element.textContent = target; // Ensure exact final value
            }
        }, frameDuration);
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = entry.target.querySelectorAll('.counter');
                counters.forEach(counter => {
                    const target = parseInt(counter.dataset.target);
                    if (!isNaN(target) && counter.textContent === '0') {
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
    });
}

// ==========================================
// PROFESSIONAL FEATURES
// ==========================================

// Initialize professional features on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initFormValidation();
    initButtonLoadingStates();
    initScrollSpy();
    initKeyboardNavigation();
    initTouchFeedback();
    initLiveFormFeedback();
});

// ---- FORM VALIDATION WITH VISUAL FEEDBACK ----
function initFormValidation() {
    const forms = document.querySelectorAll('form');

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
        const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
            isValid = false;
            errorMsg = 'Numéro invalide';
        }
    }

    // Apply visual feedback
    if (!isValid) {
        input.classList.add('input-error');
        const error = document.createElement('span');
        error.className = 'error-message text-red-500 text-xs mt-1 block animate-fadeIn';
        error.textContent = errorMsg;
        input.parentElement.appendChild(error);
    } else if (value) {
        input.classList.add('input-success');
    }

    return isValid;
}

// ---- BUTTON LOADING STATES ----
function initButtonLoadingStates() {
    document.querySelectorAll('form').forEach(form => {
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
                const focusable = mobileMenu.querySelectorAll('a, button');
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
    const style = document.createElement('style');
    style.textContent = `
        /* Input States */
        .input-error {
            border-color: #ef4444 !important;
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
        }
        
        .input-success {
            border-color: #10b981 !important;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
        }

        /* Focus Ring */
        input:focus, textarea:focus, select:focus, button:focus-visible {
            outline: none;
            box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.2);
            border-color: #0070F3;
        }

        /* Button Loading */
        .btn-primary.loading, .btn-secondary.loading {
            pointer-events: none;
            opacity: 0.8;
        }

        /* Animate fade in */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
            animation: fadeIn 0.2s ease-out;
        }

        /* Touch Active State */
        @media (hover: none) {
            .btn-primary:active, .btn-secondary:active, .card-hover:active {
                transform: scale(0.97);
                opacity: 0.9;
            }
        }

        /* Print Styles */
        @media print {
            .preloader, nav, .particles-bg, .scroll-top, #scroll-progress, .cookie-banner { display: none !important; }
            body { background: white !important; }
            a { color: inherit !important; text-decoration: underline; }
        }

        /* High Contrast Mode Support */
        @media (prefers-contrast: high) {
            .btn-primary { border: 2px solid currentColor; }
            .card-hover { border: 2px solid #000; }
        }

        /* Selection */
        ::selection {
            background: #0070F3;
            color: white;
        }
    `;
    document.head.appendChild(style);
})();
