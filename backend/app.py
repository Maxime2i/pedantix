from flask import Flask, jsonify, request
import requests
import random
from flask_cors import CORS
import re

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
    page = get_wikipedia_page(title)
    if page:
        tokens = tokenize(page["extract"])
        return jsonify({
            "extract_tokens": tokens,
            "title": page["title"]
        })
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
    tokens = data.get("extract_tokens", [])
    revealed = set(data.get("revealed", []))
    synonym_guesses = data.get("synonym_guesses", {})  # dict: index -> mot proposé
    word = data.get("word", "").lower()
    synonyms = get_synonyms(word)
    exact_indices = [i for i, t in enumerate(tokens) if t.lower() == word]
    synonym_indices = [i for i, t in enumerate(tokens) if t.lower() in synonyms and t.lower() != word]
    # On ajoute le mot proposé à la liste des révélés
    revealed.add(word)
    # On met à jour les synonymes proposés
    for i in synonym_indices:
        synonym_guesses[str(i)] = word  # On stocke le mot proposé pour cet index
    # Construction de l'affichage :
    display = []
    for i, t in enumerate(tokens):
        if t.lower() in revealed:
            display.append(t)
        elif str(i) in synonym_guesses:
            display.append(f"[{synonym_guesses[str(i)]}]")  # On affiche le mot proposé entre crochets
        elif not t.isalpha():
            display.append(t)
        else:
            display.append("█"*len(t))
    return jsonify({
        "display": display,
        "revealed": list(revealed),
        "synonym_guesses": synonym_guesses,
        "synonym_indices": synonym_indices,
        "exact_indices": exact_indices
    })

if __name__ == "__main__":
    app.run(debug=True)
