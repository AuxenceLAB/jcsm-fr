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

// CORS restreint
$allowedOrigins = ['https://jcsm.fr', 'https://www.jcsm.fr'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

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
    requireAuth();
    $data = loadData($storageFile);

    // Filtrage optionnel par région (si passé en paramètre ?region=PACA)
    if (isset($_GET['region']) && !empty($_GET['region']) && $_GET['region'] !== 'Admin') {
        $region = $_GET['region'];
        $data = array_filter($data, function ($item) use ($region) {
            return isset($item['region']) && $item['region'] === $region;
        });
        // Ré-indexer le tableau
        $data = array_values($data);
    }

    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

// POST: Ajouter ou modifier une intervention (authentification requise)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAuth();

    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Données JSON invalides']);
        exit;
    }

    $data = loadData($storageFile);
    $action = $input['action'] ?? 'save';

    // Validate action
    if (!in_array($action, ['save', 'delete'], true)) {
        http_response_code(400);
        echo json_encode(['error' => 'Action non reconnue: ' . htmlspecialchars($action)]);
        exit;
    }

    if ($action === 'save') {
        // Logique de sauvegarde / mise à jour
        $id = $input['data']['id'] ?? null;

        if ($id) {
            // Mise à jour existant
            $found = false;
            foreach ($data as &$item) {
                if ($item['id'] === $id) {
                    $item = array_merge($item, $input['data']);
                    $found = true;
                    break;
                }
            }
            unset($item); // Break reference after foreach
            if (!$found) {
                // Création avec ID spécifié (rare) ou erreur ? On ajoute.
                $data[] = $input['data'];
            }
        } else {
            // Création nouveau
            $newItem = $input['data'];
            $newItem['id'] = 'intv-' . time() . '-' . bin2hex(random_bytes(4));
            // Ajout en tête de liste
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

    if (saveData($storageFile, $data)) {
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
