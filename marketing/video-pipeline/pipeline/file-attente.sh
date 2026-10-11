#!/bin/zsh
# File de production : rend une par une les vidéos prêtes (fichier .pret dans le projet),
# puis copie video-finale.mp4 dans marketing/videos/<projet>.mp4.
#   zsh pipeline/file-attente.sh            (s'arrête quand le fichier projets/STOP existe)
# Journal : projets/<p>/output/production.log ; échec → fichier .echec dans le projet.
cd "$(dirname "$0")/.."
eval "$(grep '^export OPENROUTER_API_KEY' ~/.zshrc)"
VIDEOS=../videos
mkdir -p $VIDEOS
while [ ! -f projets/STOP ]; do
  p=$(ls -d projets/pedantix-[0-9][0-9]-*/ 2>/dev/null | sed 's#projets/##; s#/$##' | while read d; do
        [ -f projets/$d/.pret ] && [ ! -f projets/$d/.fait ] && [ ! -f projets/$d/.echec ] && echo $d; done | head -1)
  if [ -z "$p" ]; then sleep 15; continue; fi
  mkdir -p projets/$p/output
  echo "▶ $p ($(date +%H:%M))"
  if node pipeline/run.mjs --projet $p > projets/$p/output/production.log 2>&1; then
    cp projets/$p/output/video-finale.mp4 $VIDEOS/$p.mp4
    rm -rf projets/$p/frames
    touch projets/$p/.fait
    echo "✅ $p"
  else
    touch projets/$p/.echec
    echo "❌ $p : $(grep -E '❌|Error' projets/$p/output/production.log | head -2 | tr '\n' ' ')"
  fi
done
rm -f projets/STOP
echo "File arrêtée."
