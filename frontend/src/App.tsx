// Pédantix — nouvelle interface (Vite + React + TS).
// Comportement identique à mobile/web-test/index.html (aligné original) :
// état 100 % client, révélations vertes (présence/lemme) et oranges
// (cosinus, proposition affichée en dégradé), titre jamais orange,
// historique sobre sans température, partage en emojis.
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

export default function App() {
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
  const inputRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p: Puzzle = await fetchPuzzle();
        if (cancelled) return;
        setNum(p.num);
        setTitle(p.title);
        setTitleWords(p.title_words || []);
        setTokens(p.tokens);
      } catch (e) {
        if (!cancelled) setError("Impossible de charger le puzzle : " + (e as Error).message);
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
      setGuesses((prev) => [
        ...prev,
        { word, level: data.temperature_level || "froid", present: !!data.present_in_article },
      ]);
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
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setToast({ msg: "Copié !", success: true });
    } catch (err) {
      setError("Impossible de copier : " + (err as Error).message);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1 className="brand">Pédantix</h1>
        <div className="header-meta">
          {num > 0 && <span className="meta-day">Jour nº{num}</span>}
          <span className="meta-guesses">
            {guesses.length} essai{guesses.length > 1 ? "s" : ""}
          </span>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <main>
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

        <section className="history">
          <h2 className="section-label">Historique</h2>
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
      </main>

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

      <div className="share-row">
        <button type="button" className="share" onClick={handleShare}>
          Partager
        </button>
      </div>

      {toast && <div className={`toast${toast.success ? " success" : ""}`}>{toast.msg}</div>}
    </div>
  );
}
