// État de la partie, partagé entre les onglets et les feuilles.
// Mécanique identique au site (frontend/src/App.tsx).
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AppState } from "react-native";
import * as Haptics from "expo-haptics";
import { fetchPuzzle, fetchStats, fetchWikiImage, postPage, postScore } from "./api";
import type { Node, Puzzle, Secret } from "./api";
import type { Flash } from "./Article";
import { countTurns, improves, normalize, store } from "./game";
import type { Cell, Guesses, Score, Turns } from "./game";

const STATS_INTERVAL = 5 * 60 * 1000;
const FLASH_MS = 2000;

export type FeedbackKind = "found" | "close" | "miss" | "info" | "error";
/** Résultat du dernier essai (ou message), affiché sous la saisie. */
export interface Feedback {
  id: number;
  kind: FeedbackKind;
  text: string;
}

/** Résumé d'une proposition : mots révélés et meilleure proximité. */
export interface GuessSummary {
  word: string;
  n: number;
  found: number;
  best: number;
}

/** Longueur de chaque case, indexée par id. */
function cellLengths(nodes: Node[], out: number[] = []): number[] {
  for (const node of nodes) {
    if (typeof node === "string") continue;
    if ("w" in node) out[node.w] = node.n;
    else cellLengths(node.c, out);
  }
  return out;
}

/** Applique les scores d'une proposition ; renvoie les cases mises en avant. */
function applyScores(cells: Cell[], word: string, scores: Record<number, Score>) {
  const next = cells.slice();
  const fresh = new Set<number>();
  const freshClose = new Set<number>();
  for (const [key, score] of Object.entries(scores)) {
    const id = Number(key);
    if (!next[id] || !improves(next[id], word, score)) continue;
    next[id] = { word, score };
    (typeof score === "string" ? fresh : freshClose).add(id);
  }
  return { cells: next, fresh, freshClose };
}

function parseScores(x: Record<string, number[]> = {}): Record<number, Score> {
  const scores: Record<number, Score> = {};
  for (const [key, ids] of Object.entries(x)) {
    const score = key.startsWith("#") ? Number(key.slice(1)) : key;
    for (const id of ids) scores[id] = score;
  }
  return scores;
}

function summarize(scores: Record<number, Score>) {
  let found = 0;
  let best = 0;
  for (const s of Object.values(scores)) {
    if (typeof s === "string") found++;
    else best = Math.max(best, s);
  }
  return { found, best };
}

