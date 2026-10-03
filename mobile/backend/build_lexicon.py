#!/usr/bin/env python3
"""Construit data/lexicon.json à partir de Lexique 3.83 (lexique.org, CC BY-SA 4.0).

Pour chaque forme fléchie, on liste ses « parents » : les formes qui, proposées
par le joueur, la révèlent. Comme sur l'original :
- le lemme (masculin singulier, infinitif) révèle toutes ses formes :
  « grand » → grande, grands, grandes ; « être » → est, été, sont ;
- le féminin singulier révèle le féminin pluriel : « grande » → grandes ;
- une forme fléchie ne révèle qu'elle-même : « est » ne révèle pas « sont ».

Les mots grammaticaux (articles, pronoms, prépositions…) ne viennent pas de
Lexique, qui ne les regroupe pas comme l'original : voir CLOSED_CLASS dans
lemmatize.py.

Usage : python build_lexicon.py Lexique383.tsv [data/lexicon.json]
"""

from __future__ import annotations

import csv
import json
import os
import sys
from collections import defaultdict
from pathlib import Path

# Catégories grammaticales ouvertes (+ indéfinis) prises dans Lexique.
OPEN_CGRAM = {
    "NOM", "ADJ", "VER", "AUX", "ADV", "ONO",
    "ADJ:ind", "PRO:ind", "ADJ:int", "PRO:int", "PRO:rel", "ADJ:num",
}


def build(src: Path, out: Path) -> None:
    rows: list[tuple[str, str, str, str, str]] = []
    with src.open(encoding="utf-8") as fh:
        for r in csv.DictReader(fh, delimiter="\t", quoting=csv.QUOTE_NONE):
            ortho, lemme, cgram = r["ortho"], r["lemme"], r["cgram"]
            if cgram not in OPEN_CGRAM:
                continue
            # Locutions et élisions : jamais une case. Les lettres seules
            # (l, d, s…) sont des élisions, gérées par CLOSED_CLASS ; seul
            # « a » (avoir) est gardé.
            if " " in ortho or "'" in ortho or (len(ortho) < 2 and ortho != "a"):
                continue
            rows.append((ortho, lemme, cgram, r["genre"], r["nombre"]))

    fem_sing: dict[tuple[str, str], set[str]] = defaultdict(set)
    for ortho, lemme, cgram, genre, nombre in rows:
        if genre == "f" and nombre == "s":
            fem_sing[(lemme, cgram)].add(ortho)

    parents: dict[str, set[str]] = defaultdict(set)
    for ortho, lemme, cgram, genre, nombre in rows:
        if lemme != ortho and len(lemme) > 1 and " " not in lemme:
            parents[ortho].add(lemme)
        if genre == "f" and nombre == "p":
            parents[ortho] |= fem_sing.get((lemme, cgram), set()) - {ortho}

    data = {form: sorted(p) for form, p in sorted(parents.items()) if p}
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, separators=(",", ":"))
    print(f"{len(data)} formes fléchies → {out}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    default_out = Path(os.environ.get("PEDANTIX_DATA_DIR", Path(__file__).resolve().parent / "data")) / "lexicon.json"
    build(Path(sys.argv[1]), Path(sys.argv[2]) if len(sys.argv) > 2 else default_out)
