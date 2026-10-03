# Pédantix

Clone du jeu [Pédantix](https://pedantix.certitudes.org/) : chaque jour à midi, une page Wikipédia française est masquée. Le joueur propose des mots ; ceux présents dans le texte apparaissent en clair, les mots proches par le sens s’affichent en gris dans leur boîte. L’objectif est de retrouver **tous les mots du titre**.

Le comportement suit l’original : même modèle de proximité (frWac), mêmes scores, mêmes règles de lemmes, même numérotation des jours, même source d’articles. Seul l’habillage diffère.

Le backend n’envoie jamais le titre ni les mots cachés au client — seulement des longueurs et la ponctuation visible.

## Structure

```
pedantix/
├── mobile/backend/   # API Flask (puzzle du jour, scoring, embeddings)
├── frontend/         # Interface Vite + React + TypeScript
└── backend/          # Ancien prototype (obsolète, ne plus utiliser)
```

## Installation

### Backend

```bash
cd mobile/backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
bash prepare_data.sh         # modèle frWac + Lexique 3.83 (≈ 150 Mo)
.venv/bin/python app.py       # http://localhost:5000
```

Les données (articles, vecteurs, lexique, base SQLite) sont dans `mobile/backend/data/`, ou dans `$PEDANTIX_DATA_DIR` si défini. Détails : [mobile/README.md](mobile/README.md).

### Frontend

```bash
cd frontend
cp .env.example .env          # VITE_API_URL=http://localhost:5000
npm install
npm run dev                   # http://localhost:5173
```

## Règles (alignées sur l’original)

- Tous les mots (et nombres) sont masqués ; ponctuation et apostrophes restent visibles. Le titre forme les premières cases.
- Mot présent : affiché en clair. L’infinitif ou le masculin singulier révèle les formes conjuguées, féminines et plurielles ; accents obligatoires.
- Mot proche (score ≥ 35) : la proposition s’affiche dans la boîte, en gris d’autant plus clair qu’elle est proche. Les cases du titre ne sont jamais grisées.
- Clic sur une boîte : nombre de lettres.
- Victoire dès que tous les mots du titre sont trouvés : rang du jour, partage, page révélée en entier ou mot par mot.
- Nouvelle page à midi (heure de Paris) ; la partie du jour est sauvegardée dans le navigateur.

## Licence

MIT
