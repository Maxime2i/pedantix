// Script principal : enchaîne les étapes, avec reprise possible.
//   node pipeline/run.mjs --projet 01-declic                 tout
//   node pipeline/run.mjs --projet 01-declic --depuis rendu  à partir d'une étape
//   node pipeline/run.mjs --projet 01-declic --seulement montage
// L'étape 1 (concept et script) se fait en amont : script.json doit exister.
// L'étape 6 (animation) n'a rien à exécuter : la page HTML est rendue à l'étape 7.
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { ROOT, projectDir } from "./lib.mjs";

const ETAPES = [
  ["voix", "node", ["pipeline/02-voix.mjs"]],
  ["timings", "python3", ["pipeline/03-timings.py"]],
  ["images", "node", ["pipeline/04-images.mjs"]],
  ["bruitages", "node", ["pipeline/05-bruitages.mjs"]],
  ["rendu", "node", ["pipeline/07-rendu.mjs"]],
  ["montage", "node", ["pipeline/08-montage.mjs"]],
  ["controle", "node", ["pipeline/09-controle.mjs"]],
];

const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const projet = projectDir().split("/").at(-1);
const depuis = arg("--depuis");
const seulement = arg("--seulement");
const noms = ETAPES.map((e) => e[0]);
for (const n of [depuis, seulement].filter(Boolean)) if (!noms.includes(n)) throw new Error(`Étape inconnue « ${n} » (${noms.join(", ")})`);

const start = depuis ? noms.indexOf(depuis) : 0;
for (const [i, [nom, cmd, args]] of ETAPES.entries()) {
  if (seulement ? nom !== seulement : i < start) continue;
  console.log(`\n━━ ${nom} ━━`);
  execFileSync(cmd, [...args, "--projet", projet], { cwd: ROOT, stdio: "inherit" });
}
console.log(`\nTerminé : ${join("projets", projet, "output", "video-finale.mp4")}`);
