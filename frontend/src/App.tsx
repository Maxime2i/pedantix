// Pédantix — interface React, mécanique alignée sur pedantix.certitudes.org,
// thème « magazine chaleureux ». Le client ne connaît que la longueur des mots.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { fetchPuzzle, fetchStats, fetchWikiImage, postPage, postScore, wikiUrl } from "./api";
import type { Node, Puzzle, Secret } from "./api";
import { renderNodes } from "./Article";
import type { CellView, Flash } from "./Article";
import { launchConfetti } from "./confetti";
import { Colors, Dialog, Faq, History, Rules, Share } from "./Dialogs";
import {
  BLIND_BLOCKS,
  BLOCKS,
  countTurns,
  improves,
  loadSettings,
  normalize,
  plural,
  saveSettings,
  shareText,
  store,
  story,
} from "./game";
import type { Cell, Guesses, Score, Settings, Turns } from "./game";

type DialogName = "rules" | "faq" | "colors" | "history" | "share";

const STATS_INTERVAL = 5 * 60 * 1000;
const FLASH_MS = 2000;
const COLLAPSED_ROWS = 5;
const EXPIRED_MSG = "Le temps imparti de 24h s’est écoulé. Rafraîchissement en cours…";

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

function rankLabel(rank: number) {
  const medal = ["", "🥇", "🥈", "🥉"][rank] ?? "";
  if (rank <= 0) return <>N<sup>ème</sup></>;
  return (
    <>
      {medal}
      {rank}
      <sup>{rank === 1 ? "er" : "e"}</sup>
    </>
  );
}

