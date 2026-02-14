<?php
/**
 * API pour les Fiches Méthodes - Stockage collaboratif
 * 
 * Endpoints:
 * - GET /api/fiches.php : Récupère toutes les fiches
 * - POST /api/fiches.php : Crée ou modifie une fiche
 * - DELETE /api/fiches.php?id=xxx : Supprime une fiche
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
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Gérer les requêtes OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Hôte du site (évite l'injection Host header)
define('SITE_HOST', 'jcsm.fr');

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
    // Limite de taille : 5 MB en base64
    if (strlen($base64Data) > 5 * 1024 * 1024 * 1.37) {
        return null;
    }

    // Valider le type MIME
    $allowedTypes = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
    if (preg_match('/^data:image\/(\w+);base64,/', $base64Data, $matches)) {
        $imageType = $matches[1];
        if (!in_array(strtolower($imageType), $allowedTypes)) {
            return null;
        }

        $imageData = base64_decode(substr($base64Data, strpos($base64Data, ',') + 1), true);
        if ($imageData === false) return null;

        // Verify actual MIME type of decoded image data
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $actualMime = $finfo->buffer($imageData);
        $allowedMimes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
        if (!in_array($actualMime, $allowedMimes, true)) {
            return null;
        }

        // Derive extension from actual MIME type, not user-provided header
        $mimeToExt = ['image/png' => 'png', 'image/jpeg' => 'jpg', 'image/gif' => 'gif', 'image/webp' => 'webp'];
        $extension = $mimeToExt[$actualMime] ?? null;
        if ($extension === null) return null;

        // Sanitize imageId to prevent path traversal
        $safeId = preg_replace('/[^a-zA-Z0-9_-]/', '', $imageId);
        $filename = $safeId . '.' . $extension;
        $filepath = $imagesDir . $filename;

        // Verify the resolved path is within imagesDir
        $realDir = realpath($imagesDir);
        if ($realDir === false) return null;
        $realPath = realpath(dirname($filepath));
        if ($realPath === false || strpos($realPath, $realDir) !== 0) return null;

        if (file_put_contents($filepath, $imageData)) {
            return 'api/images_fiches/' . $filename;
        }
    }
    return null;
}

// GET : Récupérer toutes les fiches (authentification requise)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    requireAuth();
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
                        $img['data'] = 'https://' . SITE_HOST . '/' . $img['data'];
                    }
                }
            }
        }
    }

    echo json_encode($fiches, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

// POST : Créer ou modifier une fiche (authentification requise)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAuth();
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Données invalides']);
        exit;
    }

    // Limiter le nombre d'images par fiche (anti-DoS)
    if (isset($input['images']) && is_array($input['images']) && count($input['images']) > 20) {
        http_response_code(400);
        echo json_encode(['error' => 'Maximum 20 images par fiche']);
        exit;
    }

    // File locking to prevent race conditions
    $lockFile = $storageFile . '.lock';
    $lockFp = fopen($lockFile, 'c');
    if (!$lockFp || !flock($lockFp, LOCK_EX)) {
        http_response_code(503);
        echo json_encode(['error' => 'Serveur occupé, réessayez']);
        exit;
    }

    try {
        $fiches = loadFiches($storageFile);

        // Traiter les images
        if (isset($input['images']) && is_array($input['images'])) {
            foreach ($input['images'] as &$img) {
                if (str_starts_with($img['data'], 'data:image/')) {
                    $imagePath = saveImage($img['data'], $img['id'], $imagesDir);
                    if ($imagePath) {
                        $img['data'] = 'https://' . SITE_HOST . '/' . $imagePath;
                    }
                }
            }
        }

        if (isset($input['id'])) {
            $index = array_search($input['id'], array_column($fiches, 'id'));
            if ($index !== false) {
                $fiches[$index] = array_merge($fiches[$index], $input);
                $fiches[$index]['dateModified'] = date('c');
            } else {
                flock($lockFp, LOCK_UN);
                fclose($lockFp);
                http_response_code(404);
                echo json_encode(['error' => 'Fiche non trouvée']);
                exit;
            }
        } else {
            $nouvelleFiche = [
                'id' => 'fiche-' . bin2hex(random_bytes(16)),
                'titre' => $input['titre'] ?? '',
                'contenu' => $input['contenu'] ?? '',
                'images' => $input['images'] ?? [],
                'dateCreated' => date('c'),
                'dateModified' => date('c')
            ];
            array_unshift($fiches, $nouvelleFiche);
        }

        $saved = saveFiches($storageFile, $fiches);
    } finally {
        flock($lockFp, LOCK_UN);
        fclose($lockFp);
    }

    if ($saved) {
        echo json_encode(['success' => true, 'fiches' => $fiches]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur lors de la sauvegarde']);
    }
    exit;
}

// DELETE : Supprimer une fiche (authentification requise)
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    requireAuth();
    $ficheId = $_GET['id'] ?? null;

    if (!$ficheId) {
        http_response_code(400);
        echo json_encode(['error' => 'ID de fiche manquant']);
        exit;
    }

    // File locking
    $lockFile = $storageFile . '.lock';
    $lockFp = fopen($lockFile, 'c');
    if (!$lockFp || !flock($lockFp, LOCK_EX)) {
        http_response_code(503);
        echo json_encode(['error' => 'Serveur occupé, réessayez']);
        exit;
    }

    try {
        $fiches = loadFiches($storageFile);
        $initialCount = count($fiches);

        // Supprimer les images associées (avec vérification de chemin)
        $fiche = array_filter($fiches, fn($f) => $f['id'] === $ficheId);
        if (!empty($fiche)) {
            $fiche = reset($fiche);
            if (isset($fiche['images'])) {
                $realImagesDir = realpath($imagesDir);
                foreach ($fiche['images'] as $img) {
                    if (isset($img['data']) && str_contains($img['data'], 'api/images_fiches/')) {
                        $imagePath = __DIR__ . '/' . str_replace('https://' . SITE_HOST . '/api/', '', $img['data']);
                        $realImagePath = realpath($imagePath);
                        if ($realImagePath && $realImagesDir && strpos($realImagePath, $realImagesDir) === 0 && file_exists($realImagePath)) {
                            @unlink($realImagePath);
                        }
                    }
                }
            }
        }

        $fiches = array_filter($fiches, fn($f) => $f['id'] !== $ficheId);
        $fiches = array_values($fiches);

        if (count($fiches) < $initialCount) {
            saveFiches($storageFile, $fiches);
            $deleted = true;
        } else {
            $deleted = false;
        }
    } finally {
        flock($lockFp, LOCK_UN);
        fclose($lockFp);
    }

    if ($deleted) {
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

