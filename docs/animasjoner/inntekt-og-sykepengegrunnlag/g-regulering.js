(() => {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const GAMMEL_G = 130160;
  const NY_G = 136549;
  const kr = (n) => `${Math.round(n).toLocaleString("nb-NO").replace(/,/g, " ")} kr`;

  const el = (navn, attrs = {}, forelder) => {
    const e = document.createElementNS(SVG_NS, navn);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (forelder) forelder.appendChild(e);
    return e;
  };
  const tekst = (forelder, x, y, innhold, attrs = {}) => {
    const t = el("text", { x, y, ...attrs }, forelder);
    t.textContent = innhold;
    return t;
  };

  const PERSONER = [
    {
      id: "lise",
      navn: "Lise",
      om: "arbeidstaker, 550 000 kr",
      stp: "2026-04-20",
      vedtak: "2026-05-05",
      fraSteg: 2,
      regulert: false,
      effekt: "Riktig G. Reguleres ikke.",
    },
    {
      id: "kari",
      navn: "Kari",
      om: "arbeidstaker, 600 000 kr",
      stp: "2026-05-04",
      vedtak: "2026-05-15",
      fraSteg: 3,
      regulert: true,
      effekt: "Grunnlaget er det samme: 600 000 kr",
    },
    {
      id: "ola",
      navn: "Ola",
      om: "arbeidstaker, 900 000 kr",
      stp: "2026-05-04",
      vedtak: "2026-05-20",
      fraSteg: 3,
      regulert: true,
      effekt: "780 960 → 819 294 kr · +147 kr/dag",
    },
    {
      id: "per",
      navn: "Per",
      om: "selvstendig næringsdrivende",
      stp: "2026-05-11",
      vedtak: "2026-05-22",
      fraSteg: 3,
      regulert: true,
      effekt: "571 741 → 599 806 kr",
    },
    {
      id: "anne",
      navn: "Anne",
      om: "skjønnsfastsatt til 600 000 kr",
      stp: "2026-05-18",
      vedtak: "2026-05-27",
      fraSteg: 3,
      regulert: true,
      effekt: "Skjønnet beholdes: 600 000 kr",
    },
    {
      id: "mia",
      navn: "Mia",
      om: "arbeidstaker, 700 000 kr",
      stp: "2026-05-25",
      vedtak: "2026-06-10",
      fraSteg: 6,
      regulert: false,
      nyG: true,
      effekt: "Får nytt G med en gang",
    },
  ];

  const pgi = { 2022: 480000, 2023: 510000, 2024: 540000 };
  const snittG = { 2022: 109784, 2023: 116239, 2024: 122225 };
  const selvstendigGrunnlag = (G) => {
    const år = Object.keys(pgi).map((y) => {
      const omregnet = (pgi[y] * G) / snittG[y];
      return Math.min(omregnet, 6 * G) + Math.max(0, Math.min(omregnet, 12 * G) - 6 * G) / 3;
    });
    return år.reduce((a, b) => a + b, 0) / år.length;
  };

  const SØYLER = [
    {
      navn: "Kari",
      om: "arbeidstaker",
      beregning: () => 600000,
      grunnlag: (G) => Math.min(600000, 6 * G),
      merknad: (etter) => (etter ? "Under 6G før og etter. Samme utbetaling." : "Under 6G. Grunnbeløpet påvirker ikke beløpet."),
    },
    {
      navn: "Ola",
      om: "arbeidstaker",
      beregning: () => 900000,
      grunnlag: (G) => Math.min(900000, 6 * G),
      merknad: (etter) => (etter ? "Taket flyttes opp. Dagsatsen går fra 3 004 til 3 151 kr." : "Over 6G. Grunnlaget er begrenset til 6G."),
    },
    {
      navn: "Per",
      om: "selvstendig",
      beregning: (G) => selvstendigGrunnlag(G),
      grunnlag: (G) => Math.min(selvstendigGrunnlag(G), 6 * G),
      merknad: (etter) =>
        etter
          ? "Inntektene omregnes med nytt G. Grunnlaget øker selv under 6G."
          : "Pensjonsgivende inntekt omregnes med G på sykmeldingstidspunktet (§ 8-35).",
    },
    {
      navn: "Anne",
      om: "skjønnsfastsatt",
      beregning: () => 720000,
      grunnlag: (G) => Math.min(600000, 6 * G),
      merknad: (etter) => (etter ? "Skjønnsfastsettelsen og avviket blir med uendret." : "Omregnet 720 000 kr, skjønnsfastsatt til 600 000 kr."),
    },
  ];

  const SAMMENLIGNING = [
    { hva: "Hvilket G grunnlaget er fastsatt med", før: "Spleis, og en kopi av 6G i Spregulering, lest fra utkast_til_vedtak", etter: "sp-sykepengegrunnlag, på grunnlaget", steg: [3] },
    { hva: "Tabellen over grunnbeløp", før: "Spleis", etter: "Spleis og sp-sykepengegrunnlag. Nytt G legges inn begge steder.", steg: [4] },
    { hva: "Minsteinntekt (½G, § 8-3)", før: "Spleis", etter: "Spleis, uendret", steg: [4], lik: true },
    { hva: "Når jobben kjører", før: "Ved midnatt eller ved kjør_grunnbeløpsregulering fra Spout", etter: "Samme", steg: [5], lik: true },
    { hva: "Hvordan feil G blir funnet", før: "Spregulering antar at største 6G den har sett i samme periode, er riktig, eller får riktig G oppgitt for hånd", etter: "sp-sykepengegrunnlag sammenligner G på grunnlaget med tabellen sin", steg: [5] },
    { hva: "Hvem regner ut nytt grunnlag", før: "Spleis, etter grunnbeløpsregulering fra Spregulering", etter: "sp-sykepengegrunnlag, som sender endret_sykepengegrunnlag", steg: [5] },
    { hva: "Selvstendig næringsdrivende", før: "Ikke støttet. 21 saker måtte tas for hånd i 2026.", etter: "Reguleres som alle andre", steg: [5, 7] },
    { hva: "Skjønnsfastsatte grunnlag", før: "Skjønnsfastsatt beløp beholdes", etter: "Skjønnsfastsettelse og avviksvurdering blir med uendret", steg: [7], lik: true },
    { hva: "Spor etter reguleringen", før: "Nytt vilkårsgrunnlag i Spleis og taggen Grunnbeløpsregulering i Spesialist. Spinnvill spørres på nytt.", etter: "Nytt grunnlag med kilde grunnbeløpsregulering og historikk", steg: [5] },
    { hva: "Hoppes over", før: "Infotrygd og skjæringstidspunkt før 21. september 2020", etter: "Samme", steg: [5], lik: true },
  ];

  const STEG = [
    {
      tittel: "Grunnbeløpet endres 1. mai",
      tekst: "Grunnbeløpet (G) reguleres hvert år med virkning fra 1. mai. Det nye beløpet blir vedtatt og lagt inn senere – i 2026 rundt 1. juni. Sykepengegrunnlaget skal bruke grunnbeløpet som gjelder på skjæringstidspunktet.",
      nå: "2026-04-30",
    },
    {
      tittel: "Før 1. mai er det gamle G riktig",
      tekst: "Lise har skjæringstidspunkt 20. april. Grunnlaget hennes skal bruke G = 130 160 kr, både før og etter at det nye G kommer. Hun blir aldri regulert.",
      nå: "2026-05-06",
    },
    {
      tittel: "I mai får sakene gammelt G",
      tekst: "Saker med skjæringstidspunkt fra 1. mai som får vedtak før det nye G er lagt inn, bruker G = 130 160 kr, fordi det er det eneste systemet kjenner. Grunnlaget er riktig ut fra det vi visste, men blir feil når det nye G kommer.",
      nå: "2026-05-31",
    },
    {
      tittel: "Nytt G legges inn",
      tekst: "G = 136 549 kr legges inn, med virkning fra 1. mai. Nå har fire grunnlag feil grunnbeløp. Kravet til minsteinntekt (½G) bruker det nye G først fra 1. juni, så ingen mister retten til sykepenger fordi grunnbeløpet øker.",
      nå: "2026-06-01",
    },
    {
      tittel: "Reguleringen",
      tekst: "Natt til 2. juni finner en jobb alle grunnlag med feil grunnbeløp og lager et nytt grunnlag med riktig G. Spleis revurderer og etterbetaler. I dag gjør Spregulering og Spleis dette sammen. Etter specene gjør sp-sykepengegrunnlag det alene, og Spleis får beskjed med endret_sykepengegrunnlag.",
      nå: "2026-06-02",
    },
    {
      tittel: "Etter at nytt G er lagt inn",
      tekst: "Mia får vedtak 10. juni. Grunnlaget hennes bruker det nye G med en gang, så hun trenger ingen regulering.",
      nå: "2026-06-16",
    },
    {
      tittel: "Hvem merker det?",
      tekst: "Alle med feil G får et nytt grunnlag, men bare noen får mer utbetalt: de som er begrenset av 6G, og selvstendig næringsdrivende, der inntekten omregnes med G. Under 6G endres ikke beløpet for arbeidstakere. Et skjønnsfastsatt beløp under 6G endres heller ikke.",
      nå: "2026-06-16",
      fokus: "graf",
    },
    {
      tittel: "I dag og etter specene",
      tekst: "Reglene og resultatet er de samme. Forskjellen er hvem som vet hvilket G som er brukt, og hvem som regner ut det nye grunnlaget. Etter specene er det sp-sykepengegrunnlag alene, og selvstendig næringsdrivende blir med automatisk.",
      nå: "2026-06-16",
      fokus: "tabell",
    },
  ];

  const tilstand = { steg: 0, spiller: false, timer: null };

  // Tidslinje
  const TL = { b: 1400, h: 420, venstre: 250, høyre: 1110, fra: new Date("2026-04-13"), til: new Date("2026-06-20"), radTopp: 120, radH: 46 };
  const xFor = (dato) => TL.venstre + ((new Date(dato) - TL.fra) / (TL.til - TL.fra)) * (TL.høyre - TL.venstre);
  const tlSvg = el("svg", { viewBox: `0 0 ${TL.b} ${TL.h}`, class: "tl" });
  document.getElementById("tidslinje").appendChild(tlSvg);

  const datoTekst = (d) => new Date(d).toLocaleDateString("nb-NO", { day: "numeric", month: "short" });

  function byggTidslinje() {
    const akse = el("g", { class: "akse" }, tlSvg);
    for (let d = new Date(TL.fra); d <= TL.til; d.setDate(d.getDate() + 1)) {
      const x = xFor(d);
      const mandag = d.getDay() === 1;
      if (d.getDate() === 1 || mandag) {
        el("line", { x1: x, x2: x, y1: 96, y2: TL.radTopp + PERSONER.length * TL.radH, class: d.getDate() === 1 ? "månedslinje" : "ukelinje" }, akse);
      }
      if (mandag) tekst(akse, x, 112, datoTekst(d), { class: "datotekst" });
    }

    const gGamma = el("g", { class: "g-bånd" }, tlSvg);
    const x1mai = xFor("2026-05-01");
    el("rect", { x: TL.venstre, y: 30, width: x1mai - TL.venstre, height: 30, rx: 6, class: "g-gammel" }, gGamma);
    tekst(gGamma, (TL.venstre + x1mai) / 2, 50, `G ${kr(GAMMEL_G)}`, { class: "g-tekst" });
    const nyttBånd = el("g", { id: "nytt-g" }, gGamma);
    el("rect", { x: x1mai, y: 30, width: TL.høyre - x1mai, height: 30, rx: 6, class: "g-ny" }, nyttBånd);
    tlSvg.nyttGTekst = tekst(nyttBånd, (x1mai + TL.høyre) / 2, 50, "", { class: "g-tekst" });
    tekst(tlSvg, TL.venstre - 12, 50, "Grunnbeløp", { class: "radetikett", "text-anchor": "end" });

    const maiLinje = el("g", { class: "milepæl" }, tlSvg);
    el("line", { x1: x1mai, x2: x1mai, y1: 22, y2: TL.radTopp + PERSONER.length * TL.radH, class: "milepæl-linje" }, maiLinje);
    tekst(maiLinje, x1mai, 16, "1. mai: nytt G gjelder fra", { class: "milepæl-tekst" });

    const x1jun = xFor("2026-06-01");
    tlSvg.juniLinje = el("g", { class: "milepæl juni skjult" }, tlSvg);
    el("line", { x1: x1jun, x2: x1jun, y1: 22, y2: TL.radTopp + PERSONER.length * TL.radH, class: "milepæl-linje" }, tlSvg.juniLinje);
    tekst(tlSvg.juniLinje, x1jun, 16, "ca. 1. juni: nytt G lagt inn", { class: "milepæl-tekst" });

    const x2jun = xFor("2026-06-02");
    tlSvg.regulering = el("g", { class: "regulering skjult" }, tlSvg);
    el("rect", { x: x2jun - 4, y: 86, width: 8, height: PERSONER.length * TL.radH + 34, rx: 4, class: "reguleringsstrek" }, tlSvg.regulering);
    tekst(tlSvg.regulering, x2jun + 10, 80, "regulering natt til 2. juni", { class: "reguleringstekst" });

    tekst(tlSvg, TL.høyre + 30, 112, "Virkning", { class: "kolonnetittel" });

    PERSONER.forEach((p, i) => {
      const y = TL.radTopp + i * TL.radH + TL.radH / 2;
      const g = el("g", { class: "person skjult", "data-id": p.id }, tlSvg);
      if (i % 2 === 0) el("rect", { x: 0, y: y - TL.radH / 2, width: TL.b, height: TL.radH, class: "stripe" }, g);
      tekst(g, 16, y - 3, p.navn, { class: "personnavn" });
      tekst(g, 16, y + 13, p.om, { class: "personom" });
      const xs = xFor(p.stp);
      const xv = xFor(p.vedtak);
      p.linje = el("line", { x1: xs, x2: xs, y1: y, y2: y, class: "behandling" }, g);
      el("circle", { cx: xs, cy: y, r: 6, class: "stp" }, g);
      tekst(g, xs, y - 11, "skj.tidspunkt", { class: "stp-tekst" });
      p.merke = merke(g, xv, y);
      if (p.regulert) {
        const x = xFor("2026-06-07");
        p.pil = el("path", { d: `M${xv + 52},${y} C${xv + 80},${y - 18} ${x - 80},${y - 18} ${x - 62},${y}`, class: "reguleringspil skjult" }, g);
        p.nyttMerke = merke(g, x, y);
        p.nyttMerke.g.classList.add("skjult");
        settMerke(p.nyttMerke, "ny", `S2 · G ${kr(NY_G).replace(" kr", "")}`);
      }
      p.effekt = tekst(g, TL.høyre + 30, y + 5, p.effekt, { class: "effekt skjult" });
      p.g = g;
      p.y = y;
      p.xs = xs;
      p.xv = xv;
    });

    tlSvg.nå = el("g", { class: "nå" }, tlSvg);
    el("line", { x1: 0, x2: 0, y1: 66, y2: TL.radTopp + PERSONER.length * TL.radH + 6, class: "nå-linje" }, tlSvg.nå);
    const nåMerke = el("g", { transform: `translate(0,${TL.radTopp + PERSONER.length * TL.radH + 18})` }, tlSvg.nå);
    el("rect", { x: -22, y: -11, width: 44, height: 20, rx: 10, class: "nå-merke" }, nåMerke);
    tekst(nåMerke, 0, 4, "i dag", { class: "nå-tekst" });
    tlSvg.nå.x = xFor(STEG[0].nå);
    tlSvg.nå.setAttribute("transform", `translate(${tlSvg.nå.x},0)`);
  }

  function merke(forelder, x, y) {
    const g = el("g", { class: "merke", transform: `translate(${x},${y})` }, forelder);
    const rect = el("rect", { x: -52, y: -12, width: 104, height: 24, rx: 12 }, g);
    const t = tekst(g, 0, 4.5, "");
    return { g, rect, t };
  }

  function settMerke(m, type, innhold) {
    m.g.setAttribute("class", `merke merke-${type}`);
    m.t.textContent = innhold;
    const b = Math.max(80, innhold.length * 6.6 + 22);
    m.rect.setAttribute("x", -b / 2);
    m.rect.setAttribute("width", b);
  }

  // Graf
  const GR = { b: 760, h: 400, venstre: 150, høyre: 720, maks: 1000000, radTopp: 40, radH: 82 };
  const grX = (v) => GR.venstre + (v / GR.maks) * (GR.høyre - GR.venstre);
  const grafSvg = el("svg", { viewBox: `0 0 ${GR.b} ${GR.h}`, class: "graf" });
  document.getElementById("graf").appendChild(grafSvg);

  function byggGraf() {
    for (let v = 0; v <= GR.maks; v += 200000) {
      el("line", { x1: grX(v), x2: grX(v), y1: GR.radTopp - 8, y2: GR.radTopp + SØYLER.length * GR.radH, class: "rutenett" }, grafSvg);
      tekst(grafSvg, grX(v), GR.radTopp + SØYLER.length * GR.radH + 16, v === 0 ? "0" : `${v / 1000} k`, { class: "akseverdi" });
    }
    SØYLER.forEach((s, i) => {
      const y = GR.radTopp + i * GR.radH;
      tekst(grafSvg, GR.venstre - 12, y + 18, s.navn, { class: "søylenavn", "text-anchor": "end" });
      tekst(grafSvg, GR.venstre - 12, y + 34, s.om, { class: "søyleom", "text-anchor": "end" });
      s.ramme = el("rect", { x: GR.venstre, y: y + 4, height: 30, rx: 4, class: "beregning" }, grafSvg);
      s.fyll = el("rect", { x: GR.venstre, y: y + 4, height: 30, rx: 4, class: "grunnlag" }, grafSvg);
      s.tall = tekst(grafSvg, GR.venstre + 8, y + 24, "", { class: "søyletall" });
      s.merknadEl = tekst(grafSvg, GR.venstre, y + 54, "", { class: "søylemerknad" });
    });
    grafSvg.seksG = el("g", { class: "seksg" }, grafSvg);
    el("line", { x1: 0, x2: 0, y1: GR.radTopp - 14, y2: GR.radTopp + SØYLER.length * GR.radH - 30, class: "seksg-linje" }, grafSvg.seksG);
    grafSvg.seksGTekst = tekst(grafSvg.seksG, 0, GR.radTopp - 20, "", { class: "seksg-tekst" });
    grafSvg.G = GAMMEL_G;
    tegnGraf(GAMMEL_G, false);
  }

  function tegnGraf(G, etter) {
    grafSvg.seksG.setAttribute("transform", `translate(${grX(6 * G)},0)`);
    grafSvg.seksGTekst.textContent = `6G = ${kr(6 * G)}`;
    for (const s of SØYLER) {
      const b = s.beregning(G);
      const g = s.grunnlag(G);
      s.ramme.setAttribute("width", grX(b) - GR.venstre);
      s.fyll.setAttribute("width", grX(g) - GR.venstre);
      s.tall.textContent = `sykepengegrunnlag ${kr(g)}`;
      s.merknadEl.textContent = s.merknad(etter);
    }
  }

  let grafAnimasjon = 0;
  function animerGraf(tilG, etter, animer) {
    const fraG = grafSvg.G;
    const id = ++grafAnimasjon;
    document.getElementById("graf-status").textContent = etter ? "etter regulering" : "før regulering";
    document.getElementById("graf-status").className = `status ${etter ? "etter" : "før"}`;
    if (!animer || fraG === tilG) {
      grafSvg.G = tilG;
      tegnGraf(tilG, etter);
      return;
    }
    const start = performance.now();
    const varighet = 1600;
    const steg = (t) => {
      if (id !== grafAnimasjon) return;
      const p = Math.min(1, (t - start) / varighet);
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      grafSvg.G = fraG + (tilG - fraG) * e;
      tegnGraf(grafSvg.G, etter);
      if (p < 1) requestAnimationFrame(steg);
      else grafSvg.G = tilG;
    };
    requestAnimationFrame(steg);
  }

  // Tabell
  function byggTabell() {
    const tbody = document.getElementById("sammenligning");
    for (const r of SAMMENLIGNING) {
      const tr = document.createElement("tr");
      if (r.lik) tr.classList.add("lik");
      for (const [i, v] of [r.hva, r.før, r.etter].entries()) {
        const td = document.createElement(i === 0 ? "th" : "td");
        td.textContent = v;
        tr.appendChild(td);
      }
      r.tr = tr;
      tbody.appendChild(tr);
    }
  }

  // Steg
  let nåAnimasjon = 0;
  function flyttNå(til, animer) {
    const fra = tlSvg.nå.x;
    const id = ++nåAnimasjon;
    if (!animer) {
      tlSvg.nå.x = til;
      tlSvg.nå.setAttribute("transform", `translate(${til},0)`);
      return;
    }
    const start = performance.now();
    const varighet = 1200;
    const steg = (t) => {
      if (id !== nåAnimasjon) return;
      const p = Math.min(1, (t - start) / varighet);
      const e = 1 - Math.pow(1 - p, 3);
      tlSvg.nå.x = fra + (til - fra) * e;
      tlSvg.nå.setAttribute("transform", `translate(${tlSvg.nå.x},0)`);
      if (p < 1) requestAnimationFrame(steg);
    };
    requestAnimationFrame(steg);
  }

  function visSteg(i, animer) {
    tilstand.steg = Math.max(0, Math.min(STEG.length - 1, i));
    const nr = tilstand.steg + 1;
    const s = STEG[tilstand.steg];
    document.getElementById("steg-tittel").textContent = `${nr}. ${s.tittel}`;
    document.getElementById("steg-tekst").textContent = s.tekst;
    document.getElementById("teller").textContent = `Steg ${nr} av ${STEG.length}`;
    document.querySelectorAll("#faser li").forEach((li, j) => {
      li.classList.toggle("nå", j === tilstand.steg);
      li.classList.toggle("passert", j < tilstand.steg);
    });

    flyttNå(xFor(s.nå), animer);
    tlSvg.juniLinje.classList.toggle("skjult", nr < 4);
    tlSvg.regulering.classList.toggle("skjult", nr < 5);
    tlSvg.regulering.classList.toggle("puls", nr === 5 && animer);
    tlSvg.nyttGTekst.textContent = nr < 4 ? "nytt G ikke vedtatt ennå" : `G ${kr(NY_G)}`;
    document.getElementById("nytt-g").classList.toggle("ukjent", nr < 4);

    for (const p of PERSONER) {
      const synlig = nr >= p.fraSteg;
      const nyss = animer && nr === p.fraSteg;
      p.g.classList.toggle("skjult", !synlig);
      p.g.classList.toggle("inn", nyss);
      p.linje.setAttribute("x2", synlig ? p.xv : p.xs);
      if (nyss) {
        p.linje.setAttribute("x2", p.xs);
        p.merke.g.classList.add("skjult");
        const start = performance.now();
        const vokse = (t) => {
          const andel = Math.min(1, (t - start) / 800);
          p.linje.setAttribute("x2", p.xs + (p.xv - p.xs) * andel);
          if (andel < 1) requestAnimationFrame(vokse);
          else p.merke.g.classList.remove("skjult");
        };
        requestAnimationFrame(vokse);
      }
      let type = "gammel";
      let innhold = `G ${kr(GAMMEL_G).replace(" kr", "")}`;
      if (p.nyG) {
        type = "riktig";
        innhold = `G ${kr(NY_G).replace(" kr", "")} ✓`;
      } else if (!p.regulert) {
        type = "riktig";
        innhold = `G ${kr(GAMMEL_G).replace(" kr", "")} ✓`;
      } else if (nr >= 5) {
        type = "erstattet";
      } else if (nr >= 4) {
        type = "feil";
        innhold = `G ${kr(GAMMEL_G).replace(" kr", "")} ✗`;
      }
      settMerke(p.merke, type, innhold);
      if (!nyss) p.merke.g.classList.remove("skjult");
      if (p.regulert) {
        p.pil.classList.toggle("skjult", nr < 5);
        p.nyttMerke.g.classList.toggle("skjult", nr < 5);
        p.nyttMerke.g.classList.toggle("inn", nr === 5 && animer);
      }
      const visEffekt = p.regulert ? nr >= 5 : synlig;
      p.effekt.classList.toggle("skjult", !visEffekt);
    }

    animerGraf(nr >= 5 ? NY_G : GAMMEL_G, nr >= 5, animer && nr === 5);

    for (const r of SAMMENLIGNING) {
      const aktiv = s.fokus === "tabell" || r.steg.includes(nr);
      r.tr.classList.toggle("aktiv", aktiv);
      r.tr.classList.toggle("dempet", nr < 3 || (!aktiv && s.fokus !== "tabell" && !r.steg.some((x) => x < nr)));
    }
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("fokus"));
    if (s.fokus === "graf") document.getElementById("graf").closest(".panel").classList.add("fokus");
    if (s.fokus === "tabell") document.getElementById("sammenligning").closest(".panel").classList.add("fokus");

    const url = new URL(location.href);
    url.searchParams.set("steg", nr);
    history.replaceState(null, "", url);
  }

  function spill() {
    tilstand.spiller = !tilstand.spiller;
    document.getElementById("spill").textContent = tilstand.spiller ? "⏸ Pause" : "▶ Spill av";
    clearTimeout(tilstand.timer);
    if (!tilstand.spiller) return;
    if (tilstand.steg >= STEG.length - 1) visSteg(0, true);
    const neste = () => {
      tilstand.timer = setTimeout(() => {
        if (tilstand.steg >= STEG.length - 1) return spill();
        visSteg(tilstand.steg + 1, true);
        neste();
      }, 6000 / Number(new URLSearchParams(location.search).get("fart") ?? 1));
    };
    neste();
  }

  byggTidslinje();
  byggGraf();
  byggTabell();

  const faser = document.getElementById("faser");
  STEG.forEach((s, i) => {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.textContent = `${i + 1}. ${s.tittel}`;
    b.onclick = () => visSteg(i, true);
    li.appendChild(b);
    faser.appendChild(li);
  });

  document.getElementById("til-start").onclick = () => visSteg(0, false);
  document.getElementById("forrige").onclick = () => visSteg(tilstand.steg - 1, false);
  document.getElementById("neste").onclick = () => visSteg(tilstand.steg + 1, true);
  document.getElementById("spill").onclick = spill;
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") visSteg(tilstand.steg + 1, true);
    else if (e.key === "ArrowLeft") visSteg(tilstand.steg - 1, false);
    else if (e.key === "Home") visSteg(0, false);
    else if (e.key === " ") {
      e.preventDefault();
      spill();
    }
  });

  const params = new URLSearchParams(location.search);
  visSteg(Number(params.get("steg") ?? 1) - 1, false);
  if (params.get("spill") === "1") spill();

  window.gregulering = {
    visSteg: (nr) => visSteg(nr - 1, true),
    antall: STEG.length,
  };
})();
