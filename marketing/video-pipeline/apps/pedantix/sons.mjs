// Bruitages automatiques de Pédantix, déduits des actions de la chronologie.
// Frappe, envoi, mot trouvé / proche / absent, victoire et accéléré sont déjà
// sonorisés par pipeline/moteur.js (à partir de script.page).
export function sonsAuto(actions) {
  const sfx = [];
  const s = (son, t, gain) => sfx.push({ son, t, gain });
  for (const a of actions) {
    switch (a.type) {
      case "pose": s("pop", a.t, 0.18); break;
      case "disposition": case "ecran": case "titre": case "liste": case "voirPage": s("whoosh", a.t - 0.1, 0.28); break;
      case "point": case "bulle": case "partage": s("pop", a.t, 0.45); break;
      case "case": case "appui": case "reglage": s("clic", a.t, 0.45); break;
      case "devoiler": s("victoire", a.t, 0.5); break;
      case "notif": s("notif", a.t, 0.5); break;
      case "tampon": s("tampon", a.t, 0.6); break;
      case "chiffre": s("defilement", a.t, 0.3); break;
      case "chrono": for (let k = 0; k < a.secondes; k++) s("bip", a.t + k, 0.3); s("carillon", a.t + a.secondes, 0.4); break;
    }
  }
  return sfx;
}
