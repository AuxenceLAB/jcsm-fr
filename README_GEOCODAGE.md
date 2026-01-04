# Géocodage des Sites

## Instructions pour géocoder tous les sites

Avec plus de 1000 sites, le géocodage complet prendra environ 16-20 minutes (1 seconde par site pour respecter les limites de l'API Nominatim).

### Option 1 : Géocodage automatique par lots (Recommandé)

1. Ouvrez `interne.html` dans votre navigateur
2. Ouvrez la console (F12)
3. Copiez-collez le contenu de `geocode-sites.js` dans la console
4. Exécutez : `geocodeAllSites()`
5. Attendez la fin (cela prendra du temps)
6. Les résultats seront affichés dans la console
7. Copiez les résultats et utilisez `addSitesCoordinates(results)` pour les ajouter

### Option 2 : Géocodage progressif (par lots de 50)

Pour éviter de bloquer le navigateur, vous pouvez géocoder par lots :

```javascript
// Géocoder les 50 premiers sites
async function geocodeBatch(startIndex = 0, batchSize = 50) {
    const batch = sitesList.slice(startIndex, startIndex + batchSize);
    const results = [];
    
    for (let i = 0; i < batch.length; i++) {
        const site = batch[i];
        console.log(`[${startIndex + i + 1}/${sitesList.length}] ${site}`);
        const result = await geocodeSite(site);
        if (result) {
            results.push(result);
            // Ajouter immédiatement à la base de données
            addSitesCoordinates([result]);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`✅ Lot ${startIndex}-${startIndex + batch.length} terminé: ${results.length} sites`);
    return results;
}

// Utilisation: géocoder le premier lot
geocodeBatch(0, 50).then(() => {
    console.log('Premier lot terminé. Pour continuer: geocodeBatch(50, 50)');
});
```

### Option 3 : Utiliser Google Geocoding API (Plus rapide, nécessite une clé API)

Si vous avez une clé API Google, vous pouvez utiliser l'API Google Geocoding qui est beaucoup plus rapide :

```javascript
async function geocodeSiteGoogle(siteName, apiKey) {
    const encodedName = encodeURIComponent(siteName + ', France');
    const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedName}&key=${apiKey}`
    );
    const data = await response.json();
    if (data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
            nomSite: siteName,
            lat: location.lat,
            lng: location.lng
        };
    }
    return null;
}
```

## Format des coordonnées

Les coordonnées doivent être au format :
```javascript
[
    { nomSite: "Carrefour Market - La Brillanne", lat: 43.9278, lng: 5.7175 },
    { nomSite: "Intermarché - Saint-Nazaire", lat: 47.2736, lng: -2.2139 },
    // ...
]
```

## Ajout des coordonnées

Une fois les coordonnées obtenues, ajoutez-les via :

```javascript
addSitesCoordinates([
    { nomSite: "Carrefour Market - La Brillanne", lat: 43.9278, lng: 5.7175 },
    // ... tous vos sites
]);
```

Les coordonnées seront automatiquement sauvegardées dans localStorage et utilisées pour matcher les interventions.

