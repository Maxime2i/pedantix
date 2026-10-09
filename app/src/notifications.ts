// Rappel quotidien local : une notification à l'arrivée de la nouvelle page
// (midi, heure de Paris), programmée sur l'appareil, sans serveur de push.
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

const DAILY_ID = "page-du-jour";
const CHANNEL_ID = "page-du-jour";

// Si l'app est ouverte à midi, la notification s'affiche quand même.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function ensureChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: "Page du jour",
    description: "Rappel à l’arrivée de la nouvelle page, chaque jour à midi.",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export type Permission = "granted" | "denied" | "undetermined";

export async function getPermission(): Promise<Permission> {
  const { status } = await Notifications.getPermissionsAsync();
  return status as Permission;
}

/** Demande l'autorisation si elle n'a jamais été demandée. */
export async function requestPermission(): Promise<Permission> {
  // Android 13+ : la demande n'apparaît qu'une fois un canal créé.
  await ensureChannel();
  const current = await getPermission();
  if (current !== "undetermined") return current;
  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true, allowBadge: false },
  });
  return status as Permission;
}

/**
 * Heure locale de publication d'une page : midi à Paris, converti dans le
 * fuseau du téléphone (`change` = instant de publication d'une page récente).
 */
function localPublishTime(change?: number) {
  if (!change) return { hour: 12, minute: 0 };
  const d = new Date(change * 1000);
  return { hour: d.getHours(), minute: d.getMinutes() };
}

/** (Re)programme le rappel quotidien. Sans effet si l'autorisation manque. */
export async function scheduleDaily(change?: number) {
  if ((await getPermission()) !== "granted") return;
  await ensureChannel();
  await Notifications.cancelScheduledNotificationAsync(DAILY_ID).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_ID,
    content: {
      title: "La page du jour est arrivée",
      body: "Une nouvelle page Wikipédia vous attend. Saurez-vous trouver son titre ?",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      ...localPublishTime(change),
      channelId: CHANNEL_ID,
    },
  });
}

export async function cancelDaily() {
  await Notifications.cancelScheduledNotificationAsync(DAILY_ID).catch(() => {});
}
