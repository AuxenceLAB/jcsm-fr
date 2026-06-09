# Refonte design "Clarté éditoriale" (B1) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Appliquer la direction visuelle validée (crème #FAFAF7 + bleu JCSM #2563EB + serif Fraunces) à tout le site public jcsm.fr, refondre la home, réviser toutes les pages, et publier 2 articles blog d'actualité.

**Architecture:** Site statique servi live par nginx. Le design system vit dans `styles.css` (variables `:root`) + `css/critical.css` (above-the-fold) + `css/tailwind.css` (build). On modifie d'abord les fondations CSS (propagation automatique aux ~244 pages), puis la home section par section, puis purge mécanique + revue page par page. Spec : `docs/superpowers/specs/2026-06-09-refonte-design-editorial-design.md`.

**Tech Stack:** HTML statique, CSS custom + Tailwind 3.4 (`npm run build:css`), vanilla JS, nginx. Pas de framework de test : la vérification = commandes grep/curl + contrôle visuel navigateur.

**Faits vérifiés (2026-06-09) :**
- `styles.css` : 568 lignes, **minifié** (le `:root` est sur la ligne 1).
- `js/public.js` : minifié (131 lignes). `js/wow-effects.js` : lisible (529 lignes).
- 153 fichiers HTML contiennent le lien Google Fonts `family=Outfit:wght@400;600;700;800&family=JetBrains+Mono:wght@500;600`.
- `sw.js` : caches **v72** (lignes 2-4). `js/config.js` : version **2.53.0** (ligne 31). (CLAUDE.md dit v64/2.45.0 : obsolète, à corriger en Task 11.)
- Home `index.html` (1272 lignes) : hero L524-572, services L575, why-section L649, **avis-google L686** (à supprimer), partenaires L733, FAQ L891, blog L955, contact L992, devenir-partenaire L1099.
- Baseline git : `005fbd4`. Travail en direct sur le site live, commit après chaque task.
- Le dossier `demo/` est exclu de toutes les opérations (`grep -v '^./demo'`).

---

### Task 1: Déminifier styles.css (préparation)

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Prettifier le CSS (aucun changement fonctionnel)**

```bash
cd /var/www/jcsm.fr && npx -y prettier --write styles.css && wc -l styles.css
```

Expected: ~3000+ lignes, fichier lisible.

