# Intégration Google Sheets + Google Drive pour Interventions

Ce document explique comment :
1. Lire les données d'interventions depuis un Google Sheet
2. Sauvegarder les rapports d'intervention en PDF dans Google Drive

## Option 1 : Google Apps Script (Recommandé - Simple et gratuit)

### Étape 1 : Créer un Google Apps Script

1. Ouvrez votre Google Sheet avec les interventions
2. Menu `Extensions` → `Apps Script`
3. Créez un nouveau script

### Étape 2 : Lire les données du Sheet

```javascript
// Code dans Apps Script
function getInterventions() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  // En-têtes (ligne 1)
  const headers = data[0];
  
  // Trouver les indices des colonnes
  const colIndices = {
    nomSite: headers.indexOf('nomSite') !== -1 ? headers.indexOf('nomSite') : 2, // Colonne C = index 2
    ticket: headers.indexOf('ticket') !== -1 ? headers.indexOf('ticket') : 3, // Colonne D = index 3
    adresse: headers.indexOf('adresse') !== -1 ? headers.indexOf('adresse') : 4, // Colonne E = index 4
    dateDemande: headers.indexOf('dateDemande') !== -1 ? headers.indexOf('dateDemande') : 5, // Colonne F = index 5
    dateProposee: headers.indexOf('dateProposee') !== -1 ? headers.indexOf('dateProposee') : 6, // Colonne G = index 6
    delais: headers.indexOf('delais') !== -1 ? headers.indexOf('delais') : 7, // Colonne H = index 7
    marque: headers.indexOf('marque') !== -1 ? headers.indexOf('marque') : 9, // Colonne J = index 9
    descriptionProbleme: headers.indexOf('descriptionProbleme') !== -1 ? headers.indexOf('descriptionProbleme') : 12, // Colonne M = index 12
    region: headers.indexOf('region') !== -1 ? headers.indexOf('region') : -1,
    lat: headers.indexOf('lat') !== -1 ? headers.indexOf('lat') : -1,
    lng: headers.indexOf('lng') !== -1 ? headers.indexOf('lng') : -1,
    fait: headers.indexOf('fait') !== -1 ? headers.indexOf('fait') : 15, // Colonne P = index 15
    reussi: headers.indexOf('réussi') !== -1 ? headers.indexOf('réussi') : (headers.indexOf('reussi') !== -1 ? headers.indexOf('reussi') : 16), // Colonne Q = index 16
    rapportFait: headers.indexOf('rapport intervention fait') !== -1 ? headers.indexOf('rapport intervention fait') : (headers.indexOf('rapportFait') !== -1 ? headers.indexOf('rapportFait') : 17) // Colonne R = index 17
  };
  
  const interventions = [];
  
  // Parcourir les lignes (à partir de la ligne 2)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[colIndices.nomSite]) continue; // Ignorer les lignes vides
    
    const intervention = {
      id: `intv-${i}`,
      nomSite: row[colIndices.nomSite] || '',
      ticket: row[colIndices.ticket] || '',
      adresse: row[colIndices.adresse] || '',
      dateDemande: row[colIndices.dateDemande] ? formatDate(row[colIndices.dateDemande]) : '',
      dateProposee: row[colIndices.dateProposee] ? formatDate(row[colIndices.dateProposee]) : '',
      delais: row[colIndices.delais] || '',
      marque: row[colIndices.marque] || '',
      descriptionProbleme: row[colIndices.descriptionProbleme] || '',
      region: colIndices.region !== -1 ? row[colIndices.region] : '',
      lat: colIndices.lat !== -1 && row[colIndices.lat] ? parseFloat(row[colIndices.lat]) : null,
      lng: colIndices.lng !== -1 && row[colIndices.lng] ? parseFloat(row[colIndices.lng]) : null,
      // Colonnes P, Q, R sont des cases à cocher (true/false)
      fait: colIndices.fait !== -1 ? (row[colIndices.fait] === true || row[colIndices.fait] === 'TRUE' || row[colIndices.fait] === 'OUI' || row[colIndices.fait] === 'Oui') : false,
      reussi: colIndices.reussi !== -1 ? (row[colIndices.reussi] === true || row[colIndices.reussi] === 'TRUE' || row[colIndices.reussi] === 'OUI' || row[colIndices.reussi] === 'Oui') : false,
      rapportFait: colIndices.rapportFait !== -1 ? (row[colIndices.rapportFait] === true || row[colIndices.rapportFait] === 'TRUE' || row[colIndices.rapportFait] === 'OUI' || row[colIndices.rapportFait] === 'Oui') : false,
      rowIndex: i + 1 // Indice de la ligne pour mise à jour
    };
    
    interventions.push(intervention);
  }
  
  return interventions;
}

function formatDate(dateValue) {
  if (!dateValue) return '';
  if (dateValue instanceof Date) {
    return Utilities.formatDate(dateValue, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return dateValue.toString();
}

// Fonction Web App pour exposer les données
function doGet(e) {
  const region = e && e.parameter ? e.parameter.region : null;
  let interventions = getInterventions();
  
  // Filtrer par région si fournie
  if (region) {
    interventions = interventions.filter(intv => intv.region === region);
  }
  
  return ContentService.createTextOutput(JSON.stringify(interventions))
    .setMimeType(ContentService.MimeType.JSON);
}

// Fonction pour sauvegarder un rapport d'intervention
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action || 'saveReport';
    
    if (action === 'saveReport') {
      return saveReport(data.report);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Action non reconnue'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Sauvegarder un rapport d'intervention
function saveReport(reportData) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  // Indice de la colonne "ticket" (sinon fallback colonne D = index 3)
  const ticketColIndex = headers.indexOf('ticket') !== -1 ? headers.indexOf('ticket') : 3;

  let rowIndex = -1;

  // Recherche par ticket, sinon par id logique intv-i
  for (let i = 1; i < data.length; i++) {
    const ticket = data[i][ticketColIndex];
    const logicalId = `intv-${i}`;

    if (ticket === reportData.ticket || logicalId === reportData.id) {
      rowIndex = i + 1; // +1 car range est 1-based
      break;
    }
  }
  
  if (rowIndex === -1) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Intervention non trouvée'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Statut => cases à cocher
  const statut = reportData.statut || '';
  const fait = (statut === 'resolu' || statut === 'en-cours');
  const reussi = (statut === 'resolu');
  const rapportFait = true;

  // Colonnes P/Q/R = colonnes 16/17/18
  sheet.getRange(rowIndex, 16).setValue(fait);        // Colonne P
  sheet.getRange(rowIndex, 17).setValue(reussi);      // Colonne Q
  sheet.getRange(rowIndex, 18).setValue(rapportFait); // Colonne R
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Rapport enregistré avec succès'
  })).setMimeType(ContentService.MimeType.JSON);
}
```

