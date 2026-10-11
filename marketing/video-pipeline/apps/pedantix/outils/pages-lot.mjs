// Récupère d'un coup (une requête par 20 titres, limites de l'API Wikipédia) le début
// de plusieurs pages et les enregistre dans apps/pedantix/pages/<slug>.json.
//   node apps/pedantix/outils/pages-lot.mjs "Japon" "Lactose" … [--mots 95]
import { existsSync, writeFileSync } from "node:fs";
const args = process.argv.slice(2);
const iMots = args.indexOf("--mots");
const nb = iMots >= 0 ? Number(args.splice(iMots, 2)[1]) : 95;
const slug = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const dossier = new URL("../pages/", import.meta.url);
const todo = args.filter((t) => !existsSync(new URL(`${slug(t)}.json`, dossier)));
const TOK = /[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*/gu;
const sansParentheses = (p) => { let q = p; while (/\([^()]*\)/.test(q)) q = q.replace(/\s*\([^()]*\)/g, ""); return q.replace(/[()]/g, ""); };
for (let i = 0; i < todo.length; i += 20) {
  const lot = todo.slice(i, i + 20);
  const url = "https://fr.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&exlimit=20&redirects=1&format=json&titles=" + encodeURIComponent(lot.join("|"));
  const res = await fetch(url, { headers: { "User-Agent": "pedantix-video/1.0 (contact@maximelanglois.fr)" } });
  if (!res.ok) throw new Error(`Wikipédia : ${res.status}`);
  const data = await res.json();
  const alias = Object.fromEntries([...(data.query.normalized ?? []), ...(data.query.redirects ?? [])].map((r) => [r.to, r.from]));
  for (const page of Object.values(data.query.pages)) {
    if (!page.extract) { console.error(`introuvable : ${page.title}`); continue; }
    const paras = page.extract.split(/\n+/).map((p) => sansParentheses(p).replace(/\s+([,.])/g, "$1").replace(/\s+/g, " ").trim()).filter(Boolean);
    const texte = []; let n = 0;
    for (const p of paras) {
      if (n >= nb) break;
      let garde = "";
      for (const ph of p.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [p]) { const k = (ph.match(TOK) ?? []).length; if (n + k > nb && (garde || texte.length)) break; garde += ph; n += k; }
      if (garde.trim()) texte.push(garde.trim());
    }
    const demande = lot.find((t) => t === page.title || alias[page.title] === t || alias[alias[page.title]] === t) ?? page.title;
    const titreMots = [...new Set((page.title.match(TOK) ?? []).map((w) => w.toLowerCase()))];
    writeFileSync(new URL(`${slug(demande)}.json`, dossier), JSON.stringify({ titre: page.title, texte, titreMots }, null, 2) + "\n");
    console.log(`→ ${slug(demande)}.json (${n} mots)`);
  }
  if (i + 20 < todo.length) await new Promise((r) => setTimeout(r, 3000));
}
