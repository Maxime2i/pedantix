// Timings factices (≈ 2,5 mots/s) pour prévisualiser une animation avant de
// payer la voix : node pipeline/timings-factices.mjs --projet <dossier>
// N'écrase jamais un timings.json issu de Whisper (sauf --force).
import { existsSync } from "node:fs";
import { join } from "node:path";
import { loadProject, readJson, writeJson } from "./lib.mjs";

const { dir, script } = loadProject();
const out = join(dir, "timings.json");
if (existsSync(out) && !readJson(out).factice && !process.argv.includes("--force")) throw new Error("timings.json réel présent (utiliser --force)");
const mots = [];
let t = 0.3;
script.scenes.forEach((sc, si) => {
  for (const brut of sc.voix.split(/\s+/).filter(Boolean)) {
    const coeur = brut.match(/[\p{L}\p{N}’'-]+/gu)?.join("") ?? "";
    if (!coeur) { mots.at(-1).texte += " " + brut; continue; }
    const d = 0.18 + 0.045 * coeur.length;
    mots.push({ texte: brut, mot: coeur, scene: si, debut: +t.toFixed(3), fin: +(t + d).toFixed(3) });
    t += d + (/[.!?…]$/.test(brut) ? 0.35 : /,$/.test(brut) ? 0.15 : 0.04);
  }
  t += 0.15;
});
const scenes = script.scenes.map((sc, si) => { const ms = mots.filter((m) => m.scene === si); return { id: sc.id, debut: ms[0].debut, finVoix: ms.at(-1).fin }; });
scenes.forEach((s, i) => (s.fin = scenes[i + 1]?.debut ?? +(s.finVoix + 1.8).toFixed(3)));
writeJson(out, { factice: true, duree: scenes.at(-1).fin, dureeVoix: mots.at(-1).fin, scenes, mots });
console.log(`→ timings factices : ${scenes.at(-1).fin.toFixed(1)} s, ${mots.length} mots`);
