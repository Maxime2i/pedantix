import os
import json
from collections import defaultdict

# Fichiers à parser (ajoute ici les nouveaux fichiers si besoin)
ENTRIES_FILE = "20240924-LEXICALNET-JEUXDEMOTS-ENTRIES.txt"
RELATION_FILES = [
    "20240526-LEXICALNET-JEUXDEMOTS-R5.txt",   # synonymes
    "20240211-LEXICALNET-JEUXDEMOTS-R99.txt",  # dérivés morpho
    "20240624-LEXICALNET-JEUXDEMOTS-R19.txt",  # lemmatisation
    "20241012-LEXICALNET-JEUXDEMOTS-R71.txt",  # variantes
]

# Construction du mapping id <-> mot
id2word = dict()
word2id = dict()

# On construit d'abord le mapping id <-> mot à partir du fichier ENTRIES
with open(ENTRIES_FILE, encoding="latin-1") as f:
    for line in f:
        if line.startswith("e;"):
            parts = line.strip().split(";")
            if len(parts) > 2:
                id_, word = parts[1], parts[2].lower()
                id2word[id_] = word
                word2id[word] = id_

# Dictionnaire champ lexical
lexical_field = defaultdict(set)

# On parse les relations
for fname in RELATION_FILES:
    with open(fname, encoding="latin-1") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('%'):
                continue
            parts = [p.strip(' "') for p in line.split(';')]
            if len(parts) >= 2:
                mot1, mot2 = parts[0].lower(), parts[1].lower()
                if mot1 and mot2 and mot1 != mot2:
                    lexical_field[mot1].add(mot2)
                    lexical_field[mot2].add(mot1)

# Conversion en listes et sauvegarde
lexical_field = {k: list(v) for k, v in lexical_field.items()}

with open("lexical_field.json", "w", encoding="utf-8") as f:
    json.dump(lexical_field, f, ensure_ascii=False, indent=2)

print(f"Fichier lexical_field.json généré avec {len(lexical_field)} entrées.") 