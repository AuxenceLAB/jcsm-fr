# Plan d'internationalisation JCSM — 8 pages × 7 langues

## Scope

**Pages** : index, pilotage-projets, installation-conformite, exploitation, securisation-installations, centre-appel, a-propos, contact
**Langues** : EN, ES, DE, PT, NL, PL, IT (+ FR existant)
**Total** : 56 nouvelles pages HTML

## Slugs traduits par langue

| FR (existant) | EN | ES | DE | PT | NL | PL | IT |
|---|---|---|---|---|---|---|---|
| `/` | `/en/` | `/es/` | `/de/` | `/pt/` | `/nl/` | `/pl/` | `/it/` |
| `/pilotage-projets` | `/en/project-management` | `/es/gestion-proyectos` | `/de/projektmanagement` | `/pt/gestao-projetos` | `/nl/projectbeheer` | `/pl/zarzadzanie-projektami` | `/it/gestione-progetti` |
| `/installation-conformite` | `/en/installation-compliance` | `/es/instalacion-conformidad` | `/de/installation-konformitaet` | `/pt/instalacao-conformidade` | `/nl/installatie-conformiteit` | `/pl/instalacja-zgodnosc` | `/it/installazione-conformita` |
| `/exploitation` | `/en/operations-maintenance` | `/es/operacion-mantenimiento` | `/de/betrieb-wartung` | `/pt/operacao-manutencao` | `/nl/exploitatie-onderhoud` | `/pl/eksploatacja-konserwacja` | `/it/gestione-manutenzione` |
| `/securisation-installations` | `/en/installation-security` | `/es/seguridad-instalaciones` | `/de/anlagensicherung` | `/pt/seguranca-instalacoes` | `/nl/beveiliging-installaties` | `/pl/zabezpieczenie-instalacji` | `/it/sicurezza-installazioni` |
| `/centre-appel` | `/en/call-center` | `/es/centro-llamadas` | `/de/callcenter` | `/pt/central-atendimento` | `/nl/callcenter` | `/pl/centrum-telefoniczne` | `/it/centro-chiamate` |
| `/a-propos` | `/en/about` | `/es/nosotros` | `/de/ueber-uns` | `/pt/sobre-nos` | `/nl/over-ons` | `/pl/o-nas` | `/it/chi-siamo` |
| `/contact` | `/en/contact` | `/es/contacto` | `/de/kontakt` | `/pt/contato` | `/nl/contact` | `/pl/kontakt` | `/it/contatti` |

## Architecture

### Structure de fichiers
```
/var/www/jcsm.fr/
├── en/
│   ├── index.html
│   ├── project-management.html
│   ├── installation-compliance.html
│   ├── operations-maintenance.html
│   ├── installation-security.html
│   ├── call-center.html
│   ├── about.html
│   └── contact.html
├── es/  (même structure avec slugs espagnols)
├── de/  (même structure avec slugs allemands)
├── pt/  (même structure avec slugs portugais)
├── nl/  (même structure avec slugs néerlandais)
├── pl/  (même structure avec slugs polonais)
├── it/  (même structure avec slugs italiens)
├── js/
│   └── i18n.js          ← NOUVEAU : dictionnaire JS partagé
└── (pages FR existantes inchangées)
```

### Composants partagés

**`js/i18n.js`** — Dictionnaire pour les strings JS (cookie banner, validation form, toasts, aria-labels). Détecte la langue depuis `<html lang="">`. Utilisé par public.js et landing.js.

**Sélecteur de langue** — Dropdown dans la nav avec code langue + drapeau emoji. Redirige vers la page équivalente dans la langue choisie via un mapping slug.

**Balises hreflang** — Ajoutées dans le `<head>` de TOUTES les pages (FR existantes + 56 nouvelles) pour le SEO multilingue.

## Étapes d'implémentation

### Phase 1 : Infrastructure (avant les pages)
1. Créer `js/i18n.js` avec dictionnaire 8 langues (nav, footer, cookie, validation, toasts)
2. Modifier `js/public.js` : charger i18n.js, remplacer strings hardcodées par `window.I18N[lang].key`
3. Modifier `js/landing.js` : idem pour les messages de validation
4. Créer les 7 répertoires (`en/`, `es/`, `de/`, `pt/`, `nl/`, `pl/`, `it/`)

### Phase 2 : Pages traduites (par langue, 8 pages chacune)
Pour chaque langue, créer les 8 pages HTML avec :
- `<html lang="xx">` correct
- Tout le contenu textuel traduit (titres, paragraphes, CTA, alt texts)
- Meta tags traduits (`<title>`, description, OG, Twitter)
- JSON-LD schema traduit (Service name/description, FAQ, BreadcrumbList)
- `og:locale` correct (en_US, es_ES, de_DE, pt_PT, nl_NL, pl_PL, it_IT)
- Liens internes pointant vers les slugs traduits de la même langue
- Balises hreflang dans le `<head>` (8 langues × 8 pages)
- Nav avec dropdown sélecteur de langue
- Footer traduit
- Paths assets : `../images/`, `../css/`, `../js/` (sous-répertoire)

Ordre : EN → ES → DE → PT → NL → PL → IT

### Phase 3 : SEO & nginx
1. Ajouter hreflang aux 8 pages FR existantes
2. Mettre à jour `sitemap.xml` (ajouter les 56 URLs avec hreflang)
3. Configurer nginx : `location /xx/ { try_files $uri $uri.html $uri/ =404; }` pour chaque langue
4. Inclure les security headers dans les nouveaux location blocks

### Phase 4 : Finalisation
1. Bumper sw.js cache version + config.js version
2. Bumper le `?v=` cache-bust sur les pages FR (ajout i18n.js)
3. Rebuild Tailwind si nouvelles classes ajoutées
4. Test : vérifier chaque page dans chaque langue

## Ce qui ne change PAS
- Pages FR existantes : contenu inchangé (seules les hreflang et le sélecteur langue s'ajoutent)
- `interne.html` : pas traduit (portail interne)
- Blog : pas traduit (phase ultérieure)
- Zones régionales : pas traduites (SEO local FR uniquement)
- Numéro de téléphone, adresse, email : identiques dans toutes les langues
- Noms de marque (JCSM, EVBox, Qualifelec, etc.) : non traduits
- Termes techniques (IRVE, CPO, EMSP, HTA/BT) : conservés avec explication si nécessaire
