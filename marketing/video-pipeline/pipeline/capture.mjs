// Capture d'une page du pipeline (planche, aperçu) : node pipeline/capture.mjs <chemin> <sortie.png> [largeur]
// Le chemin est relatif à la racine du pipeline, ex. apps/pedantix/planche-avatar.html
import puppeteer from "puppeteer-core";
import { serve } from "./serveur.mjs";

const [chemin, sortie, largeur = "1600"] = process.argv.slice(2);
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const server = await serve();
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--hide-scrollbars"] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: Number(largeur), height: 900, deviceScaleFactor: 1 });
  page.on("pageerror", (e) => { console.error("Erreur dans la page :", e.message); process.exitCode = 1; });
  await page.goto(`http://127.0.0.1:${server.address().port}/${chemin}`, { waitUntil: "networkidle0" });
  await page.evaluate(() => window.ready);
  await (await page.$("#stage")).screenshot({ path: sortie });
  console.log(`→ ${sortie}`);
} finally {
  await browser.close();
  server.close();
}
