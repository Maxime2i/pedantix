"""Étape 3 — Timings et sous-titres.

Whisper (faster-whisper, en local) donne l'horodatage de chaque mot entendu.
Le script fait foi : on aligne la transcription sur les mots du script et on
ne garde de Whisper que les timings (mots manquants : interpolés).
Sorties : timings.json, sous-titres.srt
"""
import os

# macOS : torch et CTranslate2 embarquent chacun OpenMP ; sans ça, le chargement échoue.
os.environ.setdefault("KMP_DUPLICATE_LIB_OK", "TRUE")

import difflib
import json
import re
import sys
import unicodedata
from pathlib import Path

from faster_whisper import WhisperModel

ROOT = Path(__file__).resolve().parent.parent
args = sys.argv
projet = args[args.index("--projet") + 1]
modele = args[args.index("--modele") + 1] if "--modele" in args else "small"
DIR = ROOT / "projets" / projet
script = json.loads((DIR / "script.json").read_text())

WORD = re.compile(r"[\w’'-]+", re.UNICODE)


def norm(w: str) -> str:
    w = unicodedata.normalize("NFD", w.lower())
    return "".join(c for c in w if c.isalnum())


# Mots du script, avec leur scène et leur ponctuation d'origine (pour les sous-titres).
mots = []
for si, scene in enumerate(script["scenes"]):
    prefixe = ""  # ponctuation isolée en début de scène (« « Tu savais… ») : rattachée au mot suivant
    for m in re.finditer(r"\S+", scene["voix"]):
        brut = m.group(0)
        coeur = "".join(WORD.findall(brut))
        if coeur:
            mots.append({"texte": prefixe + brut, "mot": coeur, "scene": si})
            prefixe = ""
        elif mots and mots[-1]["scene"] == si:  # ponctuation isolée (« Paris ? ») : rattachée au mot précédent
            mots[-1]["texte"] += " " + brut
        else:
            prefixe += brut + " "

print(f"Whisper « {modele} » sur audio/voix.wav …")
model = WhisperModel(modele, device="cpu", compute_type="int8")
segments, _ = model.transcribe(str(DIR / "audio" / "voix.wav"), language=script.get("langue", "fr"), word_timestamps=True)
entendus = [w for s in segments for w in s.words]
duree = max((w.end for w in entendus), default=0.0)

# Alignement script ↔ transcription sur les formes normalisées.
a = [norm(m["mot"]) for m in mots]
b = [norm(w.word) for w in entendus]
for bloc in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
    tag, i1, i2, j1, j2 = bloc
    if tag == "equal" or (tag == "replace" and i2 - i1 == j2 - j1):
        for k in range(i2 - i1):
            mots[i1 + k]["debut"] = round(entendus[j1 + k].start, 3)
            mots[i1 + k]["fin"] = round(entendus[j1 + k].end, 3)
    elif tag == "replace":  # p. ex. « quarante-deux » entendu « 42 » : on répartit le segment
        t0, t1 = entendus[j1].start, entendus[j2 - 1].end
        for k in range(i2 - i1):
            mots[i1 + k]["debut"] = round(t0 + (t1 - t0) * k / (i2 - i1), 3)
            mots[i1 + k]["fin"] = round(t0 + (t1 - t0) * (k + 1) / (i2 - i1), 3)

# Interpolation des mots restés sans horodatage.
manquants = [i for i, m in enumerate(mots) if "debut" not in m]
for i in manquants:
    avant = next((mots[j]["fin"] for j in range(i - 1, -1, -1) if "fin" in mots[j]), 0.0)
    apres = next((mots[j]["debut"] for j in range(i + 1, len(mots)) if "debut" in mots[j]), duree)
    mots[i]["debut"], mots[i]["fin"] = round(avant, 3), round(max(avant, apres), 3)
print(f"{len(mots)} mots du script, {len(entendus)} entendus, {len(manquants)} interpolés")

# Scènes : du premier mot de la scène au premier mot de la suivante.
scenes = []
for si, scene in enumerate(script["scenes"]):
    ms = [m for m in mots if m["scene"] == si]
    scenes.append({"id": scene["id"], "debut": ms[0]["debut"], "finVoix": ms[-1]["fin"]})
for si, s in enumerate(scenes):
    # Dernière scène (carte de fin) : 1,8 s après le dernier mot, et vidéo d'au moins 15,5 s (minimum des réseaux).
    s["fin"] = scenes[si + 1]["debut"] if si + 1 < len(scenes) else round(max(s["finVoix"] + 1.8, 15.5), 3)

timings = {"duree": scenes[-1]["fin"], "dureeVoix": round(duree, 3), "scenes": scenes, "mots": mots}
(DIR / "timings.json").write_text(json.dumps(timings, ensure_ascii=False, indent=2) + "\n")


# Sous-titres SRT : groupes de 3 mots maximum, coupés aux fins de phrase.
def ts(t):
    h, r = divmod(t, 3600)
    m, s = divmod(r, 60)
    return f"{int(h):02}:{int(m):02}:{int(s):02},{int(round((s % 1) * 1000)):03}"


groupes, cur = [], []
for m in mots:
    cur.append(m)
    if len(cur) == 3 or re.search(r"[.!?…,]$", m["texte"]):
        groupes.append(cur)
        cur = []
if cur:
    groupes.append(cur)
srt = []
for i, g in enumerate(groupes, 1):
    srt.append(f"{i}\n{ts(g[0]['debut'])} --> {ts(g[-1]['fin'])}\n{' '.join(m['texte'] for m in g)}\n")
(DIR / "sous-titres.srt").write_text("\n".join(srt))
print(f"→ timings.json ({timings['duree']} s), sous-titres.srt ({len(groupes)} groupes)")
for s in scenes:
    print(f"  {s['id']:<10} {s['debut']:6.2f} → {s['fin']:6.2f}")
