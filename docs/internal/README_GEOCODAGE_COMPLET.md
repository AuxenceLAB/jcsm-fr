# Géocodage Complet des Sites - Guide d'Utilisation

## 🎯 Objectif

Géocoder une fois pour toutes tous les sites de votre liste et les intégrer directement dans `interne.html` pour que les interventions s'affichent automatiquement sur la carte.

## 📋 Étapes

### 1. Exécuter le script de géocodage

```bash
cd /Users/auxence/Desktop/JCSM/Final
node geocode-all-sites-node.js
```

**⏱️ Temps estimé : ~17-20 minutes** (1 seconde par site pour respecter les limites de l'API Nominatim)

Le script va :
- Géocoder tous les sites un par un
- Afficher la progression en temps réel
- Générer deux fichiers :
  - `sites-coordinates-generated.js` : Code JavaScript à intégrer dans `interne.html`
  - `sites-coordinates.json` : Format JSON pour référence

### 2. Intégrer les coordonnées dans interne.html

1. Ouvrez `sites-coordinates-generated.js`
2. Copiez tout le contenu
3. Ouvrez `interne.html`
4. Trouvez la ligne avec `const SITES_COORDINATES_PRECONFIGURED = {};` (ligne ~2184)
5. Remplacez `{}` par le contenu copié

**Exemple :**
```javascript
// Avant
const SITES_COORDINATES_PRECONFIGURED = {};

// Après
const SITES_COORDINATES_PRECONFIGURED = {
    "Carrefour Market - La Brillanne": { lat: 43.9278, lng: 5.7175 },
    "Intermarché - Saint-Nazaire": { lat: 47.2736, lng: -2.2139 },
    // ... tous les autres sites
};
```

### 3. Vérifier que tout fonctionne

1. Ouvrez `interne.html` dans votre navigateur
2. Sélectionnez une région
3. Les interventions devraient maintenant s'afficher sur la carte avec leurs coordonnées

## ✅ Résultat

- ✅ Tous les sites sont géocodés une fois pour toutes
- ✅ Les coordonnées sont intégrées directement dans le code
- ✅ Plus besoin de géocoder à chaque chargement
- ✅ Les interventions s'affichent automatiquement sur la carte
- ✅ Seules les interventions en cours (14 jours) sont affichées par défaut
- ✅ Les interventions passées sont cachées (bouton "📋 Passées" pour les voir)

## 🔍 Affichage des Interventions

### Interventions en cours (affichées par défaut)
- **Période** : 7 jours avant aujourd'hui + 7 jours après = **14 jours**
- **Filtre** : Interventions avec `dateProposee` ou `dateDemande` dans cette fenêtre

### Interventions passées (cachées par défaut)
- **Période** : Plus de 7 jours avant aujourd'hui
- **Affichage** : Cliquez sur le bouton "📋 Passées" pour les voir
- **Tri** : Par date décroissante (plus récentes en premier)

## 🛠️ Dépannage

### Si certains sites ne sont pas trouvés
Le script affichera une liste des sites non trouvés. Vous pouvez :
1. Les géocoder manuellement via la console du navigateur
2. Utiliser `addSitesCoordinates([{ nomSite: "...", lat: ..., lng: ... }])`

### Si le script s'arrête
Relancez-le, il reprendra depuis le début. Les sites déjà géocodés seront regéocodés (pas de problème, juste un peu plus long).

## 📝 Notes

- Le script respecte les limites de l'API Nominatim (1 requête par seconde)
- Les coordonnées sont sauvegardées dans `localStorage` en plus du code
- Vous pouvez toujours ajouter des sites manuellement via `addSitesCoordinates()`

