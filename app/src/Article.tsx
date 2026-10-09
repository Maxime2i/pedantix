// Rendu récursif de la page en composants natifs : les blocs (p, ul, li…)
// deviennent des View, le reste des Text imbriqués pour que les cases
// s'enchaînent dans le flux du texte comme sur le site.
import { Fragment } from "react";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { TextStyle } from "react-native";
import type { Node } from "./api";
import { greyLevel } from "./game";
import type { Cell } from "./game";
import { useThemeColors } from "./theme";
import type { Theme } from "./theme";

const BLOCKS = new Set(["p", "ul", "ol", "li", "dl", "dt", "dd", "blockquote"]);
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
  theme: Theme;
}

/**
 * Boîte d'un mot caché : vraie boîte en ligne (View dans Text), large d'environ
 * `len` caractères comme `calc(len ch + 0.5em)` sur le site.
 */
function Box({ len, size, color, text, onPress, label }: {
  len: number;
  size: number;
  color?: string;
  text?: string;
  onPress?: () => void;
  label?: string;
}) {
  const t = useThemeColors();
  // iOS ignore minWidth sur une vue en ligne : largeur explicite.
  const chars = Math.max(len, text ? [...text].length : 0);
  const style = {
    width: chars * size * 0.55 + size * 0.5,
    height: size * 1.3,
    backgroundColor: t.blank,
    transform: [{ translateY: size * 0.25 }],
  };
  const inner = text ? (
    <Text numberOfLines={1} style={[styles.boxText, { color, fontSize: size * 0.85 }]}>
      {text}
    </Text>
  ) : null;
  if (!onPress) return <View style={[styles.box, style]}>{inner}</View>;
  return (
    <Pressable onPress={onPress} hitSlop={2} accessibilityRole="button" accessibilityLabel={label} style={[styles.box, style]}>
      {inner}
    </Pressable>
  );
}

function renderCell(id: number, len: number, view: CellView, k: string, size: number): ReactNode {
  const t = view.theme;
  if (view.page) return <Text key={k}>{view.page[id]}</Text>;
  const cell = view.cells[id];
  const flash = view.flashes[id];
  if (flash) {
    return <Box key={k} len={len} size={size} text={flash.text} color={flash.kind === "len" ? t.flashLen : t.flashWord} />;
  }
  if (typeof cell.score === "string") {
    return (
      <Text key={k} style={view.fresh.has(id) ? { backgroundColor: t.freshBg } : undefined}>
        {cell.score}
      </Text>
    );
  }
  const onPress = () => view.onCellClick(id);
  if (cell.score > 0) {
    const s = greyLevel(cell.score);
    const color = view.freshClose.has(id) ? `rgb(255, ${s}, 0)` : `rgb(${s}, ${s}, ${s})`;
    return (
      <Box key={k} len={len} size={size} text={cell.word} color={color} onPress={onPress} label={`${len} lettres, proche de ${cell.word}`} />
    );
  }
  return <Box key={k} len={len} size={size} onPress={onPress} label={`${len} lettres`} />;
}

/** Contenu en ligne : texte, cases, gras, italique… */
function renderInline(nodes: Node[], view: CellView, key: string, size: number): ReactNode[] {
  return nodes.map((node, i) => {
    const k = `${key}-${i}`;
    if (typeof node === "string") return <Fragment key={k}>{node}</Fragment>;
    if ("w" in node) return renderCell(node.w, node.n, view, k, size);
    const style =
      node.t === "b" ? styles.bold : node.t === "i" ? styles.italic : node.t === "sub" || node.t === "sup" ? styles.tiny : undefined;
    return (
      <Text key={k} style={style}>
        {renderInline(node.c, view, k, size)}
      </Text>
    );
  });
}

const isBlock = (node: Node) => typeof node === "object" && "t" in node && BLOCKS.has(node.t);

/**
 * Suite de nœuds mêlant blocs et texte : les passages en ligne consécutifs
 * sont regroupés dans un même Text.
 */
function renderFlow(nodes: Node[], view: CellView, key: string, textStyle: TextStyle): ReactNode[] {
  const out: ReactNode[] = [];
  let run: Node[] = [];
  const flush = () => {
    // Les blancs entre deux blocs ne forment pas de ligne.
    if (run.some((n) => typeof n !== "string" || n.trim())) {
      const k = `${key}-r${out.length}`;
      out.push(
        <Text key={k} style={textStyle}>
          {renderInline(run, view, k, textStyle.fontSize ?? 17)}
        </Text>,
      );
    }
    run = [];
  };
  nodes.forEach((node, i) => {
    if (!isBlock(node)) {
      run.push(node);
      return;
    }
    flush();
    out.push(renderBlock(node as { t: string; c: Node[] }, view, `${key}-${i}`, textStyle));
  });
  flush();
  return out;
}

function renderBlock(node: { t: string; c: Node[] }, view: CellView, key: string, textStyle: TextStyle): ReactNode {
  if (node.t === "li" || node.t === "dd") {
    return (
      <View key={key} style={styles.li}>
        <Text style={textStyle}>{node.t === "li" ? "•" : ""}</Text>
        <View style={styles.liBody}>{renderFlow(node.c, view, key, textStyle)}</View>
      </View>
    );
  }
  const style = node.t === "p" ? styles.p : node.t === "ul" || node.t === "ol" || node.t === "dl" ? styles.list : node.t === "blockquote" ? styles.quote : undefined;
  return (
    <View key={key} style={style}>
      {renderFlow(node.c, view, key, node.t === "dt" ? { ...textStyle, fontWeight: "700" } : textStyle)}
    </View>
  );
}

export function Article({ nodes, view, textStyle }: { nodes: Node[]; view: CellView; textStyle: TextStyle }) {
  return <View>{renderFlow(nodes, view, "a", textStyle)}</View>;
}

/** Le titre : une seule ligne logique de cases. */
export function Title({ nodes, view, textStyle }: { nodes: Node[]; view: CellView; textStyle: TextStyle }) {
  return <Text style={textStyle}>{renderInline(nodes, view, "t", textStyle.fontSize ?? 28)}</Text>;
}

const styles = StyleSheet.create({
  box: { borderRadius: 5, marginHorizontal: 1, paddingHorizontal: 3, alignItems: "center", justifyContent: "center" },
  boxText: { fontWeight: "600" },
  bold: { fontWeight: "700" },
  italic: { fontStyle: "italic" },
  tiny: { fontSize: 11 },
  p: { marginBottom: 14 },
  list: { marginBottom: 14 },
  quote: { marginBottom: 14, paddingLeft: 12 },
  li: { flexDirection: "row", gap: 8, paddingLeft: 6 },
  liBody: { flex: 1 },
});