### Étape 3 : Déployer comme Web App

1. Dans Apps Script, cliquez sur `Deploy` → `New deployment`
2. Type : `Web app`
3. Execute as : `Me`
4. Who has access : `Anyone` (ou `Anyone with Google account` pour plus de sécurité)
5. Cliquez sur `Deploy`
6. Copiez l'URL de déploiement (ex: `https://script.google.com/macros/s/.../exec`)

### Étape 4 : Sauvegarder un PDF dans Drive

```javascript
// Dans Apps Script
function saveReportToDrive(reportData) {
  // Créer le contenu HTML du rapport
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #333; }
        .section { margin-bottom: 20px; }
        .label { font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>Rapport d'Intervention</h1>
      <div class="section">
        <p><span class="label">Site:</span> ${reportData.nomSite}</p>
        <p><span class="label">Ticket:</span> ${reportData.ticket}</p>
        <p><span class="label">Adresse:</span> ${reportData.adresse}</p>
      </div>
      <div class="section">
        <p><span class="label">Date d'intervention:</span> ${reportData.dateIntervention}</p>
        <p><span class="label">Heure arrivée:</span> ${reportData.heureArrivee}</p>
        <p><span class="label">Heure départ:</span> ${reportData.heureDepart}</p>
      </div>
      <div class="section">
        <p><span class="label">Problème constaté:</span></p>
        <p>${reportData.probleme}</p>
      </div>
      <div class="section">
        <p><span class="label">Action réalisée:</span></p>
        <p>${reportData.actionRealisee}</p>
      </div>
      <div class="section">
        <p><span class="label">Statut:</span> ${reportData.statut}</p>
        ${reportData.piecesChangees ? `<p><span class="label">Pièces changées:</span> ${reportData.piecesChangees}</p>` : ''}
        ${reportData.remarques ? `<p><span class="label">Remarques:</span> ${reportData.remarques}</p>` : ''}
      </div>
    </body>
    </html>
  `;
  
  // Convertir HTML en PDF
  const blob = Utilities.newBlob(htmlContent, 'text/html', 'report.html');
  const pdfBlob = blob.getAs('application/pdf');
  
  // Créer le dossier dans Drive (ou utiliser un existant)
  const folderName = 'Rapports Interventions';
  let folder;
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    folder = folders.next();
  } else {
    folder = DriveApp.createFolder(folderName);
  }
  
  // Créer le fichier PDF
  const fileName = `Rapport_${reportData.ticket}_${reportData.dateIntervention}.pdf`;
  const file = folder.createFile(pdfBlob);
  file.setName(fileName);
  
  // Optionnel : Partager le fichier (si besoin)
  // file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  return {
    success: true,
    fileId: file.getId(),
    fileUrl: file.getUrl()
  };
}

