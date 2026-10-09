// Feuille « Questions fréquentes ».
import { StyleSheet, Text, View } from "react-native";
import { Sheet } from "../components/Sheet";
import { useThemeColors } from "../theme";

const QUESTIONS: [string, string][] = [
  [
    "D’où viennent les pages ?",
    "D’une liste d’environ 10 000 sujets essentiels de Wikipédia (les « articles vitaux »). La page du jour est tirée au hasard, la même pour tout le monde.",
  ],
  [
    "Comment est calculée la proximité ?",
    "Avec un modèle word2vec entraîné sur un grand corpus de pages web françaises (frWac). Deux mots sont proches s’ils apparaissent dans des contextes semblables, ce qui donne parfois des surprises : « grand » et « petit » sont très proches.",
  ],
  [
    "Pourquoi mon mot n’est-il pas reconnu ?",
    "Il n’est ni dans le texte ni dans le vocabulaire du modèle. Vérifiez l’orthographe et les accents : « etre » n’est pas « être ».",
  ],
  ["Ma partie est-elle sauvegardée ?", "Oui, sur cet appareil. Elle repart à zéro à l’arrivée de la page suivante."],
];

export default function FaqSheet() {
  const t = useThemeColors();
  return (
    <Sheet title="Questions fréquentes">
      <View style={styles.list}>
        {QUESTIONS.map(([q, a]) => (
          <View key={q} style={[styles.item, { backgroundColor: t.card, borderColor: t.borderSoft }]}>
            <Text style={[styles.q, { color: t.text }]}>{q}</Text>
            <Text style={[styles.a, { color: t.muted }]}>{a}</Text>
          </View>
        ))}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16, gap: 12 },
  item: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 6 },
  q: { fontSize: 16, fontWeight: "700" },
  a: { fontSize: 15, lineHeight: 21 },
});
