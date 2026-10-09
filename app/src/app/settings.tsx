// Page Réglages : apparence, options de jeu, aide.
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import Constants from "expo-constants";
import { router } from "expo-router";
import { Row, Section, Segmented } from "../components/ui";
import { SITE_URL } from "../game";
import type { Mode } from "../game";
import { useSettings } from "../settings";
import { useThemeColors } from "../theme";

export default function SettingsScreen() {
  const t = useThemeColors();
  const { settings, update } = useSettings();
  return (
    <View style={[styles.flex, { backgroundColor: t.bg }]}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.scroll}>
        
        <Section title="Apparence">
          <View style={styles.block}>
            <Text style={[styles.label, { color: t.text }]}>Mode</Text>
            <Segmented<Mode>
              options={[
                ["system", "Auto"],
                ["light", "Clair"],
                ["dark", "Sombre"],
              ]}
              value={settings.mode}
              onChange={(mode) => update({ mode })}
            />
          </View>
        </Section>

        <Section title="Aide">
          <Row label="Comment jouer" chevron onPress={() => router.push("/rules")} />
          <Row label="Questions fréquentes" chevron onPress={() => router.push("/faq")} last />
        </Section>

        <Section
          title="À propos"
          footer="Textes : Wikipédia (CC BY-SA 4.0). Proximité : modèle frWac de Jean-Philippe Fauconnier (CC BY 3.0). Lemmes : Lexique 3.83."
        >
          <Row label="Jouer sur le web" chevron onPress={() => Linking.openURL(SITE_URL)} />
          <Row label="Version" right={<Text style={{ color: t.muted, fontSize: 17 }}>{Constants.expoConfig?.version ?? "1.0.0"}</Text>} last />
        </Section>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingTop: 8, paddingBottom: 32 },
  block: { padding: 16, gap: 10 },
  label: { fontSize: 15, fontWeight: "500" },
});
