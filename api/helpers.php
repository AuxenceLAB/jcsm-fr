<?php
/**
 * JCSM Shared PHP Helpers
 * Fonctions utilitaires partagées entre les endpoints API.
 */

/**
 * Charge une variable d'environnement depuis getenv() ou le fichier .env.
 */
function loadEnvVar(string $key): ?string
{
    $val = getenv($key);
    if ($val !== false && $val !== '') return $val;

    static $envCache = null;
    if ($envCache === null) {
        $envCache = [];
        $envFile = __DIR__ . '/../.env';
        if (file_exists($envFile)) {
            foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
                if (str_starts_with(trim($line), '#')) continue;
                $eqPos = strpos($line, '=');
                if ($eqPos !== false) {
                    $envCache[substr($line, 0, $eqPos)] = substr($line, $eqPos + 1);
                }
            }
        }
    }

    return $envCache[$key] ?? null;
}

/**
 * Rate limiter fichier avec flock.
 * @return bool true si autorisé, false si rate-limité
 */
function checkRateLimit(string $namespace, int $maxRequests = 100, int $periodSeconds = 60): bool
{
    $rateLimitDir = sys_get_temp_dir() . "/jcsm_{$namespace}_rate/";
    if (!is_dir($rateLimitDir)) {
        @mkdir($rateLimitDir, 0755, true);
    }

    // Cleanup probabiliste (~2% des requêtes)
    if (mt_rand(1, 50) === 1) {
        foreach (glob($rateLimitDir . '*.json') as $f) {
            if (filemtime($f) < time() - $periodSeconds * 2) @unlink($f);
        }
    }

    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $rateLimitFile = $rateLimitDir . md5($ip) . '.json';

    $fp = fopen($rateLimitFile, 'c+');
    if ($fp && flock($fp, LOCK_EX)) {
        $content = stream_get_contents($fp);
        $rateData = $content ? json_decode($content, true) : null;

        if ($rateData && time() - $rateData['start'] < $periodSeconds) {
            if ($rateData['count'] >= $maxRequests) {
                flock($fp, LOCK_UN);
                fclose($fp);
                return false;
            }
            $rateData['count']++;
        } else {
            $rateData = ['count' => 1, 'start' => time()];
        }

        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($rateData));
        flock($fp, LOCK_UN);
        fclose($fp);
    } else {
        if ($fp) fclose($fp);
    }

    return true;
}

/**
 * Valide la signature d'une requete Twilio (X-Twilio-Signature).
 * @param string $authToken Twilio Auth Token
 * @param string $url URL complete de la requete (https://...)
 * @param array $params Parametres POST de la requete
 * @return bool true si la signature est valide
 */
function validateTwilioSignature(string $authToken, string $url, array $params): bool
{
    $twilioSignature = $_SERVER['HTTP_X_TWILIO_SIGNATURE'] ?? '';
    if (empty($twilioSignature)) return false;

    ksort($params);
    $dataString = $url;
    foreach ($params as $key => $value) {
        $dataString .= $key . $value;
    }
    $expectedSignature = base64_encode(hash_hmac('sha1', $dataString, $authToken, true));
    return hash_equals($expectedSignature, $twilioSignature);
}

/**
 * Genere un token HMAC signe pour un lien d'intervention.
 * @param string $interventionId ID de l'intervention
 * @param string $phone Telephone du technicien
 * @param int $ttlDays Duree de validite en jours (defaut 7)
 * @return array ['token' => string, 'expires' => int]
 */
function generateInterventionToken(string $interventionId, string $phone, int $ttlDays = 7): array
{
    $secret = loadEnvVar('JCSM_AUTH_SECRET');
    if (!$secret) throw new \RuntimeException('JCSM_AUTH_SECRET manquant');

    $expires = time() + ($ttlDays * 86400);
    $payload = $interventionId . '|' . preg_replace('/[^0-9+]/', '', $phone) . '|' . $expires;
    $token = hash_hmac('sha256', $payload, $secret);

    return ['token' => $token, 'expires' => $expires];
}

/**
 * Valide un token d'intervention.
 * @param string $token Le token HMAC
 * @param string $interventionId ID de l'intervention
 * @param string $phone Telephone du technicien (optionnel si non connu)
 * @param int $expires Timestamp d'expiration
 * @return bool true si valide et non expire
 */
function validateInterventionToken(string $token, string $interventionId, string $phone, int $expires): bool
{
    if (time() > $expires) return false;

    $secret = loadEnvVar('JCSM_AUTH_SECRET');
    if (!$secret) return false;

    $payload = $interventionId . '|' . preg_replace('/[^0-9+]/', '', $phone) . '|' . $expires;
    $expected = hash_hmac('sha256', $payload, $secret);
    return hash_equals($expected, $token);
}

/**
 * Encode en base64url (pour JWT).
 */
function base64urlEncode(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

/**
 * Stocke un message dans le fichier conversation d'un numero.
 * @param string $phone Numero normalise (+33...)
 * @param array $messageData Donnees du message (id, direction, body, timestamp, etc.)
 */
function storeConversationMessage(string $phone, array $messageData): void
{
    $dataDir = __DIR__ . '/data/conversations/';
    if (!is_dir($dataDir)) @mkdir($dataDir, 0775, true);

    $phoneKey = preg_replace('/[^0-9+]/', '', $phone);
    $fileKey = md5($phoneKey);
    $convFile = $dataDir . $fileKey . '.json';
    $lockFile = $convFile . '.lock';

    $lockFp = fopen($lockFile, 'c');
    if ($lockFp && flock($lockFp, LOCK_EX)) {
        try {
            $conv = file_exists($convFile)
                ? (json_decode(file_get_contents($convFile), true) ?: [])
                : [];

            if (!isset($conv['phone'])) {
                $conv['phone'] = $phoneKey;
                $conv['messages'] = [];
                $conv['unread'] = 0;
            }

            $conv['messages'][] = $messageData;

            if ($messageData['direction'] === 'incoming') {
                $conv['unread'] = ($conv['unread'] ?? 0) + 1;
            }

            $conv['lastActivity'] = date('c');

            // Max 500 messages par conversation
            if (count($conv['messages']) > 500) {
                $conv['messages'] = array_slice($conv['messages'], -500);
            }

            $tmpFile = $convFile . '.tmp';
            file_put_contents($tmpFile, json_encode($conv, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            rename($tmpFile, $convFile);
        } finally {
            flock($lockFp, LOCK_UN);
            fclose($lockFp);
        }
    } else {
        if ($lockFp) fclose($lockFp);
        error_log('Failed to lock conversation file for phone: ' . $phoneKey);
    }
}
