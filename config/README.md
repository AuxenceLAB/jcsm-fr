# Configuration serveur JCSM

Backup des fichiers de configuration du serveur de production.

## Structure

```
config/
  nginx/
    nginx.conf                  # Config principale nginx
    conf.d/
      security.conf             # Headers securite globaux
      limits.conf               # Rate limiting / connexions
      catch-all-https.conf      # Catch-all HTTPS
    snippets/
      security.conf             # Headers securite (inclus par location)
      fastcgi-php.conf          # Config PHP-FPM
      cloudflare-realip.conf    # Plages IP Cloudflare -> IP reelle du visiteur
    sites-enabled/
      jcsm.fr                   # Site principal
      jcsm-cloud                # jcsm.cloud
      n8n.jcsm.cloud            # n8n (webhooks)
      status.jcsm.cloud         # Status page
      aixo                      # aixo.pro
  .env.gpg                      # Variables d'environnement chiffrees (AES-256, passphrase symetrique)
```

## Restaurer le .env

```bash
gpg -d config/.env.gpg > .env
chmod 640 .env
sudo chown auxence:www-data .env
```

## Restaurer nginx

```bash
sudo cp config/nginx/nginx.conf /etc/nginx/
sudo cp config/nginx/conf.d/* /etc/nginx/conf.d/
sudo cp config/nginx/snippets/security.conf /etc/nginx/snippets/
sudo cp config/nginx/snippets/fastcgi-php.conf /etc/nginx/snippets/
sudo cp config/nginx/snippets/cloudflare-realip.conf /etc/nginx/snippets/
sudo cp config/nginx/sites-enabled/* /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Le snippet `cloudflare-realip.conf` necessite le module `ngx_http_realip_module`
(present dans le paquet nginx Debian : `nginx -V 2>&1 | grep -o http_realip_module`).
Les plages IP Cloudflare evoluent rarement ; les rafraichir depuis
https://www.cloudflare.com/ips-v4 et https://www.cloudflare.com/ips-v6 (date de
releve en tete du fichier).

## Restaurer SSL (Certbot + Cloudflare)

Les certificats ne sont pas sauvegardes (ils expirent). Les regenerer :

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d jcsm.fr -d www.jcsm.fr
```

## Infra

- **OS** : Debian 13 (cloud)
- **PHP** : 8.4-FPM (socket /run/php/php8.4-fpm.sock)
- **DNS/CDN** : Cloudflare (proxy actif)
- **SSL** : Certbot (Let's Encrypt) derriere Cloudflare
- **Webhooks** : n8n sur n8n.jcsm.cloud
