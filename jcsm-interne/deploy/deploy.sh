#!/bin/bash
# JCSM Interne — Script de déploiement VPS
set -e

DEPLOY_DIR="/var/www/jcsm-interne"

echo "=== JCSM Interne — Déploiement ==="

# 1. Structure
echo "[1/7] Création de la structure..."
sudo mkdir -p "$DEPLOY_DIR"/{uploads,uploads/rapports}
sudo chown -R www-data:www-data "$DEPLOY_DIR"

# 2. Copie du code (adapter selon git clone ou scp)
echo "[2/7] Copie du code..."
# sudo cp -r ./backend ./frontend ./deploy "$DEPLOY_DIR/"
# OU: cd "$DEPLOY_DIR" && git pull

# 3. Python venv + dépendances
echo "[3/7] Installation Python..."
cd "$DEPLOY_DIR"
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt

# 4. Base de données
echo "[4/7] Configuration BDD..."
sudo -u postgres createdb jcsm_interne 2>/dev/null || echo "BDD existe déjà"
cd backend
alembic upgrade head

# 5. Fichier .env
echo "[5/7] Configuration .env..."
if [ ! -f "$DEPLOY_DIR/.env" ]; then
    cp "$DEPLOY_DIR/.env.example" "$DEPLOY_DIR/.env"
    echo ">>> IMPORTANT: Éditez $DEPLOY_DIR/.env avec les vraies valeurs!"
fi

# 6. Service systemd
echo "[6/7] Installation du service..."
sudo cp "$DEPLOY_DIR/deploy/jcsm-interne.service" /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable jcsm-interne
sudo systemctl restart jcsm-interne

# 7. Nginx
echo "[7/7] Configuration Nginx..."
# Ajouter le contenu de nginx.conf dans le server block existant
# sudo nginx -t && sudo systemctl reload nginx

echo "=== Déploiement terminé ==="
echo "API:       http://localhost:8000/api/health"
echo "Frontend:  https://jcsm.fr/interne"
