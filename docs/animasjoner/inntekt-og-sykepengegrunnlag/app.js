(() => {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const SIDER = ["før", "etter"];
  const BREDDE = 1000;
  const HØYDE = 590;

  const NODER = {
    speil: { x: 110, y: 60, navn: "Speil", under: "saksbehandler", boble: "under" },
    spesialist: { x: 370, y: 60, navn: "Spesialist", under: "godkjenning og totrinn", boble: "over" },
    spinnvill: { x: 630, y: 60, navn: "Spinnvill", under: "avviksvurdering", boble: "under", status: { etter: "fjernes" } },
    spregulering: { x: 880, y: 60, navn: "Spregulering", under: "grunnbeløpsregulering", boble: "under", status: { etter: "fjernes" } },
    spleis: { x: 290, y: 300, w: 220, h: 130, navn: "Spleis", stor: true },
    sprk: { x: 885, y: 195, navn: "sp-rettighetskategori", under: "rettighetskategori", boble: "venstre" },
    spvilk: { x: 885, y: 330, navn: "sp-vilkarsproving", under: "medlemskap og opptjening", boble: "venstre" },
    spspg: { x: 640, y: 200, navn: "sp-sykepengegrunnlag", under: "grunnlag, avvik, skjønn", boble: "over", status: { før: "mangler", etter: "ny" } },
    spinntekt: { x: 640, y: 405, navn: "sp-inntekt", under: "inntektsavklaring", boble: "over-høyre", status: { før: "mangler", etter: "ny" } },
    soknad: { x: 100, y: 530, navn: "Søknad", under: "sykepengesoknad-backend", boble: "over" },
    im: { x: 300, y: 530, navn: "Inntektsmelding", under: "Spedisjon", boble: "over" },
    sigrun: { x: 500, y: 530, navn: "Sigrun", under: "pensjonsgivende inntekt", boble: "over" },
    aordningen: { x: 700, y: 530, navn: "A-ordningen", under: "via sparkel-inntekt", boble: "over" },
    aareg: { x: 900, y: 530, navn: "Aa-registeret", under: "arbeidsforhold", boble: "over" },
  };
  for (const node of Object.values(NODER)) {
    node.w ??= 180;
    node.h ??= 54;
  }

  const TILSTANDER = [
    { id: "AVVENTER_INNTEKTSMELDING", navn: "Inntektsmelding" },
    { id: "AVVENTER_BLOKKERENDE_PERIODE", navn: "Blokkerende periode" },
    { id: "AVVENTER_INNTEKTSAVKLARING", navn: "Inntektsavklaring", ny: true },
    { id: "AVVENTER_RETTIGHETSKATEGORI", navn: "Rettighetskategori" },
    { id: "AVVENTER_SYKEPENGEGRUNNLAG", navn: "Sykepengegrunnlag", ny: true },
    { id: "AVVENTER_VILKÅRSPRØVING", navn: "Vilkårsprøving" },
    { id: "AVVENTER_HISTORIKK", navn: "Historikk (beregning)" },
    { id: "AVVENTER_SIMULERING", navn: "Simulering" },
    { id: "AVVENTER_GODKJENNING", navn: "Godkjenning" },
  { id: "AVVENTER_REVURDERING", navn: "Revurdering", revurdering: true },
  { id: "AVVENTER_HISTORIKK_REVURDERING", navn: "Historikk (revurdering)", revurdering: true },
  { id: "AVVENTER_SIMULERING_REVURDERING", navn: "Simulering (revurdering)", revurdering: true },
  { id: "AVVENTER_GODKJENNING_REVURDERING", navn: "Godkjenning (revurdering)", revurdering: true },
    { id: "TIL_UTBETALING", navn: "Til utbetaling", slutt: true },
    { id: "AVSLUTTET", navn: "Avsluttet", slutt: true },
    { id: "TIL_INFOTRYGD", navn: "Til Infotrygd", slutt: true },
  ];
  const tilstandsnavn = (id) => {
    const t = TILSTANDER.find((it) => it.id === id);
    if (!t) return "–";
    return t.slutt ? t.navn : `Avventer ${t.navn.toLowerCase()}`;
  };

  const TYPENAVN = { behov: "Behov", løsning: "Løsning", hendelse: "Hendelse", http: "HTTP", intern: "Internt", varsel: "Varsel" };
  const KORTREKKEFØLGE = ["spleis", "spinntekt", "sprk", "spspg", "spinnvill", "spregulering", "spesialist"];

  const VARIGHET = { reise: 1150, mellom: 260, internt: 900, pause: 1700 };

  class Avbrutt extends Error {}

  const el = (navn, attrs = {}, forelder) => {
    const e = document.createElementNS(SVG_NS, navn);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (forelder) forelder.appendChild(e);
    return e;
  };
  const html = (navn, klasse, tekst) => {
    const e = document.createElement(navn);
    if (klasse) e.className = klasse;
    if (tekst != null) e.textContent = tekst;
    return e;
  };

  const tilstand = {
    scenario: null,
    takt: -1,
    spiller: false,
    fart: 1,
    kjøring: 0,
    ferdig: true,
  };

  const sjekk = (kjøring) => {
    if (kjøring !== tilstand.kjøring) throw new Avbrutt();
  };

  const vent = (ms, kjøring) =>
    new Promise((resolve, reject) => {
      setTimeout(() => (kjøring !== tilstand.kjøring ? reject(new Avbrutt()) : resolve()), ms / tilstand.fart);
    });

  const meldingerI = (side) => (side?.meldinger ?? []).map((m) => (Array.isArray(m) ? m : [m]));

  function senter(node) {
    return { x: node.x, y: node.y };
  }

  function kant(node, mot, margin = 5) {
    const dx = mot.x - node.x;
    const dy = mot.y - node.y;
    const hw = node.w / 2 + margin;
    const hh = node.h / 2 + margin;
    const t = Math.min(dx === 0 ? Infinity : hw / Math.abs(dx), dy === 0 ? Infinity : hh / Math.abs(dy));
    return { x: node.x + dx * t, y: node.y + dy * t };
  }

  const punktPåKurve = (a, k, b, t) => ({
    x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * k.x + t * t * b.x,
    y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * k.y + t * t * b.y,
  });

  const inniNode = (p, node, pad = 8) =>
    Math.abs(p.x - node.x) < node.w / 2 + pad && Math.abs(p.y - node.y) < node.h / 2 + pad;

  function rute(fraId, tilId) {
    const fra = NODER[fraId];
    const til = NODER[tilId];
    const a = senter(fra);
    const b = senter(til);
    const midt = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const n = { x: -(b.y - a.y) / len, y: (b.x - a.x) / len };
    const andre = Object.entries(NODER).filter(([id]) => id !== fraId && id !== tilId).map(([, node]) => node);
    let beste = null;
    for (const bøy of [22, 60, -60, 110, -110, 170, -170, 240, -240, 320, -320]) {
      const k = { x: midt.x + n.x * bøy * 2, y: midt.y + n.y * bøy * 2 };
      const start = kant(fra, k);
      const slutt = kant(til, k);
      const kandidat = { start, k, slutt };
      beste ??= kandidat;
      let fri = true;
      for (let i = 1; i < 40 && fri; i++) {
        const p = punktPåKurve(start, k, slutt, i / 40);
        if (p.y < 4 || p.y > HØYDE - 4 || p.x < 4 || p.x > BREDDE - 4) fri = false;
        if (andre.some((node) => inniNode(p, node))) fri = false;
      }
      if (fri) return kandidat;
    }
    return beste;
  }

  class Side {
    constructor(rot, nøkkel) {
      this.nøkkel = nøkkel;
      this.rot = rot;
      this.diagram = rot.querySelector(".diagram");
      this.tilstandsrad = rot.querySelector(".tilstander");
      this.fortelling = rot.querySelector(".fortelling-tekst");
      this.logg = rot.querySelector(".logg");
      this.kort = rot.querySelector(".kort");
      this.byggDiagram();
    }

    byggDiagram() {
      const svg = el("svg", { viewBox: `0 0 ${BREDDE} ${HØYDE}`, class: "kart", role: "img" });
      const defs = el("defs", {}, svg);
      for (const type of Object.keys(TYPENAVN)) {
        const m = el("marker", { id: `pil-${this.nøkkel}-${type}`, viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" }, defs);
        el("path", { d: "M0,0 L10,5 L0,10 z", class: `pilhode type-${type}` }, m);
      }
      this.sporlag = el("g", { class: "sporlag" }, svg);
      this.nodelag = el("g", { class: "nodelag" }, svg);
      this.etikettlag = el("g", { class: "etikettlag" }, svg);
      this.boblelag = el("g", { class: "boblelag" }, svg);
      this.reiselag = el("g", { class: "reiselag" }, svg);
      this.noder = {};
      for (const [id, node] of Object.entries(NODER)) {
        const status = node.status?.[this.nøkkel] ?? "aktiv";
        const g = el("g", { class: `node node-${status} ${node.stor ? "node-stor" : ""}`, "data-id": id, transform: `translate(${node.x - node.w / 2},${node.y - node.h / 2})` }, this.nodelag);
        el("rect", { width: node.w, height: node.h, rx: node.stor ? 14 : 10, class: "boks" }, g);
        if (node.stor) {
          el("text", { x: node.w / 2, y: 28, class: "navn stor" }, g).textContent = node.navn;
          el("text", { x: node.w / 2, y: 52, class: "under" }, g).textContent = "tilstand";
          el("rect", { x: 14, y: 60, width: node.w - 28, height: 28, rx: 14, class: "tilstandspille" }, g);
          this.spleisTilstand = el("text", { x: node.w / 2, y: 79, class: "tilstandstekst" }, g);
          this.spleisIntern = el("text", { x: node.w / 2, y: 114, class: "spleis-intern" }, g);
        } else {
          el("text", { x: node.w / 2, y: node.under ? 23 : 32, class: "navn" }, g).textContent = node.navn;
          if (node.under) el("text", { x: node.w / 2, y: 41, class: "under" }, g).textContent = status === "mangler" ? "finnes ikke i dag" : node.under;
        }
        if (status === "ny" || status === "fjernes") {
          const merke = el("g", { class: `statusmerke statusmerke-${status}`, transform: `translate(${node.w - 14},-9)` }, g);
          const tekst = status === "ny" ? "NY" : "FJERNES";
          const bredde = tekst.length * 7.2 + 12;
          el("rect", { x: -bredde, y: 0, width: bredde, height: 18, rx: 9 }, merke);
          el("text", { x: -bredde / 2, y: 13 }, merke).textContent = tekst;
        }
        this.noder[id] = g;
      }
      this.diagram.appendChild(svg);
      this.svg = svg;

      this.tilstandsrad.innerHTML = "";
      this.tilstandschips = {};
      for (const t of TILSTANDER) {
        if (t.ny && this.nøkkel === "før") continue;
        const chip = html("span", `tilstand ${t.ny ? "tilstand-ny" : ""} ${t.slutt ? "tilstand-slutt" : ""}`);
        chip.title = t.id;
        chip.append(html("small", "", t.slutt ? "" : "Avventer"), html("b", "", t.navn));
        this.tilstandsrad.appendChild(chip);
        this.tilstandschips[t.id] = chip;
      }
    }

    markerInvolverte(scenario) {
      const brukte = new Set(["spleis"]);
      for (const takt of scenario.takter) {
        for (const gruppe of meldingerI(takt[this.nøkkel])) for (const m of gruppe) brukte.add(m.fra).add(m.til);
      }
      for (const [id, g] of Object.entries(this.noder)) g.classList.toggle("uinvolvert", !brukte.has(id));
      const brukteTilstander = new Set();
      for (const takt of scenario.takter) {
        for (const gruppe of meldingerI(takt[this.nøkkel])) for (const m of gruppe) if (m.tilstand) brukteTilstander.add(m.tilstand);
      }
      for (const t of TILSTANDER) {
        const vis = scenario.revurdering ? brukteTilstander.has(t.id) || t.slutt : !t.revurdering;
        this.tilstandschips[t.id]?.classList.toggle("skjult", !vis);
      }
    }

    nullstill() {
      this.sporlag.replaceChildren();
      this.etikettlag.replaceChildren();
      this.boblelag.replaceChildren();
      this.reiselag.replaceChildren();
      this.spleisIntern.textContent = "";
      this.spleisIntern.classList.remove("varsel");
      this.bobler = {};
      this.etiketter = [];
      this.logg.replaceChildren();
      for (const g of Object.values(this.noder)) g.classList.remove("aktiv", "puls");
    }

    visTilstand(tilstandId, besøkt, animer) {
      this.spleisTilstand.textContent = tilstandsnavn(tilstandId);
      this.noder.spleis.classList.toggle("forkastet", tilstandId === "TIL_INFOTRYGD");
      for (const [id, chip] of Object.entries(this.tilstandschips)) {
        chip.classList.toggle("besøkt", besøkt.has(id));
        chip.classList.toggle("nå", id === tilstandId);
      }
      if (animer) this.puls("spleis");
    }

    visLagret(lagret, oppdaterte) {
      this.kort.replaceChildren();
      const ider = KORTREKKEFØLGE.filter((id) => lagret[id]);
      if (ider.length === 0) this.kort.append(html("p", "tomt", "Ingenting lagret ennå."));
      for (const id of ider) {
        const kort = html("div", `datakort ${oppdaterte.has(id) ? "oppdatert" : ""} kort-${id}`);
        kort.append(html("h4", "", NODER[id].navn));
        const ul = html("ul");
        for (const linje of lagret[id]) ul.append(html("li", linje.startsWith("•") ? "punkt" : "", linje.replace(/^• /, "")));
        kort.append(ul);
        this.kort.append(kort);
      }
    }

    puls(id) {
      const g = this.noder[id];
      g.classList.remove("puls");
      void g.getBBox();
      g.classList.add("puls");
    }

    loggfør(m) {
      const li = html("li", `type-${m.type}`);
      li.append(html("span", "loggtype", TYPENAVN[m.type]));
      const retning = m.fra === m.til ? NODER[m.fra].navn : `${NODER[m.fra].navn} → ${NODER[m.til].navn}`;
      li.append(html("span", "loggtekst", m.tekst));
      li.append(html("span", "loggretning", m.detalj ? `${retning} · ${m.detalj}` : retning));
      this.logg.append(li);
    }

    pille(tekst, type, forelder, liten = false) {
      const g = el("g", { class: `pille type-${type} ${liten ? "liten" : ""}` }, forelder);
      const rect = el("rect", { rx: liten ? 8 : 11 }, g);
      const t = el("text", { x: 0, y: liten ? 4 : 4.5 }, g);
      t.textContent = tekst;
      const b = t.getBBox();
      const px = liten ? 7 : 10;
      const h = liten ? 18 : 23;
      rect.setAttribute("x", -b.width / 2 - px);
      rect.setAttribute("y", -h / 2);
      rect.setAttribute("width", b.width + px * 2);
      rect.setAttribute("height", h);
      g.bredde = b.width + px * 2;
      g.høyde = h;
      return g;
    }

    plasserEtikett(m, r) {
      const g = this.pille(m.tekst, m.type, this.etikettlag, true);
      const overlapper = (p) =>
        this.etiketter.some((e) => Math.abs(e.x - p.x) < (e.w + g.bredde) / 2 + 2 && Math.abs(e.y - p.y) < (e.h + g.høyde) / 2 + 2) ||
        Object.values(NODER).some((node) => Math.abs(p.x - node.x) < node.w / 2 + g.bredde / 2 - 4 && Math.abs(p.y - node.y) < node.h / 2 + g.høyde / 2 - 2);
      let valgt = null;
      for (const t of [0.5, 0.4, 0.6, 0.3, 0.7, 0.22, 0.78]) {
        const p = punktPåKurve(r.start, r.k, r.slutt, t);
        if (!overlapper(p)) {
          valgt = p;
          break;
        }
      }
      if (!valgt) {
        const p = punktPåKurve(r.start, r.k, r.slutt, 0.5);
        valgt = { x: p.x, y: p.y + 14 };
      }
      g.setAttribute("transform", `translate(${valgt.x},${valgt.y})`);
      this.etiketter.push({ x: valgt.x, y: valgt.y, w: g.bredde, h: g.høyde });
    }

    tegnSpor(m, r) {
      return el("path", { d: `M${r.start.x},${r.start.y} Q${r.k.x},${r.k.y} ${r.slutt.x},${r.slutt.y}`, class: `spor type-${m.type}` }, this.sporlag);
    }

    visBoble(m) {
      if (m.fra === "spleis") {
        this.spleisIntern.textContent = `▸ ${m.tekst}`;
        this.spleisIntern.classList.toggle("varsel", m.type === "varsel");
        return;
      }
      this.bobler[m.fra]?.remove();
      const node = NODER[m.fra];
      const g = this.pille(m.type === "varsel" ? `⚠ ${m.tekst}` : m.tekst, m.type, this.boblelag);
      g.classList.add("boble");
      let x = node.x;
      let y = node.y;
      switch (node.boble) {
        case "venstre":
          x = node.x - node.w / 2 - g.bredde / 2 - 8;
          break;
        case "under":
          y = node.y + node.h / 2 + 16;
          break;
        case "over-høyre":
          x = node.x + node.w / 2 - g.bredde / 2;
          y = node.y - node.h / 2 - 16;
          break;
        case "under-høyre":
          x = node.x + node.w / 2 - g.bredde / 2;
          y = node.y + node.h / 2 + 16;
          break;
        default:
          y = node.y - node.h / 2 - 16;
      }
      g.setAttribute("transform", `translate(${x},${y})`);
      this.bobler[m.fra] = g;
    }

    tegnStatisk(m) {
      this.loggfør(m);
      this.noder[m.fra].classList.add("aktiv");
      this.noder[m.til].classList.add("aktiv");
      if (m.fra === m.til) {
        this.visBoble(m);
        return;
      }
      const r = rute(m.fra, m.til);
      const spor = this.tegnSpor(m, r);
      spor.setAttribute("marker-end", `url(#pil-${this.nøkkel}-${m.type})`);
      this.plasserEtikett(m, r);
    }

    async spillMelding(m, kjøring, effekter) {
      this.loggfør(m);
      this.noder[m.fra].classList.add("aktiv");
      if (m.tilstand) effekter.tilstand(m);
      if (m.fra === m.til) {
        this.visBoble(m);
        this.puls(m.fra);
        effekter.lagre(m);
        await vent(VARIGHET.internt, kjøring);
        return;
      }
      const r = rute(m.fra, m.til);
      const spor = this.tegnSpor(m, r);
      const lengde = spor.getTotalLength();
      spor.style.strokeDasharray = `${lengde}`;
      spor.style.strokeDashoffset = `${lengde}`;
      const pille = this.pille(m.tekst, m.type, this.reiselag);
      const varighet = VARIGHET.reise / tilstand.fart;
      await new Promise((resolve, reject) => {
        const start = performance.now();
        const steg = (nå) => {
          if (kjøring !== tilstand.kjøring) return reject(new Avbrutt());
          const t = Math.min(1, (nå - start) / varighet);
          const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          const p = spor.getPointAtLength(lengde * e);
          pille.setAttribute("transform", `translate(${p.x},${p.y})`);
          spor.style.strokeDashoffset = `${lengde * (1 - e)}`;
          if (t < 1) requestAnimationFrame(steg);
          else resolve();
        };
        requestAnimationFrame(steg);
      });
      pille.remove();
      spor.style.strokeDasharray = "";
      spor.style.strokeDashoffset = "";
      spor.setAttribute("marker-end", `url(#pil-${this.nøkkel}-${m.type})`);
      this.plasserEtikett(m, r);
      this.noder[m.til].classList.add("aktiv");
      this.puls(m.til);
      effekter.lagre(m);
    }
  }

  const sider = Object.fromEntries(SIDER.map((s) => [s, new Side(document.querySelector(`.side[data-side="${s}"]`), s)]));

  function nyHistorikk() {
    return { tilstand: null, besøkt: new Set(), lagret: {}, oppdaterte: new Set() };
  }

  function brukMelding(h, m, { tilstandOgså = true } = {}) {
    if (tilstandOgså && m.tilstand) {
      h.tilstand = m.tilstand;
      h.besøkt.add(m.tilstand);
    }
    if (m.lagre) {
      for (const [id, linjer] of Object.entries(m.lagre)) {
        h.lagret[id] = linjer;
        h.oppdaterte.add(id);
      }
    }
  }

  function historikkFør(nøkkel, taktIndeks) {
    const h = nyHistorikk();
    for (let i = 0; i < taktIndeks; i++) {
      for (const gruppe of meldingerI(tilstand.scenario.takter[i][nøkkel])) for (const m of gruppe) brukMelding(h, m);
    }
    h.oppdaterte.clear();
    return h;
  }

  function visTekster() {
    const sc = tilstand.scenario;
    const i = tilstand.takt;
    const takt = sc.takter[i];
    document.querySelector("#teller").textContent = i < 0 ? `Introduksjon · ${sc.takter.length} steg` : `Steg ${i + 1} av ${sc.takter.length}`;

    const intro = document.querySelector("#intro");
    intro.replaceChildren();
    intro.append(html("h2", "", sc.navn), html("p", "", sc.intro), html("p", "poeng", sc.poeng));
    intro.classList.toggle("kompakt", i >= 0);

    const forskjell = document.querySelector("#forskjell");
    forskjell.classList.toggle("skjult", !takt);
    forskjell.classList.toggle("lik", !!takt && /^Ingen forskjell|^Nesten ingen forskjell/.test(takt.forskjell));
    document.querySelector("#forskjell-tekst").textContent = takt?.forskjell ?? "";

    const faser = [...new Set(sc.takter.map((t) => t.fase))];
    const faseliste = document.querySelector("#faser");
    faseliste.replaceChildren();
    faser.forEach((fase, fi) => {
      const første = sc.takter.findIndex((t) => t.fase === fase);
      const harForskjell = sc.takter.some((t) => t.fase === fase && !/^Ingen forskjell/.test(t.forskjell));
      const li = html("li", `${takt?.fase === fase ? "nå" : ""} ${i >= 0 && første <= i ? "passert" : ""} ${harForskjell ? "ulik" : ""}`);
      const knapp = html("button", "", `${fi + 1}. ${fase}`);
      knapp.addEventListener("click", () => visTakt(første, tilstand.spiller));
      li.append(knapp);
      faseliste.append(li);
    });

    const relevante = new Set(sc.takter.flatMap((t) => t.rader));
    const nå = new Set(takt?.rader ?? []);
    for (const tr of document.querySelectorAll("#eierskap tr")) {
      tr.classList.toggle("nå", nå.has(tr.dataset.id));
      tr.classList.toggle("irrelevant", !relevante.has(tr.dataset.id));
    }

    for (const nøkkel of SIDER) {
      const side = takt?.[nøkkel];
      const s = sider[nøkkel];
      s.fortelling.textContent = !takt ? "Trykk «Spill av» eller → for å starte." : side?.tekst ?? "";
      s.rot.classList.toggle("ingenting", !!side?.tom);
      s.rot.classList.toggle("har-steg", !!takt && !side?.tom);
    }
  }

  function oppdaterUrl() {
    const p = new URLSearchParams();
    p.set("scenario", tilstand.scenario.id);
    p.set("steg", String(tilstand.takt + 1));
    if (tilstand.fart !== 1) p.set("fart", String(tilstand.fart));
    history.replaceState(null, "", `?${p}`);
  }

  async function visTakt(indeks, animer) {
    const sc = tilstand.scenario;
    indeks = Math.max(-1, Math.min(sc.takter.length - 1, indeks));
    const kjøring = ++tilstand.kjøring;
    tilstand.takt = indeks;
    tilstand.ferdig = false;
    oppdaterUrl();
    visTekster();
    oppdaterSpillknapp();

    const historikk = {};
    for (const nøkkel of SIDER) {
      const s = sider[nøkkel];
      const h = historikkFør(nøkkel, Math.max(0, indeks));
      historikk[nøkkel] = h;
      s.nullstill();
      s.visTilstand(h.tilstand, h.besøkt, false);
      s.visLagret(h.lagret, h.oppdaterte);
    }
    if (indeks < 0) {
      tilstand.ferdig = true;
      return;
    }
    const takt = sc.takter[indeks];

    if (!animer) {
      for (const nøkkel of SIDER) {
        const s = sider[nøkkel];
        const h = historikk[nøkkel];
        for (const gruppe of meldingerI(takt[nøkkel])) {
          for (const m of gruppe) {
            s.tegnStatisk(m);
            brukMelding(h, m);
          }
        }
        s.visTilstand(h.tilstand, h.besøkt, false);
        s.visLagret(h.lagret, h.oppdaterte);
      }
      tilstand.ferdig = true;
      return;
    }

    try {
      await Promise.all(
        SIDER.map(async (nøkkel) => {
          const s = sider[nøkkel];
          const h = historikk[nøkkel];
          const effekter = {
            tilstand: (m) => {
              brukMelding(h, { tilstand: m.tilstand });
              s.visTilstand(h.tilstand, h.besøkt, true);
            },
            lagre: (m) => {
              if (!m.lagre) return;
              brukMelding(h, { lagre: m.lagre });
              s.visLagret(h.lagret, h.oppdaterte);
            },
          };
          for (const gruppe of meldingerI(takt[nøkkel])) {
            sjekk(kjøring);
            await Promise.all(gruppe.map((m) => s.spillMelding(m, kjøring, effekter)));
            await vent(VARIGHET.mellom, kjøring);
          }
        }),
      );
      tilstand.ferdig = true;
      oppdaterSpillknapp();
      if (tilstand.spiller) {
        await vent(VARIGHET.pause, kjøring);
        if (indeks < sc.takter.length - 1) visTakt(indeks + 1, true);
        else {
          tilstand.spiller = false;
          oppdaterSpillknapp();
        }
      }
    } catch (e) {
      if (!(e instanceof Avbrutt)) throw e;
    }
  }

  function oppdaterSpillknapp() {
    const knapp = document.querySelector("#spill");
    const sist = tilstand.takt >= tilstand.scenario.takter.length - 1 && tilstand.ferdig;
    knapp.textContent = tilstand.spiller ? "⏸ Pause" : sist ? "↺ Spill av på nytt" : "▶ Spill av";
  }

  function spillEllerPause() {
    if (tilstand.spiller) {
      tilstand.spiller = false;
      oppdaterSpillknapp();
      return;
    }
    tilstand.spiller = true;
    const sist = tilstand.takt >= tilstand.scenario.takter.length - 1;
    if (sist) visTakt(0, true);
    else if (tilstand.ferdig) visTakt(tilstand.takt + 1, true);
    else oppdaterSpillknapp();
  }

  function velgScenario(id, takt = -1, animer = false) {
    const sc = window.SCENARIER.find((s) => s.id === id) ?? window.SCENARIER[0];
    tilstand.scenario = sc;
    for (const knapp of document.querySelectorAll("#scenarier button")) knapp.classList.toggle("valgt", knapp.dataset.id === sc.id);
    for (const s of Object.values(sider)) s.markerInvolverte(sc);
    visTakt(takt, animer);
  }

  function byggStatisk() {
    const nav = document.querySelector("#scenarier");
    window.SCENARIER.forEach((sc, i) => {
      const knapp = html("button", "", `${i + 1}. ${sc.navn}`);
      knapp.dataset.id = sc.id;
      knapp.addEventListener("click", () => {
        tilstand.spiller = false;
        velgScenario(sc.id);
      });
      nav.append(knapp);
    });
    const tbody = document.querySelector("#eierskap");
    for (const rad of window.EIERSKAP) {
      const tr = html("tr");
      tr.dataset.id = rad.id;
      tr.append(html("th", "", rad.hva), html("td", "", rad.før), html("td", "etter", rad.etter));
      tbody.append(tr);
    }

    document.querySelector("#spill").addEventListener("click", spillEllerPause);
    document.querySelector("#neste").addEventListener("click", () => visTakt(tilstand.takt + 1, true));
    document.querySelector("#forrige").addEventListener("click", () => {
      tilstand.spiller = false;
      visTakt(tilstand.takt - 1, false);
    });
    document.querySelector("#til-start").addEventListener("click", () => {
      tilstand.spiller = false;
      visTakt(-1, false);
    });
    document.querySelector("#igjen").addEventListener("click", () => visTakt(Math.max(0, tilstand.takt), true));
    const fart = document.querySelector("#fart");
    fart.addEventListener("change", () => {
      tilstand.fart = Number(fart.value);
      oppdaterUrl();
    });

    document.addEventListener("keydown", (e) => {
      if (e.target instanceof HTMLSelectElement) return;
      if (e.key === "ArrowRight") visTakt(tilstand.takt + 1, true);
      else if (e.key === "ArrowLeft") {
        tilstand.spiller = false;
        visTakt(tilstand.takt - 1, false);
      } else if (e.key === " ") {
        e.preventDefault();
        spillEllerPause();
      } else if (e.key === "Home") visTakt(-1, false);
      else if (e.key === "r") visTakt(Math.max(0, tilstand.takt), true);
      else if (/^[1-9]$/.test(e.key) && window.SCENARIER[Number(e.key) - 1]) {
        tilstand.spiller = false;
        velgScenario(window.SCENARIER[Number(e.key) - 1].id);
      }
    });
  }

  byggStatisk();
  const params = new URLSearchParams(location.search);
  if (params.has("fart")) {
    tilstand.fart = Number(params.get("fart")) || 1;
    document.querySelector("#fart").value = String(tilstand.fart);
  }
  const autoplay = params.get("spill") === "1";
  tilstand.spiller = autoplay;
  const steg = Number(params.get("steg") ?? 0) - 1;
  velgScenario(params.get("scenario"), autoplay ? Math.max(0, steg) : steg, autoplay);

  window.skisse = {
    visTakt,
    velgScenario,
    get tilstand() {
      return { scenario: tilstand.scenario.id, takt: tilstand.takt, antall: tilstand.scenario.takter.length, ferdig: tilstand.ferdig, spiller: tilstand.spiller };
    },
    scenarier: () => window.SCENARIER.map((s) => ({ id: s.id, antall: s.takter.length })),
  };
})();
