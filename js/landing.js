/**
 * landing.js - Contact form logic for JCSM landing page
 * Fixed: XSS (textContent over innerHTML), abort controller cleanup, accessibility
 */
function initContactForm() {
    try {
        var form = document.getElementById("contactForm");
        var formMessage = document.getElementById("formMessage");
        if (!form) return;

        var abortController = null;
        var sourceRef = form.querySelector('input[name="source_ref"]');
        var page = form.querySelector('input[name="page"]');
        var langue = form.querySelector('input[name="langue"]');
        var storageKey = 'jcsm-site-contact:' + window.location.pathname;

        function newSourceRef() {
            if (!window.crypto || !window.crypto.randomUUID) return '';
            return 'jcsm-fr:' + window.crypto.randomUUID();
        }

        function ensureSourceRef() {
            if (!sourceRef) return false;
            if (sourceRef.value) return true;
            try { sourceRef.value = sessionStorage.getItem(storageKey) || ''; } catch (_) { /* stockage facultatif */ }
            if (!sourceRef.value) sourceRef.value = newSourceRef();
            if (!sourceRef.value) return false;
            try { sessionStorage.setItem(storageKey, sourceRef.value); } catch (_) { /* stockage facultatif */ }
            return true;
        }

        if (page) page.value = window.location.pathname;
        if (langue) langue.value = (document.documentElement.lang || 'fr').slice(0, 8);
        ensureSourceRef();

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            if (abortController) return;

            var valid = true;
            var submitBtn = form.querySelector('button[type="submit"]');
            var t = window.JCSM_I18N ? window.JCSM_I18N.t : function (k) { return k; };

            // Clear previous errors
            form.querySelectorAll(".error-message").forEach(function (el) {
                el.classList.add("hidden");
                el.textContent = "";
            });
            form.querySelectorAll("input, textarea").forEach(function (el) {
                el.classList.remove("border-red-500");
                el.removeAttribute("aria-invalid");
            });

            // Validate name
            var nom = document.getElementById("nom");
            if (!nom) return;
            if (nom.value.trim().length < 2) {
                showError(nom, t("nameMinLength"), formMessage);
                valid = false;
            }

            // Validate email
            var email = document.getElementById("email");
            if (!email) return;
            if (!email.value.trim() || !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(email.value)) {
                showError(email, t("emailRequired"), formMessage);
                valid = false;
            }

            // Validate phone (optional) - supports French (+33) and Belgian (+32) numbers
            var phone = form.querySelector('input[name="telephone"],input[type="tel"]');
            if (phone && phone.value.trim()) {
                var phoneClean = phone.value.replace(/[\s.\-()]/g, "");
                var phoneValid = /^(?:(?:\+|00)(?:33[1-9]\d{8}|32[1-9]\d{7,8})|0[1-9]\d{8})$/.test(phoneClean);
                if (!phoneValid) {
                    showError(phone, t("phoneInvalid") || "Numero de telephone invalide", formMessage);
                    valid = false;
                }
            }

            // Validate message
            var message = document.getElementById("message");
            if (!message) return;
            if (message.value.trim().length < 10) {
                showError(message, t("messageMinLength"), formMessage);
                valid = false;
            }

            // Validate RGPD checkbox
            var rgpd = document.getElementById("rgpd");
            if (rgpd && !rgpd.checked) {
                showError(rgpd, t("privacyRequired"), formMessage);
                valid = false;
            }

            if (!valid) {
                var firstInvalid = form.querySelector('[aria-invalid="true"]');
                if (firstInvalid) firstInvalid.focus();
                return;
            }

            // Check offline before attempting submission
            if (!navigator.onLine) {
                showError(null, t("offlineFormError"), formMessage);
                return;
            }
            if (!ensureSourceRef()) {
                showError(null, t("formError"), formMessage);
                return;
            }
            if (page) page.value = window.location.pathname;
            if (langue) langue.value = (document.documentElement.lang || 'fr').slice(0, 8);

            // Show loading state
            var submitText = submitBtn.querySelector(".submit-text");
            var submitLoading = submitBtn.querySelector(".submit-loading");
            if (submitText) submitText.classList.add("hidden");
            if (submitLoading) submitLoading.classList.remove("hidden");
            submitBtn.disabled = true;

            // Abort any previous in-flight request
            if (abortController) {
                abortController.abort();
            }
            abortController = new AbortController();
            var timeoutId = setTimeout(function () { abortController.abort(); }, 15000);

            var formData = new FormData(form);

            fetch(form.action, {
                method: "POST",
                body: formData,
                headers: { Accept: "application/json" },
                signal: abortController.signal
            }).then(async function (res) {
                var result = await res.json().catch(function () { return null; });
                if (res.ok && result && result.ok === true) {
                    showSuccess(t("formSuccess"), formMessage);
                    form.reset();
                    sourceRef.value = '';
                    try { sessionStorage.removeItem(storageKey); } catch (_) { /* stockage facultatif */ }
                } else {
                    if (res.status === 409) {
                        sourceRef.value = '';
                        try { sessionStorage.removeItem(storageKey); } catch (_) { /* stockage facultatif */ }
                    }
                    showError(null, t("formError"), formMessage);
                }
            }).catch(function (err) {
                if (err.name === "AbortError") {
                    showError(null, t("formTimeout"), formMessage);
                } else {
                    showError(null, t("formError"), formMessage);
                }
            }).finally(function () {
                clearTimeout(timeoutId);
                abortController = null;
                if (submitText) submitText.classList.remove("hidden");
                if (submitLoading) submitLoading.classList.add("hidden");
                submitBtn.disabled = false;
            });
        });
    } catch (e) {
        /* silent fail : contact form init non-critical */
    }
}

