<?php
/**
 * IndexNow URL Submission Script
 * Usage: php api/indexnow.php [--dry-run]
 * Submits all sitemap URLs to Bing and Yandex via IndexNow API
 */

// CLI only
if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    echo json_encode(['error' => 'CLI only']);
    exit(1);
}

$dryRun = in_array('--dry-run', $argv);
$key = '52627e09-49c7-4ff7-b394-ee4910cbef54';
$host = 'jcsm.fr';
$keyLocation = "https://{$host}/{$key}.txt";
$sitemapPath = __DIR__ . '/../sitemap.xml';

// Parse sitemap
$xml = simplexml_load_file($sitemapPath);
if (!$xml) {
    echo "ERROR: Cannot parse sitemap.xml\n";
    exit(1);
}

$xml->registerXPathNamespace('s', 'http://www.sitemaps.org/schemas/sitemap/0.9');
$urls = [];
foreach ($xml->xpath('//s:url/s:loc') as $loc) {
    $urls[] = (string) $loc;
}

$totalUrls = count($urls);
echo "Found {$totalUrls} URLs in sitemap.xml\n";

if ($dryRun) {
    echo "[DRY RUN] Would submit:\n";
    foreach ($urls as $url) {
        echo "  - {$url}\n";
    }
    exit(0);
}

// IndexNow endpoints
$endpoints = [
    'Bing'   => 'https://www.bing.com/indexnow',
    'Yandex' => 'https://yandex.com/indexnow',
];

// Submit in batches of 100 (IndexNow limit is 10,000)
$batchSize = 100;
$batches = array_chunk($urls, $batchSize);

foreach ($endpoints as $name => $endpoint) {
    echo "\n=== Submitting to {$name} ({$endpoint}) ===\n";
    
    foreach ($batches as $i => $batch) {
        $payload = json_encode([
            'host'        => $host,
            'key'         => $key,
            'keyLocation' => $keyLocation,
            'urlList'     => $batch,
        ]);

        $ch = curl_init($endpoint);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json; charset=utf-8',
                'Host: ' . parse_url($endpoint, PHP_URL_HOST),
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 30,
            CURLOPT_FOLLOWLOCATION => true,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        $batchNum = $i + 1;
        $batchCount = count($batch);
        
        if ($error) {
            echo "  Batch {$batchNum}: ERROR - {$error}\n";
        } elseif ($httpCode >= 200 && $httpCode < 300) {
            echo "  Batch {$batchNum}: OK (HTTP {$httpCode}) - {$batchCount} URLs submitted\n";
        } else {
            echo "  Batch {$batchNum}: FAILED (HTTP {$httpCode}) - {$batchCount} URLs\n";
            if ($response) {
                echo "  Response: {$response}\n";
            }
        }
    }
}

echo "\nDone! {$totalUrls} URLs submitted to " . count($endpoints) . " search engines.\n";
