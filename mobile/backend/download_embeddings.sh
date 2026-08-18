#!/usr/bin/env bash
# Télécharge les embeddings FR et produit ${DATA_DIR}/frWiki_reduced.vec (300k mots).
# Utilisable en local ET dans un conteneur : pas de .venv, python3 système.
# Idempotent : si le .vec réduit existe et est non vide, ne fait rien.
# Télécharge le .vec complet vers un .tmp puis mv (jamais de fichier partiel),
# puis supprime le .vec complet après réduction (économie de volume).
set -euo pipefail

DATA_DIR="${1:-${PEDANTIX_DATA_DIR:-/home/ubuntu/pedantix/mobile/backend/data}}"
PY="${PYTHON:-python3}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REDUCE="${SCRIPT_DIR}/reduce_embeddings.py"
OUT="${DATA_DIR}/frWiki_reduced.vec"
META="${DATA_DIR}/embeddings_meta.json"
UA="PedantixMobile/1.0 (https://github.com/Maxime2i/pedantix; embeddings download)"

# NOTE: embeddings.net n'expose QUE des .bin binaires word2vec (pas de .vec texte),
# et son seul .txt.gz (frWiki_non_lem.txt.gz) est le CORPUS d'entraînement, pas des
# vecteurs. On utilise donc fastText wiki FR en texte (format word2vec, 300 dims).
# Le .vec.gz historique est mort (AccessDenied sur le bucket) ; le .vec direct marche.
PRIMARY="https://dl.fbaipublicfiles.com/fasttext/vectors-wiki/wiki.fr.vec"
FALLBACK="https://dl.fbaipublicfiles.com/fasttext/vectors-wiki/wiki.fr.zip"

mkdir -p "${DATA_DIR}"

if [[ -f "${OUT}" && -s "${OUT}" ]]; then
  echo "Déjà présent: ${OUT}"
  head -n 1 "${OUT}"
  exit 0
fi

try_source() {
  local url="$1"
  local name="$2"
  local license="$3"
  local tmp="${DATA_DIR}/wiki.fr.download.tmp"
  local full="${DATA_DIR}/wiki.fr.vec"
  echo "=== Téléchargement ${name}: ${url}"
  if ! curl -L --fail --retry 3 --retry-delay 4 --connect-timeout 30 \
      -A "${UA}" --http1.1 -o "${tmp}" "${url}"; then
    rm -f "${tmp}"
    return 1
  fi
  # Fichier complet téléchargé → nom final (pas de fichier partiel).
  case "${url}" in
    *.zip)
      unzip -p "${tmp}" > "${full}" || { rm -f "${tmp}" "${full}"; return 1; }
      rm -f "${tmp}"
      ;;
    *)
      mv "${tmp}" "${full}"
      ;;
  esac
  # Réduction : lit le .vec complet, écrit le réduit au même endroit.
  if ! "${PY}" "${REDUCE}" "${full}"; then
    rm -f "${full}"
    return 1
  fi
  if [[ -s "${OUT}" ]]; then
    local nlines
    nlines="$(head -n 1 "${OUT}" | awk '{print $1}')"
    if [[ "${nlines}" -ge 1000 ]]; then
      python3 - <<PY
import json
from pathlib import Path
p = Path("${META}")
meta = json.loads(p.read_text(encoding="utf-8")) if p.exists() else {}
meta["source_url"] = "${url}"
meta["source_name"] = "${name}"
meta["license"] = "${license}"
p.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
print("Source retenue:", "${name}", "${license}")
PY
      # Le .vec complet ne sert plus : suppression (volume Docker limité).
      rm -f "${full}"
      return 0
    fi
  fi
  rm -f "${full}" "${OUT}"
  return 1
}

if try_source "${PRIMARY}" "fastText wiki.fr.vec (Facebook AI)" "CC BY-SA 3.0"; then
  echo "OK source primaire"
  exit 0
fi

echo "Source primaire en échec, fallback fastText..."
rm -f "${OUT}"
if try_source "${FALLBACK}" "fastText wiki.fr (Facebook AI)" "CC BY-SA 3.0"; then
  echo "OK source fallback"
  exit 0
fi

echo "Échec du téléchargement des embeddings (primaire et fallback)." >&2
exit 1
