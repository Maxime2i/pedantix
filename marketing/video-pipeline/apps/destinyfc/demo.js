// Données de démonstration par défaut de la bibliothèque Destiny FC.
// Textes repris mot pour mot du jeu (destiny-eleven/src/game/data.js, src/i18n/strings.ts).
// Un script peut tout surcharger : "ecrans": { "<écran>": { … } } ou `donnees` d'une action.

export const NIVEAUX = { reg: ["Rég.", "regional"], d2: ["D2", "d2"], d1: ["D1", "d1"], elite: ["Élite", "elite"] };

// Postes : icône du jeu (setup) + nom.
export const POSTES = {
  attaquant: ["⚡", "Attaquant", "Vivre et mourir pour le but. Des chiffres qui bâtissent les légendes… et attirent les critiques dès qu'ils se tarissent."],
  milieu: ["🎩", "Milieu", "Le chef d'orchestre. Moins de buts, davantage de contrôle : c'est vous qui imposez le tempo du jeu."],
  defenseur: ["🛡️", "Défenseur", "L'art de l'ombre. Peu de gloire dans les statistiques, mais les grandes équipes se bâtissent par l'arrière."],
  gardien: ["🧤", "Gardien", "Seul contre tous. Un poste ingrat où toute une carrière tient à des réflexes et des nerfs d'acier."],
};

// Listes des feuilles de choix de l'écran « Crée ton joueur » (ordre de l'app).
export const FEUILLES = {
  nationalite: { titre: "Nationalité", options: [["france", "France"], ["allemagne", "Allemagne"], ["espagne", "Espagne"], ["italie", "Italie"], ["angleterre", "Angleterre"], ["bresil", "Brésil"], ["argentine", "Argentine"], ["pays-bas", "Pays-Bas"], ["portugal", "Portugal"]].map(([drapeau, titre]) => ({ drapeau, titre })) },
  poste: { titre: "Poste", options: Object.values(POSTES).map(([icone, titre, texte]) => ({ icone, titre, texte })) },
  origine: { titre: "Origine", options: [
    { icone: "🎓", titre: "Centre de formation traditionnel", texte: "Un cursus balisé, encadré et exigeant depuis le plus jeune âge." },
    { icone: "🏅", titre: "Fils de champion", texte: "Un patronyme qui ouvre les portes, et une pression qui ne vous lâche jamais." },
    { icone: "🧱", titre: "Quartier populaire", texte: "Tout appris dans la rue et sur les terrains vagues, à la dure." },
    { icone: "🥅", titre: "Prodige du futsal", texte: "Des pieds en or affûtés en salle. Reste à dompter le grand terrain." },
    { icone: "⏳", titre: "Éclos sur le tard", texte: "Personne ne misait un centime sur vous. Le physique et la hargne pour tout bagage." },
  ] },
  style: { titre: "Style de vie", options: [
    { icone: "🥗", titre: "Rigueur de pro", texte: "Au lit à 22h, régime au cordeau, aucun écart. Les partenaires ricanent, les recruteurs en raffolent." },
    { icone: "⚖️", titre: "Bien équilibré", texte: "Appliqué à l'entraînement, décontracté en dehors. Ni ascète, ni noceur." },
    { icone: "🎉", titre: "La grande vie", texte: "Les virées, la bande, les réseaux. Le talent s'occupera du reste… pas vrai ?" },
  ] },
  entourage: { titre: "Entourage", options: [
    { icone: "👨‍👩‍👧", titre: "Famille aux petits soins", texte: "Des parents omniprésents qui pilotent tout : contrats, scolarité, équilibre." },
    { icone: "💼", titre: "Agent affamé", texte: "Un jeune agent ambitieux jusqu'aux dents vous a repéré. Il jure de vous mener au sommet — et n'oublie pas sa commission." },
    { icone: "🤝", titre: "Les Gars du Quartier", texte: "Vos potes d'enfance vous collent aux basques. Fidèles, bruyants, ingérables." },
  ] },
};
export const CHAMPS = [["nationalite", "Nationalité"], ["poste", "Poste"], ["origine", "Origine"], ["style", "Style de vie"], ["entourage", "Entourage"]];

