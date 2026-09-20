# Script CSP et publication

Après toute modification HTML directe, exécuter `sudo /usr/local/sbin/refresh-static-csp.py && sudo systemctl reload nginx`. Le script deploy.sh le fait après la publication et après restauration. Les cartes Nginx sont générées à partir des scripts et gestionnaires inline exacts. Sauvegarde initiale : /var/backups/site-quality-20260920/csp. Ne pas modifier le HTML puis oublier cette étape.
