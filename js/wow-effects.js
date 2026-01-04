/**
 * JCSM WOW Effects - Fast & Impactful
 * Premium visual effects with INSTANT visual feedback
 */

(function () {
    'use strict';

    const isDesktop = window.innerWidth > 1024;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Skip all effects if reduced motion is preferred
    if (prefersReducedMotion) return;

    // INSTANT hero reveal on load
    document.addEventListener('DOMContentLoaded', () => {
        // Immediate hero animation
        requestAnimationFrame(() => {
            initInstantHeroReveal();
        });

        if (isDesktop) {
            initCursorGlow();
            initTiltCards();
        }
        initFastScrollReveal();
        initParallaxElements();
    });

    // ==========================================
    // INSTANT HERO REVEAL - WOW from first second
    // ==========================================
    function initInstantHeroReveal() {
        const heroElements = document.querySelectorAll('section:first-of-type .section-appear, section:first-of-type h1, section:first-of-type p, section:first-of-type a');

        heroElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(40px)';

            // Faster stagger - 80ms between elements
            setTimeout(() => {
                el.style.transition = 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 50 + (index * 80));
        });

        // Hero image special effect - scale in
        const heroImage = document.getElementById('hero-image');
        if (heroImage) {
            heroImage.style.opacity = '0';
            heroImage.style.transform = 'scale(0.9) translateY(30px)';
            setTimeout(() => {
                heroImage.style.transition = 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
                heroImage.style.opacity = '1';
                heroImage.style.transform = 'scale(1) translateY(0)';
            }, 200);
        }
    }

    // ==========================================
    // CURSOR GLOW - More visible
    // ==========================================
    function initCursorGlow() {
        const glow = document.createElement('div');
        glow.className = 'cursor-glow';
        glow.style.cssText = `
            position: fixed;
            width: 500px;
            height: 500px;
            border-radius: 50%;
            pointer-events: none;
            background: radial-gradient(circle, rgba(0, 112, 243, 0.12) 0%, rgba(121, 40, 202, 0.06) 40%, transparent 70%);
            transform: translate(-50%, -50%);
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.2s ease;
            mix-blend-mode: screen;
        `;
        document.body.appendChild(glow);

        let mouseX = 0, mouseY = 0;
        let glowX = 0, glowY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            glow.style.opacity = '1';
        });

        document.addEventListener('mouseleave', () => {
            glow.style.opacity = '0';
        });

        function animate() {
            glowX += (mouseX - glowX) * 0.15; // Faster follow
            glowY += (mouseY - glowY) * 0.15;
            glow.style.left = glowX + 'px';
            glow.style.top = glowY + 'px';
            requestAnimationFrame(animate);
        }
        animate();
    }

    // ==========================================
    // 3D TILT CARD - More dramatic
    // ==========================================
    function initTiltCards() {
        const cards = document.querySelectorAll('.card-hover, .card-premium, [data-tilt]');

        cards.forEach(card => {
            card.style.transformStyle = 'preserve-3d';
            card.style.transition = 'transform 0.15s ease-out';

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / 12; // More tilt
                const rotateY = (centerX - x) / 12;

                requestAnimationFrame(() => {
                    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
                });
            });

            card.addEventListener('mouseleave', () => {
                requestAnimationFrame(() => {
                    card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
                });
            });
        });
    }

    // ==========================================
    // FAST SCROLL REVEAL - Quicker animations
    // ==========================================
    function initFastScrollReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // Faster reveal
                    entry.target.style.transition = 'opacity 0.35s ease-out, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.05, // Trigger earlier
            rootMargin: '0px 0px 0px 0px'
        });

        // Skip hero section (already animated)
        document.querySelectorAll('section:not(:first-of-type) .section-appear').forEach(el => {
            el.classList.add('will-reveal');
            observer.observe(el);
        });
    }

    // ==========================================
    // PARALLAX - Smoother
    // ==========================================
    function initParallaxElements() {
        const heroImage = document.getElementById('hero-image');
        if (!heroImage) return;

        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollY = window.pageYOffset;
                    if (scrollY < window.innerHeight) {
                        heroImage.style.transform = `translateY(${scrollY * 0.15}px) scale(${1 - scrollY * 0.0002})`;
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // ==========================================
    // RIPPLE - Faster
    // ==========================================
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-primary, .btn-secondary, .btn-premium');
        if (!btn) return;

        const ripple = document.createElement('span');
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.4);
            border-radius: 50%;
            transform: scale(0);
            animation: rippleEffect 0.4s ease-out;
            pointer-events: none;
        `;

        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.appendChild(ripple);

        ripple.addEventListener('animationend', () => ripple.remove());
    });

    // Inject styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rippleEffect {
            to { transform: scale(4); opacity: 0; }
        }
        
        .will-reveal {
            opacity: 0;
            transform: translateY(25px);
        }
        
        .revealed {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        
        .cursor-glow {
            will-change: left, top, opacity;
        }

        /* Preloader faster */
        .preloader {
            transition: opacity 0.3s, visibility 0.3s !important;
        }
    `;
    document.head.appendChild(style);

    // ==========================================
    // ALIVE UI (Confetti, Pulse)
    // ==========================================
    function initAliveUI() {
        document.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('pulse-active');
            });
            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('pulse-active');
            });
        });

        window.triggerConfetti = function () {
            const colors = ['#0070F3', '#7928CA', '#FF0080', '#ffffff'];
            for (let i = 0; i < 50; i++) {
                createConfettiPiece(colors);
            }
        };
    }

    function createConfettiPiece(colors) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-10px';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 5000);
    }

    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        .pulse-active { transform: scale(1.02); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .confetti-piece { position: fixed; width: 10px; height: 10px; z-index: 9999; pointer-events: none; animation: fall linear forwards; }
        @keyframes fall { to { transform: translateY(100vh) rotate(720deg); } }
    `;
    document.head.appendChild(styleSheet);

    initAliveUI();

    // ==========================================
    // EASTER EGG (Konami Code)
    // ==========================================
    let konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    document.addEventListener('keydown', (e) => {
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                activatePartyMode();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });

    function activatePartyMode() {
        alert('🚀 MODE SITE DE FOU ACTIVÉ !');
        document.body.style.transition = 'filter 2s';
        document.body.style.filter = 'invert(1) hue-rotate(180deg)';

        // Trigger massive confetti
        setInterval(() => window.triggerConfetti && window.triggerConfetti(), 300);

        // Reset after 5s
        setTimeout(() => {
            document.body.style.filter = 'none';
            // interval intentionally left running for chaos, or user can reload
        }, 5000);
    }

})();
