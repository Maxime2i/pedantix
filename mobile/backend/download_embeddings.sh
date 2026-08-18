#!/usr/bin/env bash
# Télécharge les embeddings FR et produit data/frWiki_reduced.vec (300k mots).
set -euo pipefail

DATA_DIR="/home/ubuntu/pedantix/mobile/backend/data"
PY="/home/ubuntu/pedantix/mobile/backend/.venv/bin/python"
REDUCE="/home/ubuntu/pedantix/mobile/backend/reduce_embeddings.py"
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
  echo "=== Téléchargement ${name}: ${url}"
  # Stream → réduction. SIGPIPE (141) est normal dès 300k lignes lues
  # (curl/unzip arrêtés en cours de route).
  set +e
  case "${url}" in
    *.gz)
      curl -L --fail --retry 3 --retry-delay 4 --connect-timeout 30 \
          -A "${UA}" --http1.1 "${url}" \
          | gzip -dc \
          | "${PY}" "${REDUCE}" -
      ;;
    *.zip)
      curl -L --fail --retry 3 --retry-delay 4 --connect-timeout 30 \
          -A "${UA}" --http1.1 "${url}" \
          | funzip \
          | "${PY}" "${REDUCE}" -
      ;;
    *)
      curl -L --fail --retry 3 --retry-delay 4 --connect-timeout 30 \
          -A "${UA}" --http1.1 "${url}" \
          | "${PY}" "${REDUCE}" -
      ;;
  esac
  set -e
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
      return 0
    fi
  fi
  rm -f "${OUT}"
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
