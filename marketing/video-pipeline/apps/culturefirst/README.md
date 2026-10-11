# Bibliothèque cultureFirst

Page d'animation : `apps/culturefirst/index.html?projet=<dossier>` (moteur générique : `pipeline/scene.js`). Charte : `config/charte-culturefirst.json` (prune / or, Fraunces + DM Sans, voix Gemini « Aoede »). Écrans repris de `cultureFirst/store-screenshots/index.html` et du code de l'app (textes exacts). Données de démo par défaut : `demo.js`.

Pour une vidéo, écrire seulement `projets/culturefirst-<nn>-<slug>/script.json` avec `"app": "culturefirst"`.

**Aperçu gratuit avant la voix** : `node pipeline/timings-factices.mjs --projet <dossier>` (≈ 2,5 mots/s), puis `node pipeline/serveur.mjs` et `/apps/culturefirst/index.html?projet=<dossier>&play`. L'étape `timings` remplace ensuite ces timings factices. Banc d'essai de toutes les actions : `projets/culturefirst-00-banc`.

## Écrans (`ecran` → `nom`)

| Nom | Contenu | Ids utiles (zoom / appui) |
|---|---|---|
| `etude` | carte (recto / réponse), boutons de réponse, fin de séance, bandeau hors connexion (`ecrans.etude.horsConnexion`) | `offline`, `face`, `hint`, `answer`, `show`, `r-encore`…`r-facile` ; fin : `e-badge`, `e-retour`, `e-plus` |
| `accueil` | date, série 🔥, Nouvelles / En cours / À revoir, Étudier, Mes thèmes | `a-serie`, `a-carte`, `a-compteurs`, `a-etudier`, `a-plus`, `a-theme-0`…, `a-tab-parcourir` |
| `catalogue` | Parcourir : recherche, 8 thèmes ou résultats | `c-recherche`, `c-theme-0`…7, `c-res-0`… |
| `deck` | page d'un pack, « Ajouter à ma collection » | `d-ajouter`, `d-compteurs`, `d-retirer` |
| `stats` | série + 7 jours, 4 tuiles, activité 6 mois, par thème (sous l'écran : `defiler`) | `s-serie`, `s-tuiles`, `s-tuile-0`…3, `s-activite`, `s-themes`, `s-theme-0`… |
| `onboarding` | 4 étapes : bienvenue, thèmes, rythme, rappel | `o-theme-<i>`, `o-rythme-5/10/20/30`, `o-oui`, `o-non`, `o-suivant` |
| `springboard` | écran d'accueil iOS + widgets Cartes du jour, Série, Résumé du jour | `w-cartes`, `w-serie`, `w-resume`, `w-app` |
| `profil` | compte (invité), réglages d'étude, algorithme personnalisé, rappels | `p-compte`, `p-nouvelles`, `p-retention`, `p-etapes`, `p-algo`, `p-rappel`, `p-alerte` |
| `verrouillage` | écran verrouillé (heure, date) pour une notification | — |

Écran au départ : `"ecranInitial"` (défaut `etude`). `ecran` accepte `donnees` pour surcharger les données de démo de cet écran (ex. `{ "serie": 1, "compteurs": [10, 0, 0] }` pour un « jour 1 »). Surcharge globale : `"ecrans": { "accueil": { … } }` dans le script.

## Actions

| Action | Paramètres | Effet | Son auto |
|---|---|---|---|
| `entree` | — | le téléphone monte à l'écran | — |
| `zoom` | `cible` : `aucun`, `entier` (téléphone entier), `carte`, `boutons`, ou un id d'écran ; `echelle` (1,3), `hauteur` (900) | caméra (0,6 s) ; revient à `aucun` à chaque `ecran` | — |
| `ecran` | `nom`, `donnees` | change d'écran (glissement) | whoosh |
| `appui` | `cible` (id) | doigt + enfoncement | clic |
| `defiler` | `y` (points d'écran, ex. 420), `depart` | fait défiler l'écran courant (0,7 s) ; remis à zéro au changement d'écran | — |
| `carte` | `index` (dans `cartes[]`) | carte suivante, côté question | flip |
| `reveler` / `recto` | — | réponse affichée / retour au recto | clic + flip |
| `noter` | `bouton` : `encore`, `difficile`, `correct`, `facile` | appui, bouton surligné | clic + pop |
| `finSeance` | `donnees` : `cartes`, `minutes`, `serie`, `palier` (3, 7, 14, 30, 50, 100…) ou `prochain` | « Terminé pour aujourd’hui ! » + badge série | victoire si palier, sinon carillon |
| `saisir` | `texte`, `fin` | frappe dans la recherche du catalogue (résultats : `ecrans.catalogue.resultats`) | clics |
| `effacer` | — | vide la recherche | — |
| `ajouter` | — | « Ajouter à ma collection » sur `deck` | clic + carillon |
| `etape` / `choisir` | `n` (0–3) / `valeur` (thème, 5–30, true / false) | onboarding | whoosh / clic |
| `feuille` / `fermer` | `nom: "reviserPlus"` | feuille « Réviser plus aujourd’hui » (erreurs du jour, en avance) | whoosh |
| `notif` | `titre`, `texte` (textes réels : `src/lib/reminderText.ts`) | bannière iOS, 4 s ou jusqu'à `fin` | notif |
| `bulle` | `texte` | bulle blanche (réponse spontanée) | pop |
| `rate` / `juste` | — | bulle barrée en rouge / validée en vert | erreur / carillon |
| `courbe` | `mode` : `oubli` (avec `fin`) ou `revisions` | carte « Ta mémoire » | chute / whoosh |
| `revision` | `label` (« 10 min »…), 3 maximum | rebond + pastille dorée | carillon |
| `ancrage` | `fin` | dernier segment plat + « Retenu ✓ » | bip |
| `titre` | `texte`, `sous`, `numero` | grande carte crème (listes, séries, idées reçues) | whoosh |
| `tampon` | `texte` (VRAI, FAUX…), `couleur` : `rouge`, `vert`, `or` | tampon incliné, 4 s | tampon |
| `chrono` | `secondes` | compte à rebours en haut (dure vraiment `secondes`) | bip par seconde |
| `chiffre` | `valeur`, `prefixe`, `suffixe`, `sous`, `depart`, `montee` | grand nombre qui monte | défilement |
| `chat` | `contact`, `avatar` (emoji) | **Format messagerie** : conversation plein écran (sans téléphone), jusqu'à `masquer`, `fin`, `ecran`, `entree` ou `versus` | whoosh |
| `message` | `de` : `lui` ou `moi`, `texte`, `ecrit` (false = sans « … »), `nom` (groupe), `vocal` (durée, ex. « 0:07 ») | bulle (grise à gauche / bleue à droite) ; « … » 0,9 s avant chaque message de `lui` | bip / pop |
| `messageCarte` | `index` (dans `cartes[]`), `de` | la carte de l'app (question + réponse) envoyée comme preuve | pop + carillon |
| `reaction` | `emoji` | réaction sur le dernier message | pop |
| `versus` | `question`, `gauche` / `droite` : `{ emoji, titre, sous, info }` | **Format face-à-face** : deux camps plein écran (bleu / orange), « VS » qui tremble | whoosh |
| `verdict` | `cote` : `gauche`, `droite` ou `egalite` | le gagnant reçoit ✓, l'autre s'éteint ; `info` remplace `sous` des deux côtés | carillon |
| `typo` | `texte` (`*mot*` en or), `sous`, `taille` | **Format typographie** : texte géant plein écran, mot à mot | whoosh |
| `barrer` / `corriger` | — / `texte` | barre rouge sur le texte / version corrigée en vert qui tombe | erreur / carillon |
| `monde` | `titre`, `vue` : `{ pays: [noms anglais Natural Earth], entier, marge, decalage }` ou `{ centre: [lon, lat], largeur: degrés }` | **Format carte du monde** (Mercator, `geo/countries-110m.json`) | whoosh |
| `vue` | `vue` | déplace la carte (0,9 s) | whoosh |
| `silhouette` | `pays` | seul ce pays, en or, centré (devine le pays) | whoosh |
| `devoiler` | `nom`, `vue` | carte : les autres pays réapparaissent, nom en grand ; photo : nom en grand | carillon |
| `surligner` | `pays` (liste), `couleur` : `or`, `rouge`, `vert`, `bleu` | colore des pays | pop |
| `epingle` | `lieu` : `[lon, lat]`, `label`, `couleur` | épingle + étiquette | pop |
| `frise` | `titre`, `min`, `max` (années, négatif = av. J.-C.) | **Format frise** verticale | whoosh |
| `jalon` | `annee`, `texte`, `emoji`, `etiquette` | événement placé à son année (écart mini garanti) | pop |
| `ecart` | `de`, `a` (années), `texte` | bande dorée entre deux années + étiquette | bip |
| `mur` | `vitesse` (px/s) ; contenu : `script.mur` ou `MUR_DEFAUT` (demo.js) | **Format mur de cartes** qui défilent | whoosh |
| `piocher` / `retourner` | `index` (dans `cartes[]`) / — | le mur ralentit, une carte arrive au centre / elle se retourne (réponse) | whoosh + pop / flip |
| `photo` | `image` (fichier de `images/`, ex. `scene-02.png`, étape 4), `legende`, `foyer` | **Format photo** plein écran, lent zoom | whoosh |
| `rafale` | `titre`, `total`, `accroche` | **Format rafale** : score, barre de progression | whoosh |
| `question` / `bonne` | `texte` | question (coupe franche, flash) / bonne réponse, score + 1 | bip / carillon |
| `masquer` | — | retire courbe, titre, chiffre, tampon, notif, messagerie, face-à-face | — |
| `fin` | — | carte de fin (`fin.promesse`, `fin.detail`, `fin.cta`) | — |

Chaque action accepte `fin` (mot de fin) ou `duree` ; `titre`, `chiffre`, `tampon`, `notif` et `feuille` s'arrêtent alors à cet instant. Ancrage : `ancre` = mot de la scène, forme écrite avec l'apostrophe (`l'oublies`, `l'ajoute`) ; `position: "fin"` pour la fin du mot.

## Contenu de démo

```json
"cartes": [
  { "paquet": "États d'Océanie", "couleur": "#4DB6A8", "compteurs": [12, 8, 34],
    "question": "Quelle est la capitale de ce pays ?", "indiceType": "Pays", "indice": "Australie",
    "reponse": "Canberra", "fiche": [["Continent", "Océanie"], ["Langue", "Anglais"]],
    "intervalles": { "encore": "1 min", "difficile": "6 min", "correct": "10 min", "facile": "4 j" } }
],
"fin": { "promesse": "Retiens enfin<br>ta culture G", "detail": "+ de 200 000 questions", "cta": "Gratuit · iPhone et Android" }
```

`couleur` peut être remplacé par `theme` (couleur du thème dans l'app). `carte` (objet unique) reste accepté.

## Règles de cohérence

- Intervalles au format de l'app (« 10 min », « 4 j », « 1 mois ») ; un intervalle dit = celui affiché.
- Chiffres réels uniquement : 200 000 questions, 6 800 packs, 8 thèmes (fiche store). Les compteurs, séries et stats sont des données de démo plausibles, jamais présentées comme des résultats d'utilisateurs.
- Faits de culture G vérifiés avant d'écrire le script (une erreur dans une vidéo de culture G coûte cher en crédibilité).
- Pas de nom de concurrent.

Exemples : `projets/culturefirst-01-oubli/script.json` (vidéo publiée), `projets/culturefirst-00-banc/script.json` (toutes les actions).
