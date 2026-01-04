<?php
/**
 * API pour les Fiches Méthodes - Stockage collaboratif
 * 
 * Endpoints:
 * - GET /api/fiches.php : Récupère toutes les fiches
 * - POST /api/fiches.php : Crée ou modifie une fiche
 * - DELETE /api/fiches.php?id=xxx : Supprime une fiche
 */

header('Content-Type: application/json; charset=utf-8');

// Sécurité améliorée : CORS restreint
$allowedOrigins = [
    'https://jcsm.fr',
    'https://www.jcsm.fr',
    'http://localhost:3000',
    'null'
];

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
}

header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gérer les requêtes OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Fichier de stockage (JSON)
$storageFile = __DIR__ . '/fiches_methodes.json';
$imagesDir = __DIR__ . '/images_fiches/';

// Créer le dossier images s'il n'existe pas
if (!file_exists($imagesDir)) {
    mkdir($imagesDir, 0755, true);
    file_put_contents($imagesDir . '.htaccess', 'Options -Indexes');
}

// Charger les fiches depuis le fichier
function loadFiches($file)
{
    if (!file_exists($file)) {
        return [];
    }
    $content = file_get_contents($file);
    return json_decode($content, true) ?: [];
}

// Sauvegarder les fiches dans le fichier
function saveFiches($file, $fiches)
{
    // Sauvegarder dans un fichier temporaire d'abord (sécurité)
    $tempFile = $file . '.tmp';
    $result = file_put_contents($tempFile, json_encode($fiches, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    if ($result !== false) {
        // Si succès, remplacer l'ancien fichier
        rename($tempFile, $file);
        return true;
    }

    return false;
}

// Sauvegarder une image depuis base64
function saveImage($base64Data, $imageId, $imagesDir)
{
    // Décoder le base64
    if (preg_match('/^data:image\/(\w+);base64,/', $base64Data, $matches)) {
        $imageType = $matches[1];
        $imageData = base64_decode(substr($base64Data, strpos($base64Data, ',') + 1));

        $filename = $imageId . '.' . $imageType;
        $filepath = $imagesDir . $filename;

        if (file_put_contents($filepath, $imageData)) {
            return 'api/images_fiches/' . $filename;
        }
    }
    return null;
}

// GET : Récupérer toutes les fiches
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $fiches = loadFiches($storageFile);

    // Convertir les chemins d'images en URLs complètes si nécessaire
    foreach ($fiches as &$fiche) {
        if (isset($fiche['images']) && is_array($fiche['images'])) {
            foreach ($fiche['images'] as &$img) {
                // Si c'est déjà une URL complète, on garde
                if (
                    !filter_var($img['data'], FILTER_VALIDATE_URL) &&
                    !str_starts_with($img['data'], 'http')
                ) {
                    // Sinon, on convertit le chemin relatif en URL
                    if (str_starts_with($img['data'], 'api/images_fiches/')) {
                        $img['data'] = 'https://' . $_SERVER['HTTP_HOST'] . '/' . $img['data'];
                    }
                }
            }
        }
    }

    echo json_encode($fiches, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

// POST : Créer ou modifier une fiche
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Données invalides']);
        exit;
    }

    $fiches = loadFiches($storageFile);

    // Traiter les images
    if (isset($input['images']) && is_array($input['images'])) {
        foreach ($input['images'] as &$img) {
            // Si l'image est en base64 et n'a pas encore été sauvegardée
            if (str_starts_with($img['data'], 'data:image/')) {
                $imagePath = saveImage($img['data'], $img['id'], $imagesDir);
                if ($imagePath) {
                    $img['data'] = 'https://' . $_SERVER['HTTP_HOST'] . '/' . $imagePath;
                }
            }
        }
    }

    if (isset($input['id'])) {
        // Modification d'une fiche existante
        $index = array_search($input['id'], array_column($fiches, 'id'));
        if ($index !== false) {
            $fiches[$index] = array_merge($fiches[$index], $input);
            $fiches[$index]['dateModified'] = date('c');
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Fiche non trouvée']);
            exit;
        }
    } else {
        // Création d'une nouvelle fiche
        $nouvelleFiche = [
            'id' => 'fiche-' . time() . '-' . bin2hex(random_bytes(4)),
            'titre' => $input['titre'] ?? '',
            'contenu' => $input['contenu'] ?? '',
            'images' => $input['images'] ?? [],
            'dateCreated' => date('c'),
            'dateModified' => date('c')
        ];
        array_unshift($fiches, $nouvelleFiche);
    }

    if (saveFiches($storageFile, $fiches)) {
        echo json_encode(['success' => true, 'fiches' => $fiches]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur lors de la sauvegarde']);
    }
    exit;
}

// DELETE : Supprimer une fiche
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $ficheId = $_GET['id'] ?? null;

    if (!$ficheId) {
        http_response_code(400);
        echo json_encode(['error' => 'ID de fiche manquant']);
        exit;
    }

    $fiches = loadFiches($storageFile);
    $initialCount = count($fiches);

    // Supprimer les images associées
    $fiche = array_filter($fiches, fn($f) => $f['id'] === $ficheId);
    if (!empty($fiche)) {
        $fiche = reset($fiche);
        if (isset($fiche['images'])) {
            foreach ($fiche['images'] as $img) {
                if (isset($img['data']) && str_contains($img['data'], 'api/images_fiches/')) {
                    $imagePath = __DIR__ . '/' . str_replace('https://' . $_SERVER['HTTP_HOST'] . '/api/', '', $img['data']);
                    if (file_exists($imagePath)) {
                        @unlink($imagePath);
                    }
                }
            }
        }
    }

    // Supprimer la fiche
    $fiches = array_filter($fiches, fn($f) => $f['id'] !== $ficheId);
    $fiches = array_values($fiches);

    if (count($fiches) < $initialCount) {
        saveFiches($storageFile, $fiches);
        echo json_encode(['success' => true, 'message' => 'Fiche supprimée']);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Fiche non trouvée']);
    }
    exit;
}

// Méthode non supportée
http_response_code(405);
echo json_encode(['error' => 'Méthode non supportée']);

