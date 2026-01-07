# Upload Direct sur Google Drive - Configuration

## Fonctionnement

Les techniciens peuvent uploader les fiches méthodes directement sur Google Drive en appuyant sur "Enregistrer".

## Configuration requise

### Étape 1 : Créer un Google Apps Script

1. Allez sur https://script.google.com
2. Créez un nouveau projet
3. Collez le code ci-dessous
4. Déployez comme Web App

### Étape 2 : Activer les APIs nécessaires

Dans le projet Apps Script :
1. Menu `Services` → `+` → Ajoutez :
   - **Drive API** (pour uploader les fichiers)
   - **Sheets API** (pour stocker les métadonnées)

### Étape 3 : Créer le dossier Google Drive

1. Créez un dossier "Fiches_Methodes_JCSM" dans Google Drive
2. Partagez-le avec le compte Google utilisé pour Apps Script
3. Copiez l'ID du dossier (visible dans l'URL : `drive.google.com/drive/folders/FOLDER_ID`)

### Étape 4 : Configurer dans le code

Modifiez les constantes dans le script Apps Script :
- `FOLDER_ID` : ID du dossier Drive
- `SHEET_ID` : ID de votre Google Sheet (optionnel)

### Étape 5 : Déployer et récupérer l'URL

1. Cliquez sur `Déployer` → `Nouveau déploiement`
2. Type : `Application Web`
3. Exécuter en tant que : `Moi`
4. Qui peut y accéder : `Tous`
5. Cliquez sur `Déployer`
6. Copiez l'URL de déploiement

### Étape 6 : Configurer dans interne.html

Dans la console du navigateur ou dans le code :
```javascript
localStorage.setItem('drive_api_url', 'VOTRE_URL_APPS_SCRIPT');
localStorage.setItem('drive_folder_id', 'VOTRE_FOLDER_ID');
```

## Code Google Apps Script

