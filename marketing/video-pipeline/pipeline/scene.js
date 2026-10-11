// Moteur de scène générique, commun aux pages d'animation des apps
// (apps/<app>/index.html) : chargement du projet, charte, caméra, sous-titres,
// carte de fin, aperçu. Le module d'app ne fournit que l'écran et son état.
import { buildTimeline, lastAction } from "/pipeline/moteur.js";

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);
export const back = (x) => 1 + 2.2 * (x - 1) ** 3 + 1.2 * (x - 1) ** 2;
export const lerp = (a, b, p) => a + (b - a) * p;

/** Projet désigné par ?projet=<dossier> : script, timings, charte, chronologie. */
export async function chargerProjet() {
  const projet = new URLSearchParams(location.search).get("projet");
  if (!projet) throw new Error("Paramètre ?projet= manquant");
  const base = `/projets/${projet}/`;
  const [script, timings] = await Promise.all([fetch(base + "script.json").then((r) => r.json()), fetch(base + "timings.json").then((r) => r.json())]);
  const charte = await fetch("/" + script.charte).then((r) => r.json());
  return { projet, script, timings, charte, tl: buildTimeline(script, timings) };
}

/** Charte → variables CSS (--fond, --a-bg…), polices Google, logos (img[data-logo]). */
export function appliquerCharte(charte, stage) {
  const c = charte.couleurs;
  for (const [k, v] of Object.entries(c)) if (typeof v === "string") stage.style.setProperty(`--${k}`, v);
  for (const [k, v] of Object.entries(c.app ?? {})) stage.style.setProperty(`--a-${k}`, v);
  stage.style.setProperty("--titre", `"${charte.polices.titre}", Georgia, serif`);
  stage.style.setProperty("--texte", `"${charte.polices.texte}", -apple-system, sans-serif`);
  document.head.append(Object.assign(document.createElement("link"), { rel: "stylesheet", href: charte.polices.googleFonts }));
  document.querySelectorAll("img[data-logo]").forEach((img) => (img.src = "/" + charte.logo));
}

/**
 * Caméra : chaque action `zoom` (ou toute action listée dans `retour`) amène
 * le point (x, y) de la scène en (cx, cy) avec l'échelle s, en 0,6 s.
 */
export function camera(tl, t, cams, retour = []) {
  // `cams` : table de cibles nommées, ou fonction (action zoom) → cible.
  const resoudre = typeof cams === "function" ? cams : (a) => cams[a.cible];
  const repos = resoudre({ cible: "aucun" });
  let from = repos, to = repos, t0 = 0;
  const at = (p) => ({ s: lerp(from.s, to.s, p), x: lerp(from.x, to.x, p), y: lerp(from.y, to.y, p), cx: lerp(from.cx, to.cx, p), cy: lerp(from.cy, to.cy, p) });
  for (const a of tl.actions) {
    if (a.t > t) break;
    const target = a.type === "zoom" ? resoudre(a) : retour.includes(a.type) ? repos : null;
    if (target) { from = at(ease(clamp((a.t - t0) / 0.6))); to = target; t0 = a.t; }
  }
  return at(ease(clamp((t - t0) / 0.6)));
}
// Origine de transformation en (0, 0) : le point (x, y) arrive en (cx, cy).
export const transformCamera = (cam, decalageY = 0) => `translate(${cam.cx - cam.s * cam.x}px, ${cam.cy - cam.s * cam.y + decalageY}px) scale(${cam.s})`;

/** Sous-titres : groupes de 3 mots max, coupés à la ponctuation ; mot courant en .now. */
export function sousTitres(timings) {
  const groups = [];
  let cur = [];
  for (const m of timings.mots) { cur.push(m); if (cur.length === 3 || /[.!?…,]$/.test(m.texte)) { groups.push(cur); cur = []; } }
  if (cur.length) groups.push(cur);
  return (el, t) => {
    const gi = groups.findIndex((g, i) => t >= g[0].debut - 0.08 && t < (groups[i + 1]?.[0].debut ?? g.at(-1).fin + 0.6) - 0.02);
    if (gi < 0) { el.innerHTML = ""; return; }
    const g = groups[gi];
    const p = clamp((t - (g[0].debut - 0.08)) / 0.14);
    el.innerHTML = `<div class="grp" style="transform:scale(${0.86 + 0.14 * back(p)})">${g.map((m) => `<span class="${t >= m.debut && t < m.fin + 0.15 ? "now" : ""}">${m.texte}</span>`).join(" ")}</div>`;
  };
}

/** Carte de fin (#end) : fondu puis entrée échelonnée de ses enfants, sur l'action `fin`. */
export function carteFin(tl, end, t) {
  const fin = lastAction(tl, "fin", t);
  const pe = fin ? clamp((t - fin.t) / 0.5) : 0;
  end.style.opacity = pe;
  end.style.display = pe > 0 ? "flex" : "none";
  if (!fin) return;
  [...end.children].forEach((item, i) => {
    const q = back(clamp((t - fin.t - 0.15 - i * 0.12) / 0.45));
    item.style.transform = `translateY(${(1 - q) * 80}px) scale(${0.9 + 0.1 * q})`;
    item.style.opacity = clamp(q);
  });
}

/** Expose renderAt / duree / ready, et l'aperçu (?play, ?t=12.3). */
export async function demarrer(tl, renderAt) {
  window.renderAt = renderAt;
  window.duree = tl.duree;
  window.ready = (async () => { await document.fonts.ready; await new Promise((r) => setTimeout(r, 300)); await document.fonts.ready; renderAt(0); })();
  const q = new URLSearchParams(location.search);
  await window.ready;
  if (q.has("t")) renderAt(Number(q.get("t")));
  else if (q.has("play")) { const t0 = performance.now(); const loop = () => { renderAt(((performance.now() - t0) / 1000) % tl.duree); requestAnimationFrame(loop); }; loop(); }
}

export { lastAction };
