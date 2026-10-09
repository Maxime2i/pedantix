// Réglages (thème, mode, options) et thème courant, pour toute l'app.
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { useColorScheme } from "react-native";
import { loadSettings, saveSettings } from "./game";
import type { Settings } from "./game";
import { getTheme, ThemeContext } from "./theme";

interface SettingsValue {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsValue | null>(null);

/** À monter après `loadStorage()` : les réglages sont lus de façon synchrone. */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const system = useColorScheme();
  const dark = settings.mode === "system" ? system === "dark" : settings.mode === "dark";
  const update = (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
  };
  return (
    <SettingsContext.Provider value={{ settings, update }}>
      <ThemeContext.Provider value={getTheme(dark)}>{children}</ThemeContext.Provider>
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsValue {
  const value = useContext(SettingsContext);
  if (!value) throw new Error("useSettings hors de SettingsProvider");
  return value;
}
