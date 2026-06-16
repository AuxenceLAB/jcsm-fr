<?php
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// Charger PHPWord si disponible (via Composer)
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
}

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/auth.php';

// CORS restreint
$allowedOrigins = ['https://jcsm.fr', 'https://www.jcsm.fr'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Gérer les requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Vérifier que c'est une requête POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
    exit;
}

// Authentification requise
requireAuth();

// Rate limiting (20 rapports/min par IP)
if (!checkRateLimit('save_rapport', 20, 60)) {
    http_response_code(429);
    echo json_encode(['success' => false, 'error' => 'Trop de requêtes. Réessayez dans quelques secondes.']);
    exit;
}

// Limit input size (10 MB max)
$contentLength = isset($_SERVER['CONTENT_LENGTH']) ? (int) $_SERVER['CONTENT_LENGTH'] : 0;
if ($contentLength > 10 * 1024 * 1024) {
    http_response_code(413);
    echo json_encode(['success' => false, 'error' => 'Payload trop volumineux (max 10 MB)']);
    exit;
}

// Lire les données JSON
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Données JSON invalides']);
    exit;
}

// Valider le format de date d'intervention
if (isset($data['dateIntervention'])) {
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $data['dateIntervention'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Format de date invalide (attendu: YYYY-MM-DD)']);
        exit;
    }
    // Vérifier que c'est une date réelle (pas 2025-13-99)
    $dt = DateTime::createFromFormat('Y-m-d', $data['dateIntervention']);
    if (!$dt || $dt->format('Y-m-d') !== $data['dateIntervention']) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Date invalide']);
        exit;
    }
}

// Chemin du dossier public pour les rapports
$rapportsDir = dirname(dirname(__FILE__)) . '/rapports/';

// Créer le dossier s'il n'existe pas
if (!is_dir($rapportsDir)) {
    if (!mkdir($rapportsDir, 0755, true)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Impossible de créer le dossier de rapports']);
        exit;
    }
}

// Générer un nom de fichier unique
$ticket = isset($data['ticket']) ? preg_replace('/[^a-zA-Z0-9_-]/', '_', $data['ticket']) : 'RAPPORT';
$dateIntervention = isset($data['dateIntervention']) ? preg_replace('/[^0-9\-]/', '', $data['dateIntervention']) : date('Y-m-d');
$timestamp = date('Ymd_His');
$randomSuffix = bin2hex(random_bytes(16));
$filename = "Rapport_{$ticket}_{$dateIntervention}_{$timestamp}_{$randomSuffix}.json";

// Chemin complet du fichier
$filepath = $rapportsDir . $filename;

// Limit photos (anti-DoS: max 20 photos)
$inputPhotos = $data['photos'] ?? [];
if (is_array($inputPhotos) && count($inputPhotos) > 20) {
    $inputPhotos = array_slice($inputPhotos, 0, 20);
}

// Préparer les données à sauvegarder
$rapportData = [
    'ticket' => $data['ticket'] ?? '',
    'nomSite' => $data['nomSite'] ?? '',
    'adresse' => $data['adresse'] ?? '',
    'dateIntervention' => $data['dateIntervention'] ?? '',
    'heureArrivee' => $data['heureArrivee'] ?? '',
    'heureDepart' => $data['heureDepart'] ?? '',
    'probleme' => $data['probleme'] ?? '',
    'actionRealisee' => $data['actionRealisee'] ?? '',
    'statut' => $data['statut'] ?? '',
    'piecesChangees' => $data['piecesChangees'] ?? '',
    'remarques' => $data['remarques'] ?? '',
    'dateCreation' => date('Y-m-d H:i:s'),
    'interventionId' => $data['interventionId'] ?? '',
    'photos' => $inputPhotos,
    'signature' => $data['signature'] ?? null,
    // New optional fields
    'client' => $data['client'] ?? '',
    'marque' => $data['marque'] ?? '',
    'serialNumber' => $data['serialNumber'] ?? '',
    'commentaires' => $data['commentaires'] ?? '',
    'prochaines_etapes' => $data['prochaines_etapes'] ?? '',
    'a_faire' => $data['a_faire'] ?? '',
    'risques' => $data['risques'] ?? '',
    'duree' => $data['duree'] ?? '',
];

