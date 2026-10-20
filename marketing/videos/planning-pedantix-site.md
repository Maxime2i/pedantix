# Vidéos Pédantix — série « site » (en attendant la validation de l'app)

Six vidéos verticales 1080 × 1920 qui renvoient vers **pedantix.vercel.app** (lien en bio), pas vers l'App Store. Scripts : `video-pipeline/projets/pedantix-web-NN-*/script.json` (mode `"navigateur": true` : barre d'adresse Safari, carte de fin « pedantix.vercel.app »). Aperçus sans voix : `node pipeline/timings-factices.mjs --projet <p>` puis `node pipeline/instants.mjs --projet <p> --t 2,6,10`.

- **Lien en bio** : `https://pedantix.vercel.app` (remplacer par le lien App Store quand l'app sort, et reprendre la série `pedantix-NN`).
- **Légende** : la phrase ci-dessous + `#pedantix #wikipedia #culturegenerale #jeudemots #jeudujour`.
- **Créneaux** : vers 11h30 (avant la page de midi) ou 19h, une par jour.
- Pages montrées : uniquement des pages passées (Casablanca, Ballon (sport), One Piece, Francis Ford Coppola, Déforestation).

| Ordre | Projet | Titre | Durée visée | Légende |
|---|---|---|---|---|
| 1 | pedantix-web-01-en-attendant-apple | En attendant Apple, le site | 22 s | Mon app attend Apple… mais le jeu est déjà jouable 👀 Lien en bio |
| 2 | pedantix-web-03-trois-mots | Trois mots, une page | 16 s | 3 mots. Tu trouves la page ? Réponse à la fin 🏴‍☠️ |
| 3 | pedantix-web-02-rien-a-installer | Rien à installer | 20 s | Rien à télécharger : tu ouvres le lien, tu joues. |
| 4 | pedantix-web-04-regles | Les règles en 15 secondes | 22 s | Les règles de Pédantix en 15 secondes ⏱️ |
| 5 | pedantix-web-05-bats-moi | Bats mon score | 16 s | 38 coups. Fais mieux et mets ton score en commentaire 👇 |
| 6 | pedantix-web-06-avant-tout-le-monde | Joue avant la sortie de l'app | 20 s | Joue avant la sortie de l'app et dis-moi ce qui cloche 🙏 |

## Production

Les scripts sont validés (`node pipeline/valider.mjs`) et marqués `.pret`. Sur le Mac (clé `OPENROUTER_API_KEY` dans `~/.zshrc`) :

```bash
cd marketing/video-pipeline
zsh pipeline/file-attente.sh     # produit les 6 vidéos et les copie dans marketing/videos/
```

ou une par une : `node pipeline/run.mjs --projet pedantix-web-01-en-attendant-apple`.
