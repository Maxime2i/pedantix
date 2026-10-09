// Onglet Jouer : la page masquée et la saisie.
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Article, Title } from "../Article";
import type { CellView } from "../Article";
import { useGame } from "../GameContext";
import { Icon } from "../components/Icon";
import { PrimaryButton, ProgressBar } from "../components/ui";
import { Feedback } from "../components/Feedback";
import { puzzleDate } from "../game";
import { SERIF, SERIF_BOLD, useThemeColors } from "../theme";

function rankLabel(rank: number) {
  if (rank <= 0) return "";
  return `${["", "🥇 ", "🥈 ", "🥉 "][rank] ?? ""}${rank}${rank === 1 ? "er" : "e"}`;
}

function HeaderButton({ onPress, label, children, badge }: {
  onPress: () => void;
  label: string;
  children: React.ReactNode;
  badge?: number;
}) {
  const t = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.headerButton, { backgroundColor: t.card, borderColor: t.borderSoft }, pressed && { opacity: 0.6 }]}
    >
      {children}
      {badge ? (
        <View style={[styles.badge, { backgroundColor: t.accent }]}>
          <Text style={styles.badgeText}>{badge > 99 ? "99+" : badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export default function PlayScreen() {
  const t = useThemeColors();
  const game = useGame();
  const [input, setInput] = useState("");
  const inputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();
  const { puzzle, secret, wins, firstLaunch, clearFirstLaunch } = game;

  useEffect(() => {
    if (firstLaunch && puzzle) {
      clearFirstLaunch();
      router.push("/rules");
    }
  }, [firstLaunch, puzzle, clearFirstLaunch]);

  // Victoire : feuille de résultat.
  useEffect(() => {
    if (!wins) return;
    inputRef.current?.blur();
    const timer = setTimeout(() => router.push("/result"), 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wins]);

  async function send() {
    if (!input.trim()) return;
    const value = input;
    setInput("");
    if (!(await game.submit(value))) setInput(value);
  }

  if (!puzzle) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: t.bg }]}>
        {game.offline ? (
          <>
            <Icon ios="wifi.slash" android="wifi_off" size={40} color={t.muted} />
            <Text style={[styles.emptyTitle, { color: t.text }]}>Pas de connexion internet</Text>
            <Text style={[styles.emptyText, { color: t.muted }]}>
              La page du jour s’affichera dès que vous serez reconnecté.
            </Text>
          </>
        ) : game.loadError ? (
          <>
            <Icon ios="exclamationmark.triangle" android="warning" size={40} color={t.muted} />
            <Text style={[styles.emptyTitle, { color: t.text }]}>Page du jour indisponible</Text>
            <Text style={[styles.emptyText, { color: t.muted }]}>Le serveur ne répond pas. Réessayez dans un instant.</Text>
            <PrimaryButton label="Réessayer" onPress={() => game.load()} />
          </>
        ) : (
          <ActivityIndicator color={t.accent} />
        )}
      </SafeAreaView>
    );
  }

  const view: CellView = {
    cells: game.cells,
    fresh: game.fresh,
    freshClose: game.freshClose,
    flashes: game.flashes,
    page: game.see ? game.pageWords : null,
    onCellClick: (id) => {
      Haptics.selectionAsync().catch(() => {});
      game.pressCell(id);
    },
    theme: t,
  };
  const [green, close, hidden] = game.progress;
  const total = green + close + hidden || 1;
  const canSend = input.trim().length > 0 && !game.busy;

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: t.bg }]} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <View style={styles.flex}>
          <Text style={[styles.brand, { color: t.text }]}>Pédantix</Text>
          <Text style={[styles.meta, { color: t.muted }]} numberOfLines={1}>
            {puzzleDate(puzzle.change)}
            {game.solvers > 0 ? ` · trouvé par ${game.solvers}` : ""}
          </Text>
        </View>
        <HeaderButton onPress={() => router.push("/guesses")} label="Vos essais" badge={game.summaries.length}>
          <Icon ios="list.bullet" android="format_list_numbered" size={18} color={t.text} />
        </HeaderButton>
        <HeaderButton onPress={() => router.push("/history")} label="Historique">
          <Icon ios="calendar" android="calendar_month" size={18} color={t.text} />
        </HeaderButton>
        <HeaderButton onPress={() => router.push("/settings")} label="Réglages">
          <Icon ios="gearshape" android="settings" size={18} color={t.text} />
        </HeaderButton>
      </View>

      <View style={styles.progress}>
        <View style={styles.flex}>
          <ProgressBar green={green} close={close} hidden={hidden} />
        </View>
        <Text style={[styles.progressText, { color: t.muted }]}>{Math.round((green * 100) / total)} %</Text>
      </View>

      {game.offline && (
        <View style={[styles.offline, { backgroundColor: t.accentTint }]} accessibilityLiveRegion="polite">
          <Icon ios="wifi.slash" android="wifi_off" size={15} color={t.accentDark} />
          <Text style={[styles.offlineText, { color: t.text }]}>
            Pas de connexion internet. Vous pourrez proposer des mots dès votre retour en ligne.
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={<RefreshControl refreshing={game.refreshing} onRefresh={() => game.load(true)} tintColor={t.accent} />}
      >
        <View style={[styles.inputWrap, { backgroundColor: t.card }]}>
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: t.text }]}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={send}
            submitBehavior="submit"
            placeholder={secret ? "Continuer à jouer…" : "Proposer un mot"}
            placeholderTextColor={t.muted}
            autoCorrect={false}
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
            returnKeyType="send"
            enablesReturnKeyAutomatically
            accessibilityLabel="Proposer un mot"
          />
          <Pressable
            onPress={send}
            disabled={!canSend}
            accessibilityRole="button"
            accessibilityLabel="Envoyer"
            style={[styles.send, { backgroundColor: canSend ? t.accent : t.borderSoft }]}
          >
            {game.busy ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Icon ios="arrow.up" android="arrow_upward" size={18} color={canSend ? "#fff" : t.muted} />
            )}
          </Pressable>
        </View>
        <Feedback feedback={game.feedback} />

        {secret && (
          <Pressable
            onPress={() => router.push("/result")}
            style={({ pressed }) => [styles.solved, { backgroundColor: t.accentTint, borderColor: t.border }, pressed && { opacity: 0.8 }]}
          >
            <Icon ios="trophy.fill" android="emoji_events" size={22} color={t.accent} />
            <View style={styles.flex}>
              <Text style={[styles.solvedTitle, { color: t.text }]}>Trouvé en {game.nTries} coups</Text>
              <Text style={[styles.solvedText, { color: t.muted }]}>
                {game.ranking > 0 ? `${rankLabel(game.ranking)} du jour · ` : ""}Voir le résultat
              </Text>
            </View>
            <Icon ios="chevron.right" android="chevron_right" size={14} color={t.muted} />
          </Pressable>
        )}

        <Title nodes={puzzle.title} view={view} textStyle={{ ...styles.title, color: t.text }} />

        <View style={[styles.article, { backgroundColor: t.card, borderColor: t.borderSoft }]}>
          <Article nodes={puzzle.article} view={view} textStyle={{ ...styles.articleText, color: t.text }} />
        </View>

        {puzzle.yesterday[1] ? (
          <Text style={[styles.yesterday, { color: t.muted }]}>
            Page d’hier : <Text style={{ color: t.text, fontWeight: "600" }}>{puzzle.yesterday[1]}</Text>
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: "700", textAlign: "center" },
  emptyText: { fontSize: 15, textAlign: "center", marginBottom: 8 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, paddingTop: 6, paddingBottom: 10 },
  brand: { fontFamily: SERIF_BOLD, fontSize: 30, lineHeight: 36 },
  meta: { fontSize: 13 },
  headerButton: { width: 38, height: 38, borderRadius: 19, borderWidth: StyleSheet.hairlineWidth, alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", top: -4, right: -6, minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4, alignItems: "center", justifyContent: "center" },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  progress: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, paddingBottom: 10 },
  offline: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 16, marginBottom: 10, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  offlineText: { fontSize: 13, flex: 1 },
  progressText: { fontSize: 12, fontVariant: ["tabular-nums"], minWidth: 34, textAlign: "right" },
  scroll: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 24, gap: 14 },
  solved: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth },
  solvedTitle: { fontSize: 16, fontWeight: "700" },
  solvedText: { fontSize: 13 },
  title: { fontFamily: SERIF, fontSize: 28, lineHeight: 46, paddingHorizontal: 4 },
  article: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, padding: 16 },
  articleText: { fontSize: 17, lineHeight: 31 },
  yesterday: { fontSize: 13, textAlign: "center", paddingVertical: 8 },
  inputWrap: { flexDirection: "row", alignItems: "center", borderRadius: 24, paddingLeft: 16, paddingRight: 5, height: 48 },
  input: { flex: 1, fontSize: 17, height: "100%" },
  send: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
});
