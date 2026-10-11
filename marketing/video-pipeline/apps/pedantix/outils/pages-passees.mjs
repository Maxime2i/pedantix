// Liste des pages passées du jeu (API de l'app, route /history) → apps/pedantix/pages-passees.json
// Ne jamais utiliser la page du jour dans une vidéo.
import { writeFileSync } from "node:fs";
const API = "https://uvaupdahrvugxor7xopx2slx.141.227.190.141.sslip.io";
const rows = await (await fetch(`${API}/history`)).json();
const pages = rows.filter(([, , [, t]]) => t).map(([num, , [url, titre]]) => ({ num, titre, url }));
writeFileSync(new URL("../pages-passees.json", import.meta.url), JSON.stringify(pages, null, 1) + "\n");
console.log(`→ ${pages.length} pages passées (de « ${pages.at(-1).titre} » à « ${pages[0].titre} »)`);
