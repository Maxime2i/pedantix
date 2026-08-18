"""Serveur Flask Pédantix mobile — article Wikipédia du jour, devinettes sémantiques."""

from __future__ import annotations

import json
import os
import re
import sys
import unicodedata
from datetime import date, datetime, timezone
from pathlib import Path

import numpy as np
import requests
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

from lemmatize import lemmatize
from stopwords import STOPWORDS

DATA_DIR = Path(os.environ.get("PEDANTIX_DATA_DIR", "/home/ubuntu/pedantix/mobile/backend/data"))
VEC_PATH = DATA_DIR / "frWiki_reduced.vec"
ARTICLES_PATH = DATA_DIR / "articles.json"
# Gameplay Cémantix : chaque PROPOSITION reçoit une température selon sa
# proximité sémantique avec le TITRE de l'article (le « mot secret »).
# Seuil « exact » (vert) : la proposition est très proche / identique au titre.
# Seuil « proche » (orange) : la proposition est liée au titre sans le trouver.
# ATTENTION : la couleur de l'historique côté client donne PRIORITÉ à la
# présence dans l'article (present_in_article → vert), la température ne
# s'applique qu'aux mots absents du texte.
# Calibrés sur « Amplificateur électronique » (cosinus vs embedding du titre,
# moyenne des embeddings de ses mots) : « amplificateur » 0.8646 → vert,
# « ampli » 0.6393 → orange, « audio » 0.5291 → orange, « fréquence » 0.5224
# → orange, « frequence » 0.4453 → orange, « banane » 0.2493 → rouge,
# stopwords (« le », « de »…) ~0.05-0.11 → rouge côté température MAIS vert
# car présents dans l'article. En dessous de 0.40 : bruit sémantique mesuré
# à ~0.31 max (« avion ») — la bande [0.40, 0.45] ne contient que des mots
# réellement liés au sujet.
EXACT_THRESHOLD = 0.85
PROCH_THRESHOLD = 0.40
# Révélation ORANGE dans l'article : un mot de l'article dont la similarité
# cosinus avec la proposition dépasse ce seuil s'affiche en orange (la
# proposition s'affiche, avec un dégradé de teinte selon le cosinus).
# Calibré sur l'article « Amplificateur électronique » : proposer
# « amplificateur » révèle ampli (0.752), amplification (0.835), signal
# (0.602), électronique (0.4950), électrique (0.555)… ; proposer « banane » ne
# révèle RIEN (max mesuré 0.313). Plancher de bruit hors stopwords ~0.45-0.59
# sur des mots isolés (« pain »->puissance 0.514, « économie »->puissance
# 0.532) : fausses révélations rares et limitées à 1-2 mots, acceptées. Les
# stopwords ne sont JAMAIS révélés en orange par cosinus (uniquement en vert
# par présence exacte ou par lemme).
SEUIL_ORANGE_REVEAL = 0.49
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
    # côté CLIENT, uniquement par les révélations exactes renvoyées par /score.
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
    # Mots du TITRE (mêmes règles de normalisation que l'article : minuscules,
    # accents conservés). Indice = position dans `title_words`. Ils sont
    # révélables indépendamment de l'article (h2 masqué puis révélé).
    title_words = WORD_RE.findall(title.lower())
    if not title_words:
        title_words = [title.lower()]
    # Plus AUCUN état de partie côté serveur : les scores/ révélations sont
    # 100 % côté client. Le cache ne garde que le contenu du puzzle (titre,
    # tokens, mots) pour éviter de re-télécharger l'article à chaque requête.
    puzzle = {
        "title": title,
        "title_words": title_words,
        "words": words,
        "tokens": tokens,
    }
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


def normalize_full(text: str) -> str:
    """Phrase entière normalisée : sans accents, minuscules, uniquement les
    caractères de mots (supprime ponctuation, tirets, apostrophes)."""
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    return "".join(WORD_RE.findall(text.lower()))


app = Flask(__name__, static_folder=str(ROOT / "web-test"), static_url_path="")
CORS(app)


@app.get("/health")
def health():
    return jsonify({"ok": True})


@app.get("/puzzle")
def puzzle():
    # `?num=X` charge un jour précis (historique) ; défaut = jour courant.
    num = request.args.get("num", type=int) or puzzle_num()
    p = get_puzzle(num)
    return jsonify(
        {
            "num": num,
            "title": p["title"],
            "title_hidden": True,
            "title_words": p["title_words"],
            "words": p["words"],
            "tokens": p["tokens"],
            # Plus AUCUN état de partie : pas de `scores` accumulés. Chaque
            # joueur part de zéro, ses révélations vivent côté client.
            "thresholds": {"exact": EXACT_THRESHOLD, "proche": PROCH_THRESHOLD},
            "revealed": [],
        }
    )


def temperature_for(cosine: float) -> str:
    if cosine >= EXACT_THRESHOLD:
        return "exact"
    if cosine >= PROCH_THRESHOLD:
        return "proche"
    return "froid"


def title_embedding(title: str) -> np.ndarray | None:
    """Embedding du titre = moyenne des embeddings de ses mots présents dans
    le vocabulaire. None si aucun mot du titre n'est connu."""
    title_words = [tw for tw in WORD_RE.findall(title.lower()) if tw in WORD_TO_IDX]
    if not title_words:
        return None
    if len(title_words) == 1:
        vec = EMBEDDINGS[WORD_TO_IDX[title_words[0]]]
    else:
        vec = np.mean([EMBEDDINGS[WORD_TO_IDX[tw]] for tw in title_words], axis=0)
    norm = np.linalg.norm(vec)
    if norm == 0:
        return None
    return vec / norm


