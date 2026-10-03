#!/usr/bin/env python3
"""Génère public/og-image.png (1200x630) — fond crème, titre serif terracotta."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
CREAM = (246, 241, 231, 255)
TERRACOTTA = (192, 86, 33, 255)
AMBER = (217, 119, 6, 255)
INK = (60, 45, 30, 255)

# Serif proche de Fraunces si présent, sinon DejaVu Serif (présent partout).
candidates = [
    "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationSerif-Bold.ttf",
]
font_path = next((p for p in candidates if __import__("os").path.exists(p)), None)
if font_path is None:
    raise SystemExit("Aucune fonte serif trouvée")
font_title = ImageFont.truetype(font_path, 92)
font_sub = ImageFont.truetype(font_path, 44)

img = Image.new("RGB", (W, H), CREAM)
d = ImageDraw.Draw(img)

# Filet éditorial terracotta (écho du design magazine).
d.rectangle([0, 0, W, 10], fill=TERRACOTTA)
d.rectangle([0, H - 10, W, H], fill=TERRACOTTA)

# Titre centré : « Pédantix — Le mot du jour »
title = "Pédantix — Le mot du jour"
bb = d.textbbox((0, 0), title, font=font_title)
d.text(((W - (bb[2] - bb[0])) / 2, 210), title, font=font_title, fill=TERRACOTTA)

# Sous-titre : jeu de culture générale
sub = "Jeu de culture générale · Article Wikipédia du jour"
bb2 = d.textbbox((0, 0), sub, font=font_sub)
d.text(((W - (bb2[2] - bb2[0])) / 2, 350), sub, font=font_sub, fill=INK)

out = Path(__file__).resolve().parent.parent / "public" / "og-image.png"
img.save(out, "PNG")
print(f"OK: {out}")
