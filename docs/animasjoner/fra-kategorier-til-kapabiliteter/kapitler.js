window.Kapitler = window.Kapitler || [];
(() => {
'use strict';
const M = window.Motor, D = window.SKISSE_DATA;
const { C, CONFIG, el, text, progress, ease, easeBack, lerp, catmull, roughShape, roughCircleD, boil, variantsOf, setOpacity, setTransform, makePaperDot, setDot, arcPoints, samplePolyline, clamp01 } = M;
const FARGE = { sage: C.sage, terra: C.terra, sand: C.sand, ink: C.ink };
const dag = s => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
const dagerMellom = (a, b) => Math.round((dag(b) - dag(a)) / 864e5);

/* Felles: kapabilitetskort, brukt i kapittel 4 og 7. */
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

/* ---------- Kapittel 2: andre store løft ---------- */
window.Kapitler.push({
  id: 'loft',
  varighet: 8200,
  bygg(root) {
    const k = M.nyttKapittel(root, this);
    k.header('Andre store løft tok også lang tid', 'Revurdering, skjønnsfastsettelse og tilkommen inntekt krevde endringer i Spleis, Speil og Spesialist på samme tid. Søylene viser commits per måned.');
    const X0 = 430, X1 = 1190, Y0 = 2021, Y1 = 2027;
    const xFor = s => {
      const d = dag(s), y = +s.slice(0, 4);
      return X0 + (y - Y0 + (d - Date.UTC(y, 0, 1)) / (365.25 * 864e5)) / (Y1 - Y0) * (X1 - X0);
    };
    const AX = 236;
    k.ink(catmull([[X0 - 6, AX], [X1 + 6, AX]], false, 16), { key: 'akse', width: 1.8, start: 150, dur: 600 });
    for (let y = Y0; y <= Y1; y++) {
      const x = xFor(`${y}-01-01`);
      k.ink([[x, AX - 6], [x, AX + 6]], { key: 'tick' + y, width: 1.6, start: 300 + (y - Y0) * 50, dur: 120 });
      if (y < Y1) k.text(String(y), x + (xFor(`${y + 1}-01-01`) - x) / 2, AX - 10, { size: 13, anchor: 'middle', fill: C.inkSoft, start: 350 + (y - Y0) * 50 });
    }
    const KOL = [1240, 1330, 1420];
    D.apper.forEach((navn, i) => {
      k.text(navn.toUpperCase(), KOL[i], AX - 10, { size: 12.5, weight: 600, ls: '0.14em', fill: C.inkSoft, start: 400 + i * 100 });
    });

    const LANE0 = 300, STEP = 88;
    D.storeLoft.forEach((r, i) => {
      const cy = LANE0 + i * STEP, start = 700 + i * 650, yb = cy + 16;
      const tag = k.paper({ key: 'loft' + r.id, cx: 225, cy, w: 330, h: 60, fill: C.paper, start, restRot: 1 });
      text(tag.content, r.navn, -150, -3, { size: 16, weight: 600, maxW: 300 });
      text(tag.content, r.under, -150, 18, { size: 12.5, fill: C.inkSoft, maxW: 300 });

      const x0 = xFor(r.fra), xp = xFor(r.prod), w = Math.max(8, xp - x0);
      const strip = el('g', { opacity: 0 }, k.g);
      roughShape(strip, w, 12, 'loftstrip' + r.id, { fill: C.sand, transform: `translate(${w / 2} 0)` }, 0.8);
      const growStart = start + 250, growDur = Math.min(1100, 250 + w * 2);
      k.add(t => {
        const p = ease(progress(t, growStart, growDur));
        setTransform(strip, `translate(${x0} ${yb}) scale(${Math.max(0.001, p).toFixed(3)} 1)`);
        setOpacity(strip, p > 0 ? 1 : 0);
      });

      const rng = M.rngFor('soyler' + r.id);
      let d = '';
      for (const [mnd, n] of Object.entries(r.mnd)) {
        const xm = xFor(`${mnd}-15`), h = Math.min(40, 3 + Math.sqrt(n) * 4.2), bw = 6.2;
        const j = () => (rng() - 0.5) * 1.2;
        d += `M${(xm - bw / 2 + j()).toFixed(1)} ${(yb - 4).toFixed(1)}L${(xm - bw / 2 + j()).toFixed(1)} ${(yb - 4 - h + j()).toFixed(1)}L${(xm + bw / 2 + j()).toFixed(1)} ${(yb - 4 - h + j()).toFixed(1)}L${(xm + bw / 2 + j()).toFixed(1)} ${(yb - 4).toFixed(1)}Z`;
      }
      const klippId = 'klipp-loft-' + r.id;
      const clip = el('clipPath', { id: klippId }, k.g);
      const klippRekt = el('rect', { x: X0 - 10, y: yb - 60, width: 0, height: 70 }, clip);
      el('path', { d, fill: C.ink, opacity: 0.72, 'clip-path': `url(#${klippId})` }, k.g);
      const soyleStart = growStart + 200;
      k.add(t => klippRekt.setAttribute('width', ((X1 - X0 + 20) * ease(progress(t, soyleStart, 1500))).toFixed(1)));

      const mndTilProd = Math.max(1, Math.round(dagerMellom(r.fra, r.prod) / 30.44));
      const ms = growStart + growDur;
      k.ink([[xp, yb - 2], [xp, yb + 14]], { key: 'prod' + r.id, width: 2.2, color: C.terra, start: ms, dur: 180 });
      const venstre = xp - 175 > X0;
      k.text(`${r.prodTekst} etter ${mndTilProd} mnd`, venstre ? xp - 4 : xp + 6, yb + 30, { size: 12.5, weight: 600, anchor: venstre ? 'end' : 'start', fill: C.terraDark, start: ms + 120 });
      (r.merker || []).forEach((m, j) => {
        const xm = xFor(m.dato);
        k.ink([[xm, yb + 2], [xm, yb + 14]], { key: 'loftmerke' + r.id + j, width: 1.6, start: ms + 300 + j * 250, dur: 160 });
        k.text(m.tekst, xm, yb + 30, { size: 12.5, anchor: 'middle', fill: C.ink, start: ms + 400 + j * 250 });
      });

      r.commits.forEach((n, ci) => {
        k.text(String(n), KOL[ci], cy + 8, { family: CONFIG.fonts.serif, size: 20, start: start + 500 + ci * 120 });
      });
    });

    const S = 700 + D.storeLoft.length * 650 + 1600;
    const note = k.paper({ key: 'loftnotat', cx: 1340, cy: 802, w: 380, h: 74, fill: C.paper, start: S, restRot: -1.2 });
    text(note.content, 'Samme mønster hver gang', -174, -6, { size: 15, weight: 600, maxW: 350 });
    text(note.content, 'Tre apper i takt, måneder til prod og en lang hale etterpå.', -174, 16, { size: 12.5, fill: C.inkSoft, maxW: 350 });
    k.text('Commits der emnet nevner funksjonen. Tallene til høyre gjelder fra første commit. «I prod» er første gang funksjonen ble skrudd på i prod. Kilde: git log.',
      60, 836, { size: 13, fill: C.inkSoft, start: S + 300, maxW: 1000 });
    return k;
  },
});

/* ---------- Kapittel 3: hvert spor gjennom alle appene ---------- */
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
    text(note.content, '19.–20. oktober 2026: 41 → 23 tilstander', -164, -6, { size: 15, weight: 600, maxW: 330 });
    text(note.content, 'Selvstendig ble generisk. Frilans og arbeidsledig forkastes.', -164, 16, { size: 12.5, fill: C.inkSoft, maxW: 330 });
    k.text('1 strek = 5 commits der emnet nevner kategorien. Kilde: git log.', 60, 836, { size: 13, fill: C.inkSoft, start: S + 1400 });
    return k;
  },
});

