#!/usr/bin/env bash
# Point d'entrée du conteneur pedantix-backend.
# Au premier démarrage (volume vide) : téléchargement du modèle frWac et de
# Lexique 3.83 (~150 Mo, une à deux minutes ; le volume persiste ensuite).
set -euo pipefail

bash /app/prepare_data.sh "${PEDANTIX_DATA_DIR:-/app/data}"

exec gunicorn --bind "0.0.0.0:${PORT:-5000}" --workers 1 --threads 8 --timeout 60 app:app
