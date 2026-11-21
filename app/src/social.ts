// Note sur le store, avis par e-mail et invitation d'un ami.
import { Linking, Platform, Share } from "react-native";
import * as StoreReview from "expo-store-review";
import { SITE_URL, store } from "./game";
import * as telemetrie from "./lib/telemetrie";

const APP_STORE_ID = "6821068981";
const ANDROID_PACKAGE = "fr.pedantix.app";
const APP_STORE_URL = `https://apps.apple.com/fr/app/id${APP_STORE_ID}`;
const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
const CONTACT = "contact@maximelanglois.fr";

/** Pages trouvées avant de proposer la note (une seule fois). */
const WINS_BEFORE_REVIEW = 3;

/** Ouvre la page d'avis du store (bouton « Noter Pédantix »). */
export function rateApp() {
  telemetrie.track("note_ouverte");
  const url =
    Platform.OS === "ios"
      ? `itms-apps://itunes.apple.com/app/id${APP_STORE_ID}?action=write-review`
      : `market://details?id=${ANDROID_PACKAGE}&showAllReviews=true`;
  Linking.openURL(url).catch(() =>
    Linking.openURL(Platform.OS === "ios" ? `${APP_STORE_URL}?action=write-review` : PLAY_STORE_URL),
  );
}

/** Suggestion ou problème : e-mail pré-rempli. */
export function sendFeedback(version: string) {
  telemetrie.track("avis_email");
  const subject = encodeURIComponent("Pédantix : mon avis");
  const body = encodeURIComponent(`\n\n—\nPédantix ${version} · ${Platform.OS} ${Platform.Version}`);
  Linking.openURL(`mailto:${CONTACT}?subject=${subject}&body=${body}`).catch(() => {});
}

/** Invite un ami à jouer : lien du store et du site. */
export function inviteFriend() {
  const storeUrl = Platform.OS === "ios" ? APP_STORE_URL : PLAY_STORE_URL;
  const message =
    "Je joue à Pédantix : chaque jour, une page Wikipédia cachée à retrouver mot par mot. Viens essayer !\n" +
    `${storeUrl}\nOu sur le web : ${SITE_URL}`;
  Share.share({ message }).then(
    (r) => r.action === Share.sharedAction && telemetrie.track("invitation"),
    () => {},
  );
}

/**
 * Après quelques pages trouvées, demande une note avec la fenêtre native
 * (une seule fois ; iOS limite de toute façon à 3 affichages par an).
 */
export async function maybeAskReview() {
  if (store.read<boolean>("reviewAsked", false)) return;
  const wins = Object.values(store.read<Record<number, number>>("days", {})).filter((n) => n > 0).length;
  if (wins < WINS_BEFORE_REVIEW) return;
  try {
    if (!(await StoreReview.hasAction())) return;
    store.write("reviewAsked", true);
    telemetrie.track("demande_avis", { victoires: wins });
    await StoreReview.requestReview();
  } catch {
    // Pas de fenêtre de note disponible : le bouton des réglages reste là.
  }
}
