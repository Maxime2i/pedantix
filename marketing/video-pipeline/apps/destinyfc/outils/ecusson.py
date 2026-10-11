"""Avatar de Maxime aux couleurs de Destiny FC : remplace l'écusson « P » (terracotta)
des poses par un écusson pétrole Destiny FC « FC », sans régénérer les images.
  python3 apps/destinyfc/outils/ecusson.py [--controle planche.jpg]
Source : ~/.claude/avatars/maxime/poses (non modifié) → apps/destinyfc/avatar/."""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ICI = Path(__file__).resolve().parent
SOURCE = Path.home() / ".claude/avatars/maxime/poses"
SORTIE = ICI.parent / "avatar"
POLICE = ICI / "oswald-600.ttf"
ORANGE, ORANGE_SOMBRE = (14, 138, 154), (8, 85, 96)  # primaryLight / primaryDark de l'app


def trouver_ecusson(img):
    """Plus grande tache terracotta à peu près ronde (les embouts des cordons sont allongés)."""
    a = np.asarray(img.convert("RGBA")).astype(int)
    r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    masque = (al > 200) & (r > 150) & (r < 220) & (r - g > 68) & (b < 105)
    masque[: img.height // 2] = False  # écusson sur la poitrine (même cadrage pour toutes les poses)
    from collections import deque
    vu = np.zeros_like(masque)
    meilleur = None
    h, w = masque.shape
    ys, xs = np.nonzero(masque)
    for y0, x0 in zip(ys, xs):
        if vu[y0, x0]:
            continue
        pile, pts = deque([(y0, x0)]), []
        vu[y0, x0] = True
        while pile:
            y, x = pile.pop()
            pts.append((y, x))
            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                ny, nx = y + dy, x + dx
                if 0 <= ny < h and 0 <= nx < w and masque[ny, nx] and not vu[ny, nx]:
                    vu[ny, nx] = True
                    pile.append((ny, nx))
        if len(pts) < 600:
            continue
        p = np.array(pts)
        hy, wx = np.ptp(p[:, 0]) + 1, np.ptp(p[:, 1]) + 1
        if not 0.6 < hy / wx < 1.6 or hy < 35:
            continue
        if meilleur is None or len(pts) > meilleur[0]:
            meilleur = (len(pts), p[:, 1].min(), p[:, 0].min(), p[:, 1].max(), p[:, 0].max())
    return meilleur and meilleur[1:]


def peindre(img, boite):
    x0, y0, x1, y1 = boite
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    rx, ry = (x1 - x0) / 2 + 3, (y1 - y0) / 2 + 4
    cy += 1.5  # couvre aussi le liseré terracotta du bas
    k = 4  # sur-échantillonnage pour un bord net
    calque = Image.new("RGBA", (img.width * k, img.height * k), (0, 0, 0, 0))
    d = ImageDraw.Draw(calque)
    box = [(cx - rx) * k, (cy - ry) * k, (cx + rx) * k, (cy + ry) * k]
    d.ellipse(box, fill=ORANGE_SOMBRE)
    d.ellipse([box[0] + 2 * k, box[1] + 2 * k, box[2] - 2 * k, box[3] - 3 * k], fill=ORANGE)
    police = ImageFont.truetype(str(POLICE), int(ry * 1.0 * k))
    d.text((cx * k, cy * k - 1 * k), "FC", font=police, fill=(255, 255, 255), anchor="mm")
    calque = calque.resize(img.size, Image.LANCZOS)
    # légère ombre portée pour garder le relief du rendu 3D
    ombre = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(ombre).ellipse([cx - rx + 1, cy - ry + 3, cx + rx + 1, cy + ry + 3], fill=(0, 0, 0, 60))
    ombre = ombre.filter(ImageFilter.GaussianBlur(3))
    return Image.alpha_composite(Image.alpha_composite(img, ombre), calque)


def recolorer(img, zone):
    """Écusson en partie caché (bras devant) : ne recolore que le liseré visible."""
    a = np.asarray(img).astype(float)
    x0, y0, x1, y1 = zone
    z = a[y0:y1, x0:x1]
    m = (z[..., 3] > 200) & (z[..., 0] > 55) & (z[..., 0] > 2.2 * z[..., 1]) & (z[..., 2] < 110)
    lum = z[..., :1] / 190
    z[..., :3] = np.where(m[..., None], np.clip(np.array(ORANGE) * lum, 0, 255), z[..., :3])
    return Image.fromarray(a.astype(np.uint8))


def main():
    SORTIE.mkdir(parents=True, exist_ok=True)
    rapport, vignettes = [], []
    for f in sorted(SOURCE.glob("*.png")):
        img = Image.open(f).convert("RGBA")
        if f.stem == "neutre-bouche-ouverte":  # calque de bouche : pas d'écusson
            img.save(SORTIE / f.name)
            continue
        boite = trouver_ecusson(img)
        if boite:
            img = peindre(img, boite)
        else:
            img = recolorer(img, (598, 690, 640, 770))
        rapport.append(f"{f.stem}: {'écusson ' + str(boite) if boite else 'écusson caché, liseré recoloré'}")
        img.save(SORTIE / f.name)
        vignettes.append((f.stem, img))
    print("\n".join(rapport))
    if "--controle" in sys.argv:
        cols, t = 5, 300
        planche = Image.new("RGB", (cols * t, ((len(vignettes) + cols - 1) // cols) * (t + 30)), (34, 34, 34))
        d = ImageDraw.Draw(planche)
        for i, (nom, im) in enumerate(vignettes):
            x, y = (i % cols) * t, (i // cols) * (t + 30)
            planche.paste(im.resize((t, t)), (x, y), im.resize((t, t)))
            d.text((x + 10, y + t + 6), nom, fill=(255, 255, 255))
        planche.save(sys.argv[sys.argv.index("--controle") + 1], quality=85)


main()
