<?php
// Charger PHPWord si disponible (via Composer)
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
}

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gérer les requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Vérifier que c'est une requête POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
    exit;
}

// Lire les données JSON
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Données JSON invalides']);
    exit;
}

// Chemin du dossier public pour les rapports
// Si le script est dans /var/www/jcsm.fr/public/api/, le dossier rapport est à /var/www/jcsm.fr/public/rapports/
// Chemin relatif depuis le script : remonter de api/ vers le dossier public
$rapportsDir = dirname(dirname(__FILE__)) . '/rapports/';

// Alternative : chemin absolu si nécessaire (décommenter et ajuster si besoin)
// $rapportsDir = '/var/www/jcsm.fr/public/rapports/';

// Créer le dossier s'il n'existe pas
if (!is_dir($rapportsDir)) {
    if (!mkdir($rapportsDir, 0755, true)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Impossible de créer le dossier de rapports']);
        exit;
    }
}

// Générer un nom de fichier unique
$ticket = isset($data['ticket']) ? preg_replace('/[^a-zA-Z0-9_-]/', '_', $data['ticket']) : 'RAPPORT';
$dateIntervention = isset($data['dateIntervention']) ? $data['dateIntervention'] : date('Y-m-d');
$timestamp = date('Ymd_His');
$filename = "Rapport_{$ticket}_{$dateIntervention}_{$timestamp}.json";

// Chemin complet du fichier
$filepath = $rapportsDir . $filename;

// Préparer les données à sauvegarder
$rapportData = [
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
    'dateCreation' => date('Y-m-d H:i:s'),
    'interventionId' => $data['interventionId'] ?? ''
];

// Sauvegarder le fichier JSON
if (file_put_contents($filepath, json_encode($rapportData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
    // Générer HTML puis convertir en Word (.docx)
    $htmlPath = str_replace('.json', '.html', $filepath);
    $docxPath = str_replace('.json', '.docx', $filepath);
    
    // Générer le HTML
    $html = generateHTML($rapportData);
    file_put_contents($htmlPath, $html);
    
    // Convertir HTML en Word (.docx)
    $docxGenerated = generateDOCX($rapportData, $docxPath);
    
    // URLs publiques
    $encodedFilename = rawurlencode($filename);
    $baseUrl = 'https://jcsm.fr/rapports/';
    
    $response = [
        'success' => true,
        'message' => 'Rapport sauvegardé avec succès',
        'filename' => $filename,
        'url' => $baseUrl . $encodedFilename,
        'files' => [
            'json' => $baseUrl . rawurlencode(str_replace('.json', '.json', $filename)),
            'html' => $baseUrl . rawurlencode(str_replace('.json', '.html', $filename)),
        ]
    ];
    
    if ($docxGenerated) {
        // Vérifier si c'est un .docx ou .rtf
        $docxFile = str_replace('.json', '.docx', $filename);
        $rtfFile = str_replace('.json', '.rtf', $filename);
        
        if (file_exists($rapportsDir . $docxFile)) {
            $response['files']['docx'] = $baseUrl . rawurlencode($docxFile);
        } elseif (file_exists($rapportsDir . $rtfFile)) {
            $response['files']['rtf'] = $baseUrl . rawurlencode($rtfFile);
            $response['files']['docx'] = $baseUrl . rawurlencode($rtfFile); // RTF lisible par Word
        }
    }
    
    echo json_encode($response);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erreur lors de l\'écriture du fichier']);
}

