/**
 * Télémétrie de l'usine à apps — module React Native / Expo.
 *
 * - track(nom, props) / screen(nom) : uniquement ce que l'app choisit d'envoyer (aucune capture automatique
 *   d'écrans, de clics ou de sessions).
 * - Erreurs JS globales (ErrorUtils) et promesses rejetées non gérées, avec l'écran courant et la dernière action.
 * - File d'attente persistée (hors ligne), envois groupés, identifiant d'installation anonyme propre à l'app,
 *   renouvelé tous les 13 mois (jamais prolongé), opt-out avec effacement côté serveur.
 *
 * Dépendances : @react-native-async-storage/async-storage, expo-application, expo-crypto, (optionnel) expo-updates.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import * as Crypto from 'expo-crypto';
import { AppState, Platform, type AppStateStatus } from 'react-native';

// ───────────────────────────── Types ─────────────────────────────

/** Valeur simple, ou liste courte (≤ 20 éléments, chaînes ≤ 40 caractères ou nombres), ex. `badges: ['or', 'mvp']`. */
export type ValeurProp = string | number | boolean | null | ReadonlyArray<string | number>;
export type Props = Record<string, ValeurProp>;

export interface OptionsTelemetrie {
  /** Clé publique de l'app (pk_…), fournie par `node scripts/admin.mjs creer-app`. */
  cle: string;
  /** URL du service. Par défaut https://telemetrie.maximelanglois.fr */
  url?: string;
  /** Envoyer aussi en développement (__DEV__). Par défaut false : les données de dev ne polluent pas les chiffres. */
  enDev?: boolean;
  /** Capturer les erreurs JS globales et les promesses rejetées. Par défaut true. */
  erreurs?: boolean;
  /** Intervalle d'envoi automatique en ms. Par défaut 15 000. */
  intervalleMs?: number;
  /** Envoi immédiat dès que la file atteint ce nombre d'éléments. Par défaut 20. */
  seuilEnvoi?: number;
  /** Journaliser dans la console (rejets du serveur, échecs réseau). Par défaut __DEV__. */
  debug?: boolean;
}

type Element =
  | { type: 'event'; name: string; props?: Props; screen?: string; ts: number }
  | { type: 'screen'; name: string; ts: number }
  | {
      type: 'error'; error_type: string; message: string; stack?: string; fatal: boolean;
      source: 'global' | 'promesse' | 'manuel'; screen?: string; last_action?: string; ts: number;
    };

// ───────────────────────────── État ─────────────────────────────

const CLE_FILE = '@telemetrie/file';
const CLE_INSTALL = '@telemetrie/installation';
const CLE_OPTOUT = '@telemetrie/opt-out';
const FILE_MAX = 500;              // au-delà, on jette les plus anciens
const LOT_MAX = 50;                // le serveur accepte 100 éléments et 64 Ko par lot
const DUREE_ID_MS = 395 * 864e5;   // 13 mois : durée de vie maximale de l'identifiant (recommandation CNIL)
const NOM_VALIDE = /^[a-zA-Z][a-zA-Z0-9_:.\- ]{0,63}$/;

let options: Required<OptionsTelemetrie> | null = null;
let actif = false;            // false tant que init() n'a pas fini, en cas d'opt-out, ou en dev sans enDev
let pret = false;
let file: Element[] = [];
let attente: Element[] = [];  // éléments reçus avant la fin d'init()
let installId: string | null = null;
let ecranCourant: string | undefined;
let derniereAction: string | undefined;
let envoiEnCours: Promise<void> | null = null;
let echecsReseau = 0;
let prochainEssai = 0;
let minuterie: ReturnType<typeof setInterval> | null = null;
let abonnementAppState: { remove(): void } | null = null;
let gestionnairePrecedent: ((e: unknown, fatal?: boolean) => void) | null = null;

const log = (...a: unknown[]) => { if (options?.debug) console.log('[télémétrie]', ...a); };

