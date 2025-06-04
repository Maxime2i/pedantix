#!/bin/bash
set -e

DEST="dico/lexical_field.json"
mkdir -p dico

# Utilise gdown pour télécharger le fichier Google Drive
python3 -m pip install --upgrade gdown
gdown 1aZpXWFO6DIr7IxXN2sys9kNIhXG_HFe_ -O "$DEST" 