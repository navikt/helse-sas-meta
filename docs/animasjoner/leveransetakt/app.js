(() => {
  const D = window.TAKT;
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
  const tall = (n, des = 0) => n.toLocaleString('nb-NO', { minimumFractionDigits: des, maximumFractionDigits: des });
  const dato = (s) => new Date(s + 'T00:00:00Z').getTime();
  const DAG = 86_400_000;
  const periodeFor = (d) => (d < dato('2020-10-01') ? 'ett' : d < dato('2022-10-01') ? 'tiger' : d < dato('2026-04-01') ? 'to' : 'igjen');
  const kvartalsPeriode = (k) => periodeFor(dato(`${k.slice(0, 4)}-${String((+k.slice(5) - 1) * 3 + 1).padStart(2, '0')}-01`));
  const PERIODENAVN = { ett: 'Ett team', tiger: 'Tigerteam', to: 'To team', igjen: 'Ett team igjen' };
  const PERIODESTEG = { ett: 0, tiger: 0, to: 1, igjen: 2 };

  // Lysbilde: fire perioder som spor som fletter seg, deler seg og samles
  (() => {
    const s = document.getElementById('spor');
    const x = (d) => 60 + ((dato(d) - dato('2019-01-01')) / (dato('2027-01-01') - dato('2019-01-01'))) * 1380;
    const midt = 200, opp = 105, ned = 295;
    const xTiger = x('2020-10-01'), xDeling = x('2022-10-01'), xSamling = x('2026-04-01');

    svg('path', { class: 'spor-ett', d: `M${x('2019-03-14')} ${midt} L${xTiger} ${midt}` }, s);
    svg('text', { x: x('2019-03-14'), y: midt - 40, class: 'spornavn', fill: 'var(--ett)' }, s, 'Ett team');
    svg('text', { x: x('2019-03-14'), y: midt + 56, class: 'sporundertekst', fill: 'var(--dempet)' }, s, 'Alt i ett team');

    // Tigerteam: ett team med flere tråder som går side om side og samles før delingen.
    const tiger = svg('g', { 'data-steg': 1 }, s);
    const tråd = (dy) => `M${xTiger} ${midt} C${xTiger + 50} ${midt}, ${xTiger + 30} ${midt + dy}, ${xTiger + 90} ${midt + dy} L${xDeling - 90} ${midt + dy} C${xDeling - 30} ${midt + dy}, ${xDeling - 50} ${midt}, ${xDeling} ${midt}`;
    for (const dy of [-26, 0, 26]) svg('path', { class: 'spor-tiger', d: tråd(dy) }, tiger);
    svg('text', { x: xTiger + 20, y: midt - 50, class: 'spornavn', fill: 'var(--tiger)' }, tiger, 'Tigerteam');
    svg('text', { x: xTiger + 20, y: midt + 66, class: 'sporundertekst', fill: 'var(--dempet)' }, tiger, 'Ett team, ansvar per feature');
    svg('text', { x: xTiger + 20, y: midt + 90, class: 'sporundertekst', fill: 'var(--dempet)' }, tiger, 'eller brukergruppe');
    svg('text', { x: xTiger, y: midt - 90, 'text-anchor': 'middle', class: 'sporundertekst', fill: 'var(--tekst)' }, tiger, 'høsten 2020');

    const deling = svg('g', { 'data-steg': 2 }, s);
    const bue = (y) => `M${xDeling} ${midt} C${xDeling + 70} ${midt}, ${xDeling + 40} ${y}, ${xDeling + 120} ${y} L${xSamling - 120} ${y}`;
    svg('path', { class: 'spor-speilvendt', d: bue(opp) }, deling);
    svg('path', { class: 'spor-spleiselaget', d: bue(ned) }, deling);
    svg('text', { x: xDeling + 140, y: opp - 30, class: 'spornavn', fill: 'var(--speilvendt)' }, deling, 'Speilvendt');
    svg('text', { x: xDeling + 290, y: opp - 30, class: 'sporundertekst', fill: 'var(--dempet)' }, deling, 'Speil, Spesialist og tjenestene rundt');
    svg('text', { x: xDeling + 140, y: ned + 50, class: 'spornavn', fill: 'var(--spleiselaget)' }, deling, 'Spleiselaget');
    svg('text', { x: xDeling + 310, y: ned + 50, class: 'sporundertekst', fill: 'var(--dempet)' }, deling, 'Spleis, Spenn og tjenestene rundt');
    svg('text', { x: xDeling, y: midt + 4, 'text-anchor': 'end', dx: -30, class: 'sporundertekst', fill: 'var(--tekst)' }, deling, 'høsten 2022');

    const samling = svg('g', { 'data-steg': 3 }, s);
    const inn = (y) => `M${xSamling - 120} ${y} C${xSamling - 40} ${y}, ${xSamling - 70} ${midt}, ${xSamling} ${midt}`;
    svg('path', { class: 'spor-speilvendt', d: inn(opp) }, samling);
    svg('path', { class: 'spor-spleiselaget', d: inn(ned) }, samling);
    svg('path', { class: 'spor-ett', d: `M${xSamling} ${midt} L${x('2026-11-05')} ${midt}` }, samling);
    svg('text', { x: xSamling, y: midt - 40, class: 'spornavn', fill: 'var(--ett)' }, samling, 'Ett team igjen');
    svg('text', { x: xSamling + 10, y: midt + 56, class: 'sporundertekst', fill: 'var(--tekst)' }, samling, 'april 2026');

    const aksY = 425;
    svg('line', { x1: 60, x2: 1440, y1: aksY, y2: aksY, class: 'akse' }, s);
    for (let år = 2019; år <= 2026; år++) {
      svg('line', { x1: x(`${år}-01-01`), x2: x(`${år}-01-01`), y1: aksY - 8, y2: aksY + 8, class: 'akse' }, s);
      svg('text', { x: x(`${år}-01-01`) + 6, y: aksY - 14 }, s, år);
    }
    const milepaler = svg('g', { 'data-steg': 4 }, s);
    for (const [d, navn] of D.milepaler) {
      const g = svg('g', { class: `milepal ${periodeFor(dato(d))}`, transform: `translate(${x(d)} ${aksY})` }, milepaler);
      svg('circle', { r: 6 }, g);
      svg('text', { x: 6, y: 20, transform: 'rotate(40)' }, g, navn);
    }
  })();

  // Felles oppsett for kvartalsdiagrammene
  const kvartalsakse = (s, { venstre, hoyre, topp, bunn, maks, rutenett }) => {
    const n = D.kvartal.length;
    const bredde = (hoyre - venstre) / n;
    const x = (i) => venstre + i * bredde;
    const y = (v) => bunn - (v / maks) * (bunn - topp);
    for (const p of D.perioder) {
      const fra = D.kvartal.findIndex((k) => k[0] === p.fra);
      const til = D.kvartal.findIndex((k) => k[0] === p.til);
      svg('rect', { class: `band ${p.id}`, x: x(fra), y: topp - 30, width: (til - fra + 1) * bredde, height: bunn - topp + 30 }, s);
      svg('text', { class: 'bandnavn', x: x(fra) + 10, y: topp - 8 }, s, PERIODENAVN[p.id]);
      p.i = { fra, til };
    }
    for (const v of rutenett) {
      svg('line', { class: 'rutenett', x1: venstre, x2: hoyre, y1: y(v), y2: y(v) }, s);
      svg('text', { x: venstre - 12, y: y(v) + 6, 'text-anchor': 'end' }, s, v);
    }
    svg('line', { class: 'akse', x1: venstre, x2: hoyre, y1: bunn, y2: bunn }, s);
    D.kvartal.forEach(([k], i) => {
      if (k.endsWith('-1')) svg('text', { x: x(i) + 4, y: bunn + 28 }, s, k.slice(0, 4));
    });
    return { x, y, bredde };
  };

  // Lysbilde: commits per uke
  (() => {
    const s = document.getElementById('kvartalsdiagram');
    const { x, y, bredde } = kvartalsakse(s, { venstre: 80, hoyre: 1480, topp: 50, bunn: 560, maks: 250, rutenett: [0, 50, 100, 150, 200, 250] });
    D.kvartal.forEach(([k, tot], i) => {
      const p = kvartalsPeriode(k);
      const r = svg('rect', { class: `søyle ${p}${i === D.kvartal.length - 1 ? ' delvis' : ''}`, x: x(i) + 6, y: y(tot), width: bredde - 12, height: y(0) - y(tot), rx: 4 }, s);
      r.style.transitionDelay = `${i * 25}ms`;
      svg('title', {}, r, `${k}: ${tall(tot, 1)} commits per uke`);
    });
    const snitt = svg('g', { 'data-steg': 1 }, s);
    for (const p of D.perioder) {
      const x1 = x(p.i.fra) + 4, x2 = x(p.i.til + 1) - 4;
      svg('line', { class: `snitt ${p.id}`, x1, x2, y1: y(p.commitsUke), y2: y(p.commitsUke) }, snitt);
      svg('text', { class: 'snittekst', x: p.id === 'igjen' ? x1 : x1 + 8, y: y(p.commitsUke) - 12 }, snitt, p.commitsUke);
    }
    const merker = svg('g', { 'data-steg': 2 }, s);
    const [, tiger, to, igjen] = D.perioder;
    const endring = (fra, til) => `${til >= fra ? '+' : '−'}${Math.abs(Math.round((100 * (til - fra)) / fra))} %`;
    svg('text', { class: 'merke opp', x: x(to.i.fra) + 70, y: y(to.commitsUke) - 60 }, merker, endring(tiger.commitsUke, to.commitsUke));
    svg('text', { class: 'merke ned', x: x(igjen.i.fra) - 10, y: y(igjen.commitsUke) - 60 }, merker, endring(to.commitsUke, igjen.commitsUke));
  })();

  // Lysbilde: broer per kvartal
  (() => {
    const s = document.getElementById('brodiagram');
    const { x, y, bredde } = kvartalsakse(s, { venstre: 80, hoyre: 1480, topp: 50, bunn: 470, maks: 16, rutenett: [0, 5, 10, 15] });
    D.broKvartal.forEach((v, i) => {
      const k = D.kvartal[i][0];
      const p = kvartalsPeriode(k);
      const h = Math.max(3, y(0) - y(v));
      const r = svg('rect', { class: `søyle ${p}`, x: x(i) + 6, y: y(0) - h, width: bredde - 12, height: h, rx: 4 }, s);
      r.style.transitionDelay = `${i * 25}ms`;
      svg('title', {}, r, `${k}: ${v} utviklere`);
      svg('text', { x: x(i) + bredde / 2, y: y(0) - h - 10, 'text-anchor': 'middle', class: 'søyletall' }, s, v);
    });
    const rot = document.getElementById('sammedag');
    html('div', 'tittellinje', rot, 'Dager per uke der samme person committet i begge');
    const rad = html('div', 'rad', rot);
    for (const p of D.perioder) {
      const c = html('div', `celle ${p.id}`, rad);
      html('span', 'tall', c, D.sammeDag[p.id]);
      html('span', 'navn', c, p.navn);
    }
  })();

  // Lysbilde: kontraktsendringer
  (() => {
    const rot = document.getElementById('kontraktdiagram');
    D.kontrakt.forEach((k, ki) => {
      const blokk = html('div', `kontraktblokk${ki ? ' kontroll' : ''}`, rot);
      if (ki) blokk.dataset.steg = 1;
      const hode = html('div', 'hode', blokk);
      html('span', 'navn', hode, k.navn);
      html('span', 'grense', hode, k.grense);
      for (const p of D.perioder) {
        if (k.verdier[p.id] == null) continue;
        const r = html('div', `kontraktrad ${p.id}`, blokk);
        html('span', 'periode', r, PERIODENAVN[p.id]);
        const spor = html('div', 'spor', r);
        spor.style.setProperty('--b', `${k.verdier[p.id]}%`);
        html('div', 'fyll', spor);
        html('span', 'verdi', spor, `${k.verdier[p.id]} %`);
      }
    });
  })();

  // Lysbilde: stafettbaner
  const varighetTekst = (dager) => {
    if (dager < 60) return `${dager + 1} dager`;
    const mnd = Math.round(dager / 30.44);
    return mnd < 24 ? `${mnd} mnd` : `${tall(mnd / 12, 1)} år`;
  };
  (() => {
    const rot = document.getElementById('stafett');
    let forrige = null;
    D.stafett.forEach((f, i) => {
      const p = periodeFor(dato(f.prod));
      if (p !== forrige) {
        const skille = html('div', `stafettskille ${p}`, rot, PERIODENAVN[p]);
        skille.dataset.steg = PERIODESTEG[p];
        forrige = p;
      }
      const lengde = Math.round((dato(f.prod) - dato(f.start)) / DAG);
      const rad = html('div', `stafettrad ${p}`, rot);
      rad.dataset.steg = PERIODESTEG[p];
      html('div', 'navn', rad, f.navn);
      const bane = html('div', 'bane', rad);
      const pos = (d) => `${(d / Math.max(1, lengde)) * 100}%`;
      for (const d of f.bro) { const e = html('i', 'bro', bane); e.style.left = pos(d); }
      for (const d of f.S) { const e = html('i', 's', bane); e.style.left = pos(d); }
      for (const d of f.V) { const e = html('i', 'v', bane); e.style.left = pos(d); }
      html('div', 'lengde', rad, varighetTekst(lengde));
    });
  })();

  // Lysbilde: andel dager med arbeid
  (() => {
    const rot = document.getElementById('flytdiagram');
    for (const f of D.stafett) {
      const p = periodeFor(dato(f.prod));
      const lengde = Math.round((dato(f.prod) - dato(f.start)) / DAG) + 1;
      const aktive = new Set([...f.S, ...f.V]).size;
      const andel = Math.round((100 * aktive) / lengde);
      const rad = html('div', `flytrad ${p}`, rot);
      html('div', 'navn', rad, f.navn);
      const spor = html('div', 'spor', rad);
      spor.style.setProperty('--b', `${andel}%`);
      html('div', 'fyll', spor);
      html('span', 'verdi', spor, `${andel} %`);
      html('div', 'lengde', rad, `${aktive} av ${lengde} dager`);
    }
  })();

  // Lysbilde: hvem committer i Spleis nå
  (() => {
    const rot = document.getElementById('folk');
    const rad = html('div', 'figurer', rot);
    let i = 0;
    for (const g of D.spleisNa) {
      for (let n = 0; n < g.antall; n++) {
        const e = html('i', `figur ${g.klasse}`, rad);
        e.style.setProperty('--i', i++);
      }
    }
    const fork = html('div', 'forklaring', rot);
    for (const g of D.spleisNa) {
      const e = html('div', `gruppe ${g.klasse}`, fork);
      html('span', 'tall', e, g.antall);
      html('span', 'navn', e, g.navn);
    }
  })();

  // Navigasjon
  const antallSteg = lysbilder.map((l) => Math.max(0, ...[...l.querySelectorAll('[data-steg]')].map((e) => +e.dataset.steg)));
  const tilstand = { lysbilde: 0, steg: 0 };
  const fremdrift = document.getElementById('fremdrift');
  const teller = document.getElementById('teller');
  const notat = document.getElementById('notat');

  const tellOpp = (e) => {
    const mål = +e.dataset.tell;
    const t0 = performance.now();
    const tikk = (t) => {
      const f = Math.min(1, (t - t0) / 900);
      e.textContent = tall(mål * (1 - Math.pow(1 - f, 3)), 1);
      if (f < 1) requestAnimationFrame(tikk);
    };
    requestAnimationFrame(tikk);
  };

  const vis = () => {
    const { lysbilde, steg } = tilstand;
    lysbilder.forEach((l, i) => {
      const varAktiv = l.classList.contains('aktiv');
      l.classList.toggle('aktiv', i === lysbilde);
      if (i === lysbilde && !varAktiv) l.querySelectorAll('[data-tell]').forEach(tellOpp);
    });
    lysbilder[lysbilde].querySelectorAll('[data-steg]').forEach((e) => e.classList.toggle('skjult', +e.dataset.steg > steg));
    const totalt = antallSteg.reduce((a, b) => a + b + 1, 0) - 1;
    const her = antallSteg.slice(0, lysbilde).reduce((a, b) => a + b + 1, 0) + steg;
    fremdrift.style.width = `${(her / totalt) * 100}%`;
    teller.textContent = `${lysbilde + 1} / ${lysbilder.length}`;
    notat.textContent = lysbilder[lysbilde].dataset.notat || '';
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

  window.takt = { antall: lysbilder.length, steg: (l) => antallSteg[l], gaTil, tilstand };
})();
