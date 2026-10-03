"""Révélation par lemme, alignée sur l'original (pedantix.certitudes.org).

Une proposition P révèle un mot M de l'article si M == P (sans casse), ou si
P est un « parent » de M : son lemme (masculin singulier, infinitif) ou, pour
un féminin pluriel, son féminin singulier. Une forme fléchie ne révèle
qu'elle-même. Accents obligatoires : « etre » ne révèle pas « est ».

Observé sur l'original (jour nº1604) :
  le → le, la, l', les        la → la, l', les (pas « le »)
  un → un, une (pas « des »)   de → de, d', du, des     du → du, des
  à → à, au                    il → il, elle            ne → ne, n'
  se → se, s'                  ce → ce, c'              être → est, été
  avoir → a, ait, aurait, eu   pouvoir → peut, pu       autre → autres
  partie → parties             est → est (seul)         a → a (seul)

Les mots pleins viennent de data/lexicon.json (généré depuis Lexique 3.83 par
build_lexicon.py), les mots grammaticaux de CLOSED_CLASS ci-dessous.
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

# Forme → parents, pour les mots grammaticaux (et les élisions, tokenisées
# sans apostrophe : « l'arbre » → « l » + « ' » + « arbre »).
CLOSED_CLASS: dict[str, tuple[str, ...]] = {
    # Articles et contractions
    "la": ("le",), "les": ("le", "la"), "l": ("le", "la"),
    "une": ("un",),
    "d": ("de",), "du": ("de",), "des": ("de", "du"),
    "au": ("à",), "aux": ("à", "au"),
    # Pronoms personnels
    "elle": ("il",), "ils": ("il",), "elles": ("il", "elle"),
    "j": ("je",), "m": ("me",), "t": ("te",), "s": ("se", "si"),
    "n": ("ne",), "eux": ("lui",),
    # Démonstratifs
    "c": ("ce",), "cet": ("ce",), "cette": ("ce",), "ces": ("ce", "cette"),
    "ç": ("ça",),
    "celle": ("celui",), "ceux": ("celui",), "celles": ("celui", "celle"),
    # Possessifs
    "ma": ("mon",), "mes": ("mon", "ma"),
    "ta": ("ton",), "tes": ("ton", "ta"),
    "sa": ("son",), "ses": ("son", "sa"),
    "nos": ("notre",), "vos": ("votre",), "leurs": ("leur",),
    "mienne": ("mien",), "miens": ("mien",), "miennes": ("mien", "mienne"),
    "tienne": ("tien",), "tiens": ("tien",), "tiennes": ("tien", "tienne"),
    "sienne": ("sien",), "siens": ("sien",), "siennes": ("sien", "sienne"),
    # Relatifs / interrogatifs composés
    "laquelle": ("lequel",), "lesquels": ("lequel",),
    "lesquelles": ("lequel", "laquelle"),
    "auquel": ("lequel",), "auxquels": ("lequel", "auquel"),
    "auxquelles": ("lequel", "laquelle"), "duquel": ("lequel",),
    "desquels": ("lequel", "duquel"), "desquelles": ("lequel", "laquelle"),
    # Conjonctions / adverbes élidés
    "qu": ("que",), "jusqu": ("jusque",), "lorsqu": ("lorsque",),
    "puisqu": ("puisque",), "quoiqu": ("quoique",), "quelqu": ("quelque",),
    "presqu": ("presque",),
}

HERE = Path(__file__).resolve().parent
DATA_DIR = Path(os.environ.get("PEDANTIX_DATA_DIR", str(HERE / "data")))
LEXICON_PATH = DATA_DIR / "lexicon.json"


def _load_lexicon() -> dict[str, frozenset[str]]:
    lex: dict[str, frozenset[str]] = {}
    if LEXICON_PATH.is_file():
        with LEXICON_PATH.open(encoding="utf-8") as fh:
            lex = {form: frozenset(p) for form, p in json.load(fh).items()}
    else:
        print(
            f"Lexique absent ({LEXICON_PATH}) — seules les formes exactes et les "
            "mots grammaticaux sont regroupés. Lancez prepare_data.sh",
            file=sys.stderr,
        )
    for form, parents in CLOSED_CLASS.items():
        lex[form] = lex.get(form, frozenset()) | frozenset(parents)
    return lex


LEXICON = _load_lexicon()


def parents(form: str) -> frozenset[str]:
    """Propositions (en plus de la forme elle-même) qui révèlent `form`."""
    return LEXICON.get(form.lower(), frozenset())


def reveals(guess: str, form: str) -> bool:
    """La proposition `guess` (déjà en minuscules) révèle-t-elle `form` ?"""
    low = form.lower()
    return guess == low or guess in LEXICON.get(low, ())
