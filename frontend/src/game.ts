// Helpers purs du jeu — même comportement que mobile/web-test/index.html.
import type { TempLevel } from "./api";

export type RevealLevel = "exact" | "proche";

export interface Guess {
  word: string;
  level: TempLevel;
  present: boolean;
}

/** Révélation d'un mot de l'article (position -> niveau + texte + cosinus). */
export interface RevealState {
  level: RevealLevel;
  text: string;
  cos: number | null;
}

/**
 * Dégradé d'orange — thème éditorial « magazine chaleureux » :
 * cos 0.49 -> #d97706 (ambre), cos 0.85+ -> #c2571c (terracotta),
 * borné entre les deux (défaut 0.67 si cos absent).
 */
export function orangeColor(cos: number | null | undefined): string {
  const c = cos == null ? 0.67 : Math.min(Math.max(cos, 0.49), 0.85);
  const t = (c - 0.49) / (0.85 - 0.49);
  const r = Math.round(217 - 23 * t);
  const g = Math.round(119 - 32 * t);
  const b = Math.round(6 + 22 * t);
  return `rgb(${r}, ${g}, ${b})`;
}

export function emojiForGuess(g: Guess): string {
  if (g.present || g.level === "exact") return "🟩";
  if (g.level === "proche") return "🟧";
  return "🟥";
}

export function buildShareText(num: number, guesses: Guess[]): string {
  const line1 = `Pédantix #${num} — ${guesses.length} essai${guesses.length > 1 ? "s" : ""}`;
  const line2 = guesses.map(emojiForGuess).join("");
  return line2 ? `${line1}\n${line2}` : line1;
}

/** Feedback émojis du dernier essai : 🟩×N 🟧×M, ou 🟥 seul si aucun. */
export function feedbackLine(greens: number, oranges: number): string {
  if (greens + oranges === 0) return "🟥";
  const parts: string[] = [];
  if (greens > 0) parts.push(`🟩×${greens}`);
  if (oranges > 0) parts.push(`🟧×${oranges}`);
  return parts.join(" ");
}
