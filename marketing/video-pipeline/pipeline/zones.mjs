// Détail des textes hors zone sûre à des instants donnés (complète le contrôle de l'étape 9).
//   node pipeline/zones.mjs --projet <dossier> --t 11.75,12
//   node pipeline/zones.mjs --projet <dossier>        (toute la vidéo, toutes les 0,25 s ; code 1 si dépassement)
import puppeteer from "puppeteer-core";
import { animationPath, loadProject } from "./lib.mjs";
import { serve } from "./serveur.mjs";

const i = process.argv.indexOf("--t");
const choisis = i > 0 ? process.argv[i + 1].split(",").map(Number) : null;
const { dir, script } = loadProject();
const { largeur: W, hauteur: H } = script.format;
const server = await serve();
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H });
  await page.goto(`http://127.0.0.1:${server.address().port}${animationPath(dir, script)}`, { waitUntil: "networkidle0" });
  await page.evaluate(() => window.ready);
  const duree = await page.evaluate(() => window.duree);
  if (!duree) throw new Error("page non chargée (timings.json manquant ?)");
  const instants = choisis ?? Array.from({ length: Math.floor(duree / 0.25) }, (_, k) => k * 0.25);
  let n = 0;
  for (const t of instants) {
    const hors = await page.evaluate((t, W, H) => {
      window.renderAt(t);
      const sel = "#subs .grp, #brand img, #brand span, #ff, #end h1, #end p, #end .pill, #end .detail, [data-texte]";
      return [...document.querySelectorAll(sel)].filter((e) => e.offsetParent && e.textContent.trim() && getComputedStyle(e).opacity > 0.05).map((e) => {
        const r = e.getBoundingClientRect();
        return { el: e.id || e.className, texte: e.textContent.trim().slice(0, 24), l: Math.round(r.left), h: Math.round(r.top), d: Math.round(r.right), b: Math.round(r.bottom) };
      }).filter((x) => x.l < 60 || x.h < 160 || x.d > W - 140 || x.b > H - 380);
    }, t, W, H);
    if (hors.length) n++;
    if (choisis || hors.length) console.log(`t = ${t} s :`, hors.length ? JSON.stringify(hors) : "rien hors zone");
  }
  if (!choisis) console.log(n ? `❌ ${n} instant(s) hors zone` : "✅ zones sûres");
  if (n) process.exitCode = 1;
} finally { await browser.close(); server.close(); }
