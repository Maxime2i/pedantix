// Complète "page" d'un script à partir du cache apps/pedantix/pages/<source>.json :
//   "page": { "source": "japon", "date": "…", "revelations": {…}, … }  →  titre, texte, titreMots ajoutés.
// Ce qui est déjà écrit dans le script est conservé (ex. "texte" raccourci).
//   node apps/pedantix/outils/remplir.mjs --projet <dossier>
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { projectDir } from "../../../pipeline/lib.mjs";

const p = join(projectDir(), "script.json");
const script = JSON.parse(readFileSync(p, "utf8"));
const src = script.page?.source;
if (src) {
  const cache = JSON.parse(readFileSync(new URL(`../pages/${src}.json`, import.meta.url), "utf8"));
  const { source, ...reste } = script.page;
  script.page = { titre: cache.titre, texte: cache.texte, titreMots: cache.titreMots, revelations: {}, proches: {}, dejaTrouves: [], ...reste };
  writeFileSync(p, JSON.stringify(script, null, 2) + "\n");
  console.log(`page « ${cache.titre} » ajoutée`);
}
