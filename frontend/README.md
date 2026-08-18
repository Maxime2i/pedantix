# Pédantix — frontend (site)

Interface web de Pédantix, refaite en **Vite + React + TypeScript**.
Le jeu consomme le backend Flask `mobile/backend` (routes `/puzzle`, `/score`,
`/page`, `/health`). Toute la logique de jeu (températures, lemmatisation,
seuils) vit côté backend : ce frontend affiche uniquement les réponses de
l'API, état de partie 100 % côté client (reload = partie vierge).

## Démarrage

```bash
npm install
npm run dev        # http://localhost:5173 (API attendue sur :5000)
npm run build      # tsc + vite build → dist/
```

## Configuration

- `VITE_API_URL` : URL du backend (défaut `http://localhost:5000`).
  Copier `.env.example` en `.env` pour la surcharger.

## Déploiement

Build statique (`dist/`) compatible Vercel. Le backend Flask est déployé
séparément (CORS ouvert).
