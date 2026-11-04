const behov = (fra, til, tekst, ekstra = {}) => ({ fra, til, tekst, type: "behov", ...ekstra });
const løsning = (fra, til, tekst, ekstra = {}) => ({ fra, til, tekst, type: "løsning", ...ekstra });
const hendelse = (fra, til, tekst, ekstra = {}) => ({ fra, til, tekst, type: "hendelse", ...ekstra });
const http = (fra, til, tekst, ekstra = {}) => ({ fra, til, tekst, type: "http", ...ekstra });
const intern = (node, tekst, ekstra = {}) => ({ fra: node, til: node, tekst, type: "intern", ...ekstra });
const varsel = (node, tekst, ekstra = {}) => ({ fra: node, til: node, tekst, type: "varsel", ...ekstra });

const søknadOgInntektsmelding = (månedsinntekt) => {
  const side = {
    tekst: "Søknaden kommer inn, og Spleis venter på inntektsmeldingen. Når den kommer, legger Spleis den på behandlingen og bestemmer hvilken inntekt som skal brukes: inntektsmeldingen eller a-ordningen.",
    meldinger: [
      hendelse("soknad", "spleis", "søknad (arbeidstaker)", { tilstand: "AVVENTER_INNTEKTSMELDING" }),
      hendelse("im", "spleis", `inntektsmelding ${månedsinntekt}/mnd`, {
        tilstand: "AVVENTER_BLOKKERENDE_PERIODE",
        lagre: { spleis: [`Inntektsmelding: ${månedsinntekt}/mnd`, "(ligger på behandlingen)"] },
      }),
    ],
  };
  return {
    fase: "Søknad og inntektsmelding",
    før: side,
    etter: side,
    forskjell: "Ingen forskjell. Spleis tar imot søknaden og inntektsmeldingen som før, og bestemmer fortsatt om inntekten fra arbeidsgiveren eller fra a-ordningen skal brukes.",
    rader: ["im"],
  };
};

const ingenEgetSteg = (tekst) => ({ tekst, meldinger: [], tom: true });

const inntektsavklaringArbeidstaker = (månedsinntekt, sammenligning) => ({
  fase: "Inntekt",
  før: ingenEgetSteg("I dag finnes det ikke et eget steg for inntekt. Spleis henter inntekten fra a-ordningen selv i vilkårsprøvingen, og Spinnvill henter sammenligningsgrunnlaget først når saken skal godkjennes."),
  etter: {
    tekst: "Spleis ber sp-inntekt om en inntektsavklaring og sender med valget sitt: bruk inntektsmeldingen. sp-inntekt henter inntektsmeldingen, inntekten fra a-ordningen for 3 og 12 måneder og arbeidsforholdene, og lagrer alt samlet uten å regne på det. Svaret til Spleis er bare en ID.",
    meldinger: [
      behov("spleis", "spinntekt", "Inntektsavklaring", {
        tilstand: "AVVENTER_INNTEKTSAVKLARING",
        detalj: "ARBEIDSTAKER, inntektskilde ARBEIDSGIVER + meldingsreferanse",
      }),
      [
        http("spinntekt", "im", "hent inntektsmelding"),
        behov("spinntekt", "aordningen", "inntekter 3 + 12 mnd"),
        behov("spinntekt", "aareg", "ArbeidsforholdV2"),
      ],
      intern("spinntekt", "lagrer inntektsavklaring A1", {
        lagre: {
          spinntekt: [
            "Inntektsavklaring A1",
            `• arbeidsgiver 1: inntektsmelding ${månedsinntekt}/mnd`,
            "• a-ordningen: 3 måneder",
            `• sammenligningsgrunnlag: 12 mnd = ${sammenligning}`,
            "• arbeidsforhold fra Aa-registeret",
          ],
        },
      }),
      løsning("spinntekt", "spleis", "inntektsavklaringId A1", {
        lagre: { spleis: [`Inntektsmelding: ${månedsinntekt}/mnd`, "Vilkårsgrunnlag:", "• inntektsavklaringId = A1"] },
      }),
    ],
  },
  forskjell: "Nytt steg. Alle inntektene samles ett sted, og sp-inntekt eier dem. Spleis lagrer bare ID-en. Sammenligningsgrunnlaget for de siste 12 månedene hentes nå, ikke først ved godkjenning.",
  rader: ["im", "aord", "sammenligning"],
});

const rettighetskategori = (kategori, { forkast = false, spleisFør, spleisEtter } = {}) => {
  const lesbar = kategori.replaceAll("_", " ").toLowerCase();
  const lagSide = (behovtekst, tekst, spleisLagret) => ({
    tekst,
    meldinger: [
      behov("spleis", "sprk", behovtekst, { tilstand: "AVVENTER_RETTIGHETSKATEGORI" }),
      løsning("sprk", "spleis", `${kategori} (R1)`, {
        lagre: {
          sprk: ["Rettighetskategori R1", `• ${lesbar}`],
          ...(spleisLagret ? { spleis: spleisLagret } : {}),
        },
      }),
      ...(forkast ? [varsel("spleis", "forkaster hele tilfellet (RV_RK_1)", { tilstand: "TIL_INFOTRYGD" })] : []),
    ],
  });
  const tekst = forkast
    ? "sp-rettighetskategori svarer at personen er både arbeidstaker og selvstendig næringsdrivende. Kombinasjonen støttes ikke, så Spleis forkaster hele sykefraværstilfellet med RV_RK_1, og saken går til Infotrygd."
    : `sp-rettighetskategori avgjør rettighetskategorien: ${lesbar}. Spleis lagrer bare ID-en.`;
  return {
    fase: "Rettighetskategori",
    før: lagSide("Rettighetskategori", tekst, spleisFør),
    etter: lagSide("Rettighetskategori + inntektsavklaringId", tekst, spleisEtter),
    forskjell: forkast
      ? "Samme utfall: hele tilfellet forkastes og går til Infotrygd. Etter specene er inntektene allerede samlet når dette skjer."
      : "Nesten ingen forskjell. sp-rettighetskategori får også inntektsavklarings-ID-en, men bruker den ikke ennå.",
    rader: ["kategori"],
  };
};

const vedtak = () => {
  const side = {
    tekst: "Saksbehandler godkjenner i Speil, og Spleis sender utbetalingen videre. Vedtaket (vedtak_fattet) har de samme feltene som i dag.",
    meldinger: [
      hendelse("speil", "spesialist", "godkjenner"),
      løsning("spesialist", "spleis", "Godkjenning: godkjent", { tilstand: "TIL_UTBETALING" }),
      intern("spleis", "utbetalt", { tilstand: "AVSLUTTET" }),
    ],
  };
  return {
    fase: "Vedtak",
    før: side,
    etter: side,
    forskjell: "Ingen forskjell for den sykmeldte eller vedtaket. De som leser vedtaket, merker ikke byttet.",
    rader: [],
  };
};

