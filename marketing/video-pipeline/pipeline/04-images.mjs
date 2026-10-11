// Étape 4 — Images réalistes (Gemini image via OpenRouter) pour les scènes
// dont le champ `image` contient une description. Les autres sont ignorées.
// Sortie : images/scene-XX.png
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { apiKey, loadProject, logCost } from "./lib.mjs";

const MODEL = process.env.IMAGE_MODEL ?? "google/gemini-3.1-flash-image";
const { dir, script, charte } = loadProject();
const ratio = `${script.format.largeur}:${script.format.hauteur}` === "1080:1920" ? "9:16" : "1:1";
const todo = script.scenes.map((s, i) => [s, i]).filter(([s]) => s.image);
if (!todo.length) {
  console.log("Aucune scène ne demande d'image réaliste : étape ignorée.");
  process.exit(0);
}

mkdirSync(join(dir, "images"), { recursive: true });
let cost = 0;
for (const [scene, i] of todo) {
  const prompt =
    `${scene.image}\nFormat ${ratio}, ${script.styleImages ?? "photo réaliste, lumière naturelle"}. ` +
    `Palette cohérente avec ces couleurs : ${Object.values(charte.couleurs).filter((c) => typeof c === "string").join(", ")}. Aucun texte dans l'image.`;
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, modalities: ["image", "text"], messages: [{ role: "user", content: prompt }], image_config: { aspect_ratio: ratio } }),
  });
  if (!res.ok) throw new Error(`image ${scene.id} : ${res.status} ${await res.text()}`);
  const json = await res.json();
  const url = json.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!url) throw new Error(`image ${scene.id} : aucune image renvoyée`);
  const out = join(dir, "images", `scene-${String(i + 1).padStart(2, "0")}.png`);
  writeFileSync(out, Buffer.from(url.split(",")[1], "base64"));
  cost += Number(json.usage?.cost ?? 0);
  console.log(`→ ${out}`);
}
logCost(dir, "images", `${todo.length} image(s) ${MODEL}`, cost);