function useTheme(settings: Settings) {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const mode = settings.mode === "system" ? (media.matches ? "dark" : "light") : settings.mode;
      document.documentElement.className = `${mode}-${settings.palette}`;
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [settings.mode, settings.palette]);
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
  const [message, setMessage] = useState<{ html?: string; text?: string }>({});
  const [input, setInput] = useState("");
  const [placeholder, setPlaceholder] = useState("Mot");
  const [busy, setBusy] = useState(false);
  const [alpha, setAlpha] = useState(false);
  const [chronoDir, setChronoDir] = useState(-1);
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

  useTheme(settings);
  const blocks = settings.blind ? BLIND_BLOCKS : BLOCKS;
  const lengths = useMemo(
    () => (puzzle ? cellLengths(puzzle.article, cellLengths(puzzle.title)) : []),
    [puzzle],
  );

  const expire = useCallback(() => {
    setMessage({ text: EXPIRED_MSG });
    window.setTimeout(() => window.location.reload(), 3000);
  }, []);

  // Chargement du jour et de la partie sauvegardée.
  useEffect(() => {
    fetchPuzzle().then(
      (p) => {
        store.startDay(p.num);
        const saved = store.read<Guesses>("guesses", {});
        let restored: Cell[] = Array.from({ length: p.count }, () => ({ word: "", score: 0 }));
        for (const [word, [, scores]] of Object.entries(saved).sort((a, b) => a[1][0] - b[1][0])) {
          restored = applyScores(restored, word, scores).cells;
        }
        setCells(restored);
        setGuesses(saved);
        setNTries(Math.abs(store.day(p.num) ?? 0));
        setSecret(store.read<Secret | null>("secret", null));
        setRanking(store.read<number>("ranking", 0));
        setTurns(store.read<Turns>("turns", [0, 0, 0]));
        setSolvers(p.v);
        setPuzzle(p);
        if (!store.read<boolean>("readRules", false)) {
          setDialog("rules");
          store.write("readRules", true);
        }
      },
      (e: Error) => setLoadError(`Impossible de charger la page du jour : ${e.message}`),
    );
  }, []);

  // « Trouvé par N personnes », rafraîchi toutes les 5 minutes.
  useEffect(() => {
    if (!puzzle) return;
    const tick = () => {
      if (document.visibilityState !== "visible") return;
      fetchStats(puzzle.num).then(
        (s) => (s.r ? expire() : setSolvers((v) => Math.max(v, s.v ?? 0))),
        () => {},
      );
    };
    const timer = window.setInterval(tick, STATS_INTERVAL);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [puzzle, expire]);

  const guessCount = useMemo(
    () => Object.values(guesses).reduce((m, [n]) => Math.max(m, n), 0),
    [guesses],
  );

  /** Affiche une proposition (nouvelle ou déjà jouée) et le retour en carrés. */
  function show(word: string, scores: Record<number, Score>): Cell[] {
    const r = applyScores(cells, word, scores);
    setCells(r.cells);
    setFresh(r.fresh);
    setFreshClose(r.freshClose);
    const feedback =
      blocks.green.repeat(r.fresh.size) +
      blocks.orange.repeat(r.freshClose.size) +
      (r.fresh.size + r.freshClose.size ? "" : blocks.red);
    setMessage({ text: feedback });
    return r.cells;
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
    setPlaceholder(word);
    setMessage({});

    if (guesses[word]) {
      show(word, guesses[word][1]);
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
      setMessage({ text: "Une erreur s’est produite." });
      return;
    } finally {
      setBusy(false);
    }
    if (res.r) return expire();
    if (res.e) {
      setMessage({ html: res.e });
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
      if (settings.animation) launchConfetti();
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
      setMessage({ text: "Une erreur s’est produite." });
      return null;
    }
  }

  async function toggleSee(checked: boolean) {
    if (!checked) {
      setSee(false);
      return;
    }
    if (!(await loadPage())) return;
    setSee(true);
    if (secret && wikiImg == null) {
      fetchWikiImage(secret[0]).then((src) => setWikiImg(src ?? ""), () => setWikiImg(""));
    }
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
    const entries = Object.entries(guesses);
    if (alpha) entries.sort((a, b) => a[0].localeCompare(b[0]));
    else entries.sort((a, b) => chronoDir * (a[1][0] - b[1][0]));
    return collapsed ? entries.slice(0, COLLAPSED_ROWS) : entries;
  }, [guesses, alpha, chronoDir, collapsed]);

  if (loadError) return <div className="app"><div className="error-banner">{loadError}</div></div>;
  if (!puzzle) return <div className="app"><p className="loading-msg">Chargement de la page du jour…</p></div>;

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <h1 className="brand">Pédantix</h1>
          <div className="header-meta">
            <span className="meta-day">Jour nº{puzzle.num}</span>
            {solvers > 0 && (
              <>
                <span className="meta-sep">·</span>
                <span className="meta-guesses">
                  Trouvé par {solvers > 1 ? `${solvers} personnes` : "1 personne"}
                </span>
              </>
            )}
          </div>
        </div>
        <nav className="header-nav">
          <button type="button" className="rules-toggle" onClick={() => setDialog("rules")}>Règles</button>
          <button type="button" className="rules-toggle" onClick={() => setDialog("faq")}>FAQ</button>
          <button type="button" className="rules-toggle" onClick={() => setDialog("colors")}>Couleurs</button>
          <button type="button" className="rules-toggle" onClick={() => setDialog("history")}>Historique</button>
        </nav>
      </header>

      <main className="game">
        <section className="title-section">
          <h2 className={`puzzle-title${see ? " selectable" : ""}`} aria-label="Titre de la page">
            {renderNodes(puzzle.title, view, "t")}
            {see && wikiImg ? <img className="wiki-img" src={wikiImg} alt="" /> : null}
          </h2>
        </section>

        {secret && (
          <section className="success">
            <p>
              <b>Bravo !</b> Vous êtes <b>{rankLabel(ranking)}</b> à la trouver, en{" "}
              <b>{plural(nTries, "coup")}</b>. Résumé du jour :
            </p>
            <p className="story">{story(turns, 20, blocks)}</p>
            <p>
              <button type="button" className="link-button" onClick={() => setDialog("share")}>
                Partagez
              </button>{" "}
              et revenez jouer demain.
            </p>
            <p className="success-options">
              <label>
                <input type="checkbox" checked={see} onChange={(e) => toggleSee(e.target.checked)} /> Voir la{" "}
                <a href={wikiUrl(secret[0])} target="_blank" rel="noopener noreferrer">
                  page
                </a>
              </label>
              <label>
                <input type="checkbox" checked={wordMode} onChange={(e) => setWordMode(e.target.checked)} />{" "}
                Révéler les mots séparément
              </label>
            </p>
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
              placeholder={placeholder}
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
        {message.html ? (
          <div className="feedback" aria-live="polite" dangerouslySetInnerHTML={{ __html: message.html }} />
        ) : (
          <div className="feedback" aria-live="polite">
            {message.text}
          </div>
        )}

        <section className={`article${see ? " selectable" : ""}`} aria-label="Page masquée">
          {renderNodes(puzzle.article, view, "a")}
        </section>

        <aside className="sidebar">
          <section className="history">
            <p className="day-meter" aria-label="Progression du jour">
              {story(countTurns(cells), 10, blocks)}
            </p>
            <table className="history-table">
              <thead>
                <tr>
                  <th>
                    <button
                      type="button"
                      className="sort"
                      onClick={() => {
                        if (!alpha) setChronoDir((d) => -d);
                        setAlpha(false);
                      }}
                    >
                      Nº
                    </button>
                  </th>
                  <th>
                    <button type="button" className="sort" onClick={() => setAlpha(true)}>
                      Mot
                    </button>
                  </th>
                  <th className="collapse-cell">
                    <button
                      type="button"
                      className="sort"
                      onClick={() => setCollapsed((c) => !c)}
                      title={collapsed ? "Tout afficher" : "Minimiser"}
                    >
                      {collapsed ? "🔻" : "🔺"}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="empty">
                      Aucun essai
                    </td>
                  </tr>
                ) : (
                  rows.map(([word, [n]]) => (
                    <tr key={word}>
                      <td className="num">{n}</td>
                      <td colSpan={2}>{word}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {puzzle.yesterday[1] && (
              <p className="yesterday">
                La page d’hier était :<br />
                <a href={wikiUrl(puzzle.yesterday[0])} target="_blank" rel="noopener noreferrer">
                  <b>{puzzle.yesterday[1]}</b>
                </a>
              </p>
            )}
          </section>
        </aside>
      </main>

      <footer className="footer">
        Données de <a href="https://fauconnier.github.io/#data">Jean-Philippe Fauconnier</a>,{" "}
        <a href="http://www.lexique.org/">Lexique 3.83</a> et <a href="https://fr.wikipedia.org">Wikipédia</a>.
      </footer>

      {dialog === "rules" && (
        <Dialog title="Comment jouer" onClose={() => setDialog(null)}>
          <Rules change={puzzle.change} />
        </Dialog>
      )}
      {dialog === "faq" && (
        <Dialog title="FAQ" onClose={() => setDialog(null)}>
          <Faq />
        </Dialog>
      )}
      {dialog === "colors" && (
        <Dialog title="Couleurs" onClose={() => setDialog(null)}>
          <Colors settings={settings} onChange={updateSettings} />
        </Dialog>
      )}
      {dialog === "history" && (
        <Dialog title="Historique" onClose={() => setDialog(null)}>
          <History num={puzzle.num} solvers={solvers} secret={secret} />
        </Dialog>
      )}
      {dialog === "share" && (
        <Dialog title="Partager" onClose={() => setDialog(null)}>
          <Share text={shareText(puzzle.num, nTries, turns)} />
        </Dialog>
      )}
    </div>
  );
}
