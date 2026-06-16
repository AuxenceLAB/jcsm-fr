<?php
/**
 * API pour les Interventions - Stockage local JSON (Mode "Données Réelles")
 * Remplace l'API Google Sheets pour une utilisation sans dépendance externe immédiate.
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
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Gérer les requêtes OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Fichier de stockage (JSON)
$storageFile = __DIR__ . '/interventions.json';

// Initialiser le fichier s'il n'existe pas
if (!file_exists($storageFile)) {
    // Données de base pour éviter une liste vide
    $initialData = [
        [
            "id" => "intv-1",
            "ticket" => "TKT-2025-001",
            "dateDemande" => date('Y-m-d', strtotime('-2 days')),
            "dateProposee" => date('Y-m-d'),
            "nomSite" => "Carrefour Antibes (Exemple)",
            "adresse" => "Chemin de Saint-Claude, 06600 Antibes",
            "region" => "PACA",
            "technicien" => "Technicien Sud",
            "statut" => "en-cours",
            "delais" => "urgent",
            "marque" => "Schneider",
            "descriptionProbleme" => "Borne 2 hors service, écran noir.",
            "lat" => 43.6035,
            "lng" => 7.0757,
            "fait" => false,
            "reussi" => false,
            "rapportFait" => false
        ]
    ];
    file_put_contents($storageFile, json_encode($initialData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// Helper: Charger les données
function loadData($file)
{
    if (!file_exists($file))
        return [];
    $content = file_get_contents($file);
    return json_decode($content, true) ?: [];
}

// Helper: Sauvegarder les données
function saveData($file, $data)
{
    // Sauvegarde atomique (fichier temporaire)
    $tempFile = $file . '.tmp';
    $result = file_put_contents($tempFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    if ($result !== false) {
        rename($tempFile, $file);
        return true;
    }
    return false;
}

// --- ROUTER ---

// GET: Récupérer les interventions (authentification requise)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $payload = requireAuth();
    $data = loadData($storageFile);

    if (!empty($payload['isAdmin'])) {
        // Admin : filtrage optionnel explicite (?region=PACA)
        if (isset($_GET['region']) && !empty($_GET['region']) && $_GET['region'] !== 'Admin') {
            $region = $_GET['region'];
            $data = array_values(array_filter($data, function ($item) use ($region) {
                return isset($item['region']) && $item['region'] === $region;
            }));
        }
    } else {
        // Technicien : région imposée par le token (le ?region= client est ignoré).
        // Fail-open : si la région n'est pas dérivable du rôle, renvoie tout (statu quo).
        $data = filterRowsByRegion($data, $payload);
    }

    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

// POST: Ajouter ou modifier une intervention (authentification requise)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $payload = requireAuth();

    // Rate limiting (30 req/min par IP)
    if (!checkRateLimit('interventions_write', 30, 60)) {
        http_response_code(429);
        echo json_encode(['error' => 'Trop de requêtes. Réessayez dans quelques secondes.']);
        exit;
    }

    // Reject oversized payloads (1 MB max)
    $contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($contentLength > 1048576) {
        http_response_code(413);
        echo json_encode(['error' => 'Payload trop volumineux (max 1 Mo)']);
        exit;
    }

    $rawInput = file_get_contents('php://input');
    if (strlen($rawInput) > 1048576) {
        http_response_code(413);
        echo json_encode(['error' => 'Payload trop volumineux (max 1 Mo)']);
        exit;
    }

    $input = json_decode($rawInput, true);

    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Données JSON invalides']);
        exit;
    }

    $action = $input['action'] ?? 'save';

    // Validate action
    if (!in_array($action, ['save', 'delete'], true)) {
        http_response_code(400);
        echo json_encode(['error' => 'Action non reconnue: ' . htmlspecialchars($action)]);
        exit;
    }

    // Garde-fou région (avant le verrou pour ne pas exit() à l'intérieur du flock).
    // Un technicien ne peut modifier/supprimer qu'une intervention de sa région.
    // Fail-open : admin, région du token non dérivable, ou item/cible inconnu => autorisé.
    if (userRegion($payload) !== '') {
        $targetId = $action === 'delete' ? ($input['id'] ?? null) : ($input['data']['id'] ?? null);
        if ($targetId) {
            $existing = loadData($storageFile);
            foreach ($existing as $row) {
                if (($row['id'] ?? null) === $targetId) {
                    assertCanWriteRegion($payload, $row['region'] ?? null);
                    break;
                }
            }
        }
    }

    // File locking to prevent race conditions on concurrent writes
    $lockFile = $storageFile . '.lock';
    $lockFp = fopen($lockFile, 'c');
    if (!$lockFp || !flock($lockFp, LOCK_EX)) {
        http_response_code(503);
        echo json_encode(['error' => 'Serveur occupé, réessayez']);
        exit;
    }

    try {
        $data = loadData($storageFile);

        if ($action === 'save') {
            $id = $input['data']['id'] ?? null;
            $allowed = ['status', 'delais', 'techAssigned', 'techPhone', 'probleme', 'piecesChangees', 'remarques', 'rapportFait', 'dateIntervention', 'heureDebut', 'heureFin', 'adresse', 'ville', 'codePostal', 'nomSite', 'client', 'ticket', 'description', 'photos', 'signature'];

            if ($id) {
                // Mise à jour existant
                $found = false;
                foreach ($data as &$item) {
                    if ($item['id'] === $id) {
                        $filtered = array_intersect_key($input['data'], array_flip($allowed));
                        $item = array_merge($item, $filtered);
                        $found = true;
                        break;
                    }
                }
                unset($item);
                if (!$found) {
                    // Apply whitelist to new record with provided ID
                    $newItem = array_intersect_key($input['data'], array_flip($allowed));
                    $newItem['id'] = $id;
                    $data[] = $newItem;
                }
            } else {
                // Création nouveau — apply whitelist
                $newItem = array_intersect_key($input['data'], array_flip($allowed));
                $newItem['id'] = 'intv-' . bin2hex(random_bytes(16));
                array_unshift($data, $newItem);
            }
        } elseif ($action === 'delete') {
            $id = $input['id'] ?? null;
            if ($id) {
                $data = array_filter($data, function ($item) use ($id) {
                    return $item['id'] !== $id;
                });
                $data = array_values($data);
            }
        }

        $saved = saveData($storageFile, $data);
    } finally {
        flock($lockFp, LOCK_UN);
        fclose($lockFp);
    }

    if ($saved) {
        echo json_encode(['success' => true, 'count' => count($data)]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur écriture fichier']);
    }
    exit;
}

// Méthode non gérée
http_response_code(405);
echo json_encode(['error' => 'Méthode non supportée']);
