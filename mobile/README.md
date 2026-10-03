# Pédantix — backend

API Flask du clone de [Pédantix](https://pedantix.certitudes.org), alignée sur l’original (protocole, scores, lemmes, calendrier).

## Fonctionnement

1. **Page du jour** : nouvelle page à **midi, heure de Paris**. La numérotation est celle de l’original (nº1604 = 3 octobre 2026).
2. **Pool** : les « articles vitaux » de Wikipédia (niveau 4, ≈ 10 700 sujets), traduits vers leur titre français (`fetch_articles.py`). 91 des 100 dernières pages de l’original y figurent.
3. **Texte** : l’introduction de l’article, mise en forme conservée (gras, italique, paragraphes, listes). Le titre forme les premières cases (ids `0..k-1`). Mots à trait d’union (`peut-être`) = une case ; élisions (`l'`) = une case + apostrophe visible.
4. **Proximité** : modèle word2vec **frWac** de Jean-Philippe Fauconnier (`frWac_non_lem_no_postag_no_phrase_200_cbow_cut100`), le même que l’original (scores identiques au centième). Score = cos × 100, renvoyé à partir de **35**. Les nombres, absents du modèle, sont rapprochés par écart relatif : `100 × (1 − |proposé − caché| / caché)` (mesuré sur l’original). Les cases du titre ne sont jamais grisées.
5. **Lemmes** (`lemmatize.py`) : une proposition révèle les formes dont elle est le lemme (`être` → est, été ; `grand` → grande, grands) ou le féminin singulier (`grande` → grandes). Une forme fléchie ne révèle qu’elle-même (`est` ↛ sont). Accents obligatoires. Mots pleins : Lexique 3.83 ; mots grammaticaux : table calée sur l’original (`le` → la, l', les ; `de` → d', du, des ; `à` → au ; `il` → elle…).
6. **Classement** : nombre de joueurs ayant trouvé, en SQLite (`data/pedantix.db`).

## Installation

```bash
cd mobile/backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
bash prepare_data.sh          # modèle frWac (126 Mo) + Lexique 3.83 → data/
.venv/bin/python app.py       # http://localhost:5000
```

Sans `prepare_data.sh`, le serveur démarre quand même : pas de proximité, et seuls les mots grammaticaux sont regroupés.

`python fetch_articles.py` régénère le pool (`data/articles.json`, versionné).

Variables : `PEDANTIX_DATA_DIR` (données et base), `PEDANTIX_ARTICLES` (pool), `PORT`.

## Docker

```bash
docker build -t pedantix-backend mobile/backend
docker run -p 5000:5000 -v pedantix-data:/app/data pedantix-backend
```

Au premier démarrage, `entrypoint.sh` prépare les données dans le volume, puis lance gunicorn.

## Routes (protocole de l’original)

| Méthode | Route | Réponse |
|---|---|---|
| `GET` | `/puzzle` | `{num, change, k, count, title, article, yesterday, v}` : arbre de la page, mots remplacés par `{w: id, n: longueur}` |
| `POST` | `/score?n=` | `{num, word, answer}` → `{w, x, v}` avec `x` = `{"Mot": [ids], "#61.51": [ids]}` ; `d` = `[url, titre]` si `answer` complète le titre ; `e` si mot inconnu ; `r` si le jour a changé |
| `POST` | `/page` | `{answer: titre}` → `{id: mot}` pour toute la page |
| `GET` | `/stats?n=` | `{v}` (nombre de joueurs ayant trouvé) ou `{r: true}` |
| `GET` | `/history` | `[[nº, joueurs, [url, titre]], …]` sur 100 jours, titre du jour masqué |
| `GET` | `/health` | état du serveur |

## Licences des données

- frWac word2vec : Jean-Philippe Fauconnier, CC BY 3.0.
- Lexique 3.83 : New, Pallier et al., CC BY-SA 4.0.
- Textes : Wikipédia, CC BY-SA 4.0.
