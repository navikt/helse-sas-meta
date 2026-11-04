window.Kapitler = window.Kapitler || [];
(() => {
'use strict';
const M = window.Motor, D = window.SKISSE_DATA;
const { C, CONFIG, el, text, progress, ease, easeBack, lerp, catmull, roughShape, roughCircleD, boil, variantsOf, setOpacity, setTransform, makePaperDot, setDot, arcPoints, samplePolyline, clamp01 } = M;
const FARGE = { sage: C.sage, terra: C.terra, sand: C.sand, ink: C.ink };
const dag = s => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
const dagerMellom = (a, b) => Math.round((dag(b) - dag(a)) / 864e5);

/* Felles: kapabilitetskort, brukt i kapittel 3 og 5. */
const STATUS = {
  prod: { tekst: 'i prod', farge: C.sageDark },
  'pågår': { tekst: 'pågår', farge: C.terra },
  spec: { tekst: 'spec', farge: C.inkSoft },
  spleis: { tekst: 'i Spleis', farge: C.inkSoft },
};
function lagKort(k, kap, cx, cy, w, h, start, stampStart) {
  const iSpleis = kap.status === 'spleis';
  const a = k.paper({ key: 'kort' + kap.id + k.def.id, cx, cy, w, h, fill: iSpleis ? C.paperDim : C.paper, start });
  text(a.content, kap.tjeneste.toUpperCase(), 0, -h / 2 + 19, { size: 9, anchor: 'middle', fill: iSpleis ? C.inkSoft : C.terraDark, ls: '0.1em', maxW: w - 16 });
  kap.navn.forEach((line, i) => {
    text(a.content, line, 0, 10 + (i - (kap.navn.length - 1) / 2) * 18, { size: 15.5, weight: 600, anchor: 'middle', maxW: w - 14 });
  });
  const st = STATUS[kap.status];
  k.stamp(st.tekst, cx + w / 2 - 22, cy - h / 2 - 2, (kap.id.length % 2 ? -6 : 5), stampStart, {
    color: st.farge, size: 11, family: CONFIG.fonts.sans, fill: C.paper, h: 20,
  });
  return a;
}
window.lagKapabilitetskort = lagKort;

/* ---------- Kapittel 1: ett spor om gangen ---------- */
window.Kapitler.push({
  id: 'spor',
  varighet: 8200,
  bygg(root) {
    const k = M.nyttKapittel(root, this);
    k.header('Før: én kategori om gangen', 'Hver kategori fikk sitt eget spor gjennom Spleis, Speil og Spesialist. Selvstendig næringsdrivende tok to forsøk.');
    const X0 = 430, X1 = 1530, Y0 = 2019, Y1 = 2027;
    const xFor = s => {
      const d = dag(s), y = +s.slice(0, 4);
      return X0 + (y - Y0 + (d - Date.UTC(y, 0, 1)) / (365.25 * 864e5)) / (Y1 - Y0) * (X1 - X0);
    };
    const AX = 236;
    k.ink(catmull([[X0 - 6, AX], [X1 + 6, AX]], false, 20), { key: 'akse', width: 1.8, start: 150, dur: 700 });
    for (let y = Y0; y <= Y1; y++) {
      const x = xFor(`${y}-01-01`);
      k.ink([[x, AX - 6], [x, AX + 6]], { key: 'tick' + y, width: 1.6, start: 300 + (y - Y0) * 50, dur: 120 });
      if (y < Y1) k.text(String(y), x + (xFor(`${y + 1}-01-01`) - x) / 2, AX - 10, { size: 13, anchor: 'middle', fill: C.inkSoft, start: 350 + (y - Y0) * 50 });
    }

    const LANE0 = 286, STEP = 74;
    D.spor.forEach((s, i) => {
      const cy = LANE0 + i * STEP, start = 700 + i * 700;
      const tag = k.paper({ key: 'tag' + s.id, cx: 225, cy, w: 330, h: 56, fill: C.paper, start, restRot: 1 });
      text(tag.content, s.navn, -150, -3, { size: 16, weight: 600, maxW: 300 });
      text(tag.content, s.under, -150, 17, { size: 12.5, fill: C.inkSoft, maxW: 300 });

      const x0 = xFor(s.fra), w = Math.max(8, xFor(s.til) - x0);
      const strip = el('g', { opacity: 0 }, k.g);
      const fill = s.farge === 'ink' ? C.sand : FARGE[s.farge];
      roughShape(strip, w, 20, 'strip' + s.id, { fill, filter: 'url(#paperShadow)', transform: `translate(${w / 2} 0)` }, 1);
      const growStart = start + 250, growDur = Math.min(1400, 300 + w * 1.4);
      k.add(t => {
        const p = ease(progress(t, growStart, growDur));
        setTransform(strip, `translate(${x0} ${cy}) scale(${Math.max(0.001, p).toFixed(3)} 1)`);
        setOpacity(strip, p > 0 ? 1 : 0);
      });

      (s.prikker || []).forEach((d, j) => {
        const dot = makePaperDot(k.g, 'prikk' + j, C.ink, null, 6.5);
        const x = xFor(d) + (j > 2 ? (j - 3) * 9 - 6 : 0), ds = growStart + 300 + j * 160;
        k.add(t => {
          const p = progress(t, ds, 450);
          setDot(dot, x, cy + lerp(-24, 0, easeBack(p)), clamp01(p * 3));
        });
      });

      s.merker.forEach((m, j) => {
        const x = xFor(m.dato), ms = growStart + growDur * 0.7 + j * 400;
        if (m.stempel) {
          let xs = Math.min(x, xFor(D.idag) - 70);
          if (xFor(s.til) > xs - 60) xs = xFor(s.til) + 62;
          if (xFor(s.til) < xs - 70) {
            const line = el('line', { x1: xFor(s.til) + 8, y1: cy, x2: xs - 50, y2: cy, stroke: C.inkSoft, 'stroke-width': 1.4, 'stroke-dasharray': '2 7', 'stroke-linecap': 'round' }, k.g);
            k.fade(line, ms, 500);
          }
          k.stamp(m.stempel, xs, cy, -4, ms + 350, { size: 12.5 });
          k.text(m.tekst, xs, cy + 30, { size: 12.5, anchor: 'middle', fill: C.inkSoft, start: ms + 550 });
        } else {
          const up = m.over ? -1 : 1;
          k.ink([[x, cy + up * 11], [x, cy + up * 24]], { key: 'merke' + s.id + j, width: 1.8, start: ms, dur: 200 });
          k.text(m.tekst, x, cy + up * 24 + (up > 0 ? 14 : -5), { size: 12.5, anchor: m.over ? 'end' : 'middle', fill: C.ink, start: ms + 150 });
        }
      });
      if (s.id === 'sn2') {
        const xp = xFor('2025-09-16');
        const star = makePaperDot(k.g, 'prodstjerne', C.terraDark, null, 6);
        k.add(t => setDot(star, xp, cy, clamp01(progress(t, growStart + growDur * 0.6, 300) * 3)));
      }
    });

    const xi = xFor(D.idag);
    k.ink(catmull([[xi, AX + 12], [xi + 1, 520], [xi, LANE0 + 6 * STEP + 24]], false, 14), { key: 'idag', width: 1.6, color: C.terra, start: 6000, dur: 800 });
    k.text('i dag', xi + 6, AX + 26, { size: 12.5, weight: 600, fill: C.terra, start: 6400 });
    k.text('Commits der emnet nevner kategorien, i spleis, speil og spesialist. Et grovt mål som undervurderer arbeidet. Kilde: git log, november 2026.',
      60, 836, { size: 13, fill: C.inkSoft, start: 6800, maxW: 1100 });
    return k;
  },
});

/* ---------- Kapittel 2: hvert spor gjennom alle appene ---------- */
window.Kapitler.push({
  id: 'apper',
  varighet: 8600,
  bygg(root) {
    const k = M.nyttKapittel(root, this);
    k.header('Hvert spor gikk gjennom hele stacken', 'En ny kategori betydde endringer i Spleis, Speil og Spesialist, og egne tilstander i tilstandsmaskinen.');
    const COLS = [
      { navn: 'Spleis', x: 450, w: 290 },
      { navn: 'Speil', x: 770, w: 180 },
      { navn: 'Spesialist', x: 980, w: 160 },
      { navn: 'Egne tilstander i Spleis', x: 1170, w: 360 },
    ];
    const HY = 246;
    COLS.forEach((c, i) => {
      k.text(c.navn.toUpperCase(), c.x, HY, { size: 12.5, weight: 600, ls: '0.14em', fill: C.inkSoft, start: 300 + i * 100 });
      k.ink(catmull([[c.x, HY + 10], [c.x + c.w - 20, HY + 11]], false, 8), { key: 'colline' + i, width: 1.4, color: C.inkSoft, start: 400 + i * 100, dur: 400 });
    });

    const ROW0 = 320, STEP = 118;
    D.sporIApper.forEach((r, i) => {
      const cy = ROW0 + i * STEP, start = 800 + i * 1000;
      const tag = k.paper({ key: 'rad' + i, cx: 225, cy, w: 330, h: 70, fill: C.paper, start, restRot: 1 });
      r.navn.forEach((line, j) => text(tag.content, line, -150, -4 + j * 20, { size: 16, weight: 600, maxW: 300 }));

      r.commits.forEach((n, ci) => {
        const col = COLS[ci], marks = Math.ceil(n / 5), top = cy - 28, bottom = cy + 4;
        for (let m = 0; m < marks; m++) {
          const group = Math.floor(m / 5), inGroup = m % 5, gx = col.x + 4 + group * 34;
          const pts = inGroup < 4
            ? catmull([[gx + inGroup * 6, top], [gx + inGroup * 6 + 0.6, (top + bottom) / 2], [gx + inGroup * 6 - 0.4, bottom]], false, 5)
            : catmull([[gx - 5, bottom - 4], [gx + 9, (top + bottom) / 2], [gx + 24, top + 4]], false, 5);
          k.ink(pts, { key: `tally${i}-${ci}-${m}`, width: 1.9, start: start + 300 + ci * 150 + m * 22, dur: 120 });
        }
        k.text(String(n), col.x, cy + 30, { family: CONFIG.fonts.serif, size: 20, start: start + 400 + ci * 150 });
      });

      const col = COLS[3];
      if (r.tilstander) {
        for (let j = 0; j < r.tilstander; j++) {
          const a = k.paper({ key: `tilst${i}-${j}`, cx: col.x + 12 + j * 22, cy: cy - 10, w: 18, h: 30, fill: i === 1 ? C.terra : C.sand, start: start + 500 + j * 45, restRot: 4 });
          a.content.remove();
        }
        k.text(String(r.tilstander), col.x, cy + 30, { family: CONFIG.fonts.serif, size: 20, start: start + 700 });
      } else {
        k.text('–', col.x, cy + 4, { family: CONFIG.fonts.serif, size: 22, fill: C.inkSoft, start: start + 500 });
      }
      if (i < D.sporIApper.length - 1) {
        k.ink(catmull([[60, cy + STEP / 2 + 4], [800, cy + STEP / 2 + 5], [1530, cy + STEP / 2 + 3]], false, 12), { key: 'rule' + i, width: 1, color: 'rgba(31,30,29,.22)', start: start + 200, dur: 700 });
      }
    });

    const S = 5200;
    const snY = ROW0 + STEP, col = COLS[3];
    k.ink(catmull([[col.x - 6, snY - 30], [col.x + 160, snY - 4], [col.x + 334, snY + 12]], false, 10), { key: 'strek1', color: C.terra, width: 3, start: S, dur: 500 });
    k.ink(catmull([[col.x - 6, snY + 10], [col.x + 160, snY - 10], [col.x + 334, snY - 32]], false, 10), { key: 'strek2', color: C.terra, width: 3, start: S + 400, dur: 500 });
    const alY = ROW0 + 3 * STEP;
    k.ink(catmull([[col.x - 6, alY - 28], [col.x + 70, alY - 8], [col.x + 136, alY + 8]], false, 10), { key: 'strek3', color: C.terra, width: 3, start: S + 700, dur: 400 });
    const note = k.paper({ key: 'notat46', cx: 1350, cy: 802, w: 360, h: 74, fill: C.paper, start: S + 1100, restRot: 1.4 });
    text(note.content, '19.–20. oktober 2026: 46 → 25 tilstander', -164, -6, { size: 15, weight: 600, maxW: 330 });
    text(note.content, 'Selvstendig ble generisk. Frilans og arbeidsledig forkastes.', -164, 16, { size: 12.5, fill: C.inkSoft, maxW: 330 });
    k.text('1 strek = 5 commits der emnet nevner kategorien. Kilde: git log.', 60, 836, { size: 13, fill: C.inkSoft, start: S + 1400 });
    return k;
  },
});

/* ---------- Kapittel 3: kapabiliteter i stedet for spor ---------- */
window.Kapitler.push({
  id: 'kapabiliteter',
  varighet: 10200,
  bygg(root) {
    const k = M.nyttKapittel(root, this);
    k.header('Skiftet: kapabiliteter i stedet for spor', 'Hver regel fra kapittel 8 får sin egen kapabilitet. Kategorien er et svar fra sp-rettighetskategori, ikke et eget spor.');
    const W = 156, H = 96, X = i => 400 + i * 176, ROWY = [306, 486];
    const rader = [D.kapabiliteter.filter(c => c.rad === 0), D.kapabiliteter.filter(c => c.rad === 1)];
    const seats = [];
    rader.forEach((rad, r) => {
      k.text(r ? 'PER PERIODE OG DAG' : 'PER SYKEFRAVÆRS-', 60, ROWY[r] - 6, { size: 12, weight: 600, ls: '0.14em', fill: C.inkSoft, start: 300 + r * 600 });
      if (!r) k.text('TILFELLE', 60, ROWY[r] + 12, { size: 12, weight: 600, ls: '0.14em', fill: C.inkSoft, start: 300 });
      rad.forEach((kap, i) => {
        const start = 300 + (r * 7 + i) * 90;
        lagKort(k, kap, X(i), ROWY[r], W, H, start, 6900 + (r * 7 + i) * 70);
        seats.push([X(i), ROWY[r] - H / 2 - 4]);
        if (i < rad.length - 1) {
          k.arrow([X(i) + W / 2 + 3, ROWY[r] + 8], [X(i + 1) - W / 2 - 3, ROWY[r] + 8], { key: `pil${r}-${i}`, width: 1.6, start: 1700 + (r * 7 + i) * 60, dur: 220, head: 6 });
        }
      });
    });

    const FLOW = 2700;
    const tokens = [
      { key: 'AT', fill: C.sage, side: -1, lift: 22, delay: 0, label: 'arbeidstaker' },
      { key: 'SN', fill: C.terra, side: 0, lift: 32, delay: 160, label: 'selvstendig' },
      { key: 'NY', fill: C.paper, stroke: C.ink, side: 1, lift: 42, delay: 320, label: 'neste kategori' },
    ];
    const trails = el('g', {}, k.g);
    tokens.forEach(tk => {
      const seat = i => [seats[i][0] + tk.side * 16, seats[i][1]];
      const hops = [];
      for (let i = 0; i < seats.length - 1; i++) {
        const a = seat(i), b = seat(i + 1);
        let pts;
        if (i === 6) {
          const gapY = (ROWY[0] + H / 2 + ROWY[1] - H / 2) / 2 + tk.side * 6 - 8;
          pts = catmull([a, [a[0] + 70, a[1] + 10], [a[0] + 60, gapY], [X(3), gapY + 4], [b[0] - 60, gapY], [b[0] - 30, b[1] - 18], b], false, 8);
        } else {
          pts = arcPoints(a, b, tk.lift);
        }
        const hs = FLOW + tk.delay + i * (CONFIG.dur.hop + CONFIG.dur.hopPause) + (i >= 6 ? 400 : 0);
        hops.push({ pts, start: hs, dur: i === 6 ? 700 : CONFIG.dur.hop, ink: M.makeInk(trails, pts, { key: 'hop' + tk.key + i, color: tk.key === 'NY' ? C.ink : tk.fill, width: 1.8 }) });
      }
      const dot = makePaperDot(k.g, 'tok' + tk.key, tk.fill, tk.stroke, 9);
      k.add((t, ts) => {
        const drop = progress(t, FLOW - 500 + tk.delay, 500);
        let [x, y] = seat(0), moving = false;
        for (const h of hops) {
          const p = progress(t, h.start, h.dur);
          h.ink.draw(ease(p));
          if (p >= 1) h.ink.g.setAttribute('opacity', (0.15 + 0.85 * (1 - progress(t, h.start + h.dur + 150, 500))).toFixed(2));
          if (p > 0) { [x, y] = samplePolyline(h.pts, ease(p)); moving = moving || p < 1; }
        }
        const bob = moving ? 0 : Math.sin(ts / 1000 * 3.2 + dot.phase) * CONFIG.motion.bobPx;
        setDot(dot, x, y + lerp(-30, 0, easeBack(drop)) + bob, clamp01(drop * 3));
      });
    });

    const lx = 60, ly = 640;
    const leg = k.paper({ key: 'legende', cx: lx + 130, cy: ly + 64, w: 260, h: 128, fill: C.paper, start: 2400, restRot: 1 });
    tokens.forEach((tk, i) => {
      const y = -34 + i * 26;
      const d = el('path', { d: roughCircleD(7, 0.8, 'leg' + i, 0), fill: tk.fill, transform: `translate(-100 ${y - 5})` }, leg.content);
      if (tk.stroke) { d.setAttribute('stroke', tk.stroke); d.setAttribute('stroke-width', 1.2); }
      text(leg.content, tk.label, -82, y, { size: 14.5 });
    });
    text(leg.content, 'samme vei gjennom alle', -112, 48, { size: 12.5, fill: C.inkSoft });

    const band = k.paper({ key: 'spleisband', cx: 400 - W / 2 + (6 * 176 + W) / 2, cy: 680, w: 6 * 176 + W, h: 70, fill: C.sand, start: 7700, restRot: 0.4 });
    text(band.content, 'SPLEIS', -(6 * 176 + W) / 2 + 24, -6, { size: 13, weight: 700, ls: '0.16em' });
    text(band.content, 'felles tilstander for alle kategorier · spør kapabilitetene med behov · lagrer bare ID-en til svaret', -(6 * 176 + W) / 2 + 24, 16, { size: 14.5, maxW: 6 * 176 + W - 50 });

    k.text('Kort merket «i Spleis» er regler som ennå ikke er trukket ut. De er neste kandidater.', 400 - W / 2, 760, { size: 14, fill: C.inkSoft, start: 8400 });
    k.text('Kilde: docs/abstraksjoner-kap8.md, docs/rekkefolge-kap8.md, ADR 0001 og 0008.', 400 - W / 2, 836, { size: 13, fill: C.inkSoft, start: 8600 });
    return k;
  },
});

/* ---------- Kapittel 4: farten ---------- */
window.Kapitler.push({
  id: 'fart',
  varighet: 9200,
  bygg(root) {
    const k = M.nyttKapittel(root, this);
    k.header('Farten: fra måneder til dager', 'Dager fra første commit til første versjon i prod. Selvstendig som eget spor, mot kapabilitetene i 2026.');
    const BX = 420, PX = 7, ROW0 = 262, STEP = 82;
    const axisY = ROW0 + D.fart.length * STEP - 22;
    k.ink(catmull([[BX, axisY], [BX + 150 * PX, axisY + 1]], false, 16), { key: 'fartakse', width: 1.6, start: 200, dur: 700 });
    for (let d = 0; d <= 150; d += 30) {
      const x = BX + d * PX;
      k.ink([[x, axisY - 5], [x, axisY + 5]], { key: 'ft' + d, width: 1.4, start: 400 + d * 3, dur: 120 });
      k.text(d + (d === 150 ? ' dager' : ''), x, axisY + 22, { size: 12.5, anchor: 'middle', fill: C.inkSoft, start: 450 + d * 3 });
    }
    let start = 800;
    D.fart.forEach((f, i) => {
      const cy = ROW0 + i * STEP, dager = dagerMellom(f.fra, f.til);
      const tag = k.paper({ key: 'fart' + i, cx: 225, cy, w: 330, h: 56, fill: f.gammel ? C.paperDim : C.paper, start, restRot: 1 });
      text(tag.content, f.navn, -150, -3, { size: 16, weight: 600, maxW: 300, family: f.gammel ? CONFIG.fonts.sans : CONFIG.fonts.mono });
      text(tag.content, f.under, -150, 17, { size: 12.5, fill: C.inkSoft, maxW: 300 });

      const w = Math.max(6, dager * PX), fill = f.gammel ? C.terra : C.sage;
      const bar = el('g', { opacity: 0 }, k.g);
      roughShape(bar, w, 18, 'fartbar' + i, { fill, filter: 'url(#paperShadow)', transform: `translate(${w / 2} 0)` }, 0.9);
      const gs = start + 300, gd = Math.max(350, Math.min(2200, dager * 15));
      const tall = text(k.g, '', 0, cy + 9, { family: CONFIG.fonts.serif, size: 28, fill: f.gammel ? C.terraDark : C.ink });
      const notat = text(k.g, f.notat, 0, cy + 28, { size: 12.5, fill: C.inkSoft });
      tall.setAttribute('opacity', 0); notat.setAttribute('opacity', 0);
      k.add(t => {
        const p = ease(progress(t, gs, gd));
        setTransform(bar, `translate(${BX} ${cy}) scale(${Math.max(0.001, p).toFixed(3)} 1)`);
        setOpacity(bar, p > 0 ? 1 : 0);
        const n = Math.round(dager * p);
        const s = dager === 0 ? 'samme dag' : `${n} ${n === 1 ? 'dag' : 'dager'}`;
        if (tall.textContent !== s) tall.textContent = s;
        const x = BX + w * p + 16;
        tall.setAttribute('x', x.toFixed(1)); notat.setAttribute('x', (x + 2).toFixed(1));
        setOpacity(tall, progress(t, gs, 200));
        setOpacity(notat, progress(t, gs + gd, 300));
      });
      start = gs + gd + 250;
    });

    const S = start + 200;
    const slip = k.paper({ key: 'hvorfor', cx: 1240, cy: 560, w: 560, h: 200, fill: C.paper, start: S, restRot: 1.2 });
    text(slip.content, 'HVORFOR DET GÅR RASKERE', -256, -66, { size: 12, weight: 600, ls: '0.14em', fill: C.inkSoft });
    [
      'Samme mønster hver gang: behov, svar og en ID i Spleis.',
      'Nye tjenester starter som kopi. sp-medlemskap er en kopi',
      'av sp-vilkarsproving.',
      'Spleis får én ny tilstand, ikke et nytt spor gjennom alt.',
      'Spec og tickets først, så små, vertikale leveranser.',
    ].forEach((line, i) => {
      if (i !== 2) text(slip.content, '—', -256, -36 + i * 26, { size: 15, fill: C.terra });
      text(slip.content, line, -234, -36 + i * 26, { size: 15, maxW: 490 });
    });
    k.text('Målt til første versjon i prod, ikke til ferdig funksjonalitet. Selvstendig hadde i tillegg et forsøk i 2023. Kilde: git log.',
      60, 836, { size: 13, fill: C.inkSoft, start: S + 400, maxW: 1100 });
    this.varighet = S + 1400;
    k.varighet = this.varighet;
    return k;
  },
});
})();
