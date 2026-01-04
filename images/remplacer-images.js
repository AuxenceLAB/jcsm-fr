#!/usr/bin/env node

/**
 * Script pour remplacer automatiquement les URLs Unsplash par les fichiers locaux
 * Usage: node remplacer-images.js
 */

const fs = require('fs');
const path = require('path');

// Mapping des URLs Unsplash vers les noms de fichiers locaux
const imageMapping = {
    // Page d'accueil
    'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800&q=80&fit=crop&auto=format': 'hero-accueil.jpg',
    
    // Installation et Conformité
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80&fit=crop&auto=format': 'hero-installation.jpg',
    
    // Mise en Service
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80&fit=crop&auto=format': 'hero-maintenance.jpg',
    
    // Centre d'Appel
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80&fit=crop&auto=format': 'hero-centre-appel.jpg',
    
    // Pilotage de Projets
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&fit=crop&auto=format': 'hero-projet-irve.jpg',
    
    // Sécurisation - Hero
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&fit=crop&auto=format': 'hero-securisation.jpg',
    
    // Sécurisation - Câble protégé (600x400)
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=75&fit=crop&auto=format': 'cable-protege.jpg',
    
    // Sécurisation - Pack Protection (400x300)
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=75&fit=crop&auto=format': 'pack-protection-cable.jpg',
    
    // Sécurisation - Pack Caméra (400x300)
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&q=75&fit=crop&auto=format': 'pack-camera-surveillance.jpg',
    
    // Sécurisation - Pack Alarme (400x300) - même URL que protection, besoin de contexte
    // Note: Cette URL est utilisée deux fois dans securisation-installations.html
    // Il faudra vérifier manuellement laquelle correspond à l'alarme
};

// Fichiers HTML à traiter
const htmlFiles = [
    'index.html',
    'installation-conformite.html',
    'mise-en-service.html',
    'centre-appel.html',
    'pilotage-projets.html',
    'securisation-installations.html'
];

function replaceImagesInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Remplacer chaque URL Unsplash par le nom de fichier local
    for (const [unsplashUrl, localFile] of Object.entries(imageMapping)) {
        // Créer une regex pour matcher l'URL avec ou sans paramètres
        const urlPattern = unsplashUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(urlPattern.replace(/\\w=\\d+&q=\\d+&fit=crop&auto=format/g, '.*'), 'g');
        
        if (content.includes(unsplashUrl) || regex.test(content)) {
            // Remplacer l'URL complète
            content = content.replace(new RegExp(unsplashUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), localFile);
            modified = true;
            console.log(`✓ ${filePath}: Remplacé par ${localFile}`);
        }
    }
    
    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    }
    return false;
}

// Exécuter le remplacement
console.log('🔄 Remplacement des images Unsplash par les fichiers locaux...\n');

let totalReplaced = 0;
htmlFiles.forEach(file => {
    if (fs.existsSync(file)) {
        if (replaceImagesInFile(file)) {
            totalReplaced++;
        }
    } else {
        console.log(`⚠️  Fichier non trouvé: ${file}`);
    }
});

console.log(`\n✅ Terminé ! ${totalReplaced} fichier(s) modifié(s).`);
console.log('\n📝 Note: Vérifiez manuellement securisation-installations.html');
console.log('   car certaines URLs Unsplash sont utilisées plusieurs fois.');

