// Rendu récursif de la page : balises conservées, mots remplacés par des cases.
import { createElement, Fragment } from "react";
import type { ReactNode } from "react";
import type { Node } from "./api";
import { greyLevel } from "./game";
import type { Cell } from "./game";

const TAGS = new Set(["p", "b", "i", "ul", "ol", "li", "dl", "dt", "dd", "blockquote", "sub", "sup"]);

export interface Flash {
  text: string;
  kind: "len" | "word";
}

export interface CellView {
  cells: Cell[];
  /** Mots trouvés au dernier essai (surlignés). */
  fresh: Set<number>;
  /** Mots rapprochés au dernier essai (en orange). */
  freshClose: Set<number>;
  flashes: Record<number, Flash>;
  /** Mots de la page, quand « Voir la page » est coché. */
  page: Record<string, string> | null;
  onCellClick: (id: number) => void;
}

function renderCell(id: number, len: number, view: CellView): ReactNode {
  if (view.page) return <span className="w-plain">{view.page[id]}</span>;
  const cell = view.cells[id];
  const flash = view.flashes[id];
  const width = { minWidth: `calc(${len}ch + 0.5em)` };

  if (flash) {
    return (
      <span className={`box box-flash box-flash-${flash.kind}`} style={width}>
        {flash.text}
      </span>
    );
  }
  if (typeof cell.score === "string") {
    return <span className={view.fresh.has(id) ? "w-found w-fresh" : "w-found"}>{cell.score}</span>;
  }
  const clickProps = {
    role: "button",
    tabIndex: 0,
    onClick: () => view.onCellClick(id),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        view.onCellClick(id);
      }
    },
  };
  if (cell.score > 0) {
    const s = greyLevel(cell.score);
    const color = view.freshClose.has(id) ? `rgb(255, ${s}, 0)` : `rgb(${s}, ${s}, ${s})`;
    return (
      <span
        className="box box-close"
        style={{ ...width, color }}
        title={`${cell.word} (${cell.score})`}
        aria-label={`${len} lettres, proche de ${cell.word}`}
        {...clickProps}
      >
        {cell.word}
      </span>
    );
  }
  return (
    <span className="box" style={width} aria-label={`${len} lettres`} {...clickProps}>
      {" "}
    </span>
  );
}

export function renderNodes(nodes: Node[], view: CellView, key = "n"): ReactNode[] {
  return nodes.map((node, i) => {
    const k = `${key}-${i}`;
    if (typeof node === "string") return <Fragment key={k}>{node}</Fragment>;
    if ("w" in node) return <Fragment key={k}>{renderCell(node.w, node.n, view)}</Fragment>;
    const tag = TAGS.has(node.t) ? node.t : "span";
    return createElement(tag, { key: k }, renderNodes(node.c, view, k));
  });
}
