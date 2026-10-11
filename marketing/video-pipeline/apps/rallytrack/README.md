# Bibliothèque RallyTrack

Page d'animation : `apps/rallytrack/index.html?projet=<dossier>` (moteur générique : `pipeline/scene.js`). Charte : `config/charte-rallytrack.json` (fond #0F1115, accent #FF6B00, Outfit + JetBrains Mono, voix Gemini « Puck », la même que Maxime sur Pédantix). Écrans repris du code de l'app (`rally-app/app` : `HomeScreen`, `RallyDetailScreen`, `ClassificationTable`, `StageListItem`, `RallySpecialClassificationSheet`, `PersonDetailScreen`, `DefineAlertsModal`), en thème clair (thème par défaut de l'app), avec les textes exacts. Données de démo par défaut : `demo.js`.

Pour une vidéo, écrire seulement `projets/rallytrack-<nn>-<slug>/script.json` avec `"app": "rallytrack"`.

**Aperçu gratuit avant la voix** : `node pipeline/timings-factices.mjs --projet <dossier>`, puis `node pipeline/instants.mjs --projet <dossier> --t 1,4,9`. Banc d'essai de toutes les actions : `projets/rallytrack-00-banc`.

## Règles de la campagne

- L'app est **gratuite**, publiée sur l'**App Store et Google Play** (confirmé par Maxime le 10/10/2026). Appel à l'action par défaut : « Gratuit · iPhone et Android ».
- La voix est celle de **Maxime, le développeur**, à la première personne. Jamais de chiffres d'utilisateurs ou de téléchargements, ni de faux avis.
- Chiffres réels utilisables : ceux de l'API au moment du tournage (par exemple le nombre de rallyes d'un jour donné, via `/races/home?day=AAAA-MM-JJ`). Noter la date et la source dans `objectif`.
- **Notifications** : uniquement les textes réels (`api/src/notifications/copy.ts`, `liveStagePoll.ts`) :
  - `{pilote} gagne ES5`, `{pilote} 2e de ES5`
  - `C’est parti : {rallye}` / « Le rallye est en direct. »
  - `Demain : {rallye}` / « Le rallye s’élance demain. Activez le live pour ne rien manquer. »
  - `Podium : {pilote} gagne` (corps : nom du rallye), `{pilote} gagne !`, `{pilote} termine {n}e`
  - `Résultats : {rallye}` / « Le classement final est disponible. »
  - `{rallye} annulé` / « Cette épreuve ne se déroulera pas comme prévu. »
  - **Il n'existe pas d'alerte « prend la tête »** : ne pas en montrer.
- **Données de démo** (`demo.js`) : épreuve et équipages **fictifs** (« Rallye des Hautes Combes »), au format exact de l'API (temps `1:00:03.4`, écarts `+2:27.9` / `+20.2`, distances `8,10 km`). Pour une vidéo sur une vraie épreuve, **vrais noms de pilotes autorisés** (validé par Maxime), avec les données de l'API **sans les retoucher** : jamais un vrai nom avec un faux résultat ou une fausse notification.
- Pas de nom de concurrent (FFSA Live, eWRC, Rallye Sphere…).

## Avatar

Poses (`avatar/<nom>.png`) : l'avatar de `~/.claude/avatars/maxime/poses`, avec l'écusson « P » remplacé par un écusson orange « R » de RallyTrack. Pour les régénérer après un ajout de pose : `python3 apps/rallytrack/outils/ecusson.py --controle planche.jpg`. L'outil ne modifie pas l'avatar d'origine et ne coûte rien.

Poses disponibles : `neutre`, `parle`, `salut`, `content`, `choque`, `reflechit`, `panique`, `fier`, `montre-droite`, `montre-gauche`, `telephone`, `clin`, `decu`, `celebre`, `tete-main`.

- La **synchro labiale ne fonctionne que sur `neutre`**. Revenir à `neutre` pour les longues phrases et garder les autres poses pour les réactions courtes.
- Pose de départ : `"poseInitiale"`. Carte de fin avec avatar qui salue : `"fin": { "pose": "salut" }` (sans `pose`, la carte de fin n'a pas d'avatar).

## Dispositions (`disposition`, transition de 0,6 s)

| Mode | Téléphone | Avatar | Usage |
|---|---|---|---|
| `avatar` | caché | grand, centré en bas | face caméra, bulles |
| `duo` | réduit à droite | moyen à gauche | présenter l'app |
| `coin` | plein | petit, en bas à gauche | démo commentée |
| `telephone` | plein | caché | démo pure, zooms |

