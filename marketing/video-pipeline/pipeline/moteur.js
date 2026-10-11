// Moteur de chronologie, partagé par l'animation (navigateur) et le montage (Node).
// À partir du script et des timings, calcule les actions datées et les
// bruitages : aucun timing n'est codé en dur, tout part des mots de la voix.

const norm = (w) =>
  w.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

/** Instant d'un mot d'ancrage dans une scène (premier mot qui correspond). */
function anchorTime(timings, sceneIndex, word, position = "debut") {
  const mots = timings.mots.filter((m) => m.scene === sceneIndex);
  const m = mots.find((x) => norm(x.mot) === norm(word));
  if (!m) throw new Error(`Ancre « ${word} » introuvable dans la scène ${sceneIndex + 1}`);
  return position === "fin" ? m.fin : m.debut;
}

/**
 * Chronologie : actions triées ({type, t, t2?, ...}) et repères de bruitages
 * ({son, t, gain}). Les frappes génèrent des clics, les envois un pop, etc.
 */
export function buildTimeline(script, timings) {
  const actions = [];
  const sfx = [];
  script.scenes.forEach((scene, si) => {
    for (const a of scene.actions ?? []) {
      const t = anchorTime(timings, si, a.ancre, a.position);
      let t2 = a.fin ? anchorTime(timings, si, a.fin, "fin") : a.duree ? t + a.duree : undefined;
      if (a.type === "taper" && t2 === undefined) t2 = t + 0.1 * a.mot.length;
      actions.push({ ...a, t, t2, scene: si });
    }
    for (const b of scene.bruitages ?? []) {
      sfx.push({ son: b.son, t: Math.max(0, anchorTime(timings, si, b.ancre) - 0.15), gain: b.gain ?? 0.6 });
    }
  });
  actions.sort((a, b) => a.t - b.t);
  for (const a of actions) {
    if (a.type === "taper") {
      for (let i = 0; i < a.mot.length; i++) sfx.push({ son: "clic", t: a.t + ((a.t2 - a.t) * i) / a.mot.length, gain: 0.35 });
    } else if (a.type === "accelere") {
      sfx.push({ son: "defilement", t: a.t, gain: 0.3 });
    } else if (a.type === "resultat") {
      sfx.push({ son: "whoosh", t: a.t - 0.2, gain: 0.5 });
    }
  }
  // Envois : pop, puis carillon (trouvé), bip (proche) ou arpège (titre complet).
  const page = script.page;
  if (page) {
    for (const a of actions.filter((x) => x.type === "envoyer")) {
      sfx.push({ son: "pop", t: a.t, gain: 0.5 });
      const after = gameState({ actions }, page, a.t + 1e-3);
      const before = gameState({ actions }, page, a.t - 1e-3);
      if (after.won && !before.won) sfx.push({ son: "victoire", t: a.t + 0.08, gain: 0.55 });
      else if (page.proches[a.mot]) sfx.push({ son: "bip", t: a.t + 0.06, gain: 0.5 });
      else if (page.revelations[a.mot]?.length === 0) sfx.push({ son: "erreur", t: a.t + 0.06, gain: 0.4 });
      else sfx.push({ son: "carillon", t: a.t + 0.06, gain: 0.45 });
    }
  }
  sfx.sort((a, b) => a.t - b.t);
  return { duree: timings.duree, actions, sfx };
}

/**
 * Partie de démonstration : quels mots de la page sont révélés, proches, ou
 * mis en avant à l'instant t. `page` = { titre, texte, ... }.
 */
export function gameState(timeline, page, t) {
  const found = new Set(page.dejaTrouves ?? []);
  const close = {}; // mot caché → [proposition, score]
  let fresh = null;
  let freshClose = null;
  let essais = page.essaisDepart ?? 0;
  let lastGuess = null;
  let typing = "";
  let won = false;
  let acceleration = null;

  for (const a of timeline.actions) {
    if (a.t > t) break;
    if (a.type === "taper") {
      const p = Math.min(1, (t - a.t) / Math.max(0.01, a.t2 - a.t));
      typing = a.mot.slice(0, Math.ceil(p * a.mot.length));
    } else if (a.type === "envoyer") {
      typing = "";
      essais++;
      const g = a.mot;
      const hits = page.revelations[g] ?? [g];
      const prox = page.proches[g];
      fresh = freshClose = null;
      if (prox) {
        for (const cible of prox.cibles) close[cible] = [g, prox.score];
        freshClose = { mot: g, cibles: prox.cibles, t: a.t, score: prox.score };
        lastGuess = { mot: g, kind: "close", score: prox.score, t: a.t };
      } else {
        hits.forEach((h) => found.add(h));
        fresh = { mots: hits, t: a.t };
        lastGuess = { mot: g, kind: "found", n: page.occurrences?.[g] ?? hits.length, t: a.t };
      }
      if (page.titreMots.every((m) => found.has(m))) won = true;
    } else if (a.type === "accelere") {
      const p = Math.min(1, (t - a.t) / Math.max(0.01, a.t2 - a.t));
      const pool = page.accelere ?? [];
      pool.slice(0, Math.round(p * pool.length)).forEach((w) => found.add(w));
      essais += Math.round(p * (a.essais ?? 0));
      if (p < 1) acceleration = p;
    }
  }
  return { found, close, fresh, freshClose, essais, lastGuess, typing, won, acceleration };
}

/** Dernière action d'un type déjà commencée à l'instant t. */
export function lastAction(timeline, type, t) {
  let last = null;
  for (const a of timeline.actions) if (a.type === type && a.t <= t) last = a;
  return last;
}

export { norm };
