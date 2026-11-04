// Papir- og blekkmotoren er hentet fra docs/forenklet-tilstandsmaskin-animasjon.html.
window.Motor = (() => {
'use strict';

const CONFIG = {
  seed: 'kapabiliteter-2026-11-04',
  colors: {
    bg: '#f0eee6',
    paper: '#faf6ef',
    paperDim: '#ebe4d7',
    ink: '#1f1e1d',
    inkSoft: 'rgba(31,30,29,.58)',
    terra: '#d97757',
    terraDark: '#b85c3e',
    onTerra: '#f8f1e6',
    sand: '#e3dacc',
    sage: '#9caf96',
    sageDark: '#5f7a59',
  },
  fonts: {
    serif: '"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif',
    sans: '"Avenir Next",Avenir,"Segoe UI",system-ui,sans-serif',
    mono: '"SF Mono",Menlo,Consolas,monospace',
  },
  mainFps: 24,
  steppedFps: 12,
  boilFps: 10,
  boilVariants: 3,
  grainOpacity: 0.07,
  ease: [0.22, 1, 0.36, 1],
  easeBack: [0.34, 1.5, 0.64, 1],
  easeIn: [0.55, 0, 0.75, 0.2],
  dur: { lay: 900, draw: 650, header: 800, fade: 350, stamp: 600, hop: 240, hopPause: 30 },
  motion: { dropY: 38, dropRot: 3.5, breathDeg: 0.35, breathHz: 0.22, bobPx: 1.4 },
  jitter: { paperEdge: 1.7, ink: 1.2, boil: 0.9, restRotation: 1.6, displacement: 3 },
};

const NS = 'http://www.w3.org/2000/svg';
const C = CONFIG.colors;

function el(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs || {}) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
const clamp01 = x => (x < 0 ? 0 : x > 1 ? 1 : x);
const lerp = (a, b, t) => a + (b - a) * t;
const quant = (t, fps) => Math.floor(t / (1000 / fps)) * (1000 / fps);
const fmt = n => n.toFixed(1);
const progress = (t, start, dur) => clamp01((t - start) / dur);

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rngFor = key => mulberry32(hashStr(CONFIG.seed + ':' + key));

function makeNoise(rng, n) {
  const v = Array.from({ length: n }, () => rng() * 2 - 1);
  return u => {
    const x = (((u % 1) + 1) % 1) * n;
    const i = Math.floor(x), f = x - i, s = f * f * (3 - 2 * f);
    return v[i % n] + (v[(i + 1) % n] - v[i % n]) * s;
  };
}

function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = t => ((ax * t + bx) * t + cx) * t;
  const sy = t => ((ay * t + by) * t + cy) * t;
  const dsx = t => (3 * ax * t + 2 * bx) * t + cx;
  return x => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const d = sx(t) - x, dd = dsx(t);
      if (Math.abs(d) < 1e-5 || Math.abs(dd) < 1e-6) break;
      t -= d / dd;
    }
    return sy(clamp01(t));
  };
}
const ease = bezier(...CONFIG.ease);
const easeBack = bezier(...CONFIG.easeBack);
const easeIn = bezier(...CONFIG.easeIn);

function catmull(pts, closed, perSeg) {
  const n = pts.length, out = [];
  const get = i => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    for (let j = 0; j < perSeg; j++) {
      const t = j / perSeg, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map(k => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t +
        (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)));
    }
  }
  if (!closed) out.push(pts[n - 1].slice());
  return out;
}

function arcPoints(a, b, lift, n = 26) {
  const c = [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - lift * 2];
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    out.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]);
  }
  return out;
}

function samplePolyline(pts, p) {
  if (!pts._len) {
    pts._len = [0];
    for (let i = 1; i < pts.length; i++) pts._len.push(pts._len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  }
  const total = pts._len[pts.length - 1], target = clamp01(p) * total;
  let i = 1;
  while (i < pts.length - 1 && pts._len[i] < target) i++;
  const seg = pts._len[i] - pts._len[i - 1] || 1, f = (target - pts._len[i - 1]) / seg;
  return [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)];
}

