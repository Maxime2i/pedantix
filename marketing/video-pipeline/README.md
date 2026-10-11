# Pipeline vidéo marketing

Transforme un script en vidéo courte finalisée (9:16 par défaut) : voix off, sous-titres animés, bruitages, animations codées en HTML/CSS/JS, rendu image par image et montage ffmpeg. Tout est piloté par les mots de la voix : changer une couleur ne relance ni la voix ni Whisper.

## Installation

Prérequis : Node 20+, Python 3.9+, ffmpeg, Google Chrome.

```bash
cd marketing/video-pipeline
npm install
pip3 install faster-whisper
```

Clé API (voix et images) dans `~/.zshrc`, jamais dans le code :

```bash
export OPENROUTER_API_KEY="sk-or-…"
```

Variables optionnelles : `CHROME_PATH` (autre navigateur), `IMAGE_MODEL` (modèle d'image, défaut `google/gemini-3.1-flash-image`).

## Usage

```bash
node pipeline/run.mjs --projet 01-declic
```

Reprendre à partir d'une étape, ou n'en lancer qu'une :

```bash
node pipeline/run.mjs --projet 01-declic --depuis rendu
```

```bash
node pipeline/run.mjs --projet 01-declic --seulement montage
```

Aperçu de l'animation dans un navigateur (`?play` pour la lecture, `?t=12.3` pour figer un instant) :

```bash
node pipeline/serveur.mjs
```

puis ouvrir `http://127.0.0.1:4317/projets/01-declic/animation/index.html?play`.

Captures d'instants choisis, en planche (sans rendre toute la vidéo) :

```bash
node pipeline/instants.mjs --projet pedantix-00-banc --t 1.5,6,11
```

## Étapes

| # | Étape | Script | Sortie | Coût |
|---|---|---|---|---|
| 1 | Concept et script (3 angles → validation → découpage en scènes) | à la main / avec Claude | `script.json` | — |
| 2 | Voix off, Gemini TTS via OpenRouter, en un bloc | `02-voix.mjs` | `audio/voix.wav` | ≈ 0,5 ¢ / 20 s |
| 3 | Timings mot à mot (Whisper local), alignés sur le script | `03-timings.py` | `timings.json`, `sous-titres.srt` | gratuit |
| 4 | Images réalistes (Gemini image via OpenRouter) pour les scènes qui ont un champ `image` | `04-images.mjs` | `images/scene-XX.png` | ≈ 3–4 ¢ / image |
| 5 | Bruitages synthétisés avec ffmpeg | `05-bruitages.mjs` | `audio/sfx/*.wav` | gratuit |
| 6 | Animation HTML pilotée par `renderAt(t)` | `projets/<p>/animation/index.html` + `moteur.js` | — | — |
| 7 | Rendu image par image (Chrome headless, 30 i/s) | `07-rendu.mjs` | `frames/` | gratuit |
| 8 | Montage : H.264 + voix + bruitages (+ musique), normalisé à -14 LUFS | `08-montage.mjs` | `output/video-finale.mp4` | gratuit |
| 9 | Contrôle qualité : durée, synchro, sous-titres = script, zones de sécurité, volume ; captures | `09-controle.mjs` | `output/controle.json`, `output/planche.jpg` | gratuit |

Les coûts API estimés de chaque vidéo sont journalisés dans `output/couts.json`.

## Créer une nouvelle vidéo

1. Copier `projets/01-declic` vers `projets/02-<nom>` (garder `animation/index.html` comme base).
2. Écrire `script.json` :
   - `scenes[].voix` : texte dit (une idée par scène, phrases courtes, accroche dans les 2 premières secondes, appel à l'action à la fin) ;
   - `scenes[].actions` : ce qui se passe à l'écran, ancré sur un mot de la voix (`"ancre": "Paris"`, `"fin": "chauffe"`, `"position": "fin"`) — jamais de temps en secondes ;
   - `scenes[].bruitages` : sons supplémentaires ancrés sur un mot ; frappes, envois, mots trouvés et victoire sont sonorisés automatiquement ;
   - `scenes[].image` : description d'une image réaliste, ou `null` ;
   - `voix.instructions` : ton et rythme de la voix.
3. Adapter `PROJET` en haut du `<script>` de `animation/index.html` si besoin, puis lancer `run.mjs`.

Types d'actions gérés par `moteur.js` : `entree`, `zoom` (`titre`, `article`), `taper`, `envoyer`, `accelere`, `resultat`, `fin`.

## Charte graphique

`config/charte-<client>.json` : couleurs, polices (Google Fonts), logo, modèle et voix TTS. L'animation lit ces valeurs au chargement : un changement de charte ne demande que les étapes `rendu`, `montage` et `controle`.

## Ce qui relance quoi

| Modification | À relancer depuis |
|---|---|
| Texte de la voix | `voix` |
| Ancres / actions / page de démo | `rendu` (le montage relit la chronologie) |
| Couleurs, polices, mise en page | `rendu` |
| Volume, musique (`audio/musique.mp3`) | `montage` |
| Bruitages (remplacer `audio/sfx/*.wav`) | `montage` |
