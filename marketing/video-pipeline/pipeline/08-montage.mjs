// Étape 8 — Montage ffmpeg : images → H.264 (yuv420p), voix + bruitages placés
// d'après la même chronologie que l'animation, musique optionnelle sous la voix,
// volume normalisé (-14 LUFS, cible courante des réseaux sociaux).
// Sortie : output/video-finale.mp4
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { loadProject, readJson, sonsApp } from "./lib.mjs";
import { buildTimeline } from "./moteur.js";

const { dir, script } = loadProject();
const timings = readJson(join(dir, "timings.json"));
const tl = buildTimeline(script, timings);
tl.sfx.push(...(await sonsApp(script, tl.actions)));
tl.sfx = tl.sfx.map((s) => ({ ...s, t: Math.max(0, s.t) })).sort((a, b) => a.t - b.t);
const fps = script.format.fps;
mkdirSync(join(dir, "output"), { recursive: true });

const inputs = ["-framerate", String(fps), "-i", join(dir, "frames", "frame-%05d.png"), "-i", join(dir, "audio", "voix.wav")];
// Compression douce de la voix : moins d'écart entre syllabes fortes et faibles, donc -14 LUFS atteignable sans dépasser la crête.
const filters = ["[1:a]aresample=44100,acompressor=threshold=-20dB:ratio=3:attack=5:release=90:makeup=2[voix]"];
const mix = ["[voix]"];
let n = 2;

for (const [i, cue] of tl.sfx.entries()) {
  const file = join(dir, "audio", "sfx", `${cue.son}.wav`);
  if (!existsSync(file)) throw new Error(`Bruitage manquant : ${cue.son} (lancer l'étape 5)`);
  inputs.push("-i", file);
  const ms = Math.round(cue.t * 1000);
  filters.push(`[${n}:a]aresample=44100,volume=${cue.gain},adelay=${ms}|${ms}[s${i}]`);
  mix.push(`[s${i}]`);
  n++;
}

const music = join(dir, "audio", "musique.mp3");
if (existsSync(music)) {
  inputs.push("-stream_loop", "-1", "-i", music);
  filters.push(`[${n}:a]aresample=44100,volume=0.12,afade=t=out:st=${(tl.duree - 1.2).toFixed(2)}:d=1.2[mus]`);
  mix.push("[mus]");
  n++;
}

// Mixage → WAV intermédiaire, puis normalisation en deux passes (mesure, correction) :
// en une seule passe, loudnorm reste trop bas sur les clips courts.
// Limiteur à -10,5 dBFS : écrase les crêtes des bruitages pour que la normalisation (linéaire) atteigne -14 LUFS.
filters.push(`${mix.join("")}amix=inputs=${mix.length}:normalize=0:duration=longest,alimiter=limit=0.3:attack=3:release=80:level=false,apad,atrim=0:${tl.duree.toFixed(3)}[a]`);
const mixWav = join(dir, "output", "mix.wav");
execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...inputs.slice(4), "-filter_complex", filters.join(";").replace(/\[(\d+):a\]/g, (_, k) => `[${Number(k) - 1}:a]`), "-map", "[a]", "-ar", "48000", mixWav]);
const TARGET = "I=-14:TP=-2:LRA=11";
const mesure = execFileSync("sh", ["-c", `ffmpeg -hide_banner -nostats -i "${mixWav}" -af loudnorm=${TARGET}:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p'`]).toString();
const m = JSON.parse(mesure);
// Limiteur final : marge pour le dépassement de crête de l'encodage AAC.
const norm = `loudnorm=${TARGET}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;

const out = join(dir, "output", "video-finale.mp4");
execFileSync("ffmpeg", [
  "-y", "-loglevel", "error",
  "-framerate", String(fps), "-i", join(dir, "frames", "frame-%05d.png"),
  "-i", mixWav,
  "-map", "0:v", "-map", "1:a", "-af", `${norm},alimiter=limit=0.71:attack=1:release=50:level=false,aresample=44100`,
  "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium", "-r", String(fps),
  "-c:a", "aac", "-b:a", "192k",
  "-movflags", "+faststart", "-shortest",
  out,
], { stdio: "inherit" });
console.log(`→ ${out} (${tl.sfx.length} bruitages${existsSync(music) ? ", musique" : ""})`);
