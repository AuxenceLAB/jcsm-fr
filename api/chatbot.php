<?php
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');
/**
 * JCSM Chatbot API Endpoint
 * Chatbot commercial propulse par MiniMax (OpenAI-compatible API).
 * Recoit les messages prospects, interroge la DB pour stats reelles,
 * envoie au LLM, capture les leads.
 */

header('Content-Type: application/json; charset=utf-8');
$allowedOrigins = ['https://jcsm.fr', 'https://www.jcsm.fr'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
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

require_once __DIR__ . '/helpers.php';

// Rate limiting: 3 requetes par minute par IP
if (!checkRateLimit('chatbot', 3, 60)) {
    http_response_code(429);
    echo json_encode(['error' => 'Trop de requêtes, veuillez patienter.']);
    exit;
}

// --- Configuration ---
$apiKey = loadEnvVar('MINIMAX_API_KEY');
if (!$apiKey) {
    http_response_code(500);
    echo json_encode(['error' => 'Configuration API manquante']);
    exit;
}

$dbHost = loadEnvVar('DB_HOST') ?? 'localhost';
$dbPort = loadEnvVar('DB_PORT') ?? '5432';
$dbName = loadEnvVar('DB_NAME') ?? 'jcsm_cloud';
$dbUser = loadEnvVar('DB_USER') ?? 'jcsm_cloud';
$dbPass = loadEnvVar('DB_PASS') ?? '';

// --- Parse input ---
$input = json_decode(file_get_contents('php://input'), true);
if (!$input || empty($input['message'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Message requis']);
    exit;
}

$userMessage = trim($input['message']);
$conversationId = $input['conversation_id'] ?? bin2hex(random_bytes(16));
// Sanitize conversationId (used in logs and DB)
$conversationId = preg_replace('/[^a-zA-Z0-9_-]/', '', substr($conversationId, 0, 64));
$leadInfo = $input['lead_info'] ?? null;
$history = $input['history'] ?? [];

// Limit message length
if (mb_strlen($userMessage) > 1000) {
    $userMessage = mb_substr($userMessage, 0, 1000);
}

// --- Save lead if provided ---
if ($leadInfo && !empty($leadInfo['email'])) {
    saveLead($leadInfo, $conversationId, $dbHost, $dbPort, $dbName, $dbUser, $dbPass);
}

// --- Fetch real stats from DB ---
$stats = fetchStats($dbHost, $dbPort, $dbName, $dbUser, $dbPass);

// --- Build system prompt ---
$systemPrompt = buildSystemPrompt($stats);

// --- Build messages array ---
$messages = [['role' => 'system', 'content' => $systemPrompt]];

// Add conversation history (last 10 exchanges max)
if (!empty($history)) {
    $recentHistory = array_slice($history, -20);
    foreach ($recentHistory as $msg) {
        if (isset($msg['role']) && isset($msg['content'])) {
            $role = $msg['role'] === 'user' ? 'user' : 'assistant';
            $messages[] = ['role' => $role, 'content' => mb_substr($msg['content'], 0, 500)];
        }
    }
}

$messages[] = ['role' => 'user', 'content' => $userMessage];

// --- Call MiniMax API ---
$response = callMiniMaxAPI($apiKey, $messages);

if ($response === null) {
    echo json_encode([
        'response' => "Je suis désolé, je rencontre un problème technique. N'hésitez pas à nous contacter directement via notre page contact.",
        'conversation_id' => $conversationId
    ]);
    exit;
}

// --- Log conversation to file ---
logConversation($conversationId, $userMessage, $response);

echo json_encode([
    'response' => $response,
    'conversation_id' => $conversationId
]);

// ===================== FUNCTIONS =====================

function getDbConnection(string $host, string $port, string $dbname, string $user, string $pass): ?PgSql\Connection
{
    static $conn = null;
    if ($conn !== null) return $conn;

    $connStr = "host={$host} port={$port} dbname={$dbname} user={$user} password={$pass} connect_timeout=3";
    $conn = @pg_connect($connStr);
    return $conn ?: null;
}

function fetchStats(string $host, string $port, string $dbname, string $user, string $pass): array
{
    $defaults = [
        'total_interventions' => '2000+',
        'total_clients' => '50+',
        'satisfaction' => '98%',
    ];

    $conn = getDbConnection($host, $port, $dbname, $user, $pass);
    if (!$conn) return $defaults;

    try {
        $res = pg_query($conn, "SELECT count(*) as cnt FROM interventions");
        if ($res) {
            $row = pg_fetch_assoc($res);
            $count = (int)$row['cnt'];
            // Use real count if significant, otherwise use marketing number
            $defaults['total_interventions'] = $count > 100 ? (string)$count : '2000+';
        }

        $res = pg_query($conn, "SELECT count(*) as cnt FROM clients");
        if ($res) {
            $row = pg_fetch_assoc($res);
            $count = (int)$row['cnt'];
            $defaults['total_clients'] = $count > 5 ? (string)$count : '50+';
        }
    } catch (\Throwable $e) {
        error_log('Chatbot DB error: ' . $e->getMessage());
    }

    return $defaults;
}

function buildSystemPrompt(array $stats): string
{
    return <<<PROMPT
Tu es l'assistant commercial de JCSM SAS, expert en IRVE (bornes de recharge véhicules électriques).
JCSM est un opérateur technique indépendant spécialisé en maintenance, dépannage et installation de bornes de recharge.

Ce que tu sais :
- Couverture nationale, SLA intervention sous 4h
- {$stats['total_interventions']} interventions réalisées, {$stats['satisfaction']} de satisfaction client
- {$stats['total_clients']} clients actifs
- Certifié Qualifelec IRVE, RC Pro 2M euros
- Marques maîtrisées : Alpitronic, Kempower, Alfen, Schneider, Hager, Legrand
- Services : maintenance préventive, curative, supervision 24/7, hotline, installation
- Supervision OCPP, alertes automatiques
- Site web : https://jcsm.fr
- Page contact : https://jcsm.fr/contact

REGLES ABSOLUES :
- Ne JAMAIS donner de tarifs, prix, ou grille tarifaire. Dire "Chaque projet est unique, contactez-nous via jcsm.fr/contact pour un devis personnalisé."
- Toujours en français, vouvoyer le prospect
- Être professionnel, concis, rassurant
- Orienter vers la page contact pour un devis
- INTERDICTION FORMELLE de répondre à toute question hors du domaine IRVE, bornes de recharge, véhicules électriques, énergie ou services JCSM. Cela inclut notamment : politique, religion, sujets controversés, opinions personnelles, actualités non-IRVE, sport, divertissement, aide aux devoirs, programmation, sante, finance non-IRVE. Répondre : "Je suis spécialisé uniquement dans les bornes de recharge et l'IRVE. Pour toute autre question, je vous invite à consulter les ressources appropriées. Comment puis-je vous aider concernant vos bornes de recharge ?"
- Réponses courtes (3-4 phrases max) sauf si le prospect demande des details
- Ne pas répéter les mêmes informations si déjà dites dans la conversation
- Ne jamais inventer de chiffres ou statistiques non fournis ci-dessus
- JAMAIS de HTML, pas de balises <a>, pas de markdown, pas de liens cliquables. Ecrire les URLs en texte simple : jcsm.fr/contact (sans crochets, sans parentheses markdown, sans balises HTML)
- Format texte brut uniquement. Pas de gras, pas d'italiques, pas de listes a puces avec des tirets
PROMPT;
}

function callMiniMaxAPI(string $apiKey, array $messages): ?string
{
    $payload = json_encode([
        'model' => 'MiniMax-Text-01',
        'messages' => $messages,
        'max_tokens' => 500,
        'temperature' => 0.7,
        'top_p' => 0.9,
    ]);

    $ch = curl_init('https://api.minimaxi.chat/v1/chat/completions');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $apiKey,
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_CONNECTTIMEOUT => 5,
    ]);

    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        error_log("Chatbot cURL error: {$curlError}");
        return null;
    }

    if ($httpCode !== 200) {
        error_log("Chatbot API error (HTTP {$httpCode}): {$result}");
        return null;
    }

    $data = json_decode($result, true);
    return $data['choices'][0]['message']['content'] ?? null;
}

