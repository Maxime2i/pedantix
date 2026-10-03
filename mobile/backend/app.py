"""Serveur Pédantix — page Wikipédia du jour, alignée sur pedantix.certitudes.org.

- Nouvelle page chaque jour à midi, heure de Paris ; nº1604 = 3 octobre 2026.
- Pool : articles vitaux de Wikipédia (niveau 4), cf. fetch_articles.py.
- Texte : introduction de l'article, mise en forme conservée (gras, italique,
  paragraphes, listes). Le titre forme les premières cases (ids 0..k-1).
- Proximité : word2vec frWac de J.-P. Fauconnier (même modèle que l'original),
  score = cos × 100, affiché à partir de 35. Les cases du titre ne sont
  jamais grisées.
- Lemmes : cf. lemmatize.py.

Le client ne reçoit jamais les mots cachés : seulement leur longueur.
"""

from __future__ import annotations

import html
import json
import os
import random
import re
import sqlite3
import sys
import threading
from datetime import date, datetime, timedelta
from html.parser import HTMLParser
from pathlib import Path
from zoneinfo import ZoneInfo

import numpy as np
import requests
from flask import Flask, jsonify, request
from flask_cors import CORS

from lemmatize import reveals

HERE = Path(__file__).resolve().parent
DATA_DIR = Path(os.environ.get("PEDANTIX_DATA_DIR", str(HERE / "data")))
EMB_PATH = DATA_DIR / "frwac.npy"
VOCAB_PATH = DATA_DIR / "frwac.vocab.txt"
# Le pool est cherché à côté du code (image Docker) avant le dossier de
# données : un volume persistant ne fige pas une ancienne version du pool.
ARTICLES_PATH = next(
    (
        p
        for p in (
            Path(os.environ.get("PEDANTIX_ARTICLES", HERE / "articles.json")),
            DATA_DIR / "articles.json",
            HERE / "data" / "articles.json",
        )
        if p.is_file()
    ),
    DATA_DIR / "articles.json",
)
DB_PATH = DATA_DIR / "pedantix.db"

PARIS = ZoneInfo("Europe/Paris")
EPOCH = date(2022, 5, 13)  # jour nº0 : le nº1604 tombe le 3 octobre 2026, comme l'original
CHANGE_HOUR = 12  # nouvelle page à midi, heure française
SCORE_MIN = 35.0  # en dessous, l'original ne renvoie rien
HISTORY_DAYS = 100
MIN_WORDS = 40  # introduction trop courte : on passe à la page suivante
UA = "Pedantix/2.0 (https://github.com/Maxime2i/pedantix)"

# Mots : lettres avec traits d'union internes (« peut-être », « Saint-Louis »
# forment une seule case, comme dans le vocabulaire frWac), ou nombres.
# Comme l'original, chiffres et lettres sont séparés : « 1er » → « 1 » + « er ».
WORD_RE = re.compile(r"[^\W\d_]+(?:-[^\W\d_]+)*|\d+")
APOSTROPHES = ("'", "’")


# ---------------------------------------------------------------- embeddings


def load_embeddings() -> tuple[dict[str, int], np.ndarray | None]:
    if not (EMB_PATH.is_file() and VOCAB_PATH.is_file()):
        print(
            f"Embeddings absents ({EMB_PATH}) — proximité désactivée. "
            "Lancez mobile/backend/prepare_data.sh",
            file=sys.stderr,
        )
        return {}, None
    words = VOCAB_PATH.read_text(encoding="utf-8").split("\n")
    mat = np.load(EMB_PATH, mmap_mode="r")
    vocab: dict[str, int] = {}
    for i, w in enumerate(words):
        vocab.setdefault(w, i)
    return vocab, mat


VOCAB, EMBEDDINGS = load_embeddings()


def vec_index(form: str, elided: bool = False) -> int | None:
    """Index du vecteur d'un mot de l'article (« l » élidé → « l' »)."""
    low = form.lower()
    if elided and low + "'" in VOCAB:
        return VOCAB[low + "'"]
    return VOCAB.get(low)