// Sauvegarder le fichier JSON
if (file_put_contents($filepath, json_encode($rapportData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
    // Générer HTML puis convertir en Word (.docx)
    $htmlPath = str_replace('.json', '.html', $filepath);
    $docxPath = str_replace('.json', '.docx', $filepath);

    // Générer le HTML
    $html = generateHTML($rapportData);
    file_put_contents($htmlPath, $html);

    // Convertir HTML en Word (.docx)
    $docxGenerated = generateDOCX($rapportData, $docxPath);

    // URLs publiques
    $encodedFilename = rawurlencode($filename);
    $baseUrl = 'https://jcsm.fr/rapports/';
    $reportUrl = $baseUrl . rawurlencode(str_replace('.json', '.html', $filename));

    // Envoi de l'email
    $to = 'contact@jcsm.fr';
    $subject = "Rapport d'intervention : {$rapportData['ticket']} - {$rapportData['nomSite']}";
    $subject = str_replace(["\r", "\n", "\t"], '', $subject);
    $message = "Un nouveau rapport d'intervention a été généré.\n\n";
    $message .= "Ticket : " . $rapportData['ticket'] . "\n";
    $message .= "Site : " . $rapportData['nomSite'] . "\n";
    $message .= "Date : " . $rapportData['dateIntervention'] . "\n";
    $message .= "Statut : " . $rapportData['statut'] . "\n\n";
    $message .= "Consulter le rapport en ligne : " . $reportUrl . "\n";

    $headers = 'From: noreply@jcsm.fr' . "\r\n" .
        'Reply-To: support@jcsm.fr' . "\r\n" .
        'X-Mailer: JCSM/1.0';

    // Tenter l'envoi
    mail($to, $subject, $message, $headers);

    $response = [
        'success' => true,
        'message' => 'Rapport sauvegardé avec succès',
        'filename' => $filename,
        'url' => $baseUrl . $encodedFilename,
        'files' => [
            'json' => $baseUrl . rawurlencode(str_replace('.json', '.json', $filename)),
            'html' => $reportUrl,
        ]
    ];

    if ($docxGenerated) {
        $docxFile = str_replace('.json', '.docx', $filename);
        $rtfFile = str_replace('.json', '.rtf', $filename);

        if (file_exists($rapportsDir . $docxFile)) {
            $response['files']['docx'] = $baseUrl . rawurlencode($docxFile);
        } elseif (file_exists($rapportsDir . $rtfFile)) {
            $response['files']['rtf'] = $baseUrl . rawurlencode($rtfFile);
            $response['files']['docx'] = $baseUrl . rawurlencode($rtfFile);
        }
    }

    // Google Drive upload + Sheets write-back (async, non-blocking)
    require_once __DIR__ . '/helpers.php';
    $sheetsUrl = loadEnvVar('GOOGLE_SHEETS_TERRAIN_URL');
    if ($sheetsUrl && !empty($rapportData['ticket'])) {
        // 1. Upload HTML to Drive as PDF
        $driveUrl = '';
        try {
            $uploadPayload = json_encode([
                'action' => 'uploadReport',
                'htmlContent' => $html,
                'fileName' => str_replace('.json', '', $filename)
            ]);
            $ch = curl_init($sheetsUrl);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => $uploadPayload,
                CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
                CURLOPT_TIMEOUT => 30,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_SSL_VERIFYPEER => true,
            ]);
            $driveResp = curl_exec($ch);
            curl_close($ch);
            $driveData = json_decode($driveResp, true);
            if (!empty($driveData['driveUrl'])) {
                $driveUrl = $driveData['driveUrl'];
                $response['driveUrl'] = $driveUrl;
                $response['driveFileId'] = $driveData['fileId'] ?? '';
            }
        } catch (Exception $e) {
            error_log('Drive upload failed: ' . $e->getMessage());
        }

        // 2. Update Sheets status (columns P, Q, R)
        try {
            $statusPayload = json_encode([
                'action' => 'updateStatus',
                'ticket' => $rapportData['ticket'],
                'fait' => true,
                'reussi' => ($rapportData['statut'] === 'resolu' || $rapportData['statut'] === 'Résolu'),
                'rapportUrl' => $driveUrl ?: $reportUrl
            ]);
            $ch = curl_init($sheetsUrl);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => $statusPayload,
                CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
                CURLOPT_TIMEOUT => 15,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_SSL_VERIFYPEER => true,
            ]);
            curl_exec($ch);
            curl_close($ch);
        } catch (Exception $e) {
            error_log('Sheets update failed: ' . $e->getMessage());
        }
    }

    echo json_encode($response);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erreur lors de l\'écriture du fichier']);
}

