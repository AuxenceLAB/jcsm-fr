<?php
/**
 * JCSM Twilio Proxy
 * Envoie des SMS ou messages WhatsApp via l'API REST Twilio.
 * Utilise MessagingServiceSid pour le routage automatique.
 * Les credentials Twilio ne sont jamais exposés au frontend.
 */
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/helpers.php';

// CORS restreint
$allowedOrigins = ['https://jcsm.fr', 'https://www.jcsm.fr'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
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

// Rate limiting (30 req/min par IP)
if (!checkRateLimit('twilio', 30, 60)) {
    http_response_code(429);
    echo json_encode(['error' => 'Trop de requêtes SMS. Réessayez dans quelques secondes.']);
    exit;
}

// Charger les credentials Twilio depuis .env
$accountSid        = loadEnvVar('TWILIO_ACCOUNT_SID');
$authToken         = loadEnvVar('TWILIO_AUTH_TOKEN');
$messagingService  = loadEnvVar('TWILIO_MESSAGING_SERVICE_SID');

if (!$accountSid || !$authToken || !$messagingService) {
    http_response_code(500);
    error_log('Missing Twilio credentials in .env');
    echo json_encode(['error' => 'Configuration Twilio incomplète']);
    exit;
}

// Parse input
$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !is_array($input)) {
    http_response_code(400);
    echo json_encode(['error' => 'Données JSON invalides']);
    exit;
}

$to      = trim($input['to'] ?? '');
$message = trim($input['message'] ?? '');
$channel = $input['channel'] ?? 'sms'; // 'sms' ou 'whatsapp'

// Validation
if (empty($to)) {
    http_response_code(400);
    echo json_encode(['error' => 'Numéro de téléphone requis']);
    exit;
}
if (empty($message)) {
    http_response_code(400);
    echo json_encode(['error' => 'Message requis']);
    exit;
}
if (!in_array($channel, ['sms', 'whatsapp'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Canal invalide (sms ou whatsapp)']);
    exit;
}

// Normaliser les numéros FR : 06/07 → +336/+337
if (preg_match('/^0[67]/', $to)) {
    $to = '+33' . substr($to, 1);
}
// Normaliser : retirer espaces/tirets/points
$to = preg_replace('/[\s\-\.]/', '', $to);

// Valider format E.164
if (!preg_match('/^\+[1-9]\d{6,14}$/', $to)) {
    http_response_code(400);
    echo json_encode(['error' => 'Format de numéro invalide. Utilisez +33... ou 06/07...']);
    exit;
}

// Préparer le destinataire (WhatsApp ajoute le préfixe)
$toFormatted = ($channel === 'whatsapp') ? 'whatsapp:' . $to : $to;

// Limiter la taille du message (1600 pour SMS, 4096 pour WhatsApp)
$maxLen = ($channel === 'whatsapp') ? 4096 : 1600;
if (mb_strlen($message) > $maxLen) {
    $message = mb_substr($message, 0, $maxLen - 3) . '...';
}

// Appel API Twilio avec MessagingServiceSid
try {
    $url = "https://api.twilio.com/2010-04-01/Accounts/{$accountSid}/Messages.json";

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL            => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_USERPWD        => "{$accountSid}:{$authToken}",
        CURLOPT_POSTFIELDS     => http_build_query([
            'To'                  => $toFormatted,
            'MessagingServiceSid' => $messagingService,
            'Body'                => $message,
        ]),
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error    = curl_error($ch);
    curl_close($ch);

    if ($error) {
        error_log('Twilio curl error: ' . $error);
        throw new Exception('Erreur de connexion Twilio');
    }

    $data = json_decode($response, true);

    if ($httpCode >= 200 && $httpCode < 300) {
        // Stocker le message sortant dans la conversation
        storeConversationMessage($to, [
            'id'        => $data['sid'] ?? ('msg-' . bin2hex(random_bytes(8))),
            'direction' => 'outgoing',
            'body'      => $message,
            'timestamp' => date('c'),
            'sid'       => $data['sid'] ?? '',
            'techName'  => $input['technicien'] ?? 'Admin',
            'channel'   => $channel
        ]);

        echo json_encode([
            'success' => true,
            'sid'     => $data['sid'] ?? '',
            'status'  => $data['status'] ?? 'sent',
            'channel' => $channel
        ]);
    } else {
        $twilioError = $data['message'] ?? 'Erreur inconnue';
        error_log("Twilio HTTP {$httpCode}: {$twilioError}");
        http_response_code(502);
        echo json_encode([
            'error'   => 'Erreur envoi ' . ($channel === 'whatsapp' ? 'WhatsApp' : 'SMS'),
            'detail'  => $twilioError
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    error_log('Twilio exception: ' . $e->getMessage());
    echo json_encode(['error' => 'Erreur service SMS']);
}
