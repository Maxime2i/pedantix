// Étape 7 — Rendu image par image avec Chrome headless : pour chaque image,
// on appelle renderAt(t) puis on capture. Pas d'enregistrement en temps réel,
// donc aucune saccade, quel que soit le temps de calcul d'une image.
// Sortie : frames/frame-00001.png …
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer-core";
import { animationPath, loadProject } from "./lib.mjs";
import { serve } from "./serveur.mjs";

const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const { dir, script } = loadProject();
const { largeur: W, hauteur: H, fps } = script.format;
const out = join(dir, "frames");
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const server = await serve();
const url = `http://127.0.0.1:${server.address().port}${animationPath(dir, script)}`;
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--hide-scrollbars", "--font-render-hinting=none"] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  page.on("pageerror", (e) => console.error("Erreur dans la page :", e.message));
  await page.goto(url, { waitUntil: "networkidle0" });
  await page.evaluate(() => window.ready);
  const duree = await page.evaluate(() => window.duree);
  const total = Math.ceil(duree * fps);
  const stage = await page.$("#stage");
  const t0 = Date.now();
  for (let i = 0; i < total; i++) {
    await page.evaluate((t) => window.renderAt(t), i / fps);
    await stage.screenshot({ path: join(out, `frame-${String(i + 1).padStart(5, "0")}.png`) });
    if ((i + 1) % 60 === 0 || i + 1 === total) {
      const rate = (i + 1) / ((Date.now() - t0) / 1000);
      process.stdout.write(`\r  ${i + 1}/${total} images (${rate.toFixed(1)}/s)   `);
    }
  }
  console.log(`\n→ ${total} images (${duree.toFixed(2)} s à ${fps} i/s) dans frames/`);
} finally {
  await browser.close();
  server.close();
}
if (!existsSync(join(out, "frame-00001.png"))) throw new Error("Aucune image rendue");
