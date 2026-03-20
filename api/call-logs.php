<?php
/**
 * JCSM Call Logs API
 * Stockage et lecture des logs d'appels voix.
 *
 * GET: Liste des logs (optionnel ?limit=50)
 * POST action=create: Creer une entree au debut d'appel
 * POST action=update: Mettre a jour (duree, statut) a la fin d'appel
 */
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/helpers.php';

// CORS
$allowedOrigins = ['https://jcsm.fr', 'https://www.jcsm.fr'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

requireAuth();

$logFile  = __DIR__ . '/data/calls/call_logs.json';
$lockFile = $logFile . '.lock';

// Ensure data directory exists
$callsDir = dirname($logFile);
if (!is_dir($callsDir)) @mkdir($callsDir, 0775, true);

// GET: Liste des logs
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $limit = intval($_GET['limit'] ?? 50);
    $limit = max(1, min($limit, 200));

    if (!file_exists($logFile)) {
        echo json_encode([]);
        exit;
    }

    $logs = json_decode(file_get_contents($logFile), true) ?: [];
    // Plus recent en premier
    $logs = array_reverse($logs);
    $logs = array_slice($logs, 0, $limit);

    echo json_encode($logs, JSON_UNESCAPED_UNICODE);
    exit;
}

// POST: Create ou Update
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !is_array($input)) {
        http_response_code(400);
        echo json_encode(['error' => 'Donnees JSON invalides']);
        exit;
    }

    if (!checkRateLimit('call_logs', 30, 60)) {
        http_response_code(429);
        echo json_encode(['error' => 'Trop de requetes']);
        exit;
    }

    $action = $input['action'] ?? '';

    $lockFp = fopen($lockFile, 'c');
    if (!$lockFp || !flock($lockFp, LOCK_EX)) {
        if ($lockFp) fclose($lockFp);
        http_response_code(500);
        echo json_encode(['error' => 'Erreur de verrouillage']);
        exit;
    }

    try {
        $logs = file_exists($logFile)
            ? (json_decode(file_get_contents($logFile), true) ?: [])
            : [];

        if ($action === 'create') {
            $callId = 'call-' . bin2hex(random_bytes(8));
            $entry = [
                'id'        => $callId,
                'to'        => trim($input['to'] ?? ''),
                'toName'    => trim($input['toName'] ?? ''),
                'from'      => trim($input['from'] ?? 'admin'),
                'startTime' => $input['startTime'] ?? date('c'),
                'endTime'   => null,
                'duration'  => 0,
                'status'    => 'connecting',
                'direction' => $input['direction'] ?? 'outgoing'
            ];

            $logs[] = $entry;

            // Max 1000 entrees
            if (count($logs) > 1000) {
                $logs = array_slice($logs, -1000);
            }

            $tmpFile = $logFile . '.tmp';
            file_put_contents($tmpFile, json_encode($logs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            rename($tmpFile, $logFile);

            echo json_encode(['success' => true, 'id' => $callId]);
            exit;
        }

        if ($action === 'update') {
            $callId = $input['callId'] ?? '';
            if (!$callId) {
                http_response_code(400);
                echo json_encode(['error' => 'callId requis']);
                exit;
            }

            $found = false;
            foreach ($logs as &$log) {
                if ($log['id'] === $callId) {
                    if (isset($input['duration'])) $log['duration'] = intval($input['duration']);
                    if (isset($input['status']))   $log['status'] = $input['status'];
                    if (isset($input['endTime']))   $log['endTime'] = $input['endTime'];
                    $found = true;
                    break;
                }
            }
            unset($log);

            if (!$found) {
                http_response_code(404);
                echo json_encode(['error' => 'Appel non trouve']);
                exit;
            }

            $tmpFile = $logFile . '.tmp';
            file_put_contents($tmpFile, json_encode($logs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            rename($tmpFile, $logFile);

            echo json_encode(['success' => true]);
            exit;
        }

        http_response_code(400);
        echo json_encode(['error' => 'Action inconnue']);

    } finally {
        flock($lockFp, LOCK_UN);
        fclose($lockFp);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Methode non supportee']);
