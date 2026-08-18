#!/usr/bin/env python3
"""Stream a word2vec .txt (.gz or stdin) and keep the first 300_000 words.

Never loads the full vocabulary in RAM. The word2vec text format lists
words by decreasing frequency (line 1 = header `vocab_size dim`).
"""
from __future__ import annotations

import argparse
import gzip
import io
import json
import os
import sys
from pathlib import Path

MAX_WORDS = 300_000
DATA_DIR = Path(os.environ.get("PEDANTIX_DATA_DIR", "/home/ubuntu/pedantix/mobile/backend/data"))
OUT_PATH = DATA_DIR / "frWiki_reduced.vec"
META_PATH = DATA_DIR / "embeddings_meta.json"

FREQUENT_FR = {"de", "la", "le", "et", "à", "des", "les", "du", "en", "un"}


def open_input(path: str | None):
    if path is None or path == "-":
        return io.TextIOWrapper(sys.stdin.buffer, encoding="utf-8", errors="replace")
    raw = Path(path)
    if raw.suffix == ".gz" or str(raw).endswith(".txt.gz") or str(raw).endswith(".vec.gz"):
        return io.TextIOWrapper(gzip.open(raw, "rb"), encoding="utf-8", errors="replace")
    return raw.open("r", encoding="utf-8", errors="replace")


def reduce_stream(inf, out_path: Path, max_words: int = MAX_WORDS) -> dict:
    header = inf.readline()
    if not header:
        raise SystemExit("fichier vide : pas d'en-tête word2vec")
    parts = header.split()
    if len(parts) != 2:
        raise SystemExit(f"en-tête inattendu: {header[:80]!r}")
    orig_n, dim = int(parts[0]), int(parts[1])
    n = min(max_words, orig_n)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    first_words: list[str] = []
    count = 0
    with out_path.open("w", encoding="utf-8") as outf:
        outf.write(f"{n} {dim}\n")
        for line in inf:
            if count >= n:
                break
            line = line.rstrip("\n")
            if not line:
                continue
            word = line.split(" ", 1)[0]
            if count < 30:
                first_words.append(word)
            outf.write(line + "\n")
            count += 1
            if count % 50_000 == 0:
                print(f"... {count} vecteurs écrits", file=sys.stderr, flush=True)

    overlap = [w for w in first_words if w.lower() in FREQUENT_FR]
    freq_ok = len(overlap) >= 5
    meta = {
        "output": str(out_path),
        "kept_words": count,
        "dim": dim,
        "original_vocab_size": orig_n,
        "first_words": first_words,
        "frequency_order_spotcheck": freq_ok,
        "spotcheck_overlap_with_common_fr": overlap,
    }
    META_PATH.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(meta, ensure_ascii=False, indent=2))
    if not freq_ok:
        print(
            "ATTENTION: les premiers mots ne ressemblent pas à un ordre par fréquence FR. "
            "Voir embeddings_meta.json.",
            file=sys.stderr,
        )
    if count < n:
        print(f"ATTENTION: seulement {count} vecteurs lus (attendu {n}).", file=sys.stderr)
    return meta


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", nargs="?", default="-", help="chemin .txt/.gz ou - pour stdin")
    parser.add_argument("-o", "--output", default=str(OUT_PATH))
    parser.add_argument("-n", "--max-words", type=int, default=MAX_WORDS)
    args = parser.parse_args()
    with open_input(args.input) as inf:
        reduce_stream(inf, Path(args.output), args.max_words)


if __name__ == "__main__":
    main()
