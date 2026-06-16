# Refonte « Éditorial premium » — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Élever le design du site JCSM au niveau « 10/10 » via une évolution du système B1 — titres Fraunces, composants raffinés, traitement photo — propagée sur tout le site public.

**Architecture:** L'essentiel passe par `styles.css` (linké par toutes les pages) + le chargement de Fraunces dans les `<head>`. Un seul changement de `--font-serif` propage à tout le site. Pages cœur retravaillées à la main ; reste du site hérite du CSS. Site en production : test sur `_design-preview.html`, rollback = `git revert`.

**Tech Stack:** HTML statique, CSS custom + Tailwind (build local), Fraunces via Google Fonts, nginx (CSP — action utilisateur).

**Vérification :** pas de tests unitaires (design). Vérif = grep (présence/cohérence) + contrôle visuel sur `_design-preview.html` puis pages réelles. Commits par tâche.

---

## Task 1: Fondation CSS — tokens, titres, sec-label

**Files:**
- Modify: `styles.css:39` (`--font-serif`)
- Modify: `styles.css:99-110` (tailles h1/h2/h3)
- Modify: `styles.css:2224-2230` (`.sec-label`)

- [ ] **Step 1: Passer `--font-serif` à Fraunces avec fallback Georgia**

Remplacer `styles.css:39` :
```css
  --font-serif: "Fraunces", Georgia, "Times New Roman", serif;
```

- [ ] **Step 2: Affiner les titres pour Fraunces**

Remplacer le bloc `styles.css:78-84` (poids des titres) :
```css
h1, h2, .font-display {
  font-family: var(--font-serif);
  font-weight: 400;
  letter-spacing: -0.018em;
}
```
Et `styles.css:99-110` (line-heights resserrés) :
```css
h1 { font-size: 2.85rem; line-height: 1.03; }
h2 { font-size: 2.1rem; line-height: 1.08; }
h3 { font-size: 1.35rem; line-height: 1.3; }
```

- [ ] **Step 3: Raffiner `.sec-label` (filet doré éditorial)**

Remplacer `styles.css:2224-2230` :
```css
.sec-label {
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #9A7B3F;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
}
.sec-label::before {
  content: "";
  width: 26px;
  height: 1px;
  background: #9A7B3F;
}
.section-dark .sec-label { color: #C9A86A; }
.section-dark .sec-label::before { background: #C9A86A; }
```

- [ ] **Step 4: Vérifier**

Run: `grep -n 'Fraunces' styles.css && grep -n 'sec-label::before' styles.css`
Expected: `--font-serif` contient Fraunces ; `.sec-label::before` présent.

- [ ] **Step 5: Commit**

```bash
git add styles.css
git commit -m "Design: fondation Éditorial premium (Fraunces, titres, sec-label)"
```

---

## Task 2: Fondation CSS — cartes, boutons, stats, traitement photo

**Files:**
- Modify: `styles.css:2199-2207` (`.card-feature`)
- Modify: `styles.css` (après `.card-cta`, ajouter `.shot`/`.badge`/`.floatcard`, `.btn-underline`, `.stat-serif`)

- [ ] **Step 1: Raffiner `.card-feature` (hover doux, sans virage bleu)**

Remplacer `styles.css:2199-2207` :
```css
.card-feature {
  background: #fff;
  border: 1px solid var(--color-line);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02);
  transition: transform var(--duration-normal), box-shadow var(--duration-normal);
}
.card-feature:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(15,27,45,0.08); }
@media (prefers-reduced-motion: reduce) {
  .card-feature:hover { transform: none; }
}
.card-feature .ic {
  width: 48px; height: 48px; border-radius: 12px;
  background: #EEF3FF; display: grid; place-items: center; margin-bottom: 1.25rem;
}
```

- [ ] **Step 2: Ajouter les nouveaux composants (après `.card-cta`, ~`styles.css:2218`)**

Insérer :
```css
/* Bouton « lien souligné » éditorial */
.btn-underline {
  color: var(--color-ink);
  font-weight: 600;
  border-bottom: 2px solid var(--color-ink);
  padding-bottom: 2px;
  transition: color var(--duration-normal), border-color var(--duration-normal);
}
.btn-underline:hover { color: var(--color-primary); border-color: var(--color-primary); }

/* Chiffres éditoriaux (stats) */
.stat-serif { font-family: var(--font-serif); font-weight: 600; letter-spacing: -0.01em; }

/* Traitement photo soigné */
.shot { position: relative; border-radius: 20px; overflow: hidden; box-shadow: 0 30px 70px rgba(15,27,45,0.18); }
.shot img { width: 100%; height: 100%; object-fit: cover; display: block; }
.shot .badge {
  position: absolute; top: 1.1rem; left: 1.1rem;
  background: rgba(250,250,247,0.95); backdrop-filter: blur(6px);
  border-radius: 999px; padding: 0.5rem 0.9rem; font-size: 0.78rem; font-weight: 600;
  display: inline-flex; align-items: center; gap: 0.5rem;
}
.shot .badge .d { width: 8px; height: 8px; border-radius: 50%; background: var(--color-success); box-shadow: 0 0 0 4px rgba(16,185,129,0.22); }
.shot .floatcard {
  position: absolute; bottom: 1.1rem; left: 1.1rem; right: 1.1rem;
  background: rgba(255,255,255,0.96); backdrop-filter: blur(8px);
  border: 1px solid rgba(227,226,219,0.8); border-radius: 14px;
  padding: 1rem 1.1rem; display: flex; align-items: center; gap: 0.9rem;
}
.shot .floatcard .qf { width: 42px; height: 42px; border-radius: 10px; background: var(--color-cream-alt); display: grid; place-items: center; font-family: var(--font-serif); font-weight: 600; color: var(--color-primary); }
.shot .floatcard b { display: block; font-size: 0.9rem; }
.shot .floatcard span { font-size: 0.82rem; color: var(--color-text-secondary); }
```