const polyD = (pts, close) => 'M' + pts.map(p => fmt(p[0]) + ' ' + fmt(p[1])).join('L') + (close ? 'Z' : '');

function roughRectD(w, h, amp, key, variant) {
  const base = rngFor(key);
  const nz = makeNoise(base, 14);
  const corner = [0, 1, 2, 3].map(() => (base() * 2 - 1) * amp * 1.4);
  const vz = makeNoise(rngFor(key + '#' + variant), 24);
  const corners = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]];
  const per = 2 * (w + h), pts = [];
  let acc = 0;
  for (let s = 0; s < 4; s++) {
    const [ax, ay] = corners[s], [bx, by] = corners[(s + 1) % 4];
    const len = Math.hypot(bx - ax, by - ay), nx = (by - ay) / len, ny = -(bx - ax) / len;
    const n = Math.max(2, Math.round(len / 10));
    for (let i = 0; i < n; i++) {
      const f = i / n, u = (acc + f * len) / per;
      const off = nz(u) * amp + vz(u) * amp * CONFIG.jitter.boil * 0.6;
      let x = lerp(ax, bx, f) + nx * off, y = lerp(ay, by, f) + ny * off;
      if (i === 0) { x += corner[s]; y += corner[(s + 1) % 4]; }
      pts.push([x, y]);
    }
    acc += len;
  }
  return polyD(pts, true);
}

function roughCircleD(r, amp, key, variant) {
  const nz = makeNoise(rngFor(key), 7);
  const vz = makeNoise(rngFor(key + '#' + variant), 9);
  const ctrl = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2, u = i / 12;
    const rr = r + nz(u) * amp + vz(u) * amp * CONFIG.jitter.boil * 0.6;
    ctrl.push([Math.cos(a) * rr, Math.sin(a) * rr]);
  }
  return polyD(catmull(ctrl, true, 4), true);
}

function inkD(pts, key, variant, offset, amp = CONFIG.jitter.ink) {
  const base = makeNoise(rngFor(key), 10);
  const vz = makeNoise(rngFor(key + '#' + variant), 16);
  const n = pts.length;
  return polyD(pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const nx = -(b[1] - a[1]) / len, ny = (b[0] - a[0]) / len;
    const u = i / (n - 1), taper = Math.sin(Math.PI * u) * 0.8 + 0.2;
    const off = (base(u * 0.97) * amp + vz(u * 0.97) * amp * CONFIG.jitter.boil) * taper + offset;
    return [p[0] + nx * off, p[1] + ny * off];
  }), false);
}

const boilers = [];
function boil(node, variants) {
  boilers.push({ node, variants, offset: boilers.length % CONFIG.boilVariants });
}
function applyBoil(index) {
  for (const b of boilers) b.node.setAttribute('d', b.variants[(index + b.offset) % b.variants.length]);
}
const variantsOf = fn => Array.from({ length: CONFIG.boilVariants }, (_, v) => fn(v));

function text(parent, str, x, y, o = {}) {
  const t = el('text', {
    x, y,
    'font-family': o.family || CONFIG.fonts.sans,
    'font-size': o.size || 15,
    'font-weight': o.weight || 400,
    fill: o.fill || C.ink,
    'text-anchor': o.anchor || 'start',
    'letter-spacing': o.ls || 0,
  }, parent);
  if (o.opacity != null) t.setAttribute('opacity', o.opacity);
  if (o.italic) t.setAttribute('font-style', 'italic');
  t.textContent = str;
  if (o.maxW) fitText(t, o.maxW, o.size || 15);
  return t;
}
function fitText(t, maxW, size) {
  const w = t.getComputedTextLength();
  if (w > maxW) t.setAttribute('font-size', (size * maxW / w).toFixed(2));
}

function roughShape(parent, w, h, key, attrs, amp = CONFIG.jitter.paperEdge) {
  const p = el('path', attrs, parent);
  boil(p, variantsOf(v => roughRectD(w, h, amp, key, v)));
  return p;
}