// Endpoint POST pour recevoir les rapports
function doPost(e) {
  try {
    const reportData = JSON.parse(e.postData.contents);
    const result = saveReportToDrive(reportData);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

### Étape 5 : Modifier interne.html pour utiliser l'API

Dans `interne.html`, remplacez la section des données mock par :

```javascript
// Remplacer MOCK_INTERVENTIONS par un appel API
const SHEET_API_URL = 'https://script.google.com/macros/s/VOTRE_ID/exec';

async function loadInterventions() {
    try {
        const region = localStorage.getItem('tech_region');
        const url = `${SHEET_API_URL}?region=${encodeURIComponent(region)}`;
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur lors du chargement des interventions:', error);
        return MOCK_INTERVENTIONS; // Fallback sur mock (dans interne.html)
    }
}

// Dans initApp(), remplacer getFilteredInterventions() par :
async function initApp() {
    if (!checkAuth()) return;
    
    const interventions = await loadInterventions();
    MOCK_INTERVENTIONS.length = 0;
    MOCK_INTERVENTIONS.push(...interventions);
    
    renderInterventionsList();
    initMap();
}
```

### Étape 6 : Envoyer le rapport au serveur

Dans la fonction de soumission du formulaire :

```javascript
document.getElementById('report-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        interventionId: selectedInterventionId,
        nomSite: document.getElementById('form-site-name').textContent,
        ticket: document.getElementById('form-ticket').textContent.replace('Ticket: ', ''),
        adresse: document.getElementById('form-address').textContent,
        dateIntervention: document.getElementById('date-intervention').value,
        heureArrivee: document.getElementById('heure-arrivee').value,
        heureDepart: document.getElementById('heure-depart').value,
        probleme: document.getElementById('probleme').value,
        actionRealisee: document.getElementById('action-realisee').value,
        statut: document.getElementById('statut').value,
        piecesChangees: document.getElementById('pieces-changees').value,
        remarques: document.getElementById('remarques').value
    };
    
    try {
        const response = await fetch(SHEET_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Rapport enregistré avec succès ! PDF sauvegardé dans Google Drive.');
            console.log('Fichier créé:', result.fileUrl);
        } else {
            alert('Erreur lors de l\'enregistrement: ' + result.error);
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'enregistrement du rapport.');
    }
    
    document.getElementById('report-form').reset();
    closeReportForm();
});
```

---

## Option 2 : n8n (Workflow Automation)

Si vous utilisez n8n, voici un workflow type :

### Workflow 1 : Lire depuis Google Sheets

1. **Trigger Webhook** (GET) - reçoit la région
2. **Google Sheets Node** - lit les données
3. **Function Node** - transforme les données au format JSON
4. **Respond to Webhook** - retourne les interventions

### Workflow 2 : Sauvegarder PDF dans Drive

1. **Trigger Webhook** (POST) - reçoit le rapport
2. **Function Node** - génère le HTML du rapport
3. **HTML to PDF Node** - convertit en PDF
4. **Google Drive Node** - sauvegarde dans un dossier
5. **Respond to Webhook** - retourne le résultat

---

## Option 3 : Backend Node.js simple

Si vous préférez un backend dédié :

```javascript
// server.js
const express = require('express');
const { google } = require('googleapis');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;

const app = express();
app.use(express.json());

// Authentification Google
const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly', 'https://www.googleapis.com/auth/drive.file']
});

// Lire depuis Sheets
app.get('/api/interventions', async (req, res) => {
  const sheets = google.sheets({ version: 'v4', auth });
  const region = req.query.region;
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: 'VOTRE_SHEET_ID',
    range: 'Sheet1!A:M',
  });
  
  const rows = response.data.values;
  // Transformer les données...
  res.json(interventions);
});

// Sauvegarder PDF
app.post('/api/reports', async (req, res) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Générer HTML
  const html = generateReportHTML(req.body);
  await page.setContent(html);
  
  // Générer PDF
  const pdf = await page.pdf({ format: 'A4' });
  await browser.close();
  
  // Sauvegarder dans Drive
  const drive = google.drive({ version: 'v3', auth });
  const fileMetadata = {
    name: `Rapport_${req.body.ticket}.pdf`,
    parents: ['FOLDER_ID']
  };
  
  const file = await drive.files.create({
    requestBody: fileMetadata,
    media: {
      mimeType: 'application/pdf',
      body: pdf
    }
  });
  
  res.json({ success: true, fileId: file.data.id });
});
```

---

## Recommandation

**Option 1 (Google Apps Script)** est la plus simple et ne nécessite pas de serveur :
- ✅ Gratuit
- ✅ Pas de maintenance
- ✅ Intégration native avec Sheets et Drive
- ✅ Déploiement en 5 minutes

Pour commencer, utilisez l'Option 1. Si vous avez besoin de plus de contrôle ou de fonctionnalités avancées, passez à n8n ou un backend dédié.

