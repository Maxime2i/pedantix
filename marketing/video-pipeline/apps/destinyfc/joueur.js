// Avatar du joueur et cinématiques, dessinés par le code même de l'app (app/app.js, généré par
// outils/sync-app.mjs) : éditeur « Mon joueur », avatar en grand sur la scène, lecteur de cinématique.
const A = window.DFC_APP;
export const CAT = A.catalogue;
export const R = A.rig;

/** Avatar du script : `skin` et `hairColor` en indice (0 à 7) ou en couleur ; le reste comme dans l'app. */
export function normaliser(av = {}) {
  const o = { ...CAT.defaultAvatar(), ...av, gear: { ...(av.gear ?? {}) } };
  if (typeof o.skin === "number") o.skin = CAT.SKIN_TONES[o.skin];
  if (typeof o.hairColor === "number") o.hairColor = CAT.HAIR_COLORS[o.hairColor];
  return o;
}

// Identifiants SVG stables (dégradés, découpes) : une même image garde le même HTML d'une image à l'autre.
const uids = new Map();
const uid = (cle) => { if (!uids.has(cle)) uids.set(cle, `u${uids.size}`); return uids.get(cle); };
const fixes = new Map();

/** Image fixe de l'avatar, comme AvatarView (src/avatar/render.ts) : une pose du squelette, sans vie au repos. */
export function svgFixe(av, { pose = "front", crop = "full", kit, shirtName, shirtNumber, sticker = true } = {}) {
  const cle = JSON.stringify([av, pose, crop, kit, shirtName, shirtNumber, sticker]);
  if (!fixes.has(cle)) {
    const rig = R.createRig(pose);
    const p = R.livePose(rig, 0, 0, true);
    fixes.set(cle, `<svg viewBox="${R.RIG_VIEWS[crop]}" preserveAspectRatio="xMidYMid meet" width="100%" height="100%">${R.sceneSvg(av, rig, 0, p, { kit, shirtName, shirtNumber, shadow: sticker !== false, uid: uid(cle) })}</svg>`);
  }
  return fixes.get(cle);
}

/** Avatar vivant (respiration, clignements, changements de pose) à l'instant t (s). `poses` : [[t, pose], …]. */
export function svgVivant(av, poses, t, { kit, shirtName, shirtNumber, crop = "full" } = {}) {
  const rig = R.createRig(poses[0]?.[1] ?? "front");
  for (const [tp, nom] of poses.slice(1)) if (tp <= t) R.setRigPose(rig, nom, tp * 1000);
  const ms = t * 1000;
  const p = R.livePose(rig, ms);
  return `<svg viewBox="${R.RIG_VIEWS[crop]}" preserveAspectRatio="xMidYMax meet" width="100%" height="100%">${R.sceneSvg(av, rig, ms, p, { kit, shirtName, shirtNumber, shadow: true, uid: "vivant" })}</svg>`;
}

// ---------- Éditeur « Mon joueur » (src/screens/AvatarScreen.tsx) ----------

const ONGLETS = ["skin", "hair", "face", "gear", "outfit"];
const SECTIONS_EQUIPEMENT = ["head", "eyes", "face", "neck"];
export const POSES_EDITEUR = ["front", "back", "celebrate"];

/** Champ modifié par `porter` → onglet où se trouve sa case. */
export function ongletDe(champ) {
  return { skin: "skin", hair: "hair", hairColor: "hair", beard: "face", brows: "face", outfit: "outfit" }[champ] ?? "gear";
}

/** Article payant (coupe, barbe, sourcils, équipement) correspondant à une valeur, ou rien s'il est gratuit. */
export function article(champ, valeur) {
  if (["hair", "beard", "brows"].includes(champ)) return CAT.paidStyle(champ, valeur) ?? null;
  return CAT.GEAR.find((g) => g.id === valeur) ?? null;
}

