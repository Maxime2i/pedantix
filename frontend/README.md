# Pédantix — frontend

Interface Vite + React + TypeScript, thème « magazine chaleureux ». Consomme `mobile/backend` avec le protocole de l’original ; le client ne connaît que la longueur des mots cachés.

Fonctionnalités reprises de l’original :

- mots trouvés en clair, mots proches écrits dans leur boîte en gris (`255·log10(score − 30)/2`), dernier essai surligné (vert / orange) ;
- carrés de retour par essai, barre de progression du jour, tableau des essais (tri chronologique ou alphabétique, repliable) ;
- clic sur une boîte : longueur du mot ; rappel des essais précédents (↑ / ↓ ou ⤺) ; saisie épinglable 📍 ;
- victoire : rang, coups, résumé, partage, « Voir la page » (avec vignette Wikipédia), « Révéler les mots séparément », jeu possible après la victoire, confettis ;
- « Trouvé par N personnes » (rafraîchi toutes les 5 min), page d’hier, historique des 100 derniers jours ;
- thèmes coloré / gris × clair / sombre / système, mode daltonien, animations désactivables ;
- rechargement automatique quand la page du jour change (midi, heure de Paris).

La partie est stockée dans `localStorage` (clés `p/…`).

```bash
npm install
cp .env.example .env
npm run dev        # http://localhost:5173
npm run build
```

`VITE_API_URL` : URL du backend (défaut `http://localhost:5000`).
