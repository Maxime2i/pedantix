// Résultat du dernier essai, sous la saisie.
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import type { AndroidSymbol, SFSymbol } from "expo-symbols";
import type { Feedback as FeedbackData } from "../GameContext";
import { useThemeColors } from "../theme";
import { Icon } from "./Icon";

type Tone = { color: string; ios: SFSymbol; android: AndroidSymbol };

export function Feedback({ feedback }: { feedback: FeedbackData | null }) {
  const t = useThemeColors();
  const opacity = useRef(new Animated.Value(1)).current;

  // Léger fondu à chaque nouveau résultat.
  useEffect(() => {
    if (!feedback?.id) return;
    opacity.setValue(0.2);
    Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }, [feedback?.id, opacity]);

  if (!feedback) return null;
  const tones: Record<FeedbackData["kind"], Tone> = {
    found: { color: t.green, ios: "checkmark.circle.fill", android: "check_circle" },
    close: { color: t.accent, ios: "circle.lefthalf.filled", android: "contrast" },
    miss: { color: t.muted, ios: "xmark.circle", android: "cancel" },
    info: { color: t.accent, ios: "sparkles", android: "auto_awesome" },
    error: { color: t.redText, ios: "exclamationmark.triangle.fill", android: "warning" },
  };
  const tone = tones[feedback.kind];
  return (
    <Animated.View style={[styles.row, { opacity }]} accessibilityLiveRegion="polite">
      <Icon ios={tone.ios} android={tone.android} size={15} color={tone.color} />
      <Text style={[styles.text, { color: feedback.kind === "error" ? t.redText : t.text }]} numberOfLines={2}>
        {feedback.text}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, marginTop: -6 },
  text: { fontSize: 14, flexShrink: 1 },
});
