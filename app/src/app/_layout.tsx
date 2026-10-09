// Racine : polices, sauvegarde, réglages, partie ; pile avec le jeu, les pages et les feuilles.
import { useEffect, useState } from "react";
import { Fraunces_600SemiBold, Fraunces_700Bold, useFonts } from "@expo-google-fonts/fraunces";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { GameProvider } from "../GameContext";
import { loadStorage } from "../game";
import { SettingsProvider } from "../settings";
import { SERIF_BOLD, useThemeColors } from "../theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

function Screens() {
  const t = useThemeColors();
  const sheet = {
    presentation: "formSheet" as const,
    sheetGrabberVisible: true,
    headerShown: false,
    contentStyle: { backgroundColor: t.bg },
  };
  return (
    <>
      <StatusBar style={t.dark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: t.bg },
          headerStyle: { backgroundColor: t.bg },
          headerTintColor: t.accent,
          headerTitleStyle: { color: t.text },
          headerLargeTitle: true,
          headerLargeTitleShadowVisible: false,
          headerShadowVisible: false,
          headerLargeTitleStyle: { fontFamily: SERIF_BOLD, color: t.text },
          headerBackButtonDisplayMode: "minimal",
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="history" options={{ title: "Historique" }} />
        <Stack.Screen name="settings" options={{ title: "Réglages" }} />
        <Stack.Screen name="rules" options={{ ...sheet, sheetAllowedDetents: [0.75, 1] }} />
        <Stack.Screen name="faq" options={{ ...sheet, sheetAllowedDetents: [0.75, 1] }} />
        <Stack.Screen name="guesses" options={{ ...sheet, sheetAllowedDetents: [0.6, 1] }} />
        <Stack.Screen name="result" options={{ ...sheet, sheetAllowedDetents: [0.85, 1] }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Fraunces_600SemiBold, Fraunces_700Bold });
  const [storageLoaded, setStorageLoaded] = useState(false);

  useEffect(() => {
    loadStorage().then(() => setStorageLoaded(true));
  }, []);

  const ready = fontsLoaded && storageLoaded;
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;
  return (
    <SettingsProvider>
      <GameProvider>
        <Screens />
      </GameProvider>
    </SettingsProvider>
  );
}

