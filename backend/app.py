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
import threading

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

def get_random_wikipedia_page():
    # 1. Obtenir un titre de page aléatoire
    url_random = "https://fr.wikipedia.org/w/api.php?action=query&format=json&list=random&rnnamespace=0&rnlimit=1"
    r = requests.get(url_random)
    if r.status_code != 200:
        return None
    data = r.json()
    random_list = data.get("query", {}).get("random", [])
    if not random_list:
        return None
    title = random_list[0]["title"]

    # 2. Obtenir le texte et l'image de la page
    url_page = (
        "https://fr.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages"
        f"&exintro=true&explaintext=true&piprop=original&titles={requests.utils.quote(title)}"
    )
    r2 = requests.get(url_page)
    if r2.status_code != 200:
        return None
    data2 = r2.json()
    pages = data2.get("query", {}).get("pages", {})
    if not pages:
        return None
    page_data = next(iter(pages.values()))
    extract = page_data.get("extract", "")
    image_url = page_data.get("original", {}).get("source") if "original" in page_data else None
    return {
        "title": title,
        "extract": extract,
        "image_url": image_url
    }

def get_daily_title():
    """Retourne le titre du jour, en le stockant dans un fichier si besoin."""
    today = date.today().isoformat()
    path = os.path.join(os.path.dirname(__file__), "daily_page.json")
    lock = threading.Lock()
    with lock:
        if os.path.exists(path):
            with open(path, encoding="utf-8") as f:
                try:
                    data = json.load(f)
                except Exception:
                    data = {}
        else:
            data = {}
        if data.get("date") == today and data.get("title"):
            return data["title"]
        # Sinon, on génère un nouveau titre et on le stocke
        url_random = "https://fr.wikipedia.org/w/api.php?action=query&format=json&list=random&rnnamespace=0&rnlimit=1"
        r = requests.get(url_random)
        if r.status_code != 200:
            return None
        data_random = r.json()
        random_list = data_random.get("query", {}).get("random", [])
        if not random_list:
            return None
        title = random_list[0]["title"]
        # On stocke
        with open(path, "w", encoding="utf-8") as f:
            json.dump({"date": today, "title": title}, f)
        return title

@app.route("/api/random_page", methods=["GET"])
def random_page():
    page = get_random_wikipedia_page()
    if page and page["extract"]:
        tokens = tokenize(page["extract"])
        token_info = [len(t) if t.isalpha() else t for t in tokens]
        return jsonify({
            "token_info": token_info,
            "tokens": tokens,
            "title": page["title"],
            "image_url": page["image_url"]
        })
    return jsonify({"error": "Page non trouvée"}), 404

@app.route("/api/daily_page", methods=["GET"])
def daily_page():
    today = date.today().isoformat()
    title = get_daily_title()
    if not title:
        return jsonify({"error": "Page non trouvée"}), 404
    # 2. Obtenir le texte et l'image de la page
    url_page = (
        "https://fr.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages"
        f"&exintro=true&explaintext=true&piprop=original&titles={requests.utils.quote(title)}"
    )
    r2 = requests.get(url_page)
    if r2.status_code != 200:
        return jsonify({"error": "Page non trouvée"}), 404
    data2 = r2.json()
    pages = data2.get("query", {}).get("pages", {})
    if not pages:
        return jsonify({"error": "Page non trouvée"}), 404
    page_data = next(iter(pages.values()))
    extract = page_data.get("extract", "")
    image_url = page_data.get("original", {}).get("source") if "original" in page_data else None

    print(f"[MOT DU JOUR] Titre choisi : {title}", extract, image_url)

    if extract:
        tokens = tokenize(extract)
        masked_tokens = [
            f"__HIDDEN_BLOCK__:{len(t)}" if t.isalpha() else t
            for t in tokens
        ]
        token_info = [len(t) if t.isalpha() else t for t in tokens]
        return jsonify({
            "token_info": token_info,
            "tokens": masked_tokens,
            "date": today,
            "title": title,
            "image_url": image_url
        })
    return jsonify({"error": "Page non trouvée"}), 404

