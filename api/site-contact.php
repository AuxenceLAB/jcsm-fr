<?php
/**
 * Relais du formulaire public vers la file de contacts de JCSM Cloud.
 * La cle de service ne quitte jamais le serveur web. Aucun email n'est envoye ici.
 */
declare(strict_types=1);

require_once __DIR__ . '/helpers.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function siteContactReply(int $status, string $error = '', bool $duplicate = false): never
{
    http_response_code($status);
    echo json_encode($error === ''
        ? ['ok' => true, 'deja_recue' => $duplicate]
        : ['ok' => false, 'error' => $error], JSON_UNESCAPED_UNICODE);
    exit;
}

function siteContactPayload(array $form): ?array
{
    $sourceRef = inputString($form, 'source_ref', 50);
    $nom = inputString($form, 'nom', 160);
    $email = inputString($form, 'email', 200);
    $message = inputString($form, 'message', 2000);

    if (!preg_match('/^jcsm-fr:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i', $sourceRef)
        || mb_strlen($nom) < 2
        || !filter_var($email, FILTER_VALIDATE_EMAIL)
        || mb_strlen($message) < 10
        || (($form['rgpd-consent'] ?? $form['rgpd'] ?? null) !== 'on')) {
        return null;
    }

    $page = inputString($form, 'page', 160);
    if ($page === '' || $page[0] !== '/' || str_starts_with($page, '//')) {
        $page = '/';
    }
    // Un chemin de page informatif, jamais une URL externe fournie au backend.
    $page = parse_url($page, PHP_URL_PATH) ?: '/';

    return [
        'partenaire_ref' => 'jcsm.fr',
        'source_ref' => strtolower($sourceRef),
        'nom' => $nom,
        'entreprise' => inputString($form, 'entreprise', 160) ?: null,
        'email' => $email,
        'telephone' => inputString($form, 'telephone', 20) ?: null,
        'sujet' => inputString($form, 'sujet', 160) ?: (inputString($form, '_subject', 160) ?: null),
        'type_projet' => inputString($form, 'type-projet', 120) ?: null,
        'message' => $message,
        'consentement_rgpd' => true,
        'langue' => inputString($form, 'langue', 8) ?: 'fr',
        'page' => $page,
    ];
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    siteContactReply(405, 'Methode non autorisee');
}

if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 12000) {
    siteContactReply(413, 'Formulaire trop volumineux');
}

// Le honeypot dissuade les robots, sans transmettre leurs donnees a JCSM.
if (inputString($_POST, '_gotcha', 200) !== '') {
    siteContactReply(200);
}

if (!checkRateLimit('site_contact', 5, 600)) {
    siteContactReply(429, 'Trop de demandes. Reessayez plus tard.');
}

$payload = siteContactPayload($_POST);
if ($payload === null) {
    siteContactReply(422, 'Verifiez les champs du formulaire.');
}

$serviceKeyFile = '/var/www/.secrets/jcsm-site-contact.key';
$serviceKey = is_readable($serviceKeyFile) ? trim((string) file_get_contents($serviceKeyFile)) : '';
if ($serviceKey === '') {
    error_log('[site-contact] Cle de service non configuree');
    siteContactReply(503, 'Service momentanement indisponible.');
}

$curl = curl_init('https://jcsm.cloud/api/service/site-contacts');
if ($curl === false) {
    siteContactReply(503, 'Service momentanement indisponible.');
}

try {
    $jsonPayload = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
} catch (JsonException $error) {
    curl_close($curl);
    siteContactReply(422, 'Verifiez les champs du formulaire.');
}

curl_setopt_array($curl, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $jsonPayload,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Accept: application/json',
        'X-Service-Key: ' . $serviceKey,
        'X-Client-IP: ' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'),
    ],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 3,
    CURLOPT_TIMEOUT => 12,
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
]);

$response = curl_exec($curl);
$upstreamStatus = curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
curl_close($curl);

// Un 2xx ou une page HTML ne prouvent pas que JCSM a enregistre la demande.
$body = is_string($response) ? json_decode($response, true) : null;
if (in_array($upstreamStatus, [200, 201], true)
    && is_array($body) && ($body['ok'] ?? false) === true
    && is_bool($body['deja_recue'] ?? null)) {
    siteContactReply(200, '', $body['deja_recue']);
}

if ($upstreamStatus === 409) {
    siteContactReply(409, 'Le formulaire a change. Reessayez votre envoi.');
}
if ($upstreamStatus === 429) {
    siteContactReply(429, 'Trop de demandes. Reessayez plus tard.');
}

error_log('[site-contact] Echec du relais JCSM, statut ' . (int) $upstreamStatus);
siteContactReply(503, 'Service momentanement indisponible. Reessayez sans ressaisir le formulaire.');