- [ ] **Step 3: Ombre bleue sur `.btn-primary`**

À `styles.css:350` (`.btn-primary`), ajouter à la règle existante :
```css
  box-shadow: 0 10px 24px rgba(37,99,235,0.25);
```
(et au `:hover` `styles.css:358`, renforcer : `box-shadow: 0 14px 30px rgba(37,99,235,0.32);`)

- [ ] **Step 4: Vérifier**

Run: `grep -nE '\.shot|\.btn-underline|\.stat-serif' styles.css`
Expected: les 3 classes présentes.

- [ ] **Step 5: Commit**

```bash
git add styles.css
git commit -m "Design: composants premium (cartes, boutons, stats serif, photo .shot)"
```

---

## Task 3: Chargement Fraunces dans les `<head>` (toutes pages publiques)

**Files:**
- Modify: tous les `*.html` hors `demo/`, `powerdot.html`, `virta.html`, `evergreen.html`, `interne.html`

- [ ] **Step 1: Repérer un point d'insertion stable**

Run: `grep -l 'fonts.googleapis.com' index.html` — si déjà présent, insérer après ; sinon insérer juste avant le 1er `<link rel="stylesheet"` du `<head>`.

- [ ] **Step 2: Construire le bloc à insérer**

```html
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400;1,9..144,500&display=swap" rel="stylesheet">
```

- [ ] **Step 3: Insérer dans toutes les pages cibles via script**

```bash
MARKER='<link href="https://fonts.googleapis.com/css2?family=Fraunces'
mapfile -t FILES < <(find . -name '*.html' \
  -not -path './demo/*' \
  -not -name 'powerdot.html' -not -name 'virta.html' -not -name 'evergreen.html' \
  -not -name 'interne.html' \
  -not -name '_design-preview.html')
for f in "${FILES[@]}"; do
  grep -qF "$MARKER" "$f" && continue   # idempotent
  # insère le bloc juste après la balise <head>
  perl -0pi -e 's{(<head[^>]*>)}{$1\n<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght\@0,9..144,400;0,9..144,600;1,9..144,400;1,9..144,500&display=swap" rel="stylesheet">}' "$f"
done
echo "inséré dans ${#FILES[@]} fichiers"
```

- [ ] **Step 4: Vérifier (idempotence + couverture)**

Run: `grep -rl 'family=Fraunces' --include='*.html' . | grep -v demo | wc -l` puis `grep -rc 'family=Fraunces' --include='*.html' index.html`
Expected: ~149 fichiers, **exactement 1** occurrence par fichier (pas de double insertion).

- [ ] **Step 5: Commit**

```bash
git add -A -- '*.html'
git commit -m "Design: chargement police Fraunces dans les head (pages publiques)"
```

---

## Task 4: Diff CSP nginx (livrable utilisateur — PAS d'application)

**Files:**
- Read only: `config/` (backup nginx) pour retrouver la directive `font-src`

- [ ] **Step 1: Localiser la CSP actuelle**

Run: `grep -rn 'font-src\|Content-Security-Policy' config/ /etc/nginx/snippets/security.conf 2>/dev/null`

- [ ] **Step 2: Produire le diff exact**

Présenter à l'utilisateur, dans le chat, la ligne `font-src` actuelle et la version modifiée ajoutant `https://fonts.gstatic.com`, + la commande `sudo nginx -t && sudo systemctl reload nginx`. **Ne pas exécuter** (action serveur de l'utilisateur).

- [ ] **Step 3: Vérifier**

Confirmer dans le chat que sans reload, le fallback Georgia s'applique (pas de casse). Aucune commande nginx exécutée par l'agent.

---

## Task 5: Page cœur — `index.html` (hero éditorial + photo + sections)

**Files:**
- Modify: `index.html:641-700+` (hero), sections services

- [ ] **Step 1: Hero — passer le `<picture>`/photo dans un wrapper `.shot` avec badge + floatcard**

Repérer le bloc photo du hero (colonne droite de la grille `index.html:643`). L'envelopper :
```html
<div class="shot">
  <!-- picture existant conservé -->
  <span class="badge"><span class="d"></span>Équipe terrain en intervention</span>
  <div class="floatcard">
    <span class="qf">Q</span>
    <div><b>Certifié Qualifelec</b><span>Installation &amp; maintenance NF C 15-100</span></div>
  </div>
</div>
```

