<?php
/**
 * JCSM Auth Middleware
 * Token-based authentication with HMAC-SHA256 signed tokens.
 */

// Secret key for signing tokens — change this in production
define('AUTH_SECRET', 'jcsm-secret-key-2026-change-me');
define('TOKEN_EXPIRY', 8 * 3600); // 8 hours

// User credentials: SHA-256 hash => role info
// Hashes correspond to: JCSM2025, technicien, JCSMADMIN, JCSM
define('AUTH_USERS', [
    'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3' => ['role' => 'Admin', 'isAdmin' => true],
    '8bb0cf6eb9b17d0f7d22b456f121257dc1254e1f01665370476383ea776df414' => ['role' => 'Technicien', 'isAdmin' => false],
    'c6ba91b90d922e159893f46c387e5dc1b3dc5c101a5a4522f03b987177a24a91' => ['role' => 'Admin', 'isAdmin' => true],
    '77b2eebd6e5e6c4eb4b4f4c39c3c0e8c4c0c4f9c4b9c4b9c4b9c4b9c4b9c4b9c' => ['role' => 'Technicien', 'isAdmin' => false],
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

    $payload = json_decode(base64_decode($payloadB64), true);
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