# ------------------------------------------------------------------ calendrier


def puzzle_num(now: datetime | None = None) -> int:
    now = now or datetime.now(PARIS)
    return ((now.astimezone(PARIS) - timedelta(hours=CHANGE_HOUR)).date() - EPOCH).days


def change_timestamp() -> int:
    """Instant (epoch, secondes) du dernier changement de page."""
    now = datetime.now(PARIS)
    start = now.replace(hour=CHANGE_HOUR, minute=0, second=0, microsecond=0)
    if now < start:
        start -= timedelta(days=1)
    return int(start.timestamp())


# ---------------------------------------------------------------------- pool


def load_articles() -> list[str]:
    with ARTICLES_PATH.open(encoding="utf-8") as fh:
        titles = [str(t) for t in json.load(fh) if t]
    random.Random("pedantix").shuffle(titles)
    return titles


ARTICLES = load_articles()


def candidate_titles(num: int):
    n = len(ARTICLES)
    for j in range(n):
        yield ARTICLES[(num + j * 7919) % n]


def url_title(title: str) -> str:
    return title.replace(" ", "_")


# ---------------------------------------------------------------- base locale


def db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.execute(
        "CREATE TABLE IF NOT EXISTS puzzles (num INTEGER PRIMARY KEY, title TEXT NOT NULL, data TEXT NOT NULL)"
    )
    conn.execute(
        "CREATE TABLE IF NOT EXISTS solvers (num INTEGER PRIMARY KEY, count INTEGER NOT NULL)"
    )
    return conn


def solvers(num: int) -> int:
    with db() as conn:
        row = conn.execute("SELECT count FROM solvers WHERE num = ?", (num,)).fetchone()
    return row[0] if row else 0


def add_solver(num: int) -> int:
    with db() as conn:
        conn.execute(
            "INSERT INTO solvers (num, count) VALUES (?, 1) "
            "ON CONFLICT(num) DO UPDATE SET count = count + 1",
            (num,),
        )
        return conn.execute("SELECT count FROM solvers WHERE num = ?", (num,)).fetchone()[0]


# ------------------------------------------------------------ article → cases


BLOCK_TAGS = {"p", "ul", "ol", "li", "dl", "dt", "dd", "blockquote"}
INLINE_TAGS = {"b", "i", "sub", "sup"}
TAG_ALIASES = {"strong": "b", "em": "i"}
SKIP_TAGS = {"style", "script", "table", "figure", "math", "annotation"}


class IntroParser(HTMLParser):
    """HTML de l'introduction → arbre {"t": tag, "c": [...]} | str.

    Les balises inconnues (span, abbr, a…) sont dépliées et les textes
    adjacents fusionnés : « [<span>z</span><span>o</span>] » donne « [zo] ».
    """

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.root: dict = {"t": "root", "c": []}
        self.stack = [self.root]
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        tag = TAG_ALIASES.get(tag, tag)
        if tag in SKIP_TAGS:
            self.skip += 1
        elif self.skip:
            return
        elif tag in BLOCK_TAGS or tag in INLINE_TAGS:
            node = {"t": tag, "c": []}
            self.stack[-1]["c"].append(node)
            self.stack.append(node)

    def handle_endtag(self, tag):
        tag = TAG_ALIASES.get(tag, tag)
        if tag in SKIP_TAGS:
            self.skip = max(0, self.skip - 1)
        elif self.skip:
            return
        elif tag in BLOCK_TAGS or tag in INLINE_TAGS:
            for i in range(len(self.stack) - 1, 0, -1):
                if self.stack[i]["t"] == tag:
                    del self.stack[i:]
                    break

    def handle_data(self, data):
        if self.skip:
            return
        children = self.stack[-1]["c"]
        if children and isinstance(children[-1], str):
            children[-1] += data
        else:
            children.append(data)


CONTAINER_TAGS = {"root", "ul", "ol", "dl", "blockquote"}


