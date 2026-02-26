<?php
/**
 * JCSM AI Reformulation Proxy
 * Reçoit les notes brutes du technicien et les reformule via OpenAI GPT.
 * La clé API n'est jamais exposée au frontend.
 */
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/helpers.php';

// CORS restreint
$allowedOrigins = ['https://jcsm.fr', 'https://www.jcsm.fr'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
    exit;
}

// Authentification requise
requireAuth();

// Rate limiting (30 req/min par IP)
if (!checkRateLimit('ai_reformulate', 30, 60)) {
    http_response_code(429);
    echo json_encode(['error' => 'Trop de requêtes IA. Réessayez dans quelques secondes.']);
    exit;
}

// Parse input
$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !is_array($input) || empty(trim($input['texte_brut'] ?? ''))) {
    http_response_code(400);
    echo json_encode(['error' => 'Champ "texte_brut" requis']);
    exit;
}

// Charger la clé API depuis .env
$apiKey = loadEnvVar('OPENAI_API_KEY');
if (!$apiKey) {
    // Dégradation gracieuse : retourner le texte brut tel quel
    echo json_encode([
        'description'       => trim($input['texte_brut']),
        'commentaires'      => 'Reformulation IA non disponible (clé API manquante)',
        'prochaines_etapes' => 'Aucune',
        'risques'           => 'Aucun',
        'source'            => 'fallback'
    ]);
    exit;
}

// Contexte intervention (optionnel)
$client    = htmlspecialchars($input['client'] ?? 'Non spécifié', ENT_QUOTES, 'UTF-8');
$site      = htmlspecialchars($input['site'] ?? 'Non spécifié', ENT_QUOTES, 'UTF-8');
$marque    = htmlspecialchars($input['marque'] ?? '', ENT_QUOTES, 'UTF-8');
$chargerId = htmlspecialchars($input['charger_id'] ?? '', ENT_QUOTES, 'UTF-8');
$probleme  = htmlspecialchars($input['probleme'] ?? '', ENT_QUOTES, 'UTF-8');
$texteBrut = trim($input['texte_brut']);

// System prompt
$systemPrompt = "Tu es un assistant spécialisé dans la rédaction de rapports d'intervention IRVE (Infrastructure de Recharge pour Véhicules Électriques). Réponds uniquement en JSON valide, sans markdown ni backticks.";

// User prompt
$userPrompt = <<<PROMPT
Tu reçois les notes brutes d'un technicien terrain et tu dois les reformuler en rapport professionnel.

RÈGLES :
1. Garde TOUS les faits techniques (codes erreur, modèles, actions effectuées)
2. N'invente RIEN qui n'est pas dans le message du technicien
3. Reformule en français professionnel, clair et structuré
4. Sépare en 4 sections :
   - Description : constat à l'arrivée sur site
   - Commentaires : actions réalisées par le technicien
   - Prochaines étapes : ce qu'il reste à faire (ou "Aucune" si tout est résolu)
   - Risques : risques identifiés (ou "Aucun")
5. Ton professionnel mais accessible
6. Si succès → le confirmer clairement
7. Si échec ou problème restant → le mettre en avant

CONTEXTE :
- Client : {$client}
- Site : {$site}
- Équipement : {$marque} {$chargerId}
- Problème signalé : {$probleme}

NOTES DU TECHNICIEN :
{$texteBrut}

Réponds en JSON : {"description":"...","commentaires":"...","prochaines_etapes":"...","risques":"..."}
PROMPT;

// Appel API OpenAI via cURL
try {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL            => 'https://api.openai.com/v1/chat/completions',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_TIMEOUT        => 30,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $apiKey,
        ],
        CURLOPT_POSTFIELDS     => json_encode([
            'model'       => 'gpt-4o-mini',
            'max_tokens'  => 1024,
            'temperature' => 0.3,
            'messages'    => [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user',   'content' => $userPrompt],
            ],
        ]),
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error    = curl_error($ch);
    curl_close($ch);

    if ($error) {
        error_log('AI reformulate curl error: ' . $error);
        throw new Exception('Erreur de connexion API IA');
    }

    if ($httpCode !== 200) {
        error_log('AI reformulate HTTP ' . $httpCode . ': ' . substr($response, 0, 500));
        throw new Exception('API IA a retourné HTTP ' . $httpCode);
    }

    $data = json_decode($response, true);
    $text = $data['choices'][0]['message']['content'] ?? '';

    // Parser la réponse JSON de GPT
    $result = json_decode($text, true);
    if (!$result || !isset($result['description'])) {
        // Tentative de nettoyage (GPT peut ajouter des backticks)
        $cleaned = preg_replace('/^```json\s*|\s*```$/s', '', trim($text));
        $result = json_decode($cleaned, true);
    }

    if ($result && isset($result['description'])) {
        echo json_encode([
            'description'       => $result['description'] ?? '',
            'commentaires'      => $result['commentaires'] ?? '',
            'prochaines_etapes' => $result['prochaines_etapes'] ?? 'Aucune',
            'risques'           => $result['risques'] ?? 'Aucun',
            'source'            => 'ai'
        ]);
    } else {
        // JSON invalide : retourner le texte brut de GPT
        echo json_encode([
            'description'       => $text ?: $texteBrut,
            'commentaires'      => '',
            'prochaines_etapes' => 'Aucune',
            'risques'           => 'Aucun',
            'source'            => 'parse_error'
        ]);
    }

} catch (Exception $e) {
    error_log('AI reformulate exception: ' . $e->getMessage());
    // Dégradation gracieuse
    echo json_encode([
        'description'       => $texteBrut,
        'commentaires'      => 'Erreur reformulation IA',
        'prochaines_etapes' => 'Aucune',
        'risques'           => 'Aucun',
        'source'            => 'error'
    ]);
}
