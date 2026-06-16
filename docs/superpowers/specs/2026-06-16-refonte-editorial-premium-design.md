# Refonte « Éditorial premium » — viser le 10/10 partout

**Date :** 2026-06-16
**Statut :** validé visuellement (3 tours de maquette + hero quasi-final), prêt pour implémentation
**Prédécesseur :** `2026-06-09-refonte-design-editorial-design.md` (système « Clarté éditoriale B1 »)

## Objectif

Élever l'exécution du design de JCSM à un niveau « 10/10 » sur l'ensemble du site public, par une **évolution assumée** du système B1 existant — pas une rupture. On garde la palette (crème `#FAFAF7`, encre `#0F1B2D`, bleu JCSM `#2563EB`, filets `#E3E2DB`) et l'esprit éditorial sobre. On muscle l'exécution : typographie de titres, rythme d'espacement, traitement photo, composants, micro-détails.

Direction retenue par l'utilisateur : **B — Éditorial premium**. Police de titres retenue : **Fraunces** (serif éditorial à fort contraste), via Google Fonts.

## Le levier n°1 : la typographie de titres

Remplacer le serif système (Georgia) par **Fraunces** pour `h1`/`h2`/`.font-display` (titres éditoriaux uniquement ; `h3`–`h6` restent en Inter bold, le corps en Inter).

