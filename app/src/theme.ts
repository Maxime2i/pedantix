// Palette chaleureuse du site (index.css), en clair et en sombre.
import { createContext, useContext } from "react";

export interface Theme {
  dark: boolean;
  bg: string;
  card: string;
  text: string;
  muted: string;
  accent: string;
  accentDark: string;
  accentTint: string;
  green: string;
  freshBg: string;
  redText: string;
  border: string;
  borderSoft: string;
  /** Boîtes noires des mots masqués. */
  blank: string;
  flashLen: string;
  flashWord: string;
  overlay: string;
}

const lightColorful: Theme = {
  dark: false,
  bg: "#f6f1e7",
  card: "#fffdf6",
  text: "#3b3226",
  muted: "#7a6f5d",
  accent: "#c05621",
  accentDark: "#b3481a",
  accentTint: "#fbeeda",
  green: "#3e7c4f",
  freshBg: "#c8efc0",
  redText: "#b3261e",
  border: "#e0d5bd",
  borderSoft: "#e8dcc6",
  blank: "#241f1a",
  flashLen: "#5ad1ff",
  flashWord: "#66ee66",
  overlay: "rgba(36, 31, 26, 0.45)",
};

const darkColorful: Theme = {
  ...lightColorful,
  dark: true,
  bg: "#1d1915",
  card: "#27211b",
  text: "#ece3d3",
  muted: "#a99c86",
  accent: "#e07a3f",
  accentDark: "#f08d52",
  accentTint: "#3a2a1d",
  green: "#7cc48d",
  freshBg: "#2f5a37",
  redText: "#f3a497",
  border: "#463b2e",
  borderSoft: "#3a3027",
  blank: "#0d0b09",
  overlay: "rgba(0, 0, 0, 0.6)",
};

export function getTheme(dark: boolean): Theme {
  return dark ? darkColorful : lightColorful;
}

export const SERIF = "Fraunces_600SemiBold";
export const SERIF_BOLD = "Fraunces_700Bold";

export const ThemeContext = createContext<Theme>(lightColorful);
export const useThemeColors = () => useContext(ThemeContext);