Disposition de départ : `"dispositionInitiale"` (défaut `telephone`).

## Écrans (`ecran` → `nom`)

| Nom | Contenu | Ids utiles (zoom / appui) |
|---|---|---|
| `accueil` | « Rally Track », jours (Aujourd'hui…), pays en accordéon, rallyes avec heure de la 1re ES et point vert « en direct », barre d'onglets | `a-live`, `a-recherche`, `a-jour-<i>`, `a-pays-<i>`, id de chaque rallye (`r-0`…) |
| `rallye` | fiche : cloche, étoile, en-tête (nom, lieu, dates · championnat, logo), onglets `apercu` / `classement` / `speciales` / `engages` | `ra-cloche`, `ra-favori`, `ra-hero`, `ra-onglet-<nom>` ; aperçu : `ra-situation`, `ra-live`, `ra-alertes`, `ra-podium`, `ra-lieu`, `ra-championnat` ; classement : `cl-<n°>` ; spéciales : `es-<code>` ; engagés : `en-<n°>` |
| `pilote` | page pilote, onglet Aperçu : dernier résultat (Général / Classe), prochain départ, championnat, chiffres carrière, palmarès | `pi-hero`, `pi-cloche`, `pi-dernier`, `pi-general`, `pi-classe`, `pi-prochain`, `pi-championnat`, `pi-chiffres`, `pi-palmares` |
| `alertes` | « Définir les alertes » : interrupteur général, 9 types d'alertes cochables, « Terminer » | `al-master`, `al-<clé>`, `al-terminer` |
| `verrouillage` | écran verrouillé (date, heure) pour les notifications | — |

Écran de départ : `"ecranInitial"` (défaut `accueil`). `ecran` accepte `donnees` pour surcharger les données de cet écran (ex. `{ "onglet": "classement" }` pour ouvrir la fiche directement sur le classement). Surcharge globale : `"ecrans": { "rallye": { … } }`. Équipages : `"equipages": { "3": { "pilote": "…", "copilote": "…", "voiture": "…", "classe": "…" } }`.

Clés d'alertes (`choisir`) : `veille`, `depart`, `final`, `esVictoire`, `esPodium`, `victoire`, `podium`, `abandon`, `actus`.

## Actions

| Action | Paramètres | Effet | Son auto |
|---|---|---|---|
| `disposition` | `mode` : `avatar`, `duo`, `coin`, `telephone` | place le téléphone et l'avatar | whoosh |
| `pose` | `nom` (voir Avatar) | change la pose de l'avatar | pop léger |
| `bulle` | `texte`, `style` (`parole` par défaut, `pensee`) | bulle au-dessus de la tête, 2,5 s ou jusqu'à `fin` | pop |
| `entree` | — | le téléphone monte à l'écran (sinon il est là dès le début) | moteur |
| `zoom` | `cible` : `aucun`, `entier`, `haut`, `contenu`, ou un id ; `echelle` (1,3), `hauteur` (900) | caméra (0,6 s) ; revient à `aucun` sur `ecran`, `onglet` et `disposition` | — |
| `ecran` | `nom`, `donnees` | change d'écran (glissement) | whoosh |
| `onglet` | `nom` : `apercu`, `classement`, `speciales`, `engages` | appui sur l'onglet de la fiche rallye | clic |
| `appui` | `cible` (id) | doigt + enfoncement | clic |
| `defiler` | `y` (points d'écran) ou `cible` (id, avec `marge` 8), `depart` | fait défiler le contenu (0,7 s) depuis le défilement précédent ; remis à zéro au changement d'écran ou d'onglet | — |
| `cloche` / `favori` | `etat` (true / false, sinon bascule) | cloche ou étoile orange (fiche rallye ou page pilote) ; la cloche active aussi « Alertes de l’épreuve » | clic (+ carillon) |
| `maj` | `classement` : `[{ n, temps, ecart }]` | **classement en direct** : les lignes glissent vers leur nouvelle place (0,8 s), celle qui monte passe devant ; un équipage absent de la nouvelle liste (abandon) s'efface vers la gauche | défilement + bip |
| `surligner` | `n` (n° d'équipage), `fin` ou 3 s | contour orange pulsé autour de la ligne de cet équipage | pop |
| `feuille` / `fermer` | `nom: "speciale"`, `donnees` (`code`, `nom`, `classement`, `cumul`, `mode`) | feuille « classement d'une spéciale » (ES 5…) | whoosh |
| `editions` | `etat` (sinon bascule) | appui sur « Voir N éditions de plus » : la carte Éditions de l'aperçu se déplie | clic |
| `segment` | `mode` : `speciale` ou `cumul` | bascule la feuille entre « Classement · spéciale » et « Classement · cumul » | clic |
| `choisir` | `valeur` (clé d'alerte), `etat` | coche / décoche une alerte | clic + pop |
| `notif` | `titre`, `texte`, `quand` (« maintenant »), `duree` (4 s) | bannière iOS ; trois au plus empilées sur `verrouillage` | notif |
| `titre` | `texte` (`*mot*` en orange), `sous`, `numero` | carte sombre à liseré orange | whoosh |
| `liste` / `point` | `titre` / `texte` | carte à points numérotés | whoosh / pop |
| `chiffre` | `valeur`, `prefixe`, `suffixe`, `sous`, `depart`, `montee` | grand nombre orange qui monte | défilement |
| `chrono` / `arreter` | `titre` (« ES5 · COL DE LA CROIX »), `depart` (« 5:06.0 »), `arret` (« 5:09.4 »), `sous`, `sousFin` / — | chronomètre de spéciale qui défile en temps réel, puis se fige en orange sur `arret` | tic-tac / bip + carillon |
| `typo` | `texte` (`*mot*` en orange), `sous`, `taille`, `fin` | texte géant plein écran, mot à mot | whoosh |
| `tampon` | `texte`, `couleur` : `orange`, `vert`, `rouge` | tampon incliné, 3 s | tampon |
| `masquer` | — | retire titre, liste, chiffre, chrono, typo, tampon, bulle, notifications | — |
| `fin` | — | carte de fin (`fin.promesse`, `fin.detail`, `fin.cta`, `fin.pose`) | — |

Chaque action accepte `fin` (mot de fin) ou `duree`. Ancrage : `ancre` = mot de la scène, sous sa forme écrite ; `position: "fin"` pour viser la fin du mot. Une scène peut avoir une `image` (étape 4) : elle sert alors de décor plein écran derrière le téléphone (photo de spéciale, de spectateurs…), sans personne ni marque réelle identifiable.

## Contenu de démo (extrait)

```json
"ecrans": {
  "rallye": {
    "nom": "Rallye des Hautes Combes", "ville": "Saint-Claude", "dates": "10–11 oct. 2026",
    "championnat": "Coupe de France des Rallyes", "situation": { "live": true },
    "classement": [{ "n": 1, "temps": "38:12.6" }, { "n": 3, "temps": "38:20.9", "ecart": "+8.3" }]
  }
},
"fin": { "promesse": "Le rallye du jour,<br>en direct", "detail": "Tous les rallyes du monde, en français", "cta": "Gratuit · iPhone et Android", "pose": "salut" }
```

Aperçu : `"cartes"` choisit et ordonne les cartes (défaut `["situation", "lieu", "championnat", "alertes", "podium", "editions"]`, ordre de l'app). Carte Éditions : `"editions": { "total": 78, "liste": [{ "annee": 2026, "titre": "…", "courante": true }, …] }` (3 visibles, ids `ra-editions`, `ed-<année>`, `ra-editions-plus`). `"championnat": ""` retire le championnat de l'en-tête. `"logo"` : `"initiales"` (démo), un fichier de `images/`, ou `null` (pas de tuile, comme dans l'app quand eWRC n'a pas de logo : ne pas afficher le logo d'un organisateur sans accord). Page pilote : `championnat` et `prochain` peuvent valoir `null` ; `dernier.general: "Abandon"` s'affiche en rouge.

- **Abandon en direct** : il n'y a **pas** de notification en direct. « {pilote} est forfait » n'est envoyée qu'à la publication du classement final, pour un pilote suivi qui n'y figure pas.

Pour une épreuve terminée : `"situation": { "vainqueur": "Hugo Marchal · Hyundai i20 N Rally2" }` (la carte Podium apparaît). Pour une épreuve à venir : `"situation": { "titre": "Demain", "detail": "Départ de l’ES1 à 08:35, heure locale" }`.

## Règles de cohérence

- Un temps ou un écart dit à voix haute doit être celui affiché (le chrono `arret` doit être égal au temps de la ligne en tête de la feuille de spéciale).
- Les écarts suivent la règle de couleur de l'app : moins de 25 s en gris, moins de 2 min en gris clair, au-delà en gris foncé.
- Pas d'emphase colorée des bonnes positions en dehors de la ligne du leader (convention de l'app).
