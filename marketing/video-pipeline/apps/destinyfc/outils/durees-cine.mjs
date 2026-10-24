// Durée réelle de chaque cinématique d'un projet (instant du message « done » de la page de l'app),
// pour caler la voix : node apps/destinyfc/outils/durees-cine.mjs <dossier du projet>
import puppeteer from "puppeteer-core";
import { serve } from "../../../pipeline/serveur.mjs";
const server = await serve();
const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1920 });
page.on("pageerror", (e) => console.error(e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/apps/destinyfc/index.html?projet=${process.argv[2]}`, { waitUntil: "networkidle0" });
await page.evaluate(() => window.ready);
console.log(await page.evaluate(async () => { const out = []; for (const [a, l] of window.__cines) { await l.aller(15000); out.push([a.id, a.option ?? a.club, l.messages.map((m) => `${(m.t / 1000).toFixed(2)}s ${m.m}`).join(" | ")]); } return out; }));
await browser.close(); server.close();
