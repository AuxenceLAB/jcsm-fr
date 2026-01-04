<?php
header('Content-Type: application/json');

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

header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gérer les requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Vérifier que c'est une requête GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
    exit;
}

// Chemin du dossier public pour les rapports
$rapportsDir = dirname(dirname(__FILE__)) . '/rapports/';

// Alternative : chemin absolu si nécessaire
// $rapportsDir = '/var/www/jcsm.fr/public/rapports/';

// Vérifier que le dossier existe
if (!is_dir($rapportsDir)) {
    echo json_encode(['success' => true, 'rapports' => []]);
    exit;
}

// Lire tous les fichiers JSON dans le dossier
$rapports = [];
$files = glob($rapportsDir . 'Rapport_*.json');

foreach ($files as $file) {
    $content = file_get_contents($file);
    $data = json_decode($content, true);

    if ($data && is_array($data)) {
        // Extraire le nom du fichier
        $filename = basename($file);
        $baseUrl = 'https://jcsm.fr/rapports/';

        // Construire les URLs des différents formats
        $jsonUrl = $baseUrl . rawurlencode($filename);
        $htmlUrl = $baseUrl . rawurlencode(str_replace('.json', '.html', $filename));
        $docxUrl = $baseUrl . rawurlencode(str_replace('.json', '.docx', $filename));
        $rtfUrl = $baseUrl . rawurlencode(str_replace('.json', '.rtf', $filename));

        // Vérifier quels fichiers existent réellement
        $htmlFile = str_replace('.json', '.html', $file);
        $docxFile = str_replace('.json', '.docx', $file);
        $rtfFile = str_replace('.json', '.rtf', $file);

        $rapport = [
            'filename' => $filename,
            'ticket' => $data['ticket'] ?? '',
            'nomSite' => $data['nomSite'] ?? '',
            'adresse' => $data['adresse'] ?? '',
            'dateIntervention' => $data['dateIntervention'] ?? '',
            'heureArrivee' => $data['heureArrivee'] ?? '',
            'heureDepart' => $data['heureDepart'] ?? '',
            'probleme' => $data['probleme'] ?? '',
            'actionRealisee' => $data['actionRealisee'] ?? '',
            'statut' => $data['statut'] ?? '',
            'piecesChangees' => $data['piecesChangees'] ?? '',
            'remarques' => $data['remarques'] ?? '',
            'dateCreation' => $data['dateCreation'] ?? date('Y-m-d H:i:s', filemtime($file)),
            'url' => $jsonUrl,
            'htmlUrl' => file_exists($htmlFile) ? $htmlUrl : null,
            'docxUrl' => file_exists($docxFile) ? $docxUrl : (file_exists($rtfFile) ? $rtfUrl : null)
        ];

        $rapports[] = $rapport;
    }
}

// Trier par date de création décroissante
usort($rapports, function ($a, $b) {
    $dateA = $a['dateCreation'] ?? '';
    $dateB = $b['dateCreation'] ?? '';
    return strcmp($dateB, $dateA);
});

// Toujours retourner un JSON valide avec la structure attendue
echo json_encode(['success' => true, 'rapports' => $rapports]);

