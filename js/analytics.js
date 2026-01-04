/**
 * JCSM Analytics - Lightweight & Privacy First
 * Tracks performance and interactions without cookies
 */

const JCSMAnalytics = {
    init() {
        this.sessionId = this.getSessionId();
        this.startTime = Date.now();
        this.events = [];

        this.trackPageview();
        this.trackPerformance();
        this.trackInteractions();
        this.trackScrollDepth();

        // Push data on exit
        window.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.pushEvent('session_end', { duration: (Date.now() - this.startTime) / 1000 });
            }
        });
    },

    getSessionId() {
        let sid = sessionStorage.getItem('jcsm_sid');
        if (!sid) {
            sid = 'sess_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('jcsm_sid', sid);
        }
        return sid;
    },

    pushEvent(name, data = {}) {
        const payload = {
            event: name,
            timestamp: new Date().toISOString(),
            url: window.location.pathname,
            sessionId: this.sessionId,
            data: data
        };

        // In detailed mock mode: log to console with style
        console.groupCollapsed(`%c📡 Analytics: ${name}`, 'color: #0070F3; font-weight: bold;');
        console.log('Payload:', payload);
        console.groupEnd();

        // Store locally for demo purposes (simulating batch send)
        const stored = JSON.parse(localStorage.getItem('jcsm_analytics_queue') || '[]');
        stored.push(payload);
        localStorage.setItem('jcsm_analytics_queue', JSON.stringify(stored.slice(-50))); // Keep last 50
    },

    trackPageview() {
        this.pushEvent('page_view', {
            referrer: document.referrer,
            screen: `${window.screen.width}x${window.screen.height}`,
            agent: navigator.userAgent
        });
    },

    trackPerformance() {
        window.addEventListener('load', () => {
            // Basic Web Vitals approximation
            if (window.performance) {
                const nav = performance.getEntriesByType('navigation')[0];
                if (nav) {
                    this.pushEvent('performance', {
                        loadTime: Math.round(nav.loadEventEnd),
                        domReady: Math.round(nav.domContentLoadedEventEnd),
                        ttfb: Math.round(nav.responseStart)
                    });
                }
            }
        });
    },

    trackInteractions() {
        // Track CTA Clicks
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-primary, .btn-secondary, nav a');
            if (btn) {
                this.pushEvent('click_cta', {
                    text: btn.innerText.substring(0, 30),
                    href: btn.getAttribute('href'),
                    class: btn.className
                });
            }
        });

        // Track Form Starts
        document.querySelectorAll('form').forEach(form => {
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.addEventListener('focus', () => {
                    if (!form.dataset.started) {
                        this.pushEvent('form_start', { formId: form.id || 'unknown' });
                        form.dataset.started = 'true';
                    }
                }, { once: true });
            });

            form.addEventListener('submit', () => {
                this.pushEvent('form_submit', { formId: form.id || 'unknown' });
            });
        });
    },

    trackScrollDepth() {
        let maxDepth = 0;
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrollPercent = Math.round((window.scrollY + window.innerHeight) / document.body.scrollHeight * 100);
                    if (scrollPercent > maxDepth + 10) { // Update every 10%
                        maxDepth = scrollPercent;
                        this.pushEvent('scroll_depth', { depth: maxDepth });
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
};

// Initialize
JCSMAnalytics.init();
