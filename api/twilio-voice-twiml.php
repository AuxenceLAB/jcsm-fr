<?php
/**
 * JCSM TwiML Voice Application
 * Route les appels sortants du navigateur Twilio Client vers le PSTN.
 * Appele par les serveurs Twilio — valide via X-Twilio-Signature.
 */
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

header('Content-Type: text/xml; charset=utf-8');
require_once __DIR__ . '/helpers.php';

// Valider la signature Twilio
$authToken = loadEnvVar('TWILIO_AUTH_TOKEN');
if (!$authToken) {
    http_response_code(500);
    echo '<?xml version="1.0" encoding="UTF-8"?><Response><Say language="fr-FR">Erreur configuration</Say></Response>';
    exit;
}

$url = 'https://jcsm.fr' . $_SERVER['REQUEST_URI'];
if (!validateTwilioSignature($authToken, $url, $_POST)) {
    http_response_code(403);
    error_log('Invalid Twilio signature on voice TwiML');
    echo '<?xml version="1.0" encoding="UTF-8"?><Response><Say language="fr-FR">Acces refuse</Say></Response>';
    exit;
}

// Numero destination depuis la requete
$to = $_POST['To'] ?? '';
$callerId = loadEnvVar('TWILIO_PHONE_NUMBER');

if (empty($to)) {
    echo '<?xml version="1.0" encoding="UTF-8"?>';
    echo '<Response><Say language="fr-FR">Aucun numero de destination</Say></Response>';
    exit;
}

// Normaliser les numeros FR
if (preg_match('/^0[67]/', $to)) {
    $to = '+33' . substr($to, 1);
}
$to = preg_replace('/[\s\-\.]/', '', $to);

// Valider format E.164
if (!preg_match('/^\+[1-9]\d{6,14}$/', $to)) {
    echo '<?xml version="1.0" encoding="UTF-8"?>';
    echo '<Response><Say language="fr-FR">Numero invalide</Say></Response>';
    exit;
}

// TwiML pour connecter l'appel
echo '<?xml version="1.0" encoding="UTF-8"?>';
echo '<Response>';
echo '<Dial callerId="' . htmlspecialchars($callerId) . '">';
echo '<Number>' . htmlspecialchars($to) . '</Number>';
echo '</Dial>';
echo '</Response>';