// ───────────────────────────── Contexte ─────────────────────────────

function lireExpoUpdates(): { channel: string; update_id: string } {
  try {
    // expo-updates est optionnel : absent (Expo Go, projet sans OTA), on envoie des champs vides.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Updates = require('expo-updates');
    return {
      channel: Updates.channel ?? '',
      update_id: Updates.isEmbeddedLaunch ? '' : (Updates.updateId ?? ''),
    };
  } catch {
    return { channel: '', update_id: '' };
  }
}

function contexte() {
  return {
    app_version: Application.nativeApplicationVersion ?? '',
    build: Application.nativeBuildVersion ?? '',
    platform: Platform.OS,
    os_version: String(Platform.Version ?? '').split('.')[0],
    ...lireExpoUpdates(),
  };
}

// ───────────────────────────── Identifiant d'installation ─────────────────────────────

async function chargerInstallId(): Promise<string> {
  const brut = await AsyncStorage.getItem(CLE_INSTALL);
  if (brut) {
    try {
      const { id, cree } = JSON.parse(brut) as { id: string; cree: number };
      if (id && Date.now() - cree < DUREE_ID_MS) return id;   // jamais prolongé : on garde la date de création
    } catch { /* corrompu : on régénère */ }
  }
  const id = Crypto.randomUUID();
  await AsyncStorage.setItem(CLE_INSTALL, JSON.stringify({ id, cree: Date.now() }));
  return id;
}

// ───────────────────────────── File d'attente ─────────────────────────────

let sauvegardePrevue: ReturnType<typeof setTimeout> | null = null;
function sauvegarder(immediat = false): Promise<void> {
  if (sauvegardePrevue) { clearTimeout(sauvegardePrevue); sauvegardePrevue = null; }
  const ecrire = () => AsyncStorage.setItem(CLE_FILE, JSON.stringify(file)).catch(() => {});
  if (immediat) return ecrire();
  sauvegardePrevue = setTimeout(() => { sauvegardePrevue = null; void ecrire(); }, 500);
  return Promise.resolve();
}

function ajouter(el: Element) {
  if (!pret) { if (attente.length < FILE_MAX) attente.push(el); return; }
  if (!actif) return;
  file.push(el);
  if (file.length > FILE_MAX) file.splice(0, file.length - FILE_MAX);
  void sauvegarder();
  if (file.length >= (options?.seuilEnvoi ?? 20)) void flush();
}

/** Envoie la file maintenant (appelé automatiquement ; utile avant une action qui peut fermer l'app). */
export function flush(): Promise<void> {
  if (!actif || !options || !installId || file.length === 0) return Promise.resolve();
  if (Date.now() < prochainEssai) return Promise.resolve();
  if (envoiEnCours) return envoiEnCours;
  envoiEnCours = (async () => {
    try {
      while (actif && file.length > 0) {
        const lot = file.slice(0, LOT_MAX);
        const r = await fetch(options!.url + '/v1/batch', {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-app-key': options!.cle },
          body: JSON.stringify({ install_id: installId, context: contexte(), items: lot }),
        });
        // 401 (clé pas encore active), 429 et 5xx : on garde la file et on réessaiera plus tard.
        if (r.status === 401 || r.status === 429 || r.status >= 500) throw new Error(`HTTP ${r.status}`);
        if (r.status !== 200) {
          // 4xx : lot définitivement invalide (données personnelles, clé…) : on le jette pour ne pas boucler.
          log(`lot refusé (${r.status})`, await r.text().catch(() => ''));
        } else {
          const rep = (await r.json().catch(() => null)) as { rejetes?: { i: number; raison: string }[] } | null;
          if (rep?.rejetes?.length) log('éléments rejetés', rep.rejetes.map((x) => `${lot[x.i]?.type} ${'name' in lot[x.i] ? (lot[x.i] as { name: string }).name : ''} : ${x.raison}`));
        }
        file.splice(0, lot.length);
        await sauvegarder(true);
        echecsReseau = 0; prochainEssai = 0;
      }
    } catch (e) {
      echecsReseau += 1;
      prochainEssai = Date.now() + Math.min(5 * 60e3, 5e3 * 2 ** (echecsReseau - 1));   // 5 s → 5 min
      log('envoi reporté', String(e));
      await sauvegarder(true);   // hors ligne : la file doit survivre à une fermeture de l'app
    } finally {
      envoiEnCours = null;
    }
  })();
  return envoiEnCours;
}

