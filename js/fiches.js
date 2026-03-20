let ALL_FICHES = [];
let _fichesFilter = '';
let _fichesSearch = '';

const escF = "function" == typeof window.escapeHtml ? window.escapeHtml : e => {
    if (null == e) return "";
    const t = document.createElement("div");
    return t.textContent = String(e), t.innerHTML;
};

const DEFAULT_FICHES = [
    { id: "f1", titre: "Procedure Installation Borne IRVE", categorie: "Installation", auteur: "JCSM Tech", date: "2024-01-01", description: "Etapes standard pour la pose et le raccordement d'une borne 22kW.", image: "https://images.unsplash.com/photo-1669223789304-7a13bd5ce81e?q=80&w=600&auto=format&fit=crop" },
    { id: "f2", titre: "Remplacement Connecteur T2", categorie: "Maintenance", auteur: "JCSM Tech", date: "2024-02-15", description: "Guide securite pour le changement de prise T2 endommagee.", image: "https://images.unsplash.com/photo-1544724569-5f546fd6dd2d?q=80&w=600&auto=format&fit=crop" }
];

function initFiches() {
    loadFiches();
    renderFiches();
    initFichesListeners();
}

function loadFiches() {
    try {
        const e = localStorage.getItem("fiches_v1");
        e ? ALL_FICHES = JSON.parse(e) : (ALL_FICHES = [...DEFAULT_FICHES], saveFiches());
    } catch (e) {
        ALL_FICHES = [...DEFAULT_FICHES];
    }
}

function saveFiches() {
    try {
        localStorage.setItem("fiches_v1", JSON.stringify(ALL_FICHES));
    } catch (e) {
        "function" == typeof showToast && showToast("Espace de stockage plein ou erreur locale.", "error");
    }
}

function getFilteredFiches() {
    let fiches = ALL_FICHES;
    if (_fichesFilter) {
        fiches = fiches.filter(f => (f.categorie || '').toLowerCase() === _fichesFilter.toLowerCase());
    }
    if (_fichesSearch) {
        const q = _fichesSearch.toLowerCase();
        fiches = fiches.filter(f =>
            (f.titre || '').toLowerCase().includes(q) ||
            (f.description || '').toLowerCase().includes(q) ||
            (f.auteur || '').toLowerCase().includes(q) ||
            (f.categorie || '').toLowerCase().includes(q)
        );
    }
    return fiches;
}

function getCategories() {
    const cats = new Set();
    ALL_FICHES.forEach(f => { if (f.categorie) cats.add(f.categorie); });
    return Array.from(cats).sort();
}

function renderFichesFilters() {
    const container = document.getElementById("fiches-filters");
    if (!container) return;
    const cats = getCategories();
    container.innerHTML =
        '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:16px">' +
            '<div style="flex:1;min-width:200px;position:relative">' +
                '<input type="search" id="fiches-search" placeholder="Rechercher une fiche..."' +
                    ' value="' + escF(_fichesSearch) + '"' +
                    ' style="width:100%;padding:10px 14px 10px 38px;border:2px solid #e5e7eb;border-radius:12px;font-size:14px;background:#fff;color:#1a1a2e;transition:border-color .2s">' +
                '<svg style="position:absolute;left:12px;top:50%;transform:translateY(-50%);width:16px;height:16px;color:#6b7280;pointer-events:none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
            '</div>' +
            '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
                '<button class="fiches-filter-btn' + (!_fichesFilter ? ' active' : '') + '" data-cat=""' +
                    ' style="padding:8px 14px;border-radius:20px;border:1px solid #e5e7eb;background:' + (!_fichesFilter ? '#1B365D' : '#fff') + ';color:' + (!_fichesFilter ? '#fff' : '#374151') + ';font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;white-space:nowrap">Toutes</button>' +
                cats.map(function(c) {
                    var isActive = _fichesFilter === c;
                    return '<button class="fiches-filter-btn' + (isActive ? ' active' : '') + '" data-cat="' + escF(c) + '"' +
                        ' style="padding:8px 14px;border-radius:20px;border:1px solid #e5e7eb;background:' + (isActive ? '#1B365D' : '#fff') + ';color:' + (isActive ? '#fff' : '#374151') + ';font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;white-space:nowrap">' + escF(c) + '</button>';
                }).join('') +
            '</div>' +
        '</div>';
    // Bind search
    var searchInput = document.getElementById("fiches-search");
    if (searchInput) {
        searchInput.addEventListener("input", function() {
            _fichesSearch = this.value;
            renderFiches();
        });
    }
    // Bind filter buttons
    container.querySelectorAll(".fiches-filter-btn").forEach(function(btn) {
        btn.addEventListener("click", function() {
            _fichesFilter = this.dataset.cat || '';
            renderFichesFilters();
            renderFiches();
        });
    });
}

