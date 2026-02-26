<?php
/**
 * JCSM Twilio Voice Token Generator
 * Genere un JWT (Twilio Access Token) avec Voice Grant
 * pour les appels navigateur via Twilio Client SDK.
 */
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/helpers.php';

// CORS
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
    echo json_encode(['error' => 'Methode non autorisee']);
    exit;
}

// Auth requise
$authPayload = requireAuth();

// Rate limiting (10 tokens/min)
if (!checkRateLimit('voice_token', 10, 60)) {
    http_response_code(429);
    echo json_encode(['error' => 'Trop de requetes token']);
    exit;
}

// Charger credentials Twilio Voice
$accountSid   = loadEnvVar('TWILIO_ACCOUNT_SID');
$apiKeySid    = loadEnvVar('TWILIO_API_KEY_SID');
$apiKeySecret = loadEnvVar('TWILIO_API_KEY_SECRET');
$twimlAppSid  = loadEnvVar('TWILIO_TWIML_APP_SID');

if (!$accountSid || !$apiKeySid || !$apiKeySecret || !$twimlAppSid) {
    http_response_code(500);
    error_log('Missing Twilio Voice credentials in .env');
    echo json_encode(['error' => 'Configuration Twilio Voice incomplete']);
    exit;
}

// Identite depuis auth payload
$role = $authPayload['role'] ?? 'unknown';
$identity = strtolower(preg_replace('/[^a-zA-Z0-9_]/', '', $role)) . '_' . time();

// Generer JWT manuellement (pas de SDK)
$now = time();
$ttl = 3600; // 1 heure

$header = json_encode([
    'typ' => 'JWT',
    'alg' => 'HS256',
    'cty' => 'twilio-fpa;v=1'
]);

$payload = json_encode([
    'jti' => $apiKeySid . '-' . $now . '-' . bin2hex(random_bytes(8)),
    'iss' => $apiKeySid,
    'sub' => $accountSid,
    'iat' => $now,
    'exp' => $now + $ttl,
    'grants' => [
        'identity' => $identity,
        'voice' => [
            'outgoing' => [
                'application_sid' => $twimlAppSid
            ]
        ]
    ]
]);

$headerB64  = base64urlEncode($header);
$payloadB64 = base64urlEncode($payload);
$signature  = base64urlEncode(
    hash_hmac('sha256', $headerB64 . '.' . $payloadB64, $apiKeySecret, true)
);

$jwt = $headerB64 . '.' . $payloadB64 . '.' . $signature;

echo json_encode([
    'token'    => $jwt,
    'identity' => $identity,
    'expires'  => $now + $ttl
]);
