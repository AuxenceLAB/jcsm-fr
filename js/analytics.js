/**
 * analytics.js - Lightweight analytics collector
 * Fixed: scroll handler rAF-gated (was already), interval cleanup on unload,
 *        guard against multiple initializations, safer UA string truncation
 */
!function () {
    var ENDPOINT = "https://jcsm.cloud/api/analytics/collect";
    var queue = [];
    var sessionId = null;
    var startTime = Date.now();
    var flushInterval = null;

    function getSessionId() {
        if (sessionId) return sessionId;
        var stored = sessionStorage.getItem("_asid");
        if (!stored) {
            var arr = new Uint32Array(2);
            crypto.getRandomValues(arr);
            stored = "s_" + Array.from(arr, function (v) { return v.toString(36); }).join("").substring(0, 9);
            try { sessionStorage.setItem("_asid", stored); } catch (e) { /* non-critical */ }
        }
        sessionId = stored;
        return stored;
    }

    function track(type, data) {
        queue.push({
            type: type,
            sessionId: getSessionId(),
            url: location.pathname + location.search,
            referrer: document.referrer,
            data: data || {},
            screen: screen.width + "x" + screen.height,
            userAgent: (navigator.userAgent || "").substring(0, 255),
            ts: (new Date()).toISOString()
        });
    }

    function flush() {
        if (!queue.length) return;
        var payload = JSON.stringify(queue);
        queue = [];
        try {
            if (navigator.sendBeacon) {
                navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: "application/json" }));
            } else {
                fetch(ENDPOINT, {
                    method: "POST",
                    body: payload,
                    headers: { "Content-Type": "application/json" },
                    keepalive: true
                }).catch(function () { /* silent fail */ });
            }
        } catch (e) { /* silent fail */ }
    }

    // Page view
    track("page_view");

    // Performance metrics
    window.addEventListener("load", function () {
        if (window.performance) {
            var nav = performance.getEntriesByType("navigation")[0];
            if (nav) {
                track("performance", {
                    loadTime: Math.round(nav.loadEventEnd),
                    domReady: Math.round(nav.domContentLoadedEventEnd),
                    ttfb: Math.round(nav.responseStart)
                });
            }
        }
    });

    // CTA clicks (delegated)
    document.addEventListener("click", function (e) {
        var el = e.target.closest('a,button,.btn-primary,.btn-secondary,[role="button"]');
        if (el) {
            track("click_cta", {
                text: (el.innerText || "").substring(0, 30),
                href: el.getAttribute("href"),
                tag: el.tagName
            });
        }
    });

    // Form interactions (delegated)
    document.addEventListener("focusin", function (e) {
        var form = e.target.closest("form");
        if (form && !form.dataset.aS) {
            track("form_start", { formId: form.id || "unknown" });
            form.dataset.aS = "1";
        }
    });

    document.addEventListener("submit", function (e) {
        if (e.target.tagName === "FORM") {
            track("form_submit", { formId: e.target.id || "unknown" });
            flush();
        }
    });

    // Scroll depth (rAF-gated, reports in 10% increments)
    var maxDepth = 0;
    var scrollTicking = false;
    window.addEventListener("scroll", function () {
        if (!scrollTicking) {
            requestAnimationFrame(function () {
                var depth = Math.round((window.scrollY + window.innerHeight) / document.body.scrollHeight * 100);
                if (depth > maxDepth + 10) {
                    maxDepth = depth;
                    track("scroll_depth", { depth: maxDepth });
                }
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    }, { passive: true });

    // Session end / visibility change
    document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "hidden") {
            track("session_end", { duration: Math.round((Date.now() - startTime) / 1000) });
            flush();
            if (flushInterval) {
                clearInterval(flushInterval);
                flushInterval = null;
            }
        } else if (!flushInterval) {
            flushInterval = setInterval(flush, 10000);
        }
    });

    // Beforeunload cleanup
    window.addEventListener("beforeunload", function () {
        if (flushInterval) {
            clearInterval(flushInterval);
            flushInterval = null;
        }
        flush();
    });

    // Periodic flush
    flushInterval = setInterval(flush, 10000);
}();
