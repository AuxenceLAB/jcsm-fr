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
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 86400');

// Préflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// URL réelle de l'API Google Sheets
// Deux URLs différentes selon le contexte (admin vs terrain)
$GOOGLE_SHEETS_URLS = [
    'admin' => 'https://script.google.com/macros/s/AKfycbzZxvFsy4yb1gsAdL70zhhMJCdZN-fGUZY4qHct3wMergx6hNX2qTOB0nH86ohBgEjmqA/exec',
    'terrain' => 'https://script.google.com/macros/s/AKfycbw7fOwNestEOFzvpiYmQYOEaTfmYNQLJuAOSJ_FAJgC3ScUC-aTS8jUFMEcg-n41UhCNw/exec'
];

// Déterminer quelle URL utiliser (par défaut: terrain)
$context = $_GET['context'] ?? 'terrain';
$GOOGLE_SHEETS_URL = $GOOGLE_SHEETS_URLS[$context] ?? $GOOGLE_SHEETS_URLS['terrain'];

// Rate limiting par IP (fichier temp)
$rateLimit = 100; // requêtes par minute
$ratePeriod = 60; // secondes
$rateLimitDir = sys_get_temp_dir() . '/jcsm_rate/';
if (!is_dir($rateLimitDir)) {
    @mkdir($rateLimitDir, 0755, true);
}

$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateLimitFile = $rateLimitDir . md5($ip) . '.json';

$rateData = null;
if (file_exists($rateLimitFile)) {
    $rateData = json_decode(file_get_contents($rateLimitFile), true);
}

if ($rateData && time() - $rateData['start'] < $ratePeriod) {
    $rateData['count']++;
} else {
    $rateData = ['count' => 1, 'start' => time()];
}
file_put_contents($rateLimitFile, json_encode($rateData));

if ($rateData['count'] > $rateLimit) {
    http_response_code(429);
    echo json_encode(['error' => 'Trop de requêtes. Réessayez dans quelques secondes.']);
    exit;
}

// Effectuer la requête vers Google Sheets
try {
    $ch = curl_init();

    // Construire l'URL avec les paramètres GET (sauf 'context')
    $params = $_GET;
    unset($params['context']);
    $url = $GOOGLE_SHEETS_URL;
    if (!empty($params)) {
        $url .= '?' . http_build_query($params);
    }

    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_SSL_VERIFYPEER => true,
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
    echo json_encode([
        'error' => 'Erreur serveur',
        'message' => $e->getMessage()
    ]);
}
