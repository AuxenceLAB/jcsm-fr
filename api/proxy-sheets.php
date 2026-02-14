<?php
/**
 * JCSM - Proxy API Google Sheets
 * Ce proxy masque l'URL réelle de l'API côté serveur
 * et ajoute une couche de sécurité (rate limiting, CORS)
 */
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// Configuration CORS
header('Content-Type: application/json; charset=utf-8');

$allowedOrigins = ['https://jcsm.fr', 'https://www.jcsm.fr'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400');

// Préflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/helpers.php';
requireAuth();

$GOOGLE_SHEETS_URLS = [
    'admin' => loadEnvVar('GOOGLE_SHEETS_ADMIN_URL'),
    'terrain' => loadEnvVar('GOOGLE_SHEETS_TERRAIN_URL')
];

if (!$GOOGLE_SHEETS_URLS['admin'] || !$GOOGLE_SHEETS_URLS['terrain']) {
    http_response_code(500);
    echo json_encode(['error' => 'Configuration Google Sheets incomplète']);
    exit;
}

// Déterminer quelle URL utiliser (par défaut: terrain, whitelist stricte)
$context = $_GET['context'] ?? 'terrain';
if (!in_array($context, ['admin', 'terrain'], true)) {
    $context = 'terrain';
}
$GOOGLE_SHEETS_URL = $GOOGLE_SHEETS_URLS[$context];

// Rate limiting par IP (100 req/min)
if (!checkRateLimit('sheets', 100, 60)) {
    http_response_code(429);
    echo json_encode(['error' => 'Trop de requêtes. Réessayez dans quelques secondes.']);
    exit;
}

// Effectuer la requête vers Google Sheets
try {
    $ch = curl_init();

    // Construire l'URL avec les paramètres GET autorisés uniquement
    $allowedParams = ['action', 'region', 'id', 'sheet'];
    $params = array_intersect_key($_GET, array_flip($allowedParams));
    $url = $GOOGLE_SHEETS_URL;
    if (!empty($params)) {
        $url .= '?' . http_build_query($params);
    }

    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 3,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_HTTPHEADER => ['Accept: application/json']
    ]);

    // Si POST, transférer le body
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $postData = file_get_contents('php://input');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Accept: application/json',
            'Content-Type: application/json'
        ]);
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);

    curl_close($ch);

    if ($error) {
        throw new Exception('Erreur de connexion: ' . $error);
    }

    // Retourner la réponse avec le bon code HTTP
    http_response_code($httpCode ?: 200);
    echo $response;

} catch (Exception $e) {
    http_response_code(500);
    error_log('Proxy-sheets exception: ' . $e->getMessage());
    echo json_encode([
        'error' => 'Erreur serveur'
    ]);
}
