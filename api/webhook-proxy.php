<?php
/**
 * JCSM Webhook Proxy
 * Reçoit les requêtes côté client et les transmet aux URLs n8n côté serveur.
 * Les URLs n8n ne sont jamais exposées au frontend.
 */
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/auth.php';

// CORS restreint
$allowedOrigins = ['https://jcsm.fr', 'https://www.jcsm.fr'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
    exit;
}

// Authentification requise
requireAuth();

// URLs n8n (côté serveur uniquement)
$webhookUrls = [
    'rapport'      => 'https://n8n.jcsm.fr/webhook/rapport',
    'paiement'     => 'https://n8n.jcsm.fr/webhook/paiement',
    'sms'          => 'https://n8n.jcsm.fr/webhook/sms',
    'notification' => 'https://n8n.jcsm.fr/webhook/notification',
];

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Données JSON invalides']);
    exit;
}

$type = $input['type'] ?? '';
if (!isset($webhookUrls[$type])) {
    http_response_code(400);
    echo json_encode(['error' => 'Type de webhook inconnu: ' . htmlspecialchars($type)]);
    exit;
}

// Transmettre le payload (sans le champ "type") vers l'URL n8n
$payload = $input;
unset($payload['type']);

try {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL            => $webhookUrls[$type],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($payload),
        CURLOPT_TIMEOUT        => 30,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'Accept: application/json',
        ],
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($error) {
        error_log('Webhook curl error: ' . $error);
        throw new Exception('Erreur de connexion webhook');
    }

    http_response_code($httpCode ?: 200);
    echo $response;

} catch (Exception $e) {
    http_response_code(500);
    error_log('Webhook exception: ' . $e->getMessage());
    echo json_encode(['error' => 'Erreur webhook']);
}
