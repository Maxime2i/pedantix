// Icônes système : SF Symbols sur iOS, Material Symbols sur Android.
import { SymbolView } from "expo-symbols";
import type { AndroidSymbol, SFSymbol } from "expo-symbols";
import type { ColorValue } from "react-native";

export function Icon({ ios, android, size = 22, color }: {
  ios: SFSymbol;
  android: AndroidSymbol;
  size?: number;
  color: ColorValue;
}) {
  return <SymbolView name={{ ios, android }} size={size} tintColor={color} />;
}
