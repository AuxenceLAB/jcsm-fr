# Sécurisation : correction du doublon photographique

Le navigateur sélectionnait `images/camera.webp` à la fois dans le héros et dans
la première solution. Pourtant, les originaux `camera.png` (caméra sous un
lampadaire) et `camera.jpg` (caméra avec panneau solaire) sont différents.

La première solution utilise désormais directement le JPEG existant, de 27 Ko
et 500 × 500 pixels. Aucun téléchargement externe, nouvelle licence, génération
d'image ou transformation photographique. Le visuel du héros reste inchangé.
Le texte alternatif français décrit le matériel visible sans inférer ses
capacités. La même correction est appliquée aux sept traductions publiques.

Les neuf photographies sont distinctes avec et sans prise en charge WebP.
Le test `scripts/security-images.test.cjs`, intégré à `npm run check`, vérifie
les huit pages, la présence des fichiers et leurs empreintes SHA-256.
Il évite notamment de réintroduire une conversion fondée sur le seul nom
`camera`, sans tenir compte des originaux PNG et JPEG différents.

Validation locale : 47 tests réussis, build Tailwind réussi sans différence CSS,
recette navigateur à 390 et 1 440 pixels, neuf images chargées, aucune erreur
JavaScript ni débordement horizontal. La recette avant correction reproduit
bien huit sources différentes pour neuf photographies.

Les fichiers CSS/JS et les images ne sont pas modifiés. Le cache de ressources
reste v97 ; le HTML est servi avec la stratégie réseau prioritaire existante.
Cette correction ne constitue pas un audit des autres contenus de la page.
