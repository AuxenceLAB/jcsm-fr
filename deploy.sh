#!/usr/bin/env bash
# Déploiement du site statique jcsm.fr (nginx + PHP 8.4-FPM, racine /var/www/jcsm.fr).
#
# Le site est servi directement depuis ce dépôt : « déployer » = avancer la branche
# master (git pull --ff-only), reconstruire le CSS Tailwind si package.json existe,
# puis vérifier. Le script ne touche JAMAIS aux fichiers servis avant d'avoir validé
# la révision entrante (php -l, cohérence du cache-bust), et restaure la révision
# précédente si une vérification échoue après la bascule.
#
# Usage : ./deploy.sh
#   DEPLOY_NGINX=1 ./deploy.sh   installe dans /etc/nginx les fichiers de config/nginx/
#                                qui diffèrent (sauvegarde .bak-<date>), nginx -t, puis
#                                reload UNIQUEMENT si un fichier a changé
#   DEPLOY_PUSH=1 ./deploy.sh    pousse master vers GitHub à la fin (non bloquant)
#
# Sans DEPLOY_NGINX : nginx -t est exécuté (contrôle en lecture), les écarts entre
# config/nginx/ et /etc/nginx/ sont listés, aucun reload. Aucune interaction.
set -euo pipefail
cd "$(dirname "$0")"

BRANCH="${DEPLOY_BRANCH:-master}"
REMOTE=origin
PUBLIC_URL=https://jcsm.fr
HOST=jcsm.fr
LOCK=/tmp/jcsm-fr-deploy.lock
PHP_FPM_SERVICE=php8.4-fpm

WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT
OLD_REV=""
PULLED=0
WARNINGS=0
warn() { echo "AVERTISSEMENT : $*" >&2; WARNINGS=$((WARNINGS + 1)); }
die()  { echo "ERREUR : $*" >&2; exit 1; }

