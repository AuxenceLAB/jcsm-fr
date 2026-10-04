# A-DECIDER : jcsm.fr (chantier « sites 10 sur 10 », 04/10/2026)

Rien n'est publié ni déployé. Pour chaque point : options, puis recommandation.

## 1. Promesses de délai : RÉSOLU le 04/10 (décision d'Auxence), reste à trancher ci-dessous
Appliqué en FR et EN : délai unique « sous 48 h », avec « selon contrat » (EN « as per contract ») pour les engagements de service, « 24/7 » seul (CGV art. 6 : support client 24/7), « 7j/7 » supprimé, « SLA standard garantit » devenu « prévoit ». Détail dans RAPPORT-CORRECTIFS.md. Restent à décider :
- **CGV art. 6** : la phrase d'introduction (« donnés à titre indicatif » puis « JCSM s'engage à respecter ») est inchangée, seule la ligne d'urgence est passée à « réponse sous 48 h selon contrat ». C'est un texte contractuel : à faire relire par un juriste avant publication.
- **Réponses avant contrat** (formulaires, devis, rappel, presse, candidatures) : « sous 48 h » sans « selon contrat », qui n'aurait pas de sens avant la signature. Dites-le si vous voulez la nuance partout.
- **Autres délais gardés** : rapport d'intervention « sous 24 h », déploiement de la hotline « en 48 h » (déjà 48 h), tableaux de niveaux de SLA génériques des articles de blog (4 h, 8 h, 24 h : niveaux du marché, pas des promesses de JCSM).
- **« SLA garanti »** (une quinzaine d'occurrences) et « Délais d'intervention garantis » (blog) : non touchés, hors décision ; à aligner sur « SLA défini au contrat » si vous voulez effacer le dernier écart avec l'article 6.
- **Astreinte 24/7** : conservée uniquement avec « selon contrat » (couverture : contrats premium).
- **Technicien « disponibles 7j/7 »** (pages powerdot et virta) : retiré, non établi par les CGV.
- **Six autres langues** : propositions dans `propositions-legales/delais-5-langues.md` (de, es, it, nl, pl, pt ; six et non cinq), non appliquées, traductions à faire relire.

## 2. Directeur de la publication
Mentions : « le représentant légal de JCSM SAS », sans nom ; vorena.fr et wattena.fr nomment M. Julien Merlet. Option A : nommer (texte repris de Vorena) ; option B : laisser. Recommandation : A, avec confirmation d'Auxence (obligation d'identification de l'éditeur, LCEN).

## 3. security.txt : contact et expiration
Le fichier existe déjà (`/.well-known/security.txt` et `/security.txt`, `Contact: mailto:contact@jcsm.fr`, `Expires: 2027-03-22`), il répond 200 en production. Je n'ai rien changé (la décision du 04/10 sur contact@chargeteam.pro et 2027-04-04 vise les sites ChargeTeam, Vorena, Chargelia, Wattena, portail et vitrine, pas jcsm.fr). À confirmer : l'adresse (une boîte dédiée serait préférable à contact@) et ajouter un rappel de renouvellement avant mars 2027.

## 4. CSP : hôtes tiers dans `script-src`
Constat : la CSP de production autorise `unpkg.com`, `cdn.jsdelivr.net` et `sdk.twilio.com` en script, plus GTM et Google Analytics. Dans les pages publiques, `unpkg.com` n'est utilisé que par `evergreen.html` (maquette partenaire noindex, interdite dans robots.txt), `cdn.jsdelivr.net` et `sdk.twilio.com` par aucune page du dépôt. Le générateur de map (`/usr/local/sbin/refresh-static-csp.py`, hors dépôt) a aussi une valeur par défaut `'unsafe-inline'` pour toute URL non listée.
- Option A : retirer `unpkg.com`, `cdn.jsdelivr.net`, `sdk.twilio.com` de la valeur générée pour les pages publiques ; garder `unpkg.com` pour `evergreen.html` seulement (ou retirer cette page).
- Option B : rien changer.
Recommandation : A, mais le générateur n'est pas dans le dépôt : je ne l'ai ni lu ni modifié. Je n'ai donc pas préparé de patch. Vérifier aussi que `interne.html` (portail) n'a pas besoin de Twilio avant de retirer l'hôte.

## 5. Pages légales dans les 6 autres langues
Mentions et confidentialité n'existent qu'en français et anglais. Option A : traduire (7 langues, relecture juridique) ; option B : garder FR/EN avec lien visible. Recommandation : B tant que le site n'a pas de clientèle hors France/Belgique/anglophone ; à reprendre si une campagne vise NL, DE, ES, IT, PL, PT.

## 6. Écart entre le VPS et le RISE-S
`/var/www/jcsm.fr` sur le VPS est resté au commit `59025b4` ; celui du RISE-S est à `0a145b8` (2 commits d'avance, icônes). Mon travail part de **RISE-S** (production). Ne pas déployer depuis le VPS. À fusionner proprement : les 5 commits de cette branche sont posés sur `0a145b8`.

## 7. Terminologie des 7 langues
`propositions-legales/terminologie-7-langues-et-promesses.md` : 277 occurrences de HTA/BT traduites, 86 fausses (« haute tension » en anglais 30, allemand 27, néerlandais 17, espagnol 6, italien 4, portugais 2 ; polonais correct), 108 ambiguës. J'ai corrigé seulement les titres et descriptions des pages que je touchais. Le corps des pages (HV/LV, « HV-certified technicians ») reste à corriger : option A, remplacement guidé par le tableau du fichier avec relecture par un locuteur ; option B, régénération des 7 versions depuis le français actuel (corrige aussi « du premier coup » et « résolu dès la première visite », plus forts que le français). Recommandation : B, car la désynchronisation est plus grave que la terminologie.

## 8. Contenu du conteneur GTM
Voir `propositions-legales/LISEZ-MOI.md` : les textes disent « Google Tag Manager et les balises qu'il charge », faute d'avoir pu lire le conteneur. À préciser dès que le contenu est connu.
