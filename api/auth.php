<?php
/**
 * JCSM Auth Middleware
 * Token-based authentication with HMAC-SHA256 signed tokens.
 */

// Suppress errors in production
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

require_once __DIR__ . '/helpers.php';

// Secret key — loaded from .env
$envSecret = loadEnvVar('JCSM_AUTH_SECRET');
if (!$envSecret) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur de configuration serveur']);
    exit;
}
define('AUTH_SECRET', $envSecret);
define('TOKEN_EXPIRY', 8 * 3600); // 8 hours

// User credentials loaded from .env (AUTH_HASH_N=hash:role:isAdmin)
// Supports bcrypt ($2y$...) and legacy SHA-256 hashes
$authUsers = [];
for ($i = 1; $i <= 20; $i++) {
    $hashLine = loadEnvVar("AUTH_HASH_{$i}");
    if ($hashLine === null) break;
    $parts = explode(':', $hashLine, 3);
    if (count($parts) === 3) {
        $authUsers[] = [
            'hash' => $parts[0],
            'role' => $parts[1],
            'isAdmin' => $parts[2] === 'true'
        ];
    }
}
if (empty($authUsers)) {
    http_response_code(500);
    echo json_encode(['error' => 'Configuration utilisateurs manquante']);
    exit;
}
define('AUTH_USERS', $authUsers);

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
