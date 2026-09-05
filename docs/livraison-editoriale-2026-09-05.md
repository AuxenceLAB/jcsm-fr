# Livraison editoriale JCSM

Perimetre : jcsm.fr uniquement pour cette livraison. FTH, DPE Studio et les autres sites hors JCSM, ChargeTeam et Aixo sont exclus.

## Direction

Photographies existantes du terrain, fond clair mineral, contraste cuivre et graphite, grands titres lisibles. Un appel a l'action principal, le telephone en second. Pas de photographie generee, de faux tableau de bord, de statistique illustrative en accroche ou de flou d'entree sur la photo principale.

Les identites doivent rester distinctes : JCSM met en avant son metier et ses interventions ; ChargeTeam, la mise en relation et les missions ; Aixo, l'assistance et le suivi du travail. Ces deux dernieres applications ne sont pas modifiees par ce depot.

## Modifications

- Accueil francais recompose et raccourci ; photographie reelle mise en avant.
- Suppression du graphique de disponibilite de demonstration dans l'accroche et des badges superposes a la photo.
- Titre mobile agrandi et espacement sous la navigation corrige.
- Effet de flou et entree retardee des contenus desactives sur ce nouvel accueil.
- Formulaire : focus sur le premier champ incorrect, espaces exclus du calcul des longueurs minimales, protection contre le double envoi en cours.
- Espace reserve aux erreurs pour eviter de deplacer la case de consentement pendant le clic.
- Gestion des evenements de survol protegee quand la cible n'est pas un Element.
- Cache des assets et service worker synchronises en v88 ; configuration publique en 2.57.3.

## Recette

Accueil controle en previsualisation sur 360, 390, 768 et 1440 pixels : image chargee sans filtre, titre visible sous le menu, aucun debordement horizontal, menu mobile, fermeture Echap, FAQ, validation du formulaire et conservation de la saisie en cas d'erreur.

Les reponses d'echec et de succes du formulaire sont simulees dans le navigateur. Aucun message, lead, e-mail ou SMS reel envoye. La reception finale via Formspree n'est pas certifiee par cette recette.

Le site est statique HTML, JavaScript et PHP : compilation Tailwind, controle syntaxique JavaScript/PHP et JSON. Aucun typecheck TypeScript n'est applicable a ce projet.

Les langues et pages secondaires conservent leurs contenus et beneficient des correctifs partages ; leur cache est actualise. Cette livraison ne pretend pas refaire graphiquement toutes les pages du site.
