// Bruitages automatiques de Destiny FC, déduits des actions de la chronologie.
// Les sons sont synthétisés par pipeline/05-bruitages.mjs.
export function sonsAuto(actions) {
  const sfx = [];
  const s = (son, t, gain) => sfx.push({ son, t, gain });
  for (const a of actions) {
    switch (a.type) {
      case "appui": case "continuer": case "repartir": s("clic", a.t, 0.45); break;
      case "option": s("clic", a.t, 0.45); s("pop", a.t + 0.05, 0.3); break;
      case "feuille": s("clic", a.t, 0.4); s("whoosh", a.t + 0.05, 0.2); break;
      case "choisir": s("clic", a.t, 0.4); s("pop", a.t + 0.05, 0.35); break;
      case "aleatoire": s("clic", a.t, 0.45); s("defilement", a.t + 0.2, 0.3); break;
      case "attributs": s("defilement", a.t, 0.25); break;
      case "ecran": case "titre": case "liste": case "frise": case "disposition": s("whoosh", a.t - 0.1, 0.25); break;
      case "carte": s("flip", a.t, 0.3); break;
      case "joueur": case "jauges": s("bip", a.t + 0.1, 0.3); break;
      case "notif": s("notif", a.t, 0.5); break;
      case "bulle": s("pop", a.t, 0.5); break;
      case "point": case "etape": s("pop", a.t, 0.4); break;
      case "pose": s("pop", a.t, 0.15); break;
      case "chiffre": s("defilement", a.t, 0.3); break;
      case "tableau": s("sifflet", a.t, 0.35); break;
      case "but": s("foule", a.t, 0.55); s("victoire", a.t + 0.1, 0.3); break;
      case "typo": s("whoosh", a.t - 0.1, 0.35); break;
      case "tampon": s("tampon", a.t, 0.6); break;
      case "entree": s("whoosh", a.t - 0.2, 0.35); break;
    }
  }
  return sfx;
}
