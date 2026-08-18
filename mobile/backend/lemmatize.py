"""Lemmatisation légère du français pour le jeu Pédantix mobile.

But : rapprocher les formes fléchies d'un même lemme que le modèle fastText
brut sépare (ex. cos(être, est) ≈ 0.12 seulement). La table couvre les verbes
les plus courants + un stemming pluriel simple.

Limite documentée : les formes rares (passé simple peu fréquent, subjonctif
imparfait, verbes hors table) ne sont PAS couvertes — elles retombent sur la
similarité cosinus brute.
"""

from __future__ import annotations

import unicodedata

# Formes fléchies (SANS accents, minuscules) -> lemme canonique (sans accents).
# Les accents sont ignorés à la normalisation : « être » et « etre » mènent
# au même lemme « etre ».
LEMMAS: dict[str, str] = {}

# Être
for _f in (
    "etre", "est", "suis", "es", "sommes", "sont", "etais", "etait",
    "etions", "etiez", "etaient", "etant", "ete", "soit", "soyons", "soyez",
    "soient", "serai", "seras", "sera", "serons", "serez", "seront",
    "serais", "serait", "serions", "seriez", "seraient", "fus", "fut",
    "fumes", "futes", "furent",
):
    LEMMAS[_f] = "etre"

# Avoir
for _f in (
    "avoir", "ai", "as", "a", "avons", "avez", "ont", "avais", "avait",
    "avions", "aviez", "avaient", "ayant", "eu", "eue", "eus", "eues",
    "eurent", "eut", "aurai", "auras", "aura", "aurons", "aurez", "auront",
    "aurais", "aurait", "aurions", "auriez", "auraient", "aie", "aies", "ait",
    "ayons", "ayez", "aient",
):
    LEMMAS[_f] = "avoir"

# Faire
for _f in (
    "faire", "fais", "fait", "faites", "faisons", "font", "faisais",
    "faisait", "faisions", "faisiez", "faisaient", "faisant", "ferai",
    "feras", "fera", "ferons", "ferez", "feront", "ferais", "ferait",
    "ferions", "feriez", "feraient", "fasse", "fasses", "fassions",
    "fassiez", "fassent", "fit", "firent", "faite", "faits",
):
    LEMMAS[_f] = "faire"

# Aller
for _f in (
    "aller", "vais", "vas", "va", "allons", "allez", "vont", "allais",
    "allait", "allions", "alliez", "allaient", "allant", "alle", "allee",
    "alles", "irai", "iras", "ira", "irons", "irez", "iront", "irais",
    "irait", "irions", "iriez", "iraient", "aille", "ailles", "aillent",
    "allai", "alla", "allames", "allerent",
):
    LEMMAS[_f] = "aller"

# Pouvoir
for _f in (
    "pouvoir", "peux", "peut", "pouvons", "pouvez", "peuvent", "pouvais",
    "pouvait", "pouvions", "pouviez", "pouvaient", "pouvant", "pourrai",
    "pourras", "pourra", "pourrons", "pourrez", "pourront", "pourrais",
    "pourrait", "pourrions", "pourriez", "pourraient", "puisse", "puisses",
    "puissent", "pu", "pus", "put", "purent",
):
    LEMMAS[_f] = "pouvoir"

# Vouloir
for _f in (
    "vouloir", "veux", "veut", "voulons", "voulez", "veulent", "voulais",
    "voulait", "voulions", "vouliez", "voulaient", "voulant", "voudrai",
    "voudras", "voudra", "voudrons", "voudrez", "voudront", "voudrais",
    "voudrait", "voudrions", "voudriez", "voudraient", "veuille",
    "veuilles", "veuillent", "voulu", "voulus", "voulut", "voulurent",
):
    LEMMAS[_f] = "vouloir"

# Devoir
for _f in (
    "devoir", "dois", "doit", "devons", "devez", "doivent", "devais",
    "devait", "devions", "deviez", "devaient", "devant", "devrai",
    "devras", "devra", "devrons", "devrez", "devront", "devrais",
    "devrait", "devrions", "devriez", "devraient", "doive", "doives",
    "du", "due", "dus", "dues", "dut", "durent",
):
    LEMMAS[_f] = "devoir"

