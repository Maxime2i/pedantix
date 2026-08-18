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
# Seuil « exact » (vert) : au-dessus, un mot de l'article est considéré trouvé
# et affiché en clair.
EXACT_THRESHOLD = 0.85
# Seuil « proche » (orange) : similarité cosinus à partir de laquelle un mot
# de l'article devient visible en orange (proche mais pas trouvé). Calibré sur
# l'article « Amplificateur électronique » : « audio » (cos max 0.5404) révèle
# uniquement les mots réellement liés (analogique 0.5404, amplificateurs
# 0.5168, amplificateur 0.5122, ampli 0.4927) ; « banane » (0.3133), « voiture »
# (0.4074) ou « moteur » (0.4242) ne révèlent rien. Au-delà de 0.50 on perd
# « ampli » ; en dessous on fait remonter des mots plus marginaux.
SEUIL_ORANGE = 0.49
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
    # Fidélité à l'original : TOUS les mots sont masqués au départ, y compris
    # les stopwords (« de », « la », « le »…). Le champ `hidden` reste présent
    # pour compatibilité mais vaut toujours True : la visibilité est pilotée
    # par le score courant de chaque position (voir /score).
    text_lower = text.lower()
    tokens: list[dict] = []
    for match in WORD_RE.finditer(text_lower):
        tokens.append({"w": match.group(0), "hidden": True})
    return tokens


def get_puzzle(num: int) -> dict:
    if num in PUZZLE_CACHE:
        return PUZZLE_CACHE[num]

    title = ARTICLES[num % len(ARTICLES)]
    intro = fetch_intro(title)
    tokens = tokenize(intro)
    words = [t["w"] for t in tokens]
    # État de la partie : score courant par position de token (0 = masqué).
    # Accumulé par /score via score[pos] = max(score[pos], similarité).
    scores = [0.0] * len(tokens)
    puzzle = {"title": title, "words": words, "tokens": tokens, "scores": scores}
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
            # État courant de la partie (scores par position) + seuils :
            # permet au client de restaurer les révélations après un rechargement.
            "scores": p["scores"],
            "thresholds": {"exact": EXACT_THRESHOLD, "proche": SEUIL_ORANGE},
            "revealed": [],
        }
    )


def level_for(score: float) -> str:
    if score >= EXACT_THRESHOLD:
        return "exact"
    if score >= SEUIL_ORANGE:
        return "proche"
    return "hidden"


def revealable(word: str) -> bool:
    # Un token d'article ne doit JAMAIS être révélé si c'est un stopword ou un
    # mot de ≤ 2 lettres : fastText leur donne des similarités artificiellement
    # hautes avec des mots fréquents (ex. « son » vs « en » ≈ 0.57), ce qui
    # faisait apparaître « un », « ou », « est », « la »… dans les révélations.
    # Leur score peut être calculé (chaud/froid global) mais ne franchit aucun
    # seuil d'affichage.
    return word not in STOPWORDS and len(word) > 2


@app.post("/score")
def score():
    data = request.get_json(silent=True) or {}
    num = data.get("num", puzzle_num())
    raw_word = data.get("word", "")
    w = normalize_guess(str(raw_word))

    if not w or w not in WORD_TO_IDX:
        return jsonify(
            {
                "word": w,
                "exact": False,
                "revealed": [],
                "updates": [],
                "score": 0.0,
                "cosine": None,
                "message": "Je ne trouve pas ce mot dans mon vocabulaire.",
            }
        )

    p = get_puzzle(num)
    tokens = p["tokens"]
    scores = p["scores"]

    vec = EMBEDDINGS[WORD_TO_IDX[w]]
    sims = EMBEDDINGS @ vec

    # Similarité avec CHAQUE token de l'article (stopwords compris) : ils ont
    # un embedding fastText, leur similarité restera faible mais ils participent
    # au calcul. Token sans embedding → similarité 0.
    token_sims: list[float] = []
    for t in tokens:
        idx = WORD_TO_IDX.get(t["w"])
        token_sims.append(float(sims[idx]) if idx is not None else 0.0)

    best = max(token_sims, default=0.0)
    exact_in_words = w in p["words"]
    exact = exact_in_words or best >= EXACT_THRESHOLD

    # État accumulé : score[pos] = max(score[pos], similarité). On ne signale
    # dans `updates` que les positions dont le niveau d'affichage change
    # (franchissement d'un seuil), pour que le client recolore en conséquence.
    # Les stopwords et mots ≤ 2 lettres sont exclus de la révélation : leur
    # score n'est jamais accumulé (score[pos] reste 0) pour qu'ils ne puissent
    # pas non plus ressortir via la restauration d'état de /puzzle.
    updates: list[dict] = []
    revealed: list[str] = []
    seen_revealed: set[str] = set()
    for i, sim in enumerate(token_sims):
        if not revealable(tokens[i]["w"]):
            continue
        old_level = level_for(scores[i])
        scores[i] = max(scores[i], sim)
        new_level = level_for(scores[i])
        if new_level != old_level and new_level != "hidden":
            updates.append({"pos": i, "word": tokens[i]["w"], "level": new_level})
            if new_level == "exact":
                word = tokens[i]["w"]
                if word not in seen_revealed:
                    revealed.append(word)
                    seen_revealed.add(word)
    if exact_in_words and w not in seen_revealed and revealable(w):
        revealed.append(w)

    if exact:
        message = "Trouvé !"
    elif best >= 0.70:
        message = "Très proche !"
    elif best >= SEUIL_ORANGE:
        message = "Proche..."
    else:
        message = "Froid..."

    return jsonify(
        {
            "word": w,
            "exact": exact,
            "revealed": revealed,
            "updates": updates,
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