window.SCENARIER = [
  {
    id: "arbeidstaker",
    navn: "Arbeidstaker",
    intro: "Kari er arbeidstaker hos én arbeidsgiver og blir sykmeldt 1. mars 2026. Arbeidsgiveren oppgir 50 000 kr i måneden i inntektsmeldingen. I a-ordningen har hun tjent 588 000 kr de siste tolv månedene. Grunnbeløpet er 130 160 kr, så 6G er 780 960 kr.",
    poeng: "Utfallet er det samme som i dag. Forskjellen er hvem som eier inntektene og grunnlaget, og når avviket vurderes.",
    takter: [
      søknadOgInntektsmelding("50 000 kr"),
      inntektsavklaringArbeidstaker("50 000 kr", "588 000 kr"),
      rettighetskategori("ARBEIDSTAKER", {
        spleisFør: ["Inntektsmelding: 50 000 kr/mnd", "Vilkårsgrunnlag (minimalt):", "• rettighetskategoriId = R1"],
        spleisEtter: ["Inntektsmelding: 50 000 kr/mnd", "Vilkårsgrunnlag:", "• inntektsavklaringId = A1", "• rettighetskategoriId = R1"],
      }),
      {
        fase: "Sykepengegrunnlag",
        før: ingenEgetSteg("I dag finnes det ikke et eget steg for sykepengegrunnlaget. Spleis regner det ut selv i vilkårsprøvingen."),
        etter: {
          tekst: "Spleis ber sp-sykepengegrunnlag fastsette grunnlaget. Tjenesten slår opp inntektene og rettighetskategorien, regner om til årsinntekt og sjekker 6G. Den gjør også avviksvurderingen med en gang: 600 000 kr mot 588 000 kr er 2,0 % avvik, som er innenfor 25 %.",
          meldinger: [
            behov("spleis", "spspg", "Sykepengegrunnlag", { tilstand: "AVVENTER_SYKEPENGEGRUNNLAG", detalj: "inntektsavklaringId A1, rettighetskategoriId R1" }),
            [http("spspg", "spinntekt", "hent inntektsavklaring A1"), behov("spspg", "sprk", "RettighetskategoriResultat")],
            intern("spspg", "600 000 kr · avvik 2,0 % ✓", {
              lagre: {
                spspg: [
                  "Sykepengegrunnlag S1",
                  "• omregnet årsinntekt 600 000 kr",
                  "• sykepengegrunnlag 600 000 kr (under 6G)",
                  "• avvik 2,0 % – akseptabelt",
                ],
              },
            }),
            løsning("spspg", "spleis", "FASTSATT (S1)", {
              lagre: { spleis: ["Inntektsmelding: 50 000 kr/mnd", "Vilkårsgrunnlag:", "• inntektsavklaringId = A1", "• rettighetskategoriId = R1", "• sykepengegrunnlagId = S1"] },
            }),
          ],
        },
        forskjell: "Nytt steg. Sykepengegrunnlaget og avviksvurderingen får én eier og én ID. Avviket er kjent før Spleis beregner utbetalingen.",
        rader: ["grunnlag", "avvik"],
      },
      {
        fase: "Vilkårsprøving",
        før: {
          tekst: "Spleis henter inntekten fra a-ordningen og arbeidsforholdene selv og får vurdert medlemskap og opptjening. Så bygger Spleis sitt eget Inntektsgrunnlag: 50 000 kr × 12 = 600 000 kr.",
          meldinger: [
            [
              behov("spleis", "aordningen", "InntekterForSykepengegrunnlag", { tilstand: "AVVENTER_VILKÅRSPRØVING" }),
              behov("spleis", "aareg", "ArbeidsforholdV2"),
              behov("spleis", "spvilk", "Medlemskap, Opptjening"),
            ],
            intern("spleis", "Inntektsgrunnlag 600 000 kr", {
              lagre: {
                spleis: ["Vilkårsgrunnlag V1 med Inntektsgrunnlag:", "• omregnet årsinntekt 600 000 kr", "• sykepengegrunnlag 600 000 kr", "• 6G = 780 960 kr"],
              },
            }),
          ],
        },
        etter: {
          tekst: "Spleis får vurdert medlemskap og opptjening. Inntektene trenger ikke Spleis å hente, de ligger i sp-inntekt.",
          meldinger: [
            behov("spleis", "spvilk", "Medlemskap, Opptjening", { tilstand: "AVVENTER_VILKÅRSPRØVING" }),
            løsning("spvilk", "spleis", "oppfylt"),
          ],
        },
        forskjell: "Spleis henter ikke lenger inntekter og regner ikke ut sykepengegrunnlaget selv.",
        rader: ["aord", "grunnlag"],
      },
      {
        fase: "Beregning",
        før: {
          tekst: "Spleis beregner dagsatsen fra sitt eget Inntektsgrunnlag og simulerer utbetalingen.",
          meldinger: [
            intern("spleis", "dagsats fra 600 000 kr", { tilstand: "AVVENTER_HISTORIKK" }),
            intern("spleis", "simulerer", { tilstand: "AVVENTER_SIMULERING" }),
          ],
        },
        etter: {
          tekst: "Spleis henter tallene den trenger fra sp-sykepengegrunnlag og beregner dagsatsen. Spleis har ingen egen kopi av grunnlaget som kan bli utdatert.",
          meldinger: [
            behov("spleis", "spspg", "SykepengegrunnlagResultat", { tilstand: "AVVENTER_HISTORIKK" }),
            løsning("spspg", "spleis", "600 000 kr · 6G · avvik ✓"),
            intern("spleis", "dagsats fra 600 000 kr"),
            intern("spleis", "simulerer", { tilstand: "AVVENTER_SIMULERING" }),
          ],
        },
        forskjell: "Utbetalingen blir den samme. Forskjellen er hvor tallene kommer fra.",
        rader: ["grunnlag"],
      },
      {
        fase: "Godkjenning",
        før: {
          tekst: "Spleis sender saken til godkjenning med tallene for grunnlaget. Først nå ber Spesialist Spinnvill om en avviksvurdering. Spinnvill henter tolv måneder fra a-ordningen og finner 2,0 % avvik.",
          meldinger: [
            behov("spleis", "spesialist", "Godkjenning + grunnlagsfakta", { tilstand: "AVVENTER_GODKJENNING" }),
            behov("spesialist", "spinnvill", "Avviksvurdering"),
            behov("spinnvill", "aordningen", "InntekterForSammenligningsgrunnlag"),
            løsning("aordningen", "spinnvill", "12 mnd = 588 000 kr"),
            intern("spinnvill", "avvik 2,0 % ✓", {
              lagre: { spinnvill: ["Avviksvurdering", "• sammenligningsgrunnlag 588 000 kr", "• avvik 2,0 %", "• koblet til vilkårsgrunnlag V1"] },
            }),
            løsning("spinnvill", "spesialist", "avvik 2,0 %"),
          ],
        },
        etter: {
          tekst: "Spleis sender saken til godkjenning med sykepengegrunnlag-ID-en. Spesialist henter grunnlaget og avviksvurderingen fra sp-sykepengegrunnlag. Ingen ny runde mot a-ordningen.",
          meldinger: [
            behov("spleis", "spesialist", "Godkjenning + sykepengegrunnlagId", { tilstand: "AVVENTER_GODKJENNING" }),
            http("spesialist", "spspg", "hent sykepengegrunnlag S1"),
            løsning("spspg", "spesialist", "grunnlag + avvik 2,0 %"),
          ],
        },
        forskjell: "I dag vurderes avviket først ved godkjenning, i en annen tjeneste, og kobles til en ID som endres hver gang Spleis kopierer vilkårsgrunnlaget. Etter specene er avviket allerede vurdert og ligger på samme ID som grunnlaget.",
        rader: ["avvik", "sammenligning"],
      },
      vedtak(),
    ],
  },

  {
    id: "kombinert",
    navn: "Kombinert",
    intro: "Kari er ansatt hos arbeidsgiver 1 og driver også et enkeltpersonforetak. Hun sender to søknader for det samme sykefraværet: én som arbeidstaker og én som selvstendig næringsdrivende. Kombinasjonen (§ 8-41) støttes ikke ennå. Saken skal til Infotrygd både i dag og etter specene.",
    poeng: "Utfallet er det samme. Men etter specene finnes det én inntektsavklaring med inntektene fra begge yrkesaktivitetene. Det er grunnmuren for å kunne behandle kombinasjonene senere.",
    takter: [
      {
        fase: "Søknad og inntektsmelding",
        før: {
          tekst: "Begge søknadene kommer inn. Søknaden som selvstendig næringsdrivende har med pensjonsgivende inntekt som sykepengesoknad-backend har hentet fra Sigrun. Arbeidsgiveren sender inntektsmelding.",
          meldinger: [
            [
              hendelse("soknad", "spleis", "søknad arbeidstaker", { tilstand: "AVVENTER_INNTEKTSMELDING" }),
              hendelse("soknad", "spleis", "søknad selvstendig + PGI"),
            ],
            hendelse("im", "spleis", "inntektsmelding 50 000 kr/mnd", {
              tilstand: "AVVENTER_BLOKKERENDE_PERIODE",
              lagre: { spleis: ["Inntektsmelding: 50 000 kr/mnd", "Pensjonsgivende inntekt fra søknaden"] },
            }),
          ],
        },
        etter: {
          tekst: "Begge søknadene kommer inn, og arbeidsgiveren sender inntektsmelding. Spleis bruker ikke lenger tallene for pensjonsgivende inntekt på søknaden.",
          meldinger: [
            [
              hendelse("soknad", "spleis", "søknad arbeidstaker", { tilstand: "AVVENTER_INNTEKTSMELDING" }),
              hendelse("soknad", "spleis", "søknad selvstendig"),
            ],
            hendelse("im", "spleis", "inntektsmelding 50 000 kr/mnd", {
              tilstand: "AVVENTER_BLOKKERENDE_PERIODE",
              lagre: { spleis: ["Inntektsmelding: 50 000 kr/mnd", "(ligger på behandlingen)"] },
            }),
          ],
        },
        forskjell: "Nesten ingen forskjell. Begge søknadene og inntektsmeldingen kommer inn som før.",
        rader: ["im", "pgi"],
      },
      {
        fase: "Inntekt",
        før: ingenEgetSteg("I dag finnes det ikke et eget steg for inntekt. Inntekten for den selvstendige delen ligger på søknaden, og inntekten for arbeidstakerdelen hentes i vilkårsprøvingen."),
        etter: {
          tekst: "Spleis sender én linje for arbeidsgiveren og én for den selvstendige delen. sp-inntekt henter inntektsmeldingen, inntektene fra a-ordningen, arbeidsforholdene og pensjonsgivende inntekt fra Sigrun, og lagrer alt i én inntektsavklaring.",
          meldinger: [
            behov("spleis", "spinntekt", "Inntektsavklaring (2 linjer)", {
              tilstand: "AVVENTER_INNTEKTSAVKLARING",
              detalj: "ARBEIDSTAKER med inntektsmelding + SELVSTENDIG",
            }),
            [
              http("spinntekt", "im", "hent inntektsmelding"),
              http("spinntekt", "sigrun", "pensjonsgivende inntekt"),
              behov("spinntekt", "aordningen", "inntekter 3 + 12 mnd"),
              behov("spinntekt", "aareg", "ArbeidsforholdV2"),
            ],
            intern("spinntekt", "lagrer inntektsavklaring A1", {
              lagre: {
                spinntekt: [
                  "Inntektsavklaring A1",
                  "• arbeidsgiver 1: inntektsmelding 50 000 kr/mnd",
                  "• selvstendig: PGI 2022–2024 fra Sigrun",
                  "• sammenligningsgrunnlag: 12 mnd",
                  "• arbeidsforhold fra Aa-registeret",
                ],
              },
            }),
            løsning("spinntekt", "spleis", "inntektsavklaringId A1", {
              lagre: { spleis: ["Inntektsmelding: 50 000 kr/mnd", "Vilkårsgrunnlag:", "• inntektsavklaringId = A1"] },
            }),
          ],
        },
        forskjell: "Inntektene for begge yrkesaktivitetene samles i én inntektsavklaring. Den brukes ikke i dette tilfellet ennå, men det er det sp-rettighetskategori og sp-sykepengegrunnlag trenger for å behandle kombinasjoner etter §§ 8-41 til 8-43 senere.",
        rader: ["im", "aord", "pgi", "sammenligning"],
      },
      rettighetskategori("ARBEIDSTAKER_OG_SELVSTENDIG", { forkast: true }),
      {
        fase: "Sykepengegrunnlag",
        før: ingenEgetSteg("Saken kommer ikke hit. Den er forkastet og går til Infotrygd."),
        etter: ingenEgetSteg("Saken kommer ikke hit. sp-sykepengegrunnlag fastsetter ikke grunnlag for kombinasjoner i første versjon. Hvis den likevel fikk spørsmålet, ville den latt det være ubesvart og logget en feil, i stedet for å fastsette et feil grunnlag."),
        forskjell: "Når § 8-41 skal støttes, legges det til en ny fastsettelsesmåte i sp-sykepengegrunnlag uten å endre kontrakten med Spleis. Variant: Har en selvstendig næringsdrivende lønn i a-ordningen uten å ha søkt som arbeidstaker, svarer sp-sykepengegrunnlag «ikke fastsatt», og Spleis forkaster med RV_IV_13. I dag oppdager Spleis det selv i vilkårsprøvingen.",
        rader: ["grunnlag"],
      },
    ],
  },

  {
    id: "selvstendig",
    navn: "Selvstendig næringsdrivende",
    intro: "Ola er selvstendig næringsdrivende og blir sykmeldt 1. mars 2026. Skatteetaten har fastsatt pensjonsgivende inntekt for 2022, 2023 og 2024: 480 000, 510 000 og 540 000 kr. 2025 er ikke ferdig fastsatt ennå.",
    poeng: "Regelen i § 8-35 er den samme. Forskjellen er at inntekten hentes fra Sigrun av sp-inntekt i stedet for å komme med søknaden, så den kan hentes på nytt og vises til saksbehandler.",
    takter: [
      {
        fase: "Søknad",
        før: {
          tekst: "sykepengesoknad-backend henter pensjonsgivende inntekt fra Sigrun og legger tallene på søknaden. Spleis tar tallene fra søknaden og sjekker at det er tre ferdiglignede år. Mangler det, forkastes perioden med RV_IV_12 med en gang søknaden kommer inn. Tallene kan ikke hentes på nytt.",
          meldinger: [
            http("soknad", "sigrun", "hent pensjonsgivende inntekt"),
            løsning("sigrun", "soknad", "2022–2024"),
            hendelse("soknad", "spleis", "søknad + PGI 2022–2024", {
              tilstand: "AVVENTER_BLOKKERENDE_PERIODE",
              lagre: { spleis: ["Pensjonsgivende inntekt fra søknaden:", "• 2022: 480 000 kr", "• 2023: 510 000 kr", "• 2024: 540 000 kr"] },
            }),
            intern("spleis", "3 ferdiglignede år ✓"),
          ],
        },
        etter: {
          tekst: "Søknaden kommer inn som før. Spleis bruker ikke lenger tallene på søknaden til å fastsette grunnlaget. Svarene om varig endring, ny i arbeidslivet og avvikling sjekkes fortsatt i Spleis.",
          meldinger: [hendelse("soknad", "spleis", "søknad (selvstendig)", { tilstand: "AVVENTER_BLOKKERENDE_PERIODE" })],
        },
        forskjell: "I dag kommer inntekten med søknaden og kan ikke hentes på nytt. Etter specene henter sp-inntekt den fra Sigrun (ADR 0010).",
        rader: ["pgi"],
      },
      {
        fase: "Inntekt",
        før: ingenEgetSteg("I dag finnes det ikke et eget steg for inntekt. Inntekten ligger allerede på søknaden."),
        etter: {
          tekst: "Spleis ber om inntektsavklaring for en selvstendig næringsdrivende. sp-inntekt spør Sigrun og starter med året før skjæringstidspunktet (2025). Den hopper over år som ikke er fastsatt, og bruker de tre nyeste fastsatte årene: 2022–2024. Den henter også lønn og arbeidsforhold, slik at sp-sykepengegrunnlag kan se om personen også er arbeidstaker. Sammenligningsgrunnlag hentes ikke, fordi det bare brukes for arbeidstakere.",
          meldinger: [
            behov("spleis", "spinntekt", "Inntektsavklaring", { tilstand: "AVVENTER_INNTEKTSAVKLARING", detalj: "SELVSTENDIG" }),
            [
              http("spinntekt", "sigrun", "PGI fra 2025 og bakover"),
              behov("spinntekt", "aordningen", "inntekter 3 mnd"),
              behov("spinntekt", "aareg", "ArbeidsforholdV2"),
            ],
            løsning("sigrun", "spinntekt", "2025 ikke fastsatt · 2022–2024"),
            intern("spinntekt", "hopper over 2025", {
              lagre: {
                spinntekt: [
                  "Inntektsavklaring A1",
                  "• 2025: ikke fastsatt (PGIF-006)",
                  "• 2024: 540 000 kr (Sigrun)",
                  "• 2023: 510 000 kr (Sigrun)",
                  "• 2022: 480 000 kr (Sigrun)",
                  "• ingen lønn i a-ordningen",
                ],
              },
            }),
            løsning("spinntekt", "spleis", "inntektsavklaringId A1", {
              lagre: { spleis: ["Vilkårsgrunnlag:", "• inntektsavklaringId = A1"] },
            }),
          ],
        },
        forskjell: "Inntekten kan hentes på nytt og vises til saksbehandler fra den samme kilden som grunnlaget bygger på. Åpent spørsmål til fag: Er det riktig å regne et år der Sigrun svarer «ingen inntekt» (PGIF-008) som fastsatt med 0 kr?",
        rader: ["pgi"],
      },
      rettighetskategori("SELVSTENDIG_NÆRINGSDRIVENDE", {
        spleisFør: ["Pensjonsgivende inntekt fra søknaden", "Vilkårsgrunnlag (minimalt):", "• rettighetskategoriId = R1"],
        spleisEtter: ["Vilkårsgrunnlag:", "• inntektsavklaringId = A1", "• rettighetskategoriId = R1"],
      }),
      {
        fase: "Sykepengegrunnlag",
        før: ingenEgetSteg("I dag finnes det ikke et eget steg for sykepengegrunnlaget. Spleis regner det ut selv i vilkårsprøvingen."),
        etter: {
          tekst: "sp-sykepengegrunnlag fastsetter etter § 8-35: hvert år justeres med grunnbeløpet, med tak på 6G og 12G, og snittet av de tre årene blir grunnlaget, ca. 572 000 kr. Det gjøres ingen avviksvurdering for selvstendig næringsdrivende, som i dag.",
          meldinger: [
            behov("spleis", "spspg", "Sykepengegrunnlag", { tilstand: "AVVENTER_SYKEPENGEGRUNNLAG" }),
            [http("spspg", "spinntekt", "hent inntektsavklaring A1"), behov("spspg", "sprk", "RettighetskategoriResultat")],
            intern("spspg", "§ 8-35: ≈ 572 000 kr", {
              lagre: {
                spspg: ["Sykepengegrunnlag S1 (§ 8-35)", "• 2022–2024 G-justert", "• snitt ≈ 572 000 kr", "• ingen avviksvurdering"],
              },
            }),
            løsning("spspg", "spleis", "FASTSATT (S1)", {
              lagre: { spleis: ["Vilkårsgrunnlag:", "• inntektsavklaringId = A1", "• rettighetskategoriId = R1", "• sykepengegrunnlagId = S1"] },
            }),
          ],
        },
        forskjell: "Regelen i § 8-35 flyttes uendret. Er færre enn tre år fastsatt, svarer tjenesten «ikke fastsatt», og Spleis forkaster med RV_IV_12. I dag skjer det når søknaden kommer inn.",
        rader: ["grunnlag"],
      },
      {
        fase: "Vilkårsprøving",
        før: {
          tekst: "Spleis henter lønn fra a-ordningen for å se om personen også har inntekt som arbeidstaker (da forkastes saken med RV_IV_13), og får vurdert medlemskap og opptjening. Så regner Spleis ut grunnlaget etter § 8-35 fra tallene på søknaden.",
          meldinger: [
            [
              behov("spleis", "aordningen", "InntekterForSykepengegrunnlag", { tilstand: "AVVENTER_VILKÅRSPRØVING" }),
              behov("spleis", "spvilk", "Medlemskap, Opptjening"),
            ],
            intern("spleis", "§ 8-35: ≈ 572 000 kr", {
              lagre: { spleis: ["Vilkårsgrunnlag V1 med Inntektsgrunnlag:", "• PGI 2022–2024 fra søknaden", "• beregningsgrunnlag ≈ 572 000 kr"] },
            }),
          ],
        },
        etter: {
          tekst: "Spleis får vurdert medlemskap og opptjening. Lønnssjekken og utregningen er allerede gjort i sp-sykepengegrunnlag.",
          meldinger: [
            behov("spleis", "spvilk", "Medlemskap, Opptjening", { tilstand: "AVVENTER_VILKÅRSPRØVING" }),
            løsning("spvilk", "spleis", "oppfylt"),
          ],
        },
        forskjell: "Sjekken av lønn (RV_IV_13) og utregningen etter § 8-35 er flyttet til sp-sykepengegrunnlag.",
        rader: ["grunnlag"],
      },
      {
        fase: "Beregning",
        før: {
          tekst: "Spleis beregner dagsatsen fra sitt eget grunnlag og simulerer utbetalingen.",
          meldinger: [
            intern("spleis", "dagsats fra ≈ 572 000 kr", { tilstand: "AVVENTER_HISTORIKK" }),
            intern("spleis", "simulerer", { tilstand: "AVVENTER_SIMULERING" }),
          ],
        },
        etter: {
          tekst: "Spleis henter tallene fra sp-sykepengegrunnlag og beregner dagsatsen.",
          meldinger: [
            behov("spleis", "spspg", "SykepengegrunnlagResultat", { tilstand: "AVVENTER_HISTORIKK" }),
            løsning("spspg", "spleis", "≈ 572 000 kr"),
            intern("spleis", "dagsats fra ≈ 572 000 kr"),
            intern("spleis", "simulerer", { tilstand: "AVVENTER_SIMULERING" }),
          ],
        },
        forskjell: "Grunnlaget bygger på tall fra Sigrun, ikke på søknaden. Er Sigrun og søknaden uenige, kan tallene bli andre enn i dag. Det følger vi med på i skyggekjøringen.",
        rader: ["grunnlag", "pgi"],
      },
      {
        fase: "Godkjenning",
        før: {
          tekst: "Spleis sender saken til godkjenning med tallene for grunnlaget. Spesialist ber ikke om avviksvurdering for selvstendig næringsdrivende.",
          meldinger: [behov("spleis", "spesialist", "Godkjenning + grunnlagsfakta", { tilstand: "AVVENTER_GODKJENNING" })],
        },
        etter: {
          tekst: "Spleis sender saken til godkjenning med sykepengegrunnlag-ID-en. Spesialist henter grunnlaget og inntekten per år fra sp-sykepengegrunnlag.",
          meldinger: [
            behov("spleis", "spesialist", "Godkjenning + sykepengegrunnlagId", { tilstand: "AVVENTER_GODKJENNING" }),
            http("spesialist", "spspg", "hent sykepengegrunnlag S1"),
            løsning("spspg", "spesialist", "grunnlag + PGI per år"),
          ],
        },
        forskjell: "Spesialist henter tallene fra eieren i stedet for å få dem fra Spleis.",
        rader: ["grunnlag"],
      },
      vedtak(),
    ],
  },

  {
    id: "skjonn",
    navn: "Skjønnsfastsettelse (25 % avvik)",
    intro: "Kari er arbeidstaker. Arbeidsgiveren oppgir 60 000 kr i måneden, altså 720 000 kr i året. I a-ordningen har hun tjent 540 000 kr de siste tolv månedene. Avviket er 33,3 %, over grensen på 25 % i § 8-30 andre ledd. Saksbehandler må skjønnsfastsette, og setter grunnlaget til 600 000 kr.",
    poeng: "I dag oppdages avviket først ved godkjenning, etter at utbetalingen er beregnet, og tallet og begrunnelsen havner i hver sin tjeneste. Etter specene er avviket kjent med en gang grunnlaget fastsettes, og alt om grunnlaget ligger ett sted.",
    takter: [
      søknadOgInntektsmelding("60 000 kr"),
      inntektsavklaringArbeidstaker("60 000 kr", "540 000 kr"),
      rettighetskategori("ARBEIDSTAKER", {
        spleisFør: ["Inntektsmelding: 60 000 kr/mnd", "Vilkårsgrunnlag (minimalt):", "• rettighetskategoriId = R1"],
        spleisEtter: ["Inntektsmelding: 60 000 kr/mnd", "Vilkårsgrunnlag:", "• inntektsavklaringId = A1", "• rettighetskategoriId = R1"],
      }),
      {
        fase: "Sykepengegrunnlag",
        før: ingenEgetSteg("I dag finnes det ikke et eget steg for sykepengegrunnlaget. Ingen ser på avviket ennå."),
        etter: {
          tekst: "sp-sykepengegrunnlag regner om til 720 000 kr og sammenligner med 540 000 kr fra a-ordningen. Avviket er 33,3 %, over grensen på 25 %. Grunnlaget lagres med beskjed om at det må skjønnsfastsettes.",
          meldinger: [
            behov("spleis", "spspg", "Sykepengegrunnlag", { tilstand: "AVVENTER_SYKEPENGEGRUNNLAG" }),
            [http("spspg", "spinntekt", "hent inntektsavklaring A1"), behov("spspg", "sprk", "RettighetskategoriResultat")],
            varsel("spspg", "720 000 kr · avvik 33,3 % ✗", {
              lagre: {
                spspg: ["Sykepengegrunnlag S1", "• omregnet årsinntekt 720 000 kr", "• sammenligningsgrunnlag 540 000 kr", "• avvik 33,3 % – må skjønnsfastsettes"],
              },
            }),
            løsning("spspg", "spleis", "FASTSATT (S1)", {
              lagre: { spleis: ["Inntektsmelding: 60 000 kr/mnd", "Vilkårsgrunnlag:", "• inntektsavklaringId = A1", "• rettighetskategoriId = R1", "• sykepengegrunnlagId = S1"] },
            }),
          ],
        },
        forskjell: "Avviket oppdages med en gang grunnlaget fastsettes, før utbetalingen er beregnet.",
        rader: ["avvik", "grunnlag", "sammenligning"],
      },
      {
        fase: "Vilkårsprøving",
        før: {
          tekst: "Spleis henter inntekten fra a-ordningen og arbeidsforholdene selv og bygger sitt eget Inntektsgrunnlag: 60 000 kr × 12 = 720 000 kr.",
          meldinger: [
            [
              behov("spleis", "aordningen", "InntekterForSykepengegrunnlag", { tilstand: "AVVENTER_VILKÅRSPRØVING" }),
              behov("spleis", "aareg", "ArbeidsforholdV2"),
              behov("spleis", "spvilk", "Medlemskap, Opptjening"),
            ],
            intern("spleis", "Inntektsgrunnlag 720 000 kr", {
              lagre: { spleis: ["Vilkårsgrunnlag V1 med Inntektsgrunnlag:", "• omregnet årsinntekt 720 000 kr", "• sykepengegrunnlag 720 000 kr"] },
            }),
          ],
        },
        etter: {
          tekst: "Spleis får vurdert medlemskap og opptjening.",
          meldinger: [
            behov("spleis", "spvilk", "Medlemskap, Opptjening", { tilstand: "AVVENTER_VILKÅRSPRØVING" }),
            løsning("spvilk", "spleis", "oppfylt"),
          ],
        },
        forskjell: "Spleis henter ikke lenger inntekter og regner ikke ut sykepengegrunnlaget selv.",
        rader: ["aord", "grunnlag"],
      },
      {
        fase: "Beregning",
        før: {
          tekst: "Spleis beregner utbetalingen med 720 000 kr. Ingen vet ennå at avviket er for stort.",
          meldinger: [
            intern("spleis", "dagsats fra 720 000 kr", { tilstand: "AVVENTER_HISTORIKK" }),
            intern("spleis", "simulerer", { tilstand: "AVVENTER_SIMULERING" }),
          ],
        },
        etter: {
          tekst: "Svaret fra sp-sykepengegrunnlag sier at grunnlaget må skjønnsfastsettes. Spleis legger varselet RV_IV_2 på behandlingen og beregner foreløpig med 720 000 kr.",
          meldinger: [
            behov("spleis", "spspg", "SykepengegrunnlagResultat", { tilstand: "AVVENTER_HISTORIKK" }),
            løsning("spspg", "spleis", "trengerSkjønnsfastsettelse"),
            varsel("spleis", "varsel RV_IV_2"),
            intern("spleis", "simulerer", { tilstand: "AVVENTER_SIMULERING" }),
          ],
        },
        forskjell: "Varselet om avvik kommer fra Spleis, ut fra svaret fra sp-sykepengegrunnlag. I dag lager Spesialist varselet, etter at Spinnvill har svart.",
        rader: ["varsel", "avvik"],
      },
      {
        fase: "Godkjenning",
        før: {
          tekst: "Saken går til godkjenning. Først nå ber Spesialist Spinnvill om en avviksvurdering. Spinnvill henter tolv måneder fra a-ordningen og finner 33,3 % avvik, og Spesialist legger på varselet RV_IV_2. Beregningen som er gjort, kan ikke brukes.",
          meldinger: [
            behov("spleis", "spesialist", "Godkjenning + grunnlagsfakta", { tilstand: "AVVENTER_GODKJENNING" }),
            behov("spesialist", "spinnvill", "Avviksvurdering"),
            behov("spinnvill", "aordningen", "InntekterForSammenligningsgrunnlag"),
            løsning("aordningen", "spinnvill", "12 mnd = 540 000 kr"),
            varsel("spinnvill", "avvik 33,3 % ✗", {
              lagre: { spinnvill: ["Avviksvurdering", "• sammenligningsgrunnlag 540 000 kr", "• avvik 33,3 %", "• koblet til vilkårsgrunnlag V1"] },
            }),
            løsning("spinnvill", "spesialist", "avvik 33,3 %"),
            varsel("spesialist", "varsel RV_IV_2"),
          ],
        },
        etter: {
          tekst: "Saken går til godkjenning med varselet. Spesialist henter grunnlaget og avviksvurderingen fra sp-sykepengegrunnlag og viser dem i Speil.",
          meldinger: [
            behov("spleis", "spesialist", "Godkjenning + sykepengegrunnlagId", { tilstand: "AVVENTER_GODKJENNING" }),
            http("spesialist", "spspg", "hent sykepengegrunnlag S1"),
            løsning("spspg", "spesialist", "grunnlag + avvik 33,3 %"),
          ],
        },
        forskjell: "I dag kommer avviket som en overraskelse ved godkjenning. Etter specene vet saksbehandler det allerede, og det er ingen ekstra runde mot Spinnvill og a-ordningen.",
        rader: ["avvik", "varsel", "sammenligning"],
      },
      {
        fase: "Skjønnsfastsettelse",
        før: {
          tekst: "Saksbehandler skjønnsfastsetter 600 000 kr i Speil. Spesialist lagrer begrunnelsen og sender tallet til Spleis. Spleis lagrer det i Inntektsgrunnlaget, lager et nytt vilkårsgrunnlag med ny ID (V2) og beregner på nytt.",
          meldinger: [
            hendelse("speil", "spesialist", "skjønnsfastsett 600 000 kr"),
            intern("spesialist", "lagrer begrunnelsen", {
              lagre: { spesialist: ["Skjønnsfastsettelse", "• begrunnelse, type og lovhjemmel", "• koblet til meldingsreferanse"] },
            }),
            hendelse("spesialist", "spleis", "skjønnsmessig_fastsettelse"),
            intern("spleis", "nytt vilkårsgrunnlag V2", {
              tilstand: "AVVENTER_BLOKKERENDE_PERIODE",
              lagre: { spleis: ["Vilkårsgrunnlag V2 med Inntektsgrunnlag:", "• omregnet årsinntekt 720 000 kr", "• skjønnsfastsatt 600 000 kr", "• sykepengegrunnlag 600 000 kr"] },
            }),
          ],
        },
        etter: {
          tekst: "Saksbehandler skjønnsfastsetter 600 000 kr i Speil. Skjemaet går rett til sp-sykepengegrunnlag, som lagrer tallet og begrunnelsen i et nytt grunnlag (S2). Tjenesten sier fra til Spleis, som beregner på nytt, og til Spesialist, som krever totrinnsvurdering.",
          meldinger: [
            http("speil", "spspg", "skjønnsfastsett 600 000 kr"),
            intern("spspg", "nytt grunnlag S2", {
              lagre: {
                spspg: [
                  "Sykepengegrunnlag S2 (saksbehandler)",
                  "• omregnet årsinntekt 720 000 kr",
                  "• avvik 33,3 % (beholdes)",
                  "• skjønnsfastsatt 600 000 kr",
                  "• begrunnelse, type og lovhjemmel",
                  "• historikk: S1 → S2",
                ],
              },
            }),
            [
              hendelse("spspg", "spleis", "endret_sykepengegrunnlag", { tilstand: "AVVENTER_BLOKKERENDE_PERIODE" }),
              hendelse("spspg", "spesialist", "saksbehandlerhandling"),
            ],
          ],
        },
        forskjell: "Tallet og begrunnelsen lagres sammen, ett sted, med historikk. I dag ligger tallet i Spleis og begrunnelsen i Spesialist.",
        rader: ["skjonn"],
      },
      {
        fase: "Ny beregning",
        før: {
          tekst: "Spleis beregner på nytt med det skjønnsfastsatte grunnlaget.",
          meldinger: [
            intern("spleis", "dagsats fra 600 000 kr", { tilstand: "AVVENTER_HISTORIKK" }),
            intern("spleis", "simulerer", { tilstand: "AVVENTER_SIMULERING" }),
          ],
        },
        etter: {
          tekst: "Spleis henter det nye grunnlaget og beregner på nytt. Svaret sier at grunnlaget er fastsatt etter skjønn, så det trengs ikke lenger skjønnsfastsettelse.",
          meldinger: [
            behov("spleis", "spspg", "SykepengegrunnlagResultat", {
              tilstand: "AVVENTER_HISTORIKK",
              lagre: { spleis: ["Inntektsmelding: 60 000 kr/mnd", "Vilkårsgrunnlag:", "• inntektsavklaringId = A1", "• rettighetskategoriId = R1", "• sykepengegrunnlagId = S2"] },
            }),
            løsning("spspg", "spleis", "ETTER_SKJØNN 600 000 kr"),
            intern("spleis", "dagsats fra 600 000 kr"),
            intern("spleis", "simulerer", { tilstand: "AVVENTER_SIMULERING" }),
          ],
        },
        forskjell: "Utbetalingen blir den samme. Spleis har bare byttet ID-en S1 med S2.",
        rader: ["grunnlag"],
      },
      {
        fase: "Totrinn og vedtak",
        før: {
          tekst: "Spesialist spør Spinnvill på nytt, fordi vilkårsgrunnlaget har fått ny ID. Spinnvill ser at omregnet årsinntekt er den samme og gjenbruker vurderingen. Beslutter godkjenner.",
          meldinger: [
            behov("spleis", "spesialist", "Godkjenning (vilkårsgrunnlag V2)", { tilstand: "AVVENTER_GODKJENNING" }),
            behov("spesialist", "spinnvill", "Avviksvurdering"),
            intern("spinnvill", "samme sum – gjenbruker", {
              lagre: { spinnvill: ["Avviksvurdering", "• avvik 33,3 %", "• koblet til V1 og V2"] },
            }),
            løsning("spinnvill", "spesialist", "avvik 33,3 %"),
            hendelse("speil", "spesialist", "beslutter godkjenner"),
            løsning("spesialist", "spleis", "Godkjenning: godkjent", { tilstand: "TIL_UTBETALING" }),
            intern("spleis", "utbetalt", { tilstand: "AVSLUTTET" }),
          ],
        },
        etter: {
          tekst: "Spesialist henter grunnlaget med skjønnsfastsettelsen og begrunnelsen fra sp-sykepengegrunnlag. Beslutter godkjenner, og vedtaket får de samme feltene som i dag.",
          meldinger: [
            behov("spleis", "spesialist", "Godkjenning + sykepengegrunnlagId S2", { tilstand: "AVVENTER_GODKJENNING" }),
            http("spesialist", "spspg", "hent S2 med begrunnelse"),
            løsning("spspg", "spesialist", "grunnlag + skjønn"),
            hendelse("speil", "spesialist", "beslutter godkjenner"),
            løsning("spesialist", "spleis", "Godkjenning: godkjent", { tilstand: "TIL_UTBETALING" }),
            intern("spleis", "utbetalt", { tilstand: "AVSLUTTET" }),
          ],
        },
        forskjell: "Ingen ny runde mot Spinnvill. Avviksvurderingen og skjønnsfastsettelsen ligger på samme grunnlag, og begrunnelsen til vedtaket hentes derfra.",
        rader: ["avvik", "skjonn"],
      },
    ],
  },
  {
    id: "gregulering",
    navn: "G-regulering",
    revurdering: true,
    intro: "Ola er arbeidstaker og tjener 900 000 kr i året. Han blir sykmeldt 4. mai 2026 og får vedtak 20. mai. Da er det nye grunnbeløpet for 2026 ikke vedtatt ennå, så grunnlaget begrenses til 6G med det gamle grunnbeløpet: 6 × 130 160 = 780 960 kr. Rundt 1. juni legges det nye grunnbeløpet inn: 136 549 kr, med virkning fra 1. mai. Da er 6G 819 294 kr, og Ola skal ha mer.",
    poeng: "I dag må Spregulering gjette hvilket grunnbeløp som er brukt, ut fra 6G i utkast_til_vedtak, og be Spleis regulere. Etter specene vet sp-sykepengegrunnlag hvilket grunnbeløp hvert grunnlag er fastsatt med, og regulerer selv. Selvstendig næringsdrivende reguleres på samme måte som arbeidstakere.",
    takter: [
      {
        fase: "Vedtak med gammelt G",
        før: {
          tekst: "Spleis begrenser grunnlaget til 6G med grunnbeløpet den kjenner: 780 960 kr. Spregulering leser 6G fra utkast_til_vedtak og lagrer en egen kopi per person og skjæringstidspunkt. Det er slik den senere finner ut hvem som har fått feil G.",
          meldinger: [
            intern("spleis", "6G = 780 960 kr", {
              tilstand: "AVVENTER_GODKJENNING",
              lagre: { spleis: ["Vilkårsgrunnlag V1 med Inntektsgrunnlag:", "• omregnet årsinntekt 900 000 kr", "• 6G = 780 960 kr", "• sykepengegrunnlag 780 960 kr"] },
            }),
            hendelse("spleis", "spregulering", "utkast_til_vedtak (6G 780 960)", {
              lagre: { spregulering: ["Anvendt grunnbeløp", "• Ola, skjæringstidspunkt 4. mai 2026", "• 6G = 780 960 kr"] },
            }),
            behov("spleis", "spesialist", "Godkjenning"),
            løsning("spesialist", "spleis", "Godkjenning: godkjent", { tilstand: "TIL_UTBETALING" }),
            intern("spleis", "utbetalt 3 004 kr/dag", { tilstand: "AVSLUTTET" }),
          ],
        },
        etter: {
          tekst: "sp-sykepengegrunnlag fastsetter grunnlaget og lagrer grunnbeløpet det har brukt, rett på grunnlaget. Ingen andre trenger en kopi.",
          meldinger: [
            intern("spspg", "G 130 160 · 6G 780 960", {
              lagre: { spspg: ["Sykepengegrunnlag S1", "• omregnet årsinntekt 900 000 kr", "• grunnbeløp 130 160 kr", "• sykepengegrunnlag 780 960 kr (6G)"] },
            }),
            løsning("spspg", "spleis", "780 960 kr (S1)", {
              tilstand: "AVVENTER_GODKJENNING",
              lagre: { spleis: ["Vilkårsgrunnlag:", "• inntektsavklaringId = A1", "• rettighetskategoriId = R1", "• sykepengegrunnlagId = S1"] },
            }),
            behov("spleis", "spesialist", "Godkjenning"),
            løsning("spesialist", "spleis", "Godkjenning: godkjent", { tilstand: "TIL_UTBETALING" }),
            intern("spleis", "utbetalt 3 004 kr/dag", { tilstand: "AVSLUTTET" }),
          ],
        },
        forskjell: "I dag finnes grunnbeløpet som er brukt, både i Spleis og i en kopi i Spregulering. Etter specene ligger det bare på grunnlaget i sp-sykepengegrunnlag.",
        rader: ["gbrukt", "grunnlag"],
      },
      {
        fase: "Nytt grunnbeløp",
        før: {
          tekst: "Det nye grunnbeløpet, 136 549 kr fra 1. mai 2026, legges inn i koden i Spleis. Spregulering har ingen tabell over grunnbeløp. Den må enten se en ny utkast_til_vedtak med høyere 6G, eller få grunnbeløpet oppgitt i en melding fra Spout.",
          meldinger: [intern("spleis", "ny G 136 549 fra 1. mai")],
        },
        etter: {
          tekst: "Det nye grunnbeløpet legges inn både i Spleis og i tabellen i sp-sykepengegrunnlag. Spleis trenger det fortsatt til kravet om minsteinntekt (§ 8-3).",
          meldinger: [[intern("spleis", "ny G 136 549 fra 1. mai"), intern("spspg", "ny G 136 549 fra 1. mai")]],
        },
        forskjell: "Etter specene må grunnbeløpet legges inn to steder. Til gjengjeld vet sp-sykepengegrunnlag selv hva som er riktig G, og trenger ikke gjette.",
        rader: ["gtabell"],
      },
      {
        fase: "Finne feil G",
        før: {
          tekst: "Ved midnatt, eller når en utvikler sender kjør_grunnbeløpsregulering fra Spout, ser Spregulering etter skjæringstidspunkter der 6G er lavere enn den største 6G-en den har sett for samme periode. Den automatiske varianten har bommet før: i 2025 fant den ikke alle, fordi den var avhengig av å ha sett et nytt vedtak med ny G. I 2026 ble den derfor kjørt for hånd med riktig grunnbeløp.",
          meldinger: [
            intern("spregulering", "midnatt / kjør_grunnbeløpsregulering"),
            intern("spregulering", "780 960 ≠ 819 294 → feil G"),
            intern("spregulering", "Slack: 1 regulert"),
          ],
        },
        etter: {
          tekst: "Ved midnatt, eller ved kjør_grunnbeløpsregulering, finner sp-sykepengegrunnlag alle gjeldende grunnlag der grunnbeløpet som er brukt, ikke er grunnbeløpet som gjelder for skjæringstidspunktet. Den lager et nytt grunnlag med kilde grunnbeløpsregulering. Skjønnsfastsettelse og avviksvurdering blir med uendret.",
          meldinger: [
            intern("spspg", "midnatt / kjør_grunnbeløpsregulering"),
            intern("spspg", "S1 har G 130 160, skal ha 136 549"),
            intern("spspg", "nytt grunnlag S2", {
              lagre: {
                spspg: ["Sykepengegrunnlag S2 (grunnbeløpsregulering)", "• omregnet årsinntekt 900 000 kr", "• grunnbeløp 136 549 kr", "• sykepengegrunnlag 819 294 kr (6G)", "• historikk: S1 → S2"],
              },
            }),
            intern("spspg", "Slack: 1 regulert"),
          ],
        },
        forskjell: "I dag gjetter Spregulering ut fra 6G den har sett. Etter specene sammenligner sp-sykepengegrunnlag grunnbeløpet på grunnlaget med tabellen sin. Grunnlag for selvstendig næringsdrivende blir med; i 2026 måtte 21 slike saker tas for hånd.",
        rader: ["g", "gbrukt", "gtabell"],
      },
      {
        fase: "Spleis får beskjed",
        før: {
          tekst: "Spregulering sender grunnbeløpsregulering til Spleis. Spleis kopierer Inntektsgrunnlaget med nytt 6G, lager et nytt vilkårsgrunnlag (V2) og revurderer.",
          meldinger: [
            hendelse("spregulering", "spleis", "grunnbeløpsregulering"),
            intern("spleis", "nytt vilkårsgrunnlag V2", {
              tilstand: "AVVENTER_REVURDERING",
              lagre: { spleis: ["Vilkårsgrunnlag V2 med Inntektsgrunnlag:", "• omregnet årsinntekt 900 000 kr", "• 6G = 819 294 kr", "• sykepengegrunnlag 819 294 kr"] },
            }),
          ],
        },
        etter: {
          tekst: "sp-sykepengegrunnlag sender endret_sykepengegrunnlag med den nye ID-en. Spleis behandler den som endret_opptjeningsvurdering: kopierer vilkårsgrunnlaget med S2 og revurderer.",
          meldinger: [
            hendelse("spspg", "spleis", "endret_sykepengegrunnlag (S2)", {
              tilstand: "AVVENTER_REVURDERING",
              lagre: { spleis: ["Vilkårsgrunnlag:", "• inntektsavklaringId = A1", "• rettighetskategoriId = R1", "• sykepengegrunnlagId = S2"] },
            }),
          ],
        },
        forskjell: "Samme revurdering i Spleis. Forskjellen er hvem som har regnet ut det nye grunnlaget: Spleis selv i dag, sp-sykepengegrunnlag etter specene.",
        rader: ["g", "grunnlag"],
      },
      {
        fase: "Ny beregning",
        før: {
          tekst: "Spleis beregner på nytt med 819 294 kr. Dagsatsen øker fra 3 004 til 3 151 kr, og Ola får etterbetalt forskjellen fra 4. mai.",
          meldinger: [
            intern("spleis", "dagsats fra 819 294 kr", { tilstand: "AVVENTER_HISTORIKK_REVURDERING" }),
            intern("spleis", "simulerer etterbetaling", { tilstand: "AVVENTER_SIMULERING_REVURDERING" }),
          ],
        },
        etter: {
          tekst: "Spleis henter tallene for S2 og beregner på nytt. Dagsatsen øker fra 3 004 til 3 151 kr, som i dag.",
          meldinger: [
            behov("spleis", "spspg", "SykepengegrunnlagResultat", { tilstand: "AVVENTER_HISTORIKK_REVURDERING" }),
            løsning("spspg", "spleis", "819 294 kr · G 136 549"),
            intern("spleis", "dagsats fra 819 294 kr"),
            intern("spleis", "simulerer etterbetaling", { tilstand: "AVVENTER_SIMULERING_REVURDERING" }),
          ],
        },
        forskjell: "Utbetalingen blir den samme.",
        rader: ["grunnlag"],
      },
      {
        fase: "Godkjenning og utbetaling",
        før: {
          tekst: "Spregulering får en ny utkast_til_vedtak og oppdaterer kopien sin. Revurderingen går til Spesialist med taggen Grunnbeløpsregulering. Fordi vilkårsgrunnlaget har ny ID, spør Spesialist Spinnvill på nytt. De fleste godkjennes automatisk; i 2026 ble 12 av 1013 oppgaver i Speil.",
          meldinger: [
            hendelse("spleis", "spregulering", "utkast_til_vedtak (6G 819 294)", {
              tilstand: "AVVENTER_GODKJENNING_REVURDERING",
              lagre: { spregulering: ["Anvendt grunnbeløp", "• Ola, skjæringstidspunkt 4. mai 2026", "• 6G = 819 294 kr (oppdatert)"] },
            }),
            behov("spleis", "spesialist", "Godkjenning (Grunnbeløpsregulering)"),
            behov("spesialist", "spinnvill", "Avviksvurdering"),
            intern("spinnvill", "samme sum – gjenbruker"),
            løsning("spinnvill", "spesialist", "avvik uendret"),
            intern("spesialist", "automatisk godkjent"),
            løsning("spesialist", "spleis", "Godkjenning: godkjent", { tilstand: "TIL_UTBETALING" }),
            intern("spleis", "etterbetalt 147 kr/dag", { tilstand: "AVSLUTTET" }),
          ],
        },
        etter: {
          tekst: "Revurderingen går til Spesialist med S2. Spesialist henter grunnlaget fra sp-sykepengegrunnlag, og ser at kilden er grunnbeløpsregulering. Ingen runde mot Spinnvill.",
          meldinger: [
            behov("spleis", "spesialist", "Godkjenning + sykepengegrunnlagId S2", { tilstand: "AVVENTER_GODKJENNING_REVURDERING" }),
            http("spesialist", "spspg", "hent S2"),
            løsning("spspg", "spesialist", "kilde: grunnbeløpsregulering"),
            intern("spesialist", "automatisk godkjent"),
            løsning("spesialist", "spleis", "Godkjenning: godkjent", { tilstand: "TIL_UTBETALING" }),
            intern("spleis", "etterbetalt 147 kr/dag", { tilstand: "AVSLUTTET" }),
          ],
        },
        forskjell: "Spinnvill og Spregulering er borte. Hvorfor grunnlaget er endret, står på grunnlaget selv.",
        rader: ["avvik", "g"],
      },
    ],
  },
];

