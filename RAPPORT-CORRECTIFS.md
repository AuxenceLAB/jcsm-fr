# RAPPORT-CORRECTIFS : jcsm.fr (chantier « sites 10 sur 10 », 04/10/2026)

Source : `git clone ssh://auxence@37.187.128.186/var/www/jcsm.fr` (lecture seule ; arbre propre sur le RISE-S, commit `0a145b8`). La copie du VPS est en retard de 2 commits : voir A-DECIDER.md point 6. Branche de travail `perf/sites-10sur10-20261004`. Rien publié, aucun push, aucune écriture serveur.

## Corrigé, commit par commit
1. `SEO : titres (50-60 car.) et descriptions (70-150 car.)...` (73e82e5) : 81 pages sur 145 étaient hors cible (mesure : titre décodé 50-60, description 70-150). Elles sont toutes dans la cible : 50 pages françaises, 31 pages des 7 autres langues. Titre, `og:title`, `twitter:title` et descriptions associées modifiés, rien d'autre. Aucune promesse (24h, 24/7, Qualifelec, SLA) n'a été touchée. Accents corrigés au passage (« à Marseille », « até », « Bezpłatna »). `HV/LV` retiré des titres et descriptions anglais et allemands ; il reste dans le corps des pages (voir terminologie). Un mot a disparu : « partout en France » devient « en France » dans la description de `carrieres.html`.
2. `sitemap : lastmod recalcule` (26658a1) : `node scripts/sitemap-lastmod.cjs --write` (script existant du dépôt). Avant la correction, le script renvoyait déjà `changed: 0` : les 145 lastmod du 22 et 23/09 sont donc **réels** (le 23/09 a vraiment modifié le contenu de toutes les pages), pas un artefact de régénération, contrairement à ce que la mesure supposait. Après les nouveaux titres, 70 pages passent au 2026-10-04.
3. `Legal : cookies d'audience...` (0a7aace) : mentions légales FR/EN et politique FR/EN corrigées, code APE/NAF 4321A. Détail et ce qui reste : `propositions-legales/LISEZ-MOI.md`.
4. `dossier propositions-legales` (6bf3131) : terminologie dans les 7 langues, promesses de délai (comptes et fichier:ligne), journaux de métas.

## Délai unique « 48 h » et disponibilité 24/7 (décision d'Auxence du 04/10)
Source : `propositions-legales/terminologie-7-langues-et-promesses.md` (section 3). Appliqué en FR (racine, zones/, solutions/, blog/, `llms.txt`, `llms-full.txt`, `CLAUDE.md`) et en EN (`en/*.html`) : 60 fichiers.
- « Réponse/intervention sous 24h ouvrées » devient « sous 48 h » ; avec « selon contrat » (EN « as per contract ») pour les engagements de service (SLA, technicien sur site, borne de courtoisie, GTR, tuiles de chiffres, CGV art. 6, FAQ, zones). Pour les réponses avant contrat (formulaire, devis, rappel, presse, candidatures) : « sous 48 h » seul, la nuance contractuelle n'aurait pas de sens (écart assumé avec « partout », voir A-DECIDER 1). Espace insécable entre 48 et h pour éviter la coupure en fin de ligne.
- Tuiles de chiffres : « 24h » ou « <24 h » passés à « 48 h » (13 pages de zone, exploitation, à propos, EN idem) avec libellé « selon contrat ».
- « 7j/7 » (FR) et « 7 days a week » (EN) remplacés par « 24/7 » : retenu parce que les CGV (art. 6, support client 24/7) permettent de le tenir. Technicien « disponibles 7j/7 » (powerdot, virta) retiré (non établi). « Astreinte technique 7j/7 » devenue « 24/7, selon contrat ». « Remplacement par borne de courtoisie sous 24h » (FR) et « within 24 hours » (EN) passés à 48 h selon contrat.
- « SLA standard garantit » devenu « prévoit » (couverture FR et EN), aligné sur la FAQ.
- Test `scripts/delais-promesses.test.cjs` (4 tests, branché dans `scripts/check.sh`), écrit avant les corrections : rouge sur l'état précédent (3 tests sur 4 en échec, le 2e vide faute de formule), vert après (4 sur 4) ; mutation vérifiée (retirer un « selon contrat » ou remettre « 24h ouvrées » le fait échouer).
- 6 autres langues : `propositions-legales/delais-5-langues.md` (liste fichier:ligne et formules), non appliquées.
- Titres et descriptions : inchangés en longueur sauf `contact.html` (titres og/twitter « sous 48 h », même longueur +1) ; contrôle : aucune page nouvelle hors cible 50-60 / 70-150 (seules 9 déjà hors cible avant, dont `en/terms.html`). JSON-LD des fichiers modifiés : tous valides (json.loads).

## Déjà conforme, non modifié
- `security.txt` : présent (`/.well-known/` et racine), Expires 2027-03-22, répond 200.
- CSP : déjà sans `unsafe-inline` dans `script-src` sur les pages listées (hashes) ; restent les hôtes tiers larges et `style-src 'unsafe-inline'` (A-DECIDER 4).

## Testé (commandes réelles)
- `node --test scripts/{coverage-points,partner-logos,brand-palette,analytics-consent,mobile-menu,security-images,public-images,proof-claims,diacritics,public-layout}.test.cjs` après `npm ci` : tous verts (2, 1, 4, 13, 10, 8, 155, 1, 2 et 18 tests, avant la décision du 04/10). Relancées après la décision du 04/10 : mêmes dix suites toujours vertes (mêmes nombres de tests), plus `scripts/delais-promesses.test.cjs` 4 sur 4.
- `python3 meta.py` (script local de mesure) : 145 pages indexables, 0 hors cible après correction.
- `node scripts/sitemap-lastmod.cjs` : `changed: 0` après réécriture (idempotent).
- Non lancé : `bash scripts/check.sh` en entier (demande `php`, non vérifié ici).

## Non vérifié (décision 04/10)
- Rendu : captures relues pour zones/bretagne et exploitation seulement (tuile « 48 h », libellé, liste) ; a-propos, accueil, EN et autres pages de zone non relus à l'œil. Le texte plus long du libellé de tuile passe sur deux lignes (bretagne).
- Les 6 autres langues restent à « 24h ouvrées » : tant que `delais-5-langues.md` n'est pas appliqué, le site est incohérent entre langues.

## Non vérifié
- Rendu visuel des pages modifiées (seules des balises `<head>` et deux blocs de texte légal ont changé) : pas de navigateur lancé sur jcsm.fr.
- Contenu du conteneur Google Tag Manager (A-DECIDER 8).
- Qualité linguistique des titres et descriptions dans les 7 langues : écrits par un assistant, sans relecture par un locuteur natif.
- Mesure SEO réelle (Search Console) : aucun accès.

## Reporté dans A-DECIDER.md
Promesses de délai, directeur de publication, contact security.txt, hôtes de la CSP, pages légales dans 6 langues, déploiement depuis le RISE-S, correction du corps des pages en 7 langues, GTM.

## Récupérer la branche
`git clone /home/auxence/chantiers-20261004/sites-10sur10/copies/jcsm.fr /chemin/local && cd /chemin/local && git checkout perf/sites-10sur10-20261004`
Depuis un clone existant : `git fetch /home/auxence/chantiers-20261004/sites-10sur10/copies/jcsm.fr perf/sites-10sur10-20261004:perf/sites-10sur10-20261004`.
Le site étant « éditer = live » sur le RISE-S, ne rien y merger sans accord d'Auxence.