function makePaper(parent, o) {
  const g = el('g', { opacity: 0 }, parent);
  const rng = rngFor(o.key + ':rest');
  const actor = {
    g, cx: o.cx, cy: o.cy, w: o.w, h: o.h, cache: '',
    restRot: (rng() * 2 - 1) * (o.restRot ?? CONFIG.jitter.restRotation),
    dir: rng() < 0.5 ? -1 : 1,
    phase: rng() * Math.PI * 2,
  };
  if (o.deck) {
    for (let i = 2; i >= 1; i--) {
      roughShape(g, o.w, o.h, o.key + 'deck' + i, { fill: o.deckFill || o.fill, filter: 'url(#paperShadow)', transform: `translate(${i * 4} ${i * 4}) rotate(${i * 1.2})` });
    }
  }
  actor.shape = roughShape(g, o.w, o.h, o.key, { fill: o.fill, filter: 'url(#paperShadow)' });
  if (o.stroke) {
    actor.shape.setAttribute('stroke', o.stroke);
    actor.shape.setAttribute('stroke-width', o.strokeWidth || 1.3);
    if (o.dash) actor.shape.setAttribute('stroke-dasharray', o.dash);
  }
  actor.content = el('g', {}, g);
  return actor;
}

function setActor(a, s) {
  if (!s) s = { dx: 0, dy: 0, rot: a.restRot, scale: 1, op: 0 };
  const tr = `translate(${fmt(a.cx + s.dx)} ${fmt(a.cy + s.dy)}) rotate(${s.rot.toFixed(2)}) scale(${s.scale.toFixed(3)})`;
  const op = s.op.toFixed(2);
  const key = tr + op;
  if (key === a.cache) return;
  a.cache = key;
  a.g.setAttribute('transform', tr);
  a.g.setAttribute('opacity', op);
}

function setOpacity(node, op) {
  const v = clamp01(op).toFixed(2);
  if (node._op !== v) { node._op = v; node.setAttribute('opacity', v); }
}

function setTransform(node, tr) {
  if (node._tr !== tr) { node._tr = tr; node.setAttribute('transform', tr); }
}

function makeInk(parent, pts, o) {
  const g = el('g', { opacity: 0 }, parent);
  const common = { fill: 'none', stroke: o.color || C.ink, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 };
  const main = el('path', { ...common, 'stroke-width': o.width || 2.4 }, g);
  const hair = el('path', { ...common, 'stroke-width': (o.width || 2.4) * 0.45, opacity: 0.7 }, g);
  boil(main, variantsOf(v => inkD(pts, o.key, v, 0, o.amp)));
  boil(hair, variantsOf(v => inkD(pts, o.key + 'h', v, 0.9, o.amp)));
  let last = -1;
  return {
    g, pts,
    draw(p) {
      p = Math.round(clamp01(p) * 1000) / 1000;
      if (p === last) return;
      last = p;
      const off = (1 - p).toFixed(3);
      main.setAttribute('stroke-dashoffset', off);
      hair.setAttribute('stroke-dashoffset', off);
      g.setAttribute('opacity', p > 0 ? 1 : 0);
    },
  };
}

function makePaperDot(parent, key, fill, stroke, r = 8.5) {
  const g = el('g', { opacity: 0 }, parent);
  const dot = el('path', { fill, filter: 'url(#paperShadow)' }, g);
  if (stroke) { dot.setAttribute('stroke', stroke); dot.setAttribute('stroke-width', 1.3); }
  boil(dot, variantsOf(v => roughCircleD(r, 0.9, key, v)));
  const rng = rngFor(key + ':rest');
  return { g, cache: '', phase: rng() * Math.PI * 2 };
}

function setDot(a, x, y, op) {
  const tr = `translate(${fmt(x)} ${fmt(y)})`, key = tr + op.toFixed(2);
  if (a.cache === key) return;
  a.cache = key;
  a.g.setAttribute('transform', tr);
  a.g.setAttribute('opacity', op.toFixed(2));
}

function breath(a, ts) {
  return Math.sin((ts / 1000) * Math.PI * 2 * CONFIG.motion.breathHz + a.phase) * CONFIG.motion.breathDeg;
}