- [ ] **Step 2: Stats hero en serif**

Sur les 4 nombres `index.html:665-668`, remplacer `font-family: var(--font-sans)` par la classe `stat-serif` (retirer le style inline `font-family`).

- [ ] **Step 3: Vérifier visuellement**

Recharger `https://jcsm.fr/` (Ctrl+Shift+R). Comparer au rendu `_design-preview.html`. Vérifier : Fraunces sur h1 (ou Georgia si CSP pas rechargée), `.shot` ombré, badge/floatcard positionnés, stats en serif, aucun chevauchement mobile (`<640px`).

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Design: accueil — hero éditorial, photo .shot, stats serif"
```

---

## Task 6: Pages cœur restantes

**Files (une passe par fichier, même patron que Task 5) :**
- `a-propos.html`, `pilotage-projets.html`, `installation-conformite.html`, `exploitation.html`, `securisation-installations.html`, `centre-appel.html`, `tarification.html`, `contact.html`

- [ ] **Step 1 (par page): appliquer le patron**

Pour chaque page : `.sec-label` déjà raffinée (héritée) ; envelopper la photo principale (si présente) dans `.shot` ; passer les chiffres clés en `.stat-serif` ; vérifier que les cartes utilisent `.card-feature`. Ne PAS toucher au wording (règles B1).

- [ ] **Step 2 (par page): vérifier visuellement** la page rechargée (desktop + mobile).

- [ ] **Step 3: Commit groupé**

```bash
git add a-propos.html pilotage-projets.html installation-conformite.html exploitation.html securisation-installations.html centre-appel.html tarification.html contact.html
git commit -m "Design: pages cœur — hero/photo/stats éditoriaux"
```

---

## Task 7: Propagation — zones, solutions, blog

**Files:**
- `zones/*.html`, `solutions/*.html`, `blog.html`, `blog/*.html`

- [ ] **Step 1: Bénéfice automatique** — ces pages héritent déjà des gains CSS (Task 1-2) + Fraunces (Task 3). Vérifier 1 page de chaque type rechargée : titres Fraunces, sec-label dorée, cartes hover doux.

- [ ] **Step 2: Ajustements ciblés** — sur les pages zones/solutions disposant d'une photo hero, envelopper dans `.shot`. Articles de blog : vérifier la typo éditoriale (déjà gérée par le bloc BLOG `styles.css:2243+`), aucun ajustement si rendu OK.

- [ ] **Step 3: Vérifier** 4 pages échantillon (1 zone, 1 solution, blog index, 1 article) desktop + mobile.

- [ ] **Step 4: Commit**

```bash
git add zones/ solutions/ blog.html blog/
git commit -m "Design: propagation zones/solutions/blog (éditorial premium)"
```

---

## Task 8: Cache-busting + Service Worker + config + nettoyage

**Files:**
- Modify: `sw.js:1-4`, `js/config.js` (version), `*.html` (`?v=NN`)
- Modify: `CLAUDE.md` (numéros de version), `robots.txt`
- Delete: `_design-preview.html`

- [ ] **Step 1: Bump SW + config**

`sw.js` : v75 → v76 (commentaire + `STATIC_CACHE`, `DYNAMIC_CACHE`, `API_CACHE`). `js/config.js` : `2.56.0` → `2.57.0`.

- [ ] **Step 2: Bump cache-buster `?v=` des head**

Repérer le N actuel : `grep -o '?v=[0-9]*' index.html | head -1`. Puis :
```bash
grep -rln '?v=N_ACTUEL' --include='*.html' . | grep -v '^./demo' | xargs sed -i 's/?v=N_ACTUEL/?v=N_NOUVEAU/g'
```

- [ ] **Step 3: Mettre à jour CLAUDE.md** (sw v76, config 2.57.0, cache-buster) et **supprimer la page de preview**

```bash
rm _design-preview.html
sed -i '/Disallow: \/_design-preview.html/d' robots.txt
```

- [ ] **Step 4: Vérifier**

Run: `grep -c 'v76\|2.57.0' sw.js js/config.js; test ! -f _design-preview.html && echo "preview supprimée"`
Expected: versions bumpées, preview absente.

- [ ] **Step 5: Commit final**

```bash
git add -A
git commit -m "Design: cache-busting v76, config 2.57.0, nettoyage preview + doc"
```

---

## Self-review (couverture spec)

- Fraunges/titres → Task 1 ✓
- sec-label filet doré → Task 1 ✓
- cartes/boutons/stats/photo → Task 2 ✓
- chargement police head → Task 3 ✓
- CSP nginx (livrable) → Task 4 ✓
- pages cœur → Task 5-6 ✓
- propagation zones/solutions/blog/trad → Task 7 ✓
- cache-bust/SW/config/nettoyage → Task 8 ✓
- hors périmètre (powerdot/virta/evergreen/demo/interne) → exclus dans Task 3 ✓
