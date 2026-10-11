# Bibliothèque Destiny FC

Page d'animation : `apps/destinyfc/index.html?projet=<dossier>` (moteur générique : `pipeline/scene.js`). Charte : `config/charte-destinyfc.json` (fond pétrole #062E35, menthe #5DD0C0, or #D4A017, Oswald + Plus Jakarta Sans, voix Gemini « Puck », la même que Maxime sur les autres apps). Écrans repris du code de l'app **publiée** (`destiny-eleven`, branche `main` : `HomeScreen`, `SetupScreen`, `GameScreen`, `GrassBackground`, fiche du Panthéon) et de captures réelles du 10/10/2026, avec les textes exacts. Données de démo par défaut : `demo.js`.

**Langues** : `"langue": "en"` dans le script affiche l'app en anglais (textes officiels de la version anglaise : `strings.ts > en`, `frEn.json`, `glossary.ts`), avec les listes `FEUILLES_EN`, les cartes `DEMO_EN.cartes` (mêmes ids), les montants au format anglais (`€50k`, `€3.1m`) et une carte de fin anglaise. Whisper suit la langue du script. Valeurs de `choisir` en anglais (`"Midfielder"`, `"Working-class estate"`, `"Ambitious agent"`…). Projets anglais : `projets/destinyfc-en-<nn>-<slug>/`. **Vidéos anglaises = contexte anglais** (consigne de Maxime) : joueur anglais (prénoms/noms du réservoir `en` de `data.js` : Harry, Jack, Callum… / Turner, Wright, Hughes…, par défaut « Jack Turner »), clubs anglais réels de `data.js` : Élite `United`, `City`, `Gunners`, `Liverpool`, `London Blue` ; D1 `Leeds`, `Brighton`, `Everton`, `Newcastle`, `Brentford`, `Forest`, `Southampton`, `Crystal` ; D2 `Portsmouth`, `Sheffield`, `Middlesbrough`, `Wolf`, `West London` ; Rég. `Dover`, `Grimsby`, `Wrexham`, `Canterbury`, `Lutin`. Les valeurs par défaut de `DEMO_EN` le sont déjà. Le palier « ICÔNE » est traduit « ICON » dans l'app depuis le 11/10/2026.

Pour une vidéo, écrire seulement `projets/destinyfc-<nn>-<slug>/script.json` avec `"app": "destinyfc"`.

**Aperçu gratuit avant la voix** : `node pipeline/timings-factices.mjs --projet <dossier>`, puis `node pipeline/instants.mjs --projet <dossier> --t 1,4,9`. Banc d'essai de toutes les actions : `projets/destinyfc-00-banc` (vidéo complète, contrôles verts).

## Règles de la campagne

- Le jeu : simulation de carrière de footballeur, **de 16 ans à la retraite**, en choix narratifs (événements, moments décisifs, mercato, intersaison). Gratuit avec achats (jetons, Destiny FC+) et pubs. Appel à l'action par défaut : « Gratuit · iPhone et Android » (App Store et Google Play, v1.6).
- La voix est celle de **Maxime, le développeur**, à la première personne. Jamais de chiffres de joueurs ou de téléchargements, ni de faux avis.
- **Montrer uniquement ce qui est publié** (branche `main`). L'arbre local contient des fonctions **non publiées** : avatar du joueur et éditeur « Mon joueur », cinématique « La Signature », suppression du Rendez-vous quotidien. Ne pas les montrer ni les annoncer tant qu'elles ne sont pas en ligne. Ne jamais montrer les boutons de test « 🎬 Transfert / 🎬 Prêt ».
- Textes de jeu : uniquement ceux de `src/game/data.js` (événements, moments décisifs, titres de presse `HEADLINES`) et `src/i18n/strings.ts`, mot pour mot. `{club}`, `{name}` remplacés par les données de la démo. Les cartes de `demo.js` en sont déjà tirées ; pour un autre événement, le recopier depuis `data.js` dans `"cartes"` du script.
- Pas de « tu choisis ce qui se passe à chaque match » : on choisit des réactions à des événements, l'issue reste aléatoire (pondérée). Ne pas promettre de contrôle du jeu en match, de 3D, de multijoueur en direct.
- **Notifications** (écran `verrouillage`) : textes réels de `strings.ts > notif` : `{nom} t'attend` / « {âge} ans, saison en cours. Reprends ta carrière là où elle s'est arrêtée. » ; `🔥 Ta série de {n} jours est en danger` / « Termine une quête aujourd'hui pour la garder. » ; `{icône} Nouvelle Légende : {alias}` / « Gratuite aujourd'hui seulement. Feras-tu mieux que l'original ? » ; `🗓️ Nouveau défi de la semaine` ; `⚽ Un nouveau destin t'attend` / « Une carrière commence à 16 ans. Celle-ci sera peut-être la bonne. »
- Pas de nom de concurrent (Destiny Eleven, etc.). Pas de vrai joueur nommé (les Légendes du jeu sont anonymisées : « Le Prodige de Santo »…). Les clubs de l'app portent des noms de villes (Lens, Lyon, Brighton…) : les utiliser tels quels, sans écusson ni logo.