/* Papir som legges ned på bordet: litt over, litt rotert, overshoot ned på plass. */
function layIn(a, t, start, ts) {
  const p = progress(t, start, CONFIG.dur.lay);
  if (p <= 0) return null;
  const e = easeBack(p);
  return {
    dx: 0,
    dy: lerp(-CONFIG.motion.dropY, 0, e),
    rot: lerp(a.restRot + a.dir * CONFIG.motion.dropRot, a.restRot, e) + breath(a, ts),
    scale: lerp(1.07, 1, Math.min(e, 1)),
    op: clamp01(p * 3),
  };
}

function lassoPts(cx, cy, rx, ry, key, squircle = 2) {
  const sp = (v, e) => Math.sign(v) * Math.abs(v) ** (2 / e);
  const r = rngFor(key);
  const a0 = -2.5 + r() * 0.4, n = 44, pts = [];
  for (let i = 0; i <= n; i++) {
    const f = i / n, a = a0 + f * (Math.PI * 2 + 0.45);
    const k = 1 + (r() * 2 - 1) * 0.012 + f * 0.05;
    pts.push([cx + sp(Math.cos(a), squircle) * rx * k, cy + sp(Math.sin(a), squircle) * ry * k]);
  }
  return pts;
}

function checkPts(x, y, s = 1) {
  return catmull([[x - 7 * s, y - 1 * s], [x - 2 * s, y + 5 * s], [x + 9 * s, y - 9 * s]], false, 6);
}

function buildDefs(target, withDisplacement) {
  const defs = el('defs', {}, target);
  const shadow = el('filter', { id: 'paperShadow', x: '-20%', y: '-20%', width: '140%', height: '150%' }, defs);
  el('feDropShadow', { dx: 0, dy: 1, stdDeviation: 0.6, 'flood-color': '#000', 'flood-opacity': 0.08, result: 's1' }, shadow);
  el('feDropShadow', { in: 's1', dx: 0, dy: 3, stdDeviation: 3, 'flood-color': '#000', 'flood-opacity': 0.06 }, shadow);
  if (withDisplacement) {
    const cut = el('filter', { id: 'cutPaper', x: '-10%', y: '-20%', width: '120%', height: '150%' }, defs);
    el('feTurbulence', { type: 'fractalNoise', baseFrequency: 0.045, numOctaves: 2, seed: 7, result: 'noise' }, cut);
    el('feDisplacementMap', { in: 'SourceGraphic', in2: 'noise', scale: CONFIG.jitter.displacement, xChannelSelector: 'R', yChannelSelector: 'G', result: 'cut' }, cut);
    el('feDropShadow', { in: 'cut', dx: 0, dy: 1, stdDeviation: 0.6, 'flood-color': '#000', 'flood-opacity': 0.08, result: 's1' }, cut);
    el('feDropShadow', { in: 's1', dx: 0, dy: 3, stdDeviation: 3, 'flood-color': '#000', 'flood-opacity': 0.06 }, cut);
  }
}

function buildGrain() {
  const noise = `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'>
    <filter id='g'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' seed='4' stitchTiles='stitch'/>
      <feColorMatrix values='0 0 0 0 .12  0 0 0 0 .11  0 0 0 0 .1  1.6 0 0 0 -.45'/></filter>
    <filter id='f'><feTurbulence type='fractalNoise' baseFrequency='.006 .11' numOctaves='2' seed='9' stitchTiles='stitch'/>
      <feColorMatrix values='0 0 0 0 .2  0 0 0 0 .17  0 0 0 0 .13  2.4 0 0 0 -1.25'/></filter>
    <rect width='100%' height='100%' filter='url(#g)'/><rect width='100%' height='100%' filter='url(#f)'/></svg>`;
  const div = document.querySelector('.grain');
  div.style.backgroundImage = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(noise)}")`;
  div.style.opacity = CONFIG.grainOpacity;
}