export const DEMO = {
  heure: "19:42",

  accueil: {
    jetons: 120, serie: 4, quetes: [1, 3], badges: [7, 47], carrieres: 3, meilleur: 214,
    reprendre: null, // { nom, age, club } → « Reprendre · nom »
    jour: "Samedi 10 octobre",
  },

  creation: {
    jetons: 120,
    nom: "", // vide → « Nouveau joueur »
    champs: {}, // { nationalite: "France", poste: "Milieu", … } (valeurs des listes FEUILLES)
    attributs: null, // { tec, phy, men, cha }
  },

  clubs: {
    potentiel: 4,
    liste: [
      { niveau: "reg", nom: "Grimsby", couleurs: ["#1b1b1b", "#f2f2f2"], pays: "angleterre", paysNom: "Angleterre" },
      { niveau: "reg", nom: "Bastia", couleurs: ["#1a4fb5", "#f2f2f2"], pays: "france", paysNom: "France" },
      { niveau: "d2", nom: "Sochaux", couleurs: ["#f5c400", "#1a4fb5"], pays: "france", paysNom: "France" },
      { niveau: "d2", nom: "Nantes", couleurs: ["#f5c400", "#1e8a3c"], pays: "france", paysNom: "France" },
      { niveau: "d1", nom: "Lens", couleurs: ["#e52a1e", "#f5c400"], pays: "france", paysNom: "France" },
      { niveau: "d1", nom: "Auxerre", couleurs: ["#1a4fb5", "#f2f2f2"], pays: "france", paysNom: "France" },
    ],
  },

  // Fiche de fin de carrière (FinalScreen / Panthéon → « Voir la fiche »).
  fiche: {
    carte: "Icône", couleur: "#E3C25A", statut: "Retraité", titre: "Star mondiale",
    nom: "Lucas Morel", pays: "france", paysNom: "France", poste: "Milieu",
    clubs: "Lyon · 2026–2045 · 19 saisons", score: 223, surnom: "Le nomade",
    trajectoire: "Révélation sur le tard", signature: "⚓ Sentinelle",
    recit: "Vous avez marqué votre époque et forcé le respect de tout un sport, bien au-delà des frontières de vos clubs.",
    stats: [["612", "Matchs"], ["108", "Buts"], ["225", "Passes"], ["74", "Caps"], ["88", "Peak"], ["96 M€", "Fortune"]],
    palmares: ["Championnats 7", "Coupes 4", "C1 2", "Mondial 0"],
    distinctions: ["Joueur d'Or 1", "Pied d'Or 0", "Titres indiv. 8"],
    discours: "« Quand il touchait le ballon, les papas réveillaient leurs enfants. »",
  },

  // Écran de jeu : en-tête du joueur + carte centrale (action `carte`).
  partie: {
    joueur: {
      nom: "Lucas Morel", pays: "france", age: 16, annee: 2026,
      niveau: "d2", club: "Sochaux", couleurs: ["#f5c400", "#1a4fb5"],
      poste: "milieu", note: 56, argent: "50 k€", etoiles: 1,
      jauges: { forme: 74, moral: 70, confiance: 58, pression: 30 },
    },
    carte: "croissance",
  },

  // Cartes prêtes à l'emploi (`carte` avec `id`), textes du jeu.
  cartes: {
    croissance: {
      genre: "evenement", tag: "📏 TERRAIN · 16 ANS",
      texte: "Huit centimètres gagnés en douze mois : votre corps file plus vite que votre football. Les appuis tâtonnent, et le staff médical plisse les yeux.",
      options: [{ texte: "Respecter le protocole de renforcement au millimètre" }, { texte: "Continuer à jouer et laisser le corps rattraper" }],
    },
    "croissance-ok": {
      genre: "resultat", tag: "📏 TERRAIN",
      texte: "Six mois de rigueur monacale… et un corps flambant neuf, plus robuste que jamais.",
      effets: ["+5 Physique", "+3 Discipline"],
    },
    "croissance-pubalgie": {
      genre: "resultat", tag: "📏 TERRAIN",
      texte: "Une pubalgie vous fauche au plus mauvais moment de la saison.",
      effets: ["-4 Moral", "🩹 8 semaines d'absence"],
    },
    bapteme: {
      genre: "evenement", tag: "🎤 VESTIAIRE · 16 ANS",
      texte: "Baptême du feu : juché sur une chaise face au vestiaire pro au complet, vous devez pousser la chansonnette. Les anciens battent déjà la mesure sur les tables.",
      options: [{ texte: "Chanter à tue-tête, faux mais crâne" }, { texte: "Refuser, tétanisé" }],
    },
    "bapteme-ok": {
      genre: "resultat", tag: "🎤 VESTIAIRE",
      texte: "Naufrage musical, carton social : le vestiaire vous adopte illico.",
      effets: ["+4 Charisme", "+6 Vestiaire"],
    },
    banc: {
      genre: "evenement", tag: "🪑 TERRAIN · 17 ANS",
      texte: "Un cadre international cadenasse votre place. « Patience, ça viendra », murmure le coach. Reste à savoir quand.",
      options: [{ indice: "Gonflé", texte: "Monter le ton dans le bureau du coach" }, { texte: "Vous nourrir de l'expérience du titulaire" }],
    },
    "banc-ok": {
      genre: "resultat", tag: "🪑 TERRAIN",
      texte: "Votre aplomb séduit : lancé d'entrée la semaine suivante, vous laissez une trace.",
      effets: ["+4 Technique", "+4 Mental", "+7 Réputation", "+6 Forme"],
    },
    bevue: {
      genre: "evenement", tag: "😖 TERRAIN · 17 ANS",
      treve: { libelle: "⏸ TRÊVE", stats: "7 matchs · ⚽ 2 · 🅰️ 2 · note 5.4", zone: ["Zone rouge", "bad"] },
      texte: "Votre bévue offre le but à l'adversaire. Le stade gronde, vos partenaires restent muets — et il faut encore tenir une heure avec ce poids sur le dos.",
      options: [{ texte: "Céder les coups de pied arrêtés à un partenaire" }, { texte: "Hausser le ton pour vous rattraper" }],
    },
    "bevue-ko": {
      genre: "resultat", tag: "😖 TERRAIN", ton: "bad",
      texte: "On vous range parmi les joueurs sans mental, et le coach l'a bien noté.",
      effets: ["-1 Réputation", "-6 Moral", "-7 Relation coach"],
    },
    finale: {
      genre: "moment", tag: "🎯 MOMENT DÉCISIF", titre: "Finale de la coupe nationale",
      texte: "Finale, 1-0 pour Sochaux, dix dernières minutes à n'en plus finir. Le coach vous somme de tuer le match — reste à trouver la manière.",
      options: [
        { indice: "Roublard", texte: "Faire mourir le ballon près du poteau de corner" },
        { indice: "Toro", texte: "Garder le ballon, passe après passe" },
        { texte: "Aller chercher le 2-0 pour sceller l'affaire" },
        { texte: "Casser le rythme à coups de fautes malines" },
      ],
    },
    "finale-gagnee": {
      genre: "resultat", tag: "🎯 FINALE DE LA COUPE NATIONALE", ton: "great",
      texte: "Le match s'éteint pile où vous l'aviez décidé : LA COUPE ! Le sale boulot forge aussi les légendes.",
      effets: ["+3 Réputation"],
    },
    "finale-perdue": {
      genre: "resultat", tag: "🎯 FINALE DE LA COUPE NATIONALE", ton: "bad",
      texte: "Le ballon vous file une fois de trop… égalisation, prolongation, débâcle. La coupe s'envole.",
      effets: [],
    },
    saison: {
      genre: "saison", tag: "📊 SAISON 2026-27 · SOCHAUX", niveau: "d2",
      une: "« Lucas Morel a changé de dimension cette année, point final »",
      stats: [["32", "Matchs"], ["6", "Buts"], ["9", "Passes déc."], ["7.4", "Note"]],
      lignes: ["Championnat : 2ᵉ", "✅ Objectif du club : Note de saison ≥ 6.5", "💰 +62 k€ (salaire & sponsors)"],
    },
    mercato: {
      genre: "mercato", tag: "🪟 MERCATO · 17 ANS",
      texte: "Votre nom commence à circuler sur le marché des transferts.",
      offres: [
        { niveau: "d1", club: "Lens", couleurs: ["#e52a1e", "#f5c400"], pays: "france", detail: "0,6 M€/an · indemnité 4,9 M€" },
        { niveau: "d1", club: "Brighton", couleurs: ["#1a4fb5", "#f2f2f2"], pays: "angleterre", detail: "1,1 M€/an · indemnité 10 M€" },
        { niveau: "d1", club: "Auxerre", couleurs: ["#1a4fb5", "#f2f2f2"], pays: "france", detail: "0,5 M€/an · indemnité 4,2 M€" },
      ],
      bouton: "RESTER / RECONDUIRE",
    },
    preparation: {
      genre: "preparation", tag: "🎯 PRÉPARATION · 18 ANS",
      texte: "Vos premiers vrais choix de préparation. À cet âge, tout est encore à modeler.",
      points: 6,
      postes: [["🏋️", "Entraînement", "Progresser sur vos facettes."], ["🎙️", "Médias", "Gagner en réputation… mais aussi en pression."], ["🛌", "Récupération", "Refaire le plein de forme et de résilience."], ["🤝", "Relations", "Renforcer coach, vestiaire, mentor et coéquipier."]],
      bouton: "Lancer la saison",
    },
  },
};

