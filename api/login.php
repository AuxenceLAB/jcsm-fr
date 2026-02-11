<?php
/**
 * JCSM Login Endpoint
 * POST { password: "..." } → { token, role, isAdmin, expires }
 */

error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/helpers.php';

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

// Rate limiting by IP (10 attempts per 5 minutes)
if (!checkRateLimit('login', 10, 300)) {
    http_response_code(429);
    echo json_encode(['error' => 'Trop de tentatives. Réessayez dans quelques minutes.']);
    exit;
}

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