function renderFiches() {
    var e = document.getElementById("fiches-container");
    if (!e) return;

    // Render filters first
    renderFichesFilters();

    try {
        e.innerHTML = "";
        var fiches = getFilteredFiches();

        if (0 === fiches.length) {
            var icon = (_fichesSearch || _fichesFilter) ? '&#128269;' : '&#128196;';
            var msg = (_fichesSearch || _fichesFilter) ? 'Aucune fiche trouvee' : 'Aucune fiche disponible';
            var sub = (_fichesSearch || _fichesFilter) ? '<p style="font-size:13px">Essayez d\'autres termes de recherche ou filtres</p>' : '';
            e.innerHTML = '<div style="text-align:center;padding:48px 20px;color:#6b7280">' +
                '<div style="font-size:48px;margin-bottom:12px">' + icon + '</div>' +
                '<p style="font-weight:700;font-size:16px;margin-bottom:4px">' + msg + '</p>' +
                sub + '</div>';
            return;
        }

        fiches.forEach(function(t) {
            var n = document.createElement("div");
            n.className = "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col md:flex-row";
            n.style.cssText = "position:relative;transition:all .2s";
            var i = t.image || "https://via.placeholder.com/150?text=JCSM";
            n.innerHTML =
                '<div class="md:w-1/4 h-48 md:h-auto bg-gray-200 relative" style="min-height:120px">' +
                    '<img src="' + escF(i) + '" alt="' + escF(t.titre) + '" class="absolute inset-0 w-full h-full object-cover" loading="lazy"' +
                        ' onerror="this.src=\'https://via.placeholder.com/150?text=JCSM\';this.onerror=null">' +
                '</div>' +
                '<div class="p-6 flex-1 flex flex-col justify-between" style="min-width:0">' +
                    '<div>' +
                        '<div class="flex justify-between items-start mb-2" style="gap:8px">' +
                            '<span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded uppercase tracking-wide" style="white-space:nowrap">' + escF(t.categorie || "General") + '</span>' +
                            '<span class="text-xs text-gray-500" style="white-space:nowrap">' + escF(t.date || "-") + '</span>' +
                        '</div>' +
                        '<h3 class="text-xl font-bold text-gray-900 mb-2" style="overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">' + escF(t.titre) + '</h3>' +
                        '<p class="text-gray-600 line-clamp-2 mb-4">' + escF(t.description || "Pas de description.") + '</p>' +
                    '</div>' +
                    '<div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-50" style="gap:12px;flex-wrap:wrap">' +
                        '<span class="text-sm text-gray-500 flex items-center gap-2">' +
                            '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>' +
                            escF(t.auteur || "Anonyme") +
                        '</span>' +
                        '<div style="display:flex;gap:8px;align-items:center">' +
                            '<button class="btn-lire-fiche text-blue-600 hover:text-blue-800 font-medium text-sm" data-fiche-id="' + escF(t.id) + '" style="cursor:pointer;padding:6px 12px;border:1px solid #dbeafe;border-radius:8px;background:#eff6ff;transition:all .15s">Lire la fiche</button>' +
                            '<button class="btn-delete-fiche text-red-500 hover:text-red-700 text-sm" data-fiche-id="' + escF(t.id) + '" style="cursor:pointer;padding:6px 8px;border:1px solid #fee2e2;border-radius:8px;background:#fef2f2;transition:all .15s" title="Supprimer">' +
                                '<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>' +
                            '</button>' +
                        '</div>' +
                    '</div>' +
                '</div>';

            // "Lire la fiche" button
            var readBtn = n.querySelector(".btn-lire-fiche");
            if (readBtn) {
                (function(ficheId) {
                    readBtn.addEventListener("click", function(ev) {
                        ev.stopPropagation();
                        openFicheDetail(ficheId);
                    });
                })(t.id);
            }

            // Delete button
            var delBtn = n.querySelector(".btn-delete-fiche");
            if (delBtn) {
                (function(ficheId) {
                    delBtn.addEventListener("click", function(ev) {
                        ev.stopPropagation();
                        deleteFiche(ficheId);
                    });
                })(t.id);
            }

            e.appendChild(n);
        });
    } catch (t) {
        console.error("renderFiches error:", t);
        e.innerHTML = '<div class="text-center text-gray-400 p-8">Erreur lors du chargement des fiches.</div>';
    }
}