// ---------- Anglais (script : "langue": "en") ----------
// Textes officiels de la version anglaise de l'app (src/i18n/strings.ts > en, src/i18n/frEn.json, glossary.ts).
export const POSTES_EN = {
  attaquant: ["⚡", "Striker", "Live and die for the goal. Numbers that build legends… and draw the critics the moment they dry up."],
  milieu: ["🎩", "Midfielder", "The conductor. Fewer goals, more control: you're the one dictating the tempo of the game."],
  defenseur: ["🛡️", "Defender", "The art of the shadows. Little statistical glory, but great teams are built from the back."],
  gardien: ["🧤", "Goalkeeper", "Alone against everyone. A thankless job where a whole career hangs on reflexes and nerves of steel."],
};
export const FEUILLES_EN = {
  nationalite: { titre: "Nationality", options: [["france", "France"], ["allemagne", "Germany"], ["espagne", "Spain"], ["italie", "Italy"], ["angleterre", "England"], ["bresil", "Brazil"], ["argentine", "Argentina"], ["pays-bas", "Netherlands"], ["portugal", "Portugal"]].map(([drapeau, titre]) => ({ drapeau, titre })) },
  poste: { titre: "Position", options: Object.values(POSTES_EN).map(([icone, titre, texte]) => ({ icone, titre, texte })) },
  origine: { titre: "Origin", options: [
    { icone: "🎓", titre: "Traditional academy", texte: "A mapped-out path, supervised and demanding from the earliest age." },
    { icone: "🏅", titre: "Child of a pro", texte: "A surname that opens doors, and a pressure that never lets go of you." },
    { icone: "🧱", titre: "Working-class estate", texte: "Learned it all in the streets and on scrubland, the hard way." },
    { icone: "🥅", titre: "Futsal prodigy", texte: "Golden feet honed indoors. The full-size pitch is still to be tamed." },
    { icone: "⏳", titre: "Late bloomer", texte: "Nobody would bet a cent on you. Physique and grit as your only baggage." },
  ] },
  style: { titre: "Lifestyle", options: [
    { icone: "🥗", titre: "Pro habits", texte: "Lights out at 10pm, diet by the book, not one slip. Teammates snigger, scouts adore it." },
    { icone: "⚖️", titre: "Balanced", texte: "Diligent in training, easy-going off it. Neither monk nor party animal." },
    { icone: "🎉", titre: "The good life", texte: "The nights out, the crew, the socials. Talent will handle the rest… right?" },
  ] },
  entourage: { titre: "Inner circle", options: [
    { icone: "👨‍👩‍👧", titre: "Hands-on family", texte: "Ever-present parents who steer it all: contracts, schooling, balance." },
    { icone: "💼", titre: "Ambitious agent", texte: "A young agent, ambitious to the teeth, has spotted you. He swears he'll take you to the top — and won't forget his cut." },
    { icone: "🤝", titre: "The Old Crew", texte: "Your childhood pals stick to you everywhere. Loyal, loud, unmanageable." },
  ] },
};
export const CHAMPS_EN = [["nationalite", "Nationality"], ["poste", "Position"], ["origine", "Origin"], ["style", "Lifestyle"], ["entourage", "Inner circle"]];

