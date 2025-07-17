# Pedantix

Pedantix est une application web ludique inspirée du jeu "mot du jour" où l'utilisateur doit deviner un mot ou un titre d'article Wikipédia à partir d'indices textuels. Le projet est composé d’un backend Python (Flask) et d’un frontend React.

## Fonctionnalités principales

- Génération quotidienne d’un article mystère à deviner (mode "mot du jour")
- Masquage progressif du texte pour augmenter la difficulté
- Interface web moderne et interactive
- Statistiques chiffré sur chaque partie

---

## Structure du projet

```
pedantix/
│
├── backend/      # Serveur Flask (API, logique du jeu, accès Wikipédia)
│   ├── app.py
│   ├── requirements.txt
│   └── dico/
│
└── frontend/     # Application React (interface utilisateur)
    ├── src/
    ├── public/
    ├── package.json
    └── README.md
```

---

## Installation

### Prérequis

- Node.js (>= 14)
- Python 3.8+
- pip

### Backend (Flask)

1. Installe les dépendances Python :
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. Lance le serveur Flask :
   ```bash
   flask run
   ```
   Par défaut, l’API sera disponible sur `http://localhost:5000`.

### Frontend (React)

1. Installe les dépendances Node :
   ```bash
   cd frontend
   npm install
   ```

2. Démarre l’application React :
   ```bash
   npm start
   ```
   L’interface sera accessible sur `http://localhost:3000`.

---

## Dépendances principales

### Backend

- Flask
- flask-cors
- requests
- gunicorn (déploiement)
- gdown

Voir `backend/requirements.txt` pour la liste complète.

### Frontend

- React
- react-scripts
- TypeScript
- @testing-library/react

Voir `frontend/package.json` pour la liste complète.

---

## Scripts utiles

### Frontend

- `npm start` : Démarre le serveur de développement React
- `npm run build` : Génère la version de production

### Backend

- `flask run` : Démarre le serveur Flask

---

## Personnalisation

- Le backend utilise un champ lexical stocké dans `backend/dico/lexical_field.json`.
- Les titres d’articles sont récupérés via l’API Wikipédia.