// Fonction pour générer le HTML
function generateHTML($data)
{
    $date = htmlspecialchars(date('d/m/Y', strtotime($data['dateIntervention'])));
    $logoPath = 'https://jcsm.fr/images/logo.png';

    // Calculate duration from heureArrivee and heureDepart if not provided
    $dureeDisplay = '';
    if (!empty($data['duree'])) {
        $dureeDisplay = htmlspecialchars($data['duree']);
    } elseif (!empty($data['heureArrivee']) && !empty($data['heureDepart'])) {
        $start = strtotime($data['heureArrivee']);
        $end = strtotime($data['heureDepart']);
        if ($start && $end && $end > $start) {
            $diff = $end - $start;
            $hours = floor($diff / 3600);
            $mins = floor(($diff % 3600) / 60);
            $dureeDisplay = ($hours > 0 ? $hours . 'h' : '') . str_pad($mins, 2, '0', STR_PAD_LEFT) . 'min';
        }
    }

    // Determine status display and color
    $statutRaw = $data['statut'] ?? '';
    $statutLower = mb_strtolower($statutRaw);
    $isResolved = in_array($statutLower, ['resolu', 'résolu', 'resolved']);
    $isFollowup = in_array($statutLower, ['suivi', 'a_suivre', 'à suivre', 'follow-up']);
    if ($isResolved) {
        $statutColor = '#059669';
        $statutBg = '#D1FAE5';
        $statutLabel = 'Résolu';
    } elseif ($isFollowup) {
        $statutColor = '#D97706';
        $statutBg = '#FEF3C7';
        $statutLabel = 'À suivre';
    } else {
        $statutColor = '#2D8CFF';
        $statutBg = '#DBEAFE';
        $statutLabel = htmlspecialchars($statutRaw ?: 'N/A');
    }

    // Build observations as bullet points (split on newlines)
    $obsRaw = $data['actionRealisee'] ?? '';
    $obsHtml = '';
    if (!empty($obsRaw)) {
        $lines = preg_split('/\r?\n/', trim($obsRaw));
        $filteredLines = array_filter($lines, function ($line) {
            $trimmed = trim($line);
            // Skip section headers like "DESCRIPTION :", "ACTIONS RÉALISÉES :", etc.
            return $trimmed !== '' && !preg_match('/^[A-ZÉÈÀÊÂ\s]+\s*:$/', $trimmed);
        });
        if (count($filteredLines) > 0) {
            $obsHtml = '<ul style="margin:0;padding-left:20px;list-style:disc">';
            foreach ($filteredLines as $line) {
                $trimmed = trim($line);
                // Remove leading bullet chars if present
                $trimmed = preg_replace('/^[\-\*\•\✅\⚙️\🔧\📋\🔌\⚡\🛠️\📷\✔️\❌\⚠️]+\s*/', '', $trimmed);
                if (!empty($trimmed)) {
                    $obsHtml .= '<li style="margin-bottom:4px;line-height:1.5">' . htmlspecialchars($trimmed) . '</li>';
                }
            }
            $obsHtml .= '</ul>';
        }
    }

    // Build commentaires section
    $commentairesHtml = '';
    if (!empty($data['commentaires'])) {
        $commentairesHtml = '<p style="margin:0;line-height:1.6">' . nl2br(htmlspecialchars($data['commentaires'])) . '</p>';
    }

    // Build prochaines_etapes section
    $etapesHtml = '';
    if (!empty($data['prochaines_etapes'])) {
        $etapesHtml = '<p style="margin:0;line-height:1.6">' . nl2br(htmlspecialchars($data['prochaines_etapes'])) . '</p>';
    }

    // Build a_faire as numbered list
    $aFaireHtml = '';
    if (!empty($data['a_faire'])) {
        $items = preg_split('/\r?\n/', trim($data['a_faire']));
        $items = array_filter($items, function ($l) { return trim($l) !== ''; });
        if (count($items) > 0) {
            $aFaireHtml = '<ol style="margin:0;padding-left:20px">';
            foreach ($items as $item) {
                $trimmed = trim($item);
                $trimmed = preg_replace('/^\d+[\.\)]\s*/', '', $trimmed);
                if (!empty($trimmed)) {
                    $aFaireHtml .= '<li style="margin-bottom:4px;line-height:1.5">' . htmlspecialchars($trimmed) . '</li>';
                }
            }
            $aFaireHtml .= '</ol>';
        }
    }

    // Build risques section
    $risquesHtml = '';
    if (!empty($data['risques'])) {
        $risquesHtml = '<p style="margin:0;line-height:1.6">' . nl2br(htmlspecialchars($data['risques'])) . '</p>';
    }

    // Photos
    $photosHtml = '';
    if (!empty($data['photos']) && is_array($data['photos'])) {
        $validPhotos = [];
        foreach ($data['photos'] as $photo) {
            if (is_string($photo) && preg_match('/^data:image\/(jpeg|png|gif|webp);base64,[A-Za-z0-9+\/=]+$/', $photo)) {
                $validPhotos[] = $photo;
            }
        }
        if (count($validPhotos) > 0) {
            $photosHtml .= '
    <div style="margin-bottom:0">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px">
            <tr>
                <td style="background-color:#1B365D;color:#ffffff;padding:10px 16px;font-size:14px;font-weight:700;letter-spacing:0.5px;border-radius:4px 4px 0 0">
                    PHOTOS
                </td>
            </tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #E5E7EB;border-radius:0 0 6px 6px">';
            $chunks = array_chunk($validPhotos, 2);
            foreach ($chunks as $pair) {
                $photosHtml .= '<tr>';
                foreach ($pair as $photo) {
                    $photosHtml .= '<td width="50%" style="padding:12px;text-align:center;vertical-align:top;border:1px solid #E5E7EB">
                        <img src="' . htmlspecialchars($photo, ENT_QUOTES, 'UTF-8') . '" alt="Photo intervention" style="max-width:100%;height:auto;max-height:280px;border-radius:4px">
                    </td>';
                }
                // Fill empty cell if odd number
                if (count($pair) === 1) {
                    $photosHtml .= '<td width="50%" style="padding:12px;border:1px solid #E5E7EB"></td>';
                }
                $photosHtml .= '</tr>';
            }
            $photosHtml .= '</table></div>';
        }
    }

    // Escape all user data
    $ticket = htmlspecialchars($data['ticket'] ?? '');
    $nomSite = htmlspecialchars($data['nomSite'] ?? '');
    $adresse = htmlspecialchars($data['adresse'] ?? '');
    $heureArrivee = htmlspecialchars($data['heureArrivee'] ?? '');
    $heureDepart = htmlspecialchars($data['heureDepart'] ?? '');
    $client = htmlspecialchars($data['client'] ?? '');
    $marque = htmlspecialchars($data['marque'] ?? '');
    $serialNumber = htmlspecialchars($data['serialNumber'] ?? '');
    $probleme = htmlspecialchars($data['probleme'] ?? '');
    $piecesChangees = htmlspecialchars($data['piecesChangees'] ?? '');
    $remarques = htmlspecialchars($data['remarques'] ?? '');
    $generatedDate = date('d/m/Y à H:i');

    // Build the fin/duree cell value
    $finDureeValue = $heureDepart;
    if (!empty($dureeDisplay)) {
        $finDureeValue .= (!empty($heureDepart) ? ' (' . $dureeDisplay . ')' : $dureeDisplay);
    }

    // Helper to generate a section block (only if content is non-empty)
    // We build optional sections as separate variables for clarity
    $sectionsHtml = '';

    // Section: Description du problème
    if (!empty($probleme)) {
        $sectionsHtml .= '
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px">
        <tr><td style="background-color:#1B365D;color:#ffffff;padding:10px 16px;font-size:14px;font-weight:700;letter-spacing:0.5px;border-radius:4px 4px 0 0">DESCRIPTION DU PROBLÈME</td></tr>
    </table>
    <div style="border:1px solid #E5E7EB;border-radius:0 0 6px 6px;padding:16px 20px;margin-top:-24px;margin-bottom:24px;background:#ffffff">
        <p style="margin:0;line-height:1.6">' . nl2br($probleme) . '</p>
    </div>';
    }

    // Section: Observations / Commentaires
    if (!empty($obsHtml) || !empty($commentairesHtml)) {
        $sectionsHtml .= '
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px">
        <tr><td style="background-color:#1B365D;color:#ffffff;padding:10px 16px;font-size:14px;font-weight:700;letter-spacing:0.5px;border-radius:4px 4px 0 0">OBSERVATIONS / COMMENTAIRES</td></tr>
    </table>
    <div style="border:1px solid #E5E7EB;border-radius:0 0 6px 6px;padding:16px 20px;margin-top:-24px;margin-bottom:24px;background:#ffffff">';
        if (!empty($obsHtml)) {
            $sectionsHtml .= $obsHtml;
        }
        if (!empty($commentairesHtml)) {
            if (!empty($obsHtml)) {
                $sectionsHtml .= '<hr style="border:none;border-top:1px solid #E5E7EB;margin:12px 0">';
            }
            $sectionsHtml .= $commentairesHtml;
        }
        $sectionsHtml .= '</div>';
    }

    // Section: Résultat / Statut (with pieces and remarks)
    $resultContent = '<p style="margin:0 0 8px"><strong>Statut :</strong> <span style="display:inline-block;padding:3px 12px;border-radius:9999px;font-weight:600;font-size:13px;color:' . $statutColor . ';background:' . $statutBg . '">' . $statutLabel . '</span></p>';
    if (!empty($piecesChangees)) {
        $resultContent .= '<p style="margin:8px 0 4px"><strong>Pièces changées :</strong></p><p style="margin:0;line-height:1.6">' . nl2br($piecesChangees) . '</p>';
    }
    if (!empty($remarques)) {
        $resultContent .= '<p style="margin:8px 0 4px"><strong>Remarques :</strong></p><p style="margin:0;line-height:1.6">' . nl2br($remarques) . '</p>';
    }
    $sectionsHtml .= '
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px">
        <tr><td style="background-color:#1B365D;color:#ffffff;padding:10px 16px;font-size:14px;font-weight:700;letter-spacing:0.5px;border-radius:4px 4px 0 0">RÉSULTAT</td></tr>
    </table>
    <div style="border:1px solid #E5E7EB;border-radius:0 0 6px 6px;padding:16px 20px;margin-top:-24px;margin-bottom:24px;background:#ffffff">
        ' . $resultContent . '
    </div>';

    // Section: Prochaines étapes
    if (!empty($etapesHtml)) {
        $sectionsHtml .= '
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px">
        <tr><td style="background-color:#1B365D;color:#ffffff;padding:10px 16px;font-size:14px;font-weight:700;letter-spacing:0.5px;border-radius:4px 4px 0 0">PROCHAINES ÉTAPES</td></tr>
    </table>
    <div style="border:1px solid #E5E7EB;border-radius:0 0 6px 6px;padding:16px 20px;margin-top:-24px;margin-bottom:24px;background:#ffffff">
        ' . $etapesHtml . '
    </div>';
    }

    // Section: À faire
    if (!empty($aFaireHtml)) {
        $sectionsHtml .= '
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px">
        <tr><td style="background-color:#1B365D;color:#ffffff;padding:10px 16px;font-size:14px;font-weight:700;letter-spacing:0.5px;border-radius:4px 4px 0 0">À FAIRE</td></tr>
    </table>
    <div style="border:1px solid #E5E7EB;border-radius:0 0 6px 6px;padding:16px 20px;margin-top:-24px;margin-bottom:24px;background:#ffffff">
        ' . $aFaireHtml . '
    </div>';
    }

    // Section: Risques identifiés
    if (!empty($risquesHtml)) {
        $sectionsHtml .= '
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px">
        <tr><td style="background-color:#DC2626;color:#ffffff;padding:10px 16px;font-size:14px;font-weight:700;letter-spacing:0.5px;border-radius:4px 4px 0 0">RISQUES IDENTIFIÉS</td></tr>
    </table>
    <div style="border:1px solid #FCA5A5;border-radius:0 0 6px 6px;padding:16px 20px;margin-top:-24px;margin-bottom:24px;background:#FEF2F2">
        ' . $risquesHtml . '
    </div>';
    }

    return '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport d\'Intervention - ' . $ticket . '</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #1F2937;
            line-height: 1.5;
            background-color: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .page {
            max-width: 800px;
            margin: 0 auto;
            padding: 0;
        }
        @media print {
            body { background: #fff; }
            .page { max-width: 100%; padding: 0; }
            .no-print { display: none; }
        }
        @media screen {
            body { background-color: #F3F4F6; padding: 24px; }
            .page { background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
        }
    </style>
</head>
<body>
<div class="page">

    <!-- HEADER -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background-color:#1B365D">
        <tr>
            <td style="padding:24px 32px;vertical-align:middle" width="50%">
                <img src="' . htmlspecialchars($logoPath) . '" alt="JCSM" style="height:48px;filter:brightness(0) invert(1)" onerror="this.style.display=\'none\'">
            </td>
            <td style="padding:24px 32px;text-align:right;vertical-align:middle" width="50%">
                <div style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px">Rapport d\'intervention</div>
                <div style="color:#93C5FD;font-size:13px;margin-top:4px">Généré le ' . $generatedDate . '</div>
            </td>
        </tr>
    </table>

    <!-- ACCENT BAR -->
    <div style="height:4px;background:linear-gradient(90deg, #2D8CFF 0%, #1B365D 100%)"></div>

    <!-- CONTENT AREA -->
    <div style="padding:32px">

    <!-- INFO GRID -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #E5E7EB;border-radius:6px;margin-bottom:28px;overflow:hidden">
        <tr>
            <td width="50%" style="padding:0;vertical-align:top;border-right:1px solid #E5E7EB">
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
                    <tr>
                        <td colspan="2" style="background-color:#F8FAFC;padding:10px 16px;font-size:12px;font-weight:700;color:#1B365D;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #E5E7EB">
                            Intervention
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:8px 16px;font-size:13px;font-weight:600;color:#6B7280;width:110px;border-bottom:1px solid #F3F4F6">Date</td>
                        <td style="padding:8px 16px;font-size:13px;color:#111827;border-bottom:1px solid #F3F4F6">' . $date . '</td>
                    </tr>
                    <tr>
                        <td style="padding:8px 16px;font-size:13px;font-weight:600;color:#6B7280;border-bottom:1px solid #F3F4F6">Début</td>
                        <td style="padding:8px 16px;font-size:13px;color:#111827;border-bottom:1px solid #F3F4F6">' . $heureArrivee . '</td>
                    </tr>
                    <tr>
                        <td style="padding:8px 16px;font-size:13px;font-weight:600;color:#6B7280;border-bottom:1px solid #F3F4F6">Fin / Durée</td>
                        <td style="padding:8px 16px;font-size:13px;color:#111827;border-bottom:1px solid #F3F4F6">' . $finDureeValue . '</td>
                    </tr>
                    <tr>
                        <td style="padding:8px 16px;font-size:13px;font-weight:600;color:#6B7280">Ticket</td>
                        <td style="padding:8px 16px;font-size:13px;color:#111827;font-weight:600">' . $ticket . '</td>
                    </tr>
                </table>
            </td>
            <td width="50%" style="padding:0;vertical-align:top">
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
                    <tr>
                        <td colspan="2" style="background-color:#F8FAFC;padding:10px 16px;font-size:12px;font-weight:700;color:#1B365D;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #E5E7EB">
                            Site
                        </td>
                    </tr>
                    ' . (!empty($client) ? '<tr>
                        <td style="padding:8px 16px;font-size:13px;font-weight:600;color:#6B7280;width:120px;border-bottom:1px solid #F3F4F6">Client</td>
                        <td style="padding:8px 16px;font-size:13px;color:#111827;border-bottom:1px solid #F3F4F6">' . $client . '</td>
                    </tr>' : '') . '
                    <tr>
                        <td style="padding:8px 16px;font-size:13px;font-weight:600;color:#6B7280;width:120px;border-bottom:1px solid #F3F4F6">Nom du site</td>
                        <td style="padding:8px 16px;font-size:13px;color:#111827;border-bottom:1px solid #F3F4F6">' . $nomSite . '</td>
                    </tr>
                    <tr>
                        <td style="padding:8px 16px;font-size:13px;font-weight:600;color:#6B7280;border-bottom:1px solid #F3F4F6">Adresse</td>
                        <td style="padding:8px 16px;font-size:13px;color:#111827;border-bottom:1px solid #F3F4F6">' . $adresse . '</td>
                    </tr>
                    ' . (!empty($marque) ? '<tr>
                        <td style="padding:8px 16px;font-size:13px;font-weight:600;color:#6B7280;border-bottom:1px solid #F3F4F6">Marque</td>
                        <td style="padding:8px 16px;font-size:13px;color:#111827;border-bottom:1px solid #F3F4F6">' . $marque . '</td>
                    </tr>' : '') . '
                    ' . (!empty($serialNumber) ? '<tr>
                        <td style="padding:8px 16px;font-size:13px;font-weight:600;color:#6B7280">Serial Number</td>
                        <td style="padding:8px 16px;font-size:13px;color:#111827;font-family:monospace">' . $serialNumber . '</td>
                    </tr>' : '') . '
                </table>
            </td>
        </tr>
    </table>

    <!-- DYNAMIC SECTIONS -->
    ' . $sectionsHtml . '

    <!-- PHOTOS -->
    ' . $photosHtml . '

    </div><!-- end content area -->

    <!-- FOOTER -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-top:2px solid #1B365D">
        <tr>
            <td style="background-color:#F8FAFC;padding:20px 32px;text-align:center">
                <div style="font-size:13px;font-weight:700;color:#1B365D;margin-bottom:4px">JCSM SAS - Infrastructure de Recharge</div>
                <div style="font-size:12px;color:#6B7280">
                    contact@jcsm.com &nbsp;&middot;&nbsp; +33 7 56 96 27 58 &nbsp;&middot;&nbsp; www.jcsm.fr
                </div>
            </td>
        </tr>
    </table>

</div><!-- end page -->
</body>
</html>';
}

// Fonction pour générer un document Word (.docx)
function generateDOCX($data, $outputPath)
{
    // Méthode 1 : Utiliser PHPWord (recommandé - nécessite installation via Composer)
    // Installation: composer require phpoffice/phpword
    if (class_exists('PhpOffice\PhpWord\PhpWord')) {
        try {
            $phpWord = new \PhpOffice\PhpWord\PhpWord();

            // Section principale
            $section = $phpWord->addSection([
                'marginTop' => 1440,    // 2.5 cm
                'marginBottom' => 1440,
                'marginLeft' => 1440,
                'marginRight' => 1440,
            ]);

            // Titre
            $section->addText('Rapport d\'Intervention', [
                'bold' => true,
                'size' => 18,
                'color' => '0070F3'
            ], ['alignment' => 'center']);
            $section->addTextBreak(2);

            // En-tête avec informations principales
            $section->addText('INFORMATIONS GÉNÉRALES', ['bold' => true, 'size' => 12], ['bgColor' => 'F3F4F6']);
            $section->addTextBreak(1);
            $section->addText('Ticket: ' . htmlspecialchars($data['ticket'] ?? 'N/A'), ['size' => 11]);
            $section->addText('Site: ' . htmlspecialchars($data['nomSite'] ?? ''), ['size' => 11]);
            $section->addText('Adresse: ' . htmlspecialchars($data['adresse'] ?? ''), ['size' => 11]);
            $section->addTextBreak(1);

            // Dates et heures
            $section->addText('DÉTAILS DE L\'INTERVENTION', ['bold' => true, 'size' => 12], ['bgColor' => 'F3F4F6']);
            $section->addTextBreak(1);
            $section->addText('Date d\'intervention: ' . htmlspecialchars($data['dateIntervention'] ?? ''), ['size' => 11]);
            $section->addText('Heure d\'arrivée: ' . htmlspecialchars($data['heureArrivee'] ?? ''), ['size' => 11]);
            $section->addText('Heure de départ: ' . htmlspecialchars($data['heureDepart'] ?? ''), ['size' => 11]);
            $section->addTextBreak(1);

            // Problème constaté
            $section->addText('PROBLÈME CONSTATÉ', ['bold' => true, 'size' => 12], ['bgColor' => 'F3F4F6']);
            $section->addTextBreak(1);
            $section->addText(htmlspecialchars($data['probleme'] ?? ''), ['size' => 11]);
            $section->addTextBreak(1);

            // Action réalisée
            $section->addText('ACTION RÉALISÉE', ['bold' => true, 'size' => 12], ['bgColor' => 'F3F4F6']);
            $section->addTextBreak(1);
            $section->addText(htmlspecialchars($data['actionRealisee'] ?? ''), ['size' => 11]);
            $section->addTextBreak(1);

            // Statut
            $section->addText('Statut: ' . htmlspecialchars($data['statut'] ?? ''), ['bold' => true, 'size' => 11]);
            $section->addTextBreak(1);

            // Pièces changées (si présent)
            if (!empty($data['piecesChangees'])) {
                $section->addText('PIÈCES CHANGÉES', ['bold' => true, 'size' => 12], ['bgColor' => 'F3F4F6']);
                $section->addTextBreak(1);
                $section->addText(htmlspecialchars($data['piecesChangees']), ['size' => 11]);
                $section->addTextBreak(1);
            }

            // Remarques (si présent)
            if (!empty($data['remarques'])) {
                $section->addText('REMARQUES', ['bold' => true, 'size' => 12], ['bgColor' => 'F3F4F6']);
                $section->addTextBreak(1);
                $section->addText(htmlspecialchars($data['remarques']), ['size' => 11]);
                $section->addTextBreak(1);
            }

            // Pied de page
            $section->addTextBreak(2);
            $section->addText('Rapport généré le ' . date('d/m/Y à H:i'), [
                'italic' => true,
                'size' => 9,
                'color' => '666666'
            ], ['alignment' => 'right']);

            // Sauvegarder
            $objWriter = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'Word2007');
            $objWriter->save($outputPath);
            return true;
        } catch (Exception $e) {
            error_log('Erreur PHPWord: ' . $e->getMessage());
            return false;
        }
    }

    // Méthode 2 : Conversion HTML vers DOCX via Pandoc (si installé sur le serveur)
    // Nécessite: sudo apt-get install pandoc (sur Linux)
    $htmlPath = str_replace('.docx', '.html', $outputPath);
    if (file_exists($htmlPath) && shell_exec('which pandoc')) {
        $command = sprintf(
            'pandoc %s -o %s -f html -t docx 2>&1',
            escapeshellarg($htmlPath),
            escapeshellarg($outputPath)
        );
        exec($command, $output, $returnCode);
        if ($returnCode === 0 && file_exists($outputPath)) {
            return true;
        }
    }

    // Méthode 3 : Génération manuelle d'un fichier RTF (format texte riche, lisible par Word)
    return generateRTF($data, $outputPath);
}

// Fonction de fallback : générer un RTF (lisible par Word, peut être ouvert et sauvegardé en .docx)
function generateRTF($data, $outputPath)
{
    // Générer un RTF qui sera lisible par Word
    // Word peut ouvrir les fichiers RTF et les convertir en DOCX
    $rtfPath = str_replace('.docx', '.rtf', $outputPath);

    $rtf = "{\\rtf1\\ansi\\ansicpg1252\\deff0\\nouicompat\\deflang1036\n";
    $rtf .= "{\\fonttbl{\\f0\\fnil\\fcharset0 Times New Roman;}}\n";
    $rtf .= "{\\colortbl ;\\red0\\green112\\blue243;\\red102\\green102\\blue102;}\n";
    $rtf .= "{\\*\\generator Rapport JCSM}\\viewkind4\\uc1\n";
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\f0\\fs22\\lang12\\par\n";

    // Titre centré
    $rtf .= "\\pard\\qc\\b\\fs36\\cf1 Rapport d'Intervention\\par\n";
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22\\par\n";

    // Informations générales
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\b\\fs24 INFORMATIONS GÉNÉRALES\\par\n";
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22\\par\n";
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22 Ticket: " . addslashes($data['ticket'] ?? 'N/A') . "\\par\n";
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22 Site: " . addslashes($data['nomSite'] ?? '') . "\\par\n";
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22 Adresse: " . addslashes($data['adresse'] ?? '') . "\\par\n";
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22\\par\n";

    // Détails
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\b\\fs24 DÉTAILS DE L'INTERVENTION\\par\n";
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22\\par\n";
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22 Date d'intervention: " . addslashes($data['dateIntervention'] ?? '') . "\\par\n";
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22 Heure d'arrivée: " . addslashes($data['heureArrivee'] ?? '') . "\\par\n";
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22 Heure de départ: " . addslashes($data['heureDepart'] ?? '') . "\\par\n";
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22\\par\n";

    // Problème
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\b\\fs24 PROBLÈME CONSTATÉ\\par\n";
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22\\par\n";
    $probleme = str_replace(["\r\n", "\n", "\r"], "\\par\n", addslashes($data['probleme'] ?? ''));
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22 " . $probleme . "\\par\n";
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22\\par\n";

    // Action
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\b\\fs24 ACTION RÉALISÉE\\par\n";
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22\\par\n";
    $action = str_replace(["\r\n", "\n", "\r"], "\\par\n", addslashes($data['actionRealisee'] ?? ''));
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22 " . $action . "\\par\n";
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22\\par\n";

    // Statut
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\b\\fs22 Statut: " . addslashes($data['statut'] ?? '') . "\\par\n";
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22\\par\n";

    if (!empty($data['piecesChangees'])) {
        $rtf .= "\\pard\\sa200\\sl276\\slmult1\\b\\fs24 PIÈCES CHANGÉES\\par\n";
        $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22\\par\n";
        $pieces = str_replace(["\r\n", "\n", "\r"], "\\par\n", addslashes($data['piecesChangees']));
        $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22 " . $pieces . "\\par\n";
        $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22\\par\n";
    }

    if (!empty($data['remarques'])) {
        $rtf .= "\\pard\\sa200\\sl276\\slmult1\\b\\fs24 REMARQUES\\par\n";
        $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22\\par\n";
        $remarques = str_replace(["\r\n", "\n", "\r"], "\\par\n", addslashes($data['remarques']));
        $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22 " . $remarques . "\\par\n";
    }

    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22\\par\n";
    $rtf .= "\\pard\\qr\\i\\fs18\\cf2 Rapport généré le " . date('d/m/Y à H:i') . "\\par\n";
    $rtf .= "}";

    if (file_put_contents($rtfPath, $rtf)) {
        // Le fichier RTF est créé, Word peut l'ouvrir et le convertir en DOCX
        // On retourne true même si c'est un RTF car Word peut l'ouvrir
        return true;
    }

    return false;
}

