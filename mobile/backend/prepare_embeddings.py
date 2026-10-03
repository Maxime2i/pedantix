#!/usr/bin/env python3
"""Convertit le modèle word2vec binaire de Jean-Philippe Fauconnier en
data/frwac.npy (vecteurs normalisés, float32) + data/frwac.vocab.txt.

C'est le modèle utilisé par l'original : frWac_non_lem_no_postag_no_phrase_200_cbow_cut100
(scores identiques au centième près). Le .npy se charge en mmap en ~0,1 s.

Usage : python prepare_embeddings.py modele.bin [dossier_sortie]
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

import numpy as np


def convert(src: Path, out_dir: Path) -> None:
    raw = src.read_bytes()
    nl = raw.index(b"\n")
    n, dim = map(int, raw[:nl].split())
    pos = nl + 1
    width = 4 * dim
    words: list[str] = []
    mat = np.empty((n, dim), dtype=np.float32)
    for i in range(n):
        sp = raw.index(b" ", pos)
        words.append(raw[pos:sp].decode("utf-8", "replace").strip())
        mat[i] = np.frombuffer(raw, dtype=np.float32, count=dim, offset=sp + 1)
        pos = sp + 1 + width
        if pos < len(raw) and raw[pos : pos + 1] == b"\n":
            pos += 1

    norms = np.linalg.norm(mat, axis=1)
    norms[norms == 0] = 1.0
    mat /= norms[:, None]

    out_dir.mkdir(parents=True, exist_ok=True)
    np.save(out_dir / "frwac.npy", mat)
    with (out_dir / "frwac.vocab.txt").open("w", encoding="utf-8") as fh:
        fh.write("\n".join(words))
    print(f"{n} mots, dimension {dim} → {out_dir}/frwac.npy")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    default_out = Path(os.environ.get("PEDANTIX_DATA_DIR", Path(__file__).resolve().parent / "data"))
    convert(Path(sys.argv[1]), Path(sys.argv[2]) if len(sys.argv) > 2 else default_out)
