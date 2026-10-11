// Validation d'un script avant la voix (étape 1) : ancres présentes dans leur
// scène, actions connues de la bibliothèque, index de cartes et écrans valides,
// nombre de mots compatible avec la durée cible (2,2 à 2,8 mots/s).
//   node pipeline/valider.mjs --projet <dossier>
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, loadProject } from "./lib.mjs";

const { script } = loadProject();
const norm = (w) => w.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
const erreurs = [];
const doc = script.app ? join(ROOT, "apps", script.app, "README.md") : null;
const actionsConnues = doc && existsSync(doc) ? new Set([...readFileSync(doc, "utf8").matchAll(/^\| `([a-zA-Z]+)`(?: \/ `([a-zA-Z]+)`)?/gm)].flatMap((m) => [m[1], m[2]]).filter(Boolean)) : null;
// Écrans : noms du tableau de la section « ## Écrans » de la doc de l'app.
const sectionEcrans = doc && existsSync(doc) ? (readFileSync(doc, "utf8").split(/^## Écrans/m)[1] ?? "").split(/^## /m)[0] : "";
const ecrans = new Set([...sectionEcrans.matchAll(/^\| `([a-zA-Z]+)`/gm)].map((m) => m[1]));
const nbCartes = (Array.isArray(script.cartes) ? script.cartes : script.carte ? [script.carte] : []).length;
// Cartes nommées (Destiny FC : `carte` avec `id`) : démo de l'app + cartes du script.
const demo = script.app && existsSync(join(ROOT, "apps", script.app, "demo.js")) ? await import(join(ROOT, "apps", script.app, "demo.js")) : {};
const cartesNommees = new Set([...Object.keys(demo.DEMO?.cartes ?? {}), ...(Array.isArray(script.cartes) ? [] : Object.keys(script.cartes ?? {}))]);
let mots = 0;
script.scenes.forEach((sc) => {
  const m = sc.voix.split(/\s+/).map(norm).filter(Boolean);
  mots += m.length;
  for (const a of [...(sc.actions ?? []), ...(sc.bruitages ?? [])]) {
    for (const w of [a.ancre, a.fin].filter(Boolean)) if (!m.includes(norm(w))) erreurs.push(`${sc.id} : ancre « ${w} » absente`);
    if (a.type && actionsConnues && !actionsConnues.has(a.type)) erreurs.push(`${sc.id} : action inconnue « ${a.type} »`);
    if (a.type === "carte" && a.index !== undefined && !(a.index >= 0 && a.index < nbCartes)) erreurs.push(`${sc.id} : carte ${a.index} hors de cartes[] (${nbCartes})`);
    if (a.type === "carte" && a.id !== undefined && !cartesNommees.has(a.id)) erreurs.push(`${sc.id} : carte « ${a.id} » inconnue`);
    if (a.type === "ecran" && ecrans.size && !ecrans.has(a.nom)) erreurs.push(`${sc.id} : écran inconnu « ${a.nom} »`);
  }
});
const cible = script.format.dureeCible;
const [min, max] = [Math.round(cible * 2.0), Math.round(cible * 2.8)];
if (mots < min || mots > max) erreurs.push(`${mots} mots pour ${cible} s (attendu ${min}–${max})`);
console.log(`${erreurs.length ? "❌" : "✅"} ${script.titre} — ${mots} mots${erreurs.length ? "\n   " + erreurs.join("\n   ") : ""}`);
if (erreurs.length) process.exitCode = 1;
