// Client API du backend Pédantix (mobile/backend, Flask).
// Le frontend n'a AUCUNE logique de température : il affiche ce que renvoie
// l'API (révélations vertes/oranges, victoire, message hors vocabulaire).

export interface Token {
  w: string;
  hidden: boolean;
}

export interface Puzzle {
  num: number;
  title: string;
  title_hidden: boolean;
  title_words: string[];
  words: string[];
  tokens: Token[];
  thresholds: { exact: number; proche: number };
  revealed: unknown[];
}

export type TempLevel = "exact" | "proche" | "froid";

export interface ArticleUpdate {
  pos: number;
  word: string;
  display: string;
  level: string;
  source: string;
  cos: number | null;
}

export interface TitleUpdate {
  idx: number;
  word: string;
  display: string;
  level: string;
}

export interface ScoreResponse {
  word: string;
  title_found: boolean;
  correct: boolean;
  cosine: number | null;
  score: number;
  temperature_level: TempLevel;
  revealed_positions: number[];
  article_updates: ArticleUpdate[];
  title_updates: TitleUpdate[];
  present_in_article: boolean;
  message: string;
}

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:5000";

async function json<T>(url: string, init?: RequestInit): Promise<T> {
  const resp = await fetch(url, init);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return (await resp.json()) as T;
}

export function fetchPuzzle(): Promise<Puzzle> {
  return json<Puzzle>(`${API_BASE}/puzzle`);
}

export function submitScore(num: number, word: string): Promise<ScoreResponse> {
  return json<ScoreResponse>(`${API_BASE}/score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ num, word }),
  });
}