def article_reveals(w: str, words: list[str]) -> tuple[list[int], list[dict]]:
    """Révélations dans l'article pour la proposition `w`.

    Retourne (positions_vertes, article_updates) :
    - positions_vertes : le mot est PRÉSENT tel quel (tw == w) OU partage le
      MÊME LEMME (formes fléchies : « être » révèle est/sont/soit, « le »
      révèle la/les/l') -> VERT, le mot réel de l'article s'affiche en clair.
      Les stopwords sont inclus (un mot présent ou du même lemme est un mot
      TROUVÉ).
    - article_updates    : mots PROCHES par COSINUS uniquement -> ORANGE, la
      proposition s'affiche (display = w) avec le cosinus dans `cos` pour le
      dégradé de teinte côté client. Anti-spam : jamais un stopword en orange
      par cosinus ; jamais un mot déjà vert (présence exacte OU lemme).
    """
    w_lemma = lemmatize(w)
    exact = [i for i, tw in enumerate(words) if tw == w or lemmatize(tw) == w_lemma]
    exact_set = set(exact)
    updates: dict[int, dict] = {}
    if w in WORD_TO_IDX:
        w_vec = EMBEDDINGS[WORD_TO_IDX[w]]
        for i, tw in enumerate(words):
            if i in exact_set:
                continue
            if tw in STOPWORDS or w in STOPWORDS:
                continue
            if tw not in WORD_TO_IDX:
                continue
            c = float(w_vec @ EMBEDDINGS[WORD_TO_IDX[tw]])
            if c >= SEUIL_ORANGE_REVEAL:
                updates[i] = {"pos": i, "word": tw, "display": w,
                              "level": "proche", "source": "cosine",
                              "cos": round(c, 4)}
    return exact, list(updates.values())


def title_updates_for(w: str, title_words: list[str]) -> list[dict]:
    """Révélations des mots du TITRE (h2) pour la proposition `w`.

    Règles officielles : « les mots du titre sont corrects ou pas, ils ne
    sont JAMAIS grisés ». Le titre ne passe qu'en VERT (quand trouvé) ou
    reste masqué : AUCUNE révélation « proche » (ni lemme ni cosinus).
    - level "exact" : la proposition EST le mot du titre (vert).
    - Le même lemme (forme fléchie, ex. « électroniques » -> « électronique »)
      passe aussi en vert, cohérent avec l'article.
    """
    updates: list[dict] = []
    w_lemma = lemmatize(w)
    for j, tw in enumerate(title_words):
        if tw == w or lemmatize(tw) == w_lemma:
            updates.append({"idx": j, "word": tw, "display": tw, "level": "exact"})
    return updates


@app.post("/score")
def score():
    # STATELESS : aucune écriture dans PUZZLE_CACHE. La réponse dépend
    # uniquement de (num, word) : température vs TITRE + révélations exactes.
    data = request.get_json(silent=True) or {}
    num = data.get("num", puzzle_num())
    raw_word = str(data.get("word", ""))
    p = get_puzzle(num)
    title = p["title"]

    w = normalize_guess(raw_word)
    title_norm = normalize_full(title)
    # Victoire : soit la phrase complète normalisée == titre, soit le mot
    # normalisé le plus long == titre (cas des titres à un seul mot).
    title_found = normalize_full(raw_word) == title_norm or (w and w == title_norm)

    if title_found:
        # Tous les mots du titre sont révélés (le client affiche la victoire).
        title_updates = [
            {"idx": j, "word": tw, "display": tw, "level": "exact"}
            for j, tw in enumerate(p["title_words"])
        ]
        return jsonify(
            {
                "word": w,
                "title_found": True,
                "correct": True,
                "cosine": 1.0,
                "score": 1.0,
                "temperature_level": "exact",
                "revealed_positions": [],
                "article_updates": [],
                "title_updates": title_updates,
                "present_in_article": True,
                "message": "Bravo ! Vous avez trouvé le titre !",
            }
        )

    # Température de la PROPOSITION vs le TITRE (cosinus sémantique).
    cosine = None
    score_val = 0.0
    temperature_level = "froid"
    if w and w in WORD_TO_IDX:
        tvec = title_embedding(title)
        if tvec is not None:
            cosine = float(EMBEDDINGS[WORD_TO_IDX[w]] @ tvec)
            score_val = round((cosine + 1) / 2, 4)
            temperature_level = temperature_for(cosine)

    # Révélation dans l'article : TOUT mot proposé présent dans le texte
    # (comparaison exacte normalisée) révèle ses positions — y compris les
    # stopwords et mots courts (« un », « le », « de »…) : un mot présent est
    # un mot TROUVÉ, il se montre en vert. Plus AUCUN filtre.
    # En COMPLÉMENT : mots proches (orange) dans l'article ET le titre.
    revealed_positions, article_updates = ([], [])
    if w:
        revealed_positions, article_updates = article_reveals(w, p["words"])
    present_in_article = bool(revealed_positions)
    title_updates = title_updates_for(w, p["title_words"]) if w else []

    if not w or w not in WORD_TO_IDX:
        # Texte EXACT de l'original : « Je ne trouve pas ce mot. »
        message = "Je ne trouve pas ce mot."
    elif temperature_level == "exact":
        message = "Très proche du titre !"
    elif temperature_level == "proche":
        message = "Proche du titre..."
    else:
        message = "Froid..."

    return jsonify(
        {
            "word": w,
            "title_found": False,
            "correct": False,
            "cosine": round(cosine, 4) if cosine is not None else None,
            "score": score_val,
            "temperature_level": temperature_level,
            "revealed_positions": revealed_positions,
            "article_updates": article_updates,
            "title_updates": title_updates,
            "present_in_article": present_in_article,
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
