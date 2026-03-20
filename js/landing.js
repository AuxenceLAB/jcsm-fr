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

        form.addEventListener("submit", function (e) {
            e.preventDefault();

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
            if (!nom.value.trim() || nom.value.length < 2) {
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

            // Validate phone (optional)
            var phone = form.querySelector('input[name="telephone"],input[type="tel"]');
            if (phone && phone.value.trim()) {
                var digits = phone.value.replace(/[\s+\-().]/g, "");
                if (digits.length < 10) {
                    showError(phone, t("phoneMinDigits") || "Le numero doit contenir au moins 10 chiffres", formMessage);
                    valid = false;
                }
            }

            // Validate message
            var message = document.getElementById("message");
            if (!message) return;
            if (!message.value.trim() || message.value.length < 10) {
                showError(message, t("messageMinLength"), formMessage);
                valid = false;
            }

            // Validate RGPD checkbox
            var rgpd = document.getElementById("rgpd");
            if (rgpd && !rgpd.checked) {
                showError(rgpd, t("privacyRequired"), formMessage);
                valid = false;
            }

            if (!valid) return;

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
            }).then(function (res) {
                if (res.ok) {
                    showSuccess(t("formSuccess"), formMessage);
                    form.reset();
                } else {
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
        /* silent fail — contact form init non-critical */
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
