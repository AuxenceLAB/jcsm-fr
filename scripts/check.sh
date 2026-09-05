#!/usr/bin/env bash
# Contrôles reproductibles avant commit / déploiement (aucune dépendance npm) :
#   - syntaxe PHP  : php -l sur api/*.php
#   - syntaxe JS   : node --check sur js/*.js, sw.js, tailwind.config.js, scripts/*.js
#   - JSON valides : tous les .json versionnés
#   - security.txt : champ Expires encore dans le futur
# Usage : bash scripts/check.sh   (ou : npm run check)
set -u
cd "$(dirname "$0")/.." || exit 1
fail=0

echo "== PHP (php -l) =="
for f in api/*.php; do
    if ! out=$(php -l "$f" 2>&1); then echo "ERREUR $f"; echo "$out"; fail=1; fi
done

echo "== JavaScript (node --check) =="
for f in js/*.js sw.js tailwind.config.js scripts/*.js; do
    [ -f "$f" ] || continue
    if ! out=$(node --check "$f" 2>&1); then echo "ERREUR $f"; echo "$out"; fail=1; fi
done

echo "== JSON versionnés =="
echo "== Régression des repères publics =="
if ! node --test scripts/coverage-points.test.cjs; then fail=1; fi
if ! node --test scripts/partner-logos.test.cjs; then fail=1; fi
while IFS= read -r f; do
    if ! node -e 'JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"))' "$f" 2>/dev/null; then
        echo "ERREUR JSON invalide : $f"; fail=1
    fi
done < <(git ls-files '*.json')

echo "== security.txt =="
for f in .well-known/security.txt security.txt; do
    [ -f "$f" ] || continue
    exp=$(sed -n 's/^Expires:[[:space:]]*//p' "$f" | head -n1)
    if [ -z "$exp" ]; then echo "ERREUR $f : champ Expires manquant"; fail=1; continue; fi
    if [ "$(date -u -d "$exp" +%s 2>/dev/null || echo 0)" -le "$(date -u +%s)" ]; then
        echo "ERREUR $f : Expires dépassé ($exp)"; fail=1
    fi
done

echo "== Données d'exploitation hors index git =="
for f in api/interventions.json api/fiches_methodes.json .claude/settings.local.json; do
    if git ls-files --error-unmatch "$f" >/dev/null 2>&1; then echo "ERREUR $f est suivi par git"; fail=1; fi
done
if git ls-files 'api/data/*' | grep -q .; then echo "ERREUR api/data/ contient des fichiers suivis"; fail=1; fi

if [ "$fail" -eq 0 ]; then echo "OK : tous les contrôles passent"; else echo "ÉCHEC : voir ci-dessus"; fi
exit "$fail"
