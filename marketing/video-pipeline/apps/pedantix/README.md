# Bibliothèque Pédantix

Page d'animation : `apps/pedantix/index.html?projet=<dossier>` (moteur générique : `pipeline/scene.js`, partie de démo : `pipeline/moteur.js`). Charte : `config/charte-pedantix.json` (ocre / terracotta, Fraunces + DM Sans, voix Gemini « Puck »). Écrans repris du code de l'app (`app/src`), textes exacts. Données de démo par défaut : `demo.js`.

Pour une vidéo, écrire seulement `projets/pedantix-<nn>-<slug>/script.json` avec `"app": "pedantix"`.

**Aperçu gratuit avant la voix** : `node pipeline/timings-factices.mjs --projet <dossier>`, puis `node pipeline/instants.mjs --projet <dossier> --t 1,4,9` (planche d'instants dans `output/instants.jpg`) ou `node pipeline/serveur.mjs` et `/apps/pedantix/index.html?projet=<dossier>&play`. Banc d'essai de toutes les actions : `projets/pedantix-00-banc`.

## Règles de la campagne

- App **iPhone uniquement** : appel à l'action « Pédantix, gratuit sur l'App Store ». Ne jamais parler d'Android ni afficher de compte réseau.
- La voix est celle de **Maxime, le développeur**, à la première personne (l'avatar). Ses anecdotes, scores et parties peuvent être inventés ; jamais de chiffres de joueurs ou de téléchargements, ni de faux avis.
- Chiffres réels utilisables : environ 10 000 sujets, une page par jour à midi (heure de Paris), gratuit, sans pub, sans compte.
- **Jamais la page du jour** : seulement des pages passées (`pages-passees.json`, rafraîchir avec `node apps/pedantix/outils/pages-passees.mjs`).
- Faits tirés des pages vérifiés sur l'article Wikipédia.

## Avatar

Poses (`avatar/<nom>.png`, copie de `~/.claude/avatars/maxime/poses`) : `neutre`, `parle`, `salut`, `content`, `choque`, `reflechit`, `panique`, `fier`, `montre-droite`, `montre-gauche`, `telephone`, `clin`, `decu`, `celebre`, `tete-main`.

- Il respire, se balance et rebondit légèrement sur chaque mot ; un changement de pose fait un petit « pop ».
- **Synchro labiale seulement sur `neutre`** (calque bouche ouverte) : revenir à `neutre` pour les longues phrases, réserver les autres poses aux réactions (2–4 mots).
- `montre-droite` pointe vers le téléphone en disposition `duo`.
- Pose de départ : `"poseInitiale"` (défaut `neutre`). Carte de fin : l'avatar salue (`fin.pose`, défaut `salut`).

## Dispositions (`disposition`, transition 0,6 s)

| Mode | Téléphone | Avatar | Usage |
|---|---|---|---|
| `avatar` | caché | grand, centré en bas | face caméra, cartes, bulles, listes |
| `duo` | réduit à droite | moyen à gauche | présenter l'app, montrer l'écran |
| `coin` | plein | petit, en bas à gauche | partie commentée |
| `telephone` | plein | caché | démo pure, zooms |

Départ : `"dispositionInitiale"` (défaut `telephone` si le script a une `page`, sinon `avatar`). Sous-titres décalés à droite en `coin`.

## Écrans (`ecran` → `nom`)

| Nom | Contenu | Ids utiles (zoom / appui) |
|---|---|---|
| `jeu` | page masquée, saisie, retour du dernier essai, progression, badge d'essais | `ptitle`, `article`, `saisie`, `feedback`, `progression`, `h-essais`, `h-historique`, `h-reglages` |
| `historique` | stats (Jouées, Trouvées, Coups en moy.), 100 derniers jours | `hist-0`… |
| `reglages` | Mode Auto / Clair / Sombre, Rappel quotidien, Aide | `reg-auto`, `reg-clair`, `reg-sombre`, `reg-rappel` |
| `verrouillage` | écran verrouillé à 12:00 (pour la notification de midi) | — |

Écran au départ : `"ecranInitial"` (défaut `jeu`). Données : `"ecrans": { "historique": { "stats": {…}, "lignes": [{ "titre", "date", "coups" | "statut": "non trouvée" / "en cours" }] } }`, `"verrouillage": { "heure", "date" }` (date de la page par défaut), `"jeu": { "heure" }`. `"sombre": true` démarre l'app en mode sombre.

## Actions

| Action | Paramètres | Effet | Son auto |
|---|---|---|---|
| `disposition` | `mode` : `avatar`, `duo`, `coin`, `telephone` | place téléphone et avatar | whoosh |
| `pose` | `nom` (voir Avatar) | change la pose de l'avatar | pop léger |
| `bulle` | `texte`, `style` (`parole` défaut, `pensee`) | bulle au-dessus de la tête, 2,5 s ou jusqu'à `fin` | pop |
| `entree` | — | le téléphone monte à l'écran (sinon il est là dès le début) | — |
| `zoom` | `cible` : `aucun`, `titre`, `article`, `saisie`, `resultat`, ou un id ; `echelle`, `hauteur` | caméra (0,6 s) ; revient à `aucun` sur `resultat` et `disposition` | — |
| `ecran` | `nom`, `donnees` | change d'écran (glissement) | whoosh |
| `taper` | `mot`, `fin` ou `duree` | frappe dans la saisie | clics |
| `envoyer` | `mot` | envoie : trouvé (vert), proche (gris/orange dans les cases) ou absent | pop + carillon / bip / erreur / victoire |
| `accelere` | `fin`, `essais` | dévoile `page.accelere` en accéléré, compteur qui défile, pastille « ACCÉLÉRÉ » | défilement |
| `case` | `mot`, `dans` (`titre` / `article`) | touche une case cachée : sa longueur s'affiche en bleu 1,8 s | clic |
| `devoiler` | — | tout le titre se dévoile (victoire sans taper le dernier mot) | victoire |
| `voirPage` | — | toute la page s'affiche | whoosh |
| `resultat` | `coups`, `rang`, `pct` (défaut : valeurs de la partie) | feuille « Bravo ! La page du … était » ; jusqu'à `ecran`, `fermer`, `masquer` ou `fin` | whoosh |
| `fermer` | — | ferme la feuille de résultat | — |
| `defiler` | `y` (points), `depart` | fait défiler la page de jeu | — |
| `appui` | `cible` (id) | rond d'appui | clic |
| `reglage` | `mode` (`Auto`, `Clair`, `Sombre`), `rappel` (true / false) | règle l'app ; `Sombre` passe toute l'app en mode sombre | clic |
| `notif` | `titre`, `texte` (défaut : textes réels de `app/src/notifications.ts`) | notification sur l'écran verrouillé, 4 s ou jusqu'à `fin` | notif |
| `titre` | `texte`, `sous`, `numero` | grande carte crème (séries, niveaux, questions) | whoosh |
| `liste` / `point` | `titre` / `texte` | carte liste ; chaque `point` ajoute une ligne numérotée | whoosh / pop |
| `chiffre` | `valeur`, `prefixe`, `suffixe`, `sous`, `depart`, `montee` | grand nombre qui monte | défilement |
| `partage` | `coups`, `carres` | message de partage de l'app (« J'ai trouvé le #pedantix du … en N coups ! ») | pop |
| `tampon` | `texte` (VRAI, FAUX…), `couleur` : `rouge`, `vert`, `or` | tampon incliné, 3 s | tampon |
| `chrono` | `secondes` | compte à rebours en haut (dure vraiment `secondes`) | bip par seconde, carillon |
| `masquer` | — | retire titre, liste, chiffre, tampon, bulle, partage, notif | — |
| `fin` | — | carte de fin (`fin.promesse`, `fin.detail`, `fin.cta`, `fin.pose`) | — |

Chaque action accepte `fin` (mot de fin) ou `duree`. Ancrage : `ancre` = mot de la scène (forme écrite : `l'App`, `c'est`) ; `position: "fin"` pour la fin du mot.

**Décor** : une scène avec `"image": "<description>"` reçoit une image générée (étape `images`) en fond plein écran pendant la scène (POV : bureau, repas de famille…). Style commun : `"styleImages": "illustration 3D douce style Pixar, couleurs chaudes ocre et terracotta, sans personnage au premier plan"`.

## Contenu de démo : la page

```json
"page": {
  "titre": "Échidné", "date": "Lundi 29 septembre",
  "texte": ["Les échidnés sont des mammifères…"],
  "titreMots": ["échidné"],
  "revelations": { "mammifère": ["mammifères"], "tigre": [] },
  "proches": { "hérisson": { "cibles": ["échidné", "échidnés"], "score": 62 } },
  "dejaTrouves": ["les", "des", "à"],
  "accelere": ["ordre", "pondent"],
  "rang": 3
}
```

- Pages en cache : `apps/pedantix/pages/<slug>.json` (ajouter : `node apps/pedantix/outils/pages-lot.mjs "Titre 1" "Titre 2" …`, une requête pour 20 titres ; ~95 mots remplissent l'écran). Dans le script, écrire `"page": { "source": "<slug>", … }` puis `node apps/pedantix/outils/remplir.mjs --projet <dossier>` ajoute `titre`, `texte`, `titreMots` (ce qui est déjà écrit est gardé).
- Les petits mots (le, de, est, à, en…) sont déjà révélés au départ, comme après quelques essais ; `"motsOutils": false` pour partir d'une page entièrement masquée.
- `revelations[mot]` : formes du texte révélées par ce mot (minuscules) ; `[]` = absent de la page (son d'erreur, « absent de la page »). Sans entrée, le mot se révèle lui-même.
- `proches[mot]` : cases où le mot s'inscrit en gris (plus clair = plus proche ; orange au moment de l'envoi) ; `score` de 31 à 100 (≥ 60 : très proche).
- `dejaTrouves` : mots déjà révélés au début ; `accelere` : mots révélés pendant `accelere`.

## Règles de cohérence

- Nombre de coups dit = affiché (`resultat.coups`, `partage.coups`, badge = essais réels de la démo + `accelere.essais`).
- Le rang (`rang`) est celui de la partie de l'avatar, jamais présenté comme une statistique de joueurs.
- Le message de retour correspond à la page : un mot « trouvé » doit apparaître dans `texte`.
