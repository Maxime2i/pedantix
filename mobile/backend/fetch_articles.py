#!/usr/bin/env python3
"""Télécharge les titres Wikipédia FR (articles de qualité) vers articles.json."""

from __future__ import annotations

import json
import random
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

DATA_DIR = Path("/home/ubuntu/pedantix/mobile/backend/data")
ARTICLES_PATH = DATA_DIR / "articles.json"
UA = "PedantixMobile/1.0 (https://github.com/Maxime2i/pedantix; dev)"

FALLBACK_ARTICLES = [
    "France",
    "Paris",
    "Tour Eiffel",
    "Révolution française",
    "Napoléon Ier",
    "Seconde Guerre mondiale",
    "Albert Einstein",
    "Théorie de la relativité",
    "Charles Darwin",
    "Évolution biologique",
    "Marie Curie",
    "Antarctique",
    "Amazonie",
    "Soleil",
    "Lune",
    "Terre",
    "Internet",
    "Intelligence artificielle",
    "Ordinateur",
    "Linux",
    "Python (langage)",
    "Football",
    "Jeux olympiques",
    "Cinéma",
    "Musique",
    "Peinture",
    "Victor Hugo",
    "Les Misérables",
    "Molière",
    "Voltaire",
    "Louis XIV",
    "Union européenne",
    "Égypte antique",
    "Grèce antique",
    "Rome antique",
    "Japon",
    "Chine",
    "États-Unis",
    "Canada",
    "Océan Atlantique",
]

SKIP_PREFIXES = ("Catégorie:", "Portail:", "Modèle:", "Wikipédia:")
MAX_TITLES = 300


def fetch_category_members() -> list[str]:
    titles: list[str] = []
    cmcontinue: str | None = None

    while len(titles) < MAX_TITLES:
        params: dict[str, str] = {
            "action": "query",
            "list": "categorymembers",
            "cmtitle": "Catégorie:Article de qualité",
            "cmtype": "page",
            "cmlimit": "500",
            "format": "json",
            "origin": "*",
        }
        if cmcontinue:
            params["cmcontinue"] = cmcontinue

        url = "https://fr.wikipedia.org/w/api.php?" + urllib.parse.urlencode(params)
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        for member in data.get("query", {}).get("categorymembers", []):
            title = member.get("title", "")
            if not title or title.startswith(SKIP_PREFIXES):
                continue
            titles.append(title)
            if len(titles) >= MAX_TITLES:
                break

        cont = data.get("continue", {})
        cmcontinue = cont.get("cmcontinue")
        if not cmcontinue:
            break

    return titles[:MAX_TITLES]


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    try:
        titles = fetch_category_members()
        if not titles:
            raise ValueError("Aucun titre récupéré")
    except (urllib.error.URLError, urllib.error.HTTPError, ValueError, json.JSONDecodeError, OSError):
        titles = list(FALLBACK_ARTICLES)

    rng = random.Random(42)
    rng.shuffle(titles)

    with ARTICLES_PATH.open("w", encoding="utf-8") as fh:
        json.dump(titles, fh, ensure_ascii=False, indent=2)

    print(len(titles))


if __name__ == "__main__":
    main()
