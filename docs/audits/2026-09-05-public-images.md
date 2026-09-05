# Audit des images publiques JCSM

## Périmètre et résultat local

154 pages publiques, dont les articles, pages régionales et sept traductions.
Inventaire : 1 202 éléments image et 96 fichiers locaux référencés, variantes
comprises. Aucun fichier référencé manquant. Les logos répétés dans le menu,
le pied de page ou les bandeaux partenaires restent intentionnellement présents.
Les espaces privés, prototypes partenaires et `demo/` sont exclus du catalogue
public existant.

Après la correction des caméras, un second doublon a été confirmé visuellement :
`remiseconfo` et `remiseconformite` montrent la même scène de contrôle électrique,
malgré des tailles, recadrages et empreintes différents. La page Installation
l'utilisait dans son ouverture et dans la section de remise en conformité.

## Corrections

- Dans les huit versions de la page Installation, l'ouverture utilise une vue
  de station existante, avec plusieurs bornes et places dédiées. La photo du
  contrôle électrique reste à sa place dans la section de conformité.
- Les variantes mobile, WebP et JPEG de cette vue sont cohérentes. Les dimensions
  intrinsèques de la nouvelle photo et le chargement prioritaire sont renseignés.
- 55 descriptions alternatives corrigées sur 32 pages : voiture en recharge
  décrite comme telle, sans l'appeler équipe ou borne Tesla ; conseiller au
  casque ; contrôle électrique ; caméra solaire ; câble coupé. Les traductions
  sont conservées dans leur langue.
- Aucun nouveau fichier photographique, achat, téléchargement externe ni image
  générée. Aucun original supprimé ou écrasé. Une photo peut illustrer deux
  pages différentes lorsque le contexte le justifie ; elle n'est plus répétée
  deux fois dans le corps d'une même page.

## Garde-fous et validation

`scripts/public-photographs.cjs` relie les formats et noms de fichiers aux scènes
effectivement vérifiées. `scripts/public-images.test.cjs` contrôle les 154 pages :
présence des fichiers, texte alternatif, cohérence des variantes et absence de
doublon photographique. Le contrôle est intégré à `npm run check`.

Validation locale : 202 tests réussis ; build Tailwind réussi sans modification
du CSS produit ; 308 recettes navigateur réussies, soit chaque page à 390 et
1 440 pixels, avec toutes les images chargées, sans doublon photographique,
débordement horizontal ni erreur JavaScript. Les services tiers sont neutralisés
dans cette recette locale ; elle ne certifie pas les cartes ni les services API.
Des captures ciblées complètent les contrôles des pages modifiées.

Les fichiers CSS/JS partagés et les images ne changent pas : le cache de ressources
reste v97, tandis que les pages HTML suivent la stratégie réseau prioritaire.
L'avertissement Browserslist ancien reste distinct de cette correction d'images.

## Limites

Cet audit concerne la cohérence et le chargement des visuels, pas une certification
des prestations ou des caractéristiques techniques mentionnées dans les pages.
Les photographies déjà présentes sont réutilisées sans nouvelle attribution à
un client ou à un salarié. Il ne s'agit pas d'un audit juridique de leurs licences.
