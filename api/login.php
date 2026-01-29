<?php
/**
 * JCSM Login Endpoint
 * POST { password: "..." } → { token, role, isAdmin, expires }
 */

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

require_once __DIR__ . '/auth.php';

header('Content-Type: application/json; charset=utf-8');

// CORS
$allowedOrigins = ['https://jcsm.fr', 'https://www.jcsm.fr'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
    exit;
}

// Rate limiting by IP
$rateLimitDir = sys_get_temp_dir() . '/jcsm_login_rate/';
if (!is_dir($rateLimitDir)) {
    @mkdir($rateLimitDir, 0755, true);
}

$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateLimitFile = $rateLimitDir . md5($ip) . '.json';
$maxAttempts = 10;
$ratePeriod = 300; // 5 minutes

if (file_exists($rateLimitFile)) {
    $rateData = json_decode(file_get_contents($rateLimitFile), true);
    if ($rateData && time() - $rateData['start'] < $ratePeriod) {
        if ($rateData['count'] >= $maxAttempts) {
            http_response_code(429);
            echo json_encode(['error' => 'Trop de tentatives. Réessayez dans quelques minutes.']);
            exit;
        }
        $rateData['count']++;
    } else {
        $rateData = ['count' => 1, 'start' => time()];
    }
} else {
    $rateData = ['count' => 1, 'start' => time()];
}
file_put_contents($rateLimitFile, json_encode($rateData));

// Parse input
$input = json_decode(file_get_contents('php://input'), true);
$password = $input['password'] ?? '';

if (empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Mot de passe requis']);
    exit;
}

// Hash the password and look it up
$hash = hash('sha256', $password);
$users = AUTH_USERS;

if (!isset($users[$hash])) {
    http_response_code(401);
    echo json_encode(['error' => 'Mot de passe incorrect']);
    exit;
}

$user = $users[$hash];
$token = generateToken($user['role'], $user['isAdmin']);

echo json_encode([
    'success' => true,
    'token' => $token,
    'role' => $user['role'],
    'isAdmin' => $user['isAdmin'],
    'expires' => time() + TOKEN_EXPIRY,
]);
