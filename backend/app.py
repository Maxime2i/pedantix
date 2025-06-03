from flask import Flask, jsonify, request
import requests
import random
from flask_cors import CORS
import re
from datetime import date
import unicodedata

app = Flask(__name__)
CORS(app)

# Liste de quelques titres de pages pour simplifier (à améliorer ensuite)
WIKI_TITRES = [
    "France", "Python_(langage)", "Tour_Eiffel", "Albert_Einstein", "Chat", "Intelligence_artificielle"
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
            "token_info": token_info
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
        token_info = [len(t) if t.isalpha() else t for t in tokens]
        return jsonify({
            "token_info": token_info,
            "date": today
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
        return jsonify({"title": title})
    elif mode == "random":
        # Pour le mode random, le frontend doit envoyer le titre choisi (à améliorer si besoin)
        title = data.get("title")
        return jsonify({"title": title})
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

@app.route("/api/reveal_word", methods=["POST"])
def reveal_word():
    data = request.json
    token_info = data.get("token_info", [])
    revealed_tokens = data.get("revealed_tokens", {})
    word = data.get("word", "").lower()
    # Correction : conversion explicite des clés en int
    new_revealed = {int(k): v for k, v in revealed_tokens.items()}
    for i, info in enumerate(token_info):
        if isinstance(info, int) and len(word) == info:
            new_revealed[i] = word
    return jsonify({
        "revealed_tokens": new_revealed,
        "synonym_guesses": {},
    })

def normalize_title(s):
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
    def normalize(s):
        s = s.lower().replace('_', ' ').replace('-', ' ')
        s = ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')
        s = ' '.join(s.split())
        return s
    title_words = set(normalize(title).split())
    guesses_set = set(normalize(g) for g in guesses)
    if title_words.issubset(guesses_set):
        return jsonify({"ok": True})
    return jsonify({"ok": False})

if __name__ == "__main__":
    app.run(debug=True)
