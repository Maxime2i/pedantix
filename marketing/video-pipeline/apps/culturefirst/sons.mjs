// Bruitages automatiques de cultureFirst, déduits des actions de la chronologie.
// Les sons sont synthétisés par pipeline/05-bruitages.mjs.
export function sonsAuto(actions) {
  const sfx = [];
  const s = (son, t, gain) => sfx.push({ son, t, gain });
  for (const a of actions) {
    switch (a.type) {
      case "reveler": s("clic", a.t - 0.12, 0.4); s("flip", a.t, 0.5); break;
      case "recto": case "carte": s("flip", a.t, 0.4); break;
      case "noter": case "choisir": s("clic", a.t, 0.4); if (a.type === "noter") s("pop", a.t + 0.05, 0.45); break;
      case "appui": s("clic", a.t, 0.45); break;
      case "ajouter": s("clic", a.t, 0.4); s("carillon", a.t + 0.1, 0.35); break;
      case "bulle": s("pop", a.t, 0.5); break;
      case "rate": s("erreur", a.t, 0.45); break;
      case "juste": s("carillon", a.t, 0.4); break;
      case "courbe": a.mode === "oubli" ? s("chute", a.t, 0.35) : s("whoosh", a.t - 0.15, 0.4); break;
      case "revision": s("carillon", a.t, 0.35); break;
      case "ancrage": if (a.t2) s("bip", a.t2, 0.4); break;
      case "ecran": case "feuille": case "titre": case "etape": s("whoosh", a.t - 0.1, 0.25); break;
      case "notif": s("notif", a.t, 0.5); break;
      case "tampon": s("tampon", a.t, 0.6); break;
      case "chiffre": s("defilement", a.t, 0.3); break;
      case "finSeance": s(a.donnees?.palier ? "victoire" : "carillon", a.t, 0.4); break;
      case "saisir": { const t2 = a.t2 ?? a.t + 0.08 * a.texte.length; for (let i = 0; i < a.texte.length; i++) s("clic", a.t + ((t2 - a.t) * i) / a.texte.length, 0.3); break; }
      case "chat": case "versus": s("whoosh", a.t - 0.1, 0.35); break;
      case "message": a.de === "lui" ? s("bip", a.t, 0.4) : s("pop", a.t, 0.45); break;
      case "messageCarte": s("pop", a.t, 0.5); s("carillon", a.t + 0.1, 0.3); break;
      case "reaction": s("pop", a.t, 0.35); break;
      case "verdict": s("carillon", a.t, 0.45); break;
      case "typo": case "monde": case "frise": case "mur": case "photo": case "rafale": s("whoosh", a.t - 0.1, 0.35); break;
      case "barrer": s("erreur", a.t, 0.45); break;
      case "corriger": case "devoiler": case "bonne": s("carillon", a.t, 0.4); break;
      case "jalon": case "epingle": case "surligner": s("pop", a.t, 0.4); break;
      case "ecart": case "question": s("bip", a.t, 0.35); break;
      case "silhouette": case "vue": s("whoosh", a.t, 0.25); break;
      case "piocher": s("whoosh", a.t, 0.35); s("pop", a.t + 0.35, 0.45); break;
      case "retourner": s("flip", a.t, 0.5); break;
      case "chrono": for (let k = 0; k < a.secondes; k++) s("bip", a.t + k, 0.3); break;
    }
  }
  return sfx;
}
