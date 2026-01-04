# Guide de Connexion GitHub et Déploiement

Ce guide vous explique comment connecter votre projet local à GitHub pour sauvegarder votre code et le déployer.

## 1. Créer un Repository sur GitHub

1.  Connectez-vous à [GitHub.com](https://github.com).
2.  Cliquez sur le bouton **+** en haut à droite et sélectionnez **New repository**.
3.  Donnez un nom à votre projet (ex: `jcsm-site-final`).
4.  Laissez en **Public** ou **Private** selon votre choix.
5.  Ne cochez **pas** "Initialize this repository with a README".
6.  Cliquez sur **Create repository**.

## 2. Connecter votre Dossier Local

Ouvrez un terminal (ou utilisez celui intégré à VS Code) dans le dossier de votre projet (`/Users/auxence/Desktop/JCSM/Final`).

Exécutez les commandes suivantes une par une :

```bash
# Initialiser git si ce n'est pas déjà fait
git init

# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "Version finale site JCSM avec données réelles"

# Renommer la branche principale en 'main'
git branch -M main

# Ajouter l'adresse de votre nouveau repository GitHub
# REMPLACEZ L'URL CI-DESSOUS par celle de votre repository (ex: https://github.com/votre-pseudo/jcsm-site-final.git)
git remote add origin https://github.com/VOTRE_NOM_UTILISATEUR/NOM_DU_PROJET.git

# Pousser les fichiers vers GitHub
git push -u origin main
```

## 3. Problèmes Courants

### Erreur d'Authentification (Mot de passe)
Depuis 2021, GitHub n'accepte plus les mots de passe compte pour le HTTPS. Vous devez utiliser un **Personal Access Token**.

1.  Allez dans GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic).
2.  Générez un nouveau token avec les droits `repo`.
3.  Quand le terminal vous demande votre mot de passe, collez ce token.

### "Remote origin already exists"
Si vous avez déjà connecté un autre git :
```bash
git remote remove origin
# Puis recommencez la commande git remote add...
```

## 4. Hébergement Gratuit (GitHub Pages)

Une fois votre code sur GitHub :
1.  Allez dans l'onglet **Settings** de votre repository.
2.  Cliquez sur **Pages** dans le menu de gauche.
3.  Sous **Build and deployment** > **Branch**, sélectionnez `main` et le dossier `/ (root)`.
4.  Cliquez sur **Save**.
5.  Votre site sera accessible quelques minutes plus tard à l'adresse : `https://votre-pseudo.github.io/nom-du-projet/`.