// Fonction pour générer le HTML
function generateHTML($data) {
    $date = date('d/m/Y', strtotime($data['dateIntervention']));
    $logoPath = 'https://jcsm.fr/images/logo.png'; // URL absolue pour le rapport final
    
    // Traitement des photos pour l'affichage
    $photosHtml = '';
    if (!empty($data['photos']) && is_array($data['photos'])) {
        $photosHtml = '<div class="section"><h2 class="section-title">Photos</h2><div class="photos-grid">';
        foreach ($data['photos'] as $photo) {
            // Si c'est du base64, on l'affiche directement
            if (strpos($photo, 'data:image') === 0) {
                $photosHtml .= '<div class="photo-item"><img src="' . $photo . '" alt="Photo intervention"></div>';
            }
        }
        $photosHtml .= '</div></div>';
    }

    return '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Rapport d\'Intervention - ' . htmlspecialchars($data['ticket']) . '</title>
    <style>
        body { font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; padding: 40px; max-width: 900px; margin: 0 auto; color: #1f2937; line-height: 1.6; background-color: #ffffff; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #000; padding-bottom: 20px; margin-bottom: 40px; }
        .logo-container img { height: 60px; }
        .doc-title { text-align: right; }
        .doc-title h1 { margin: 0; font-size: 24px; text-transform: uppercase; color: #000; letter-spacing: 1px; }
        .doc-title p { margin: 5px 0 0; color: #6b7280; font-size: 14px; }
        
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
        .info-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; }
        .info-box h3 { margin-top: 0; margin-bottom: 15px; color: #0070F3; font-size: 16px; text-transform: uppercase; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
        .info-row { display: flex; margin-bottom: 8px; }
        .info-label { font-weight: 600; width: 120px; color: #4b5563; }
        .info-value { flex: 1; color: #111827; }
        
        .section { margin-bottom: 30px; }
        .section-title { background: #000; color: #fff; padding: 10px 15px; font-size: 16px; text-transform: uppercase; border-radius: 4px; margin-bottom: 20px; }
        .content-box { border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; min-height: 100px; background: #fff; white-space: pre-wrap; }
        
        .photos-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .photo-item { border: 1px solid #e5e7eb; padding: 10px; border-radius: 8px; text-align: center; }
        .photo-item img { max-width: 100%; height: auto; max-height: 300px; object-fit: contain; }
        
        .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #9ca3af; }
        
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-weight: 600; font-size: 14px; }
        .status-success { background-color: #d1fae5; color: #065f46; }
        
        @media print {
            body { padding: 0; }
            .info-box, .content-box { border: 1px solid #ccc; }
        }
    </style>
</head>
<body>
    <div class="header">
    <div class="section">
        <p class="label">Action réalisée:</p>
        <p class="value">' . nl2br(htmlspecialchars($data['actionRealisee'])) . '</p>
    </div>
    
    <div class="section">
        <p><span class="label">Statut:</span> <span class="value">' . htmlspecialchars($data['statut']) . '</span></p>
        ' . (!empty($data['piecesChangees']) ? '<p class="label">Pièces changées:</p><p class="value">' . nl2br(htmlspecialchars($data['piecesChangees'])) . '</p>' : '') . '
        ' . (!empty($data['remarques']) ? '<p class="label">Remarques:</p><p class="value">' . nl2br(htmlspecialchars($data['remarques'])) . '</p>' : '') . '
    </div>
    
    <div class="section" style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
        <p>Rapport généré le ' . date('d/m/Y à H:i') . '</p>
    </div>
</body>
</html>';
    
}

// Fonction pour générer un document Word (.docx)
function generateDOCX($data, $outputPath) {
    // Méthode 1 : Utiliser PHPWord (recommandé - nécessite installation via Composer)
    // Installation: composer require phpoffice/phpword
    if (class_exists('PhpOffice\PhpWord\PhpWord')) {
        try {
            $phpWord = new \PhpOffice\PhpWord\PhpWord();
            
            // Section principale
            $section = $phpWord->addSection([
                'marginTop' => 1440,    // 2.5 cm
                'marginBottom' => 1440,
                'marginLeft' => 1440,
                'marginRight' => 1440,
            ]);
            
            // Titre
            $section->addText('Rapport d\'Intervention', [
                'bold' => true,
                'size' => 18,
                'color' => '0070F3'
            ], ['alignment' => 'center']);
            $section->addTextBreak(2);
            
            // En-tête avec informations principales
            $section->addText('INFORMATIONS GÉNÉRALES', ['bold' => true, 'size' => 12], ['bgColor' => 'F3F4F6']);
            $section->addTextBreak(1);
            $section->addText('Ticket: ' . htmlspecialchars($data['ticket'] ?? 'N/A'), ['size' => 11]);
            $section->addText('Site: ' . htmlspecialchars($data['nomSite'] ?? ''), ['size' => 11]);
            $section->addText('Adresse: ' . htmlspecialchars($data['adresse'] ?? ''), ['size' => 11]);
            $section->addTextBreak(1);
            
            // Dates et heures
            $section->addText('DÉTAILS DE L\'INTERVENTION', ['bold' => true, 'size' => 12], ['bgColor' => 'F3F4F6']);
            $section->addTextBreak(1);
            $section->addText('Date d\'intervention: ' . htmlspecialchars($data['dateIntervention'] ?? ''), ['size' => 11]);
            $section->addText('Heure d\'arrivée: ' . htmlspecialchars($data['heureArrivee'] ?? ''), ['size' => 11]);
            $section->addText('Heure de départ: ' . htmlspecialchars($data['heureDepart'] ?? ''), ['size' => 11]);
            $section->addTextBreak(1);
            
            // Problème constaté
            $section->addText('PROBLÈME CONSTATÉ', ['bold' => true, 'size' => 12], ['bgColor' => 'F3F4F6']);
            $section->addTextBreak(1);
            $section->addText(htmlspecialchars($data['probleme'] ?? ''), ['size' => 11]);
            $section->addTextBreak(1);
            
            // Action réalisée
            $section->addText('ACTION RÉALISÉE', ['bold' => true, 'size' => 12], ['bgColor' => 'F3F4F6']);
            $section->addTextBreak(1);
            $section->addText(htmlspecialchars($data['actionRealisee'] ?? ''), ['size' => 11]);
            $section->addTextBreak(1);
            
            // Statut
            $section->addText('Statut: ' . htmlspecialchars($data['statut'] ?? ''), ['bold' => true, 'size' => 11]);
            $section->addTextBreak(1);
            
            // Pièces changées (si présent)
            if (!empty($data['piecesChangees'])) {
                $section->addText('PIÈCES CHANGÉES', ['bold' => true, 'size' => 12], ['bgColor' => 'F3F4F6']);
                $section->addTextBreak(1);
                $section->addText(htmlspecialchars($data['piecesChangees']), ['size' => 11]);
                $section->addTextBreak(1);
            }
            
            // Remarques (si présent)
            if (!empty($data['remarques'])) {
                $section->addText('REMARQUES', ['bold' => true, 'size' => 12], ['bgColor' => 'F3F4F6']);
                $section->addTextBreak(1);
                $section->addText(htmlspecialchars($data['remarques']), ['size' => 11]);
                $section->addTextBreak(1);
            }
            
            // Pied de page
            $section->addTextBreak(2);
            $section->addText('Rapport généré le ' . date('d/m/Y à H:i'), [
                'italic' => true,
                'size' => 9,
                'color' => '666666'
            ], ['alignment' => 'right']);
            
            // Sauvegarder
            $objWriter = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'Word2007');
            $objWriter->save($outputPath);
            return true;
        } catch (Exception $e) {
            error_log('Erreur PHPWord: ' . $e->getMessage());
            return false;
        }
    }
    
    // Méthode 2 : Conversion HTML vers DOCX via Pandoc (si installé sur le serveur)
    // Nécessite: sudo apt-get install pandoc (sur Linux)
    $htmlPath = str_replace('.docx', '.html', $outputPath);
    if (file_exists($htmlPath) && shell_exec('which pandoc')) {
        $command = sprintf(
            'pandoc "%s" -o "%s" -f html -t docx 2>&1',
            escapeshellarg($htmlPath),
            escapeshellarg($outputPath)
        );
        exec($command, $output, $returnCode);
        if ($returnCode === 0 && file_exists($outputPath)) {
            return true;
        }
    }
    
    // Méthode 3 : Génération manuelle d'un fichier RTF (format texte riche, lisible par Word)
    return generateRTF($data, $outputPath);
}

// Fonction de fallback : générer un RTF (lisible par Word, peut être ouvert et sauvegardé en .docx)
function generateRTF($data, $outputPath) {
    // Générer un RTF qui sera lisible par Word
    // Word peut ouvrir les fichiers RTF et les convertir en DOCX
    $rtfPath = str_replace('.docx', '.rtf', $outputPath);
    
    $rtf = "{\\rtf1\\ansi\\ansicpg1252\\deff0\\nouicompat\\deflang1036\n";
    $rtf .= "{\\fonttbl{\\f0\\fnil\\fcharset0 Times New Roman;}}\n";
    $rtf .= "{\\colortbl ;\\red0\\green112\\blue243;\\red102\\green102\\blue102;}\n";
    $rtf .= "{\\*\\generator Rapport JCSM}\\viewkind4\\uc1\n";
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\f0\\fs22\\lang12\\par\n";
    
    // Titre centré
    $rtf .= "\\pard\\qc\\b\\fs36\\cf1 Rapport d'Intervention\\par\n";
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22\\par\n";
    
    // Informations générales
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\b\\fs24 INFORMATIONS GÉNÉRALES\\par\n";
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22\\par\n";
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22 Ticket: " . addslashes($data['ticket'] ?? 'N/A') . "\\par\n";
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22 Site: " . addslashes($data['nomSite'] ?? '') . "\\par\n";
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22 Adresse: " . addslashes($data['adresse'] ?? '') . "\\par\n";
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22\\par\n";
    
    // Détails
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\b\\fs24 DÉTAILS DE L'INTERVENTION\\par\n";
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22\\par\n";
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22 Date d'intervention: " . addslashes($data['dateIntervention'] ?? '') . "\\par\n";
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22 Heure d'arrivée: " . addslashes($data['heureArrivee'] ?? '') . "\\par\n";
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22 Heure de départ: " . addslashes($data['heureDepart'] ?? '') . "\\par\n";
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22\\par\n";
    
    // Problème
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\b\\fs24 PROBLÈME CONSTATÉ\\par\n";
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22\\par\n";
    $probleme = str_replace(["\r\n", "\n", "\r"], "\\par\n", addslashes($data['probleme'] ?? ''));
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22 " . $probleme . "\\par\n";
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22\\par\n";
    
    // Action
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\b\\fs24 ACTION RÉALISÉE\\par\n";
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22\\par\n";
    $action = str_replace(["\r\n", "\n", "\r"], "\\par\n", addslashes($data['actionRealisee'] ?? ''));
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22 " . $action . "\\par\n";
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22\\par\n";
    
    // Statut
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\b\\fs22 Statut: " . addslashes($data['statut'] ?? '') . "\\par\n";
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22\\par\n";
    
    if (!empty($data['piecesChangees'])) {
        $rtf .= "\\pard\\sa200\\sl276\\slmult1\\b\\fs24 PIÈCES CHANGÉES\\par\n";
        $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22\\par\n";
        $pieces = str_replace(["\r\n", "\n", "\r"], "\\par\n", addslashes($data['piecesChangees']));
        $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22 " . $pieces . "\\par\n";
        $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22\\par\n";
    }
    
    if (!empty($data['remarques'])) {
        $rtf .= "\\pard\\sa200\\sl276\\slmult1\\b\\fs24 REMARQUES\\par\n";
        $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22\\par\n";
        $remarques = str_replace(["\r\n", "\n", "\r"], "\\par\n", addslashes($data['remarques']));
        $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22 " . $remarques . "\\par\n";
    }
    
    $rtf .= "\\pard\\sa200\\sl276\\slmult1\\fs22\\par\n";
    $rtf .= "\\pard\\qr\\i\\fs18\\cf2 Rapport généré le " . date('d/m/Y à H:i') . "\\par\n";
    $rtf .= "}";
    
    if (file_put_contents($rtfPath, $rtf)) {
        // Le fichier RTF est créé, Word peut l'ouvrir et le convertir en DOCX
        // On retourne true même si c'est un RTF car Word peut l'ouvrir
        return true;
    }
    
    return false;
}

