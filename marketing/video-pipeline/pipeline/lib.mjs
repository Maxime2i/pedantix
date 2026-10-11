// Outils communs aux étapes du pipeline : chemins du projet, lecture JSON,
// journal des coûts API.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Dossier du projet vidéo : argument `--projet <nom>` ou variable PROJET. */
export function projectDir() {
  const i = process.argv.indexOf("--projet");
  const name = i > 0 ? process.argv[i + 1] : process.env.PROJET;
  if (!name) throw new Error("Indiquez le projet : --projet 01-declic");
  const dir = join(ROOT, "projets", name);
  if (!existsSync(dir)) throw new Error(`Projet introuvable : ${dir}`);
  return dir;
}

export const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));
export function writeJson(p, data) {
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(data, null, 2) + "\n");
}

export function loadProject() {
  const dir = projectDir();
  const script = readJson(join(dir, "script.json"));
  const charte = readJson(join(ROOT, script.charte));
  return { dir, script, charte };
}

export function apiKey() {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY absente de l'environnement (voir README).");
  return key;
}

/** Ajoute une ligne au journal des coûts estimés du projet (output/couts.json). */
export function logCost(dir, etape, detail, dollars) {
  const p = join(dir, "output", "couts.json");
  const log = existsSync(p) ? readJson(p) : { lignes: [], total: 0 };
  log.lignes = log.lignes.filter((l) => l.etape !== etape);
  log.lignes.push({ etape, detail, dollars: Number(dollars.toFixed(5)), date: new Date().toISOString() });
  log.total = Number(log.lignes.reduce((s, l) => s + l.dollars, 0).toFixed(5));
  writeJson(p, log);
  console.log(`  coût estimé ${etape} : $${dollars.toFixed(4)} (total vidéo : $${log.total})`);
}

/** Texte complet de la voix off, scène par scène. */
export const fullText = (script) => script.scenes.map((s) => s.voix).join(" ");

/** Page d'animation : bibliothèque de l'app (apps/<app>/) ou page propre au projet (ancien format). */
export const animationPath = (dir, script) =>
  script.app ? `/apps/${script.app}/index.html?projet=${basename(dir)}` : `/projets/${basename(dir)}/animation/index.html`;

/** Bruitages automatiques propres à l'app (apps/<app>/sons.mjs), s'il y en a. */
export async function sonsApp(script, actions) {
  if (!script.app) return [];
  const p = join(ROOT, "apps", script.app, "sons.mjs");
  return existsSync(p) ? (await import(p)).sonsAuto(actions, script) : [];
}
