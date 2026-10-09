// Pédantix — interface React, mécanique alignée sur pedantix.certitudes.org,
// thème « magazine chaleureux ». Le client ne connaît que la longueur des mots.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { fetchPuzzle, fetchStats, fetchWikiImage, postPage, postScore, wikiUrl } from "./api";
import type { Node, Puzzle, Secret } from "./api";
import { renderNodes } from "./Article";
import type { CellView, Flash } from "./Article";
import { launchConfetti } from "./confetti";
import { Dialog, Faq, History, Rules, SettingsForm, Share } from "./Dialogs";
import {
  countTurns,
  improves,
  loadSettings,
  normalize,
  puzzleDate,
  saveSettings,
  shareText,
  store,
} from "./game";
import type { Cell, Guesses, Score, Settings, Turns } from "./game";

type DialogName = "rules" | "faq" | "settings" | "history" | "share";
type Sort = "recent" | "close" | "alpha";
type FeedbackKind = "found" | "close" | "miss" | "info" | "error";

/** Résultat du dernier essai (ou message), affiché sous la saisie. */
interface Feedback {
  kind: FeedbackKind;
  text?: string;
  /** Message d'erreur du serveur (HTML). */
  html?: string;
}

const STATS_INTERVAL = 5 * 60 * 1000;
const FLASH_MS = 2000;
const COLLAPSED_ROWS = 5;
const FEEDBACK_ICONS: Record<FeedbackKind, string> = { found: "✓", close: "◐", miss: "✕", info: "✦", error: "⚠" };

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

/** Mots révélés et meilleure proximité d'une proposition. */
function summarize(scores: Record<number, Score>) {
  let found = 0;
  let best = 0;
  for (const s of Object.values(scores)) {
    if (typeof s === "string") found++;
    else best = Math.max(best, s);
  }
  return { found, best };
}

