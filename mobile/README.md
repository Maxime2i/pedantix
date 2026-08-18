# Pédantix Mobile

Clone mobile du jeu [Pédantix](https://pedantix.certitudes.org) : chaque jour, un article Wikipédia français est tiré au sort. L'introduction est affichée avec les mots significatifs masqués. Le joueur propose des mots ; les mots sémantiquement proches sont révélés, les autres reçoivent un score chaud/froid. L'objectif final est de deviner le titre de l'article.

## Principe du jeu

1. **Article du jour** — déterminé par la date UTC (numéro de puzzle = jours depuis le 1ᵉʳ janvier 2026).
2. **Intro masquée** — les mots courants (stopwords) restent visibles ; les autres apparaissent comme des blancs.
3. **Propositions** — chaque mot est comparé aux mots masqués via des embeddings word2vec français. Les mots très proches (> 0,80) se révèlent ; un score de 0 à 1 indique la proximité sémantique.
4. **Titre** — une fois l'intro suffisamment dévoilée, le joueur peut tenter de deviner le titre de l'article.

## Architecture

```
mobile/
├── README.md
├── .gitignore
├── web-test/
│   └── index.html          # Interface de test (HTML/CSS/JS inline)
└── backend/
    ├── app.py              # Serveur Flask (API + page de test)
    ├── fetch_articles.py   # Télécharge la liste d'articles Wikipédia
    ├── stopwords.py        # Mots visibles par défaut
    ├── reduce_embeddings.py
    ├── download_embeddings.sh
    ├── requirements.txt
    ├── data/
    │   ├── articles.json       # Liste de titres (généré)
    │   └── frWiki_reduced.vec  # Embeddings réduits (généré)
    └── .venv/                  # Environnement Python 3.11
```

## Embeddings

Les vecteurs proviennent du modèle **fastText wiki FR** :

- **URL** : https://dl.fbaipublicfiles.com/fasttext/vectors-wiki/wiki.fr.vec
- **Licence** : [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/)
- **Réduction** : le script `reduce_embeddings.py` conserve les 300 000 mots les plus fréquents (format texte word2vec, 300 dimensions) et produit `data/frWiki_reduced.vec`.

Le fichier `.vec` complet (~2,8 Go) n'est jamais stocké entièrement : le téléchargement est streamé et réduit à la volée par `download_embeddings.sh`.

## Installation

Depuis `mobile/backend/` :

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
bash download_embeddings.sh
.venv/bin/python fetch_articles.py
```

## Lancement

```bash
.venv/bin/python app.py
```

Le serveur écoute sur `http://0.0.0.0:5000`. Ouvrir `http://localhost:5000/` pour l'interface de test.

## Routes API

| Méthode | Route    | Description |
|---------|----------|-------------|
| `GET`   | `/health` | Santé du serveur → `{"ok": true}` |
| `GET`   | `/puzzle` | Puzzle du jour (num, title, tokens, words, revealed vide) |
| `POST`  | `/score`  | Évalue un mot → score, cosine, revealed, message |
| `POST`  | `/page`   | Vérifie le titre → `{"correct": bool, "title": ...}` |
| `GET`   | `/`       | Page web-test (`index.html`) |

### Seuils sémantiques

| Seuil | Valeur | Effet |
|-------|--------|-------|
| `EXACT_THRESHOLD`  | **0,85** | Le mot est considéré comme « trouvé » (exact ou quasi-exact) |
| `REVEAL_THRESHOLD` | **0,80** | Les mots proches sont révélés dans l'intro |

Le score affiché est `(cosine + 1) / 2`, arrondi à 4 décimales (0 = très froid, 1 = identique).

### Exemples curl

```bash
# Santé
curl -s http://localhost:5000/health

# Puzzle du jour
curl -s http://localhost:5000/puzzle | python3 -m json.tool

# Proposer un mot
curl -s -X POST http://localhost:5000/score \
  -H 'Content-Type: application/json' \
  -d '{"word": "paris"}' | python3 -m json.tool

# Deviner le titre
curl -s -X POST http://localhost:5000/page \
  -H 'Content-Type: application/json' \
  -d '{"answer": "France"}' | python3 -m json.tool
```

## Dépendances

Python 3.11, stdlib + :

- `flask`
- `flask-cors`
- `numpy`
- `requests`

Le script `fetch_articles.py` n'utilise que la stdlib (`urllib`).
