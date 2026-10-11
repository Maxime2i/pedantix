// Captures d'instants choisis (sans rendre toute la vidéo), en planche JPEG.
//   node pipeline/instants.mjs --projet <dossier> --t 1.2,4,9.5 [--sortie planche.jpg]
// Pratique pour vérifier une scène ou une modification de la bibliothèque.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer-core";
import { animationPath, loadProject } from "./lib.mjs";
import { serve } from "./serveur.mjs";

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const { dir, script } = loadProject();
const instants = arg("--t", "1").split(",").map(Number);
const sortie = arg("--sortie", join(dir, "output", "instants.jpg"));
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const server = await serve();
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--hide-scrollbars", "--font-render-hinting=none"] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: script.format.largeur, height: script.format.hauteur, deviceScaleFactor: 1 });
  page.on("pageerror", (e) => { console.error("Erreur dans la page :", e.message); process.exitCode = 1; });
  await page.goto(`http://127.0.0.1:${server.address().port}${animationPath(dir, script)}`, { waitUntil: "networkidle0" });
  await page.evaluate(() => window.ready);
  const stage = await page.$("#stage");
  const imgs = [];
  for (const t of instants) {
    await page.evaluate((x) => window.renderAt(x), t);
    imgs.push((await stage.screenshot({ type: "jpeg", quality: 80 })).toString("base64"));
  }
  // Planche : 4 colonnes, légende = instant.
  const cols = Math.min(4, imgs.length), w = 360, h = 640;
  await page.setViewport({ width: cols * w, height: Math.ceil(imgs.length / cols) * (h + 40), deviceScaleFactor: 1 });
  await page.setContent(`<body style="margin:0;background:#222;display:grid;grid-template-columns:repeat(${cols},${w}px);font:600 22px sans-serif;color:#fff">${imgs.map((b, i) => `<div><img src="data:image/jpeg;base64,${b}" width="${w}" height="${h}" style="display:block"><div style="height:40px;line-height:40px;text-align:center">t = ${instants[i]} s</div></div>`).join("")}</body>`);
  writeFileSync(sortie, await page.screenshot({ type: "jpeg", quality: 82, fullPage: true }));
  console.log(`→ ${sortie}`);
} finally {
  await browser.close();
  server.close();
}