// ───────────────────────────── API publique ─────────────────────────────

/** Démarre la télémétrie. À appeler une fois, au plus tôt (avant le premier rendu). */
export async function init(opts: OptionsTelemetrie): Promise<void> {
  if (options) return;
  options = {
    url: 'https://telemetrie.maximelanglois.fr', enDev: false, erreurs: true, intervalleMs: 15_000, seuilEnvoi: 20,
    debug: typeof __DEV__ !== 'undefined' ? __DEV__ : false,
    ...opts,
  };
  options.url = options.url.replace(/\/+$/, '');
  if (options.erreurs) installerCaptureErreurs();   // tout de suite : une erreur pendant init() doit être vue
  try {
    const enDev = typeof __DEV__ !== 'undefined' && __DEV__;
    const optOut = (await AsyncStorage.getItem(CLE_OPTOUT)) === '1';
    actif = !optOut && (!enDev || options.enDev);
    if (actif) {
      installId = await chargerInstallId();
      const brut = await AsyncStorage.getItem(CLE_FILE);
      if (brut) { try { file = JSON.parse(brut) as Element[]; } catch { file = []; } }
    }
  } catch (e) {
    log('init en échec', String(e));
    actif = false;
  }
  pret = true;
  const enAttente = attente; attente = [];
  enAttente.forEach(ajouter);
  if (!actif) { log('inactive (opt-out ou développement)'); return; }
  minuterie = setInterval(() => { void flush(); }, options.intervalleMs);
  abonnementAppState = AppState.addEventListener('change', (s: AppStateStatus) => {
    if (s === 'background' || s === 'inactive') { void sauvegarder(true); void flush(); }
    if (s === 'active') void flush();
  });
  void flush();   // envoie ce qui restait de la session précédente (dont une erreur fatale)
}

/** Événement choisi par l'app. Pas de données personnelles : le serveur rejette e-mails, téléphones, noms… */
export function track(nom: string, props?: Props): void {
  if (!NOM_VALIDE.test(nom)) { log(`nom d'événement invalide : ${nom}`); return; }
  derniereAction = nom;
  ajouter({ type: 'event', name: nom, props, screen: ecranCourant, ts: Date.now() });
}

/** Écran affiché. À appeler explicitement (ex. dans un listener de navigation), rien n'est automatique. */
export function screen(nom: string): void {
  if (!NOM_VALIDE.test(nom)) { log(`nom d'écran invalide : ${nom}`); return; }
  if (nom === ecranCourant) return;   // pas de doublon si le même écran est re-signalé
  ecranCourant = nom;
  ajouter({ type: 'screen', name: nom, ts: Date.now() });
}

/** Signale une erreur attrapée par l'app (try/catch, ErrorBoundary). */
export function captureError(erreur: unknown, opts: { fatal?: boolean } = {}): void {
  ajouter(versElement(erreur, 'manuel', opts.fatal ?? false));
}

/** Refus de la mesure : vide la file, efface les données côté serveur et oublie l'identifiant. */
export async function setOptOut(refus: boolean): Promise<void> {
  await AsyncStorage.setItem(CLE_OPTOUT, refus ? '1' : '0');
  if (refus) {
    const ancien = installId;
    actif = false; file = []; attente = []; installId = null;
    if (minuterie) { clearInterval(minuterie); minuterie = null; }
    abonnementAppState?.remove(); abonnementAppState = null;
    await Promise.all([AsyncStorage.removeItem(CLE_FILE), AsyncStorage.removeItem(CLE_INSTALL)]);
    if (ancien && options) {
      fetch(options.url + '/v1/forget', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-app-key': options.cle },
        body: JSON.stringify({ install_id: ancien }),
      }).catch(() => {});
    }
  } else if (options && !actif) {
    // Réactivation : nouvel identifiant, la mesure repart de zéro.
    const o = options; options = null; pret = false;
    await init(o);
  }
}

