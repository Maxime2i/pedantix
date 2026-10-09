# Pédantix — frontend

Interface Vite + React + TypeScript, thème « magazine chaleureux ». Consomme `mobile/backend` avec le protocole de l’original ; le client ne connaît que la longueur des mots cachés.

Fonctionnalités (alignées sur l’app mobile `app/`) :

- mots trouvés en clair, mots proches écrits dans leur boîte en gris (`255·log10(score − 30)/2`), dernier essai surligné (vert / orange) ;
- retour du dernier essai (« mot » · N mots révélés / proche (score) / absent), barre de progression du jour, liste des essais avec score (tri récents / meilleurs / A → Z, repliable, clic pour remettre un essai en évidence) ;
- clic sur une boîte : longueur du mot ; rappel des essais précédents (↑ / ↓ ou ⤺) ; saisie épinglable 📍 ;
- victoire : carte de résultat (vignette Wikipédia, coups, rang, % révélé), partage daté (natif sur mobile, copie sinon), « Afficher toute la page », « Révéler un mot en cliquant dessus », jeu possible après la victoire, confettis ;
- pages désignées par leur date ; « Trouvé par N » (rafraîchi toutes les 5 min), page d’hier, historique des 100 derniers jours avec statistiques (jouées, trouvées, moyenne) ;
- mode clair / sombre / auto ;
- passage automatique à la nouvelle page (midi, heure de Paris), sans recharger le site.

La partie est stockée dans `localStorage` (clés `p/…`).

```bash
npm install
cp .env.example .env
npm run dev        # http://localhost:5173
npm run build
```

`VITE_API_URL` : URL du backend (défaut `http://localhost:5000`).
