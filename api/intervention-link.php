<?php
/**
 * JCSM Intervention Link API
 * Genere et valide des tokens HMAC pour liens d'intervention.
 * Permet aux techniciens de soumettre des rapports via un lien unique.
 *
 * GET ?action=generate&id=XXX&phone=+33... (auth JCSM requise)
 * GET ?action=validate&token=XXX&id=XXX&phone=XXX&expires=XXX (pas d'auth, token suffit)
 * POST action=submit (pas d'auth JCSM, token dans le body)
 */
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/helpers.php';

// CORS ouvert pour la page rapport-intervention.html
$allowedOrigins = ['https://jcsm.fr', 'https://www.jcsm.fr'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$action = $_GET['action'] ?? ($_SERVER['REQUEST_METHOD'] === 'POST' ? 'submit' : '');

// ============================
// ACTION: generate (auth requise)
// ============================
if ($action === 'generate' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    require_once __DIR__ . '/auth.php';
    requireAuth();

    $interventionId = trim($_GET['id'] ?? '');
    $phone          = trim($_GET['phone'] ?? '');

    if (!$interventionId || !$phone) {
        http_response_code(400);
        echo json_encode(['error' => 'id et phone requis']);
        exit;
    }

    // Normaliser le telephone
    if (preg_match('/^0[67]/', $phone)) {
        $phone = '+33' . substr($phone, 1);
    }
    $phone = preg_replace('/[\s\-\.]/', '', $phone);

    try {
        $tokenData = generateInterventionToken($interventionId, $phone);
    } catch (\RuntimeException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur generation token']);
        exit;
    }

    $link = 'https://jcsm.fr/rapport-intervention?id=' . urlencode($interventionId)
        . '&phone=' . urlencode($phone)
        . '&token=' . urlencode($tokenData['token'])
        . '&expires=' . $tokenData['expires'];

    echo json_encode([
        'success' => true,
        'link'    => $link,
        'token'   => $tokenData['token'],
        'expires' => $tokenData['expires']
    ]);
    exit;
}

// ============================
// ACTION: validate (pas d'auth JCSM)
// ============================
if ($action === 'validate' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    // Rate limiting: 10 validations per minute per IP
    if (!checkRateLimit('intv_validate_' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 10, 60)) {
        http_response_code(429);
        echo json_encode(['error' => 'Trop de requêtes']);
        exit;
    }

    $token   = $_GET['token'] ?? '';
    $id      = $_GET['id'] ?? '';
    $phone   = $_GET['phone'] ?? '';
    $expires = intval($_GET['expires'] ?? 0);

    if (!$token || !$id || !$phone || !$expires) {
        http_response_code(400);
        echo json_encode(['error' => 'Parametres manquants']);
        exit;
    }

    if (!validateInterventionToken($token, $id, $phone, $expires)) {
        http_response_code(403);
        echo json_encode(['error' => 'Lien invalide ou expire']);
        exit;
    }

    // Charger les donnees d'intervention depuis le fichier local
    $interventionsFile = __DIR__ . '/interventions.json';
    $intervention = null;

    if (file_exists($interventionsFile)) {
        $data = json_decode(file_get_contents($interventionsFile), true);
        if (is_array($data)) {
            foreach ($data as $intv) {
                if (($intv['id'] ?? '') === $id || ($intv['ticket'] ?? '') === $id) {
                    $intervention = $intv;
                    break;
                }
            }
        }
    }

    if (!$intervention) {
        http_response_code(404);
        echo json_encode(['error' => 'Intervention non trouvee']);
        exit;
    }

    // Retourner les donnees (sans infos sensibles)
    echo json_encode([
        'success'      => true,
        'intervention' => [
            'id'          => $intervention['id'] ?? $id,
            'ticket'      => $intervention['ticket'] ?? '',
            'site'        => $intervention['nomSite'] ?? $intervention['site'] ?? '',
            'address'     => $intervention['adresse'] ?? $intervention['address'] ?? '',
            'problem'     => $intervention['descriptionProbleme'] ?? $intervention['problem'] ?? '',
            'brand'       => $intervention['marque'] ?? $intervention['brand'] ?? '',
            'deadline'    => $intervention['delais'] ?? $intervention['deadline'] ?? '',
            'date'        => $intervention['dateProposee'] ?? $intervention['date'] ?? '',
            'client'      => $intervention['demandeur'] ?? $intervention['client'] ?? '',
            'dept'        => $intervention['dept'] ?? '',
            'techAssigned' => $intervention['techAssigned'] ?? ''
        ]
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// ============================
// ACTION: submit (pas d'auth JCSM, token dans le body)
// ============================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Limit payload size (10 MB max)
    $contentLength = isset($_SERVER['CONTENT_LENGTH']) ? (int) $_SERVER['CONTENT_LENGTH'] : 0;
    if ($contentLength > 10 * 1024 * 1024) {
        http_response_code(413);
        echo json_encode(['error' => 'Payload trop volumineux']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !is_array($input)) {
        http_response_code(400);
        echo json_encode(['error' => 'Donnees JSON invalides']);
        exit;
    }

    // Valider le token
    $token   = $input['token'] ?? '';
    $id      = $input['interventionId'] ?? '';
    $phone   = $input['phone'] ?? '';
    $expires = intval($input['expires'] ?? 0);

    if (!$token || !$id || !$phone || !$expires) {
        http_response_code(400);
        echo json_encode(['error' => 'Token et identifiants requis']);
        exit;
    }

    if (!validateInterventionToken($token, $id, $phone, $expires)) {
        http_response_code(403);
        echo json_encode(['error' => 'Lien invalide ou expire']);
        exit;
    }

    // Rate limiting
    if (!checkRateLimit('intv_submit', 10, 60)) {
        http_response_code(429);
        echo json_encode(['error' => 'Trop de soumissions']);
        exit;
    }

    // Valider les champs du rapport
    $dateIntv = $input['dateIntervention'] ?? '';
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateIntv)) {
        http_response_code(400);
        echo json_encode(['error' => 'Format de date invalide (YYYY-MM-DD)']);
        exit;
    }

    // Limit number of photos (anti-DoS)
    $photos = $input['photos'] ?? [];
    if (is_array($photos) && count($photos) > 20) {
        $photos = array_slice($photos, 0, 20);
    }

    // Construire le payload pour save-rapport.php
    $rapportPayload = [
        'ticket'            => $input['ticket'] ?? '',
        'interventionId'    => $id,
        'nomSite'           => $input['nomSite'] ?? '',
        'adresse'           => $input['adresse'] ?? '',
        'dateIntervention'  => $dateIntv,
        'heureArrivee'      => $input['heureArrivee'] ?? '',
        'heureDepart'       => $input['heureDepart'] ?? '',
        'probleme'          => $input['probleme'] ?? '',
        'actionRealisee'    => $input['actionRealisee'] ?? '',
        'statut'            => $input['statut'] ?? 'resolu',
        'piecesChangees'    => $input['piecesChangees'] ?? '',
        'remarques'         => $input['remarques'] ?? '',
        'client'            => $input['client'] ?? '',
        'marque'            => $input['marque'] ?? '',
        'duree'             => $input['duree'] ?? '',
        'photos'            => $input['photos'] ?? [],
        'signature'         => null,
        'source'            => 'lien_technicien'
    ];

    // Sauvegarder le rapport (reutiliser la logique de save-rapport.php)
    $rapportsDir = __DIR__ . '/../rapports/';
    if (!is_dir($rapportsDir)) {
        @mkdir($rapportsDir, 0775, true);
    }

    $ticket   = preg_replace('/[^a-zA-Z0-9_\-]/', '', $rapportPayload['ticket'] ?: 'NOID');
    $datePart = str_replace('-', '', $dateIntv);
    $suffix   = bin2hex(random_bytes(16));
    $baseName = "Rapport_{$ticket}_{$datePart}_{$suffix}";

    // Sauvegarder le JSON
    $jsonPath = $rapportsDir . $baseName . '.json';
    file_put_contents($jsonPath, json_encode($rapportPayload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    // Generer le HTML du rapport
    $html = generateReportHtml($rapportPayload);
    $htmlPath = $rapportsDir . $baseName . '.html';
    file_put_contents($htmlPath, $html);

    echo json_encode([
        'success'  => true,
        'filename' => $baseName,
        'files'    => [
            'json' => '/rapports/' . $baseName . '.json',
            'html' => '/rapports/' . $baseName . '.html'
        ]
    ]);
    exit;
}

http_response_code(400);
echo json_encode(['error' => 'Action non reconnue']);

// ============================
// Helper: Generer le HTML du rapport
// ============================
function generateReportHtml(array $data): string
{
    $esc = function ($v) { return htmlspecialchars($v ?? '', ENT_QUOTES, 'UTF-8'); };

    $photosHtml = '';
    $photos = $data['photos'] ?? [];
    if (!empty($photos)) {
        $photosHtml = '<h2 style="color:#2563EB;border-bottom:2px solid #2563EB;padding-bottom:8px">Photos</h2>';
        $photosHtml .= '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">';
        foreach ($photos as $i => $photo) {
            if (!is_string($photo)) continue;
            if (!preg_match('/^data:image\/(jpeg|png|gif|webp);base64,[A-Za-z0-9+\/=]+$/', $photo)) {
                continue; // skip invalid/dangerous photo data (SVG, JS injection, etc.)
            }
            $photosHtml .= '<img src="' . htmlspecialchars($photo, ENT_QUOTES, 'UTF-8') . '" style="width:100%;border-radius:8px;border:1px solid #e5e7eb" alt="Photo ' . ($i + 1) . '">';
        }
        $photosHtml .= '</div>';
    }

    return '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport ' . $esc($data['ticket'] ?? '') . '</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 24px; color: #1f2937; line-height: 1.6; }
        .header { background: linear-gradient(135deg, #2563EB, #1D4ED8); color: #fff; padding: 24px; border-radius: 12px; margin-bottom: 24px; }
        .header h1 { margin: 0 0 8px; font-size: 22px; }
        .header p { margin: 4px 0; opacity: .9; font-size: 14px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
        .field { background: #f9fafb; padding: 12px 16px; border-radius: 8px; border: 1px solid #e5e7eb; }
        .field label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; font-weight: 700; display: block; margin-bottom: 4px; }
        .field span { font-size: 14px; font-weight: 600; color: #1f2937; }
        .section { margin-bottom: 24px; }
        .section h2 { color: #2563EB; font-size: 16px; border-bottom: 2px solid #2563EB; padding-bottom: 8px; }
        .section p { background: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; white-space: pre-wrap; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
        .badge-ok { background: #dcfce7; color: #166534; }
        .badge-pending { background: #fef3c7; color: #92400e; }
        .footer { text-align: center; padding: 16px; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; margin-top: 32px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Rapport d\'intervention</h1>
        <p>Ticket : ' . $esc($data['ticket'] ?? '') . '</p>
        <p>Date : ' . $esc($data['dateIntervention'] ?? '') . '</p>
        <p>Source : Lien technicien</p>
    </div>

    <div class="grid">
        <div class="field"><label>Site</label><span>' . $esc($data['nomSite'] ?? '') . '</span></div>
        <div class="field"><label>Adresse</label><span>' . $esc($data['adresse'] ?? '') . '</span></div>
        <div class="field"><label>Client</label><span>' . $esc($data['client'] ?? '') . '</span></div>
        <div class="field"><label>Marque</label><span>' . $esc($data['marque'] ?? '') . '</span></div>
        <div class="field"><label>Heure arrivee</label><span>' . $esc($data['heureArrivee'] ?? '') . '</span></div>
        <div class="field"><label>Heure depart</label><span>' . $esc($data['heureDepart'] ?? '') . '</span></div>
        <div class="field"><label>Duree</label><span>' . $esc($data['duree'] ?? '') . '</span></div>
        <div class="field"><label>Statut</label><span class="badge ' . (($data['statut'] ?? '') === 'resolu' ? 'badge-ok' : 'badge-pending') . '">' . $esc($data['statut'] ?? '') . '</span></div>
    </div>

    <div class="section">
        <h2>Probleme signale</h2>
        <p>' . $esc($data['probleme'] ?? '-') . '</p>
    </div>

    <div class="section">
        <h2>Actions realisees / Observations</h2>
        <p>' . $esc($data['actionRealisee'] ?? '-') . '</p>
    </div>

    ' . (($data['piecesChangees'] ?? '') ? '<div class="section"><h2>Pieces changees</h2><p>' . $esc($data['piecesChangees']) . '</p></div>' : '') . '
    ' . (($data['remarques'] ?? '') ? '<div class="section"><h2>Remarques</h2><p>' . $esc($data['remarques']) . '</p></div>' : '') . '

    ' . $photosHtml . '

    <div class="footer">
        JCSM - Infrastructure de Recharge | Rapport genere automatiquement | ' . date('d/m/Y H:i') . '
    </div>
</body>
</html>';
}