def _clean(node: dict) -> dict | None:
    """Espaces normalisés, blocs vides supprimés."""
    container = node["t"] in CONTAINER_TAGS
    out: list = []
    for child in node["c"]:
        if isinstance(child, str):
            text = re.sub(r"\s+", " ", child)
            # Entre deux blocs, les blancs ne comptent pas ; dans un texte,
            # ils séparent les mots (« <b>x</b> <i>y</i> »).
            if text.strip() or not container:
                out.append(text)
        else:
            c = _clean(child)
            if c:
                out.append(c)
    if out and isinstance(out[0], str):
        out[0] = out[0].lstrip()
    if out and isinstance(out[-1], str):
        out[-1] = out[-1].rstrip()
    out = [c for c in out if c != ""]
    if not out or not any(
        (isinstance(c, str) and WORD_RE.search(c)) or isinstance(c, dict) for c in out
    ):
        return None
    return {"t": node["t"], "c": out}


def parse_intro(raw_html: str) -> list[dict]:
    parser = IntroParser()
    parser.feed(raw_html)
    root = _clean(parser.root)
    blocks: list[dict] = []
    for child in root["c"] if root else []:
        if isinstance(child, str) or child["t"] in INLINE_TAGS:
            if blocks and blocks[-1].get("loose"):
                blocks[-1]["c"].append(child)
            else:
                blocks.append({"t": "p", "c": [child], "loose": True})
        else:
            blocks.append(child)
    for b in blocks:
        b.pop("loose", None)
    return blocks


def tokenize_tree(nodes: list, words: list[dict]) -> list:
    """Remplace chaque mot par une case {"w": id, "n": longueur}."""
    out: list = []
    for node in nodes:
        if isinstance(node, dict):
            out.append({"t": node["t"], "c": tokenize_tree(node["c"], words)})
            continue
        pos = 0
        for m in WORD_RE.finditer(node):
            if m.start() > pos:
                out.append(node[pos : m.start()])
            elided = node[m.end() : m.end() + 1] in APOSTROPHES
            words.append({"text": m.group(), "elided": elided})
            out.append({"w": len(words) - 1, "n": len(m.group())})
            pos = m.end()
        if pos < len(node):
            out.append(node[pos:])
    return out


def fetch_intro(title: str) -> tuple[str, str] | None:
    """(titre canonique, HTML de l'introduction), ou None si la page n'existe pas."""
    resp = requests.get(
        "https://fr.wikipedia.org/w/api.php",
        params={
            "action": "query",
            "prop": "extracts",
            "exintro": "1",
            "redirects": "1",
            "format": "json",
            "formatversion": "2",
            "titles": title,
        },
        headers={"User-Agent": UA},
        timeout=15,
    )
    resp.raise_for_status()
    pages = resp.json().get("query", {}).get("pages", [])
    if not pages or pages[0].get("missing") or not pages[0].get("extract"):
        return None
    return pages[0]["title"], pages[0]["extract"]


def build_puzzle(title: str, raw_html: str) -> dict | None:
    words: list[dict] = []
    title_nodes = tokenize_tree([title], words)
    k = len(words)
    article = tokenize_tree(parse_intro(raw_html), words)
    if k == 0 or len(words) - k < MIN_WORDS:
        return None
    return {"title": title, "k": k, "words": words, "title_nodes": title_nodes, "article": article}


# ------------------------------------------------------------------- puzzles


def number_score(guess: int, hidden: int) -> float:
    """Proximité de deux nombres, comme l'original : 100 × (1 − |écart| / caché).

    Mesuré sur le jour nº1604 : 1804 → 1582 = 85,97 ; 2024 → 1804 = 87,8.
    """
    return round(100 * (1 - abs(guess - hidden) / hidden), 2)


