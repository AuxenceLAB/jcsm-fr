#!/usr/bin/env bash
# Supervision HTTPS publique de jcsm.fr, vue depuis l'extérieur.
#
# Exécuté toutes les 30 minutes par GitHub Actions (.github/workflows/supervision.yml)
# et utilisable à la main depuis n'importe quelle machine : aucun secret, aucun accès
# au VPS, uniquement curl et openssl (présents sur les runners GitHub et sur le VPS).
#
# Contrôles (chacun est bloquant sauf mention « avertissement ») :
#   1. page d'accueil          : HTTP 200, temps de réponse, en-têtes de sécurité
#   2. sonde applicative       : site statique sans /api/health ; PHP-FPM est contrôlé
#                                par GET /api/login.php qui doit répondre 405 (vivant,
#                                méthode refusée), jamais 502/504 (socket PHP absent)
#   3. certificat TLS          : expiration dans plus de 14 jours (chaîne vue du public,
#                                donc celle de Cloudflare quand le proxy est actif)
#   4. sitemap.xml, robots.txt : HTTP 200
#
# Un contrôle en échec est rejoué une seconde fois après 30 s : un aléa réseau
# isolé n'ouvre pas d'incident. Sortie 0 si tout est vert, 1 sinon.
#
# Usage : scripts/supervision.sh [--report FICHIER]   (rapport Markdown, sinon stdout)
set -euo pipefail

# ------------------------------------------------------------------ Paramètres
SITE_NAME="jcsm.fr"
BASE_URL="https://jcsm.fr"
HOME_PATH="/"
HEALTH_PATH=""
# Valeurs acceptées pour "status" dans le JSON de /api/health (HTTP 200).
HEALTH_OK_STATUSES="ok"
# Valeurs signalées en avertissement seulement (sans objet : pas de sonde JSON).
HEALTH_WARN_STATUSES=""
# En-têtes de sécurité attendus, déduits de config/nginx/snippets/security.conf
# (inclus dans chaque location du vhost config/nginx/sites-enabled/jcsm.fr).
# Format nom:sous-chaîne attendue dans la valeur ; vide = présence seulement.
REQUIRED_HEADERS=(
  "strict-transport-security:max-age="
  "x-content-type-options:nosniff"
  "x-frame-options:SAMEORIGIN"
  "referrer-policy:strict-origin-when-cross-origin"
  "permissions-policy:"
  "content-security-policy:default-src 'self'"
)
# En-têtes souhaités mais non bloquants (avertissement s'ils manquent).
OPTIONAL_HEADERS=(
  "cross-origin-opener-policy:same-origin"
  "cross-origin-resource-policy:same-origin"
)
# Chemins publics devant répondre 200 (site indexable).
PUBLIC_PATHS=("/sitemap.xml" "/robots.txt" "/sw.js")
# Chemins supplémentaires : "chemin:codes OK[:codes tolérés en avertissement]".
# /api/login.php répond 405 à un GET (api/login.php ligne 31) : preuve que nginx
# atteint PHP-FPM. Un 500 « Erreur de configuration serveur » vient aussi de PHP
# (api/auth.php : JCSM_AUTH_SECRET ou AUTH_HASH_N absents du .env) : PHP-FPM est
# vivant, la configuration ne l'est pas -> avertissement, pas d'incident.
# /sw.js (service worker) doit rester servi pour le cache-bust.
EXTRA_PATHS=("/api/login.php:405:500")
TLS_MIN_DAYS=14
SLOW_SECONDS=8          # au-delà : échec (le site répond mais trop lentement)
CURL_MAX_TIME=25
RETRY_DELAY=30
USER_AGENT="supervision-github-actions/1.0 (+https://github.com/AuxenceLAB)"

# -------------------------------------------------------------------- Options
REPORT_FILE=""
while [ $# -gt 0 ]; do
  case "$1" in
    --report) REPORT_FILE="${2:?--report attend un fichier}"; shift 2 ;;
    -h|--help) sed -n '2,20p' "$0"; exit 0 ;;
    *) echo "Option inconnue : $1" >&2; exit 2 ;;
  esac
done

for outil in curl openssl; do
  command -v "$outil" >/dev/null 2>&1 || { echo "ERREUR : $outil est requis" >&2; exit 2; }
done

WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT
HOST=${BASE_URL#https://}

# ------------------------------------------------------------------ Utilitaires
# Chaque contrôle ajoute une ligne : "OK|KO|AVERT<TAB>libellé<TAB>détail".
RESULTS=()
KO_COUNT=0
WARN_COUNT=0
ok()   { RESULTS+=("OK	$1	$2"); }
ko()   { RESULTS+=("KO	$1	$2"); KO_COUNT=$((KO_COUNT + 1)); }
warn() { RESULTS+=("AVERT	$1	$2"); WARN_COUNT=$((WARN_COUNT + 1)); }

# fetch CHEMIN PREFIXE : GET, corps dans $WORK/PREFIXE.body, en-têtes dans
# $WORK/PREFIXE.headers ; affiche "code temps_total". Code 000 = injoignable.
fetch() {
  local path=$1 tag=$2
  curl -sS -o "$WORK/$tag.body" -D "$WORK/$tag.headers" \
    -w '%{http_code} %{time_total}' -m "$CURL_MAX_TIME" \
    -A "$USER_AGENT" -H 'Accept-Language: fr' \
    "$BASE_URL$path" 2>"$WORK/$tag.err" || printf '000 0'
}

# header_value FICHIER NOM : valeur (dernière occurrence) d'un en-tête, sans CR.
header_value() {
  grep -i "^$2:" "$1" 2>/dev/null | tail -n 1 | cut -d: -f2- | sed 's/^[[:space:]]*//; s/\r$//' || true
}

# json_status FICHIER : valeur de "status" dans un JSON, espaces retirés.
json_status() {
  tr -d '[:space:]' <"$1" 2>/dev/null | grep -o '"status":"[^"]*"' | head -n 1 | cut -d'"' -f4 || true
}

check_home() {
  local reply code secs
  reply=$(fetch "$HOME_PATH" home)
  code=${reply%% *}; secs=${reply##* }
  if [ "$code" != "200" ]; then
    ko "Accueil $HOME_PATH" "HTTP $code attendu 200 $(head -c 200 "$WORK/home.err" 2>/dev/null | tr '\n' ' ')"
    return
  fi
  # Comparaison en dixièmes de seconde sans dépendre de bc ni d'awk.
  local tenths=${secs%.*}; tenths=$((tenths * 10 + 10#$(printf '%s' "${secs#*.}0" | cut -c1)))
  if [ "$tenths" -gt $((SLOW_SECONDS * 10)) ]; then
    ko "Accueil $HOME_PATH" "HTTP 200 mais ${secs}s (> ${SLOW_SECONDS}s)"
  else
    ok "Accueil $HOME_PATH" "HTTP 200 en ${secs}s"
  fi
  local spec name expected value
  for spec in "${REQUIRED_HEADERS[@]}"; do
    name=${spec%%:*}; expected=${spec#*:}
    value=$(header_value "$WORK/home.headers" "$name")
    if [ -z "$value" ]; then
      ko "En-tête $name" "absent"
    elif [ -n "$expected" ] && ! grep -qF -- "$expected" <<<"$value"; then
      ko "En-tête $name" "valeur « $value » ne contient pas « $expected »"
    else
      ok "En-tête $name" "présent"
    fi
  done
  for spec in "${OPTIONAL_HEADERS[@]}"; do
    name=${spec%%:*}; expected=${spec#*:}
    value=$(header_value "$WORK/home.headers" "$name")
    if [ -z "$value" ]; then
      warn "En-tête $name" "absent (non bloquant)"
    elif [ -n "$expected" ] && ! grep -qF -- "$expected" <<<"$value"; then
      warn "En-tête $name" "valeur « $value » ne contient pas « $expected » (non bloquant)"
    else
      ok "En-tête $name" "présent"
    fi
  done
}

check_health() {
  [ -n "$HEALTH_PATH" ] || return 0
  local reply code secs status
  reply=$(fetch "$HEALTH_PATH" health)
  code=${reply%% *}; secs=${reply##* }
  status=$(json_status "$WORK/health.body")
  if [ "$code" = "200" ] && [ -n "$status" ] && grep -qwF -- "$status" <<<"$HEALTH_OK_STATUSES"; then
    ok "Santé $HEALTH_PATH" "HTTP 200, status=$status, ${secs}s"
  elif [ -n "$status" ] && [ -n "$HEALTH_WARN_STATUSES" ] && grep -qwF -- "$status" <<<"$HEALTH_WARN_STATUSES"; then
    warn "Santé $HEALTH_PATH" "HTTP $code, status=$status (dégradé, non bloquant)"
  else
    ko "Santé $HEALTH_PATH" "HTTP $code, status=${status:-absent} : $(head -c 300 "$WORK/health.body" | tr -d '\n')"
  fi
}

check_tls() {
  local cert="$WORK/cert.pem" enddate days=""
  if ! openssl s_client -servername "$HOST" -connect "$HOST:443" </dev/null 2>/dev/null \
      | openssl x509 -outform PEM >"$cert" 2>/dev/null || [ ! -s "$cert" ]; then
    ko "Certificat TLS" "impossible de récupérer le certificat de $HOST:443"
    return
  fi
  enddate=$(openssl x509 -in "$cert" -noout -enddate | cut -d= -f2)
  if command -v date >/dev/null && date -d "$enddate" +%s >/dev/null 2>&1; then
    days=$(( ($(date -d "$enddate" +%s) - $(date +%s)) / 86400 ))
  fi
  # -checkend : échoue si le certificat expire dans moins de N secondes (portable).
  if openssl x509 -in "$cert" -noout -checkend $((TLS_MIN_DAYS * 86400)) >/dev/null; then
    ok "Certificat TLS" "expire le $enddate${days:+ (dans $days jours)}"
  else
    ko "Certificat TLS" "expire le $enddate${days:+ (dans $days jours)} : moins de $TLS_MIN_DAYS jours"
  fi
}

check_paths() {
  local path reply code spec accepted
  for path in "${PUBLIC_PATHS[@]}"; do
    reply=$(fetch "$path" "path$(printf '%s' "$path" | tr -c 'A-Za-z0-9' '_')")
    code=${reply%% *}
    if [ "$code" = "200" ]; then ok "Fichier $path" "HTTP 200"; else ko "Fichier $path" "HTTP $code attendu 200"; fi
  done
  # Format : "chemin:codes OK[:codes en avertissement]" (codes séparés par des virgules).
  local tolerated
  for spec in "${EXTRA_PATHS[@]}"; do
    IFS=: read -r path accepted tolerated <<<"$spec"
    reply=$(fetch "$path" "extra$(printf '%s' "$path" | tr -c 'A-Za-z0-9' '_')")
    code=${reply%% *}
    if grep -qw -- "$code" <<<"${accepted//,/ }"; then
      ok "Chemin $path" "HTTP $code"
    elif [ -n "${tolerated:-}" ] && grep -qw -- "$code" <<<"${tolerated//,/ }"; then
      warn "Chemin $path" "HTTP $code (toléré, attendu $accepted) : $(head -c 200 "$WORK/extra$(printf '%s' "$path" | tr -c 'A-Za-z0-9' '_').body" | tr -d '\n')"
    else
      ko "Chemin $path" "HTTP $code attendu $accepted"
    fi
  done
}

run_all() {
  RESULTS=(); KO_COUNT=0; WARN_COUNT=0
  check_home
  check_health
  check_tls
  check_paths
}

# ------------------------------------------------------------------- Exécution
run_all
PASSES=1
if [ "$KO_COUNT" -gt 0 ]; then
  echo "Première passe : $KO_COUNT échec(s), nouvelle tentative dans ${RETRY_DELAY}s…" >&2
  sleep "$RETRY_DELAY"
  run_all
  PASSES=2
fi

NOW=$(date -u '+%Y-%m-%d %H:%M UTC')
{
  if [ "$KO_COUNT" -eq 0 ]; then
    echo "## $SITE_NAME : tout est vert ($NOW)"
  else
    echo "## $SITE_NAME : $KO_COUNT contrôle(s) en échec ($NOW)"
  fi
  echo
  echo "Passe(s) effectuée(s) : $PASSES · avertissements : $WARN_COUNT · base : $BASE_URL"
  echo
  echo "| État | Contrôle | Détail |"
  echo "|---|---|---|"
  for line in "${RESULTS[@]}"; do
    IFS=$'\t' read -r state label detail <<<"$line"
    case "$state" in
      OK) icon="✅" ;; KO) icon="❌" ;; *) icon="⚠️" ;;
    esac
    # Les barres verticales casseraient le tableau Markdown.
    printf '| %s %s | %s | %s |\n' "$icon" "$state" "${label//|/¦}" "${detail//|/¦}"
  done
} >"$WORK/report.md"

if [ -n "$REPORT_FILE" ]; then
  cp "$WORK/report.md" "$REPORT_FILE"
  echo "Rapport écrit dans $REPORT_FILE ($KO_COUNT échec(s), $WARN_COUNT avertissement(s))"
else
  cat "$WORK/report.md"
fi

[ "$KO_COUNT" -eq 0 ]
