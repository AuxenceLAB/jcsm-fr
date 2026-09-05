# Carte et identité JCSM · 5 septembre 2026

## Changements

- Logo vectoriel : monogramme J blanc, fond graphite et accent cuivre. Déclinaisons PNG 180, 192 et 512 px, favicon et manifeste. Les anciens fichiers sont conservés.
- Carte d'accueil Leaflet avec fond OpenStreetMap et attribution visible. 104 repères géographiques, contre 45 entrées manuelles auparavant. Suppression du doublon Perpignan et correction des positions erronées.
- Les repères ne représentent ni des techniciens disponibles, ni leurs domiciles, ni des agences JCSM. Ce sont des centres de communes pour se repérer ; disponibilité et délai restent à confirmer.
- Regroupement des points proches, zoom au clic, bouton Vue d'ensemble et cibles tactiles de 44 px. Correction du max-width global qui écrasait les marqueurs Leaflet.
- Cache du site v89. Politique de sécurité dédiée à JCSM pour autoriser l'hôte exact des tuiles, sans modifier le snippet partagé des autres sites.

## Sources

Les centres des 99 communes françaises proviennent de l'[API officielle du découpage administratif](https://geo.api.gouv.fr/decoupage-administratif/communes), relevés le 5 septembre 2026 : chefs-lieux métropolitains, Brest, Dax et Lorient. Les cinq repères belges étaient déjà publiés sur JCSM. Aucune donnée personnelle n'est ajoutée.

Le chargement des tuiles suit la [politique OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/) : attribution, URL officielle, cache navigateur normal, aucun préchargement hors ligne ou téléchargement massif. Les tests automatiques de zoom remplacent les tuiles par une image locale factice. Pour un trafic important, prévoir un fournisseur de tuiles adapté, le service communautaire n'offrant pas de garantie de disponibilité.

## Vérifications

- Deux tests Node vérifient nombre, unicité, coordonnées sensibles et absence de champs privés. Ils font partie de npm run check.
- Recette navigateur 390 et 1440 px : logo chargé, 104 repères, taille des cibles, regroupement, zoom et retour à la vue initiale, attribution et absence de débordement ou erreur JavaScript.
- Contrôles PHP, JS, JSON et build CSS avant déploiement. Pas de TypeScript dans ce site statique.
- Aucun formulaire réel envoyé. Aucun compte, prix, ticket ou base privée modifié.

## Limites

Cette passe porte sur la carte d'accueil, pas sur une géolocalisation en temps réel du réseau. Un futur affichage des disponibilités nécessite une source métier dédiée, des coordonnées publiques consenties et une agrégation protectrice de la vie privée.