/** Les messages d'erreur du serveur sont en HTML. */
const stripHtml = (html: string) => html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`;

function describe(word: string, scores: Record<number, Score>, again = false): { kind: FeedbackKind; text: string } {
  const { found, best } = summarize(scores);
  const prefix = again ? `« ${word} » déjà proposé · ` : `« ${word} » · `;
  if (found) return { kind: "found", text: prefix + plural(found, "mot révélé", "mots révélés") };
  if (best) return { kind: "close", text: prefix + `proche (${Math.round(best)})` };
  return { kind: "miss", text: prefix + "absent de la page" };
}

function useGameState() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [cells, setCells] = useState<Cell[]>([]);
  const [fresh, setFresh] = useState<Set<number>>(new Set());
  const [freshClose, setFreshClose] = useState<Set<number>>(new Set());
  const [guesses, setGuesses] = useState<Guesses>({});
  const [nTries, setNTries] = useState(0);
  const [secret, setSecret] = useState<Secret | null>(null);
  const [ranking, setRanking] = useState(0);
  const [turns, setTurns] = useState<Turns>([0, 0, 0]);
  const [solvers, setSolvers] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Feedback | null>(null);
  const [see, setSee] = useState(false);
  const [wordMode, setWordMode] = useState(false);
  const [pageWords, setPageWords] = useState<Record<string, string> | null>(null);
  const [wikiImg, setWikiImg] = useState<string | null>(null);
  const [flashes, setFlashes] = useState<Record<number, Flash>>({});
  /** Incrémenté à chaque victoire : ouvre la feuille de résultat. */
  const [wins, setWins] = useState(0);
  /** Première ouverture : afficher les règles. */
  const [firstLaunch, setFirstLaunch] = useState(false);
  const messageId = useRef(0);

  const lengths = useMemo(
    () => (puzzle ? cellLengths(puzzle.article, cellLengths(puzzle.title)) : []),
    [puzzle],
  );

  const notify = useCallback((kind: FeedbackKind, text: string) => {
    messageId.current += 1;
    setMessage({ id: messageId.current, kind, text });
  }, []);

  // Chargement du jour et de la partie sauvegardée.
  const load = useCallback(async (pull = false) => {
    if (pull) setRefreshing(true);
    setLoadError(null);
    try {
      const p = await fetchPuzzle();
      store.startDay(p.num);
      const saved = store.read<Guesses>("guesses", {});
      let restored: Cell[] = Array.from({ length: p.count }, () => ({ word: "", score: 0 }));
      for (const [word, [, scores]] of Object.entries(saved).sort((a, b) => a[1][0] - b[1][0])) {
        restored = applyScores(restored, word, scores).cells;
      }
      setCells(restored);
      setFresh(new Set());
      setFreshClose(new Set());
      setGuesses(saved);
      setNTries(Math.abs(store.day(p.num) ?? 0));
      setSecret(store.read<Secret | null>("secret", null));
      setRanking(store.read<number>("ranking", 0));
      setTurns(store.read<Turns>("turns", [0, 0, 0]));
      setSolvers(p.v);
      if (p.num !== puzzle?.num) {
        setMessage(null);
        setSee(false);
        setPageWords(null);
        setWikiImg(null);
      }
      setPuzzle(p);
      if (!store.read<boolean>("readRules", false)) {
        setFirstLaunch(true);
        store.write("readRules", true);
      }
    } catch (e) {
      if (pull) notify("error", "Pas de connexion. Réessayez.");
      else setLoadError((e as Error).message);
    } finally {
      setRefreshing(false);
    }
  }, [notify, puzzle?.num]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const expire = useCallback(() => {
    notify("info", "Nouvelle page du jour !");
    load();
  }, [load, notify]);

  // Joueurs ayant trouvé : rafraîchi toutes les 5 minutes et au retour dans l'app.
  useEffect(() => {
    if (!puzzle) return;
    const tick = () => {
      if (AppState.currentState !== "active") return;
      if (Date.now() / 1000 >= puzzle.change + 86400) return expire();
      fetchStats(puzzle.num).then(
        (s) => (s.r ? expire() : setSolvers((v) => Math.max(v, s.v ?? 0))),
        () => {},
      );
    };
    const timer = setInterval(tick, STATS_INTERVAL);
    const sub = AppState.addEventListener("change", tick);
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [puzzle, expire]);

  const guessCount = useMemo(
    () => Object.values(guesses).reduce((m, [n]) => Math.max(m, n), 0),
    [guesses],
  );

  const summaries = useMemo<GuessSummary[]>(
    () => Object.entries(guesses).map(([word, [n, scores]]) => ({ word, n, ...summarize(scores) })),
    [guesses],
  );

  // Sans message récent (ouverture de l'app), on rappelle le dernier essai.
  const feedback = useMemo<Feedback | null>(() => {
    if (message) return message;
    const last = Object.entries(guesses).sort((a, b) => b[1][0] - a[1][0])[0];
    return last ? { id: 0, ...describe(last[0], last[1][1]) } : null;
  }, [message, guesses]);

  /** Met en avant une proposition et annonce le résultat. */
  function show(word: string, scores: Record<number, Score>, again = false): Cell[] {
    const r = applyScores(cells, word, scores);
    setCells(r.cells);
    setFresh(r.fresh);
    setFreshClose(r.freshClose);
    const d = describe(word, scores, again);
    notify(d.kind, d.text);
    return r.cells;
  }

  /** Revoir une proposition déjà jouée (depuis la liste des essais). */
  function replay(word: string) {
    if (guesses[word]) show(word, guesses[word][1], true);
  }

  /** Envoie une proposition ; renvoie false si elle n'a pas pu être traitée. */
  async function submit(raw: string): Promise<boolean> {
    const word = normalize(raw);
    if (!word || !puzzle || busy) return false;

    if (guesses[word]) {
      show(word, guesses[word][1], true);
      return true;
    }

    // Pour chaque case du titre : le mot déjà trouvé, sinon la proposition.
    // Une fois la page trouvée, rien : le serveur ne compte chaque joueur qu'une fois.
    const answer = secret
      ? []
      : cells.slice(0, puzzle.k).map((c) => (typeof c.score === "string" ? c.score : word));
    setBusy(true);
    let res;
    try {
      res = await postScore(puzzle.num, word, answer);
    } catch {
      notify("error", "Pas de connexion. Réessayez.");
      return false;
    } finally {
      setBusy(false);
    }
    if (res.r) {
      expire();
      return true;
    }
    if (res.e) {
      notify("error", stripHtml(res.e));
      return true;
    }

    const scores = parseScores(res.x);
    const n = guessCount + 1;
    const nextGuesses: Guesses = { ...guesses, [word]: [n, scores] };
    if (res.w && res.w !== word) nextGuesses[res.w] = [n, scores];
    setGuesses(nextGuesses);
    store.write("guesses", nextGuesses);

    let tries = nTries;
    if (!secret) {
      tries += 1;
      setNTries(tries);
      store.setDay(puzzle.num, -tries);
    }
    const nextCells = show(res.w ?? word, scores);
    if (res.v != null) setSolvers((v) => Math.max(v, res.v!));

    if (!secret && res.d) {
      const finalTurns = countTurns(nextCells);
      const rank = res.v ?? 0;
      setSecret(res.d);
      setTurns(finalTurns);
      setRanking(rank);
      store.write("secret", res.d);
      store.write("turns", finalTurns);
      store.write("ranking", rank);
      store.setDay(puzzle.num, tries);
      setWins((w) => w + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    return true;
  }

  async function loadPage(): Promise<Record<string, string> | null> {
    if (pageWords) return pageWords;
    if (!secret) return null;
    try {
      const words = await postPage(secret[1]);
      setPageWords(words);
      return words;
    } catch {
      notify("error", "Pas de connexion. Réessayez.");
      return null;
    }
  }

  async function toggleSee(on: boolean) {
    if (!on) return setSee(false);
    if (await loadPage()) setSee(true);
  }

  function flash(id: number, value: Flash) {
    setFlashes((f) => ({ ...f, [id]: value }));
    setTimeout(() => {
      setFlashes((f) => {
        const next = { ...f };
        delete next[id];
        return next;
      });
    }, FLASH_MS);
  }

  async function pressCell(id: number) {
    if (see) return;
    if (secret && wordMode) {
      const words = await loadPage();
      if (words) flash(id, { text: words[id], kind: "word" });
    } else {
      flash(id, { text: String(lengths[id]), kind: "len" });
    }
  }

  // Une fois la page trouvée, l'image de l'article sert d'en-tête au résultat.
  useEffect(() => {
    if (secret && wikiImg == null) {
      fetchWikiImage(secret[0]).then((src) => setWikiImg(src ?? ""), () => setWikiImg(""));
    }
  }, [secret, wikiImg]);

  return {
    puzzle,
    loadError,
    refreshing,
    load,
    cells,
    fresh,
    freshClose,
    flashes,
    progress: countTurns(cells),
    summaries,
    nTries,
    secret,
    ranking,
    turns,
    solvers,
    busy,
    feedback,
    submit,
    replay,
    pressCell,
    see,
    toggleSee,
    pageWords,
    wordMode,
    setWordMode,
    wikiImg,
    wins,
    firstLaunch,
    clearFirstLaunch: () => setFirstLaunch(false),
  };
}

export type Game = ReturnType<typeof useGameState>;

const GameContext = createContext<Game | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const game = useGameState();
  return <GameContext.Provider value={game}>{children}</GameContext.Provider>;
}

export function useGame(): Game {
  const game = useContext(GameContext);
  if (!game) throw new Error("useGame hors de GameProvider");
  return game;
}
