# Refonte design jcsm.fr : direction "Clarté éditoriale" (B1)

Date : 2026-06-09
Statut : validé par maquettes interactives (brainstorm visuel, sélections B → B1 → maquette home approuvée)

## Objectif

Refonte visuelle complète du site public jcsm.fr. Direction retenue : **clarté éditoriale, palette crème + bleu JCSM** (option B1 des maquettes). Esprit "cabinet d'expertise" : sobre, typographique, premium, zéro effet gadget. Le design system global se propage aux ~244 pages ; la home reçoit en plus un travail éditorial section par section.

Hors périmètre : portail interne (`interne.html`), API PHP, contenu SEO (titres, schema, maillage conservés), performances et accessibilité (déjà solides, on ne régresse pas).

## Décisions validées par l'utilisateur

1. **Direction** : B "Clarté éditoriale" (vs A sombre industriel, C bleu actuel raffiné).
2. **Palette** : B1 crème + bleu JCSM (vs B2 blanc/navy, B3 bleu glacier).
3. **Structure home** : maquette 8 sections approuvée avec 3 corrections :
   - Couverture : **France entière + Belgique** (plus de "7 régions").
   - Engagement : **réponse sous 24h ouvrées** (pas "4h" ni autre promesse).
   - **Pas de section avis Google** (trop peu d'avis), ni stat "4,9/5" dans le hero.
4. **Méthode** : travail en direct sur les fichiers live, commits fréquents, rollback git.
5. Baseline commitée avant refonte : `005fbd4`.

## Design system

### Palette (variables CSS dans `:root` de `styles.css` + `css/critical.css`)

| Rôle | Valeur | Usage |
|------|--------|-------|
| Fond principal | `#FAFAF7` (crème) | Body, sections claires |
| Fond alterné | `#F3F2EC` | Sections de respiration |
| Encre | `#0F1B2D` | Texte principal, sections sombres (méthode, footer) |
| Bleu JCSM | `#2563EB` | Accents, CTA, labels, chiffres (inchangé : continuité de marque) |
| Bleu foncé | `#1D4ED8` | Hover, logo, chiffres sur crème |
| Bleu pâle | `#DBEAFE` | Badges, fonds d'illustration |
| Gris texte | `#5B6472` | Texte secondaire |
| Ligne | `#E3E2DB` (lin) | Bordures, séparateurs |

**Supprimé** : violet `#7C3AED` (secondary), cyan `#06B6D4` (accent), tous les gradients bleu→violet et les glows. Le cyan peut survivre uniquement dans le portail interne (hors périmètre).

### Typographie

- **Titres (h1-h3, citations, chiffres éditoriaux)** : Fraunces (Google Fonts, axes opsz/wght, italique pour les accents dans les titres). Poids 400/600.
- **Corps, UI, nav, boutons** : Inter 400/500/600/700/800.
- **Outfit est retirée** du site public. JetBrains Mono retirée du public (reste disponible pour interne).
- Chargement : `<link>` Google Fonts avec `display=swap`, preconnect. CSP autorise déjà fonts.googleapis.com/gstatic.
- Échelle fluide conservée (clamp), h1 home ~ `clamp(2.2rem, 5vw, 3.5rem)`.

### Composants

- **Nav** : fond crème translucide (`rgba(250,250,247,.9)` + blur léger), bordure basse lin. Un seul CTA pill bleu "Diagnostic gratuit". Plus de glassmorphism saturé.
- **Boutons** : pill (radius 99px). Primaire bleu plein, secondaire contour encre. Hover : assombrissement simple + translation 1px, pas d'effet magnétique.
- **Cartes** : 4 types distincts au lieu d'un `.card-hover` unique :
  - `card-lead` : fond encre, texte blanc, numéro Fraunces (service phare)
  - `card-feature` : fond blanc, bordure lin, numéro Fraunces bleu
  - `card-quote` : bordure gauche bleue 3px, citation Fraunces italique
  - `card-cta` : fond bleu plein, texte blanc, centré
- **Numérotation éditoriale** : 01/02/03 en Fraunces pour services et étapes.
- **Section sombre** : fond `#0F1B2D`, labels `#7FA6E8`, séparateurs `border-top: 2px solid #2563EB`. Une seule par page.
- **Footer** : fond encre, texte gris bleuté, logo blanc.
- **Logos clients/partenaires** : `filter: grayscale(1)`, opacité ~.55, défilement lent conservé (marquee existant, vitesse calme).

### Animations : ce qu'on garde / supprime

| Garde (calmé) | Supprime |
|---|---|
| Fade-in-up au scroll (durée unifiée 500ms) | Particles (hero) |
| Compteurs stats (800ms, aria-label conservés) | Gradients animés 4s, effet shine |
| Logo marquee (pause hover) | Boutons magnétiques, spotlight cards |
| Scroll progress (discret, bleu) | TextSplit, parallax, float icons |
| | Glassmorphism (nav, badges) |

`prefers-reduced-motion` : comportement existant conservé. Les suppressions se font dans `styles.css` + désactivation des inits correspondantes dans `public.js` / `wow-effects.js` (supprimer le code mort, pas le commenter).

## Home (`index.html`) : structure validée

1. **Nav** épurée (voir composants).
2. **Hero** : label "Maintenance IRVE · France & Belgique", titre Fraunces "L'infrastructure de recharge, entretenue *comme elle le mérite*.", sous-titre (maintenance préventive/curative, installation, supervision AC/DC, multi-marques), CTA primaire "Demander un diagnostic" + secondaire "Voir nos services". Photo réelle d'intervention JCSM (images existantes du repo, recadrée, pas de stock générique). Bande de stats : **98% disponibilité réseau · réponse sous 24h ouvrées · 2 500+ interventions · multi-marques AC/DC**.
3. **Logos clients** : bande grise sobre (Powerdot, Virta, Freshmile, Bump, Eko, Anyos...).
4. **Services** : titre "Quatre métiers, un seul objectif : vos bornes disponibles." Grille 1.4fr+1fr+1fr+1fr : maintenance en `card-lead` (01), installation/conformité (02), supervision/hotline (03), sécurisation (04) en `card-feature`. Liens vers pages services existantes.
5. **Méthode** (section sombre) : "Diagnostic. Intervention. Compte rendu." 3 étapes : diagnostic sous 48h, intervention planifiée avec techniciens certifiés Qualifelec IRVE, rapport détaillé avec photos.
6. **Couverture** (fond `#F3F2EC`) : "France entière, et la Belgique." Illustration SVG statique (carte stylisée bleu sur crème, pas de Leaflet sur la home), liens vers `couverture.html` et les pages zones.
7. **FAQ** : 4-5 questions, `<details>` accessible conservé, style éditorial.
8. **Contact + CTA final** : le formulaire Formspree reste une section dédiée (gotcha `#contactForm` / `landing.js` inchangé, champs identiques), restylée en éditorial. Juste en dessous, bandeau `card-cta` pleine largeur : "Une borne en panne ? Un parc à entretenir ?" + "Réponse sous 24h ouvrées." + bouton blanc ancré vers le formulaire.
9. **Footer** encre.

La section avis Google existante est **supprimée** de la home (et le texte "4,9/5" partout où il sert d'argument, à vérifier par grep).

## Propagation aux autres pages

- Les pages racine, `zones/`, `solutions/`, `blog/` et langues héritent automatiquement via `styles.css` (variables, nav, boutons, cartes, footer).
- Passage par grep sur l'ensemble des pages : purger les classes/styles violets, gradients inline, et remplacer la police Outfit dans les `<link>` fonts de chaque page par Fraunces+Inter (opération mécanique sur ~244 fichiers, scriptable avec sed pour les patterns identiques).
- Les hero des pages secondaires gardent leur structure HTML ; seuls les styles hérités changent. Retouches manuelles uniquement si une page casse visuellement.

## Mécanique de livraison

- Tailwind : vérifier `tailwind.config.js` (fontFamily à mettre à jour), `npm run build:css` après chaque lot.
- `css/critical.css` : mettre à jour les variables et styles above-the-fold (nav, hero) en cohérence.
- Bump `sw.js` v64 → v65 et `js/config.js` 2.45.0 → 2.46.0 en fin de refonte.
- Commits fréquents par lot cohérent (design system → home → propagation → nettoyage), site live en permanence.

## Vérification

- Contrôle visuel navigateur (desktop + mobile 375px) sur : home, un service, une zone, un article blog, une page langue, contact.
- Contraste AA : crème/encre et bleu/blanc à vérifier (le `#2563EB` sur `#FAFAF7` passe AA en gras/grands textes ; texte courant toujours en encre ou gris `#5B6472` ≥ 4.5:1).
- `prefers-reduced-motion` : vérifier que les animations restantes se coupent.
- Grep final : aucune occurrence de `#7C3AED`, "Outfit", particles, "4,9/5", "7 régions" sur le site public.
- Lighthouse rapide avant/après sur la home (pas de régression perf).

## Extensions validées (ajout utilisateur au moment du "go")

1. **Révision complète du site** : au-delà de l'héritage CSS automatique, passage en revue page par page (racine, `solutions/`, `zones/`, `blog.html`, pages langues principales) pour harmoniser au nouveau design et corriger les contenus incohérents avec les engagements validés (réponse 24h ouvrées, France entière + Belgique, pas d'argument "avis Google").
2. **Blog : continuer avec l'actualité** : rédaction de nouveaux articles d'actualité IRVE (recherche web sur l'actu mobilité électrique 2026, sujets à valider en cours de route), dans le nouveau design, avec le même schéma SEO que les articles existants (BreadcrumbList, maillage interne, sitemap).

## Risques et rollback

- Site en production : chaque lot est commité ; rollback = `git revert` ou checkout du fichier depuis `005fbd4`.
- Purge Tailwind : si une classe disparaît, vérifier le glob `content` de `tailwind.config.js`.
- Cache : les visiteurs peuvent voir un état mixte pendant la transition (CSS 1 semaine de cache) ; le bump sw.js + nom de fichier CSS inchangé signifie qu'un hard-refresh peut être nécessaire ; acceptable, validé par le choix "en direct avec commits fréquents".
