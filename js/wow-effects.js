/**
 * JCSM WOW Effects - Premium Professional Edition
 * High-performance, serious yet impactful animations for a world-class experience.
 */

(function () {
    'use strict';

    const isDesktop = window.innerWidth > 1024;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Skip all effects if reduced motion is preferred
    if (prefersReducedMotion) return;

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
            this.speed = 0.4; // Slightly slower for more "pro" feel
            this.position = 0;
            this.isPaused = false;
            this.init();
        }
        init() {
            // Triple clone for extra safety on wide screens
            const children = Array.from(this.track.children);
            for (let i = 0; i < 2; i++) {
                children.forEach(item => this.track.appendChild(item.cloneNode(true)));
            }
            this.container.addEventListener('mouseenter', () => this.isPaused = true);
            this.container.addEventListener('mouseleave', () => this.isPaused = false);
            this.animate();
        }
        animate() {
            if (!this.isPaused) {
                this.position -= this.speed;
                const totalWidth = this.track.scrollWidth / 3;
                if (Math.abs(this.position) >= totalWidth) this.position = 0;
                this.track.style.transform = `translateX(${this.position}px)`;
            }
            requestAnimationFrame(this.animate.bind(this));
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
        });

        function animate() {
            glowX += (mouseX - glowX) * 0.08;
            glowY += (mouseY - glowY) * 0.08;
            glow.style.left = glowX + 'px';
            glow.style.top = glowY + 'px';
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
        const parallaxes = document.querySelectorAll('[data-parallax]');

        window.addEventListener('scroll', () => {
            const scrollY = window.pageYOffset;
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
    // STYLES INJECTION
    // ==========================================
    const style = document.createElement('style');
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
        
        #scroll-progress { transition: width 0.1s linear; }
    `;
    document.head.appendChild(style);

})();
