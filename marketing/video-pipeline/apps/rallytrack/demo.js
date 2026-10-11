// Données de démonstration par défaut des écrans RallyTrack. Épreuve et équipages
// FICTIFS mais au format exact de l'API (temps « 1:00:03.4 », écarts « +2:27.9 »,
// distances « 8,10 km »). Un script peut tout surcharger dans `ecrans.<nom>`,
// ou ponctuellement via `donnees` d'une action `ecran`. Pour une vidéo sur une
// vraie épreuve, reprendre les données réelles de l'API telles quelles.

// Codes Ionicons (police Ionicons.ttf de @expo/vector-icons).
export const IONICONS = {
  "flag": 62224, "flag-outline": 62225, "newspaper-outline": 62579, "trophy-outline": 62978, "heart-outline": 62327, "menu-outline": 62546,
  "time-outline": 62942, "calendar-outline": 61910, "search-outline": 62819, "ellipsis-vertical": 62164,
  "chevron-back": 61993, "chevron-up": 62017, "chevron-down": 62002, "chevron-forward": 62011,
  "notifications-outline": 62591, "notifications": 62581, "star-outline": 62873, "star": 62869,
  "filter-outline": 62213, "search": 62815, "car-sport-outline": 61925, "person-outline": 62636,
  "radio-outline": 62726, "podium-outline": 62693, "flash-outline": 62234, "medal-outline": 62534, "ribbon-outline": 62789,
  "close-circle-outline": 62028, "checkbox": 61978, "square-outline": 62867,
};

// Icônes Tabler (traits, viewBox 24) des cartes de l'aperçu.
export const TABLER = {
  clock: ["M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0", "M12 7v5l3 3"],
  flagCheck: ["M13.767 15.12a4.983 4.983 0 0 1 -1.767 -1.12a5 5 0 0 0 -7 0v-9a5 5 0 0 1 7 0a5 5 0 0 0 7 0v8.5", "M5 21v-7", "M15 19l2 2l4 -4"],
  mapPin: ["M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0", "M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0"],
  trophy: ["M8 21l8 0", "M12 17l0 4", "M7 4l10 0", "M17 4v8a5 5 0 0 1 -10 0v-8", "M3 9a2 2 0 1 0 4 0a2 2 0 1 0 -4 0", "M17 9a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"],
  bell: ["M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6", "M9 17v1a3 3 0 0 0 6 0v-1"],
  bellOff: ["M9.346 5.353c.21 -.129 .428 -.246 .654 -.353a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3m-1 3h-13a4 4 0 0 0 2 -3v-3a6.996 6.996 0 0 1 1.273 -3.707", "M9 17v1a3 3 0 0 0 6 0v-1", "M3 3l18 18"],
  calendar: ["M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12", "M16 3l0 4", "M8 3l0 4", "M4 11l16 0", "M8 15h2v2h-2l0 -2"],
  history: ["M12 8l0 4l2 2", "M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"],
  chevron: ["M9 6l6 6l-6 6"],
};

// Équipages : n° → { pilote, copilote, voiture, classe }.
const EQ = {
  1: ["Lucas Moreau", "Julie Garnier", "Škoda Fabia RS Rally2", "Rally2"],
  2: ["Thomas Brunet", "Antoine Lefèvre", "Citroën C3 Rally2", "Rally2"],
  3: ["Hugo Marchal", "Camille Perrin", "Hyundai i20 N Rally2", "Rally2"],
  4: ["Nicolas Faure", "Léa Roussel", "Škoda Fabia RS Rally2", "Rally2"],
  5: ["Quentin Girard", "Mathieu Barbier", "Alpine A110 Rally RGT", "RGT"],
  6: ["Romain Lacroix", "Pauline Mercier", "Citroën C3 Rally2", "Rally2"],
  7: ["Kevin Dumas", "Sarah Lambert", "Peugeot 208 Rally4", "Rally4"],
  8: ["Julien Roche", "Élodie Picard", "Renault Clio Rally4", "Rally4"],
  9: ["Damien Vidal", "Chloé Masson", "Peugeot 208 Rally4", "Rally4"],
};
export const equipage = (n) => { const e = EQ[n] ?? ["Pilote " + n, "Copilote", "Voiture", "Rally2"]; return { n: String(n), pilote: e[0], copilote: e[1], voiture: e[2], classe: e[3] }; };

