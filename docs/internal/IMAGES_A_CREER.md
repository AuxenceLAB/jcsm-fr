# Liste des Images à Créer pour JCSM

## Images existantes (à conserver)
- `logo.png` - Logo JCSM (utilisé partout)
- `alarme.jpg` - Alarme sonore (utilisé dans securisation.html)
- `cablecoupe.jpg` - Câble coupé (utilisé dans securisation.html)
- `camera.jpg` - Caméra de surveillance (utilisé dans securisation.html)
- `protection.jpg` - Protection de câble (utilisé dans securisation.html)
- `support.png` - Support client (utilisé dans centre-appel.html - ancienne version)

---

## Images à créer (pour remplacer les URLs Unsplash)

### 📄 Page d'accueil (`index.html`)
**Hero Section :**
- `hero-accueil.jpg` ou `hero-accueil.png`
  - Description : Borne de recharge électrique moderne
  - Dimensions recommandées : 800x600px
  - Format : JPG (optimisé) ou PNG
  - Usage : Image principale hero section

---

### 📄 Installation et Conformité (`installation-conformite.html`)
**Hero Section :**
- `hero-installation.jpg` ou `hero-installation.png`
  - Description : Technicien installant une borne de recharge IRVE
  - Dimensions recommandées : 800x600px
  - Format : JPG (optimisé)
  - Usage : Image principale hero section

---

### 📄 Mise en Service (`mise-en-service.html`)
**Hero Section :**
- `hero-maintenance.jpg` ou `hero-maintenance.png`
  - Description : Technicien en intervention de maintenance IRVE
  - Dimensions recommandées : 800x600px
  - Format : JPG (optimisé)
  - Usage : Image principale hero section

---

### 📄 Sécurisation (`securisation-installations.html`)
**Hero Section :**
- `hero-securisation.jpg` ou `hero-securisation.png`
  - Description : Station de recharge sécurisée avec protection anti-vandalisme
  - Dimensions recommandées : 800x600px
  - Format : JPG (optimisé)
  - Usage : Image principale hero section

**Section Problème :**
- `cable-protege.jpg`
  - Description : Câble de borne de recharge protégé contre le vandalisme
  - Dimensions recommandées : 600x400px
  - Format : JPG (optimisé)
  - Usage : Image illustrant la protection

**Pack Protection :**
- `pack-protection-cable.jpg`
  - Description : Protection de câble de recharge IRVE (détail)
  - Dimensions recommandées : 400x300px
  - Format : JPG (optimisé)
  - Usage : Image dans la carte "Pack Protection"

**Pack Caméra :**
- `pack-camera-surveillance.jpg`
  - Description : Caméra de surveillance pour station de recharge
  - Dimensions recommandées : 400x300px
  - Format : JPG (optimisé)
  - Usage : Image dans la carte "Pack Caméra"

**Pack Alarme :**
- `pack-alarme-securite.jpg`
  - Description : Système d'alarme pour protection des bornes IRVE
  - Dimensions recommandées : 400x300px
  - Format : JPG (optimisé)
  - Usage : Image dans la carte "Pack Alarme"

---

### 📄 Pilotage de Projets (`pilotage-projets.html`)
**Hero Section :**
- `hero-projet-irve.jpg` ou `hero-projet-irve.png`
  - Description : Station de recharge électrique moderne (vue aérienne ou vue d'ensemble)
  - Dimensions recommandées : 800x600px
  - Format : JPG (optimisé) ou PNG
  - Usage : Image principale hero section

---

### 📄 Centre d'Appel (`centre-appel.html`)
**Hero Section :**
- `hero-centre-appel.jpg` ou `hero-centre-appel.png`
  - Description : Opératrice de centre d'appel pour support technique IRVE
  - Dimensions recommandées : 800x600px
  - Format : JPG (optimisé)
  - Usage : Image principale hero section

---

## 📋 Résumé des noms de fichiers

### Images Hero (800x600px recommandé)
1. `hero-accueil.jpg` - Page d'accueil
2. `hero-installation.jpg` - Installation et Conformité
3. `hero-maintenance.jpg` - Mise en Service
4. `hero-securisation.jpg` - Sécurisation
5. `hero-projet-irve.jpg` - Pilotage de Projets
6. `hero-centre-appel.jpg` - Centre d'Appel

### Images Sécurisation (détails)
7. `cable-protege.jpg` - Câble protégé (600x400px)
8. `pack-protection-cable.jpg` - Détail protection (400x300px)
9. `pack-camera-surveillance.jpg` - Caméra (400x300px)
10. `pack-alarme-securite.jpg` - Alarme (400x300px)

---

## 💡 Recommandations

### Format et Optimisation
- **Format** : JPG pour les photos, PNG pour les logos/illustrations
- **Qualité** : 80-85% pour JPG (bon compromis qualité/poids)
- **Poids cible** : 
  - Images Hero : < 200KB
  - Images détails : < 100KB
- **Optimisation** : Utiliser TinyPNG, ImageOptim ou Squoosh avant upload

### Dimensions
- **Hero images** : 1600x1200px (pour retina) ou 800x600px (standard)
- **Images détails** : 800x600px (pour retina) ou 400x300px (standard)
- **Ratio** : 4:3 ou 16:9 selon le design

### Naming Convention
- Utiliser des noms descriptifs en minuscules
- Séparer les mots par des tirets (-)
- Inclure le type d'image (hero, pack, etc.)
- Éviter les accents et caractères spéciaux

---

## 🔄 Remplacement dans le code

Une fois les images créées, remplacer dans les fichiers HTML :
- `https://images.unsplash.com/...` → `nom-du-fichier.jpg`

Les attributs `width` et `height` sont déjà présents pour éviter le layout shift.

