#!/usr/bin/env bash
# Prépare les données du serveur dans ${PEDANTIX_DATA_DIR:-./data} :
#   - frwac.npy + frwac.vocab.txt : word2vec frWac de Jean-Philippe Fauconnier
#     (frWac_non_lem_no_postag_no_phrase_200_cbow_cut100, 126 Mo, CC BY 3.0),
#     le modèle de l'original ;
#   - lexicon.json : formes fléchies → lemmes, depuis Lexique 3.83 (CC BY-SA 4.0).
# Idempotent : ce qui existe déjà n'est pas retéléchargé.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="${1:-${PEDANTIX_DATA_DIR:-$SCRIPT_DIR/data}}"
PY="${PYTHON:-python3}"
UA="Pedantix/2.0 (https://github.com/Maxime2i/pedantix; data)"
MODEL_URL="https://embeddings.net/embeddings/frWac_non_lem_no_postag_no_phrase_200_cbow_cut100.bin"
LEXIQUE_URL="http://www.lexique.org/databases/Lexique383/Lexique383.tsv"

mkdir -p "${DATA_DIR}"
TMP="$(mktemp -d)"
trap 'rm -rf "${TMP}"' EXIT

if [[ -s "${DATA_DIR}/frwac.npy" && -s "${DATA_DIR}/frwac.vocab.txt" ]]; then
  echo "Embeddings déjà présents."
else
  echo "=== Téléchargement du modèle frWac (126 Mo)"
  curl -L --fail --retry 3 -A "${UA}" -o "${TMP}/model.bin" "${MODEL_URL}"
  "${PY}" "${SCRIPT_DIR}/prepare_embeddings.py" "${TMP}/model.bin" "${DATA_DIR}"
fi

if [[ -s "${DATA_DIR}/lexicon.json" ]]; then
  echo "Lexique déjà présent."
else
  echo "=== Téléchargement de Lexique 3.83 (25 Mo)"
  curl -L --fail --retry 3 -A "${UA}" -o "${TMP}/Lexique383.tsv" "${LEXIQUE_URL}"
  "${PY}" "${SCRIPT_DIR}/build_lexicon.py" "${TMP}/Lexique383.tsv" "${DATA_DIR}/lexicon.json"
fi