## Avatar

Poses (`avatar/<nom>.png`) : l'avatar de `~/.claude/avatars/maxime/poses`, avec l'écusson « P » remplacé par un écusson pétrole « FC ». Pour les régénérer après un ajout de pose : `python3 apps/destinyfc/outils/ecusson.py --controle planche.jpg` (gratuit, ne modifie pas l'original).

Poses : `neutre`, `parle`, `salut`, `content`, `choque`, `reflechit`, `panique`, `fier`, `montre-droite`, `montre-gauche`, `telephone`, `clin`, `decu`, `celebre`, `tete-main`. La **synchro labiale ne marche que sur `neutre`** : y revenir pour les longues phrases. Pose de départ : `"poseInitiale"`. Carte de fin avec avatar : `"fin": { "pose": "salut" }` — **uniquement si l'avatar apparaît dans la vidéo** (consigne de Maxime : l'avatar n'est pas obligatoire). La page l'applique d'elle-même : sans `disposition` autre que `telephone`, la carte de fin n'a pas d'avatar (forcer avec `"avatarFin": true`).

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
| `accueil` | logo, jetons 🪙, série 🔥, carte « Carrière · Écrire sa légende » (ou « Reprendre · nom »), tuiles Rendez-vous quotidien / Légendes / Amis, quêtes du jour, Boutique · Badges · Panthéon · Classement · Réglages | `a-carriere`, `a-quotidien`, `a-legendes`, `a-amis`, `a-quetes`, `a-boutique`, `a-badges`, `a-pantheon`, `a-classement`, `a-reglages`, `a-jetons` |
| `creation` | « Crée ton joueur » : fiche (nom, nationalité, poste, barres TEC/PHY/MEN/CHA), lignes Nationalité / Poste / Origine / Style de vie / Entourage, « Tout aléatoire », « Choisir mon club » | `cr-fiche`, `cr-nom`, `cr-tec`…`cr-cha`, `cr-champ-<champ>`, `cr-aleatoire`, `cr-club` |
| `clubs` | « Les clubs vous ont repéré », potentiel en étoiles, 6 clubs (niveau coloré, couleurs, pays) | `cl-0`…`cl-5` |
| `partie` | écran de jeu : en-tête du joueur (drapeau, nom, âge · année, niveau + club, note, argent, étoiles, jauges Forme / Moral / Confiance / Pression) et **carte centrale** (action `carte`) | `p-tete`, `p-club`, `p-note`, `p-argent`, `p-etoiles`, `p-jauges`, `p-carte`, `p-opt-<n>`, `p-continuer` |
| `fiche` | fiche de fin de carrière (Panthéon) : carte · tier, titre, surnom, trajectoire, signature, récit, statistiques, palmarès, distinctions, discours d'intronisation | `f-carte`, `f-titre`, `f-score`, `f-surnom`, `f-stats`, `f-palmares`, `f-distinctions`, `f-discours` |
| `verrouillage` | écran verrouillé pour les notifications | — |

Écran de départ : `"ecranInitial"` (défaut `accueil`). Surcharge des données : `"ecrans": { "<écran>": { … } }` (global) ou `donnees` de l'action `ecran`. Champs de `creation` (`champ`) : `nationalite`, `poste`, `origine`, `style`, `entourage` ; valeurs = titres des listes de `demo.js > FEUILLES` (ex. `"Milieu"`, `"Quartier populaire"`).

## Cartes de l'écran de jeu (`carte`)

`{ "type": "carte", "id": "<carte>" }` (cartes de `demo.js > DEMO.cartes` ou de `"cartes"` du script), champs surchargeables dans l'action. Genres :

| Genre | Champs |
|---|---|
| `evenement` | `tag` (« 📏 TERRAIN · 16 ANS »), `texte`, `options: [{ texte, indice? }]`, `treve?: { libelle, stats, zone: [texte, "bad"/"good"/"neutre"] }` |
| `moment` | moment décisif : `tag`, `titre`, `texte`, `options` |
| `resultat` | `tag`, `texte`, `effets: ["+5 Physique", "-6 Moral", "🩹 8 semaines d'absence"]` (couleur selon le signe), `ton: "great"/"bad"` (liseré), `bouton` |
| `saison` | bilan : `tag`, `niveau`, `une` (titre de presse), `stats: [[valeur, libellé]×4]`, `lignes` |
| `mercato` | `tag`, `texte`, `offres: [{ niveau, club, couleurs, pays, detail }]`, `bouton` |
| `preparation` | intersaison : `tag`, `texte`, `points`, `postes` (4), `bouton` |

Cartes prêtes : `croissance` → `croissance-ok` / `croissance-pubalgie`, `bapteme` → `bapteme-ok`, `banc` → `banc-ok`, `bevue` → `bevue-ko`, `finale` → `finale-gagnee` / `finale-perdue`, `saison`, `mercato`, `preparation`.

## Actions

| Action | Paramètres | Effet | Son auto |
|---|---|---|---|
| `disposition` | `mode` : `avatar`, `duo`, `coin`, `telephone` | place le téléphone et l'avatar | whoosh |
| `pose` | `nom` (voir Avatar) | change la pose de l'avatar | pop léger |
| `bulle` | `texte`, `style` (`parole`, `pensee`) | bulle au-dessus de la tête, 2,5 s ou jusqu'à `fin` | pop |
| `entree` | — | le téléphone monte à l'écran (sinon il est là dès le début) | whoosh |
| `zoom` | `cible` : `aucun`, `entier`, `haut`, `contenu`, ou un id ; `echelle` (1,3), `hauteur` (900) | caméra (0,6 s), suit l'élément ; revient à `aucun` sur `ecran` et `disposition` | — |
| `ecran` | `nom`, `donnees` | change d'écran (glissement) | whoosh |
| `appui` | `cible` (id) | doigt + enfoncement | clic |
| `defiler` | `y` (points d'écran), `depart` | fait défiler l'écran (0,7 s) | — |
| `taper` | `mot` | tape le nom du joueur (écran `creation`) | clics |
| `feuille` | `nom` (champ) | ouvre la liste de choix de ce champ | clic + whoosh |
| `choisir` | `valeur` (titre d'option), `nom` (si pas de feuille ouverte) | coche l'option, ferme la feuille, remplit la ligne | clic + pop |
| `aleatoire` | `champs`, `attributs`, `nom` | appui sur « Tout aléatoire » : tout se remplit en cascade | clic + défilement |
| `attributs` | `tec`, `phy`, `men`, `cha` | les barres de la fiche montent (0,8 s) | défilement |
| `carte` | `id` et/ou champs (voir Cartes) | nouvelle carte centrale (entrée 0,4 s) ; efface l'option choisie | flip |
| `option` | `n` (1, 2…) | appui sur l'option n : surlignée, les autres grisées | clic + pop |
| `continuer` | — | appui sur le bouton principal de la carte | clic |
| `repartir` | `poste` (1–4), `valeur` | « + » sur une ligne de la préparation | clic |
| `joueur` | `note`, `age`, `annee`, `niveau`, `club`, `couleurs`, `argent`, `etoiles`, `pays`, `nom`, `jauges` | met à jour l'en-tête ; la note compte (0,8 s) | bip |
| `jauges` | `forme`, `moral`, `confiance`, `pression` (0–100) | jauges animées (0,8 s) ; vert ≥ 50, sinon orange ; pression : rouge ≥ 50 | bip |
| `notif` | `titre`, `texte`, `quand`, `duree` (4 s) | bannière iOS ; deux au plus sur `verrouillage` | notif |
| `titre` | `texte` (`*mot*` en menthe), `sous`, `numero` | carte titre | whoosh |
| `liste` / `point` | `titre` / `texte` | carte à points numérotés | whoosh / pop |
| `frise` / `etape` | `titre`, `max` (4) / `age`, `texte`, `niveau`, `club` | frise de carrière, étapes ajoutées une à une | whoosh / pop |
| `chiffre` | `valeur`, `depart`, `prefixe`, `suffixe`, `sous`, `montee` (1,2 s) | grand nombre qui monte, sur carte | défilement |
| `tableau` / `but` | `titre`, `domicile` / `exterieur` : `{ nom, couleurs }`, `score` ([0,0]), `minute`, `minuteFin`, `minuteDuree` (3 s), `sous` / `equipe` (`dom`, `ext`), `texte` | tableau de score ; la minute défile ; `but` incrémente le score et affiche `texte` | sifflet / foule + arpège |
| `typo` | `texte` (`*mots*` en menthe), `sous`, `taille`, `fin` | texte géant plein écran, mot à mot | whoosh |
| `tampon` | `texte`, `couleur` : `menthe`, `or`, `vert`, `rouge` | tampon incliné, 3 s | tampon |
| `masquer` | — | retire titre, liste, frise, chiffre, tableau, typo, tampon, bulle, notifications | — |
| `fin` | — | carte de fin (`fin.promesse`, `fin.detail`, `fin.cta`, `fin.pose`) | — |

Chaque action accepte `fin` (mot de fin) ou `duree`. Ancrage : `ancre` = mot de la scène sous sa forme écrite (« l'accueil » se normalise en `laccueil` : choisir un mot sans apostrophe) ; `position: "fin"` pour viser la fin du mot ; le **premier** mot qui correspond dans la scène est pris. Une scène peut avoir une `image` (étape 4) : décor plein écran derrière le téléphone (stade, vestiaire…), sans personne ni marque réelle identifiable.

## Mise en page

- Sur `partie`, si la carte centrale passe sous les sous-titres, ceux-ci montent automatiquement dans l'espace libre au-dessus d'elle. **Ne pas zoomer sur les cartes longues** (`moment` à 4 options, `mercato`, `preparation`) : sans zoom, tout reste lisible. Un zoom sur `p-carte` (≈ 1,2, `hauteur` 960) convient aux cartes courtes (`evenement` à 2 options, `resultat`) ; le remettre à `aucun` avant une carte longue.
- Zoom sur l'en-tête pour montrer une conséquence : `{ "type": "zoom", "cible": "p-jauges", "echelle": 1.25 }` puis `jauges`.
- **Échelle ≤ 1,25 pour un élément pleine largeur** (en-tête, jauges, cartes, fiche) : au-delà, ses bords sortent du cadre.
- `chiffre` reste affiché jusqu'à la superposition suivante : lui donner une `duree` (≈ 2,5 s) s'il est suivi de l'écran du jeu.
- Avatar en `coin` : il masque le bas gauche de l'écran ; ne pas l'utiliser pendant qu'on énumère des options.

## Contenu de démo (extrait)

```json
"ecrans": {
  "partie": { "joueur": { "nom": "Lucas Morel", "pays": "france", "age": 16, "annee": 2026, "niveau": "d2", "club": "Sochaux", "couleurs": ["#f5c400", "#1b3c8c"], "poste": "milieu", "note": 56, "argent": "50 k€", "etoiles": 1, "jauges": { "forme": 74, "moral": 70, "confiance": 58, "pression": 30 } }, "carte": "croissance" },
  "accueil": { "reprendre": { "nom": "Lucas Morel", "age": 18, "club": "Lyon" } }
},
"fin": { "promesse": "De 16 ans à la retraite,<br>écris ta <em>légende</em>", "detail": "Chaque choix compte", "cta": "Gratuit · iPhone et Android", "pose": "salut" }
```

Niveaux : `reg` (Rég., gris), `d2` (bleu), `d1` (violet), `elite` (Élite, or). Postes : `attaquant` ⚡, `milieu` 🎩, `defenseur` 🛡️, `gardien` 🧤. Drapeaux disponibles : `drapeaux/<pays>.png` (france, angleterre, espagne, italie, allemagne, bresil, argentine, portugal, pays-bas, belgique, maroc, senegal, algerie, cameroun, cote-d-ivoire…).

## Règles de cohérence

- Note, âge, année, club et argent affichés doivent suivre la chronologie dite (16 ans = 2026, +1 par saison).
- Un effet annoncé (« +5 Physique ») doit correspondre à l'issue réelle de l'événement dans `data.js`.
- Les jauges bougent dans le sens de l'effet (un moral −6 baisse Moral).
- Un club de niveau `elite` n'apparaît pas dans les offres d'un joueur de 16 ans à 1 étoile (cohérence du potentiel).