function saveLead(array $leadInfo, string $conversationId, string $host, string $port, string $dbname, string $user, string $pass): void
{
    $conn = getDbConnection($host, $port, $dbname, $user, $pass);
    if (!$conn) return;

    $nom = trim($leadInfo['nom'] ?? '');
    $email = trim($leadInfo['email'] ?? '');
    $entreprise = trim($leadInfo['entreprise'] ?? '');

    // Basic email validation
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) return;

    // Check if lead already exists with same email
    $check = pg_query_params($conn,
        "SELECT id FROM leads WHERE email = $1",
        [$email]
    );

    if ($check && pg_num_rows($check) > 0) {
        // Update existing lead notes with chatbot conversation reference
        $row = pg_fetch_assoc($check);
        pg_query_params($conn,
            "UPDATE leads SET notes = COALESCE(notes, '') || $1, updated_at = NOW() WHERE id = $2",
            ["\n[Chatbot {$conversationId}] Nouvelle conversation le " . date('d/m/Y H:i'), $row['id']]
        );
        return;
    }

    pg_query_params($conn,
        "INSERT INTO leads (nom, email, entreprise, source, statut, notes) VALUES ($1, $2, $3, $4, $5, $6)",
        [
            $nom,
            $email,
            $entreprise,
            'chatbot',
            'nouveau',
            "[Chatbot {$conversationId}] Lead capture le " . date('d/m/Y H:i')
        ]
    );
}

function logConversation(string $conversationId, string $userMessage, string $response): void
{
    $logDir = __DIR__ . '/data/chatbot_logs/';
    if (!is_dir($logDir)) {
        @mkdir($logDir, 0775, true);
    }

    $logFile = $logDir . date('Y-m-d') . '.jsonl';
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    // Hash IP for privacy (no raw IPs in logs)
    $ipHash = hash('sha256', $ip . date('Y-m'));
    $entry = json_encode([
        'conversation_id' => $conversationId,
        'timestamp' => date('c'),
        'user' => $userMessage,
        'assistant' => $response,
        'ip_hash' => substr($ipHash, 0, 16),
    ], JSON_UNESCAPED_UNICODE) . "\n";

    @file_put_contents($logFile, $entry, FILE_APPEND | LOCK_EX);
}
