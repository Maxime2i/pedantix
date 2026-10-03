#!/usr/bin/env python3
"""Impose la page Wikipédia d'un jour (par défaut, celui en cours).

Utile pour jouer la même page que pedantix.certitudes.org. À lancer avant
que le serveur ait servi ce jour-là, ou redémarrer le serveur ensuite
(la page du jour est gardée en mémoire).

Usage : python set_puzzle.py "Titre de la page" [numéro]
"""

from __future__ import annotations

import json
import sys

import app


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    num = int(sys.argv[2]) if len(sys.argv) > 2 else app.puzzle_num()
    fetched = app.fetch_intro(sys.argv[1])
    if not fetched:
        sys.exit(f"Page introuvable sur fr.wikipedia.org : {sys.argv[1]}")
    data = app.build_puzzle(*fetched)
    if not data:
        sys.exit(f"Introduction trop courte (< {app.MIN_WORDS} mots) : {fetched[0]}")
    with app.db() as conn:
        conn.execute(
            "INSERT OR REPLACE INTO puzzles (num, title, data) VALUES (?, ?, ?)",
            (num, data["title"], json.dumps(data, ensure_ascii=False)),
        )
    print(f"Jour nº{num} : {data['title']} ({len(data['words'])} cases). Redémarrez le serveur s'il tourne.")


if __name__ == "__main__":
    main()