# ---------------------------------------------------------------- Contrôles purs
# check_php DIR : php -l sur chaque api/*.php du dossier ; échoue au premier défaut.
check_php() {
  local dir=$1 f fautes=0 total=0
  for f in "$dir"/api/*.php; do
    [ -e "$f" ] || continue
    total=$((total + 1))
    if ! php -l "$f" >/dev/null 2>"$WORK/php-l.err"; then
      echo "   php -l : $f" >&2; cat "$WORK/php-l.err" >&2; fautes=$((fautes + 1))
    fi
  done
  [ "$fautes" -eq 0 ] || return 1
  echo "   php -l : $total fichiers valides"
}

# check_versions DIR : la version du service worker (sw.js : jcsm-static-vNN) et
# le cache-bust ?v=NN des pages HTML doivent être identiques et uniques.
check_versions() {
  local dir=$1 sw pages
  sw=$(grep -o "jcsm-static-v[0-9]*" "$dir/sw.js" | head -n 1 | sed 's/jcsm-static-v//')
  [ -n "$sw" ] || { echo "   sw.js : STATIC_CACHE 'jcsm-static-vNN' introuvable" >&2; return 1; }
  # Toutes les valeurs ?v=NN distinctes des pages (hors demo/ et node_modules/).
  pages=$(grep -rho '?v=[0-9]*' --include='*.html' "$dir" --exclude-dir=demo --exclude-dir=node_modules \
          | sed 's/?v=//' | sort -u | tr '\n' ' ' | sed 's/ $//')
  if [ "$pages" != "$sw" ]; then
    echo "   cache-bust incohérent : sw.js = v$sw, pages HTML = ?v={${pages:-aucune}}" >&2
    echo "   remède : grep -rln '?v=NN' --include='*.html' . | xargs sed -i 's/?v=NN/?v=$sw/g' (cf. CLAUDE.md)" >&2
    return 1
  fi
  echo "   cache-bust cohérent : sw.js v$sw = pages ?v=$sw"
}

# build_css : Tailwind (npm run build:css) si le projet Node est présent.
build_css() {
  if [ -f package.json ]; then
    npm ci --no-audit --no-fund
    npm run build:css
  else
    echo "   package.json absent : pas de build Tailwind (css/tailwind.css versionné tel quel)"
  fi
}

# http_code URL [options curl…]
http_code() { curl -s -o /dev/null -w '%{http_code}' -m 20 "$@" || echo 000; }

restore_previous() {
  # Restaure la révision précédente pour les fichiers suivis, sans toucher aux
  # modifications locales non commitées (--keep refuse si elles chevauchent).
  [ "$PULLED" -eq 1 ] || return 0
  echo "ERREUR : restauration de la révision $OLD_REV" >&2
  git reset --keep "$OLD_REV"
  build_css || true
  PULLED=0
}

echo "== [0/7] Prérequis"
for outil in git php curl; do
  command -v "$outil" >/dev/null 2>&1 || die "outil absent : $outil"
done
[ -f package.json ] && { command -v npm >/dev/null 2>&1 || die "package.json présent mais npm absent"; }
# nginx -t lit les clés TLS : il faut sudo, sans mot de passe pour rester non interactif.
if ! sudo -n true 2>/dev/null; then
  die "sudo demande un mot de passe : lancer « sudo -v » puis relancer ./deploy.sh"
fi
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || die "$(pwd) n'est pas un dépôt Git"
CURRENT=$(git rev-parse --abbrev-ref HEAD)
[ "$CURRENT" = "$BRANCH" ] || die "branche courante « $CURRENT », attendue « $BRANCH » (DEPLOY_BRANCH pour forcer)"
exec 9>"$LOCK"
flock -w 120 9 || die "un autre déploiement est en cours ($LOCK)"
OLD_REV=$(git rev-parse HEAD)
echo "Révision en service : $(git rev-parse --short HEAD) ; racine : $(pwd)"
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  warn "modifications locales non commitées (déjà servies par nginx, à commiter puis pousser) :"
  git status --short --untracked-files=no >&2
fi

echo "== [1/7] Récupération et validation de la révision entrante (site non touché)"
git fetch --prune "$REMOTE" "$BRANCH"
NEW_REV=$(git rev-parse "$REMOTE/$BRANCH")
if [ "$NEW_REV" = "$OLD_REV" ]; then
  echo "   déjà à jour ($(git rev-parse --short HEAD)) : les contrôles sont rejoués quand même"
else
  git merge-base --is-ancestor "$OLD_REV" "$NEW_REV" \
    || die "avance rapide impossible : HEAD ($(git rev-parse --short HEAD)) n'est pas un ancêtre de $REMOTE/$BRANCH ($(git rev-parse --short "$NEW_REV")). Commiter/pousser les changements serveur d'abord."
  echo "   $(git rev-parse --short HEAD) → $(git rev-parse --short "$NEW_REV") ($(git rev-list --count "$OLD_REV..$NEW_REV") commit(s))"
  mkdir -p "$WORK/incoming"
  git archive "$NEW_REV" | tar -x -C "$WORK/incoming"
  check_php "$WORK/incoming"      || die "la révision entrante contient une erreur PHP : rien n'a été déployé"
  check_versions "$WORK/incoming" || die "la révision entrante a un cache-bust incohérent : rien n'a été déployé"
fi

echo "== [2/7] git pull --ff-only"
if [ "$NEW_REV" != "$OLD_REV" ]; then
  git pull --ff-only "$REMOTE" "$BRANCH"
  PULLED=1
fi

echo "== [3/7] CSS Tailwind"
if ! build_css; then
  restore_previous
  die "build:css en échec, révision précédente restaurée"
fi
if [ -f package.json ] && ! git diff --quiet -- css/tailwind.css 2>/dev/null; then
  warn "css/tailwind.css reconstruit diffère de la version commitée : le commiter (git add css/tailwind.css)"
fi

echo "== [4/7] Contrôles sur l'arborescence servie"
if ! check_php . || ! check_versions .; then
  restore_previous
  die "contrôle en échec sur l'arborescence servie (voir ci-dessus)"
fi
if [ "$PULLED" -eq 1 ] && [ -n "$(git diff --name-only "$OLD_REV" HEAD -- api/ | grep '\.php$' || true)" ]; then
  # Rechargement gracieux : l'opcache repart sur le nouveau code sans couper une requête.
  if sudo -n systemctl reload "$PHP_FPM_SERVICE"; then
    echo "   $PHP_FPM_SERVICE rechargé (fichiers PHP modifiés)"
  else
    warn "impossible de recharger $PHP_FPM_SERVICE (le code PHP reste servi via l'opcache jusqu'à revalidation)"
  fi
fi

echo "== [5/7] nginx"
CHANGED_CONF=()
if [ -d config/nginx ]; then
  while IFS= read -r f; do
    rel=${f#config/nginx/}
    if [ ! -f "/etc/nginx/$rel" ] || ! sudo -n cmp -s "$f" "/etc/nginx/$rel"; then
      CHANGED_CONF+=("$rel")
    fi
  done < <(find config/nginx -type f | sort)
fi
if [ "${#CHANGED_CONF[@]}" -eq 0 ]; then
  echo "   config/nginx/ identique à /etc/nginx/ : aucun changement"
  sudo -n nginx -t 2>&1 | sed 's/^/   /'
elif [ "${DEPLOY_NGINX:-0}" = "1" ]; then
  STAMP=$(date +%Y%m%d-%H%M%S)
  for rel in "${CHANGED_CONF[@]}"; do
    [ -f "/etc/nginx/$rel" ] && sudo -n cp -p "/etc/nginx/$rel" "/etc/nginx/$rel.bak-$STAMP"
    sudo -n install -D -m 644 "config/nginx/$rel" "/etc/nginx/$rel"
    echo "   installé : /etc/nginx/$rel"
  done
  if sudo -n nginx -t; then
    sudo -n systemctl reload nginx
    echo "   nginx rechargé (${#CHANGED_CONF[@]} fichier(s) modifié(s))"
  else
    for rel in "${CHANGED_CONF[@]}"; do
      if [ -f "/etc/nginx/$rel.bak-$STAMP" ]; then
        sudo -n mv "/etc/nginx/$rel.bak-$STAMP" "/etc/nginx/$rel"
      else
        sudo -n rm -f "/etc/nginx/$rel"
      fi
    done
    sudo -n nginx -t || warn "la configuration restaurée ne passe pas nginx -t non plus : intervention manuelle"
    die "nginx -t rejette config/nginx/ : anciens fichiers remis en place, PAS de reload (site inchangé)"
  fi
else
  echo "   écart(s) entre config/nginx/ et /etc/nginx/ (aucune installation sans DEPLOY_NGINX=1) :"
  printf '     - %s\n' "${CHANGED_CONF[@]}"
  sudo -n nginx -t 2>&1 | sed 's/^/   /'
fi

echo "== [6/7] Test HTTP local (nginx de cette machine, SNI $HOST)"
# --resolve force l'IP locale avec le bon SNI ; -k car le certificat d'origine
# (/etc/ssl/certs/jcsm.fr.crt, derrière Cloudflare) n'est pas forcément public.
LOCAL_HOME=$(http_code -k --resolve "$HOST:443:127.0.0.1" "https://$HOST/")
LOCAL_PHP=$(http_code -k --resolve "$HOST:443:127.0.0.1" "https://$HOST/api/login.php")
echo "   / → HTTP $LOCAL_HOME ; GET /api/login.php → HTTP $LOCAL_PHP (405 attendu)"
if [ "$LOCAL_HOME" != "200" ]; then
  restore_previous
  die "la page d'accueil locale ne répond pas 200 (HTTP $LOCAL_HOME), révision précédente restaurée"
fi
case "$LOCAL_PHP" in
  405) ;;
  500) warn "PHP répond 500 « Erreur de configuration serveur » : .env absent/illisible (640 auxence:www-data) ou JCSM_AUTH_SECRET / AUTH_HASH_1 manquants" ;;
  *)   restore_previous; die "PHP-FPM ne répond pas correctement (HTTP $LOCAL_PHP), révision précédente restaurée" ;;
esac

echo "== [7/7] Test HTTP public ($PUBLIC_URL, via Cloudflare)"
PUBLIC_HOME=$(http_code "$PUBLIC_URL/")
[ "$PUBLIC_HOME" = "200" ] || warn "$PUBLIC_URL/ répond HTTP $PUBLIC_HOME (Cloudflare ou DNS : le serveur local, lui, répond 200)"
LOCAL_SW=$(grep -o "jcsm-static-v[0-9]*" sw.js | head -n 1)
PUBLIC_SW=$(curl -s -m 20 "$PUBLIC_URL/sw.js" | grep -o "jcsm-static-v[0-9]*" | head -n 1 || true)
if [ "$PUBLIC_SW" = "$LOCAL_SW" ]; then
  echo "   sw.js public = $PUBLIC_SW (cache-bust visible depuis Internet)"
else
  warn "sw.js public = ${PUBLIC_SW:-illisible}, local = $LOCAL_SW : purger le cache Cloudflare si l'écart persiste"
fi

if [ "${DEPLOY_PUSH:-0}" = "1" ]; then
  if git push "$REMOTE" "$BRANCH" 2>/dev/null; then echo "Sauvegarde Git : git push $REMOTE $BRANCH OK"
  else warn "git push $REMOTE $BRANCH ignoré (hors ligne ou droits)"; fi
fi
echo "OK — jcsm.fr déployé : $(git rev-parse --short "$OLD_REV") → $(git rev-parse --short HEAD), $WARNINGS avertissement(s)."
