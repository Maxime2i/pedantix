# Pédantix — app mobile

App iOS / Android (Expo + React Native) du clone de Pédantix. Même mécanique que le site (`frontend/`), même API de production.

## Lancer en développement

```bash
cd app
npm install
npx expo start          # puis « i » (simulateur iOS) ou « a » (Android), ou scanner le QR code avec Expo Go
```

L'API utilisée est celle du site. Pour pointer ailleurs (backend local par exemple), créer `app/.env.local` :

```
EXPO_PUBLIC_API_URL=http://192.168.1.x:5001
```

(une IP du réseau local, pas `localhost` : le téléphone ne voit pas le Mac sous ce nom).

## Structure

| Fichier | Rôle |
|---|---|
| `src/app/` | Écrans (Expo Router) : `index` (jeu), `history`, `settings`, et les feuilles `rules`, `faq`, `guesses`, `result` |
| `src/GameContext.tsx` | État de la partie partagé entre les écrans (équivalent de `frontend/src/App.tsx`) |
| `src/api.ts` | Client de l'API (copie de `frontend/src/api.ts`) |
| `src/game.ts` | Règles, dates des pages et sauvegarde (AsyncStorage au lieu de localStorage) |
| `src/Article.tsx` | Rendu de la page : boîtes noires en ligne dans le texte |
| `src/components/` | Interface commune (sections, segments, retour du dernier essai, icônes système) |
| `src/theme.ts` | Palette chaleureuse du site, clair et sombre |

Toute modification des règles côté site (`frontend/src/game.ts`, `api.ts`) est à reporter ici.

## Publier sur les stores

Builds dans le cloud avec EAS (compte Expo gratuit) :

```bash
npx eas-cli@latest login
npx eas-cli@latest build --platform all --profile production
npx eas-cli@latest submit --platform ios       # compte Apple Developer (99 $/an)
npx eas-cli@latest submit --platform android   # compte Google Play (25 $ une fois)
```

`--profile preview` produit un APK Android installable directement et une build iOS de test interne.

### Mises à jour sans passer par les stores (EAS Update)

Les changements de code JavaScript (écrans, textes, règles) peuvent être envoyés directement aux apps installées :

```bash
npx eas-cli@latest update --channel production --message "Correction du partage"
```

L'app télécharge la mise à jour au lancement et l'applique au lancement suivant. Les builds `preview` écoutent le canal `preview`, les builds `production` le canal `production`. Un changement natif (nouveau module, icône, `app.json`) demande en revanche une nouvelle build. La version de l'app (`version` dans `app.json`) sert de `runtimeVersion` : il faut l'augmenter à chaque nouvelle build publiée sur les stores.

Identifiant de l'app : `fr.pedantix.app` (dans `app.json`, à changer avant la première publication si besoin — il est définitif ensuite).

Note : avec Xcode 26.3, `npx expo run:ios` (build native locale) échoue dans `expo-modules-jsi` (bug Expo SDK 57). Expo Go et les builds EAS ne sont pas concernés.
