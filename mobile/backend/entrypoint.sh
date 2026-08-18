#!/usr/bin/env bash
# Point d'entrée du conteneur pedantix-backend.
# Au premier démarrage (volume vide) : bootstrap des embeddings (~1,6 Go à
# télécharger puis réduction → plusieurs minutes, voulu ; le volume persiste
# ensuite). Puis lance le serveur Flask.
set -euo pipefail

DATA_DIR="${PEDANTIX_DATA_DIR:-/app/data}"
OUT="${DATA_DIR}/frWiki_reduced.vec"

if [[ -f "${OUT}" && -s "${OUT}" ]]; then
  echo "Embeddings déjà présents: ${OUT}"
else
  echo "=== Bootstrap embeddings (premier démarrage) ==="
  bash /app/download_embeddings.sh
fi

exec python /app/app.py
