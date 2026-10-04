# Pages légales de jcsm.fr : contradictions corrigées et propositions

> BROUILLONS NON PUBLIÉS. Les textes ci-dessous et les modifications de la branche `perf/sites-10sur10-20261004` sont des propositions faites par un assistant, à valider par Auxence et idéalement par un juriste avant tout déploiement. Pas un avis juridique.

## Appliqué sur la branche (à relire, non déployé)

| Contradiction relevée par la revue | Correction | Fichiers |
|---|---|---|
| Mentions : « Ce site n'utilise pas de cookies de suivi » alors que le bandeau et la confidentialité parlent de Google Tag Manager et d'audience | Paragraphe « Cookies » réécrit : aucune mesure d'audience sans accord ; GTM, ses balises et l'outil interne ne s'activent qu'après acceptation, jamais après refus ; renvoi à l'article 10 de la politique | `mentions-legales.html`, `en/legal-notice.html` |
| Politique : « Google Analytics, avec anonymisation IP activée » (notion qui n'existe plus telle quelle dans GA4) | Remplacé par « Google Tag Manager et mesure d'audience, uniquement après votre accord » | `confidentialite.html` |
| Politique : l'outil interne de mesure (envoi vers le serveur du groupe) n'était pas décrit | Ajout au paragraphe cookies/audience : données enregistrées (page, origine, taille d'écran, navigateur, clics, défilement, identifiant de session de l'onglet), suppression à 180 jours (vérifié dans `jcsm-cloud`, `runDbPurge`, et `analytics_events` ne contient pas d'adresse IP) | `confidentialite.html`, `en/privacy.html` |
| Code « APRM : 43.21A-B » | « Code APE/NAF : 4321A » (valeur publiée sur vorena.fr, wattena.fr, chargeteam.pro) | `mentions-legales.html`, `en/legal-notice.html` |

## Non appliqué : à décider (voir A-DECIDER.md)

- Directeur de la publication : « le représentant légal de JCSM SAS » sans nom. Proposition : « M. Julien Merlet, représentant légal de JCSM SAS », comme sur vorena.fr et wattena.fr. À confirmer par Auxence avant de l'écrire.
- Délais (« 48h », « 24h ouvrées »), disponibilité (« 7j/7 », « 24/7 »), « certifié Qualifelec » : voir `terminologie-7-langues-et-promesses.md`, section 3 (comptes, fichier:ligne, trois formulations).
- Pages légales dans les autres langues : mentions légales et confidentialité n'existent qu'en français et en anglais ; les 6 autres langues renvoient à la version anglaise. Création des versions traduites : à décider (juriste pour la relecture).
- Mention « Dernière mise à jour : Mars 2026 » sur les pages modifiées : à remplacer par la date de publication des nouveaux textes.

## À vérifier avant publication

- Contenu réel du conteneur Google Tag Manager (GTM-KKMQQVCF) : le texte dit « Google Tag Manager et les balises qu'il charge ». Si le conteneur charge Google Analytics 4, la politique doit le nommer ; s'il charge aussi des balises publicitaires, la page cookies doit les nommer. Non vérifiable sans accès à GTM.
- Le texte « données d'audience supprimées au bout de 180 jours » repose sur le code de la console (`src/lib/cron/cleanup.ts`) appelé par la route de maintenance ; il faut confirmer que la tâche est bien planifiée en production.

## Autres fichiers

- `terminologie-7-langues-et-promesses.md` : inventaire des termes (HTA/BT faux dans 6 langues sur 7), désynchronisations FR/langues, promesses de délai, avec fichier:ligne.
- `journal-metas-fr.tsv`, `journal-metas-langues.tsv` : ancien et nouveau texte des 81 titres et descriptions modifiés.
