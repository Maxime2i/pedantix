// Boîtes de dialogue : règles, FAQ, réglages, historique, partage.
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { fetchHistory, wikiUrl } from "./api";
import type { HistoryRow, Puzzle, Secret } from "./api";
import { puzzleDate, store } from "./game";
import type { Mode, Settings } from "./game";

export function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Fermer">
          ×
        </button>
        <h2 className="modal-title">{title}</h2>
        {children}
      </div>
    </div>
  );
}

const STEPS: [string, string, string][] = [
  ["📄", "Une page Wikipédia cachée", "Chaque jour, tous les mots d’un article sont masqués. Retrouvez son titre."],
  [
    "✏️",
    "Proposez des mots",
    "Un mot présent dans l’article apparaît partout où il se trouve. L’infinitif ou le masculin singulier révèle aussi les autres formes. Les accents comptent.",
  ],
  [
    "◐",
    "Les mots proches",
    "Un mot proche par le sens s’inscrit en gris dans la boîte : plus il est clair, plus il est proche.",
  ],
  ["👆", "Cliquez sur une boîte", "Pour voir le nombre de lettres du mot caché."],
  [
    "🏆",
    "Trouvez le titre",
    "Vous gagnez quand tous les mots du titre sont révélés. Votre rang est votre place parmi ceux qui ont trouvé aujourd’hui.",
  ],
];

export function Rules({ change, onStart }: { change: number; onStart: () => void }) {
  const local = new Date(change * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return (
    <div className="dialog-text">
      <ul className="steps">
        {[...STEPS, ["🕛", "Une nouvelle page chaque jour", `À midi, heure française (${local} chez vous).`]].map(
          ([icon, title, text]) => (
            <li key={title}>
              <span className="step-icon" aria-hidden="true">
                {icon}
              </span>
              <div>
                <b>{title}</b>
                <p>{text}</p>
              </div>
            </li>
          ),
        )}
      </ul>
      <button type="button" className="primary wide" onClick={onStart}>
        C’est parti
      </button>
    </div>
  );
}

const QUESTIONS: [string, string][] = [
  [
    "D’où viennent les pages ?",
    "D’une liste d’environ 10 000 sujets essentiels de Wikipédia (les « articles vitaux »). La page du jour est tirée au hasard, la même pour tout le monde.",
  ],
  [
    "Comment est calculée la proximité ?",
    "Avec un modèle word2vec entraîné sur un grand corpus de pages web françaises (frWac). Deux mots sont proches s’ils apparaissent dans des contextes semblables, ce qui donne parfois des surprises : « grand » et « petit » sont très proches.",
  ],
  [
    "Pourquoi mon mot n’est-il pas reconnu ?",
    "Il n’est ni dans le texte ni dans le vocabulaire du modèle. Vérifiez l’orthographe et les accents : « etre » n’est pas « être ».",
  ],
  ["Ma partie est-elle sauvegardée ?", "Oui, dans ce navigateur. Elle repart à zéro à l’arrivée de la page suivante."],
];

export function Faq() {
  return (
    <div className="dialog-text">
      {QUESTIONS.map(([q, a]) => (
        <div key={q} className="faq-item">
          <h3>{q}</h3>
          <p>{a}</p>
        </div>
      ))}
    </div>
  );
}

export function SettingsForm({ settings, onChange }: { settings: Settings; onChange: (s: Settings) => void }) {
  const modes: [Mode, string][] = [
    ["system", "Auto"],
    ["light", "Clair"],
    ["dark", "Sombre"],
  ];
  return (
    <div className="dialog-text">
      <h3 className="setting-label">Mode</h3>
      <div className="segmented" role="radiogroup" aria-label="Mode">
        {modes.map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={settings.mode === value}
            className={settings.mode === value ? "on" : ""}
            onClick={() => onChange({ ...settings, mode: value })}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function History({ puzzle, solvers, secret }: { puzzle: Puzzle; solvers: number; secret: Secret | null }) {
  const num = puzzle.num;
  const [rows, setRows] = useState<HistoryRow[] | null>(null);
  const [error, setError] = useState(false);
  const load = () => {
    setError(false);
    fetchHistory().then(setRows, () => setError(true));
  };
  useEffect(load, []);

  // Vos parties : essais par jour (négatif = en cours ou abandonné).
  const stats = useMemo(() => {
    const days = Object.values(store.read<Record<number, number>>("days", {}));
    const won = days.filter((d) => d > 0);
    const avg = won.length ? Math.round(won.reduce((a, b) => a + b, 0) / won.length) : 0;
    return { played: days.length, won: won.length, avg };
    // Recalculé quand la partie du jour change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secret, rows]);

  return (
    <div className="history-dialog">
      <div className="stats">
        <div>
          <b>{stats.played}</b>
          <span>Jouées</span>
        </div>
        <div>
          <b>{stats.won}</b>
          <span>Trouvées</span>
        </div>
        <div>
          <b>{stats.avg || "–"}</b>
          <span>Coups en moy.</span>
        </div>
      </div>
      <h3 className="section-title">100 derniers jours</h3>
      {error ? (
        <p className="dialog-text">
          Impossible de charger l’historique.{" "}
          <button type="button" className="link-button" onClick={load}>
            Réessayer
          </button>
        </p>
      ) : !rows ? (
        <p className="dialog-text muted">Chargement…</p>
      ) : (
        <ul className="history-scroll day-list">
          {rows.map(([n, count, row]) => {
            // La page du jour n'est connue que de ceux qui l'ont trouvée.
            const [url, title] = n === num && secret ? secret : row;
            const day = store.day(n);
            const players = n === num ? Math.max(solvers, count) : count;
            const status =
              day == null ? null : day > 0 ? (
                <span className="pill pill-found">{day} coups</span>
              ) : n < num ? (
                <span className="pill pill-none">Non trouvée</span>
              ) : (
                <span className="pill pill-close">En cours</span>
              );
            const body = (
              <>
                <span className="day-main">
                  <span className={title ? "day-title" : "day-title muted"}>
                    {title || (n === num ? "Page du jour" : "?")}
                  </span>
                  <span className="day-meta">
                    {puzzleDate(puzzle.change, num - n, true)} ·{" "}
                    {players ? `${players} ${players > 1 ? "joueurs" : "joueur"}` : "personne pour l’instant"}
                  </span>
                </span>
                {status}
                {title ? <span className="muted" aria-hidden="true">↗</span> : null}
              </>
            );
            return (
              <li key={n}>
                {title ? (
                  <a href={wikiUrl(url)} target="_blank" rel="noopener noreferrer">
                    {body}
                  </a>
                ) : (
                  <div>{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Repli quand l'API Clipboard est absente ou refusée. */
function copyWithTextarea(text: string): boolean {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand("copy");
  ta.remove();
  return ok;
}

export function Share({ text }: { text: string }) {
  const [status, setStatus] = useState("");
  useEffect(() => {
    const done = () => setStatus("Copié dans le presse-papiers");
    const fallback = () =>
      copyWithTextarea(text) ? done() : setStatus("Copie impossible : sélectionnez le texte ci-dessus.");
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
  }, [text]);
  return (
    <div className="dialog-text">
      <p className="share-story">{text}</p>
      <p className="muted">{status}</p>
    </div>
  );
}
