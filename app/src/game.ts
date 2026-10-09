// État persistant et règles d'affichage, calqués sur l'original.
import AsyncStorage from "@react-native-async-storage/async-storage";

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

// ------------------------------------------------------------ stockage
// AsyncStorage est asynchrone : on charge tout au démarrage (`loadStorage`),
// puis lectures synchrones dans le cache et écritures en arrière-plan.

const PREFIX = "p/";
const cache = new Map<string, string>();

export async function loadStorage(): Promise<void> {
  try {
    const pairs = await AsyncStorage.multiGet(await AsyncStorage.getAllKeys());
    for (const [k, v] of pairs) if (v != null) cache.set(k, v);
  } catch {
    // stockage indisponible : partie non sauvegardée
  }
}

function read<T>(key: string, fallback: T, prefix = PREFIX): T {
  try {
    const raw = cache.get(prefix + key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown, prefix = PREFIX): void {
  try {
    if (value === undefined) {
      cache.delete(prefix + key);
      AsyncStorage.removeItem(prefix + key).catch(() => {});
    } else {
      const raw = JSON.stringify(value);
      cache.set(prefix + key, raw);
      AsyncStorage.setItem(prefix + key, raw).catch(() => {});
    }
  } catch {
    // valeur non sérialisable
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

export type Mode = "light" | "dark" | "system";

export interface Settings {
  mode: Mode;
  /** Notification quotidienne à l'arrivée de la nouvelle page. */
  notify: boolean;
}

export function loadSettings(): Settings {
  return {
    mode: read<Mode>("mode", "system", ""),
    notify: read<boolean>("notify", true, ""),
  };
}

export function saveSettings(s: Settings): void {
  write("mode", s.mode, "");
  write("notify", s.notify, "");
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

/**
 * Date d'une page : `change` est l'instant de publication (midi, Paris) de la page du jour.
 * `daysBefore` remonte aux pages précédentes (historique).
 */
export function puzzleDate(change: number, daysBefore = 0, short = false): string {
  const start = new Date((change - 86400 * daysBefore) * 1000);
  try {
    const text = start.toLocaleDateString("fr-FR", short
      ? { weekday: "short", day: "numeric", month: "short", timeZone: "Europe/Paris" }
      : { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Paris" });
    return text.charAt(0).toUpperCase() + text.slice(1);
  } catch {
    return start.toDateString();
  }
}

export const SITE_URL = "https://pedantix.vercel.app/";

/** `change` : instant de publication de la page (sert à la dater). */
export function shareText(change: number, tries: number, turns: Turns): string {
  return (
    `J'ai trouvé le #pedantix du ${puzzleDate(change).toLowerCase()} en ${plural(tries, "coup")} !\n` +
    `${story(turns, 20)}\n${SITE_URL}`
  );
}

/** Comme l'original : minuscules, seuls lettres, chiffres et tirets. */
export const normalize = (raw: string) => raw.replace(/[^-\p{L}\p{N}]/gu, "").toLowerCase();
