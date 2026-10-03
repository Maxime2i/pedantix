// Client de l'API Pédantix (mobile/backend). Même protocole que l'original :
// le puzzle ne contient que la longueur des mots cachés.

/** Nœud d'article : texte visible, case {w: id, n: longueur}, ou balise. */
export type Node = string | { w: number; n: number } | { t: string; c: Node[] };

export interface Puzzle {
  num: number;
  /** Instant (epoch, s) du changement de page, à midi heure de Paris. */
  change: number;
  /** Nombre de cases du titre : ids 0..k-1. */
  k: number;
  count: number;
  title: Node[];
  article: Node[];
  yesterday: [string, string];
  v: number;
}

/** [titre pour l'URL Wikipédia, titre affiché] */
export type Secret = [string, string];

export interface ScoreResponse {
  /** Le temps imparti est écoulé : il faut recharger la page. */
  r?: boolean;
  /** Message d'erreur (HTML). */
  e?: string;
  w?: string;
  /** Révélations : mot réel → ids, ou "#score" → ids des mots proches. */
  x?: Record<string, number[]>;
  /** Nombre de joueurs ayant trouvé (votre rang si `d` est présent). */
  v?: number;
  /** Page secrète, présente quand le titre est trouvé. */
  d?: Secret;
}

export type HistoryRow = [number, number, Secret];

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:5000";

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const resp = await fetch(`${API_BASE}${path}`, init);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return (await resp.json()) as T;
}

const post = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export const fetchPuzzle = () => json<Puzzle>("/puzzle");

export const postScore = (num: number, word: string, answer: string[]) =>
  json<ScoreResponse>(`/score?n=${num}`, post({ num, word, answer }));

/** Tous les mots de la page, une fois le titre connu. */
export const postPage = (answer: string) =>
  json<Record<string, string>>("/page", post({ answer }));

export const fetchStats = (num: number) => json<{ v?: number; r?: boolean }>(`/stats?n=${num}`);

export const fetchHistory = () => json<HistoryRow[]>("/history");

/** Vignette de l'article (API Wikipédia). */
export async function fetchWikiImage(urlTitle: string): Promise<string | null> {
  const url =
    "https://fr.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json" +
    `&origin=*&pithumbsize=300&titles=${encodeURIComponent(urlTitle)}`;
  const data = await (await fetch(url)).json();
  for (const page of Object.values(data?.query?.pages ?? {}) as { thumbnail?: { source: string } }[]) {
    if (page.thumbnail?.source) return page.thumbnail.source;
  }
  return null;
}

export const wikiUrl = (urlTitle: string) =>
  `https://fr.wikipedia.org/wiki/${encodeURIComponent(urlTitle).replace(/%2F/g, "/")}`;