# Dire
for _f in (
    "dire", "dis", "dit", "disons", "dites", "disent", "disais", "disait",
    "disions", "disiez", "disaient", "disant", "dirai", "diras", "dira",
    "dirons", "direz", "diront", "dirais", "dirait", "dirions", "diriez",
    "diraient", "dise", "dises", "disions", "disiez", "disent", "dits",
):
    LEMMAS[_f] = "dire"

# Voir
for _f in (
    "voir", "vois", "voit", "voyons", "voyez", "voient", "voyais",
    "voyait", "voyions", "voyiez", "voyaient", "voyant", "verrai",
    "verras", "verra", "verrons", "verrez", "verront", "verrais",
    "verrait", "verrions", "verriez", "verraient", "voie", "voies",
    "vu", "vue", "vus", "vues",
):
    LEMMAS[_f] = "voir"

# Savoir
for _f in (
    "savoir", "sais", "sait", "savons", "savez", "savent", "savais",
    "savait", "savions", "saviez", "savaient", "sachant", "saurai",
    "sauras", "saura", "saurons", "saurez", "sauront", "saurais",
    "saurait", "saurions", "sauriez", "sauraient", "sache", "saches",
    "sachions", "sachiez", "sachent", "su", "sue", "sus", "sues",
):
    LEMMAS[_f] = "savoir"

# Venir
for _f in (
    "venir", "viens", "vient", "venons", "venez", "viennent", "venais",
    "venait", "venions", "veniez", "venaient", "venant", "viendrai",
    "viendras", "viendra", "viendrons", "viendrez", "viendront",
    "viendrais", "viendrait", "viendrions", "viendriez", "viendraient",
    "vienne", "viennes", "viennent", "vins", "vint", "vinrent", "venu",
    "venue", "venus", "venues",
):
    LEMMAS[_f] = "venir"

# Prendre
for _f in (
    "prendre", "prends", "prend", "prenons", "prenez", "prennent",
    "prenais", "prenait", "prenions", "preniez", "prenaient", "prenant",
    "prendrai", "prendras", "prendra", "prendrons", "prendrez",
    "prendront", "prendrais", "prendrait", "prendrions", "prendriez",
    "prendraient", "prenne", "prennes", "prennent", "pris", "prise",
    "prises", "prit", "prirent",
):
    LEMMAS[_f] = "prendre"

# Mettre
for _f in (
    "mettre", "mets", "met", "mettons", "mettez", "mettent", "mettais",
    "mettait", "mettions", "mettiez", "mettaient", "mettant", "mettrai",
    "mettras", "mettra", "mettrons", "mettrez", "mettront", "mettrais",
    "mettrait", "mettrions", "mettriez", "mettraient", "mette", "mettes",
    "mettent", "mis", "mise", "mises", "mit", "mirent",
):
    LEMMAS[_f] = "mettre"

# Donner
for _f in (
    "donner", "donne", "donnes", "donnons", "donnez", "donnent",
    "donnais", "donnait", "donnions", "donniez", "donnaient", "donnant",
    "donnerai", "donneras", "donnera", "donnerons", "donnerez",
    "donneront", "donnerais", "donnerait", "donnerions", "donneriez",
    "donneraient", "donna", "donnerent", "donne", "donnee", "donnees",
):
    LEMMAS[_f] = "donner"

# Falloir
for _f in (
    "falloir", "faut", "fallait", "faudra", "faudrait", "fallu",
    "faille", "faudrai",
):
    LEMMAS[_f] = "falloir"