/** Écran de l'éditeur. e = { avatar, onglet, pose, possede, jetons, nomMaillot, halloween }. */
export function ecranAvatar(e, txt) {
  const tx = A.textes().avatar;
  const av = e.avatar;
  const cellule = Math.floor((393 - 32 - 20) / 3), vignette = Math.round(cellule * 0.86);
  const possede = (id) => e.possede.includes(id);
  const prix = (cout) => `<span class="av-prix ${e.jetons < cout ? "bas" : ""}"><i></i>${cout}</span>`;
  const buste = (a, crop = "bust") => `<span class="av-vig" style="width:${vignette}px;height:${vignette}px">${svgFixe(a, { crop, sticker: false })}</span>`;
  const cell = (id, actif, contenu, { anneau, pied = "" } = {}) =>
    `<div class="av-cell ${actif ? "on" : ""}" id="${id}" style="width:${cellule}px;height:${cellule}px;${anneau && !actif ? `border-color:${anneau}` : ""}">${contenu}${pied}</div>`;
  const style = (champ, valeur, a) => {
    const art = article(champ, valeur);
    const bloque = art && !possede(art.id);
    return cell(`av-c-${champ}-${valeur}`, av[champ] === valeur, buste(a), { anneau: art ? A.rarete[art.rarity] : null, pied: bloque ? prix(art.cost) : "" });
  };
  const enVente = (g) => possede(g.id) || (!g.until || e.halloween);
  const equipement = (g) => {
    const porte = av.gear[g.slot] === g.id;
    const crop = g.slot === "outfit" ? "full" : g.slot === "neck" && g.id !== "hw_vampire_collar" ? "chest" : "bust";
    return cell(`av-c-${g.slot}-${g.id}`, porte, buste({ ...av, gear: { ...(g.slot === "outfit" ? av.gear : {}), [g.slot]: g.id } }, crop),
      { anneau: A.rarete[g.rarity], pied: possede(g.id) ? (porte ? `<span class="av-prix porte">✓</span>` : "") : prix(g.cost) });
  };
  const titre = (l, premier) => `<div class="av-label ${premier ? "premier" : ""}">${l}</div>`;
  const grille = (cases) => `<div class="av-grille">${cases.join("")}</div>`;
  let panneau = "";
  if (e.onglet === "skin") panneau = titre(tx.tabSkin, true) + grille(CAT.SKIN_TONES.map((c) => cell(`av-c-skin-${CAT.SKIN_TONES.indexOf(c)}`, av.skin === c, buste({ ...av, skin: c, gear: {} }))));
  else if (e.onglet === "hair") panneau = titre(tx.hairStyle, true) + grille(CAT.HAIR_STYLES.map((h) => style("hair", h, { ...av, hair: h, beard: "none", gear: {} })))
    + titre(tx.hairColor) + grille(CAT.HAIR_COLORS.map((c, i) => cell(`av-c-hairColor-${i}`, av.hairColor === c, `<span class="av-teinte" style="width:${cellule / 2}px;height:${cellule / 2}px;background:${c}"></span>`)));
  else if (e.onglet === "face") panneau = titre(tx.beard, true) + grille(CAT.BEARDS.map((b) => style("beard", b, { ...av, beard: b, gear: {} })))
    + titre(tx.brows) + grille(CAT.BROWS.map((b) => style("brows", b, { ...av, brows: b, gear: {} })));
  else if (e.onglet === "gear") panneau = SECTIONS_EQUIPEMENT.map((slot, i) => { const items = CAT.GEAR.filter((g) => g.slot === slot && enVente(g)); return items.length ? titre(tx[`slot_${slot}`], i === 0) + grille(items.map(equipement)) : ""; }).join("");
  else if (e.onglet === "outfit") panneau = titre(tx.tabOutfit, true) + grille([cell("av-c-outfit-club", !av.gear.outfit, buste({ ...av, gear: {} }, "full"), { pied: `<span class="av-nom">${tx.clubKit}</span>` }),
    ...CAT.GEAR.filter((g) => g.slot === "outfit" && enVente(g)).map(equipement)]);
  return `<div class="av-ecran">
    <div class="av-tete"><span class="av-retour"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
      <span class="av-titre">${tx.title}</span><span class="chip" id="av-jetons">🪙 ${e.jetons}</span></div>
    <div class="av-scene" id="av-scene"><span style="width:138px;height:230px;display:block">${svgFixe(av, { pose: e.pose, shirtName: e.nomMaillot, shirtNumber: 10 })}</span>
      <span class="av-bpose" id="av-pose">${A.iconePose.replace("<svg ", '<svg width="22" height="22" ')}</span></div>
    <div class="av-onglets">${ONGLETS.map((o) => `<span class="${e.onglet === o ? "on" : ""}" id="av-onglet-${o}">${A.icones[o].replace(/COLOR/g, e.onglet === o ? "#FFFFFF" : "rgba(255,255,255,0.65)").replace("<svg ", '<svg width="24" height="24" ')}</span>`).join("")}</div>
    <div class="av-panneau"><div id="av-defil">${panneau}</div></div></div>`;
}