/* ---------- Kapittel 4: kapabiliteter i stedet for spor ---------- */
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

/* ---------- Kapittel 5: farten ---------- */
window.Kapitler.push({
  id: 'fart',
  varighet: 9200,
  bygg(root) {
    const k = M.nyttKapittel(root, this);
    k.header('Farten: fra måneder til dager', 'Dager fra første commit til første versjon i prod. Selvstendig som eget spor, mot kapabilitetene i 2026.');
    const BX = 420, MAKS = 360, PX = 1050 / MAKS, ROW0 = 262, STEP = 82;
    const axisY = ROW0 + D.fart.length * STEP - 22;
    k.ink(catmull([[BX, axisY], [BX + MAKS * PX, axisY + 1]], false, 16), { key: 'fartakse', width: 1.6, start: 200, dur: 700 });
    for (let d = 0; d <= MAKS; d += 60) {
      const x = BX + d * PX;
      k.ink([[x, axisY - 5], [x, axisY + 5]], { key: 'ft' + d, width: 1.4, start: 400 + d * 1.5, dur: 120 });
      k.text(d + (d === MAKS ? ' dager' : ''), x, axisY + 22, { size: 12.5, anchor: 'middle', fill: C.inkSoft, start: 450 + d * 1.5 });
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
    k.text('Målt til første versjon i prod, ikke til ferdig funksjonalitet. Selvstendig hadde i tillegg et forsøk i 2023. Forsikring for selvstendige startet i Spleis i oktober 2025. sp-forsikring er bare den siste delen av det arbeidet. Kilde: git log.',
      60, 836, { size: 13, fill: C.inkSoft, start: S + 400, maxW: 1100 });
    this.varighet = S + 1400;
    k.varighet = this.varighet;
    return k;
  },
});

/* ---------- Kapittel 6: leveransetakten ---------- */
window.Kapitler.push({
  id: 'team',
  varighet: 9000,
  bygg(root) {
    const k = M.nyttKapittel(root, this);
    k.header('Takten før, under og etter delingen', 'Ett team til høsten 2020, så tigerteam. Høsten 2022 ble vi delt i Speilvendt og Spleiselaget, og i april 2026 ble vi ett team igjen. Vi skrev minst like mye kode mens vi var delt. Det som har endret seg mest, er tiden fra vi begynner på noe til det er på i prod.');
    const Q = D.takt, X0 = 170, X1 = 1540, YT = 276, YB = 404, MAKS = 260;
    const xMnd = m => X0 + m * (X1 - X0) / 84;
    const xDato = s => xMnd((+s.slice(0, 4) - 2020) * 12 + (+s.slice(5, 7) - 1) + (+s.slice(8, 10) - 1) / 30.5);
    const xKv = q => xMnd((+q.slice(0, 4) - 2020) * 12 + (+q.slice(5) - 1) * 3);
    const yAt = v => YB - v / MAKS * (YB - YT);
    const farge = p => p.farge === 'sage' ? C.sageDark : C.terraDark;
    const G0 = 482, GS = 30;

    D.teamperioder.forEach((p, i) => {
      const a = xKv(p.fra), b = xKv(p.til) + (X1 - X0) / 28, w = b - a;
      const band = el('g', { opacity: 0 }, k.g);
      roughShape(band, w - 6, G0 + 3 * GS + 30 - (YT - 40), 'teamband' + p.id, { fill: p.farge === 'sage' ? C.sage : C.terra, opacity: p.farge === 'sage' ? 0.16 : 0.1, transform: `translate(${a + w / 2} ${(YT - 40 + G0 + 3 * GS + 30) / 2})` }, 1);
      k.fade(band, 300 + i * 200, 500);
      k.text(p.navn.toUpperCase(), a + 12, YT - 20, { size: 12, weight: 600, ls: '0.12em', fill: farge(p), start: 400 + i * 200, maxW: w - 20 });
    });

    k.ink(catmull([[X0 - 20, YB + 2], [X1 + 20, YB + 3]], false, 16), { key: 'taktakse', width: 1.6, start: 200, dur: 600 });
    [0, 100, 200].forEach((v, i) => {
      k.text(String(v), X0 - 30, yAt(v) + 4, { size: 12.5, anchor: 'end', fill: C.inkSoft, start: 500 + i * 80 });
      if (v > 0) {
        const l = el('line', { x1: X0 - 22, y1: yAt(v), x2: X1 + 20, y2: yAt(v), stroke: 'rgba(31,30,29,.14)', 'stroke-width': 1, 'stroke-dasharray': '2 6' }, k.g);
        k.fade(l, 500 + i * 80, 400);
      }
    });
    k.text('commits', X0 - 30, YT - 14, { size: 12, anchor: 'end', fill: C.inkSoft, start: 600 });
    k.text('i uka', X0 - 30, YT, { size: 12, anchor: 'end', fill: C.inkSoft, start: 600 });
    for (let y = 2020; y <= 2026; y++) k.text(String(y), xMnd((y - 2020) * 12) + 4, YB + 22, { size: 12.5, fill: C.inkSoft, start: 600 + (y - 2020) * 40 });

    const rng = M.rngFor('taktsoyler');
    const j = () => (rng() - 0.5) * 1.4;
    const rekt = (x0, x1, y0, y1) => `M${(x0 + j()).toFixed(1)} ${(y0 + j()).toFixed(1)}L${(x0 + j()).toFixed(1)} ${(y1 + j()).toFixed(1)}L${(x1 + j()).toFixed(1)} ${(y1 + j()).toFixed(1)}L${(x1 + j()).toFixed(1)} ${(y0 + j()).toFixed(1)}Z`;
    let dK = '', dA = '';
    const bw = (X1 - X0) / 28;
    Q.forEach(([q, kj, an]) => {
      const x0 = xKv(q) + 5, x1 = xKv(q) + bw - 5;
      dK += rekt(x0, x1, YB - 1, yAt(kj));
      dA += rekt(x0, x1, yAt(kj) - 1.5, yAt(kj + an));
    });
    const klipp = el('clipPath', { id: 'klipp-takt' }, k.g);
    const klippRekt = el('rect', { x: X0 - 10, y: YT - 60, width: 0, height: YB - YT + 70 }, klipp);
    el('path', { d: dK, fill: C.ink, opacity: 0.72, 'clip-path': 'url(#klipp-takt)' }, k.g);
    el('path', { d: dA, fill: C.sand, stroke: 'rgba(31,30,29,.35)', 'stroke-width': 1, 'clip-path': 'url(#klipp-takt)' }, k.g);
    const BS = 1200, BD = 2400;
    k.add(t => klippRekt.setAttribute('width', ((X1 - X0 + 20) * ease(progress(t, BS, BD))).toFixed(1)));

    const LX = X1 + 20;
    const legende = el('g', { opacity: 0 }, k.g);
    el('rect', { x: LX - 300, y: YT - 64, width: 12, height: 12, fill: C.ink, opacity: 0.72 }, legende);
    text(legende, 'Spleis, Speil og Spesialist', LX - 282, YT - 53, { size: 12.5, fill: C.inkSoft });
    el('rect', { x: LX - 110, y: YT - 64, width: 12, height: 12, fill: C.sand, stroke: 'rgba(31,30,29,.35)' }, legende);
    text(legende, 'andre apper', LX - 92, YT - 53, { size: 12.5, fill: C.inkSoft });
    k.fade(legende, BS, 400);

    const SS = BS + BD + 100;
    D.teamperioder.forEach((p, i) => {
      const a = xKv(p.fra), b = xKv(p.til) + bw, y = yAt(p.commitsUke);
      k.ink(catmull([[a + 8, y], [b - 8, y + 1]], false, 8), { key: 'taktsnitt' + p.id, width: 2.4, color: farge(p), start: SS + i * 300, dur: 400 });
      const kort = p.id === 'igjen';
      const etikett = k.text(`snitt ${p.commitsUke} i uka`, kort ? b - 10 : a + 12, y - 8, { size: 13, weight: 600, anchor: kort ? 'end' : 'start', fill: farge(p), start: SS + i * 300 + 300 });
      Object.entries({ stroke: C.paper, 'stroke-width': 5, 'stroke-linejoin': 'round', 'paint-order': 'stroke' }).forEach(([n, v]) => etikett.setAttribute(n, v));
    });

    const LS = SS + 1100;
    k.text('STORE LØFT, FRA FØRSTE COMMIT TIL PÅ I PROD', X0 + 12, G0 - 36, { size: 11.5, weight: 600, ls: '0.12em', fill: C.inkSoft, start: LS - 200 });
    const varighet = (a, b) => {
      const d = dagerMellom(a, b);
      if (d < 21) return `${d} dager`;
      if (d < 90) return `${Math.round(d / 7)} uker`;
      return `${Math.round(d / 30.44)} mnd`;
    };
    D.ledetid.forEach((r, i) => {
      const y = G0 + r.bane * GS, start = LS + i * 220;
      const deler = r.deler || [[r.fra, r.prod]];
      deler.forEach(([fra, til], di) => {
        const x0 = xDato(fra), w = Math.max(5, xDato(til) - x0);
        const strip = el('g', { opacity: 0 }, k.g);
        roughShape(strip, w, 9, 'ledetid' + i + '-' + di, { fill: C.sand, stroke: 'rgba(31,30,29,.4)', 'stroke-width': 1, transform: `translate(${w / 2} 0)` }, 0.6);
        const gs = start + di * 60, gd = Math.min(900, 200 + w * 2);
        k.add(t => {
          const p = ease(progress(t, gs, gd));
          setTransform(strip, `translate(${x0 + (r.deler ? di * 7 : 0)} ${y}) scale(${Math.max(0.001, p).toFixed(3)} 1)`);
          setOpacity(strip, p > 0 ? 1 : 0);
        });
        if (!r.deler) k.ink([[x0 + w, y - 6], [x0 + w, y + 6]], { key: 'ledeprod' + i, width: 2, color: C.terra, start: gs + gd, dur: 150 });
      });
      const ny = r.fra >= '2026-04-01';
      const tx = ny ? xKv('2026-2') + 10 : xDato(r.fra);
      k.text(r.tekst || `${r.navn} · ${varighet(r.fra, r.prod)}`, tx, y - 9, { size: 12, weight: ny ? 600 : 400, fill: ny ? C.sageDark : C.ink, start: start + 300 });
    });

    const KS = LS + D.ledetid.length * 220 + 900, CW = 352, CY = 692;
    D.teamperioder.forEach((p, i) => {
      const cx = 60 + CW / 2 + i * (CW + 24);
      const kort = k.paper({ key: 'teamkort' + p.id, cx, cy: CY, w: CW, h: 184, fill: p.id === 'to' ? C.paperDim : C.paper, start: KS + i * 450, restRot: 1 });
      const L = -CW / 2 + 24, c = kort.content;
      text(c, p.navn.toUpperCase(), L, -64, { size: 12, weight: 600, ls: '0.12em', fill: farge(p), maxW: CW - 48 });
      text(c, p.tid, L, -45, { size: 12.5, fill: C.inkSoft });
      text(c, p.sammeDag, L, -2, { family: CONFIG.fonts.serif, size: 38, fill: farge(p) });
      text(c, 'dager i uka der noen committet i både backend og frontend', L, 22, { size: 12.5, fill: C.inkSoft, maxW: CW - 48 });
      text(c, `${p.commitsUke} commits i uka`, L, 48, { size: 14, maxW: CW - 48 });
      text(c, p.poeng, L, 72, { size: 14, weight: 600, maxW: CW - 48 });
    });
    k.text('Commits fra repoer med team-sas eller tbd i CODEOWNERS, uten bots og merges. Backend er Spleis og Spenn, frontend er Speil og Spesialist. Flere arbeidsgivere er målt til første utvalgte arbeidsgivere i prod. 2026 K4 gjelder bare oktober og starten av november. Kilde: git log.',
      60, 836, { size: 13, fill: C.inkSoft, start: KS + 1600, maxW: 1480 });
    this.varighet = KS + 2600;
    k.varighet = this.varighet;
    return k;
  },
});
})();