// Noms de pays affichés en anglais.
export const PAYS_EN = { France: "France", Angleterre: "England", Allemagne: "Germany", Espagne: "Spain", Italie: "Italy", Brésil: "Brazil", Argentine: "Argentina", "Pays-Bas": "Netherlands", Portugal: "Portugal" };

// Surcharges de DEMO en anglais (fusionnées par-dessus).
export const DEMO_EN = {
  accueil: { jour: "Saturday, October 10" },
  // Version anglaise : joueur anglais (réservoir de noms « en » du jeu) et clubs anglais réels de data.js.
  clubs: {
    liste: [
      { niveau: "reg", nom: "Dover", couleurs: ["#f2f2f2", "#1b1b1b"], pays: "angleterre", paysNom: "England" },
      { niveau: "reg", nom: "Grimsby", couleurs: ["#1b1b1b", "#f2f2f2"], pays: "angleterre", paysNom: "England" },
      { niveau: "d2", nom: "Portsmouth", couleurs: ["#1a4fb5", "#f2f2f2"], pays: "angleterre", paysNom: "England" },
      { niveau: "d2", nom: "Wolf", couleurs: ["#f5c400", "#1b1b1b"], pays: "angleterre", paysNom: "England" },
      { niveau: "d1", nom: "Leeds", couleurs: ["#f2f2f2", "#f5c400"], pays: "angleterre", paysNom: "England" },
      { niveau: "d1", nom: "Brighton", couleurs: ["#1a4fb5", "#f2f2f2"], pays: "angleterre", paysNom: "England" },
    ],
  },
  verrouillage: { date: "Saturday, October 10" },
  fiche: {
    carte: "Icon", statut: "Retired", titre: "World star", nom: "Jack Turner", pays: "angleterre", paysNom: "England", clubs: "United · 2026–2045 · 19 seasons", poste: "Midfielder", surnom: "The nomad",
    trajectoire: "Late revelation", signature: "⚓ Sentinel",
    recit: "You defined an era and forced the respect of a whole sport, far beyond your clubs' borders.",
    stats: [["612", "Games"], ["108", "Goals"], ["225", "Assists"], ["74", "Caps"], ["88", "Peak"], ["€96m", "Fortune"]],
    palmares: ["League titles 7", "Cups 4", "UCL 2", "World Cup 0"],
    distinctions: ["Golden Player 1", "Golden Boot 0", "Individual 8"],
    discours: "\"When he touched the ball, dads woke their children.\"",
  },
  partie: { joueur: { nom: "Jack Turner", pays: "angleterre", club: "Portsmouth", couleurs: ["#1a4fb5", "#f2f2f2"], argent: "€50k" } },
  cartes: {
    croissance: { tag: "📏 PITCH · 16 YRS", texte: "Eight centimetres in twelve months: your body is outrunning your football. Your footing gropes for balance, and the medical staff squint with concern.",
      options: [{ texte: "Follow the strengthening protocol to the letter" }, { texte: "Keep playing and let the body catch up" }] },
    "croissance-ok": { tag: "📏 PITCH", texte: "Six months of monkish discipline… and a brand-new body, sturdier than ever.", effets: ["+5 Physical", "+3 Discipline"] },
    "croissance-pubalgie": { tag: "📏 PITCH", texte: "A groin strain cuts you down at the worst possible point of the season.", effets: ["-4 Morale", "🩹 8 weeks out"] },
    bapteme: { tag: "🎤 DRESSING ROOM · 16 YRS", texte: "Trial by fire: perched on a chair facing the entire pro dressing room, you have to sing. The seniors are already drumming the beat on the tables.",
      options: [{ texte: "Sing your heart out, off-key but bold" }, { texte: "Refuse, frozen stiff" }] },
    "bapteme-ok": { tag: "🎤 DRESSING ROOM", texte: "A musical shipwreck, a social smash: the dressing room adopts you on the spot.", effets: ["+4 Charisma", "+6 Dressing room"] },
    banc: { tag: "🪑 PITCH · 17 YRS", texte: "A capped veteran has your spot under lock and key. \"Patience, it'll come,\" the coach murmurs. The question is when.",
      options: [{ indice: "Cheeky", texte: "Raise your voice in the coach's office" }, { texte: "Feed off the starter's experience" }] },
    "banc-ok": { tag: "🪑 PITCH", texte: "Your nerve wins him over: thrown in from the start the next week, you leave a mark.", effets: ["+4 Technique", "+4 Mindset", "+7 Reputation", "+6 Form"] },
    bevue: { tag: "😖 PITCH · 17 YRS", treve: { libelle: "⏸ Winter break", stats: "7 apps · ⚽ 2 · 🅰️ 2 · rating 5.4", zone: ["Danger zone", "bad"] },
      texte: "Your slip hands the opposition their goal. The stadium rumbles, your teammates stay mute — and there's still an hour to survive with that weight on your back.",
      options: [{ texte: "Hand the set pieces to a teammate" }, { texte: "Crank up the intensity to make up for it" }] },
    "bevue-ko": { tag: "😖 PITCH", texte: "You get filed among the players with no bottle, and the coach has certainly noted it.", effets: ["-1 Reputation", "-6 Morale", "-7 Coach relationship"] },
    finale: { tag: "🎯 DECISIVE MOMENT", titre: "National Cup final", texte: "Final, 1-0 to Portsmouth, ten last minutes that never end. The coach screams at you to kill the game — how is up to you to work out.",
      options: [{ indice: "Sneaky", texte: "Take the ball to die by the corner flag" }, { indice: "Keep-ball", texte: "Hog the ball, pass after pass" }, { texte: "Go for 2-0 to seal it" }, { texte: "Chop the rhythm with crafty little fouls" }] },
    "finale-gagnee": { tag: "🎯 NATIONAL CUP FINAL", texte: "The match dies exactly where you decided: THE CUP! The dirty work builds legends too.", effets: ["+3 Reputation"] },
    "finale-perdue": { tag: "🎯 NATIONAL CUP FINAL", texte: "The ball slips away one time too many… equaliser, extra time, collapse. The cup is gone." },
    saison: { tag: "📊 SEASON 2026-27 · PORTSMOUTH", une: "\"Jack Turner has gone up a level this year, full stop\"",
      stats: [["32", "Games"], ["6", "Goals"], ["9", "Assists"], ["7.4", "Rating"]],
      lignes: ["League: 2nd", "✅ Club objective: Season rating ≥ 6.5", "💰 +€62k (wages & sponsors)"] },
    mercato: { tag: "🪟 TRANSFER WINDOW · 17 YRS", texte: "Your name is starting to circulate on the transfer market.", bouton: "STAY / RENEW",
      offres: [
        { niveau: "d1", club: "Leeds", couleurs: ["#f2f2f2", "#f5c400"], pays: "angleterre", detail: "€0.6m/yr · fee €4.9m" },
        { niveau: "d1", club: "Brighton", couleurs: ["#1a4fb5", "#f2f2f2"], pays: "angleterre", detail: "€1.1m/yr · fee €10m" },
        { niveau: "d1", club: "Everton", couleurs: ["#1a4fb5", "#f2f2f2"], pays: "angleterre", detail: "€0.5m/yr · fee €4.2m" },
      ] },
    preparation: { tag: "🎯 PRE-SEASON · AGE 18", texte: "Your first real preparation choices. At this age, everything is still to be shaped.", bouton: "Start the season",
      postes: [["🏋️", "Training", "Improve your facets."], ["🎙️", "Media", "Gain reputation… but also pressure."], ["🛌", "Recovery", "Top up your fitness and resilience."], ["🤝", "Relationships", "Strengthen coach, dressing room, mentor and teammate."]] },
  },
};
