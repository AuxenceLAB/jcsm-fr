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

/**
 * Normalize a region/role label for tolerant comparison.
 * "Île-de-France" / "Ile de France" / "ile_de_france" -> "iledefrance".
 */
function normalizeRegion(?string $s): string {
    if ($s === null) return '';
    // Strip accents first (handles UPPER + lower; strtolower is byte-based and
    // would leave multibyte accented capitals like "Î" untouched).
    $s = strtr(trim($s), [
        'À'=>'A','Â'=>'A','Ä'=>'A','Á'=>'A','Ã'=>'A','à'=>'a','â'=>'a','ä'=>'a','á'=>'a','ã'=>'a',
        'É'=>'E','È'=>'E','Ê'=>'E','Ë'=>'E','é'=>'e','è'=>'e','ê'=>'e','ë'=>'e',
        'Î'=>'I','Ï'=>'I','Í'=>'I','î'=>'i','ï'=>'i','í'=>'i',
        'Ô'=>'O','Ö'=>'O','Ó'=>'O','Õ'=>'O','ô'=>'o','ö'=>'o','ó'=>'o','õ'=>'o',
        'Ù'=>'U','Û'=>'U','Ü'=>'U','Ú'=>'U','ù'=>'u','û'=>'u','ü'=>'u','ú'=>'u',
        'Ç'=>'C','ç'=>'c','Ñ'=>'N','ñ'=>'n',
    ]);
    $s = strtolower($s);
    // keep alphanumerics only
    return preg_replace('/[^a-z0-9]/', '', $s);
}

/**
 * Derive the technician's region key from the token role.
 * Role format: "Technicien <Region>" (e.g. "Technicien PACA").
 * Returns '' for admins or when no region can be derived (fail-open).
 */
function userRegion(array $payload): string {
    if (!empty($payload['isAdmin'])) return '';
    $role = $payload['role'] ?? '';
    // remove a leading "technicien" / "tech" prefix, keep the rest as region
    $region = preg_replace('/^\s*technicien\s+/i', '', trim($role));
    $region = preg_replace('/^\s*tech\s+/i', '', $region);
    $norm = normalizeRegion($region);
    // "admin" role or empty -> no region constraint
    if ($norm === '' || $norm === 'admin') return '';
    return $norm;
}

/**
 * Require an admin token — sends 403 and exits for non-admins.
 */
function requireAdmin(array $payload): void {
    if (empty($payload['isAdmin'])) {
        http_response_code(403);
        echo json_encode(['error' => 'Accès réservé aux administrateurs']);
        exit;
    }
}

/**
 * Fail-open region filter for read endpoints.
 *
 * Safe by construction — never empties a technician's view by accident:
 *  - admins / non-derivable token region  -> full set unchanged
 *  - dataset carries NO region info at all -> full set unchanged (e.g. the
 *    local fallback uses "dept", not "region")
 *  - rows without a region value           -> kept (fail-open per row)
 * Only rows that explicitly belong to ANOTHER region are removed.
 */
function filterRowsByRegion(array $rows, array $payload, string $regionField = 'region'): array {
    $region = userRegion($payload);
    if ($region === '') return $rows; // admin / no constraint

    // Does the dataset actually carry region info?
    $hasRegionInfo = false;
    foreach ($rows as $row) {
        if (is_array($row) && !empty($row[$regionField])) { $hasRegionInfo = true; break; }
    }
    if (!$hasRegionInfo) return $rows; // no region data -> no filtering

    return array_values(array_filter($rows, function ($row) use ($region, $regionField) {
        $rowRegion = is_array($row) ? ($row[$regionField] ?? null) : null;
        if ($rowRegion === null || $rowRegion === '') return true; // unknown -> keep
        return normalizeRegion($rowRegion) === $region;
    }));
}

/**
 * Fail-safe write guard: blocks cross-region writes only when BOTH the
 * token region and the target row region are confidently known.
 * Admins and unknown-region cases are allowed (fail-open).
 */
function assertCanWriteRegion(array $payload, ?string $rowRegion): void {
    $region = userRegion($payload);
    if ($region === '') return;                 // admin / no constraint
    if ($rowRegion === null || $rowRegion === '') return; // unknown target -> allow
    if (normalizeRegion($rowRegion) !== $region) {
        http_response_code(403);
        echo json_encode(['error' => 'Action non autorisée pour cette région']);
        exit;
    }
}
