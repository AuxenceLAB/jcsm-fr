// Script d'améliorations dynamiques pour toutes les pages JCSM

// Initialisation du body (transition smooth)
if (document.body) {
    document.body.classList.add('loaded');
}

// Barre de progression de scroll
function initScrollProgress() {
    const scrollProgress = document.getElementById('scroll-progress');
    if (!scrollProgress) return;
    
    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.pageYOffset / windowHeight) * 100;
        scrollProgress.style.width = scrolled + '%';
    });
}

// Création des particules subtiles
function createParticles() {
    const particlesBg = document.getElementById('particles-bg');
    if (!particlesBg) return;
    
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';
        particlesBg.appendChild(particle);
    }
}

// Compteurs animés pour les statistiques
function initCounters() {
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(start);
            }
        }, 16);
    }
    
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = entry.target.querySelectorAll('.counter');
                counters.forEach(counter => {
                    const target = parseInt(counter.getAttribute('data-target'));
                    if (target && counter.textContent === '0') {
                        animateCounter(counter, target);
                    }
                });
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    const allSections = document.querySelectorAll('section');
    allSections.forEach(section => {
        const heading = section.querySelector('h2');
        if (heading && (heading.textContent.includes('Crédibilité') || heading.textContent.includes('Chiffres'))) {
            statsObserver.observe(section);
        }
    });
}

// Transitions de page smooth
function initPageTransitions() {
    document.querySelectorAll('a[href$=".html"]').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.hostname === window.location.hostname && !this.getAttribute('target')) {
                document.body.style.opacity = '0';
                setTimeout(() => {
                    window.location.href = this.href;
                }, 200);
            }
        });
    });
}

// Initialisation au chargement
window.addEventListener('load', function() {
    initScrollProgress();
    createParticles();
    initCounters();
    initPageTransitions();
});
