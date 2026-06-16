/**
 * wow-effects.js - Scroll animations, counters, scroll progress, logo marquee
 * Fixed: memory leaks (cleanup on visibility/destroy), debounced resize,
 *        rAF-gated scroll, reduced-motion respect, cursor glow leak,
 *        marquee pause on hidden tab, morph blob overflow, ripple cleanup
 */
!function () {
    "use strict";

    var isDesktop = window.innerWidth > 1024;

    // Respect reduced-motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        document.querySelectorAll(".section-appear, .reveal, .will-reveal").forEach(function (el) {
            el.style.opacity = "1";
            el.style.transform = "none";
        });
        return;
    }

    // ─── Counter animation (IntersectionObserver, fires once) ───
    function Counter(element, opts) {
        opts = opts || {};
        this.element = element;
        this.target = parseInt(element.dataset.target || element.textContent, 10);
        this.duration = opts.duration || 2500;
        this.started = false;
        this._observer = null;
        this.init();
    }
    Counter.prototype.easing = function (t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    };
    Counter.prototype.init = function () {
        var self = this;
        self._observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && !self.started) {
                    self.started = true;
                    self.animate();
                    self._observer.unobserve(self.element);
                    self._observer = null;
                }
            });
        }, { threshold: 0.1 });
        self._observer.observe(self.element);
    };
    Counter.prototype.animate = function () {
        var self = this;
        var start = performance.now();
        function tick(now) {
            var elapsed = now - start;
            var progress = Math.min(elapsed / self.duration, 1);
            var eased = self.easing(progress);
            var current = Math.floor(self.target * eased);
            self.element.textContent = current.toLocaleString("fr-FR");
            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        }
        requestAnimationFrame(tick);
    };

    // ─── Scroll progress bar (rAF-gated) ───
    function ScrollProgress(selector) {
        this.element = document.querySelector(selector);
        if (!this.element) return;
        this._ticking = false;
        var self = this;
        this._onScroll = function () {
            if (!self._ticking) {
                self._ticking = true;
                requestAnimationFrame(function () {
                    var pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
                    self.element.style.width = pct + "%";
                    self._ticking = false;
                });
            }
        };
        window.addEventListener("scroll", this._onScroll, { passive: true });
    }
    ScrollProgress.prototype.destroy = function () {
        if (this._onScroll) {
            window.removeEventListener("scroll", this._onScroll);
            this._onScroll = null;
        }
    };

    // ─── Logo marquee (pauses on hidden tab, proper cleanup) ───
    function LogoMarquee(selector) {
        this.container = document.querySelector(selector);
        if (!this.container) return;
        this.track = this.container.querySelector(".logo-marquee-track");
        if (!this.track) return;
        this.speed = 1.2;
        this.position = 0;
        this.isPaused = false;
        this.lastTimestamp = 0;
        this._rafId = null;
        this._resizeTimer = null;
        this._boundAnimate = this.animate.bind(this);
        this._onVisibility = null;
        this._onResize = null;
        this.init();
    }
    LogoMarquee.prototype.init = function () {
        var self = this;
        var items = Array.from(this.track.children);
        for (var i = 0; i < 2; i++) {
            items.forEach(function (item) {
                var clone = item.cloneNode(true);
                clone.querySelectorAll('img[loading="lazy"]').forEach(function (img) {
                    img.loading = "eager";
                });
                self.track.appendChild(clone);
            });
        }

        this._onResize = function () {
            clearTimeout(self._resizeTimer);
            self._resizeTimer = setTimeout(function () {
                self.position = 0;
            }, 150);
        };
        window.addEventListener("resize", this._onResize, { passive: true });

        this._onVisibility = function () {
            if (document.hidden) {
                if (self._rafId) {
                    cancelAnimationFrame(self._rafId);
                    self._rafId = null;
                }
            } else {
                self.lastTimestamp = 0;
                if (!self._rafId) {
                    self._rafId = requestAnimationFrame(self._boundAnimate);
                }
            }
        };
        document.addEventListener("visibilitychange", this._onVisibility);

        this._rafId = requestAnimationFrame(this._boundAnimate);
    };
    LogoMarquee.prototype.animate = function (ts) {
        if (!this.lastTimestamp) this.lastTimestamp = ts;
        var delta = (ts - this.lastTimestamp) / 16;
        this.lastTimestamp = ts;

        if (!this.isPaused) {
            this.position -= this.speed * (delta || 1);
            var third = this.track.scrollWidth / 3;
            if (Math.abs(this.position) >= third) {
                this.position = 0;
            }
            this.track.style.transform = "translate3d(" + this.position + "px, 0, 0)";
        }
        this._rafId = requestAnimationFrame(this._boundAnimate);
    };
    LogoMarquee.prototype.destroy = function () {
        if (this._rafId) cancelAnimationFrame(this._rafId);
        if (this._onVisibility) document.removeEventListener("visibilitychange", this._onVisibility);
        if (this._onResize) window.removeEventListener("resize", this._onResize);
        clearTimeout(this._resizeTimer);
    };

    // ─── Inject styles (once) ───
    if (!document.getElementById("jcsm-wow-styles")) {
        var styleEl = document.createElement("style");
        styleEl.id = "jcsm-wow-styles";
        styleEl.textContent = [
            ".js-loaded .will-reveal { opacity: 0; transform: translateY(20px); transition: all 1s cubic-bezier(0.16, 1, 0.3, 1); }",
            ".revealed { opacity: 1 !important; transform: none !important; }",
            ".reveal-clip { transition: clip-path 1.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.4s ease; }",
            ".card-hover, .card-premium { transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease; }",
            "@keyframes staggerIn { to { opacity: 1; transform: translateY(0); } }",
            "#scroll-progress { transition: width 0.1s linear; }",
            ".counter-glow { text-shadow: 0 0 30px rgba(37, 99, 235, 0.3), 0 0 60px rgba(37, 99, 235, 0.15); }",
            ".stat-card.wow-pop:hover .stat-number { transform: scale(1.08); transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }",
            "@keyframes trustBounce { 0% { opacity: 0; transform: translateY(16px) scale(0.95); } 60% { transform: translateY(-4px) scale(1.02); } 100% { opacity: 1; transform: translateY(0) scale(1); } }",
            ".trust-badge.wow-in { animation: trustBounce 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }"
        ].join("\n");
        document.head.appendChild(styleEl);
    }

    document.documentElement.classList.add("js-loaded");

    // ─── DOMContentLoaded: hero entrance, observers, interactions ───
    document.addEventListener("DOMContentLoaded", function () {

        // Hero entrance animation
        (function heroEntrance() {
            document.querySelectorAll("section:first-of-type .section-appear, section:first-of-type h1, section:first-of-type p, section:first-of-type a, section:first-of-type .inline-flex").forEach(function (el, i) {
                el.style.opacity = "0";
                el.style.transform = "translateY(30px)";
                setTimeout(function () {
                    el.style.transition = "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)";
                    el.style.opacity = "1";
                    el.style.transform = "translateY(0)";
                }, 100 + 60 * i);
                // Safety fallback
                setTimeout(function () {
                    if (el.style.opacity === "0") {
                        el.style.opacity = "1";
                        el.style.transform = "translateY(0)";
                    }
                }, 2000);
            });

            var heroImg = document.getElementById("hero-image");
            if (heroImg) {
                heroImg.style.opacity = "0";
                heroImg.style.transform = "scale(1.05) translateZ(0)";
                heroImg.style.filter = "blur(10px) brightness(0.8)";
                setTimeout(function () {
                    heroImg.style.transition = "opacity 1.5s cubic-bezier(0.16, 1, 0.3, 1), transform 1.5s cubic-bezier(0.16, 1, 0.3, 1), filter 1.5s ease-out";
                    heroImg.style.opacity = "1";
                    heroImg.style.transform = "scale(1) translateZ(0)";
                    heroImg.style.filter = "blur(0) brightness(1)";
                }, 300);
            }
        })();

        // ─── Section reveal (IntersectionObserver, fire once) ───
        (function sectionReveal() {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("revealed");
                        if (entry.target.classList.contains("reveal-clip")) {
                            entry.target.style.clipPath = "inset(0 0 0 0)";
                        }
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15 });

            document.querySelectorAll(".section-appear, .reveal-clip").forEach(function (el) {
                el.classList.add("will-reveal");
                if (el.classList.contains("reveal-clip")) {
                    el.style.clipPath = "inset(100% 0 0 0)";
                }
                observer.observe(el);
            });

            // Safety fallback: reveal everything after 3.5s
            setTimeout(function () {
                document.querySelectorAll(".will-reveal:not(.revealed)").forEach(function (el) {
                    el.classList.add("revealed");
                    if (el.style.clipPath) {
                        el.style.clipPath = "inset(0 0 0 0)";
                    }
                });
            }, 3500);
        })();

        // ─── Trust badge staggered reveal ───
        (function trustBadgeReveal() {
            var badges = document.querySelectorAll(".trust-badge");
            if (!badges.length) return;
            var trustObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var container = entry.target;
                        container.querySelectorAll(".trust-badge").forEach(function (badge, i) {
                            badge.style.animationDelay = (i * 0.08) + "s";
                            badge.classList.add("wow-in");
                        });
                        trustObserver.unobserve(container);
                    }
                });
            }, { threshold: 0.2 });
            var parent = badges[0].closest("section");
            if (parent) trustObserver.observe(parent);
        })();

        // ─── Stat card pop ───
        document.querySelectorAll(".stat-card").forEach(function (card) {
            card.classList.add("wow-pop");
        });

        // Counters, scroll progress, marquee
        document.querySelectorAll(".counter").forEach(function (el) { new Counter(el); });
        new ScrollProgress("#scroll-progress");
        new LogoMarquee(".logo-marquee");

        // Smooth anchor scroll
        document.querySelectorAll('a[href^="#"]').forEach(function (link) {
            link.addEventListener("click", function (e) {
                var href = this.getAttribute("href");
                if (href === "#") return;
                var target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    var offset = 100;
                    var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                    window.scrollTo({ top: top, behavior: "smooth" });

                    // Close mobile menu if open
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

    // ─── Desktop-only visual effects (button glow, morph blobs, ripple) ───
    if (isDesktop) {
        // Button glow follow
        document.querySelectorAll(".btn-primary, .btn-secondary, .btn-liquid").forEach(function (btn) {
            btn.addEventListener("mousemove", function (e) {
                var rect = btn.getBoundingClientRect();
                btn.style.setProperty("--x", (e.clientX - rect.left) + "px");
                btn.style.setProperty("--y", (e.clientY - rect.top) + "px");
            });
        });

    }

    // Counter glow class
    document.querySelectorAll(".counter").forEach(function (el) {
        el.classList.add("counter-glow");
    });

    // Hover transition enhancement : only cards and nav links (not buttons)
    document.querySelectorAll(".card-hover, nav a").forEach(function (el) {
        el.addEventListener("mouseenter", function () {
            el.style.transition = "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";
        });
        el.addEventListener("mouseleave", function () {
            el.style.transition = "";
        });
    });
}();
