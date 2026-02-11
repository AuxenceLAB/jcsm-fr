/**
 * JCSM WOW Effects - Premium Professional Edition
 * High-performance, serious yet impactful animations for a world-class experience.
 */

(function () {
    'use strict';

    const isDesktop = window.innerWidth > 1024;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Skip all effects if reduced motion is preferred
    if (prefersReducedMotion) {
        // Ensure content is still visible
        document.querySelectorAll('.section-appear, .reveal, .will-reveal').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
        return;
    }

    // ==========================================
    // PREMIUM CLASSES
    // ==========================================

    class AnimatedCounter {
        constructor(element, options = {}) {
            this.element = element;
            this.target = parseInt(element.dataset.target || element.textContent, 10);
            this.duration = options.duration || 2500;
            this.easing = (x) => x === 1 ? 1 : 1 - Math.pow(2, -10 * x); // Expo Out
            this.started = false;
            this.init();
        }
        init() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.started) {
                        this.started = true;
                        this.animate();
                        observer.unobserve(this.element);
                    }
                });
            }, { threshold: 0.1 });
            observer.observe(this.element);
        }
        animate() {
            const startTime = performance.now();
            const startValue = 0;
            const update = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / this.duration, 1);
                const easedProgress = this.easing(progress);
                const currentValue = Math.floor(startValue + (this.target - startValue) * easedProgress);
                this.element.textContent = currentValue.toLocaleString('fr-FR');
                if (progress < 1) requestAnimationFrame(update);
            };
            requestAnimationFrame(update);
        }
    }

    class ScrollProgress {
        constructor(selector) {
            this.element = document.querySelector(selector);
            if (!this.element) return;
            window.addEventListener('scroll', () => {
                const scrollTop = window.scrollY;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const progress = (scrollTop / docHeight) * 100;
                this.element.style.width = progress + '%';
            }, { passive: true });
        }
    }

    class LogoMarquee {
        constructor(selector) {
            this.container = document.querySelector(selector);
            if (!this.container) return;
            this.track = this.container.querySelector('.logo-marquee-track');
            if (!this.track) return;

            this.speed = 1.2; // Faster scroll
            this.position = 0;
            this.isPaused = false;
            this.lastTimestamp = 0;

            this.init();
        }

        init() {
            // Duplicate content for seamless loop
            const items = Array.from(this.track.children);
            // We clone twice to ensure coverage on even the widest screens
            items.forEach(item => this.track.appendChild(item.cloneNode(true)));
            items.forEach(item => this.track.appendChild(item.cloneNode(true)));

            // Robust hover detection
            this.container.addEventListener('mouseenter', () => this.isPaused = true);
            this.container.addEventListener('mouseleave', () => this.isPaused = false);

            // Recalculate dimensions on window resize
            window.addEventListener('resize', () => {
                this.position = 0; // Reset to avoid rounding glitches
            });

            requestAnimationFrame((t) => this.animate(t));
        }

        animate(timestamp) {
            if (!this.lastTimestamp) this.lastTimestamp = timestamp;
            const delta = (timestamp - this.lastTimestamp) / 16;
            this.lastTimestamp = timestamp;

            if (!this.isPaused && !document.hidden) {
                this.position -= this.speed * (delta || 1);
                const contentWidth = this.track.scrollWidth / 3;
                if (Math.abs(this.position) >= contentWidth) {
                    this.position = 0;
                }
                this.track.style.transform = `translate3d(${this.position}px, 0, 0)`;
            }

            this._rafId = requestAnimationFrame((t) => this.animate(t));
        }

        destroy() {
            if (this._rafId) cancelAnimationFrame(this._rafId);
        }
    }

    class TextSplit {
        constructor(element) {
            this.element = element;
            this.text = element.textContent.trim();
            this.split();
        }
        split() {
            const words = this.text.split(' ');
            this.element.textContent = '';
            words.forEach((word, i) => {
                const span = document.createElement('span');
                span.textContent = word;
                span.style.display = 'inline-block';
                span.style.opacity = '0';
                span.style.transform = 'translateY(20px)';
                span.style.transition = `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.05}s`;
                this.element.appendChild(span);
                if (i < words.length - 1) {
                    this.element.appendChild(document.createTextNode(' '));
                }

                // Trigger reveal
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        span.style.opacity = '1';
                        span.style.transform = 'translateY(0)';
                    }, 100);
                });
            });
        }
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================
    document.addEventListener('DOMContentLoaded', () => {
        // Core Visuals
        initInstantHeroReveal();

        if (isDesktop) {
            initCursorGlow();
            initTiltCards();
            initMagneticElements();
        }

        initFastScrollReveal();
        initParallaxElements();

        // Components
        document.querySelectorAll('.counter').forEach(el => new AnimatedCounter(el));
        document.querySelectorAll('[data-split="words"]').forEach(el => new TextSplit(el));
        new ScrollProgress('#scroll-progress');
        new LogoMarquee('.logo-marquee');

        // Professional Smooth Anchor
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    const offset = 100; // nav height
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                }
            });
        });
    });

    // ==========================================
    // HERO REVEAL - Elite Stagger
    // ==========================================
    function initInstantHeroReveal() {
        const heroElements = document.querySelectorAll('section:first-of-type .section-appear, section:first-of-type h1, section:first-of-type p, section:first-of-type a, section:first-of-type .inline-flex');

        heroElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';

            setTimeout(() => {
                el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 100 + (index * 60));
        });

        const heroImage = document.getElementById('hero-image');
        if (heroImage) {
            heroImage.style.opacity = '0';
            heroImage.style.transform = 'scale(1.05) translateZ(0)';
            heroImage.style.filter = 'blur(10px) brightness(0.8)';

            setTimeout(() => {
                heroImage.style.transition = 'opacity 1.5s cubic-bezier(0.16, 1, 0.3, 1), transform 1.5s cubic-bezier(0.16, 1, 0.3, 1), filter 1.5s ease-out';
                heroImage.style.opacity = '1';
                heroImage.style.transform = 'scale(1) translateZ(0)';
                heroImage.style.filter = 'blur(0) brightness(1)';
            }, 300);
        }
    }

    // ==========================================
    // CURSOR GLOW - Professional Subtle
    // ==========================================
    function initCursorGlow() {
        const glow = document.createElement('div');
        glow.className = 'cursor-glow';
        glow.style.cssText = `
            position: fixed;
            width: 600px;
            height: 600px;
            border-radius: 50%;
            pointer-events: none;
            background: radial-gradient(circle, rgba(0, 112, 243, 0.08) 0%, rgba(121, 40, 202, 0.04) 30%, transparent 70%);
            transform: translate(-50%, -50%);
            z-index: 1;
            opacity: 0;
            transition: opacity 0.5s ease;
            mix-blend-mode: plus-lighter;
        `;
        document.body.appendChild(glow);

        let mouseX = 0, mouseY = 0;
        let glowX = 0, glowY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (glow.style.opacity === '0') glow.style.opacity = '1';
        }, { passive: true });

        function animate() {
            if (!document.hidden) {
                glowX += (mouseX - glowX) * 0.08;
                glowY += (mouseY - glowY) * 0.08;
                glow.style.left = glowX + 'px';
                glow.style.top = glowY + 'px';
            }
            requestAnimationFrame(animate);
        }
        animate();
    }

    // ==========================================
    // MAGNETIC ELEMENTS
    // ==========================================
    function initMagneticElements() {
        const magnets = document.querySelectorAll('[data-magnetic], .btn-primary, .btn-secondary');

        magnets.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                el.style.transform = `translate(${x * 0.2}px, ${y * 0.3}px)`;
                el.style.transition = 'transform 0.1s linear';
            });

            el.addEventListener('mouseleave', () => {
                el.style.transform = 'translate(0, 0)';
                el.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            });
        });
    }

    // ==========================================
    // 3D TILT CARDS
    // ==========================================
    function initTiltCards() {
        const cards = document.querySelectorAll('.card-hover, .card-premium, [data-tilt]');

        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const rotateX = ((y / rect.height) - 0.5) * -10;
                const rotateY = ((x / rect.width) - 0.5) * 10;

                requestAnimationFrame(() => {
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
                });
            });

            card.addEventListener('mouseleave', () => {
                requestAnimationFrame(() => {
                    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
                });
            });
        });
    }

    // ==========================================
    // SCROLL REVEAL - Advanced Curtain Reveal
    // ==========================================
    function initFastScrollReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    if (entry.target.classList.contains('reveal-clip')) {
                        entry.target.style.clipPath = 'inset(0 0 0 0)';
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        document.querySelectorAll('.section-appear, .reveal-clip').forEach(el => {
            el.classList.add('will-reveal');
            if (el.classList.contains('reveal-clip')) {
                el.style.clipPath = 'inset(100% 0 0 0)';
            }
            observer.observe(el);
        });
    }

    // ==========================================
    // PARALLAX
    // ==========================================
    function initParallaxElements() {
        if (window.innerWidth <= 768) return;
        const parallaxes = document.querySelectorAll('[data-parallax]');
        if (!parallaxes.length) return;

        window.addEventListener('scroll', () => {
            parallaxes.forEach(el => {
                const speed = parseFloat(el.dataset.speed) || 0.1;
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    const yPos = (window.innerHeight - rect.top) * speed;
                    el.style.transform = `translateY(${yPos}px)`;
                }
            });
        }, { passive: true });
    }

    // ==========================================
    // SPOTLIGHT EFFECT ON CARDS
    // ==========================================
    function initSpotlightEffect() {
        const spotlightElements = document.querySelectorAll('.card-hover, .card-premium, .spotlight');

        spotlightElements.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                el.style.setProperty('--mouse-x', x + '%');
                el.style.setProperty('--mouse-y', y + '%');
            });
        });
    }

    // ==========================================
    // LIQUID BUTTON EFFECT
    // ==========================================
    function initLiquidButtons() {
        const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-liquid');

        buttons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                btn.style.setProperty('--x', x + 'px');
                btn.style.setProperty('--y', y + 'px');
            });
        });
    }

    // ==========================================
    // MORPHING BACKGROUND BLOBS
    // ==========================================
    function initMorphingBlobs() {
        const sections = document.querySelectorAll('section');

        sections.forEach((section, index) => {
            if (index % 2 === 0) return; // Only add to alternate sections

            const blob = document.createElement('div');
            blob.className = 'morph-blob';
            blob.style.cssText = `
                position: absolute;
                width: 400px;
                height: 400px;
                background: linear-gradient(135deg, rgba(0, 112, 243, 0.08), rgba(121, 40, 202, 0.08));
                border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
                animation: morphBlobAnim ${8 + index}s ease-in-out infinite;
                filter: blur(80px);
                pointer-events: none;
                z-index: 0;
                top: ${Math.random() * 50}%;
                ${index % 4 === 1 ? 'left: -10%;' : 'right: -10%;'}
            `;
            section.style.position = 'relative';
            section.style.overflow = 'hidden';
            section.insertBefore(blob, section.firstChild);
        });
    }

    // ==========================================
    // STAGGER REVEAL FOR GRIDS (Disabled - caused white flash)
    // ==========================================
    function initStaggerReveal() {
        // Disabled to prevent white flash on page load
    }

    // ==========================================
    // ENHANCED NUMBER ANIMATION
    // ==========================================
    function initEnhancedCounters() {
        const counters = document.querySelectorAll('.counter');

        counters.forEach(counter => {
            counter.classList.add('counter-glow');
        });
    }

    // ==========================================
    // RIPPLE CLICK EFFECT
    // ==========================================
    function initRippleEffect() {
        const clickables = document.querySelectorAll('.btn-primary, .btn-secondary, .card-hover');

        clickables.forEach(el => {
            el.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: rippleEffect 0.6s ease-out forwards;
                    pointer-events: none;
                `;

                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);

                setTimeout(() => ripple.remove(), 600);
            });
        });
    }

    // ==========================================
    // SMOOTH REVEAL ON SCROLL (ENHANCED)
    // ==========================================
    function initSmoothScrollReveal() {
        const revealElements = document.querySelectorAll('h2, h3, p, .card-hover, img:not([loading])');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0) scale(1)';
                    entry.target.style.filter = 'blur(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        revealElements.forEach((el, i) => {
            if (!el.closest('.section-appear') && !el.classList.contains('revealed')) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px) scale(0.98)';
                el.style.filter = 'blur(2px)';
                el.style.transition = `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${(i % 5) * 0.05}s`;
                observer.observe(el);
            }
        });
    }

    // ==========================================
    // HOVER SOUND FEEDBACK (SUBTLE)
    // ==========================================
    function initHoverFeedback() {
        const interactives = document.querySelectorAll('.btn-primary, .btn-secondary, .card-hover, nav a');

        interactives.forEach(el => {
            el.addEventListener('mouseenter', () => {
                el.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
            });

            el.addEventListener('mouseleave', () => {
                el.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            });
        });
    }

    // ==========================================
    // ANIMATED GRADIENT BORDERS
    // ==========================================
    function initGradientBorders() {
        const cards = document.querySelectorAll('.service-step, .card-hover');

        cards.forEach(card => {
            card.classList.add('glow-border');
        });
    }

    // Initialize all new effects
    if (isDesktop) {
        initSpotlightEffect();
        initLiquidButtons();
        initMorphingBlobs();
    }

    initStaggerReveal();
    initEnhancedCounters();
    initRippleEffect();
    initHoverFeedback();
    initGradientBorders();

    // ==========================================
    // STYLES INJECTION
    // ==========================================
    if (document.getElementById('jcsm-wow-styles')) return;
    const style = document.createElement('style');
    style.id = 'jcsm-wow-styles';
    style.textContent = `
        .will-reveal { opacity: 0; transform: translateY(20px); transition: all 1s cubic-bezier(0.16, 1, 0.3, 1); }
        .revealed { opacity: 1; transform: translateY(0); }
        .reveal-clip { transition: clip-path 1.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.4s ease; }

        .cursor-glow { mix-blend-mode: screen; filter: blur(40px); }

        [data-magnetic] { display: inline-block; will-change: transform; }

        .card-hover, .card-premium {
            transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease;
            will-change: transform;
        }

        @keyframes rippleEffect {
            to { transform: scale(4); opacity: 0; }
        }

        @keyframes staggerIn {
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes morphBlobAnim {
            0%, 100% {
                border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
                transform: rotate(0deg) scale(1);
            }
            25% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
            50% {
                border-radius: 50% 60% 30% 60% / 30% 40% 70% 50%;
                transform: rotate(180deg) scale(1.1);
            }
            75% { border-radius: 40% 30% 60% 50% / 60% 50% 30% 40%; }
        }

        #scroll-progress { transition: width 0.1s linear; }

        /* Enhanced gradient glow for cards */
        .glow-border {
            position: relative;
        }

        .glow-border::before {
            content: '';
            position: absolute;
            inset: -2px;
            background: linear-gradient(45deg, #2563EB, #7928CA, #FF0080, #00DFD8, #2563EB);
            background-size: 300% 300%;
            border-radius: inherit;
            animation: glowRotate 4s linear infinite;
            z-index: -1;
            opacity: 0;
            transition: opacity 0.4s ease;
            filter: blur(12px);
        }

        .glow-border:hover::before {
            opacity: 0.6;
        }

        @keyframes glowRotate {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        /* Counter glow effect */
        .counter-glow {
            text-shadow: 0 0 30px rgba(0, 112, 243, 0.3), 0 0 60px rgba(121, 40, 202, 0.15);
        }

        /* Spotlight gradient */
        .spotlight::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(
                circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
                rgba(255, 255, 255, 0.1) 0%,
                transparent 50%
            );
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
            border-radius: inherit;
        }

        .spotlight:hover::before {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);

})();