class Puzzle:
    def __init__(self, num: int, data: dict) -> None:
        self.num = num
        self.title: str = data["title"]
        self.k: int = data["k"]
        self.words: list[dict] = data["words"]
        self.title_nodes = data["title_nodes"]
        self.article = data["article"]
        self.secret = [url_title(self.title), self.title]

        # Formes (minuscules) → ids, pour les révélations exactes.
        self.forms: dict[str, list[int]] = {}
        for i, w in enumerate(self.words):
            self.forms.setdefault(w["text"].lower(), []).append(i)

        # Proximité : une ligne par (forme, élision) de l'article, hors titre.
        groups: dict[tuple[str, bool], list[int]] = {}
        for i in range(self.k, len(self.words)):
            w = self.words[i]
            groups.setdefault((w["text"].lower(), w["elided"]), []).append(i)
        self.close_ids: list[list[int]] = []
        rows: list[int] = []
        if EMBEDDINGS is not None:
            for (form, elided), ids in groups.items():
                idx = vec_index(form, elided)
                if idx is not None:
                    rows.append(idx)
                    self.close_ids.append(ids)
        self.close_mat = (
            np.asarray(EMBEDDINGS[rows]) if rows else np.zeros((0, 1), dtype=np.float32)
        )
        # Nombres : absents de frWac, rapprochés par écart relatif (cf. number_score).
        self.numbers = [
            (int(form), ids) for (form, _), ids in groups.items() if form.isdigit() and int(form) > 0
        ]

    def score(self, guess: str) -> dict:
        x: dict[str, list[int]] = {}
        exact: set[int] = set()
        for form, ids in self.forms.items():
            if reveals(guess, form):
                for i in ids:
                    x.setdefault(self.words[i]["text"], []).append(i)
                    exact.add(i)
        if guess.isdigit():
            # Un nombre est toujours accepté, même sans voisin.
            for value, ids in self.numbers:
                score = number_score(int(guess), value)
                ids = [i for i in ids if i not in exact]
                if score >= SCORE_MIN and ids:
                    x.setdefault(f"#{score}", []).extend(ids)
            return {"x": x, "known": True}
        known = bool(exact)
        g = VOCAB.get(guess)
        if g is not None and len(self.close_ids):
            known = True
            sims = self.close_mat @ np.asarray(EMBEDDINGS[g])
            for j in np.nonzero(sims * 100 >= SCORE_MIN)[0]:
                ids = [i for i in self.close_ids[j] if i not in exact]
                if ids:
                    x.setdefault(f"#{round(float(sims[j]) * 100, 2)}", []).extend(ids)
        elif g is not None:
            known = True
        return {"x": x, "known": known}

    def title_found(self, answer: list) -> bool:
        if len(answer) < self.k:
            return False
        return all(reveals(normalize(str(answer[i])), self.words[i]["text"]) for i in range(self.k))

    def reveal_all(self) -> dict[str, str]:
        return {str(i): w["text"] for i, w in enumerate(self.words)}


PUZZLES: dict[int, Puzzle] = {}
PUZZLE_LOCK = threading.Lock()


def get_puzzle(num: int) -> Puzzle:
    """Puzzle du jour `num`, construit une fois puis stocké en base.

    Une erreur réseau lève une exception (rien n'est mis en cache) : la
    requête suivante retentera Wikipédia.
    """
    if num in PUZZLES:
        return PUZZLES[num]
    with PUZZLE_LOCK:
        if num in PUZZLES:
            return PUZZLES[num]
        with db() as conn:
            row = conn.execute("SELECT data FROM puzzles WHERE num = ?", (num,)).fetchone()
        if row:
            data = json.loads(row[0])
        else:
            data = None
            for i, candidate in enumerate(candidate_titles(num)):
                if i >= 20:
                    raise RuntimeError("Aucune page exploitable trouvée")
                fetched = fetch_intro(candidate)
                if fetched:
                    data = build_puzzle(*fetched)
                if data:
                    break
            with db() as conn:
                conn.execute(
                    "INSERT OR REPLACE INTO puzzles (num, title, data) VALUES (?, ?, ?)",
                    (num, data["title"], json.dumps(data, ensure_ascii=False)),
                )
        puzzle = Puzzle(num, data)
        for old in [n for n in PUZZLES if n < num - 1]:
            del PUZZLES[old]
        PUZZLES[num] = puzzle
        return puzzle


