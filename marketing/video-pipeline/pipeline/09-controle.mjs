// Étape 9 — Contrôle qualité : durée, synchro, orthographe des sous-titres,
// zones de sécurité, volume ; captures clés + planche d'aperçu.
// Sortie : output/controle.json, output/apercu-XX.jpg, output/planche.jpg
import { execFileSync } from "node:child_process";
import { basename, join } from "node:path";
import puppeteer from "puppeteer-core";
import { animationPath, fullText, loadProject, readJson, writeJson } from "./lib.mjs";
import { serve } from "./serveur.mjs";

const { dir, script } = loadProject();
const timings = readJson(join(dir, "timings.json"));
const video = join(dir, "output", "video-finale.mp4");
const { largeur: W, hauteur: H } = script.format;
const checks = [];
const check = (nom, ok, detail) => { checks.push({ nom, ok, detail }); console.log(`${ok ? "✅" : "❌"} ${nom} — ${detail}`); };
const probe = (args) => execFileSync("ffprobe", ["-v", "error", ...args, video]).toString().trim();

// Durée.
const duree = Number(probe(["-show_entries", "format=duration", "-of", "csv=p=0"]));
const cible = script.format.dureeCible;
check("Durée", duree >= 15 && duree <= 60 && Math.abs(duree - cible) <= 8, `${duree.toFixed(1)} s (cible ${cible} s, plage 15–60 s)`);

// Synchro : la vidéo couvre toute la voix, sans trou de plus de 3 s à la fin.
const voix = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", join(dir, "audio", "voix.wav")]).toString());
check("Synchro voix / images", duree >= timings.dureeVoix && duree - voix < 3, `voix ${voix.toFixed(1)} s, dernier mot à ${timings.mots.at(-1).fin.toFixed(1)} s, vidéo ${duree.toFixed(1)} s`);

// Orthographe des sous-titres : ils doivent reprendre exactement le texte du script.
const sous = timings.mots.map((m) => m.texte).join(" ").replace(/\s+/g, " ");
const ref = fullText(script).replace(/\s+/g, " ");
check("Sous-titres = script", sous === ref, sous === ref ? `${timings.mots.length} mots identiques au script` : `écart : « ${sous} » ≠ « ${ref} »`);

// Volume : intensité intégrée et crête.
const stats = execFileSync("sh", ["-c", `ffmpeg -hide_banner -nostats -i "${video}" -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary/,$p'`]).toString();
const lufs = Number(/I:\s+(-?[\d.]+) LUFS/.exec(stats)?.[1]);
const peak = Number(/Peak:\s+(-?[\d.]+) dBFS/.exec(stats)?.[1]);
check("Volume", Math.abs(lufs + 14) <= 1.5 && peak <= -0.5, `${lufs} LUFS (cible -14), crête ${peak} dBFS`);

// Zones de sécurité (TikTok / Reels / Shorts) : textes hors des 160 px du haut,
// 380 px du bas (légende, boutons) et 140 px de droite (boutons d'action).
const SAFE = { top: 160, bottom: H - 380, left: 60, right: W - 140 };
const server = await serve();
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const horsCadre = [];
try {
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H });
  await page.goto(`http://127.0.0.1:${server.address().port}${animationPath(dir, script)}`, { waitUntil: "networkidle0" });
  await page.evaluate(() => window.ready);
  for (let t = 0; t < duree; t += 0.25) {
    const boxes = await page.evaluate((t) => {
      window.renderAt(t);
      const sel = ["#subs .grp", "#brand img", "#brand span", "#ff", "#end h1", "#end p", "#end .pill", "#end .detail", "[data-texte]"];
      return sel.flatMap((s) => [...document.querySelectorAll(s)].map((el) => {
        const r = el.getBoundingClientRect();
        const visible = getComputedStyle(el).opacity !== "0" && r.width > 0 && el.offsetParent !== null && Number(getComputedStyle(el.closest("#end") ?? el).opacity) > 0.5;
        return { s, visible, top: r.top, bottom: r.bottom, left: r.left, right: r.right };
      }));
    }, t);
    for (const b of boxes.filter((b) => b.visible)) {
      if (b.top < SAFE.top || b.bottom > SAFE.bottom || b.left < SAFE.left || b.right > SAFE.right) horsCadre.push(`${b.s} à ${t.toFixed(2)} s`);
    }
  }
} finally {
  await browser.close();
  server.close();
}
check("Zones de sécurité", horsCadre.length === 0, horsCadre.length ? `${horsCadre.length} dépassement(s) : ${[...new Set(horsCadre.map((h) => h.split(" à ")[0]))].join(", ")} (ex. ${horsCadre[0]})` : "tous les textes dans la zone sûre");

// Captures clés : milieu des scènes principales + planche.
const instants = timings.scenes.map((s) => (s.debut + s.fin) / 2);
const n = instants.length;
const choisis = [...new Set([0, Math.floor(n / 3), Math.floor((2 * n) / 3), n - 1])].map((i) => instants[i]);
choisis.forEach((t, i) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", t.toFixed(2), "-i", video, "-frames:v", "1", "-q:v", "3", join(dir, "output", `apercu-${i + 1}.jpg`)]));
execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...choisis.flatMap((_, i) => ["-i", join(dir, "output", `apercu-${i + 1}.jpg`)]),
  "-filter_complex", `${choisis.map((_, i) => `[${i}:v]scale=360:-1[v${i}]`).join(";")};${choisis.map((_, i) => `[v${i}]`).join("")}hstack=inputs=${choisis.length}`,
  join(dir, "output", "planche.jpg")]);
console.log(`→ output/apercu-1..${choisis.length}.jpg, output/planche.jpg`);

writeJson(join(dir, "output", "controle.json"), { date: new Date().toISOString(), video: basename(video), checks });
if (checks.some((c) => !c.ok)) process.exitCode = 1;
