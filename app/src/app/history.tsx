// Page Historique : vos statistiques et les pages des 100 derniers jours.
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Linking, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { fetchHistory, wikiUrl } from "../api";
import type { HistoryRow } from "../api";
import { useGame } from "../GameContext";
import { Icon } from "../components/Icon";
import { PrimaryButton } from "../components/ui";
import { puzzleDate, store } from "../game";
import { SERIF_BOLD, useThemeColors } from "../theme";

function Stat({ value, label }: { value: string; label: string }) {
  const t = useThemeColors();
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color: t.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: t.muted }]}>{label}</Text>
    </View>
  );
}

export default function HistoryScreen() {
  const t = useThemeColors();
  const { puzzle, secret, solvers } = useGame();
  const [rows, setRows] = useState<HistoryRow[] | null>(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setRows(await fetchHistory());
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Vos parties : essais par jour (négatif = en cours ou abandonné).
  const stats = useMemo(() => {
    const days = Object.values(store.read<Record<number, number>>("days", {}));
    const won = days.filter((d) => d > 0);
    const avg = won.length ? Math.round(won.reduce((a, b) => a + b, 0) / won.length) : 0;
    return { played: days.length, won: won.length, avg };
    // Recalculé quand la partie du jour change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secret, rows]);

  const num = puzzle?.num ?? 0;

  const header = (
    <>
      <View style={[styles.stats, { backgroundColor: t.card, borderColor: t.borderSoft }]}>
        <Stat value={String(stats.played)} label="Jouées" />
        <View style={[styles.divider, { backgroundColor: t.border }]} />
        <Stat value={String(stats.won)} label="Trouvées" />
        <View style={[styles.divider, { backgroundColor: t.border }]} />
        <Stat value={stats.avg ? String(stats.avg) : "–"} label="Coups en moy." />
      </View>
      <Text style={[styles.sectionTitle, { color: t.muted }]}>100 DERNIERS JOURS</Text>
    </>
  );

  return (
    <View style={[styles.flex, { backgroundColor: t.bg }]}>
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        data={rows ?? []}
        keyExtractor={([n]) => String(n)}
        ListHeaderComponent={header}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={t.accent}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
          />
        }
        ListEmptyComponent={
          error ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: t.muted }]}>Impossible de charger l’historique.</Text>
              <PrimaryButton label="Réessayer" secondary onPress={load} />
            </View>
          ) : (
            <ActivityIndicator style={styles.empty} color={t.accent} />
          )
        }
        renderItem={({ item: [n, count, row], index }) => {
          // La page du jour n'est connue que de ceux qui l'ont trouvée.
          const [url, title] = n === num && secret ? secret : row;
          const day = store.day(n);
          const players = n === num ? Math.max(solvers, count) : count;
          const status =
            day == null ? null : day > 0 ? (
              <View style={[styles.pill, { backgroundColor: t.freshBg }]}>
                <Text style={[styles.pillText, { color: t.text }]}>{day} coups</Text>
              </View>
            ) : n < num ? (
              <View style={[styles.pill, { backgroundColor: t.borderSoft }]}>
                <Text style={[styles.pillText, { color: t.muted }]}>Non trouvée</Text>
              </View>
            ) : (
              <View style={[styles.pill, { backgroundColor: t.accentTint }]}>
                <Text style={[styles.pillText, { color: t.accentDark }]}>En cours</Text>
              </View>
            );
          const last = rows ? index === rows.length - 1 : true;
          return (
            <Pressable
              disabled={!title}
              onPress={() => Linking.openURL(wikiUrl(url))}
              style={({ pressed }) => [
                styles.row,
                { backgroundColor: t.card, borderColor: t.borderSoft },
                index === 0 && styles.first,
                last && styles.last,
                pressed && { backgroundColor: t.accentTint },
              ]}
            >
              <View style={styles.flex}>
                <Text style={[styles.title, { color: title ? t.text : t.muted }]} numberOfLines={1}>
                  {title || (n === num ? "Page du jour" : "?")}
                </Text>
                <Text style={[styles.players, { color: t.muted }]}>
                  {puzzle ? `${puzzleDate(puzzle.change, num - n, true)} · ` : ""}
                  {players ? `${players} ${players > 1 ? "joueurs" : "joueur"}` : "personne pour l’instant"}
                </Text>
              </View>
              {status}
              {title ? <Icon ios="arrow.up.right" android="open_in_new" size={12} color={t.muted} /> : null}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { paddingBottom: 32 },
  stats: { flexDirection: "row", marginHorizontal: 16, marginTop: 8, marginBottom: 24, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, paddingVertical: 14 },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontFamily: SERIF_BOLD, fontSize: 26 },
  statLabel: { fontSize: 12 },
  divider: { width: StyleSheet.hairlineWidth, marginVertical: 4 },
  sectionTitle: { fontSize: 13, fontWeight: "500", marginLeft: 32, marginBottom: 6, letterSpacing: 0.3 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  first: { borderTopWidth: StyleSheet.hairlineWidth, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  last: { borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  title: { fontSize: 16, fontWeight: "500" },
  players: { fontSize: 12, marginTop: 1 },
  pill: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  pillText: { fontSize: 12, fontWeight: "600" },
  empty: { alignItems: "center", gap: 12, padding: 32 },
  emptyText: { fontSize: 15, textAlign: "center" },
});
