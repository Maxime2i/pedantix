// Pédantix — nouvelle interface (Vite + React + TS), thème CLAIR.
// Comportement identique à mobile/web-test/index.html (aligné original) :
// état 100 % client, révélations vertes (présence/lemme) et oranges
// (cosinus, proposition affichée en dégradé), titre jamais orange,
// historique sobre sans température, partage en emojis.
// Ajout : historique des 7 derniers jours (statut localStorage, lecture
// des jours précédents via GET /puzzle?num=X).
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { fetchPuzzle, submitScore } from "./api";
import type { Puzzle, ScoreResponse, Token } from "./api";
import { buildShareText, feedbackLine, orangeColor } from "./game";
import type { Guess, RevealState } from "./game";

interface Toast {
  msg: string;
  success: boolean;
}

/** Statut par jour : {num: {attempts, won}} — persistant en localStorage. */
type DayStatus = Record<number, { attempts: number; won: boolean }>;

const HISTORY_KEY = "pedantix-history";

function loadHistory(): DayStatus {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as DayStatus;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

/** Date d'un num dérivée du jour courant : aujourd'hui = num du jour. */
function dayLabel(num: number, todayNum: number): string {
  const d = new Date();
  d.setDate(d.getDate() - (todayNum - num));
  const label = d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function statusLabel(s: { attempts: number; won: boolean } | undefined): string {
  if (!s) return "À jouer";
  const essais = `${s.attempts} essai${s.attempts > 1 ? "s" : ""}`;
  return s.won ? `Trouvé en ${essais}` : `En cours (${essais})`;
}

export default function App() {
  const [todayNum, setTodayNum] = useState(0);
  const [num, setNum] = useState(0);
  const [title, setTitle] = useState("");
  const [titleWords, setTitleWords] = useState<string[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [revealed, setRevealed] = useState<Record<number, RevealState>>({});
  const [titleRevealed, setTitleRevealed] = useState<Record<number, RevealState>>({});
  const [won, setWon] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [vocabMsg, setVocabMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<DayStatus>(loadHistory);
  const inputRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p: Puzzle = await fetchPuzzle();
        if (cancelled) return;
        setTodayNum(p.num);
        setNum(p.num);
        setTitle(p.title);
        setTitleWords(p.title_words || []);
        setTokens(p.tokens);
      } catch (e) {
        if (!cancelled)
          setError("Impossible de charger le puzzle : " + (e as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (toast) {
      window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setToast(null), 2500);
    }
    return () => window.clearTimeout(toastTimer.current);
  }, [toast]);

  /** Charge un jour précis (aujourd'hui ou un jour passé) et repart de zéro. */
  const loadDay = useCallback(async (target: number) => {
    if (target === num) {
      setHistoryOpen(false);
      return;
    }
    setError(null);
    setVocabMsg(null);
    try {
      const p: Puzzle = await fetchPuzzle(target);
      setNum(p.num);
      setTitle(p.title);
      setTitleWords(p.title_words || []);
      setTokens(p.tokens);
      setGuesses([]);
      setRevealed({});
      setTitleRevealed({});
      setWon(false);
      setFeedback("");
      setInput("");
      setHistoryOpen(false);
      inputRef.current?.focus();
    } catch (e) {
      setError("Impossible de charger ce jour : " + (e as Error).message);
    }
  }, [num]);

  const recordGuess = useCallback(
    (n: number, attempts: number, w: boolean) => {
      setHistory((prev) => {
        const next = { ...prev, [n]: { attempts, won: w } };
        try {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        } catch {
          /* stockage indisponible : on continue sans persistance */
        }
        return next;
      });
    },
    [],
  );

  const applyScore = useCallback(
    (data: ScoreResponse) => {
      // Vert gagne sur orange : une position déjà exacte reste exacte.
      setRevealed((prev) => {
        const next = { ...prev };
        for (const pos of data.revealed_positions || []) {
          next[pos] = { level: "exact", text: tokens[pos]?.w ?? "", cos: null };
        }
        for (const u of data.article_updates || []) {
          if (next[u.pos]?.level !== "exact") {
            next[u.pos] = {
              level: u.level === "exact" ? "exact" : "proche",
              text: u.display || u.word,
              cos: u.cos ?? null,
            };
          }
        }
        return next;
      });
      // Titre : uniquement des révélations VERTES (jamais orange).
      setTitleRevealed((prev) => {
        const next = { ...prev };
        for (const u of data.title_updates || []) {
          if (u.level === "exact") {
            next[u.idx] = { level: "exact", text: u.display || u.word, cos: null };
          }
        }
        return next;
      });
    },
    [tokens],
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const word = input.trim();
    if (!word || won) return;
    setError(null);
    setVocabMsg(null);
    try {
      const data = await submitScore(num, word);
      const newGuesses: Guess[] = [
        ...guesses,
        { word, level: data.temperature_level || "froid", present: !!data.present_in_article },
      ];
      setGuesses(newGuesses);
      applyScore(data);
      const greens =
        (data.revealed_positions || []).length +
        (data.title_updates || []).filter((u) => u.level === "exact").length;
      const oranges = (data.article_updates || []).length;
      setFeedback(feedbackLine(greens, oranges));
      // Hors vocabulaire : le serveur renvoie « Je ne trouve pas ce mot. »
      if (data.cosine == null && !data.present_in_article) {
        setVocabMsg(data.message);
      }
      setInput("");
      recordGuess(num, newGuesses.length, data.title_found);
      if (data.title_found) {
        setWon(true);
      } else {
        inputRef.current?.focus();
      }
    } catch (err) {
      setError("Erreur lors du score : " + (err as Error).message);
    }
  }

  async function handleShare() {
    const text = buildShareText(num, guesses);
    try {
      let copied = false;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(text);
          copied = true;
        } catch {
          copied = false; // permission/API indisponible -> repli DOM
        }
      }
      if (!copied) {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        copied = document.execCommand("copy");
        document.body.removeChild(ta);
      }
      if (!copied) throw new Error("copie refusée par le navigateur");
      setToast({ msg: "Copié !", success: true });
    } catch (err) {
      setError("Impossible de copier : " + (err as Error).message);
    }
  }

  const pastDays = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <h1 className="brand">Pédantix</h1>
          <div className="header-meta">
            {num > 0 && (
              <span className="meta-day">
                Jour nº{num}
                {num !== todayNum ? " · jour passé" : ""}
              </span>
            )}
            <span className="meta-sep">·</span>
            <span className="meta-guesses">
              {guesses.length} essai{guesses.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <button
          type="button"
          className="history-toggle"
          onClick={() => setHistoryOpen((o) => !o)}
          aria-expanded={historyOpen}
          aria-label="Historique des derniers jours"
          title="Historique des derniers jours"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="17" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="history-toggle-label">Historique</span>
        </button>
      </header>

      {num > 0 && todayNum > 0 && num !== todayNum && (
        <button type="button" className="back-today" onClick={() => loadDay(todayNum)}>
          ← Revenir au jour du jour (nº{todayNum})
        </button>
      )}

      {historyOpen && todayNum > 0 && (
        <section className="history-panel" aria-label="Historique des derniers jours">
          <h2 className="section-label">Derniers jours</h2>
          <ul className="days-list">
            {pastDays.map((offset) => {
              const n = todayNum - offset;
              const st = history[n];
              const current = n === num;
              return (
                <li key={n}>
                  <button
                    type="button"
                    className={`day-row${current ? " current" : ""}`}
                    onClick={() => loadDay(n)}
                  >
                    <span className="day-num">Jour nº{n}</span>
                    <span className="day-date">{dayLabel(n, todayNum)}</span>
                    <span className={`day-status${st?.won ? " won" : ""}`}>
                      {statusLabel(st)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {error && <div className="error-banner">{error}</div>}

      {/* Ordre DOM = ordre mobile : titre → saisie (+feedback) → article →
          historique de partie. Sur desktop (>=900px), les aires de la grille
          replacent la sidebar à droite et la saisie sous la grille. */}
      <main className="game">
        <section className="title-section">
          {won ? (
            <p className="title-correct">Bravo ! Le titre était : {title}</p>
          ) : (
            <h2 className="puzzle-title" aria-label="Titre masqué">
              {titleWords.map((w, i) => (
                <Fragment key={i}>
                  {i > 0 && " "}
                  {titleRevealed[i] ? (
                    <span className="w w-exact">{titleRevealed[i].text}</span>
                  ) : (
                    <span
                      className="blank title-blank"
                      style={{ minWidth: `calc(1ch * ${w.length})` }}
                    />
                  )}
                </Fragment>
              ))}
            </h2>
          )}
        </section>

        <form className="controls" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="guess-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Votre mot (ou le titre)"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            disabled={won}
            aria-label="Proposer un mot ou le titre"
          />
          <button type="submit" className="primary" disabled={won}>
            Proposer
          </button>
        </form>
        <div className="feedback" aria-live="polite">
          {feedback}
        </div>
        {vocabMsg && <div className="vocab-msg">{vocabMsg}</div>}

        <section className="article" aria-label="Article masqué">
          {tokens.map((t, i) => {
            const r = revealed[i];
            return (
              <Fragment key={i}>
                {i > 0 && " "}
                {r?.level === "exact" ? (
                  <span className="w w-exact">{r.text}</span>
                ) : r?.level === "proche" ? (
                  <span className="w w-proche" style={{ color: orangeColor(r.cos) }}>
                    {r.text}
                  </span>
                ) : (
                  <span
                    className="blank"
                    style={{ minWidth: `calc(1ch * ${t.w.length})` }}
                  />
                )}
              </Fragment>
            );
          })}
        </section>

        <aside className="sidebar">
          <section className="history">
            <h2 className="section-label">Historique de la partie</h2>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>Mot</th>
                </tr>
              </thead>
              <tbody>
                {guesses.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="empty">
                      Aucun essai
                    </td>
                  </tr>
                ) : (
                  guesses
                    .map((g, i) => ({ g, n: i + 1 }))
                    .reverse()
                    .map(({ g, n }) => (
                      <tr key={n}>
                        <td className="num">{n}</td>
                        <td>{g.word}</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </section>
        </aside>

        <div className="share-row">
          <button type="button" className="share" onClick={handleShare}>
            Partager
          </button>
        </div>
      </main>

      {toast && <div className={`toast${toast.success ? " success" : ""}`}>{toast.msg}</div>}
    </div>
  );
}