/* Et kapittel samler elementene sine og en liste med oppdateringer som kjøres hver frame. */
function nyttKapittel(root, def) {
  const g = el('g', {}, root);
  const items = [];
  const k = {
    def, g, items, varighet: def.varighet,
    add(fn) { items.push(fn); },
    paper(o, parent = g) {
      const a = makePaper(parent, o);
      a.start = o.start ?? 0;
      items.push((t, ts, wall) => {
        let s = layIn(a, t, a.start, ts);
        if (s && a.extra) s = a.extra(s, t, ts, wall);
        setActor(a, s);
      });
      return a;
    },
    ink(pts, o, parent = g) {
      const i = makeInk(parent, pts, o);
      const start = o.start ?? 0, dur = o.dur ?? CONFIG.dur.draw;
      items.push(t => i.draw(ease(progress(t, start, dur))));
      return i;
    },
    fade(node, start, dur = 400) {
      node.setAttribute('opacity', 0);
      items.push(t => setOpacity(node, progress(t, start, dur)));
      return node;
    },
    text(str, x, y, o = {}, parent = g) {
      const t = text(parent, str, x, y, o);
      if (o.start != null) k.fade(t, o.start, o.dur);
      return t;
    },
    arrow(a, b, o) {
      const mid = [(a[0] + b[0]) / 2 + (o.bendX || 0), (a[1] + b[1]) / 2 + (o.bend || 0)];
      const pts = catmull([a, mid, b], false, 10);
      const dur = o.dur ?? 450;
      k.ink(pts, { ...o, dur }, o.parent || g);
      const end = pts[pts.length - 1], prev = pts[pts.length - 4];
      const ang = Math.atan2(end[1] - prev[1], end[0] - prev[0]);
      const hs = o.head || 9;
      [0.5, -0.5].forEach((s, i) => {
        const head = catmull([[end[0] - Math.cos(ang + s) * hs, end[1] - Math.sin(ang + s) * hs], end], false, 4);
        k.ink(head, { key: o.key + 'h' + i, start: o.start + dur - 60, dur: 160, width: (o.width || 2) * 0.9, color: o.color }, o.parent || g);
      });
    },
    stamp(str, x, y, rot, start, o = {}, parent = g) {
      const s = el('g', { opacity: 0 }, parent);
      const inner = el('g', {}, s);
      const color = o.color || C.terra;
      const w = o.w || Math.max(48, str.length * (o.size || 13) * 0.68 + 22), h = o.h || 24;
      roughShape(inner, w, h, 'stamp' + str + x + y, { fill: o.fill || 'none', stroke: color, 'stroke-width': o.strokeWidth || 1.7 }, 0.8);
      text(inner, str, 0, (o.size || 13) * 0.36, { family: o.family || CONFIG.fonts.mono, size: o.size || 13, weight: 700, anchor: 'middle', fill: o.textFill || color });
      const pos = `translate(${x} ${y}) rotate(${rot})`;
      items.push(t => {
        const p = progress(t, start, CONFIG.dur.stamp);
        setTransform(s, `${pos} scale(${lerp(1.6, 1, easeBack(p)).toFixed(3)})`);
        setOpacity(s, p * 3);
      });
      return s;
    },
    header(title, sub, x = 60) {
      const h = el('g', { opacity: 0 }, g);
      text(h, title, 0, 0, { family: CONFIG.fonts.serif, size: 42, fill: C.ink, maxW: 1460 });
      text(h, sub, 2, 36, { size: 17.5, fill: C.inkSoft, maxW: 1460 });
      items.push(t => {
        const e = easeBack(progress(t, 60, CONFIG.dur.header));
        setTransform(h, `translate(${x} ${fmt(130 + lerp(-14, 0, e))}) rotate(${lerp(-1.4, 0, e).toFixed(2)})`);
        setOpacity(h, progress(t, 60, CONFIG.dur.header) * 2);
      });
    },
    render(t, ts, wall) { for (const f of items) f(t, ts, wall); },
  };
  return k;
}

return {
  CONFIG, C, el, clamp01, lerp, quant, fmt, progress, rngFor, ease, easeBack, easeIn,
  catmull, arcPoints, samplePolyline, roughRectD, roughCircleD, boil, applyBoil, variantsOf,
  text, fitText, roughShape, makePaper, setActor, setOpacity, setTransform, makeInk, makePaperDot, setDot,
  breath, layIn, lassoPts, checkPts, buildDefs, buildGrain, nyttKapittel,
};
})();
