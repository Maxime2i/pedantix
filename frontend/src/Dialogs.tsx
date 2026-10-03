// Boîtes de dialogue : règles, FAQ, couleurs, historique, partage.
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { fetchHistory, wikiUrl } from "./api";
import type { HistoryRow, Secret } from "./api";
import { store } from "./game";
import type { Mode, Palette, Settings } from "./game";

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

export function Rules({ change }: { change: number }) {
  const local = new Date(change * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return (
    <div className="dialog-text">
      <p>Retrouvez la page Wikipédia du jour en dévoilant, essai après essai, les mots de son introduction.</p>
      <p>
        Chaque mot présent dans le texte apparaît en clair. Un mot proche par le sens reste dans sa boîte,
        écrit en gris : plus il est clair, plus il est proche du mot caché. Les mots de votre dernier essai sont
        surlignés en vert ou en orange. Pressez une boîte noire pour voir la longueur du mot.
      </p>
      <p>
        Vous gagnez quand tous les mots du titre sont dévoilés. Ils ne sont jamais grisés : trouvés ou cachés.
        L’infinitif d’un verbe ou la forme masculine singulière d’un mot suffit à révéler ses formes conjuguées,
        féminines et plurielles. Les majuscules sont inutiles, les accents comptent.
      </p>
      <p>
        Comptez plusieurs dizaines d’essais. Le rang affiché à la fin est votre place parmi les joueurs qui ont
        trouvé la page du jour, quel que soit le nombre d’essais. Vous pourrez alors afficher la page, révéler les
        mots un par un, ou continuer à jouer.
      </p>
      <p>
        Une nouvelle page chaque jour à midi, heure française (<b>{local}</b> chez vous).
      </p>
    </div>
  );
}

export function Faq() {
  return (
    <div className="dialog-text">
      <h3>D’où viennent les pages ?</h3>
      <p>
        D’une liste d’environ 10 000 sujets essentiels de Wikipédia (les « articles vitaux »). La page du jour est
        tirée au hasard, la même pour tout le monde.
      </p>
      <h3>Comment est calculée la proximité ?</h3>
      <p>
        Avec un modèle word2vec entraîné sur un grand corpus de pages web françaises (frWac, Jean-Philippe
        Fauconnier). Deux mots sont proches s’ils apparaissent dans des contextes semblables, ce qui donne parfois
        des associations surprenantes : « grand » et « petit » sont très proches.
      </p>
      <h3>Pourquoi mon mot n’est-il pas reconnu ?</h3>
      <p>
        Il n’est ni dans le texte ni dans le vocabulaire du modèle. Vérifiez l’orthographe et les accents :
        « etre » n’est pas « être ».
      </p>
      <h3>Ma partie est-elle sauvegardée ?</h3>
      <p>Oui, dans ce navigateur. Elle est remise à zéro à l’arrivée de la page suivante.</p>
    </div>
  );
}

export function Colors({ settings, onChange }: { settings: Settings; onChange: (s: Settings) => void }) {
  const palettes: [Palette, string][] = [
    ["colorful", "Coloré"],
    ["grey", "Gris"],
  ];
  const modes: [Mode, string][] = [
    ["light", "Clair"],
    ["dark", "Sombre"],
    ["system", "Système"],
  ];
  return (
    <div className="dialog-text settings">
      <fieldset>
        <legend>Thème</legend>
        {palettes.map(([value, label]) => (
          <label key={value}>
            <input
              type="radio"
              name="palette"
              checked={settings.palette === value}
              onChange={() => onChange({ ...settings, palette: value })}
            />{" "}
            {label}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Mode</legend>
        {modes.map(([value, label]) => (
          <label key={value}>
            <input
              type="radio"
              name="mode"
              checked={settings.mode === value}
              onChange={() => onChange({ ...settings, mode: value })}
            />{" "}
            {label}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Options</legend>
        <label>
          <input
            type="checkbox"
            checked={settings.blind}
            onChange={(e) => onChange({ ...settings, blind: e.target.checked })}
          />{" "}
          Daltonien (💚🟠 au lieu de 🟩🟧)
        </label>
        <label>
          <input
            type="checkbox"
            checked={settings.animation}
            onChange={(e) => onChange({ ...settings, animation: e.target.checked })}
          />{" "}
          Animation de victoire
        </label>
      </fieldset>
    </div>
  );
}

export function History({ num, solvers, secret }: { num: number; solvers: number; secret: Secret | null }) {
  const [rows, setRows] = useState<HistoryRow[] | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    fetchHistory().then(setRows, () => setError(true));
  }, []);
  if (error) return <p className="dialog-text">Une erreur s’est produite.</p>;
  if (!rows) return <p className="dialog-text">Chargement…</p>;
  return (
    <div className="history-scroll">
      <table className="history-table">
        <thead>
          <tr>
            <th>Nº</th>
            <th>Page</th>
            <th>Essais</th>
            <th />
            <th>Trouvée par</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([n, count, row]) => {
            // La page du jour n'est connue que de ceux qui l'ont trouvée.
            const [url, title] = n === num && secret ? secret : row;
            const day = store.day(n);
            const tries = day == null ? "" : Math.abs(day);
            const mark = day == null ? "" : day > 0 ? "✅" : n < num ? "❌" : "";
            return (
              <tr key={n}>
                <td className="num">{n}</td>
                <td>
                  {title ? (
                    <a href={wikiUrl(url)} target="_blank" rel="noopener noreferrer">
                      {title}
                    </a>
                  ) : (
                    "?"
                  )}
                </td>
                <td className="num">{tries}</td>
                <td>{mark}</td>
                <td className="num">{(n === num ? Math.max(solvers, count) : count) || ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
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
