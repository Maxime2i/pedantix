// Mise en page commune des feuilles (formSheet) : titre et bouton Fermer.
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SERIF_BOLD, useThemeColors } from "../theme";

export function Sheet({ title, children, scroll = true }: { title?: string; children: ReactNode; scroll?: boolean }) {
  const t = useThemeColors();
  const header = (
    <View style={styles.header}>
      <Text style={[styles.title, { color: t.text }]} accessibilityRole="header">
        {title}
      </Text>
      <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Fermer">
        <Text style={[styles.close, { color: t.accent }]}>OK</Text>
      </Pressable>
    </View>
  );
  if (!scroll) {
    return (
      <View style={styles.flex}>
        {header}
        {children}
      </View>
    );
  }
  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.body}>
      {header}
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12 },
  title: { fontFamily: SERIF_BOLD, fontSize: 26, flex: 1 },
  close: { fontSize: 17, fontWeight: "600" },
  body: { paddingBottom: 40 },
});
