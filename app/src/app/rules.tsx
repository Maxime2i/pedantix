// Feuille « Comment jouer ».
import { StyleSheet, Text, View } from "react-native";
import type { AndroidSymbol, SFSymbol } from "expo-symbols";
import { router } from "expo-router";
import { useGame } from "../GameContext";
import { Icon } from "../components/Icon";
import { Sheet } from "../components/Sheet";
import { PrimaryButton } from "../components/ui";
import { useThemeColors } from "../theme";

function Step({ ios, android, title, children }: { ios: SFSymbol; android: AndroidSymbol; title: string; children: string }) {
  const t = useThemeColors();
  return (
    <View style={styles.step}>
      <View style={[styles.stepIcon, { backgroundColor: t.accentTint }]}>
        <Icon ios={ios} android={android} size={20} color={t.accent} />
      </View>
      <View style={styles.flex}>
        <Text style={[styles.stepTitle, { color: t.text }]}>{title}</Text>
        <Text style={[styles.stepText, { color: t.muted }]}>{children}</Text>
      </View>
    </View>
  );
}

export default function RulesSheet() {
  const { puzzle } = useGame();
  let local = "midi";
  try {
    if (puzzle) local = new Date(puzzle.change * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    // Intl indisponible
  }
  return (
    <Sheet title="Comment jouer">
      <View style={styles.steps}>
        <Step ios="text.page" android="article" title="Une page Wikipédia cachée">
          Chaque jour, tous les mots d’un article sont masqués. Retrouvez son titre.
        </Step>
        <Step ios="character.cursor.ibeam" android="text_fields" title="Proposez des mots">
          Un mot présent dans l’article apparaît partout où il se trouve. L’infinitif ou le masculin singulier révèle aussi les autres formes. Les accents comptent.
        </Step>
        <Step ios="circle.lefthalf.filled" android="contrast" title="Les mots proches">
          Un mot proche par le sens s’inscrit en gris dans la boîte : plus il est clair, plus il est proche.
        </Step>
        <Step ios="hand.tap" android="touch_app" title="Touchez une boîte">
          Pour voir le nombre de lettres du mot caché.
        </Step>
        <Step ios="trophy" android="emoji_events" title="Trouvez le titre">
          Vous gagnez quand tous les mots du titre sont révélés. Votre rang est votre place parmi ceux qui ont trouvé aujourd’hui.
        </Step>
        <Step ios="clock" android="schedule" title="Une nouvelle page chaque jour">
          {`À midi, heure française (${local} chez vous).`}
        </Step>
      </View>
      <View style={styles.cta}>
        <PrimaryButton label="C’est parti" onPress={() => router.back()} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  steps: { paddingHorizontal: 20, gap: 20, paddingTop: 4 },
  step: { flexDirection: "row", gap: 14 },
  stepIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  stepTitle: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
  stepText: { fontSize: 15, lineHeight: 21 },
  cta: { padding: 20, paddingTop: 28 },
});
