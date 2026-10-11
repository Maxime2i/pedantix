// Bruitages automatiques de RallyTrack, déduits des actions de la chronologie.
// Les sons sont synthétisés par pipeline/05-bruitages.mjs.
export function sonsAuto(actions) {
  const sfx = [];
  const s = (son, t, gain) => sfx.push({ son, t, gain });
  for (const a of actions) {
    switch (a.type) {
      case "appui": case "onglet": case "favori": case "editions": s("clic", a.t, 0.45); break;
      case "cloche": s("clic", a.t, 0.45); if (a.etat !== false) s("carillon", a.t + 0.08, 0.3); break;
      case "choisir": s("clic", a.t, 0.4); s("pop", a.t + 0.05, 0.35); break;
      case "ecran": case "feuille": case "titre": case "liste": case "disposition": s("whoosh", a.t - 0.1, 0.25); break;
      case "fermer": s("whoosh", a.t - 0.05, 0.2); break;
      case "segment": s("clic", a.t, 0.35); break;
      case "maj": s("defilement", a.t, 0.3); s("bip", a.t + 0.75, 0.35); break;
      case "surligner": s("pop", a.t, 0.35); break;
      case "notif": s("notif", a.t, 0.5); break;
      case "bulle": s("pop", a.t, 0.5); break;
      case "point": s("pop", a.t, 0.4); break;
      case "pose": s("pop", a.t, 0.15); break;
      case "chiffre": s("defilement", a.t, 0.3); break;
      case "chrono": s("tictac", a.t, 0.3); break;
      case "arreter": s("bip", a.t, 0.5); s("carillon", a.t + 0.06, 0.35); break;
      case "typo": s("whoosh", a.t - 0.1, 0.35); break;
      case "tampon": s("tampon", a.t, 0.6); break;
      case "entree": s("moteur", a.t - 0.2, 0.35); break;
    }
  }
  return sfx;
}