- [ ] **Step 2: Vérifier que le site répond toujours**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1/styles.css
```

Expected: `200`

- [ ] **Step 3: Commit**

```bash
git add styles.css && git commit -m "Prettify styles.css avant refonte (aucun changement fonctionnel)"
```

---

### Task 2: Design system — variables et typographie de base

**Files:**
- Modify: `styles.css` (bloc `:root` au début + règles `body`, titres)

- [ ] **Step 1: Remplacer le contenu du bloc `:root`**

Remplacer les valeurs existantes par (conserver toute variable existante non listée ici, notamment shadows/spacing/radius/easing) :

```css
:root {
  --color-primary: #2563EB;
  --color-primary-dark: #1D4ED8;
  --color-primary-darker: #1E40AF;
  --color-primary-glow: rgba(37, 99, 235, 0.15);
  --color-secondary: #1D4ED8;   /* ex-violet #7C3AED, remappé bleu */
  --color-accent: #2563EB;      /* ex-cyan #06B6D4, remappé bleu */
  --color-ink: #0F1B2D;
  --color-cream: #FAFAF7;
  --color-cream-alt: #F3F2EC;
  --color-line: #E3E2DB;
  --color-blue-pale: #DBEAFE;
  --color-success: #10b981;
  --color-error: #ef4444;
  --color-gray-900: #0F1B2D;
  --color-gray-500: #5B6472;
  --color-gray-400: #5B6472;
  --color-gray-300: #d1d5db;
  --color-gray-200: #E3E2DB;
  --color-gray-100: #F3F2EC;
  --color-white: #ffffff;
  --color-bg: #FAFAF7;
  --color-text-secondary: #5B6472;
  --gradient-primary: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
  --gradient-dark: linear-gradient(135deg, #0F1B2D 0%, #16263F 100%);
  --gradient-glow: linear-gradient(135deg, rgba(37, 99, 235, 0.10), rgba(37, 99, 235, 0.04));
  --font-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-serif: 'Fraunces', Georgia, 'Times New Roman', serif;
}
```

Le remappage de `--color-secondary` / `--color-accent` vers du bleu rend instantanément bleues toutes les utilisations résiduelles du violet/cyan, avant leur purge en Task 8.

- [ ] **Step 2: Typographie de base**

Dans la règle `body`, vérifier `font-family: var(--font-sans)` et `color: var(--color-gray-900)` (déjà le cas via variables). Ajouter après la règle `body` :

```css
h1, h2, h3,
.font-display {
  font-family: var(--font-serif);
  font-weight: 600;
  letter-spacing: -0.01em;
}
h1 em, h2 em, h3 em {
  font-style: italic;
  color: var(--color-primary);
}
```

Attention : les pages utilisent aussi des classes Tailwind `font-bold`/`font-extrabold` sur les h1/h2 ; `font-weight: 600` ici sera surchargé par Tailwind là où ces classes existent — acceptable, Fraunces supporte les deux graisses (on charge 400/600 ; les `font-bold` Tailwind rendront en 600 via synthèse ou graisse la plus proche).

- [ ] **Step 3: Vérification visuelle rapide**

```bash
grep -c "Fraunces" styles.css && curl -s http://127.0.0.1/ -o /dev/null -w "%{http_code}\n"
```

Expected: au moins 1 occurrence, `200`. Ouvrir https://jcsm.fr en navigation privée : fonds crème, titres encore en fallback Georgia (la police arrive en Task 3) — normal.

- [ ] **Step 4: Commit**

```bash
git add styles.css && git commit -m "Design system : palette creme + bleu JCSM, variables Fraunces/Inter"
```

---

### Task 3: Polices — swap Outfit → Fraunces+Inter sur 153 pages + Tailwind

**Files:**
- Modify: 153 fichiers `*.html` (hors `demo/`), `tailwind.config.js`

- [ ] **Step 1: Remplacement sed du lien Google Fonts**

```bash
cd /var/www/jcsm.fr
grep -rl 'family=Outfit' --include='*.html' . | grep -v '^./demo' | xargs sed -i 's|family=Outfit:wght@400;600;700;800\&family=JetBrains+Mono:wght@500;600|family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400\&family=Inter:wght@400;500;600;700;800|g'
```

- [ ] **Step 2: Vérifier qu'il ne reste aucun Outfit (variantes d'URL comprises)**

```bash
grep -rn 'Outfit' --include='*.html' . | grep -v '^./demo' | head
```

Expected: aucune ligne. S'il reste des occurrences (autre combinaison de poids, `font-family` inline), les remplacer manuellement une par une vers Fraunces (titres) ou Inter (le reste).

- [ ] **Step 3: tailwind.config.js — fontFamily**

Dans `theme.extend`, ajouter :

```js
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  serif: ['Fraunces', 'Georgia', 'serif'],
},
```

- [ ] **Step 4: Build Tailwind et vérifier**

```bash
npm run build:css && curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1/css/tailwind.css
```

Expected: build OK, `200`.

- [ ] **Step 5: Commit**

```bash
git add -A ':!demo' && git commit -m "Typo : Fraunces + Inter remplacent Outfit sur tout le site public"
```

---

### Task 4: Composants — nav, boutons, cartes, sections, footer

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Nav épurée**

Localiser les règles de nav (`grep -n "glass\|nav" styles.css`). Remplacer le fond glassmorphism par :

```css
/* Nav editoriale */
nav, .glass-nav {
  background: rgba(250, 250, 247, 0.92);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-line);
  box-shadow: none;
}
```

Supprimer tout `saturate(...)` et les variantes de blur au scroll si présentes.

- [ ] **Step 2: Boutons pill**

Modifier `.btn-primary` / `.btn-secondary` (garder leurs padding existants) :

```css
.btn-primary {
  background: var(--color-primary);
  color: #fff;
  border-radius: var(--radius-full);
  transition: background var(--duration-normal), transform var(--duration-normal);
}
.btn-primary:hover { background: var(--color-primary-dark); transform: translateY(-1px); }
.btn-secondary {
  background: transparent;
  color: var(--color-ink);
  border: 1.5px solid var(--color-ink);
  border-radius: var(--radius-full);
  transition: background var(--duration-normal), color var(--duration-normal);
}
.btn-secondary:hover { background: var(--color-ink); color: #fff; }
```

Note : beaucoup de pages ont `rounded-xl` en classe Tailwind sur les boutons ; `border-radius` ici doit gagner → ajouter `border-radius: var(--radius-full) !important;` sur ces deux classes (cas justifié : surcharge utilitaire massive non éditable page par page).

- [ ] **Step 3: Nouvelles cartes + utilitaires éditoriaux (ajouter en fin de styles.css)**

```css
/* ===== Design editorial B1 ===== */
.card-lead {
  background: var(--color-ink);
  color: #fff;
  border-radius: var(--radius-xl);
  padding: 2rem;
}
.card-lead .num { color: #9DB8E8; }
.card-feature {
  background: #fff;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-xl);
  padding: 2rem;
  transition: border-color var(--duration-normal), transform var(--duration-normal);
}
.card-feature:hover { border-color: var(--color-primary); transform: translateY(-2px); }
.card-quote {
  border-left: 3px solid var(--color-primary);
  padding-left: 1.25rem;
}
.card-quote p { font-family: var(--font-serif); font-style: italic; }
.card-cta {
  background: var(--color-primary);
  color: #fff;
  border-radius: var(--radius-xl);
  text-align: center;
}
.num {
  font-family: var(--font-serif);
  font-size: 0.95rem;
  color: var(--color-primary);
}
.sec-label {
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-primary);
  font-weight: 700;
}
.section-dark {
  background: var(--color-ink);
  color: #F5F4EF;
}
.section-dark .sec-label { color: #7FA6E8; }
.section-dark .step { border-top: 2px solid var(--color-primary); padding-top: 0.875rem; }
.section-alt { background: var(--color-cream-alt); }
.logo-strip img, .logo-marquee img { filter: grayscale(1); opacity: 0.55; transition: opacity var(--duration-normal); }
.logo-strip img:hover, .logo-marquee img:hover { opacity: 1; }
```

- [ ] **Step 4: Neutraliser gradient-text et card-hover**

```css
.gradient-text {
  background: none !important;
  -webkit-text-fill-color: currentColor !important;
  color: var(--color-primary);
}
```

Et simplifier `.card-hover` existant : retirer glow/scale, garder `transform: translateY(-2px)` + bordure `var(--color-line)` → ces cartes héritent du style `card-feature` visuellement.

- [ ] **Step 5: Vérifier + commit**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1/ && git add styles.css && git commit -m "Composants editoriaux : nav, boutons pill, 4 types de cartes, sections"
```

---

### Task 5: Purge des animations

**Files:**
- Modify: `styles.css`, `js/public.js` (minifié), `js/wow-effects.js`, `index.html`

- [ ] **Step 1: styles.css — supprimer les blocs morts**

Supprimer entièrement les règles : `.particle`, `.particles-bg`, keyframes de gradient animé / shine / float (`grep -n "particle\|shine\|gradient-shift\|float" styles.css`). Unifier les durées d'animation restantes : remplacer les `2.5s`/`4s` d'apparition par `0.5s`.

- [ ] **Step 2: public.js — désactiver magnetic/spotlight/particles**

Le fichier est minifié. Localiser :

```bash
grep -o "initMagneticButtons\|initSpotlightCards\|initParticles\|createParticles" js/public.js
```

Pour chaque fonction trouvée : supprimer sa définition complète ET son appel (chercher `initMagneticButtons()` etc. dans la chaîne d'init). Vérifier la syntaxe après chaque suppression :

```bash
node --check js/public.js
```

Expected: aucune erreur.

- [ ] **Step 3: wow-effects.js — retirer SplitText, blobs, parallax**

- Ligne ~430 : supprimer `document.querySelectorAll('[data-split="words"]').forEach(...SplitText...)` et la classe `SplitText` entière.
- Ligne ~486 : supprimer le bloc de création des blobs (`morphBlobAnim`) et son keyframe injecté.
- Supprimer la classe `ParallaxSection` et son init si présente.
- Conserver : `Counter`, `ScrollProgress`, `LogoMarquee`.

```bash
node --check js/wow-effects.js
```

- [ ] **Step 4: index.html — retirer les conteneurs de particles s'ils existent**

```bash
grep -n "particles-bg\|particle" index.html
```

Supprimer les div correspondantes.

- [ ] **Step 5: Vérifier en navigateur (console sans erreur) + commit**

```bash
git add styles.css js/public.js js/wow-effects.js index.html && git commit -m "Purge animations : particles, magnetic, spotlight, splittext, blobs"
```

---

### Task 6: critical.css — synchroniser l'above-the-fold

**Files:**
- Modify: `css/critical.css`

- [ ] **Step 1: Reporter les variables**

Remplacer dans le `:root` de `css/critical.css` les mêmes valeurs qu'en Task 2 (`--color-bg: #FAFAF7`, `--font-sans: 'Inter'...`, ajout `--font-serif`, suppression visuelle du violet/cyan). Mettre à jour les styles nav/hero/preloader qu'il contient (fond crème, bordure lin, h1 serif).

- [ ] **Step 2: Vérifier + commit**

```bash
grep -c "Fraunces\|FAFAF7" css/critical.css
git add css/critical.css && git commit -m "critical.css : palette et typo editoriales above-the-fold"
```

---

### Task 7: Refonte de la home (`index.html`)

**Files:**
- Modify: `index.html` (hero L~524, services L~575, why L~649, avis-google L~686 → suppression, partenaires L~733, FAQ L~891, contact L~992)

Chaque step : éditer, recharger https://jcsm.fr (Ctrl+Shift+R), commit. Conserver TOUS les attributs SEO/a11y existants (aria-label, schema.org, title, alt).

- [ ] **Step 1: Hero**

Remplacer le contenu texte (L528-553), garder le bloc `<picture>` existant (photo réelle) :

```html
<div class="sec-label">Maintenance IRVE · France &amp; Belgique · depuis 2019</div>
<h1 class="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight tracking-tight section-appear">
    L'infrastructure de recharge, entretenue <em>comme elle le mérite</em>.
</h1>
<p class="text-base sm:text-lg leading-relaxed max-w-xl" style="color: var(--color-text-secondary)">
    Maintenance préventive et curative, installation et supervision de bornes AC/DC
    jusqu'à 400 kW. Toutes marques. France entière et Belgique.
</p>
<div class="flex flex-wrap gap-3">
    <a href="/contact" title="Demander un diagnostic gratuit pour votre parc IRVE"
        class="btn-primary px-7 py-3.5 font-bold text-[15px] text-white inline-flex items-center gap-2.5">
        Demander un diagnostic gratuit
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
    </a>
    <a href="#services" title="Voir nos domaines d'expertise IRVE"
        class="btn-secondary px-7 py-3.5 font-bold text-[15px]">
        Nos services
    </a>
</div>
<div class="flex flex-wrap gap-x-8 gap-y-3 pt-5 mt-2" style="border-top: 1px solid var(--color-line)">
    <div><div class="text-xl font-extrabold" style="color: var(--color-primary-dark); font-family: var(--font-sans)">98%</div><div class="text-xs" style="color: var(--color-text-secondary)">disponibilité réseau</div></div>
    <div><div class="text-xl font-extrabold" style="color: var(--color-primary-dark); font-family: var(--font-sans)">24h</div><div class="text-xs" style="color: var(--color-text-secondary)">réponse ouvrée</div></div>
    <div><div class="text-xl font-extrabold" style="color: var(--color-primary-dark); font-family: var(--font-sans)">2&nbsp;500+</div><div class="text-xs" style="color: var(--color-text-secondary)">interventions</div></div>
    <div><div class="text-xl font-extrabold" style="color: var(--color-primary-dark); font-family: var(--font-sans)">400 kW</div><div class="text-xs" style="color: var(--color-text-secondary)">AC &amp; DC, multi-marques</div></div>
</div>
```

Garder le badge Qualifelec existant (L550-553) après ce bloc. Supprimer le badge pulse animé (L528-531).
Commit : `git add index.html && git commit -m "Home : hero editorial serif + stats 24h ouvrees"`

- [ ] **Step 2: Services — 4 cartes hiérarchisées**

Dans la section `#services`, remplacer le h2 par "Quatre métiers, un seul objectif : vos bornes disponibles." et restructurer la grille des cartes existantes en :

```html
<div class="grid md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-4">
    <a href="/exploitation" class="card-lead block">
        <div class="num">01</div>
        <h3 class="text-lg font-bold mt-8 text-white" style="font-family: var(--font-sans)">Maintenance préventive &amp; curative</h3>
        <p class="text-sm mt-2" style="color: rgba(255,255,255,.7)">AC et DC jusqu'à 400 kW, toutes marques. Notre cœur de métier.</p>
    </a>
    <a href="/installation-conformite" class="card-feature block">
        <div class="num">02</div>
        <h3 class="text-base font-bold mt-8" style="font-family: var(--font-sans)">Installation &amp; conformité</h3>
    </a>
    <a href="/centre-appel" class="card-feature block">
        <div class="num">03</div>
        <h3 class="text-base font-bold mt-8" style="font-family: var(--font-sans)">Supervision &amp; hotline</h3>
    </a>
    <a href="/securisation-installations" class="card-feature block">
        <div class="num">04</div>
        <h3 class="text-base font-bold mt-8" style="font-family: var(--font-sans)">Sécurisation des sites</h3>
    </a>
</div>
```

Reprendre les descriptions/links EXISTANTS des cartes actuelles (ne pas perdre le contenu SEO : reporter les `<p>` descriptifs des cartes actuelles dans les `card-feature`). Retirer `bg-gradient-to-b` de la section.
Commit : `git commit -am "Home : services en 4 cartes hierarchisees"`

- [ ] **Step 3: Why-section → section sombre "méthode"**

Transformer la section L~649 en :

```html
<section class="section-dark py-20 px-6" aria-label="Notre méthode">
    <div class="max-w-6xl mx-auto">
        <div class="sec-label">Comment on travaille</div>
        <h2 class="text-3xl sm:text-4xl mt-3 text-white">Diagnostic. Intervention. Compte rendu.</h2>
        <div class="grid sm:grid-cols-3 gap-8 mt-10">
            <div class="step"><strong>Diagnostic sous 48h</strong><p class="text-sm mt-2" style="opacity:.65">Audit technique sur site ou à distance, devis transparent.</p></div>
            <div class="step"><strong>Réponse sous 24h ouvrées</strong><p class="text-sm mt-2" style="opacity:.65">Techniciens certifiés Qualifelec IRVE, pièces multi-marques.</p></div>
            <div class="step"><strong>Rapport détaillé</strong><p class="text-sm mt-2" style="opacity:.65">Photos, mesures, recommandations. Traçabilité complète.</p></div>
        </div>
    </div>
</section>
```

Reporter les contenus utiles de l'ancienne why-section (engagements) dans ces 3 étapes si pertinents.
Commit : `git commit -am "Home : section methode sombre 3 etapes"`

- [ ] **Step 4: Supprimer la section avis Google**

Supprimer le bloc `<section ... id="avis-google">` (L~686 jusqu'à la balise fermante avant la section partenaires L~733). Puis :

```bash
grep -n "4,9\|4.9/5\|avis-google\|avis Google" index.html
```

Expected: zéro occurrence restante (sinon nettoyer : nav, footer, schema).
Commit : `git commit -am "Home : retire la section avis Google"`

- [ ] **Step 5: Partenaires, couverture, FAQ, contact, CTA final**

- Partenaires : vérifier que les logos passent en gris via `.logo-marquee img` (Task 4) ; sobre, pas d'autre changement.
- Couverture : la home actuelle n'a PAS de section couverture → en insérer une entre la section méthode et la FAQ :

```html
<section class="section-alt py-20 px-6" aria-label="Zone d'intervention">
    <div class="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
        <div>
            <div class="sec-label">Où nous intervenons</div>
            <h2 class="text-3xl sm:text-4xl mt-3">France entière, et la Belgique.</h2>
            <p class="text-sm mt-4 max-w-md" style="color: var(--color-text-secondary)">
                Des équipes techniques réparties sur tout le territoire : Île-de-France,
                Hauts-de-France, Auvergne-Rhône-Alpes, PACA, Occitanie, Nouvelle-Aquitaine
                et au-delà. Interventions également en Belgique.
            </p>
            <a href="/couverture" class="btn-secondary inline-block px-6 py-3 text-sm font-semibold mt-6">Voir notre couverture</a>
        </div>
        <div style="background:#fff; border:1px solid var(--color-line); border-radius: var(--radius-xl); padding: 1.5rem;">
            <img src="images/perpignan.webp" alt="Carte des zones d'intervention JCSM en France et Belgique" loading="lazy" class="w-full h-auto" style="border-radius: var(--radius-lg)">
        </div>
    </div>
</section>
```

(Image : utiliser une carte/illustration existante du repo si plus pertinente que `perpignan.webp` — vérifier `ls images/` ; sinon créer un SVG stylisé simple de la France/Belgique en bleu sur crème dans `images/carte-couverture.svg`.)
- FAQ : garder `<details>` ; le restyle vient du CSS hérité.
- Contact : ne PAS toucher `#contactForm` (gotcha `landing.js`) ; restyle = fond `section-alt`.
- Après la section contact, insérer le bandeau CTA :

```html
<section class="py-16 px-6" aria-label="Contactez JCSM">
    <div class="max-w-6xl mx-auto card-cta py-12 px-8">
        <h2 class="text-2xl sm:text-3xl text-white">Une borne en panne ? Un parc à entretenir ?</h2>
        <p class="text-sm mt-2" style="opacity:.85">Réponse sous 24h ouvrées, France entière et Belgique.</p>
        <a href="#contact" class="inline-block bg-white font-bold text-sm px-7 py-3 mt-5" style="color: var(--color-primary-dark); border-radius: var(--radius-full)">Demander un diagnostic gratuit</a>
    </div>
</section>
```

Commit : `git commit -am "Home : partenaires gris, contact restyle, bandeau CTA final"`

- [ ] **Step 6: Contrôle complet de la home**

Desktop + mobile 375px (devtools), vérifier : pas d'erreur console, hero serif, sections cohérentes, formulaire fonctionnel (remplir sans envoyer), `prefers-reduced-motion` (émuler dans devtools).

---

### Task 8: Purge mécanique sur tout le site

**Files:**
- Modify: pages HTML diverses (hors `demo/`), `styles.css` si reliquats

- [ ] **Step 1: Greps de purge, corriger chaque occurrence**

```bash
cd /var/www/jcsm.fr
grep -rn "7C3AED\|06B6D4" --include='*.html' --include='*.css' --include='*.js' . | grep -v '^./demo' | grep -v node_modules
grep -rn "from-purple\|to-purple\|via-purple\|text-purple\|bg-purple" --include='*.html' . | grep -v '^./demo'
grep -rn "4,9/5\|4.9/5" --include='*.html' . | grep -v '^./demo'
grep -rni "7 régions\|sept régions" --include='*.html' . | grep -v '^./demo'
```

Pour chaque résultat : remplacer le violet par `var(--color-primary)` / classes `blue`, supprimer les arguments "4,9/5", remplacer "7 régions" par "France entière et Belgique" (adapter la phrase, y compris dans les langues : "ganz Frankreich und Belgien", "all of France and Belgium", etc.).

- [ ] **Step 2: Rebuild Tailwind + vérifier**

```bash
npm run build:css && grep -c "purple" css/tailwind.css
```

Expected: build OK ; le compte purple peut rester >0 (utilitaires génériques) tant qu'aucune page ne les référence.

- [ ] **Step 3: Commit**

```bash
git add -A ':!demo' && git commit -m "Purge globale : violet, 4,9/5, 7 regions, gradients residuels"
```

---

### Task 9: Révision page par page

**Files:**
- Modify: pages au besoin

Pour chaque lot, charger les pages en navigateur (ou `curl -s URL | grep` pour les checks textuels), corriger ce qui casse (contrastes, sections illisibles sur fond crème, images sur fond blanc → `mix-blend-mode: multiply` déjà en place), harmoniser les hero (label `sec-label` + titre serif s'applique automatiquement via h1/h2).

- [ ] **Step 1: Lot racine** : `index`, `contact`, `a-propos`, `tarification`, `exploitation`, `installation-conformite`, `centre-appel`, `securisation-installations`, `pilotage-projets`, `couverture`, `carrieres`, `devenir-partenaire`, `blog`, `404`, `cgv`, `confidentialite`, `mentions-legales`. Vérifier sur `couverture.html` le message "France entière + Belgique". Commit `"Revision lot racine"`.
- [ ] **Step 2: Lot solutions/** (5 pages) + **zones/** (8 pages). Les zones gardent leur LocalBusiness schema. Commit `"Revision solutions et zones"`.
- [ ] **Step 3: Lot blog** : `blog.html` (hub) + 3 articles échantillons (`blog/maintenance-bornes-recharge-guide.html`, un article 2026, un court). Le template article hérite du CSS ; corriger seulement si cassé. Commit `"Revision blog"`.
- [ ] **Step 4: Lot langues** : `en/index.html`, `de/index.html`, + 1 page intérieure par langue en spot-check (es, it, nl, pl, pt). Commit `"Revision pages langues"`.

---

### Task 10: Blog — 2 articles d'actualité

**Files:**
- Create: `blog/<slug-article-1>.html`, `blog/<slug-article-2>.html`
- Modify: `blog.html`, `sitemap.xml`

- [ ] **Step 1: Recherche d'actualité**

WebSearch : "actualité bornes de recharge IRVE France juin 2026", "AFIR 2026 bornes", "marché véhicule électrique France 2026". Choisir 2 sujets non couverts par les 50 articles existants (`ls blog/`). Proposer les 2 titres à l'utilisateur avant rédaction.

- [ ] **Step 2: Rédiger l'article 1**

Copier la structure d'un article récent (`blog/ce-qui-change-2026-mobilite-electrique.html`) : même head (critical.css, styles.css, fonts Fraunces+Inter post-Task 3, BreadcrumbList + Article schema, og:site_name), même nav/footer. Contenu : ~1000-1400 mots, français, sources citées, maillage interne vers 2-3 articles existants + 1 page service, date 2026-06-09. Aucun emoji.

- [ ] **Step 3: Rédiger l'article 2** (même méthode)

- [ ] **Step 4: Référencement interne**

- Ajouter les 2 cartes en tête de la grille de `blog.html`.
- Ajouter les 2 URLs dans `sitemap.xml` (`<lastmod>2026-06-09</lastmod>`).
- Soumission IndexNow (CLI) : `php api/indexnow.php https://jcsm.fr/blog/<slug-1> https://jcsm.fr/blog/<slug-2>` (vérifier la syntaxe d'appel dans le fichier avant).

- [ ] **Step 5: Commit**

```bash
git add blog/ blog.html sitemap.xml && git commit -m "Blog : 2 articles actualite IRVE juin 2026"
```

---

### Task 11: Versions, cache, CLAUDE.md

**Files:**
- Modify: `sw.js:2-4`, `js/config.js:31`, `CLAUDE.md`

- [ ] **Step 1: Bump des caches**

`sw.js` lignes 1-4 : `v72` → `v73` (les 3 constantes + commentaire). `js/config.js` ligne 31 : `2.53.0` → `2.54.0`.

- [ ] **Step 2: CLAUDE.md à jour**

- Versions réelles : sw v73, config 2.54.0 (corriger l'obsolescence v64/2.45.0).
- Section design : palette éditoriale B1 (crème/encre/bleu), Fraunces+Inter, 4 types de cartes, une section sombre par page, animations réduites (counter/marquee/scroll-progress/fade uniquement).
- Mentionner le spec : `docs/superpowers/specs/2026-06-09-refonte-design-editorial-design.md`.

- [ ] **Step 3: Commit**

```bash
git add sw.js js/config.js CLAUDE.md && git commit -m "Bump sw v73 + config 2.54.0, CLAUDE.md a jour post-refonte"
```

---

### Task 12: Vérification finale

- [ ] **Step 1: Greps finaux (tous doivent être vides hors demo/)**

```bash
cd /var/www/jcsm.fr
grep -rn "Outfit\|7C3AED\|particles-bg\|4,9/5" --include='*.html' --include='*.css' . | grep -v '^./demo' | grep -v node_modules
grep -rni "7 régions" --include='*.html' . | grep -v '^./demo'
```

- [ ] **Step 2: Pages clés en 200**

```bash
for p in "" contact exploitation zones/ile-de-france solutions/cpo-operateurs blog en/ ; do curl -s -o /dev/null -w "%s -> %{http_code}\n" "https://jcsm.fr/$p" ; done
```

Expected: tous `200`.

- [ ] **Step 3: Lighthouse home (si disponible)**

```bash
npx -y lighthouse https://jcsm.fr --only-categories=performance,accessibility --quiet --chrome-flags="--headless --no-sandbox" --output=json 2>/dev/null | grep -o '"score":[0-9.]*' | head -2
```

Si Chrome absent sur le serveur : demander à l'utilisateur un test PageSpeed Insights. Pas de régression vs avant-refonte.

- [ ] **Step 4: Validation utilisateur**

Demander à l'utilisateur de naviguer le site (desktop + mobile) et valider. Push `git push origin master` UNIQUEMENT après son accord explicite.