const count = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`;

function describe(word: string, scores: Record<number, Score>, again = false): Feedback {
  const { found, best } = summarize(scores);
  const prefix = again ? `« ${word} » déjà proposé · ` : `« ${word} » · `;
  if (found) return { kind: "found", text: prefix + count(found, "mot révélé", "mots révélés") };
  if (best) return { kind: "close", text: prefix + `proche (${Math.round(best)})` };
  return { kind: "miss", text: prefix + "absent de la page" };
}

function rankLabel(rank: number) {
  const medal = ["", "🥇", "🥈", "🥉"][rank] ?? "";
  if (rank <= 0) return <>–</>;
  return (
    <>
      {medal}
      {rank}
      <sup>{rank === 1 ? "er" : "e"}</sup>
    </>
  );
}

/** Barre de progression : vert (trouvés), orange (proches), reste. */
function ProgressBar({ turns: [green, close, hidden] }: { turns: Turns }) {
  const total = green + close + hidden || 1;
  return (
    <div className="progress-bar" aria-hidden="true">
      <span className="progress-green" style={{ flexGrow: green / total }} />
      <span className="progress-close" style={{ flexGrow: close / total }} />
      <span style={{ flexGrow: hidden / total }} />
    </div>
  );
}

function useTheme(settings: Settings) {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const mode = settings.mode === "system" ? (media.matches ? "dark" : "light") : settings.mode;
      document.documentElement.className = mode;
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [settings.mode]);
}

export default function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cells, setCells] = useState<Cell[]>([]);
  const [fresh, setFresh] = useState<Set<number>>(new Set());
  const [freshClose, setFreshClose] = useState<Set<number>>(new Set());
  const [guesses, setGuesses] = useState<Guesses>({});
  const [nTries, setNTries] = useState(0);
  const [secret, setSecret] = useState<Secret | null>(null);
  const [ranking, setRanking] = useState(0);
  const [turns, setTurns] = useState<Turns>([0, 0, 0]);
  const [solvers, setSolvers] = useState(0);
  const [message, setMessage] = useState<Feedback | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [sort, setSort] = useState<Sort>("recent");
  const [collapsed, setCollapsed] = useState(true);
  const [pinned, setPinned] = useState(false);
  const [dialog, setDialog] = useState<DialogName | null>(null);
  const [see, setSee] = useState(false);
  const [wordMode, setWordMode] = useState(false);
  const [pageWords, setPageWords] = useState<Record<string, string> | null>(null);
  const [wikiImg, setWikiImg] = useState<string | null>(null);
  const [flashes, setFlashes] = useState<Record<number, Flash>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const recent = useRef<string[]>([""]);
  const recentIdx = useRef(0);
  const currentNum = useRef<number | null>(null);

  useTheme(settings);
  const lengths = useMemo(
    () => (puzzle ? cellLengths(puzzle.article, cellLengths(puzzle.title)) : []),
    [puzzle],
  );

  // Chargement du jour et de la partie sauvegardée.
  const load = useCallback(async () => {
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
      if (currentNum.current != null && currentNum.current !== p.num) {
        setSee(false);
        setWordMode(false);
        setPageWords(null);
        setWikiImg(null);
        setMessage({ kind: "info", text: "Nouvelle page du jour !" });
      }
      currentNum.current = p.num;
      setPuzzle(p);
      if (!store.read<boolean>("readRules", false)) {
        setDialog("rules");
        store.write("readRules", true);
      }
    } catch (e) {
      if (currentNum.current == null) setLoadError(`Impossible de charger la page du jour : ${(e as Error).message}`);
      else setMessage({ kind: "error", text: "Pas de connexion. Réessayez." });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Joueurs ayant trouvé : rafraîchi toutes les 5 minutes et au retour sur l'onglet.
  useEffect(() => {
    if (!puzzle) return;
    const tick = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() / 1000 >= puzzle.change + 86400) return void load();
      fetchStats(puzzle.num).then(
        (s) => (s.r ? load() : setSolvers((v) => Math.max(v, s.v ?? 0))),
        () => {},
      );
    };
    const timer = window.setInterval(tick, STATS_INTERVAL);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [puzzle, load]);

  // Une fois la page trouvée, son image illustre le résultat.
  useEffect(() => {
    if (secret && wikiImg == null) {
      fetchWikiImage(secret[0]).then((src) => setWikiImg(src ?? ""), () => setWikiImg(""));
    }
  }, [secret, wikiImg]);

  const guessCount = useMemo(
    () => Object.values(guesses).reduce((m, [n]) => Math.max(m, n), 0),
    [guesses],
  );

  // Sans message récent (ouverture de la page), on rappelle le dernier essai.
  const feedback = useMemo<Feedback | null>(() => {
    if (message) return message;
    const last = Object.entries(guesses).sort((a, b) => b[1][0] - a[1][0])[0];
    return last ? describe(last[0], last[1][1]) : null;
  }, [message, guesses]);

  /** Met en avant une proposition (nouvelle ou déjà jouée) et annonce le résultat. */
  function show(word: string, scores: Record<number, Score>, again = false): Cell[] {
    const r = applyScores(cells, word, scores);
    setCells(r.cells);
    setFresh(r.fresh);
    setFreshClose(r.freshClose);
    setMessage(describe(word, scores, again));
    return r.cells;
  }

  /** Revoir une proposition déjà jouée (depuis la liste des essais). */
  function replay(word: string) {
    if (guesses[word]) show(word, guesses[word][1], true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    inputRef.current?.focus();
    const word = normalize(input);
    if (!word || !puzzle || busy) return;
    recent.current[0] = word;
    recent.current = ["", ...recent.current].slice(0, 21);
    recentIdx.current = 0;
    setInput("");

    if (guesses[word]) {
      show(word, guesses[word][1], true);
      return;
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
      setInput(word);
      setMessage({ kind: "error", text: "Pas de connexion. Réessayez." });
      return;
    } finally {
      setBusy(false);
    }
    if (res.r) return void load();
    if (res.e) {
      setMessage({ kind: "error", html: res.e });
      return;
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
      launchConfetti();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleInputKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      previousInput();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (recentIdx.current > 0) {
        recentIdx.current -= 1;
        setInput(recent.current[recentIdx.current]);
      }
    }
  }

  function previousInput() {
    if (recentIdx.current < recent.current.length - 1) {
      recentIdx.current += 1;
      setInput(recent.current[recentIdx.current]);
    }
    inputRef.current?.focus();
  }

  async function loadPage(): Promise<Record<string, string> | null> {
    if (pageWords) return pageWords;
    if (!secret) return null;
    try {
      const words = await postPage(secret[1]);
      setPageWords(words);
      return words;
    } catch {
      setMessage({ kind: "error", text: "Pas de connexion. Réessayez." });
      return null;
    }
  }

  async function toggleSee(checked: boolean) {
    if (!checked) return setSee(false);
    if (await loadPage()) setSee(true);
  }

  function flash(id: number, value: Flash) {
    setFlashes((f) => ({ ...f, [id]: value }));
    window.setTimeout(() => {
      setFlashes((f) => {
        const next = { ...f };
        delete next[id];
        return next;
      });
    }, FLASH_MS);
  }

  async function handleCellClick(id: number) {
    if (see) return;
    if (secret && wordMode) {
      const words = await loadPage();
      if (words) flash(id, { text: words[id], kind: "word" });
    } else {
      flash(id, { text: String(lengths[id]), kind: "len" });
    }
  }

  /** Partage natif sur mobile, sinon copie dans le presse-papiers. */
  function share() {
    if (!puzzle) return;
    const text = shareText(puzzle.change, nTries, turns);
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      navigator.share({ text }).catch(() => {});
    } else {
      setDialog("share");
    }
  }

  function updateSettings(s: Settings) {
    setSettings(s);
    saveSettings(s);
  }

  const view: CellView = {
    cells,
    fresh,
    freshClose,
    flashes,
    page: see ? pageWords : null,
    onCellClick: handleCellClick,
  };

  const rows = useMemo(() => {
    const list = Object.entries(guesses).map(([word, [n, scores]]) => ({ word, n, ...summarize(scores) }));
    if (sort === "alpha") list.sort((a, b) => a.word.localeCompare(b.word));
    else if (sort === "close") list.sort((a, b) => b.found - a.found || b.best - a.best);
    else list.sort((a, b) => b.n - a.n);
    return collapsed ? list.slice(0, COLLAPSED_ROWS) : list;
  }, [guesses, sort, collapsed]);
  const nGuesses = Object.keys(guesses).length;

  if (loadError) return <div className="app"><div className="error-banner">{loadError}</div></div>;
  if (!puzzle) return <div className="app"><p className="loading-msg">Chargement de la page du jour…</p></div>;

  const progress = countTurns(cells);
  const [green, close, hidden] = progress;
  const percent = (t: Turns) => Math.round((t[0] * 100) / (t[0] + t[1] + t[2] || 1));

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <h1 className="brand">Pédantix</h1>
          <div className="header-meta">
            <span className="meta-day">{puzzleDate(puzzle.change)}</span>
            {solvers > 0 && (
              <>
                <span className="meta-sep">·</span>
                <span className="meta-guesses">Trouvé par {solvers}</span>
              </>
            )}
          </div>
        </div>
        <nav className="header-nav">
          <button type="button" className="rules-toggle" onClick={() => setDialog("rules")}>Règles</button>
          <button type="button" className="rules-toggle" onClick={() => setDialog("faq")}>FAQ</button>
          <button type="button" className="rules-toggle" onClick={() => setDialog("history")}>Historique</button>
          <button type="button" className="rules-toggle" onClick={() => setDialog("settings")}>Réglages</button>
        </nav>
      </header>

      <main className="game">
        <section className="title-section">
          <h2 className={`puzzle-title${see ? " selectable" : ""}`} aria-label="Titre de la page">
            {renderNodes(puzzle.title, view, "t")}
          </h2>
        </section>

        {secret && (
          <section className="success">
            <div className="result-hero">
              {wikiImg ? (
                <img className="result-img" src={wikiImg} alt="" />
              ) : (
                <div className="result-img result-trophy" aria-hidden="true">🏆</div>
              )}
              <div>
                <p className="result-kicker">Bravo ! La page du {puzzleDate(puzzle.change).toLowerCase()} était</p>
                <p className="result-title">{secret[1]}</p>
              </div>
            </div>
            <div className="tiles">
              <div className="tile">
                <b>{nTries}</b>
                <span>{nTries > 1 ? "coups" : "coup"}</span>
              </div>
              <div className="tile">
                <b>{rankLabel(ranking)}</b>
                <span>rang du jour</span>
              </div>
              <div className="tile">
                <b>{percent(turns)} %</b>
                <span>page révélée</span>
              </div>
            </div>
            <ProgressBar turns={turns} />
            <div className="result-actions">
              <button type="button" className="primary" onClick={share}>
                Partager mon résultat
              </button>
              <a className="secondary" href={wikiUrl(secret[0])} target="_blank" rel="noopener noreferrer">
                Lire sur Wikipédia ↗
              </a>
            </div>
            <p className="success-options">
              <label>
                <input type="checkbox" checked={see} onChange={(e) => toggleSee(e.target.checked)} /> Afficher toute
                la page
              </label>
              <label>
                <input type="checkbox" checked={wordMode} onChange={(e) => setWordMode(e.target.checked)} />{" "}
                Révéler un mot en cliquant dessus
              </label>
            </p>
            <p className="muted result-footer">Revenez demain à midi pour une nouvelle page.</p>
          </section>
        )}

        <form className={`controls${pinned ? " pinned" : ""}`} onSubmit={handleSubmit}>
          <button
            type="button"
            className="pin"
            onClick={() => setPinned((p) => !p)}
            title={pinned ? "Détacher la saisie" : "Garder la saisie visible"}
            aria-pressed={pinned}
          >
            {pinned ? "📌" : "📍"}
          </button>
          <div className="guessbox">
            <input
              ref={inputRef}
              type="search"
              className="guess-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleInputKey}
              placeholder={secret ? "Continuer à jouer…" : "Proposer un mot"}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              autoFocus
              aria-label="Proposer un mot"
            />
            {recent.current.length > 1 && (
              <button type="button" className="previous" onClick={previousInput} title="Essai précédent">
                ⤺
              </button>
            )}
          </div>
          <button type="submit" className="primary" disabled={busy}>
            Envoyer
          </button>
        </form>
        <div className={`feedback${feedback ? ` feedback-${feedback.kind}` : ""}`} aria-live="polite">
          {feedback && (
            <>
              <span className="feedback-icon" aria-hidden="true">
                {FEEDBACK_ICONS[feedback.kind]}
              </span>
              {feedback.html ? (
                <span dangerouslySetInnerHTML={{ __html: feedback.html }} />
              ) : (
                <span>{feedback.text}</span>
              )}
            </>
          )}
        </div>

        <section className={`article${see ? " selectable" : ""}`} aria-label="Page masquée">
          {see && wikiImg ? <img className="wiki-img" src={wikiImg} alt="" /> : null}
          {renderNodes(puzzle.article, view, "a")}
        </section>

        <aside className="sidebar">
          <section className="history">
            <div className="day-meter" aria-label={`Page révélée à ${percent(progress)} %`}>
              <ProgressBar turns={[green, close, hidden]} />
              <span className="day-percent">{percent(progress)} %</span>
            </div>
            <div className="guesses-head">
              <h3>Vos essais{nGuesses ? ` · ${nGuesses}` : ""}</h3>
              <div className="segmented" role="tablist" aria-label="Trier les essais">
                {(
                  [
                    ["recent", "Récents"],
                    ["close", "Meilleurs"],
                    ["alpha", "A → Z"],
                  ] as [Sort, string][]
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={sort === key}
                    className={sort === key ? "on" : ""}
                    onClick={() => setSort(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {rows.length === 0 ? (
              <p className="empty">Aucun essai pour l’instant.</p>
            ) : (
              <ul className="guess-list">
                {rows.map((g) => (
                  <li key={g.word}>
                    <button type="button" onClick={() => replay(g.word)} title="Remettre en évidence">
                      <span className="num">{g.n}</span>
                      <span className="word">{g.word}</span>
                      {g.found ? (
                        <span className="pill pill-found">{count(g.found, "mot", "mots")}</span>
                      ) : g.best ? (
                        <span className="pill pill-close">{Math.round(g.best)}</span>
                      ) : (
                        <span className="pill-none">—</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {nGuesses > COLLAPSED_ROWS && (
              <button type="button" className="link-button show-all" onClick={() => setCollapsed((c) => !c)}>
                {collapsed ? `Tout afficher (${nGuesses})` : "Réduire"}
              </button>
            )}
            {puzzle.yesterday[1] && (
              <p className="yesterday">
                Page d’hier :{" "}
                <a href={wikiUrl(puzzle.yesterday[0])} target="_blank" rel="noopener noreferrer">
                  <b>{puzzle.yesterday[1]}</b>
                </a>
              </p>
            )}
          </section>
        </aside>
      </main>

      <footer className="footer">
        Textes : <a href="https://fr.wikipedia.org">Wikipédia</a> (CC BY-SA 4.0). Proximité : modèle frWac de{" "}
        <a href="https://fauconnier.github.io/#data">Jean-Philippe Fauconnier</a> (CC BY 3.0). Lemmes :{" "}
        <a href="http://www.lexique.org/">Lexique 3.83</a>. <a href="/confidentialite/">Confidentialité</a>.
      </footer>

      {dialog === "rules" && (
        <Dialog title="Comment jouer" onClose={() => setDialog(null)}>
          <Rules change={puzzle.change} onStart={() => setDialog(null)} />
        </Dialog>
      )}
      {dialog === "faq" && (
        <Dialog title="Questions fréquentes" onClose={() => setDialog(null)}>
          <Faq />
        </Dialog>
      )}
      {dialog === "settings" && (
        <Dialog title="Réglages" onClose={() => setDialog(null)}>
          <SettingsForm settings={settings} onChange={updateSettings} />
        </Dialog>
      )}
      {dialog === "history" && (
        <Dialog title="Historique" onClose={() => setDialog(null)}>
          <History puzzle={puzzle} solvers={solvers} secret={secret} />
        </Dialog>
      )}
      {dialog === "share" && (
        <Dialog title="Partager" onClose={() => setDialog(null)}>
          <Share text={shareText(puzzle.change, nTries, turns)} />
        </Dialog>
      )}
    </div>
  );
}
