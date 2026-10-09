// Feuille « Vos essais » : liste triable ; toucher un mot le remet en évidence.
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useGame } from "../GameContext";
import { Icon } from "../components/Icon";
import { Sheet } from "../components/Sheet";
import { Segmented } from "../components/ui";
import { useThemeColors } from "../theme";

type Sort = "recent" | "close" | "alpha";

export default function GuessesSheet() {
  const t = useThemeColors();
  const { summaries, replay } = useGame();
  const [sort, setSort] = useState<Sort>("recent");

  const rows = useMemo(() => {
    const list = summaries.slice();
    if (sort === "alpha") list.sort((a, b) => a.word.localeCompare(b.word));
    else if (sort === "close") list.sort((a, b) => b.found - a.found || b.best - a.best);
    else list.sort((a, b) => b.n - a.n);
    return list;
  }, [summaries, sort]);

  return (
    <Sheet title={`Vos essais${summaries.length ? ` · ${summaries.length}` : ""}`} scroll={false}>
      <View style={styles.controls}>
        <Segmented<Sort>
          options={[
            ["recent", "Récents"],
            ["close", "Meilleurs"],
            ["alpha", "A → Z"],
          ]}
          value={sort}
          onChange={setSort}
        />
      </View>
      <FlatList
        data={rows}
        keyExtractor={(g) => g.word}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon ios="text.bubble" android="chat" size={36} color={t.muted} />
            <Text style={[styles.emptyText, { color: t.muted }]}>Aucun essai pour l’instant.</Text>
          </View>
        }
        renderItem={({ item: g }) => (
          <Pressable
            onPress={() => {
              replay(g.word);
              router.back();
            }}
            style={({ pressed }) => [styles.row, { borderColor: t.border }, pressed && { backgroundColor: t.accentTint }]}
          >
            <Text style={[styles.n, { color: t.muted }]}>{g.n}</Text>
            <Text style={[styles.word, { color: t.text }]} numberOfLines={1}>
              {g.word}
            </Text>
            {g.found ? (
              <View style={[styles.pill, { backgroundColor: t.freshBg }]}>
                <Text style={[styles.pillText, { color: t.text }]}>
                  {g.found} {g.found > 1 ? "mots" : "mot"}
                </Text>
              </View>
            ) : g.best ? (
              <View style={[styles.pill, { backgroundColor: t.accentTint }]}>
                <Text style={[styles.pillText, { color: t.accentDark }]}>{Math.round(g.best)}</Text>
              </View>
            ) : (
              <Text style={[styles.pillText, { color: t.muted }]}>—</Text>
            )}
          </Pressable>
        )}
      />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  controls: { paddingHorizontal: 16, paddingBottom: 8 },
  list: { paddingBottom: 40 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 20, borderBottomWidth: StyleSheet.hairlineWidth },
  n: { width: 30, fontSize: 13, fontVariant: ["tabular-nums"] },
  word: { flex: 1, fontSize: 17 },
  pill: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  pillText: { fontSize: 13, fontWeight: "600", fontVariant: ["tabular-nums"] },
  empty: { alignItems: "center", gap: 10, paddingTop: 48 },
  emptyText: { fontSize: 15 },
});
