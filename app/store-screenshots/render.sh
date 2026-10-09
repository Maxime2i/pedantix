#!/bin/zsh
# Exporte les 7 captures Pédantix aux formats des stores :
#   png/                                  1290 × 2796  (source)
#   ../store/apple/fr-FR/APP_IPHONE_67/   1290 × 2796  iPhone 6,9″ / 6,7″
#   ../store/apple/fr-FR/APP_IPHONE_65/   1284 × 2778  iPhone 6,5″
#   ../store/google/fr-FR/phoneScreenshots 1575 × 2800  Google Play (9:16)
cd "$(dirname "$0")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
shot() { # $1 = n, $2 = largeur, $3 = hauteur, $4 = fichier
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --allow-file-access-from-files --virtual-time-budget=5000 \
    --window-size=$2,$3 --screenshot="$4" "file://$PWD/index.html?n=$1&w=$2&h=$3" 2>/dev/null
}
APPLE=../store/apple/fr-FR
GOOGLE=../store/google/fr-FR/phoneScreenshots
mkdir -p png "$APPLE/APP_IPHONE_67" "$APPLE/APP_IPHONE_65" "$GOOGLE"
for n in 1 2 3 4 5 6 7; do
  shot $n 1290 2796 "png/pedantix-0$n.png"
  cp "png/pedantix-0$n.png" "$APPLE/APP_IPHONE_67/$n.png"
  sips -z 2783 1284 "png/pedantix-0$n.png" --out "$APPLE/APP_IPHONE_65/$n.png" >/dev/null
  sips -c 2778 1284 "$APPLE/APP_IPHONE_65/$n.png" >/dev/null
  shot $n 1575 2800 "$GOOGLE/$n.png"
done
echo OK
