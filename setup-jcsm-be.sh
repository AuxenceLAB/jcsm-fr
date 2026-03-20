#!/bin/bash
# Setup jcsm.be — run when DNS is propagated
# Check: dig +short jcsm.be A @8.8.8.8 should return 141.94.250.203

set -e

echo "=== Checking DNS propagation ==="
IP=$(dig +short jcsm.be A @8.8.8.8 2>/dev/null)
if [ "$IP" != "141.94.250.203" ]; then
    echo "❌ DNS not propagated yet (got: '$IP', expected: 141.94.250.203)"
    echo "   Try again later."
    exit 1
fi
echo "✅ DNS propagated!"

echo ""
echo "=== Obtaining SSL certificate ==="
sudo certbot certonly --nginx -d jcsm.be -d www.jcsm.be --non-interactive --agree-tos

echo ""
echo "=== Enabling nginx site ==="
sudo ln -sf /etc/nginx/sites-available/jcsm.be /etc/nginx/sites-enabled/jcsm.be

echo ""
echo "=== Testing nginx config ==="
sudo nginx -t

echo ""
echo "=== Reloading nginx ==="
sudo systemctl reload nginx

echo ""
echo "✅ jcsm.be is live!"
echo "   jcsm.be        → https://jcsm.fr/zones/belgique"
echo "   jcsm.be/nl     → https://jcsm.fr/nl/"
echo "   jcsm.be/*      → https://jcsm.fr/*"