@app.route("/api/reveal_title", methods=["POST"])
def reveal_title():
    data = request.json
    mode = data.get("mode")
    if mode == "daily":
        title = get_daily_title()
        if not title:
            return jsonify({"error": "Page non trouvée"}), 404
        title_clean = title.replace("_", " ")
        # Récupérer l'image associée à la page du jour
        url_page = (
            "https://fr.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages"
            f"&piprop=original&titles={requests.utils.quote(title)}"
        )
        r2 = requests.get(url_page)
        image_url = None
        if r2.status_code == 200:
            data2 = r2.json()
            pages = data2.get("query", {}).get("pages", {})
            if pages:
                page_data = next(iter(pages.values()))
                image_url = page_data.get("original", {}).get("source") if "original" in page_data else None
        return jsonify({"title": title_clean, "image_url": image_url})
    elif mode == "random":
        title = data.get("title")
        title_clean = title.replace("_", " ")
        # Récupérer l'image associée à la page passée
        url_page = (
            "https://fr.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages"
            f"&piprop=original&titles={requests.utils.quote(title)}"
        )
        r2 = requests.get(url_page)
        image_url = None
        if r2.status_code == 200:
            data2 = r2.json()
            pages = data2.get("query", {}).get("pages", {})
            if pages:
                page_data = next(iter(pages.values()))
                image_url = page_data.get("original", {}).get("source") if "original" in page_data else None
        return jsonify({"title": title_clean, "image_url": image_url})
    return jsonify({"error": "Mode inconnu"}), 400

@app.route("/api/reveal_text", methods=["POST"])
def reveal_text():
    data = request.json
    mode = data.get("mode")
    if mode == "daily":
        title = get_daily_title()
        if not title:
            return jsonify({"error": "Page non trouvée"}), 404
    else:
        title = data.get("title")
    # On récupère le texte de la page
    url_page = (
        "https://fr.wikipedia.org/w/api.php?action=query&format=json&prop=extracts"
        f"&exintro=true&explaintext=true&titles={requests.utils.quote(title)}"
    )
    r2 = requests.get(url_page)
    if r2.status_code != 200:
        return jsonify({"error": "Page non trouvée"}), 404
    data2 = r2.json()
    pages = data2.get("query", {}).get("pages", {})
    if not pages:
        return jsonify({"error": "Page non trouvée"}), 404
    page_data = next(iter(pages.values()))
    extract = page_data.get("extract", "")
    if extract:
        return jsonify({"extract": extract})
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
        title = get_daily_title()
        if not title:
            return jsonify({"error": "Page non trouvée"}), 404
    else:
        title = data.get("title")
    # On récupère le texte de la page
    url_page = (
        "https://fr.wikipedia.org/w/api.php?action=query&format=json&prop=extracts"
        f"&exintro=true&explaintext=true&titles={requests.utils.quote(title)}"
    )
    r2 = requests.get(url_page)
    if r2.status_code != 200:
        return jsonify({"error": "Page non trouvée"}), 404
    data2 = r2.json()
    pages = data2.get("query", {}).get("pages", {})
    if not pages:
        return jsonify({"error": "Page non trouvée"}), 404
    page_data = next(iter(pages.values()))
    extract = page_data.get("extract", "")
    if not extract:
        return jsonify({"error": "Page non trouvée"}), 404
    tokens = tokenize(extract)
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
        title = get_daily_title()
        if not title:
            return jsonify({"ok": False})
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
    print(f"Guesses : {guesses_set}")
    print(f"Title : {title_words}")
    if title_words.issubset(guesses_set):
        return jsonify({"ok": True})
    return jsonify({"ok": False})

if __name__ == "__main__":
    app.run(debug=True)