```javascript
// Configuration
const FOLDER_ID = 'VOTRE_FOLDER_ID_ICI';
const SHEET_ID = 'VOTRE_SHEET_ID_ICI'; // Optionnel

// Fonction principale pour recevoir les fiches
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action || 'save';
    
    switch(action) {
      case 'save':
        return saveFiche(data.fiche);
      case 'list':
        return listFiches();
      case 'delete':
        return deleteFiche(data.ficheId);
      default:
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Action non reconnue'
        })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // Retourner toutes les fiches
  return listFiches();
}

// Sauvegarder une fiche
function saveFiche(fiche) {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  
  // Sauvegarder les images sur Drive
  const imageUrls = [];
  if (fiche.images && Array.isArray(fiche.images)) {
    fiche.images.forEach((img, index) => {
      if (img.data && img.data.startsWith('data:image/')) {
        const blob = Utilities.newBlob(
          Utilities.base64Decode(img.data.split(',')[1]),
          getMimeTypeFromBase64(img.data),
          img.name || `image_${fiche.id}_${index}.jpg`
        );
        const file = folder.createFile(blob);
        
        // Rendre le fichier accessible publiquement (ou via lien partagé)
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        
        imageUrls.push({
          id: img.id,
          name: img.name,
          url: file.getUrl(),
          driveId: file.getId()
        });
      } else if (img.url) {
        // Image déjà sur Drive
        imageUrls.push(img);
      }
    });
  }
  
  // Créer le fichier JSON de la fiche
  const ficheData = {
    id: fiche.id || 'fiche-' + Date.now(),
    titre: fiche.titre,
    contenu: fiche.contenu,
    images: imageUrls,
    dateCreated: fiche.dateCreated || new Date().toISOString(),
    dateModified: new Date().toISOString()
  };
  
  // Sauvegarder dans un fichier JSON sur Drive
  const existingFile = findFileInFolder(folder, ficheData.id + '.json');
  const jsonBlob = Utilities.newBlob(
    JSON.stringify(ficheData, null, 2),
    'application/json',
    ficheData.id + '.json'
  );
  
  if (existingFile) {
    existingFile.setContent(jsonBlob.getDataAsString());
    var savedFile = existingFile;
  } else {
    var savedFile = folder.createFile(jsonBlob);
  }
  
  // Sauvegarder aussi dans un Sheet pour indexation rapide
  saveToSheet(ficheData);
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    fiche: ficheData,
    fileId: savedFile.getId()
  })).setMimeType(ContentService.MimeType.JSON);
}

// Lister toutes les fiches
function listFiches() {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const files = folder.getFilesByType(MimeType.JSON);
  const fiches = [];
  
  while (files.hasNext()) {
    const file = files.next();
    if (file.getName().endsWith('.json') && file.getName().startsWith('fiche-')) {
      try {
        const content = file.getBlob().getDataAsString();
        const fiche = JSON.parse(content);
        fiches.push(fiche);
      } catch (e) {
        console.error('Erreur lecture fichier:', file.getName(), e);
      }
    }
  }
  
  // Trier par date de modification (plus récent en premier)
  fiches.sort((a, b) => {
    return new Date(b.dateModified || b.dateCreated) - new Date(a.dateModified || a.dateCreated);
  });
  
  return ContentService.createTextOutput(JSON.stringify(fiches))
    .setMimeType(ContentService.MimeType.JSON);
}

// Supprimer une fiche
function deleteFiche(ficheId) {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const file = findFileInFolder(folder, ficheId + '.json');
  
  if (file) {
    // Charger la fiche pour supprimer les images associées
    try {
      const content = file.getBlob().getDataAsString();
      const fiche = JSON.parse(content);
      
      // Supprimer les images
      if (fiche.images) {
        fiche.images.forEach(img => {
          if (img.driveId) {
            try {
              DriveApp.getFileById(img.driveId).setTrashed(true);
            } catch (e) {
              console.error('Erreur suppression image:', e);
            }
          }
        });
      }
    } catch (e) {
      console.error('Erreur lecture fiche avant suppression:', e);
    }
    
    // Supprimer le fichier JSON
    file.setTrashed(true);
    
    // Supprimer du Sheet
    deleteFromSheet(ficheId);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Fiche supprimée'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    error: 'Fiche non trouvée'
  })).setMimeType(ContentService.MimeType.JSON);
}

// Helper : trouver un fichier dans un dossier
function findFileInFolder(folder, fileName) {
  const files = folder.getFilesByName(fileName);
  if (files.hasNext()) {
    return files.next();
  }
  return null;
}

// Helper : obtenir le MIME type depuis base64
function getMimeTypeFromBase64(base64String) {
  const match = base64String.match(/^data:image\/(\w+);base64,/);
  if (match) {
    return 'image/' + match[1];
  }
  return 'image/jpeg'; // Par défaut
}

// Sauvegarder dans Sheet pour indexation (optionnel mais recommandé)
function saveToSheet(fiche) {
  if (!SHEET_ID) return;
  
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Fiches') || 
                  SpreadsheetApp.openById(SHEET_ID).insertSheet('Fiches');
    
    // Créer les en-têtes si nécessaire
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['ID', 'Titre', 'Date Créée', 'Date Modifiée', 'Nb Images']);
    }
    
    // Chercher si la fiche existe déjà
    const data = sheet.getDataRange().getValues();
    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === fiche.id) {
        rowIndex = i + 1;
        break;
      }
    }
    
    const row = [
      fiche.id,
      fiche.titre,
      fiche.dateCreated,
      fiche.dateModified,
      fiche.images ? fiche.images.length : 0
    ];
    
    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }
  } catch (e) {
    console.error('Erreur sauvegarde Sheet:', e);
  }
}

// Supprimer du Sheet
function deleteFromSheet(ficheId) {
  if (!SHEET_ID) return;
  
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Fiches');
    if (!sheet) return;
    
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === ficheId) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
  } catch (e) {
    console.error('Erreur suppression Sheet:', e);
  }
}
```

## Utilisation

Une fois configuré, les techniciens peuvent :
1. Créer/modifier une fiche
2. Ajouter des images (drag & drop)
3. Cliquer sur "Enregistrer"
4. La fiche et les images sont automatiquement uploadées sur Google Drive
5. Tous les techniciens voient les mêmes fiches en temps réel

## Avantages

✅ **100% gratuit** (dans les limites Google)  
✅ **Pas de gestion de serveur**  
✅ **Stockage illimité** (dans Drive)  
✅ **Partage automatique** entre tous les techniciens  
✅ **Sauvegarde automatique** dans le cloud  
✅ **Accès depuis n'importe où**