# Verbes courants du 1er groupe (formes les plus fréquentes)
for _base, _forms in {
    "parler": ("parle", "parles", "parlons", "parlez", "parlent", "parlait", "parlaient", "parlant", "parle", "parlee", "parlees"),
    "penser": ("pense", "penses", "pensons", "pensez", "pensent", "pensait", "pensaient", "pensant", "pense", "pensee", "pensees"),
    "trouver": ("trouve", "trouves", "trouvons", "trouvez", "trouvent", "trouvait", "trouvaient", "trouvant", "trouve", "trouvee", "trouvees"),
    "aimer": ("aime", "aimes", "aimons", "aimez", "aiment", "aimait", "aimaient", "aimant", "aime", "aimee", "aimees"),
    "passer": ("passe", "passes", "passons", "passez", "passent", "passait", "passaient", "passant", "passe", "passee", "passees"),
    "rester": ("reste", "restes", "restons", "restez", "restent", "restait", "restaient", "restant", "reste", "restee", "restees"),
    "partir": ("pars", "part", "partons", "partez", "partent", "partait", "partaient", "partant", "parti", "partie", "partis", "parties"),
    "arriver": ("arrive", "arrives", "arrivons", "arrivez", "arrivent", "arrivait", "arrivaient", "arrivant", "arrive", "arrivee", "arrivees"),
    "utiliser": ("utilise", "utilises", "utilisons", "utilisez", "utilisent", "utilisait", "utilisaient", "utilisant", "utilise", "utilisee", "utilisees"),
    "devenir": ("deviens", "devient", "devenons", "devenez", "deviennent", "devenait", "devenaient", "devenant", "devenu", "devenue", "devenus", "devenues"),
    "croire": ("crois", "croit", "croyons", "croyez", "croient", "croyait", "croyaient", "croyant", "cru", "crue", "crus", "crues"),
    "comprendre": ("comprends", "comprend", "comprenons", "comprenez", "comprennent", "comprenait", "comprenaient", "comprenant", "compris", "comprise", "comprises"),
    "suivre": ("suit", "suivons", "suivez", "suivent", "suivait", "suivaient", "suivant", "suivi", "suivie", "suivis", "suivies"),
    "tenir": ("tiens", "tient", "tenons", "tenez", "tiennent", "tenait", "tenaient", "tenant", "tenu", "tenue", "tenus", "tenues"),
    "recevoir": ("recois", "recoit", "recevons", "recevez", "recoivent", "recevait", "recevaient", "recevant", "recu", "recue", "recus", "recues"),
    "envoyer": ("envoie", "envoies", "envoyons", "envoyez", "envoient", "envoyait", "envoyaient", "envoyant", "envoye", "envoyee", "envoyees"),
    "offrir": ("offre", "offres", "offrons", "offrez", "offrent", "offrait", "offraient", "offrant", "offert", "offerte", "offerts", "offertes"),
    "produire": ("produis", "produit", "produisons", "produisez", "produisent", "produisait", "produisaient", "produisant", "produit", "produite", "produits", "produites"),
    "permettre": ("permets", "permet", "permettons", "permettez", "permettent", "permettait", "permettaient", "permettant", "permis", "permise", "permises"),
    "exister": ("existe", "existes", "existons", "existez", "existent", "existait", "existaient", "existant", "existe", "existee", "existent"),
}.items():
    LEMMAS[_base] = _base
    for _f in _forms:
        LEMMAS[_f] = _base


def strip_accents(text: str) -> str:
    """Minuscules sans accents (NFD puis suppression des diacritiques)."""
    text = unicodedata.normalize("NFD", text.lower())
    return "".join(c for c in text if unicodedata.category(c) != "Mn")


def lemmatize(form: str) -> str:
    """Lemme léger d'une forme : table de verbes, puis stemming pluriel."""
    key = strip_accents(form)
    if key in LEMMAS:
        return LEMMAS[key]
    # Les stopwords ne passent jamais par le stemming (évite « plus » -> « plu »).
    # (l'import STOPWORDS se fait en fin de module pour éviter une dépendance circulaire)
    if key in _STOPWORDS:
        return key
    # Pluriel simple en -s (amplificateurs -> amplificateur).
    if len(key) > 3 and key.endswith("s") and key[:-1] not in _STOPWORDS:
        return key[:-1]
    # Pluriel en -aux -> -al (chevaux -> cheval), garde simple.
    if len(key) > 4 and key.endswith("aux") and key[:-3] + "al" not in _STOPWORDS:
        return key[:-3] + "al"
    return key


# Import tardif : stopwords.py ne dépend pas de ce module, mais on évite tout
# ordre d'import fragile en le chargeant ici.
from stopwords import STOPWORDS as _STOPWORDS  # noqa: E402
