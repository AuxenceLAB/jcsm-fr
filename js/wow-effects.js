/**
 * wow-effects.js - Scroll animations, parallax, counters, marquee
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

    // ─── Word-split reveal animation ───
    function SplitText(element) {
        this.element = element;
        this.text = element.textContent.trim();
        this.split();
    }
    SplitText.prototype.split = function () {
        var words = this.text.split(" ");
        this.element.textContent = "";
        var el = this.element;
        words.forEach(function (word, idx) {
            var span = document.createElement("span");
            span.textContent = word;
            span.style.display = "inline-block";
            span.style.opacity = "0";
            span.style.transform = "translateY(20px)";
            span.style.transition = "all 0.6s cubic-bezier(0.16, 1, 0.3, 1) " + (0.05 * idx) + "s";
            el.appendChild(span);
            if (idx < words.length - 1) {
                el.appendChild(document.createTextNode(" "));
            }
            requestAnimationFrame(function () {
                setTimeout(function () {
                    span.style.opacity = "1";
                    span.style.transform = "translateY(0)";
                }, 100);
            });
        });
    };

    // ─── Inject styles (once) ───
    if (!document.getElementById("jcsm-wow-styles")) {
        var styleEl = document.createElement("style");
        styleEl.id = "jcsm-wow-styles";
        styleEl.textContent = [
            ".js-loaded .will-reveal { opacity: 0; transform: translateY(20px); transition: all 1s cubic-bezier(0.16, 1, 0.3, 1); }",
            ".revealed { opacity: 1 !important; transform: none !important; }",
            ".reveal-clip { transition: clip-path 1.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.4s ease; }",
            ".cursor-glow { mix-blend-mode: screen; filter: blur(40px); }",
            "[data-magnetic] { display: inline-block; will-change: transform; }",
            ".card-hover, .card-premium { transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease; }",
            "@keyframes rippleEffect { to { transform: scale(4); opacity: 0; } }",
            "@keyframes staggerIn { to { opacity: 1; transform: translateY(0); } }",
            "@keyframes morphBlobAnim {",
            "  0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: rotate(0deg) scale(1); }",
            "  25% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }",
            "  50% { border-radius: 50% 60% 30% 60% / 30% 40% 70% 50%; transform: rotate(180deg) scale(1.1); }",
            "  75% { border-radius: 40% 30% 60% 50% / 60% 50% 30% 40%; }",
            "}",
            "#scroll-progress { transition: width 0.1s linear; }",
            ".glow-border { position: relative; }",
            ".glow-border::before { content: ''; position: absolute; inset: -2px; background: rgba(37, 99, 235, 0.15); border-radius: inherit; z-index: -1; opacity: 0; transition: opacity 0.4s ease; filter: blur(12px); }",
            ".glow-border:hover::before { opacity: 1; }",
            ".counter-glow { text-shadow: 0 0 30px rgba(37, 99, 235, 0.3), 0 0 60px rgba(37, 99, 235, 0.15); }",
            ".spotlight::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.1) 0%, transparent 50%); opacity: 0; transition: opacity 0.3s ease; pointer-events: none; border-radius: inherit; }",
            ".spotlight:hover::before { opacity: 1; }",
            ".service-card.wow-glow { position: relative; }",
            ".service-card.wow-glow::before { content: ''; position: absolute; inset: -1px; background: linear-gradient(135deg, rgba(37, 99, 235, 0.3), rgba(6, 182, 212, 0.2), rgba(37, 99, 235, 0.3)); border-radius: inherit; z-index: -1; opacity: 0; transition: opacity 0.5s ease; filter: blur(6px); }",
            ".service-card.wow-glow:hover::before { opacity: 1; }",
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

        // Desktop-only: cursor glow, 3D card tilt, magnetic buttons
        if (isDesktop) {
            // Cursor glow with proper cleanup on hidden tab
            (function cursorGlow() {
                var glow = document.createElement("div");
                glow.className = "cursor-glow";
                glow.style.cssText = "position:fixed;width:600px;height:600px;border-radius:50%;pointer-events:none;background:radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, rgba(59, 130, 246, 0.04) 30%, transparent 70%);transform:translate(-50%, -50%);z-index:1;opacity:0;transition:opacity 0.5s ease;mix-blend-mode:plus-lighter;";
                document.body.appendChild(glow);

                var mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;
                var rafId = null;

                document.addEventListener("mousemove", function (e) {
                    mouseX = e.clientX;
                    mouseY = e.clientY;
                    if (glow.style.opacity === "0") {
                        glow.style.opacity = "1";
                    }
                }, { passive: true });

                function loop() {
                    glowX += 0.08 * (mouseX - glowX);
                    glowY += 0.08 * (mouseY - glowY);
                    glow.style.left = glowX + "px";
                    glow.style.top = glowY + "px";
                    rafId = requestAnimationFrame(loop);
                }

                document.addEventListener("visibilitychange", function () {
                    if (document.hidden) {
                        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
                    } else {
                        if (!rafId) { rafId = requestAnimationFrame(loop); }
                    }
                });

                rafId = requestAnimationFrame(loop);
            })();

            // 3D tilt on cards — reset to empty string on leave so CSS hover takes over
            document.querySelectorAll(".card-hover, .card-premium, [data-tilt]").forEach(function (card) {
                card.addEventListener("mousemove", function (e) {
                    var rect = card.getBoundingClientRect();
                    var rotateX = -8 * ((e.clientY - rect.top) / rect.height - 0.5);
                    var rotateY = 8 * ((e.clientX - rect.left) / rect.width - 0.5);
                    requestAnimationFrame(function () {
                        card.style.transform = "perspective(1000px) rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg) translateY(-4px) scale3d(1.02, 1.02, 1.02)";
                    });
                });
                card.addEventListener("mouseleave", function () {
                    requestAnimationFrame(function () {
                        card.style.transform = "";
                    });
                });
            });

            // Magnetic buttons — only [data-magnetic] to avoid conflicting with btn CSS hover
            document.querySelectorAll("[data-magnetic]").forEach(function (btn) {
                btn.addEventListener("mousemove", function (e) {
                    var rect = btn.getBoundingClientRect();
                    var dx = e.clientX - rect.left - rect.width / 2;
                    var dy = e.clientY - rect.top - rect.height / 2;
                    btn.style.transform = "translate(" + (0.2 * dx) + "px, " + (0.3 * dy) + "px)";
                    btn.style.transition = "transform 0.1s linear";
                });
                btn.addEventListener("mouseleave", function () {
                    btn.style.transform = "";
                    btn.style.transition = "";
                });
            });
        }

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

        // ─── Service card glow border + stat card pop ───
        document.querySelectorAll(".service-card").forEach(function (card) {
            card.classList.add("wow-glow");
        });
        document.querySelectorAll(".stat-card").forEach(function (card) {
            card.classList.add("wow-pop");
        });

        // ─── Parallax (desktop only, rAF-gated) ───
        (function parallax() {
            if (window.innerWidth <= 768) return;
            var elements = document.querySelectorAll("[data-parallax]");
            if (!elements.length) return;

            var ticking = false;
            window.addEventListener("scroll", function () {
                if (!ticking) {
                    ticking = true;
                    requestAnimationFrame(function () {
                        elements.forEach(function (el) {
                            var speed = parseFloat(el.dataset.speed) || 0.1;
                            var rect = el.getBoundingClientRect();
                            if (rect.top < window.innerHeight && rect.bottom > 0) {
                                var offset = (window.innerHeight - rect.top) * speed;
                                el.style.transform = "translateY(" + offset + "px)";
                            }
                        });
                        ticking = false;
                    });
                }
            }, { passive: true });
        })();

        // Counters, split text, scroll progress, marquee
        document.querySelectorAll(".counter").forEach(function (el) { new Counter(el); });
        document.querySelectorAll('[data-split="words"]').forEach(function (el) { new SplitText(el); });
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

    // ─── Desktop-only visual effects (spotlight, button glow, morph blobs, ripple) ───
    if (isDesktop) {
        // Spotlight on cards
        document.querySelectorAll(".card-hover, .card-premium, .spotlight").forEach(function (el) {
            el.addEventListener("mousemove", function (e) {
                var rect = el.getBoundingClientRect();
                var x = (e.clientX - rect.left) / rect.width * 100;
                var y = (e.clientY - rect.top) / rect.height * 100;
                el.style.setProperty("--mouse-x", x + "%");
                el.style.setProperty("--mouse-y", y + "%");
            });
        });

        // Button glow follow
        document.querySelectorAll(".btn-primary, .btn-secondary, .btn-liquid").forEach(function (btn) {
            btn.addEventListener("mousemove", function (e) {
                var rect = btn.getBoundingClientRect();
                btn.style.setProperty("--x", (e.clientX - rect.left) + "px");
                btn.style.setProperty("--y", (e.clientY - rect.top) + "px");
            });
        });

        // Morphing background blobs on odd sections
        document.querySelectorAll("section").forEach(function (section, idx) {
            if (idx % 2 === 0) return;
            var blob = document.createElement("div");
            blob.className = "morph-blob";
            blob.style.cssText = "position:absolute;width:400px;height:400px;background:linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(59, 130, 246, 0.06));border-radius:60% 40% 30% 70% / 60% 30% 70% 40%;animation:morphBlobAnim " + (8 + idx) + "s ease-in-out infinite;filter:blur(80px);pointer-events:none;z-index:0;top:" + (50 * Math.random()) + "%;";
            blob.style.cssText += (idx % 4 === 1 ? "left:-10%;" : "right:-10%;");
            section.style.position = "relative";
            section.style.overflow = "hidden";
            section.insertBefore(blob, section.firstChild);
        });
    }

    // Counter glow class
    document.querySelectorAll(".counter").forEach(function (el) {
        el.classList.add("counter-glow");
    });

    // Ripple effect on buttons/cards (self-cleaning DOM node)
    document.querySelectorAll(".btn-primary, .btn-secondary, .card-hover").forEach(function (el) {
        el.addEventListener("click", function (e) {
            var ripple = document.createElement("span");
            var rect = this.getBoundingClientRect();
            var size = Math.max(rect.width, rect.height);
            var x = e.clientX - rect.left - size / 2;
            var y = e.clientY - rect.top - size / 2;
            ripple.style.cssText = "position:absolute;width:" + size + "px;height:" + size + "px;left:" + x + "px;top:" + y + "px;background:radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%);border-radius:50%;transform:scale(0);animation:rippleEffect 0.6s ease-out forwards;pointer-events:none;";
            this.style.position = "relative";
            this.style.overflow = "hidden";
            this.appendChild(ripple);
            setTimeout(function () { ripple.remove(); }, 600);
        });
    });

    // Hover transition enhancement — only cards and nav links (not buttons)
    document.querySelectorAll(".card-hover, nav a").forEach(function (el) {
        el.addEventListener("mouseenter", function () {
            el.style.transition = "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";
        });
        el.addEventListener("mouseleave", function () {
            el.style.transition = "";
        });
    });

    // Glow border class
    document.querySelectorAll(".service-step, .card-hover").forEach(function (el) {
        el.classList.add("glow-border");
    });
}();
