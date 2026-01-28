# API de Sauvegarde des Rapports d'Intervention

## Fonctionnalités

L'API `save-rapport.php` génère automatiquement **3 formats** pour chaque rapport :

1. **JSON** : Données structurées
2. **HTML** : Version lisible dans le navigateur
3. **Word (.docx ou .rtf)** : Document éditable dans Microsoft Word

## Installation

### Option 1 : PHPWord (Recommandé - génère de vrais fichiers .docx)

```bash
cd /var/www/jcsm.fr/public/api
composer require phpoffice/phpword
```

### Option 2 : Pandoc (Alternative - conversion HTML → DOCX)

```bash
sudo apt-get install pandoc  # Sur Debian/Ubuntu
# ou
brew install pandoc  # Sur macOS
```

### Option 3 : Aucune installation (Fallback RTF)

Si aucune des options ci-dessus n'est installée, le système génère automatiquement un fichier **RTF** qui est parfaitement lisible par Microsoft Word. Word peut ouvrir le RTF et le convertir en DOCX si nécessaire.

## Structure des fichiers générés

Pour chaque rapport, 3 fichiers sont créés dans `/var/www/jcsm.fr/public/rapport intervention/` :

- `Rapport_{TICKET}_{DATE}_{TIMESTAMP}.json`
- `Rapport_{TICKET}_{DATE}_{TIMESTAMP}.html`
- `Rapport_{TICKET}_{DATE}_{TIMESTAMP}.docx` (ou `.rtf` si PHPWord/Pandoc non disponible)

## Accès public

Les fichiers sont accessibles via :
- `https://jcsm.fr/rapport%20intervention/Rapport_XXX.json`
- `https://jcsm.fr/rapport%20intervention/Rapport_XXX.html`
- `https://jcsm.fr/rapport%20intervention/Rapport_XXX.docx`

## Configuration serveur

1. Créer le dossier :
```bash
mkdir -p /var/www/jcsm.fr/public/rapport\ intervention
chmod 755 /var/www/jcsm.fr/public/rapport\ intervention
chown www-data:www-data /var/www/jcsm.fr/public/rapport\ intervention
```

2. Vérifier les permissions d'écriture pour le serveur web

