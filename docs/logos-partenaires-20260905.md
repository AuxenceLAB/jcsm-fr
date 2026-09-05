# Logos partenaires · 5 septembre 2026

- Les variantes WebP présentant des artefacts de fond sont remplacées dans les bandeaux par les PNG originaux, déjà transparents, et le SVG existant de Carplug.
- Le fichier Efacec était un SVG mal nommé avec une extension PNG. Une copie exacte avec la bonne extension .svg rétablit son chargement dans le navigateur.
- 26 marques rencontrées dans neuf pages, dont les traductions et la page Belgique. Le logo JCSM reste inchangé.
- Cadres identiques : 136 × 64 px sur ordinateur et 119 × 56 px sur mobile. Le cadrage CSS compense les marges internes. Le rapport largeur/hauteur de chaque image reste inchangé ; aucun dessin ni texte de marque n'est étiré.
- Pas de cadre, ombre ou fond ajouté aux logos. Le mélange multiply neutralise le blanc résiduel sur le fond du bandeau.
- Perpignan : version publiée par la [mairie lors de la présentation de son identité](https://www.mairie-perpignan.fr/actualites/nouvelle-identite-visuelle), copiée sans redessin dans images/perpignan-identite-officielle.jpg. Le fond clair s'intègre au bandeau, contrairement à l'ancien rectangle bleu. Ce JPEG n'a pas de canal alpha : l'intégration sans bloc visible est effectuée en CSS.
- Une tentative de retouche avec le skill imagegen a été écartée : l'image produite avait un faux damier, sans transparence réelle. Elle n'est ni intégrée au projet ni publiée. Seuls les originaux et la version officielle sont utilisés.
- Prompt de la tentative : retirer le fond bleu, préserver exactement blason, texte et proportions, rendre le texte bleu lisible sur fond clair et demander un PNG transparent. Outil intégré, sans clé API ni envoi de document privé.
- Règles de cadrage dans styles.css, commun aux neuf pages. Cache v93 ; anciens fichiers conservés. Aucun compte, ticket, tarif ou rapport modifié.

Vérifications : test de régression des références et cadrages intégré à npm run check ; contrôle navigateur des sources chargées, dimensions identiques et proportions, sur mobile et ordinateur ; build CSS et contrôles PHP/JS/JSON avant publication.
