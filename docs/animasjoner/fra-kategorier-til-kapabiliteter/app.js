(() => {
'use strict';
const M = window.Motor;
const { C, CONFIG, el, text, quant, progress, setOpacity } = M;

const params = new URLSearchParams(location.search);
const opts = {
  demo: params.has('demo'),
  kategorier: params.get('kategorier') ? params.get('kategorier').split(',') : null,
};

const svgBg = document.getElementById('bg');
const svg = document.getElementById('scene');

function buildStaticLayer() {
  M.buildDefs(svgBg, true);
  el('rect', { x: 50, y: 56, width: 560, height: 28, fill: C.sand, filter: 'url(#cutPaper)', transform: 'rotate(-1.2 100 70)' }, svgBg);
  text(svgBg, 'SPLEIS, SPEIL OG APPENE RUNDT · FRA KATEGORIER TIL KAPABILITETER', 64, 76, { size: 12.5, weight: 600, ls: '0.16em', maxW: 530 });
}

M.buildGrain();
buildStaticLayer();
M.buildDefs(svg, false);
const root = el('g', {}, svg);
const kapitler = window.Kapitler.map(def => def.bygg(root, opts));
kapitler.forEach(k => { k.g.style.display = 'none'; });
M.applyBoil(0);

const frossetT = params.get('t');
let aktiv = Math.max(0, Math.min(kapitler.length - 1, Number(params.get('kapittel') || 1) - 1));
let t = 0, wall = 0, last = null, boilClock = 0, boilIndex = 0;
let spiller = !params.has('pause'), fart = Number(params.get('fart') || 1);
let forlater = null, autoTimer = null;

function vis(n) {
  if (n === aktiv && kapitler[n].g.style.display !== 'none') return;
  if (kapitler[aktiv].g.style.display !== 'none') forlater = { k: kapitler[aktiv], fra: wall };
  aktiv = n;
  const k = kapitler[aktiv];
  k.g.style.display = '';
  k.g.setAttribute('opacity', 1);
  root.appendChild(k.g);
  t = 0;
  spiller = true;
  autoTimer = null;
  if (k.vedStart) k.vedStart();
  oppdaterUi();
}

function render() {
  const tq = quant(t, CONFIG.mainFps), ts = quant(wall, CONFIG.steppedFps);
  if (forlater) {
    const p = progress(wall, forlater.fra, 320);
    setOpacity(forlater.k.g, 1 - p);
    if (p >= 1) { forlater.k.g.style.display = 'none'; forlater = null; }
  }
  const k = kapitler[aktiv];
  k.wall = wall;
  k.render(tq, ts, wall);
}

const controls = document.getElementById('controls');
const playBtn = document.getElementById('playPause');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const autoNext = document.getElementById('autoNext');
const speedSel = document.getElementById('speed');
const stepInfo = document.getElementById('stepInfo');

function ferdig() { return t >= kapitler[aktiv].varighet; }
function oppdaterUi() {
  const sist = aktiv === kapitler.length - 1;
  playBtn.textContent = spiller ? 'Pause' : ferdig() ? (sist ? 'Spill på nytt' : 'Neste kapittel') : 'Spill av';
  prevBtn.disabled = aktiv === 0;
  nextBtn.disabled = sist;
  stepInfo.textContent = `Kapittel ${aktiv + 1} av ${kapitler.length}`;
}

playBtn.addEventListener('click', () => {
  if (!spiller && ferdig()) {
    vis(aktiv === kapitler.length - 1 ? 0 : aktiv + 1);
    return;
  }
  spiller = !spiller;
  last = null;
  oppdaterUi();
});
prevBtn.addEventListener('click', () => vis(Math.max(0, aktiv - 1)));
nextBtn.addEventListener('click', () => vis(Math.min(kapitler.length - 1, aktiv + 1)));
speedSel.addEventListener('change', () => { fart = Number(speedSel.value); });
document.addEventListener('keydown', e => {
  if (e.target instanceof HTMLSelectElement || e.target instanceof HTMLInputElement) return;
  if (e.target instanceof Element && e.target.closest('.kategori')) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); vis(Math.min(kapitler.length - 1, aktiv + 1)); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); vis(Math.max(0, aktiv - 1)); }
  if (e.code === 'Space' && !(e.target instanceof HTMLButtonElement)) { e.preventDefault(); playBtn.click(); }
});

window.skisse = {
  antall: kapitler.length,
  vis: n => vis(n - 1),
  velg: ids => { const k = kapitler.find(x => x.velg); vis(kapitler.indexOf(k)); k.velg(ids); },
  tilstand: {
    get kapittel() { return aktiv + 1; },
    get t() { return t; },
    get ferdig() { return ferdig(); },
    get alleFerdig() { return ferdig() && aktiv === kapitler.length - 1; },
  },
};

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
// ?t=<ms> fryser kapitlet på et gitt tidspunkt, nyttig for skjermbilder.
if (frossetT !== null || reduced.matches) {
  vis(aktiv);
  t = frossetT !== null ? Number(frossetT) : kapitler[aktiv].varighet;
  wall = 1e9;
  spiller = false;
  kapitler[aktiv].render(t, 0, 0);
  render();
  controls.hidden = !reduced.matches;
  if (reduced.matches) {
    const statisk = n => { vis(n); t = kapitler[n].varighet; wall = 1e9; spiller = false; render(); oppdaterUi(); };
    prevBtn.onclick = e => { e.stopImmediatePropagation(); statisk(Math.max(0, aktiv - 1)); };
    nextBtn.onclick = e => { e.stopImmediatePropagation(); statisk(Math.min(kapitler.length - 1, aktiv + 1)); };
    oppdaterUi();
  }
  const loopStatic = now => { wall = 1e9 + now; render(); requestAnimationFrame(loopStatic); };
  requestAnimationFrame(loopStatic);
} else {
  controls.hidden = false;
  speedSel.value = String(fart);
  if (params.has('auto')) autoNext.checked = true;
  vis(aktiv);
  const frame = now => {
    if (last === null) last = now;
    const dt = Math.min(100, now - last);
    last = now;
    wall += dt;
    if (spiller) {
      t += dt * fart;
      if (t >= kapitler[aktiv].varighet) {
        t = kapitler[aktiv].varighet;
        spiller = false;
        if (autoNext.checked && aktiv < kapitler.length - 1) autoTimer = wall + 1800;
        oppdaterUi();
      }
    }
    if (autoTimer !== null && wall >= autoTimer) vis(aktiv + 1);
    boilClock += dt;
    render();
    const bi = Math.floor(boilClock / (1000 / CONFIG.boilFps)) % CONFIG.boilVariants;
    if (bi !== boilIndex) { boilIndex = bi; M.applyBoil(bi); }
    requestAnimationFrame(frame);
  };
  oppdaterUi();
  requestAnimationFrame(frame);
}
reduced.addEventListener('change', () => location.reload(), { once: true });
})();
