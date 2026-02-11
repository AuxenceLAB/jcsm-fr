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