export async function isOptedOut(): Promise<boolean> {
  return (await AsyncStorage.getItem(CLE_OPTOUT)) === '1';
}

// ───────────────────────────── Capture des erreurs ─────────────────────────────

function versElement(erreur: unknown, source: 'global' | 'promesse' | 'manuel', fatal: boolean): Element {
  const e = erreur instanceof Error ? erreur : new Error(typeof erreur === 'string' ? erreur : safeString(erreur));
  return {
    type: 'error',
    error_type: (e.name || 'Error').slice(0, 80),
    message: (e.message || '').slice(0, 500),
    stack: e.stack?.slice(0, 4000),
    fatal, source, screen: ecranCourant, last_action: derniereAction, ts: Date.now(),
  };
}

function safeString(v: unknown): string {
  try { return JSON.stringify(v)?.slice(0, 200) ?? String(v); } catch { return String(v); }
}

let captureInstallee = false;
function installerCaptureErreurs() {
  if (captureInstallee) return;
  captureInstallee = true;

  // 1. Erreurs JS globales (non attrapées).
  const EU = (globalThis as { ErrorUtils?: { getGlobalHandler(): (e: unknown, f?: boolean) => void; setGlobalHandler(h: (e: unknown, f?: boolean) => void): void } }).ErrorUtils;
  if (EU) {
    gestionnairePrecedent = EU.getGlobalHandler();
    EU.setGlobalHandler((erreur, fatal) => {
      ajouter(versElement(erreur, 'global', !!fatal));
      if (fatal) {
        // L'app va s'arrêter : on écrit la file sur le disque avant de rendre la main (1,5 s max).
        // Elle sera envoyée au prochain lancement.
        const fin = () => gestionnairePrecedent?.(erreur, fatal);
        Promise.race([sauvegarder(true), new Promise((r) => setTimeout(r, 1500))]).then(fin, fin);
      } else {
        gestionnairePrecedent?.(erreur, fatal);
      }
    });
  }

  // 2. Promesses rejetées non gérées.
  const surRejet = (_id: number, raison: unknown) => {
    ajouter(versElement(raison, 'promesse', false));
    if (typeof __DEV__ !== 'undefined' && __DEV__) console.warn('Promesse rejetée non gérée', raison);
  };
  const Hermes = (globalThis as { HermesInternal?: { hasPromise?(): boolean; enablePromiseRejectionTracker?(o: object): void } }).HermesInternal;
  if (Hermes?.enablePromiseRejectionTracker && Hermes.hasPromise?.()) {
    Hermes.enablePromiseRejectionTracker({ allRejections: true, onUnhandled: surRejet, onHandled: () => {} });
  } else {
    try {
      // Moteur JSC / ancienne architecture : polyfill « promise » utilisé par React Native.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('promise/setimmediate/rejection-tracking').enable({ allRejections: true, onUnhandled: surRejet, onHandled: () => {} });
    } catch { /* indisponible : seules les erreurs globales sont capturées */ }
  }
}

// ───────────────────────────── Pour les tests ─────────────────────────────

/** @internal Remet le module à zéro (tests). */
export function __reinitialiser(): void {
  if (minuterie) clearInterval(minuterie);
  abonnementAppState?.remove();
  options = null; actif = false; pret = false; file = []; attente = []; installId = null;
  ecranCourant = undefined; derniereAction = undefined; envoiEnCours = null; echecsReseau = 0; prochainEssai = 0;
  minuterie = null; abonnementAppState = null;
}

declare const __DEV__: boolean;
