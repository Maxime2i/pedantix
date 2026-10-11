// Données de démonstration par défaut des écrans cultureFirst, cohérentes avec
// les captures des stores (série 23 jours, 12 / 8 / 34…). Un script peut tout
// surcharger dans `ecrans.<nom>`, ou ponctuellement via `donnees` d'une action `ecran`.

export const THEMES = {
  "Géographie": { couleur: "#4DB6A8", icone: 0xf2c3 },
  "Histoire": { couleur: "#C4785A", icone: 0xf5de },
  "Culture moderne": { couleur: "#E07A5F", icone: 0xf2ff },
  "Culture classique": { couleur: "#D4A574", icone: 0xf3b6 },
  "Culture générale": { couleur: "#E8C15A", icone: 0xf1c1 },
  "Animaux et Plantes": { couleur: "#7CB86A", icone: 0xf49a },
  "Sciences et Techniques": { couleur: "#6BA3C7", icone: 0xf320 },
  "Sport": { couleur: "#E09A3E", icone: 0xf32c },
};

export const DEMO = {
  date: "Jeudi 9 octobre",
  jour: "J",
  accueil: {
    serie: 23,
    compteurs: [12, 8, 34],
    etudiees: 18,
    themes: [
      { nom: "Géographie", decks: 4, cartes: 312, compteurs: [5, 3, 14] },
      { nom: "Histoire", decks: 3, cartes: 186, compteurs: [4, 2, 9] },
      { nom: "Culture moderne", decks: 2, cartes: 140, compteurs: [3, 2, 7] },
      { nom: "Culture classique", decks: 2, cartes: 98, compteurs: [0, 1, 4] },
    ],
  },
  catalogue: {
    recherche: "",
    resultats: [
      { titre: "Capitales du monde", theme: "Géographie", sousTheme: "Capitales", cartes: 197 },
      { titre: "Capitales européennes (1)", theme: "Géographie", sousTheme: "Capitales", cartes: 25 },
      { titre: "Capitales africaines", theme: "Géographie", sousTheme: "Capitales", cartes: 54 },
    ],
  },
  deck: {
    titre: "Capitales africaines",
    theme: "Géographie",
    sousTheme: "Capitales",
    cartes: 54,
    compteurs: [54, 0, 0],
    apercu: [["Maroc", "Rabat"], ["Nigeria", "Abuja"], ["Kenya", "Nairobi"], ["Sénégal", "Dakar"]],
  },
  stats: {
    serie: 23,
    record: 41,
    jours: ["V", "S", "D", "L", "M", "M", "J"],
    faits: 7,
    palier: 30,
    tuiles: [["46", "Cartes aujourd’hui"], ["91 %", "Réussite du jour"], ["88 %", "Rétention (30 j)"], ["14 h 32", "Temps d’étude total"]],
    activite: 0.78,
    themes: [
      { nom: "Géographie", acquises: 212, total: 312, reussite: 91 },
      { nom: "Histoire", acquises: 120, total: 186, reussite: 88 },
      { nom: "Culture moderne", acquises: 64, total: 140, reussite: 84 },
      { nom: "Culture classique", acquises: 41, total: 98, reussite: 86 },
    ],
  },
  onboarding: {
    etape: 0,
    themes: Object.keys(THEMES),
    choisis: [],
    rythme: 10,
    rappel: true,
  },
  springboard: {
    heure: "9:41",
    cartesDuJour: 46,
    serie: 23,
    resume: [12, 8, 26],
  },
  verrouillage: {
    heure: "20:00",
    date: "Jeudi 9 octobre",
  },
  finSeance: {
    cartes: 46,
    minutes: 6,
    serie: 23,
    palier: null,
    prochain: 30,
  },
  profil: {
    invite: true,
    pseudo: "Joueur",
    nouvelles: 10,
    revisions: 200,
    retention: 90,
    etapes: "1 min · 10 min",
    personnalise: false,
    rappel: true,
    alerte: true,
  },
  reviserPlus: {},
};

// Mur de cartes (format « mur ») : [type, valeur, réponse], faits vérifiés.
export const MUR_DEFAUT = [
  ["Capitale", "Yaren", "Nauru"], ["Traduction", "Auprès des ancêtres", "Ad patres"], ["Chanson", "C'est bon pour le moral", "La Compagnie créole"],
  ["Règne", "1715–1774", "Louis XV"], ["Femelle", "Laie", "Sanglier"], ["Sigle", "FAQ", "Foire aux questions"],
  ["Capitale", "Ottawa", "Canada"], ["Tableau", "La Joconde", "Léonard de Vinci"], ["Planète", "La plus chaude", "Vénus"],
  ["Fleuve", "Le plus long de France", "La Loire"], ["Roman", "Les Misérables", "Victor Hugo"], ["Date", "Prise de la Bastille", "1789"],
  ["Élément", "Au", "Or"], ["Animal", "Trois cœurs", "La pieuvre"], ["Capitale", "Canberra", "Australie"],
  ["Film", "Titanic", "James Cameron"], ["Mythologie", "Roi des dieux", "Zeus"], ["Sport", "Coupe du monde 1998", "France"],
  ["Océan", "Le plus grand", "Pacifique"], ["Locution", "Carpe diem", "Cueille le jour"], ["Désert", "Le plus grand", "Antarctique"],
  ["Corps humain", "206", "Os chez l'adulte"], ["Capitale", "Abuja", "Nigeria"], ["Chanson", "Voyage, voyage", "Desireless"],
];
