# A-DECIDER : jcsm.fr (chantier « sites 10 sur 10 », 04/10/2026)

Rien n'est publié ni déployé. Pour chaque point : options, puis recommandation.

## 1. Quelle promesse de délai et de disponibilité est vraie ? (revue, écarts 5 et 6)
Constat (détail fichier:ligne dans `propositions-legales/terminologie-7-langues-et-promesses.md`, section 3) : la vitrine promet « Diagnostic sous 48h » et « Réponse sous 24h ouvrées » (accueil, exploitation, contact, 7 langues), « Hotline 7j/7 » dans une carte et « 24/7 » ailleurs, « SLA garanti » ; la FAQ dit « Les délais sont définis dans votre contrat » ; les CGV art. 6 disent « à titre indicatif » puis « JCSM s'engage à respecter ». Le fichier CLAUDE.md du dépôt impose « réponse sous 24h ouvrées », ce qui est une règle de rédaction, pas une preuve que le délai est tenu.
- Option A, contractuelle sans chiffre : « Délai défini au contrat ; diagnostic à distance avant tout déplacement ». Le plus sûr juridiquement, le moins vendeur.
- Option B, objectif indicatif chiffré : « Première réponse visée sous 24 h ouvrées, à titre indicatif ; le délai d'intervention sur site est fixé au contrat ». Hotline : choisir 7j/7 **ou** 24/7 et le dire partout.
- Option C, par le processus : « Un technicien qualifie votre demande, réalise un diagnostic à distance, puis planifie selon la criticité ».
Recommandation : B si la première réponse sous 24 h ouvrées est mesurée et tenue (donnée à sortir de la console), sinon A. Dans les deux cas, retirer « 48h » (14 occurrences en français), aligner les CGV art. 6 (supprimer la contradiction « indicatif » et « s'engage ») et corriger les 7 langues et les données structurées (FAQ JSON-LD) en même temps : un remplacement sur 8 langues et ~370 occurrences ne doit pas être fait à la main. Je n'ai pas appliqué ce lot : la formulation vraie dépend de ce que JCSM tient réellement.

## 2. Directeur de la publication
Mentions : « le représentant légal de JCSM SAS », sans nom ; vorena.fr et wattena.fr nomment M. Julien Merlet. Option A : nommer (texte repris de Vorena) ; option B : laisser. Recommandation : A, avec confirmation d'Auxence (obligation d'identification de l'éditeur, LCEN).

## 3. security.txt : contact et expiration
Le fichier existe déjà (`/.well-known/security.txt` et `/security.txt`, `Contact: mailto:contact@jcsm.fr`, `Expires: 2027-03-22`), il répond 200 en production. Je n'ai rien changé. À confirmer : l'adresse (une boîte dédiée serait préférable à contact@) et ajouter un rappel de renouvellement avant mars 2027.

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
