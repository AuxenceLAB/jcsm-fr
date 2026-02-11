<?php
/**
 * JCSM Auth Middleware
 * Token-based authentication with HMAC-SHA256 signed tokens.
 */

// Suppress errors in production
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// Secret key — loaded from environment or .env file, fallback to default
$envSecret = getenv('JCSM_AUTH_SECRET');
if (!$envSecret && file_exists(__DIR__ . '/../.env')) {
    $envLines = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($envLines as $line) {
        if (strpos($line, 'JCSM_AUTH_SECRET=') === 0) {
            $envSecret = substr($line, strlen('JCSM_AUTH_SECRET='));
            break;
        }
    }
}
if (!$envSecret) {
    http_response_code(500);
    echo json_encode(['error' => 'Configuration serveur incomplète (JCSM_AUTH_SECRET manquant)']);
    exit;
}
define('AUTH_SECRET', $envSecret);
define('TOKEN_EXPIRY', 8 * 3600); // 8 hours

// User credentials: SHA-256 hash => role info
define('AUTH_USERS', [
    'f0e30e24a243ef1fc96806b679b14b23d0b15b5c99f664a59c24384bfa36d898' => ['role' => 'Admin', 'isAdmin' => true],
    '526830a02277a03ab1c5eef93a9c6e22ae02e2ae977d8d69604ba212cb3d9507' => ['role' => 'Technicien', 'isAdmin' => false],
    '6decc588f359f0058a1695322f82ac83215cec4276940897a8648a909e4000c4' => ['role' => 'Admin', 'isAdmin' => true],
    'f4574919cd21d4f4113aa9da4e174ed2a12da4bc5db0232c41a1bdd839fd6ace' => ['role' => 'Technicien', 'isAdmin' => false],
]);

/**
 * Generate a signed token for a user
 */
function generateToken(string $role, bool $isAdmin): string {
    $payload = [
        'role' => $role,
        'isAdmin' => $isAdmin,
        'iat' => time(),
        'exp' => time() + TOKEN_EXPIRY,
    ];
    $payloadB64 = base64_encode(json_encode($payload));
    $signature = hash_hmac('sha256', $payloadB64, AUTH_SECRET);
    return $payloadB64 . '.' . $signature;
}

/**
 * Verify and decode a token
 * @return array|false Payload or false if invalid
 */
function verifyToken(string $token) {
    $parts = explode('.', $token);
    if (count($parts) !== 2) return false;

    [$payloadB64, $signature] = $parts;

    // Verify signature
    $expected = hash_hmac('sha256', $payloadB64, AUTH_SECRET);
    if (!hash_equals($expected, $signature)) return false;

    $decoded = base64_decode($payloadB64, true);
    if ($decoded === false) return false;
    $payload = json_decode($decoded, true);
    if (!$payload) return false;

    // Check expiry
    if (!isset($payload['exp']) || $payload['exp'] < time()) return false;

    return $payload;
}

/**
 * Require authentication — call this at the top of protected endpoints.
 * Returns the decoded payload or sends 401 and exits.
 */
function requireAuth(): array {
    // CSRF protection: require X-Requested-With header on mutating requests
    if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'DELETE', 'PATCH'])) {
        $xrw = $_SERVER['HTTP_X_REQUESTED_WITH'] ?? '';
        if ($xrw !== 'XMLHttpRequest') {
            http_response_code(403);
            echo json_encode(['error' => 'Requête non autorisée (CSRF)']);
            exit;
        }
    }

    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/^Bearer\s+(.+)$/i', $header, $matches)) {
        http_response_code(401);
        echo json_encode(['error' => 'Token d\'authentification manquant']);
        exit;
    }

    $payload = verifyToken($matches[1]);
    if (!$payload) {
        http_response_code(401);
        echo json_encode(['error' => 'Token invalide ou expiré']);
        exit;
    }

    return $payload;
}
