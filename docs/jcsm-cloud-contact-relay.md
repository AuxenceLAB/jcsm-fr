# Relais des formulaires de contact vers JCSM Cloud

Le site public envoie ses formulaires de contact ordinaires à `/api/site-contact.php`. Le navigateur ne reçoit jamais la clé de service. Le relais appelle `POST https://jcsm.cloud/api/service/site-contacts` avec `X-Service-Key` et `X-Client-IP` (adresse `REMOTE_ADDR` du visiteur). La clé doit être dans `/var/www/.secrets/jcsm-site-contact.key`, hors dépôt et hors racine web, lisible uniquement par `root` et le groupe `www-data` (mode `0640`). Sans clé, l'API répond 503 et le navigateur garde les champs pour un nouvel essai.

## Contrat JCSM Cloud requis avant mise en ligne

Corps JSON :

```json
{
  "partenaire_ref": "jcsm.fr",
  "source_ref": "jcsm-fr:UUID-v4",
  "nom": "Nom du contact",
  "entreprise": null,
  "email": "contact@example.com",
  "telephone": null,
  "sujet": null,
  "type_projet": null,
  "message": "Texte du formulaire",
  "consentement_rgpd": true,
  "langue": "fr",
  "page": "/contact"
}
```

L'API doit valider l'entrée, enregistrer un contact en file de revue et imposer l'unicité de `(partenaire_ref, source_ref)` dans PostgreSQL. À contenu identique, un rejeu rend `200 {"ok":true,"deja_recue":true}` ; la première insertion rend `201 {"ok":true,"deja_recue":false}`. À contenu différent sous la même référence, rendre 409. Le relais ne reconnaît un succès qu'avec ce JSON. Aucun email au visiteur, aucune conversion en intervention, aucun envoi commercial ni assignation automatique par cet endpoint. Une notification interne peut être dédupliquée par la référence.

Le navigateur conserve `source_ref` en `sessionStorage` tant qu'il n'a pas reçu ce succès. Après un délai d'attente ou une réponse réseau ambiguë, un second clic reprend donc la même référence. Après succès elle est supprimée. Les formulaires carrières et partenaires restent sur leur flux spécialisé actuel ; ils demandent une file JCSM distincte pour être intégrés sans mélanger candidats et prospects.

## Vérification avant activation

1. Déployer et tester l'endpoint JCSM avec un client factice en base de test et emails désactivés.
2. Créer `/var/www/.secrets/jcsm-site-contact.key` avec la clé dédiée de JCSM Cloud ; propriétaire `root:www-data`, mode `0640`. Saisir la clé via un canal local sûr, jamais en argument de commande, en historique shell, dans `.env` sous `/var/www/jcsm.fr`, ni dans une page ou un JavaScript. Contrôler le mode et la lisibilité par `www-data` sans afficher son contenu.
3. Déployer les fichiers du site après l'API JCSM. Vérifier un seul formulaire test avec un contact contrôlé, puis contrôler en JCSM une ligne et aucun message sortant.

Le site conserve le formulaire et affiche une erreur si le relais ou JCSM ne confirme pas l'enregistrement. Aucun envoi réel n'est effectué par les tests du dépôt.
