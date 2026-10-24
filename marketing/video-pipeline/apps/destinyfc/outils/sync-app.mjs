// Copie dans la bibliothèque vidéo le code de l'app Destiny FC qui dessine l'avatar et les cinématiques,
// pour que les vidéos montrent exactement ce que montre le jeu (aucun dessin refait à la main).
// Écrit apps/destinyfc/app/app.js : window.DFC_APP = { rig, catalogue, moments, cine, textes, rarete }.
// Usage : node apps/destinyfc/outils/sync-app.mjs [chemin de destiny-eleven]   (à relancer après une modif du rig ou d'une cinématique)
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ICI = dirname(fileURLToPath(import.meta.url));
const APP = process.argv[2] ?? "/Users/test/destiny-eleven";
const ts = createRequire(join(APP, "package.json"))("typescript");
const lire = (rel) => readFileSync(join(APP, rel), "utf8");
const cjs = (rel) => ts.transpileModule(lire(rel), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, removeComments: true } }).outputText;

// Modules de l'app, câblés par un petit require ; le moteur de jeu et l'i18n sont remplacés par des bouchons.
const modules = {
  "avatar/rigWeb": "src/avatar/rigWeb.ts",
  "avatar/catalog": "src/avatar/catalog.ts",
  "cinematics/moments": "src/cinematics/moments.ts",
  "cinematics/index": "src/cinematics/index.ts",
  "i18n/strings": "src/i18n/strings.ts",
};
for (const f of readdirSync(join(APP, "src/cinematics")).filter((f) => f.endsWith("Template.js"))) modules[`cinematics/${f.replace(/\.js$/, "")}`] = `src/cinematics/${f}`;

const corps = Object.entries(modules).map(([id, rel]) => `${JSON.stringify(id)}: function (exports, require) {\n${cjs(rel)}\n}`).join(",\n");
const commit = execFileSync("git", ["-C", APP, "log", "-1", "--format=%h %cs"], { encoding: "utf8" }).trim();
const branche = execFileSync("git", ["-C", APP, "branch", "--show-current"], { encoding: "utf8" }).trim();
const rarete = /RARITY_COLORS[^{]*(\{[^}]*\})/.exec(lire("src/theme/cosmetics.ts"))[1];
// Icônes de l'éditeur « Mon joueur » (onglets, bouton de pose), telles quelles.
const editeur = lire("src/screens/AvatarScreen.tsx");
const icones = /const TAB_ICONS[^=]*=\s*(\{[\s\S]*?\n\});/.exec(editeur)[1];
const iconePose = /const POSE_ICON = (`[^`]*`);/.exec(editeur)[1];

const js = `// Généré par outils/sync-app.mjs depuis destiny-eleven (${branche}, ${commit}) : ne pas modifier à la main.
(function () {
  var SOURCES = {\n${corps}\n};
  var cache = {};
  // Bouchons : moteur de jeu (drapeau, montants) et traduction (langue de la vidéo).
  var LANGUE = "fr";
  var STUBS = {
    "../game/engine.js": { __esModule: true, default: {
      countryOf: function () { return { flag: "" }; },
      fmtMoney: function (m) { var fr = LANGUE === "fr", v = m >= 10 ? Math.round(m) : Math.round(m * 10) / 10;
        if (m > 0 && m < 0.1) return fr ? Math.max(1, Math.round(m * 1000)) + " k€" : "€" + Math.max(1, Math.round(m * 1000)) + "k";
        return fr ? String(v).replace(".", ",") + " M€" : "€" + v + "m"; } } },
    "../i18n": { t: function (cle, vars) {
      var s = req("i18n/strings")[LANGUE === "en" ? "en" : "fr"];
      var v = cle.split(".").reduce(function (o, k) { return o && o[k]; }, s);
      if (typeof v !== "string") throw new Error("Texte inconnu : " + cle);
      return v.replace(/\\{(\\w+)\\}/g, function (_, k) { return vars && vars[k] != null ? vars[k] : ""; }); } },
  };
  function req(id) {
    if (cache[id]) return cache[id].exports;
    var m = (cache[id] = { exports: {} });
    SOURCES[id](m.exports, function (dep) {
      if (STUBS[dep]) return STUBS[dep];
      var cible = dep.replace(/^\\.\\.\\//, "").replace(/^\\.\\//, id.split("/")[0] + "/");
      if (!SOURCES[cible]) throw new Error("Module non copié : " + dep + " (depuis " + id + ")");
      return req(cible);
    });
    return m.exports;
  }
  var rigJs = req("avatar/rigWeb").RIG_WEB_JS;
  (0, eval)(rigJs);
  window.DFC_APP = {
    source: ${JSON.stringify(`${branche} ${commit}`)},
    langue: function (l) { LANGUE = l; },
    rig: window.DestinyRig,
    rigJs: rigJs,
    catalogue: req("avatar/catalog"),
    moments: req("cinematics/moments"),
    cine: req("cinematics/index"),
    textes: function () { return req("i18n/strings")[LANGUE === "en" ? "en" : "fr"]; },
    rarete: ${rarete},
    icones: ${icones},
    iconePose: ${iconePose},
  };
})();
`;
mkdirSync(join(ICI, "..", "app"), { recursive: true });
writeFileSync(join(ICI, "..", "app", "app.js"), js);
console.log(`app/app.js : ${(js.length / 1024).toFixed(0)} Ko, depuis ${branche} ${commit}`);
