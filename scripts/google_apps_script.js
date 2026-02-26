/**
 * JCSM API - Google Sheets Backend
 * Handles reading interventions, updating statuses, and uploading reports to Drive
 */

const SHEET_NAME = 'Interventions à gérer';
const DRIVE_ROOT_FOLDER = 'JCSM';
const DRIVE_REPORTS_FOLDER = 'Rapports';

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
            numIntervention: row[0] || '',   // A: N° intervention or Département
            dept: row[1] || '',              // B: DEPT
            emplacement: row[2] || '',       // C: Emplacement
            ticket: row[3] || '',            // D: Ticket / numéro du job
            adresse: row[4] || '',           // E: Adresse
            dateDemande: formatDate(row[5]), // F: Date de demande
            dateProposee: formatDate(row[6]),// G: Date proposée
            delais: row[7] || '',            // H: Délais / SLA
            demandeur: row[8] || '',         // I: Demandeur
            marque: row[9] || '',            // J: Marque
            nomSite: row[10] || '',          // K: Nom du site / Charger ID
            serialNumber: row[11] || '',     // L: Serial Number
            descriptionProbleme: row[12] || '', // M: Problème
            testCharge: row[13] || '',       // N: Test de charge
            prisEnCompte: row[14] || '',     // O: Pris en compte
            fait: row[15] || '',             // P: Fait
            reussi: row[16] || '',           // Q: Réussi
            rapportFait: row[17] || '',      // R: Rapport fait
            requester: row[18] || '',        // S: Requester
            supplier: row[19] || '',         // T: Supplier
            deplacement: row[20] || '',      // U: Déplacement €
            tauxHoraire: row[21] || '',      // V: Taux horaire €
            factureHT: row[22] || '',        // W: Facture HT €
            remiseDeplacement: row[23] || '',// X: Remise déplacement €
            totalHT: row[24] || '',          // Y: Total HT €
            dateIntervention: formatDate(row[25]) || '', // Z: Date d'intervention
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
        data = data.filter(item => item.numIntervention === region);
    }

    return ContentService.createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    try {
        const params = JSON.parse(e.postData.contents);
        const action = params.action || 'default';

        switch (action) {
            case 'updateStatus':
                return handleUpdateStatus(params);
            case 'uploadReport':
                return handleUploadReport(params);
            default:
                return handleDefaultPost(params);
        }
    } catch (err) {
        return jsonResponse({ success: false, message: err.toString() });
    }
}

// ---------------------------------------------------------------------------
// Action: updateStatus
// Receives {action, ticket, fait, reussi, rapportUrl}
// Updates columns P (fait), Q (reussi), R (rapportUrl) for the matching ticket
// ---------------------------------------------------------------------------
function handleUpdateStatus(params) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
    const rowIndex = findRowByTicket(sheet, params.ticket);

    if (rowIndex < 0) {
        return jsonResponse({ success: false, message: "Ticket non trouvé" });
    }

    // P = column 16 (index 15), Q = column 17 (index 16), R = column 18 (index 17)
    sheet.getRange(rowIndex, 16).setValue(params.fait);       // P: Fait
    sheet.getRange(rowIndex, 17).setValue(params.reussi);     // Q: Réussi
    sheet.getRange(rowIndex, 18).setValue(params.rapportUrl); // R: Rapport fait / URL

    return jsonResponse({ success: true });
}

// ---------------------------------------------------------------------------
// Action: uploadReport
// Receives {action, htmlContent, fileName}
// Creates JCSM/Rapports/YYYY/MM/ folder structure in Drive, converts HTML to PDF
// Returns {success, driveUrl, fileId}
// ---------------------------------------------------------------------------
function handleUploadReport(params) {
    if (!params.htmlContent || !params.fileName) {
        return jsonResponse({ success: false, message: "htmlContent et fileName requis" });
    }

    // Build folder path: JCSM/Rapports/YYYY/MM/
    var now = new Date();
    var year = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy");
    var month = Utilities.formatDate(now, Session.getScriptTimeZone(), "MM");

    var rootFolder = getOrCreateFolder(null, DRIVE_ROOT_FOLDER);
    var reportsFolder = getOrCreateFolder(rootFolder, DRIVE_REPORTS_FOLDER);
    var yearFolder = getOrCreateFolder(reportsFolder, year);
    var monthFolder = getOrCreateFolder(yearFolder, month);

    // Create HTML blob and convert to PDF via Drive
    var htmlBlob = Utilities.newBlob(params.htmlContent, 'text/html', params.fileName + '.html');

    // Create a temporary HTML file in Drive, then export as PDF
    var tempFile = monthFolder.createFile(htmlBlob);
    var pdfBlob = tempFile.getAs('application/pdf');
    pdfBlob.setName(params.fileName + '.pdf');

    // Save the PDF in the same folder
    var pdfFile = monthFolder.createFile(pdfBlob);

    // Remove the temporary HTML file
    tempFile.setTrashed(true);

    // Set PDF to viewable by anyone with the link
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var driveUrl = pdfFile.getUrl();
    var fileId = pdfFile.getId();

    return jsonResponse({ success: true, driveUrl: driveUrl, fileId: fileId });
}

// ---------------------------------------------------------------------------
// Default action (backwards compatibility)
// Receives {ticket, statut} - original doPost behavior
// ---------------------------------------------------------------------------
function handleDefaultPost(params) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
    const rowIndex = findRowByTicket(sheet, params.ticket);

    if (rowIndex < 0) {
        return jsonResponse({ success: false, message: "Ticket non trouvé" });
    }

    // Original behavior: mark as done, set reussi based on statut, mark rapport as done
    sheet.getRange(rowIndex, 16).setValue(true);                          // P: Fait
    sheet.getRange(rowIndex, 17).setValue(params.statut === 'resolu');    // Q: Réussi
    sheet.getRange(rowIndex, 18).setValue(true);                          // R: Rapport fait

    return jsonResponse({ success: true });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Find the spreadsheet row number (1-based) for a given ticket in column D (index 3).
 * Returns -1 if not found.
 */
function findRowByTicket(sheet, ticket) {
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
        if (data[i][3] == ticket) {
            return i + 1; // 1-based row number
        }
    }
    return -1;
}

/**
 * Get or create a subfolder inside a parent folder.
 * If parentFolder is null, searches in the root of My Drive.
 */
function getOrCreateFolder(parentFolder, folderName) {
    var folders;
    if (parentFolder) {
        folders = parentFolder.getFoldersByName(folderName);
    } else {
        folders = DriveApp.getRootFolder().getFoldersByName(folderName);
    }

    if (folders.hasNext()) {
        return folders.next();
    }

    if (parentFolder) {
        return parentFolder.createFolder(folderName);
    } else {
        return DriveApp.getRootFolder().createFolder(folderName);
    }
}

/**
 * Convenience wrapper for returning JSON responses.
 */
function jsonResponse(obj) {
    return ContentService.createTextOutput(JSON.stringify(obj))
        .setMimeType(ContentService.MimeType.JSON);
}