def past_titles(first: int, last: int) -> dict[int, str]:
    """Titres des jours first..last : ceux stockés, sinon le premier candidat."""
    with db() as conn:
        rows = dict(
            conn.execute("SELECT num, title FROM puzzles WHERE num BETWEEN ? AND ?", (first, last))
        )
    return {n: rows.get(n) or next(candidate_titles(n)) for n in range(first, last + 1)}


def all_solvers(first: int, last: int) -> dict[int, int]:
    with db() as conn:
        return dict(
            conn.execute("SELECT num, count FROM solvers WHERE num BETWEEN ? AND ?", (first, last))
        )


# ----------------------------------------------------------------------- API


def normalize(word: str) -> str:
    """Comme l'original : minuscules, seuls lettres, chiffres et tirets."""
    return re.sub(r"[^\w-]|_", "", word).lower()


app = Flask(__name__)
CORS(app)


def requested_num() -> int | None:
    raw = request.args.get("n")
    if raw is None:
        body = request.get_json(silent=True) or {}
        raw = body.get("num")
    try:
        return int(raw)
    except (TypeError, ValueError):
        return None


@app.get("/health")
def health():
    return jsonify({"ok": True, "embeddings": EMBEDDINGS is not None, "num": puzzle_num()})


@app.get("/puzzle")
def puzzle():
    num = puzzle_num()
    try:
        p = get_puzzle(num)
    except (requests.RequestException, RuntimeError) as exc:
        return jsonify({"error": f"Wikipédia indisponible : {exc}"}), 503
    yesterday = past_titles(num - 1, num - 1)[num - 1]
    return jsonify(
        {
            "num": num,
            "change": change_timestamp(),
            "k": p.k,
            "count": len(p.words),
            "title": p.title_nodes,
            "article": p.article,
            "yesterday": [url_title(yesterday), yesterday],
            "v": solvers(num),
        }
    )


@app.post("/score")
def score():
    num = puzzle_num()
    if requested_num() != num:
        return jsonify({"r": True})
    body = request.get_json(silent=True) or {}
    word = normalize(str(body.get("word", "")))[:60]
    if not word:
        return jsonify({"e": "Je ne trouve pas ce mot.", "w": word})
    try:
        p = get_puzzle(num)
    except (requests.RequestException, RuntimeError):
        return jsonify({"e": "Une erreur s´est produite."}), 503

    result = p.score(word)
    if not result["known"]:
        return jsonify({"e": f"Je ne trouve pas le mot <i>{html.escape(word)}</i>.", "w": word})

    payload = {"w": word, "x": result["x"], "v": solvers(num)}
    answer = body.get("answer")
    if isinstance(answer, list) and p.title_found(answer[: p.k]):
        payload["d"] = p.secret
        payload["v"] = add_solver(num)
    return jsonify(payload)


@app.post("/page")
def page():
    num = puzzle_num()
    body = request.get_json(silent=True) or {}
    answer = str(body.get("answer") or request.form.get("answer") or "")
    try:
        p = get_puzzle(num)
    except (requests.RequestException, RuntimeError):
        return jsonify({}), 503
    if answer not in (p.title, url_title(p.title)):
        return jsonify({})
    return jsonify(p.reveal_all())


@app.get("/stats")
def stats():
    num = puzzle_num()
    if requested_num() != num:
        return jsonify({"r": True})
    return jsonify({"v": solvers(num)})


@app.get("/history")
def history():
    num = puzzle_num()
    first = max(0, num - HISTORY_DAYS)
    titles = past_titles(first, num - 1)
    counts = all_solvers(first, num)
    rows = [[num, counts.get(num, 0), ["", ""]]]
    for n in range(num - 1, first - 1, -1):
        rows.append([n, counts.get(n, 0), [url_title(titles[n]), titles[n]]])
    return jsonify(rows)


@app.get("/")
def index():
    return jsonify({"ok": True, "service": "pedantix", "num": puzzle_num()})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=False)
