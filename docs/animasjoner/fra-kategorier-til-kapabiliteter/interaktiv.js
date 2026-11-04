window.Kapitler = window.Kapitler || [];
(() => {
'use strict';
const M = window.Motor, D = window.SKISSE_DATA;
const { C, CONFIG, el, text, progress, ease, setOpacity, lassoPts, checkPts, roughShape } = M;

/* ---------- Kapittel 6: hvor treffer neste kategori? ---------- */
window.Kapitler.push({
  id: 'interaktiv',
  varighet: 3200,
  interaktiv: true,
  bygg(root, opts) {
    const k = M.nyttKapittel(root, this);
    k.header('Hvor treffer neste kategori?', 'Huk av en kategori. Kapabilitetene som trenger en ny regel eller ny data, blir ringet inn. Resten gjenbrukes uendret.');
    const valgt = new Set();
    let endret = -1e9, brukerHarValgt = false;
    const naa = () => k.wall ?? 0;

    /* Kortene */
    const W = 150, H = 92, X = i => 410 + i * 174, ROWY = [282, 510];
    const kort = [];
    [0, 1].forEach(r => {
      D.kapabiliteter.filter(c => c.rad === r).forEach((kap, i) => {
        const cx = X(i), cy = ROWY[r];
        const a = window.lagKapabilitetskort(k, kap, cx, cy, W, H, 250 + (r * 7 + i) * 60, 900 + (r * 7 + i) * 50);
        const c = { kap, a, cx, cy, berort: false, lassoFra: null, hakeFra: null };
        c.lasso = M.makeInk(k.g, lassoPts(cx, cy, W / 2 + 9, H / 2 + 8, 'lasso' + kap.id, 5), { key: 'lasso' + kap.id, color: C.terra, width: 2.6 });
        c.hake = M.makeInk(k.g, checkPts(cx - W / 2 + 4, cy - H / 2 + 4, 1.1), { key: 'hake' + kap.id, color: C.sageDark, width: 2.6 });
        c.notater = el('g', { opacity: 0 }, k.g);
        a.extra = (s, t, ts, wall) => {
          if (c.lassoFra != null) {
            const q = progress(wall, c.lassoFra, 320);
            if (q > 0 && q < 1) s.scale *= 1 + 0.05 * Math.sin(Math.PI * q);
          }
          return s;
        };
        kort.push(c);
      });
    });

    /* Kategoriene til venstre */
    const TW = 262, TH = 38, TX = 60 + TW / 2;
    const tags = [];
    k.text('FINNES I DAG', 60, 262, { size: 12, weight: 600, ls: '0.14em', fill: C.inkSoft, start: 300 });
    k.text('IKKE STØTTET ENNÅ', 60, 386, { size: 12, weight: 600, ls: '0.14em', fill: C.inkSoft, start: 500 });
    let y = 292, nye = 0;
    D.kategorier.forEach((kat, i) => {
      if (!kat.finnes && nye++ === 0) y = 414;
      const a = k.paper({ key: 'kat' + kat.id, cx: TX, cy: y, w: TW, h: TH, fill: kat.finnes ? C.paperDim : C.paper, start: 300 + i * 70, restRot: 1.2 });
      a.g.classList.add('kategori');
      a.g.setAttribute('tabindex', '0');
      a.g.setAttribute('role', 'checkbox');
      a.g.setAttribute('aria-checked', 'false');
      a.g.setAttribute('aria-label', `${kat.navn}, ${kat.hjemmel}`);
      a.g.dataset.kategori = kat.id;
      const fokus = roughShape(a.g, TW + 8, TH + 8, 'fokus' + kat.id, { fill: 'none', stroke: C.ink, 'stroke-width': 1.6, class: 'fokus', opacity: 0 }, 0.8);
      a.g.insertBefore(fokus, a.g.firstChild);
      const bx = -TW / 2 + 20;
      roughShape(a.content, 17, 17, 'boks' + kat.id, { fill: C.paper, stroke: C.ink, 'stroke-width': 1.5, transform: `translate(${bx} 0)` }, 0.7);
      text(a.content, kat.navn, bx + 18, 5, { size: 14.5, weight: 600, maxW: 150 });
      text(a.content, kat.hjemmel, TW / 2 - 10, 4.5, { size: 11, fill: C.inkSoft, anchor: 'end' });
      const hake = M.makeInk(a.content, checkPts(bx + 1, -1, 1), { key: 'kh' + kat.id, color: C.terra, width: 2.8 });
      const tag = { kat, a, hake, fra: null };
      a.g.addEventListener('click', () => { brukerHarValgt = true; bytt(kat.id); });
      a.g.addEventListener('keydown', e => {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); brukerHarValgt = true; bytt(kat.id); }
      });
      tags.push(tag);
      y += 46;
    });
    [
      ['ringet inn: trenger noe nytt', C.terra],
      ['hake: gjenbrukes uendret', C.sageDark],
      ['rød tekst: ny datakilde', C.terraDark],
    ].forEach(([s, fill], i) => k.text(s, 60, 838 + i * 18, { size: 12.5, fill, start: 1200 + i * 80 }));

    /* Oppsummering nederst */
    const SW = 286, SH = 128, SY = 762, SX = i => 410 - W / 2 + SW / 2 + i * (SW + 18);
    const slip = (i, tittel, key, start) => {
      const a = k.paper({ key, cx: SX(i), cy: SY, w: SW, h: SH, fill: C.paper, start, restRot: 1.1 });
      text(a.content, tittel, -SW / 2 + 20, -SH / 2 + 26, { size: 11.5, weight: 600, ls: '0.14em', fill: C.inkSoft, maxW: SW - 40 });
      const tall = text(a.content, '–', -SW / 2 + 20, 18, { family: CONFIG.fonts.serif, size: 50 });
      const etter = text(a.content, '', -SW / 2 + 20, 18, { size: 15, fill: C.inkSoft });
      const under = text(a.content, 'Huk av en kategori', -SW / 2 + 20, 46, { size: 13, fill: C.inkSoft });
      return { a, tall, etter, under, maxW: SW - 40 };
    };
    const S1 = slip(0, 'KAPABILITETER SOM BERØRES', 'sum1', 1400);
    const S2 = slip(1, 'HVOR ENDRINGENE BOR', 'sum2', 1480);
    const S3 = slip(2, 'NYE TILSTANDER I SPLEIS', 'sum3', 1560);
    const S4 = slip(3, 'SELVSTENDIG SOM EGET SPOR', 'sum4', 1640);
    S4.a.shape.setAttribute('fill', C.paperDim);
    setSlip(S4, '15', 'egne tilstander', '141 dager til prod · tre apper', C.terraDark);

    function setSlip(s, tall, etter, under, farge = C.ink) {
      s.tall.textContent = tall;
      s.tall.setAttribute('fill', farge);
      s.etter.textContent = etter;
      s.etter.setAttribute('x', (-SW / 2 + 20 + s.tall.getComputedTextLength() + 10).toFixed(1));
      s.under.textContent = under;
      s.under.setAttribute('font-size', 13);
      M.fitText(s.under, s.maxW, 13);
    }

    function effekterFor(kapId) {
      return D.kategorier.filter(kat => valgt.has(kat.id) && kat.effekter[kapId]).map(kat => [kat, ...kat.effekter[kapId]]);
    }

    function oppdater() {
      const wall = naa();
      endret = wall;
      const noen = valgt.size > 0;
      let berort = 0, iTjeneste = 0, iSpleis = 0, regler = 0, kilder = 0;
      for (const c of kort) {
        const eff = effekterFor(c.kap.id);
        const nå = eff.length > 0;
        if (nå && !c.berort) c.lassoFra = wall;
        if (!nå) c.lassoFra = null;
        c.hakeFra = noen && !nå ? (c.hakeFra ?? wall) : null;
        c.berort = nå;
        if (nå) {
          berort++;
          if (c.kap.status === 'spleis') iSpleis++; else iTjeneste++;
          for (const [, type] of eff) type === 'D' ? kilder++ : regler++;
        }
        while (c.notater.firstChild) c.notater.firstChild.remove();
        const linjer = nå ? eff : (noen ? [[null, 'G', 'gjenbrukes']] : []);
        const maks = 3, ny = c.cy + H / 2 + 28;
        linjer.slice(0, linjer.length > maks ? maks - 1 : maks).forEach(([kat, type, notat], j) => {
          const str = kat ? `${kat.kort}: ${notat}` : notat;
          text(c.notater, str, c.cx, ny + j * 16, {
            size: 13, anchor: 'middle', maxW: W + 14,
            fill: type === 'D' ? C.terraDark : type === 'G' ? C.sageDark : C.ink,
            weight: type === 'D' ? 600 : 400, italic: type === 'G',
          });
        });
        if (linjer.length > maks) text(c.notater, `+ ${linjer.length - maks + 1} til`, c.cx, ny + (maks - 1) * 16, { size: 12.5, anchor: 'middle', fill: C.inkSoft });
        c.notater.setAttribute('opacity', 0);
        c.notater._op = null;
      }
      for (const tg of tags) {
        const på = valgt.has(tg.kat.id);
        tg.fra = på ? (tg.fra ?? wall) : null;
        tg.a.g.setAttribute('aria-checked', String(på));
      }
      if (!noen) {
        setSlip(S1, '–', '', 'Huk av en kategori');
        setSlip(S2, '–', '', 'Huk av en kategori');
        setSlip(S3, '–', '', 'Huk av en kategori');
      } else {
        const navn = D.kategorier.filter(kat => valgt.has(kat.id)).map(kat => kat.navn.toLowerCase()).join(', ');
        setSlip(S1, String(berort), `av ${kort.length}`, berort ? `${regler} ${regler === 1 ? 'regel' : 'regler'} og ${kilder} ${kilder === 1 ? 'datakilde' : 'datakilder'} for ${navn}` : `alt gjenbrukes for ${navn}`, berort ? C.terraDark : C.sageDark);
        setSlip(S2, String(iTjeneste), 'i egne tjenester', iSpleis ? `og ${iSpleis} som ennå bor i Spleis` : 'ingen i Spleis');
        setSlip(S3, '0', 'nye spor', 'kategorien går gjennom de felles tilstandene', C.sageDark);
      }
    }

    function bytt(id) {
      valgt.has(id) ? valgt.delete(id) : valgt.add(id);
      oppdater();
    }
    function velg(ids) {
      valgt.clear();
      ids.forEach(id => valgt.add(id));
      oppdater();
    }

    const demo = opts.demo ? [[1800, ['inaktiv']], [6500, ['inaktiv', 'dagpenger']], [11000, ['bladb']], [15000, ['sn']]] : [[1800, ['inaktiv']]];
    if (opts.demo) { this.varighet = 19500; k.varighet = this.varighet; }
    let demoSteg = 0;
    k.add(t => {
      if (t < 100) demoSteg = 0;
      while (demoSteg < demo.length && t >= demo[demoSteg][0]) {
        if (!brukerHarValgt && !opts.kategorier) velg(demo[demoSteg][1]);
        demoSteg++;
      }
    });

    k.add((t, ts, wall) => {
      for (const c of kort) {
        c.lasso.draw(c.lassoFra == null ? 0 : ease(progress(wall, c.lassoFra + 80, 600)));
        c.hake.draw(c.hakeFra == null ? 0 : ease(progress(wall, c.hakeFra + 120, 260)));
        setOpacity(c.notater, progress(wall, endret + 200, 350) * progress(t, 1000, 400));
      }
      for (const tg of tags) tg.hake.draw(tg.fra == null ? 0 : ease(progress(wall, tg.fra, 220)));
    });

    k.velg = ids => { brukerHarValgt = true; velg(ids); };
    k.valgte = () => [...valgt];
    k.vedStart = () => { if (opts.kategorier) velg(opts.kategorier); };
    oppdater();
    return k;
  },
});
})();
