// État persistant et règles d'affichage, calqués sur l'original.

/** Score d'une case : texte réel (trouvé), proximité (> 0) ou 0 (cachée). */
export type Score = string | number;

export interface Cell {
  word: string;
  score: Score;
}

/** mot → [numéro d'essai, {id: score}] */
export type Guesses = Record<string, [number, Record<number, Score>]>;

/** [verts, gris, cachés] */
export type Turns = [number, number, number];

// ------------------------------------------------------------ localStorage

const PREFIX = "p/";

function read<T>(key: string, fallback: T, prefix = PREFIX): T {
  try {
    const raw = localStorage.getItem(prefix + key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown, prefix = PREFIX): void {
  try {
    if (value === undefined) localStorage.removeItem(prefix + key);
    else localStorage.setItem(prefix + key, JSON.stringify(value));
  } catch {
    // mode privé / quota
  }
}

export const store = {
  read,
  write,
  /** Réinitialise la partie si le numéro du jour a changé. */
  startDay(num: number) {
    if (read<number | null>("puzzleNumber", null) !== num) {
      for (const k of ["secret", "ranking", "turns", "guesses"]) write(k, undefined);
      write("puzzleNumber", num);
    }
  },
  /** Essais par jour : négatif = en cours, positif = trouvé. */
  day(num: number): number | null {
    return read<Record<number, number>>("days", {})[num] ?? null;
  },
  setDay(num: number, tries: number) {
    write("days", { ...read<Record<number, number>>("days", {}), [num]: tries });
  },
};

// ---------------------------------------------------------------- réglages

export type Palette = "colorful" | "grey";
export type Mode = "light" | "dark" | "system";

export interface Settings {
  palette: Palette;
  mode: Mode;
  /** Daltonien : 💚🟠 au lieu de 🟩🟧. */
  blind: boolean;
  animation: boolean;
}

export function loadSettings(): Settings {
  return {
    palette: read<Palette>("theme", "colorful", ""),
    mode: read<Mode>("mode", "system", ""),
    blind: read<boolean>("blind", false, ""),
    animation: read<boolean>("animation", true, ""),
  };
}

export function saveSettings(s: Settings): void {
  write("theme", s.palette, "");
  write("mode", s.mode, "");
  write("blind", s.blind, "");
  write("animation", s.animation, "");
}

// ------------------------------------------------------------------ règles

/** Niveau de gris d'un mot proche : 255·log10(score − 30) / 2. */
export function greyLevel(score: number): number {
  return Math.max(0, Math.min(255, Math.round((255 * Math.log10(score - 30)) / 2)));
}

/** La proposition `word` doit-elle remplacer la case actuelle ? */
export function improves(cell: Cell, word: string, score: Score): boolean {
  if (typeof score === "string") return true;
  if (typeof cell.score === "string") return false;
  return score > cell.score || (score === cell.score && word === cell.word);
}

export function countTurns(cells: Cell[]): Turns {
  let green = 0;
  let close = 0;
  let hidden = 0;
  for (const c of cells) {
    if (typeof c.score === "string") green++;
    else if (c.score > 0) close++;
    else hidden++;
  }
  return [green, close, hidden];
}

export const BLOCKS = { green: "🟩", orange: "🟧", red: "🟥" };
export const BLIND_BLOCKS = { green: "💚", orange: "🟠", red: "🟥" };
export type Blocks = typeof BLOCKS;

/** Barre de progression en `size` carrés, proportionnelle aux cases. */
export function story([green, close, hidden]: Turns, size: number, blocks: Blocks = BLOCKS): string {
  const total = green + close + hidden || 1;
  const g = Math.round((green * size) / total);
  const o = Math.round((close * size) / total);
  const r = Math.max(0, size - g - o);
  return blocks.green.repeat(g) + blocks.orange.repeat(o) + blocks.red.repeat(r);
}

export function rankingLabel(rank: number): string {
  if (rank === 1) return "🥇1er";
  if (rank === 2) return "🥈2e";
  if (rank === 3) return "🥉3e";
  return rank > 3 ? `${rank}e` : "Nème";
}

export const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? "s" : ""}`;

export function shareText(num: number, tries: number, turns: Turns): string {
  return (
    `J'ai trouvé #pedantix nº${num} en ${plural(tries, "coup")} !\n` +
    `${story(turns, 20)}\n${window.location.origin}/`
  );
}

/** Comme l'original : minuscules, seuls lettres, chiffres et tirets. */
export const normalize = (raw: string) => raw.replace(/[^-\p{L}\p{N}]/gu, "").toLowerCase();
