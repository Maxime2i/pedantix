// Images de couverture (1080 × 1920) des vidéos d'une app, pour TikTok / Reels.
// Titre = colonne « Titre » du calendrier ../videos/README.md ; pose = première
// réaction de l'avatar dans le script. Le titre reste dans la zone centrale 3:4
// (recadrage de la grille de profil).
//   node pipeline/couvertures.mjs --app pedantix [--seul pedantix-07-gris]
// Sortie : ../videos/couvertures/<projet>.jpg
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..");
const VIDEOS = path.resolve(RACINE, "../videos");
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > 0 ? process.argv[i + 1] : d; };
const APP = arg("app", "pedantix");
const SEUL = arg("seul");
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const charte = JSON.parse(fs.readFileSync(path.join(RACINE, `config/charte-${APP}.json`), "utf8"));
const C = charte.couleurs;
const logo = "data:image/png;base64," + fs.readFileSync(path.join(RACINE, charte.logo)).toString("base64");

// Titres du calendrier.
const titres = {};
for (const l of fs.readFileSync(path.join(VIDEOS, "README.md"), "utf8").split("\n")) {
  const m = l.match(/^\|[^|]+\|[^|]+\|\s*\[([^\]]+)\.mp4\][^|]*\|\s*([^|]+?)\s*\|/);
  if (m) titres[m[1]] = m[2];
}

// Ordre de préférence : la réaction la plus expressive du script.
const REACTIONS = ["choque", "panique", "celebre", "tete-main", "decu", "telephone", "fier", "reflechit", "content", "clin"];
function pose(script) {
  const vues = [];
  (function walk(o) {
    if (Array.isArray(o)) o.forEach(walk);
    else if (o && typeof o === "object") { if (o.type === "pose" && o.nom) vues.push(o.nom); Object.values(o).forEach(walk); }
  })(script);
  return script.posecouverture ?? REACTIONS.find((p) => vues.includes(p)) ?? "content";
}

const projets = fs.readdirSync(path.join(RACINE, "projets"))
  .filter((p) => p.startsWith(`${APP}-`) && titres[p] && (!SEUL || p === SEUL)).sort();
if (!projets.length) { console.error("Aucun projet avec un titre dans ../videos/README.md"); process.exit(1); }

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const page = (titre, avatar) => `<!doctype html><html><head><meta charset="utf-8">
<link href="${charte.polices.googleFonts}" rel="stylesheet">
<style>
html,body{margin:0;width:1080px;height:1920px;overflow:hidden}
body{background:radial-gradient(circle at 50% 40%, #ffd98a 0%, ${C.fond} 55%, #e9a634 100%);font-family:'${charte.polices.texte}';position:relative}
#brand{position:absolute;top:300px;left:0;right:0;display:flex;justify-content:center;align-items:center;gap:22px}
#brand img{width:84px;height:84px;border-radius:20px;box-shadow:0 8px 20px rgb(80 40 10 / .25)}
#brand span{font-family:'${charte.polices.titre}';font-weight:800;font-size:66px;color:${C.encre}}
#carte{position:absolute;left:70px;right:70px;top:470px;height:560px;display:flex;align-items:center;justify-content:center;
  background:${C.creme};border-radius:56px;box-shadow:0 30px 70px rgb(90 45 10 / .3);transform:rotate(-2deg)}
#t{font-family:'${charte.polices.titre}';font-weight:800;color:${C.encre};text-align:center;line-height:1.05;padding:0 60px;letter-spacing:-.015em}
#t em{font-style:normal;color:${C.terracotta}}
#av{position:absolute;left:50%;bottom:-90px;width:1080px;transform:translateX(-50%)}
#av img{width:100%;display:block;filter:drop-shadow(0 20px 40px rgb(80 40 10 / .3))}
</style></head><body>
<div id="brand"><img src="${logo}"><span>Pédantix</span></div>
<div id="av"><img src="${avatar}"></div>
<div id="carte"><div id="t">${titre}</div></div>
<script>
const t=document.getElementById('t');let f=150;t.style.fontSize=f+'px';
document.fonts.ready.then(()=>{while((t.scrollHeight>440||t.scrollWidth>t.clientWidth)&&f>60){f-=4;t.style.fontSize=f+'px'}window.PRET=true});
</script></body></html>`;

fs.mkdirSync(path.join(VIDEOS, "couvertures"), { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--hide-scrollbars", "--allow-file-access-from-files"] });
for (const p of projets) {
  const script = JSON.parse(fs.readFileSync(path.join(RACINE, "projets", p, "script.json"), "utf8"));
  const nom = pose(script);
  const av = "data:image/png;base64," + fs.readFileSync(path.join(RACINE, `apps/${APP}/avatar/${nom}.png`)).toString("base64");
  // Dernier mot du titre en terracotta.
  const titre = script.titreCouverture ?? titres[p];
  const mots = esc(titre).split(" ");
  const html = mots.length > 1 ? mots.slice(0, -1).join(" ") + " <em>" + mots.at(-1) + "</em>" : mots[0];
  const tab = await browser.newPage();
  await tab.setViewport({ width: 1080, height: 1920 });
  await tab.setContent(page(html, av), { waitUntil: "load", timeout: 60000 });
  await tab.waitForFunction("window.PRET === true");
  await tab.screenshot({ path: path.join(VIDEOS, "couvertures", `${p}.jpg`), type: "jpeg", quality: 90 });
  await tab.close();
  console.log(`${p}  ${nom}  « ${titre} »`);
}
await browser.close();