function showError(field, msg, formMessage) {
    if (field) {
        field.classList.add("border-red-500");
        field.setAttribute("aria-invalid", "true");
        var errEl = field.parentElement.querySelector(".error-message");
        if (!errEl) {
            var describedBy = field.getAttribute("aria-describedby");
            if (describedBy) errEl = document.getElementById(describedBy);
        }
        if (!errEl) {
            errEl = field.closest("div").parentElement.querySelector(".error-message");
        }
        if (errEl) {
            errEl.textContent = msg;
            errEl.classList.remove("hidden");
        }
    } else if (formMessage) {
        formMessage.textContent = msg;
        formMessage.className = "p-4 rounded-xl mb-6 text-center font-medium bg-red-50 text-red-700 border border-red-200";
        formMessage.classList.remove("hidden");
    }
}

function showSuccess(msg, formMessage) {
    if (formMessage) {
        formMessage.textContent = msg;
        formMessage.className = "p-4 rounded-xl mb-6 text-center font-medium bg-green-50 text-green-700 border border-green-200";
        formMessage.classList.remove("hidden");
        setTimeout(function () {
            formMessage.classList.add("hidden");
        }, 5000);
    }
}

function initInlineValidation() {
    var form = document.getElementById("contactForm");
    if (!form) return;
    var t = window.JCSM_I18N ? window.JCSM_I18N.t : function (k) { return k; };

    function clearFieldError(field) {
        field.classList.remove("border-red-500");
        field.removeAttribute("aria-invalid");
        var errEl = field.parentElement.querySelector(".error-message");
        if (!errEl) {
            var describedBy = field.getAttribute("aria-describedby");
            if (describedBy) errEl = document.getElementById(describedBy);
        }
        if (errEl) {
            errEl.textContent = "";
            errEl.classList.add("hidden");
        }
    }

    var nom = document.getElementById("nom");
    if (nom) {
        nom.addEventListener("blur", function () {
            if (nom.value.trim() && nom.value.length >= 2) clearFieldError(nom);
        });
    }
    var email = document.getElementById("email");
    if (email) {
        email.addEventListener("blur", function () {
            if (email.value.trim() && /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(email.value)) clearFieldError(email);
        });
    }
    var message = document.getElementById("message");
    if (message) {
        message.addEventListener("blur", function () {
            if (message.value.trim() && message.value.length >= 10) clearFieldError(message);
        });
    }
    var rgpd = document.getElementById("rgpd");
    if (rgpd) {
        rgpd.addEventListener("change", function () {
            if (rgpd.checked) clearFieldError(rgpd);
        });
    }
}

document.addEventListener("DOMContentLoaded", function () {
    initContactForm();
    initInlineValidation();
});
