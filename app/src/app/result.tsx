// Feuille de résultat : rang, coups, partage, page révélée.
import { Image, Linking, Share, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { wikiUrl } from "../api";
import { useGame } from "../GameContext";
import { Icon } from "../components/Icon";
import { Sheet } from "../components/Sheet";
import { PrimaryButton, ProgressBar, Section, SwitchRow } from "../components/ui";
import { puzzleDate, shareText } from "../game";
import { SERIF_BOLD, useThemeColors } from "../theme";

function Tile({ value, label }: { value: string; label: string }) {
  const t = useThemeColors();
  return (
    <View style={[styles.tile, { backgroundColor: t.card, borderColor: t.borderSoft }]}>
      <Text style={[styles.tileValue, { color: t.text }]}>{value}</Text>
      <Text style={[styles.tileLabel, { color: t.muted }]}>{label}</Text>
    </View>
  );
}

export default function ResultSheet() {
  const t = useThemeColors();
  const game = useGame();
  const { puzzle, secret } = game;
  if (!puzzle || !secret) {
    return (
      <Sheet title="Résultat">
        <Text style={[styles.pending, { color: t.muted }]}>Trouvez d’abord la page du jour !</Text>
      </Sheet>
    );
  }
  const [green, close, hidden] = game.turns;
  const total = green + close + hidden || 1;
  const medal = ["", "🥇", "🥈", "🥉"][game.ranking] ?? "";

  function share() {
    Share.share({ message: shareText(puzzle!.change, game.nTries, game.turns) });
  }

  return (
      <Sheet>
        <View style={styles.hero}>
          {game.wikiImg ? (
            <Image source={{ uri: game.wikiImg }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.trophy, { backgroundColor: t.accentTint }]}>
              <Icon ios="trophy.fill" android="emoji_events" size={44} color={t.accent} />
            </View>
          )}
          <Text style={[styles.kicker, { color: t.muted }]}>Bravo ! La page du {puzzleDate(puzzle.change).toLowerCase()} était</Text>
          <Text style={[styles.pageTitle, { color: t.text }]}>{secret[1]}</Text>
        </View>

        <View style={styles.tiles}>
          <Tile value={String(game.nTries)} label="coups" />
          <Tile value={game.ranking > 0 ? `${medal}${game.ranking}${game.ranking === 1 ? "er" : "e"}` : "–"} label="rang du jour" />
          <Tile value={`${Math.round((green * 100) / total)} %`} label="page révélée" />
        </View>

        <View style={styles.bar}>
          <ProgressBar green={green} close={close} hidden={hidden} height={10} />
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            label="Partager mon résultat"
            onPress={share}
            icon={<Icon ios="square.and.arrow.up" android="share" size={18} color="#fff" />}
          />
          <PrimaryButton
            label="Lire sur Wikipédia"
            secondary
            onPress={() => Linking.openURL(wikiUrl(secret[0]))}
            icon={<Icon ios="safari" android="open_in_new" size={18} color={t.text} />}
          />
        </View>

        <Section title="Continuer" footer="Revenez demain à midi pour une nouvelle page.">
          <SwitchRow
            label="Afficher toute la page"
            value={game.see}
            onChange={(on) => {
              game.toggleSee(on);
              if (on) router.back();
            }}
          />
          <SwitchRow
            label="Révéler un mot en le touchant"
            value={game.wordMode}
            onChange={game.setWordMode}
            last
          />
        </Section>
      </Sheet>
  );
}

const styles = StyleSheet.create({
  pending: { fontSize: 16, textAlign: "center", padding: 32 },
  hero: { alignItems: "center", paddingHorizontal: 24, gap: 6, marginBottom: 20 },
  image: { width: 112, height: 112, borderRadius: 24, marginBottom: 10 },
  trophy: { alignItems: "center", justifyContent: "center" },
  kicker: { fontSize: 14 },
  pageTitle: { fontFamily: SERIF_BOLD, fontSize: 30, textAlign: "center" },
  tiles: { flexDirection: "row", gap: 10, paddingHorizontal: 16 },
  tile: { flex: 1, alignItems: "center", paddingVertical: 14, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, gap: 2 },
  tileValue: { fontFamily: SERIF_BOLD, fontSize: 24 },
  tileLabel: { fontSize: 12 },
  bar: { paddingHorizontal: 20, paddingVertical: 18 },
  actions: { paddingHorizontal: 16, gap: 10, marginBottom: 28 },
});
