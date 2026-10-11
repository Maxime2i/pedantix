// Contenu de démo d'une page Pédantix à partir d'un article Wikipédia (début de l'introduction).
//   node apps/pedantix/outils/page.mjs "Casablanca" [nbMots=95]
// Affiche le bloc "page" à coller dans script.json (à compléter : revelations, proches, accelere…).
// Pages passées du jeu : apps/pedantix/pages-passees.json (node apps/pedantix/outils/pages-passees.mjs).
const [titre, nb = "95"] = process.argv.slice(2);
if (!titre) throw new Error('Usage : node apps/pedantix/outils/page.mjs "<titre>" [nbMots]');
const url = "https://fr.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&redirects=1&format=json&titles=" + encodeURIComponent(titre);
const data = await (await fetch(url, { headers: { "User-Agent": "pedantix-video/1.0" } })).json();
const page = Object.values(data.query.pages)[0];
if (!page.extract) throw new Error(`Article introuvable : ${titre}`);
// Paragraphes, sans parenthèses de prononciation ni références, coupés à la fin d'une phrase.
const sansParentheses = (p) => { let q = p; while (/\([^()]*\)/.test(q)) q = q.replace(/\s*\([^()]*\)/g, ""); return q.replace(/[()]/g, ""); };
const paras = page.extract.split(/\n+/).map((p) => sansParentheses(p).replace(/\s+([,.])/g, "$1").replace(/\s+/g, " ").trim()).filter(Boolean);
const TOK = /[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*/gu;
const texte = [];
let n = 0;
for (const p of paras) {
  if (n >= Number(nb)) break;
  const phrases = p.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [p];
  let garde = "";
  for (const ph of phrases) {
    const k = (ph.match(TOK) ?? []).length;
    if (n + k > Number(nb) && (garde || texte.length)) break;
    garde += ph; n += k;
  }
  if (garde.trim()) texte.push(garde.trim());
}
const titreMots = [...new Set((page.title.match(TOK) ?? []).map((w) => w.toLowerCase()))];
console.log(JSON.stringify({ titre: page.title, date: "Mardi 7 octobre", texte, titreMots, revelations: {}, proches: {}, dejaTrouves: [], accelere: [] }, null, 2));
console.error(`${n} mots, ${texte.length} paragraphe(s).`);
