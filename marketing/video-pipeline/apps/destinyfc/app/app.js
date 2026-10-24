// Généré par outils/sync-app.mjs depuis destiny-eleven (proto/avatar-rig, e309b21 2026-10-24) : ne pas modifier à la main.
(function () {
  var SOURCES = {
"avatar/rigWeb": function (exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RIG_WEB_JS = void 0;
exports.RIG_WEB_JS = "window.DestinyRig=(function(){var exports={};\n\"use strict\";\nObject.defineProperty(exports, \"__esModule\", { value: true });\nexports.RIG_VIEWS = exports.FLOOR_Y = exports.DEFAULT_KIT = void 0;\nexports.shade = shade;\nexports.isLight = isLight;\nexports.createRig = createRig;\nexports.setRigPose = setRigPose;\nexports.livePose = livePose;\nexports.sceneSvg = sceneSvg;\nexports.DEFAULT_KIT = { c1: '#0B6F7C', c2: '#F2F2F2' };\nfunction bezier(x1, y1, x2, y2) {\n    const c = (t, a, b) => 3 * (1 - t) * (1 - t) * t * a + 3 * (1 - t) * t * t * b + t * t * t;\n    return (p) => {\n        if (p <= 0)\n            return 0;\n        if (p >= 1)\n            return 1;\n        let lo = 0;\n        let hi = 1;\n        let t = p;\n        for (let i = 0; i < 24; i++) {\n            t = (lo + hi) / 2;\n            if (c(t, x1, x2) < p)\n                lo = t;\n            else\n                hi = t;\n        }\n        return c(t, y1, y2);\n    };\n}\nconst EASE_IN_OUT = bezier(0.77, 0, 0.175, 1);\nconst EASE_OUT = bezier(0.23, 1, 0.32, 1);\nconst clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));\nconst wave = (t, period, phase = 0) => Math.sin((t / period + phase) * Math.PI * 2);\nconst loop = (t, period, phase = 0) => {\n    const p = (t / period + phase) % 1;\n    return p < 0 ? p + 1 : p;\n};\nconst bell = (p) => Math.sin(Math.PI * clamp(p));\nfunction flow(t, k) {\n    const n = k.length;\n    if (t <= k[0][0])\n        return k[0][1];\n    if (t >= k[n - 1][0])\n        return k[n - 1][1];\n    let i = 0;\n    while (k[i + 1][0] < t)\n        i++;\n    const slope = (j) => (k[j + 1][1] - k[j][1]) / (k[j + 1][0] - k[j][0]);\n    const tangent = (j) => {\n        if (j === 0 || j === n - 1)\n            return 0;\n        const a = slope(j - 1);\n        const b = slope(j);\n        if (a * b <= 0)\n            return 0;\n        const h0 = k[j][0] - k[j - 1][0];\n        const h1 = k[j + 1][0] - k[j][0];\n        const w0 = 2 * h1 + h0;\n        const w1 = h1 + 2 * h0;\n        return (w0 + w1) / (w0 / a + w1 / b);\n    };\n    const h = k[i + 1][0] - k[i][0];\n    const s = (t - k[i][0]) / h;\n    const s2 = s * s;\n    const s3 = s2 * s;\n    return ((2 * s3 - 3 * s2 + 1) * k[i][1] +\n        (s3 - 2 * s2 + s) * h * tangent(i) +\n        (-2 * s3 + 3 * s2) * k[i + 1][1] +\n        (s3 - s2) * h * tangent(i + 1));\n}\nfunction blinkAt(dt) {\n    if (dt < 0 || dt > 340)\n        return 0;\n    if (dt < 110)\n        return EASE_IN_OUT(dt / 110);\n    if (dt < 150)\n        return 1;\n    return 1 - EASE_OUT((dt - 150) / 190);\n}\nfunction rgb(hex) {\n    const n = parseInt(hex.replace('#', '').slice(0, 6), 16);\n    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];\n}\nfunction toHex(r, g, b) {\n    const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');\n    return `#${c(r)}${c(g)}${c(b)}`;\n}\nfunction shade(color, k) {\n    const [r, g, b] = rgb(color);\n    return k < 0 ? toHex(r * (1 + k), g * (1 + k), b * (1 + k)) : toHex(r + (255 - r) * k, g + (255 - g) * k, b + (255 - b) * k);\n}\nfunction mix(a, b, k) {\n    const pa = rgb(a);\n    const pb = rgb(b);\n    return toHex(pa[0] + (pb[0] - pa[0]) * k, pa[1] + (pb[1] - pa[1]) * k, pa[2] + (pb[2] - pa[2]) * k);\n}\nfunction isLight(color) {\n    const [r, g, b] = rgb(color);\n    return 0.299 * r + 0.587 * g + 0.114 * b > 160;\n}\nconst INK = { shoe: '#262329', gold: '#F2C230', pupil: '#3C3C3C', mouth: '#B03A3A', tongue: '#F15A5A', white: '#FFFFFF', floor: 'rgba(0,0,0,0.16)' };\nconst BASE = {\n    lean: 0, shift: 0, turn: 0, yaw: 0, head: 0, aLa: 14, aLe: 10, aRa: 14, aRe: 10, legL: 3, legR: 3, toeR: 0,\n    sy: 1, lookX: 0, lookY: 0, lid0: 0, cheek: 0, mouth: 11, sad: 0, hop: 0, wave: 0,\n};\nconst CHANNELS = Object.keys(BASE);\nconst ARM = { x: 34, y: 66, w: 26, hand: 13, upper: 30, fore: 28, reach: 12 };\nfunction reachFor(side, tx, ty) {\n    const dx = tx - side * ARM.x;\n    const dy = ty - ARM.y;\n    const d = Math.min(Math.hypot(dx, dy), ARM.upper + ARM.fore - 1);\n    const th = (Math.atan2(side * dx, dy) * 180) / Math.PI;\n    const al = (Math.acos((ARM.upper ** 2 + d * d - ARM.fore ** 2) / (2 * ARM.upper * d)) * 180) / Math.PI;\n    const be = (Math.acos((ARM.fore ** 2 + d * d - ARM.upper ** 2) / (2 * ARM.fore * d)) * 180) / Math.PI;\n    return { a: th - al, e: be + al };\n}\nconst handL = reachFor(-1, -42, 26);\nconst handR = reachFor(1, 45, 18);\nconst POSES = {\n    front: Object.assign({}, BASE),\n    wave: Object.assign(Object.assign({}, BASE), { aRa: 60, aRe: 110, aLa: 18, aLe: 12, wave: 1, head: 6, mouth: 18, cheek: 0.35, shift: -3 }),\n    celebrate: Object.assign(Object.assign({}, BASE), { aLa: 132, aLe: 6, aRa: 140, aRe: -4, hop: 1, cheek: 1, mouth: 22, head: 3 }),\n    despair: Object.assign(Object.assign({}, BASE), { aLa: handL.a, aLe: handL.e, aRa: handR.a, aRe: handR.e, sy: 0.97, head: -6, lookY: 4, lid0: 0.35, mouth: 8, sad: 1 }),\n    back: Object.assign(Object.assign({}, BASE), { turn: 2, aLa: 16, aRa: 20 }),\n    slide: Object.assign(Object.assign({}, BASE), { legR: 72, toeR: 24, legL: 16, aLa: 50, aLe: 34, aRa: 74, aRe: -14, lean: -12, sy: 0.88, head: -4, mouth: 14 }),\n    header: Object.assign(Object.assign({}, BASE), { aLa: 72, aLe: 42, aRa: 78, aRe: 38, legL: 12, legR: 6, head: -6, lookY: -4, mouth: 12 }),\n    card: Object.assign(Object.assign({}, BASE), { aRa: 170, aRe: 0, aLa: 18, aLe: 12, head: 2, mouth: 6, lid0: 0.1 }),\n    calm: Object.assign(Object.assign({}, BASE), { aLa: 44, aLe: 26, aRa: 46, aRe: 24, head: 5, mouth: 6, cheek: 0.2 }),\n    focus: Object.assign(Object.assign({}, BASE), { mouth: 4, lid0: 0.18, lookY: 3, head: -2 }),\n    keeper: Object.assign(Object.assign({}, BASE), { aLa: 58, aLe: 34, aRa: 62, aRe: 30, sy: 0.93, legL: 13, legR: 13, mouth: 6, lid0: 0.12 }),\n    stretch: Object.assign(Object.assign({}, BASE), { aLa: 162, aLe: 0, aRa: 166, aRe: 0, legL: 16, legR: 5, mouth: 18, cheek: 0.2 }),\n    boo: Object.assign(Object.assign({}, BASE), { aLa: 128, aLe: 38, aRa: 132, aRe: 36, lean: -3, sy: 1.03, head: 4, mouth: 26, lookY: -2, legL: 8, legR: 8 }),\n};\nconst KICK = {\n    lean: [[0, 0], [500, -2], [700, -4], [800, -9], [950, -5], [1200, 0]],\n    shift: [[0, 0], [450, -3], [700, -7], [900, -5], [1200, 0]],\n    yaw: [[0, 0], [250, 0.45], [700, 0.3], [850, 0.55], [1250, 0.5], [1550, 0]],\n    head: [[0, 0], [250, 6], [700, 3], [850, -6], [1250, -4], [1550, 0]],\n    lookY: [[0, 0], [100, 0], [300, 4], [750, 4], [900, -5], [1250, -4], [1500, 0]],\n    lookX: [[0, 0], [100, 0], [300, 3], [750, 2], [900, 5], [1250, 4], [1500, 0]],\n    legR: [[0, 3], [500, 3], [700, -17], [750, 25], [810, 61], [900, 55], [1150, 3]],\n    toeR: [[0, 0], [600, 0], [750, 40], [900, 35], [1150, 0]],\n    aRa: [[0, 14], [500, 22], [700, 40], [800, 18], [950, 30], [1250, 20], [1600, 14]],\n    aRe: [[0, 10], [700, 20], [800, 30], [950, 15], [1250, 10]],\n    aLa: [[0, 14], [500, 30], [700, 55], [800, 85], [950, 60], [1250, 20], [1600, 14]],\n    aLe: [[0, 10], [700, 15], [800, 25], [950, 15], [1250, 10]],\n    mouth: [[0, 11], [750, 9], [800, 18], [1050, 22], [1500, 18], [1800, 11]],\n    cheek: [[0, 0], [1000, 0], [1100, 1], [1500, 1], [1700, 0]],\n};\nconst SHOOT = {\n    lean: [[0, 0], [250, -3], [380, -6], [450, -10], [620, -4], [950, 0]],\n    shift: [[0, 0], [300, -5], [450, -8], [950, -2]],\n    head: [[0, 0], [420, -4], [950, 0]],\n    lookY: [[0, 3], [400, 5], [950, 0]],\n    legR: [[0, 3], [200, 3], [350, -20], [420, 30], [480, 62], [620, 50], [950, 3]],\n    toeR: [[0, 0], [350, 0], [420, 40], [620, 30], [950, 0]],\n    aLa: [[0, 14], [300, 35], [420, 88], [620, 55], [950, 20]],\n    aLe: [[0, 10], [420, 25], [950, 10]],\n    aRa: [[0, 14], [300, 28], [420, 18], [620, 30], [950, 14]],\n    mouth: [[0, 8], [420, 16], [950, 10]],\n};\nconst ONE_SHOTS = { kick: KICK, shoot: SHOOT };\nconst BALL = { r: 25, startX: 310, stopX: 55, arrive: 650, kick: 750, vx: 620, vy: 524, g: 1034, spin: 16 };\nfunction target(pose, dt) {\n    if (pose.endsWith('Back')) {\n        return Object.assign(Object.assign({}, target(pose.slice(0, -4), dt)), { turn: 2 });\n    }\n    if (pose !== 'kick' && pose !== 'shoot')\n        return POSES[pose];\n    const keys = ONE_SHOTS[pose];\n    const o = Object.assign({}, BASE);\n    for (const k of Object.keys(keys))\n        o[k] = flow(dt, keys[k]);\n    return o;\n}\nfunction createRig(pose = 'front') {\n    return { pose, prev: pose, t0: -1e9, from: Object.assign({}, target(pose, 1e9)) };\n}\nconst BLEND = 450;\nfunction channelsAt(rig, t) {\n    if (t < rig.t0)\n        return rig.from;\n    const dt = t - rig.t0;\n    const k = EASE_IN_OUT(clamp(dt / BLEND));\n    const tg = target(rig.pose, dt);\n    const out = Object.assign({}, BASE);\n    for (const c of CHANNELS)\n        out[c] = rig.from[c] + (tg[c] - rig.from[c]) * k;\n    return out;\n}\nfunction setRigPose(rig, pose, t) {\n    rig.from = channelsAt(rig, t);\n    rig.prev = rig.pose;\n    rig.pose = pose;\n    rig.t0 = t;\n}\nfunction livePose(rig, t, idle = 0, still = false) {\n    const c = channelsAt(rig, t);\n    const late = channelsAt(rig, t - 110);\n    const trail = channelsAt(rig, t - 90);\n    const ti = t + idle;\n    const on = still ? 0 : 1;\n    const W = (period, phase = 0) => wave(ti, period, phase) * on;\n    const dt = t - rig.t0;\n    let lift = 0;\n    let squash = 0;\n    if (c.hop > 0.01 && !still) {\n        const k = loop(ti, 820);\n        if (k < 0.7) {\n            const q = k / 0.7;\n            lift = 21 * 4 * q * (1 - q) * c.hop;\n        }\n        else\n            squash = 0.13 * bell((k - 0.7) / 0.3) * c.hop;\n    }\n    const sy0 = c.sy - squash;\n    const front = rig.pose === 'despair' ? dt > 80 : rig.prev === 'despair' && dt < 260;\n    const calm = front ? 0.3 : 1;\n    const arm = (ka, ke, ph) => ({\n        a: c[ka] + (4 * W(3000, ph) + 2 * W(1800, ph + 0.3)) * calm,\n        e: c[ke] + 5 * W(2250, ph + 0.6) * calm + 0.45 * (trail[ka] - c[ka]),\n    });\n    const armR = arm('aRa', 'aRe', 0);\n    armR.e += 14 * W(750) * c.wave;\n    const shift = c.shift + 1.2 * W(4500);\n    const back = c.turn > 1;\n    const yaw = (back ? c.turn - 2 : c.turn) + c.yaw + 0.06 * W(3000, 0.1);\n    const cyc = ((ti % 7400) + 7400) % 7400;\n    const bl = still ? 0 : Math.max(blinkAt(cyc - 1100), blinkAt(cyc - 4400), blinkAt(cyc - 4720), blinkAt(dt));\n    const lid = c.lid0 + (1 - c.lid0) * bl;\n    return {\n        lift,\n        sx: 1 / Math.pow(sy0, 0.6),\n        sy: sy0 * (1 + 0.014 * W(2250)),\n        lean: c.lean + 1.5 * W(4500, 0.2),\n        shift,\n        yaw,\n        back,\n        head: c.head - 0.45 * late.lean + 2 * W(4500, 0.6) + 3 * W(1600) * c.sad,\n        armL: arm('aLa', 'aLe', 0.5),\n        armR,\n        front,\n        legL: c.legL + Math.max(0, shift) * 0.9,\n        legR: c.legR,\n        toeR: c.toeR,\n        lookX: c.lookX + 5 * yaw,\n        lookY: c.lookY,\n        lid,\n        cheek: Math.max(c.cheek, 0.18 * lid),\n        mouth: c.mouth,\n        sad: c.sad,\n    };\n}\nconst f = (n) => Math.round(n * 100) / 100;\nconst pill = (cx, cy, w, h, fill, extra = '') => `<rect x=\"${f(cx - w / 2)}\" y=\"${f(cy - h / 2)}\" width=\"${f(w)}\" height=\"${f(h)}\" rx=\"${f(Math.min(w, h) / 2)}\" fill=\"${fill}\" ${extra}/>`;\nconst circle = (cx, cy, r, fill, extra = '') => `<circle cx=\"${f(cx)}\" cy=\"${f(cy)}\" r=\"${f(r)}\" fill=\"${fill}\" ${extra}/>`;\nconst caps = (pts, w, color) => `<polyline points=\"${pts.map((p) => `${f(p[0])},${f(p[1])}`).join(' ')}\" fill=\"none\" stroke=\"${color}\" stroke-width=\"${w}\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>`;\nconst path = (d, fill, extra = '') => `<path d=\"${d}\" fill=\"${fill}\" ${extra}/>`;\nconst g = (tr, inner, extra = '') => `<g transform=\"${tr}\" ${extra}>${inner}</g>`;\nfunction roundedPolygon(pts, r) {\n    const n = pts.length;\n    let d = '';\n    for (let i = 0; i < n; i++) {\n        const pt = pts[i];\n        const toward = (q) => {\n            const dx = q[0] - pt[0];\n            const dy = q[1] - pt[1];\n            const l = Math.max(0.001, Math.hypot(dx, dy));\n            return [pt[0] + (dx / l) * r, pt[1] + (dy / l) * r];\n        };\n        const s = toward(pts[(i + n - 1) % n]);\n        const e = toward(pts[(i + 1) % n]);\n        d += `${i === 0 ? 'M' : 'L'}${f(s[0])} ${f(s[1])}Q${f(pt[0])} ${f(pt[1])} ${f(e[0])} ${f(e[1])}`;\n    }\n    return d + 'Z';\n}\nfunction tomb(cx, top, w, h, r) {\n    const R = w / 2;\n    const yb = top + h;\n    const q = Math.min(r, R, h - R);\n    return `M${f(cx - R)} ${f(top + R)}A${f(R)} ${f(R)} 0 0 1 ${f(cx + R)} ${f(top + R)}L${f(cx + R)} ${f(yb - q)}Q${f(cx + R)} ${f(yb)} ${f(cx + R - q)} ${f(yb)}L${f(cx - R + q)} ${f(yb)}Q${f(cx - R)} ${f(yb)} ${f(cx - R)} ${f(yb - q)}Z`;\n}\nfunction hairCap(x0, o = {}) {\n    var _a, _b, _c;\n    const R = (_a = o.R) !== null && _a !== void 0 ? _a : 55;\n    const cy = (_b = o.cy) !== null && _b !== void 0 ? _b : -19;\n    const bottom = -10;\n    const q = 8;\n    const top = (_c = o.top) !== null && _c !== void 0 ? _c : -42;\n    const w = 78;\n    const r = 18;\n    return `M${-R} ${cy}A${R} ${R} 0 0 1 ${R} ${cy}L${R} ${bottom - q}Q${R} ${bottom} ${R - q} ${bottom}L${f(x0 + w)} ${bottom}L${f(x0 + w)} ${top + r}Q${f(x0 + w)} ${top} ${f(x0 + w - r)} ${top}L${f(x0 + r)} ${top}Q${f(x0)} ${top} ${f(x0)} ${top + r}L${f(x0)} ${bottom}L${-R + q} ${bottom}Q${-R} ${bottom} ${-R} ${bottom - q}Z`;\n}\nfunction pentagon(cx, cy, r, turn) {\n    const pts = [];\n    for (let k = 0; k < 5; k++) {\n        const a = turn + (k * 2 * Math.PI) / 5 - Math.PI / 2;\n        pts.push(`${f(cx + Math.cos(a) * r)} ${f(cy + Math.sin(a) * r)}`);\n    }\n    return `M${pts.join('L')}Z`;\n}\nfunction escapeXml(s) {\n    return s.replace(/[<>&\"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '\"': '&quot;', \"'\": '&apos;' })[c]);\n}\nfunction hairShapes(style, yaw, col, skin, uid) {\n    const win = -39 + 9 * yaw;\n    const q = 5 * yaw;\n    const backCap = path(tomb(0, -68, 106, 100, 30), col);\n    const stubble = mix(skin, col, 0.35);\n    const bumps = (cy, R, r, from, to, n) => {\n        let s = '';\n        for (let i = 0; i <= n; i++) {\n            const a = from + ((to - from) * i) / n;\n            s += circle(Math.cos(a) * R, cy + Math.sin(a) * R, r, col);\n        }\n        return s;\n    };\n    switch (style) {\n        case 'short': {\n            const quiff = path(roundedPolygon([[-30 + q, -70], [34 + q, -104], [48 + q, -58]], 12), col);\n            return { front: path(hairCap(win), col) + quiff, back: backCap + quiff };\n        }\n        case 'buzz':\n            return { front: path(hairCap(win, { R: 52, top: -46, cy: -17 }), col), back: path(tomb(0, -60, 104, 88, 30), col) };\n        case 'curly': {\n            const top = bumps(-21, 52, 13, Math.PI * 1.08, Math.PI * 1.92, 6);\n            return { front: path(hairCap(win), col) + top, back: backCap + top };\n        }\n        case 'afro': {\n            const cloud = circle(0, -30, 58, col) + bumps(-24, 52, 25, Math.PI, Math.PI * 2, 6);\n            return { behind: cloud, front: path(hairCap(win, { R: 56 }), col), back: cloud + path(tomb(0, -72, 118, 104, 34), col) };\n        }\n        case 'braids': {\n            const tip = shade(col, -0.25);\n            let braids = '';\n            for (let i = -3; i <= 3; i++)\n                braids += pill(i * 17, 10, 13, 100, col) + circle(i * 17, 58, 6, tip);\n            return { behind: braids, front: path(hairCap(win, { R: 54 }), col), back: path(tomb(0, -66, 108, 92, 30), col) + braids };\n        }\n        case 'long': {\n            const long = path(tomb(0, -70, 120, 130, 34), col);\n            return { behind: long, front: path(hairCap(win, { R: 57 }), col), back: long };\n        }\n        case 'mohawk': {\n            const strip = `<rect x=\"${f(-12 + q)}\" y=\"-100\" width=\"24\" height=\"64\" rx=\"11\" fill=\"${col}\"/>`;\n            return {\n                front: path(hairCap(win, { R: 51, top: -50, cy: -17 }), stubble) + strip,\n                back: path(tomb(0, -56, 102, 84, 30), stubble) + strip,\n            };\n        }\n        case 'side': {\n            const sweep = path(roundedPolygon([[-52, -40], [-14 + q, -68], [42 + q, -58], [34 + q, -32], [4 + q, -40], [-34, -26]], 10), col);\n            return { front: path(hairCap(win, { top: -46 }), col) + sweep, back: backCap };\n        }\n        case 'spiky': {\n            let spikes = '';\n            for (let i = -2; i <= 2; i++) {\n                const a = -Math.PI / 2 + (i * Math.PI) / 7.5;\n                const at = (da, r) => [Math.cos(a + da) * r + q * (r / 72), -19 + Math.sin(a + da) * r];\n                spikes += path(roundedPolygon([at(-0.2, 46), at(0, 74 - Math.abs(i) * 4), at(0.2, 46)], 5), col);\n            }\n            return { front: path(hairCap(win, { top: -46 }), col) + spikes, back: backCap + spikes };\n        }\n        case 'dreads': {\n            const tip = shade(col, -0.22);\n            let locks = '';\n            for (let i = -3; i <= 3; i++) {\n                const len = 84 + Math.round(Math.sin(i * 2.3) * 8);\n                locks += pill(i * 16, -32 + len / 2, 16, len, col) + pill(i * 16, -32 + len - 7, 16, 14, tip);\n            }\n            const top = bumps(-21, 51, 11, Math.PI * 1.08, Math.PI * 1.92, 7);\n            return { behind: locks, front: path(hairCap(win), col) + top, back: backCap + locks + top };\n        }\n        case 'bun': {\n            const bun = circle(0, -80, 19, col) + `<rect x=\"-11\" y=\"-66\" width=\"22\" height=\"6\" rx=\"3\" fill=\"${shade(col, -0.3)}\"/>`;\n            return { behind: bun, front: path(hairCap(win, { R: 53, top: -44 }), col), back: path(tomb(0, -64, 104, 96, 30), col) + bun };\n        }\n        case 'curtains': {\n            const lobe = (side) => path(roundedPolygon([[side * 3 + q, -64], [side * 41 + q * 0.5, -64], [side * 41 + q * 0.5, -24]], 6), col);\n            return { front: path(hairCap(win, { R: 55, top: -60 }), col) + lobe(-1) + lobe(1), back: backCap };\n        }\n        case 'ponytail': {\n            const tie = shade(col, -0.3);\n            const tail = g(`translate(${f(40 - 6 * yaw)} -50) rotate(${f(-38 + 8 * yaw)})`, pill(0, 30, 22, 64, col) + circle(0, 0, 7, tie));\n            return {\n                behind: tail,\n                front: path(hairCap(win, { R: 54 }), col),\n                back: path(tomb(0, -66, 106, 92, 30), col) + pill(0, 28, 24, 80, col) + circle(0, -8, 8, tie),\n            };\n        }\n        case 'cornrows': {\n            const groove = shade(col, -0.35);\n            const cap = hairCap(win, { R: 52, top: -46, cy: -17 });\n            let rows = '';\n            for (let x = -40; x <= 40; x += 13)\n                rows += `<rect x=\"${f(x - 2 + q * 0.6)}\" y=\"-80\" width=\"4\" height=\"74\" rx=\"2\" fill=\"${groove}\"/>`;\n            const backD = tomb(0, -60, 104, 88, 30);\n            return {\n                front: `<clipPath id=\"${uid}r\"><path d=\"${cap}\"/></clipPath>${path(cap, col)}<g clip-path=\"url(#${uid}r)\">${rows}</g>`,\n                back: `<clipPath id=\"${uid}r\"><path d=\"${backD}\"/></clipPath>${path(backD, col)}<g clip-path=\"url(#${uid}r)\">${rows.replace(/height=\"74\"/g, 'height=\"110\"')}</g>`,\n            };\n        }\n    }\n    return {};\n}\nfunction liveEye(uid, side, cx, cy, p, skin, line, pupil = INK.pupil) {\n    const w = 30;\n    const h = 40;\n    const pw = 13;\n    const ph = 20;\n    const shine = 2.8;\n    const top = cy - h / 2 + 7 + p.lookY;\n    const lidH = h + 4;\n    const id = `${uid}e${side}`;\n    let s = `<clipPath id=\"${id}a\"><rect x=\"${f(cx - w / 2)}\" y=\"${f(cy - h / 2)}\" width=\"${w}\" height=\"${h}\" rx=\"${w / 2}\"/></clipPath>`;\n    s += `<clipPath id=\"${id}b\"><rect x=\"${f(cx - w / 2 - 1)}\" y=\"${f(cy - h / 2 - 1)}\" width=\"${w + 2}\" height=\"${h + 2}\" rx=\"${(w + 2) / 2}\"/></clipPath>`;\n    s += pill(cx, cy, w, h, INK.white);\n    s += `<g clip-path=\"url(#${id}a)\"><rect x=\"${f(cx + p.lookX - pw / 2)}\" y=\"${f(top)}\" width=\"${pw}\" height=\"${ph}\" rx=\"${pw / 2}\" fill=\"${pupil}\"/>${circle(cx + p.lookX - pw * 0.22, top + shine + 1.6, shine, INK.white)}</g>`;\n    let lids = `<rect x=\"${f(cx - w / 2 - 2)}\" y=\"${f(cy - h / 2 - 2)}\" width=\"${w + 4}\" height=\"${f(p.lid * lidH)}\" fill=\"${skin}\"/>`;\n    const lashOn = Math.min(1, p.lid / 0.06) * clamp((0.95 - p.lid) / 0.08);\n    if (lashOn > 0) {\n        const y = cy - h / 2 - 2 + p.lid * lidH;\n        lids += `<line x1=\"${f(cx - w / 2 - 2)}\" y1=\"${f(y)}\" x2=\"${f(cx + w / 2 + 2)}\" y2=\"${f(y)}\" stroke=\"${line}\" stroke-opacity=\"${f(lashOn)}\" stroke-width=\"3\"/>`;\n    }\n    lids += `<rect x=\"${f(cx - w / 2 - 2)}\" y=\"${f(cy + h / 2 + 2 - p.cheek * lidH)}\" width=\"${w + 4}\" height=\"${f(p.cheek * lidH)}\" fill=\"${skin}\"/>`;\n    s += `<g clip-path=\"url(#${id}b)\">${lids}</g>`;\n    const closedOn = clamp((p.lid - 0.88) / 0.12);\n    if (closedOn > 0) {\n        s += `<path d=\"M${f(cx - side * w * 0.37)} ${cy}L${f(cx + side * w * 0.13)} ${cy}Q${f(cx + side * w * 0.33)} ${cy} ${f(cx + side * w * 0.37)} ${f(cy + h * 0.17)}\" fill=\"none\" stroke=\"${line}\" stroke-opacity=\"${f(closedOn)}\" stroke-width=\"5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>`;\n    }\n    const happyOn = clamp((p.cheek - 0.86) / 0.14);\n    if (happyOn > 0) {\n        s += `<path d=\"M${f(cx - w * 0.4)} ${f(cy - h * 0.1)}Q${f(cx)} ${f(cy - h * 0.7)} ${f(cx + w * 0.4)} ${f(cy - h * 0.1)}\" fill=\"none\" stroke=\"${line}\" stroke-opacity=\"${f(happyOn)}\" stroke-width=\"5\" stroke-linecap=\"round\"/>`;\n    }\n    return s;\n}\nfunction liveMouth(x0, x1, top, tilt, d, sad) {\n    const mid = (x0 + x1) / 2;\n    const L = (a, b) => a + (b - a) * sad;\n    const P = (q) => `${f(q[0])} ${f(q[1])}`;\n    const c0 = [L(x0, x0 + 3), L(top, top + 8)];\n    const c1 = [L(x1, x1 - 3), L(top - tilt, top + 8)];\n    const u = [mid, L(top - tilt / 2, top - 12)];\n    const m = [mid, L(top + d, top + 5)];\n    const b1 = [L(x1 + 2, mid + (x1 - mid) * 0.5), L(top + d, top + 5)];\n    const b2 = [L(x0 - 2, mid - (mid - x0) * 0.5), L(top + d, top + 5)];\n    let s = path(`M${P(c0)}Q${P(u)} ${P(c1)}Q${P(b1)} ${P(m)}Q${P(b2)} ${P(c0)}Z`, INK.mouth);\n    const k = 1 - sad;\n    if (k > 0.02) {\n        const r = Math.min(d * 0.36, (x1 - x0) * 0.22) * k;\n        s += circle(mid + 1, top + d - r - 1.5, r, INK.tongue);\n        s += path(`M${f(x0 + 1)} ${f(top)}L${f(x1 - 1)} ${f(top - tilt)}L${f(x1 - 1.5)} ${f(top - tilt + 5 * k)}L${f(x0 + 1.5)} ${f(top + 5 * k)}Z`, INK.white);\n    }\n    return s;\n}\nconst BUILD = { torsoTop: 50, torsoBottom: 112, shoulders: 42, waist: 38, hip: 22, hipY: 132, shoeBottom: 62, shadow: 140, shadowRatio: 0.32, shadowUp: 7 };\nexports.FLOOR_Y = BUILD.hipY + BUILD.shoeBottom;\nfunction drawArms(p, kit, skin) {\n    let s = '';\n    for (const [side, limb] of [[-1, p.armL], [1, p.armR]]) {\n        const a = (limb.a * Math.PI) / 180;\n        const fa = ((limb.a + limb.e) * Math.PI) / 180;\n        const straight = clamp(1 - Math.abs(limb.e) / 40);\n        const reach = ARM.reach * clamp((limb.a - 100) / 50) * straight;\n        const from = [side * ARM.x, ARM.y];\n        const dir = [side * Math.sin(a), Math.cos(a)];\n        const elbow = [from[0] + dir[0] * ARM.upper, from[1] + dir[1] * ARM.upper];\n        const uf = [side * Math.sin(fa), Math.cos(fa)];\n        const hand = [elbow[0] + uf[0] * (ARM.fore + reach), elbow[1] + uf[1] * (ARM.fore + reach)];\n        s += caps([from, elbow, [hand[0] - uf[0] * 8, hand[1] - uf[1] * 8]], ARM.w, skin);\n        s += circle(hand[0], hand[1], ARM.hand, skin);\n        s += caps([from, [from[0] + dir[0] * 16, from[1] + dir[1] * 16]], ARM.w + 10, kit.c1);\n    }\n    return s;\n}\nconst HW = { orange: '#F07F1E', pumpkin: '#F28A26', night: '#1E1B22', bone: '#EFE9DB', blood: '#A3172E', stem: '#4E7A2C', glow: '#FFD34D' };\nconst OUTFITS = {\n    hw_kit: { c1: HW.night, c2: HW.orange, ink: HW.orange },\n    hw_skeleton: { c1: '#17161A', c2: '#17161A', ink: HW.orange },\n    hw_mummy: { c1: '#E6DDC6', c2: '#D3C7A8', ink: '#5A4E3A', limbs: '#E6DDC6' },\n    hw_vampire: { c1: '#211A28', c2: '#140F18', ink: '#E8D9A8' },\n};\nfunction outfitChest(id, back, sl, kit) {\n    const T = BUILD.torsoTop;\n    const B = BUILD.torsoBottom;\n    switch (id) {\n        case 'hw_kit': {\n            let s = '';\n            for (const x of [-27, -9, 9, 27])\n                s += `<rect x=\"${f(x - 1.5 + sl)}\" y=\"${T}\" width=\"3\" height=\"${B - T}\" fill=\"${shade(HW.orange, -0.35)}\"/>`;\n            s += pill(back ? 0 : sl * 0.8, T + 3, 30, 10, kit.c2);\n            if (!back)\n                s += circle(19 + sl * 1.4, 67, 6.5, HW.orange) + `<rect x=\"${f(17.5 + sl * 1.4)}\" y=\"57.5\" width=\"3\" height=\"5\" rx=\"1.5\" fill=\"${HW.stem}\"/>`;\n            return s;\n        }\n        case 'hw_skeleton': {\n            const x0 = sl * (back ? 0.5 : 1);\n            let s = back ? '' : pill(x0, 80, 8, 46, HW.bone);\n            if (back)\n                for (let y = 58; y <= 104; y += 9)\n                    s += pill(x0, y, 9, 6, HW.bone, 'opacity=\"0.55\"');\n            for (const y of [64, 77, 90]) {\n                for (const side of [-1, 1]) {\n                    s += `<path d=\"M${f(x0 + side * 5)} ${y}Q${f(x0 + side * 22)} ${y - 7} ${f(x0 + side * 31)} ${y + 6}\" fill=\"none\" stroke=\"${HW.bone}\" stroke-width=\"5.5\" stroke-linecap=\"round\"${back ? ' opacity=\"0.55\"' : ''}/>`;\n                }\n            }\n            return s;\n        }\n        case 'hw_mummy': {\n            let s = '';\n            for (let i = 0; i < 6; i++) {\n                const y = T + 4 + i * 11;\n                s += `<rect x=\"-50\" y=\"${y}\" width=\"100\" height=\"4\" fill=\"${shade(kit.c1, -0.13)}\" transform=\"rotate(${i % 2 ? 9 : -7} 0 ${y})\"/>`;\n            }\n            return s;\n        }\n        case 'hw_vampire': {\n            if (back)\n                return '';\n            const x = sl;\n            return path(roundedPolygon([[x - 16, T - 4], [x + 16, T - 4], [x, T + 46]], 4), '#F4F0E6') +\n                path(roundedPolygon([[x - 6, T + 4], [x + 6, T + 4], [x + 4, T + 22], [x - 4, T + 22]], 3), '#E2DACB') +\n                circle(x, T + 26, 5, HW.blood) + circle(x - 1.4, T + 24.6, 1.6, '#FFFFFF', 'opacity=\"0.6\"');\n        }\n    }\n    return '';\n}\nfunction vampireCape(back) {\n    const outer = roundedPolygon([[-42, 50], [42, 50], [64, 178], [-64, 178]], 14);\n    if (back)\n        return path(outer, '#121016') + `<rect x=\"-38\" y=\"52\" width=\"76\" height=\"4\" rx=\"2\" fill=\"#2A2330\"/>`;\n    return path(outer, '#121016') + path(roundedPolygon([[-34, 54], [34, 54], [54, 172], [-54, 172]], 12), HW.blood);\n}\nfunction pumpkinHead(p, back) {\n    const dx = back ? -6 * p.yaw : 10 * p.yaw;\n    let s = '';\n    for (const side of [-1, 1])\n        s += `<ellipse cx=\"${f(side * 32 + dx * 0.2)}\" cy=\"0\" rx=\"32\" ry=\"56\" fill=\"${shade(HW.pumpkin, -0.14)}\"/>`;\n    for (const side of [-1, 1])\n        s += `<ellipse cx=\"${f(side * 15 + dx * 0.5)}\" cy=\"-3\" rx=\"30\" ry=\"60\" fill=\"${shade(HW.pumpkin, -0.04)}\"/>`;\n    s += `<ellipse cx=\"${f(dx * 0.8)}\" cy=\"-4\" rx=\"20\" ry=\"62\" fill=\"${HW.pumpkin}\"/>`;\n    s += g(`translate(${f(dx * 0.4)} -62) rotate(14)`, `<rect x=\"-6\" y=\"-16\" width=\"12\" height=\"22\" rx=\"4\" fill=\"${HW.stem}\"/>` + path('M4 -10Q20 -22 26 -8Q14 -4 4 -10Z', shade(HW.stem, 0.15)));\n    if (back)\n        return s;\n    const open = 1 - p.lid;\n    for (const side of [-1, 1]) {\n        const cx = side * 20 + dx;\n        const base = -2;\n        s += path(`M${f(cx - 13)} ${base}L${f(cx + 13)} ${base}L${f(cx + side * 3)} ${f(base - 24 * open - 0.5)}Z`, HW.glow);\n    }\n    s += path(`M${f(2 + 13 * p.yaw - 5)} 12L${f(2 + 13 * p.yaw + 5)} 12L${f(2 + 13 * p.yaw)} 4Z`, HW.glow);\n    const w = 28;\n    const k = 1 - 2 * p.sad;\n    const top = (x) => 20 + k * 6 * (1 - (x / w) ** 2) - 4;\n    const th = (x) => (4 + p.mouth * 0.55) * (1 - (x / w) ** 2 * 0.85);\n    const P = (x, y) => `${f(x + dx)} ${f(y)}`;\n    const pts = [];\n    for (const x of [-w, -20, -14])\n        pts.push(P(x, top(x)));\n    pts.push(P(-14, top(-14) + 6), P(-7, top(-7) + 6), P(-7, top(-7)));\n    pts.push(P(7, top(7)), P(7, top(7) + 6), P(14, top(14) + 6), P(14, top(14)));\n    for (const x of [20, w])\n        pts.push(P(x, top(x)));\n    for (const x of [20, 9])\n        pts.push(P(x, top(x) + th(x)));\n    pts.push(P(4, top(4) + th(4)), P(4, top(4) + th(4) - 6), P(-4, top(-4) + th(-4) - 6), P(-4, top(-4) + th(-4)));\n    for (const x of [-9, -20])\n        pts.push(P(x, top(x) + th(x)));\n    s += path(`M${pts.join('L')}Z`, HW.glow);\n    return s;\n}\nfunction headwear(id, yaw, hairColor, under) {\n    const q = 5 * yaw;\n    switch (id) {\n        case 'hw_witch_hat': {\n            if (under)\n                return '';\n            const hat = '#2B2238';\n            const cone = path(roundedPolygon([[-36 + q, -54], [38 + q, -54], [22 + q, -92], [58 + q, -106], [4 + q, -104]], 6), hat);\n            const band = path(roundedPolygon([[-35 + q, -56], [37 + q, -56], [33 + q, -70], [-31 + q, -70]], 3), HW.orange);\n            return `<ellipse cx=\"${f(q * 0.6)}\" cy=\"-52\" rx=\"74\" ry=\"14\" fill=\"${hat}\"/>` + cone + band + `<rect x=\"${f(-5 + q)}\" y=\"-68\" width=\"10\" height=\"10\" rx=\"2\" fill=\"${HW.glow}\"/>`;\n        }\n        case 'hw_cat_beanie': {\n            if (under)\n                return '';\n            const wool = '#26222B';\n            let s = '';\n            for (const side of [-1, 1]) {\n                s += path(roundedPolygon([[side * 22 + q, -70], [side * 52 + q, -58], [side * 48 + q, -100]], 6), wool);\n                s += path(roundedPolygon([[side * 32 + q, -70], [side * 46 + q, -64], [side * 45 + q, -86]], 3), HW.orange);\n            }\n            s += path(roundedPolygon([[-56, -34], [56, -34], [54, -60], [q, -82], [-54, -60]], 22), wool);\n            return s + pill(0, -38, 116, 15, shade(wool, 0.12));\n        }\n        case 'hw_horns': {\n            if (under)\n                return '';\n            let s = '';\n            for (const side of [-1, 1]) {\n                s += path(roundedPolygon([[side * 18 + q, -58], [side * 40 + q, -50], [side * 44 + q, -100]], 6), '#C6262E');\n                s += path(roundedPolygon([[side * 30 + q, -58], [side * 40 + q, -54], [side * 43 + q, -86]], 3), shade('#C6262E', 0.18));\n            }\n            return s;\n        }\n        case 'hw_wolf_ears': {\n            if (!under)\n                return '';\n            let s = '';\n            for (const side of [-1, 1]) {\n                s += path(roundedPolygon([[side * 14 + q, -54], [side * 54 + q, -40], [side * 52 + q, -104]], 8), hairColor);\n                s += path(roundedPolygon([[side * 28 + q, -58], [side * 48 + q, -50], [side * 48 + q, -88]], 5), '#E8A0A0');\n            }\n            return s;\n        }\n    }\n    return '';\n}\nfunction drawKid(av, p, o) {\n    const uid = o.uid || 'av';\n    const worn = av.gear || {};\n    const outfit = worn.outfit ? OUTFITS[worn.outfit] : undefined;\n    const kit = outfit || o.kit || exports.DEFAULT_KIT;\n    const face = worn.face;\n    const skin = face === 'hw_stitches' ? mix(av.skin, '#8DBF5E', 0.5) : av.skin;\n    const limbs = (outfit === null || outfit === void 0 ? void 0 : outfit.limbs) || skin;\n    const line = shade(skin, -0.32);\n    const gear = Object.values(worn);\n    const has = (id) => gear.includes(id);\n    const pumpkin = worn.head === 'hw_pumpkin_head';\n    const yaw = p.yaw;\n    let s = '';\n    if (worn.outfit === 'hw_vampire' && !p.back)\n        s += vampireCape(false);\n    for (const [side, angle] of [[-1, p.legL], [1, p.legR]]) {\n        const shoe = g(`translate(0 46) rotate(${f(side > 0 ? p.toeR : 0)})`, `<rect x=\"${-15 + side * 2}\" y=\"-4\" width=\"30\" height=\"20\" rx=\"10\" fill=\"${INK.shoe}\"/>`);\n        let sock = `<rect x=\"-12.5\" y=\"16\" width=\"25\" height=\"33\" rx=\"9\" fill=\"${kit.c1}\"/><rect x=\"-12.5\" y=\"21\" width=\"25\" height=\"5\" fill=\"${kit.c2}\"/>`;\n        if (worn.outfit === 'hw_skeleton')\n            sock += pill(0, 34, 6, 22, HW.bone) + circle(-2.5, 24, 3.5, HW.bone) + circle(2.5, 24, 3.5, HW.bone);\n        if (worn.outfit === 'hw_mummy')\n            sock += `<rect x=\"-12.5\" y=\"34\" width=\"25\" height=\"3\" fill=\"${shade(kit.c1, -0.13)}\" transform=\"rotate(-12 0 35)\"/>`;\n        const leg = shoe + caps([[0, 0], [0, 24]], 20, limbs) + sock;\n        s += g(`translate(${f(side * BUILD.hip + p.shift)} ${BUILD.hipY}) rotate(${f(-side * angle + p.shift)})`, leg);\n    }\n    let up = `<rect x=\"-40\" y=\"104\" width=\"80\" height=\"34\" rx=\"12\" fill=\"${kit.c2}\"/>`;\n    if (!p.front)\n        up += drawArms(p, kit, limbs);\n    const torso = roundedPolygon([[-BUILD.shoulders, BUILD.torsoTop], [BUILD.shoulders, BUILD.torsoTop], [BUILD.waist, BUILD.torsoBottom], [-BUILD.waist, BUILD.torsoBottom]], 18);\n    up += `<clipPath id=\"${uid}t\"><path d=\"${torso}\"/></clipPath>${path(torso, kit.c1)}`;\n    const sl = p.back ? -5 * yaw : 5 * yaw;\n    let chest = '';\n    if (outfit)\n        chest += outfitChest(worn.outfit, p.back, sl, kit);\n    else {\n        const stripe = shade(kit.c1, isLight(kit.c1) ? -0.08 : -0.12);\n        for (const x of [-24, -5, 14])\n            chest += `<rect x=\"${f(x + sl)}\" y=\"${BUILD.torsoTop}\" width=\"10\" height=\"${BUILD.torsoBottom - BUILD.torsoTop}\" fill=\"${stripe}\"/>`;\n        chest += pill(p.back ? 0 : 4 * yaw, BUILD.torsoTop + 3, 30, 10, kit.c2);\n        if (!p.back)\n            chest += circle(19 + 7 * yaw, 66, 6, kit.c2);\n    }\n    let print = '';\n    if (p.back) {\n        const ink = kit.ink || (isLight(kit.c1) ? '#151515' : '#FFFFFF');\n        const font = `text-anchor=\"middle\" font-family=\"Oswald_600SemiBold, Oswald, Impact, sans-serif\" font-weight=\"700\" fill=\"${ink}\"`;\n        const name = String(o.shirtName || '').toUpperCase().slice(0, 14);\n        if (name)\n            print += `<text x=\"${f(sl * 0.5)}\" y=\"68\" font-size=\"${f(Math.min(11, 92 / name.length))}\" letter-spacing=\"0.6\" ${font}>${escapeXml(name)}</text>`;\n        if (o.shirtNumber != null && o.shirtNumber !== '')\n            print += `<text x=\"${f(sl * 0.5)}\" y=\"101\" font-size=\"31\" ${font}>${escapeXml(String(o.shirtNumber))}</text>`;\n    }\n    up += `<g clip-path=\"url(#${uid}t)\">${chest}</g>`;\n    if (worn.outfit === 'hw_vampire' && p.back)\n        up += vampireCape(true);\n    up += print;\n    if (has('hw_vampire_collar') || worn.outfit === 'hw_vampire') {\n        for (const side of [-1, 1]) {\n            up += path(roundedPolygon([[side * 8, 58], [side * 50, 58], [side * 76, -16], [side * 40, 22]], 6), '#121016');\n            if (!p.back)\n                up += path(roundedPolygon([[side * 14, 56], [side * 46, 56], [side * 68, -6], [side * 40, 28]], 4), HW.blood);\n        }\n    }\n    if (worn.face === 'hw_stitches') {\n        for (const side of [-1, 1])\n            up += pill(side * 34, 48, 12, 8, '#8C8A92') + pill(side * 41, 48, 6, 11, '#6E6C74');\n    }\n    if (has('g_chain') && !p.back) {\n        up += `<path d=\"M-19 52Q${f(4 * yaw)} 86 19 52\" fill=\"none\" stroke=\"${INK.gold}\" stroke-width=\"3.5\" stroke-linecap=\"round\"/>${circle(4 * yaw, 70, 5, INK.gold)}`;\n    }\n    if (has('hw_bone_chain') && !p.back) {\n        const cx = 4 * yaw;\n        up += `<path d=\"M-20 52Q${f(cx)} 88 20 52\" fill=\"none\" stroke=\"${HW.bone}\" stroke-width=\"3\" stroke-linecap=\"round\"/>`;\n        for (const [x, y, r] of [[-12, 63, 30], [12, 63, -30]]) {\n            up += g(`translate(${f(x + cx * 0.6)} ${y}) rotate(${r})`, pill(0, 0, 11, 4, HW.bone) + circle(-5.5, -1.6, 2.4, HW.bone) + circle(-5.5, 1.6, 2.4, HW.bone) + circle(5.5, -1.6, 2.4, HW.bone) + circle(5.5, 1.6, 2.4, HW.bone));\n        }\n        up += circle(cx, 72, 7, HW.bone) + `<rect x=\"${f(cx - 4.5)}\" y=\"74\" width=\"9\" height=\"6\" rx=\"2\" fill=\"${HW.bone}\"/>` + circle(cx - 2.6, 71.5, 1.9, '#2A2630') + circle(cx + 2.6, 71.5, 1.9, '#2A2630');\n    }\n    if (has('hw_bandages')) {\n        const bx = p.back ? 0 : 4 * yaw;\n        const dark = shade(HW.bone, -0.13);\n        const seam = shade(HW.bone, -0.26);\n        const tail = g(`translate(${f(bx + 13)} 70) rotate(-8)`, pill(0, 12, 12, 30, dark) + path('M-6 22L-6 30L-3 26L0 31L3 26L6 30L6 22Z', dark));\n        if (!p.back)\n            up += tail;\n        const wraps = [[74, 4, 64, dark], [66, -7, 72, HW.bone], [58, 5, 74, shade(HW.bone, -0.05)]];\n        for (const [y, r, w, col] of p.back ? wraps.slice(2) : wraps) {\n            up += g(`rotate(${r} ${f(bx)} ${y})`, pill(bx, y, w, 11, col) + `<rect x=\"${f(bx - w / 2 + 6)}\" y=\"${f(y - 0.6)}\" width=\"${f(w * 0.35)}\" height=\"1.4\" rx=\"0.7\" fill=\"${seam}\"/>`);\n        }\n    }\n    if (has('hw_bat_scarf')) {\n        up += pill(p.back ? 0 : 4 * yaw, 54, 66, 13, HW.orange);\n        if (!p.back) {\n            const bx = 4 * yaw;\n            up += pill(bx + 14, 68, 12, 26, shade(HW.orange, -0.1));\n            const wing = (side) => path(`M${f(bx)} 55L${f(bx + side * 9)} 49L${f(bx + side * 19)} 51L${f(bx + side * 15)} 57L${f(bx + side * 11)} 55L${f(bx + side * 8)} 60L${f(bx + side * 4)} 57Z`, HW.night);\n            up += wing(-1) + wing(1) + circle(bx, 55.5, 4.6, HW.night) + path(`M${f(bx - 3.6)} 52L${f(bx - 2.2)} 48.5L${f(bx - 0.8)} 52Z`, HW.night) + path(`M${f(bx + 0.8)} 52L${f(bx + 2.2)} 48.5L${f(bx + 3.6)} 52Z`, HW.night);\n        }\n    }\n    let hair = av.hair === 'bald' || pumpkin ? {} : hairShapes(av.hair, yaw, av.hairColor, skin, uid);\n    if ((worn.head === 'hw_witch_hat' || worn.head === 'hw_cat_beanie') && av.hair !== 'bald' && !pumpkin) {\n        hair = {\n            behind: hair.behind,\n            front: path(hairCap(-39 + 9 * yaw, { R: 53, top: -46, cy: -17 }), av.hairColor),\n            back: path(tomb(0, -64, 106, 96, 30), av.hairColor) + (hair.behind || ''),\n        };\n    }\n    const headD = tomb(0, -66, 100, 122, 26);\n    let h = '';\n    if (pumpkin) {\n        h += pumpkinHead(p, p.back);\n        if (!p.back)\n            h += eyeGear(worn.eyes, p, yaw, uid, headD, true);\n    }\n    else {\n        if (!p.back && hair.behind)\n            h += hair.behind;\n        for (const side of [-1, 1])\n            h += circle(side * 50 + (p.back ? 9 : -9) * yaw, 2, 11, skin);\n        h += path(headD, skin);\n    }\n    if (!p.back && !pumpkin) {\n        const dx = 10 * yaw;\n        const nx = 13 * yaw;\n        const lid = { [-1]: skin, [1]: skin };\n        let paint = '';\n        let nose = pill(2 + nx, -2, 8, 22, line) + circle(2 + nx, 9, 6.5, line);\n        if (face === 'hw_skull_paint') {\n            paint += path(headD, '#F2EFE8');\n            for (const side of [-1, 1]) {\n                paint += `<ellipse cx=\"${f(side * 19.5 + dx)}\" cy=\"-8\" rx=\"21\" ry=\"25\" fill=\"#1D1B20\"/>`;\n                lid[side] = '#1D1B20';\n            }\n            nose = path(`M${f(2 + nx)} 12L${f(-5 + nx)} 4Q${f(-6 + nx)} -1 ${f(-1 + nx)} 0L${f(2 + nx)} 2L${f(5 + nx)} 0Q${f(10 + nx)} -1 ${f(9 + nx)} 4Z`, '#1D1B20');\n            paint += `<path d=\"M${f(-30 + dx)} 27L${f(32 + dx)} 25\" stroke=\"#1D1B20\" stroke-width=\"2.5\" stroke-linecap=\"round\"/>`;\n            for (let x = -26; x <= 28; x += 6.5)\n                paint += `<line x1=\"${f(x + dx)}\" y1=\"21\" x2=\"${f(x + dx)}\" y2=\"32\" stroke=\"#1D1B20\" stroke-width=\"2\" stroke-linecap=\"round\"/>`;\n        }\n        else if (face === 'hw_pumpkin_paint') {\n            paint += path(`M-60 -80L${f(dx - 2)} -80L${f(dx + 4)} -50L${f(dx - 4)} -24L${f(dx + 4)} 2L${f(dx - 4)} 28L${f(dx + 4)} 70L-60 70Z`, HW.orange);\n            paint += `<path d=\"M${f(-40 + dx)} -30L${f(-40 + dx)} 40M${f(-22 + dx)} -40L${f(-24 + dx)} 48\" stroke=\"${shade(HW.orange, -0.18)}\" stroke-width=\"3\" stroke-linecap=\"round\"/>`;\n            lid[-1] = HW.orange;\n        }\n        else if (face === 'hw_stitches') {\n            const st = shade(skin, -0.5);\n            paint += `<path d=\"M${f(-34 + dx)} -50L${f(8 + dx)} -42\" stroke=\"${st}\" stroke-width=\"2.5\" stroke-linecap=\"round\"/>`;\n            for (let i = 0; i < 5; i++) {\n                const x = -30 + dx + i * 9.5;\n                const y = -49.5 + i * 1.8;\n                paint += `<line x1=\"${f(x)}\" y1=\"${f(y - 5)}\" x2=\"${f(x + 1)}\" y2=\"${f(y + 5)}\" stroke=\"${st}\" stroke-width=\"2.2\" stroke-linecap=\"round\"/>`;\n            }\n            paint += `<path d=\"M${f(30 + dx)} 18L${f(42 + dx)} 34\" stroke=\"${st}\" stroke-width=\"2.2\" stroke-linecap=\"round\"/>`;\n            for (const k of [0.2, 0.55, 0.9])\n                paint += `<line x1=\"${f(31 + dx + 12 * k - 3.5)}\" y1=\"${f(18 + 16 * k + 2.5)}\" x2=\"${f(31 + dx + 12 * k + 3.5)}\" y2=\"${f(18 + 16 * k - 2.5)}\" stroke=\"${st}\" stroke-width=\"2\" stroke-linecap=\"round\"/>`;\n        }\n        if (paint)\n            h += `<clipPath id=\"${uid}p\"><path d=\"${headD}\"/></clipPath><g clip-path=\"url(#${uid}p)\">${paint}</g>`;\n        if (worn.eyes === 'hw_bandit_mask') {\n            h += path(roundedPolygon([[-57, -30], [57, -30], [57, 8], [-57, 8]], 14), HW.night);\n            lid[-1] = lid[1] = HW.night;\n        }\n        const pupil = worn.eyes === 'hw_glow_eyes' ? '#8BFF4A' : INK.pupil;\n        for (const side of [-1, 1])\n            h += liveEye(uid, side, side * 19.5 + dx, -8, p, lid[side], line, pupil);\n        const bw = av.brows === 'thick' ? 25 : 21;\n        const bh = av.brows === 'thick' ? 8 : 5;\n        for (const side of [-1, 1]) {\n            h += g(`translate(${f(side * 19.5 + dx)} ${f(-36 - 3 * p.cheek + 2 * p.sad)}) rotate(${f(side * 13 * p.sad)})`, pill(0, 0, bw, bh, av.hairColor));\n        }\n        h += nose;\n        const jaw = (col) => `<clipPath id=\"${uid}h\"><path d=\"${headD}\"/></clipPath><g clip-path=\"url(#${uid}h)\">${path(roundedPolygon([[-52 + dx * 0.4, 6], [-42 + dx, 6], [-30 + dx, 30], [32 + dx, 30], [44 + dx, 6], [52 + dx * 0.4, 6], [52, 64], [-52, 64]], 9), col)}</g>`;\n        const tache = path(roundedPolygon([[-16 + dx, 17], [18 + dx, 15], [14 + dx, 23], [-12 + dx, 24]], 4), av.hairColor);\n        const chin = path(roundedPolygon([[-12 + dx, 47], [14 + dx, 47], [10 + dx, 62], [-8 + dx, 62]], 5), av.hairColor);\n        if (av.beard === 'stubble')\n            h += jaw(mix(skin, av.hairColor, 0.3));\n        else if (av.beard === 'full')\n            h += jaw(av.hairColor) + tache;\n        else if (av.beard === 'goatee')\n            h += tache + chin;\n        else if (av.beard === 'mustache')\n            h += tache;\n        else if (av.beard === 'chinstrap') {\n            const strap = roundedPolygon([[-52, 4], [-45, 4], [-37 + dx * 0.6, 40], [-20 + dx, 51], [22 + dx, 51], [39 + dx * 0.6, 40], [47, 4], [52, 4], [52, 64], [-52, 64]], 7);\n            h += `<clipPath id=\"${uid}h\"><path d=\"${headD}\"/></clipPath><g clip-path=\"url(#${uid}h)\">${path(strap, av.hairColor)}</g>`;\n        }\n        else if (av.beard === 'circle') {\n            h += path(roundedPolygon([[-21 + dx, 15], [24 + dx, 13], [21 + dx, 60], [-18 + dx, 60]], 11), av.hairColor);\n        }\n        else if (av.beard === 'long') {\n            h += jaw(av.hairColor) + tache + path(roundedPolygon([[-42 + dx, 36], [44 + dx, 36], [12 + dx, 94], [-10 + dx, 94]], 14), av.hairColor);\n        }\n        h += liveMouth(-16 + dx, 18 + dx, 24, 6, p.mouth, p.sad);\n        h += eyeGear(worn.eyes, p, yaw, uid, headD, false);\n        h += headwear(worn.head, yaw, av.hairColor, true);\n        h += hair.front || '';\n    }\n    else if (!pumpkin) {\n        h += headwear(worn.head, -yaw, av.hairColor, true);\n        h += hair.back || '';\n        if (worn.eyes === 'hw_eye_patch') {\n            h += `<clipPath id=\"${uid}x\"><path d=\"${headD}\"/></clipPath><g clip-path=\"url(#${uid}x)\"><path d=\"M-60 -50L60 0\" fill=\"none\" stroke=\"#2A2630\" stroke-width=\"4.5\"/></g>`;\n        }\n    }\n    if (!pumpkin)\n        h += headwear(worn.head, p.back ? -yaw : yaw, av.hairColor, false);\n    up += g(`translate(0 56) rotate(${f(p.head)}) translate(0 -56)`, h);\n    if (p.front)\n        up += drawArms(p, kit, limbs);\n    s += g(`translate(${f(p.shift)} 0)`, up);\n    return s;\n}\nfunction eyeGear(id, p, yaw, uid, headD, pumpkin) {\n    const dx = 10 * yaw;\n    const lens = (stroke, tint) => {\n        let s = '';\n        for (const side of [-1, 1]) {\n            s += circle(side * 19.5 + dx, -8, 19, tint, `stroke=\"${stroke}\" stroke-width=\"3.5\"`);\n            s += caps([[side * 38.5 + dx, -10], [side * (pumpkin ? 58 : 49) - 9 * yaw, -6]], 3, stroke);\n        }\n        return s;\n    };\n    switch (id) {\n        case 'g_round_glasses':\n            return lens('#2B2B2B', 'rgba(255,255,255,0.16)');\n        case 'hw_pumpkin_glasses':\n            return lens(HW.orange, 'rgba(240,127,30,0.22)') + `<rect x=\"${f(-2.5 + dx)}\" y=\"-31\" width=\"5\" height=\"7\" rx=\"2\" fill=\"${HW.stem}\"/>`;\n        case 'hw_eye_patch': {\n            const cx = -19.5 + dx;\n            const strap = `M-60 -4L${f(cx - 10)} -10M${f(cx + 8)} -24L60 -60`;\n            const patch = roundedPolygon([[cx - 16, -27], [cx + 16, -27], [cx + 13, 2], [cx, 12], [cx - 13, 2]], 9);\n            return `<clipPath id=\"${uid}x\"><path d=\"${headD}\"/></clipPath><g clip-path=\"url(#${uid}x)\"><path d=\"${strap}\" fill=\"none\" stroke=\"#2A2630\" stroke-width=\"4.5\" stroke-linecap=\"round\"/></g>` +\n                path(patch, HW.night) + path(roundedPolygon([[cx - 11, -23], [cx - 2, -23], [cx - 9, -12]], 3), '#3A3642');\n        }\n        case 'hw_bandit_mask':\n            return pumpkin ? '' : g(`translate(${f(-54 + 9 * yaw)} -8)`, g('rotate(28)', pill(-4, 12, 9, 26, HW.night)) + g('rotate(-8)', pill(-2, 14, 9, 24, HW.night)));\n    }\n    return '';\n}\nfunction drawBall(rig, t, uid) {\n    if (rig.pose !== 'kick')\n        return '';\n    const dt = t - rig.t0;\n    const r = BALL.r;\n    let x;\n    let y = -r;\n    let ang;\n    let sx = 1;\n    let sy = 1;\n    if (dt < BALL.kick) {\n        x = BALL.startX + (BALL.stopX - BALL.startX) * EASE_OUT(clamp(dt / BALL.arrive));\n        ang = (x - BALL.startX) / r;\n    }\n    else {\n        const s = (dt - BALL.kick) / 1000;\n        x = BALL.stopX + BALL.vx * s;\n        y = -r - BALL.vy * s + (BALL.g * s * s) / 2;\n        ang = (BALL.stopX - BALL.startX) / r - BALL.spin * s;\n        const sq = bell((dt - BALL.kick) / 90);\n        sx = 1 - 0.15 * sq;\n        sy = 1 + 0.1 * sq;\n        if (x > 360 || y > 40)\n            return '';\n    }\n    const ground = 1 - Math.min(1, (-r - y) / 170);\n    let pent = path(pentagon(0, 0, r * 0.36, 0), INK.pupil);\n    for (let k = 0; k < 5; k++) {\n        const a = (k * 2 * Math.PI) / 5 - Math.PI / 2;\n        pent += path(pentagon(Math.cos(a) * r, Math.sin(a) * r, r * 0.34, a + Math.PI), INK.pupil);\n    }\n    const ball = `<clipPath id=\"${uid}b\"><circle r=\"${r}\"/></clipPath><circle r=\"${r}\" fill=\"#FFFFFF\" stroke=\"#D2E4E8\" stroke-width=\"2\"/><g clip-path=\"url(#${uid}b)\" transform=\"rotate(${f((ang * 180) / Math.PI)})\">${pent}</g>`;\n    return `<ellipse cx=\"${f(x)}\" cy=\"-3\" rx=\"${f(r * 0.9 * ground)}\" ry=\"${f(r * 0.22 * ground)}\" fill=\"${INK.floor}\"/>` + g(`translate(${f(x)} ${f(y)}) scale(${f(sx)} ${f(sy)})`, ball);\n}\nfunction sceneSvg(av, rig, t, p, o = {}) {\n    let s = '';\n    if (o.shadow !== false) {\n        const ground = 1 - Math.min(1, p.lift / 170);\n        const sw = BUILD.shadow * ground * p.sx;\n        s += `<ellipse cx=\"${f(p.shift * 0.4)}\" cy=\"${-BUILD.shadowUp}\" rx=\"${f(sw / 2)}\" ry=\"${f((sw * BUILD.shadowRatio) / 2)}\" fill=\"${INK.floor}\"/>`;\n    }\n    s += g(`translate(0 ${f(-p.lift)}) rotate(${f(p.lean)}) scale(${f(p.sx)} ${f(p.sy)}) translate(0 ${-exports.FLOOR_Y})`, drawKid(av, p, o));\n    return s + drawBall(rig, t, o.uid || 'av');\n}\nexports.RIG_VIEWS = {\n    full: '-95 -305 190 318',\n    torso: '-115 -318 230 330',\n    bust: '-94 -318 188 188',\n    portrait: '-94 -280 188 188',\n    chest: '-34 -168 68 68',\n};\n\nreturn exports;})();\n// Lecteur WebView de l'avatar à squelette : ajouté après le rig compilé dans src/avatar/rigWeb.ts.\n// DestinyRig.mount(<g>, { avatar, kit, shirtName, shirtNumber, pose, uid, shadow, idle }) anime le\n// joueur dans le groupe SVG et renvoie { setPose, update, stop }.\n(function (R) {\n  R.mount = function (group, opts) {\n    var rig = R.createRig(opts.pose || 'front');\n    var avatar = opts.avatar;\n    var scene = { kit: opts.kit, shirtName: opts.shirtName, shirtNumber: opts.shirtNumber, uid: opts.uid || 'w', shadow: opts.shadow };\n    var still = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);\n    var start = performance.now();\n    var raf = 0;\n    var now = function () { return performance.now() - start; };\n    var draw = function () {\n      var t = now();\n      group.innerHTML = R.sceneSvg(avatar, rig, t, R.livePose(rig, t, opts.idle || 0, still), scene);\n    };\n    var frame = function () { draw(); raf = requestAnimationFrame(frame); };\n    if (still) draw(); else raf = requestAnimationFrame(frame);\n    var api = {\n      setPose: function (pose) {\n        if (pose === rig.pose) return;\n        R.setRigPose(rig, pose, now());\n        if (still) { rig.from = R.createRig(pose).from; rig.t0 = -1e9; draw(); }\n      },\n      update: function (o) {\n        if (o.avatar) avatar = o.avatar;\n        ['kit', 'shirtName', 'shirtNumber'].forEach(function (k) { if (k in o) scene[k] = o[k]; });\n        if (o.pose) api.setPose(o.pose);\n        if (still) draw();\n      },\n      stop: function () { cancelAnimationFrame(raf); },\n    };\n    return api;\n  };\n})(window.DestinyRig);\n";

},
"avatar/catalog": function (exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PACKS = exports.PAID_STYLES = exports.GEAR_SLOTS = exports.GEAR = exports.BROWS = exports.BEARDS = exports.HAIR_STYLES = exports.HAIR_COLORS = exports.SKIN_TONES = void 0;
exports.gearOnSale = gearOnSale;
exports.halloweenOn = halloweenOn;
exports.itemCost = itemCost;
exports.packValue = packValue;
exports.packPrice = packPrice;
exports.packDaysLeft = packDaysLeft;
exports.wearItem = wearItem;
exports.paidStyle = paidStyle;
exports.isAvatarItem = isAvatarItem;
exports.styleLocked = styleLocked;
exports.enforceOwned = enforceOwned;
exports.toggleStyle = toggleStyle;
exports.defaultAvatar = defaultAvatar;
exports.normalizeAvatar = normalizeAvatar;
exports.seededAvatar = seededAvatar;
exports.SKIN_TONES = ['#F7D7BA', '#EFBF94', '#DDA571', '#C98A52', '#A86B3C', '#87522B', '#66391C', '#472613'];
exports.HAIR_COLORS = ['#1F1A17', '#3D2618', '#6E4428', '#B98544', '#E2C277', '#A5432A', '#B8B8B8', '#E8E3DA'];
exports.HAIR_STYLES = [
    'buzz', 'curly', 'short', 'afro', 'braids', 'long', 'mohawk',
    'side', 'spiky', 'dreads', 'bun', 'curtains', 'ponytail', 'cornrows', 'bald',
];
exports.BEARDS = ['none', 'mustache', 'stubble', 'goatee', 'circle', 'chinstrap', 'full', 'long'];
exports.BROWS = ['soft', 'thick'];
const HALLOWEEN = '2026-11-03T00:00:00';
exports.GEAR = [
    { id: 'g_round_glasses', slot: 'eyes', cost: 400, rarity: 'rare' },
    { id: 'g_chain', slot: 'neck', cost: 700, rarity: 'epic' },
    { id: 'hw_witch_hat', slot: 'head', cost: 400, rarity: 'limited', until: HALLOWEEN },
    { id: 'hw_pumpkin_head', slot: 'head', cost: 900, rarity: 'limited', until: HALLOWEEN },
    { id: 'hw_horns', slot: 'head', cost: 250, rarity: 'limited', until: HALLOWEEN },
    { id: 'hw_wolf_ears', slot: 'head', cost: 250, rarity: 'limited', until: HALLOWEEN },
    { id: 'hw_cat_beanie', slot: 'head', cost: 300, rarity: 'limited', until: HALLOWEEN },
    { id: 'hw_bandit_mask', slot: 'eyes', cost: 250, rarity: 'limited', until: HALLOWEEN },
    { id: 'hw_pumpkin_glasses', slot: 'eyes', cost: 300, rarity: 'limited', until: HALLOWEEN },
    { id: 'hw_eye_patch', slot: 'eyes', cost: 200, rarity: 'limited', until: HALLOWEEN },
    { id: 'hw_glow_eyes', slot: 'eyes', cost: 200, rarity: 'limited', until: HALLOWEEN },
    { id: 'hw_skull_paint', slot: 'face', cost: 300, rarity: 'limited', until: HALLOWEEN },
    { id: 'hw_stitches', slot: 'face', cost: 250, rarity: 'limited', until: HALLOWEEN },
    { id: 'hw_pumpkin_paint', slot: 'face', cost: 250, rarity: 'limited', until: HALLOWEEN },
    { id: 'hw_bat_scarf', slot: 'neck', cost: 300, rarity: 'limited', until: HALLOWEEN },
    { id: 'hw_vampire_collar', slot: 'neck', cost: 350, rarity: 'limited', until: HALLOWEEN },
    { id: 'hw_bone_chain', slot: 'neck', cost: 300, rarity: 'limited', until: HALLOWEEN },
    { id: 'hw_bandages', slot: 'neck', cost: 250, rarity: 'limited', until: HALLOWEEN },
    { id: 'hw_kit', slot: 'outfit', cost: 500, rarity: 'limited', until: HALLOWEEN },
    { id: 'hw_skeleton', slot: 'outfit', cost: 700, rarity: 'limited', until: HALLOWEEN },
    { id: 'hw_mummy', slot: 'outfit', cost: 700, rarity: 'limited', until: HALLOWEEN },
    { id: 'hw_vampire', slot: 'outfit', cost: 900, rarity: 'limited', until: HALLOWEEN },
];
exports.GEAR_SLOTS = ['head', 'eyes', 'face', 'neck', 'outfit'];
function gearOnSale(g, now = Date.now()) {
    return !g.until || now < new Date(g.until).getTime();
}
function halloweenOn(now = Date.now()) {
    return now < new Date(HALLOWEEN).getTime() && now >= new Date('2026-10-20T00:00:00').getTime();
}
exports.PAID_STYLES = [
    { id: 'hair_side', kind: 'hair', value: 'side', cost: 150, rarity: 'common' },
    { id: 'hair_curtains', kind: 'hair', value: 'curtains', cost: 150, rarity: 'common' },
    { id: 'hair_bald', kind: 'hair', value: 'bald', cost: 150, rarity: 'common' },
    { id: 'hair_spiky', kind: 'hair', value: 'spiky', cost: 150, rarity: 'common' },
    { id: 'hair_afro', kind: 'hair', value: 'afro', cost: 200, rarity: 'common' },
    { id: 'hair_long', kind: 'hair', value: 'long', cost: 200, rarity: 'common' },
    { id: 'hair_bun', kind: 'hair', value: 'bun', cost: 200, rarity: 'common' },
    { id: 'hair_ponytail', kind: 'hair', value: 'ponytail', cost: 200, rarity: 'common' },
    { id: 'hair_mohawk', kind: 'hair', value: 'mohawk', cost: 300, rarity: 'rare' },
    { id: 'hair_dreads', kind: 'hair', value: 'dreads', cost: 300, rarity: 'rare' },
    { id: 'hair_braids', kind: 'hair', value: 'braids', cost: 300, rarity: 'rare' },
    { id: 'hair_cornrows', kind: 'hair', value: 'cornrows', cost: 300, rarity: 'rare' },
    { id: 'beard_goatee', kind: 'beard', value: 'goatee', cost: 150, rarity: 'common' },
    { id: 'beard_circle', kind: 'beard', value: 'circle', cost: 150, rarity: 'common' },
    { id: 'beard_chinstrap', kind: 'beard', value: 'chinstrap', cost: 150, rarity: 'common' },
    { id: 'beard_full', kind: 'beard', value: 'full', cost: 250, rarity: 'rare' },
    { id: 'beard_long', kind: 'beard', value: 'long', cost: 400, rarity: 'rare' },
    { id: 'brows_thick', kind: 'brows', value: 'thick', cost: 100, rarity: 'common' },
];
exports.PACKS = [
    { id: 'pack_starter', items: ['g_round_glasses', 'hair_side', 'beard_goatee', 'brows_thick'], cost: 450, rarity: 'rare' },
    {
        id: 'pack_halloween',
        items: ['hw_vampire', 'hw_pumpkin_head', 'hw_vampire_collar', 'hw_skull_paint', 'hw_glow_eyes'],
        cost: 1490,
        rarity: 'limited',
        until: HALLOWEEN,
        wear: ['hw_vampire', 'hw_vampire_collar', 'hw_skull_paint', 'hw_glow_eyes'],
    },
];
function itemCost(id) {
    var _a, _b, _c, _d;
    return (_d = (_b = (_a = exports.GEAR.find((g) => g.id === id)) === null || _a === void 0 ? void 0 : _a.cost) !== null && _b !== void 0 ? _b : (_c = exports.PAID_STYLES.find((s) => s.id === id)) === null || _c === void 0 ? void 0 : _c.cost) !== null && _d !== void 0 ? _d : 0;
}
function packValue(pack, owned) {
    return pack.items.filter((id) => !owned.includes(id)).reduce((n, id) => n + itemCost(id), 0);
}
function packPrice(pack, owned, now = Date.now()) {
    if (pack.until && now >= new Date(pack.until).getTime())
        return null;
    const left = packValue(pack, owned);
    if (left <= 0)
        return null;
    const full = packValue(pack, []);
    return Math.max(10, Math.round((pack.cost * left) / full / 10) * 10);
}
function packDaysLeft(pack, now = Date.now()) {
    if (!pack.until)
        return null;
    return Math.max(1, Math.ceil((new Date(pack.until).getTime() - now) / 86400000));
}
function wearItem(av, id) {
    const g = exports.GEAR.find((x) => x.id === id);
    if (g)
        return Object.assign(Object.assign({}, av), { gear: Object.assign(Object.assign({}, av.gear), { [g.slot]: id }) });
    const st = exports.PAID_STYLES.find((x) => x.id === id);
    return st ? Object.assign(Object.assign({}, av), { [st.kind]: st.value }) : av;
}
const FREE_FALLBACK = { hair: 'buzz', beard: 'none', brows: 'soft' };
function paidStyle(kind, value) {
    return exports.PAID_STYLES.find((s) => s.kind === kind && s.value === value);
}
function isAvatarItem(id) {
    return exports.GEAR.some((g) => g.id === id) || exports.PAID_STYLES.some((s) => s.id === id);
}
function styleLocked(kind, value, owned) {
    const paid = paidStyle(kind, value);
    return !!paid && !owned.includes(paid.id);
}
function enforceOwned(av, owned) {
    const out = Object.assign(Object.assign({}, av), { gear: Object.assign({}, av.gear) });
    for (const kind of ['hair', 'beard', 'brows']) {
        if (styleLocked(kind, out[kind], owned))
            out[kind] = FREE_FALLBACK[kind];
    }
    for (const slot of exports.GEAR_SLOTS) {
        const id = out.gear[slot];
        if (id && !owned.includes(id))
            delete out.gear[slot];
    }
    return out;
}
function toggleStyle(av, s) {
    return Object.assign(Object.assign({}, av), { [s.kind]: av[s.kind] === s.value ? FREE_FALLBACK[s.kind] : s.value });
}
function defaultAvatar() {
    return { skin: exports.SKIN_TONES[2], hair: 'buzz', hairColor: exports.HAIR_COLORS[1], beard: 'none', brows: 'soft', gear: {} };
}
function normalizeAvatar(raw) {
    const d = defaultAvatar();
    if (!raw || typeof raw !== 'object')
        return d;
    const pick = (v, list, def) => list.includes(v) ? v : def;
    const gear = {};
    if (raw.gear && typeof raw.gear === 'object') {
        for (const slot of exports.GEAR_SLOTS) {
            const id = raw.gear[slot];
            if (exports.GEAR.some((g) => g.id === id && g.slot === slot))
                gear[slot] = id;
        }
    }
    return {
        skin: pick(raw.skin, exports.SKIN_TONES, d.skin),
        hair: pick(raw.hair, exports.HAIR_STYLES, d.hair),
        hairColor: pick(raw.hairColor, exports.HAIR_COLORS, d.hairColor),
        beard: pick(raw.beard, exports.BEARDS, d.beard),
        brows: pick(raw.brows, exports.BROWS, d.brows),
        gear,
    };
}
function seededAvatar(seed) {
    let h = 2166136261;
    for (const ch of seed)
        h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
    const next = (n) => {
        h = Math.imul(h ^ (h >>> 13), 0x5bd1e995) >>> 0;
        return h % n;
    };
    return {
        skin: exports.SKIN_TONES[next(exports.SKIN_TONES.length)],
        hair: exports.HAIR_STYLES[next(exports.HAIR_STYLES.length - 1)],
        hairColor: exports.HAIR_COLORS[next(6)],
        beard: exports.BEARDS[next(exports.BEARDS.length)],
        brows: exports.BROWS[next(exports.BROWS.length)],
        gear: {},
    };
}

},
"cinematics/moments": function (exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NATION_KITS = void 0;
exports.classifyMoment = classifyMoment;
exports.penaltyPlan = penaltyPlan;
exports.strikePlan = strikePlan;
exports.oneOnOnePlan = oneOnOnePlan;
exports.keeperPlan = keeperPlan;
exports.playPlan = playPlan;
exports.duelPlan = duelPlan;
exports.attitudePlan = attitudePlan;
const FREEKICK_SHOTS = ['curl', 'drive', 'power', 'chip'];
const KEEPER_PENALTY = ['read', 'early', 'center', 'mind'];
function classifyMoment(optionIds, optionId) {
    if (optionIds.includes('panenka')) {
        if (optionId === 'leave')
            return { family: 'attitude', kind: 'manage' };
        return { family: 'penalty', role: 'shooter' };
    }
    if (KEEPER_PENALTY.every((id) => optionIds.includes(id)) && KEEPER_PENALTY.includes(optionId)) {
        return { family: 'penalty', role: 'keeper' };
    }
    if (optionIds.includes('curl') && FREEKICK_SHOTS.includes(optionId))
        return { family: 'strike', setup: 'freekick' };
    if (optionId === 'longshot')
        return { family: 'strike', setup: 'open' };
    if (optionId === 'shoot' && (optionIds.includes('through') || optionIds.includes('carry')))
        return { family: 'strike', setup: 'open' };
    if (optionId === 'shot' && optionIds.includes('cross'))
        return { family: 'strike', setup: 'open' };
    if (optionIds.includes('round') && ONE_ON_ONE[optionId])
        return { family: 'oneOnOne' };
    if (optionIds.includes('bicycle')) {
        const k = optionId === 'slide' ? 'tackle' : DUEL[optionId];
        return k ? { family: 'duel', kind: k } : null;
    }
    if (optionIds.includes('punch') && (optionIds.includes('shout') || optionIds.includes('line') || optionIds.includes('counter'))) {
        return KEEPER_CROSS[optionId] ? { family: 'keeper', setup: 'cross' } : null;
    }
    if (optionIds.includes('react') || optionIds.includes('foot') || (optionIds.includes('safe') && optionIds.includes('dive'))) {
        return KEEPER_SHOT[optionId] ? { family: 'keeper', setup: 'shot' } : null;
    }
    if (['rush', 'slide', 'close', 'spread', 'block'].some((id) => optionIds.includes(id))) {
        return KEEPER_BREAK[optionId] ? { family: 'keeper', setup: 'breakaway' } : null;
    }
    if (DRIBBLE.includes(optionId))
        return { family: 'play', mode: 'dribble' };
    if (PASS[optionId])
        return { family: 'play', mode: 'pass' };
    if (optionIds.includes('near') && optionIds.includes('far') && HEADER.includes(optionId))
        return { family: 'duel', kind: 'header' };
    if (DUEL[optionId])
        return { family: 'duel', kind: DUEL[optionId] };
    if (ATTITUDE[optionId])
        return { family: 'attitude', kind: ATTITUDE[optionId] };
    return null;
}
function penaltyPlan(role, option, success, side) {
    const s = side;
    const low = (dx) => ({ x: 200 + s * dx, y: 682 });
    const plan = (p) => (Object.assign({ arc: 18, flight: 420, diveAt: 40, stutter: false }, p));
    if (role === 'shooter') {
        switch (option) {
            case 'corner':
                return success
                    ? plan({ target: low(150), end: 'net', dive: s, diveAt: 140, result: 'goal' })
                    : plan({ target: { x: 200 + s * 168, y: 660 }, end: 'post', dive: s, result: 'post' });
            case 'power':
                return success
                    ? plan({ target: { x: 200 + s * 40, y: 428 }, end: 'net', dive: s, flight: 330, result: 'goal' })
                    : plan({ target: { x: 200 + s * 30, y: 398 }, end: 'bar', dive: -s, flight: 330, result: 'bar' });
            case 'panenka':
                return success
                    ? plan({ target: { x: 200, y: 590 }, arc: 150, flight: 950, end: 'net', dive: s, diveAt: -40, result: 'goal' })
                    : plan({ target: { x: 200, y: 600 }, arc: 150, flight: 950, end: 'catch', dive: 0, result: 'saved' });
            case 'wait':
                return success
                    ? plan({ target: low(110), end: 'net', dive: -s, diveAt: -260, stutter: true, result: 'goal' })
                    : plan({ target: low(110), end: 'deflect', dive: s, diveAt: 30, stutter: true, result: 'saved' });
            default:
                return success
                    ? plan({ target: low(110), end: 'net', dive: -s, result: 'goal' })
                    : plan({ target: low(110), end: 'deflect', dive: s, result: 'saved' });
        }
    }
    switch (option) {
        case 'early':
            return success
                ? plan({ target: low(120), end: 'deflect', dive: s, diveAt: -200, result: 'save' })
                : plan({ target: { x: 200 - s * 120, y: 682 }, end: 'net', dive: s, diveAt: -200, result: 'conceded' });
        case 'center':
            return success
                ? plan({ target: { x: 200, y: 560 }, end: 'catch', dive: 0, flight: 360, result: 'save' })
                : plan({ target: low(150), end: 'net', dive: 0, result: 'conceded' });
        case 'mind':
            return success
                ? plan({ target: { x: 200 + s * 235, y: 640 }, end: 'wide', dive: s, diveAt: 60, result: 'wide' })
                : plan({ target: { x: 200 + s * 140, y: 432 }, end: 'net', dive: -s, flight: 340, result: 'conceded' });
        default:
            return success
                ? plan({ target: low(120), end: 'deflect', dive: s, diveAt: 50, result: 'save' })
                : plan({ target: { x: 200 - s * 120, y: 682 }, end: 'net', dive: s, diveAt: 50, result: 'conceded' });
    }
}
function strikePlan(setup, option, success, side, roll = Math.random()) {
    const s = side;
    const base = { setup, curve: 0, arc: 30, flight: 1000, dive: s, diveAt: 420 };
    if (setup === 'open') {
        if (success)
            return Object.assign(Object.assign({}, base), { u: s * 0.86, v: 0.82, curve: -s * 34, arc: 40, end: 'net', diveAt: 640, result: 'goal' });
        if (roll < 0.34)
            return Object.assign(Object.assign({}, base), { u: s * 1.28, v: 0.45, curve: -s * 20, end: 'wide', diveAt: 560, result: 'wide' });
        if (roll < 0.67)
            return Object.assign(Object.assign({}, base), { u: s * 0.35, v: 1.7, arc: 60, end: 'over', dive: 0, result: 'over' });
        return Object.assign(Object.assign({}, base), { u: s * 0.8, v: 0.78, curve: -s * 26, arc: 36, end: 'save', diveAt: 520, result: 'saved' });
    }
    switch (option) {
        case 'drive':
            return success
                ? Object.assign(Object.assign({}, base), { u: s * 0.62, v: 0.08, arc: 4, flight: 820, end: 'net', diveAt: 520, result: 'goal' }) : Object.assign(Object.assign({}, base), { u: s * 0.3, v: 0.1, arc: 4, flight: 820, end: 'wall', dive: 0, result: 'wall' });
        case 'power':
            return success
                ? Object.assign(Object.assign({}, base), { u: s * 0.22, v: 0.86, arc: 46, flight: 760, end: 'net', dive: s, diveAt: 600, result: 'goal' }) : Object.assign(Object.assign({}, base), { u: s * 0.45, v: 0.7, arc: 40, flight: 760, end: 'save', diveAt: 360, result: 'saved' });
        case 'chip':
            return success
                ? Object.assign(Object.assign({}, base), { u: s * 0.3, v: 0.94, arc: 150, flight: 1250, end: 'net', dive: s, diveAt: 820, result: 'goal' }) : Object.assign(Object.assign({}, base), { u: s * 0.3, v: 1.3, arc: 150, flight: 1250, end: 'over', dive: s, diveAt: 820, result: 'over' });
        default:
            return success
                ? Object.assign(Object.assign({}, base), { u: s * 0.84, v: 0.84, curve: -s * 70, arc: 92, flight: 1100, end: 'net', diveAt: 760, result: 'goal' }) : Object.assign(Object.assign({}, base), { u: s * 0.95, v: 1.25, curve: -s * 60, arc: 92, flight: 1100, end: 'over', diveAt: 760, result: 'over' });
    }
}
const ONE_ON_ONE = { chip: 'chip', lob: 'chip', flat: 'low', shoot: 'low', early: 'low', round: 'round' };
function oneOnOnePlan(option, success, side, roll = Math.random()) {
    const s = side;
    const action = ONE_ON_ONE[option] || 'low';
    const base = { action, side: s, arc: 10, flight: 520 };
    if (action === 'chip') {
        if (success)
            return Object.assign(Object.assign({}, base), { u: s * 0.2, v: 0.55, arc: 150, flight: 950, end: 'net', dive: 0, result: 'goal' });
        return roll < 0.5
            ? Object.assign(Object.assign({}, base), { u: s * 0.15, v: 1.35, arc: 150, flight: 950, end: 'over', dive: 0, result: 'over' }) : Object.assign(Object.assign({}, base), { u: s * 0.1, v: 0.95, arc: 120, flight: 900, end: 'save', dive: 0, result: 'saved' });
    }
    if (action === 'round') {
        return success
            ? Object.assign(Object.assign({}, base), { u: s * 0.15, v: 0.05, flight: 700, end: 'net', dive: -s, result: 'goal' }) : Object.assign(Object.assign({}, base), { u: 0, v: 0, end: 'smother', dive: s, result: 'saved' });
    }
    return success
        ? Object.assign(Object.assign({}, base), { u: s * 0.7, v: 0.12, end: 'net', dive: -s, result: 'goal' }) : roll < 0.3
        ? Object.assign(Object.assign({}, base), { u: s * 1.25, v: 0.15, end: 'wide', dive: s, result: 'wide' }) : Object.assign(Object.assign({}, base), { u: s * 0.45, v: 0.2, end: 'save', dive: s, result: 'saved' });
}
const KEEPER_CROSS = { punch: 'punch', catch: 'catch', counter: 'catch', hold: 'line', line: 'line', shout: 'shout' };
const KEEPER_SHOT = { react: 'dive', dive: 'dive', second: 'dive', punch: 'dive', stand: 'body', safe: 'body', hold: 'body', foot: 'foot' };
const KEEPER_BREAK = {
    rush: 'rush', slide: 'rush', close: 'rush', block: 'rush',
    wait: 'stay', angle: 'stay', stand: 'stay', feint: 'stay', spread: 'stay', bluff: 'stay', feet: 'stay', mind: 'stay',
};
function keeperPlan(setup, option, success, side) {
    const table = setup === 'cross' ? KEEPER_CROSS : setup === 'shot' ? KEEPER_SHOT : KEEPER_BREAK;
    return { setup, action: table[option] || (setup === 'cross' ? 'catch' : setup === 'shot' ? 'dive' : 'stay'), side, success, result: success ? 'save' : 'conceded' };
}
const DRIBBLE = ['solo', 'carry', 'selfish', 'feint', 'dribble', 'turn', 'duel', 'run', 'drive'];
const PASS = {
    vertical: 'ground', killer: 'ground', through: 'ground', give: 'ground', square: 'ground', pass: 'ground',
    layoff: 'ground', simple: 'ground', switch: 'ground', cross: 'cross', overlap: 'cross', combo: 'onetwo', two: 'onetwo',
};
function playPlan(mode, option, success, side) {
    if (mode === 'dribble') {
        return { mode, pass: null, double: option === 'solo' || option === 'selfish', side, success, result: success ? 'goal' : 'tackled' };
    }
    const pass = PASS[option] || 'ground';
    return { mode, pass, double: false, side, success, result: success ? (pass === 'onetwo' ? 'goal' : 'assist') : 'intercepted' };
}
const HEADER = ['near', 'far', 'spot', 'screen'];
const DUEL = {
    tackle: 'tackle', delay: 'jockey', jockey: 'jockey', trust: 'jockey',
    mark: 'mark', stick: 'mark', double: 'mark', swap: 'mark', press: 'mark', anticipate: 'mark', team: 'mark', zone: 'mark',
    line: 'mark', edge: 'mark', stay: 'mark', screen: 'mark', counter: 'mark',
    clear: 'clear', head: 'clear', bicycle: 'clear',
    foul: 'foul', tactical: 'foul', hand: 'foul', foul_smart: 'foul', intimidate: 'foul', rough: 'foul',
    draw: 'drawn', corner_run: 'drawn',
};
const ATTITUDE = {
    voice: 'rally', crowd: 'rally', big: 'rally', celebrate: 'rally', kill: 'rally',
    control: 'manage', slow: 'manage', tempo: 'manage', keepball: 'manage', corner_poteau: 'manage', calm: 'manage',
    wait: 'manage', sober: 'manage', talk: 'manage', ignore: 'manage', leave: 'manage',
    protest: 'referee', own: 'referee',
};
function duelPlan(kind, option, success, side) {
    const base = { kind, option, side, success, card: null };
    switch (kind) {
        case 'foul': {
            const red = option === 'foul' || option === 'hand';
            return Object.assign(Object.assign({}, base), { card: success ? (red ? 'red' : 'yellow') : 'red', result: success ? 'stopped' : 'sentOff' });
        }
        case 'drawn':
            return Object.assign(Object.assign({}, base), { card: success ? null : 'yellow', result: success ? 'foulWon' : 'noFoul' });
        case 'header':
            return Object.assign(Object.assign({}, base), { result: success ? (option === 'screen' ? 'assist' : 'goal') : option === 'spot' ? 'saved' : 'wide' });
        case 'clear':
            return Object.assign(Object.assign({}, base), { result: success ? 'cleared' : 'conceded' });
        default:
            return Object.assign(Object.assign({}, base), { result: success ? 'won' : 'beaten' });
    }
}
function attitudePlan(kind, option, success, side) {
    const results = {
        rally: ['rallied', 'whistled'],
        manage: ['managed', 'lost'],
        referee: ['fairplay', 'booked'],
    };
    return { kind, option, side, success, result: results[kind][success ? 0 : 1] };
}
exports.NATION_KITS = {
    fr: ['#1d3a8a', '#ffffff'], de: ['#f4f4f4', '#151515'], es: ['#c8102e', '#1d3a8a'], it: ['#1f5fbf', '#ffffff'],
    en: ['#f4f4f4', '#1d2d6b'], br: ['#facc15', '#1d4ed8'], ar: ['#7cc4ec', '#151515'], nl: ['#f97316', '#ffffff'],
    pt: ['#b91c1c', '#15803d'], be: ['#c8102e', '#151515'], hr: ['#e5e7eb', '#1d3a8a'], uy: ['#5aa9e6', '#151515'],
    ma: ['#c8102e', '#15803d'], mx: ['#15803d', '#ffffff'], co: ['#facc15', '#1d3a8a'], ch: ['#c8102e', '#ffffff'],
    sn: ['#f4f4f4', '#15803d'], tr: ['#c8102e', '#ffffff'], cm: ['#15803d', '#c8102e'], ci: ['#f97316', '#ffffff'],
    dz: ['#f4f4f4', '#15803d'], tn: ['#c8102e', '#ffffff'], no: ['#c8102e', '#1d3a8a'], cd: ['#3b82f6', '#c8102e'],
    gn: ['#c8102e', '#facc15'], bj: ['#facc15', '#15803d'], jp: ['#1d3a8a', '#ffffff'], us: ['#f4f4f4', '#1d3a8a'],
    kr: ['#c8102e', '#151515'], eg: ['#c8102e', '#ffffff'], pl: ['#f4f4f4', '#c8102e'], se: ['#facc15', '#1d4ed8'],
    ca: ['#c8102e', '#ffffff'], ml: ['#15803d', '#facc15'], cv: ['#1d4ed8', '#ffffff'],
};

},
"cinematics/index": function (exports, require) {
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cinematicHtml = cinematicHtml;
exports.signingCinematic = signingCinematic;
exports.devSigningSample = devSigningSample;
exports.momentCinematic = momentCinematic;
const engine_js_1 = __importDefault(require("../game/engine.js"));
const i18n_1 = require("../i18n");
const signingTemplate_1 = require("./signingTemplate");
const penaltyTemplate_1 = require("./penaltyTemplate");
const strikeTemplate_1 = require("./strikeTemplate");
const oneOnOneTemplate_1 = require("./oneOnOneTemplate");
const keeperTemplate_1 = require("./keeperTemplate");
const playTemplate_1 = require("./playTemplate");
const duelTemplate_1 = require("./duelTemplate");
const attitudeTemplate_1 = require("./attitudeTemplate");
const moments_1 = require("./moments");
const rigWeb_1 = require("../avatar/rigWeb");
const catalog_1 = require("../avatar/catalog");
const TEMPLATES = {
    signing: signingTemplate_1.SIGNING_TEMPLATE,
    penalty: penaltyTemplate_1.PENALTY_TEMPLATE,
    strike: strikeTemplate_1.STRIKE_TEMPLATE,
    oneOnOne: oneOnOneTemplate_1.ONE_ON_ONE_TEMPLATE,
    keeper: keeperTemplate_1.KEEPER_TEMPLATE,
    play: playTemplate_1.PLAY_TEMPLATE,
    duel: duelTemplate_1.DUEL_TEMPLATE,
    attitude: attitudeTemplate_1.ATTITUDE_TEMPLATE,
};
function cinematicHtml(cine) {
    const json = JSON.stringify(cine.data).replace(/</g, '\\u003c');
    return TEMPLATES[cine.id].replace('/*__RIG_JS__*/', () => rigWeb_1.RIG_WEB_JS).replace('/*__CINE_DATA__*/null', () => json);
}
const EMOJI_HEX = {
    '🔴': '#d62828',
    '⚪': '#f1f1f1',
    '🔵': '#1d4ed8',
    '🟢': '#15803d',
    '⚫': '#151515',
    '🟡': '#facc15',
    '🟣': '#7e22ce',
    '🟠': '#f97316',
    '🩷': '#ec4899',
    '🟤': '#7c4a1e',
};
function clubHexes(colors) {
    const found = Array.from(colors || '')
        .map((ch) => EMOJI_HEX[ch])
        .filter(Boolean);
    const c1 = found[0] || '#0B6F7C';
    const c2 = found[1] || (c1 === '#f1f1f1' ? '#151515' : '#f1f1f1');
    return [c1, c2];
}
function isLight(hex) {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return 0.299 * r + 0.587 * g + 0.114 * b > 160;
}
const NUMBERS_BY_POS = {
    att: [9, 10, 7, 11, 19],
    mil: [8, 6, 10, 14, 17],
    def: [4, 5, 3, 2, 15],
    gk: [1, 16, 30],
};
function shirtNumber(player, clubId) {
    var _a;
    const pool = NUMBERS_BY_POS[(_a = player.position) === null || _a === void 0 ? void 0 : _a.id] || NUMBERS_BY_POS.mil;
    let h = 0;
    for (const ch of `${player.name}|${clubId}`)
        h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return pool[h % pool.length];
}
function signingCinematic(player, fromClub, offer, loan, avatar) {
    var _a;
    const club = offer.club;
    const [c1, c2] = clubHexes(club.colors);
    const fee = !loan && offer.fee ? offer.fee : null;
    const words = String(player.name || '').trim().split(/\s+/);
    const av = avatar || (0, catalog_1.seededAvatar)(String(player.name || 'player'));
    const shirtName = words[words.length - 1] || '';
    const number = shirtNumber(player, club.id);
    const kit = { c1, c2, ink: isLight(c1) ? '#111111' : '#ffffff' };
    return {
        id: 'signing',
        data: {
            c1,
            c2,
            shirtInk: isLight(c1) ? '#111111' : '#ffffff',
            fromClub: (fromClub === null || fromClub === void 0 ? void 0 : fromClub.name) || '',
            toClub: club.name,
            flag: ((_a = engine_js_1.default.countryOf(club.countryId)) === null || _a === void 0 ? void 0 : _a.flag) || '',
            shirtName,
            number,
            avatar: av,
            kit,
            loan,
            fee,
            feeText: fee != null ? engine_js_1.default.fmtMoney(fee) : null,
            labels: {
                official: (0, i18n_1.t)('cinematic.official'),
                from: (0, i18n_1.t)('cinematic.from'),
                kind: loan ? (0, i18n_1.t)('cinematic.loan') : (0, i18n_1.t)('cinematic.transfer'),
                fee: (0, i18n_1.t)('cinematic.fee'),
                noFee: (0, i18n_1.t)('cinematic.loanSeason'),
                free: (0, i18n_1.t)('cinematic.free'),
                skip: (0, i18n_1.t)('cinematic.skip'),
            },
        },
    };
}
function devSigningSample(loan = false, avatar) {
    return signingCinematic({ name: 'Lucas Dupont', position: { id: 'att' } }, { name: 'FC Nantes' }, { club: { id: 'dev', name: loan ? 'Borussia Westfalen' : 'AC Milano', colors: loan ? '🟡🔵' : '🔴⚫', countryId: loan ? 'de' : 'it' }, fee: 45 }, loan, avatar);
}
function contrasting(avoid, pool) {
    const dist = (a, b) => {
        const x = parseInt(a.slice(1), 16);
        const y = parseInt(b.slice(1), 16);
        return Math.abs(((x >> 16) & 255) - ((y >> 16) & 255)) + Math.abs(((x >> 8) & 255) - ((y >> 8) & 255)) + Math.abs((x & 255) - (y & 255));
    };
    const pick = pool.find(([c1]) => avoid.every((a) => dist(c1, a) > 200)) || pool[0];
    return { c1: pick[0], c2: pick[1] };
}
const OPPONENT_KITS = [['#f4f4f4', '#1d3a8a'], ['#1d3a8a', '#ffffff'], ['#151515', '#facc15'], ['#c8102e', '#ffffff'], ['#15803d', '#ffffff']];
const KEEPER_KITS = [['#22c55e', '#111111'], ['#f97316', '#111111'], ['#a855f7', '#111111'], ['#facc15', '#111111'], ['#111827', '#f4f4f4']];
function momentCinematic(player, title, optionIds, optionId, success, avatar, national = false) {
    var _a, _b, _c;
    const kind = (0, moments_1.classifyMoment)(optionIds, optionId);
    if (!kind)
        return null;
    const nat = national ? moments_1.NATION_KITS[(_a = player.nationality) === null || _a === void 0 ? void 0 : _a.id] : null;
    const [c1, c2] = nat || clubHexes((_b = player.club) === null || _b === void 0 ? void 0 : _b.colors);
    const kit = { c1, c2, ink: isLight(c1) ? '#111111' : '#ffffff' };
    const oppKit = contrasting([c1], OPPONENT_KITS);
    const keeperKit = contrasting([c1, oppKit.c1], KEEPER_KITS);
    const oppKeeperKit = contrasting([c1, oppKit.c1, keeperKit.c1], KEEPER_KITS);
    const words = String(player.name || '').trim().split(/\s+/);
    const side = Math.random() < 0.5 ? 1 : -1;
    const common = {
        title,
        kit,
        oppKit,
        keeperKit,
        oppKeeperKit,
        avatar: avatar || (0, catalog_1.seededAvatar)(String(player.name || 'player')),
        oppAvatar: (0, catalog_1.seededAvatar)(`${player.name}|${title}|opp`),
        shirtName: words[words.length - 1] || '',
        number: shirtNumber(player, national ? 'nat' : ((_c = player.club) === null || _c === void 0 ? void 0 : _c.id) || ''),
    };
    if (kind.family === 'strike') {
        const plan = (0, moments_1.strikePlan)(kind.setup, optionId, success, side);
        return {
            id: 'strike',
            data: Object.assign(Object.assign({}, common), { plan, wallAvatars: [0, 1, 2, 3].map((i) => (0, catalog_1.seededAvatar)(`${player.name}|${title}|wall${i}`)), labels: {
                    word: (0, i18n_1.t)(kind.setup === 'freekick' ? 'cinematic.freekick' : 'cinematic.longshot'),
                    result: (0, i18n_1.t)(`cinematic.${plan.result}`),
                    skip: (0, i18n_1.t)('cinematic.skip'),
                } }),
        };
    }
    const extras = {
        wallAvatars: [0, 1].map((i) => (0, catalog_1.seededAvatar)(`${player.name}|${title}|def${i}`)),
        mateAvatars: [(0, catalog_1.seededAvatar)(`${player.name}|${title}|mate0`)],
        refAvatar: (0, catalog_1.seededAvatar)(`${title}|referee`),
    };
    if (kind.family === 'duel') {
        const plan = (0, moments_1.duelPlan)(kind.kind, optionId, success, side);
        const word = kind.kind === 'header' ? 'cinematic.headerWord' : kind.kind === 'foul' || kind.kind === 'drawn' ? 'cinematic.foulWord' : 'cinematic.duel';
        return {
            id: 'duel',
            data: Object.assign(Object.assign(Object.assign({}, common), extras), { plan, labels: { word: (0, i18n_1.t)(word), result: (0, i18n_1.t)(`cinematic.${plan.result}`), skip: (0, i18n_1.t)('cinematic.skip') } }),
        };
    }
    if (kind.family === 'attitude') {
        const plan = (0, moments_1.attitudePlan)(kind.kind, optionId, success, side);
        const word = kind.kind === 'rally' ? 'cinematic.crowdWord' : kind.kind === 'manage' ? 'cinematic.manageWord' : 'cinematic.refWord';
        return {
            id: 'attitude',
            data: Object.assign(Object.assign(Object.assign({}, common), extras), { plan, labels: { word: (0, i18n_1.t)(word), result: (0, i18n_1.t)(`cinematic.${plan.result}`), skip: (0, i18n_1.t)('cinematic.skip') } }),
        };
    }
    if (kind.family === 'play') {
        const plan = (0, moments_1.playPlan)(kind.mode, optionId, success, side);
        return {
            id: 'play',
            data: Object.assign(Object.assign({}, common), { plan, wallAvatars: [0, 1].map((i) => (0, catalog_1.seededAvatar)(`${player.name}|${title}|def${i}`)), mateAvatars: [(0, catalog_1.seededAvatar)(`${player.name}|${title}|mate0`)], labels: { word: (0, i18n_1.t)(kind.mode === 'dribble' ? 'cinematic.dribble' : 'cinematic.pass'), result: (0, i18n_1.t)(`cinematic.${plan.result}`), skip: (0, i18n_1.t)('cinematic.skip') } }),
        };
    }
    if (kind.family === 'keeper') {
        const plan = (0, moments_1.keeperPlan)(kind.setup, optionId, success, side);
        return {
            id: 'keeper',
            data: Object.assign(Object.assign({}, common), { plan, mateAvatars: [(0, catalog_1.seededAvatar)(`${player.name}|${title}|mate0`)], labels: { word: (0, i18n_1.t)('cinematic.keeper'), result: (0, i18n_1.t)(`cinematic.${plan.result}`), skip: (0, i18n_1.t)('cinematic.skip') } }),
        };
    }
    if (kind.family === 'oneOnOne') {
        const plan = (0, moments_1.oneOnOnePlan)(optionId, success, side);
        return {
            id: 'oneOnOne',
            data: Object.assign(Object.assign({}, common), { plan, labels: { word: (0, i18n_1.t)('cinematic.oneOnOne'), result: (0, i18n_1.t)(`cinematic.${plan.result}`), skip: (0, i18n_1.t)('cinematic.skip') } }),
        };
    }
    const plan = (0, moments_1.penaltyPlan)(kind.role, optionId, success, side);
    return {
        id: 'penalty',
        data: Object.assign(Object.assign({}, common), { role: kind.role, plan, labels: {
                penalty: (0, i18n_1.t)('cinematic.penalty'),
                result: (0, i18n_1.t)(`cinematic.${plan.result}`),
                skip: (0, i18n_1.t)('cinematic.skip'),
            } }),
    };
}

},
"i18n/strings": function (exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.howtoEn = exports.howtoFr = exports.en = exports.fr = void 0;
exports.fr = {
    common: {
        back: 'Retour',
        next: 'Suivant',
        loading: 'Chargement du destin…',
        continue: 'Continuer',
        close: 'Fermer',
        home: 'Accueil',
        save: 'Enregistrer',
        cancel: 'Annuler',
        buy: 'Acheter',
        unlock: 'Débloquer',
        equip: 'Équiper',
        unequip: 'Retirer',
        alreadyOwned: 'Déjà acquis',
        jetons: 'jetons',
        yearsOld: '{age} ans',
    },
    avatar: {
        title: 'Mon joueur',
        homeCreate: 'Crée ton pro',
        homeEdit: 'Modifier mon pro',
        tabSkin: 'Peau',
        tabHair: 'Coiffure',
        tabFace: 'Visage',
        tabGear: 'Équipement',
        tabOutfit: 'Tenue',
        poseFront: 'Face',
        poseBack: 'Dos',
        poseCelebrate: 'Joie',
        poseBoo: 'Bouh !',
        clubKit: 'Maillot du club',
        slot_head: 'Tête',
        slot_eyes: 'Yeux',
        slot_face: 'Peinture',
        slot_neck: 'Cou',
        hairColor: 'Couleur des cheveux',
        brows: 'Sourcils',
        hairStyle: 'Coupe',
        beard: 'Barbe',
        shirtName: 'Moi',
        shopGroup: 'Équipements du joueur',
        shopDesc: 'Pour ton avatar : visible dans l\'éditeur et les cinématiques.',
        buyTitle: 'Acheter cet équipement ?',
        buyBody: '{name} pour {cost} jetons.',
        notEnough: 'Il te faut {cost} jetons pour cet équipement.',
        packs: 'Packs',
        pack: {
            pack_starter: 'Premier contrat',
            pack_halloween: 'Nuit des vampires',
        },
        packBuyTitle: 'Acheter ce pack ?',
        packBuyBody: '{name} : {count} articles pour {cost} jetons.',
        packDaysLeft: 'Encore {n} jours',
        packLastDay: 'Dernier jour',
        packsSub: 'Pour ton joueur, à prix réduit',
        gear: {
            g_round_glasses: 'Lunettes rondes',
            g_chain: 'Chaîne en or',
            hw_witch_hat: 'Chapeau de sorcière',
            hw_pumpkin_head: 'Tête de citrouille',
            hw_horns: 'Cornes de diablotin',
            hw_wolf_ears: 'Oreilles de loup-garou',
            hw_cat_beanie: 'Bonnet chat noir',
            hw_bandit_mask: 'Masque de bandit',
            hw_pumpkin_glasses: 'Lunettes citrouille',
            hw_eye_patch: 'Cache-œil de pirate',
            hw_glow_eyes: 'Yeux qui brillent',
            hw_skull_paint: 'Maquillage tête de mort',
            hw_stitches: 'Points de suture',
            hw_pumpkin_paint: 'Peinture citrouille',
            hw_bat_scarf: 'Écharpe chauve-souris',
            hw_vampire_collar: 'Col de vampire',
            hw_bone_chain: 'Chaîne en os',
            hw_bandages: 'Bandages de momie',
            hw_kit: 'Maillot Halloween',
            hw_skeleton: 'Costume squelette',
            hw_mummy: 'Costume momie',
            hw_vampire: 'Costume vampire',
            hair_spiky: 'Coupe à pics',
            hair_bun: 'Chignon',
            hair_ponytail: 'Queue de cheval',
            hair_mohawk: 'Crête',
            hair_dreads: 'Dreadlocks',
            hair_braids: 'Tresses',
            beard_circle: 'Bouc rond',
            beard_chinstrap: 'Collier',
            beard_full: 'Barbe pleine',
            beard_long: 'Barbe longue',
            hair_side: 'Mèche',
            hair_curtains: 'Raie au milieu',
            hair_bald: 'Crâne rasé',
            hair_afro: 'Afro',
            hair_long: 'Mi-long',
            hair_cornrows: 'Tresses plaquées',
            beard_goatee: 'Bouc moustache',
            brows_thick: 'Sourcils épais',
        },
    },
    cinematic: {
        official: 'Officiel',
        from: 'Quitte',
        transfer: 'Transfert',
        loan: 'Prêt',
        fee: 'Montant du transfert',
        loanSeason: 'Prêt d\'une saison',
        free: 'Transfert libre',
        penalty: 'Penalty',
        goal: 'But !',
        saved: 'Arrêté',
        post: 'Poteau !',
        bar: 'La barre !',
        wide: 'À côté !',
        save: 'Arrêt !',
        conceded: 'But encaissé',
        longshot: 'De loin',
        freekick: 'Coup franc',
        over: 'Au-dessus !',
        wall: 'Dans le mur',
        oneOnOne: 'Face au gardien',
        keeper: 'Dernier rempart',
        dribble: 'Balle au pied',
        pass: 'La passe',
        assist: 'Passe décisive !',
        tackled: 'Taclé',
        intercepted: 'Interceptée',
        duel: 'Le duel',
        foulWord: 'La faute',
        headerWord: 'Le jeu de tête',
        crowdWord: 'Le public',
        manageWord: 'Gérer le match',
        refWord: 'L\'arbitre',
        won: 'Ballon récupéré !',
        beaten: 'Éliminé',
        cleared: 'Dégagé !',
        stopped: 'Action stoppée',
        sentOff: 'Expulsé',
        foulWon: 'Faute obtenue !',
        noFoul: 'Pas de faute',
        rallied: 'Le stade s\'embrase !',
        whistled: 'Sifflé',
        managed: 'Match maîtrisé',
        lost: 'Ballon perdu',
        fairplay: 'Respect !',
        booked: 'Averti',
        skip: 'Touchez pour passer',
    },
    brand: {
        taglineShort: 'Chaque décision forge ta légende.',
    },
    home: {
        career: 'Carrière',
        resumeTitle: 'Reprendre · {name}',
        writeLegend: 'Écrire sa légende',
        resumeBody: '{age} ans, saison en cours',
        careerBody: 'De 16 ans à la retraite : forme, mental et identité de jeu — chaque choix compte.',
        daily: 'Rendez-vous quotidien',
        dailyBest: 'Meilleur du jour : {score}',
        dailyFresh: 'Même graine pour tous. Pas encore tenté.',
        story: 'Légendes',
        storyTitle: 'Légendes à réécrire',
        storyBody: 'Une nouvelle légende chaque mercredi. Battez-la.',
        friends: 'Amis',
        friendsTitle: 'Défie tes amis',
        friendsBody: 'Même départ, mêmes dés. Le meilleur score gagne.',
        shop: 'Boutique ({jetons})',
        badges: 'Badges ({n}/{total})',
        pantheon: 'Panthéon ({n})',
        leaderboard: 'Classement',
        quests: 'Quêtes',
        settings: 'Paramètres',
        howto: 'Comment jouer',
        about: 'À propos',
        dailyQuests: 'Quêtes du jour',
        questLine: '{icon} {name} · {pts} jetons {done}',
        weekLine: '{icon} Semaine : {name} {done}',
        legendLine: '{icon} Légende : {name} {done}',
        seeQuests: 'Voir les quêtes',
        meta: '{careers} carrières · meilleur score {best} · série {streak}j · jokers {jokers}/{cap}',
        navShop: 'Boutique',
        navBadges: 'Badges',
        navPantheon: 'Panthéon',
        navLeaderboard: 'Classement',
        navSettings: 'Réglages',
        questsStrip: 'Quêtes du jour',
        statsLine: '{careers} carrières · meilleur {best}',
        copyright: '© {year} {app}',
    },
    setup: {
        nationalityTitle: 'Votre nationalité',
        nationalitySub: 'Le pays qui vous verra grandir sur les terrains.',
        positionTitle: 'Votre poste',
        positionSub: 'Il façonnera vos statistiques, vos événements et votre légende.',
        originTitle: 'Votre origine',
        originSub: "D'où venez-vous, avant les projecteurs ?",
        lifestyleTitle: 'Votre adolescence',
        lifestyleSub: 'Le mode de vie qui forgera votre discipline… et votre réputation.',
        entourageTitle: 'Votre entourage',
        entourageSub: 'Qui gère vos intérêts avant même votre premier contrat ?',
        academyTitle: 'Les clubs vous ont repéré',
        academySub: 'Les recruteurs ont observé votre profil.',
        builderTitle: 'Crée ton joueur',
        builderSub: "Façonne son identité, dans l'ordre que tu veux.",
        fNationality: 'Nationalité',
        fPosition: 'Poste',
        fOrigin: 'Origine',
        fLifestyle: 'Style de vie',
        fEntourage: 'Entourage',
        pickField: 'Choisir',
        previewName: 'Nouveau joueur',
        nameHint: 'Laisse vide pour un nom généré',
        chooseClub: 'Choisir mon club',
        talent: 'Talent',
        cRep: 'Rép',
        cDis: 'Disc',
        cForm: 'Forme',
        cMor: 'Moral',
        random: 'Tout aléatoire',
        randomA11y: 'Tout aléatoire, {cost} jetons',
        pot: 'Potentiel estimé : {stars}',
        notEnoughJetons: 'Pas assez de jetons ({cost} 🪙).',
    },
    game: {
        form: 'Forme',
        morale: 'Moral',
        loan: 'Prêt',
        stats: 'Statistiques',
        palmares: 'Palmarès',
        awards: 'Distinctions',
        path: 'Parcours',
        retire: '⏳ Raccrocher les crampons',
        technique: 'Technique',
        physical: 'Physique',
        mental: 'Mental',
        charisma: 'Charisme',
        reputation: 'Réputation',
        discipline: 'Discipline',
        coachBond: 'Lien coach',
        dressingRoom: 'Vestiaire',
        confidence: 'Confiance',
        pressure: 'Pression',
        resilience: 'Résilience',
        training: 'Entraînement',
        relationships: 'Relations',
        mentor: 'Mentor',
        teammate: 'Coéquipier',
        seasonContext: 'Cette saison',
        contexts: {
            debut: 'Grands débuts',
            new_coach: 'Nouveau coach',
            post_injury: 'Retour de blessure',
            pressure_cooker: 'Sous pression',
            redemption: 'Saison du rachat',
            contract_year: 'Année de contrat',
            veteran: 'Crépuscule',
            breakthrough: 'Éclosion',
            confirmation: 'Confirmation',
            routine: 'Saison régulière',
        },
        potential: 'Potentiel : {stars}',
        contract: 'Contrat : {salary}/an',
        contractYears: ' · {years} an(s) restant(s)',
        style: 'Style : {icon} {name}',
        careerLine: 'Carrière : {matches} matchs · {goals} buts · {assists} passes · {caps} sélections · peak {peak}',
        leagues: '🎖️ Championnats : {n}',
        nationalCups: '🏵️ Coupes nationales : {n}',
        europeCups: "🥇 Coupes d'Europe : {n}",
        worlds: '🏆 Mondiaux : {n}',
        championOf: '· Champion {country} · {level}',
        ballon: "⭐ Joueur d'Or : {n}",
        goldenBoot: "👟 Pied d'Or : {n}",
        awardsCount: '🏅 Distinctions : {n}',
        traits: 'Traits : {list}',
        noAwards: 'Pas encore de distinction individuelle marquante.',
        formedAt: 'Club formateur : {club}',
        seasonLine: '{year} · {club} ({level}) · note {rating}',
        idle: 'Préparation de la saison…',
        yearsAt: '{age} ans',
        slotMid: '⏸ Trêve',
        slotLate: '🏁 Sprint final',
        stripMatches: '{n} matchs',
        stripGoals: '⚽ {n}',
        stripAssists: '🅰️ {n}',
        stripCs: '🧤 {n}',
        stripRating: 'note {r}',
        standRace: 'Dans la course',
        standDanger: 'Zone rouge',
        standMid: 'Ventre mou',
        transfer: '✈️ TRANSFERT',
        loanWindow: '🔄 PRÊT',
        loanBody: 'Plusieurs clubs garantissent du temps de jeu. Le club conserve votre contrat.',
        transferBody: 'Des offres arrivent. Choisissez votre destin… ou restez.',
        salaryYear: '{salary}/an',
        stayRefuse: 'RESTER / REFUSER',
        stayRenew: 'RESTER / RECONDUIRE',
        continue: 'CONTINUER',
        decisiveMoment: '🎯 MOMENT DÉCISIF',
        tournamentIntro: '{flag} Le monde retient son souffle : {nat} entre dans la compétition, et vous êtes du voyage.',
        liveTournament: 'VIVRE LE TOURNOI',
        simTournament: 'SIMULER LE TOURNOI',
        vs: 'vs {name}',
        strength: 'Force {stars} · chances ~{pct}%',
        playMatch: 'JOUER LE MATCH',
        simRest: 'SIMULER LA SUITE',
        tournamentMoment: '⚡ MOMENT DE TOURNOI',
        dilemma: 'DILEMME',
        season: '📊 Saison {from}-{to} · {club}',
        onLoan: ' (prêt)',
        matches: 'Matchs',
        goals: 'Buts',
        assists: 'Passes déc.',
        rating: 'Note',
        cleanSheets: 'Clean sheets',
        championship: 'Championnat : ',
        champTitle: '🥇 Champion de {level} !',
        champGeneric: '🥇 Champion !',
        promoted: '{pos} — 🚀 montée arrachée en barrage !',
        playoffLost: '{pos} — barrage de montée perdu',
        relegated: '{pos} — 📉 RELÉGATION',
        natCaps: '{n} sélection(s)',
        natNoCaps: 'aucune sélection cette saison',
        natLine: '{flag} {icon} {role}{number} — {caps}',
        natNumber: ' · n° {n}',
        ballonRank: "⭐ Classement Joueur d'Or : {rank}",
        objectiveMet: '✅ Objectif du club : {label}',
        objectiveMiss: '❌ Objectif du club : {label}',
        objectiveBonus: ' (prime +{money})',
        benched: '⚠️ Cruèlement court en temps de jeu : votre moral en souffre.',
        injury: "🩹 {weeks} semaines d'infirmerie cette saison.",
        income: '💰 +{money} (salaire & sponsors)',
        window: '🪟 MERCATO · {age} ans',
        windowFallback: 'Le mercato bat son plein. Offres ou reconduction ?',
        group: 'Groupe',
        internalMove: ' · mutation interne',
        fee: ' · indemnité {money}',
        yourRival: 'votre grand rival',
        groupMove: '{group} propose une mutation interne vers {club}.',
    },
    offseason: {
        title: '🎯 PRÉPARATION · {age} ANS',
        body: 'Énergie à répartir : {n} point(s)',
        flavor_debut: 'Vos premiers vrais choix de préparation. À cet âge, tout est encore à modeler.',
        flavor_momentum: 'Sur la lancée d’une grande saison : le moment de capitaliser.',
        flavor_recovery: 'Après une saison hachée par les blessures, cap sur la reconstruction.',
        flavor_veteran: 'En fin de parcours, chaque détail compte pour durer encore un peu.',
        flavor_tough: 'Après une saison compliquée, il faut relever la tête et rebondir.',
        flavor_standard_0: 'Nouvelle intersaison : où concentrer vos efforts cette année ?',
        flavor_standard_1: 'Le calendrier repart bientôt. À vous de préparer le terrain.',
        flavor_standard_2: 'Une nouvelle saison se dessine : quel cap vous fixez-vous ?',
        flavor_standard_3: 'Temps de la préparation : affûter vos points forts, ou combler vos manques ?',
        train: 'Entraînement',
        trainHint: 'Progresser sur vos facettes.',
        media: 'Médias',
        mediaHint: 'Gagner en réputation… mais aussi en pression.',
        recovery: 'Récupération',
        recoveryHint: 'Refaire le plein de forme et de résilience.',
        relations: 'Relations',
        relationsHint: 'Renforcer coach, vestiaire, mentor et coéquipier.',
        confirm: 'Lancer la saison',
    },
    final: {
        premiumBonus: '💎 Destiny FC+ : jetons de carrière ×2 (+{n} 🪙)',
        adDouble: '🎬 Doubler mes jetons (+{n} 🪙)',
        adDoubled: 'Jetons doublés : +{n} 🪙 !',
        card: 'CARTE · {tier}',
        retired: 'Retraité',
        portraitOf: 'Portrait de {name}',
        seasons: '{n} saisons',
        formedAt: 'Formé à {club}',
        score: 'Score {score}',
        trajectory: 'Trajectoire · {label}',
        signature: 'Signature · {icon} {name}',
        stats: 'Statistiques',
        palmares: 'Palmarès',
        awards: 'Distinctions',
        matches: 'Matchs',
        goals: 'Buts',
        assists: 'Passes',
        cleanSheets: 'Clean sheets',
        caps: 'Caps',
        natGoals: 'Buts nat.',
        seasonsLbl: 'Saisons',
        fortune: 'Fortune',
        peak: 'Peak',
        resilience: 'Résilience',
        leagues: 'Championnats {n}',
        cups: 'Coupes {n}',
        cl: 'C1 {n}',
        worldCup: 'Mondial {n}',
        ballon: "Joueur d'Or {n}",
        goldenBoot: "Pied d'Or {n}",
        indiv: 'Titres indiv. {n}',
        championOf: 'Champion {country} · {level}',
        induction: "Discours d'intronisation",
        storyMode: 'Légendes · {alias}',
        storyCompare: 'Vous {you} — légende {legend}',
        storyBetter: ' · vous avez fait mieux',
        storyNew: ' · nouveau',
        storyMemories: 'Souvenirs vécus',
        duel: 'Duel',
        duelWin: 'Vous {you} — défi {target} · vous gagnez',
        duelDraw: 'Vous {you} — défi {target} · égalité',
        duelLose: 'Vous {you} — défi {target} · il mène encore',
        duelFrom: 'Défi de {name}',
        duelSendTitle: 'Défier un ami avec ce destin',
        duelSendHint: 'Ton ami rejouera la même carrière, à ses choix près. Score à battre : {score}.',
        duelSent: 'Envoyé ✓',
        duelNoFriends: "Ajoute des amis dans l'onglet Amis pour leur envoyer ce défi.",
        whatIf: 'Et si… {text}',
        hideSeasons: 'Masquer les saisons',
        showSeasons: 'Voir la carrière saison par saison',
        seasonLine: '{year} · {club} ({level}){apps} {goals}b {assists}p · note {rating}{pos}{trophies}',
        apps: ' · {n}j',
        archiveSeasons: "{n} saisons jouées. Le détail saison par saison n'a pas été conservé pour cette carrière plus ancienne.",
        faceOff: 'Face à face',
        faceLine: 'Vous {you} — {name} {them}',
        badges: 'Badges : {list}',
        jetons: '+{n} jetons',
        daily: 'Rendez-vous quotidien : {score}',
        todayBest: ' · record du jour',
        allTimeBest: ' · record absolu',
        share: 'Partager',
        fiche: 'Ma fiche',
        challengeFriend: 'Défier un ami',
        backPantheon: 'Retour au panthéon',
        replay: 'Rejouer une carrière',
        shareCancelled: 'Partage annulé.',
        ficheSaved: 'Fiche enregistrée en PNG.',
        pngTag: 'CARTE · {tier}',
        pngRetired: 'Retraité · score {score}',
        pngTrajectory: 'Trajectoire · {label}',
        pngStats: 'STATISTIQUES',
        pngPalmares: 'PALMARÈS',
        pngMatches: 'Matchs  {n}',
        pngGoals: 'Buts  {n}',
        pngAssists: 'Passes  {n}',
        pngCaps: 'Caps  {n}',
        pngLeagues: 'Championnats  {n}',
        pngCups: 'Coupes  {n}',
        pngCl: 'C1  {n}',
        pngWorld: 'Mondial  {n}',
        pngBallon: "Joueur d'Or  {n}",
        pngBoot: "Pied d'Or  {n}",
        streakNote: '🔥 Série {days} jours : +{jetons} jetons',
        weeklyQuest: '{icon} Défi de la semaine : {name}',
        legendQuest: '{icon} Quête légendaire : {name}',
    },
    shop: {
        tabPlus: 'FC+',
        plusSub: 'Jetons et abonnement',
        plusCta: 'S\'abonner',
        shortTitle: 'Pas assez de jetons',
        shortBody: 'Il te manque {n} jetons pour « {name} ».',
        shortCta: 'Obtenir des jetons',
        shortLater: 'Plus tard',
        plusPerkAds: '🚫 Aucune bannière publicitaire',
        plusPerkJetons: '🪙 Jetons de carrière ×2',
        plusPerkPerk: '🧩 +1 emplacement de perk',
        plusPerkCosmetic: '💎 Cadre et thème exclusifs',
        plusActive: '✓ Tu es abonné à Destiny FC+',
        plusManage: 'Gérer mon abonnement',
        plusAnnual: '{price} / an',
        plusMonthly: '{price} / mois',
        plusWelcome: 'Bienvenue dans Destiny FC+ !',
        plusLegal: 'Abonnement renouvelé automatiquement au même prix, sauf résiliation au moins 24 h avant la fin de la période. Paiement débité sur ton compte Apple ; gère ou résilie à tout moment dans les réglages de ton identifiant Apple.',
        terms: 'Conditions d\'utilisation',
        privacy: 'Confidentialité',
        packsTitle: 'Packs de jetons',
        packName: '{n} jetons',
        restore: 'Restaurer les achats',
        restoreOk: 'Abonnement restauré !',
        restoreNone: 'Aucun abonnement actif trouvé.',
        iapFailed: 'Achat impossible pour le moment. Réessaie plus tard.',
        iapUnavailable: 'Les achats ne sont pas disponibles sur cet appareil.',
        iapLoading: 'Chargement des offres…',
        adTitle: 'Jetons gratuits',
        adBody: 'Regarde une courte vidéo : +{n} 🪙. Encore {left} aujourd\'hui.',
        adCta: 'Regarder',
        adLoading: 'Chargement de la vidéo…',
        adUnavailable: 'Aucune vidéo disponible pour le moment.',
        adDone: 'Plus de vidéos aujourd\'hui. Reviens demain !',
        adThanks: '+{n} 🪙 ajoutés !',
        title: 'Boutique',
        balance: '{n} jetons',
        intro: 'Gagnez des jetons en accomplissant des quêtes. Avantages, jokers, et maintenant des cadres de fiche et des thèmes — pour que la boutique serve aussi à se faire plaisir. Équipez jusqu\'à {slots} avantages. Le duel les ignore.',
        jokers: 'Jokers de série : {n}/{cap} — un jour manqué, série sauvée.',
        frames: 'Cadres de fiche',
        themes: 'Thèmes',
        consumables: 'Consommables',
        upgrades: 'Améliorations',
        perks: 'Avantages · {equipped}/{slots} équipés',
        itemLine: '{icon} {name} · {cost} jetons',
        reserveFull: 'Réserve pleine',
        tabPerks: 'Avantages',
        tabCosmetics: 'Cosmétiques',
        tabMisc: 'Divers',
        perksSub: 'Équipés {equipped}/{slots}',
        cosmeticsSub: 'Personnalisez votre fiche',
        equipped: 'Équipé',
        rarity_common: 'Commun',
        rarity_rare: 'Rare',
        rarity_epic: 'Épique',
        rarity_legendary: 'Légendaire',
        rarity_limited: 'Édition limitée',
    },
    badges: {
        title: 'Badges',
        subtitle: 'Vos exploits à travers toutes vos carrières. {n}/{total}',
        unlockedWith: 'Débloqué avec {name} ({flag} {position}, carrière {years})',
    },
    pantheon: {
        title: 'Panthéon',
        subtitle: 'Les légendes que vous avez écrites.',
        empty: "Aucune légende pour l'instant. Terminez une carrière.",
        line: '{nick}{title} · score {score} · {money} M€',
        seeCard: 'Voir la fiche',
    },
    quests: {
        title: 'Quêtes',
        subtitle: 'Série : {streak}j (record {best}) · {total} accomplies · 🪙 {jetons}',
        today: "Aujourd'hui",
        week: 'Semaine',
        legend: 'Légende',
        line: '{icon} {name} — {desc} ({pts}🪙) {done}',
    },
    story: {
        title: 'Légendes',
        subtitle: "Revivez une carrière de légende, et essayez de faire mieux qu'elle.",
        baseline: 'Score de la légende : {n}',
        yourBest: ' · votre meilleur : {n}',
        attempts: ' · {n} tentative',
        attemptsPlural: ' · {n} tentatives',
        cost: '{n} jetons pour débloquer',
        notEnough: 'Pas assez de jetons',
        replay: 'Revivre cette histoire',
        unlock: 'Débloquer · {n} jetons',
        missing: 'Légende introuvable.',
        incomplete: 'Cette histoire est incomplète.',
        comingTitle: 'De nouvelles légendes arrivent',
        comingBody: 'Le mode Légendes fait peau neuve. Des carrières inédites à revivre seront ajoutées très bientôt.',
        nextBadge: 'Prochaine légende',
        nextIn: 'Disponible dans {n} jours',
        nextTomorrow: 'Disponible demain',
        freeToday: 'Gratuite aujourd\'hui',
        newBadge: 'Nouveau',
        playFree: 'Jouer gratuitement',
    },
    duel: {
        title: 'Amis & défis',
        subtitle: 'Même départ, mêmes dés, à vos choix près. Les avantages de la boutique sont ignorés. Le meilleur score gagne.',
        joinTitle: 'Joue contre tes amis',
        joinBody: "Choisis le pseudo que tes amis verront. Pas de compte, pas d'e-mail.",
        namePlaceholder: 'Ton pseudo',
        joinCta: 'Commencer',
        myCode: 'Mon code ami',
        myCodeHint: 'Donne ce code à tes amis pour qu’ils t’ajoutent.',
        shareCode: 'Partager mon code',
        shareMessage: 'Ajoute-moi en ami sur {app} et défie-moi ! Mon code : {code}',
        addTitle: 'Ajouter un ami',
        addPlaceholder: 'Code ami (ex. K7M2-QX9P)',
        addCta: 'Ajouter',
        requestSent: 'Demande envoyée.',
        toPlay: 'Défis à relever',
        challengedBy: '{name} te défie',
        toBeat: 'Score à battre : {score}',
        play: 'Relever',
        decline: 'Refuser',
        requests: "Demandes d'ami",
        accept: 'Accepter',
        pendingOut: 'Demande envoyée',
        cancel: 'Annuler',
        friends: 'Mes amis ({n})',
        noFriends: "Pas encore d'amis. Partage ton code ou entre celui d'un ami.",
        record: '{w}V · {d}N · {l}D',
        challenge: 'Défier',
        removeTitle: 'Retirer {name} ?',
        removeBody: 'Les défis en cours avec ce joueur seront annulés.',
        remove: 'Retirer',
        waiting: 'En attente de réponse',
        waitingLine: '{name} · ton score {score}',
        results: 'Derniers résultats',
        resultWin: 'Victoire contre {name} · {you} – {them}',
        resultLose: 'Défaite contre {name} · {you} – {them}',
        resultDraw: 'Égalité avec {name} · {you} – {them}',
        resultDeclined: 'Défi refusé · {name}',
        queued: 'Envoi en attente du réseau ({n})',
        offline: 'Hors ligne : affichage de la dernière synchronisation.',
        careerWarnTitle: 'Carrière en cours',
        careerWarnBody: 'Lancer un défi remplace ta carrière en cours. Continuer ?',
        careerWarnOk: 'Continuer',
        deleteAccount: 'Supprimer mes données Amis',
        deleteTitle: 'Supprimer tes données ?',
        deleteBody: 'Ton code ami, tes amis et tes défis seront effacés du serveur.',
        delete: 'Supprimer',
    },
    social: {
        err: {
            badName: 'Pseudo invalide : 3 à 16 lettres, chiffres, espaces, _ ou -.',
            badCode: 'Code invalide. Il fait 8 caractères, comme K7M2-QX9P.',
            self: "C'est ton propre code.",
            notFound: 'Aucun joueur avec ce code.',
            already: 'Vous êtes déjà amis.',
            pending: 'Demande déjà envoyée.',
            tooMany: "Limite d'amis ou de demandes atteinte.",
            tooManyDuels: 'Trop de défis en attente avec cet ami.',
            notFriend: "Ce joueur n'est plus dans tes amis.",
            rate: 'Trop de requêtes. Réessaie dans un instant.',
            unavailable: 'Service indisponible. Réessaie plus tard.',
            network: 'Pas de connexion.',
            version: 'Ce défi vient d’une autre version du jeu. Mets l’app à jour.',
        },
    },
    leaderboard: {
        title: 'Classement',
        subtitle: 'Prochaine remise à zéro dans {when}',
        pickNick: 'Choisis ton pseudo',
        pickBody: 'Choisis un pseudo pour voir et apparaître dans le classement hebdomadaire.',
        placeholder: 'Ton pseudo',
        nickA11y: 'Pseudo',
        joining: 'Inscription…',
        join: 'Valider',
        refreshing: 'Actualisation…',
        refresh: 'Actualiser',
        empty: "Personne n'a encore publié cette semaine. Termine une carrière pour apparaître.",
        you: '  ·  toi',
        yourPlace: 'Ta place',
        waitingScore: "Ton meilleur score de la semaine apparaîtra ici dès que tu auras terminé une carrière.",
        week: 'Semaine {n}',
        monday: 'lundi',
        inDays: '{n} jour',
        inDaysMany: '{n} jours',
        inHours: '{n} h',
        inMin: '{n} min',
        nickMin: 'Au moins 3 caractères.',
        nickMax: '16 caractères maximum.',
        nickChars: 'Lettres, chiffres, espaces, _ et - uniquement.',
        nickBlocked: "Ce pseudo n'est pas autorisé.",
        network: 'Classement indisponible. Vérifie ta connexion.',
        unavailable: "Le classement n'est pas joignable pour le moment.",
        offlineTitle: 'Pas de connexion',
        offlineBody: "Le jeu se joue hors ligne. Le classement, lui, a besoin d'internet pour s'afficher. Réessaie avec Actualiser dès que tu es en ligne.",
        unavailableTitle: 'Classement indisponible',
        unavailableBody: "Ce n'est pas ta connexion : le classement ne répond pas pour le moment. Réessaie avec Actualiser.",
        offlineLocal: 'Ton meilleur score de la semaine est déjà enregistré ici : {score}. Il partira dès que tu seras connecté.',
        offlineStale: 'Classement inaccessible. Voici le dernier tableau chargé sur cet appareil.',
        needNick: 'Choisis un pseudo pour rejoindre le classement.',
        badScore: 'Score invalide.',
        renameFail: 'Impossible de mettre à jour le pseudo.',
        sheetRank: 'Rang',
        sheetWeek: 'Score semaine',
        sheetCareers: 'Carrières',
        sheetBest: 'Meilleur score',
        sheetBadges: 'Badges',
        sheetStreak: 'Série record',
        sheetAdd: 'Ajouter en ami',
        sheetSent: 'Demande envoyée ✓',
        sheetAccept: 'Accepter sa demande',
        sheetFriends: 'Vous êtes amis',
        sheetChallenge: 'Défier',
        sheetRecord: 'Vos duels : {w}V · {d}N · {l}D',
        sheetNoSocial: "Ce joueur n'a pas encore activé les amis.",
        sheetLoading: 'Chargement de la fiche…',
        sheetFrame: 'Cadre',
        sheetTheme: 'Thème',
    },
    settings: {
        appIcon: "Icône de l'app",
        appIconBody: "Assortissez l'icône à l'un de vos thèmes.",
        appIconLocked: "Achetez un thème dans la boutique pour débloquer son icône.",
        appIconDefault: 'Icône par défaut',
        adsPrivacy: 'Publicités',
        adsPrivacyBody: 'Modifie tes choix de consentement pour les publicités.',
        adsPrivacyCta: 'Gérer mes choix',
        title: 'Paramètres',
        subtitle: 'Langue du jeu et pseudo du classement. Aucun compte.',
        language: 'Langue',
        languageBody: "Par défaut, celle de l'appareil. Tu peux la changer ici.",
        nick: 'Pseudo',
        nickEdit: "Il s'affiche sur le classement de la semaine. Tu peux le changer ici.",
        nickJoin: 'Choisis-en un pour rejoindre le classement. Ensuite, ton meilleur score de carrière de la semaine y est publié automatiquement.',
        saving: 'Enregistrement…',
        saved: 'Pseudo enregistré.',
        savedOffline: 'Pseudo enregistré sur cet appareil. Le classement se mettra à jour dès que tu auras internet.',
        notifTitle: 'Notifications',
        notifBody: "Au plus une par jour, vers l'heure où tu joues d'habitude.",
        notifEnable: 'Activer les notifications',
        notifDenied: 'Elles sont coupées dans les réglages du téléphone.',
        notifOpenSettings: 'Ouvrir les réglages',
        notifLegends: 'Nouvelle Légende (chaque mercredi)',
        notifStreak: 'Série de quêtes en danger',
        notifReminders: 'Rappels de carrière et défi de la semaine',
        animTitle: 'Animations en jeu',
        animBody: 'Les cinématiques des transferts et des moments clés. Désactivées, le jeu passe directement au résultat.',
        animToggle: 'Jouer les animations',
    },
    notif: {
        channel: 'Rappels',
        socialChannel: 'Amis et défis',
        legendTitle: '{icon} Nouvelle Légende : {alias}',
        legendBody1: "Gratuite aujourd'hui seulement. Feras-tu mieux que l'original ?",
        legendBody2: "Elle sort aujourd'hui, gratuite jusqu'à minuit. Réécris son histoire.",
        streakTitle: '🔥 Ta série de {days} jours est en danger',
        streakBody1: "Termine une quête aujourd'hui pour la garder.",
        streakBody2: 'Une carrière suffit pour prolonger ta série.',
        careerTitle: "{name} t'attend",
        careerBody1: "{age} ans, saison en cours. Reprends ta carrière là où elle s'est arrêtée.",
        careerBody2: 'Le vestiaire attend ton retour. La saison ne va pas se jouer toute seule.',
        weeklyTitle: '🗓️ Nouveau défi de la semaine',
        weeklyBody: '{icon} {name} · {pts} jetons à gagner.',
        comebackTitle: "⚽ Un nouveau destin t'attend",
        comebackBody1: 'Une carrière commence à 16 ans. Celle-ci sera peut-être la bonne.',
        comebackBody2: 'Nouvelle semaine, nouvelles quêtes. Le terrain te manque ?',
        promptTitle: 'On te prévient ?',
        promptBody: 'Une nouvelle Légende sort chaque mercredi, et ta série de quêtes peut se perdre. Une notification par jour au maximum.',
        promptYes: 'Oui, préviens-moi',
        promptLater: 'Plus tard',
    },
    howto: {
        title: 'Comment jouer',
        subtitle: 'Bienvenue dans {app} — le guide en bref.',
        tip: 'Astuce : lancez « Écrire sa légende » depuis l\'accueil, suivez les événements, et revenez écrire votre légende.',
    },
    about: {
        title: 'À propos',
        version: 'Version {v}',
        transparency: "Jeu jouable hors ligne, sans compte ni e-mail. Internet sert seulement à transférer ta progression vers un autre téléphone, au classement et à l'onglet Amis (ton pseudo, ton code ami et tes scores de défi).",
        send: 'Envoyer ma progression',
        sendBody: "Créez un code à 8 caractères. Saisissez-le dans À propos sur l'autre téléphone. Ça copie jetons, badges, panthéon et la carrière en cours — cet appareil n'est pas vidé.",
        creating: 'Création…',
        create: 'Créer un code',
        sendCode: 'Envoyer le code',
        validHours: 'Valable {hours} h, un seul usage.',
        shareMsg: "Mon code Destiny FC : {code}\nÀ saisir dans À propos → Récupérer. Valable {hours} h, un seul usage.",
        redeem: 'Récupérer',
        redeemWarn: "Ça remplace jetons, badges, panthéon et la carrière en cours sur CET appareil. L'autre téléphone n'est pas modifié.",
        redeeming: 'Récupération…',
        replace: 'Remplacer',
        redeemBody: "Collez ou tapez le code reçu (ex. A7K3-M2XP). Un code ne sert qu'une fois.",
        gotIt: 'Progression récupérée. Jetons, badges, panthéon et carrière en cours sont à jour.',
        privacy: 'Politique de confidentialité',
        site: 'Site officiel',
    },
    transfer: {
        network: "Pas de connexion. Le jeu se joue hors ligne, mais un transfert a besoin d'internet le temps d'échanger le code.",
        fail: 'Le transfert a échoué. Réessayez dans un instant.',
        badCode: 'Saisissez les 8 caractères du code.',
        tooLarge: 'Sauvegarde trop volumineuse pour un transfert.',
        unknown: 'Code introuvable ou déjà utilisé. Vérifiez les 8 caractères, ou créez-en un nouveau.',
        invalid: "Ce n'est pas une sauvegarde Destiny FC.",
    },
    save: {
        unreadable: "Sauvegarde illisible. Recréez un code depuis l'autre téléphone.",
        invalid: "Ce n'est pas une sauvegarde Destiny FC.",
    },
    review: {
        kicker: 'Un instant',
        title: 'Tu kiffes Destiny FC ?',
        body: "Un avis, même court, aide d'autres joueurs à trouver le jeu — et nous à l'améliorer.",
        yes: 'Oui, trop bien !',
        notReally: 'Pas vraiment',
        dontAsk: 'Ne plus me demander',
        feedbackKicker: 'Retour',
        feedbackTitle: "Qu'est-ce qui cloche ?",
        feedbackBody: "Écris ce qui t'a gêné. On le reçoit directement, sans ouvrir ta boîte mail.",
        placeholder: 'Ton retour…',
        sending: 'Envoi…',
        send: 'Envoyer',
        sendFail: 'Envoi impossible pour le moment. Réessaie.',
        thanksKicker: 'Merci',
        thanksTitle: "C'est envoyé.",
        thanksBody: 'On lit chaque retour.',
    },
    share: {
        careerLine: '{flag} {position} · {club}',
        careerStats: 'Score {score} · note {rating} · {trajectory}',
        careerTotals: '{goals} buts · {assists} passes · {caps} sélections',
        careerPalmares: "Joueur d'Or ×{ballon} · titres ×{league} · Mondial ×{wc}",
        writtenIn: 'Écrit dans {app}',
        ficheHead: 'FICHE · {app} · {tier}',
        ficheIdentity: '{nat} · {position} · {club}',
        ficheTrajectory: 'Trajectoire : {label}',
        ficheRating: 'Note {rating} · score {score} · {seasons} saisons',
        ficheTotals: 'Matchs {matches} · buts {goals} · passes {assists}',
        ficheNat: 'Sélections {caps} · fortune {money}',
        fichePalmares: 'Palmarès : championnats {league} · coupes {cup} · C1 {cl} · Mondial {wc}',
        ficheAwards: "Distinctions : Joueur d'Or {ballon} · Pied d'Or {boot}",
    },
    demo: {
        endTitle: 'La démo s’arrête ici',
        endBody: 'Tu as vécu {n} saisons de ta carrière. Le reste — la retraite, le panthéon — t’attend sur mobile.',
        store: 'Continuer sur l’App Store',
        restart: 'Recommencer la démo',
    },
};
exports.en = {
    common: {
        back: 'Back',
        next: 'Next',
        loading: 'Loading destiny…',
        continue: 'Continue',
        close: 'Close',
        home: 'Home',
        save: 'Save',
        cancel: 'Cancel',
        buy: 'Buy',
        unlock: 'Unlock',
        equip: 'Equip',
        unequip: 'Unequip',
        alreadyOwned: 'Owned',
        jetons: 'tokens',
        yearsOld: '{age} yrs',
    },
    avatar: {
        title: 'My player',
        homeCreate: 'Create your pro',
        homeEdit: 'Edit my pro',
        tabSkin: 'Skin',
        tabHair: 'Hair',
        tabFace: 'Face',
        tabGear: 'Gear',
        tabOutfit: 'Outfit',
        poseFront: 'Front',
        poseBack: 'Back',
        poseCelebrate: 'Joy',
        poseBoo: 'Boo!',
        clubKit: 'Club kit',
        slot_head: 'Head',
        slot_eyes: 'Eyes',
        slot_face: 'Face paint',
        slot_neck: 'Neck',
        hairColor: 'Hair colour',
        brows: 'Eyebrows',
        hairStyle: 'Haircut',
        beard: 'Beard',
        shirtName: 'Me',
        shopGroup: 'Player gear',
        shopDesc: 'For your avatar: shown in the editor and in cutscenes.',
        buyTitle: 'Buy this item?',
        buyBody: '{name} for {cost} tokens.',
        notEnough: 'You need {cost} tokens for this item.',
        packs: 'Bundles',
        pack: {
            pack_starter: 'First contract',
            pack_halloween: 'Vampire night',
        },
        packBuyTitle: 'Buy this bundle?',
        packBuyBody: '{name}: {count} items for {cost} tokens.',
        packDaysLeft: '{n} days left',
        packLastDay: 'Last day',
        packsSub: 'For your player, at a discount',
        gear: {
            g_round_glasses: 'Round glasses',
            g_chain: 'Gold chain',
            hw_witch_hat: 'Witch hat',
            hw_pumpkin_head: 'Pumpkin head',
            hw_horns: 'Devil horns',
            hw_wolf_ears: 'Werewolf ears',
            hw_cat_beanie: 'Black cat beanie',
            hw_bandit_mask: 'Bandit mask',
            hw_pumpkin_glasses: 'Pumpkin glasses',
            hw_eye_patch: 'Pirate eye patch',
            hw_glow_eyes: 'Glowing eyes',
            hw_skull_paint: 'Skull face paint',
            hw_stitches: 'Stitches',
            hw_pumpkin_paint: 'Pumpkin face paint',
            hw_bat_scarf: 'Bat scarf',
            hw_vampire_collar: 'Vampire collar',
            hw_bone_chain: 'Bone chain',
            hw_bandages: 'Mummy bandages',
            hw_kit: 'Halloween kit',
            hw_skeleton: 'Skeleton costume',
            hw_mummy: 'Mummy costume',
            hw_vampire: 'Vampire costume',
            hair_spiky: 'Spiky hair',
            hair_bun: 'Man bun',
            hair_ponytail: 'Ponytail',
            hair_mohawk: 'Mohawk',
            hair_dreads: 'Dreadlocks',
            hair_braids: 'Braids',
            beard_circle: 'Circle beard',
            beard_chinstrap: 'Chinstrap',
            beard_full: 'Full beard',
            beard_long: 'Long beard',
            hair_side: 'Side fringe',
            hair_curtains: 'Middle part',
            hair_bald: 'Bald',
            hair_afro: 'Afro',
            hair_long: 'Medium length',
            hair_cornrows: 'Cornrows',
            beard_goatee: 'Goatee',
            brows_thick: 'Thick eyebrows',
        },
    },
    cinematic: {
        official: 'Official',
        from: 'Leaving',
        transfer: 'Transfer',
        loan: 'Loan',
        fee: 'Transfer fee',
        loanSeason: 'Season-long loan',
        free: 'Free transfer',
        penalty: 'Penalty',
        goal: 'Goal!',
        saved: 'Saved',
        post: 'Off the post!',
        bar: 'Off the bar!',
        wide: 'Wide!',
        save: 'Saved!',
        conceded: 'Goal conceded',
        longshot: 'From distance',
        freekick: 'Free kick',
        over: 'Over the bar!',
        wall: 'Off the wall',
        oneOnOne: 'One on one',
        keeper: 'Last line of defence',
        dribble: 'On the ball',
        pass: 'The pass',
        assist: 'Assist!',
        tackled: 'Tackled',
        intercepted: 'Intercepted',
        duel: 'The duel',
        foulWord: 'The foul',
        headerWord: 'In the air',
        crowdWord: 'The crowd',
        manageWord: 'Managing the game',
        refWord: 'The referee',
        won: 'Ball won!',
        beaten: 'Beaten',
        cleared: 'Cleared!',
        stopped: 'Attack stopped',
        sentOff: 'Sent off',
        foulWon: 'Foul won!',
        noFoul: 'No foul',
        rallied: 'The stadium erupts!',
        whistled: 'Booed',
        managed: 'Game managed',
        lost: 'Ball lost',
        fairplay: 'Respect!',
        booked: 'Booked',
        skip: 'Tap to skip',
    },
    brand: {
        taglineShort: 'Every decision forges your legend.',
    },
    home: {
        career: 'Career',
        resumeTitle: 'Resume · {name}',
        writeLegend: 'Write your legend',
        resumeBody: '{age} years old, season in progress',
        careerBody: 'From 16 to retirement: form, mind and play identity — every choice counts.',
        daily: 'Daily Rendezvous',
        dailyBest: "Today's best: {score}",
        dailyFresh: 'Same seed for everyone. Not attempted yet.',
        story: 'Legends',
        storyTitle: 'Legends to rewrite',
        storyBody: 'A new legend every Wednesday. Beat it.',
        friends: 'Friends',
        friendsTitle: 'Challenge friends',
        friendsBody: 'Same start, same dice. Highest score wins.',
        shop: 'Shop ({jetons})',
        badges: 'Badges ({n}/{total})',
        pantheon: 'Hall of Fame ({n})',
        leaderboard: 'Leaderboard',
        quests: 'Quests',
        settings: 'Settings',
        howto: 'How to play',
        about: 'About',
        dailyQuests: "Today's quests",
        questLine: '{icon} {name} · {pts} tokens {done}',
        weekLine: '{icon} Week: {name} {done}',
        legendLine: '{icon} Legend: {name} {done}',
        seeQuests: 'See quests',
        meta: '{careers} careers · best score {best} · streak {streak}d · jokers {jokers}/{cap}',
        navShop: 'Shop',
        navBadges: 'Badges',
        navPantheon: 'Hall of Fame',
        navLeaderboard: 'Ranking',
        navSettings: 'Settings',
        questsStrip: 'Daily quests',
        statsLine: '{careers} careers · best {best}',
        copyright: '© {year} {app}',
    },
    setup: {
        nationalityTitle: 'Your nationality',
        nationalitySub: 'The country that will watch you grow on the pitch.',
        positionTitle: 'Your position',
        positionSub: 'It will shape your stats, your events and your legend.',
        originTitle: 'Your origin',
        originSub: 'Where do you come from, before the floodlights?',
        lifestyleTitle: 'Your teenage years',
        lifestyleSub: 'The lifestyle that will forge your discipline… and your reputation.',
        entourageTitle: 'Your inner circle',
        entourageSub: 'Who looks after your interests before your first contract?',
        academyTitle: 'Clubs have spotted you',
        academySub: 'Scouts have been watching your profile.',
        builderTitle: 'Create your player',
        builderSub: 'Shape his identity, in any order you like.',
        fNationality: 'Nationality',
        fPosition: 'Position',
        fOrigin: 'Origin',
        fLifestyle: 'Lifestyle',
        fEntourage: 'Inner circle',
        pickField: 'Choose',
        previewName: 'New player',
        nameHint: 'Leave blank to auto-generate',
        chooseClub: 'Choose my club',
        talent: 'Talent',
        cRep: 'Rep',
        cDis: 'Disc',
        cForm: 'Form',
        cMor: 'Morale',
        random: 'Randomise all',
        randomA11y: 'Randomise all, {cost} tokens',
        pot: 'Estimated potential: {stars}',
        notEnoughJetons: 'Not enough tokens ({cost} 🪙).',
    },
    game: {
        form: 'Form',
        morale: 'Morale',
        loan: 'Loan',
        stats: 'Stats',
        palmares: 'Honours',
        awards: 'Awards',
        path: 'Path',
        retire: '⏳ Hang up the boots',
        technique: 'Technique',
        physical: 'Physical',
        mental: 'Mental',
        charisma: 'Charisma',
        reputation: 'Reputation',
        discipline: 'Discipline',
        coachBond: 'Coach bond',
        dressingRoom: 'Dressing room',
        confidence: 'Confidence',
        pressure: 'Pressure',
        resilience: 'Resilience',
        training: 'Training',
        relationships: 'Relationships',
        mentor: 'Mentor',
        teammate: 'Teammate',
        seasonContext: 'This season',
        contexts: {
            debut: 'Big debut',
            new_coach: 'New coach',
            post_injury: 'Injury comeback',
            pressure_cooker: 'Under pressure',
            redemption: 'Redemption season',
            contract_year: 'Contract year',
            veteran: 'Twilight',
            breakthrough: 'Breakthrough',
            confirmation: 'Confirmation',
            routine: 'Regular season',
        },
        potential: 'Potential: {stars}',
        contract: 'Contract: {salary}/yr',
        contractYears: ' · {years} year(s) left',
        style: 'Style: {icon} {name}',
        careerLine: 'Career: {matches} games · {goals} goals · {assists} assists · {caps} caps · peak {peak}',
        leagues: '🎖️ League titles: {n}',
        nationalCups: '🏵️ Domestic cups: {n}',
        europeCups: '🥇 European cups: {n}',
        worlds: '🏆 World Cups: {n}',
        championOf: '· Champion of {country} · {level}',
        ballon: '⭐ Golden Player: {n}',
        goldenBoot: '👟 Golden Boot: {n}',
        awardsCount: '🏅 Awards: {n}',
        traits: 'Traits: {list}',
        noAwards: 'No standout individual award yet.',
        formedAt: 'Youth club: {club}',
        seasonLine: '{year} · {club} ({level}) · rating {rating}',
        idle: 'Preparing the season…',
        yearsAt: '{age} yrs',
        slotMid: '⏸ Winter break',
        slotLate: '🏁 Final stretch',
        stripMatches: '{n} apps',
        stripGoals: '⚽ {n}',
        stripAssists: '🅰️ {n}',
        stripCs: '🧤 {n}',
        stripRating: 'rating {r}',
        standRace: 'In the race',
        standDanger: 'Danger zone',
        standMid: 'Mid-table',
        transfer: '✈️ TRANSFER',
        loanWindow: '🔄 LOAN',
        loanBody: 'Several clubs guarantee minutes. Your parent club keeps the contract.',
        transferBody: 'Offers are in. Choose your fate… or stay.',
        salaryYear: '{salary}/yr',
        stayRefuse: 'STAY / DECLINE',
        stayRenew: 'STAY / RENEW',
        continue: 'CONTINUE',
        decisiveMoment: '🎯 DECISIVE MOMENT',
        tournamentIntro: '{flag} The world holds its breath: {nat} enter the competition, and you are on the plane.',
        liveTournament: 'PLAY THE TOURNAMENT',
        simTournament: 'SIMULATE THE TOURNAMENT',
        vs: 'vs {name}',
        strength: 'Strength {stars} · chances ~{pct}%',
        playMatch: 'PLAY THE MATCH',
        simRest: 'SIMULATE THE REST',
        tournamentMoment: '⚡ TOURNAMENT MOMENT',
        dilemma: 'DILEMMA',
        season: '📊 Season {from}-{to} · {club}',
        onLoan: ' (loan)',
        matches: 'Games',
        goals: 'Goals',
        assists: 'Assists',
        rating: 'Rating',
        cleanSheets: 'Clean sheets',
        championship: 'League: ',
        champTitle: '🥇 {level} champions!',
        champGeneric: '🥇 Champions!',
        promoted: '{pos} — 🚀 promoted via play-offs!',
        playoffLost: '{pos} — play-off lost',
        relegated: '{pos} — 📉 RELEGATED',
        natCaps: '{n} cap(s)',
        natNoCaps: 'no caps this season',
        natLine: '{flag} {icon} {role}{number} — {caps}',
        natNumber: ' · No. {n}',
        ballonRank: '⭐ Golden Player ranking: {rank}',
        objectiveMet: '✅ Club objective: {label}',
        objectiveMiss: '❌ Club objective: {label}',
        objectiveBonus: ' (bonus +{money})',
        benched: '⚠️ Starved of minutes: your morale takes a hit.',
        injury: '🩹 {weeks} weeks in the treatment room this season.',
        income: '💰 +{money} (wages & sponsors)',
        window: '🪟 TRANSFER WINDOW · {age} yrs',
        windowFallback: 'The window is open. Offers, or a new deal?',
        group: 'Group',
        internalMove: ' · internal move',
        fee: ' · fee {money}',
        yourRival: 'your great rival',
        groupMove: '{group} offers an internal move to {club}.',
    },
    offseason: {
        title: '🎯 PRE-SEASON · AGE {age}',
        body: 'Energy to spend: {n} point(s)',
        flavor_debut: 'Your first real preparation choices. At this age, everything is still to be shaped.',
        flavor_momentum: 'Riding the wave of a big season: time to build on it.',
        flavor_recovery: 'After a season disrupted by injuries, the focus is on rebuilding.',
        flavor_veteran: 'Late in the journey, every detail counts to last a little longer.',
        flavor_tough: 'After a rough season, it’s time to lift your head and bounce back.',
        flavor_standard_0: 'A new off-season: where to focus your efforts this year?',
        flavor_standard_1: 'The calendar restarts soon. Time to lay the groundwork.',
        flavor_standard_2: 'A new season is taking shape: what target will you set?',
        flavor_standard_3: 'Preparation time: sharpen your strengths, or fix your gaps?',
        train: 'Training',
        trainHint: 'Improve your facets.',
        media: 'Media',
        mediaHint: 'Gain reputation… but also pressure.',
        recovery: 'Recovery',
        recoveryHint: 'Top up your fitness and resilience.',
        relations: 'Relationships',
        relationsHint: 'Strengthen coach, dressing room, mentor and teammate.',
        confirm: 'Start the season',
    },
    final: {
        premiumBonus: '💎 Destiny FC+: career tokens ×2 (+{n} 🪙)',
        adDouble: '🎬 Double my tokens (+{n} 🪙)',
        adDoubled: 'Tokens doubled: +{n} 🪙!',
        card: 'CARD · {tier}',
        retired: 'Retired',
        portraitOf: 'Portrait of {name}',
        seasons: '{n} seasons',
        formedAt: 'Came through at {club}',
        score: 'Score {score}',
        trajectory: 'Path · {label}',
        signature: 'Signature · {icon} {name}',
        stats: 'Stats',
        palmares: 'Honours',
        awards: 'Awards',
        matches: 'Games',
        goals: 'Goals',
        assists: 'Assists',
        cleanSheets: 'Clean sheets',
        caps: 'Caps',
        natGoals: 'Intl goals',
        seasonsLbl: 'Seasons',
        fortune: 'Fortune',
        peak: 'Peak',
        resilience: 'Resilience',
        leagues: 'League titles {n}',
        cups: 'Cups {n}',
        cl: 'UCL {n}',
        worldCup: 'World Cup {n}',
        ballon: 'Golden Player {n}',
        goldenBoot: 'Golden Boot {n}',
        indiv: 'Individual {n}',
        championOf: 'Champion of {country} · {level}',
        induction: 'Hall of Fame speech',
        storyMode: 'Legends · {alias}',
        storyCompare: 'You {you} — legend {legend}',
        storyBetter: ' · you did better',
        storyNew: ' · new',
        storyMemories: 'Memories lived',
        duel: 'Duel',
        duelWin: 'You {you} — challenge {target} · you win',
        duelDraw: 'You {you} — challenge {target} · draw',
        duelLose: 'You {you} — challenge {target} · they still lead',
        duelFrom: "{name}'s challenge",
        duelSendTitle: 'Challenge a friend with this fate',
        duelSendHint: 'Your friend replays the same career, choices aside. Score to beat: {score}.',
        duelSent: 'Sent ✓',
        duelNoFriends: 'Add friends in the Friends tab to send them this challenge.',
        whatIf: 'What if… {text}',
        hideSeasons: 'Hide seasons',
        showSeasons: 'See the career season by season',
        seasonLine: '{year} · {club} ({level}){apps} {goals}g {assists}a · rating {rating}{pos}{trophies}',
        apps: ' · {n} apps',
        archiveSeasons: '{n} seasons played. Season-by-season detail was not kept for this older career.',
        faceOff: 'Head to head',
        faceLine: 'You {you} — {name} {them}',
        badges: 'Badges: {list}',
        jetons: '+{n} tokens',
        daily: 'Daily Rendezvous: {score}',
        todayBest: " · today's record",
        allTimeBest: ' · all-time record',
        share: 'Share',
        fiche: 'My card',
        challengeFriend: 'Challenge a friend',
        backPantheon: 'Back to Hall of Fame',
        replay: 'Play another career',
        shareCancelled: 'Share cancelled.',
        ficheSaved: 'Card saved as PNG.',
        pngTag: 'CARD · {tier}',
        pngRetired: 'Retired · score {score}',
        pngTrajectory: 'Path · {label}',
        pngStats: 'STATS',
        pngPalmares: 'HONOURS',
        pngMatches: 'Games  {n}',
        pngGoals: 'Goals  {n}',
        pngAssists: 'Assists  {n}',
        pngCaps: 'Caps  {n}',
        pngLeagues: 'Leagues  {n}',
        pngCups: 'Cups  {n}',
        pngCl: 'UCL  {n}',
        pngWorld: 'World Cup  {n}',
        pngBallon: 'Golden Player  {n}',
        pngBoot: 'Golden Boot  {n}',
        streakNote: '🔥 {days}-day streak: +{jetons} tokens',
        weeklyQuest: '{icon} Weekly challenge: {name}',
        legendQuest: '{icon} Legendary quest: {name}',
    },
    shop: {
        tabPlus: 'FC+',
        plusSub: 'Tokens and subscription',
        plusCta: 'Subscribe',
        shortTitle: 'Not enough tokens',
        shortBody: 'You need {n} more tokens for “{name}”.',
        shortCta: 'Get tokens',
        shortLater: 'Later',
        plusPerkAds: '🚫 No more banner ads',
        plusPerkJetons: '🪙 Career tokens ×2',
        plusPerkPerk: '🧩 +1 perk slot',
        plusPerkCosmetic: '💎 Exclusive frame and theme',
        plusActive: '✓ You\'re a Destiny FC+ member',
        plusManage: 'Manage subscription',
        plusAnnual: '{price} / year',
        plusMonthly: '{price} / month',
        plusWelcome: 'Welcome to Destiny FC+!',
        plusLegal: 'Auto-renews at the same price unless cancelled at least 24 hours before the end of the period. Payment is charged to your Apple account; manage or cancel anytime in your Apple ID settings.',
        terms: 'Terms of Use',
        privacy: 'Privacy',
        packsTitle: 'Token packs',
        packName: '{n} tokens',
        restore: 'Restore purchases',
        restoreOk: 'Subscription restored!',
        restoreNone: 'No active subscription found.',
        iapFailed: 'Purchase unavailable right now. Try again later.',
        iapUnavailable: 'Purchases aren\'t available on this device.',
        iapLoading: 'Loading offers…',
        adTitle: 'Free tokens',
        adBody: 'Watch a short video: +{n} 🪙. {left} left today.',
        adCta: 'Watch',
        adLoading: 'Loading video…',
        adUnavailable: 'No video available right now.',
        adDone: 'No more videos today. Come back tomorrow!',
        adThanks: '+{n} 🪙 added!',
        title: 'Shop',
        balance: '{n} tokens',
        intro: 'Earn tokens by completing quests. Perks, jokers, and now card frames and themes — so the shop is also for fun. Equip up to {slots} perks. Duels ignore them.',
        jokers: 'Streak jokers: {n}/{cap} — miss a day, save the streak.',
        frames: 'Card frames',
        themes: 'Themes',
        consumables: 'Consumables',
        upgrades: 'Upgrades',
        perks: 'Perks · {equipped}/{slots} equipped',
        itemLine: '{icon} {name} · {cost} tokens',
        reserveFull: 'Reserve full',
        tabPerks: 'Perks',
        tabCosmetics: 'Cosmetics',
        tabMisc: 'Misc',
        perksSub: 'Equipped {equipped}/{slots}',
        cosmeticsSub: 'Customise your card',
        equipped: 'Equipped',
        rarity_common: 'Common',
        rarity_rare: 'Rare',
        rarity_epic: 'Epic',
        rarity_legendary: 'Legendary',
        rarity_limited: 'Limited edition',
    },
    badges: {
        title: 'Badges',
        subtitle: 'Your feats across every career. {n}/{total}',
        unlockedWith: 'Unlocked with {name} ({flag} {position}, career {years})',
    },
    pantheon: {
        title: 'Hall of Fame',
        subtitle: 'The legends you have written.',
        empty: 'No legends yet. Finish a career.',
        line: '{nick}{title} · score {score} · {money} M€',
        seeCard: 'See the card',
    },
    story: {
        title: 'Legends',
        subtitle: 'Relive a legendary career, and try to do better.',
        baseline: "Legend's score: {n}",
        yourBest: ' · your best: {n}',
        attempts: ' · {n} attempt',
        attemptsPlural: ' · {n} attempts',
        cost: '{n} tokens to unlock',
        notEnough: 'Not enough tokens',
        replay: 'Relive this story',
        unlock: 'Unlock · {n} tokens',
        missing: 'Story not found.',
        incomplete: 'This story is incomplete.',
        comingTitle: 'New legends incoming',
        comingBody: 'Legends is being reworked. Brand-new careers to relive will be added very soon.',
        nextBadge: 'Next legend',
        nextIn: 'Available in {n} days',
        nextTomorrow: 'Available tomorrow',
        freeToday: 'Free today',
        newBadge: 'New',
        playFree: 'Play for free',
    },
    duel: {
        title: 'Friends & challenges',
        subtitle: 'Same start, same dice, choices aside. Shop perks are ignored. Highest score wins.',
        joinTitle: 'Play against your friends',
        joinBody: 'Pick the nickname your friends will see. No account, no email.',
        namePlaceholder: 'Your nickname',
        joinCta: 'Get started',
        myCode: 'My friend code',
        myCodeHint: 'Give this code to your friends so they can add you.',
        shareCode: 'Share my code',
        shareMessage: 'Add me on {app} and challenge me! My code: {code}',
        addTitle: 'Add a friend',
        addPlaceholder: 'Friend code (e.g. K7M2-QX9P)',
        addCta: 'Add',
        requestSent: 'Request sent.',
        toPlay: 'Challenges to take',
        challengedBy: '{name} challenges you',
        toBeat: 'Score to beat: {score}',
        play: 'Play',
        decline: 'Decline',
        requests: 'Friend requests',
        accept: 'Accept',
        pendingOut: 'Request sent',
        cancel: 'Cancel',
        friends: 'My friends ({n})',
        noFriends: "No friends yet. Share your code or enter a friend's.",
        record: '{w}W · {d}D · {l}L',
        challenge: 'Challenge',
        removeTitle: 'Remove {name}?',
        removeBody: 'Open challenges with this player will be cancelled.',
        remove: 'Remove',
        waiting: 'Waiting for a reply',
        waitingLine: '{name} · your score {score}',
        results: 'Latest results',
        resultWin: 'Win vs {name} · {you} – {them}',
        resultLose: 'Loss vs {name} · {you} – {them}',
        resultDraw: 'Draw with {name} · {you} – {them}',
        resultDeclined: 'Challenge declined · {name}',
        queued: 'Waiting for network to send ({n})',
        offline: 'Offline: showing the last sync.',
        careerWarnTitle: 'Career in progress',
        careerWarnBody: 'Starting a challenge replaces your current career. Continue?',
        careerWarnOk: 'Continue',
        deleteAccount: 'Delete my Friends data',
        deleteTitle: 'Delete your data?',
        deleteBody: 'Your friend code, friends and challenges will be erased from the server.',
        delete: 'Delete',
    },
    social: {
        err: {
            badName: 'Invalid nickname: 3–16 letters, digits, spaces, _ or -.',
            badCode: 'Invalid code. It has 8 characters, like K7M2-QX9P.',
            self: "That's your own code.",
            notFound: 'No player with this code.',
            already: 'You are already friends.',
            pending: 'Request already sent.',
            tooMany: 'Friend or request limit reached.',
            tooManyDuels: 'Too many open challenges with this friend.',
            notFriend: 'This player is no longer your friend.',
            rate: 'Too many requests. Try again in a moment.',
            unavailable: 'Service unavailable. Try again later.',
            network: 'No connection.',
            version: 'This challenge comes from another version of the game. Update the app.',
        },
    },
    quests: {
        title: 'Quests',
        subtitle: 'Streak: {streak}d (best {best}) · {total} completed · 🪙 {jetons}',
        today: 'Today',
        week: 'Week',
        legend: 'Legend',
        line: '{icon} {name} — {desc} ({pts}🪙) {done}',
    },
    leaderboard: {
        title: 'Leaderboard',
        subtitle: 'Next reset in {when}',
        pickNick: 'Pick your nickname',
        pickBody: 'Pick a nickname to see and appear on the weekly leaderboard.',
        placeholder: 'Your nickname',
        nickA11y: 'Nickname',
        joining: 'Joining…',
        join: 'Confirm',
        refreshing: 'Refreshing…',
        refresh: 'Refresh',
        empty: 'Nobody has posted this week yet. Finish a career to appear.',
        you: '  ·  you',
        yourPlace: 'Your place',
        waitingScore: 'Your best score of the week will show here once you finish a career.',
        week: 'Week {n}',
        monday: 'Monday',
        inDays: '{n} day',
        inDaysMany: '{n} days',
        inHours: '{n} h',
        inMin: '{n} min',
        nickMin: 'At least 3 characters.',
        nickMax: '16 characters maximum.',
        nickChars: 'Letters, numbers, spaces, _ and - only.',
        nickBlocked: 'This nickname is not allowed.',
        network: 'Leaderboard unavailable. Check your connection.',
        unavailable: 'The leaderboard is unreachable right now.',
        offlineTitle: 'No connection',
        offlineBody: 'The game itself is offline. The leaderboard needs internet to load. Tap Refresh when you are back online.',
        unavailableTitle: 'Leaderboard unavailable',
        unavailableBody: 'This is not your connection: the leaderboard is not responding. Tap Refresh to try again.',
        offlineLocal: 'Your best score this week is already saved here: {score}. It will post when you are online.',
        offlineStale: 'Leaderboard unreachable. This is the last board loaded on this device.',
        needNick: 'Pick a nickname to join the leaderboard.',
        badScore: 'Invalid score.',
        renameFail: 'Could not update the nickname.',
        sheetRank: 'Rank',
        sheetWeek: 'Weekly score',
        sheetCareers: 'Careers',
        sheetBest: 'Best score',
        sheetBadges: 'Badges',
        sheetStreak: 'Best streak',
        sheetAdd: 'Add friend',
        sheetSent: 'Request sent ✓',
        sheetAccept: 'Accept request',
        sheetFriends: 'You are friends',
        sheetChallenge: 'Challenge',
        sheetRecord: 'Your duels: {w}W · {d}D · {l}L',
        sheetNoSocial: "This player hasn't turned on friends yet.",
        sheetLoading: 'Loading profile…',
        sheetFrame: 'Frame',
        sheetTheme: 'Theme',
    },
    settings: {
        appIcon: 'App icon',
        appIconBody: 'Match the icon to one of your themes.',
        appIconLocked: 'Buy a theme in the shop to unlock its icon.',
        appIconDefault: 'Default icon',
        adsPrivacy: 'Ads',
        adsPrivacyBody: 'Change your ad consent choices.',
        adsPrivacyCta: 'Manage choices',
        title: 'Settings',
        subtitle: 'Game language and leaderboard nickname. No account.',
        language: 'Language',
        languageBody: 'Defaults to your device language. You can change it here.',
        nick: 'Nickname',
        nickEdit: 'It shows on this week’s leaderboard. You can change it here.',
        nickJoin: 'Pick one to join the leaderboard. Then your best career score of the week is posted automatically.',
        saving: 'Saving…',
        saved: 'Nickname saved.',
        savedOffline: 'Nickname saved on this device. The leaderboard will update when you are back online.',
        notifTitle: 'Notifications',
        notifBody: 'At most one a day, around the time you usually play.',
        notifEnable: 'Turn on notifications',
        notifDenied: "They're turned off in your phone settings.",
        notifOpenSettings: 'Open settings',
        notifLegends: 'New Legend (every Wednesday)',
        notifStreak: 'Quest streak at risk',
        notifReminders: 'Career reminders and weekly challenge',
        animTitle: 'In-game animations',
        animBody: 'Cutscenes for transfers and key moments. When off, the game goes straight to the result.',
        animToggle: 'Play animations',
    },
    notif: {
        channel: 'Reminders',
        socialChannel: 'Friends and challenges',
        legendTitle: '{icon} New Legend: {alias}',
        legendBody1: 'Free today only. Can you beat the original?',
        legendBody2: 'Out today and free until midnight. Rewrite the story.',
        streakTitle: '🔥 Your {days}-day streak is at risk',
        streakBody1: 'Finish a quest today to keep it.',
        streakBody2: 'One career is enough to extend your streak.',
        careerTitle: '{name} is waiting',
        careerBody1: 'Age {age}, season in progress. Pick up your career where you left it.',
        careerBody2: "The dressing room is waiting. The season won't play itself.",
        weeklyTitle: '🗓️ New weekly challenge',
        weeklyBody: '{icon} {name} · {pts} tokens to win.',
        comebackTitle: '⚽ A new destiny awaits',
        comebackBody1: 'Every career starts at 16. This one could be the one.',
        comebackBody2: 'New week, new quests. Missing the pitch?',
        promptTitle: 'Want a heads-up?',
        promptBody: 'A new Legend drops every Wednesday, and your quest streak can slip away. At most one notification a day.',
        promptYes: 'Yes, notify me',
        promptLater: 'Later',
    },
    howto: {
        title: 'How to play',
        subtitle: 'Welcome to {app} — the short guide.',
        tip: 'Tip: tap “Write your legend” from home, follow the events, and come back to build your legend.',
    },
    about: {
        title: 'About',
        version: 'Version {v}',
        transparency: 'Playable offline, no account or email. Internet is only used to move your progress to another phone, for the leaderboard and for the Friends tab (your nickname, friend code and challenge scores).',
        send: 'Send my progress',
        sendBody: 'Create an 8-character code. Enter it in About on the other phone. It copies tokens, badges, Hall of Fame and the current career — this device is not wiped.',
        creating: 'Creating…',
        create: 'Create a code',
        sendCode: 'Send the code',
        validHours: 'Valid {hours} h, one use only.',
        shareMsg: 'My Destiny FC code: {code}\nEnter it in About → Recover. Valid {hours} h, one use only.',
        redeem: 'Recover',
        redeemWarn: 'This replaces tokens, badges, Hall of Fame and the current career on THIS device. The other phone is not changed.',
        redeeming: 'Recovering…',
        replace: 'Replace',
        redeemBody: 'Paste or type the code you received (e.g. A7K3-M2XP). A code works once.',
        gotIt: 'Progress restored. Tokens, badges, Hall of Fame and current career are up to date.',
        privacy: 'Privacy policy',
        site: 'Official site',
    },
    transfer: {
        network: 'No connection. The game is offline, but a transfer needs internet just long enough to swap the code.',
        fail: 'The transfer failed. Try again in a moment.',
        badCode: 'Enter the 8 characters of the code.',
        tooLarge: 'Save too large for a transfer.',
        unknown: 'Code not found or already used. Check the 8 characters, or create a new one.',
        invalid: 'This is not a Destiny FC save.',
    },
    save: {
        unreadable: 'Save unreadable. Create a new code from the other phone.',
        invalid: 'This is not a Destiny FC save.',
    },
    review: {
        kicker: 'A moment',
        title: 'Are you enjoying Destiny FC?',
        body: 'A short review helps other players find the game — and helps us improve it.',
        yes: 'Yes, love it!',
        notReally: 'Not really',
        dontAsk: "Don't ask again",
        feedbackKicker: 'Feedback',
        feedbackTitle: "What's off?",
        feedbackBody: 'Write what bothered you. We get it directly, without opening your mail app.',
        placeholder: 'Your feedback…',
        sending: 'Sending…',
        send: 'Send',
        sendFail: "Can't send right now. Try again.",
        thanksKicker: 'Thanks',
        thanksTitle: "It's sent.",
        thanksBody: 'We read every note.',
    },
    share: {
        careerLine: '{flag} {position} · {club}',
        careerStats: 'Score {score} · rating {rating} · {trajectory}',
        careerTotals: '{goals} goals · {assists} assists · {caps} caps',
        careerPalmares: 'Golden Player ×{ballon} · titles ×{league} · World Cup ×{wc}',
        writtenIn: 'Written in {app}',
        ficheHead: 'CARD · {app} · {tier}',
        ficheIdentity: '{nat} · {position} · {club}',
        ficheTrajectory: 'Path: {label}',
        ficheRating: 'Rating {rating} · score {score} · {seasons} seasons',
        ficheTotals: 'Games {matches} · goals {goals} · assists {assists}',
        ficheNat: 'Caps {caps} · fortune {money}',
        fichePalmares: 'Honours: leagues {league} · cups {cup} · UCL {cl} · World Cup {wc}',
        ficheAwards: 'Awards: Golden Player {ballon} · Golden Boot {boot}',
    },
    demo: {
        endTitle: 'The demo stops here',
        endBody: 'You have lived {n} seasons of your career. The rest — retirement, Hall of Fame — is waiting on mobile.',
        store: 'Continue on the App Store',
        restart: 'Restart the demo',
    },
};
exports.howtoFr = [
    {
        icon: '⚽',
        title: 'Le principe',
        body: `Incarnez un jeune footballeur de 16 ans et forgez sa légende jusqu'à la retraite. Tout commence par des choix fondateurs : nationalité, poste, origine, mode de vie, entourage et académie. Tout aléatoire lance une carrière au hasard pour 10 jetons.`,
    },
    {
        icon: '📅',
        title: 'Saisons et événements',
        body: `Votre carrière avance saison après saison. Des événements ponctuent le parcours : chaque décision agit sur vos facettes, votre état mental, vos relations et votre score final. Transferts, prêts, tournois, rivalité, récompenses… personne ne connaît son destin à l'avance.`,
    },
    {
        icon: '🧠',
        title: 'L’état mental',
        body: `Au-delà de la forme et du moral, trois jauges pilotent vos performances. La Confiance stabilise vos matchs (haute = moins de contre-perfs). La Pression monte avec les attentes (gros club, réputation, sélection, année de contrat) : mal gérée, elle vous plombe ; maîtrisée, elle vous rend décisif. La Résilience, lente à bâtir, amortit les deux — tout comme un coach qui vous fait confiance.`,
    },
    {
        icon: '🧬',
        title: 'L’identité de joueur',
        body: `Votre joueur repose sur quatre facettes : Technique, Physique, Mental, Charisme. Choisissez un focus d'entraînement (fiche 📋) pour faire progresser plus vite la facette de votre choix. À force, une signature de jeu émerge de votre profil — buteur, meneur, roc… — avec ses bonus propres.`,
    },
    {
        icon: '🎭',
        title: 'Les contextes de saison',
        body: `Chaque saison prend une couleur selon votre situation : grands débuts, éclosion, année de contrat, saison du rachat, retour de blessure, sous pression, crépuscule… Le contexte oriente les événements qui se présentent, pour que deux saisons ne se ressemblent jamais.`,
    },
    {
        icon: '🎯',
        title: 'Le Rendez-vous quotidien',
        body: `Chaque jour, un défi unique : la même graine pour tous les joueurs, tirée de la date. Affrontez le scénario du jour et battez votre record. Les avantages équipés y sont ignorés — seuls vos choix comptent.`,
    },
    {
        icon: '📖',
        title: 'Le Mode Légendes',
        body: `Revivez une carrière de légende (Le Maestro, El Fenómeno). Le départ est imposé. Trois défis à collectionner : battre son score, le pulvériser (+40), et vivre au moins la moitié des souvenirs écrits.`,
    },
    {
        icon: '🆚',
        title: 'Le défi entre amis',
        body: `Créez un défi, jouez votre carrière, puis partagez le code. Votre ami reprend exactement le même départ — boutique ignorée. À la retraite, le meilleur score l'emporte.`,
    },
    {
        icon: '🪙',
        title: 'Les quêtes',
        body: `Des quêtes quotidiennes, hebdomadaires et légendaires vous donnent des objectifs à atteindre pendant vos carrières. Accomplissez-les pour gagner des jetons 🪙 et entretenir votre série.`,
    },
    {
        icon: '🛒',
        title: 'La Boutique',
        body: `Dépensez vos jetons pour débloquer des avantages (jusqu'à deux, trois avec l'amélioration boutique), des jokers de série, et des cosmétiques : cadres de fiche et thèmes d'ambiance. Le Rendez-vous quotidien et le duel ignorent les avantages, pas les thèmes.`,
    },
    {
        icon: '🏅',
        title: 'Badges et Panthéon',
        body: `Chaque exploit marque un badge dans votre collection, même les secrets. Terminez une carrière marquante pour entrer au Panthéon, aux côtés des autres légendes que vous avez écrites.`,
    },
    {
        icon: '🔄',
        title: 'Changer de téléphone',
        body: `Dans À propos, créez un code à 8 caractères (ex. A7K3-M2XP). Sur l'autre appareil, saisissez-le dans Récupérer. Internet n'est nécessaire que le temps de l'échange. Le code expire après 48 h et ne s'utilise qu'une fois.`,
    },
    {
        icon: '🪪',
        title: 'La fiche de fin',
        body: `À la retraite, votre joueur a un surnom, une trajectoire et un discours d'intronisation. Partagez la carrière, exportez la fiche, ou défiez un ami.`,
    },
];
exports.howtoEn = [
    {
        icon: '⚽',
        title: 'The idea',
        body: `Play a 16-year-old footballer and forge his legend until retirement. It starts with founding choices: nationality, position, origin, lifestyle, inner circle and academy. Randomise all launches a random career for 10 tokens.`,
    },
    {
        icon: '📅',
        title: 'Seasons and events',
        body: `Your career moves season by season. Events punctuate the path: each decision shifts your facets, your mental state, your relationships and your final score. Transfers, loans, tournaments, rivalry, awards… nobody knows their fate in advance.`,
    },
    {
        icon: '🧠',
        title: 'Mental state',
        body: `Beyond form and morale, three gauges drive your performances. Confidence steadies your matches (high = fewer off-days). Pressure rises with expectations (big club, reputation, national team, contract year): mishandled it drags you down, mastered it makes you decisive. Resilience, slow to build, cushions both — as does a coach who trusts you.`,
    },
    {
        icon: '🧬',
        title: 'Player identity',
        body: `Your player is built on four facets: Technique, Physical, Mental, Charisma. Pick a training focus (profile 📋) to grow the facet of your choice faster. Over time a play signature emerges from your profile — scorer, playmaker, rock… — each with its own bonuses.`,
    },
    {
        icon: '🎭',
        title: 'Season contexts',
        body: `Each season takes on a colour based on your situation: big debut, breakthrough, contract year, redemption season, injury comeback, under pressure, twilight… The context steers which events show up, so no two seasons feel alike.`,
    },
    {
        icon: '🎯',
        title: 'The daily challenge',
        body: `Each day, one unique challenge: the same seed for every player, drawn from the date. Face today's scenario and beat your record. Equipped perks are ignored — only your choices count.`,
    },
    {
        icon: '📖',
        title: 'Legends',
        body: `Relive a legendary career (The Maestro, El Fenómeno). The start is fixed. Three challenges to collect: beat their score, crush it (+40), and live at least half of the written memories.`,
    },
    {
        icon: '🆚',
        title: 'Duel',
        body: `Create a challenge, play your career, then share the code. Your friend takes the exact same start — shop ignored. At retirement, the highest score wins.`,
    },
    {
        icon: '🪙',
        title: 'Quests',
        body: `Daily, weekly and legendary quests give you goals during your careers. Complete them to earn tokens 🪙 and keep your streak alive.`,
    },
    {
        icon: '🛒',
        title: 'The shop',
        body: `Spend tokens to unlock perks (up to two, three with the shop upgrade), streak jokers, and cosmetics: card frames and atmosphere themes. Daily Rendezvous and duels ignore perks, not themes.`,
    },
    {
        icon: '🏅',
        title: 'Badges and Hall of Fame',
        body: `Every feat stamps a badge in your collection, even the secrets. Finish a memorable career to enter the Hall of Fame, alongside the other legends you have written.`,
    },
    {
        icon: '🔄',
        title: 'Switch phones',
        body: `In About, create an 8-character code (e.g. A7K3-M2XP). On the other device, enter it in Recover. Internet is only needed for the swap. The code expires after 48 h and works once.`,
    },
    {
        icon: '🪪',
        title: 'The final card',
        body: `At retirement, your player has a nickname, a path and a Hall of Fame speech. Share the career, export the card, or challenge a friend.`,
    },
];

},
"cinematics/attitudeTemplate": function (exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ATTITUDE_TEMPLATE = void 0;
exports.ATTITUDE_TEMPLATE = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<style>
  :root { --c1: #d62828; --safeTop: env(safe-area-inset-top, 0px); --safeBottom: env(safe-area-inset-bottom, 0px); }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
  body { font-family: "Oswald", "Avenir Next Condensed", "HelveticaNeue-CondensedBold", "Roboto Condensed", "Arial Narrow", sans-serif;
    color: #fff; -webkit-user-select: none; user-select: none; -webkit-tap-highlight-color: transparent; }
  #stage { position: absolute; inset: 0; overflow: hidden; background: #04060a; }
  .shot { position: absolute; inset: 0; opacity: 0; will-change: opacity, transform; }
  svg.full { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
  .close { background:
      radial-gradient(ellipse at 50% 95%, rgba(255,255,255,.16) 0%, transparent 45%),
      radial-gradient(ellipse at 50% 30%, color-mix(in srgb, var(--c1) 35%, #0b1220) 0%, #05070c 70%); }
  .bokeh { position: absolute; border-radius: 50%; filter: blur(10px); opacity: .55; }
  .closeHero { position: absolute; left: 50%; bottom: calc(var(--safeBottom) - 10px); width: min(108vw, 470px); transform: translateX(-50%); }
  .closeHero svg { display: block; width: 100%; height: auto; filter: drop-shadow(0 20px 30px rgba(0,0,0,.5)); }
  .crowdBand { position: absolute; left: 0; right: 0; bottom: 0; height: 34%; }
  #titleBox { position: absolute; left: 16px; right: 16px; top: calc(var(--safeTop) + 70px); text-align: center; }
  #momentTitle { font-size: 15px; letter-spacing: 5px; text-transform: uppercase; opacity: 0; }
  #bigWord { margin-top: 8px; padding-left: 6px; font-size: 76px; line-height: 1; font-weight: 700; letter-spacing: 6px; text-transform: uppercase; white-space: nowrap;
    text-shadow: 0 6px 30px rgba(0,0,0,.55); }
  #bigWord span, #resultWord span { display: inline-block; will-change: transform, opacity; }
  #resultBox { position: absolute; left: 12px; right: 12px; top: calc(var(--safeTop) + 64px); text-align: center; }
  #resultWord { padding-left: 4px; font-size: 84px; line-height: 1; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; white-space: nowrap;
    text-shadow: 0 8px 34px rgba(0,0,0,.55); }
  #resultWord.good { color: #ffd65a; text-shadow: 0 0 34px rgba(255,214,90,.55), 0 8px 30px rgba(0,0,0,.5); }
  #resultWord.bad { color: #ffffff; opacity: .92; }
  #vignette { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,.55) 100%); }
  #flash { position: absolute; inset: 0; background: #fff; opacity: 0; pointer-events: none; }
  #black { position: absolute; inset: 0; background: #000; opacity: 0; pointer-events: none; }
  #confetti { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
  #skip { position: absolute; left: 0; right: 0; bottom: calc(var(--safeBottom) + 10px); text-align: center; opacity: 0;
    font-family: -apple-system, system-ui, sans-serif; font-size: 11px; letter-spacing: 1px; color: rgba(255,255,255,.6); }
</style>
</head>
<body>
<div id="stage">
  <div class="shot close" id="shotA">
    <div id="bokehA"></div>
    <svg class="crowdBand" id="crowdA" viewBox="0 0 400 120" preserveAspectRatio="none"></svg>
    <div class="closeHero" id="heroA"></div>
    <div id="titleBox"><div id="momentTitle"></div><div id="bigWord"></div></div>
  </div>
  <div class="shot" id="shotB">
    <svg class="full" id="pitch" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice"></svg>
  </div>
  <div class="shot close" id="shotC">
    <div id="bokehC"></div>
    <svg class="crowdBand" id="crowdC" viewBox="0 0 400 120" preserveAspectRatio="none"></svg>
    <div class="closeHero" id="heroC"></div>
    <div id="resultBox"><div id="resultWord"></div></div>
  </div>
  <div id="vignette"></div>
  <canvas id="confetti"></canvas>
  <div id="flash"></div>
  <div id="black"></div>
  <div id="skip"></div>
</div>
<script>/*__RIG_JS__*/</script>
<script>
window.CINE = /*__CINE_DATA__*/null;
(function () {
  var D = window.CINE || {};
  var L = D.labels || {};
  var P = D.plan || { kind: 'rally', option: 'voice', side: 1, success: true, result: 'rallied' };
  var good = !!P.success;
  var $ = function (id) { return document.getElementById(id); };
  var post = function (msg) {
    var s = JSON.stringify(msg);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(s);
    else if (window.parent && window.parent !== window) window.parent.postMessage(s, '*');
  };
  var NS = 'http://www.w3.org/2000/svg';

  // ── Outils de temps ─────────────────────────────────────────
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var outCubic = function (p) { return 1 - Math.pow(1 - p, 3); };
  var inOut = function (p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
  var outBack = function (p) { var c = 1.6; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
  var seg = function (t, a, b, ease) { var p = clamp((t - a) / (b - a), 0, 1); return (ease || outCubic)(p); };
  var bell = function (p) { return p <= 0 || p >= 1 ? 0 : Math.sin(Math.PI * p); };
  var seeded = function (i, salt) { var x = Math.sin(i * 12.9898 + (salt || 0) * 78.233) * 43758.5453; return x - Math.floor(x); };
  var f2 = function (n) { return Math.round(n * 100) / 100; };

  var ourKit = D.kit || { c1: '#d62828', c2: '#151515' };
  var oppKit = D.oppKit || { c1: '#f4f4f4', c2: '#1d3a8a' };
  var keeperKit = D.oppKeeperKit || { c1: '#f97316', c2: '#111111' };
  var root = document.documentElement.style;
  root.setProperty('--c1', ourKit.c1);
  if (D.safeTop != null) root.setProperty('--safeTop', D.safeTop + 'px');
  if (D.safeBottom != null) root.setProperty('--safeBottom', D.safeBottom + 'px');

  // ── La chronologie ───────────────────────────────────────────
  var A_END = 1500;
  var IMPACT = P.kind === 'manage' ? (good ? 4200 : 3600) : 3300;
  var END_B = IMPACT + 1300;
  var C_START = END_B + 200, END = C_START + 2500;

  // ── Mise en place des textes ─────────────────────────────────
  var letters = function (el, text) {
    el.innerHTML = '';
    return String(text || '').split('').map(function (ch) {
      var s = document.createElement('span');
      s.textContent = ch === ' ' ? '\\u00a0' : ch;
      el.appendChild(s);
      return s;
    });
  };
  $('momentTitle').textContent = D.title || '';
  var bigL = letters($('bigWord'), String(L.word || '').toUpperCase());
  var resL = letters($('resultWord'), String(L.result || '').toUpperCase());
  $('resultWord').className = good ? 'good' : 'bad';
  $('skip').textContent = L.skip || '';
  // Les grands mots tiennent toujours dans la largeur de l'écran (marge pour le battement de cœur).
  var fitWord = function (el, max) {
    var spans = el.querySelectorAll('span');
    if (!spans.length) return;
    var width = function () { return spans[spans.length - 1].getBoundingClientRect().right - spans[0].getBoundingClientRect().left; };
    var size = max;
    el.style.fontSize = size + 'px';
    while (size > 30 && width() > el.clientWidth * 0.92) { size -= 2; el.style.fontSize = size + 'px'; }
  };
  fitWord($('bigWord'), 76);
  fitWord($('resultWord'), 84);

  // Lumières floues et public des gros plans.
  ['bokehA', 'bokehC'].forEach(function (id, k) {
    var html = '';
    for (var i = 0; i < 9; i++) {
      var sz = 30 + seeded(i, k + 1) * 70;
      html += '<div class="bokeh" style="left:' + (seeded(i, k + 2) * 100).toFixed(1) + '%;top:' + (5 + seeded(i, k + 3) * 45).toFixed(1) +
        '%;width:' + sz.toFixed(0) + 'px;height:' + sz.toFixed(0) + 'px;background:' + (i % 3 ? 'rgba(255,240,210,.5)' : 'rgba(255,255,255,.35)') + '"></div>';
    }
    $(id).innerHTML = html;
  });
  var crowd = function () {
    var s = '';
    for (var row = 0; row < 2; row++) {
      var y = 60 + row * 26, col = row ? 'rgba(0,0,0,.8)' : 'rgba(0,0,0,.5)';
      s += '<rect x="0" y="' + (y + 8) + '" width="400" height="80" fill="' + col + '"/>';
      for (var k = 0; k < 24; k++) {
        var x = k * 17 + (row ? 8 : 0) + seeded(k, row) * 6, r = 7 + seeded(k, row + 3) * 3;
        s += '<circle cx="' + x.toFixed(1) + '" cy="' + (y - seeded(k, row + 5) * 6).toFixed(1) + '" r="' + r.toFixed(1) + '" fill="' + col + '"/>';
        s += '<rect x="' + (x - r * 1.5).toFixed(1) + '" y="' + (y + 3).toFixed(1) + '" width="' + (r * 3).toFixed(1) + '" height="24" rx="7" fill="' + col + '"/>';
      }
    }
    return s;
  };
  $('crowdA').innerHTML = crowd();
  $('crowdC').innerHTML = crowd();

  // ── Plan B ───────────────────────────────────────────────────
  var S = P.side || 1;
  var R = window.DestinyRig;
  var rigs = [];
  var mk = function (parent) {
    var g = document.createElementNS(NS, 'g');
    var inner = document.createElementNS(NS, 'g'); g.appendChild(inner);
    $(parent).appendChild(g);
    return { g: g, inner: inner };
  };
  var mount = function (grp, opts) { var r = R ? R.mount(grp.inner, opts) : null; if (r) rigs.push(r); return r; };
  var heroA = null, heroC = null;
  if (R && D.avatar) {
    $('heroA').innerHTML = '<svg viewBox="-115 -318 230 330"><g id="hA"></g></svg>';
    $('heroC').innerHTML = '<svg viewBox="-115 -318 230 330"><g id="hC"></g></svg>';
    heroA = R.mount($('hA'), { avatar: D.avatar, kit: ourKit, pose: 'focus', uid: 'a', shadow: false });
    heroC = R.mount($('hC'), { avatar: D.avatar, kit: ourKit, pose: 'front', uid: 'c', shadow: false });
    rigs.push(heroA, heroC);
  }
  var svg = '<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03050b"/><stop offset="1" stop-color="#101a33"/></linearGradient>' +
    '<radialGradient id="glow"><stop offset="0" stop-color="rgba(255,250,235,.95)"/><stop offset=".25" stop-color="rgba(255,250,235,.35)"/><stop offset="1" stop-color="rgba(255,250,235,0)"/></radialGradient>' +
    '<linearGradient id="grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d6531"/><stop offset="1" stop-color="#2f8f47"/></linearGradient>' +
    '<filter id="blur"><feGaussianBlur stdDeviation="9"/></filter></defs>';
  var fans = [], phones = [];
  if (P.kind === 'rally') {
    // La tribune : des supporters aux couleurs du club (bras, écharpes), une banderole au premier rang,
    // la jauge d'ambiance en haut. Notre joueur, de dos, face à eux.
    svg += '<rect width="400" height="800" fill="url(#sky)"/>';
    svg += '<circle cx="40" cy="10" r="140" fill="url(#glow)" opacity=".6"/><circle cx="360" cy="10" r="140" fill="url(#glow)" opacity=".6"/>';
    svg += '<rect x="0" y="70" width="400" height="530" fill="#121a2c"/>';
    var SKINS = ['#f2c7a5', '#d9a07a', '#b97a52', '#8a5638', '#5e3a24'];
    for (var row = 0; row < 9; row++) {
      var yy = 110 + row * 52, sc = 0.78 + row * 0.07;
      for (var k = 0; k < 13; k++) {
        var xx = k * 32 + (row % 2 ? 16 : 0) + seeded(k, row + 30) * 8 - 12;
        var shirt = (k + row) % 3 === 0 ? ourKit.c2 : ourKit.c1, skin = SKINS[Math.floor(seeded(k, row + 33) * SKINS.length)];
        var id = 'fan' + fans.length, u = sc;
        // Bras (deux traits) qui se lèvent, corps au maillot du club, tête ; une écharpe pour certains.
        svg += '<g id="' + id + '">' +
          '<line class="armL" x1="' + f2(xx - 9 * u) + '" y1="' + f2(yy + 14 * u) + '" x2="' + f2(xx - 16 * u) + '" y2="' + f2(yy + 30 * u) + '" stroke="' + shirt + '" stroke-width="' + f2(6 * u) + '" stroke-linecap="round"/>' +
          '<line class="armR" x1="' + f2(xx + 9 * u) + '" y1="' + f2(yy + 14 * u) + '" x2="' + f2(xx + 16 * u) + '" y2="' + f2(yy + 30 * u) + '" stroke="' + shirt + '" stroke-width="' + f2(6 * u) + '" stroke-linecap="round"/>' +
          '<rect x="' + f2(xx - 11 * u) + '" y="' + f2(yy + 8 * u) + '" width="' + f2(22 * u) + '" height="' + f2(30 * u) + '" rx="' + f2(7 * u) + '" fill="' + shirt + '"/>' +
          '<circle cx="' + f2(xx) + '" cy="' + f2(yy) + '" r="' + f2(9 * u) + '" fill="' + skin + '"/>' +
          (seeded(k, row + 36) < 0.3 ? '<rect class="scarf" x="' + f2(xx - 3 * u) + '" y="' + f2(yy - 34 * u) + '" width="' + f2(6 * u) + '" height="' + f2(26 * u) + '" fill="' + (shirt === ourKit.c1 ? ourKit.c2 : ourKit.c1) + '" opacity="0"/>' : '') +
          '</g>';
        fans.push({ id: id, x: xx, y: yy, u: u, ph: seeded(k, row + 50), amp: 5 + 6 * seeded(k, row + 70) });
        if (seeded(k, row + 90) < 0.25) phones.push({ x: xx + 12 * u, y: yy - 18 * u, at: seeded(k, row + 110), sp: 0.6 + seeded(k, row + 130) });
      }
    }
    phones.forEach(function (p, i) { svg += '<circle id="ph' + i + '" cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="2.4" fill="#fff" opacity="0"/>'; });
    svg += '<g id="flares" filter="url(#blur)"></g><g id="whistles"></g>';
    // Banderole au premier rang, au nom et au numéro du joueur.
    svg += '<g id="banner"><rect x="20" y="486" width="360" height="46" rx="6" fill="' + ourKit.c1 + '" stroke="' + ourKit.c2 + '" stroke-width="3"/>';
    svg += '<text x="200" y="520" text-anchor="middle" font-size="30" font-weight="800" letter-spacing="3" fill="' + (ourKit.ink || '#fff') + '" font-family="Avenir Next Condensed, Arial Narrow, sans-serif">' +
      String(D.shirtName || '').toUpperCase().replace(/[<&]/g, '') + ' ' + (D.number != null ? D.number : '') + '</text></g>';
    svg += '<g id="throws"></g>';
    svg += '<rect x="0" y="596" width="400" height="12" fill="#0b0f18"/><rect x="0" y="606" width="400" height="200" fill="url(#grass)"/>';
    svg += '<rect id="dim" x="0" y="0" width="400" height="800" fill="#000" opacity="0"/>';
    // La jauge d'ambiance : un haut-parleur et une barre.
    svg += '<g id="meter"><rect x="70" y="26" width="260" height="34" rx="17" fill="rgba(0,0,0,.6)"/>' +
      '<path d="M86 37 h8 l10 -8 v26 l-10 -8 h-8 z" fill="#fff"/><path d="M110 35 q6 8 0 16 M115 31 q10 12 0 24" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
      '<rect x="128" y="35" width="190" height="16" rx="8" fill="rgba(255,255,255,.18)"/><rect id="meterFill" x="128" y="35" width="0" height="16" rx="8" fill="#ffd65a"/></g>';
    svg += '<g id="meLayer"></g>';
  } else if (P.kind === 'manage') {
    // Au poteau de corner : notre joueur de face protège le ballon, deux adversaires derrière lui.
    svg += '<rect width="400" height="330" fill="url(#sky)"/><rect x="0" y="120" width="400" height="200" fill="#0a0f1c"/>';
    for (var r2 = 0; r2 < 7; r2++) for (var k2 = 0; k2 < 34; k2++) {
      var x2 = k2 * 12 + (r2 % 2 ? 6 : 0), y2 = 136 + r2 * 26, c2 = 'rgb(' + (14 + r2 * 3) + ',' + (20 + r2 * 4) + ',' + (36 + r2 * 5) + ')';
      svg += '<circle cx="' + x2 + '" cy="' + y2 + '" r="4.4" fill="' + c2 + '"/><rect x="' + (x2 - 6) + '" y="' + (y2 + 3) + '" width="12" height="15" rx="4" fill="' + c2 + '"/>';
    }
    svg += '<rect x="0" y="306" width="400" height="14" fill="' + ourKit.c1 + '" opacity=".85"/><rect x="0" y="320" width="400" height="480" fill="url(#grass)"/>';
    var cx0 = S > 0 ? 400 : 0;
    svg += '<line x1="' + cx0 + '" y1="330" x2="' + (cx0 - S * 400) + '" y2="330" stroke="rgba(255,255,255,.8)" stroke-width="2.4"/>';
    svg += '<line x1="' + (cx0 - S * 20) + '" y1="330" x2="' + (cx0 - S * 120) + '" y2="800" stroke="rgba(255,255,255,.8)" stroke-width="3"/>';
    svg += '<path d="M' + (cx0 - S * 60) + ' 330 Q' + (cx0 - S * 66) + ' 360 ' + (cx0 - S * 30) + ' 372" stroke="rgba(255,255,255,.8)" stroke-width="2.4" fill="none"/>';
    svg += '<g id="flag"><line x1="' + (cx0 - S * 24) + '" y1="334" x2="' + (cx0 - S * 24) + '" y2="250" stroke="#f4f4f4" stroke-width="3"/>' +
      '<path id="flagCloth" d="" fill="' + ourKit.c1 + '"/></g>';
    svg += '<g id="oppLayer"></g><g id="ballBack"></g><g id="meLayer"></g><g id="ballFront"></g>';
  } else {
    // Face à l'arbitre : il est de face au centre ; notre joueur et un coéquipier de dos, devant.
    svg += '<rect width="400" height="330" fill="url(#sky)"/><rect x="0" y="120" width="400" height="200" fill="#0a0f1c"/>';
    for (var r3 = 0; r3 < 7; r3++) for (var k3 = 0; k3 < 34; k3++) {
      var x3 = k3 * 12 + (r3 % 2 ? 6 : 0), y3 = 136 + r3 * 26, c3 = 'rgb(' + (14 + r3 * 3) + ',' + (20 + r3 * 4) + ',' + (36 + r3 * 5) + ')';
      svg += '<circle cx="' + x3 + '" cy="' + y3 + '" r="4.4" fill="' + c3 + '"/><rect x="' + (x3 - 6) + '" y="' + (y3 + 3) + '" width="12" height="15" rx="4" fill="' + c3 + '"/>';
    }
    svg += '<rect x="0" y="306" width="400" height="14" fill="' + ourKit.c1 + '" opacity=".85"/><rect x="0" y="320" width="400" height="480" fill="url(#grass)"/>';
    svg += '<g id="refLayer"></g><g id="cardLayer"></g><g id="mateLayer"></g><g id="meLayer"></g><g id="bubbles"></g>';
  }
  $('pitch').innerHTML = svg;
  var phoneEls = phones.map(function (p, i) { return $('ph' + i); });
  var fanEls = fans.map(function (f) { return $(f.id); });

  var place = function (grp, x, y, s, lift, rot) {
    grp.g.setAttribute('transform', 'translate(' + f2(x) + ' ' + f2(y - (lift || 0)) + ') rotate(' + f2(rot || 0) + ' 0 ' + f2(-150 * s) + ') scale(' + f2(s) + ')');
  };
  var cues = [];
  var meG = mk('meLayer'), meRig, oppGs = [], refG = null, refRig = null, mateG = null, mateRig = null;
  if (P.kind === 'rally') {
    meRig = mount(meG, { avatar: D.avatar, kit: ourKit, pose: 'back', uid: 'm', shadow: true, shirtName: D.shirtName, shirtNumber: D.number });
    cues.push([2300, meRig, P.option === 'voice' || P.option === 'crowd' ? 'waveBack' : 'celebrateBack']);
    // Raté : il se prend la tête entre les mains, toujours de dos.
    if (!good) cues.push([IMPACT + 150, meRig, 'despairBack']);
  } else if (P.kind === 'manage') {
    meRig = mount(meG, { avatar: D.avatar, kit: ourKit, pose: 'front', uid: 'm', shadow: true });
    for (var o = 0; o < 2; o++) {
      var og = mk('oppLayer');
      oppGs.push({ g: og, rig: mount(og, { avatar: (D.wallAvatars && D.wallAvatars[o]) || D.oppAvatar, kit: D.oppKit || { c1: '#f4f4f4', c2: '#1d3a8a' }, pose: 'front', uid: 'o' + o, shadow: true }) });
    }
    if (good) { cues.push([IMPACT + 150, meRig, 'celebrate']); oppGs.forEach(function (o) { cues.push([IMPACT + 150, o.rig, 'despair']); }); }
    // Raté : le premier adversaire tacle en glissant, le second récupère le ballon et s'en va.
    else { cues.push([IMPACT - 200, oppGs[0].rig, 'slide']); cues.push([IMPACT + 520, oppGs[0].rig, 'front']); cues.push([IMPACT + 250, meRig, 'despair']); }
  } else {
    meRig = mount(meG, { avatar: D.avatar, kit: ourKit, pose: 'back', uid: 'm', shadow: true, shirtName: D.shirtName, shirtNumber: D.number });
    refG = mk('refLayer');
    refRig = mount(refG, { avatar: D.refAvatar || D.oppAvatar, kit: { c1: '#151515', c2: '#151515', ink: '#ffffff' }, pose: 'front', uid: 'r', shadow: true });
    if (P.option === 'protest') {
      mateG = mk('mateLayer');
      mateRig = mount(mateG, { avatar: (D.mateAvatars && D.mateAvatars[0]) || D.oppAvatar, kit: ourKit, pose: 'back', uid: 't', shadow: true });
      cues.push([2300, meRig, 'waveBack']); cues.push([2450, mateRig, 'waveBack']);
    } else cues.push([2400, meRig, 'waveBack']);
    // L'arbitre apaise (bras ouverts vers le bas) ou brandit le jaune, bras tendu vers le ciel.
    cues.push([IMPACT - 350, refRig, good ? 'calm' : 'card']);
  }

  // ── Confettis ────────────────────────────────────────────────
  var cv = $('confetti'), cx = cv.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1), W = 0, H = 0;
  var resize = function () { W = window.innerWidth; H = window.innerHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  resize(); window.addEventListener('resize', resize);
  var bits = [];
  var burst = function (count) {
    var cols = [ourKit.c1, ourKit.c2, '#ffd65a', '#ffffff'];
    for (var i = 0; i < count; i++) {
      var sd = i % 2 ? 1 : -1, off = (10 + Math.random() * 32) * Math.PI / 180, v = 11 + Math.random() * 10;
      bits.push({ x: W / 2 + sd * W * 0.46, y: H * 0.82, vx: -sd * Math.sin(off) * v, vy: -Math.cos(off) * v, w: 6 + Math.random() * 6,
        h: 9 + Math.random() * 8, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, f: Math.random() * 6, vf: 0.15 + Math.random() * 0.2, c: cols[i % cols.length] });
    }
  };
  var drawBits = function () {
    cx.clearRect(0, 0, W, H);
    for (var i = bits.length - 1; i >= 0; i--) {
      var b = bits[i];
      b.vy += 0.32; b.vx *= 0.985; b.vy *= 0.985; b.x += b.vx; b.y += b.vy; b.r += b.vr; b.f += b.vf;
      if (b.y > H + 40) { bits.splice(i, 1); continue; }
      cx.save(); cx.translate(b.x, b.y); cx.rotate(b.r); cx.scale(1, Math.cos(b.f)); cx.fillStyle = b.c; cx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h); cx.restore();
    }
  };

  // ── Rendu ────────────────────────────────────────────────────
  var fired = {};
  var once = function (t, at, key, fn) { if (t >= at && !fired[key]) { fired[key] = true; fn(); } };
  var tr = function (el, s) { el.style.transform = s; };
  var impactAt = -1e9;

  function render(t) {
    var inB = t >= A_END && t < C_START, inC = t >= C_START;
    $('shotA').style.opacity = t < A_END ? 1 : 0;
    $('shotB').style.opacity = inB ? 1 : 0;
    $('shotC').style.opacity = inC ? 1 : 0;
    $('black').style.opacity = f2(Math.max(bell((t - A_END + 140) / 280), bell((t - C_START + 140) / 280), 1 - seg(t, 0, 300)));

    // Plan A : gros plan, titre, cœur qui bat.
    tr($('heroA'), 'translateX(-50%) scale(' + (1 + 0.06 * seg(t, 0, A_END, inOut)).toFixed(4) + ')');
    $('momentTitle').style.opacity = seg(t, 200, 600);
    bigL.forEach(function (s, i) {
      var p = seg(t, 350 + i * 45, 800 + i * 45, outBack);
      s.style.opacity = clamp(p * 1.4, 0, 1);
      tr(s, 'translateY(' + ((1 - p) * 60).toFixed(1) + 'px) scale(' + (0.7 + 0.3 * p).toFixed(3) + ')');
    });
    var beat = Math.max(bell((t - 650) / 160), bell((t - 900) / 160), bell((t - 1250) / 160));
    tr($('bigWord'), 'scale(' + (1 + 0.05 * beat).toFixed(3) + ')');
    once(t, 650, 'b1', function () { post({ type: 'impact', strength: 'medium' }); });
    once(t, 1250, 'b2', function () { post({ type: 'impact', strength: 'medium' }); });

    // Plan B.
    if (inB || t < A_END + 200) {
      cues.forEach(function (c, i) { once(t, c[0], 'cue' + i, function () { if (c[1]) c[1].setPose(c[2]); }); });
      var z = 1 + 0.05 * seg(t, A_END, END_B, inOut);
      tr($('pitch'), 'scale(' + z.toFixed(4) + ')');
      $('pitch').style.transformOrigin = '50% 60%';
      if (P.kind === 'rally') {
        // Ambiance : monte quand notre joueur lève les bras, explose (réussite) ou retombe en sifflets.
        var rise = seg(t, 2300, 2900), heat = good ? Math.max(rise * 0.6, seg(t, 2900, IMPACT + 200)) : 0;
        var boo = good ? 0 : seg(t, 2800, 3300);
        fanEls.forEach(function (el, i) {
          var f = fans[i], beat = Math.max(0, Math.sin((t / 230 + f.ph) * Math.PI * 2));
          var jump = beat * f.amp * heat, up = Math.min(1, heat * 1.4);
          // Réussite : ils sautent. Raté : ils secouent la tête, immobiles.
          var shake = Math.sin(t / 90 + f.ph * 9) * 2.4 * boo;
          el.setAttribute('transform', 'translate(' + f2(shake) + ' ' + f2(-jump) + ')');
          var arms = el.querySelectorAll('line');
          if (arms.length === 2) {
            // Réussite : bras levés en V. Raté : bras tendus vers le bas et l'extérieur (pouces baissés).
            var ax = 16 - 4 * up + 8 * boo, ay = 30 - 52 * up + 10 * boo;
            arms[0].setAttribute('x2', f2(f.x - ax * f.u)); arms[0].setAttribute('y2', f2(f.y + ay * f.u));
            arms[1].setAttribute('x2', f2(f.x + ax * f.u)); arms[1].setAttribute('y2', f2(f.y + ay * f.u));
          }
          var scarf = el.querySelector('.scarf');
          if (scarf) {
            scarf.setAttribute('opacity', f2(up));
            scarf.setAttribute('transform', 'rotate(' + f2(Math.sin(t / 140 + f.ph * 6) * 40 * up) + ' ' + f2(f.x) + ' ' + f2(f.y - 10 * f.u) + ')');
          }
        });
        phoneEls.forEach(function (el, i) {
          var p = phones[i], ph = ((t / 1000) * p.sp + p.at) % 1;
          el.setAttribute('opacity', f2(bell(ph / 0.25) * (good ? 0.2 + 0.8 * heat : 0.3 * (1 - seg(t, 2900, 3400)))));
        });
        var fl = '';
        if (good && t > 2900) for (var q = 0; q < 7; q++) {
          var age = (t - 2900 - q * 140) / 1000;
          if (age < 0) continue;
          var fx = 30 + q * 56 + Math.sin(age * 2 + q) * 10, fy = 540 - age * 110;
          fl += '<circle cx="' + f2(fx) + '" cy="' + f2(fy) + '" r="' + f2(22 + age * 26) + '" fill="' + (q % 2 ? '#ff5a36' : ourKit.c1) + '" opacity="' + f2(0.7 * Math.max(0, 1 - age / 3)) + '"/>';
        }
        $('flares').innerHTML = fl;
        // Raté : des sifflets bien visibles montent de toute la tribune, des gobelets volent sur le terrain.
        var wh = '', th = '';
        if (!good && t > 2850) {
          for (var w = 0; w < 18; w++) {
            var wa = ((t - 2850) / 800 + seeded(w, 3)) % 1, wx = 20 + seeded(w, 5) * 360, wy = 470 - wa * 360;
            wh += '<path d="M' + f2(wx - 16) + ' ' + f2(wy) + ' q6 -10 12 0 t12 0 t12 0" stroke="rgba(255,255,255,' + f2(0.95 * bell(wa)) + ')" stroke-width="3.4" fill="none" stroke-linecap="round"/>';
          }
          for (var c = 0; c < 8; c++) {
            var ca = (t - 3000 - c * 180) / 900;
            if (ca < 0 || ca > 1) continue;
            var cxp = 40 + seeded(c, 9) * 320, cyp = 470 + ca * 230 - 160 * bell(ca);
            th += '<rect x="' + f2(cxp - 4) + '" y="' + f2(cyp - 6) + '" width="8" height="12" rx="2" fill="#f4f4f4" transform="rotate(' + f2(ca * 400 + c * 40) + ' ' + f2(cxp) + ' ' + f2(cyp) + ')"/>';
          }
        }
        $('whistles').innerHTML = wh;
        $('throws').innerHTML = th;
        $('dim').setAttribute('opacity', f2(good ? 0 : 0.5 * seg(t, 2900, 3600)));
        // La banderole s'effondre en cas d'échec.
        var fall = good ? 0 : outCubic(clamp((t - 3200) / 700, 0, 1));
        $('banner').setAttribute('transform', 'rotate(' + f2(14 * fall) + ' 20 532) translate(0 ' + f2(40 * fall) + ')');
        var mf = $('meterFill');
        mf.setAttribute('width', f2(190 * (good ? Math.min(1, 0.15 + heat * 0.85) : Math.max(0.04, 0.5 * (1 - seg(t, 2800, 3600)) + 0.04))));
        mf.setAttribute('fill', good ? '#ffd65a' : '#e5243b');
        $('meter').setAttribute('transform', !good && t > 2900 && t < 3900 ? 'translate(' + f2(Math.sin(t / 30) * 3) + ' 0)' : '');
        var walk = seg(t, A_END, 2300, inOut);
        place(meG, 200, 812 - 20 * walk, 0.76 - 0.03 * walk, 0, 0);
      } else if (P.kind === 'manage') {
        // Notre joueur protège le ballon : petits pas de côté, le ballon passe d'un pied à l'autre.
        var cx0 = S > 0 ? 400 : 0, mx = cx0 - S * 120 + Math.sin(t / 380) * 10, my = 640;
        place(meG, mx, my, 0.62, Math.abs(Math.sin(t / 190)) * 3, 0);
        // Les deux adversaires pressent. Raté : le premier se rapproche et tacle le ballon (glissade),
        // le ballon file dans les pieds du second, qui part avec vers le centre.
        var press = !good ? seg(t, 2900, IMPACT - 220, inOut) : 0;
        var slideE = !good ? outCubic(clamp((t - IMPACT + 200) / 320, 0, 1)) * (1 - seg(t, IMPACT + 500, IMPACT + 900)) : 0;
        var runAway = !good ? seg(t, IMPACT + 380, IMPACT + 1300, inOut) : 0;
        var o0 = { x: mx - S * 74 + Math.sin(t / 300) * 8 * (1 - press) + S * 12 * press + S * 14 * slideE, y: 565 + 44 * press + 14 * slideE, s: 0.5 + 0.06 * press };
        // Le second adversaire attend du côté opposé au drapeau ; il récupère et sort du cadre par ce côté.
        var o1 = good
          ? { x: mx + S * 70 + Math.sin(t / 300 + 1) * 8, y: 575, s: 0.5 }
          : { x: mx - S * 150 + Math.sin(t / 300 + 1) * 6 * (1 - runAway) - S * 230 * runAway, y: 600 - 12 * runAway, s: 0.52 };
        place(oppGs[0].g, o0.x, o0.y, o0.s, 0, S * 18 * slideE);
        place(oppGs[1].g, o1.x, o1.y, o1.s, runAway > 0 && runAway < 1 ? Math.abs(Math.sin(t / 105)) * 4 : 0, 0);
        var bx, by, br = 9;
        if (good || t < IMPACT) { bx = mx + Math.sin(t / 240) * 22; by = my - 6; }
        else if (t < IMPACT + 380) {
          // Le ballon chipé roule jusqu'au second adversaire.
          var lp = outCubic(clamp((t - IMPACT) / 380, 0, 1)), b0x = mx + Math.sin(IMPACT / 240) * 22;
          bx = b0x + (o1.x - S * 24 - b0x) * lp; by = my - 6 + (o1.y + 6 - (my - 6)) * lp; br = 9 - 1.5 * lp;
        } else { bx = o1.x - S * 24 + Math.sin(t / 110) * 3; by = o1.y + 6; br = 7.5; }
        $('ballFront').innerHTML = '<circle cx="' + f2(bx) + '" cy="' + f2(by - br) + '" r="' + br + '" fill="#fafafa" stroke="#cfd8dc"/>';
        // Le drapeau de corner flotte.
        var fx0 = cx0 - S * 24, wv = Math.sin(t / 160) * 4;
        $('flagCloth').setAttribute('d', 'M' + fx0 + ' 252 Q' + (fx0 - S * 14) + ' ' + (258 + wv) + ' ' + (fx0 - S * 28) + ' ' + (256 + wv) + ' L' + (fx0 - S * 28) + ' ' + (276 + wv) + ' Q' + (fx0 - S * 14) + ' ' + (278 + wv) + ' ' + fx0 + ' 272 Z');
        // Le chrono défile jusqu'à 90:00 (coup de sifflet final si on tient).
        var secs = Math.min(5400, 5352 + Math.floor(48 * seg(t, A_END, IMPACT, function (p) { return p; })));
        var clock = good && t >= IMPACT ? 'FIN' : Math.floor(secs / 60) + ':' + ('0' + (secs % 60)).slice(-2);
        $('pitch').querySelector('#clock') || (function () {
          var tx = document.createElementNS(NS, 'g'); tx.setAttribute('id', 'clockG');
          tx.innerHTML = '<rect x="140" y="20" width="120" height="40" rx="8" fill="rgba(0,0,0,.65)"/><text id="clock" x="200" y="49" text-anchor="middle" font-size="26" font-weight="700" fill="#fff" font-family="Avenir Next Condensed, Arial Narrow, sans-serif"></text>';
          $('pitch').appendChild(tx);
        })();
        $('pitch').querySelector('#clock').textContent = clock;
      } else {
        var RX = 205, RY = 612, RS = 0.62;
        place(refG, RX, RY, RS, 0, 0);
        var argue = P.option === 'protest' ? Math.abs(Math.sin(t / 140)) * 6 * seg(t, 2300, 2500) * (1 - seg(t, IMPACT, IMPACT + 300)) : 0;
        var step = seg(t, A_END, 2300, inOut);
        place(meG, 96 + 10 * step, 822 - 14 * step, 0.74, argue, 0);
        if (mateG) place(mateG, 312 - 10 * step, 812 - 12 * step, 0.72, argue * 0.8, 0);
        // Bulles « !? » quand ils contestent, le temps de la discussion.
        var bub = '';
        if (P.option === 'protest' && t > 2300 && t < IMPACT + 200) {
          var bp = outBack(clamp((t - 2300) / 260, 0, 1)) * (1 - seg(t, IMPACT, IMPACT + 200));
          [[110, 548], [300, 540]].forEach(function (b, i) {
            var wob = Math.sin(t / 120 + i) * 3;
            bub += '<g transform="translate(' + b[0] + ' ' + f2(b[1] + wob) + ') scale(' + f2(bp) + ')"><rect x="-30" y="-24" width="60" height="40" rx="14" fill="#fff"/>' +
              '<path d="M-6 16 L0 28 L8 16 Z" fill="#fff"/><text x="0" y="6" text-anchor="middle" font-size="24" font-weight="800" fill="#151515" font-family="Avenir Next Condensed, Arial Narrow, sans-serif">!?</text></g>';
          });
        }
        $('bubbles').innerHTML = bub;
        // Raté : le carton jaune dans le poing levé (main à (46, -197) du pied dans la pose « carton »).
        if (!good && t >= IMPACT) {
          var pop = outBack(clamp((t - IMPACT) / 260, 0, 1)), cw = 20 * RS * pop, ch = 28 * RS * pop;
          $('cardLayer').innerHTML = '<rect x="' + f2(RX + 46 * RS - cw / 2) + '" y="' + f2(RY - 197 * RS - ch) + '" width="' + f2(cw) + '" height="' + f2(ch) + '" rx="2" fill="#ffd400" stroke="rgba(0,0,0,.35)"/>';
        } else $('cardLayer').innerHTML = '';
      }
      once(t, IMPACT, 'impact', function () {
        impactAt = t;
        post({ type: 'impact', strength: good ? 'heavy' : 'medium' });
        if (good && P.kind === 'rally') burst(80);
      });
    }
    $('flash').style.opacity = f2(good && P.kind === 'rally' ? bell((t - IMPACT) / 240) * 0.45 : 0);
    var shk = t - impactAt, amp2 = good && shk >= 0 && shk < 380 ? (1 - shk / 380) * 8 : 0;
    $('stage').style.transform = amp2 ? 'translate(' + f2(Math.sin(shk * 0.09) * amp2) + 'px,' + f2(Math.cos(shk * 0.07) * amp2 * 0.6) + 'px)' : '';

    // Plan C : la réaction.
    if (inC) {
      once(t, C_START, 'react', function () {
        if (heroC) heroC.setPose(good ? 'celebrate' : 'despair');
        if (good) burst(90);
      });
      once(t, C_START + 800, 'burst2', function () { if (good) burst(50); });
      tr($('heroC'), 'translateX(-50%) scale(' + (1 + 0.04 * seg(t, C_START, END, inOut)).toFixed(4) + ')');
      resL.forEach(function (s, i) {
        var p = seg(t, C_START + 120 + i * 50, C_START + 600 + i * 50, outBack);
        s.style.opacity = clamp(p * 1.4, 0, 1);
        tr(s, 'translateY(' + ((1 - p) * -50).toFixed(1) + 'px) scale(' + (1.4 - 0.4 * p).toFixed(3) + ')');
      });
    }
    $('skip').style.opacity = f2(seg(t, 900, 1300) * 0.9);
    drawBits();
  }

  // ── Boucle, fin et toucher ───────────────────────────────────
  var start = performance.now(), finished = false, endAt = 0;
  // Aperçu navigateur : ?t=3000 fige la chronologie à cet instant (sans effet dans l'app).
  var frozen = /[?&]t=(\\d+)/.exec(location.search || '');
  var finish = function () {
    if (finished) return;
    finished = true;
    endAt = performance.now();
    setTimeout(function () { rigs.forEach(function (r) { r.stop(); }); post({ type: 'done' }); }, 340);
  };
  var frame = function (now) {
    var t = frozen ? Number(frozen[1]) : now - start;
    render(t);
    if (t >= END && !frozen) finish();
    if (finished) {
      var out = clamp((now - endAt) / 320, 0, 1);
      $('stage').style.opacity = 1 - out;
      if (out >= 1) return;
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  var onTap = function () { if (performance.now() - start > 600) finish(); };
  document.addEventListener('click', onTap);
  document.addEventListener('touchend', onTap);
})();
</script>
</body>
</html>`;

},
"cinematics/duelTemplate": function (exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DUEL_TEMPLATE = void 0;
exports.DUEL_TEMPLATE = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<style>
  :root { --c1: #d62828; --safeTop: env(safe-area-inset-top, 0px); --safeBottom: env(safe-area-inset-bottom, 0px); }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
  body { font-family: "Oswald", "Avenir Next Condensed", "HelveticaNeue-CondensedBold", "Roboto Condensed", "Arial Narrow", sans-serif;
    color: #fff; -webkit-user-select: none; user-select: none; -webkit-tap-highlight-color: transparent; }
  #stage { position: absolute; inset: 0; overflow: hidden; background: #04060a; }
  .shot { position: absolute; inset: 0; opacity: 0; will-change: opacity, transform; }
  svg.full { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
  .close { background:
      radial-gradient(ellipse at 50% 95%, rgba(255,255,255,.16) 0%, transparent 45%),
      radial-gradient(ellipse at 50% 30%, color-mix(in srgb, var(--c1) 35%, #0b1220) 0%, #05070c 70%); }
  .bokeh { position: absolute; border-radius: 50%; filter: blur(10px); opacity: .55; }
  .closeHero { position: absolute; left: 50%; bottom: calc(var(--safeBottom) - 10px); width: min(108vw, 470px); transform: translateX(-50%); }
  .closeHero svg { display: block; width: 100%; height: auto; filter: drop-shadow(0 20px 30px rgba(0,0,0,.5)); }
  .crowdBand { position: absolute; left: 0; right: 0; bottom: 0; height: 34%; }
  #titleBox { position: absolute; left: 16px; right: 16px; top: calc(var(--safeTop) + 70px); text-align: center; }
  #momentTitle { font-size: 15px; letter-spacing: 5px; text-transform: uppercase; opacity: 0; }
  #bigWord { margin-top: 8px; padding-left: 6px; font-size: 76px; line-height: 1; font-weight: 700; letter-spacing: 6px; text-transform: uppercase; white-space: nowrap;
    text-shadow: 0 6px 30px rgba(0,0,0,.55); }
  #bigWord span, #resultWord span { display: inline-block; will-change: transform, opacity; }
  #resultBox { position: absolute; left: 12px; right: 12px; top: calc(var(--safeTop) + 64px); text-align: center; }
  #resultWord { padding-left: 4px; font-size: 84px; line-height: 1; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; white-space: nowrap;
    text-shadow: 0 8px 34px rgba(0,0,0,.55); }
  #resultWord.good { color: #ffd65a; text-shadow: 0 0 34px rgba(255,214,90,.55), 0 8px 30px rgba(0,0,0,.5); }
  #resultWord.bad { color: #ffffff; opacity: .92; }
  #vignette { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,.55) 100%); }
  #flash { position: absolute; inset: 0; background: #fff; opacity: 0; pointer-events: none; }
  #black { position: absolute; inset: 0; background: #000; opacity: 0; pointer-events: none; }
  #confetti { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
  #skip { position: absolute; left: 0; right: 0; bottom: calc(var(--safeBottom) + 10px); text-align: center; opacity: 0;
    font-family: -apple-system, system-ui, sans-serif; font-size: 11px; letter-spacing: 1px; color: rgba(255,255,255,.6); }
</style>
</head>
<body>
<div id="stage">
  <div class="shot close" id="shotA">
    <div id="bokehA"></div>
    <svg class="crowdBand" id="crowdA" viewBox="0 0 400 120" preserveAspectRatio="none"></svg>
    <div class="closeHero" id="heroA"></div>
    <div id="titleBox"><div id="momentTitle"></div><div id="bigWord"></div></div>
  </div>
  <div class="shot" id="shotB">
    <svg class="full" id="pitch" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice"></svg>
  </div>
  <div class="shot close" id="shotC">
    <div id="bokehC"></div>
    <svg class="crowdBand" id="crowdC" viewBox="0 0 400 120" preserveAspectRatio="none"></svg>
    <div class="closeHero" id="heroC"></div>
    <div id="resultBox"><div id="resultWord"></div></div>
  </div>
  <div id="vignette"></div>
  <canvas id="confetti"></canvas>
  <div id="flash"></div>
  <div id="black"></div>
  <div id="skip"></div>
</div>
<script>/*__RIG_JS__*/</script>
<script>
window.CINE = /*__CINE_DATA__*/null;
(function () {
  var D = window.CINE || {};
  var L = D.labels || {};
  var P = D.plan || { kind: 'tackle', option: 'tackle', side: 1, success: true, card: null, result: 'won' };
  var good = !!P.success;
  var $ = function (id) { return document.getElementById(id); };
  var post = function (msg) {
    var s = JSON.stringify(msg);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(s);
    else if (window.parent && window.parent !== window) window.parent.postMessage(s, '*');
  };
  var NS = 'http://www.w3.org/2000/svg';

  // ── Outils de temps ─────────────────────────────────────────
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var outCubic = function (p) { return 1 - Math.pow(1 - p, 3); };
  var inOut = function (p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
  var outBack = function (p) { var c = 1.6; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
  var seg = function (t, a, b, ease) { var p = clamp((t - a) / (b - a), 0, 1); return (ease || outCubic)(p); };
  var bell = function (p) { return p <= 0 || p >= 1 ? 0 : Math.sin(Math.PI * p); };
  var seeded = function (i, salt) { var x = Math.sin(i * 12.9898 + (salt || 0) * 78.233) * 43758.5453; return x - Math.floor(x); };
  var f2 = function (n) { return Math.round(n * 100) / 100; };

  var ourKit = D.kit || { c1: '#d62828', c2: '#151515' };
  var keeperKit = D.oppKeeperKit || { c1: '#f97316', c2: '#111111' };
  var oppKit = D.oppKit || { c1: '#f4f4f4', c2: '#1d3a8a' };
  var root = document.documentElement.style;
  root.setProperty('--c1', ourKit.c1);
  if (D.safeTop != null) root.setProperty('--safeTop', D.safeTop + 'px');
  if (D.safeBottom != null) root.setProperty('--safeBottom', D.safeBottom + 'px');

  // ── La chronologie (le reste dépend du cas, voir la chorégraphie) ─
  var A_END = 1500;

  // ── Mise en place des textes ─────────────────────────────────
  var letters = function (el, text) {
    el.innerHTML = '';
    return String(text || '').split('').map(function (ch) {
      var s = document.createElement('span');
      s.textContent = ch === ' ' ? '\\u00a0' : ch;
      el.appendChild(s);
      return s;
    });
  };
  $('momentTitle').textContent = D.title || '';
  var bigL = letters($('bigWord'), String(L.word || '').toUpperCase());
  var resL = letters($('resultWord'), String(L.result || '').toUpperCase());
  $('resultWord').className = good ? 'good' : 'bad';
  $('skip').textContent = L.skip || '';
  // Les grands mots tiennent toujours dans la largeur de l'écran (marge pour le battement de cœur).
  var fitWord = function (el, max) {
    var spans = el.querySelectorAll('span');
    if (!spans.length) return;
    var width = function () { return spans[spans.length - 1].getBoundingClientRect().right - spans[0].getBoundingClientRect().left; };
    var size = max;
    el.style.fontSize = size + 'px';
    while (size > 30 && width() > el.clientWidth * 0.92) { size -= 2; el.style.fontSize = size + 'px'; }
  };
  fitWord($('bigWord'), 76);
  fitWord($('resultWord'), 84);

  // Lumières floues et public des gros plans.
  ['bokehA', 'bokehC'].forEach(function (id, k) {
    var html = '';
    for (var i = 0; i < 9; i++) {
      var sz = 30 + seeded(i, k + 1) * 70;
      html += '<div class="bokeh" style="left:' + (seeded(i, k + 2) * 100).toFixed(1) + '%;top:' + (5 + seeded(i, k + 3) * 45).toFixed(1) +
        '%;width:' + sz.toFixed(0) + 'px;height:' + sz.toFixed(0) + 'px;background:' + (i % 3 ? 'rgba(255,240,210,.5)' : 'rgba(255,255,255,.35)') + '"></div>';
    }
    $(id).innerHTML = html;
  });
  var crowd = function () {
    var s = '';
    for (var row = 0; row < 2; row++) {
      var y = 60 + row * 26, col = row ? 'rgba(0,0,0,.8)' : 'rgba(0,0,0,.5)';
      s += '<rect x="0" y="' + (y + 8) + '" width="400" height="80" fill="' + col + '"/>';
      for (var k = 0; k < 24; k++) {
        var x = k * 17 + (row ? 8 : 0) + seeded(k, row) * 6, r = 7 + seeded(k, row + 3) * 3;
        s += '<circle cx="' + x.toFixed(1) + '" cy="' + (y - seeded(k, row + 5) * 6).toFixed(1) + '" r="' + r.toFixed(1) + '" fill="' + col + '"/>';
        s += '<rect x="' + (x - r * 1.5).toFixed(1) + '" y="' + (y + 3).toFixed(1) + '" width="' + (r * 3).toFixed(1) + '" height="24" rx="7" fill="' + col + '"/>';
      }
    }
    return s;
  };
  $('crowdA').innerHTML = crowd();
  $('crowdC').innerHTML = crowd();

  // ── Plan B : vue télé derrière notre joueur, le but au fond ──
  // En attaque (tête, faute obtenue), le but adverse est proche ; en défense, on regarde vers le milieu.
  var ATTACK = P.kind === 'header' || P.kind === 'drawn';
  var G = ATTACK ? { x0: 116, x1: 284, bar: 344, line: 400, post: 4 } : { x0: 180, x1: 220, bar: 320, line: 333, post: 2 };
  var onGoal = function (u, v) { return { x: (G.x0 + G.x1) / 2 + u * (G.x1 - G.x0) / 2, y: G.line - v * (G.line - G.bar) }; };
  var HORIZON = 312;
  var S = P.side || 1;

  var svg = '<defs>' +
    '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03050b"/><stop offset="1" stop-color="#101a33"/></linearGradient>' +
    '<radialGradient id="glow"><stop offset="0" stop-color="rgba(255,250,235,.95)"/><stop offset=".25" stop-color="rgba(255,250,235,.35)"/><stop offset="1" stop-color="rgba(255,250,235,0)"/></radialGradient>' +
    '<linearGradient id="grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d6531"/><stop offset="1" stop-color="#2f8f47"/></linearGradient>' +
    '</defs>';
  svg += '<rect width="400" height="' + (HORIZON + 10) + '" fill="url(#sky)"/>';
  svg += '<circle cx="40" cy="40" r="110" fill="url(#glow)" opacity=".5"/><circle cx="360" cy="40" r="110" fill="url(#glow)" opacity=".5"/>';
  var standsTop = 66;
  svg += '<rect x="0" y="' + standsTop + '" width="400" height="' + (HORIZON - standsTop) + '" fill="#0a0f1c"/>';
  var phones = [];
  for (var row = 0; row * 24 < HORIZON - standsTop - 26; row++) {
    var yy = standsTop + 12 + row * 24, cc = 'rgba(' + (14 + row * 3) + ',' + (20 + row * 4) + ',' + (36 + row * 5) + ',1)';
    for (var k = 0; k < 40; k++) {
      var xx = k * 10.4 + (row % 2 ? 5.2 : 0) + seeded(k, row + 20) * 3;
      svg += '<circle cx="' + xx.toFixed(1) + '" cy="' + yy.toFixed(1) + '" r="3.9" fill="' + cc + '"/>';
      svg += '<rect x="' + (xx - 5).toFixed(1) + '" y="' + (yy + 2.6).toFixed(1) + '" width="10" height="13" rx="3" fill="' + cc + '"/>';
      if (seeded(k, row + 40) < 0.2) phones.push({ x: xx, y: yy - 2, at: seeded(k, row + 60), sp: 0.6 + seeded(k, row + 80) });
    }
  }
  phones.forEach(function (p, i) { svg += '<circle id="ph' + i + '" cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="1.6" fill="#fff" opacity="0"/>'; });
  svg += '<rect x="0" y="' + (HORIZON - 13) + '" width="400" height="13" fill="' + ourKit.c1 + '" opacity=".85"/>';
  svg += '<rect x="0" y="' + (HORIZON - 13) + '" width="400" height="2.5" fill="rgba(255,255,255,.35)"/>';
  var grassH = 800 - HORIZON;
  svg += '<rect x="0" y="' + HORIZON + '" width="400" height="' + grassH + '" fill="url(#grass)"/>';
  for (var b = 0; b < 14; b += 2) {
    var y0 = HORIZON + grassH * Math.pow(b / 14, 1.8), y1 = HORIZON + grassH * Math.pow((b + 1) / 14, 1.8);
    svg += '<rect x="0" y="' + y0.toFixed(1) + '" width="400" height="' + (y1 - y0).toFixed(1) + '" fill="rgba(255,255,255,.05)"/>';
  }
  var line = 'stroke="rgba(255,255,255,.72)" fill="none" stroke-linejoin="round"';
  svg += '<line x1="-20" y1="' + G.line + '" x2="420" y2="' + G.line + '" stroke-width="1.7" stroke="rgba(255,255,255,.76)"/>';
  if (ATTACK) {
    svg += '<path d="M92 ' + G.line + ' L82 420 L318 420 L308 ' + G.line + '" stroke-width="1.8" ' + line + '/>';
    svg += '<path d="M10 ' + G.line + ' L-50 500 L450 500 L390 ' + G.line + '" stroke-width="2" ' + line + '/>';
    svg += '<ellipse cx="200" cy="462" rx="3.4" ry="1.4" fill="rgba(255,255,255,.8)"/>';
    svg += '<path d="M150 500 Q200 528 250 500" stroke-width="2" ' + line + '/>';
  } else {
    // Le rond central et la ligne médiane, loin devant ; la surface adverse au fond.
    svg += '<path d="M160 ' + G.line + ' L156 345 L244 345 L240 ' + G.line + '" stroke-width="1.2" ' + line + '/>';
    svg += '<line x1="-20" y1="452" x2="420" y2="452" stroke-width="2" stroke="rgba(255,255,255,.7)"/>';
    svg += '<ellipse cx="200" cy="452" rx="92" ry="20" stroke-width="2" ' + line + '/>';
  }
  svg += '<path d="M' + G.x0 + ' ' + G.bar + ' L' + (G.x0 + 10) + ' ' + (G.bar - 8) + ' L' + (G.x1 - 10) + ' ' + (G.bar - 8) + ' L' + G.x1 + ' ' + G.bar +
    ' L' + G.x1 + ' ' + G.line + ' L' + G.x0 + ' ' + G.line + ' Z" fill="rgba(0,0,0,.28)"/>';
  svg += '<g id="net"></g><g id="ballFar"></g>';
  svg += '<g id="frame"><rect x="' + (G.x0 - G.post) + '" y="' + (G.bar - G.post) + '" width="' + G.post + '" height="' + (G.line - G.bar + G.post) + '" fill="#f4f4f4"/>' +
    '<rect x="' + G.x1 + '" y="' + (G.bar - G.post) + '" width="' + G.post + '" height="' + (G.line - G.bar + G.post) + '" fill="#f4f4f4"/>' +
    '<rect x="' + (G.x0 - G.post) + '" y="' + (G.bar - G.post) + '" width="' + (G.x1 - G.x0 + 2 * G.post) + '" height="' + G.post + '" fill="#f4f4f4"/></g>';
  svg += '<g id="keeperLayer"></g><g id="refLayer"></g><g id="oppLayer"></g><g id="mateLayer"></g><g id="ballNear"></g><g id="meLayer"></g><g id="cardLayer"></g>';
  $('pitch').innerHTML = svg;
  var phoneEls = phones.map(function (p, i) { return $('ph' + i); });

  var R = window.DestinyRig;
  var mk = function (parent) {
    var g = document.createElementNS(NS, 'g');
    var inner = document.createElementNS(NS, 'g'); g.appendChild(inner);
    $(parent).appendChild(g);
    return { g: g, inner: inner };
  };
  var rigs = [];
  var mount = function (grp, opts) { var r = R ? R.mount(grp.inner, opts) : null; if (r) rigs.push(r); return r; };
  var heroA = null, heroC = null;
  if (R && D.avatar) {
    $('heroA').innerHTML = '<svg viewBox="-115 -318 230 330"><g id="hA"></g></svg>';
    $('heroC').innerHTML = '<svg viewBox="-115 -318 230 330"><g id="hC"></g></svg>';
    heroA = R.mount($('hA'), { avatar: D.avatar, kit: ourKit, pose: 'focus', uid: 'a', shadow: false });
    heroC = R.mount($('hC'), { avatar: D.avatar, kit: ourKit, pose: 'front', uid: 'c', shadow: false });
    rigs.push(heroA, heroC);
  }

  // ── La chorégraphie ─────────────────────────────────────────
  var ease2 = function (q) { return q < 0.5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2; };
  /** Images clés [t, x, y, échelle] → position à l'instant t (interpolation douce entre deux clés). */
  var path = function (keys) {
    return function (t) {
      if (t <= keys[0][0]) return { x: keys[0][1], y: keys[0][2], s: keys[0][3] };
      for (var i = 1; i < keys.length; i++) {
        if (t <= keys[i][0]) {
          var a = keys[i - 1], b = keys[i], p = ease2((t - a[0]) / (b[0] - a[0]));
          return { x: a[1] + (b[1] - a[1]) * p, y: a[2] + (b[2] - a[2]) * p, s: a[3] + (b[3] - a[3]) * p };
        }
      }
      var z = keys[keys.length - 1];
      return { x: z[1], y: z[2], s: z[3] };
    };
  };
  var pt = function (x, y, r) { return { x: x, y: y, r: r }; };
  var feetOf = function (p, tt, dribbling, t0) {
    var touch = dribbling ? ((tt - t0) % 330 + 330) % 330 / 330 : 0.6;
    return pt(p.x + 56 * p.s, p.y - (8 + 22 * (1 - touch)) * p.s, 12 * p.s);
  };
  var headOf = function (p, lift) { return pt(p.x, p.y - 205 * p.s - (lift || 0), 6 + 8 * p.s); };
  var legs = [], endMode = 'rest', IMPACT = 0, END_B = 0, cues = [], carry = null;
  var leg = function (t0, t1, from, to, arc) { legs.push({ t0: t0, t1: t1, from: from, to: to, arc: arc || 0 }); };
  var lunges = [], jumps = [], keeperDive = null, keeperOut = null, TG = null, CARD = null, WHISTLE = null;
  var oppAv = function (i) { return (D.wallAvatars && D.wallAvatars[i]) || D.oppAvatar; };
  var meG = mk('meLayer');
  var meRig = mount(meG, { avatar: D.avatar, kit: ourKit, pose: 'back', uid: 'm', shadow: true, shirtName: D.shirtName, shirtNumber: D.number });
  var keeperG = mk('keeperLayer'), keeperRig = null;
  if (ATTACK) keeperRig = mount(keeperG, { avatar: D.oppAvatar, kit: keeperKit, pose: 'keeper', uid: 'k', shadow: true });
  var oppG = mk('oppLayer'), oppRig = mount(oppG, { avatar: oppAv(0), kit: oppKit, pose: 'front', uid: 'd', shadow: true });
  var mateG = null, mateRig = null, refG = null, refRig = null, meAt, oppAt, mateAt = null, refAt = null;
  /** Le ballon au pied de l'adversaire qui court vers nous : devant lui, donc plus près de la caméra. */
  var oppFeet = function (p) { return pt(p.x - 36 * p.s, p.y + 10 * p.s, 12 * p.s); };
  var addRef = function (t0, from, to) {
    refG = mk('refLayer');
    refRig = mount(refG, { avatar: D.refAvatar || D.oppAvatar, kit: { c1: '#151515', c2: '#151515', ink: '#ffffff' }, pose: 'front', uid: 'r', shadow: true });
    refAt = path([[t0, from[0], from[1], from[2]], [t0 + 800, to[0], to[1], to[2]]]);
  };
  var S2 = S;

  if (P.kind === 'tackle' || P.kind === 'foul') {
    // L'attaquant arrive balle au pied ; notre joueur se jette (tacle, ou faute assumée).
    var HIT = 3350;
    meAt = path([[1700, 132, 780, 0.72], [3150, 146, 732, 0.68]]);
    oppAt = path(P.kind === 'tackle' && !P.success
      ? [[1700, 222, 470, 0.4], [HIT, 214, 640, 0.57], [4150, 250, 830, 0.82]]
      : [[1700, 222, 470, 0.4], [HIT, 214, 640, 0.57]]);
    carry = [1500, P.kind === 'tackle' && !P.success ? 4150 : HIT, 'opp'];
    // Tacle glissé (pose de joueur de champ, pas un plongeon de gardien).
    lunges.push({ g: meG, at: HIT - 220, side: 1, reach: 30, slide: true });
    cues.push([HIT - 220, meRig, 'slideBack']);
    if (P.kind === 'tackle' && !P.success) {
      jumps.push({ g: oppG, t0: HIT - 120, t1: HIT + 320, h: 30 });
      endMode = 'vanish'; IMPACT = HIT;
    } else {
      // Le ballon file ; l'attaquant tombe.
      lunges.push({ g: oppG, at: HIT + 20, side: 1, reach: 12 });
      var hp = oppFeet(oppAt(HIT));
      leg(HIT, HIT + 650, hp, P.kind === 'tackle' ? pt(330, 790, 14) : pt(hp.x + 26, hp.y + 16, 12), 10);
      IMPACT = HIT;
      if (P.kind === 'foul') {
        WHISTLE = HIT + 80;
        addRef(HIT + 200, [200 + S * 190, 520, 0.42], [200 + S * 92, 600, 0.5]);
        CARD = { at: HIT + 1250, color: P.card === 'red' ? '#e5243b' : '#ffd400' };
        cues.push([CARD.at - 350, refRig, 'card']);
        IMPACT = CARD.at;
      }
    }
  } else if (P.kind === 'jockey') {
    // Notre joueur recule en restant face à lui et le pousse vers la ligne de touche.
    oppAt = path(P.success
      ? [[1700, 205, 470, 0.4], [3000, 196, 600, 0.52], [3800, 200 + S * 128, 640, 0.56]]
      : [[1700, 205, 470, 0.4], [3000, 196, 600, 0.52], [3400, 200 + S * 72, 612, 0.53], [4050, 200 - S * 60, 800, 0.8]]);
    meAt = path(P.success
      ? [[1700, 140, 742, 0.7], [3000, 146, 762, 0.71], [3800, 146 + S * 92, 752, 0.7]]
      : [[1700, 140, 742, 0.7], [3000, 146, 762, 0.71], [3400, 146 + S * 76, 762, 0.71]]);
    if (P.success) {
      carry = [1500, 3800, 'opp'];
      var ep = oppFeet(oppAt(3800));
      leg(3800, 4400, ep, pt(200 + S * 250, 720, 13), 6);
      IMPACT = 3800;
    } else {
      carry = [1500, 4050, 'opp'];
      endMode = 'vanish'; IMPACT = 3500;
    }
  } else if (P.kind === 'mark') {
    // Une passe part vers l'attaquant que notre joueur marque : il coupe la trajectoire, ou pas.
    var REC = 3500;
    oppAt = path(P.success ? [[1700, 252, 540, 0.46], [REC, 244, 566, 0.48]] : [[1700, 252, 540, 0.46], [REC, 244, 566, 0.48], [4300, 330, 506, 0.43]]);
    meAt = path(P.success ? [[1700, 196, 700, 0.64], [REC - 100, 222, 612, 0.56], [4300, 120, 770, 0.72]] : [[1700, 196, 700, 0.64], [REC - 100, 205, 650, 0.6]]);
    var from = pt(140, 372, 5);
    if (P.success) {
      var cutP = feetOf(meAt(REC - 60), REC - 60, false, 0);
      leg(2900, REC - 60, from, cutP, 4);
      carry = [REC - 60, 4300, 'me'];
      IMPACT = REC - 60;
    } else {
      leg(2900, REC, from, oppFeet(oppAt(REC)), 4);
      carry = [REC, 4300, 'opp'];
      endMode = 'vanish'; IMPACT = REC + 200;
    }
  } else if (P.kind === 'clear') {
    // Un centre arrive : notre joueur saute et renvoie le ballon loin (ou le manque).
    var HEADT = 3700;
    meAt = path([[1700, 150, 760, 0.7], [3500, 160, 702, 0.64]]);
    oppAt = path([[1700, 262, 560, 0.48], [3500, 250, 612, 0.53]]);
    jumps.push({ g: meG, t0: HEADT - 260, t1: HEADT + 300, h: 34 });
    jumps.push({ g: oppG, t0: HEADT - 220, t1: HEADT + 260, h: 22 });
    cues.push([HEADT - 260, meRig, 'headerBack']); cues.push([HEADT - 220, oppRig, 'header']);
    var mh = headOf(meAt(HEADT), 34);
    mh = pt(mh.x + 18, mh.y + 6, mh.r);
    leg(2600, HEADT, pt(200 + S * 250, 360, 5), mh, 150);
    if (P.success) leg(HEADT, HEADT + 800, mh, pt(200 - S * 70, 318, 3), 70);
    else leg(HEADT, HEADT + 520, mh, pt(205, 830, 24), 10);
    endMode = 'vanish'; IMPACT = HEADT;
  } else if (P.kind === 'drawn') {
    // Notre joueur file vers le but ; le défenseur le fauche. Faute sifflée, ou simulation.
    var CLIP = 3350;
    meAt = path([[1700, 170, 800, 0.74], [CLIP, 178, 640, 0.6]]);
    oppAt = path([[1700, 212, 520, 0.46], [CLIP, 200, 608, 0.55]]);
    carry = [1500, CLIP, 'me'];
    lunges.push({ g: oppG, at: CLIP - 200, side: -1, reach: 22, slide: true });
    cues.push([CLIP - 200, oppRig, 'slide']);
    lunges.push({ g: meG, at: CLIP, side: 1, reach: 10 });
    var cp2 = feetOf(meAt(CLIP), CLIP, false, 0);
    leg(CLIP, CLIP + 600, cp2, pt(cp2.x + 20, cp2.y - 60, 8), 4);
    WHISTLE = P.success ? CLIP + 120 : null;
    addRef(CLIP + 200, [200 + S * 190, 500, 0.4], [200 + S * 108, 560, 0.46]);
    cues.push([CLIP + 1100, refRig, P.success ? 'wave' : 'card']);
    if (!P.success) CARD = { at: CLIP + 1250, color: '#ffd400' };
    IMPACT = CLIP + 1100;
  } else {
    // Tête offensive : le centre arrive du côté S ; notre joueur (ou le coéquipier sur l'écran) attaque le ballon.
    var HEAD = 3900, op = P.option;
    var spots = { near: [200 + S * 52, 462, 0.42], far: [200 - S * 58, 470, 0.42], spot: [205, 480, 0.43], screen: [200 + S * 8, 432, 0.37] };
    var sp = spots[op] || spots.spot;
    meAt = path([[1700, 180, 650, 0.55], [HEAD - 100, sp[0], sp[1], sp[2]]]);
    oppAt = path([[1700, 225, 600, 0.5], [HEAD - 100, sp[0] + (op === 'far' ? 56 : -56) * S, sp[1] - 10, sp[2] - 0.02]]);
    var header = 'me', headerG = meG;
    if (op === 'screen') {
      mateG = mk('mateLayer'); mateRig = mount(mateG, { avatar: (D.mateAvatars && D.mateAvatars[0]) || D.oppAvatar, kit: ourKit, pose: 'back', uid: 't', shadow: true });
      mateAt = path([[1700, 240, 640, 0.52], [HEAD - 100, 200 - S * 58, 470, 0.42]]);
      header = 'mate'; headerG = mateG;
    }
    jumps.push({ g: headerG, t0: HEAD - 260, t1: HEAD + 340, h: 26 });
    jumps.push({ g: oppG, t0: HEAD - 230, t1: HEAD + 300, h: 18 });
    cues.push([HEAD - 260, header === 'me' ? meRig : mateRig, 'headerBack']);
    // Le point de contact, un peu sur le côté de la tête (vu de dos, la tête cacherait le ballon).
    var hh = headOf((header === 'me' ? meAt : mateAt)(HEAD), 26);
    hh = pt(hh.x + S * 20, hh.y + 6, hh.r);
    leg(2700, HEAD, pt(200 + S * 240, 430, 6), hh, 150);
    if (P.success) {
      TG = onGoal(op === 'near' ? -S * 0.5 : op === 'far' ? S * 0.55 : -S * 0.35, 0.55);
      leg(HEAD, HEAD + 420, hh, pt(TG.x, TG.y, 4.4), 6);
      keeperDive = { at: HEAD + 40, side: TG.x > 200 ? -1 : 1, reach: 26 };
      endMode = 'net';
    } else if (op === 'spot' || op === 'screen') {
      keeperDive = { at: HEAD + 40, side: S, reach: 18 };
      leg(HEAD, HEAD + 380, hh, pt(200 + S * 18, 380, 5), 6);
      endMode = 'vanish';
    } else {
      var wide = onGoal(op === 'near' ? S * 1.35 : -S * 1.35, 0.4);
      leg(HEAD, HEAD + 500, hh, pt(wide.x, wide.y, 3.6), 6);
      endMode = 'rest';
    }
    IMPACT = HEAD + 420;
  }
  END_B = IMPACT + 900;
  var C_START = END_B + 200, END = C_START + 2500;
  var lastLeg = legs[legs.length - 1];
  // Les segments qui partent du pied de notre joueur commencent là où est le ballon à cet instant.
  legs.forEach(function (L) { if (!L.from) L.from = feetOf(meAt(L.t0), L.t0, false, 0); });

  var keeperAt = function (t) {
    var k = { x: 200, y: 404, s: 0.19, lift: 0, rot: 0 };
    if (keeperOut) {
      var p = ease2(clamp((t - keeperOut[0]) / (keeperOut[1] - keeperOut[0]), 0, 1));
      k.x += (keeperOut[2].x - k.x) * p; k.y += (keeperOut[2].y - k.y) * p; k.s += (keeperOut[2].s - k.s) * p;
    }
    if (keeperDive) {
      var dv = outCubic(clamp((t - keeperDive.at) / 420, 0, 1));
      k.x += keeperDive.side * keeperDive.reach * dv; k.rot = keeperDive.side * 72 * dv; k.lift = 8 * bell(dv * 0.92);
    }
    jumps.forEach(function (j) { if (j.keeper) k.lift += j.h * bell((t - j.t0) / (j.t1 - j.t0)); });
    return k;
  };
  if (keeperDive) cues.push([keeperDive.at, keeperRig, 'stretch']);

  var netG = $('net');
  var drawNet = function (amp) {
    var cols = 22, rws = 7, d = '';
    var disp = function (x, y) {
      if (!amp || !TG) return [x, y];
      var dx = x - TG.x, dy = y - TG.y, dist2 = dx * dx + dy * dy, k = amp * Math.exp(-dist2 / 400), len = Math.sqrt(dist2) || 1;
      return [x - dx / len * k * 0.35, y - dy / len * k * 0.35 - k * 0.25];
    };
    for (var i = 0; i <= cols; i++) {
      var x = G.x0 + i * (G.x1 - G.x0) / cols;
      for (var j = 0; j <= rws; j++) { var p = disp(x, G.bar + j * (G.line - G.bar) / rws); d += (j ? 'L' : 'M') + f2(p[0]) + ' ' + f2(p[1]); }
    }
    for (var j2 = 0; j2 <= rws; j2++) {
      var y = G.bar + j2 * (G.line - G.bar) / rws;
      for (var i2 = 0; i2 <= cols; i2++) { var q = disp(G.x0 + i2 * (G.x1 - G.x0) / cols, y); d += (i2 ? 'L' : 'M') + f2(q[0]) + ' ' + f2(q[1]); }
    }
    netG.innerHTML = '<path d="' + d + '" fill="none" stroke="rgba(255,255,255,.32)" stroke-width="0.65"/>';
  };
  var ballSvg = function (x, y, r, spin) {
    return '<g transform="translate(' + f2(x) + ' ' + f2(y) + ') rotate(' + f2(spin) + ')">' +
      '<circle r="' + f2(r) + '" fill="#fafafa" stroke="#cfd8dc" stroke-width="' + f2(r * 0.08) + '"/>' +
      '<circle cx="' + f2(-r * 0.25) + '" cy="' + f2(-r * 0.2) + '" r="' + f2(r * 0.32) + '" fill="#2b2b2b"/>' +
      '<circle cx="' + f2(r * 0.5) + '" cy="' + f2(r * 0.35) + '" r="' + f2(r * 0.2) + '" fill="#2b2b2b"/></g>';
  };
  /** Le ballon : au pied de notre joueur, puis segments (passe, centre, frappe), puis l'état final. */
  var ballAt = function (t) {
    // Porté par notre joueur ou par l'adversaire (avant : le premier segment montre d'où part le ballon).
    if (carry && t >= carry[0] && t < carry[1]) {
      var f = carry[2] === 'opp' ? oppFeet(oppAt(t)) : feetOf(meAt(t), t, true, carry[0]);
      return { x: f.x, y: f.y - f.r, r: f.r, spin: t * 0.6, far: false };
    }
    for (var i = 0; i < legs.length; i++) {
      var L = legs[i];
      if (t < L.t0) { return { x: L.from.x, y: L.from.y - L.from.r, r: L.from.r, spin: 0, far: false }; }
      if (t < L.t1) {
        var p = (t - L.t0) / (L.t1 - L.t0);
        var r = L.from.r + (L.to.r - L.from.r) * p;
        return { x: L.from.x + (L.to.x - L.from.x) * p, y: L.from.y + (L.to.y - L.from.y) * p - L.arc * bell(p) - r, r: r, spin: p * 720, far: false };
      }
    }
    if (!lastLeg) return null;
    if (endMode === 'net') { var sink = outCubic(clamp((t - lastLeg.t1) / 300, 0, 1)); return { x: lastLeg.to.x, y: lastLeg.to.y - 3 * sink + 9 * sink * sink, r: 4.2, spin: 720, far: true }; }
    if (endMode === 'rest') return { x: lastLeg.to.x, y: lastLeg.to.y - lastLeg.to.r, r: lastLeg.to.r, spin: 720, far: false };
    return null;
  };

  // ── Confettis ────────────────────────────────────────────────
  var cv = $('confetti'), cx = cv.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1), W = 0, H = 0;
  var resize = function () { W = window.innerWidth; H = window.innerHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  resize(); window.addEventListener('resize', resize);
  var bits = [];
  var burst = function (count) {
    var cols = [ourKit.c1, ourKit.c2, '#ffd65a', '#ffffff'];
    for (var i = 0; i < count; i++) {
      var sd = i % 2 ? 1 : -1, off = (10 + Math.random() * 32) * Math.PI / 180, v = 11 + Math.random() * 10;
      bits.push({ x: W / 2 + sd * W * 0.46, y: H * 0.82, vx: -sd * Math.sin(off) * v, vy: -Math.cos(off) * v, w: 6 + Math.random() * 6,
        h: 9 + Math.random() * 8, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, f: Math.random() * 6, vf: 0.15 + Math.random() * 0.2, c: cols[i % cols.length] });
    }
  };
  var drawBits = function () {
    cx.clearRect(0, 0, W, H);
    for (var i = bits.length - 1; i >= 0; i--) {
      var b = bits[i];
      b.vy += 0.32; b.vx *= 0.985; b.vy *= 0.985; b.x += b.vx; b.y += b.vy; b.r += b.vr; b.f += b.vf;
      if (b.y > H + 40) { bits.splice(i, 1); continue; }
      cx.save(); cx.translate(b.x, b.y); cx.rotate(b.r); cx.scale(1, Math.cos(b.f)); cx.fillStyle = b.c; cx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h); cx.restore();
    }
  };

  // ── Rendu ────────────────────────────────────────────────────
  var fired = {};
  var once = function (t, at, key, fn) { if (t >= at && !fired[key]) { fired[key] = true; fn(); } };
  var tr = function (el, s) { el.style.transform = s; };
  var impactAt = -1e9;

  function render(t) {
    var inB = t >= A_END && t < C_START, inC = t >= C_START;
    $('shotA').style.opacity = t < A_END ? 1 : 0;
    $('shotB').style.opacity = inB ? 1 : 0;
    $('shotC').style.opacity = inC ? 1 : 0;
    $('black').style.opacity = f2(Math.max(bell((t - A_END + 140) / 280), bell((t - C_START + 140) / 280), 1 - seg(t, 0, 300)));

    // Plan A : gros plan, titre, cœur qui bat.
    tr($('heroA'), 'translateX(-50%) scale(' + (1 + 0.06 * seg(t, 0, A_END, inOut)).toFixed(4) + ')');
    $('momentTitle').style.opacity = seg(t, 200, 600);
    bigL.forEach(function (s, i) {
      var p = seg(t, 350 + i * 45, 800 + i * 45, outBack);
      s.style.opacity = clamp(p * 1.4, 0, 1);
      tr(s, 'translateY(' + ((1 - p) * 60).toFixed(1) + 'px) scale(' + (0.7 + 0.3 * p).toFixed(3) + ')');
    });
    var beat = Math.max(bell((t - 650) / 160), bell((t - 900) / 160), bell((t - 1250) / 160));
    tr($('bigWord'), 'scale(' + (1 + 0.05 * beat).toFixed(3) + ')');
    once(t, 650, 'b1', function () { post({ type: 'impact', strength: 'medium' }); });
    once(t, 1250, 'b2', function () { post({ type: 'impact', strength: 'medium' }); });

    // Plan B.
    if (inB || t < A_END + 200) {
      var z = 1 + 0.06 * seg(t, A_END, IMPACT, inOut);
      tr($('pitch'), 'scale(' + z.toFixed(4) + ')');
      $('pitch').style.transformOrigin = '50% 55%';
      phoneEls.forEach(function (el, i) {
        var p = phones[i], ph = ((t / 1000) * p.sp + p.at) % 1;
        el.setAttribute('opacity', (bell(ph / 0.2) * (t > IMPACT && good ? 1 : 0.5)).toFixed(2));
      });
      cues.forEach(function (c, i) { once(t, c[0], 'cue' + i, function () { if (c[1]) c[1].setPose(c[2]); }); });
      var place = function (grp, p, lift, rot) {
        grp.g.setAttribute('transform', 'translate(' + f2(p.x) + ' ' + f2(p.y - (lift || 0)) + ') rotate(' + f2(rot || 0) + ' 0 ' + f2(-150 * p.s) + ') scale(' + f2(p.s) + ')');
      };
      // Les joueurs : position, rebond de course, glissade (lunges), saut (jumps).
      var actors = [[meG, meAt], [oppG, oppAt], [mateG, mateAt], [refG, refAt]];
      actors.forEach(function (a) {
        if (!a[0] || !a[1]) return;
        var p = a[1](t), q = a[1](t - 60), lift = 0, rot = 0;
        if (Math.abs(p.y - q.y) + Math.abs(p.x - q.x) > 0.6) lift = Math.abs(Math.sin(t / 105)) * 6 * p.s;
        lunges.forEach(function (l) {
          if (l.g !== a[0]) return;
          var e = outCubic(clamp((t - l.at) / 360, 0, 1));
          // Glissade : le corps s'abaisse et s'incline à peine ; chute : il bascule au sol.
          p = { x: p.x + l.side * l.reach * e, y: p.y + (l.slide ? 18 : 8) * e, s: p.s }; rot = l.side * (l.slide ? 18 : 66) * e; lift = 0;
        });
        jumps.forEach(function (j) { if (j.g === a[0]) lift += j.h * bell((t - j.t0) / (j.t1 - j.t0)); });
        place(a[0], p, lift, rot);
      });
      // Le carton, brandi par l'arbitre.
      if (CARD && refAt && t >= CARD.at) {
        var rp = refAt(t), pop = outBack(clamp((t - CARD.at) / 260, 0, 1));
        // Le carton dans le poing levé : la main est à (46, -197) du pied dans la pose « carton ».
        var cw = 20 * rp.s * pop, ch = 28 * rp.s * pop;
        $('cardLayer').innerHTML = '<rect x="' + f2(rp.x + 46 * rp.s - cw / 2) + '" y="' + f2(rp.y - 197 * rp.s - ch) + '" width="' + f2(cw) + '" height="' + f2(ch) + '" rx="2" fill="' + CARD.color + '" stroke="rgba(0,0,0,.35)" stroke-width="1"/>';
      } else $('cardLayer').innerHTML = '';
      if (WHISTLE) once(t, WHISTLE, 'whistle', function () { post({ type: 'impact', strength: 'medium' }); });
      var k = keeperAt(t);
      place(keeperG, k, k.lift, k.rot);
      var bl = ballAt(t), farL = '', nearL = '';
      if (bl) { var bs = ballSvg(bl.x, bl.y, bl.r, bl.spin); if (bl.far) farL = bs; else nearL = bs; }
      $('ballFar').innerHTML = farL;
      $('ballNear').innerHTML = nearL;
      var amp = endMode === 'net' && t >= IMPACT ? 11 * Math.exp(-(t - IMPACT) / 260) * Math.cos((t - IMPACT) / 70) : 0;
      if (!fired.netDrawn || amp || (t >= IMPACT && !fired.netRest)) {
        drawNet(Math.abs(amp) > 0.2 ? amp : 0);
        fired.netDrawn = true;
        if (t >= IMPACT && Math.abs(amp) <= 0.2) fired.netRest = true;
      }
      once(t, IMPACT, 'impact', function () {
        impactAt = t;
        post({ type: 'impact', strength: good ? 'heavy' : 'medium' });
      });
    }
    $('flash').style.opacity = f2(good ? bell((t - IMPACT) / 240) * 0.6 : 0);
    var shk = t - impactAt, amp2 = good && shk >= 0 && shk < 380 ? (1 - shk / 380) * 8 : 0;
    $('stage').style.transform = amp2 ? 'translate(' + f2(Math.sin(shk * 0.09) * amp2) + 'px,' + f2(Math.cos(shk * 0.07) * amp2 * 0.6) + 'px)' : '';

    // Plan C : la réaction.
    if (inC) {
      once(t, C_START, 'react', function () {
        if (heroC) heroC.setPose(good ? 'celebrate' : 'despair');
        if (good) burst(90);
      });
      once(t, C_START + 800, 'burst2', function () { if (good) burst(50); });
      tr($('heroC'), 'translateX(-50%) scale(' + (1 + 0.04 * seg(t, C_START, END, inOut)).toFixed(4) + ')');
      resL.forEach(function (s, i) {
        var p = seg(t, C_START + 120 + i * 50, C_START + 600 + i * 50, outBack);
        s.style.opacity = clamp(p * 1.4, 0, 1);
        tr(s, 'translateY(' + ((1 - p) * -50).toFixed(1) + 'px) scale(' + (1.4 - 0.4 * p).toFixed(3) + ')');
      });
    }
    $('skip').style.opacity = f2(seg(t, 900, 1300) * 0.9);
    drawBits();
  }

  // ── Boucle, fin et toucher ───────────────────────────────────
  var start = performance.now(), finished = false, endAt = 0;
  // Aperçu navigateur : ?t=3000 fige la chronologie à cet instant (sans effet dans l'app).
  var frozen = /[?&]t=(\\d+)/.exec(location.search || '');
  var finish = function () {
    if (finished) return;
    finished = true;
    endAt = performance.now();
    setTimeout(function () { rigs.forEach(function (r) { r.stop(); }); post({ type: 'done' }); }, 340);
  };
  var frame = function (now) {
    var t = frozen ? Number(frozen[1]) : now - start;
    render(t);
    if (t >= END && !frozen) finish();
    if (finished) {
      var out = clamp((now - endAt) / 320, 0, 1);
      $('stage').style.opacity = 1 - out;
      if (out >= 1) return;
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  var onTap = function () { if (performance.now() - start > 600) finish(); };
  document.addEventListener('click', onTap);
  document.addEventListener('touchend', onTap);
})();
</script>
</body>
</html>`;

},
"cinematics/keeperTemplate": function (exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KEEPER_TEMPLATE = void 0;
exports.KEEPER_TEMPLATE = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<style>
  :root { --c1: #d62828; --safeTop: env(safe-area-inset-top, 0px); --safeBottom: env(safe-area-inset-bottom, 0px); }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
  body { font-family: "Oswald", "Avenir Next Condensed", "HelveticaNeue-CondensedBold", "Roboto Condensed", "Arial Narrow", sans-serif;
    color: #fff; -webkit-user-select: none; user-select: none; -webkit-tap-highlight-color: transparent; }
  #stage { position: absolute; inset: 0; overflow: hidden; background: #04060a; }
  .shot { position: absolute; inset: 0; opacity: 0; will-change: opacity, transform; }
  svg.full { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
  .close { background:
      radial-gradient(ellipse at 50% 95%, rgba(255,255,255,.16) 0%, transparent 45%),
      radial-gradient(ellipse at 50% 30%, color-mix(in srgb, var(--c1) 35%, #0b1220) 0%, #05070c 70%); }
  .bokeh { position: absolute; border-radius: 50%; filter: blur(10px); opacity: .55; }
  .closeHero { position: absolute; left: 50%; bottom: calc(var(--safeBottom) - 10px); width: min(108vw, 470px); transform: translateX(-50%); }
  .closeHero svg { display: block; width: 100%; height: auto; filter: drop-shadow(0 20px 30px rgba(0,0,0,.5)); }
  .crowdBand { position: absolute; left: 0; right: 0; bottom: 0; height: 34%; }
  #titleBox { position: absolute; left: 16px; right: 16px; top: calc(var(--safeTop) + 70px); text-align: center; }
  #momentTitle { font-size: 15px; letter-spacing: 5px; text-transform: uppercase; opacity: 0; }
  #bigWord { margin-top: 8px; padding-left: 6px; font-size: 76px; line-height: 1; font-weight: 700; letter-spacing: 6px; text-transform: uppercase; white-space: nowrap;
    text-shadow: 0 6px 30px rgba(0,0,0,.55); }
  #bigWord span, #resultWord span { display: inline-block; will-change: transform, opacity; }
  #resultBox { position: absolute; left: 12px; right: 12px; top: calc(var(--safeTop) + 64px); text-align: center; }
  #resultWord { padding-left: 4px; font-size: 84px; line-height: 1; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; white-space: nowrap;
    text-shadow: 0 8px 34px rgba(0,0,0,.55); }
  #resultWord.good { color: #ffd65a; text-shadow: 0 0 34px rgba(255,214,90,.55), 0 8px 30px rgba(0,0,0,.5); }
  #resultWord.bad { color: #ffffff; opacity: .92; }
  #vignette { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,.55) 100%); }
  #flash { position: absolute; inset: 0; background: #fff; opacity: 0; pointer-events: none; }
  #black { position: absolute; inset: 0; background: #000; opacity: 0; pointer-events: none; }
  #confetti { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
  #skip { position: absolute; left: 0; right: 0; bottom: calc(var(--safeBottom) + 10px); text-align: center; opacity: 0;
    font-family: -apple-system, system-ui, sans-serif; font-size: 11px; letter-spacing: 1px; color: rgba(255,255,255,.6); }
</style>
</head>
<body>
<div id="stage">
  <div class="shot close" id="shotA">
    <div id="bokehA"></div>
    <svg class="crowdBand" id="crowdA" viewBox="0 0 400 120" preserveAspectRatio="none"></svg>
    <div class="closeHero" id="heroA"></div>
    <div id="titleBox"><div id="momentTitle"></div><div id="bigWord"></div></div>
  </div>
  <div class="shot" id="shotB">
    <svg class="full" id="pitch" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice"></svg>
  </div>
  <div class="shot close" id="shotC">
    <div id="bokehC"></div>
    <svg class="crowdBand" id="crowdC" viewBox="0 0 400 120" preserveAspectRatio="none"></svg>
    <div class="closeHero" id="heroC"></div>
    <div id="resultBox"><div id="resultWord"></div></div>
  </div>
  <div id="vignette"></div>
  <canvas id="confetti"></canvas>
  <div id="flash"></div>
  <div id="black"></div>
  <div id="skip"></div>
</div>
<script>/*__RIG_JS__*/</script>
<script>
window.CINE = /*__CINE_DATA__*/null;
(function () {
  var D = window.CINE || {};
  var L = D.labels || {};
  var P = D.plan || { setup: 'shot', action: 'dive', side: 1, success: true, result: 'save' };
  var good = !!P.success;
  var $ = function (id) { return document.getElementById(id); };
  var post = function (msg) {
    var s = JSON.stringify(msg);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(s);
    else if (window.parent && window.parent !== window) window.parent.postMessage(s, '*');
  };
  var NS = 'http://www.w3.org/2000/svg';

  // ── Outils de temps ─────────────────────────────────────────
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var outCubic = function (p) { return 1 - Math.pow(1 - p, 3); };
  var inOut = function (p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
  var outBack = function (p) { var c = 1.6; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
  var seg = function (t, a, b, ease) { var p = clamp((t - a) / (b - a), 0, 1); return (ease || outCubic)(p); };
  var bell = function (p) { return p <= 0 || p >= 1 ? 0 : Math.sin(Math.PI * p); };
  var seeded = function (i, salt) { var x = Math.sin(i * 12.9898 + (salt || 0) * 78.233) * 43758.5453; return x - Math.floor(x); };
  var f2 = function (n) { return Math.round(n * 100) / 100; };

  var ourKit = D.kit || { c1: '#d62828', c2: '#151515' };
  var oppKit = D.oppKit || { c1: '#f4f4f4', c2: '#1d3a8a' };
  var keeperKit = D.keeperKit || { c1: '#22c55e', c2: '#111111' };
  var root = document.documentElement.style;
  root.setProperty('--c1', ourKit.c1);
  if (D.safeTop != null) root.setProperty('--safeTop', D.safeTop + 'px');
  if (D.safeBottom != null) root.setProperty('--safeBottom', D.safeBottom + 'px');

  // ── La chronologie (le reste dépend de la situation, voir plus bas) ─
  var A_END = 1500;

  // ── Mise en place des textes ─────────────────────────────────
  var letters = function (el, text) {
    el.innerHTML = '';
    return String(text || '').split('').map(function (ch) {
      var s = document.createElement('span');
      s.textContent = ch === ' ' ? '\\u00a0' : ch;
      el.appendChild(s);
      return s;
    });
  };
  $('momentTitle').textContent = D.title || '';
  var bigL = letters($('bigWord'), String(L.word || '').toUpperCase());
  var resL = letters($('resultWord'), String(L.result || '').toUpperCase());
  $('resultWord').className = good ? 'good' : 'bad';
  $('skip').textContent = L.skip || '';
  // Les grands mots tiennent toujours dans la largeur de l'écran (marge pour le battement de cœur).
  var fitWord = function (el, max) {
    var spans = el.querySelectorAll('span');
    if (!spans.length) return;
    var width = function () { return spans[spans.length - 1].getBoundingClientRect().right - spans[0].getBoundingClientRect().left; };
    var size = max;
    el.style.fontSize = size + 'px';
    while (size > 30 && width() > el.clientWidth * 0.92) { size -= 2; el.style.fontSize = size + 'px'; }
  };
  fitWord($('bigWord'), 76);
  fitWord($('resultWord'), 84);

  // Lumières floues et public des gros plans.
  ['bokehA', 'bokehC'].forEach(function (id, k) {
    var html = '';
    for (var i = 0; i < 9; i++) {
      var sz = 30 + seeded(i, k + 1) * 70;
      html += '<div class="bokeh" style="left:' + (seeded(i, k + 2) * 100).toFixed(1) + '%;top:' + (5 + seeded(i, k + 3) * 45).toFixed(1) +
        '%;width:' + sz.toFixed(0) + 'px;height:' + sz.toFixed(0) + 'px;background:' + (i % 3 ? 'rgba(255,240,210,.5)' : 'rgba(255,255,255,.35)') + '"></div>';
    }
    $(id).innerHTML = html;
  });
  var crowd = function () {
    var s = '';
    for (var row = 0; row < 2; row++) {
      var y = 60 + row * 26, col = row ? 'rgba(0,0,0,.8)' : 'rgba(0,0,0,.5)';
      s += '<rect x="0" y="' + (y + 8) + '" width="400" height="80" fill="' + col + '"/>';
      for (var k = 0; k < 24; k++) {
        var x = k * 17 + (row ? 8 : 0) + seeded(k, row) * 6, r = 7 + seeded(k, row + 3) * 3;
        s += '<circle cx="' + x.toFixed(1) + '" cy="' + (y - seeded(k, row + 5) * 6).toFixed(1) + '" r="' + r.toFixed(1) + '" fill="' + col + '"/>';
        s += '<rect x="' + (x - r * 1.5).toFixed(1) + '" y="' + (y + 3).toFixed(1) + '" width="' + (r * 3).toFixed(1) + '" height="24" rx="7" fill="' + col + '"/>';
      }
    }
    return s;
  };
  $('crowdA').innerHTML = crowd();
  $('crowdC').innerHTML = crowd();

  // ── Plan B : derrière le but, à travers le filet ────────────
  // Repère : but entre x = 30 et 370, barre à y = 400, ligne de but à y = 735 ; notre gardien de dos
  // au premier plan (échelle .74), les adversaires de face au loin.
  var S = P.side || 1;
  var svg = '<defs>' +
    '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03050b"/><stop offset="1" stop-color="#101a33"/></linearGradient>' +
    '<radialGradient id="glow"><stop offset="0" stop-color="rgba(255,250,235,.95)"/><stop offset=".25" stop-color="rgba(255,250,235,.35)"/><stop offset="1" stop-color="rgba(255,250,235,0)"/></radialGradient>' +
    '<linearGradient id="grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f6b34"/><stop offset="1" stop-color="#2f8f47"/></linearGradient>' +
    '</defs>';
  svg += '<rect width="400" height="340" fill="url(#sky)"/>';
  svg += '<circle cx="40" cy="60" r="120" fill="url(#glow)" opacity=".55"/><circle cx="360" cy="60" r="120" fill="url(#glow)" opacity=".55"/>';
  svg += '<rect x="0" y="180" width="400" height="150" fill="#0a0f1c"/>';
  var phones = [];
  for (var row = 0; row < 5; row++) {
    var yy = 196 + row * 28, cc = 'rgba(' + (14 + row * 3) + ',' + (20 + row * 4) + ',' + (36 + row * 5) + ',1)';
    for (var k = 0; k < 34; k++) {
      var xx = k * 12 + (row % 2 ? 6 : 0) + seeded(k, row + 20) * 4;
      svg += '<circle cx="' + xx.toFixed(1) + '" cy="' + yy.toFixed(1) + '" r="4.6" fill="' + cc + '"/>';
      svg += '<rect x="' + (xx - 6).toFixed(1) + '" y="' + (yy + 3).toFixed(1) + '" width="12" height="16" rx="4" fill="' + cc + '"/>';
      if (seeded(k, row + 40) < 0.22) phones.push({ x: xx, y: yy - 2, at: seeded(k, row + 60), sp: 0.6 + seeded(k, row + 80) });
    }
  }
  phones.forEach(function (p, i) { svg += '<circle id="ph' + i + '" cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="1.8" fill="#fff" opacity="0"/>'; });
  svg += '<rect x="0" y="330" width="400" height="470" fill="url(#grass)"/>';
  for (var b = 0; b < 12; b += 2) {
    var y0 = 330 + 470 * Math.pow(b / 12, 1.7), y1 = 330 + 470 * Math.pow((b + 1) / 12, 1.7);
    svg += '<rect x="0" y="' + y0.toFixed(1) + '" width="400" height="' + (y1 - y0).toFixed(1) + '" fill="rgba(255,255,255,.05)"/>';
  }
  var line = 'stroke="rgba(255,255,255,.75)" fill="none" stroke-linejoin="round"';
  svg += '<path d="M-30 735 L88 515 L312 515 L430 735" stroke-width="2.6" ' + line + '/>';
  svg += '<path d="M110 735 L130 652 L270 652 L290 735" stroke-width="2.8" ' + line + '/>';
  svg += '<line x1="-20" y1="735" x2="420" y2="735" stroke-width="3.4" stroke="rgba(255,255,255,.8)"/>';
  svg += '<ellipse cx="200" cy="566" rx="3.4" ry="1.6" fill="rgba(255,255,255,.85)"/>';
  // Du plus loin au plus près : adversaires, ballon au loin, défenseur, gardien, ballon près de nous, cadre, filet.
  svg += '<g id="oppLayer"></g><g id="ballBack"></g><g id="defLayer"></g><g id="keeperLayer"></g><g id="ballFront"></g>';
  svg += '<g id="frame"><rect x="26" y="396" width="8" height="341" fill="#f4f4f4"/><rect x="366" y="396" width="8" height="341" fill="#f4f4f4"/>' +
    '<rect x="26" y="396" width="348" height="8" fill="#f4f4f4"/></g><g id="net"></g>';
  $('pitch').innerHTML = svg;
  var phoneEls = phones.map(function (p, i) { return $('ph' + i); });

  var R = window.DestinyRig;
  var mk = function (parent) {
    var g = document.createElementNS(NS, 'g');
    var inner = document.createElementNS(NS, 'g'); g.appendChild(inner);
    $(parent).appendChild(g);
    return { g: g, inner: inner };
  };
  var rigs = [];
  var mount = function (grp, opts) { var r = R ? R.mount(grp.inner, opts) : null; if (r) rigs.push(r); return r; };
  var keeperG = mk('keeperLayer'), oppG = mk('oppLayer');
  var keeperRig = mount(keeperG, { avatar: D.avatar, kit: keeperKit, pose: 'back', uid: 'k', shadow: true, shirtName: D.shirtName, shirtNumber: 1 });
  var oppRig = mount(oppG, { avatar: D.oppAvatar, kit: oppKit, pose: 'front', uid: 'o', shadow: true });
  // Gros plans : notre gardien, en buste, dans sa tenue de gardien.
  var heroA = null, heroC = null;
  if (R && D.avatar) {
    $('heroA').innerHTML = '<svg viewBox="-115 -318 230 330"><g id="hA"></g></svg>';
    $('heroC').innerHTML = '<svg viewBox="-115 -318 230 330"><g id="hC"></g></svg>';
    heroA = R.mount($('hA'), { avatar: D.avatar, kit: keeperKit, pose: 'keeper', uid: 'a', shadow: false });
    heroC = R.mount($('hC'), { avatar: D.avatar, kit: keeperKit, pose: 'front', uid: 'c', shadow: false });
    rigs.push(heroA, heroC);
  }
  var defG = null, defRig = null;
  if (P.setup === 'cross' && P.action === 'shout') {
    defG = mk('defLayer');
    defRig = mount(defG, { avatar: (D.mateAvatars && D.mateAvatars[0]) || D.oppAvatar, kit: ourKit, pose: 'back', uid: 'd', shadow: true });
  }

  // ── La chorégraphie : positions dans le temps, trajectoire du ballon en segments ─
  var HOME = { x: 200, y: 742, s: 0.74 };
  var ease2 = function (q) { return q < 0.5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2; };
  var lerpPos = function (a, b, p) { return { x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p, s: a.s + (b.s - a.s) * p }; };
  // Gardien : sortie (kOut), saut (kJump), plongeon (kDive). Adversaire : course (oRun), saut de la tête (oJump).
  var kOut = null, kJump = null, kDive = null, oFrom, oTo, oRun, oJump = null, dJump = null, DEF = null;
  var legs = [], endMode = 'vanish', IMPACT = 0, cues = [], END_B;
  var leg = function (t0, t1, from, to, arc, layer) { legs.push({ t0: t0, t1: t1, from: from, to: to, arc: arc || 0, layer: layer || 'back' }); };
  var pt = function (x, y, r) { return { x: x, y: y, r: r }; };
  var headOf = function (pos, lift) { return pt(pos.x, pos.y - 205 * pos.s - (lift || 0), 6 + 9 * pos.s); };

  if (P.setup === 'cross') {
    // Corner venu du côté S : le ballon monte, l'attaquant attaque le ballon, le gardien sort (ou pas).
    var KICK = 2700, ARR = 3950;
    // L'attaquant coupe vers le centre ; le gardien sort vers le premier poteau : on les voit tous les deux.
    oFrom = { x: 200 + S * 70, y: 556, s: 0.38 }; oTo = { x: 200 - S * 22, y: 610, s: 0.44 }; oRun = [KICK, ARR - 200];
    oJump = [ARR - 260, ARR + 360, P.success ? 22 : 34];
    var C0 = pt(200 + S * 280, 505, 4.5);
    var out = P.action === 'punch' || P.action === 'catch';
    if (out) {
      kOut = [2950, ARR - 260, { x: 200 + S * 70, y: 702, s: 0.66 }];
      kJump = [P.success ? ARR - 300 : ARR - 520, P.success ? ARR + 300 : ARR + 80, 48];
      cues.push([kJump[0], 'k', 'stretch']);
      cues.push([kJump[1] + 60, 'k', P.success && P.action === 'catch' ? 'keeper' : 'keeper']);
    }
    if (P.action === 'shout') {
      DEF = { x: 200 + S * 64, y: 652, s: 0.5 };
      dJump = [P.success ? ARR - 260 : ARR - 480, P.success ? ARR + 340 : ARR + 120, 30];
      cues.push([dJump[0], 'd', 'header']); cues.push([dJump[1], 'd', 'back']);
    }
    if (P.success && out) {
      var hands = function () { var k = keeperAt(ARR); return pt(k.x, k.y - 315 * k.s, 15); };
      var M = hands();
      leg(KICK, ARR, C0, M, 230, 'back');
      if (P.action === 'punch') leg(ARR, ARR + 800, M, pt(200 - S * 190, 290, 3.5), 60, 'back');
      IMPACT = ARR; END_B = ARR + 900;
    } else if (P.success && P.action === 'shout') {
      var Dh = headOf(DEF, 30);
      leg(KICK, ARR, C0, Dh, 230, 'back');
      leg(ARR, ARR + 800, Dh, pt(200 + S * 240, 320, 4), 50, 'back');
      IMPACT = ARR; END_B = ARR + 900;
    } else {
      // L'attaquant gagne le duel aérien et frappe de la tête (vers le but, ou bien arrêtée si on reste sur sa ligne).
      var H = headOf(oTo, P.success ? 22 : 34);
      leg(KICK, ARR, C0, H, 230, 'back');
      if (P.success) { // rester sur sa ligne : réflexe sur la tête
        var T1 = pt(200 - S * 112, 650, 16);
        leg(ARR, ARR + 560, H, T1, 10, 'back');
        kDive = { at: ARR + 120, side: -S, reach: 105, rot: 72, dur: 420 };
        leg(ARR + 560, ARR + 1160, T1, pt(T1.x - S * 260, T1.y - 170, 22), 20, 'back');
        IMPACT = ARR + 560; END_B = ARR + 1250;
      } else {
        var T2 = pt(200 - S * 120, 520, 18);
        leg(ARR, ARR + 460, H, T2, 0, 'back');
        if (P.action === 'line') kDive = { at: ARR + 300, side: -S, reach: 90, rot: 66, dur: 420 };
        endMode = 'net'; IMPACT = ARR + 460; END_B = ARR + 1300;
      }
    }
  } else if (P.setup === 'shot') {
    // Frappe à bout portant : une passe arrive dans les pieds de l'attaquant, il frappe sans contrôle.
    var PASS0 = 2500, RECV = 3150, SHOT = 3550;
    oFrom = oTo = { x: 200 + S * 55, y: 612, s: 0.46 }; oRun = [0, 1];
    cues.push([SHOT - 420, 'o', 'shoot']);
    var F = pt(oTo.x + 22, 616, 6.5);
    leg(PASS0, RECV, pt(200 + S * 240, 664, 6.5), F, 0, 'back');
    leg(RECV, SHOT, F, F, 0, 'back');
    var A = P.action, T;
    if (A === 'body') {
      T = P.success ? pt(200, 600, 16) : pt(200 + S * 135, 470, 18);
      leg(SHOT, SHOT + 400, F, T, 8, 'back');
      kJump = [SHOT + 40, SHOT + 440, P.success ? 10 : 18];
      if (P.success) { cues.push([SHOT + 40, 'k', 'stretch']); leg(SHOT + 400, SHOT + 1000, T, pt(200 + S * 60, 690, 10), 30, 'back'); endMode = 'rest'; }
      else endMode = 'net';
      IMPACT = SHOT + 400;
    } else if (A === 'foot') {
      T = P.success ? pt(200 + S * 72, 712, 17) : pt(200 + S * 16, 724, 17);
      leg(SHOT, SHOT + 420, F, T, 4, 'back');
      kDive = { at: SHOT + 60, side: S, reach: 38, rot: 34, dur: 360 };
      if (P.success) leg(SHOT + 420, SHOT + 1000, T, pt(T.x + S * 210, 770, 22), 10, 'back'); else endMode = 'net';
      IMPACT = SHOT + 420;
    } else { // dive
      T = P.success ? pt(200 + S * 118, 650, 17) : pt(200 - S * 118, 640, 17);
      leg(SHOT, SHOT + 480, F, T, 14, 'back');
      kDive = { at: SHOT + 80, side: S, reach: 105, rot: 72, dur: 440 };
      if (P.success) leg(SHOT + 480, SHOT + 1080, T, pt(T.x + S * 250, T.y - 160, 24), 20, 'back'); else endMode = 'net';
      IMPACT = SHOT + 480;
    }
    END_B = IMPACT + 900;
  } else {
    // Attaquant seul : il arrive balle au pied ; le gardien sort dans ses pieds ou reste et ferme l'angle.
    var RUN0 = 2200, ACT = 3600;
    // L'attaquant arrive en diagonale, décalé du côté -S : on le voit à côté de notre gardien.
    oFrom = { x: 200 - S * 104, y: 528, s: 0.35 }; oTo = { x: 200 - S * 70, y: 636, s: 0.48 }; oRun = [RUN0, ACT - 40];
    var dribble = function (t) {
      var o = oppAt(t), touch = ((t - RUN0) % 320 + 320) % 320 / 320;
      return pt(o.x + 20 * o.s, o.y + 10 + 18 * (1 - touch) * o.s, 6 + 6 * o.s);
    };
    legs.dribble = [RUN0, ACT, dribble];
    var Fb = dribble(ACT);
    if (P.action === 'rush') {
      kOut = [2850, ACT - 120, { x: 200 - S * 18, y: 688, s: 0.66 }];
      if (P.success) {
        kDive = { at: ACT - 160, side: -S, reach: 44, rot: 64, dur: 300, fwd: 34 };
        endMode = 'vanish'; IMPACT = ACT + 60; legs.dribbleEnd = ACT + 60;
      } else {
        cues.push([ACT - 420, 'o', 'shoot']);
        kDive = { at: ACT - 200, side: -S, reach: 30, rot: 64, dur: 300, fwd: 34 };
        leg(ACT, ACT + 900, Fb, pt(200 + S * 40, 520, 18), 170, 'back');
        endMode = 'net'; IMPACT = ACT + 900;
      }
    } else {
      kOut = [2850, 3450, { x: 200, y: 726, s: 0.72 }];
      cues.push([ACT - 420, 'o', 'shoot']);
      var Tb = P.success ? pt(200 - S * 40, 600, 16) : pt(200 + S * 135, 680, 17);
      leg(ACT, ACT + 400, Fb, Tb, 10, 'back');
      if (P.success) { cues.push([ACT, 'k', 'stretch']); leg(ACT + 400, ACT + 1000, Tb, pt(200 - S * 240, 560, 20), 30, 'back'); }
      else { kDive = { at: ACT + 120, side: -S, reach: 70, rot: 60, dur: 400 }; endMode = 'net'; }
      IMPACT = ACT + 400;
    }
    END_B = IMPACT + 900;
  }
  var C_START = END_B + 300, END = C_START + 2500;
  var lastLeg = legs[legs.length - 1];
  var NET_T = endMode === 'net' && lastLeg ? lastLeg.to : null;

  function oppAt(t) {
    var p = ease2(clamp((t - oRun[0]) / (oRun[1] - oRun[0]), 0, 1)), o = lerpPos(oFrom, oTo, p);
    o.lift = oJump ? oJump[2] * bell((t - oJump[0]) / (oJump[1] - oJump[0])) : 0;
    o.bob = P.setup === 'breakaway' && t > oRun[0] && t < oRun[1] ? Math.abs(Math.sin(t / 105)) * 6 * o.s : 0;
    return o;
  }
  function keeperAt(t) {
    var k = { x: HOME.x, y: HOME.y, s: HOME.s, lift: 0, rot: 0 };
    if (kOut) { var p = ease2(clamp((t - kOut[0]) / (kOut[1] - kOut[0]), 0, 1)); var q = lerpPos(HOME, kOut[2], p); k.x = q.x; k.y = q.y; k.s = q.s; }
    if (kJump) k.lift = kJump[2] * bell((t - kJump[0]) / (kJump[1] - kJump[0]));
    if (kDive) {
      var dv = outCubic(clamp((t - kDive.at) / kDive.dur, 0, 1));
      k.x += kDive.side * kDive.reach * dv * (k.s / HOME.s);
      k.y -= (kDive.fwd || 0) * dv * (k.s / HOME.s);
      k.lift += 34 * bell(dv * 0.92) * (k.s / HOME.s);
      k.rot = kDive.side * kDive.rot * dv;
    }
    return k;
  }
  if (kDive) cues.push([kDive.at, 'k', 'stretch']);

  var netG = $('net');
  var drawNet = function (impact, amp) {
    var x0 = 34, x1 = 366, y0 = 404, y1 = 735, step = 15, cols = Math.round((x1 - x0) / step), rws = Math.round((y1 - y0) / step), d = '';
    var disp = function (x, y) {
      if (!amp) return [x, y];
      var dx = x - impact.x, dy = y - impact.y, dist2 = dx * dx + dy * dy, k = amp * Math.exp(-dist2 / 2600), len = Math.sqrt(dist2) || 1;
      return [x + dx / len * k * 0.6, y + dy / len * k * 0.6 + k * 0.5];
    };
    for (var i = 0; i <= cols; i++) {
      var x = x0 + i * (x1 - x0) / cols;
      for (var j = 0; j <= rws; j++) { var p = disp(x, y0 + j * (y1 - y0) / rws); d += (j ? 'L' : 'M') + f2(p[0]) + ' ' + f2(p[1]); }
    }
    for (var j2 = 0; j2 <= rws; j2++) {
      var y = y0 + j2 * (y1 - y0) / rws;
      for (var i2 = 0; i2 <= cols; i2++) { var q = disp(x0 + i2 * (x1 - x0) / cols, y); d += (i2 ? 'L' : 'M') + f2(q[0]) + ' ' + f2(q[1]); }
    }
    netG.innerHTML = '<path d="' + d + '" fill="none" stroke="rgba(255,255,255,.26)" stroke-width="1.1"/>';
  };
  var ballSvg = function (x, y, r, spin) {
    return '<g transform="translate(' + f2(x) + ' ' + f2(y) + ') rotate(' + f2(spin) + ')">' +
      '<circle r="' + f2(r) + '" fill="#fafafa" stroke="#cfd8dc" stroke-width="' + f2(r * 0.08) + '"/>' +
      '<circle cx="' + f2(-r * 0.25) + '" cy="' + f2(-r * 0.2) + '" r="' + f2(r * 0.32) + '" fill="#2b2b2b"/>' +
      '<circle cx="' + f2(r * 0.5) + '" cy="' + f2(r * 0.35) + '" r="' + f2(r * 0.2) + '" fill="#2b2b2b"/></g>';
  };

  /** Le ballon à l'instant t : segments (ligne + cloche), dribble éventuel, puis l'état final. */
  var ballAt = function (t) {
    if (legs.dribble && t >= legs.dribble[0] && t < (legs.dribbleEnd || legs.dribble[1])) {
      var db = legs.dribble[2](t);
      return { x: db.x, y: db.y - db.r, r: db.r, spin: t * 0.6, layer: 'back' };
    }
    if (legs.dribble && legs.dribbleEnd && t >= legs.dribbleEnd) return null; // serré par le gardien
    if (legs.dribble && t < legs.dribble[0]) { var d0 = legs.dribble[2](legs.dribble[0]); return { x: d0.x, y: d0.y - d0.r, r: d0.r, spin: 0, layer: 'back' }; }
    for (var i = 0; i < legs.length; i++) {
      var L = legs[i];
      if (t >= L.t0 && t < L.t1) {
        var p = (t - L.t0) / (L.t1 - L.t0);
        return { x: L.from.x + (L.to.x - L.from.x) * p, y: L.from.y + (L.to.y - L.from.y) * p - L.arc * bell(p),
          r: L.from.r + (L.to.r - L.from.r) * p, spin: p * 720, layer: L.layer };
      }
    }
    if (!legs.length || t < legs[0].t0) return null;
    if (endMode === 'net') {
      var sink = outCubic(clamp((t - lastLeg.t1) / 300, 0, 1));
      return { x: NET_T.x, y: NET_T.y + 26 * sink, r: NET_T.r, spin: 720, layer: 'front' };
    }
    if (endMode === 'rest') return { x: lastLeg.to.x, y: lastLeg.to.y, r: lastLeg.to.r, spin: 720, layer: 'back' };
    return null;
  };

  // ── Confettis ────────────────────────────────────────────────
  var cv = $('confetti'), cx = cv.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1), W = 0, H = 0;
  var resize = function () { W = window.innerWidth; H = window.innerHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  resize(); window.addEventListener('resize', resize);
  var bits = [];
  var burst = function (count) {
    var cols = [ourKit.c1, ourKit.c2, '#ffd65a', '#ffffff'];
    for (var i = 0; i < count; i++) {
      var sd = i % 2 ? 1 : -1, off = (10 + Math.random() * 32) * Math.PI / 180, v = 11 + Math.random() * 10;
      bits.push({ x: W / 2 + sd * W * 0.46, y: H * 0.82, vx: -sd * Math.sin(off) * v, vy: -Math.cos(off) * v, w: 6 + Math.random() * 6,
        h: 9 + Math.random() * 8, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, f: Math.random() * 6, vf: 0.15 + Math.random() * 0.2, c: cols[i % cols.length] });
    }
  };
  var drawBits = function () {
    cx.clearRect(0, 0, W, H);
    for (var i = bits.length - 1; i >= 0; i--) {
      var b = bits[i];
      b.vy += 0.32; b.vx *= 0.985; b.vy *= 0.985; b.x += b.vx; b.y += b.vy; b.r += b.vr; b.f += b.vf;
      if (b.y > H + 40) { bits.splice(i, 1); continue; }
      cx.save(); cx.translate(b.x, b.y); cx.rotate(b.r); cx.scale(1, Math.cos(b.f)); cx.fillStyle = b.c; cx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h); cx.restore();
    }
  };

  // ── Rendu ────────────────────────────────────────────────────
  var fired = {};
  var once = function (t, at, key, fn) { if (t >= at && !fired[key]) { fired[key] = true; fn(); } };
  var tr = function (el, s) { el.style.transform = s; };
  var impactAt = -1e9;

  function render(t) {
    var inB = t >= A_END && t < C_START, inC = t >= C_START;
    $('shotA').style.opacity = t < A_END ? 1 : 0;
    $('shotB').style.opacity = inB ? 1 : 0;
    $('shotC').style.opacity = inC ? 1 : 0;
    $('black').style.opacity = f2(Math.max(bell((t - A_END + 140) / 280), bell((t - C_START + 140) / 280), 1 - seg(t, 0, 300)));

    // Plan A : gros plan, titre, cœur qui bat.
    tr($('heroA'), 'translateX(-50%) scale(' + (1 + 0.06 * seg(t, 0, A_END, inOut)).toFixed(4) + ')');
    $('momentTitle').style.opacity = seg(t, 200, 600);
    bigL.forEach(function (s, i) {
      var p = seg(t, 350 + i * 45, 800 + i * 45, outBack);
      s.style.opacity = clamp(p * 1.4, 0, 1);
      tr(s, 'translateY(' + ((1 - p) * 60).toFixed(1) + 'px) scale(' + (0.7 + 0.3 * p).toFixed(3) + ')');
    });
    var beat = Math.max(bell((t - 650) / 160), bell((t - 900) / 160), bell((t - 1250) / 160));
    tr($('bigWord'), 'scale(' + (1 + 0.05 * beat).toFixed(3) + ')');
    once(t, 650, 'b1', function () { post({ type: 'impact', strength: 'medium' }); });
    once(t, 1250, 'b2', function () { post({ type: 'impact', strength: 'medium' }); });

    // Plan B.
    if (inB || t < A_END + 200) {
      var z = 1 + 0.05 * seg(t, A_END, IMPACT, inOut);
      tr($('pitch'), 'scale(' + z.toFixed(4) + ')');
      $('pitch').style.transformOrigin = '50% 62%';
      phoneEls.forEach(function (el, i) {
        var p = phones[i], ph = ((t / 1000) * p.sp + p.at) % 1;
        el.setAttribute('opacity', (bell(ph / 0.2) * (t > IMPACT && !good ? 1 : 0.5)).toFixed(2));
      });
      cues.forEach(function (c, i) {
        once(t, c[0], 'cue' + i, function () {
          var r = c[1] === 'k' ? keeperRig : c[1] === 'o' ? oppRig : defRig;
          // Notre gardien et notre défenseur sont filmés de dos : leurs poses restent tournées vers le fond.
          var pose = c[1] !== 'o' && (c[2] === 'keeper' || c[2] === 'stretch' || c[2] === 'header') ? c[2] + 'Back' : c[2];
          if (r) r.setPose(pose);
        });
      });
      once(t, A_END, 'kready', function () { if (keeperRig) keeperRig.setPose('keeperBack'); });
      var o = oppAt(t);
      oppG.g.setAttribute('transform', 'translate(' + f2(o.x) + ' ' + f2(o.y - o.lift - o.bob) + ') scale(' + f2(o.s) + ')');
      var k = keeperAt(t);
      var sway = !kDive || t < kDive.at ? Math.sin(t / 280) * 5 * seg(t, A_END, A_END + 400) : 0;
      keeperG.g.setAttribute('transform', 'translate(' + f2(k.x + sway) + ' ' + f2(k.y - k.lift) + ') rotate(' + f2(k.rot) + ' 0 ' + f2(-150 * k.s) + ') scale(' + f2(k.s) + ')');
      if (defG) {
        var dl = dJump ? dJump[2] * bell((t - dJump[0]) / (dJump[1] - dJump[0])) : 0;
        defG.g.setAttribute('transform', 'translate(' + f2(DEF.x) + ' ' + f2(DEF.y - dl) + ') scale(' + f2(DEF.s) + ')');
      }
      var bl = ballAt(t), back = '', front = '';
      if (bl) { var svgB = ballSvg(bl.x, bl.y, bl.r, bl.spin); if (bl.layer === 'front') front = svgB; else back = svgB; }
      $('ballBack').innerHTML = back;
      $('ballFront').innerHTML = front;
      var amp = NET_T && t >= IMPACT ? 30 * Math.exp(-(t - IMPACT) / 260) * Math.cos((t - IMPACT) / 70) : 0;
      if (!fired.netDrawn || amp || (t >= IMPACT && !fired.netRest)) {
        drawNet(NET_T || { x: 200, y: 600 }, Math.abs(amp) > 0.4 ? amp : 0);
        fired.netDrawn = true;
        if (t >= IMPACT && Math.abs(amp) <= 0.4) fired.netRest = true;
      }
      once(t, IMPACT, 'impact', function () {
        impactAt = t;
        post({ type: 'impact', strength: good ? 'heavy' : 'medium' });
      });
    }
    $('flash').style.opacity = f2(good ? bell((t - IMPACT) / 240) * 0.55 : 0);
    var shk = t - impactAt, amp2 = good && shk >= 0 && shk < 380 ? (1 - shk / 380) * 8 : 0;
    $('stage').style.transform = amp2 ? 'translate(' + f2(Math.sin(shk * 0.09) * amp2) + 'px,' + f2(Math.cos(shk * 0.07) * amp2 * 0.6) + 'px)' : '';

    // Plan C : la réaction.
    if (inC) {
      once(t, C_START, 'react', function () {
        if (heroC) heroC.setPose(good ? 'celebrate' : 'despair');
        if (good) burst(90);
      });
      once(t, C_START + 800, 'burst2', function () { if (good) burst(50); });
      tr($('heroC'), 'translateX(-50%) scale(' + (1 + 0.04 * seg(t, C_START, END, inOut)).toFixed(4) + ')');
      resL.forEach(function (s, i) {
        var p = seg(t, C_START + 120 + i * 50, C_START + 600 + i * 50, outBack);
        s.style.opacity = clamp(p * 1.4, 0, 1);
        tr(s, 'translateY(' + ((1 - p) * -50).toFixed(1) + 'px) scale(' + (1.4 - 0.4 * p).toFixed(3) + ')');
      });
    }
    $('skip').style.opacity = f2(seg(t, 900, 1300) * 0.9);
    drawBits();
  }

  // ── Boucle, fin et toucher ───────────────────────────────────
  var start = performance.now(), finished = false, endAt = 0;
  // Aperçu navigateur : ?t=3000 fige la chronologie à cet instant (sans effet dans l'app).
  var frozen = /[?&]t=(\\d+)/.exec(location.search || '');
  var finish = function () {
    if (finished) return;
    finished = true;
    endAt = performance.now();
    setTimeout(function () { rigs.forEach(function (r) { r.stop(); }); post({ type: 'done' }); }, 340);
  };
  var frame = function (now) {
    var t = frozen ? Number(frozen[1]) : now - start;
    render(t);
    if (t >= END && !frozen) finish();
    if (finished) {
      var out = clamp((now - endAt) / 320, 0, 1);
      $('stage').style.opacity = 1 - out;
      if (out >= 1) return;
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  var onTap = function () { if (performance.now() - start > 600) finish(); };
  document.addEventListener('click', onTap);
  document.addEventListener('touchend', onTap);
})();
</script>
</body>
</html>`;

},
"cinematics/oneOnOneTemplate": function (exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ONE_ON_ONE_TEMPLATE = void 0;
exports.ONE_ON_ONE_TEMPLATE = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<style>
  :root { --c1: #d62828; --safeTop: env(safe-area-inset-top, 0px); --safeBottom: env(safe-area-inset-bottom, 0px); }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
  body { font-family: "Oswald", "Avenir Next Condensed", "HelveticaNeue-CondensedBold", "Roboto Condensed", "Arial Narrow", sans-serif;
    color: #fff; -webkit-user-select: none; user-select: none; -webkit-tap-highlight-color: transparent; }
  #stage { position: absolute; inset: 0; overflow: hidden; background: #04060a; }
  .shot { position: absolute; inset: 0; opacity: 0; will-change: opacity, transform; }
  svg.full { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
  .close { background:
      radial-gradient(ellipse at 50% 95%, rgba(255,255,255,.16) 0%, transparent 45%),
      radial-gradient(ellipse at 50% 30%, color-mix(in srgb, var(--c1) 35%, #0b1220) 0%, #05070c 70%); }
  .bokeh { position: absolute; border-radius: 50%; filter: blur(10px); opacity: .55; }
  .closeHero { position: absolute; left: 50%; bottom: calc(var(--safeBottom) - 10px); width: min(108vw, 470px); transform: translateX(-50%); }
  .closeHero svg { display: block; width: 100%; height: auto; filter: drop-shadow(0 20px 30px rgba(0,0,0,.5)); }
  .crowdBand { position: absolute; left: 0; right: 0; bottom: 0; height: 34%; }
  #titleBox { position: absolute; left: 16px; right: 16px; top: calc(var(--safeTop) + 70px); text-align: center; }
  #momentTitle { font-size: 15px; letter-spacing: 5px; text-transform: uppercase; opacity: 0; }
  #bigWord { margin-top: 8px; padding-left: 6px; font-size: 76px; line-height: 1; font-weight: 700; letter-spacing: 6px; text-transform: uppercase; white-space: nowrap;
    text-shadow: 0 6px 30px rgba(0,0,0,.55); }
  #bigWord span, #resultWord span { display: inline-block; will-change: transform, opacity; }
  #resultBox { position: absolute; left: 12px; right: 12px; top: calc(var(--safeTop) + 64px); text-align: center; }
  #resultWord { padding-left: 4px; font-size: 84px; line-height: 1; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; white-space: nowrap;
    text-shadow: 0 8px 34px rgba(0,0,0,.55); }
  #resultWord.good { color: #ffd65a; text-shadow: 0 0 34px rgba(255,214,90,.55), 0 8px 30px rgba(0,0,0,.5); }
  #resultWord.bad { color: #ffffff; opacity: .92; }
  #vignette { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,.55) 100%); }
  #flash { position: absolute; inset: 0; background: #fff; opacity: 0; pointer-events: none; }
  #black { position: absolute; inset: 0; background: #000; opacity: 0; pointer-events: none; }
  #confetti { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
  #skip { position: absolute; left: 0; right: 0; bottom: calc(var(--safeBottom) + 10px); text-align: center; opacity: 0;
    font-family: -apple-system, system-ui, sans-serif; font-size: 11px; letter-spacing: 1px; color: rgba(255,255,255,.6); }
</style>
</head>
<body>
<div id="stage">
  <div class="shot close" id="shotA">
    <div id="bokehA"></div>
    <svg class="crowdBand" id="crowdA" viewBox="0 0 400 120" preserveAspectRatio="none"></svg>
    <div class="closeHero" id="heroA"></div>
    <div id="titleBox"><div id="momentTitle"></div><div id="bigWord"></div></div>
  </div>
  <div class="shot" id="shotB">
    <svg class="full" id="pitch" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice"></svg>
  </div>
  <div class="shot close" id="shotC">
    <div id="bokehC"></div>
    <svg class="crowdBand" id="crowdC" viewBox="0 0 400 120" preserveAspectRatio="none"></svg>
    <div class="closeHero" id="heroC"></div>
    <div id="resultBox"><div id="resultWord"></div></div>
  </div>
  <div id="vignette"></div>
  <canvas id="confetti"></canvas>
  <div id="flash"></div>
  <div id="black"></div>
  <div id="skip"></div>
</div>
<script>/*__RIG_JS__*/</script>
<script>
window.CINE = /*__CINE_DATA__*/null;
(function () {
  var D = window.CINE || {};
  var L = D.labels || {};
  var P = D.plan || { action: 'low', u: 0.7, v: 0.12, arc: 10, flight: 520, end: 'net', dive: -1, side: 1, result: 'goal' };
  var rounding = P.action === 'round';
  var good = P.result === 'goal';
  var $ = function (id) { return document.getElementById(id); };
  var post = function (msg) {
    var s = JSON.stringify(msg);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(s);
    else if (window.parent && window.parent !== window) window.parent.postMessage(s, '*');
  };
  var NS = 'http://www.w3.org/2000/svg';

  // ── Outils de temps ─────────────────────────────────────────
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var outCubic = function (p) { return 1 - Math.pow(1 - p, 3); };
  var inOut = function (p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
  var outBack = function (p) { var c = 1.6; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
  var seg = function (t, a, b, ease) { var p = clamp((t - a) / (b - a), 0, 1); return (ease || outCubic)(p); };
  var bell = function (p) { return p <= 0 || p >= 1 ? 0 : Math.sin(Math.PI * p); };
  var seeded = function (i, salt) { var x = Math.sin(i * 12.9898 + (salt || 0) * 78.233) * 43758.5453; return x - Math.floor(x); };
  var f2 = function (n) { return Math.round(n * 100) / 100; };

  var ourKit = D.kit || { c1: '#d62828', c2: '#151515' };
  var keeperKit = D.oppKeeperKit || { c1: '#f97316', c2: '#111111' };
  var root = document.documentElement.style;
  root.setProperty('--c1', ourKit.c1);
  if (D.safeTop != null) root.setProperty('--safeTop', D.safeTop + 'px');
  if (D.safeBottom != null) root.setProperty('--safeBottom', D.safeBottom + 'px');

  // ── La chronologie ───────────────────────────────────────────
  var A_END = 1500;
  var RUN = 1750;                              // la course balle au pied vers le but
  var OUT = 2450;                              // le gardien sort à sa rencontre
  var DODGE = 3200;                            // « éliminer » : le crochet pour contourner le gardien
  var CONTACT = rounding ? 3950 : 3500;        // le dernier geste : frappe, piqué, ou poussée dans le but vide
  var SLOW = 1.3;                              // le vol du ballon, au ralenti
  var FLIGHT = P.flight * SLOW;
  var CATCH = P.action === 'chip' && P.end === 'save';
  var ARRIVE = P.end === 'smother' ? 3640 : CONTACT + (CATCH ? FLIGHT * 0.55 : FLIGHT);
  var DIVE = rounding ? 3330 : CONTACT + 40;
  var DIVE_DUR = 420;
  var C_START = ARRIVE + 800;
  var END = C_START + 2500;

  // ── Mise en place des textes ─────────────────────────────────
  var letters = function (el, text) {
    el.innerHTML = '';
    return String(text || '').split('').map(function (ch) {
      var s = document.createElement('span');
      s.textContent = ch === ' ' ? '\\u00a0' : ch;
      el.appendChild(s);
      return s;
    });
  };
  $('momentTitle').textContent = D.title || '';
  var bigL = letters($('bigWord'), String(L.word || '').toUpperCase());
  var resL = letters($('resultWord'), String(L.result || '').toUpperCase());
  $('resultWord').className = good ? 'good' : 'bad';
  $('skip').textContent = L.skip || '';
  // Les grands mots tiennent toujours dans la largeur de l'écran (marge pour le battement de cœur).
  var fitWord = function (el, max) {
    var spans = el.querySelectorAll('span');
    if (!spans.length) return;
    var width = function () { return spans[spans.length - 1].getBoundingClientRect().right - spans[0].getBoundingClientRect().left; };
    var size = max;
    el.style.fontSize = size + 'px';
    while (size > 30 && width() > el.clientWidth * 0.92) { size -= 2; el.style.fontSize = size + 'px'; }
  };
  fitWord($('bigWord'), 76);
  fitWord($('resultWord'), 84);

  // Lumières floues et public des gros plans.
  ['bokehA', 'bokehC'].forEach(function (id, k) {
    var html = '';
    for (var i = 0; i < 9; i++) {
      var sz = 30 + seeded(i, k + 1) * 70;
      html += '<div class="bokeh" style="left:' + (seeded(i, k + 2) * 100).toFixed(1) + '%;top:' + (5 + seeded(i, k + 3) * 45).toFixed(1) +
        '%;width:' + sz.toFixed(0) + 'px;height:' + sz.toFixed(0) + 'px;background:' + (i % 3 ? 'rgba(255,240,210,.5)' : 'rgba(255,255,255,.35)') + '"></div>';
    }
    $(id).innerHTML = html;
  });
  var crowd = function () {
    var s = '';
    for (var row = 0; row < 2; row++) {
      var y = 60 + row * 26, col = row ? 'rgba(0,0,0,.8)' : 'rgba(0,0,0,.5)';
      s += '<rect x="0" y="' + (y + 8) + '" width="400" height="80" fill="' + col + '"/>';
      for (var k = 0; k < 24; k++) {
        var x = k * 17 + (row ? 8 : 0) + seeded(k, row) * 6, r = 7 + seeded(k, row + 3) * 3;
        s += '<circle cx="' + x.toFixed(1) + '" cy="' + (y - seeded(k, row + 5) * 6).toFixed(1) + '" r="' + r.toFixed(1) + '" fill="' + col + '"/>';
        s += '<rect x="' + (x - r * 1.5).toFixed(1) + '" y="' + (y + 3).toFixed(1) + '" width="' + (r * 3).toFixed(1) + '" height="24" rx="7" fill="' + col + '"/>';
      }
    }
    return s;
  };
  $('crowdA').innerHTML = crowd();
  $('crowdC').innerHTML = crowd();

  // ── Plan B : vue télé derrière notre joueur, le but devant lui ──
  // Plan du but : u de -1 à 1 (poteaux), v de 0 (sol) à 1 (barre).
  var G = { x0: 96, x1: 304, bar: 352, line: 420, post: 4 };
  var onGoal = function (u, v) { return { x: (G.x0 + G.x1) / 2 + u * (G.x1 - G.x0) / 2, y: G.line - v * (G.line - G.bar) }; };
  var TG = onGoal(P.u, P.v);
  var HORIZON = 318;
  var s = P.side || 1;

  var svg = '<defs>' +
    '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03050b"/><stop offset="1" stop-color="#101a33"/></linearGradient>' +
    '<radialGradient id="glow"><stop offset="0" stop-color="rgba(255,250,235,.95)"/><stop offset=".25" stop-color="rgba(255,250,235,.35)"/><stop offset="1" stop-color="rgba(255,250,235,0)"/></radialGradient>' +
    '<linearGradient id="grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d6531"/><stop offset="1" stop-color="#2f8f47"/></linearGradient>' +
    '</defs>';
  svg += '<rect width="400" height="' + (HORIZON + 10) + '" fill="url(#sky)"/>';
  svg += '<circle cx="40" cy="40" r="110" fill="url(#glow)" opacity=".5"/><circle cx="360" cy="40" r="110" fill="url(#glow)" opacity=".5"/>';
  var standsTop = 66;
  svg += '<rect x="0" y="' + standsTop + '" width="400" height="' + (HORIZON - standsTop) + '" fill="#0a0f1c"/>';
  var phones = [];
  for (var row = 0; row * 24 < HORIZON - standsTop - 26; row++) {
    var yy = standsTop + 12 + row * 24, cc = 'rgba(' + (14 + row * 3) + ',' + (20 + row * 4) + ',' + (36 + row * 5) + ',1)';
    for (var k = 0; k < 40; k++) {
      var xx = k * 10.4 + (row % 2 ? 5.2 : 0) + seeded(k, row + 20) * 3;
      svg += '<circle cx="' + xx.toFixed(1) + '" cy="' + yy.toFixed(1) + '" r="3.9" fill="' + cc + '"/>';
      svg += '<rect x="' + (xx - 5).toFixed(1) + '" y="' + (yy + 2.6).toFixed(1) + '" width="10" height="13" rx="3" fill="' + cc + '"/>';
      if (seeded(k, row + 40) < 0.2) phones.push({ x: xx, y: yy - 2, at: seeded(k, row + 60), sp: 0.6 + seeded(k, row + 80) });
    }
  }
  phones.forEach(function (p, i) { svg += '<circle id="ph' + i + '" cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="1.6" fill="#fff" opacity="0"/>'; });
  svg += '<rect x="0" y="' + (HORIZON - 13) + '" width="400" height="13" fill="' + ourKit.c1 + '" opacity=".85"/>';
  svg += '<rect x="0" y="' + (HORIZON - 13) + '" width="400" height="2.5" fill="rgba(255,255,255,.35)"/>';
  var grassH = 800 - HORIZON;
  svg += '<rect x="0" y="' + HORIZON + '" width="400" height="' + grassH + '" fill="url(#grass)"/>';
  for (var b = 0; b < 14; b += 2) {
    var y0 = HORIZON + grassH * Math.pow(b / 14, 1.8), y1 = HORIZON + grassH * Math.pow((b + 1) / 14, 1.8);
    svg += '<rect x="0" y="' + y0.toFixed(1) + '" width="400" height="' + (y1 - y0).toFixed(1) + '" fill="rgba(255,255,255,.05)"/>';
  }
  // Lignes : but, petit rectangle, point de penalty, surface qui s'ouvre vers nous.
  var line = 'stroke="rgba(255,255,255,.72)" fill="none" stroke-linejoin="round"';
  svg += '<line x1="-20" y1="' + G.line + '" x2="420" y2="' + G.line + '" stroke-width="1.8" stroke="rgba(255,255,255,.78)"/>';
  svg += '<path d="M66 ' + G.line + ' L54 448 L346 448 L334 ' + G.line + '" stroke-width="2" ' + line + '/>';
  svg += '<path d="M-10 ' + G.line + ' L-80 560 M410 ' + G.line + ' L480 560" stroke-width="2.2" ' + line + '/>';
  svg += '<line x1="-20" y1="700" x2="420" y2="700" stroke-width="2.6" stroke="rgba(255,255,255,.7)"/>';
  svg += '<ellipse cx="200" cy="520" rx="4" ry="1.6" fill="rgba(255,255,255,.8)"/>';
  // Fond du filet, filet, ballon au fond, cadre, puis le gardien qui sort, le ballon et notre joueur.
  svg += '<path d="M' + G.x0 + ' ' + G.bar + ' L' + (G.x0 + 12) + ' ' + (G.bar - 10) + ' L' + (G.x1 - 12) + ' ' + (G.bar - 10) + ' L' + G.x1 + ' ' + G.bar +
    ' L' + G.x1 + ' ' + G.line + ' L' + G.x0 + ' ' + G.line + ' Z" fill="rgba(0,0,0,.28)"/>';
  svg += '<g id="net"></g><g id="ballFar"></g>';
  svg += '<g id="frame"><rect x="' + (G.x0 - G.post) + '" y="' + (G.bar - G.post) + '" width="' + G.post + '" height="' + (G.line - G.bar + G.post) + '" fill="#f4f4f4"/>' +
    '<rect x="' + G.x1 + '" y="' + (G.bar - G.post) + '" width="' + G.post + '" height="' + (G.line - G.bar + G.post) + '" fill="#f4f4f4"/>' +
    '<rect x="' + (G.x0 - G.post) + '" y="' + (G.bar - G.post) + '" width="' + (G.x1 - G.x0 + 2 * G.post) + '" height="' + G.post + '" fill="#f4f4f4"/></g>';
  svg += '<g id="ballMid"></g><g id="keeperLayer"></g><g id="ballNear"></g><g id="shooterLayer"></g>';
  $('pitch').innerHTML = svg;
  var phoneEls = phones.map(function (p, i) { return $('ph' + i); });

  // Les joueurs : chacun dans un groupe (position, plongeon) autour de son squelette.
  var R = window.DestinyRig;
  var mk = function (parent) {
    var g = document.createElementNS(NS, 'g');
    var inner = document.createElementNS(NS, 'g'); g.appendChild(inner);
    $(parent).appendChild(g);
    return { g: g, inner: inner };
  };
  var rigs = [];
  var mount = function (grp, opts) { var r = R ? R.mount(grp.inner, opts) : null; if (r) rigs.push(r); return r; };
  var shooterG = mk('shooterLayer'), keeperG = mk('keeperLayer');
  var shooterRig = mount(shooterG, { avatar: D.avatar, kit: ourKit, pose: 'back', uid: 's', shadow: true, shirtName: D.shirtName, shirtNumber: D.number });
  var keeperRig = mount(keeperG, { avatar: D.oppAvatar, kit: keeperKit, pose: 'keeper', uid: 'k', shadow: true });
  // Gros plans : notre joueur, en buste.
  var heroA = null, heroC = null;
  if (R && D.avatar) {
    $('heroA').innerHTML = '<svg viewBox="-115 -318 230 330"><g id="hA"></g></svg>';
    $('heroC').innerHTML = '<svg viewBox="-115 -318 230 330"><g id="hC"></g></svg>';
    heroA = R.mount($('hA'), { avatar: D.avatar, kit: ourKit, pose: 'focus', uid: 'a', shadow: false });
    heroC = R.mount($('hC'), { avatar: D.avatar, kit: ourKit, pose: 'front', uid: 'c', shadow: false });
    rigs.push(heroA, heroC);
  }

  // Le filet, au fond du but : il se creuse autour de l'impact.
  var netG = $('net');
  var drawNet = function (amp) {
    var cols = 24, rws = 8, d = '';
    var disp = function (x, y) {
      if (!amp) return [x, y];
      var dx = x - TG.x, dy = y - TG.y, dist2 = dx * dx + dy * dy, k = amp * Math.exp(-dist2 / 500), len = Math.sqrt(dist2) || 1;
      return [x - dx / len * k * 0.35, y - dy / len * k * 0.35 - k * 0.25];
    };
    for (var i = 0; i <= cols; i++) {
      var x = G.x0 + i * (G.x1 - G.x0) / cols;
      for (var j = 0; j <= rws; j++) { var p = disp(x, G.bar + j * (G.line - G.bar) / rws); d += (j ? 'L' : 'M') + f2(p[0]) + ' ' + f2(p[1]); }
    }
    for (var j2 = 0; j2 <= rws; j2++) {
      var y = G.bar + j2 * (G.line - G.bar) / rws;
      for (var i2 = 0; i2 <= cols; i2++) { var q = disp(G.x0 + i2 * (G.x1 - G.x0) / cols, y); d += (i2 ? 'L' : 'M') + f2(q[0]) + ' ' + f2(q[1]); }
    }
    netG.innerHTML = '<path d="' + d + '" fill="none" stroke="rgba(255,255,255,.32)" stroke-width="0.7"/>';
  };

  var ballSvg = function (x, y, r, spin) {
    return '<g transform="translate(' + f2(x) + ' ' + f2(y) + ') rotate(' + f2(spin) + ')">' +
      '<circle r="' + f2(r) + '" fill="#fafafa" stroke="#cfd8dc" stroke-width="' + f2(r * 0.08) + '"/>' +
      '<circle cx="' + f2(-r * 0.25) + '" cy="' + f2(-r * 0.2) + '" r="' + f2(r * 0.32) + '" fill="#2b2b2b"/>' +
      '<circle cx="' + f2(r * 0.5) + '" cy="' + f2(r * 0.35) + '" r="' + f2(r * 0.2) + '" fill="#2b2b2b"/></g>';
  };
  var shadowSvg = function (x, y, r) { return '<ellipse cx="' + f2(x) + '" cy="' + f2(y) + '" rx="' + f2(r) + '" ry="' + f2(r * 0.3) + '" fill="rgba(0,0,0,.35)"/>'; };

  /** Notre joueur : course vers le but, puis (éliminer) le crochet de côté pour contourner le gardien. */
  var playerAt = function (t) {
    var run = seg(t, RUN, rounding ? DODGE : CONTACT - 20, function (q) { return q < 0.5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2; });
    // Décalé à gauche de l'axe : on voit le gardien et le ballon à côté de lui.
    var x = 148 + 22 * run, y = 822 - (rounding ? 222 : 182) * run, sc = 0.76 - (rounding ? 0.24 : 0.2) * run;
    if (rounding) {
      var far = P.end === 'smother' ? 0.55 : 1, d = seg(t, DODGE, DODGE + 700, inOut) * far;
      x += s * 92 * d; y -= 74 * d; sc -= 0.08 * d;
    }
    return { x: x, y: y, s: sc };
  };
  /** Le gardien : sur sa ligne, il sort à la rencontre (plus loin sur un face-à-face au piqué). */
  var keeperBase = function (t) {
    var out = seg(t, OUT, OUT + 750, inOut), to = P.action === 'chip' ? 512 : 498;
    var y = 424 + (to - 424) * out;
    return { x: 200, y: y, s: 0.22 + (y - 424) * 0.0009 };
  };
  var B0 = null;
  /** Le ballon : au pied pendant la course (petites touches), puis le geste, puis l'issue. */
  var ballAt = function (t) {
    var pl = playerAt(Math.min(t, CONTACT));
    var feet = function (pp, tt) {
      var touch = ((tt - RUN) % 330 + 330) % 330 / 330, ahead = tt > RUN ? 1 - touch : 0.4;
      return { x: pp.x + 56 * pp.s, y: pp.y - (8 + 22 * ahead) * pp.s, r: 12 * pp.s, spin: tt * 0.6, ground: pp.y - (8 + 22 * ahead) * pp.s, layer: 'near' };
    };
    if (P.end === 'smother') {
      if (t < ARRIVE) return feet(playerAt(t), t);
      return null; // le gardien a plongé dans les pieds et serre le ballon
    }
    if (t < CONTACT) return feet(playerAt(t), t);
    if (!B0) B0 = feet(playerAt(CONTACT), CONTACT);
    var kb = keeperBase(CONTACT);
    var hand = { x: kb.x + 16, y: kb.y - 200 * kb.s };
    var dest = CATCH ? hand : TG, r1 = CATCH ? 7 : 4.6;
    var dur = CATCH ? FLIGHT * 0.55 : FLIGHT;
    if (t < CONTACT + dur) {
      var p = (t - CONTACT) / dur, e = P.arc > 60 ? p : 1 - Math.pow(1 - p, 1.3);
      // Capté : une cloche plus courte, qui retombe dans les mains du gardien.
      var x = B0.x + (dest.x - B0.x) * e, y = B0.y + (dest.y - B0.y) * e - P.arc * (CATCH ? 0.45 : 1) * Math.sin(Math.PI * p);
      var gy = B0.ground + (G.line - B0.ground) * e;
      var beyond = y < keeperBase(t).y - 10 && e > 0.5;
      return { x: x, y: y, r: B0.r + (r1 - B0.r) * e, spin: p * 700, ground: gy, layer: beyond ? 'mid' : 'near' };
    }
    if (CATCH) return null; // capté par le gardien
    var dt = (t - ARRIVE) / 1000, side = P.u >= 0 ? 1 : -1;
    if (P.end === 'net') {
      var sink = outCubic(clamp(dt * 3, 0, 1));
      return { x: TG.x + (TG.x - 200) * 0.05 * sink, y: TG.y - 4 * sink + 10 * sink * sink, r: 4.6 * (1 - 0.18 * sink), spin: 700, ground: G.line - 4, layer: 'far' };
    }
    if (P.end === 'save') {
      return { x: TG.x + side * 160 * dt, y: TG.y - 80 * dt + 200 * dt * dt, r: 4.6 * (1 + dt * 1.2), spin: 700 + dt * 1400, ground: G.line + 30 * dt, layer: 'near' };
    }
    var away = Math.min(1.4, dt * 1.6);
    return { x: TG.x + (TG.x - B0.x) * 0.35 * away, y: TG.y + (TG.y - B0.y) * 0.25 * away, r: 4.6 * Math.max(0.35, 1 - away * 0.5), spin: 700 + dt * 900, ground: G.line, layer: 'far' };
  };

  // ── Confettis ────────────────────────────────────────────────
  var cv = $('confetti'), cx = cv.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1), W = 0, H = 0;
  var resize = function () { W = window.innerWidth; H = window.innerHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  resize(); window.addEventListener('resize', resize);
  var bits = [];
  var burst = function (count) {
    var cols = [ourKit.c1, ourKit.c2, '#ffd65a', '#ffffff'];
    for (var i = 0; i < count; i++) {
      var sd = i % 2 ? 1 : -1, off = (10 + Math.random() * 32) * Math.PI / 180, v = 11 + Math.random() * 10;
      bits.push({ x: W / 2 + sd * W * 0.46, y: H * 0.82, vx: -sd * Math.sin(off) * v, vy: -Math.cos(off) * v, w: 6 + Math.random() * 6,
        h: 9 + Math.random() * 8, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, f: Math.random() * 6, vf: 0.15 + Math.random() * 0.2, c: cols[i % cols.length] });
    }
  };
  var drawBits = function () {
    cx.clearRect(0, 0, W, H);
    for (var i = bits.length - 1; i >= 0; i--) {
      var b = bits[i];
      b.vy += 0.32; b.vx *= 0.985; b.vy *= 0.985; b.x += b.vx; b.y += b.vy; b.r += b.vr; b.f += b.vf;
      if (b.y > H + 40) { bits.splice(i, 1); continue; }
      cx.save(); cx.translate(b.x, b.y); cx.rotate(b.r); cx.scale(1, Math.cos(b.f)); cx.fillStyle = b.c; cx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h); cx.restore();
    }
  };

  // ── Rendu ────────────────────────────────────────────────────
  var fired = {};
  var once = function (t, at, key, fn) { if (t >= at && !fired[key]) { fired[key] = true; fn(); } };
  var tr = function (el, s) { el.style.transform = s; };
  var impactAt = -1e9;

  function render(t) {
    var inB = t >= A_END && t < C_START, inC = t >= C_START;
    $('shotA').style.opacity = t < A_END ? 1 : 0;
    $('shotB').style.opacity = inB ? 1 : 0;
    $('shotC').style.opacity = inC ? 1 : 0;
    $('black').style.opacity = f2(Math.max(bell((t - A_END + 140) / 280), bell((t - C_START + 140) / 280), 1 - seg(t, 0, 300)));

    // Plan A : gros plan, titre, cœur qui bat.
    tr($('heroA'), 'translateX(-50%) scale(' + (1 + 0.06 * seg(t, 0, A_END, inOut)).toFixed(4) + ')');
    $('momentTitle').style.opacity = seg(t, 200, 600);
    bigL.forEach(function (s, i) {
      var p = seg(t, 350 + i * 45, 800 + i * 45, outBack);
      s.style.opacity = clamp(p * 1.4, 0, 1);
      tr(s, 'translateY(' + ((1 - p) * 60).toFixed(1) + 'px) scale(' + (0.7 + 0.3 * p).toFixed(3) + ')');
    });
    var beat = Math.max(bell((t - 650) / 160), bell((t - 900) / 160), bell((t - 1250) / 160));
    tr($('bigWord'), 'scale(' + (1 + 0.05 * beat).toFixed(3) + ')');
    once(t, 650, 'b1', function () { post({ type: 'impact', strength: 'medium' }); });
    once(t, 1250, 'b2', function () { post({ type: 'impact', strength: 'medium' }); });

    // Plan B.
    if (inB || t < A_END + 200) {
      var z = 1 + 0.06 * seg(t, A_END, CONTACT, inOut) + 0.04 * seg(t, CONTACT, ARRIVE, inOut);
      tr($('pitch'), 'scale(' + z.toFixed(4) + ')');
      $('pitch').style.transformOrigin = '50% 55%';
      phoneEls.forEach(function (el, i) {
        var p = phones[i], ph = ((t / 1000) * p.sp + p.at) % 1;
        el.setAttribute('opacity', (bell(ph / 0.2) * (t > ARRIVE && good ? 1 : 0.5)).toFixed(2));
      });
      // Notre joueur, avec un léger rebond de course.
      var pl = playerAt(t), running = t > RUN && t < CONTACT ? 1 : 0;
      var bob = running * Math.abs(Math.sin(t / 105)) * 7 * pl.s;
      shooterG.g.setAttribute('transform', 'translate(' + f2(pl.x) + ' ' + f2(pl.y - bob) + ') scale(' + f2(pl.s) + ')');
      once(t, CONTACT - 420, 'shoot', function () { if (shooterRig && P.end !== 'smother') shooterRig.setPose('shootBack'); });
      // Le gardien : sort, puis plonge (frappe, crochet) ou saute bras tendus (piqué).
      var kb = keeperBase(t), dv = seg(t, DIVE, DIVE + DIVE_DUR, outCubic), kx = kb.x, ky = kb.y, rot = 0;
      if (P.action === 'chip') {
        ky -= 22 * bell(seg(t, CONTACT + 120, CONTACT + 720, function (q) { return q; }));
      } else if (P.dive) {
        var reach = rounding ? 70 : 52;
        kx += P.dive * reach * dv; ky += (rounding ? 30 : 0) * dv - 10 * bell(dv * 0.92); rot = P.dive * 76 * dv;
      }
      keeperG.g.setAttribute('transform', 'translate(' + f2(kx) + ' ' + f2(ky) + ') rotate(' + f2(rot) + ' 0 ' + f2(-150 * kb.s) + ') scale(' + f2(kb.s) + ')');
      once(t, OUT + 300, 'kready', function () { if (keeperRig) keeperRig.setPose('keeper'); });
      once(t, P.action === 'chip' ? CONTACT + 120 : DIVE, 'dive', function () { if (keeperRig && (P.dive || P.action === 'chip')) keeperRig.setPose('stretch'); });
      // Le ballon, dans le bon calque de profondeur.
      var bl = ballAt(t), layers = { far: '', mid: '', near: '' };
      if (bl) layers[bl.layer] = shadowSvg(bl.x, bl.ground, bl.r * 0.9) + ballSvg(bl.x, bl.y, bl.r, bl.spin);
      $('ballFar').innerHTML = layers.far;
      $('ballMid').innerHTML = layers.mid;
      $('ballNear').innerHTML = layers.near;
      var amp = P.end === 'net' && t >= ARRIVE ? 12 * Math.exp(-(t - ARRIVE) / 260) * Math.cos((t - ARRIVE) / 70) : 0;
      if (!fired.netDrawn || amp || (t >= ARRIVE && !fired.netRest)) {
        drawNet(Math.abs(amp) > 0.2 ? amp : 0);
        fired.netDrawn = true;
        if (t >= ARRIVE && Math.abs(amp) <= 0.2) fired.netRest = true;
      }
      once(t, CONTACT, 'contact', function () { if (P.end !== 'smother') post({ type: 'impact', strength: 'medium' }); });
      once(t, ARRIVE, 'arrive', function () {
        impactAt = t;
        post({ type: 'impact', strength: good ? 'heavy' : 'medium' });
      });
    }
    $('flash').style.opacity = f2(good ? bell((t - ARRIVE) / 240) * 0.7 : 0);
    var shk = t - impactAt, amp2 = good && shk >= 0 && shk < 380 ? (1 - shk / 380) * 8 : 0;
    $('stage').style.transform = amp2 ? 'translate(' + f2(Math.sin(shk * 0.09) * amp2) + 'px,' + f2(Math.cos(shk * 0.07) * amp2 * 0.6) + 'px)' : '';

    // Plan C : la réaction.
    if (inC) {
      once(t, C_START, 'react', function () {
        if (heroC) heroC.setPose(good ? 'celebrate' : 'despair');
        if (good) burst(90);
      });
      once(t, C_START + 800, 'burst2', function () { if (good) burst(50); });
      tr($('heroC'), 'translateX(-50%) scale(' + (1 + 0.04 * seg(t, C_START, END, inOut)).toFixed(4) + ')');
      resL.forEach(function (s, i) {
        var p = seg(t, C_START + 120 + i * 50, C_START + 600 + i * 50, outBack);
        s.style.opacity = clamp(p * 1.4, 0, 1);
        tr(s, 'translateY(' + ((1 - p) * -50).toFixed(1) + 'px) scale(' + (1.4 - 0.4 * p).toFixed(3) + ')');
      });
    }
    $('skip').style.opacity = f2(seg(t, 900, 1300) * 0.9);
    drawBits();
  }

  // ── Boucle, fin et toucher ───────────────────────────────────
  var start = performance.now(), finished = false, endAt = 0;
  // Aperçu navigateur : ?t=3000 fige la chronologie à cet instant (sans effet dans l'app).
  var frozen = /[?&]t=(\\d+)/.exec(location.search || '');
  var finish = function () {
    if (finished) return;
    finished = true;
    endAt = performance.now();
    setTimeout(function () { rigs.forEach(function (r) { r.stop(); }); post({ type: 'done' }); }, 340);
  };
  var frame = function (now) {
    var t = frozen ? Number(frozen[1]) : now - start;
    render(t);
    if (t >= END && !frozen) finish();
    if (finished) {
      var out = clamp((now - endAt) / 320, 0, 1);
      $('stage').style.opacity = 1 - out;
      if (out >= 1) return;
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  var onTap = function () { if (performance.now() - start > 600) finish(); };
  document.addEventListener('click', onTap);
  document.addEventListener('touchend', onTap);
})();
</script>
</body>
</html>`;

},
"cinematics/penaltyTemplate": function (exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PENALTY_TEMPLATE = void 0;
exports.PENALTY_TEMPLATE = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<style>
  :root { --c1: #d62828; --safeTop: env(safe-area-inset-top, 0px); --safeBottom: env(safe-area-inset-bottom, 0px); }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
  body { font-family: "Oswald", "Avenir Next Condensed", "HelveticaNeue-CondensedBold", "Roboto Condensed", "Arial Narrow", sans-serif;
    color: #fff; -webkit-user-select: none; user-select: none; -webkit-tap-highlight-color: transparent; }
  #stage { position: absolute; inset: 0; overflow: hidden; background: #04060a; }
  .shot { position: absolute; inset: 0; opacity: 0; will-change: opacity, transform; }
  svg.full { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }

  /* Gros plans : stade flou, lumières, public. */
  .close { background:
      radial-gradient(ellipse at 50% 95%, rgba(255,255,255,.16) 0%, transparent 45%),
      radial-gradient(ellipse at 50% 30%, color-mix(in srgb, var(--c1) 35%, #0b1220) 0%, #05070c 70%); }
  .bokeh { position: absolute; border-radius: 50%; filter: blur(10px); opacity: .55; }
  .closeHero { position: absolute; left: 50%; bottom: calc(var(--safeBottom) - 10px); width: min(108vw, 470px); transform: translateX(-50%); }
  .closeHero svg { display: block; width: 100%; height: auto; filter: drop-shadow(0 20px 30px rgba(0,0,0,.5)); }
  .crowdBand { position: absolute; left: 0; right: 0; bottom: 0; height: 34%; }

  #titleBox { position: absolute; left: 16px; right: 16px; top: calc(var(--safeTop) + 70px); text-align: center; }
  #momentTitle { font-size: 15px; letter-spacing: 5px; text-transform: uppercase; opacity: 0; }
  #bigWord { margin-top: 8px; padding-left: 6px; font-size: 76px; line-height: 1; font-weight: 700; letter-spacing: 6px; text-transform: uppercase; white-space: nowrap;
    text-shadow: 0 6px 30px rgba(0,0,0,.55); }
  #bigWord span, #resultWord span { display: inline-block; will-change: transform, opacity; }
  #resultBox { position: absolute; left: 12px; right: 12px; top: calc(var(--safeTop) + 64px); text-align: center; }
  #resultWord { padding-left: 4px; font-size: 84px; line-height: 1; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; white-space: nowrap;
    text-shadow: 0 8px 34px rgba(0,0,0,.55); }
  #resultWord.good { color: #ffd65a; text-shadow: 0 0 34px rgba(255,214,90,.55), 0 8px 30px rgba(0,0,0,.5); }
  #resultWord.bad { color: #ffffff; opacity: .92; }

  #vignette { position: absolute; inset: 0; pointer-events: none;
    background: radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,.55) 100%); }
  #flash { position: absolute; inset: 0; background: #fff; opacity: 0; pointer-events: none; }
  #black { position: absolute; inset: 0; background: #000; opacity: 0; pointer-events: none; }
  #confetti { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
  #skip { position: absolute; left: 0; right: 0; bottom: calc(var(--safeBottom) + 10px); text-align: center; opacity: 0;
    font-family: -apple-system, system-ui, sans-serif; font-size: 11px; letter-spacing: 1px; color: rgba(255,255,255,.6); }
</style>
</head>
<body>
<div id="stage">
  <div class="shot close" id="shotA">
    <div id="bokehA"></div>
    <svg class="crowdBand" id="crowdA" viewBox="0 0 400 120" preserveAspectRatio="none"></svg>
    <div class="closeHero" id="heroA"></div>
    <div id="titleBox"><div id="momentTitle"></div><div id="bigWord"></div></div>
  </div>
  <div class="shot" id="shotB">
    <svg class="full" id="pitch" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice"></svg>
  </div>
  <div class="shot close" id="shotC">
    <div id="bokehC"></div>
    <svg class="crowdBand" id="crowdC" viewBox="0 0 400 120" preserveAspectRatio="none"></svg>
    <div class="closeHero" id="heroC"></div>
    <div id="resultBox"><div id="resultWord"></div></div>
  </div>
  <div id="vignette"></div>
  <canvas id="confetti"></canvas>
  <div id="flash"></div>
  <div id="black"></div>
  <div id="skip"></div>
</div>
<script>/*__RIG_JS__*/</script>
<script>
window.CINE = /*__CINE_DATA__*/null;
(function () {
  var D = window.CINE || {};
  var L = D.labels || {};
  var P = D.plan || { target: { x: 290, y: 682 }, arc: 18, flight: 420, end: 'net', dive: -1, diveAt: 40, stutter: false, result: 'goal' };
  var keeperRole = D.role === 'keeper';
  var good = P.result === 'goal' || P.result === 'save' || P.result === 'wide';
  var $ = function (id) { return document.getElementById(id); };
  var post = function (msg) {
    var s = JSON.stringify(msg);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(s);
    else if (window.parent && window.parent !== window) window.parent.postMessage(s, '*');
  };
  var NS = 'http://www.w3.org/2000/svg';

  // ── Outils de temps ─────────────────────────────────────────
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var outCubic = function (p) { return 1 - Math.pow(1 - p, 3); };
  var inOut = function (p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
  var outBack = function (p) { var c = 1.6; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
  var seg = function (t, a, b, ease) { var p = clamp((t - a) / (b - a), 0, 1); return (ease || outCubic)(p); };
  var bell = function (p) { return p <= 0 || p >= 1 ? 0 : Math.sin(Math.PI * p); };
  var seeded = function (i, salt) { var x = Math.sin(i * 12.9898 + (salt || 0) * 78.233) * 43758.5453; return x - Math.floor(x); };
  var f2 = function (n) { return Math.round(n * 100) / 100; };

  var ourKit = D.kit || { c1: '#d62828', c2: '#151515' };
  var root = document.documentElement.style;
  root.setProperty('--c1', ourKit.c1);
  if (D.safeTop != null) root.setProperty('--safeTop', D.safeTop + 'px');
  if (D.safeBottom != null) root.setProperty('--safeBottom', D.safeBottom + 'px');

  // ── La chronologie ───────────────────────────────────────────
  var A_END = 1500;
  var RUN = 2950;                              // début de la course d'élan : avant, une pause (le tireur attend le sifflet)
  var RUN_DUR = 950;                           // course d'élan, assez lente pour la suivre
  var STUTTER = P.stutter ? 380 : 0;
  var CONTACT = RUN + RUN_DUR + STUTTER;       // le pied touche le ballon
  var SLOW = 1.4;                              // le vol du ballon, au ralenti
  var FLIGHT = P.flight * SLOW;
  var ARRIVE = CONTACT + FLIGHT;               // le ballon atteint le but
  var DIVE = CONTACT + P.diveAt * SLOW;        // le gardien s'élance
  var DIVE_DUR = 380 * SLOW;
  var C_START = ARRIVE + 750;                  // gros plan sur la réaction
  var END = C_START + 2500;

  // ── Mise en place ────────────────────────────────────────────
  var letters = function (el, text) {
    el.innerHTML = '';
    return String(text || '').split('').map(function (ch) {
      var s = document.createElement('span');
      s.textContent = ch === ' ' ? '\\u00a0' : ch;
      el.appendChild(s);
      return s;
    });
  };
  $('momentTitle').textContent = D.title || '';
  var bigL = letters($('bigWord'), (L.penalty || 'Penalty').toUpperCase());
  var resL = letters($('resultWord'), String(L.result || '').toUpperCase());
  $('resultWord').className = good ? 'good' : 'bad';
  // Les grands mots tiennent toujours dans la largeur de l'écran (marge pour le battement de cœur).
  var fitWord = function (el, max) {
    var spans = el.querySelectorAll('span');
    if (!spans.length) return;
    var width = function () { return spans[spans.length - 1].getBoundingClientRect().right - spans[0].getBoundingClientRect().left; };
    var size = max;
    el.style.fontSize = size + 'px';
    while (size > 30 && width() > el.clientWidth * 0.92) { size -= 2; el.style.fontSize = size + 'px'; }
  };
  fitWord($('bigWord'), 76);
  fitWord($('resultWord'), 84);
  $('skip').textContent = L.skip || '';

  // Lumières floues des gros plans.
  ['bokehA', 'bokehC'].forEach(function (id, k) {
    var box = $(id), html = '';
    for (var i = 0; i < 9; i++) {
      var sz = 30 + seeded(i, k + 1) * 70;
      html += '<div class="bokeh" style="left:' + (seeded(i, k + 2) * 100).toFixed(1) + '%;top:' + (5 + seeded(i, k + 3) * 45).toFixed(1) +
        '%;width:' + sz.toFixed(0) + 'px;height:' + sz.toFixed(0) + 'px;background:' + (i % 3 ? 'rgba(255,240,210,.5)' : 'rgba(255,255,255,.35)') + '"></div>';
    }
    box.innerHTML = html;
  });
  // Public des gros plans : silhouettes sombres.
  var crowd = function (rows) {
    var s = '';
    for (var row = 0; row < rows; row++) {
      var y = 60 + row * 26, col = row ? 'rgba(0,0,0,.8)' : 'rgba(0,0,0,.5)';
      s += '<rect x="0" y="' + (y + 8) + '" width="400" height="80" fill="' + col + '"/>';
      for (var k = 0; k < 24; k++) {
        var x = k * 17 + (row ? 8 : 0) + seeded(k, row) * 6, r = 7 + seeded(k, row + 3) * 3;
        s += '<circle cx="' + x.toFixed(1) + '" cy="' + (y - seeded(k, row + 5) * 6).toFixed(1) + '" r="' + r.toFixed(1) + '" fill="' + col + '"/>';
        s += '<rect x="' + (x - r * 1.5).toFixed(1) + '" y="' + (y + 3).toFixed(1) + '" width="' + (r * 3).toFixed(1) + '" height="24" rx="7" fill="' + col + '"/>';
      }
    }
    return s;
  };
  $('crowdA').innerHTML = crowd(2);
  $('crowdC').innerHTML = crowd(2);

  // ── Plan B : deux caméras ────────────────────────────────────
  // Tireur : vue télé classique, derrière notre joueur (de dos, au premier plan), le but au fond.
  // Gardien : derrière le but, à travers le filet, notre gardien de dos au premier plan.
  // Le déroulé (P.target) est exprimé sur le plan du but de la vue gardien : x 30–370, y 400 (barre) à 735 (ligne).
  var VIEW = keeperRole ? {
    goal: { x0: 30, x1: 370, bar: 400, line: 735, post: 8 }, spot: { x: 200, y: 566 }, r0: 5.5, r1: 19,
    keeper: { x: 200, y: 742, s: 0.74, dive: 105, lift: 40 }, horizon: 330, standsTop: 180,
    zoomOrigin: '50% 62%',
  } : {
    goal: { x0: 64, x1: 336, bar: 404, line: 494, post: 6 }, spot: { x: 206, y: 676 }, r0: 11, r1: 4.2,
    keeper: { x: 200, y: 497, s: 0.27, dive: 74, lift: 18 }, horizon: 392, standsTop: 96,
    zoomOrigin: '50% 58%',
  };
  var G = VIEW.goal;
  /** Point du plan du but (repère du déroulé) → écran. */
  var onGoal = function (x, y) {
    return { x: G.x0 + (x - 30) / 340 * (G.x1 - G.x0), y: G.bar + (y - 400) / 335 * (G.line - G.bar) };
  };
  var TG = onGoal(P.target.x, P.target.y);

  var pitch = $('pitch');
  var svg = '<defs>' +
    '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03050b"/><stop offset="1" stop-color="#101a33"/></linearGradient>' +
    '<radialGradient id="glow"><stop offset="0" stop-color="rgba(255,250,235,.95)"/><stop offset=".25" stop-color="rgba(255,250,235,.35)"/><stop offset="1" stop-color="rgba(255,250,235,0)"/></radialGradient>' +
    '<linearGradient id="grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f6b34"/><stop offset="1" stop-color="#2f8f47"/></linearGradient>' +
    '</defs>';
  svg += '<rect width="400" height="' + (VIEW.horizon + 10) + '" fill="url(#sky)"/>';
  svg += '<circle cx="40" cy="60" r="120" fill="url(#glow)" opacity=".55"/><circle cx="360" cy="60" r="120" fill="url(#glow)" opacity=".55"/>';
  // Tribunes et public (derrière le but dans la vue tireur, en face dans la vue gardien).
  var standsH = VIEW.horizon - VIEW.standsTop;
  svg += '<rect x="0" y="' + VIEW.standsTop + '" width="400" height="' + standsH + '" fill="#0a0f1c"/>';
  var phones = [], rows = Math.floor(standsH / 28);
  for (var row = 0; row < rows; row++) {
    var yy = VIEW.standsTop + 16 + row * 28, cc = 'rgba(' + (14 + row * 3) + ',' + (20 + row * 4) + ',' + (36 + row * 5) + ',1)';
    for (var k = 0; k < 34; k++) {
      var xx = k * 12 + (row % 2 ? 6 : 0) + seeded(k, row + 20) * 4;
      svg += '<circle cx="' + xx.toFixed(1) + '" cy="' + yy.toFixed(1) + '" r="4.6" fill="' + cc + '"/>';
      svg += '<rect x="' + (xx - 6).toFixed(1) + '" y="' + (yy + 3).toFixed(1) + '" width="12" height="16" rx="4" fill="' + cc + '"/>';
      if (seeded(k, row + 40) < 0.22) phones.push({ x: xx, y: yy - 2, at: seeded(k, row + 60), sp: 0.6 + seeded(k, row + 80) });
    }
  }
  phones.forEach(function (p, i) { svg += '<circle id="ph' + i + '" cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="1.8" fill="#fff" opacity="0"/>'; });
  if (!keeperRole) {
    // Panneaux publicitaires au bord du terrain, aux couleurs du club.
    svg += '<rect x="0" y="' + (VIEW.horizon - 14) + '" width="400" height="14" fill="' + ourKit.c1 + '" opacity=".85"/>';
    svg += '<rect x="0" y="' + (VIEW.horizon - 14) + '" width="400" height="3" fill="rgba(255,255,255,.35)"/>';
  }
  // Pelouse en perspective, bandes de tonte.
  var grassH = 800 - VIEW.horizon;
  svg += '<rect x="0" y="' + VIEW.horizon + '" width="400" height="' + grassH + '" fill="url(#grass)"/>';
  for (var b = 0; b < 12; b += 2) {
    var y0 = VIEW.horizon + grassH * Math.pow(b / 12, 1.7), y1 = VIEW.horizon + grassH * Math.pow((b + 1) / 12, 1.7);
    svg += '<rect x="0" y="' + y0.toFixed(1) + '" width="400" height="' + (y1 - y0).toFixed(1) + '" fill="rgba(255,255,255,.05)"/>';
  }
  var line = 'stroke="rgba(255,255,255,.75)" fill="none" stroke-linejoin="round"';
  if (keeperRole) {
    svg += '<path d="M-30 735 L88 515 L312 515 L430 735" stroke-width="2.6" ' + line + '/>';
    svg += '<path d="M110 735 L130 652 L270 652 L290 735" stroke-width="2.8" ' + line + '/>';
    svg += '<line x1="-20" y1="735" x2="420" y2="735" stroke-width="3.4" stroke="rgba(255,255,255,.8)"/>';
    svg += '<ellipse cx="200" cy="566" rx="3.4" ry="1.6" fill="rgba(255,255,255,.85)"/>';
  } else {
    // Ligne de but, petit rectangle et surface qui s'ouvrent vers nous, point de penalty.
    svg += '<line x1="-20" y1="' + G.line + '" x2="420" y2="' + G.line + '" stroke-width="2" stroke="rgba(255,255,255,.8)"/>';
    svg += '<path d="M104 ' + G.line + ' L92 530 L308 530 L296 ' + G.line + '" stroke-width="2.2" ' + line + '/>';
    svg += '<path d="M20 ' + G.line + ' L-70 790 M380 ' + G.line + ' L470 790" stroke-width="2.6" ' + line + '/>';
    svg += '<ellipse cx="' + VIEW.spot.x + '" cy="' + (VIEW.spot.y + 9) + '" rx="7" ry="2.6" fill="rgba(255,255,255,.85)"/>';
  }
  // Calques animés, du plus loin au plus près de la caméra.
  if (keeperRole) {
    svg += '<g id="shooterLayer"></g><g id="ballFar"></g><g id="keeperLayer"></g><g id="ballNear"></g>';
    svg += '<g id="frame"><rect x="26" y="396" width="8" height="341" fill="#f4f4f4"/><rect x="366" y="396" width="8" height="341" fill="#f4f4f4"/>' +
      '<rect x="26" y="396" width="348" height="8" fill="#f4f4f4"/></g><g id="net"></g>';
  } else {
    // Fond du filet en perspective, puis le gardien, puis le cadre devant lui.
    svg += '<path d="M' + G.x0 + ' ' + G.bar + ' L' + (G.x0 + 14) + ' ' + (G.bar - 12) + ' L' + (G.x1 - 14) + ' ' + (G.bar - 12) + ' L' + G.x1 + ' ' + G.bar +
      ' L' + G.x1 + ' ' + G.line + ' L' + G.x0 + ' ' + G.line + ' Z" fill="rgba(0,0,0,.28)"/>';
    svg += '<g id="net"></g><g id="ballFar"></g><g id="keeperLayer"></g>';
    svg += '<g id="frame"><rect x="' + (G.x0 - G.post) + '" y="' + (G.bar - G.post) + '" width="' + G.post + '" height="' + (G.line - G.bar + G.post) + '" fill="#f4f4f4"/>' +
      '<rect x="' + G.x1 + '" y="' + (G.bar - G.post) + '" width="' + G.post + '" height="' + (G.line - G.bar + G.post) + '" fill="#f4f4f4"/>' +
      '<rect x="' + (G.x0 - G.post) + '" y="' + (G.bar - G.post) + '" width="' + (G.x1 - G.x0 + 2 * G.post) + '" height="' + G.post + '" fill="#f4f4f4"/></g>';
    svg += '<g id="ballNear"></g><g id="shooterLayer"></g>';
  }
  svg += '<g id="spark"></g>';
  pitch.innerHTML = svg;
  var phoneEls = phones.map(function (p, i) { return $('ph' + i); });

  // Les joueurs du plan B, chacun dans son groupe (position, plongeon) autour du squelette.
  var R = window.DestinyRig;
  var mk = function (parent, id) {
    var g = document.createElementNS(NS, 'g'); g.setAttribute('id', id);
    var inner = document.createElementNS(NS, 'g'); g.appendChild(inner);
    $(parent).appendChild(g);
    return { g: g, inner: inner };
  };
  var shooterG = mk('shooterLayer', 'shooterG'), keeperG = mk('keeperLayer', 'keeperG');
  var keeperKit = D.keeperKit || { c1: '#22c55e', c2: '#111111' };
  var oppKit = D.oppKit || { c1: '#f4f4f4', c2: '#1d3a8a' };
  var rigs = [];
  // Tireur : de face au loin (vue gardien) ou de dos au premier plan, nom et numéro (vue tireur).
  var shooterRig = R ? R.mount(shooterG.inner, keeperRole
    ? { avatar: D.oppAvatar, kit: oppKit, pose: 'front', uid: 'f', shadow: true }
    : { avatar: D.avatar, kit: ourKit, pose: 'back', uid: 'f', shadow: true, shirtName: D.shirtName, shirtNumber: D.number }) : null;
  // Gardien : notre joueur de dos (vue gardien) ou l'adversaire de face au fond (vue tireur).
  var keeperRig = R ? R.mount(keeperG.inner, keeperRole
    ? { avatar: D.avatar, kit: keeperKit, pose: 'back', uid: 'n', shadow: true, shirtName: D.shirtName, shirtNumber: 1 }
    : { avatar: D.oppAvatar, kit: D.oppKeeperKit || keeperKit, pose: 'keeper', uid: 'n', shadow: true }) : null;
  if (shooterRig) rigs.push(shooterRig);
  if (keeperRig) rigs.push(keeperRig);
  // Gros plans : notre joueur, en buste.
  var closeKit = keeperRole ? keeperKit : ourKit;
  var heroA = null, heroC = null;
  if (R && D.avatar) {
    $('heroA').innerHTML = '<svg viewBox="-115 -318 230 330"><g id="hA"></g></svg>';
    $('heroC').innerHTML = '<svg viewBox="-115 -318 230 330"><g id="hC"></g></svg>';
    heroA = R.mount($('hA'), { avatar: D.avatar, kit: closeKit, pose: keeperRole ? 'keeper' : 'focus', uid: 'a', shadow: false });
    heroC = R.mount($('hC'), { avatar: D.avatar, kit: closeKit, pose: 'front', uid: 'c', shadow: false });
    rigs.push(heroA, heroC);
  }

  // Le filet : une grille dont les nœuds se déforment autour de l'impact. Vue gardien : il est entre
  // nous et le jeu et se gonfle vers nous ; vue tireur : on le voit au fond du but et il se creuse.
  var NET = keeperRole ? { x0: 34, x1: 366, y0: 404, y1: 735, step: 15, alpha: 0.26 } : { x0: G.x0, x1: G.x1, y0: G.bar, y1: G.line, step: 9, alpha: 0.32 };
  var netG = $('net');
  var drawNet = function (impact, amp) {
    var cols = Math.round((NET.x1 - NET.x0) / NET.step), rws = Math.round((NET.y1 - NET.y0) / NET.step), d = '';
    var spread = keeperRole ? 2600 : 900;
    var disp = function (x, y) {
      if (!amp) return [x, y];
      var dx = x - impact.x, dy = y - impact.y, dist2 = dx * dx + dy * dy, k = amp * Math.exp(-dist2 / spread);
      var len = Math.sqrt(dist2) || 1;
      return keeperRole ? [x + dx / len * k * 0.6, y + dy / len * k * 0.6 + k * 0.5] : [x - dx / len * k * 0.35, y - dy / len * k * 0.35 - k * 0.25];
    };
    for (var i = 0; i <= cols; i++) {
      var x = NET.x0 + i * (NET.x1 - NET.x0) / cols;
      for (var j = 0; j <= rws; j++) {
        var p = disp(x, NET.y0 + j * (NET.y1 - NET.y0) / rws);
        d += (j ? 'L' : 'M') + f2(p[0]) + ' ' + f2(p[1]);
      }
    }
    for (var j2 = 0; j2 <= rws; j2++) {
      var y = NET.y0 + j2 * (NET.y1 - NET.y0) / rws;
      for (var i2 = 0; i2 <= cols; i2++) {
        var q = disp(NET.x0 + i2 * (NET.x1 - NET.x0) / cols, y);
        d += (i2 ? 'L' : 'M') + f2(q[0]) + ' ' + f2(q[1]);
      }
    }
    netG.innerHTML = '<path d="' + d + '" fill="none" stroke="rgba(255,255,255,' + NET.alpha + ')" stroke-width="' + (keeperRole ? 1.1 : 0.8) + '"/>';
  };

  // Le ballon, dessiné à l'échelle de la profondeur.
  var ballSvg = function (x, y, r, spin) {
    return '<g transform="translate(' + f2(x) + ' ' + f2(y) + ') rotate(' + f2(spin) + ')">' +
      '<circle r="' + f2(r) + '" fill="#fafafa" stroke="#cfd8dc" stroke-width="' + f2(r * 0.08) + '"/>' +
      '<circle cx="' + f2(-r * 0.25) + '" cy="' + f2(-r * 0.2) + '" r="' + f2(r * 0.32) + '" fill="#2b2b2b"/>' +
      '<circle cx="' + f2(r * 0.5) + '" cy="' + f2(r * 0.35) + '" r="' + f2(r * 0.2) + '" fill="#2b2b2b"/></g>';
  };
  var SPOT = VIEW.spot, R0 = VIEW.r0, R1 = VIEW.r1;
  var shadowSvg = function (x, y, r) { return '<ellipse cx="' + f2(x) + '" cy="' + f2(y) + '" rx="' + f2(r) + '" ry="' + f2(r * 0.3) + '" fill="rgba(0,0,0,.35)"/>'; };

  /**
   * Position du ballon à l'instant t : posé, en vol (cloche éventuelle), puis selon l'issue.
   * far : derrière le plan du but (au fond du filet dans la vue tireur, entre le gardien et nous dans la vue gardien).
   */
  var ballAt = function (t) {
    var line = G.line;
    if (t < CONTACT) return { x: SPOT.x, y: SPOT.y - R0, r: R0, spin: 0, far: false, ground: SPOT.y };
    if (t < ARRIVE) {
      var p = (t - CONTACT) / FLIGHT, e = P.arc > 40 ? p : 1 - Math.pow(1 - p, 1.4);
      var arcPx = P.arc * (keeperRole ? 1 : 0.55);
      var x = SPOT.x + (TG.x - SPOT.x) * e, y = SPOT.y + (TG.y - SPOT.y) * e - arcPx * bell(p);
      return { x: x, y: y, r: R0 + (R1 - R0) * e, spin: p * 540, far: false, ground: SPOT.y + (line - SPOT.y) * e };
    }
    var dt = (t - ARRIVE) / 1000;
    var side = TG.x >= 200 ? 1 : -1;
    var depth = keeperRole ? 1 : -1; // vers la caméra (+) ou au fond (-)
    if (P.end === 'net') {
      var sink = outCubic(clamp(dt * 3, 0, 1));
      return keeperRole
        ? { x: TG.x, y: TG.y + 26 * sink, r: R1 * 0.96, spin: 540, far: true, ground: line }
        : { x: TG.x + (TG.x - 200) * 0.06 * sink, y: TG.y - 8 * sink + 10 * sink * sink, r: R1 * (1 - 0.18 * sink), spin: 540, far: true, ground: line - 8 };
    }
    if (P.end === 'catch') return null;
    if (P.end === 'wide') {
      var pw = 1 + dt * 2.4;
      return keeperRole
        ? { x: SPOT.x + (TG.x - SPOT.x) * pw, y: SPOT.y + (TG.y - SPOT.y) * pw, r: R1 * (1 + dt * 2), spin: 540 + dt * 900, far: false, ground: 800 }
        : { x: TG.x + side * 160 * dt, y: TG.y - 90 * dt, r: R1 * Math.max(0.4, 1 - dt), spin: 540 + dt * 900, far: true, ground: line };
    }
    if (P.end === 'deflect') {
      return { x: TG.x + side * (keeperRole ? 420 : 240) * dt, y: TG.y - (keeperRole ? 300 : 160) * dt + (keeperRole ? 500 : 420) * dt * dt,
        r: R1 * (1 + dt * (keeperRole ? 0.6 : 0.9)), spin: 540 + dt * 1400, far: false, ground: line + 40 * dt };
    }
    // Poteau ou barre : le ballon rebondit vers le terrain.
    var back = clamp(dt * 1.7, 0, 1);
    if (keeperRole) {
      var bx = P.end === 'post' ? TG.x - side * 160 * back : TG.x + side * 60 * back;
      var by = P.end === 'post' ? TG.y - 60 * bell(back) - 40 * back : TG.y - 120 * back;
      return { x: bx, y: by, r: R1 - (R1 - R0 * 1.4) * back, spin: 540 - dt * 900, far: false, ground: line - 160 * back };
    }
    var rx = P.end === 'post' ? TG.x - side * 90 * back : TG.x + side * 40 * back;
    var ry = P.end === 'post' ? TG.y + 140 * back - 40 * bell(back) : TG.y + 170 * back - 70 * bell(back);
    return { x: rx, y: ry, r: R1 + (8 - R1) * back, spin: 540 - dt * 900, far: false, ground: line + 150 * back, d: depth };
  };

  // ── Confettis ────────────────────────────────────────────────
  var cv = $('confetti'), cx = cv.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1), W = 0, H = 0;
  var resize = function () { W = window.innerWidth; H = window.innerHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  resize(); window.addEventListener('resize', resize);
  var bits = [];
  var burst = function (count) {
    var cols = [ourKit.c1, ourKit.c2, '#ffd65a', '#ffffff'];
    for (var i = 0; i < count; i++) {
      var side = i % 2 ? 1 : -1, off = (10 + Math.random() * 32) * Math.PI / 180, v = 11 + Math.random() * 10;
      bits.push({ x: W / 2 + side * W * 0.46, y: H * 0.82, vx: -side * Math.sin(off) * v, vy: -Math.cos(off) * v, w: 6 + Math.random() * 6,
        h: 9 + Math.random() * 8, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, f: Math.random() * 6, vf: 0.15 + Math.random() * 0.2, c: cols[i % cols.length] });
    }
  };
  var drawBits = function () {
    cx.clearRect(0, 0, W, H);
    for (var i = bits.length - 1; i >= 0; i--) {
      var b = bits[i];
      b.vy += 0.32; b.vx *= 0.985; b.vy *= 0.985; b.x += b.vx; b.y += b.vy; b.r += b.vr; b.f += b.vf;
      if (b.y > H + 40) { bits.splice(i, 1); continue; }
      cx.save(); cx.translate(b.x, b.y); cx.rotate(b.r); cx.scale(1, Math.cos(b.f)); cx.fillStyle = b.c; cx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h); cx.restore();
    }
  };

  // ── Rendu ────────────────────────────────────────────────────
  var fired = {};
  var once = function (t, at, key, fn) { if (t >= at && !fired[key]) { fired[key] = true; fn(); } };
  var tr = function (el, s) { el.style.transform = s; };
  var impactAt = -1e9;

  function render(t) {
    // Les plans : fondus au noir rapides entre A, B et C.
    var inB = t >= A_END && t < C_START, inC = t >= C_START;
    $('shotA').style.opacity = t < A_END ? 1 : 0;
    $('shotB').style.opacity = inB ? 1 : 0;
    $('shotC').style.opacity = inC ? 1 : 0;
    var cut = Math.max(bell((t - A_END + 140) / 280), bell((t - C_START + 140) / 280), 1 - seg(t, 0, 300));
    $('black').style.opacity = f2(cut);

    // Plan A : gros plan, titre, cœur qui bat.
    var push = 1 + 0.06 * seg(t, 0, A_END, inOut);
    tr($('heroA'), 'translateX(-50%) scale(' + push.toFixed(4) + ')');
    $('momentTitle').style.opacity = seg(t, 200, 600);
    bigL.forEach(function (s, i) {
      var p = seg(t, 350 + i * 45, 800 + i * 45, outBack);
      s.style.opacity = clamp(p * 1.4, 0, 1);
      tr(s, 'translateY(' + ((1 - p) * 60).toFixed(1) + 'px) scale(' + (0.7 + 0.3 * p).toFixed(3) + ')');
    });
    var beat = Math.max(bell((t - 650) / 160), bell((t - 900) / 160), bell((t - 1250) / 160));
    tr($('bigWord'), 'scale(' + (1 + 0.05 * beat).toFixed(3) + ')');
    once(t, 650, 'b1', function () { post({ type: 'impact', strength: 'medium' }); });
    once(t, 1250, 'b2', function () { post({ type: 'impact', strength: 'medium' }); });

    // Plan B : derrière le tireur (ou derrière le but si on est gardien).
    if (inB || t < A_END + 200) {
      var z = 1 + 0.05 * seg(t, A_END, CONTACT, inOut) + 0.03 * seg(t, CONTACT, ARRIVE);
      tr($('pitch'), 'scale(' + z.toFixed(4) + ')');
      $('pitch').style.transformOrigin = VIEW.zoomOrigin;
      phoneEls.forEach(function (el, i) {
        var p = phones[i], ph = ((t / 1000) * p.sp + p.at) % 1;
        el.setAttribute('opacity', (bell(ph / 0.2) * (t > ARRIVE && good ? 1 : 0.5)).toFixed(2));
      });
      // Le tireur : course d'élan (avec un temps d'arrêt éventuel), puis frappe.
      var runP;
      if (P.stutter) {
        var a1 = seg(t, RUN, RUN + RUN_DUR * 0.55, inOut) * 0.6, a2 = seg(t, RUN + RUN_DUR * 0.55 + STUTTER, CONTACT - 30, inOut) * 0.4;
        runP = a1 + a2;
      } else runP = seg(t, RUN, CONTACT - 30, inOut);
      var sx, sy, ss;
      if (keeperRole) {
        // Course en diagonale depuis le côté opposé au tir, pour que le gardien ne le masque pas.
        var from = TG.x >= 200 ? -1 : 1;
        sx = 200 + from * (62 - 46 * runP); sy = 520 + 40 * runP; ss = 0.34 + 0.06 * runP;
      } else {
        // Notre joueur s'éloigne de la caméra en diagonale jusqu'au ballon, pied droit sur le ballon.
        sx = 112 + 66 * runP; sy = 806 - 96 * runP; ss = 0.74 - 0.1 * runP;
      }
      shooterG.g.setAttribute('transform', 'translate(' + f2(sx) + ' ' + f2(sy) + ') scale(' + f2(ss) + ')');
      once(t, CONTACT - 420, 'shoot', function () { if (shooterRig) shooterRig.setPose(keeperRole ? 'shoot' : 'shootBack'); });
      // Le gardien : en appui, balancement latéral, puis plongeon (ou reste au centre).
      var K = VIEW.keeper;
      var sway = t < DIVE ? Math.sin(t / 260) * 7 * K.s / 0.74 * seg(t, A_END, A_END + 400) : 0;
      var dv = seg(t, DIVE, DIVE + DIVE_DUR, outCubic), side = P.dive;
      var kx = K.x + sway + side * K.dive * dv, ky = K.y - (side ? K.lift * bell(dv * 0.92) : 0), rot = side * 72 * dv;
      keeperG.g.setAttribute('transform', 'translate(' + f2(kx) + ' ' + f2(ky) + ') rotate(' + f2(rot) + ' 0 ' + f2(-150 * K.s) + ') scale(' + K.s + ')');
      once(t, A_END, 'kpose', function () { if (keeperRig) keeperRig.setPose(keeperRole ? 'keeperBack' : 'keeper'); });
      once(t, DIVE, 'dive', function () { if (keeperRig && side) keeperRig.setPose(keeperRole ? 'stretchBack' : 'stretch'); });
      // Le ballon.
      var bl = ballAt(t), farL = '', nearL = '';
      if (bl) {
        var sh = shadowSvg(bl.x, bl.ground, bl.r * 0.9);
        var ball = ballSvg(bl.x, bl.y, bl.r, bl.spin);
        if (bl.far) farL = sh + ball; else nearL = sh + ball;
      }
      $('ballFar').innerHTML = farL;
      $('ballNear').innerHTML = nearL;
      // Le filet tremble quand le ballon y entre.
      var amp = P.end === 'net' && t >= ARRIVE ? (keeperRole ? 34 : 16) * Math.exp(-(t - ARRIVE) / 260) * Math.cos((t - ARRIVE) / 70) : 0;
      if (!fired.netDrawn || amp || (t >= ARRIVE && !fired.netRest)) {
        drawNet(TG, Math.abs(amp) > 0.3 ? amp : 0);
        fired.netDrawn = true;
        if (t >= ARRIVE && Math.abs(amp) <= 0.3) fired.netRest = true;
      }
      // Poteau ou barre : éclair blanc au point d'impact.
      var spark = (P.end === 'post' || P.end === 'bar') ? bell((t - ARRIVE) / 220) : 0;
      var sparkR = keeperRole ? 10 + 30 * spark : 5 + 16 * spark;
      $('spark').innerHTML = spark ? '<circle cx="' + f2(TG.x) + '" cy="' + f2(TG.y) + '" r="' + f2(sparkR) + '" fill="rgba(255,255,255,' + f2(0.8 * spark) + ')"/>' : '';
      once(t, RUN - 260, 'whistle', function () { post({ type: 'impact', strength: 'medium' }); });
      once(t, CONTACT, 'contact', function () { post({ type: 'impact', strength: 'medium' }); });
      once(t, ARRIVE, 'arrive', function () {
        impactAt = t;
        post({ type: 'impact', strength: good ? 'heavy' : 'medium' });
      });
    }
    // Le flash blanc au moment du but (ou de l'arrêt).
    $('flash').style.opacity = f2(bell((t - ARRIVE) / 240) * (good ? 0.7 : 0.25));
    var shk = t - impactAt, amp2 = shk >= 0 && shk < 380 ? (1 - shk / 380) * 8 : 0;
    $('stage').style.transform = amp2 ? 'translate(' + f2(Math.sin(shk * 0.09) * amp2) + 'px,' + f2(Math.cos(shk * 0.07) * amp2 * 0.6) + 'px)' : '';

    // Plan C : la réaction.
    if (inC) {
      once(t, C_START, 'react', function () {
        if (heroC) heroC.setPose(good ? 'celebrate' : 'despair');
        if (good) burst(90);
      });
      once(t, C_START + 800, 'burst2', function () { if (good) burst(50); });
      tr($('heroC'), 'translateX(-50%) scale(' + (1 + 0.04 * seg(t, C_START, END, inOut)).toFixed(4) + ')');
      resL.forEach(function (s, i) {
        var p = seg(t, C_START + 120 + i * 50, C_START + 600 + i * 50, outBack);
        s.style.opacity = clamp(p * 1.4, 0, 1);
        tr(s, 'translateY(' + ((1 - p) * -50).toFixed(1) + 'px) scale(' + (1.4 - 0.4 * p).toFixed(3) + ')');
      });
    }
    $('skip').style.opacity = f2(seg(t, 900, 1300) * 0.9);
    drawBits();
  }

  // ── Boucle, fin et toucher ───────────────────────────────────
  var start = performance.now(), finished = false, endAt = 0;
  // Aperçu navigateur : ?t=3000 fige la chronologie à cet instant (sans effet dans l'app).
  var frozen = /[?&]t=(\\d+)/.exec(location.search || '');
  var finish = function () {
    if (finished) return;
    finished = true;
    endAt = performance.now();
    setTimeout(function () { rigs.forEach(function (r) { r.stop(); }); post({ type: 'done' }); }, 340);
  };
  var frame = function (now) {
    var t = frozen ? Number(frozen[1]) : now - start;
    render(t);
    if (t >= END && !frozen) finish();
    if (finished) {
      var out = clamp((now - endAt) / 320, 0, 1);
      $('stage').style.opacity = 1 - out;
      if (out >= 1) return;
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  var onTap = function () { if (performance.now() - start > 600) finish(); };
  document.addEventListener('click', onTap);
  document.addEventListener('touchend', onTap);
})();
</script>
</body>
</html>`;

},
"cinematics/playTemplate": function (exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLAY_TEMPLATE = void 0;
exports.PLAY_TEMPLATE = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<style>
  :root { --c1: #d62828; --safeTop: env(safe-area-inset-top, 0px); --safeBottom: env(safe-area-inset-bottom, 0px); }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
  body { font-family: "Oswald", "Avenir Next Condensed", "HelveticaNeue-CondensedBold", "Roboto Condensed", "Arial Narrow", sans-serif;
    color: #fff; -webkit-user-select: none; user-select: none; -webkit-tap-highlight-color: transparent; }
  #stage { position: absolute; inset: 0; overflow: hidden; background: #04060a; }
  .shot { position: absolute; inset: 0; opacity: 0; will-change: opacity, transform; }
  svg.full { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
  .close { background:
      radial-gradient(ellipse at 50% 95%, rgba(255,255,255,.16) 0%, transparent 45%),
      radial-gradient(ellipse at 50% 30%, color-mix(in srgb, var(--c1) 35%, #0b1220) 0%, #05070c 70%); }
  .bokeh { position: absolute; border-radius: 50%; filter: blur(10px); opacity: .55; }
  .closeHero { position: absolute; left: 50%; bottom: calc(var(--safeBottom) - 10px); width: min(108vw, 470px); transform: translateX(-50%); }
  .closeHero svg { display: block; width: 100%; height: auto; filter: drop-shadow(0 20px 30px rgba(0,0,0,.5)); }
  .crowdBand { position: absolute; left: 0; right: 0; bottom: 0; height: 34%; }
  #titleBox { position: absolute; left: 16px; right: 16px; top: calc(var(--safeTop) + 70px); text-align: center; }
  #momentTitle { font-size: 15px; letter-spacing: 5px; text-transform: uppercase; opacity: 0; }
  #bigWord { margin-top: 8px; padding-left: 6px; font-size: 76px; line-height: 1; font-weight: 700; letter-spacing: 6px; text-transform: uppercase; white-space: nowrap;
    text-shadow: 0 6px 30px rgba(0,0,0,.55); }
  #bigWord span, #resultWord span { display: inline-block; will-change: transform, opacity; }
  #resultBox { position: absolute; left: 12px; right: 12px; top: calc(var(--safeTop) + 64px); text-align: center; }
  #resultWord { padding-left: 4px; font-size: 84px; line-height: 1; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; white-space: nowrap;
    text-shadow: 0 8px 34px rgba(0,0,0,.55); }
  #resultWord.good { color: #ffd65a; text-shadow: 0 0 34px rgba(255,214,90,.55), 0 8px 30px rgba(0,0,0,.5); }
  #resultWord.bad { color: #ffffff; opacity: .92; }
  #vignette { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,.55) 100%); }
  #flash { position: absolute; inset: 0; background: #fff; opacity: 0; pointer-events: none; }
  #black { position: absolute; inset: 0; background: #000; opacity: 0; pointer-events: none; }
  #confetti { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
  #skip { position: absolute; left: 0; right: 0; bottom: calc(var(--safeBottom) + 10px); text-align: center; opacity: 0;
    font-family: -apple-system, system-ui, sans-serif; font-size: 11px; letter-spacing: 1px; color: rgba(255,255,255,.6); }
</style>
</head>
<body>
<div id="stage">
  <div class="shot close" id="shotA">
    <div id="bokehA"></div>
    <svg class="crowdBand" id="crowdA" viewBox="0 0 400 120" preserveAspectRatio="none"></svg>
    <div class="closeHero" id="heroA"></div>
    <div id="titleBox"><div id="momentTitle"></div><div id="bigWord"></div></div>
  </div>
  <div class="shot" id="shotB">
    <svg class="full" id="pitch" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice"></svg>
  </div>
  <div class="shot close" id="shotC">
    <div id="bokehC"></div>
    <svg class="crowdBand" id="crowdC" viewBox="0 0 400 120" preserveAspectRatio="none"></svg>
    <div class="closeHero" id="heroC"></div>
    <div id="resultBox"><div id="resultWord"></div></div>
  </div>
  <div id="vignette"></div>
  <canvas id="confetti"></canvas>
  <div id="flash"></div>
  <div id="black"></div>
  <div id="skip"></div>
</div>
<script>/*__RIG_JS__*/</script>
<script>
window.CINE = /*__CINE_DATA__*/null;
(function () {
  var D = window.CINE || {};
  var L = D.labels || {};
  var P = D.plan || { mode: 'dribble', pass: null, double: true, side: 1, success: true, result: 'goal' };
  var good = !!P.success;
  var $ = function (id) { return document.getElementById(id); };
  var post = function (msg) {
    var s = JSON.stringify(msg);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(s);
    else if (window.parent && window.parent !== window) window.parent.postMessage(s, '*');
  };
  var NS = 'http://www.w3.org/2000/svg';

  // ── Outils de temps ─────────────────────────────────────────
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var outCubic = function (p) { return 1 - Math.pow(1 - p, 3); };
  var inOut = function (p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
  var outBack = function (p) { var c = 1.6; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
  var seg = function (t, a, b, ease) { var p = clamp((t - a) / (b - a), 0, 1); return (ease || outCubic)(p); };
  var bell = function (p) { return p <= 0 || p >= 1 ? 0 : Math.sin(Math.PI * p); };
  var seeded = function (i, salt) { var x = Math.sin(i * 12.9898 + (salt || 0) * 78.233) * 43758.5453; return x - Math.floor(x); };
  var f2 = function (n) { return Math.round(n * 100) / 100; };

  var ourKit = D.kit || { c1: '#d62828', c2: '#151515' };
  var keeperKit = D.oppKeeperKit || { c1: '#f97316', c2: '#111111' };
  var oppKit = D.oppKit || { c1: '#f4f4f4', c2: '#1d3a8a' };
  var root = document.documentElement.style;
  root.setProperty('--c1', ourKit.c1);
  if (D.safeTop != null) root.setProperty('--safeTop', D.safeTop + 'px');
  if (D.safeBottom != null) root.setProperty('--safeBottom', D.safeBottom + 'px');

  // ── La chronologie (le reste dépend du cas, voir la chorégraphie) ─
  var A_END = 1500;

  // ── Mise en place des textes ─────────────────────────────────
  var letters = function (el, text) {
    el.innerHTML = '';
    return String(text || '').split('').map(function (ch) {
      var s = document.createElement('span');
      s.textContent = ch === ' ' ? '\\u00a0' : ch;
      el.appendChild(s);
      return s;
    });
  };
  $('momentTitle').textContent = D.title || '';
  var bigL = letters($('bigWord'), String(L.word || '').toUpperCase());
  var resL = letters($('resultWord'), String(L.result || '').toUpperCase());
  $('resultWord').className = good ? 'good' : 'bad';
  $('skip').textContent = L.skip || '';
  // Les grands mots tiennent toujours dans la largeur de l'écran (marge pour le battement de cœur).
  var fitWord = function (el, max) {
    var spans = el.querySelectorAll('span');
    if (!spans.length) return;
    var width = function () { return spans[spans.length - 1].getBoundingClientRect().right - spans[0].getBoundingClientRect().left; };
    var size = max;
    el.style.fontSize = size + 'px';
    while (size > 30 && width() > el.clientWidth * 0.92) { size -= 2; el.style.fontSize = size + 'px'; }
  };
  fitWord($('bigWord'), 76);
  fitWord($('resultWord'), 84);

  // Lumières floues et public des gros plans.
  ['bokehA', 'bokehC'].forEach(function (id, k) {
    var html = '';
    for (var i = 0; i < 9; i++) {
      var sz = 30 + seeded(i, k + 1) * 70;
      html += '<div class="bokeh" style="left:' + (seeded(i, k + 2) * 100).toFixed(1) + '%;top:' + (5 + seeded(i, k + 3) * 45).toFixed(1) +
        '%;width:' + sz.toFixed(0) + 'px;height:' + sz.toFixed(0) + 'px;background:' + (i % 3 ? 'rgba(255,240,210,.5)' : 'rgba(255,255,255,.35)') + '"></div>';
    }
    $(id).innerHTML = html;
  });
  var crowd = function () {
    var s = '';
    for (var row = 0; row < 2; row++) {
      var y = 60 + row * 26, col = row ? 'rgba(0,0,0,.8)' : 'rgba(0,0,0,.5)';
      s += '<rect x="0" y="' + (y + 8) + '" width="400" height="80" fill="' + col + '"/>';
      for (var k = 0; k < 24; k++) {
        var x = k * 17 + (row ? 8 : 0) + seeded(k, row) * 6, r = 7 + seeded(k, row + 3) * 3;
        s += '<circle cx="' + x.toFixed(1) + '" cy="' + (y - seeded(k, row + 5) * 6).toFixed(1) + '" r="' + r.toFixed(1) + '" fill="' + col + '"/>';
        s += '<rect x="' + (x - r * 1.5).toFixed(1) + '" y="' + (y + 3).toFixed(1) + '" width="' + (r * 3).toFixed(1) + '" height="24" rx="7" fill="' + col + '"/>';
      }
    }
    return s;
  };
  $('crowdA').innerHTML = crowd();
  $('crowdC').innerHTML = crowd();

  // ── Plan B : vue télé derrière notre joueur, le but au fond ──
  var G = { x0: 116, x1: 284, bar: 344, line: 400, post: 4 };
  var onGoal = function (u, v) { return { x: (G.x0 + G.x1) / 2 + u * (G.x1 - G.x0) / 2, y: G.line - v * (G.line - G.bar) }; };
  var HORIZON = 312;
  var S = P.side || 1;

  var svg = '<defs>' +
    '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03050b"/><stop offset="1" stop-color="#101a33"/></linearGradient>' +
    '<radialGradient id="glow"><stop offset="0" stop-color="rgba(255,250,235,.95)"/><stop offset=".25" stop-color="rgba(255,250,235,.35)"/><stop offset="1" stop-color="rgba(255,250,235,0)"/></radialGradient>' +
    '<linearGradient id="grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d6531"/><stop offset="1" stop-color="#2f8f47"/></linearGradient>' +
    '</defs>';
  svg += '<rect width="400" height="' + (HORIZON + 10) + '" fill="url(#sky)"/>';
  svg += '<circle cx="40" cy="40" r="110" fill="url(#glow)" opacity=".5"/><circle cx="360" cy="40" r="110" fill="url(#glow)" opacity=".5"/>';
  var standsTop = 66;
  svg += '<rect x="0" y="' + standsTop + '" width="400" height="' + (HORIZON - standsTop) + '" fill="#0a0f1c"/>';
  var phones = [];
  for (var row = 0; row * 24 < HORIZON - standsTop - 26; row++) {
    var yy = standsTop + 12 + row * 24, cc = 'rgba(' + (14 + row * 3) + ',' + (20 + row * 4) + ',' + (36 + row * 5) + ',1)';
    for (var k = 0; k < 40; k++) {
      var xx = k * 10.4 + (row % 2 ? 5.2 : 0) + seeded(k, row + 20) * 3;
      svg += '<circle cx="' + xx.toFixed(1) + '" cy="' + yy.toFixed(1) + '" r="3.9" fill="' + cc + '"/>';
      svg += '<rect x="' + (xx - 5).toFixed(1) + '" y="' + (yy + 2.6).toFixed(1) + '" width="10" height="13" rx="3" fill="' + cc + '"/>';
      if (seeded(k, row + 40) < 0.2) phones.push({ x: xx, y: yy - 2, at: seeded(k, row + 60), sp: 0.6 + seeded(k, row + 80) });
    }
  }
  phones.forEach(function (p, i) { svg += '<circle id="ph' + i + '" cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="1.6" fill="#fff" opacity="0"/>'; });
  svg += '<rect x="0" y="' + (HORIZON - 13) + '" width="400" height="13" fill="' + ourKit.c1 + '" opacity=".85"/>';
  svg += '<rect x="0" y="' + (HORIZON - 13) + '" width="400" height="2.5" fill="rgba(255,255,255,.35)"/>';
  var grassH = 800 - HORIZON;
  svg += '<rect x="0" y="' + HORIZON + '" width="400" height="' + grassH + '" fill="url(#grass)"/>';
  for (var b = 0; b < 14; b += 2) {
    var y0 = HORIZON + grassH * Math.pow(b / 14, 1.8), y1 = HORIZON + grassH * Math.pow((b + 1) / 14, 1.8);
    svg += '<rect x="0" y="' + y0.toFixed(1) + '" width="400" height="' + (y1 - y0).toFixed(1) + '" fill="rgba(255,255,255,.05)"/>';
  }
  var line = 'stroke="rgba(255,255,255,.72)" fill="none" stroke-linejoin="round"';
  svg += '<line x1="-20" y1="' + G.line + '" x2="420" y2="' + G.line + '" stroke-width="1.7" stroke="rgba(255,255,255,.76)"/>';
  svg += '<path d="M92 ' + G.line + ' L82 420 L318 420 L308 ' + G.line + '" stroke-width="1.8" ' + line + '/>';
  svg += '<path d="M10 ' + G.line + ' L-50 500 L450 500 L390 ' + G.line + '" stroke-width="2" ' + line + '/>';
  svg += '<ellipse cx="200" cy="462" rx="3.4" ry="1.4" fill="rgba(255,255,255,.8)"/>';
  svg += '<path d="M150 500 Q200 528 250 500" stroke-width="2" ' + line + '/>';
  svg += '<path d="M' + G.x0 + ' ' + G.bar + ' L' + (G.x0 + 10) + ' ' + (G.bar - 8) + ' L' + (G.x1 - 10) + ' ' + (G.bar - 8) + ' L' + G.x1 + ' ' + G.bar +
    ' L' + G.x1 + ' ' + G.line + ' L' + G.x0 + ' ' + G.line + ' Z" fill="rgba(0,0,0,.28)"/>';
  svg += '<g id="net"></g><g id="ballFar"></g>';
  svg += '<g id="frame"><rect x="' + (G.x0 - G.post) + '" y="' + (G.bar - G.post) + '" width="' + G.post + '" height="' + (G.line - G.bar + G.post) + '" fill="#f4f4f4"/>' +
    '<rect x="' + G.x1 + '" y="' + (G.bar - G.post) + '" width="' + G.post + '" height="' + (G.line - G.bar + G.post) + '" fill="#f4f4f4"/>' +
    '<rect x="' + (G.x0 - G.post) + '" y="' + (G.bar - G.post) + '" width="' + (G.x1 - G.x0 + 2 * G.post) + '" height="' + G.post + '" fill="#f4f4f4"/></g>';
  svg += '<g id="keeperLayer"></g><g id="oppLayer"></g><g id="mateLayer"></g><g id="ballNear"></g><g id="meLayer"></g>';
  $('pitch').innerHTML = svg;
  var phoneEls = phones.map(function (p, i) { return $('ph' + i); });

  var R = window.DestinyRig;
  var mk = function (parent) {
    var g = document.createElementNS(NS, 'g');
    var inner = document.createElementNS(NS, 'g'); g.appendChild(inner);
    $(parent).appendChild(g);
    return { g: g, inner: inner };
  };
  var rigs = [];
  var mount = function (grp, opts) { var r = R ? R.mount(grp.inner, opts) : null; if (r) rigs.push(r); return r; };
  var heroA = null, heroC = null;
  if (R && D.avatar) {
    $('heroA').innerHTML = '<svg viewBox="-115 -318 230 330"><g id="hA"></g></svg>';
    $('heroC').innerHTML = '<svg viewBox="-115 -318 230 330"><g id="hC"></g></svg>';
    heroA = R.mount($('hA'), { avatar: D.avatar, kit: ourKit, pose: 'focus', uid: 'a', shadow: false });
    heroC = R.mount($('hC'), { avatar: D.avatar, kit: ourKit, pose: 'front', uid: 'c', shadow: false });
    rigs.push(heroA, heroC);
  }

  // ── La chorégraphie ─────────────────────────────────────────
  var ease2 = function (q) { return q < 0.5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2; };
  /** Images clés [t, x, y, échelle] → position à l'instant t (interpolation douce entre deux clés). */
  var path = function (keys) {
    return function (t) {
      if (t <= keys[0][0]) return { x: keys[0][1], y: keys[0][2], s: keys[0][3] };
      for (var i = 1; i < keys.length; i++) {
        if (t <= keys[i][0]) {
          var a = keys[i - 1], b = keys[i], p = ease2((t - a[0]) / (b[0] - a[0]));
          return { x: a[1] + (b[1] - a[1]) * p, y: a[2] + (b[2] - a[2]) * p, s: a[3] + (b[3] - a[3]) * p };
        }
      }
      var z = keys[keys.length - 1];
      return { x: z[1], y: z[2], s: z[3] };
    };
  };
  var pt = function (x, y, r) { return { x: x, y: y, r: r }; };
  var feetOf = function (p, tt, dribbling, t0) {
    var touch = dribbling ? ((tt - t0) % 330 + 330) % 330 / 330 : 0.6;
    return pt(p.x + 56 * p.s, p.y - (8 + 22 * (1 - touch)) * p.s, 12 * p.s);
  };
  var headOf = function (p, lift) { return pt(p.x, p.y - 205 * p.s - (lift || 0), 6 + 8 * p.s); };
  var legs = [], endMode = 'rest', IMPACT = 0, END_B = 0, cues = [], carry = null;
  var leg = function (t0, t1, from, to, arc) { legs.push({ t0: t0, t1: t1, from: from, to: to, arc: arc || 0 }); };
  var meAt, mateAt = null, d1At = null, d2At = null, lunges = [], jumps = [];
  var keeperDive = null, keeperOut = null, TG = null;
  var meG = mk('meLayer');
  var meRig = mount(meG, { avatar: D.avatar, kit: ourKit, pose: 'back', uid: 'm', shadow: true, shirtName: D.shirtName, shirtNumber: D.number });
  var keeperG = mk('keeperLayer');
  var keeperRig = mount(keeperG, { avatar: D.oppAvatar, kit: keeperKit, pose: 'keeper', uid: 'k', shadow: true });
  var oppAv = function (i) { return (D.wallAvatars && D.wallAvatars[i]) || D.oppAvatar; };
  var d1G = mk('oppLayer'), d1Rig = mount(d1G, { avatar: oppAv(0), kit: oppKit, pose: 'front', uid: 'd', shadow: true });
  var d2G = null, d2Rig = null, mateG = null, mateRig = null;

  if (P.mode === 'dribble') {
    // Notre joueur balle au pied ; crochet du côté S ; le défenseur se jette.
    var CUT = 2950, TACKLE = 3250, SHOT = P.double ? 4350 : 4050;
    meAt = path(P.success
      ? (P.double ? [[1700, 160, 800, 0.74], [CUT, 170, 690, 0.64], [CUT + 450, 170 + S * 72, 650, 0.6], [3900, 170 + S * 70, 575, 0.54], [4150, 170 + S * 30, 545, 0.52]]
                  : [[1700, 160, 800, 0.74], [CUT, 170, 690, 0.64], [CUT + 450, 170 + S * 72, 650, 0.6], [SHOT - 60, 170 + S * 78, 570, 0.54]])
      : [[1700, 160, 800, 0.74], [CUT, 170, 690, 0.64], [CUT + 300, 170 + S * 36, 670, 0.62], [3700, 170 + S * 30, 672, 0.62]]);
    d1At = path([[1700, 205, 560, 0.5], [CUT, 195, 612, 0.55]]);
    // Feinte réussie : il plonge du mauvais côté. Ratée : il plonge du bon côté et prend le ballon.
    lunges.push({ g: d1G, rig: d1Rig, at: CUT + 120, side: P.success ? -S : S, at2: d1At, reach: 26 });
    if (P.double) {
      d2G = mk('oppLayer'); d2Rig = mount(d2G, { avatar: oppAv(1), kit: oppKit, pose: 'front', uid: 'e', shadow: true });
      // Le second défenseur arrive de l'extérieur et se jette vers l'intérieur, trop tard.
      d2At = path([[1700, 200 + S * 160, 470, 0.42], [3700, 170 + S * 128, 548, 0.5]]);
      lunges.push({ g: d2G, rig: d2Rig, at: 3760, side: -S, at2: d2At, reach: 26 });
    }
    if (P.success) {
      carry = [1700, SHOT];
      TG = onGoal(-S * 0.62, 0.22);
      cues.push([SHOT - 420, meRig, 'shootBack']);
      leg(SHOT, SHOT + 600, null, pt(TG.x, TG.y, 4.4), 14);
      keeperDive = { at: SHOT + 60, side: S, reach: 26 };
      endMode = 'net'; IMPACT = SHOT + 600;
    } else {
      carry = [1700, TACKLE];
      var d1p = d1At(TACKLE);
      leg(TACKLE, TACKLE + 650, null, pt(d1p.x + S * 70, 618, 7), 10);
      endMode = 'rest'; IMPACT = TACKLE;
    }
  } else {
    var PASSAT = 3200;
    mateG = mk('mateLayer'); mateRig = mount(mateG, { avatar: (D.mateAvatars && D.mateAvatars[0]) || D.oppAvatar, kit: ourKit, pose: 'back', uid: 't', shadow: true });
    if (P.pass === 'cross') {
      // Notre joueur sur l'aile centre en cloche ; le coéquipier attaque le ballon de la tête.
      var HEAD = 4150;
      meAt = path([[1700, 200 + S * 115, 800, 0.72], [2900, 200 + S * 132, 700, 0.66]]);
      mateAt = path([[1700, 200 - S * 20, 610, 0.5], [HEAD - 150, 200 - S * 34, 476, 0.41]]);
      d1At = path([[1700, 200 + S * 40, 560, 0.48], [HEAD - 150, 200 + S * 22, 466, 0.4]]);
      carry = [1700, PASSAT];
      var mh = headOf(mateAt(HEAD), 26);
      cues.push([PASSAT - 420, meRig, 'shootBack']);
      if (P.success) {
        jumps.push({ g: mateG, at2: mateAt, t0: HEAD - 260, t1: HEAD + 340, h: 26 });
        cues.push([HEAD - 260, mateRig, 'headerBack']);
        leg(PASSAT, HEAD, null, mh, 170);
        TG = onGoal(-S * 0.55, 0.62);
        leg(HEAD, HEAD + 460, mh, pt(TG.x, TG.y, 4.4), 6);
        keeperDive = { at: HEAD + 40, side: S, reach: 26 };
        endMode = 'net'; IMPACT = HEAD + 460;
      } else {
        // Le gardien sort et capte le centre au-dessus de tout le monde.
        keeperOut = [PASSAT + 200, HEAD - 100, { x: 200 + S * 62, y: 452, s: 0.28 }];
        jumps.push({ g: keeperG, at2: null, t0: HEAD - 300, t1: HEAD + 260, h: 30, keeper: true });
        cues.push([HEAD - 300, keeperRig, 'stretch']);
        leg(PASSAT, HEAD, null, pt(200 + S * 62, 452 - 0.28 * 300 - 30, 7), 170);
        endMode = 'vanish'; IMPACT = HEAD;
      }
    } else if (P.pass === 'onetwo') {
      // Passe au coéquipier, remise dans la course, notre joueur frappe.
      var BACK = 3700, RUNTO = 4250, SHOT2 = 4500;
      meAt = path([[1700, 160, 800, 0.72], [2800, 166, 735, 0.68], [RUNTO, 178, 590, 0.55]]);
      mateAt = path([[1700, 240, 640, 0.52], [3000, 200 + S * 58, 586, 0.48]]);
      // Le défenseur reste derrière, entre les deux : on le voit couper la remise.
      d1At = path([[1700, 222, 500, 0.44], [3300, 216, 524, 0.46]]);
      carry = [1700, PASSAT];
      var mf = feetOf(mateAt(BACK), BACK, false, 0);
      leg(PASSAT, BACK, null, mf, 4);
      var space = feetOf(meAt(RUNTO), RUNTO, false, 0);
      if (P.success) {
        leg(BACK, RUNTO, mf, space, 4);
        cues.push([SHOT2 - 420, meRig, 'shootBack']);
        TG = onGoal(S * 0.6, 0.25);
        leg(SHOT2, SHOT2 + 560, space, pt(TG.x, TG.y, 4.4), 12);
        keeperDive = { at: SHOT2 + 60, side: -S, reach: 26 };
        endMode = 'net'; IMPACT = SHOT2 + 560;
      } else {
        lunges.push({ g: d1G, rig: d1Rig, at: BACK + 80, side: S, at2: d1At, reach: 20 });
        var cut2 = d1At(BACK + 300);
        leg(BACK, BACK + 320, mf, pt(cut2.x + S * 30, 610, 7), 4);
        endMode = 'rest'; IMPACT = BACK + 320;
      }
    } else {
      // Passe au sol dans la course du coéquipier, qui reçoit et frappe.
      var RECV = PASSAT + 800, SHOT3 = RECV + 350;
      meAt = path([[1700, 160, 800, 0.72], [2700, 166, 732, 0.68]]);
      mateAt = path([[1700, 238, 610, 0.5], [PASSAT, 200 + S * 62, 525, 0.45], [RECV, 200 + S * 52, 478, 0.41]]);
      d1At = path([[1700, 205, 600, 0.52], [PASSAT, 200 + S * 18, 566, 0.5]]);
      carry = [1700, PASSAT];
      cues.push([PASSAT - 420, meRig, 'shootBack']);
      var rcv = feetOf(mateAt(RECV), RECV, false, 0);
      if (P.success) {
        leg(PASSAT, RECV, null, rcv, 4);
        cues.push([SHOT3 - 420, mateRig, 'shootBack']);
        TG = onGoal(-S * 0.5, 0.3);
        leg(SHOT3, SHOT3 + 520, rcv, pt(TG.x, TG.y, 4.4), 10);
        keeperDive = { at: SHOT3 + 60, side: S, reach: 26 };
        endMode = 'net'; IMPACT = SHOT3 + 520;
      } else {
        lunges.push({ g: d1G, rig: d1Rig, at: PASSAT + 140, side: S, at2: d1At, reach: 24 });
        var cut3 = d1At(PASSAT + 420);
        leg(PASSAT, PASSAT + 420, null, pt(cut3.x + S * 34, 590, 7), 4);
        endMode = 'rest'; IMPACT = PASSAT + 420;
      }
    }
  }
  END_B = IMPACT + 900;
  var C_START = END_B + 200, END = C_START + 2500;
  var lastLeg = legs[legs.length - 1];
  // Les segments qui partent du pied de notre joueur commencent là où est le ballon à cet instant.
  legs.forEach(function (L) { if (!L.from) L.from = feetOf(meAt(L.t0), L.t0, false, 0); });
  // Les défenseurs taclent en glissant (pose de joueur de champ).
  lunges.forEach(function (l) { cues.push([l.at, l.rig, 'slide']); });

  var keeperAt = function (t) {
    var k = { x: 200, y: 404, s: 0.19, lift: 0, rot: 0 };
    if (keeperOut) {
      var p = ease2(clamp((t - keeperOut[0]) / (keeperOut[1] - keeperOut[0]), 0, 1));
      k.x += (keeperOut[2].x - k.x) * p; k.y += (keeperOut[2].y - k.y) * p; k.s += (keeperOut[2].s - k.s) * p;
    }
    if (keeperDive) {
      var dv = outCubic(clamp((t - keeperDive.at) / 420, 0, 1));
      k.x += keeperDive.side * keeperDive.reach * dv; k.rot = keeperDive.side * 72 * dv; k.lift = 8 * bell(dv * 0.92);
    }
    jumps.forEach(function (j) { if (j.keeper) k.lift += j.h * bell((t - j.t0) / (j.t1 - j.t0)); });
    return k;
  };
  if (keeperDive) cues.push([keeperDive.at, keeperRig, 'stretch']);

  var netG = $('net');
  var drawNet = function (amp) {
    var cols = 22, rws = 7, d = '';
    var disp = function (x, y) {
      if (!amp || !TG) return [x, y];
      var dx = x - TG.x, dy = y - TG.y, dist2 = dx * dx + dy * dy, k = amp * Math.exp(-dist2 / 400), len = Math.sqrt(dist2) || 1;
      return [x - dx / len * k * 0.35, y - dy / len * k * 0.35 - k * 0.25];
    };
    for (var i = 0; i <= cols; i++) {
      var x = G.x0 + i * (G.x1 - G.x0) / cols;
      for (var j = 0; j <= rws; j++) { var p = disp(x, G.bar + j * (G.line - G.bar) / rws); d += (j ? 'L' : 'M') + f2(p[0]) + ' ' + f2(p[1]); }
    }
    for (var j2 = 0; j2 <= rws; j2++) {
      var y = G.bar + j2 * (G.line - G.bar) / rws;
      for (var i2 = 0; i2 <= cols; i2++) { var q = disp(G.x0 + i2 * (G.x1 - G.x0) / cols, y); d += (i2 ? 'L' : 'M') + f2(q[0]) + ' ' + f2(q[1]); }
    }
    netG.innerHTML = '<path d="' + d + '" fill="none" stroke="rgba(255,255,255,.32)" stroke-width="0.65"/>';
  };
  var ballSvg = function (x, y, r, spin) {
    return '<g transform="translate(' + f2(x) + ' ' + f2(y) + ') rotate(' + f2(spin) + ')">' +
      '<circle r="' + f2(r) + '" fill="#fafafa" stroke="#cfd8dc" stroke-width="' + f2(r * 0.08) + '"/>' +
      '<circle cx="' + f2(-r * 0.25) + '" cy="' + f2(-r * 0.2) + '" r="' + f2(r * 0.32) + '" fill="#2b2b2b"/>' +
      '<circle cx="' + f2(r * 0.5) + '" cy="' + f2(r * 0.35) + '" r="' + f2(r * 0.2) + '" fill="#2b2b2b"/></g>';
  };
  /** Le ballon : au pied de notre joueur, puis segments (passe, centre, frappe), puis l'état final. */
  var ballAt = function (t) {
    if (carry && t < carry[1]) { var f = feetOf(meAt(t), t, t > carry[0], carry[0]); return { x: f.x, y: f.y - f.r, r: f.r, spin: t * 0.6, far: false }; }
    for (var i = 0; i < legs.length; i++) {
      var L = legs[i];
      if (t < L.t0) { return { x: L.from.x, y: L.from.y - L.from.r, r: L.from.r, spin: 0, far: false }; }
      if (t < L.t1) {
        var p = (t - L.t0) / (L.t1 - L.t0);
        var r = L.from.r + (L.to.r - L.from.r) * p;
        return { x: L.from.x + (L.to.x - L.from.x) * p, y: L.from.y + (L.to.y - L.from.y) * p - L.arc * bell(p) - r, r: r, spin: p * 720, far: false };
      }
    }
    if (!lastLeg) return null;
    if (endMode === 'net') { var sink = outCubic(clamp((t - lastLeg.t1) / 300, 0, 1)); return { x: lastLeg.to.x, y: lastLeg.to.y - 3 * sink + 9 * sink * sink, r: 4.2, spin: 720, far: true }; }
    if (endMode === 'rest') return { x: lastLeg.to.x, y: lastLeg.to.y - lastLeg.to.r, r: lastLeg.to.r, spin: 720, far: false };
    return null;
  };

  // ── Confettis ────────────────────────────────────────────────
  var cv = $('confetti'), cx = cv.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1), W = 0, H = 0;
  var resize = function () { W = window.innerWidth; H = window.innerHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  resize(); window.addEventListener('resize', resize);
  var bits = [];
  var burst = function (count) {
    var cols = [ourKit.c1, ourKit.c2, '#ffd65a', '#ffffff'];
    for (var i = 0; i < count; i++) {
      var sd = i % 2 ? 1 : -1, off = (10 + Math.random() * 32) * Math.PI / 180, v = 11 + Math.random() * 10;
      bits.push({ x: W / 2 + sd * W * 0.46, y: H * 0.82, vx: -sd * Math.sin(off) * v, vy: -Math.cos(off) * v, w: 6 + Math.random() * 6,
        h: 9 + Math.random() * 8, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, f: Math.random() * 6, vf: 0.15 + Math.random() * 0.2, c: cols[i % cols.length] });
    }
  };
  var drawBits = function () {
    cx.clearRect(0, 0, W, H);
    for (var i = bits.length - 1; i >= 0; i--) {
      var b = bits[i];
      b.vy += 0.32; b.vx *= 0.985; b.vy *= 0.985; b.x += b.vx; b.y += b.vy; b.r += b.vr; b.f += b.vf;
      if (b.y > H + 40) { bits.splice(i, 1); continue; }
      cx.save(); cx.translate(b.x, b.y); cx.rotate(b.r); cx.scale(1, Math.cos(b.f)); cx.fillStyle = b.c; cx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h); cx.restore();
    }
  };

  // ── Rendu ────────────────────────────────────────────────────
  var fired = {};
  var once = function (t, at, key, fn) { if (t >= at && !fired[key]) { fired[key] = true; fn(); } };
  var tr = function (el, s) { el.style.transform = s; };
  var impactAt = -1e9;

  function render(t) {
    var inB = t >= A_END && t < C_START, inC = t >= C_START;
    $('shotA').style.opacity = t < A_END ? 1 : 0;
    $('shotB').style.opacity = inB ? 1 : 0;
    $('shotC').style.opacity = inC ? 1 : 0;
    $('black').style.opacity = f2(Math.max(bell((t - A_END + 140) / 280), bell((t - C_START + 140) / 280), 1 - seg(t, 0, 300)));

    // Plan A : gros plan, titre, cœur qui bat.
    tr($('heroA'), 'translateX(-50%) scale(' + (1 + 0.06 * seg(t, 0, A_END, inOut)).toFixed(4) + ')');
    $('momentTitle').style.opacity = seg(t, 200, 600);
    bigL.forEach(function (s, i) {
      var p = seg(t, 350 + i * 45, 800 + i * 45, outBack);
      s.style.opacity = clamp(p * 1.4, 0, 1);
      tr(s, 'translateY(' + ((1 - p) * 60).toFixed(1) + 'px) scale(' + (0.7 + 0.3 * p).toFixed(3) + ')');
    });
    var beat = Math.max(bell((t - 650) / 160), bell((t - 900) / 160), bell((t - 1250) / 160));
    tr($('bigWord'), 'scale(' + (1 + 0.05 * beat).toFixed(3) + ')');
    once(t, 650, 'b1', function () { post({ type: 'impact', strength: 'medium' }); });
    once(t, 1250, 'b2', function () { post({ type: 'impact', strength: 'medium' }); });

    // Plan B.
    if (inB || t < A_END + 200) {
      var z = 1 + 0.06 * seg(t, A_END, IMPACT, inOut);
      tr($('pitch'), 'scale(' + z.toFixed(4) + ')');
      $('pitch').style.transformOrigin = '50% 55%';
      phoneEls.forEach(function (el, i) {
        var p = phones[i], ph = ((t / 1000) * p.sp + p.at) % 1;
        el.setAttribute('opacity', (bell(ph / 0.2) * (t > IMPACT && good ? 1 : 0.5)).toFixed(2));
      });
      cues.forEach(function (c, i) { once(t, c[0], 'cue' + i, function () { if (c[1]) c[1].setPose(c[2]); }); });
      var place = function (grp, p, lift, rot) {
        grp.g.setAttribute('transform', 'translate(' + f2(p.x) + ' ' + f2(p.y - (lift || 0)) + ') rotate(' + f2(rot || 0) + ' 0 ' + f2(-150 * p.s) + ') scale(' + f2(p.s) + ')');
      };
      // Notre joueur, avec un rebond de course quand il avance.
      var me = meAt(t), me2 = meAt(t - 60), moving = Math.abs(me.y - me2.y) + Math.abs(me.x - me2.x) > 0.6;
      place(meG, me, moving ? Math.abs(Math.sin(t / 105)) * 6 * me.s : 0, 0);
      // Les défenseurs : ils approchent, puis se jettent (glissade) au moment du tacle.
      [[d1G, d1At], [d2G, d2At]].forEach(function (pair) {
        if (!pair[0] || !pair[1]) return;
        var p = pair[1](t), lift = 0, rot = 0;
        lunges.forEach(function (l) {
          if (l.g !== pair[0]) return;
          var e = outCubic(clamp((t - l.at) / 360, 0, 1));
          p = { x: p.x + l.side * l.reach * e, y: p.y + 18 * e, s: p.s }; rot = l.side * 18 * e;
        });
        place(pair[0], p, lift, rot);
      });
      if (mateG && mateAt) {
        var mp = mateAt(t), ml = 0;
        jumps.forEach(function (j) { if (j.g === mateG) ml += j.h * bell((t - j.t0) / (j.t1 - j.t0)); });
        place(mateG, mp, ml, 0);
      }
      var k = keeperAt(t);
      place(keeperG, k, k.lift, k.rot);
      var bl = ballAt(t), farL = '', nearL = '';
      if (bl) { var bs = ballSvg(bl.x, bl.y, bl.r, bl.spin); if (bl.far) farL = bs; else nearL = bs; }
      $('ballFar').innerHTML = farL;
      $('ballNear').innerHTML = nearL;
      var amp = endMode === 'net' && t >= IMPACT ? 11 * Math.exp(-(t - IMPACT) / 260) * Math.cos((t - IMPACT) / 70) : 0;
      if (!fired.netDrawn || amp || (t >= IMPACT && !fired.netRest)) {
        drawNet(Math.abs(amp) > 0.2 ? amp : 0);
        fired.netDrawn = true;
        if (t >= IMPACT && Math.abs(amp) <= 0.2) fired.netRest = true;
      }
      once(t, IMPACT, 'impact', function () {
        impactAt = t;
        post({ type: 'impact', strength: good ? 'heavy' : 'medium' });
      });
    }
    $('flash').style.opacity = f2(good ? bell((t - IMPACT) / 240) * 0.6 : 0);
    var shk = t - impactAt, amp2 = good && shk >= 0 && shk < 380 ? (1 - shk / 380) * 8 : 0;
    $('stage').style.transform = amp2 ? 'translate(' + f2(Math.sin(shk * 0.09) * amp2) + 'px,' + f2(Math.cos(shk * 0.07) * amp2 * 0.6) + 'px)' : '';

    // Plan C : la réaction.
    if (inC) {
      once(t, C_START, 'react', function () {
        if (heroC) heroC.setPose(good ? 'celebrate' : 'despair');
        if (good) burst(90);
      });
      once(t, C_START + 800, 'burst2', function () { if (good) burst(50); });
      tr($('heroC'), 'translateX(-50%) scale(' + (1 + 0.04 * seg(t, C_START, END, inOut)).toFixed(4) + ')');
      resL.forEach(function (s, i) {
        var p = seg(t, C_START + 120 + i * 50, C_START + 600 + i * 50, outBack);
        s.style.opacity = clamp(p * 1.4, 0, 1);
        tr(s, 'translateY(' + ((1 - p) * -50).toFixed(1) + 'px) scale(' + (1.4 - 0.4 * p).toFixed(3) + ')');
      });
    }
    $('skip').style.opacity = f2(seg(t, 900, 1300) * 0.9);
    drawBits();
  }

  // ── Boucle, fin et toucher ───────────────────────────────────
  var start = performance.now(), finished = false, endAt = 0;
  // Aperçu navigateur : ?t=3000 fige la chronologie à cet instant (sans effet dans l'app).
  var frozen = /[?&]t=(\\d+)/.exec(location.search || '');
  var finish = function () {
    if (finished) return;
    finished = true;
    endAt = performance.now();
    setTimeout(function () { rigs.forEach(function (r) { r.stop(); }); post({ type: 'done' }); }, 340);
  };
  var frame = function (now) {
    var t = frozen ? Number(frozen[1]) : now - start;
    render(t);
    if (t >= END && !frozen) finish();
    if (finished) {
      var out = clamp((now - endAt) / 320, 0, 1);
      $('stage').style.opacity = 1 - out;
      if (out >= 1) return;
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  var onTap = function () { if (performance.now() - start > 600) finish(); };
  document.addEventListener('click', onTap);
  document.addEventListener('touchend', onTap);
})();
</script>
</body>
</html>`;

},
"cinematics/signingTemplate": function (exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIGNING_TEMPLATE = void 0;
exports.SIGNING_TEMPLATE = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<style>
  :root { --c1: #d62828; --c1d: #5a1010; --c2: #f1f1f1; --ink: #fff; --safeTop: env(safe-area-inset-top, 0px); --safeBottom: env(safe-area-inset-bottom, 0px); }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
  body {
    font-family: "Oswald", "Avenir Next Condensed", "HelveticaNeue-CondensedBold", "Roboto Condensed", "Arial Narrow", sans-serif;
    color: #fff; -webkit-user-select: none; user-select: none; -webkit-tap-highlight-color: transparent;
  }
  #stage { position: absolute; inset: 0; overflow: hidden; background: #05070a; }
  #cam { position: absolute; inset: 0; transform-origin: 50% 70%; will-change: transform; }
  .layer { position: absolute; inset: 0; }
  .fx { will-change: transform, opacity; }

  /* Acte 1 : salle de presse */
  #press { background: radial-gradient(ellipse at 50% 42%, #1c2230 0%, #07090d 72%); }
  .pflash { position: absolute; width: 170px; height: 170px; margin: -85px 0 0 -85px; border-radius: 50%; opacity: 0;
    background: radial-gradient(circle, rgba(255,255,255,.95) 0%, rgba(255,255,255,.35) 22%, transparent 62%); }
  #act1 { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 20px; }
  #official { font-size: 66px; line-height: 1; font-weight: 700; letter-spacing: 7px; text-transform: uppercase; white-space: nowrap; }
  #official span, .letters span { display: inline-block; will-change: transform, opacity; }
  .letters .word { white-space: nowrap; will-change: auto; }
  #officialBar { width: 64%; height: 6px; margin-top: 14px; background: #ff3344; transform-origin: 0 50%; border-radius: 3px; }
  #from { margin-top: 34px; text-align: center; }
  #from small { display: block; font-size: 14px; letter-spacing: 5px; text-transform: uppercase; opacity: .6; }
  #fromName { position: relative; display: inline-block; font-size: 32px; letter-spacing: 1px; margin-top: 6px; }
  #strike { position: absolute; left: -8px; right: -8px; top: 52%; height: 4px; background: #ff3344; transform-origin: 0 50%; border-radius: 2px; }

  /* Acte 2 : le club */
  #club { background: linear-gradient(165deg, var(--c1d) 0%, var(--c1) 48%, var(--c1d) 100%); }
  #club::before { content: ""; position: absolute; inset: -20%;
    background: repeating-linear-gradient(115deg, rgba(255,255,255,.07) 0 44px, transparent 44px 88px); }
  #club::after { content: ""; position: absolute; inset: 0;
    background: radial-gradient(ellipse at 50% 38%, rgba(255,255,255,.18) 0%, transparent 55%),
                radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(0,0,0,.6) 100%); }
  .beam { position: absolute; top: -8%; width: 70%; height: 125%; transform-origin: 50% 0; mix-blend-mode: screen; opacity: 0;
    background: linear-gradient(180deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,.12) 45%, rgba(255,255,255,0) 80%);
    clip-path: polygon(46% 0, 54% 0, 100% 100%, 0 100%); filter: blur(5px); }
  #beamL { left: -28%; } #beamR { right: -28%; }
  #crowd { position: absolute; left: -4%; right: -4%; bottom: 0; height: 30%; }
  #crowd svg { position: absolute; left: 0; bottom: 0; width: 100%; height: 100%; }

  #title { position: absolute; left: 16px; right: 16px; top: calc(var(--safeTop) + 40px); text-align: center; color: var(--ink); }
  #crestRow { display: flex; align-items: center; justify-content: center; gap: 12px; }
  #crest { width: 74px; height: 82px; filter: drop-shadow(0 8px 16px rgba(0,0,0,.45)); }
  #flag { font-size: 34px; line-height: 1; filter: drop-shadow(0 4px 10px rgba(0,0,0,.4)); }
  #clubName { margin-top: 10px; font-size: 46px; line-height: 1.02; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
    text-shadow: 0 4px 22px rgba(0,0,0,.5); }
  #kind { display: inline-block; margin-top: 12px; padding: 5px 14px; border-radius: 99px; background: rgba(0,0,0,.42);
    color: #fff; font-size: 13px; letter-spacing: 5px; text-transform: uppercase; }

  /* Acte 3 : le joueur */
  #spot { position: absolute; left: 50%; bottom: calc(var(--safeBottom) + 96px); width: 120vw; height: 70vw; margin-left: -60vw;
    background: radial-gradient(ellipse at 50% 70%, rgba(255,255,255,.32) 0%, rgba(255,255,255,.08) 38%, transparent 66%); opacity: 0; }
  #hero { position: absolute; left: 50%; bottom: calc(var(--safeBottom) + 112px); width: min(80vw, 340px); margin-left: calc(min(80vw, 340px) / -2); }
  #hero svg { display: block; width: 100%; height: auto; filter: drop-shadow(0 18px 24px rgba(0,0,0,.45)); }

  /* Acte 4 : le montant ou la durée du prêt */
  #fee { position: absolute; left: 0; right: 0; bottom: calc(var(--safeBottom) + 34px); text-align: center; opacity: 0; }
  #fee small { display: block; font-size: 13px; letter-spacing: 5px; text-transform: uppercase; opacity: .8; }
  #feeValue { display: inline-block; font-size: 52px; font-weight: 700; letter-spacing: 1px; font-variant-numeric: tabular-nums; }
  #feeValue.gold { color: #ffd65a; text-shadow: 0 0 28px rgba(255,214,90,.55); }

  #flash { background: #fff; opacity: 0; pointer-events: none; }
  #confetti { pointer-events: none; }
  #skip { position: absolute; left: 0; right: 0; bottom: calc(var(--safeBottom) + 10px); text-align: center; opacity: 0;
    font-family: -apple-system, system-ui, sans-serif; font-size: 11px; letter-spacing: 1px; color: rgba(255,255,255,.55); }
</style>
</head>
<body>
<div id="stage">
  <div id="cam">
    <div class="layer" id="press"></div>
    <div class="layer fx" id="club">
      <div class="beam" id="beamL"></div><div class="beam" id="beamR"></div>
      <div id="crowd" class="fx"></div>
    </div>
    <div id="spot" class="fx"></div>
    <div id="hero" class="fx"></div>
    <div id="title">
      <div id="crestRow" class="fx"><svg id="crest" viewBox="0 0 100 110"></svg><div id="flag"></div></div>
      <div id="clubName" class="letters"></div>
      <div id="kind" class="fx"></div>
    </div>
    <div class="layer fx" id="act1">
      <div id="official"></div>
      <div id="officialBar" class="fx"></div>
      <div id="from" class="fx"><small id="fromLabel"></small><span id="fromName"><span id="fromText"></span><i id="strike" class="fx"></i></span></div>
    </div>
    <div id="fee"><small id="feeLabel"></small><b id="feeValue"></b></div>
  </div>
  <canvas class="layer" id="confetti"></canvas>
  <div class="layer" id="flash"></div>
  <div id="skip"></div>
</div>
<script>/*__RIG_JS__*/</script>
<script>
window.CINE = /*__CINE_DATA__*/null;
(function () {
  var D = window.CINE || {};
  var L = D.labels || {};
  var loan = !!D.loan;
  var $ = function (id) { return document.getElementById(id); };
  var post = function (msg) {
    var s = JSON.stringify(msg);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(s);
    else if (window.parent && window.parent !== window) window.parent.postMessage(s, '*');
  };

  // ── Outils de temps ─────────────────────────────────────────
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var outCubic = function (p) { return 1 - Math.pow(1 - p, 3); };
  var outQuint = function (p) { return 1 - Math.pow(1 - p, 5); };
  var inOut = function (p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
  var inCubic = function (p) { return p * p * p; };
  var outBack = function (p) { var c = 1.6; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
  /** 0 → 1 entre a et b (ms), avec une courbe. */
  var seg = function (t, a, b, ease) { var p = clamp((t - a) / (b - a), 0, 1); return (ease || outCubic)(p); };
  var bell = function (p) { return p <= 0 || p >= 1 ? 0 : Math.sin(Math.PI * p); };
  var seeded = function (i, salt) { var x = Math.sin(i * 12.9898 + (salt || 0) * 78.233) * 43758.5453; return x - Math.floor(x); };

  // ── Couleurs ─────────────────────────────────────────────────
  var rgb = function (h) { var n = parseInt(String(h).replace('#', '').slice(0, 6), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  var dark = function (h, k) { var c = rgb(h); return 'rgb(' + c.map(function (v) { return Math.round(v * (1 - k)); }).join(',') + ')'; };
  var c1 = D.c1 || '#d62828', c2 = D.c2 || '#f1f1f1';
  var root = document.documentElement.style;
  root.setProperty('--c1', c1);
  root.setProperty('--c1d', dark(c1, 0.55));
  root.setProperty('--c2', c2);
  root.setProperty('--ink', D.shirtInk || '#fff');
  if (D.safeTop != null) root.setProperty('--safeTop', D.safeTop + 'px');
  if (D.safeBottom != null) root.setProperty('--safeBottom', D.safeBottom + 'px');

  // ── Mise en place ────────────────────────────────────────────
  // Une lettre = un span animé ; les lettres d'un mot restent ensemble (on ne coupe jamais un mot).
  var letters = function (el, text) {
    el.innerHTML = '';
    var out = [];
    String(text || '').split(' ').forEach(function (word, wi) {
      if (wi) el.appendChild(document.createTextNode(' '));
      var w = document.createElement('span');
      w.className = 'word';
      word.split('').forEach(function (ch) {
        var s = document.createElement('span');
        s.textContent = ch;
        w.appendChild(s);
        out.push(s);
      });
      el.appendChild(w);
    });
    return out;
  };
  var officialL = letters($('official'), (L.official || 'Officiel').toUpperCase());
  $('fromLabel').textContent = L.from || '';
  $('fromText').textContent = D.fromClub || '';
  if (!D.fromClub) $('from').style.display = 'none';
  var nameL = letters($('clubName'), D.toClub || '');
  // Nom de club long : on réduit la police jusqu'à ce que le mot le plus long tienne sur une ligne.
  var fitName = function () {
    var box = $('clubName'), size = 46;
    box.style.fontSize = size + 'px';
    var words = box.querySelectorAll('.word');
    var widest = function () { var m = 0; for (var i = 0; i < words.length; i++) m = Math.max(m, words[i].offsetWidth); return m; };
    while (size > 24 && widest() > box.clientWidth) { size -= 2; box.style.fontSize = size + 'px'; }
  };
  fitName();
  $('flag').textContent = D.flag || '';
  $('kind').textContent = L.kind || '';
  $('skip').textContent = L.skip || '';
  $('feeLabel').textContent = loan ? '' : (D.fee != null ? (L.fee || '') : (L.free || ''));

  // Écusson généré aux couleurs du club : bouclier, écharpe, initiales.
  var initials = String(D.toClub || '').split(/\\s+/).filter(Boolean).slice(0, 3).map(function (w) { return w.charAt(0).toUpperCase(); }).join('');
  var shield = 'M50 4 L94 17 V52 C94 79 73 96 50 106 C27 96 6 79 6 52 V17 Z';
  $('crest').innerHTML =
    '<defs><clipPath id="sh"><path d="' + shield + '"/></clipPath></defs>' +
    '<path d="' + shield + '" fill="' + c1 + '"/>' +
    '<g clip-path="url(#sh)"><path d="M-10 70 L110 20 L110 44 L-10 94 Z" fill="' + c2 + '" opacity=".9"/></g>' +
    '<path d="' + shield + '" fill="none" stroke="' + c2 + '" stroke-width="5"/>' +
    '<text x="50" y="' + (initials.length > 2 ? 58 : 60) + '" text-anchor="middle" font-family="Avenir Next Condensed, Arial Narrow, sans-serif" font-weight="800" font-size="' +
    (initials.length > 2 ? 26 : 32) + '" fill="' + (D.shirtInk || '#fff') + '" stroke="' + dark(c1, 0.5) + '" stroke-width="1.2" paint-order="stroke">' + initials + '</text>';

  // Public : deux rangées de silhouettes et des flashs de téléphones.
  var crowdSvg = '<svg viewBox="0 0 400 120" preserveAspectRatio="none">';
  var phones = [];
  for (var row = 0; row < 2; row++) {
    var y = row === 0 ? 70 : 92, col = row === 0 ? 'rgba(0,0,0,.42)' : 'rgba(0,0,0,.72)';
    crowdSvg += '<rect x="0" y="' + (y + 8) + '" width="400" height="60" fill="' + col + '"/>';
    for (var k = 0; k < 26; k++) {
      var x = k * 16 + (row ? 8 : 0) + seeded(k, row) * 6, r = 6.5 + seeded(k, row + 3) * 2.5;
      crowdSvg += '<circle cx="' + x.toFixed(1) + '" cy="' + (y - seeded(k, row + 7) * 6).toFixed(1) + '" r="' + r.toFixed(1) + '" fill="' + col + '"/>';
      crowdSvg += '<rect x="' + (x - r * 1.5).toFixed(1) + '" y="' + (y + 4).toFixed(1) + '" width="' + (r * 3).toFixed(1) + '" height="20" rx="6" fill="' + col + '"/>';
      if (row === 0 && seeded(k, 11) < 0.55) phones.push({ x: x + 3, y: y - 18, at: seeded(k, 13), sp: 0.7 + seeded(k, 17) * 0.8 });
    }
  }
  phones.forEach(function (p, i) { crowdSvg += '<circle id="ph' + i + '" cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="2.4" fill="#fff" opacity="0"/>'; });
  crowdSvg += '</svg>';
  $('crowd').innerHTML = crowdSvg;
  var phoneEls = phones.map(function (p, i) { return $('ph' + i); });

  // Flashs photo de l'acte 1, à des places et des instants stables.
  var flashes = [];
  for (var f = 0; f < 11; f++) {
    var el = document.createElement('div');
    el.className = 'pflash';
    el.style.left = (6 + seeded(f, 1) * 88) + '%';
    el.style.top = (8 + seeded(f, 2) * 70) + '%';
    $('press').appendChild(el);
    flashes.push({ el: el, at: 80 + f * 150 + seeded(f, 3) * 90 });
  }

  // Le joueur : squelette animé, de dos avec nom et numéro.
  var rig = null;
  if (D.avatar && window.DestinyRig) {
    $('hero').innerHTML = '<svg viewBox="-115 -318 230 330"><g id="rigg"></g></svg>';
    rig = window.DestinyRig.mount($('rigg'), { avatar: D.avatar, kit: D.kit, shirtName: D.shirtName, shirtNumber: D.number, pose: 'back', uid: 'c' });
  }

  // Montant : défile au format exact de l'app (feeText), puis tombe.
  var feeVal = $('feeValue');
  var m = D.feeText ? /(\\d+)([.,](\\d+))?/.exec(D.feeText) : null;
  var dec = m && m[3] ? m[3].length : 0, sep = m && m[2] ? m[2][0] : '.';
  var target = m ? parseFloat(m[1] + (m[3] ? '.' + m[3] : '')) : 0;
  var fmt = function (v) { return m ? D.feeText.replace(m[0], v.toFixed(dec).replace('.', sep)) : (D.feeText || ''); };

  // ── Confettis (canvas) ───────────────────────────────────────
  var cv = $('confetti'), cx = cv.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1), W = 0, H = 0;
  var resize = function () { W = window.innerWidth; H = window.innerHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  resize();
  window.addEventListener('resize', resize);
  var bits = [];
  var burst = function (count, power) {
    var cols = [c1, c2, '#ffd65a', '#ffffff'];
    for (var i = 0; i < count; i++) {
      // Deux canons en bas, de chaque côté, qui tirent vers le haut et vers le centre.
      var side = i % 2 ? 1 : -1, off = (12 + Math.random() * 30) * Math.PI / 180, v = (11 + Math.random() * 9) * power;
      bits.push({ x: W / 2 + side * W * 0.44, y: H * 0.8, vx: -side * Math.sin(off) * v, vy: -Math.cos(off) * v,
        w: 6 + Math.random() * 6, h: 9 + Math.random() * 8, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
        f: Math.random() * 6, vf: 0.15 + Math.random() * 0.2, c: cols[i % cols.length] });
    }
  };
  var drawBits = function () {
    cx.clearRect(0, 0, W, H);
    for (var i = bits.length - 1; i >= 0; i--) {
      var b = bits[i];
      b.vy += 0.32; b.vx *= 0.985; b.vy *= 0.985; b.x += b.vx; b.y += b.vy; b.r += b.vr; b.f += b.vf;
      if (b.y > H + 40) { bits.splice(i, 1); continue; }
      cx.save(); cx.translate(b.x, b.y); cx.rotate(b.r); cx.scale(1, Math.cos(b.f));
      cx.fillStyle = b.c; cx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h); cx.restore();
    }
  };

  // ── La chronologie ───────────────────────────────────────────
  var T = { strike: 1350, out: 1800, wipe: 1950, flash: 2080, crest: 2450, name: 2600, kind: 3000,
    hero: 3000, feeIn: 4100, count: 4300, land: loan ? 4500 : 5200, end: loan ? 7300 : 7900 };
  var fired = {};
  var once = function (t, at, key, fn) { if (t >= at && !fired[key]) { fired[key] = true; fn(); } };
  var shakeAt = -1e9;
  var tr = function (el, s) { el.style.transform = s; };

  function render(t) {
    // Acte 1 : l'annonce.
    var press = 1 - seg(t, 1900, 2500, inOut);
    $('press').style.opacity = press;
    flashes.forEach(function (fl) {
      var p = (t - fl.at) / 300;
      fl.el.style.opacity = bell(p) * 0.95;
      tr(fl.el, 'scale(' + (0.5 + 0.8 * clamp(p, 0, 1)) + ')');
    });
    officialL.forEach(function (s, i) {
      var p = seg(t, 180 + i * 45, 640 + i * 45, outBack);
      s.style.opacity = clamp(p * 1.4, 0, 1);
      tr(s, 'translateY(' + ((1 - p) * 70).toFixed(1) + 'px) rotate(' + ((1 - p) * -8).toFixed(1) + 'deg)');
    });
    tr($('officialBar'), 'scaleX(' + seg(t, 620, 1050, inOut) + ')');
    var fp = seg(t, 780, 1180);
    $('from').style.opacity = fp;
    tr($('from'), 'translateY(' + ((1 - fp) * 18).toFixed(1) + 'px)');
    tr($('strike'), 'scaleX(' + seg(t, T.strike, T.strike + 260, inOut) + ')');
    var o = seg(t, T.out, T.out + 380, inCubic);
    $('act1').style.opacity = 1 - o;
    tr($('act1'), 'translateX(' + (-o * 115).toFixed(1) + '%) skewX(' + (-12 * o).toFixed(1) + 'deg)');

    // Le flash blanc qui fait la transition.
    $('flash').style.opacity = (bell((t - T.flash + 90) / 260) * 0.85).toFixed(3);

    // Acte 2 : le club balaye l'écran en diagonale.
    var w = seg(t, T.wipe, T.wipe + 560, inOut), edge = 140 - w * 180;
    $('club').style.clipPath = 'polygon(' + edge + '% 0, 100% 0, 100% 100%, ' + (edge - 35) + '% 100%)';
    $('club').style.webkitClipPath = $('club').style.clipPath;
    var beams = seg(t, 2400, 3100) * 0.9;
    $('beamL').style.opacity = beams;
    $('beamR').style.opacity = beams;
    tr($('beamL'), 'rotate(' + (-22 + 5 * Math.sin(t / 1300)).toFixed(2) + 'deg)');
    tr($('beamR'), 'rotate(' + (22 + 5 * Math.sin(t / 1100 + 1.4)).toFixed(2) + 'deg)');
    var cr = seg(t, 2300, 3100);
    $('crowd').style.opacity = cr;
    tr($('crowd'), 'translateY(' + ((1 - cr) * 50).toFixed(1) + 'px)');
    var hype = 0.35 + 0.65 * seg(t, T.land, T.land + 300);
    phoneEls.forEach(function (el, i) {
      var p = phones[i], ph = ((t / 1000) * p.sp + p.at) % 1;
      el.setAttribute('opacity', (t < 2600 ? 0 : bell(ph / 0.25) * hype).toFixed(2));
    });
    var cp = seg(t, T.crest, T.crest + 520, outBack);
    $('crestRow').style.opacity = clamp(cp, 0, 1);
    tr($('crestRow'), 'translateY(' + ((1 - cp) * -30).toFixed(1) + 'px) scale(' + (0.5 + 0.5 * cp).toFixed(3) + ')');
    nameL.forEach(function (s, i) {
      var p = seg(t, T.name + i * 38, T.name + i * 38 + 480, outBack);
      s.style.opacity = clamp(p * 1.5, 0, 1);
      tr(s, 'translateY(' + ((1 - p) * 46).toFixed(1) + 'px) scale(' + (0.6 + 0.4 * p).toFixed(3) + ')');
    });
    var kp = seg(t, T.kind, T.kind + 360);
    $('kind').style.opacity = kp;
    tr($('kind'), 'translateY(' + ((1 - kp) * 12).toFixed(1) + 'px)');

    // Acte 3 : le joueur monte dans la lumière.
    var hp = seg(t, T.hero, T.hero + 760, outQuint);
    tr($('hero'), 'translateY(' + ((1 - hp) * 115).toFixed(1) + '%)');
    $('spot').style.opacity = seg(t, T.hero + 120, T.hero + 800) * (0.85 + 0.15 * Math.sin(t / 900));

    // Acte 4 : le montant (ou la durée du prêt).
    var fe = seg(t, T.feeIn, T.feeIn + 320);
    $('fee').style.opacity = fe;
    if (loan || D.fee == null) {
      if (!feeVal.textContent) feeVal.textContent = loan ? (L.noFee || '') : '';
      feeVal.style.fontSize = loan ? '30px' : '';
      tr($('fee'), 'translateY(' + ((1 - fe) * 16).toFixed(1) + 'px)');
    } else {
      var cnt = seg(t, T.count, T.land, outCubic);
      feeVal.textContent = t >= T.land ? D.feeText : fmt(target * cnt);
      var pop = t >= T.land ? 1 + 0.35 * (1 - seg(t, T.land, T.land + 420, outBack)) : 1;
      tr(feeVal, 'scale(' + pop.toFixed(3) + ')');
      tr($('fee'), 'translateY(' + ((1 - fe) * 16).toFixed(1) + 'px)');
    }
    once(t, T.strike + 80, 'strike', function () { post({ type: 'impact', strength: 'medium' }); });
    once(t, T.land, 'land', function () {
      if (!loan && D.fee != null) feeVal.className = 'gold';
      burst(loan ? 50 : 110, loan ? 0.8 : 1);
      shakeAt = t;
      post({ type: 'impact', strength: loan ? 'medium' : 'heavy' });
      if (rig) rig.setPose(loan ? 'wave' : 'celebrate');
    });
    once(t, T.land + 900, 'burst2', function () { if (!loan) burst(60, 0.85); });

    // La caméra : un lent zoom avant, une secousse à l'impact.
    var zoom = 1 + 0.045 * seg(t, T.hero, T.end, inOut);
    var sh = t - shakeAt, amp = sh >= 0 && sh < 420 ? (1 - sh / 420) * 7 : 0;
    tr($('cam'), 'translate(' + (Math.sin(sh * 0.09) * amp).toFixed(1) + 'px,' + (Math.cos(sh * 0.07) * amp * 0.6).toFixed(1) + 'px) scale(' + zoom.toFixed(4) + ')');

    $('skip').style.opacity = seg(t, 1200, 1600) * 0.9;
    drawBits();
  }

  // ── Boucle, fin et toucher ───────────────────────────────────
  var start = performance.now(), finished = false, endAt = 0, raf = 0;
  // Aperçu navigateur : ?t=4500 fige la chronologie à cet instant (sans effet dans l'app).
  var frozen = /[?&]t=(\\d+)/.exec(location.search || '');
  if (frozen) start = performance.now() - Number(frozen[1]);
  var finish = function () {
    if (finished) return;
    finished = true;
    endAt = performance.now();
    setTimeout(function () { if (rig) rig.stop(); post({ type: 'done' }); }, 340);
  };
  var frame = function (now) {
    var t = frozen ? Number(frozen[1]) : now - start;
    render(t);
    if (t >= T.end && !frozen) finish();
    if (finished) {
      var out = clamp((now - endAt) / 320, 0, 1);
      $('stage').style.opacity = 1 - out;
      if (out >= 1) return;
    }
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  // Ignore le toucher qui a déclenché la cinématique.
  var onTap = function () { if (performance.now() - start > 600) finish(); };
  document.addEventListener('click', onTap);
  document.addEventListener('touchend', onTap);
})();
</script>
</body>
</html>`;

},
"cinematics/strikeTemplate": function (exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STRIKE_TEMPLATE = void 0;
exports.STRIKE_TEMPLATE = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<style>
  :root { --c1: #d62828; --safeTop: env(safe-area-inset-top, 0px); --safeBottom: env(safe-area-inset-bottom, 0px); }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
  body { font-family: "Oswald", "Avenir Next Condensed", "HelveticaNeue-CondensedBold", "Roboto Condensed", "Arial Narrow", sans-serif;
    color: #fff; -webkit-user-select: none; user-select: none; -webkit-tap-highlight-color: transparent; }
  #stage { position: absolute; inset: 0; overflow: hidden; background: #04060a; }
  .shot { position: absolute; inset: 0; opacity: 0; will-change: opacity, transform; }
  svg.full { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
  .close { background:
      radial-gradient(ellipse at 50% 95%, rgba(255,255,255,.16) 0%, transparent 45%),
      radial-gradient(ellipse at 50% 30%, color-mix(in srgb, var(--c1) 35%, #0b1220) 0%, #05070c 70%); }
  .bokeh { position: absolute; border-radius: 50%; filter: blur(10px); opacity: .55; }
  .closeHero { position: absolute; left: 50%; bottom: calc(var(--safeBottom) - 10px); width: min(108vw, 470px); transform: translateX(-50%); }
  .closeHero svg { display: block; width: 100%; height: auto; filter: drop-shadow(0 20px 30px rgba(0,0,0,.5)); }
  .crowdBand { position: absolute; left: 0; right: 0; bottom: 0; height: 34%; }
  #titleBox { position: absolute; left: 16px; right: 16px; top: calc(var(--safeTop) + 70px); text-align: center; }
  #momentTitle { font-size: 15px; letter-spacing: 5px; text-transform: uppercase; opacity: 0; }
  #bigWord { margin-top: 8px; padding-left: 6px; font-size: 76px; line-height: 1; font-weight: 700; letter-spacing: 6px; text-transform: uppercase; white-space: nowrap;
    text-shadow: 0 6px 30px rgba(0,0,0,.55); }
  #bigWord span, #resultWord span { display: inline-block; will-change: transform, opacity; }
  #resultBox { position: absolute; left: 12px; right: 12px; top: calc(var(--safeTop) + 64px); text-align: center; }
  #resultWord { padding-left: 4px; font-size: 84px; line-height: 1; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; white-space: nowrap;
    text-shadow: 0 8px 34px rgba(0,0,0,.55); }
  #resultWord.good { color: #ffd65a; text-shadow: 0 0 34px rgba(255,214,90,.55), 0 8px 30px rgba(0,0,0,.5); }
  #resultWord.bad { color: #ffffff; opacity: .92; }
  #vignette { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,.55) 100%); }
  #flash { position: absolute; inset: 0; background: #fff; opacity: 0; pointer-events: none; }
  #black { position: absolute; inset: 0; background: #000; opacity: 0; pointer-events: none; }
  #confetti { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
  #skip { position: absolute; left: 0; right: 0; bottom: calc(var(--safeBottom) + 10px); text-align: center; opacity: 0;
    font-family: -apple-system, system-ui, sans-serif; font-size: 11px; letter-spacing: 1px; color: rgba(255,255,255,.6); }
</style>
</head>
<body>
<div id="stage">
  <div class="shot close" id="shotA">
    <div id="bokehA"></div>
    <svg class="crowdBand" id="crowdA" viewBox="0 0 400 120" preserveAspectRatio="none"></svg>
    <div class="closeHero" id="heroA"></div>
    <div id="titleBox"><div id="momentTitle"></div><div id="bigWord"></div></div>
  </div>
  <div class="shot" id="shotB">
    <svg class="full" id="pitch" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice"></svg>
  </div>
  <div class="shot close" id="shotC">
    <div id="bokehC"></div>
    <svg class="crowdBand" id="crowdC" viewBox="0 0 400 120" preserveAspectRatio="none"></svg>
    <div class="closeHero" id="heroC"></div>
    <div id="resultBox"><div id="resultWord"></div></div>
  </div>
  <div id="vignette"></div>
  <canvas id="confetti"></canvas>
  <div id="flash"></div>
  <div id="black"></div>
  <div id="skip"></div>
</div>
<script>/*__RIG_JS__*/</script>
<script>
window.CINE = /*__CINE_DATA__*/null;
(function () {
  var D = window.CINE || {};
  var L = D.labels || {};
  var P = D.plan || { setup: 'open', u: 0.86, v: 0.82, curve: -34, arc: 40, flight: 1000, end: 'net', dive: 1, diveAt: 640, result: 'goal' };
  var freekick = P.setup === 'freekick';
  var good = P.result === 'goal';
  var $ = function (id) { return document.getElementById(id); };
  var post = function (msg) {
    var s = JSON.stringify(msg);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(s);
    else if (window.parent && window.parent !== window) window.parent.postMessage(s, '*');
  };
  var NS = 'http://www.w3.org/2000/svg';

  // ── Outils de temps ─────────────────────────────────────────
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var outCubic = function (p) { return 1 - Math.pow(1 - p, 3); };
  var inOut = function (p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
  var outBack = function (p) { var c = 1.6; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
  var seg = function (t, a, b, ease) { var p = clamp((t - a) / (b - a), 0, 1); return (ease || outCubic)(p); };
  var bell = function (p) { return p <= 0 || p >= 1 ? 0 : Math.sin(Math.PI * p); };
  var seeded = function (i, salt) { var x = Math.sin(i * 12.9898 + (salt || 0) * 78.233) * 43758.5453; return x - Math.floor(x); };
  var f2 = function (n) { return Math.round(n * 100) / 100; };

  var ourKit = D.kit || { c1: '#d62828', c2: '#151515' };
  var oppKit = D.oppKit || { c1: '#f4f4f4', c2: '#1d3a8a' };
  var keeperKit = D.oppKeeperKit || { c1: '#f97316', c2: '#111111' };
  var root = document.documentElement.style;
  root.setProperty('--c1', ourKit.c1);
  if (D.safeTop != null) root.setProperty('--safeTop', D.safeTop + 'px');
  if (D.safeBottom != null) root.setProperty('--safeBottom', D.safeBottom + 'px');

  // ── La chronologie ───────────────────────────────────────────
  var A_END = 1500;
  var RUN = 2900;                              // élan (coup franc) ou passe du coéquipier (en jeu), après une pause
  var RUN_DUR = freekick ? 800 : 1000;
  var CONTACT = RUN + RUN_DUR;
  var SLOW = 1.25;                             // le vol du ballon, légèrement ralenti
  var FLIGHT = P.flight * SLOW;
  var ARRIVE = CONTACT + FLIGHT;
  var DIVE = CONTACT + P.diveAt * SLOW;
  var DIVE_DUR = 420 * SLOW;
  var C_START = ARRIVE + 800;
  var END = C_START + 2500;

  // ── Mise en place des textes ─────────────────────────────────
  var letters = function (el, text) {
    el.innerHTML = '';
    return String(text || '').split('').map(function (ch) {
      var s = document.createElement('span');
      s.textContent = ch === ' ' ? '\\u00a0' : ch;
      el.appendChild(s);
      return s;
    });
  };
  $('momentTitle').textContent = D.title || '';
  var bigL = letters($('bigWord'), String(L.word || '').toUpperCase());
  var resL = letters($('resultWord'), String(L.result || '').toUpperCase());
  $('resultWord').className = good ? 'good' : 'bad';
  $('skip').textContent = L.skip || '';
  // Les grands mots tiennent toujours dans la largeur de l'écran (marge pour le battement de cœur).
  var fitWord = function (el, max) {
    var spans = el.querySelectorAll('span');
    if (!spans.length) return;
    var width = function () { return spans[spans.length - 1].getBoundingClientRect().right - spans[0].getBoundingClientRect().left; };
    var size = max;
    el.style.fontSize = size + 'px';
    while (size > 30 && width() > el.clientWidth * 0.92) { size -= 2; el.style.fontSize = size + 'px'; }
  };
  fitWord($('bigWord'), 76);
  fitWord($('resultWord'), 84);

  // Lumières floues et public des gros plans.
  ['bokehA', 'bokehC'].forEach(function (id, k) {
    var html = '';
    for (var i = 0; i < 9; i++) {
      var sz = 30 + seeded(i, k + 1) * 70;
      html += '<div class="bokeh" style="left:' + (seeded(i, k + 2) * 100).toFixed(1) + '%;top:' + (5 + seeded(i, k + 3) * 45).toFixed(1) +
        '%;width:' + sz.toFixed(0) + 'px;height:' + sz.toFixed(0) + 'px;background:' + (i % 3 ? 'rgba(255,240,210,.5)' : 'rgba(255,255,255,.35)') + '"></div>';
    }
    $(id).innerHTML = html;
  });
  var crowd = function () {
    var s = '';
    for (var row = 0; row < 2; row++) {
      var y = 60 + row * 26, col = row ? 'rgba(0,0,0,.8)' : 'rgba(0,0,0,.5)';
      s += '<rect x="0" y="' + (y + 8) + '" width="400" height="80" fill="' + col + '"/>';
      for (var k = 0; k < 24; k++) {
        var x = k * 17 + (row ? 8 : 0) + seeded(k, row) * 6, r = 7 + seeded(k, row + 3) * 3;
        s += '<circle cx="' + x.toFixed(1) + '" cy="' + (y - seeded(k, row + 5) * 6).toFixed(1) + '" r="' + r.toFixed(1) + '" fill="' + col + '"/>';
        s += '<rect x="' + (x - r * 1.5).toFixed(1) + '" y="' + (y + 3).toFixed(1) + '" width="' + (r * 3).toFixed(1) + '" height="24" rx="7" fill="' + col + '"/>';
      }
    }
    return s;
  };
  $('crowdA').innerHTML = crowd();
  $('crowdC').innerHTML = crowd();

  // ── Plan B : vue télé derrière notre joueur, le but au loin ─
  // Plan du but : u de -1 à 1 (poteaux), v de 0 (sol) à 1 (barre).
  var G = { x0: 136, x1: 264, bar: 326, line: 368, post: 3 };
  var onGoal = function (u, v) { return { x: (G.x0 + G.x1) / 2 + u * (G.x1 - G.x0) / 2, y: G.line - v * (G.line - G.bar) }; };
  var TG = onGoal(P.u, P.v);
  var SPOT = { x: 226, y: 652 }, R0 = 10.5, R1 = 3.1;
  var WALL_Y = 520;
  var HORIZON = 300;

  var svg = '<defs>' +
    '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03050b"/><stop offset="1" stop-color="#101a33"/></linearGradient>' +
    '<radialGradient id="glow"><stop offset="0" stop-color="rgba(255,250,235,.95)"/><stop offset=".25" stop-color="rgba(255,250,235,.35)"/><stop offset="1" stop-color="rgba(255,250,235,0)"/></radialGradient>' +
    '<linearGradient id="grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d6531"/><stop offset="1" stop-color="#2f8f47"/></linearGradient>' +
    '</defs>';
  svg += '<rect width="400" height="' + (HORIZON + 10) + '" fill="url(#sky)"/>';
  svg += '<circle cx="40" cy="40" r="110" fill="url(#glow)" opacity=".5"/><circle cx="360" cy="40" r="110" fill="url(#glow)" opacity=".5"/>';
  var standsTop = 70;
  svg += '<rect x="0" y="' + standsTop + '" width="400" height="' + (HORIZON - standsTop) + '" fill="#0a0f1c"/>';
  var phones = [];
  for (var row = 0; row * 22 < HORIZON - standsTop - 24; row++) {
    var yy = standsTop + 12 + row * 22, cc = 'rgba(' + (14 + row * 3) + ',' + (20 + row * 4) + ',' + (36 + row * 5) + ',1)';
    for (var k = 0; k < 44; k++) {
      var xx = k * 9.4 + (row % 2 ? 4.7 : 0) + seeded(k, row + 20) * 3;
      svg += '<circle cx="' + xx.toFixed(1) + '" cy="' + yy.toFixed(1) + '" r="3.5" fill="' + cc + '"/>';
      svg += '<rect x="' + (xx - 4.6).toFixed(1) + '" y="' + (yy + 2.4).toFixed(1) + '" width="9.2" height="12" rx="3" fill="' + cc + '"/>';
      if (seeded(k, row + 40) < 0.2) phones.push({ x: xx, y: yy - 2, at: seeded(k, row + 60), sp: 0.6 + seeded(k, row + 80) });
    }
  }
  phones.forEach(function (p, i) { svg += '<circle id="ph' + i + '" cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="1.5" fill="#fff" opacity="0"/>'; });
  svg += '<rect x="0" y="' + (HORIZON - 12) + '" width="400" height="12" fill="' + ourKit.c1 + '" opacity=".85"/>';
  svg += '<rect x="0" y="' + (HORIZON - 12) + '" width="400" height="2.5" fill="rgba(255,255,255,.35)"/>';
  var grassH = 800 - HORIZON;
  svg += '<rect x="0" y="' + HORIZON + '" width="400" height="' + grassH + '" fill="url(#grass)"/>';
  for (var b = 0; b < 14; b += 2) {
    var y0 = HORIZON + grassH * Math.pow(b / 14, 1.8), y1 = HORIZON + grassH * Math.pow((b + 1) / 14, 1.8);
    svg += '<rect x="0" y="' + y0.toFixed(1) + '" width="400" height="' + (y1 - y0).toFixed(1) + '" fill="rgba(255,255,255,.05)"/>';
  }
  // Lignes : but, petit rectangle, surface, point de penalty, arc de la surface.
  var line = 'stroke="rgba(255,255,255,.72)" fill="none" stroke-linejoin="round"';
  svg += '<line x1="-20" y1="' + G.line + '" x2="420" y2="' + G.line + '" stroke-width="1.6" stroke="rgba(255,255,255,.75)"/>';
  svg += '<path d="M118 ' + G.line + ' L112 382 L288 382 L282 ' + G.line + '" stroke-width="1.6" ' + line + '/>';
  svg += '<path d="M40 ' + G.line + ' L4 432 L396 432 L360 ' + G.line + '" stroke-width="1.8" ' + line + '/>';
  svg += '<ellipse cx="200" cy="405" rx="2.6" ry="1" fill="rgba(255,255,255,.8)"/>';
  svg += '<path d="M150 432 Q200 456 250 432" stroke-width="1.8" ' + line + '/>';
  // Fond du filet, puis le filet, le ballon au fond, le gardien, le cadre, puis tout ce qui est devant.
  svg += '<path d="M' + G.x0 + ' ' + G.bar + ' L' + (G.x0 + 8) + ' ' + (G.bar - 7) + ' L' + (G.x1 - 8) + ' ' + (G.bar - 7) + ' L' + G.x1 + ' ' + G.bar +
    ' L' + G.x1 + ' ' + G.line + ' L' + G.x0 + ' ' + G.line + ' Z" fill="rgba(0,0,0,.28)"/>';
  svg += '<g id="net"></g><g id="ballFar"></g><g id="keeperLayer"></g>';
  svg += '<g id="frame"><rect x="' + (G.x0 - G.post) + '" y="' + (G.bar - G.post) + '" width="' + G.post + '" height="' + (G.line - G.bar + G.post) + '" fill="#f4f4f4"/>' +
    '<rect x="' + G.x1 + '" y="' + (G.bar - G.post) + '" width="' + G.post + '" height="' + (G.line - G.bar + G.post) + '" fill="#f4f4f4"/>' +
    '<rect x="' + (G.x0 - G.post) + '" y="' + (G.bar - G.post) + '" width="' + (G.x1 - G.x0 + 2 * G.post) + '" height="' + G.post + '" fill="#f4f4f4"/></g>';
  svg += '<g id="spark"></g><g id="ballMid"></g><g id="wallLayer"></g><g id="defLayer"></g><g id="ballNear"></g><g id="shooterLayer"></g>';
  $('pitch').innerHTML = svg;
  var phoneEls = phones.map(function (p, i) { return $('ph' + i); });

  // Les joueurs : chacun dans un groupe (position, saut, plongeon) autour de son squelette.
  var R = window.DestinyRig;
  var mk = function (parent) {
    var g = document.createElementNS(NS, 'g');
    var inner = document.createElementNS(NS, 'g'); g.appendChild(inner);
    $(parent).appendChild(g);
    return { g: g, inner: inner };
  };
  var rigs = [];
  var mount = function (grp, opts) { var r = R ? R.mount(grp.inner, opts) : null; if (r) rigs.push(r); return r; };
  var shooterG = mk('shooterLayer'), keeperG = mk('keeperLayer');
  var shooterRig = mount(shooterG, { avatar: D.avatar, kit: ourKit, pose: 'back', uid: 's', shadow: true, shirtName: D.shirtName, shirtNumber: D.number });
  var keeperRig = mount(keeperG, { avatar: D.oppAvatar, kit: keeperKit, pose: 'keeper', uid: 'k', shadow: true });
  // Coup franc : le mur, quatre adversaires côte à côte, décalés vers le côté du tir.
  var wall = [];
  if (freekick) {
    var wallSide = P.u >= 0 ? 1 : -1;
    for (var w = 0; w < 4; w++) {
      var wg = mk('wallLayer');
      var wav = (D.wallAvatars && D.wallAvatars[w]) || D.oppAvatar;
      var wr = mount(wg, { avatar: wav, kit: oppKit, pose: 'front', uid: 'w' + w, shadow: true });
      wall.push({ g: wg.g, rig: wr, x: 200 + wallSide * 14 + (w - 1.5) * 25, delay: seeded(w, 3) * 60 });
    }
  }
  // En jeu : un défenseur qui sort sur notre joueur.
  var def = null;
  if (!freekick) {
    def = mk('defLayer');
    mount(def, { avatar: (D.wallAvatars && D.wallAvatars[0]) || D.oppAvatar, kit: oppKit, pose: 'front', uid: 'd', shadow: true });
  }
  // Gros plans : notre joueur, en buste.
  var heroA = null, heroC = null;
  if (R && D.avatar) {
    $('heroA').innerHTML = '<svg viewBox="-115 -318 230 330"><g id="hA"></g></svg>';
    $('heroC').innerHTML = '<svg viewBox="-115 -318 230 330"><g id="hC"></g></svg>';
    heroA = R.mount($('hA'), { avatar: D.avatar, kit: ourKit, pose: 'focus', uid: 'a', shadow: false });
    heroC = R.mount($('hC'), { avatar: D.avatar, kit: ourKit, pose: 'front', uid: 'c', shadow: false });
    rigs.push(heroA, heroC);
  }

  // Le filet, au fond du but : il se creuse autour de l'impact.
  var netG = $('net');
  var drawNet = function (amp) {
    var cols = 20, rws = 7, d = '';
    var disp = function (x, y) {
      if (!amp) return [x, y];
      var dx = x - TG.x, dy = y - TG.y, dist2 = dx * dx + dy * dy, k = amp * Math.exp(-dist2 / 260), len = Math.sqrt(dist2) || 1;
      return [x - dx / len * k * 0.35, y - dy / len * k * 0.35 - k * 0.25];
    };
    for (var i = 0; i <= cols; i++) {
      var x = G.x0 + i * (G.x1 - G.x0) / cols;
      for (var j = 0; j <= rws; j++) { var p = disp(x, G.bar + j * (G.line - G.bar) / rws); d += (j ? 'L' : 'M') + f2(p[0]) + ' ' + f2(p[1]); }
    }
    for (var j2 = 0; j2 <= rws; j2++) {
      var y = G.bar + j2 * (G.line - G.bar) / rws;
      for (var i2 = 0; i2 <= cols; i2++) { var q = disp(G.x0 + i2 * (G.x1 - G.x0) / cols, y); d += (i2 ? 'L' : 'M') + f2(q[0]) + ' ' + f2(q[1]); }
    }
    netG.innerHTML = '<path d="' + d + '" fill="none" stroke="rgba(255,255,255,.32)" stroke-width="0.6"/>';
  };

  var ballSvg = function (x, y, r, spin) {
    return '<g transform="translate(' + f2(x) + ' ' + f2(y) + ') rotate(' + f2(spin) + ')">' +
      '<circle r="' + f2(r) + '" fill="#fafafa" stroke="#cfd8dc" stroke-width="' + f2(r * 0.08) + '"/>' +
      '<circle cx="' + f2(-r * 0.25) + '" cy="' + f2(-r * 0.2) + '" r="' + f2(r * 0.32) + '" fill="#2b2b2b"/>' +
      '<circle cx="' + f2(r * 0.5) + '" cy="' + f2(r * 0.35) + '" r="' + f2(r * 0.2) + '" fill="#2b2b2b"/></g>';
  };
  var shadowSvg = function (x, y, r) { return '<ellipse cx="' + f2(x) + '" cy="' + f2(y) + '" rx="' + f2(r) + '" ry="' + f2(r * 0.3) + '" fill="rgba(0,0,0,.35)"/>'; };

  /** Le ballon en vol : ligne droite vers la cible, plus l'effet (de côté) et la cloche (en hauteur). */
  var flightAt = function (p) {
    var e = 1 - Math.pow(1 - p, 1.25);
    var x = SPOT.x + (TG.x - SPOT.x) * e + P.curve * bell(p);
    var gy = SPOT.y + (G.line - SPOT.y) * e;
    var y = SPOT.y + (TG.y - SPOT.y) * e - P.arc * bell(p);
    return { x: x, y: y, r: R0 + (R1 - R0) * e, ground: gy, e: e };
  };
  /** Position du ballon à l'instant t, selon l'issue ; layer : far (au fond du but), mid (devant le but), near (près de nous). */
  var ballAt = function (t) {
    if (t < CONTACT) {
      if (freekick) return { x: SPOT.x, y: SPOT.y - R0, r: R0, spin: 0, ground: SPOT.y, layer: 'near' };
      // En jeu, la passe arrive de la gauche en roulant et finit sous le pied au moment du contact.
      var pp = seg(t, RUN - 100, CONTACT, function (q) { return q; });
      var px = -30 + (SPOT.x + 4 + 30) * pp, py = 720 - (720 - SPOT.y) * pp;
      return { x: px, y: py - R0, r: R0, spin: pp * 720, ground: py, layer: 'near' };
    }
    var dt = (t - ARRIVE) / 1000;
    if (P.end === 'wall') {
      // Contré par le mur : le ballon frappe le mur à mi-chemin et revient vers nous.
      var pw = (t - CONTACT) / (FLIGHT * 0.32);
      if (pw < 1) { var fw = flightAt(pw * 0.32); return { x: fw.x, y: fw.y, r: fw.r, spin: pw * 360, ground: fw.ground, layer: 'near' }; }
      var hit = flightAt(0.32), back = clamp((pw - 1) * 0.5, 0, 1);
      return { x: hit.x + 90 * back, y: hit.y + 120 * back - 60 * bell(back), r: hit.r + 6 * back, spin: 360 - back * 500, ground: hit.ground + 120 * back, layer: 'near' };
    }
    if (t < ARRIVE) {
      var p = (t - CONTACT) / FLIGHT, f = flightAt(p);
      return { x: f.x, y: f.y, r: f.r, spin: p * 900, ground: f.ground, layer: f.e > 0.55 ? 'mid' : 'near' };
    }
    var side = P.u >= 0 ? 1 : -1;
    if (P.end === 'net') {
      var sink = outCubic(clamp(dt * 3, 0, 1));
      return { x: TG.x + (TG.x - 200) * 0.05 * sink, y: TG.y - 3 * sink + 9 * sink * sink, r: R1 * (1 - 0.18 * sink), spin: 900, ground: G.line - 4, layer: 'far' };
    }
    if (P.end === 'save') {
      return { x: TG.x + side * 120 * dt, y: TG.y - 90 * dt + 180 * dt * dt, r: R1 * (1 + dt * 0.8), spin: 900 + dt * 1400, ground: G.line + 20 * dt, layer: 'mid' };
    }
    if (P.end === 'post') {
      var bk = clamp(dt * 1.7, 0, 1);
      return { x: TG.x - side * 40 * bk, y: TG.y + 70 * bk - 20 * bell(bk), r: R1 + 3 * bk, spin: 900 - dt * 900, ground: G.line + 70 * bk, layer: 'mid' };
    }
    // À côté ou au-dessus : le ballon file vers la tribune et rapetisse.
    var away = Math.min(1.4, dt * 1.6);
    return { x: TG.x + (TG.x - SPOT.x) * 0.35 * away, y: TG.y + (TG.y - SPOT.y) * 0.25 * away, r: R1 * Math.max(0.35, 1 - away * 0.5), spin: 900 + dt * 900, ground: G.line, layer: 'far' };
  };

  // ── Confettis ────────────────────────────────────────────────
  var cv = $('confetti'), cx = cv.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1), W = 0, H = 0;
  var resize = function () { W = window.innerWidth; H = window.innerHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  resize(); window.addEventListener('resize', resize);
  var bits = [];
  var burst = function (count) {
    var cols = [ourKit.c1, ourKit.c2, '#ffd65a', '#ffffff'];
    for (var i = 0; i < count; i++) {
      var sd = i % 2 ? 1 : -1, off = (10 + Math.random() * 32) * Math.PI / 180, v = 11 + Math.random() * 10;
      bits.push({ x: W / 2 + sd * W * 0.46, y: H * 0.82, vx: -sd * Math.sin(off) * v, vy: -Math.cos(off) * v, w: 6 + Math.random() * 6,
        h: 9 + Math.random() * 8, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, f: Math.random() * 6, vf: 0.15 + Math.random() * 0.2, c: cols[i % cols.length] });
    }
  };
  var drawBits = function () {
    cx.clearRect(0, 0, W, H);
    for (var i = bits.length - 1; i >= 0; i--) {
      var b = bits[i];
      b.vy += 0.32; b.vx *= 0.985; b.vy *= 0.985; b.x += b.vx; b.y += b.vy; b.r += b.vr; b.f += b.vf;
      if (b.y > H + 40) { bits.splice(i, 1); continue; }
      cx.save(); cx.translate(b.x, b.y); cx.rotate(b.r); cx.scale(1, Math.cos(b.f)); cx.fillStyle = b.c; cx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h); cx.restore();
    }
  };

  // ── Rendu ────────────────────────────────────────────────────
  var fired = {};
  var once = function (t, at, key, fn) { if (t >= at && !fired[key]) { fired[key] = true; fn(); } };
  var tr = function (el, s) { el.style.transform = s; };
  var impactAt = -1e9;

  function render(t) {
    var inB = t >= A_END && t < C_START, inC = t >= C_START;
    $('shotA').style.opacity = t < A_END ? 1 : 0;
    $('shotB').style.opacity = inB ? 1 : 0;
    $('shotC').style.opacity = inC ? 1 : 0;
    $('black').style.opacity = f2(Math.max(bell((t - A_END + 140) / 280), bell((t - C_START + 140) / 280), 1 - seg(t, 0, 300)));

    // Plan A : gros plan, titre, cœur qui bat.
    tr($('heroA'), 'translateX(-50%) scale(' + (1 + 0.06 * seg(t, 0, A_END, inOut)).toFixed(4) + ')');
    $('momentTitle').style.opacity = seg(t, 200, 600);
    bigL.forEach(function (s, i) {
      var p = seg(t, 350 + i * 45, 800 + i * 45, outBack);
      s.style.opacity = clamp(p * 1.4, 0, 1);
      tr(s, 'translateY(' + ((1 - p) * 60).toFixed(1) + 'px) scale(' + (0.7 + 0.3 * p).toFixed(3) + ')');
    });
    var beat = Math.max(bell((t - 650) / 160), bell((t - 900) / 160), bell((t - 1250) / 160));
    tr($('bigWord'), 'scale(' + (1 + 0.05 * beat).toFixed(3) + ')');
    once(t, 650, 'b1', function () { post({ type: 'impact', strength: 'medium' }); });
    once(t, 1250, 'b2', function () { post({ type: 'impact', strength: 'medium' }); });

    // Plan B.
    if (inB || t < A_END + 200) {
      var z = 1 + 0.05 * seg(t, A_END, CONTACT, inOut) + 0.05 * seg(t, CONTACT, ARRIVE, inOut);
      tr($('pitch'), 'scale(' + z.toFixed(4) + ')');
      $('pitch').style.transformOrigin = '50% 50%';
      phoneEls.forEach(function (el, i) {
        var p = phones[i], ph = ((t / 1000) * p.sp + p.at) % 1;
        el.setAttribute('opacity', (bell(ph / 0.2) * (t > ARRIVE && good ? 1 : 0.5)).toFixed(2));
      });
      // Notre joueur : au coup franc, quelques pas d'élan ; en jeu, il avance à la rencontre de la passe.
      var runP = seg(t, RUN, CONTACT - 30, inOut);
      var sx, sy, ss;
      // Le tireur finit à gauche du ballon (pied droit dessus) : la frappe part bien visible.
      if (freekick) { sx = 130 + 38 * runP; sy = 780 - 62 * runP; ss = 0.7 - 0.06 * runP; }
      else { sx = 150 + 18 * runP; sy = 760 - 50 * runP; ss = 0.68 - 0.05 * runP; }
      shooterG.g.setAttribute('transform', 'translate(' + f2(sx) + ' ' + f2(sy) + ') scale(' + f2(ss) + ')');
      once(t, CONTACT - 420, 'shoot', function () { if (shooterRig) shooterRig.setPose('shootBack'); });
      // Le mur saute au moment de la frappe ; le défenseur sort sur notre joueur.
      wall.forEach(function (wl, i) {
        var jt = t - CONTACT - wl.delay, jump = jt > -60 && jt < 520 ? 34 * bell((jt + 60) / 580) : 0;
        wl.g.setAttribute('transform', 'translate(' + f2(wl.x) + ' ' + f2(WALL_Y - jump) + ') scale(0.3)');
      });
      once(t, CONTACT + 520, 'wallDown', function () { wall.forEach(function (wl) { if (wl.rig) wl.rig.setPose('front'); }); });
      if (def) {
        var dp = seg(t, RUN - 300, CONTACT + 200, inOut);
        def.g.setAttribute('transform', 'translate(' + f2(300 - 52 * dp) + ' ' + f2(470 + 80 * dp) + ') scale(' + f2(0.28 + 0.08 * dp) + ')');
      }
      // Le gardien : en appui, puis plongeon vers la frappe.
      var sway = t < DIVE ? Math.sin(t / 300) * 2.4 * seg(t, A_END, A_END + 400) : 0;
      var dv = seg(t, DIVE, DIVE + DIVE_DUR, outCubic), side = P.dive;
      var kx = 200 + sway + side * 42 * dv, ky = 371 - (side ? 10 * bell(dv * 0.92) : 0), rot = side * 74 * dv;
      keeperG.g.setAttribute('transform', 'translate(' + f2(kx) + ' ' + f2(ky) + ') rotate(' + f2(rot) + ' 0 ' + f2(-150 * 0.15) + ') scale(0.15)');
      once(t, DIVE, 'dive', function () { if (keeperRig && side) keeperRig.setPose('stretch'); });
      // Le ballon, dans le bon calque de profondeur.
      var bl = ballAt(t), layers = { far: '', mid: '', near: '' };
      if (bl) layers[bl.layer] = shadowSvg(bl.x, bl.ground, bl.r * 0.9) + ballSvg(bl.x, bl.y, bl.r, bl.spin);
      $('ballFar').innerHTML = layers.far;
      $('ballMid').innerHTML = layers.mid;
      $('ballNear').innerHTML = layers.near;
      // Le filet tremble quand le ballon y entre.
      var amp = P.end === 'net' && t >= ARRIVE ? 9 * Math.exp(-(t - ARRIVE) / 260) * Math.cos((t - ARRIVE) / 70) : 0;
      if (!fired.netDrawn || amp || (t >= ARRIVE && !fired.netRest)) {
        drawNet(Math.abs(amp) > 0.2 ? amp : 0);
        fired.netDrawn = true;
        if (t >= ARRIVE && Math.abs(amp) <= 0.2) fired.netRest = true;
      }
      var spark = P.end === 'post' ? bell((t - ARRIVE) / 220) : 0;
      $('spark').innerHTML = spark ? '<circle cx="' + f2(TG.x) + '" cy="' + f2(TG.y) + '" r="' + f2(3 + 10 * spark) + '" fill="rgba(255,255,255,' + f2(0.8 * spark) + ')"/>' : '';
      once(t, RUN - 260, 'whistle', function () { if (freekick) post({ type: 'impact', strength: 'medium' }); });
      once(t, CONTACT, 'contact', function () { post({ type: 'impact', strength: 'medium' }); });
      once(t, P.end === 'wall' ? CONTACT + FLIGHT * 0.32 : ARRIVE, 'arrive', function () {
        impactAt = t;
        post({ type: 'impact', strength: good ? 'heavy' : 'medium' });
      });
    }
    $('flash').style.opacity = f2(good ? bell((t - ARRIVE) / 240) * 0.7 : 0);
    var shk = t - impactAt, amp2 = good && shk >= 0 && shk < 380 ? (1 - shk / 380) * 8 : 0;
    $('stage').style.transform = amp2 ? 'translate(' + f2(Math.sin(shk * 0.09) * amp2) + 'px,' + f2(Math.cos(shk * 0.07) * amp2 * 0.6) + 'px)' : '';

    // Plan C : la réaction.
    if (inC) {
      once(t, C_START, 'react', function () {
        if (heroC) heroC.setPose(good ? 'celebrate' : 'despair');
        if (good) burst(90);
      });
      once(t, C_START + 800, 'burst2', function () { if (good) burst(50); });
      tr($('heroC'), 'translateX(-50%) scale(' + (1 + 0.04 * seg(t, C_START, END, inOut)).toFixed(4) + ')');
      resL.forEach(function (s, i) {
        var p = seg(t, C_START + 120 + i * 50, C_START + 600 + i * 50, outBack);
        s.style.opacity = clamp(p * 1.4, 0, 1);
        tr(s, 'translateY(' + ((1 - p) * -50).toFixed(1) + 'px) scale(' + (1.4 - 0.4 * p).toFixed(3) + ')');
      });
    }
    $('skip').style.opacity = f2(seg(t, 900, 1300) * 0.9);
    drawBits();
  }

  // ── Boucle, fin et toucher ───────────────────────────────────
  var start = performance.now(), finished = false, endAt = 0;
  // Aperçu navigateur : ?t=3000 fige la chronologie à cet instant (sans effet dans l'app).
  var frozen = /[?&]t=(\\d+)/.exec(location.search || '');
  var finish = function () {
    if (finished) return;
    finished = true;
    endAt = performance.now();
    setTimeout(function () { rigs.forEach(function (r) { r.stop(); }); post({ type: 'done' }); }, 340);
  };
  var frame = function (now) {
    var t = frozen ? Number(frozen[1]) : now - start;
    render(t);
    if (t >= END && !frozen) finish();
    if (finished) {
      var out = clamp((now - endAt) / 320, 0, 1);
      $('stage').style.opacity = 1 - out;
      if (out >= 1) return;
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  var onTap = function () { if (performance.now() - start > 600) finish(); };
  document.addEventListener('click', onTap);
  document.addEventListener('touchend', onTap);
})();
</script>
</body>
</html>`;

}
};
  var cache = {};
  // Bouchons : moteur de jeu (drapeau, montants) et traduction (langue de la vidéo).
  var LANGUE = "fr";
  var STUBS = {
    "../game/engine.js": { __esModule: true, default: {
      countryOf: function () { return { flag: "" }; },
      fmtMoney: function (m) { var fr = LANGUE === "fr", v = m >= 10 ? Math.round(m) : Math.round(m * 10) / 10;
        if (m > 0 && m < 0.1) return fr ? Math.max(1, Math.round(m * 1000)) + " k€" : "€" + Math.max(1, Math.round(m * 1000)) + "k";
        return fr ? String(v).replace(".", ",") + " M€" : "€" + v + "m"; } } },
    "../i18n": { t: function (cle, vars) {
      var s = req("i18n/strings")[LANGUE === "en" ? "en" : "fr"];
      var v = cle.split(".").reduce(function (o, k) { return o && o[k]; }, s);
      if (typeof v !== "string") throw new Error("Texte inconnu : " + cle);
      return v.replace(/\{(\w+)\}/g, function (_, k) { return vars && vars[k] != null ? vars[k] : ""; }); } },
  };
  function req(id) {
    if (cache[id]) return cache[id].exports;
    var m = (cache[id] = { exports: {} });
    SOURCES[id](m.exports, function (dep) {
      if (STUBS[dep]) return STUBS[dep];
      var cible = dep.replace(/^\.\.\//, "").replace(/^\.\//, id.split("/")[0] + "/");
      if (!SOURCES[cible]) throw new Error("Module non copié : " + dep + " (depuis " + id + ")");
      return req(cible);
    });
    return m.exports;
  }
  var rigJs = req("avatar/rigWeb").RIG_WEB_JS;
  (0, eval)(rigJs);
  window.DFC_APP = {
    source: "proto/avatar-rig e309b21 2026-10-24",
    langue: function (l) { LANGUE = l; },
    rig: window.DestinyRig,
    rigJs: rigJs,
    catalogue: req("avatar/catalog"),
    moments: req("cinematics/moments"),
    cine: req("cinematics/index"),
    textes: function () { return req("i18n/strings")[LANGUE === "en" ? "en" : "fr"]; },
    rarete: {
  common: '#B8C4C6',
  rare: '#5BA8F0',
  epic: '#B57BEA',
  legendary: '#F0C04A',
  limited: '#F07F1E',
},
    icones: {
  skin: `<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.6-.8 1.6-1.6 0-.6-.4-1-.4-1.6 0-.9.7-1.5 1.6-1.5H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z" fill="none" stroke="COLOR" stroke-width="1.8" stroke-linejoin="round"/><circle cx="7.5" cy="11" r="1.4" fill="COLOR"/><circle cx="10" cy="7.2" r="1.4" fill="COLOR"/><circle cx="14.5" cy="7.2" r="1.4" fill="COLOR"/><circle cx="17" cy="11" r="1.4" fill="COLOR"/></svg>`,
  hair: `<svg viewBox="0 0 24 24"><circle cx="6" cy="6" r="2.8" fill="none" stroke="COLOR" stroke-width="1.8"/><circle cx="6" cy="18" r="2.8" fill="none" stroke="COLOR" stroke-width="1.8"/><path d="M8.1 8.1 20 20M8.1 15.9 20 4" fill="none" stroke="COLOR" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  face: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="COLOR" stroke-width="1.8"/><circle cx="9" cy="10" r="1.3" fill="COLOR"/><circle cx="15" cy="10" r="1.3" fill="COLOR"/><path d="M8.2 14.2c1 1.6 2.3 2.3 3.8 2.3s2.8-.7 3.8-2.3" fill="none" stroke="COLOR" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  gear: `<svg viewBox="0 0 24 24"><path d="M3 9.5h18" fill="none" stroke="COLOR" stroke-width="1.8" stroke-linecap="round"/><circle cx="7.5" cy="13" r="3.5" fill="none" stroke="COLOR" stroke-width="1.8"/><circle cx="16.5" cy="13" r="3.5" fill="none" stroke="COLOR" stroke-width="1.8"/><path d="M11 12.5c.6-.5 1.4-.5 2 0M7 9.5 8.5 4h7L17 9.5" fill="none" stroke="COLOR" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  outfit: `<svg viewBox="0 0 24 24"><path d="M8.5 3.5 3 6.5l2 4.2 2.3-1.1V20.5h9.4V9.6l2.3 1.1 2-4.2-5.5-3c-.6 1.6-1.9 2.6-3.5 2.6s-2.9-1-3.5-2.6z" fill="none" stroke="COLOR" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
},
    iconePose: `<svg viewBox="0 0 24 24"><circle cx="12" cy="4.4" r="2.6" fill="#FFFFFF"/><path d="M8.3 14.6v-3.9a3.7 3.7 0 0 1 7.4 0v3.9z" fill="#FFFFFF"/><path d="M4.2 15.4c-1.3.6-2 1.3-2 2.1 0 2 4.4 3.6 9.8 3.6s9.8-1.6 9.8-3.6c0-.8-.7-1.5-2-2.1" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round"/><path d="M17.6 13.6l2.4 1.7-1.6 2.5" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  };
})();
