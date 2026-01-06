/**
 * JCSM API - Google Sheets Backend
 * Handles reading interventions and saving reports
 */

const SHEET_NAME = 'Interventions à gérer';

function getInterventions() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
    const data = sheet.getDataRange().getValues();

    const interventions = [];
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[3]) continue; // Skip if no job number (Column D)

        interventions.push({
            id: "intv-" + i,
            region: row[0],        // A: Département
            ticket: row[3],        // D: numéro du job
            adresse: row[4],       // E: Adresse
            dateDemande: formatDate(row[5]), // F: Date de la demande
            delais: row[7],        // H: Délais
            demandeur: row[8],     // I: Demandeur
            marque: row[9],        // J: Marque
            nomSite: row[10],      // K: Charger ID
            descriptionProbleme: row[12], // M: Probleme
            testCharge: row[13],   // N: Test de charge nécessaire
            prisEnCompte: row[14], // O: Pris en compte
            fait: row[15],         // P: Fait
            reussi: row[16],       // Q: Réussi
            rapportFait: row[17],  // R: Rapport fait
            rowIndex: i + 1
        });
    }
    return interventions;
}

function formatDate(date) {
    if (date instanceof Date) {
        return Utilities.formatDate(date, Session.getScriptTimeZone(), "dd/MM/yyyy");
    }
    return date;
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
    try {
        const params = JSON.parse(e.postData.contents);
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];

        // On cherche la ligne par le numéro de ticket (Colonne D / index 3)
        const data = sheet.getDataRange().getValues();
        let rowIndex = -1;
        for (let i = 1; i < data.length; i++) {
            if (data[i][3] == params.ticket) {
                rowIndex = i + 1;
                break;
            }
        }

        if (rowIndex > 0) {
            // Mise à jour des colonnes de statut
            // P: Fait (index 15), Q: Réussi (index 16), R: Rapport fait (index 17)
            sheet.getRange(rowIndex, 16).setValue(true); // Fait
            sheet.getRange(rowIndex, 17).setValue(params.statut === 'resolu'); // Réussi si statut résolu
            sheet.getRange(rowIndex, 18).setValue(true); // Rapport fait

            return ContentService.createTextOutput(JSON.stringify({ success: true }))
                .setMimeType(ContentService.MimeType.JSON);
        }

        return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Ticket non trouvé" }))
            .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, message: err.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}
