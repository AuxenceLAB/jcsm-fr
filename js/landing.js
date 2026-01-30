/**
 * JCSM Landing Page Logic
 * Gère le lazy loading, la validation du formulaire et les interactions UI.
 */

document.addEventListener('DOMContentLoaded', () => {
    initContactForm();
});

// ==========================================
// FORMULAIRE CONTACT
// ==========================================
function initContactForm() {
    const form = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        let isValid = true;
        const submitBtn = form.querySelector('button[type="submit"]');

        // Reset previous errors
        form.querySelectorAll('.error-message').forEach(el => {
            el.classList.add('hidden');
            el.textContent = '';
        });
        form.querySelectorAll('input, textarea').forEach(el => {
            el.classList.remove('border-red-500');
            el.removeAttribute('aria-invalid');
        });

        // Validate name
        const nom = document.getElementById('nom');
        if (!nom.value.trim() || nom.value.length < 2) {
            showError(nom, 'Le nom doit contenir au moins 2 caractères', formMessage);
            isValid = false;
        }

        // Validate email
        const email = document.getElementById('email');
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
        if (!email.value.trim() || !emailRegex.test(email.value)) {
            showError(email, 'Veuillez entrer une adresse email valide', formMessage);
            isValid = false;
        }

        // Validate message
        const message = document.getElementById('message');
        if (!message.value.trim() || message.value.length < 10) {
            showError(message, 'Le message doit contenir au moins 10 caractères', formMessage);
            isValid = false;
        }

        // Validate RGPD
        const rgpd = document.getElementById('rgpd');
        if (!rgpd.checked) {
            showError(rgpd, 'Vous devez accepter la politique de confidentialité', formMessage);
            isValid = false;
        }

        if (isValid) {
            const submitText = submitBtn.querySelector('.submit-text');
            const submitLoading = submitBtn.querySelector('.submit-loading');
            if (submitText) submitText.classList.add('hidden');
            if (submitLoading) submitLoading.classList.remove('hidden');
            submitBtn.disabled = true;

            // Submit form with timeout
            const formData = new FormData(form);
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 15000);
            fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' },
                signal: controller.signal
            })
                .then(response => {
                    if (response.ok) {
                        showSuccess('Message envoyé avec succès. Un expert JCSM vous répond sous 12 heures ouvrées.', formMessage);
                        form.reset();
                    } else {
                        showError(null, 'Une erreur est survenue. Veuillez réessayer.', formMessage);
                    }
                })
                .catch((err) => {
                    const msg = err.name === 'AbortError'
                        ? 'Le serveur ne répond pas. Veuillez réessayer.'
                        : 'Une erreur est survenue. Veuillez réessayer.';
                    showError(null, msg, formMessage);
                })
                .finally(() => {
                    clearTimeout(timeout);
                    if (submitText) submitText.classList.remove('hidden');
                    if (submitLoading) submitLoading.classList.add('hidden');
                    submitBtn.disabled = false;
                });
        }
    });
}

function showError(field, message, formMessage) {
    if (field) {
        field.classList.add('border-red-500');
        field.setAttribute('aria-invalid', 'true');
        const errorSpan = field.parentElement.querySelector('.error-message');
        if (errorSpan) {
            errorSpan.textContent = message;
            errorSpan.classList.remove('hidden');
        }
    } else if (formMessage) {
        formMessage.textContent = message;
        formMessage.className = 'p-4 rounded-xl mb-6 text-center font-medium bg-red-50 text-red-700 border border-red-200';
        formMessage.classList.remove('hidden');
    }
}

function showSuccess(message, formMessage) {
    if (!formMessage) return;
    formMessage.textContent = message;
    formMessage.className = 'p-4 rounded-xl mb-6 text-center font-medium bg-green-50 text-green-700 border border-green-200';
    formMessage.classList.remove('hidden');
    setTimeout(() => formMessage.classList.add('hidden'), 5000);
}
