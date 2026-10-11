// Étape 2 — Voix off avec Gemini TTS via OpenRouter, en un seul bloc
// (diction plus naturelle) ; Whisper retrouvera ensuite le découpage.
// Sortie : audio/voix.wav
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { apiKey, fullText, loadProject, logCost } from "./lib.mjs";

const { dir, script, charte } = loadProject();
const model = script.voix?.modele ?? charte.voix.modele;
const voice = script.voix?.voix ?? charte.voix.voix;
const text = fullText(script);
console.log(`Voix : ${model} / ${voice} — ${text.length} caractères`);

const res = await fetch("https://openrouter.ai/api/v1/audio/speech", {
  method: "POST",
  headers: { Authorization: `Bearer ${apiKey()}`, "Content-Type": "application/json" },
  body: JSON.stringify({ model, voice, input: text, instructions: script.voix?.instructions, response_format: "pcm" }),
});
if (!res.ok) throw new Error(`TTS ${res.status} : ${await res.text()}`);

// PCM brut (16 bits, mono) → WAV.
const rate = Number(/rate=(\d+)/.exec(res.headers.get("content-type") ?? "")?.[1] ?? 24000);
const pcm = Buffer.from(await res.arrayBuffer());
const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + pcm.length, 4);
header.write("WAVEfmt ", 8);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(1, 22);
header.writeUInt32LE(rate, 24);
header.writeUInt32LE(rate * 2, 28);
header.writeUInt16LE(2, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(pcm.length, 40);
mkdirSync(join(dir, "audio"), { recursive: true });
const out = join(dir, "audio", "voix.wav");
writeFileSync(out, Buffer.concat([header, pcm]));

const seconds = pcm.length / 2 / rate;
console.log(`→ ${out} (${seconds.toFixed(1)} s)`);

// Coût : ~25 jetons audio par seconde en sortie, ~1 jeton pour 4 caractères en entrée.
const prices = await fetch("https://openrouter.ai/api/v1/models?output_modalities=speech").then((r) => r.json());
const p = prices.data.find((m) => m.id === model)?.pricing ?? { prompt: 0, completion: 0 };
logCost(dir, "voix", `${model} ${seconds.toFixed(1)} s`, seconds * 25 * Number(p.completion) + (text.length / 4) * Number(p.prompt));
