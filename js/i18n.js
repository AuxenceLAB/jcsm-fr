/**
 * i18n.js - Internationalization: translations, language URLs, language selector UI
 * Fixed: innerHTML replaced with safe DOM construction for toggle buttons and dropdown,
 *        scroll handler rAF-gated (was already), keyboard accessibility on dropdown
 */
!function () {
    "use strict";

    var T = {
        cookieAriaLabel: { fr: "Consentement cookies", en: "Cookie consent", es: "Consentimiento de cookies", de: "Cookie-Einwilligung", pt: "Consentimento de cookies", nl: "Cookietoestemming", pl: "Zgoda na pliki cookie", it: "Consenso cookie" },
        cookieTitle: { fr: "Confidentialit\u00e9", en: "Privacy", es: "Privacidad", de: "Datenschutz", pt: "Privacidade", nl: "Privacy", pl: "Prywatno\u015b\u0107", it: "Privacy" },
        cookieText: { fr: "Nous utilisons des cookies pour am\u00e9liorer votre exp\u00e9rience. En continuant, vous acceptez notre politique de confidentialit\u00e9.", en: "We use cookies to improve your experience. By continuing, you agree to our privacy policy.", es: "Utilizamos cookies para mejorar su experiencia. Al continuar, acepta nuestra pol\u00edtica de privacidad.", de: "Wir verwenden Cookies, um Ihre Erfahrung zu verbessern. Durch die weitere Nutzung stimmen Sie unserer Datenschutzrichtlinie zu.", pt: "Utilizamos cookies para melhorar a sua experi\u00eancia. Ao continuar, aceita a nossa pol\u00edtica de privacidade.", nl: "Wij gebruiken cookies om uw ervaring te verbeteren. Door verder te gaan, gaat u akkoord met ons privacybeleid.", pl: "U\u017cywamy plik\u00f3w cookie, aby poprawi\u0107 Twoje do\u015bwiadczenia. Kontynuuj\u0105c, akceptujesz nasz\u0105 polityk\u0119 prywatno\u015bci.", it: "Utilizziamo i cookie per migliorare la tua esperienza. Continuando, accetti la nostra politica sulla privacy." },
        cookieAccept: { fr: "Accepter", en: "Accept", es: "Aceptar", de: "Akzeptieren", pt: "Aceitar", nl: "Accepteren", pl: "Zaakceptuj", it: "Accetta" },
        cookieDecline: { fr: "Refuser", en: "Decline", es: "Rechazar", de: "Ablehnen", pt: "Recusar", nl: "Weigeren", pl: "Odrzu\u0107", it: "Rifiuta" },
        fieldRequired: { fr: "Ce champ est requis", en: "This field is required", es: "Este campo es obligatorio", de: "Dieses Feld ist erforderlich", pt: "Este campo \u00e9 obrigat\u00f3rio", nl: "Dit veld is verplicht", pl: "To pole jest wymagane", it: "Questo campo \u00e8 obbligatorio" },
        emailInvalid: { fr: "Email invalide", en: "Invalid email", es: "Correo electr\u00f3nico no v\u00e1lido", de: "Ung\u00fcltige E-Mail", pt: "Email inv\u00e1lido", nl: "Ongeldig e-mailadres", pl: "Nieprawid\u0142owy email", it: "Email non valida" },
        phoneInvalid: { fr: "Num\u00e9ro invalide", en: "Invalid number", es: "N\u00famero no v\u00e1lido", de: "Ung\u00fcltige Nummer", pt: "N\u00famero inv\u00e1lido", nl: "Ongeldig nummer", pl: "Nieprawid\u0142owy numer", it: "Numero non valido" },
        sending: { fr: "Envoi...", en: "Sending...", es: "Enviando...", de: "Senden...", pt: "Enviando...", nl: "Verzenden...", pl: "Wysy\u0142anie...", it: "Invio..." },
        formSending: { fr: "Formulaire en cours d'envoi", en: "Form is being submitted", es: "Enviando formulario", de: "Formular wird gesendet", pt: "Formul\u00e1rio sendo enviado", nl: "Formulier wordt verzonden", pl: "Formularz jest wysy\u0142any", it: "Invio del modulo in corso" },
        nameMinLength: { fr: "Le nom doit contenir au moins 2 caract\u00e8res", en: "Name must be at least 2 characters", es: "El nombre debe tener al menos 2 caracteres", de: "Der Name muss mindestens 2 Zeichen lang sein", pt: "O nome deve ter pelo menos 2 caracteres", nl: "De naam moet minimaal 2 tekens bevatten", pl: "Imi\u0119 musi mie\u0107 co najmniej 2 znaki", it: "Il nome deve contenere almeno 2 caratteri" },
        emailRequired: { fr: "Veuillez entrer une adresse email valide", en: "Please enter a valid email address", es: "Por favor, introduzca una direcci\u00f3n de correo electr\u00f3nico v\u00e1lida", de: "Bitte geben Sie eine g\u00fcltige E-Mail-Adresse ein", pt: "Por favor, insira um endere\u00e7o de email v\u00e1lido", nl: "Voer een geldig e-mailadres in", pl: "Prosz\u0119 poda\u0107 prawid\u0142owy adres email", it: "Inserisci un indirizzo email valido" },
        messageMinLength: { fr: "Le message doit contenir au moins 10 caract\u00e8res", en: "Message must be at least 10 characters", es: "El mensaje debe tener al menos 10 caracteres", de: "Die Nachricht muss mindestens 10 Zeichen lang sein", pt: "A mensagem deve ter pelo menos 10 caracteres", nl: "Het bericht moet minimaal 10 tekens bevatten", pl: "Wiadomo\u015b\u0107 musi mie\u0107 co najmniej 10 znak\u00f3w", it: "Il messaggio deve contenere almeno 10 caratteri" },
        privacyRequired: { fr: "Vous devez accepter la politique de confidentialit\u00e9", en: "You must accept the privacy policy", es: "Debe aceptar la pol\u00edtica de privacidad", de: "Sie m\u00fcssen die Datenschutzrichtlinie akzeptieren", pt: "Deve aceitar a pol\u00edtica de privacidade", nl: "U moet het privacybeleid accepteren", pl: "Musisz zaakceptowa\u0107 polityk\u0119 prywatno\u015bci", it: "Devi accettare l'informativa sulla privacy" },
        formSuccess: { fr: "Votre message a été enregistré. JCSM vous recontactera.", en: "Your message has been received. JCSM will contact you.", es: "Hemos recibido su mensaje. JCSM se pondrá en contacto con usted.", de: "Ihre Nachricht wurde empfangen. JCSM wird Sie kontaktieren.", pt: "A sua mensagem foi recebida. A JCSM entrará em contacto consigo.", nl: "Uw bericht is ontvangen. JCSM neemt contact met u op.", pl: "Twoja wiadomość została odebrana. JCSM skontaktuje się z Tobą.", it: "Il tuo messaggio è stato ricevuto. JCSM ti ricontatterà." },
        formError: { fr: "Une erreur est survenue. Veuillez r\u00e9essayer.", en: "An error occurred. Please try again.", es: "Se ha producido un error. Por favor, int\u00e9ntelo de nuevo.", de: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.", pt: "Ocorreu um erro. Por favor, tente novamente.", nl: "Er is een fout opgetreden. Probeer het opnieuw.", pl: "Wyst\u0105pi\u0142 b\u0142\u0105d. Prosz\u0119 spr\u00f3bowa\u0107 ponownie.", it: "Si \u00e8 verificato un errore. Riprova." },
        formTimeout: { fr: "Le serveur ne r\u00e9pond pas. Veuillez r\u00e9essayer.", en: "Server is not responding. Please try again.", es: "El servidor no responde. Por favor, int\u00e9ntelo de nuevo.", de: "Der Server antwortet nicht. Bitte versuchen Sie es erneut.", pt: "O servidor n\u00e3o responde. Por favor, tente novamente.", nl: "De server reageert niet. Probeer het opnieuw.", pl: "Serwer nie odpowiada. Prosz\u0119 spr\u00f3bowa\u0107 ponownie.", it: "Il server non risponde. Riprova." },
        formConflict: { fr: "Ce formulaire avait déjà servi pour un autre envoi. Cliquez de nouveau sur le bouton : votre saisie est conservée.", en: "This form had already been used for another submission. Click the button again: your entries are kept.", es: "Este formulario ya se había utilizado para otro envío. Vuelva a pulsar el botón: sus datos se conservan.", de: "Dieses Formular wurde bereits für eine andere Anfrage verwendet. Klicken Sie erneut auf die Schaltfläche: Ihre Eingaben bleiben erhalten.", pt: "Este formulário já tinha sido usado noutro envio. Clique novamente no botão: os seus dados são mantidos.", nl: "Dit formulier is al voor een andere verzending gebruikt. Klik opnieuw op de knop: uw gegevens blijven bewaard.", pl: "Ten formularz został już użyty do innego wysłania. Kliknij przycisk ponownie: wpisane dane zostają zachowane.", it: "Questo modulo era già stato usato per un altro invio. Fai di nuovo clic sul pulsante: i dati inseriti sono conservati." },
        formInvalid: { fr: "Certaines informations n'ont pas été acceptées. Vérifiez le nom, l'email et le message, puis renvoyez le formulaire.", en: "Some details were not accepted. Check your name, email and message, then send the form again.", es: "Algunos datos no se han aceptado. Compruebe el nombre, el correo electrónico y el mensaje, y vuelva a enviar el formulario.", de: "Einige Angaben wurden nicht akzeptiert. Prüfen Sie Name, E-Mail und Nachricht und senden Sie das Formular erneut.", pt: "Alguns dados não foram aceites. Verifique o nome, o email e a mensagem e envie novamente o formulário.", nl: "Sommige gegevens zijn niet geaccepteerd. Controleer uw naam, e-mailadres en bericht en verstuur het formulier opnieuw.", pl: "Niektóre dane nie zostały zaakceptowane. Sprawdź imię i nazwisko, adres email oraz wiadomość, a następnie wyślij formularz ponownie.", it: "Alcuni dati non sono stati accettati. Controlla nome, email e messaggio, poi invia di nuovo il modulo." },
        formRateLimit: { fr: "Trop d'envois en peu de temps. Patientez une dizaine de minutes puis renvoyez : votre saisie est conservée.", en: "Too many submissions in a short time. Wait about ten minutes, then send again: your entries are kept.", es: "Demasiados envíos en poco tiempo. Espere unos diez minutos y vuelva a enviarlo: sus datos se conservan.", de: "Zu viele Anfragen in kurzer Zeit. Warten Sie etwa zehn Minuten und senden Sie dann erneut: Ihre Eingaben bleiben erhalten.", pt: "Demasiados envios em pouco tempo. Aguarde cerca de dez minutos e envie novamente: os seus dados são mantidos.", nl: "Te veel verzendingen in korte tijd. Wacht ongeveer tien minuten en verstuur dan opnieuw: uw gegevens blijven bewaard.", pl: "Zbyt wiele wysłań w krótkim czasie. Odczekaj około dziesięciu minut i wyślij ponownie: wpisane dane zostają zachowane.", it: "Troppi invii in poco tempo. Attendi una decina di minuti, poi invia di nuovo: i dati inseriti sono conservati." },
        formUnavailable: { fr: "Le service d'envoi est momentanément indisponible. Votre saisie est conservée : réessayez dans quelques minutes ou appelez le +33 1 83 75 57 06.", en: "The sending service is temporarily unavailable. Your entries are kept: try again in a few minutes or call +33 1 83 75 57 06.", es: "El servicio de envío no está disponible en este momento. Sus datos se conservan: inténtelo de nuevo en unos minutos o llame al +33 1 83 75 57 06.", de: "Der Versanddienst ist vorübergehend nicht verfügbar. Ihre Eingaben bleiben erhalten: Versuchen Sie es in einigen Minuten erneut oder rufen Sie +33 1 83 75 57 06 an.", pt: "O serviço de envio está temporariamente indisponível. Os seus dados são mantidos: tente novamente dentro de alguns minutos ou ligue para +33 1 83 75 57 06.", nl: "De verzendservice is tijdelijk niet beschikbaar. Uw gegevens blijven bewaard: probeer het over enkele minuten opnieuw of bel +33 1 83 75 57 06.", pl: "Usługa wysyłania jest chwilowo niedostępna. Wpisane dane zostają zachowane: spróbuj ponownie za kilka minut lub zadzwoń pod numer +33 1 83 75 57 06.", it: "Il servizio di invio è momentaneamente non disponibile. I dati inseriti sono conservati: riprova tra qualche minuto o chiama il +33 1 83 75 57 06." },
        offlineFormError: { fr: "Vous \u00eates hors ligne. V\u00e9rifiez votre connexion et r\u00e9essayez.", en: "You are offline. Check your connection and try again.", es: "Est\u00e1 sin conexi\u00f3n. Compruebe su conexi\u00f3n e int\u00e9ntelo de nuevo.", de: "Sie sind offline. Pr\u00fcfen Sie Ihre Verbindung und versuchen Sie es erneut.", pt: "Est\u00e1 offline. Verifique a sua conex\u00e3o e tente novamente.", nl: "U bent offline. Controleer uw verbinding en probeer het opnieuw.", pl: "Jeste\u015b offline. Sprawd\u017a po\u0142\u0105czenie i spr\u00f3buj ponownie.", it: "Sei offline. Controlla la connessione e riprova." },
        onlineRestored: { fr: "Connexion r\u00e9tablie !", en: "Connection restored!", es: "\u00a1Conexi\u00f3n restablecida!", de: "Verbindung wiederhergestellt!", pt: "Conex\u00e3o restabelecida!", nl: "Verbinding hersteld!", pl: "Po\u0142\u0105czenie przywr\u00f3cone!", it: "Connessione ripristinata!" },
        offlineMode: { fr: "Vous \u00eates hors ligne. Mode d\u00e9grad\u00e9 activ\u00e9.", en: "You are offline. Degraded mode enabled.", es: "Est\u00e1 desconectado. Modo degradado activado.", de: "Sie sind offline. Eingeschr\u00e4nkter Modus aktiviert.", pt: "Est\u00e1 offline. Modo degradado ativado.", nl: "U bent offline. Beperkte modus geactiveerd.", pl: "Jeste\u015b offline. Tryb awaryjny aktywowany.", it: "Sei offline. Modalit\u00e0 limitata attivata." },
        offlineBanner: { fr: "Vous \u00eates hors ligne, certaines fonctionnalit\u00e9s ne sont pas disponibles.", en: "You are offline, some features are unavailable.", es: "Est\u00e1 sin conexi\u00f3n, algunas funciones no est\u00e1n disponibles.", de: "Sie sind offline, einige Funktionen sind nicht verf\u00fcgbar.", pt: "Est\u00e1 offline, algumas funcionalidades n\u00e3o est\u00e3o dispon\u00edveis.", nl: "U bent offline, sommige functies zijn niet beschikbaar.", pl: "Jeste\u015b offline, niekt\u00f3re funkcje s\u0105 niedost\u0119pne.", it: "Sei offline, alcune funzionalit\u00e0 non sono disponibili." },
        skipToContent: { fr: "Aller au contenu principal", en: "Skip to main content", es: "Ir al contenido principal", de: "Zum Hauptinhalt springen", pt: "Ir para o conte\u00fado principal", nl: "Ga naar hoofdinhoud", pl: "Przejd\u017a do tre\u015bci", it: "Vai al contenuto principale" },
        scrollToTop: { fr: "Retour en haut de la page", en: "Back to top", es: "Volver arriba", de: "Zur\u00fcck nach oben", pt: "Voltar ao topo", nl: "Terug naar boven", pl: "Powr\u00f3t na g\u00f3r\u0119", it: "Torna su" },
        loading: { fr: "Chargement en cours", en: "Loading", es: "Cargando", de: "Laden", pt: "Carregando", nl: "Laden", pl: "\u0141adowanie", it: "Caricamento" },
        opensNewTab: { fr: "(ouvre dans un nouvel onglet)", en: "(opens in a new tab)", es: "(abre en una nueva pesta\u00f1a)", de: "(\u00f6ffnet in einem neuen Tab)", pt: "(abre em uma nova aba)", nl: "(opent in een nieuw tabblad)", pl: "(otwiera w nowej karcie)", it: "(apre in una nuova scheda)" },
        languageLabel: { fr: "Langue", en: "Language", es: "Idioma", de: "Sprache", pt: "Idioma", nl: "Taal", pl: "J\u0119zyk", it: "Lingua" }
    };

    var lang = (document.documentElement.lang || "fr").substring(0, 2);

    function t(key) {
        var entry = T[key];
        return entry && (entry[lang] || entry.fr) || key;
    }

    // URL slug maps: fr slug -> { lang: translated slug }
    var SLUG_MAP = {
        "": { en: "", es: "", de: "", pt: "", nl: "", pl: "", it: "" },
        "pilotage-projets": { en: "project-management", es: "gestion-proyectos", de: "projektmanagement", pt: "gestao-projetos", nl: "projectbeheer", pl: "zarzadzanie-projektami", it: "gestione-progetti" },
        "installation-conformite": { en: "installation-compliance", es: "instalacion-conformidad", de: "installation-konformitaet", pt: "instalacao-conformidade", nl: "installatie-conformiteit", pl: "instalacja-zgodnosc", it: "installazione-conformita" },
        "exploitation": { en: "operations-maintenance", es: "operacion-mantenimiento", de: "betrieb-wartung", pt: "operacao-manutencao", nl: "exploitatie-onderhoud", pl: "eksploatacja-konserwacja", it: "gestione-manutenzione" },
        "securisation-installations": { en: "installation-security", es: "seguridad-instalaciones", de: "anlagensicherung", pt: "seguranca-instalacoes", nl: "beveiliging-installaties", pl: "zabezpieczenie-instalacji", it: "sicurezza-installazioni" },
        "centre-appel": { en: "call-center", es: "centro-llamadas", de: "callcenter", pt: "central-atendimento", nl: "callcenter", pl: "centrum-telefoniczne", it: "centro-chiamate" },
        "couverture": { en: "coverage", pt: "cobertura" },
        "devenir-partenaire": { en: "become-partner" },
        "carrieres": { en: "careers" },
        "mentions-legales": { en: "legal-notice" },
        "cgv": { en: "terms" },
        "confidentialite": { en: "privacy" },
        "a-propos": { en: "about", es: "nosotros", de: "ueber-uns", pt: "sobre-nos", nl: "over-ons", pl: "o-nas", it: "chi-siamo" },
        "contact": { en: "contact", es: "contacto", de: "kontakt", pt: "contato", nl: "contact", pl: "kontakt", it: "contatti" }
    };

    // Reverse map: { lang: { translatedSlug: frSlug } }
    var reverseMap = {};
    Object.keys(SLUG_MAP).forEach(function (frSlug) {
        var translations = SLUG_MAP[frSlug];
        Object.keys(translations).forEach(function (targetLang) {
            if (!reverseMap[targetLang]) reverseMap[targetLang] = {};
            reverseMap[targetLang][translations[targetLang]] = frSlug;
        });
    });

    function getLanguageUrl(targetLang) {
        var path = window.location.pathname;
        var frSlug;

        if (lang === "fr") {
            var m = path.match(/^\/([a-z-]+?)(?:\.html)?$/);
            frSlug = m ? m[1] : "";
        } else {
            var m2 = path.match(/^\/[a-z]{2}\/([a-z-]+?)(?:\.html)?$/);
            var currentSlug = m2 ? m2[1] : "";
            frSlug = (reverseMap[lang] && reverseMap[lang][currentSlug] !== undefined) ? reverseMap[lang][currentSlug] : "";
        }

        if (targetLang === "fr") {
            return frSlug ? "/" + frSlug : "/";
        }

        var translated = SLUG_MAP[frSlug] && SLUG_MAP[frSlug][targetLang];
        if (translated === undefined) return "/" + targetLang + "/";
        return translated ? "/" + targetLang + "/" + translated : "/" + targetLang + "/";
    }

    var LANGUAGES = [
        { code: "fr", label: "Fran\u00e7ais" },
        { code: "en", label: "English" },
        { code: "es", label: "Espa\u00f1ol" },
        { code: "de", label: "Deutsch" },
        { code: "pt", label: "Portugu\u00eas" },
        { code: "nl", label: "Nederlands" },
        { code: "pl", label: "Polski" },
        { code: "it", label: "Italiano" }
    ];

    function initSelector() {
        var currentLang = LANGUAGES.find(function (l) { return l.code === lang; }) || LANGUAGES[0];

        var containers = Array.from(document.querySelectorAll('.lang-selector, [id="lang-selector"]'));

        // Auto-create containers in nav if none exist
        if (containers.length === 0) {
            var desktopNav = document.querySelector("nav.glass-nav .hidden.xl\\:flex, nav.glass-nav .hidden.lg\\:flex");
            if (desktopNav) {
                var contactBtn = desktopNav.querySelector('a[href*="contact"].btn-primary');
                var div1 = document.createElement("div");
                div1.className = "lang-selector relative";
                if (contactBtn) {
                    contactBtn.parentNode.insertBefore(div1, contactBtn);
                } else {
                    desktopNav.appendChild(div1);
                }
                containers.push(div1);
            }
            var mobileNav = document.querySelector("#mobile-menu .flex.flex-col, nav.mobile-menu .flex.flex-col");
            if (mobileNav) {
                var mContactBtn = mobileNav.querySelector('a[href*="contact"].btn-primary');
                var div2 = document.createElement("div");
                div2.className = "lang-selector relative";
                if (mContactBtn) {
                    mContactBtn.parentNode.insertBefore(div2, mContactBtn);
                } else {
                    mobileNav.appendChild(div2);
                }
                containers.push(div2);
            }
        }

        if (containers.length === 0) return;

        // Build toggle button via DOM (no innerHTML)
        function buildToggle() {
            var btn = document.createElement("button");
            btn.className = "lang-toggle flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors";
            btn.setAttribute("aria-expanded", "false");
            btn.setAttribute("aria-controls", "lang-dropdown");
            btn.setAttribute("aria-label", t("languageLabel") + " " + currentLang.code.toUpperCase());

            var codeSpan = document.createElement("span");
            codeSpan.textContent = currentLang.code.toUpperCase();
            btn.appendChild(codeSpan);

            var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("class", "w-3.5 h-3.5 transition-transform");
            svg.setAttribute("fill", "none");
            svg.setAttribute("stroke", "currentColor");
            svg.setAttribute("viewBox", "0 0 24 24");
            var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("stroke-linecap", "round");
            path.setAttribute("stroke-linejoin", "round");
            path.setAttribute("stroke-width", "2");
            path.setAttribute("d", "M19 9l-7 7-7-7");
            svg.appendChild(path);
            btn.appendChild(svg);

            return btn;
        }

        containers.forEach(function (c) {
            c.textContent = "";
            c.appendChild(buildToggle());
        });

        // Build dropdown via DOM (no innerHTML)
        var existing = document.getElementById("lang-dropdown");
        if (existing) existing.remove();

        var dropdown = document.createElement("div");
        dropdown.id = "lang-dropdown";
        dropdown.className = "hidden";
        dropdown.setAttribute("aria-label", t("languageLabel"));
        Object.assign(dropdown.style, {
            position: "fixed",
            width: "11rem",
            borderRadius: "0.75rem",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,.1), 0 8px 10px -6px rgba(0,0,0,.1)",
            border: "1px solid #f3f4f6",
            padding: "0.25rem 0",
            zIndex: "10001",
            backgroundColor: "#ffffff",
            backdropFilter: "none",
            WebkitBackdropFilter: "none"
        });

        LANGUAGES.forEach(function (l) {
            var a = document.createElement("a");
            a.href = getLanguageUrl(l.code);
            if (l.code === lang) a.setAttribute("aria-current", "true");
            a.setAttribute("hreflang", l.code);
            a.style.cssText = "display:flex;align-items:center;gap:0.625rem;padding:0.625rem 1rem;font-size:0.875rem;text-decoration:none;transition:background-color 0.15s;";
            a.style.color = l.code === lang ? "#1d4ed8" : "#374151";
            a.style.backgroundColor = l.code === lang ? "#eff6ff" : "#ffffff";
            a.style.fontWeight = l.code === lang ? "600" : "400";

            var codeSpan = document.createElement("span");
            codeSpan.setAttribute("aria-hidden", "true");
            codeSpan.style.cssText = "min-width:1.5rem;font-size:0.75rem;font-weight:600;color:#5A6470;";
            codeSpan.textContent = l.code.toUpperCase();
            a.appendChild(codeSpan);

            var labelSpan = document.createElement("span");
            labelSpan.textContent = l.label;
            a.appendChild(labelSpan);

            // Hover effects
            var isSelected = l.code === lang;
            a.addEventListener("mouseenter", function () {
                if (!isSelected) a.style.backgroundColor = "#f9fafb";
            });
            a.addEventListener("mouseleave", function () {
                if (!isSelected) a.style.backgroundColor = "#ffffff";
            });

            dropdown.appendChild(a);
        });

        document.body.appendChild(dropdown);

        // Position and toggle logic
        var activeToggle = null;

        function positionDropdown(toggle) {
            var rect = toggle.getBoundingClientRect();
            var ddWidth = dropdown.offsetWidth;
            var centerX = rect.left + rect.width / 2;
            dropdown.style.top = (rect.bottom + 8) + "px";
            dropdown.style.left = Math.max(8, centerX - ddWidth / 2) + "px";
        }

        function closeDropdown() {
            dropdown.classList.add("hidden");
            document.querySelectorAll(".lang-toggle").forEach(function (btn) {
                btn.setAttribute("aria-expanded", "false");
                var svg = btn.querySelector("svg");
                if (svg) svg.style.transform = "";
            });
            activeToggle = null;
        }

        document.querySelectorAll(".lang-toggle").forEach(function (btn) {
            btn.addEventListener("click", function (e) {
                e.stopPropagation();
                var wasOpen = !dropdown.classList.contains("hidden") && activeToggle === btn;
                closeDropdown();
                if (!wasOpen) {
                    activeToggle = btn;
                    positionDropdown(btn);
                    dropdown.classList.remove("hidden");
                    btn.setAttribute("aria-expanded", "true");
                    var svg = btn.querySelector("svg");
                    if (svg) svg.style.transform = "rotate(180deg)";
                    (dropdown.querySelector('[aria-current="true"]') || dropdown.querySelector("a")).focus({ preventScroll: true });
                }
            });
        });

        document.addEventListener("click", closeDropdown);

        // Clavier : le menu est ajouté en fin de page, le focus y entre donc à l'ouverture
        // (langue courante), Échap le referme et Tab le quitte en reprenant après le bouton.
        dropdown.addEventListener("keydown", function (e) {
            var links = Array.from(dropdown.querySelectorAll("a"));
            var i = links.indexOf(document.activeElement);
            var toggle = activeToggle;
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                links[(i + (e.key === "ArrowDown" ? 1 : links.length - 1)) % links.length].focus();
            } else if (e.key === "Escape" || e.key === "Tab") {
                if (e.key === "Escape") e.preventDefault();
                closeDropdown();
                if (toggle) toggle.focus();
            }
        });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && activeToggle && !dropdown.contains(document.activeElement)) {
                var toggle = activeToggle;
                closeDropdown();
                toggle.focus();
            }
        });

        // Reposition on scroll (rAF-gated)
        var scrollTick = false;
        window.addEventListener("scroll", function () {
            if (activeToggle && !dropdown.classList.contains("hidden") && !scrollTick) {
                scrollTick = true;
                requestAnimationFrame(function () {
                    positionDropdown(activeToggle);
                    scrollTick = false;
                });
            }
        }, { passive: true });
    }

    // Export
    window.JCSM_I18N = { t: t, lang: lang, T: T, getLanguageUrl: getLanguageUrl, LANGUAGES: LANGUAGES, SLUG_MAP: SLUG_MAP };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initSelector);
    } else {
        initSelector();
    }
}();
