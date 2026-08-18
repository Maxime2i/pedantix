"""Serveur Flask Pédantix mobile — article Wikipédia du jour, devinettes sémantiques."""

from __future__ import annotations

import json
import re
import sys
import unicodedata
from datetime import date, datetime, timezone
from pathlib import Path

import numpy as np
import requests
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

from stopwords import STOPWORDS

DATA_DIR = Path("/home/ubuntu/pedantix/mobile/backend/data")
VEC_PATH = DATA_DIR / "frWiki_reduced.vec"
ARTICLES_PATH = DATA_DIR / "articles.json"
EXACT_THRESHOLD = 0.85
REVEAL_THRESHOLD = 0.80
UA = "PedantixMobile/1.0 (https://github.com/Maxime2i/pedantix; dev)"
ROOT = Path("/home/ubuntu/pedantix/mobile")

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

WORD_RE = re.compile(r"[a-zàâäéèêëîïôöùûüÿçœæ]+")
PUZZLE_EPOCH = date(2026, 1, 1)


def load_embeddings(path: Path) -> tuple[dict[str, int], np.ndarray]:
    if not path.is_file():
        print("Run mobile/backend/download_embeddings.sh", file=sys.stderr)
        sys.exit(1)

    with path.open(encoding="utf-8") as fh:
        header = fh.readline().strip().split()
        if len(header) != 2:
            print(f"En-tête invalide dans {path}", file=sys.stderr)
            sys.exit(1)
        n_expected, dim = int(header[0]), int(header[1])

        # Matrice pré-allouée : on évite 300k petits objets numpy/python
        # (pic RAM ~0,7 Go au lieu de ~1,1 Go).
        words: list[str] = []
        mat = np.empty((n_expected, dim), dtype=np.float32)
        i = 0
        for line in fh:
            if i >= n_expected:
                break
            parts = line.strip().split()
            if len(parts) != dim + 1:
                continue
            word = parts[0]
            if "</" in word:
                continue
            try:
                mat[i] = np.asarray(parts[1:], dtype=np.float32)
            except ValueError:
                continue  # ligne corrompue : ignorée
            words.append(word)
            i += 1

    mat = mat[:i]
    norms = np.linalg.norm(mat, axis=1)
    norms[norms == 0] = 1.0
    mat /= norms[:, None]
    word_to_idx = {w: idx for idx, w in enumerate(words)}

    if i != n_expected:
        print(
            f"Avertissement : {i} mots chargés, {n_expected} attendus",
            file=sys.stderr,
        )
    return word_to_idx, mat


WORD_TO_IDX, EMBEDDINGS = load_embeddings(VEC_PATH)


def load_articles() -> list[str]:
    if ARTICLES_PATH.is_file():
        try:
            with ARTICLES_PATH.open(encoding="utf-8") as fh:
                data = json.load(fh)
            if isinstance(data, list) and data:
                return [str(t) for t in data]
        except (json.JSONDecodeError, OSError):
            pass
    return list(FALLBACK_ARTICLES)


ARTICLES = load_articles()
PUZZLE_CACHE: dict[int, dict] = {}


def puzzle_num() -> int:
    today = datetime.now(timezone.utc).date()
    return (today - PUZZLE_EPOCH).days


def fetch_intro(title: str) -> str:
    try:
        resp = requests.get(
            "https://fr.wikipedia.org/w/api.php",
            params={
                "action": "query",
                "prop": "extracts",
                "exintro": "1",
                "explaintext": "1",
                "format": "json",
                "origin": "*",
                "titles": title,
            },
            headers={"User-Agent": UA},
            timeout=10,
        )
        resp.raise_for_status()
        pages = resp.json().get("query", {}).get("pages", {})
        for page in pages.values():
            extract = page.get("extract")
            if extract:
                return extract
    except (requests.RequestException, ValueError, KeyError):
        pass
    return "Article introuvable aujourd'hui. Essayez plus tard."


def tokenize(text: str) -> list[dict]:
    text_lower = text.lower()
    tokens: list[dict] = []
    for match in WORD_RE.finditer(text_lower):
        word = match.group(0)
        hidden = word not in STOPWORDS
        tokens.append({"w": word, "hidden": hidden})
    return tokens


