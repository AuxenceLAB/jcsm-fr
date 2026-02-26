<?php
/**
 * JCSM Incoming SMS Webhook
 * Recoit les SMS entrants de Twilio, valide la signature, stocke dans fichier conversation.
 * Pas d'auth JCSM requise (appele par serveurs Twilio).
 */
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

require_once __DIR__ . '/helpers.php';

// Doit repondre en TwiML (sinon Twilio retry)
header('Content-Type: text/xml; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';
    exit;
}

// Valider la signature Twilio
$authToken = loadEnvVar('TWILIO_AUTH_TOKEN');
if (!$authToken) {
    error_log('Missing TWILIO_AUTH_TOKEN for incoming SMS validation');
    echo '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';
    exit;
}

$url = 'https://jcsm.fr' . $_SERVER['REQUEST_URI'];
if (!validateTwilioSignature($authToken, $url, $_POST)) {
    error_log('Invalid Twilio signature on incoming SMS');
    http_response_code(403);
    echo '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';
    exit;
}

// Extraire les donnees SMS
$from     = $_POST['From'] ?? '';
$body     = $_POST['Body'] ?? '';
$sid      = $_POST['MessageSid'] ?? '';
$numMedia = intval($_POST['NumMedia'] ?? 0);

if (empty($from) || empty($body)) {
    echo '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';
    exit;
}

// Stocker le message via helper
storeConversationMessage($from, [
    'id'        => $sid ?: ('msg-' . bin2hex(random_bytes(8))),
    'direction' => 'incoming',
    'body'      => mb_substr($body, 0, 4096),
    'timestamp' => date('c'),
    'sid'       => $sid,
    'media'     => $numMedia
]);

// Repondre TwiML vide (pas d'auto-reponse)
echo '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';
