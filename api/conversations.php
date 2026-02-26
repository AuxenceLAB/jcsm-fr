<?php
/**
 * JCSM Conversations API
 * Lecture/gestion des threads de conversation SMS stockes en fichiers JSON.
 *
 * GET: Liste des conversations ou thread specifique
 * POST action=mark_read: Marquer comme lu
 * POST action=send: Envoyer un message et stocker dans la conversation
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
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

requireAuth();

$dataDir = __DIR__ . '/data/conversations/';
if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0775, true);
}

// GET: Liste ou thread specifique
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $phone = $_GET['phone'] ?? '';

    if ($phone) {
        $phoneKey = preg_replace('/[^0-9+]/', '', $phone);
        $fileKey  = md5($phoneKey);
        $convFile = $dataDir . $fileKey . '.json';

        if (!file_exists($convFile)) {
            echo json_encode(['phone' => $phoneKey, 'messages' => [], 'unread' => 0]);
            exit;
        }

        $conversation = json_decode(file_get_contents($convFile), true) ?: [];
        echo json_encode($conversation, JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Liste de toutes les conversations (metadata)
    $conversations = [];
    foreach (glob($dataDir . '*.json') as $file) {
        if (str_ends_with($file, '.lock') || str_ends_with($file, '.tmp')) continue;
        $conv = json_decode(file_get_contents($file), true);
        if (!$conv || !isset($conv['phone'])) continue;

        $lastMsg = !empty($conv['messages'])
            ? end($conv['messages'])
            : null;

        $conversations[] = [
            'phone'        => $conv['phone'],
            'unread'       => $conv['unread'] ?? 0,
            'lastActivity' => $conv['lastActivity'] ?? '',
            'lastMessage'  => $lastMsg ? mb_substr($lastMsg['body'] ?? '', 0, 100) : '',
            'lastDirection' => $lastMsg['direction'] ?? '',
            'messageCount' => count($conv['messages'] ?? [])
        ];
    }

    // Tri par lastActivity decroissant
    usort($conversations, function ($a, $b) {
        return strcmp($b['lastActivity'], $a['lastActivity']);
    });

    echo json_encode($conversations, JSON_UNESCAPED_UNICODE);
    exit;
}

// POST: Actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !is_array($input)) {
        http_response_code(400);
        echo json_encode(['error' => 'Donnees JSON invalides']);
        exit;
    }

    $action = $input['action'] ?? '';
    $phone  = $input['phone'] ?? '';

    if (!$phone) {
        http_response_code(400);
        echo json_encode(['error' => 'Numero de telephone requis']);
        exit;
    }

    $phoneKey = preg_replace('/[^0-9+]/', '', $phone);
    $fileKey  = md5($phoneKey);
    $convFile = $dataDir . $fileKey . '.json';
    $lockFile = $convFile . '.lock';

    if ($action === 'mark_read') {
        $lockFp = fopen($lockFile, 'c');
        if ($lockFp && flock($lockFp, LOCK_EX)) {
            try {
                if (file_exists($convFile)) {
                    $conv = json_decode(file_get_contents($convFile), true) ?: [];
                    $conv['unread'] = 0;
                    $tmpFile = $convFile . '.tmp';
                    file_put_contents($tmpFile, json_encode($conv, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                    rename($tmpFile, $convFile);
                }
            } finally {
                flock($lockFp, LOCK_UN);
                fclose($lockFp);
            }
        } else {
            if ($lockFp) fclose($lockFp);
        }
        echo json_encode(['success' => true]);
        exit;
    }

    if ($action === 'send') {
        $message  = trim($input['message'] ?? '');
        $channel  = $input['channel'] ?? 'sms';
        $techName = $input['techName'] ?? 'Admin';

        if (!$message) {
            http_response_code(400);
            echo json_encode(['error' => 'Message requis']);
            exit;
        }

        // Rate limit
        if (!checkRateLimit('conv_send', 30, 60)) {
            http_response_code(429);
            echo json_encode(['error' => 'Trop de messages. Reessayez dans quelques secondes.']);
            exit;
        }

        // Envoyer via Twilio
        $accountSid       = loadEnvVar('TWILIO_ACCOUNT_SID');
        $authToken        = loadEnvVar('TWILIO_AUTH_TOKEN');
        $messagingService = loadEnvVar('TWILIO_MESSAGING_SERVICE_SID');

        if (!$accountSid || !$authToken || !$messagingService) {
            http_response_code(500);
            echo json_encode(['error' => 'Configuration Twilio incomplete']);
            exit;
        }

        // Normaliser le numero
        $to = $phoneKey;
        if (preg_match('/^0[67]/', $to)) {
            $to = '+33' . substr($to, 1);
        }
        $to = preg_replace('/[\s\-\.]/', '', $to);
        $toFormatted = ($channel === 'whatsapp') ? 'whatsapp:' . $to : $to;

        // Limiter la taille
        $maxLen = ($channel === 'whatsapp') ? 4096 : 1600;
        if (mb_strlen($message) > $maxLen) {
            $message = mb_substr($message, 0, $maxLen - 3) . '...';
        }

        // Appel API Twilio
        $url = "https://api.twilio.com/2010-04-01/Accounts/{$accountSid}/Messages.json";
        $ch  = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL            => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_TIMEOUT        => 15,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_USERPWD        => "{$accountSid}:{$authToken}",
            CURLOPT_POSTFIELDS     => http_build_query([
                'To'                  => $toFormatted,
                'MessagingServiceSid' => $messagingService,
                'Body'                => $message,
            ]),
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error    = curl_error($ch);
        curl_close($ch);

        if ($error || $httpCode < 200 || $httpCode >= 300) {
            $twilioData = json_decode($response, true);
            http_response_code(502);
            echo json_encode([
                'error'  => 'Erreur envoi SMS',
                'detail' => $twilioData['message'] ?? $error ?? 'Unknown'
            ]);
            exit;
        }

        $twilioData = json_decode($response, true);
        $msgSid = $twilioData['sid'] ?? '';

        // Stocker dans la conversation
        storeConversationMessage($to, [
            'id'        => $msgSid ?: ('msg-' . bin2hex(random_bytes(8))),
            'direction' => 'outgoing',
            'body'      => $message,
            'timestamp' => date('c'),
            'sid'       => $msgSid,
            'techName'  => $techName,
            'channel'   => $channel
        ]);

        echo json_encode([
            'success' => true,
            'sid'     => $msgSid,
            'status'  => $twilioData['status'] ?? 'sent'
        ]);
        exit;
    }

    http_response_code(400);
    echo json_encode(['error' => 'Action inconnue: ' . htmlspecialchars($action)]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Methode non supportee']);
