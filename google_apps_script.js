/**
 * JCSM API - Google Sheets Backend
 * Handles reading interventions and saving reports
 */

const SHEET_NAME = 'Interventions'; // À adapter selon le nom de votre onglet

function getInterventions() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    // Mapping des colonnes
    const mapping = {
        nomSite: headers.indexOf('nomSite'),
        ticket: headers.indexOf('ticket'),
        adresse: headers.indexOf('adresse'),
        dateDemande: headers.indexOf('dateDemande'),
        descriptionProbleme: headers.indexOf('descriptionProbleme'),
        statut: headers.indexOf('statut'),
        technicien: headers.indexOf('technicien'),
        region: headers.indexOf('region'),
        lat: headers.indexOf('lat'),
        lng: headers.indexOf('lng')
    };

    const interventions = [];
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[mapping.nomSite]) continue;

        interventions.push({
            id: "intv-" + i,
            nomSite: row[mapping.nomSite],
            ticket: row[mapping.ticket],
            adresse: row[mapping.adresse],
            dateDemande: row[mapping.dateDemande],
            descriptionProbleme: row[mapping.descriptionProbleme],
            statut: row[mapping.statut],
            technicien: row[mapping.technicien],
            region: row[mapping.region],
            lat: row[mapping.lat],
            lng: row[mapping.lng],
            rowIndex: i + 1
        });
    }
    return interventions;
}

function doGet(e) {
    const region = e.parameter.region;
    let data = getInterventions();

    if (region && region !== 'Admin') {
        data = data.filter(item => item.region === region);
    }

    return ContentService.createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    // Placeholder pour la sauvegarde futur des rapports
    const params = JSON.parse(e.postData.contents);
    return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Reçu" }))
        .setMimeType(ContentService.MimeType.JSON);
}