window.EIERSKAP = [
  { id: "im", hva: "Inntekt fra inntektsmelding", før: "Spleis, på behandlingen", etter: "sp-inntekt, hentet fra Spedisjon" },
  { id: "aord", hva: "Inntekt fra a-ordningen (3 mnd)", før: "Spleis, hentet i vilkårsprøvingen", etter: "sp-inntekt" },
  { id: "sammenligning", hva: "Sammenligningsgrunnlag (12 mnd)", før: "Spinnvill, hentet ved godkjenning", etter: "sp-inntekt" },
  { id: "pgi", hva: "Pensjonsgivende inntekt", før: "Søknaden (sykepengesoknad-backend henter fra Sigrun)", etter: "sp-inntekt, hentet fra Sigrun" },
  { id: "korrigert", hva: "Korrigert inntekt og deaktiverte arbeidsforhold", før: "Spleis (tallet) og Spesialist (begrunnelsen)", etter: "sp-inntekt (begge)" },
  { id: "kategori", hva: "Rettighetskategori", før: "sp-rettighetskategori", etter: "sp-rettighetskategori, får også inntektsavklarings-ID" },
  { id: "grunnlag", hva: "Årsinntekt, 6G og sykepengegrunnlag", før: "Spleis (Inntektsgrunnlag)", etter: "sp-sykepengegrunnlag" },
  { id: "avvik", hva: "Avviksvurdering (25 %)", før: "Spinnvill, når Spesialist får godkjenningsbehovet", etter: "sp-sykepengegrunnlag, når grunnlaget fastsettes" },
  { id: "varsel", hva: "Varsel om avvik (RV_IV_2)", før: "Spesialist", etter: "Spleis, ut fra svaret fra sp-sykepengegrunnlag" },
  { id: "skjonn", hva: "Skjønnsfastsettelse", før: "Spleis (tallet) og Spesialist (begrunnelsen)", etter: "sp-sykepengegrunnlag (begge)" },
  { id: "g", hva: "Grunnbeløpsregulering", før: "Spregulering ber Spleis regulere", etter: "sp-sykepengegrunnlag" },
  { id: "gbrukt", hva: "Grunnbeløpet som er brukt i et grunnlag", før: "Spleis, og en kopi av 6G i Spregulering", etter: "sp-sykepengegrunnlag, på grunnlaget" },
  { id: "gtabell", hva: "Tabellen over grunnbeløp", før: "Spleis", etter: "Spleis (minsteinntekt) og sp-sykepengegrunnlag" },
];
