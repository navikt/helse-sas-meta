(() => {
  const D = window.KLOSSER;
  const NS = 'http://www.w3.org/2000/svg';
  const scene = document.getElementById('scene');
  const lysbilder = [...scene.querySelectorAll('.lysbilde')];

  const svg = (tag, attrs = {}, forelder, tekst) => {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (tekst != null) e.textContent = tekst;
    if (forelder) forelder.appendChild(e);
    return e;
  };
  const html = (tag, klasse, forelder, tekst) => {
    const e = document.createElement(tag);
    if (klasse) e.className = klasse;
    if (tekst != null) e.textContent = tekst;
    if (forelder) forelder.appendChild(e);
    return e;
  };
  const dato = (s) => new Date(s + 'T00:00:00Z').getTime();
  const MÅNEDER = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];
  const langDato = (s) => { const d = new Date(s + 'T00:00:00Z'); return `${d.getUTCDate()}. ${MÅNEDER[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };
  const FARGE = { ett: 'var(--ett)', tiger: 'var(--tiger)', to: 'var(--spleiselaget)', igjen: 'var(--ett)' };
  const GRENSER = { ett: ['2019-01-01', '2020-10-01'], tiger: ['2020-10-01', '2022-10-01'], to: ['2022-10-01', '2026-04-01'], igjen: ['2026-04-01', '2027-01-01'] };

  // Tittel: klosser som legges på plass
  (() => {
    const pynt = document.getElementById('pynt');
    const farger = ['var(--ett)', 'var(--tiger)', 'var(--speilvendt)', 'var(--spleiselaget)'];
    for (let i = 0; i < 24; i++) {
      const k = html('span', i % 7 === 3 || i % 5 === 4 ? 'stiplet spill' : 'spill', pynt);
      k.style.background = farger[(i * 7) % 4];
      k.style.animationDelay = `${300 + i * 70}ms`;
    }
  })();

  // Lysbilde: fire perioder
  (() => {
    const rot = document.getElementById('periodekort');
    D.perioder.forEach((p, i) => {
      const k = html('article', 'periode', rot);
      k.dataset.steg = i;
      k.style.setProperty('--farge', p.id === 'to' ? 'linear-gradient(90deg, var(--speilvendt) 50%, var(--spleiselaget) 50%)' : FARGE[p.id]);
      html('div', 'bånd', k);
      html('p', 'navn', k, p.navn);
      html('p', 'tid', k, p.tid);
      const f = html('p', 'fokus', k, p.fokus);
      f.style.color = p.id === 'to' ? 'var(--spleiselaget)' : FARGE[p.id];
      html('p', 'tekst', k, p.tekst);
    });
  })();

  // Lysbilde: ett spor per kategori
  (() => {
    const s = document.getElementById('spor');
    const x = (d) => 260 + ((dato(d) - dato('2019-01-01')) / (dato('2027-01-01') - dato('2019-01-01'))) * 1140;
    const defs = svg('defs', {}, s);
    const m = svg('pattern', { id: 'striper', width: 16, height: 16, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    svg('rect', { width: 8, height: 16, fill: 'var(--speilvendt)' }, m);
    svg('rect', { x: 8, width: 8, height: 16, fill: 'var(--spleiselaget)' }, m);

    const bakgrunn = svg('g', {}, s);
    for (const p of D.perioder) {
      const [a, b] = GRENSER[p.id];
      svg('rect', { class: 'spor-bånd', x: x(a), y: 36, width: x(b) - x(a), height: 490, fill: p.id === 'to' ? 'url(#striper)' : FARGE[p.id] }, bakgrunn);
      svg('text', { class: 'spor-båndnavn', x: x(a) + 8, y: 26, fill: p.id === 'to' ? 'var(--spleiselaget)' : FARGE[p.id] }, bakgrunn, p.navn);
    }
    for (let år = 2019; år <= 2026; år++) svg('text', { class: 'spor-akse', x: x(`${år}-07-01`), y: 550, 'text-anchor': 'middle' }, bakgrunn, år);
    svg('line', { class: 'spor-idag', x1: x(D.idag), x2: x(D.idag), y1: 36, y2: 526 }, bakgrunn);

    const grupper = [svg('g', {}, s), svg('g', { 'data-steg': 1 }, s), svg('g', { 'data-steg': 2 }, s)];
    D.spor.forEach((sp, i) => {
      const g = grupper[sp.periode === 'to' ? 1 : 0];
      const y = 78 + i * 60;
      const farge = FARGE[sp.periode];
      svg('text', { class: 'spor-rad', x: 0, y: y + 2 }, g, sp.navn);
      svg('text', { class: 'spor-under', x: 0, y: y + 22 }, g, sp.under);
      const slutt = sp.deler.at(-1)[1];
      if (!sp.merker.some((mk) => mk.stopp)) {
        svg('line', { x1: x(slutt), x2: x(D.idag), y1: y + 6, y2: y + 6, stroke: farge, 'stroke-width': 2, 'stroke-dasharray': '2 6', opacity: 0.6 }, g);
      }
      for (const [a, b] of sp.deler) {
        svg('rect', { class: 'spor-del', x: x(a), y: y - 5, width: Math.max(6, x(b) - x(a)), height: 22, fill: farge, stroke: 'var(--blekk)', 'stroke-width': 1.5 }, g);
      }
      const merker = sp.merker.slice().sort((a, b) => dato(a.dato) - dato(b.dato));
      merker.forEach((mk, j) => {
        const mx = x(mk.dato);
        if (mk.stopp) {
          svg('text', { x: mx, y: y + 13, 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 700, fill: 'var(--blekk)' }, g, '×');
        } else {
          svg('circle', { cx: mx, cy: y + 6, r: 6, fill: 'var(--flate)', stroke: 'var(--blekk)', 'stroke-width': 2 }, g);
        }
        const forrigeX = j > 0 ? x(merker[j - 1].dato) : -1e9;
        svg('text', { class: 'spor-merke', x: mx, y: mx - forrigeX < 90 ? y + 40 : y - 12, 'text-anchor': 'middle' }, g, mk.tekst);
      });
    });

    const g = grupper[2];
    const yK = 440;
    svg('text', { class: 'spor-rad', x: 0, y: yK + 22, fill: 'var(--ett)' }, g, 'Kapabiliteter');
    svg('text', { class: 'spor-under', x: 0, y: yK + 42 }, g, 'seks nye tjenester på seks måneder');
    D.kapabiliteter.filter(k => k.start).forEach((k, i) => {
      const kx = x(k.start);
      svg('rect', {
        x: kx, y: yK + i * 14 - 8, width: 14, height: 12, rx: 2,
        fill: k.prod ? 'var(--ett)' : 'var(--flate)', stroke: 'var(--blekk)', 'stroke-width': 1.5,
        'stroke-dasharray': k.prod ? '' : '3 2',
      }, g);
    });
    svg('text', { class: 'spor-merke', x: x('2026-05-19') - 10, y: yK + 2, 'text-anchor': 'end' }, g, 'sp-forsikring');
    svg('text', { class: 'spor-merke', x: x('2026-05-19') - 10, y: yK + 74, 'text-anchor': 'end' }, g, 'sp-avslagsdager');
  })();

  // Lysbilde: hver kategori gjennom hele stacken
  (() => {
    const rot = document.getElementById('stacken');
    html('div', 'hode', rot);
    for (const a of D.apper) html('div', 'hode', rot, a);
    html('div', 'hode', rot, 'sum');
    D.stacken.forEach((rad, i) => {
      const farge = FARGE[rad.periode];
      const navn = html('div', 'radnavn', rot, rad.navn);
      navn.dataset.steg = i;
      rad.commits.forEach((n) => {
        const c = html('div', 'celle', rot);
        c.dataset.steg = i;
        if (!n) return;
        const d = Math.round(12 + Math.sqrt(n) * 7);
        const p = html('div', d < 40 ? 'prikk liten' : 'prikk', c);
        p.style.cssText = `width:${d}px;height:${d}px;--farge:${farge}`;
        html('span', '', p, n);
      });
      const sum = html('div', 'sum', rot, rad.commits.reduce((a, b) => a + b, 0));
      sum.dataset.steg = i;
      html('small', '', sum, `i ${rad.commits.filter(Boolean).length} apper`);
    });
  })();

  // Lysbilde: tilstander i Spleis
  (() => {
    const rot = document.getElementById('tilstander');
    const kategorifarger = ['var(--spleiselaget)', 'var(--speilvendt)', 'var(--tiger)'];
    for (let i = 0; i < D.tilstander.felles; i++) html('div', 'blokk', rot);
    let n = 0;
    D.tilstander.kategori.forEach((k, ki) => {
      for (let i = 0; i < k.antall; i++) {
        const b = html('div', 'blokk kat', rot);
        b.style.setProperty('--farge', kategorifarger[ki]);
        b.style.setProperty('--forsink', `${n++ * 45}ms`);
        b.title = k.navn;
      }
    });
    const ny = html('div', 'blokk ny', rot);
    ny.dataset.steg = 2;
    ny.title = D.tilstander.ny;

    const fork = document.getElementById('tilstandforklaring');
    const legg = (farge, tekst, stiplet) => {
      const s = html('span', '', fork);
      const i = html('i', '', s);
      i.style.background = farge;
      if (stiplet) i.style.borderStyle = 'dashed';
      s.append(tekst);
    };
    legg('var(--flate)', `felles (${D.tilstander.felles})`);
    D.tilstander.kategori.forEach((k, ki) => legg(kategorifarger[ki], `${k.navn} (${k.antall})`));
    legg('var(--ett)', D.tilstander.ny);
  })();

  // Lysbilde: kategori-kode i Spleis-modellen
  (() => {
    const s = document.getElementById('linjer');
    const a = dato('2025-01-01'), b = dato('2026-11-15');
    const x = (d) => 90 + ((dato(d) - a) / (b - a)) * 1290;
    const y = (v) => 470 - (v / 900) * 420;
    const skifte = '2026-04-01';
    svg('rect', { x: x('2025-01-01'), y: 30, width: x(skifte) - x('2025-01-01'), height: 440, fill: 'url(#striper2)', opacity: 0.1 }, s);
    const defs = svg('defs', {}, s);
    const m = svg('pattern', { id: 'striper2', width: 16, height: 16, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    svg('rect', { width: 8, height: 16, fill: 'var(--speilvendt)' }, m);
    svg('rect', { x: 8, width: 8, height: 16, fill: 'var(--spleiselaget)' }, m);
    svg('rect', { x: x(skifte), y: 30, width: x('2026-11-15') - x(skifte), height: 440, fill: 'var(--ett)', opacity: 0.08 }, s);
    svg('text', { class: 'spor-båndnavn', x: x('2025-01-01') + 8, y: 22, fill: 'var(--spleiselaget)' }, s, 'To team');
    svg('text', { class: 'spor-båndnavn', x: x(skifte) + 8, y: 22, fill: 'var(--ett)' }, s, 'Ett team igjen');

    for (const v of [0, 250, 500, 750]) {
      svg('line', { x1: 90, x2: 1380, y1: y(v), y2: y(v), stroke: 'var(--linje)', 'stroke-width': 1 }, s);
      svg('text', { class: 'spor-akse', x: 78, y: y(v) + 5, 'text-anchor': 'end' }, s, v);
    }
    for (const d of ['2025-01-01', '2025-04-01', '2025-07-01', '2025-10-01', '2026-01-01', '2026-04-01', '2026-07-01', '2026-10-01']) {
      const [år, mnd] = d.split('-');
      svg('text', { class: 'spor-akse', x: x(d), y: 496, 'text-anchor': 'middle' }, s, `${MÅNEDER[+mnd - 1].slice(0, 3)} ${år}`);
    }

    const før = D.kategorilinjer.filter(([d]) => dato(d) <= dato(skifte));
    const etter = D.kategorilinjer.filter(([d]) => dato(d) >= dato(skifte));
    const sti = (pkt) => pkt.map(([d, v], i) => `${i ? 'L' : 'M'}${x(d).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
    const flate = (pkt) => `${sti(pkt)} L${x(pkt.at(-1)[0])} ${y(0)} L${x(pkt[0][0])} ${y(0)} Z`;
    const g1 = svg('g', {}, s);
    const g2 = svg('g', { 'data-steg': 1 }, s);
    svg('path', { class: 'linje-flate', d: flate(før), fill: 'var(--spleiselaget)' }, g1);
    svg('path', { class: 'linje-sti', d: sti(før), stroke: 'var(--spleiselaget)' }, g1);
    svg('path', { class: 'linje-flate', d: flate(etter), fill: 'var(--ett)' }, g2);
    svg('path', { class: 'linje-sti', d: sti(etter), stroke: 'var(--ett)' }, g2);

    const [d0, v0] = D.kategorilinjer[0];
    const [dt, vt] = før.at(-1);
    const [ds, vs] = D.kategorilinjer.at(-1);
    svg('text', { class: 'linje-tall', x: x(d0) + 6, y: y(v0) - 14 }, g1, v0);
    svg('text', { class: 'linje-tall', x: x(dt), y: y(vt) - 18, 'text-anchor': 'middle', fill: 'var(--spleiselaget)' }, g1, vt);
    svg('text', { class: 'linje-tall', x: x(ds) - 6, y: y(vs) - 18, 'text-anchor': 'end', fill: 'var(--ett)' }, g2, vs);

    D.linjemerker.forEach((mk, i) => {
      const g = dato(mk.dato) < dato(skifte) ? g1 : g2;
      const mx = x(mk.dato);
      svg('line', { class: 'linje-merke', x1: mx, x2: mx, y1: 60, y2: 470 }, g);
      svg('text', { class: 'spor-merke', x: mx + 6, y: 56 + (i % 2) * 22 }, g, mk.tekst);
    });
  })();

  // Lysbilde: Spleis spør, kapabilitetene svarer
  (() => {
    const s = document.getElementById('hub');
    const sx = 140, sy = 140, sb = 300, sh = 170;
    const kanter = svg('g', {}, s);
    D.kapabiliteter.forEach((k, i) => {
      const kx = 820 + (i % 2) * 310, ky = 12 + Math.floor(i / 2) * 108, kb = 270, kh = 96;
      const d = `M${sx + sb} ${sy + sh / 2} C ${sx + sb + 220} ${sy + sh / 2}, ${kx - 200} ${ky + kh / 2}, ${kx} ${ky + kh / 2}`;
      const arbeid = !k.prod, ekstra = k.planlagt ? ' arbeid planlagt' : arbeid ? ' arbeid' : '';
      svg('path', { class: `hub-kant${ekstra}`, d, id: `kant-${i}` }, kanter);
      if (!arbeid) {
        for (const [fra, til] of [[0, 1], [1, 0]]) {
          const c = svg('circle', { r: 6, class: 'hub-pakke', opacity: fra ? 0.5 : 1 }, kanter);
          const am = svg('animateMotion', { dur: '3.2s', repeatCount: 'indefinite', begin: `${i * 0.45 + fra * 1.6}s`, keyPoints: `${fra};${til}`, keyTimes: '0;1', calcMode: 'linear' }, c);
          svg('mpath', { href: `#kant-${i}` }, am);
        }
      }
      svg('rect', { class: `hub-kapabilitet${ekstra}`, x: kx, y: ky, width: kb, height: kh, rx: 8 }, s);
      svg('text', { class: 'hub-navn', x: kx + 18, y: ky + 30 }, s, k.navn);
      svg('text', { class: 'hub-regel', x: kx + 18, y: ky + 54 }, s, k.regel);
      svg('text', { class: 'hub-regel', x: kx + 18, y: ky + 78 }, s, k.prod ? `i prod ${langDato(k.prod)}` : k.planlagt ? 'planlagt' : 'under arbeid');
    });
    svg('rect', { class: 'hub-spleis', x: sx, y: sy, width: sb, height: sh, rx: 12 }, s);
    svg('text', { x: sx + sb / 2, y: sy + 76, 'text-anchor': 'middle', 'font-size': 44, 'font-weight': 700, style: 'fill: var(--papir)' }, s, 'Spleis');
    svg('text', { x: sx + sb / 2, y: sy + 114, 'text-anchor': 'middle', 'font-size': 18, style: 'fill: #d8cdb8' }, s, 'felles tilstander for alle');
    svg('text', { class: 'hub-regel', x: 560, y: 160, 'text-anchor': 'middle' }, s, 'behov →');
    svg('text', { class: 'hub-regel', x: 560, y: 340, 'text-anchor': 'middle' }, s, '← svar med ID');
  })();

  // Lysbilde: én dag i sp-forsikring
  (() => {
    const rot = document.getElementById('logg');
    D.enDag.forEach((c, i) => {
      const l = html('div', 'linje spill', rot);
      l.style.animationDelay = `${200 + i * 260}ms`;
      html('span', 'hash', l, c.hash);
      const t = html('span', '', l);
      html('span', 'tdd', t, 'TDD:');
      t.append(c.tekst);
      html('span', 'filer', l, `${c.filer} ${c.filer === 1 ? 'fil' : 'filer'}`);
      const st = html('span', 'stolpe', l);
      html('span', 'pluss', st).style.width = `${c.pluss * 4}px`;
      html('span', 'minus', st).style.width = `${c.minus * 4}px`;
      html('span', 'filer', st, ` +${c.pluss} −${c.minus}`).style.marginLeft = '10px';
    });
  })();

  // Lysbilde: hva en ny kategori trenger
  (() => {
    const rot = document.getElementById('matrise');
    html('div', 'kol', rot);
    for (const [, navn] of D.kolonner) html('div', 'kol', rot, navn);
    html('div', 'kol', rot, 'nye');
    for (const k of D.nyeKategorier) {
      const n = html('div', 'radnavn', rot, k.navn);
      html('small', '', n, k.hjemmel);
      for (const [id] of D.kolonner) {
        const e = k.effekter[id];
        html('div', `rute${e ? ` ${e}` : ''}`, rot, e || '');
      }
      const a = html('div', 'antall', rot, Object.keys(k.effekter).length);
      html('small', '', a, ' av 13');
      a.dataset.steg = 1;
    }
  })();

  // Navigasjon
  const maks = (l, attr) => Math.max(0, ...[...l.querySelectorAll(`[${attr}]`)].map((e) => +e.getAttribute(attr)));
  const antallSteg = lysbilder.map((l) => Math.max(maks(l, 'data-steg'), maks(l, 'data-kun')));
  const tilstand = { lysbilde: 0, steg: 0 };
  const fremdrift = document.getElementById('fremdrift');
  const teller = document.getElementById('teller');
  const notat = document.getElementById('notat');

  const spillPåNytt = (l) => l.querySelectorAll('.spill').forEach((e) => {
    e.style.animation = 'none';
    void e.offsetWidth;
    e.style.animation = '';
  });

  const vis = () => {
    const { lysbilde, steg } = tilstand;
    lysbilder.forEach((l, i) => {
      const varAktiv = l.classList.contains('aktiv');
      l.classList.toggle('aktiv', i === lysbilde);
      if (i === lysbilde && !varAktiv) spillPåNytt(l);
    });
    const aktiv = lysbilder[lysbilde];
    aktiv.dataset.na = steg;
    aktiv.querySelectorAll('[data-steg]').forEach((e) => e.classList.toggle('skjult', +e.dataset.steg > steg));
    aktiv.querySelectorAll('[data-kun]').forEach((e) => e.classList.toggle('skjult', +e.dataset.kun !== steg));
    const totalt = antallSteg.reduce((a, b) => a + b + 1, 0) - 1;
    const her = antallSteg.slice(0, lysbilde).reduce((a, b) => a + b + 1, 0) + steg;
    fremdrift.style.width = `${(her / totalt) * 100}%`;
    teller.textContent = `${lysbilde + 1} / ${lysbilder.length}`;
    notat.textContent = aktiv.dataset.notat || '';
    history.replaceState(null, '', `#${lysbilde + 1}-${steg}`);
  };

  const gaTil = (l, s = 0) => {
    tilstand.lysbilde = Math.max(0, Math.min(lysbilder.length - 1, l));
    tilstand.steg = Math.max(0, Math.min(antallSteg[tilstand.lysbilde], s));
    vis();
  };
  const neste = () => (tilstand.steg < antallSteg[tilstand.lysbilde] ? gaTil(tilstand.lysbilde, tilstand.steg + 1) : gaTil(tilstand.lysbilde + 1, 0));
  const forrige = () => (tilstand.steg > 0 ? gaTil(tilstand.lysbilde, tilstand.steg - 1) : gaTil(tilstand.lysbilde - 1, antallSteg[tilstand.lysbilde - 1] ?? 0));

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (['ArrowRight', ' ', 'PageDown', 'Enter'].includes(e.key)) { e.preventDefault(); neste(); }
    else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); forrige(); }
    else if (e.key === 'Home') gaTil(0);
    else if (e.key === 'End') gaTil(lysbilder.length - 1, antallSteg.at(-1));
    else if (e.key === 'f' || e.key === 'F') (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen());
    else if (e.key === 'n' || e.key === 'N') notat.hidden = !notat.hidden;
  });
  document.addEventListener('click', (e) => {
    if (e.target.closest('a')) return;
    (e.clientX < window.innerWidth / 3 ? forrige : neste)();
  });

  const skaler = () => {
    const f = Math.min(window.innerWidth / 1600, window.innerHeight / 900);
    scene.style.transform = `translate(-50%, -50%) scale(${f})`;
  };
  window.addEventListener('resize', skaler);
  skaler();

  const fraHash = () => {
    const m = location.hash.match(/^#(\d+)(?:-(\d+))?$/);
    return m ? [+m[1] - 1, +(m[2] ?? 0)] : [0, 0];
  };
  window.addEventListener('hashchange', () => {
    const [l, s] = fraHash();
    if (l !== tilstand.lysbilde || s !== tilstand.steg) gaTil(l, s);
  });
  gaTil(...fraHash());

  window.klosser = { antall: lysbilder.length, steg: (l) => antallSteg[l], gaTil, tilstand };
})();