export const DEMO = {
  heure: "15:42",
  accueil: {
    jours: ["mer. 7 oct", "jeu. 8 oct", "Hier", "Aujourd'hui", "Demain", "lun. 12 oct"],
    jour: 3,
    pays: [
      { drapeau: "🇫🇷", nom: "France", rallyes: [
        { id: "r-0", titre: "Rallye des Hautes Combes", heure: "08:35", live: true },
        { id: "r-1", titre: "Rallye des Hautes Combes VHC", heure: "08:20", live: true },
        { id: "r-2", titre: "Rallye Régional du Pays de Brière", heure: "09:12" },
      ] },
      { drapeau: "🇧🇪", nom: "Belgique", rallyes: [{ id: "r-3", titre: "Rallye des Ardennes Namuroises", heure: "10:05", live: true }] },
      { drapeau: "🇪🇸", nom: "Espagne", rallyes: [
        { id: "r-4", titre: "Rallysprint de Valdeorras", heure: "11:30" },
        { id: "r-5", titre: "Rally Costa Brava Sprint", heure: "—" },
      ] },
      { drapeau: "🇮🇹", nom: "Italie", rallyes: [{ id: "r-6", titre: "Rally delle Colline Senesi", heure: "09:00", live: true }] },
      { drapeau: "🇵🇹", nom: "Portugal", rallyes: [{ id: "r-7", titre: "Rali Serras do Norte", heure: "08:45" }] },
    ],
  },
  rallye: {
    nom: "Rallye des Hautes Combes",
    drapeau: "🇫🇷",
    ville: "Saint-Claude",
    dates: "10–11 oct. 2026",
    championnat: "Coupe de France des Rallyes",
    logo: "initiales", // "initiales", image (fichier de images/) ou null : pas de tuile (comme l'app sans logo eWRC)
    onglet: "apercu", // apercu | classement | speciales | engages
    situation: { live: true, vainqueur: null },
    partants: 112, classes: null,
    distance: "121,40 km", surface: "asphalte", nbES: 10,
    organisateur: "ASA Jura",
    // Classement : n° d'équipage dans l'ordre, temps, écarts au premier.
    classement: [
      { n: 1, temps: "38:12.6" },
      { n: 3, temps: "38:20.9", ecart: "+8.3" },
      { n: 2, temps: "38:24.1", ecart: "+11.5" },
      { n: 4, temps: "38:51.0", ecart: "+38.4" },
      { n: 6, temps: "39:30.7", ecart: "+1:18.1" },
      { n: 5, temps: "40:02.2", ecart: "+1:49.6" },
      { n: 7, temps: "41:15.8", ecart: "+3:03.2" },
      { n: 8, temps: "41:22.4", ecart: "+3:09.8" },
      { n: 9, temps: "41:40.3", ecart: "+3:27.7" },
    ],
    speciales: [
      { code: "1", nom: "Les Bouchoux 1", horaire: "sam. 10 oct., 08:35", km: "12,30 km", vainqueur: "L. Moreau", temps: "7:41.2" },
      { code: "2", nom: "Col de la Croix 1", horaire: "sam. 10 oct., 09:18", km: "8,75 km", vainqueur: "H. Marchal", temps: "5:12.8" },
      { code: "3", nom: "Lajoux 1", horaire: "sam. 10 oct., 10:02", km: "15,10 km", vainqueur: "L. Moreau", temps: "9:33.5" },
      { code: "4", nom: "Les Bouchoux 2", horaire: "sam. 10 oct., 13:40", km: "12,30 km", vainqueur: "T. Brunet", temps: "7:38.0" },
      { code: "5", nom: "Col de la Croix 2", horaire: "sam. 10 oct., 14:23", km: "8,75 km", arrives: 64 },
      { code: "6", nom: "Lajoux 2", horaire: "sam. 10 oct., 15:07", km: "15,10 km" },
    ],
  },
  // Feuille « classement d'une spéciale » (action feuille nom: "speciale").
  speciale: {
    code: "5", nom: "Col de la Croix 2", mode: "speciale",
    classement: [
      { n: 3, temps: "5:09.4" },
      { n: 1, temps: "5:10.1", ecart: "+0.7" },
      { n: 2, temps: "5:11.9", ecart: "+2.5" },
      { n: 4, temps: "5:14.6", ecart: "+5.2" },
      { n: 6, temps: "5:19.0", ecart: "+9.6" },
    ],
  },
  pilote: {
    nom: "Hugo Marchal", initiale: "H", drapeau: "🇫🇷",
    ligne: "Pilote · France · 31 ans", carriere: "2014 → 2026 · 96 départs",
    dernier: { date: "🇫🇷 19–20 sept. 2026", rallye: "Rallye Vosges Terre de Défis", voiture: "Hyundai i20 N Rally2", partenaire: "Camille Perrin", general: "P3", classe: "P2", nomClasse: "Rally2" },
    prochain: { date: "10 oct.", nom: "Rallye des Hautes Combes" },
    championnat: { annee: 2026, pos: "P2", pts: 85, nom: "Coupe de France des Rallyes" },
    chiffres: [["96", "Départs"], ["11", "Victoires"], ["34", "Podiums"], ["58", "ES gagnées"]],
    palmares: [["Champion régional Rhône-Alpes", "2023"], ["Vainqueur Rallye du Haut-Jura", "2022"]],
  },
  alertes: {
    nom: "Rallye des Hautes Combes", actif: true,
    choix: { veille: true, depart: true, final: true, esVictoire: false, esPodium: false, victoire: false, podium: false, abandon: false, actus: false },
  },
  verrouillage: { heure: "15:42", date: "samedi 10 octobre" },
};

// Libellés et icônes des alertes (notifications/alertTypes.ts).
export const ALERTES = [
  ["veille", "Rappel la veille (J-1)", "calendar-outline"],
  ["depart", "Départ en direct", "radio-outline"],
  ["final", "Classement final publié", "podium-outline"],
  ["esVictoire", "Victoire en spéciale", "flash-outline"],
  ["esPodium", "Podium en spéciale", "medal-outline"],
  ["victoire", "Victoire au général", "trophy-outline"],
  ["podium", "Podium au général", "ribbon-outline"],
  ["abandon", "Forfait ou abandon", "close-circle-outline"],
  ["actus", "Résumé quotidien des actus", "newspaper-outline"],
];
