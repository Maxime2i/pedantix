// Page Réglages : apparence, notifications, aide.
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import Constants from "expo-constants";
import * as Updates from "expo-updates";
import { router } from "expo-router";
import { Row, Section, Segmented, SwitchRow } from "../components/ui";
import { SITE_URL } from "../game";
import type { Mode } from "../game";
import { requestPermission } from "../notifications";
import { useSettings } from "../settings";
import { useThemeColors } from "../theme";

export default function SettingsScreen() {
  const t = useThemeColors();
  const { settings, update } = useSettings();

  // Version de l'app, et date de la mise à jour EAS en cours s'il y en a une.
  const version = Constants.expoConfig?.version ?? "1.0.0";
  const updatedAt =
    !Updates.isEmbeddedLaunch && Updates.createdAt
      ? Updates.createdAt.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
      : null;

  async function toggleNotify(on: boolean) {
    if (!on) return update({ notify: false });
    if ((await requestPermission()) === "granted") return update({ notify: true });
    // Refusée une fois, l'autorisation ne se redemande plus que dans les réglages du téléphone.
    Alert.alert(
      "Notifications désactivées",
      "Autorisez les notifications de Pédantix dans les réglages de votre téléphone.",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Ouvrir les réglages", onPress: () => Linking.openSettings() },
      ],
    );
  }

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

        <Section title="Notifications">
          <SwitchRow
            label="Rappel quotidien"
            detail="Chaque jour à midi, quand la nouvelle page arrive"
            value={settings.notify}
            onChange={toggleNotify}
            last
          />
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
          <Row label="Politique de confidentialité" chevron onPress={() => Linking.openURL(`${SITE_URL}confidentialite/`)} />
          <Row label="Version" right={<Text style={{ color: t.muted, fontSize: 17 }}>{updatedAt ? `${version} · màj du ${updatedAt}` : version}</Text>} last />
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
