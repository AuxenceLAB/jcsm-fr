!function () {
    "use strict";

    /* ── Config (read from JCSM_CONFIG if available) ── */
    var cfg = (window.JCSM_CONFIG && window.JCSM_CONFIG.chatbot) || {};
    var API_ENDPOINT = cfg.apiEndpoint || "/api/chatbot.php";
    var API_TIMEOUT = cfg.apiTimeout || 35000;
    var MAX_MESSAGE_LENGTH = cfg.maxMessageLength || 1000;
    var LEAD_THRESHOLD = cfg.leadThreshold || 3;
    var HISTORY_LIMIT = cfg.historyLimit || 20;
    var SESSION_KEY = cfg.sessionKey || "jcsm_chatbot";
    var HINT_DELAY = cfg.hintDelay || 15000;
    var GREETING = cfg.greeting || "Bonjour ! Je suis l'assistant JCSM, sp\u00e9cialiste en bornes de recharge \u00e9lectrique (IRVE). Comment puis-je vous aider ?";

    /* ── State ── */
    var state = {
        open: false,
        conversationId: null,
        messages: [],
        userMessageCount: 0,
        leadCaptured: false,
        leadFormShown: false,
        loading: false
    };

    /* ── Init ── */
    function init() {
        restoreState();
        buildDOM();
        bindEvents();

        if (state.messages.length === 0) {
            addBotMessage(GREETING);
        } else {
            renderHistory();
        }

        if (!state.open && state.messages.length <= 1) {
            showNotification();
        }

        scheduleHint();
    }

    /* ── Session storage ── */
    function restoreState() {
        try {
            var raw = sessionStorage.getItem(SESSION_KEY);
            if (raw) {
                var saved = JSON.parse(raw);
                state.conversationId = saved.conversationId || null;
                state.messages = Array.isArray(saved.messages) ? saved.messages : [];
                state.userMessageCount = saved.userMessageCount || 0;
                state.leadCaptured = !!saved.leadCaptured;
                state.leadFormShown = !!saved.leadFormShown;
            }
        } catch (e) { /* corrupt data, start fresh */ }
    }

    function saveState() {
        try {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify({
                conversationId: state.conversationId,
                messages: state.messages.slice(-50),
                userMessageCount: state.userMessageCount,
                leadCaptured: state.leadCaptured,
                leadFormShown: state.leadFormShown
            }));
        } catch (e) { /* quota exceeded, non-critical */ }
    }

    /* ── DOM construction ── */
    function buildDOM() {
        /* Bubble */
        var bubble = document.createElement("button");
        bubble.id = "jcsm-chatbot-bubble";
        bubble.setAttribute("aria-label", "Ouvrir le chat");
        bubble.innerHTML =
            '<svg class="chatbot-chat-icon" aria-hidden="true" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
                '<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>' +
                '<path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/>' +
            '</svg>' +
            '<svg class="chatbot-close-icon" aria-hidden="true" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
                '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>' +
            '</svg>' +
            '<span class="chatbot-notif" style="display:none">1</span>';
        document.body.appendChild(bubble);

        /* Panel */
        var panel = document.createElement("div");
        panel.id = "jcsm-chatbot-panel";
        panel.setAttribute("role", "dialog");
        panel.setAttribute("aria-label", "Chat JCSM");
        panel.innerHTML =
            '<div class="chatbot-header">' +
                '<div class="chatbot-header-avatar">J</div>' +
                '<div class="chatbot-header-info">' +
                    '<div class="chatbot-header-title">JCSM - Assistant IRVE</div>' +
                    '<div class="chatbot-header-subtitle">' +
                        '<span class="chatbot-online-dot"></span> En ligne' +
                    '</div>' +
                '</div>' +
                '<button class="chatbot-header-close" aria-label="Fermer le chat">' +
                    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
                        '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>' +
                    '</svg>' +
                '</button>' +
            '</div>' +
            '<div class="chatbot-messages" id="chatbot-messages" role="log" aria-live="polite"></div>' +
            '<div class="chatbot-input-area">' +
                '<textarea id="chatbot-input" rows="1" placeholder="Votre message..." aria-label="Votre message" maxlength="' + MAX_MESSAGE_LENGTH + '"></textarea>' +
                '<button class="chatbot-send-btn" id="chatbot-send" aria-label="Envoyer">' +
                    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
                        '<path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>' +
                    '</svg>' +
                '</button>' +
            '</div>' +
            '<div class="chatbot-footer">JCSM SAS - Expert IRVE</div>';
        document.body.appendChild(panel);
    }

    function bindEvents() {
        var bubble = document.getElementById("jcsm-chatbot-bubble");
        var sendBtn = document.getElementById("chatbot-send");
        var input = document.getElementById("chatbot-input");
        var closeBtn = document.querySelector(".chatbot-header-close");

        bubble.addEventListener("click", togglePanel);
        sendBtn.addEventListener("click", handleSend);

        if (closeBtn) {
            closeBtn.addEventListener("click", function () {
                if (state.open) togglePanel();
            });
        }

        input.addEventListener("keydown", function (e) {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        });

        input.addEventListener("input", function () {
            this.style.height = "auto";
            this.style.height = Math.min(this.scrollHeight, 80) + "px";
        });

        /* Close panel on Escape key */
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && state.open) {
                togglePanel();
            }
        });
    }

    /* ── Panel toggle ── */
    function togglePanel() {
        state.open = !state.open;
        var panel = document.getElementById("jcsm-chatbot-panel");
        var bubble = document.getElementById("jcsm-chatbot-bubble");

        if (state.open) {
            panel.classList.add("open");
            bubble.classList.add("active");
            bubble.setAttribute("aria-label", "Fermer le chat");
            hideNotification();
            scrollToBottom();
            setTimeout(function () {
                var input = document.getElementById("chatbot-input");
                if (input) input.focus();
            }, 350);
        } else {
            panel.classList.remove("open");
            bubble.classList.remove("active");
            bubble.setAttribute("aria-label", "Ouvrir le chat");
            /* Reset textarea height when closing */
            var input = document.getElementById("chatbot-input");
            if (input) {
                input.style.height = "auto";
            }
        }
    }

    /* ── Notifications ── */
    function showNotification() {
        var badge = document.querySelector("#jcsm-chatbot-bubble .chatbot-notif");
        if (badge) badge.style.display = "flex";
    }

    function hideNotification() {
        var badge = document.querySelector("#jcsm-chatbot-bubble .chatbot-notif");
        if (badge) badge.style.display = "none";
    }

    /* ── Messages ── */
    function addBotMessage(text) {
        state.messages.push({ role: "assistant", content: text });
        appendMessageDOM("bot", text);
        saveState();
    }

    function addUserMessage(text) {
        state.messages.push({ role: "user", content: text });
        state.userMessageCount++;
        appendMessageDOM("user", text);
        saveState();
    }

    function appendMessageDOM(type, text) {
        var container = document.getElementById("chatbot-messages");
        if (!container) return;
        var div = document.createElement("div");
        div.className = "chatbot-msg " + type;
        var content = formatMessageDOM(text);
        div.appendChild(content);
        container.appendChild(div);
        scrollToBottom();
    }

    function renderHistory() {
        var container = document.getElementById("chatbot-messages");
        if (!container) return;
        container.innerHTML = "";
        state.messages.forEach(function (msg) {
            var type = msg.role === "user" ? "user" : "bot";
            var div = document.createElement("div");
            div.className = "chatbot-msg " + type;
            /* Disable animation for restored messages */
            div.style.animation = "none";
            var content = formatMessageDOM(msg.content);
            div.appendChild(content);
            container.appendChild(div);
        });
        if (state.leadFormShown && !state.leadCaptured) {
            showLeadForm();
        }
        scrollToBottom();
    }

    /* ── Message formatting (returns DOM node, never uses innerHTML) ── */
    function formatMessageDOM(text) {
        /* Strip any HTML tags */
        text = text.replace(/<[^>]*>/g, "");
        /* Convert markdown links [text](url) to text (url) */
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)");
        /* Strip markdown bold/italic */
        text = text.replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1");

        var span = document.createElement("span");
        /* URL regex that avoids capturing trailing punctuation */
        var urlRegex = /(https?:\/\/[^\s)<>,;!?"']+(?:\([^\s)]*\))?[^\s)<>,;!?"'.]|(?:^|\s)(jcsm\.fr\/[a-z0-9-]+))/gi;
        var lastIndex = 0;
        var match;

        while ((match = urlRegex.exec(text)) !== null) {
            /* Text before URL */
            if (match.index > lastIndex) {
                appendTextWithBreaks(span, text.substring(lastIndex, match.index));
            }
            /* The URL itself */
            var rawUrl = (match[2] || match[1]).trim();
            var href = rawUrl.startsWith("http") ? rawUrl : "https://" + rawUrl;
            var link = document.createElement("a");
            link.href = href;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = rawUrl;
            span.appendChild(link);
            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < text.length) {
            appendTextWithBreaks(span, text.substring(lastIndex));
        }

        return span;
    }

    function appendTextWithBreaks(parent, text) {
        var lines = text.split("\n");
        for (var i = 0; i < lines.length; i++) {
            parent.appendChild(document.createTextNode(lines[i]));
            if (i < lines.length - 1) {
                parent.appendChild(document.createElement("br"));
            }
        }
    }

    /* ── Scroll ── */
    function scrollToBottom() {
        var container = document.getElementById("chatbot-messages");
        if (!container) return;
        /* Use rAF to wait for DOM update, then set scrollTop directly
           (the CSS scroll-behavior:smooth handles the animation) */
        requestAnimationFrame(function () {
            container.scrollTop = container.scrollHeight;
        });
    }

    /* ── Typing indicator ── */
    function showTyping() {
        var container = document.getElementById("chatbot-messages");
        if (!container) return;
        var typing = document.createElement("div");
        typing.className = "chatbot-typing";
        typing.id = "chatbot-typing";
        typing.innerHTML = "<span></span><span></span><span></span>";
        container.appendChild(typing);
        scrollToBottom();
    }

    function removeTyping() {
        var el = document.getElementById("chatbot-typing");
        if (el && el.parentNode) {
            el.parentNode.removeChild(el);
        }
    }

    /* ── Lead capture form ── */
    function showLeadForm() {
        state.leadFormShown = true;
        saveState();
        var container = document.getElementById("chatbot-messages");
        if (!container) return;

        /* Prevent duplicate forms */
        if (document.getElementById("chatbot-lead-form")) return;

        var form = document.createElement("div");
        form.className = "chatbot-lead-form";
        form.id = "chatbot-lead-form";
        form.innerHTML =
            '<p>Pour mieux vous accompagner, pourriez-vous me laisser vos coordonn\u00e9es ? Un expert vous recontactera rapidement.</p>' +
            '<input type="text" id="chatbot-lead-nom" placeholder="Votre nom" aria-label="Votre nom" autocomplete="name">' +
            '<input type="email" id="chatbot-lead-email" placeholder="Votre email *" aria-label="Votre email" autocomplete="email" required>' +
            '<input type="text" id="chatbot-lead-entreprise" placeholder="Votre entreprise" aria-label="Votre entreprise" autocomplete="organization">' +
            '<button id="chatbot-lead-submit">Envoyer</button>' +
            '<button class="chatbot-lead-skip" id="chatbot-lead-skip">Continuer sans renseigner</button>';
        container.appendChild(form);
        scrollToBottom();

        document.getElementById("chatbot-lead-submit").addEventListener("click", handleLeadSubmit);
        document.getElementById("chatbot-lead-skip").addEventListener("click", handleLeadSkip);
    }

    function handleLeadSubmit() {
        var nomInput = document.getElementById("chatbot-lead-nom");
        var emailInput = document.getElementById("chatbot-lead-email");
        var entrepriseInput = document.getElementById("chatbot-lead-entreprise");

        var nom = nomInput.value.trim();
        var email = emailInput.value.trim();
        var entreprise = entrepriseInput.value.trim();

        /* Validate email */
        var emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
        if (!email || !emailRegex.test(email)) {
            emailInput.classList.add("chatbot-input-error");
            emailInput.focus();
            return;
        }
        emailInput.classList.remove("chatbot-input-error");

        /* Disable submit button to prevent double-submit */
        var submitBtn = document.getElementById("chatbot-lead-submit");
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Envoi...";
        }

        state.leadCaptured = true;
        saveState();

        var formEl = document.getElementById("chatbot-lead-form");
        if (formEl && formEl.parentNode) formEl.parentNode.removeChild(formEl);

        callAPI("", { nom: nom, email: email, entreprise: entreprise });
        addBotMessage("Merci " + (nom || "") + " ! Un expert JCSM vous recontactera prochainement. En attendant, n'h\u00e9sitez pas \u00e0 me poser d'autres questions.");
    }

    function handleLeadSkip() {
        state.leadCaptured = true;
        saveState();

        var formEl = document.getElementById("chatbot-lead-form");
        if (formEl && formEl.parentNode) formEl.parentNode.removeChild(formEl);

        addBotMessage("Pas de souci ! N'h\u00e9sitez pas si vous avez d'autres questions.");
    }

    /* ── Send message ── */
    function handleSend() {
        if (state.loading) return;
        var input = document.getElementById("chatbot-input");
        var text = input.value.trim();
        if (!text) return;

        input.value = "";
        input.style.height = "auto";

        addUserMessage(text);

        /* Show lead form after threshold messages */
        if (!state.leadCaptured && !state.leadFormShown && state.userMessageCount >= LEAD_THRESHOLD) {
            showLeadForm();
        }

        callAPI(text);
    }

    /* ── API call ── */
    function callAPI(message, leadInfo) {
        if (!message && !leadInfo) return;

        state.loading = true;
        var sendBtn = document.getElementById("chatbot-send");
        if (sendBtn) sendBtn.disabled = true;

        if (message) showTyping();

        var payload = {
            message: message || "lead_capture",
            conversation_id: state.conversationId,
            history: state.messages.slice(-HISTORY_LIMIT)
        };
        if (leadInfo) payload.lead_info = leadInfo;

        var controller = new AbortController();
        var timeout = setTimeout(function () { controller.abort(); }, API_TIMEOUT);

        fetch(API_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal
        })
        .then(function (res) {
            if (!res.ok) throw new Error("HTTP " + res.status);
            return res.json();
        })
        .then(function (data) {
            removeTyping();
            if (data.conversation_id) {
                state.conversationId = data.conversation_id;
            }
            if (message && data.response) {
                addBotMessage(data.response);
            }
        })
        .catch(function (err) {
            removeTyping();
            if (message) {
                var errorMsg;
                if (err && err.name === "AbortError") {
                    errorMsg = "Le serveur ne r\u00e9pond pas. Veuillez r\u00e9essayer.";
                } else if (err && err.message && err.message.indexOf("HTTP 429") !== -1) {
                    errorMsg = "Trop de messages envoy\u00e9s. Veuillez patienter quelques instants.";
                } else {
                    errorMsg = "D\u00e9sol\u00e9, une erreur est survenue. Veuillez r\u00e9essayer ou nous contacter via jcsm.fr/contact.";
                }
                addBotMessage(errorMsg);
            }
        })
        .finally(function () {
            clearTimeout(timeout);
            state.loading = false;
            var btn = document.getElementById("chatbot-send");
            if (btn) btn.disabled = false;
        });
    }

    /* ── Hint (notification after delay) ── */
    function scheduleHint() {
        if (state.messages.length > 1) return;
        if (sessionStorage.getItem("jcsm_chatbot_hint")) return;
        setTimeout(function () {
            if (!state.open) {
                showNotification();
                sessionStorage.setItem("jcsm_chatbot_hint", "1");
            }
        }, HINT_DELAY);
    }

    /* ── Bootstrap ── */
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
}();