- **Chargement :** `<link rel="preconnect">` vers `fonts.googleapis.com` + `fonts.gstatic.com`, puis `<link>` Fraunces avec `display=swap`. Axes chargés : `opsz` (optical size, variable), poids 400 + 600, italique 400/500 (pour les `em` bleus).
- **Fallback :** `font-family: Fraunces, Georgia, "Times New Roman", serif;` — si Fraunces ne charge pas, le rendu reste cohérent (Georgia, comme aujourd'hui). Pas de FOIT : `display=swap` évite le texte invisible.
- **CSP :** ajouter `https://fonts.gstatic.com` à `font-src` dans `/etc/nginx/snippets/security.conf` (et la CSP globale). `fonts.googleapis.com` est déjà autorisé dans `style-src`. **Action serveur requise** — à fournir à l'utilisateur sous forme de diff nginx (je ne recharge pas nginx moi-même).
- **Variable `--font-serif`** dans `styles.css:39` mise à jour : `"Fraunces", Georgia, "Times New Roman", serif;`. Comme tous les sélecteurs de titres utilisent `var(--font-serif)`, **un seul changement propage à tout le site**.

## Langage de composants (modifs dans `styles.css` — propagation globale)

Tous les composants existants sont conservés (mêmes noms de classe, zéro casse), mais raffinés :

1. **`.sec-label`** (`styles.css:2224`) — ajout d'un filet horizontal doré (`#9A7B3F`) en `::before` (26px), letter-spacing `.14em`, couleur dorée. Donne le ton « éditorial ».
2. **Titres** — `h1` passe en Fraunces 400 (pas 600 : Fraunces a déjà du contraste), `line-height` resserré à ~1.02–1.06, `letter-spacing -.018em`. `h1 em` / `h2 em` : italique bleu (déjà en place).
3. **`.card-feature`** (`styles.css:2199`) — radius `16px`, hover : `translateY(-4px)` + ombre douce `0 20px 40px rgba(15,27,45,.08)` (au lieu de la bordure bleue). Icône dans un carré `#eef3ff` arrondi.
4. **Boutons** — `.btn-primary` : pill (radius `999px` déjà forcé), ombre portée bleue `0 10px 24px rgba(37,99,235,.25)`. `.btn-secondary` : variante « lien souligné » éditoriale (bordure-bas 2px encre) en plus de la variante pill existante (classe utilitaire `.btn-underline`).
5. **Rangée de chiffres (stats)** — les nombres passent en Fraunces (au lieu d'Inter extrabold) sur filet fin. Touche éditoriale forte, déjà visible dans le hero actuel (`counter-animate`).
6. **Traitement photo `.shot`** (nouveau) — wrapper photo : radius `20px`, `object-fit:cover`, ombre `0 30px 70px rgba(15,27,45,.18)`, + sous-composants optionnels `.shot .badge` (statut live) et `.shot .floatcard` (carte « preuve » : Qualifelec, etc.).
7. **Rythme d'espacement** — sections cœur : padding vertical généreux (`clamp`), grille hero `1.08fr / .92fr` avec `gap` large. Harmonisation via utilitaires existants, pas de nouveau framework.

Aucune classe supprimée. Les pages qui n'utilisent pas `.shot`/`.badge` ne sont pas affectées.

## Application par page

**Phase 1 — Fondation (propage partout) :**
- `styles.css` : `--font-serif`, `.sec-label`, titres, `.card-feature`, boutons, `.shot`/`.badge`/`.floatcard`, stats.
- Chargement Fraunces (`<link preconnect>` + `<link>`) ajouté dans le `<head>` de chaque page. Méthode : script `sed`/insertion ciblée sur tous les `*.html` hors `demo/`, `powerdot/virta/evergreen`, portail interne.
- Diff CSP nginx fourni à l'utilisateur.

**Phase 2 — Pages cœur (markup hero/sections à la main) :**
`index.html`, `a-propos.html`, les pages services (`pilotage-projets`, `installation-conformite`, `exploitation`, `securisation-installations`, `centre-appel`), `tarification.html`, `contact.html`. Hero éditorial + traitement photo + sections rythmées.

**Phase 3 — Propagation :**
`zones/*.html`, `solutions/*.html`, `blog.html` + `blog/*.html`. Bénéficient déjà des gains CSS Phase 1 ; ajustements ciblés de hero/intro là où le markup le permet. Les traductions (`en/`, `de/`, …) : Fraunces + CSS hérités automatiquement (Phase 1) ; markup hero aligné sur les pages FR équivalentes dans un second temps.

## Hors périmètre

- `powerdot.html`, `virta.html`, `evergreen.html` (maquettes partenaires autonomes, palette propre — exclues du système B1).
- `demo/` (copie git séparée, noindex).
- Portail interne `interne.html` (outil technicien, hors design marketing).
- Refonte de contenu / wording (on garde la copy ; règles B1 respectées : « réponse sous 24h ouvrées », « France entière et Belgique », pas de note Google / `aggregateRating`).

## Contraintes transverses

- **Performance :** Fraunces ne charge que les poids utilisés ; `preconnect` + `swap`. Pas de CLS notable (fallback Georgia métriquement proche ; `size-adjust` envisageable si décalage visible).
- **Accessibilité :** contrastes AA conservés (encre/crème, bleu/blanc). `prefers-reduced-motion` déjà respecté par `wow-effects.js` ; les nouveaux hovers (`translateY`) sont neutralisés sous reduced-motion.
- **Dark mode :** toujours désactivé (light forcé).
- **Cache :** après modifs CSS/JS, bump `sw.js` (v75 → v76), `js/config.js` (2.56.0 → 2.57.0), et le cache-buster `?v=NN` des `<head>` (~149 fichiers) de façon synchrone.
- **Build Tailwind :** si de nouvelles classes utilitaires sont introduites, `npm run build:css` ; sinon le CSS custom suffit. Vérifier que `tailwind.config.js` couvre bien tous les répertoires touchés.
- **Production :** site live. Modifs CSS testées sur `_design-preview.html` d'abord ; rollback = `git revert`. La page de preview `_design-preview.html` (noindex, Disallow robots) est supprimée en fin de chantier.

## Vérification

- Charger 1 page de chaque type (accueil, zone, solution, article blog) et vérifier : Fraunces actif, fallback propre si CSP pas encore rechargée, aucune classe cassée, hovers OK, mobile (`<640px`) correct.
- Lighthouse/visuel : pas de régression de perf majeure liée à la police.
- `git diff --stat` revu avant commit ; commits par phase.