def get_puzzle(num: int) -> dict:
    if num in PUZZLE_CACHE:
        return PUZZLE_CACHE[num]

    title = ARTICLES[num % len(ARTICLES)]
    intro = fetch_intro(title)
    tokens = tokenize(intro)
    words = [t["w"] for t in tokens if t["hidden"]]
    puzzle = {"title": title, "words": words, "tokens": tokens}
    PUZZLE_CACHE[num] = puzzle
    return puzzle


def normalize_guess(raw: str) -> str:
    w = raw.lower().strip()
    if any(ch in w for ch in ("'", '"', "\u2019")):
        w = re.split(r"['\"\u2019]", w)[-1]
    parts = WORD_RE.findall(w)
    if not parts:
        return ""
    return max(parts, key=len)


def normalize_title(text: str) -> str:
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = text.lower()
    return re.sub(r"[\s()]", "", text)


app = Flask(__name__, static_folder=str(ROOT / "web-test"), static_url_path="")
CORS(app)


@app.get("/health")
def health():
    return jsonify({"ok": True})


@app.get("/puzzle")
def puzzle():
    num = puzzle_num()
    p = get_puzzle(num)
    return jsonify(
        {
            "num": num,
            "title": p["title"],
            "title_hidden": True,
            "words": p["words"],
            "tokens": p["tokens"],
            "revealed": [],
        }
    )


@app.post("/score")
def score():
    data = request.get_json(silent=True) or {}
    num = data.get("num", puzzle_num())
    raw_word = data.get("word", "")
    w = normalize_guess(str(raw_word))

    if not w:
        return jsonify(
            {
                "word": w,
                "exact": False,
                "revealed": [],
                "score": 0.0,
                "cosine": None,
                "message": "Je ne trouve pas ce mot dans mon vocabulaire.",
            }
        )

    if w not in WORD_TO_IDX:
        return jsonify(
            {
                "word": w,
                "exact": False,
                "revealed": [],
                "score": 0.0,
                "cosine": None,
                "message": "Je ne trouve pas ce mot dans mon vocabulaire.",
            }
        )

    p = get_puzzle(num)
    words = p["words"]
    vec = EMBEDDINGS[WORD_TO_IDX[w]]
    sims = EMBEDDINGS @ vec

    playable_vocab_idx: list[int] = []
    playable_word_idx: list[int] = []
    for i, word in enumerate(words):
        idx = WORD_TO_IDX.get(word)
        if idx is not None:
            playable_vocab_idx.append(idx)
            playable_word_idx.append(i)

    if playable_vocab_idx:
        best = float(max(sims[i] for i in playable_vocab_idx))
    else:
        best = 0.0

    exact_in_words = w in words
    exact = exact_in_words or best > EXACT_THRESHOLD

    revealed: list[str] = []
    seen: set[str] = set()
    for vi, wi in zip(playable_vocab_idx, playable_word_idx):
        if sims[vi] > REVEAL_THRESHOLD:
            word = words[wi]
            if word not in seen:
                revealed.append(word)
                seen.add(word)
    if exact_in_words and w not in seen:
        revealed.append(w)

    if exact:
        message = "Trouvé !"
    elif best > REVEAL_THRESHOLD:
        message = "Très proche !"
    elif best > 0.5:
        message = "Proche..."
    else:
        message = "Froid..."

    return jsonify(
        {
            "word": w,
            "exact": exact,
            "revealed": revealed,
            "score": round((best + 1) / 2, 4),
            "cosine": round(best, 4),
            "message": message,
        }
    )


@app.post("/page")
def page():
    data = request.get_json(silent=True) or {}
    answer = str(data.get("answer", ""))
    num = data.get("num", puzzle_num())
    p = get_puzzle(num)
    correct = normalize_title(answer) == normalize_title(p["title"])
    return jsonify(
        {
            "correct": correct,
            "title": p["title"] if correct else None,
        }
    )


@app.get("/")
def index():
    return send_from_directory(app.static_folder, "index.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
