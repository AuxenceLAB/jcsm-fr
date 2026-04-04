<?php
/**
 * Google Reviews API Proxy
 * Fetches reviews from Google Places API, caches for 24h.
 * No auth required (public endpoint, read-only cached data).
 */

header('Content-Type: application/json; charset=utf-8');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, ['https://jcsm.fr', 'https://www.jcsm.fr'], true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}

header('Cache-Control: public, max-age=3600');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$cacheFile = __DIR__ . '/google-reviews-cache.json';
$cacheTTL = 86400; // 24 hours

// Serve from cache if fresh
if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheTTL) {
    echo file_get_contents($cacheFile);
    exit;
}

// Load API key from .env
require_once __DIR__ . '/helpers.php';
$apiKey = loadEnvVar('GOOGLE_PLACES_API_KEY');
$placeId = loadEnvVar('GOOGLE_PLACE_ID');

if (!$apiKey || !$placeId) {
    if (file_exists($cacheFile)) {
        echo file_get_contents($cacheFile);
    } else {
        echo json_encode(['rating' => 4.8, 'total' => 0, 'reviews' => []]);
    }
    exit;
}

$url = 'https://maps.googleapis.com/maps/api/place/details/json?'
     . http_build_query([
         'place_id' => $placeId,
         'fields'   => 'rating,user_ratings_total,reviews',
         'language' => 'fr',
         'key'      => $apiKey,
     ]);

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 10,
    CURLOPT_SSL_VERIFYPEER => true,
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200 || !$response) {
    if (file_exists($cacheFile)) {
        echo file_get_contents($cacheFile);
    } else {
        echo json_encode(['rating' => 4.8, 'total' => 0, 'reviews' => []]);
    }
    exit;
}

$data = json_decode($response, true);
if (!isset($data['result'])) {
    if (file_exists($cacheFile)) {
        echo file_get_contents($cacheFile);
    } else {
        echo json_encode(['rating' => 4.8, 'total' => 0, 'reviews' => []]);
    }
    exit;
}

$result = $data['result'];
$reviews = [];

if (isset($result['reviews']) && is_array($result['reviews'])) {
    foreach (array_slice($result['reviews'], 0, 5) as $r) {
        $reviews[] = [
            'author'  => htmlspecialchars($r['author_name'] ?? '', ENT_QUOTES, 'UTF-8'),
            'rating'  => (int)($r['rating'] ?? 5),
            'text'    => htmlspecialchars(
                mb_substr($r['text'] ?? '', 0, 200, 'UTF-8'),
                ENT_QUOTES, 'UTF-8'
            ),
            'time'    => htmlspecialchars($r['relative_time_description'] ?? '', ENT_QUOTES, 'UTF-8'),
            'photo'   => $r['profile_photo_url'] ?? '',
        ];
    }
}

$output = json_encode([
    'rating'  => round((float)($result['rating'] ?? 4.8), 1),
    'total'   => (int)($result['user_ratings_total'] ?? 0),
    'reviews' => $reviews,
], JSON_UNESCAPED_UNICODE);

file_put_contents($cacheFile, $output, LOCK_EX);

echo $output;
