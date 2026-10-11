// Étape 5 — Bruitages, synthétisés en local avec ffmpeg (gratuit, reproductible).
// OpenRouter ne propose pas de générateur d'effets sonores ; pour des sons plus
// « produits », déposer ses propres fichiers dans audio/sfx/ avec les mêmes noms.
// Sortie : audio/sfx/<nom>.wav
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { loadProject, logCost } from "./lib.mjs";

const { dir } = loadProject();
const out = join(dir, "audio", "sfx");
mkdirSync(out, { recursive: true });
const force = process.argv.includes("--force");

// Expressions aevalsrc (t en secondes) : enveloppes exponentielles simples.
const SONS = {
  // Frappe de touche : bruit très court, filtré.
  clic: { d: 0.04, expr: "(random(0)*2-1)*exp(-t*160)*0.6", filtre: "highpass=f=2500" },
  // Envoi : petit « pop » tonal descendant.
  pop: { d: 0.14, expr: "sin(2*PI*(700-1500*t)*t)*exp(-t*28)*0.7" },
  // Mot trouvé : deux notes claires.
  carillon: { d: 0.7, expr: "(sin(2*PI*988*t)+0.6*sin(2*PI*1480*t)*gt(t,0.09))*exp(-t*6)*0.35" },
  // Mot proche : note brève plus grave.
  bip: { d: 0.18, expr: "sin(2*PI*560*t)*exp(-t*22)*0.45" },
  // Transition : souffle filtré avec montée/descente.
  whoosh: { d: 0.55, expr: "(random(0)*2-1)*sin(PI*t/0.55)^2*0.5", filtre: "bandpass=f=1400:width_type=o:w=2,lowpass=f=5000" },
  // Victoire : arpège do-mi-sol-do.
  victoire: {
    d: 1.1,
    expr: "(sin(2*PI*523*t)*between(t,0,0.13)+sin(2*PI*659*t)*between(t,0.12,0.25)+sin(2*PI*784*t)*between(t,0.24,0.37)+sin(2*PI*1047*t)*gte(t,0.36)*exp(-(t-0.36)*3))*0.35",
  },
  // Accéléré : défilement rapide de clics.
  defilement: { d: 0.9, expr: "(random(0)*2-1)*lt(mod(t,0.045),0.008)*0.5", filtre: "highpass=f=3000" },
  // Réflexion : tic-tac d'horloge (notes alternées).
  tictac: { d: 1.2, expr: "sin(2*PI*(1700+500*lt(mod(t,0.6),0.3))*t)*exp(-mod(t,0.3)*90)*0.4" },
  // Carte retournée : bruissement bref.
  flip: { d: 0.18, expr: "(random(0)*2-1)*sin(PI*t/0.18)^2*0.6", filtre: "bandpass=f=2500:width_type=o:w=2" },
  // Mauvaise réponse : deux notes graves descendantes.
  erreur: { d: 0.45, expr: "(sin(2*PI*330*t)*lt(t,0.16)+sin(2*PI*247*t)*gte(t,0.16))*exp(-t*4)*0.4" },
  // Oubli : glissando descendant.
  chute: { d: 1.3, expr: "sin(2*PI*(900*t-280*t*t))*exp(-t*1.6)*0.3" },
  // Notification : deux notes douces montantes.
  notif: { d: 0.6, expr: "(sin(2*PI*1319*t)*lt(t,0.12)+sin(2*PI*1760*t)*gte(t,0.12))*exp(-mod(t,0.12)*6)*exp(-t*3)*0.4" },
  // Voiture de rallye qui passe : moteur (harmoniques, régime qui chute) + souffle, en cloche.
  moteur: { d: 1.4, expr: "(sin(2*PI*(170*t-30*t*t))+0.6*sin(4*PI*(170*t-30*t*t))+0.35*sin(6*PI*(170*t-30*t*t))+0.25*(random(0)*2-1))*sin(PI*t/1.4)^2*0.32", filtre: "lowpass=f=2200" },
  // Sifflet d'arbitre : note aiguë avec trille rapide (bille du sifflet).
  sifflet: { d: 0.7, expr: "sin(2*PI*2650*t+0.8*sin(2*PI*38*t))*(0.75+0.25*sin(2*PI*38*t))*min(1,t*40)*min(1,(0.7-t)*12)*0.35", filtre: "highpass=f=1200" },
  // Clameur de foule (but) : souffle large qui enfle puis retombe.
  foule: { d: 2.2, expr: "(random(0)*2-1)*(1-exp(-t*5))*exp(-max(0,t-0.6)*1.6)*0.6", filtre: "bandpass=f=900:width_type=o:w=2.5,lowpass=f=3500" },
  // Tampon : coup sourd.
  tampon: { d: 0.35, expr: "(sin(2*PI*(120-150*t)*t)*0.8+(random(0)*2-1)*0.3*exp(-t*60))*exp(-t*12)*0.7" },
};

for (const [nom, s] of Object.entries(SONS)) {
  const file = join(out, `${nom}.wav`);
  if (existsSync(file) && !force) continue;
  const args = ["-y", "-loglevel", "error", "-f", "lavfi", "-i", `aevalsrc='${s.expr}':s=44100:d=${s.d}`];
  if (s.filtre) args.push("-af", s.filtre);
  execFileSync("ffmpeg", [...args, "-ac", "1", file]);
  console.log(`→ ${file}`);
}
logCost(dir, "bruitages", "synthèse locale ffmpeg", 0);