// ---------- Cinématiques (src/cinematics) : la vraie page, sur une horloge virtuelle ----------

/**
 * Données d'une cinématique, construites par le code de l'app (signingCinematic / momentCinematic).
 * `a` : action du script ; `j` : joueur de la démo ; `av` : avatar.
 */
export function donneesCine(a, j, av, langue) {
  A.langue(langue);
  // Tirage du côté (gauche / droite) fixé par le script (`cote`), pour un rendu reproductible.
  const hasard = Math.random;
  Math.random = () => ((a.cote ?? 1) < 0 ? 0.75 : 0.25); // momentCinematic : côté 1 si random < 0,5
  try {
    const joueur = { name: a.nom ?? j.nom, position: { id: { attaquant: "att", milieu: "mil", defenseur: "def", gardien: "gk" }[j.poste] ?? "mil" },
      club: { id: a.clubId ?? j.club, colors: a.couleursClub ?? "🔴🟡" }, nationality: { id: a.nation ?? "fr" } };
    let c;
    if (a.id === "signing") c = A.cine.signingCinematic(joueur, { name: a.depuis ?? j.club }, { club: { id: a.clubId ?? a.club, name: a.club, colors: a.couleurs, countryId: a.pays ?? "fr" }, fee: a.montant ?? null }, !!a.pret, av);
    else c = A.cine.momentCinematic(joueur, a.titre, a.options, a.option, a.reussite !== false, av, !!a.national);
    if (!c) throw new Error(`Pas de cinématique pour l'option « ${a.option} »`);
    if (a.id !== "signing" && c.id !== a.id) throw new Error(`L'option « ${a.option} » joue la cinématique « ${c.id} », pas « ${a.id} »`);
    // Marges de l'écran (île, barre d'accueil) : passées par l'app comme dans CinematicOverlay.
    return { ...c, data: { ...c.data, safeTop: 54, safeBottom: 34 } };
  } finally { Math.random = hasard; }
}

// Horloge virtuelle injectée en tête de la page : temps, images, minuteries et hasard pilotés par la vidéo.
const SHIM = `<script>(function(){var vt=0,q=[],tq=[],n=0,s=7;
performance.now=function(){return vt};Date.now=function(){return 1793000000000+vt};
window.requestAnimationFrame=function(cb){q.push({i:++n,cb:cb});return n};
window.cancelAnimationFrame=function(i){q=q.filter(function(x){return x.i!==i})};
window.setTimeout=function(cb,ms){tq.push({i:++n,cb:cb,at:vt+(ms||0)});return n};
window.clearTimeout=function(i){tq=tq.filter(function(x){return x.i!==i})};
Math.random=function(){s=(s+0x6D2B79F5)|0;var t=Math.imul(s^(s>>>15),1|s);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296};
Object.defineProperty(window,'devicePixelRatio',{get:function(){return 2}});
window.__msgs=[];window.ReactNativeWebView={postMessage:function(m){window.__msgs.push({t:vt,m:m})}};
window.__vtStep=function(t){vt=t;var d=tq.filter(function(x){return x.at<=vt});tq=tq.filter(function(x){return x.at>vt});d.forEach(function(x){x.cb()});var c=q;q=[];c.forEach(function(x){x.cb(vt)})};
})();<\/script>`;

const PAS = 1000 / 60;
/** Lecteur : une iframe de la page de cinématique ; aller(ms) avance l'horloge par pas de 1/60 s (recharge si on recule). */
export function lecteurCine(hote, html) {
  const page = html.replace(/<head>/i, (h) => h + SHIM);
  if (page === html) throw new Error("Page de cinématique sans <head>");
  let iframe = null, cur = 0, pret = null;
  const charger = () => {
    iframe?.remove();
    iframe = Object.assign(document.createElement("iframe"), { srcdoc: page });
    iframe.className = "cine";
    hote.append(iframe);
    cur = 0;
    pret = new Promise((r) => (iframe.onload = r));
    return pret;
  };
  charger();
  return {
    get pret() { return pret; },
    get iframe() { return iframe; },
    get messages() { return iframe.contentWindow.__msgs ?? []; },
    async aller(ms) {
      if (ms < cur - 0.5) await charger();
      await pret;
      const w = iframe.contentWindow;
      while (cur + PAS <= ms + 0.01) { cur += PAS; w.__vtStep(cur); }
    },
  };
}