function openFicheDetail(id) {
    var fiche = ALL_FICHES.find(function(f) { return f.id === id; });
    if (!fiche) return;

    // Create or reuse detail modal
    var overlay = document.getElementById("modal-fiche-detail");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "modal-fiche-detail";
        overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.5);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);z-index:300;display:none;align-items:center;justify-content:center;padding:20px;opacity:0;transition:opacity .25s";
        document.body.appendChild(overlay);
    }

    var imgSrc = fiche.image || "https://via.placeholder.com/600x300?text=JCSM";
    overlay.innerHTML =
        '<div style="background:#fff;border-radius:20px;max-width:640px;width:100%;max-height:85vh;overflow-y:auto;box-shadow:0 25px 80px rgba(0,0,0,.3)">' +
            '<div style="position:relative;height:200px;overflow:hidden;border-radius:20px 20px 0 0">' +
                '<img src="' + escF(imgSrc) + '" alt="' + escF(fiche.titre) + '" style="width:100%;height:100%;object-fit:cover"' +
                    ' onerror="this.src=\'https://via.placeholder.com/600x300?text=JCSM\';this.onerror=null">' +
                '<button id="close-fiche-detail" style="position:absolute;top:12px;right:12px;width:40px;height:40px;border-radius:50%;background:rgba(0,0,0,.5);border:none;color:#fff;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px)">x</button>' +
                '<div style="position:absolute;bottom:12px;left:12px;display:flex;gap:8px">' +
                    '<span style="background:rgba(59,130,246,.9);color:#fff;padding:4px 12px;border-radius:8px;font-size:12px;font-weight:700;text-transform:uppercase;backdrop-filter:blur(8px)">' + escF(fiche.categorie || "General") + '</span>' +
                '</div>' +
            '</div>' +
            '<div style="padding:24px">' +
                '<h2 style="font-size:22px;font-weight:800;color:#1a1a2e;margin-bottom:12px;line-height:1.3">' + escF(fiche.titre) + '</h2>' +
                '<div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;font-size:13px;color:#6b7280">' +
                    '<span style="display:flex;align-items:center;gap:6px">' +
                        '<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>' +
                        escF(fiche.auteur || "Anonyme") +
                    '</span>' +
                    '<span style="display:flex;align-items:center;gap:6px">' +
                        '<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
                        escF(fiche.date || "-") +
                    '</span>' +
                '</div>' +
                '<div style="background:#f8fafc;border-radius:12px;padding:20px;line-height:1.8;color:#374151;font-size:15px;white-space:pre-line">' + escF(fiche.description || "Pas de description.") + '</div>' +
            '</div>' +
        '</div>';

    // Show with animation
    overlay.style.display = "flex";
    requestAnimationFrame(function() { overlay.style.opacity = "1"; });

    // Close handlers
    var closeDetail = function() {
        overlay.style.opacity = "0";
        setTimeout(function() { overlay.style.display = "none"; }, 250);
    };
    var closeBtn = overlay.querySelector("#close-fiche-detail");
    if (closeBtn) closeBtn.addEventListener("click", closeDetail);
    overlay.addEventListener("click", function(ev) {
        if (ev.target === overlay) closeDetail();
    });
}

function deleteFiche(id) {
    var fiche = ALL_FICHES.find(function(f) { return f.id === id; });
    if (!fiche) return;
    if (!confirm('Supprimer la fiche "' + (fiche.titre || '') + '" ?')) return;
    ALL_FICHES = ALL_FICHES.filter(function(f) { return f.id !== id; });
    saveFiches();
    renderFiches();
    "function" == typeof showToast && showToast("Fiche supprimee", "success");
}

function initFichesListeners() {
    var e = document.getElementById("btn-add-fiche");
    var t = document.getElementById("modal-fiche");
    var n = document.getElementById("close-modal-fiche");
    var i = document.getElementById("fiche-form");

    if (t) {
        t.setAttribute("role", "dialog");
        t.setAttribute("aria-modal", "true");
        t.setAttribute("aria-label", "Nouvelle fiche methode");
    }

    // Open modal
    if (e && t) {
        e.addEventListener("click", function() {
            t.style.display = "flex";
        });
    }

    // Close modal
    if (n && t) {
        n.addEventListener("click", function() {
            t.style.display = "none";
        });
    }

    // Close on backdrop click
    if (t) {
        t.addEventListener("click", function(ev) {
            if (ev.target === t) t.style.display = "none";
        });
    }

    // Close on Escape
    document.addEventListener("keydown", function(ev) {
        if (ev.key === "Escape") {
            if (t && t.style.display === "flex") t.style.display = "none";
            var detail = document.getElementById("modal-fiche-detail");
            if (detail && detail.style.display !== "none" && detail.style.display !== "") {
                detail.style.opacity = "0";
                setTimeout(function() { detail.style.display = "none"; }, 250);
            }
        }
    });

    // Form submission
    if (i) {
        i.addEventListener("submit", function(e) {
            e.preventDefault();
            var titre = (document.getElementById("fiche-titre").value || "").trim();
            var categorie = document.getElementById("fiche-categorie") ? document.getElementById("fiche-categorie").value.trim() : "Divers";
            var contenu = document.getElementById("fiche-contenu") ? document.getElementById("fiche-contenu").value.trim() : "";

            if (!titre || titre.length < 2) {
                return void ("function" == typeof showToast && showToast("Le titre doit contenir au moins 2 caracteres", "warning"));
            }
            if (titre.length > 200) {
                return void ("function" == typeof showToast && showToast("Le titre ne doit pas depasser 200 caracteres", "warning"));
            }

            var fiche = {
                id: "f_" + Date.now(),
                titre: titre,
                categorie: categorie,
                auteur: "true" === localStorage.getItem("is_admin") ? "Admin" : "Technicien",
                date: (new Date).toLocaleDateString("fr-FR"),
                description: contenu,
                image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?q=80&w=600&auto=format&fit=crop"
            };
            ALL_FICHES.unshift(fiche);
            saveFiches();
            renderFiches();
            i.reset();
            if (t) t.style.display = "none";
            "function" == typeof showToast && showToast("Fiche creee avec succes", "success");
        });
    }
}

window.initFiches = initFiches;
