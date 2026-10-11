// Données de démo par défaut de Pédantix (surchargées par script.ecrans).
// Les titres de l'historique sont de vraies pages passées ; les coups sont ceux
// de l'avatar (personnage), jamais des statistiques de joueurs.
export const DEMO = {
  jeu: { date: "Mardi 7 octobre", heure: "12:04" },
  verrouillage: { heure: "12:00", date: "mardi 7 octobre" },
  historique: {
    stats: { jouees: 34, trouvees: 31, moyenne: 58 },
    lignes: [
      { titre: "Page du jour", date: "mar. 7 oct.", statut: "en cours" },
      { titre: "Donald Hebb", date: "lun. 6 oct.", coups: 74 },
      { titre: "Nouvelle-Angleterre", date: "dim. 5 oct.", coups: 41 },
      { titre: "Matériel informatique", date: "sam. 4 oct.", coups: 63 },
      { titre: "Imagerie médicale", date: "ven. 3 oct.", coups: 38 },
      { titre: "Jaïnisme", date: "jeu. 2 oct.", coups: 112 },
      { titre: "Passage de Drake", date: "mer. 1 oct.", coups: 29 },
      { titre: "Otorhinolaryngologie", date: "mar. 30 sept.", statut: "non trouvée" },
      { titre: "Échidné", date: "lun. 29 sept.", coups: 47 },
      { titre: "Casablanca", date: "dim. 28 sept.", coups: 22 },
    ],
  },
  reglages: { mode: "Auto", rappel: true },
};

// Palette de l'app en clair et en sombre (app/src/theme.ts).
export const THEMES = {
  clair: { bg: "#f6f1e7", card: "#fffdf6", text: "#3b3226", muted: "#7a6f5d", accent: "#c05621", accentDark: "#b3481a", tint: "#fbeeda", green: "#3e7c4f", fresh: "#c8efc0", border: "#e0d5bd", soft: "#e8dcc6", blank: "#241f1a", flashLen: "#5ad1ff" },
  sombre: { bg: "#1d1915", card: "#27211b", text: "#ece3d3", muted: "#a99c86", accent: "#e07a3f", accentDark: "#f08d52", tint: "#3a2a1d", green: "#7cc48d", fresh: "#2f5a37", border: "#463b2e", soft: "#3a3027", blank: "#0d0b09", flashLen: "#5ad1ff" },
};

// Poses de l'avatar (apps/pedantix/avatar/<pose>.png, copie de ~/.claude/avatars/maxime/poses).
export const POSES = ["neutre", "parle", "salut", "content", "choque", "reflechit", "panique", "fier", "montre-droite", "montre-gauche", "telephone", "clin", "decu", "celebre", "tete-main"];
