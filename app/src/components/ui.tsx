// Briques d'interface façon réglages iOS : sections, lignes, segments.
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { useThemeColors } from "../theme";
import { Icon } from "./Icon";

export function Section({ title, footer, children }: { title?: string; footer?: string; children: ReactNode }) {
  const t = useThemeColors();
  return (
    <View style={styles.section}>
      {title ? <Text style={[styles.sectionTitle, { color: t.muted }]}>{title.toUpperCase()}</Text> : null}
      <View style={[styles.group, { backgroundColor: t.card, borderColor: t.borderSoft }]}>{children}</View>
      {footer ? <Text style={[styles.footer, { color: t.muted }]}>{footer}</Text> : null}
    </View>
  );
}

/** Ligne d'une section ; `last` retire le séparateur. */
export function Row({ label, detail, onPress, right, last, chevron }: {
  label: ReactNode;
  detail?: ReactNode;
  onPress?: () => void;
  right?: ReactNode;
  last?: boolean;
  chevron?: boolean;
}) {
  const t = useThemeColors();
  const content = (
    <View style={[styles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: t.border }]}>
      <View style={styles.rowLabel}>
        {typeof label === "string" ? <Text style={[styles.rowText, { color: t.text }]}>{label}</Text> : label}
        {detail ? <Text style={[styles.rowDetail, { color: t.muted }]}>{detail}</Text> : null}
      </View>
      {right}
      {chevron ? <Icon ios="chevron.right" android="chevron_right" size={14} color={t.muted} /> : null}
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && { backgroundColor: t.accentTint }}>
      {content}
    </Pressable>
  );
}

export function SwitchRow({ label, detail, value, onChange, last }: {
  label: string;
  detail?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  const t = useThemeColors();
  return (
    <Row
      label={label}
      detail={detail}
      last={last}
      right={
        <Switch
          value={value}
          onValueChange={onChange}
          trackColor={{ false: t.border, true: t.accent }}
          thumbColor="#fff"
          ios_backgroundColor={t.border}
        />
      }
    />
  );
}

export function Segmented<T extends string>({ options, value, onChange }: {
  options: [T, string][];
  value: T;
  onChange: (v: T) => void;
}) {
  const t = useThemeColors();
  return (
    <View style={[styles.segmented, { backgroundColor: t.bg, borderColor: t.borderSoft }]} accessibilityRole="tablist">
      {options.map(([key, label]) => {
        const selected = key === value;
        return (
          <Pressable
            key={key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => {
              if (!selected) onChange(key);
            }}
            style={[styles.segment, selected && [styles.segmentOn, { backgroundColor: t.card }]]}
          >
            <Text style={[styles.segmentText, { color: selected ? t.text : t.muted, fontWeight: selected ? "600" : "500" }]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Barre de progression : vert (trouvés), orange (proches), reste. */
export function ProgressBar({ green, close, hidden, height = 6 }: { green: number; close: number; hidden: number; height?: number }) {
  const t = useThemeColors();
  const total = green + close + hidden || 1;
  return (
    <View style={[styles.bar, { height, backgroundColor: t.borderSoft }]}>
      <View style={{ flex: green / total, backgroundColor: t.green }} />
      <View style={{ flex: close / total, backgroundColor: t.accent, opacity: 0.75 }} />
      <View style={{ flex: hidden / total }} />
    </View>
  );
}

export function PrimaryButton({ label, onPress, icon, secondary }: {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
  secondary?: boolean;
}) {
  const t = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        secondary ? { backgroundColor: t.card, borderWidth: 1, borderColor: t.border } : { backgroundColor: t.accent },
        pressed && { opacity: 0.8 },
      ]}
    >
      {icon}
      <Text style={[styles.buttonText, { color: secondary ? t.text : "#fff" }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 13, fontWeight: "500", marginBottom: 6, marginLeft: 16, letterSpacing: 0.3 },
  group: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  footer: { fontSize: 13, marginTop: 6, marginHorizontal: 16, lineHeight: 18 },
  row: { flexDirection: "row", alignItems: "center", minHeight: 48, paddingVertical: 10, paddingRight: 16, marginLeft: 16, gap: 10 },
  rowLabel: { flex: 1, gap: 2 },
  rowText: { fontSize: 17 },
  rowDetail: { fontSize: 13 },
  segmented: { flexDirection: "row", borderRadius: 9, padding: 2, borderWidth: StyleSheet.hairlineWidth },
  segment: { flex: 1, paddingVertical: 7, alignItems: "center", borderRadius: 7 },
  segmentOn: { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  segmentText: { fontSize: 14 },
  bar: { flexDirection: "row", borderRadius: 999, overflow: "hidden" },
  button: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, borderRadius: 14, paddingHorizontal: 20 },
  buttonText: { fontSize: 17, fontWeight: "600" },
});
