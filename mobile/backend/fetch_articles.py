#!/usr/bin/env python3
"""Construit data/articles.json : le pool de pages du jour.

Comme l'original, les pages viennent des « articles vitaux » de Wikipédia
(Wikipedia:Vital articles, niveau 4 par défaut, ~10 000 sujets), traduits
vers leur titre français via les liens interlangues. On garde l'ordre
alphabétique : app.py mélange le pool de façon déterministe.

Usage : python fetch_articles.py [--level 4]
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path

import requests

DATA_DIR = Path(os.environ.get("PEDANTIX_DATA_DIR", Path(__file__).resolve().parent / "data"))
ARTICLES_PATH = DATA_DIR / "articles.json"
UA = "Pedantix/2.0 (https://github.com/Maxime2i/pedantix; articles)"
EN_API = "https://en.wikipedia.org/w/api.php"

SESSION = requests.Session()
SESSION.headers["User-Agent"] = UA


def api(params: dict) -> dict:
    params = {**params, "format": "json", "formatversion": "2"}
    for attempt in range(5):
        resp = SESSION.get(EN_API, params=params, timeout=60)
        if resp.status_code == 429:
            time.sleep(2 + 2 * attempt)
            continue
        resp.raise_for_status()
        return resp.json()
    resp.raise_for_status()
    return {}


def vital_pages(level: int) -> list[str]:
    """Toutes les sous-pages « Wikipedia:Vital articles/Level/N[/…] »."""
    pages: list[str] = []
    params = {
        "action": "query",
        "list": "allpages",
        "apnamespace": "4",
        "apprefix": f"Vital articles/Level/{level}",
        "aplimit": "max",
    }
    while True:
        data = api(params)
        pages += [p["title"] for p in data["query"]["allpages"]]
        if "continue" not in data:
            break
        params.update(data["continue"])
    return pages


def french_titles(page: str) -> set[str]:
    """Titres FR des articles liés depuis une page de liste anglaise."""
    titles: set[str] = set()
    params = {
        "action": "query",
        "titles": page,
        "generator": "links",
        "gplnamespace": "0",
        "gpllimit": "max",
        "prop": "langlinks",
        "lllang": "fr",
        "lllimit": "max",
        "redirects": "1",
    }
    while True:
        data = api(params)
        for p in data.get("query", {}).get("pages", []):
            for ll in p.get("langlinks", []):
                title = ll.get("title", "")
                if title and ":" not in title:
                    titles.add(title)
        if "continue" not in data:
            break
        params.update(data["continue"])
    return titles


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--level", type=int, default=4)
    args = parser.parse_args()

    pages = vital_pages(args.level)
    if not pages:
        sys.exit("Aucune page « Vital articles » trouvée.")
    titles: set[str] = set()
    for i, page in enumerate(pages, 1):
        titles |= french_titles(page)
        print(f"[{i}/{len(pages)}] {page} → {len(titles)} titres", file=sys.stderr)

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with ARTICLES_PATH.open("w", encoding="utf-8") as fh:
        json.dump(sorted(titles), fh, ensure_ascii=False, indent=0)
    print(f"{len(titles)} titres → {ARTICLES_PATH}")


if __name__ == "__main__":
    main()
