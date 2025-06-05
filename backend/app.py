from flask import Flask, jsonify, request
import requests
import random
from flask_cors import CORS
import re
from datetime import date
import unicodedata
import os
import json
import html

# Chargement du champ lexical
with open(os.path.join(os.path.dirname(__file__), "dico/lexical_field.json"), encoding="utf-8") as f:
    LEXICAL_FIELD = json.load(f)

app = Flask(__name__)
CORS(app)

# Liste de quelques titres de pages pour simplifier (à améliorer ensuite)
WIKI_TITRES = [
    "Python_(langage)"
]

DICOLINK_API_KEY = "TA_CLE_API_ICI"

def get_wikipedia_page(title):
    url = f"https://fr.wikipedia.org/api/rest_v1/page/summary/{title}"
    r = requests.get(url)
    if r.status_code == 200:
        data = r.json()
        return {
            "title": data.get("title", ""),
            "extract": data.get("extract", "")
        }
    return None

def tokenize(text):
    # On sépare les mots et la ponctuation
    return re.findall(r"\w+|[\W]", text, re.UNICODE)

@app.route("/api/random_page", methods=["GET"])
def random_page():
    title = random.choice(WIKI_TITRES)
    print(f"[PARTIE LIBRE] Titre choisi : {title}")
    page = get_wikipedia_page(title)
    if page:
        tokens = tokenize(page["extract"])
        token_info = [len(t) if t.isalpha() else t for t in tokens]
        return jsonify({
            "token_info": token_info,
            "tokens": tokens,
            "title": page["title"]
        })
    return jsonify({"error": "Page non trouvée"}), 404

@app.route("/api/daily_page", methods=["GET"])
def daily_page():
    today = date.today().isoformat()
    idx = abs(hash(today)) % len(WIKI_TITRES)
    title = WIKI_TITRES[idx]
    print(f"[MOT DU JOUR] Titre choisi : {title}")
    page = get_wikipedia_page(title)
    if page:
        tokens = tokenize(page["extract"])
        masked_tokens = [
            f"__HIDDEN_BLOCK__:{len(t)}" if t.isalpha() else t
            for t in tokens
        ]
        token_info = [len(t) if t.isalpha() else t for t in tokens]
        return jsonify({
            "token_info": token_info,
            "tokens": masked_tokens,
            "date": today,
            "title": page["title"]
        })
    return jsonify({"error": "Page non trouvée"}), 404

@app.route("/api/reveal_title", methods=["POST"])
def reveal_title():
    data = request.json
    mode = data.get("mode")
    if mode == "daily":
        today = date.today().isoformat()
        idx = abs(hash(today)) % len(WIKI_TITRES)
        title = WIKI_TITRES[idx]
        title_clean = title.replace("_", " ")
        return jsonify({"title": title_clean})
    elif mode == "random":
        # Pour le mode random, le frontend doit envoyer le titre choisi (à améliorer si besoin)
        title = data.get("title")
        title_clean = title.replace("_", " ")
        return jsonify({"title": title_clean})
    return jsonify({"error": "Mode inconnu"}), 400

@app.route("/api/reveal_text", methods=["POST"])
def reveal_text():
    data = request.json
    mode = data.get("mode")
    if mode == "daily":
        today = date.today().isoformat()
        idx = abs(hash(today)) % len(WIKI_TITRES)
        title = WIKI_TITRES[idx]
    else:
        title = data.get("title")
    page = get_wikipedia_page(title)
    if page:
        return jsonify({"extract": page["extract"]})
    return jsonify({"error": "Page non trouvée"}), 404

def get_synonyms(word):
    try:
        url = f'https://synonymes-api.vercel.app/{word}'
        r = requests.get(url, timeout=3)
        if r.status_code == 200:
            data = r.json()
            synonyms = set()
            for entry in data.get('entries', []):
                for syn in entry.get('synonyms', []):
                    if syn and syn.lower() != word.lower():
                        synonyms.add(syn.lower())
            print(f"Synonymes pour '{word}' : {synonyms}")
            return list(synonyms)
    except Exception as e:
        print(f"Erreur lors de la récupération des synonymes : {e}")
    return []

def normalize(word):
    import unicodedata
    import html
    word = html.unescape(word)  # Convertit les entités HTML
    word = word.lower()
    word = word.split('>')[0].split(':')[0]  # retire les suffixes
    word = ''.join(c for c in unicodedata.normalize('NFD', word) if unicodedata.category(c) != 'Mn')
    word = re.sub(r'[^\w-]', '', word)
    return word

@app.route("/api/reveal_word", methods=["POST"])
def reveal_word():
    data = request.json
    word = data.get("word", "").strip()
    revealed = set(data.get("revealed", []))
    mode = data.get("mode", "daily")
    # On retrouve le titre et le texte de la page
    if mode == "daily":
        today = date.today().isoformat()
        idx = abs(hash(today)) % len(WIKI_TITRES)
        title = WIKI_TITRES[idx]
    else:
        title = data.get("title")
    page = get_wikipedia_page(title)
    if not page:
        return jsonify({"error": "Page non trouvée"}), 404
    tokens = tokenize(page["extract"])
    norm_word = normalize(word)
    revealed.add(norm_word)
    champ_lexical = set(normalize(w) for w in LEXICAL_FIELD.get(norm_word, []))
    display = []
    for t in tokens:
        norm_t = normalize(t)
        if not t.isalpha():
            display.append(t)
        elif norm_t in revealed:
            display.append(t)
        elif norm_t in champ_lexical:
            display.append(f"*__HIDDEN_BLOCK__:{len(t)}*")
        else:
            display.append("__HIDDEN_BLOCK__:" + str(len(t)))
    return jsonify({
        "display": display,
        "revealed": list(revealed)
    })

def normalize_title(s):
    # Supprimer les parenthèses et leur contenu
    import re
    s = re.sub(r'\([^)]*\)', '', s)
    s = s.lower().replace('_', ' ').replace('-', ' ')
    s = ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')
    s = ' '.join(s.split())
    return s

@app.route("/api/check_title", methods=["POST"])
def check_title():
    data = request.json
    mode = data.get("mode")
    guesses = data.get("guesses", [])  # liste de mots proposés (normalisés)
    if mode == "daily":
        today = date.today().isoformat()
        idx = abs(hash(today)) % len(WIKI_TITRES)
        title = WIKI_TITRES[idx]
    else:
        title = data.get("title", "")
    # On normalise le titre (réponse) en supprimant ce qu'il y a entre parenthèses
    title_words = set(normalize_title(title).split())
    # On normalise les propositions sans toucher aux parenthèses
    def normalize(s):
        s = s.lower().replace('_', ' ').replace('-', ' ')
        s = ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')
        s = ' '.join(s.split())
        return s
    guesses_set = set(normalize(g) for g in guesses)
    if title_words.issubset(guesses_set):
        return jsonify({"ok": True})
    return jsonify({"ok": False})

if __name__ == "__main__":
    app.run(debug=True)
