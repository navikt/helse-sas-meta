// Tallene er hentet fra git log i spleis, speil, spesialist og sp-*-repoene 6. november 2026.
// Commit-tallene teller commits der emnet nevner kategorien. De undervurderer arbeidet, men viser formen.
window.SKISSE_DATA = (() => {
  const spor = [
    {
      id: 'arbeidstaker', navn: 'Arbeidstaker', farge: 'sage',
      under: 'Grunnmuren: Speil og Spleis 2019',
      fra: '2019-06-26', til: '2026-11-04',
      merker: [],
    },
    {
      id: 'flere', navn: 'Flere arbeidsgivere', farge: 'sand',
      under: '180 commits i tre apper · eget tigerteam',
      fra: '2020-05-14', til: '2022-09-08',
      merker: [{ dato: '2021-02-15', tekst: 'utvalgte' }, { dato: '2022-09-08', tekst: 'alle' }],
    },
    {
      id: 'arbeidsledig', navn: 'Arbeidsledig og frilans', farge: 'sand',
      under: 'I modellen, «men ikke på ekte»',
      fra: '2023-07-06', til: '2023-12-04',
      merker: [{ dato: '2026-10-19', tekst: 'forkastes i Start', stempel: 'RV_SØ_39' }],
    },
    {
      id: 'sn1', navn: 'Selvstendig, forsøk 1', farge: 'terra',
      under: 'Grunnlag og søknader, så stopp',
      fra: '2023-08-14', til: '2023-12-01',
      merker: [{ dato: '2023-12-01', tekst: 'ingen commits i 2024', stempel: 'STOPP' }],
    },
    {
      id: 'sn2', navn: 'Selvstendig, forsøk 2', farge: 'terra',
      under: '236 commits i tre apper · 13 egne tilstander',
      fra: '2025-04-28', til: '2026-10-22',
      merker: [
        { dato: '2025-09-16', tekst: 'i prod etter 141 dager' },
        { dato: '2026-10-22', tekst: 'egne tilstander fjernet', over: true },
      ],
    },
    {
      id: 'varianter', navn: 'Jordbruker, fisker, barnepasser', farge: 'terra',
      under: 'Varianter av selvstendig',
      fra: '2025-08-05', til: '2026-07-01',
      merker: [],
    },
    {
      id: 'kapabiliteter', navn: 'Nye kapabiliteter', farge: 'ink',
      under: 'Seks tjenester på seks måneder',
      fra: '2026-05-19', til: '2026-11-04',
      prikker: ['2026-05-19', '2026-08-18', '2026-10-19', '2026-10-26', '2026-11-02', '2026-11-03'],
      merker: [],
    },
  ];

  // Andre store løft. commits = [spleis, speil, spesialist] fra fra-datoen, mnd = commits per måned i alle tre.
  // Søkeord i emnet: revurder · brukerutbetaling|delvis refusjon|utbetaling til bruker/sykmeldt|personoppdrag ·
  // totrinn|beslutter · skjønn · avviksvurder|spinnvill · tilkommen.
  const storeLoft = [
    {
      id: 'revurdering', navn: 'Revurdering', under: 'tungt arbeid i to år etter prod',
      fra: '2021-02-10', prod: '2021-06-15', prodTekst: 'på i prod',
      commits: [561, 143, 41],
      mnd: { '2021-02': 5, '2021-03': 5, '2021-04': 10, '2021-05': 8, '2021-06': 32, '2021-07': 13, '2021-08': 8, '2021-09': 28, '2021-10': 38, '2021-11': 4, '2021-12': 10, '2022-01': 6, '2022-02': 9, '2022-03': 4, '2022-04': 48, '2022-05': 16, '2022-06': 38, '2022-07': 5, '2022-08': 85, '2022-09': 43, '2022-10': 14, '2022-11': 27, '2022-12': 18, '2023-01': 11, '2023-02': 18, '2023-03': 22, '2023-04': 9, '2023-05': 14, '2023-06': 7, '2023-07': 3, '2023-08': 29, '2023-09': 12, '2023-10': 17, '2023-11': 7, '2023-12': 2, '2024-01': 3, '2024-02': 6, '2024-03': 3, '2024-04': 3, '2024-05': 10, '2024-06': 5, '2024-08': 1, '2024-09': 3, '2024-10': 5, '2024-11': 3, '2024-12': 3, '2025-01': 8, '2025-02': 2, '2025-03': 15, '2025-04': 3, '2025-05': 3, '2025-06': 3, '2025-07': 2, '2025-08': 1, '2025-10': 4, '2025-11': 13, '2025-12': 3, '2026-03': 1, '2026-04': 6, '2026-05': 3, '2026-06': 3, '2026-09': 1, '2026-10': 2 },
    },
    {
      id: 'brukerutbetaling', navn: 'Utbetaling til sykmeldt', under: 'og delvis refusjon',
      fra: '2021-10-19', prod: '2023-02-20', prodTekst: 'på for alle',
      commits: [62, 15, 12],
      mnd: { '2021-10': 7, '2021-11': 22, '2021-12': 8, '2022-02': 14, '2022-03': 1, '2022-05': 3, '2022-07': 2, '2022-09': 4, '2022-11': 1, '2022-12': 3, '2023-02': 8, '2023-03': 4, '2023-04': 1, '2023-07': 2, '2023-08': 2, '2023-10': 1, '2025-02': 1, '2025-05': 1, '2025-12': 1, '2026-01': 1, '2026-05': 1, '2026-07': 1 },
    },
    {
      id: 'totrinn', navn: 'Totrinnsvurdering', under: 'tre løsninger på fire år',
      fra: '2022-05-12', prod: '2022-06-30', prodTekst: 'på for alle',
      merker: [{ dato: '2023-03-20', tekst: 'ny løsning' }, { dato: '2025-02-15', tekst: 'ny igjen' }],
      commits: [5, 153, 306],
      mnd: { '2022-05': 34, '2022-06': 47, '2022-07': 2, '2022-08': 7, '2022-09': 16, '2022-10': 3, '2022-11': 4, '2023-01': 5, '2023-02': 3, '2023-03': 51, '2023-04': 24, '2023-05': 5, '2023-06': 1, '2023-07': 1, '2023-08': 2, '2023-09': 23, '2023-10': 7, '2023-11': 1, '2023-12': 3, '2024-01': 2, '2024-02': 1, '2024-03': 6, '2024-04': 2, '2024-05': 4, '2024-07': 3, '2024-09': 2, '2024-10': 13, '2024-11': 12, '2024-12': 5, '2025-01': 17, '2025-02': 60, '2025-03': 26, '2025-04': 8, '2025-05': 9, '2025-06': 2, '2025-09': 2, '2025-10': 8, '2025-11': 2, '2025-12': 6, '2026-01': 1, '2026-02': 7, '2026-05': 1, '2026-06': 1, '2026-07': 1, '2026-08': 7, '2026-09': 5, '2026-10': 11 },
    },
    {
      id: 'skjonn', navn: 'Skjønnsfastsettelse', under: 'egne tilstander i Spleis en periode',
      fra: '2023-05-19', prod: '2024-01-05', prodTekst: 'i prod',
      commits: [88, 196, 93],
      mnd: { '2023-05': 8, '2023-06': 49, '2023-07': 7, '2023-08': 57, '2023-09': 21, '2023-10': 10, '2023-11': 5, '2023-12': 12, '2024-01': 27, '2024-02': 40, '2024-03': 19, '2024-04': 4, '2024-05': 2, '2024-06': 7, '2024-08': 3, '2024-09': 2, '2024-10': 13, '2024-11': 3, '2024-12': 9, '2025-01': 14, '2025-02': 13, '2025-03': 14, '2025-04': 3, '2025-05': 1, '2025-06': 1, '2025-07': 1, '2025-08': 3, '2025-09': 1, '2025-10': 1, '2025-12': 5, '2026-01': 3, '2026-03': 4, '2026-04': 2, '2026-05': 2, '2026-06': 2, '2026-07': 1, '2026-08': 1, '2026-09': 3, '2026-10': 4 },
    },
    {
      id: 'avvik', navn: 'Avviksvurdering i Spinnvill', under: 'egen app: + 296 commits første tre mnd',
      fra: '2023-10-17', prod: '2024-01-02', prodTekst: 'Spinnvill tar over',
      commits: [24, 7, 80],
      mnd: { '2023-10': 2, '2023-11': 3, '2023-12': 38, '2024-01': 8, '2024-02': 4, '2024-04': 2, '2024-05': 6, '2024-06': 1, '2024-08': 3, '2024-09': 2, '2024-10': 4, '2024-12': 4, '2025-01': 1, '2025-02': 14, '2025-03': 2, '2025-05': 1, '2025-06': 11, '2025-12': 1, '2026-03': 1, '2026-04': 2, '2026-09': 1 },
    },
    {
      id: 'tilkommen', navn: 'Tilkommen inntekt', under: 'tre versjoner før den kom ut',
      fra: '2023-11-14', prod: '2025-10-22', prodTekst: 'på for alle',
      commits: [90, 200, 71],
      mnd: { '2023-11': 4, '2024-05': 4, '2024-06': 7, '2024-08': 5, '2024-09': 37, '2024-10': 16, '2024-11': 16, '2024-12': 13, '2025-01': 8, '2025-02': 19, '2025-03': 10, '2025-04': 52, '2025-05': 78, '2025-07': 6, '2025-09': 19, '2025-10': 17, '2025-11': 11, '2025-12': 8, '2026-01': 5, '2026-02': 7, '2026-03': 3, '2026-04': 1, '2026-06': 1, '2026-08': 4, '2026-09': 4, '2026-10': 6 },
    },
  ];

  // Commits per uke per kvartal: [kvartal, Spleis + Spenn + Speil + Spesialist, andre apper].
  // Samme tall som i leveransetakt: repoer med team-sas eller tbd i CODEOWNERS, uten bots og merge-commits.
  // 2026-4 gjelder 1. oktober–5. november.
  const takt = [
    ['2020-1', 93, 28], ['2020-2', 84, 24], ['2020-3', 54, 9], ['2020-4', 73, 12],
    ['2021-1', 63, 32], ['2021-2', 60, 27], ['2021-3', 43, 33], ['2021-4', 75, 29],
    ['2022-1', 89, 35], ['2022-2', 71, 39], ['2022-3', 72, 43], ['2022-4', 76, 36],
    ['2023-1', 108, 53], ['2023-2', 101, 36], ['2023-3', 76, 27], ['2023-4', 89, 62],
    ['2024-1', 94, 112], ['2024-2', 81, 47], ['2024-3', 74, 41], ['2024-4', 139, 106],
    ['2025-1', 126, 55], ['2025-2', 73, 29], ['2025-3', 54, 49], ['2025-4', 98, 28],
    ['2026-1', 92, 54], ['2026-2', 53, 72], ['2026-3', 57, 57], ['2026-4', 78, 140],
  ];
  // Fra første commit til første gang funksjonen var på i prod. Samme datoer som i storeLoft og fart.
  const ledetid = [
    { navn: 'Flere arbeidsgivere', fra: '2020-05-14', prod: '2021-02-15', bane: 0 },
    { navn: 'Revurdering', fra: '2021-02-10', prod: '2021-06-15', bane: 1 },
    { navn: 'Utbetaling til sykmeldt', fra: '2021-10-19', prod: '2023-02-20', bane: 2 },
    { navn: 'Totrinnsvurdering', fra: '2022-05-12', prod: '2022-06-30', bane: 1 },
    { navn: 'Skjønnsfastsettelse', fra: '2023-05-19', prod: '2024-01-05', bane: 0 },
    { navn: 'Avviksvurdering', fra: '2023-10-17', prod: '2024-01-02', bane: 1 },
    { navn: 'Tilkommen inntekt', fra: '2023-11-14', prod: '2025-10-22', bane: 2 },
    { navn: 'Selvstendig', fra: '2025-04-28', prod: '2025-09-16', bane: 0 },
    { navn: 'Forsikring for selvstendige', fra: '2025-10-13', prod: '2026-09-07', bane: 3 },
    { navn: 'sp-forsikring', fra: '2026-05-19', prod: '2026-06-15', bane: 0 },
    { navn: 'sp-vilkarsproving', fra: '2026-08-18', prod: '2026-10-01', bane: 1 },
    { navn: 'to til', fra: '2026-10-19', prod: '2026-11-04', bane: 2, deler: [['2026-10-19', '2026-11-04'], ['2026-10-26', '2026-11-02']], tekst: 'sp-medlemskap og sp-rettighetskategori · 7–16 dager' },
  ];
  // Snitt og sammeDag er de samme tallene som i leveransetakt.
  // sammeDag: dager per uke der samme person committet både i Spleis/Spenn og i Speil/Spesialist.
  const teamperioder = [
    {
      id: 'ett', navn: 'Ett team', tid: '2019 – september 2020', fra: '2020-1', til: '2020-3', farge: 'sage',
      commitsUke: 97, sammeDag: '2,3',
      poeng: 'Alle jobbet i hele stacken.',
    },
    {
      id: 'tiger', navn: 'Tigerteam', tid: 'oktober 2020 – september 2022', fra: '2020-4', til: '2022-3', farge: 'sage',
      commitsUke: 100, sammeDag: '2,3',
      poeng: 'Flere arbeidsgivere tok over to år til alle.',
    },
    {
      id: 'to', navn: 'Speilvendt og Spleiselaget', tid: 'oktober 2022 – mars 2026', fra: '2022-4', til: '2026-1', farge: 'terra',
      commitsUke: 144, sammeDag: '0,3',
      poeng: 'Mer kode i uka, men store løft tok fortsatt måneder.',
    },
    {
      id: 'igjen', navn: 'Ett team igjen', tid: 'fra april 2026', fra: '2026-2', til: '2026-4', farge: 'sage',
      commitsUke: 136, sammeDag: '2,0',
      poeng: 'Nye kapabiliteter i prod på 7–44 dager.',
    },
  ];

  const apper = ['Spleis', 'Speil', 'Spesialist'];
  const sporIApper = [
    { navn: ['Flere', 'arbeidsgivere'], commits: [132, 41, 7], tilstander: 0 },
    { navn: ['Selvstendig', 'næringsdrivende'], commits: [142, 49, 45], tilstander: 13 },
    { navn: ['Jordbruker, fisker,', 'barnepasser'], commits: [22, 3, 4], tilstander: 0 },
    { navn: ['Arbeidsledig', 'og frilans'], commits: [48, 2, 6], tilstander: 6 },
  ];

  // status: prod | pågår | spec | spleis (regelen bor fortsatt i Spleis og er ikke trukket ut ennå)
  const kapabiliteter = [
    { id: 'inntekt', navn: ['Inntekt'], tjeneste: 'sp-inntekt', status: 'spec', rad: 0 },
    { id: 'medlemskap', navn: ['Medlemskap'], tjeneste: 'sp-medlemskap', status: 'prod', rad: 0 },
    { id: 'rettighetskategori', navn: ['Rettighets-', 'kategori'], tjeneste: 'sp-rettighetskategori', status: 'prod', rad: 0 },
    { id: 'opptjening', navn: ['Opptjening'], tjeneste: 'sp-vilkarsproving', status: 'prod', rad: 0 },
    { id: 'sykepengegrunnlag', navn: ['Sykepenge-', 'grunnlag'], tjeneste: 'sp-sykepengegrunnlag', status: 'spec', rad: 0 },
    { id: 'minsteinntekt', navn: ['Minste-', 'inntekt'], tjeneste: 'i Spleis', status: 'spleis', rad: 0 },
    { id: 'dekning', navn: ['Dekning'], tjeneste: 'i Spleis', status: 'spleis', rad: 0 },
    { id: 'forsikring', navn: ['Forsikring'], tjeneste: 'sp-forsikring', status: 'prod', rad: 1 },
    { id: 'agp', navn: ['Arbeidsgiver-', 'periode/ventetid'], tjeneste: 'i Spleis', status: 'spleis', rad: 1 },
    { id: 'arbeidsuforhet', navn: ['Arbeids-', 'uførhet'], tjeneste: 'i Spleis', status: 'spleis', rad: 1 },
    { id: 'avslagsdager', navn: ['Avslagsdager'], tjeneste: 'sp-avslagsdager', status: 'pågår', rad: 1 },
    { id: 'andreYtelser', navn: ['Andre ytelser'], tjeneste: 'sp-andre-ytelser', status: 'pågår', rad: 1 },
    { id: 'maksdato', navn: ['Maksdato'], tjeneste: 'i Spleis', status: 'spleis', rad: 1 },
  ];

  // Per kategori: hvilke kapabiliteter som trenger noe nytt.
  // R = ny regel eller konfigurasjon i kapabiliteten, D = ny datakilde. Alt annet gjenbrukes uendret.
  // Kilde: docs/abstraksjoner-kap8.md (seksjonene for hver abstraksjon) og docs/folketrygdloven-kap8.md.
  const kategorier = [
    { id: 'at', navn: 'Arbeidstaker', kort: 'AT', hjemmel: '§§ 8-15–8-33', finnes: true, effekter: {} },
    {
      id: 'sn', navn: 'Selvstendig', kort: 'SN', hjemmel: '§§ 8-34–8-37', finnes: true,
      effekter: {
        inntekt: ['D', 'Sigrun'],
        sykepengegrunnlag: ['R', 'snitt av tre år'],
        agp: ['R', 'ventetid'],
        arbeidsuforhet: ['R', '§ 8-34'],
        dekning: ['R', '80 %'],
        forsikring: ['R', '§ 8-36'],
      },
    },
    {
      id: 'fl', navn: 'Frilanser', kort: 'FL', hjemmel: '§§ 8-38, 8-39',
      effekter: {
        inntekt: ['D', 'frilansinntekt'],
        rettighetskategori: ['R', 'ny hovedkategori'],
        sykepengegrunnlag: ['R', '§ 8-38'],
        agp: ['R', 'ventetid'],
        arbeidsuforhet: ['R', '§ 8-38'],
        dekning: ['R', '100 % etter ventetid'],
        forsikring: ['R', '§ 8-39'],
      },
    },
    {
      id: 'atfl', navn: 'Arbeidstaker + frilanser', kort: 'AT+FL', hjemmel: '§ 8-40',
      effekter: {
        inntekt: ['D', 'frilansinntekt'],
        rettighetskategori: ['R', 'ny hovedkategori'],
        sykepengegrunnlag: ['R', 'som arbeidstaker'],
        agp: ['R', 'per yrkesaktivitet'],
      },
    },
    {
      id: 'kombsn', navn: 'Kombinert med SN', kort: 'Komb.', hjemmel: '§§ 8-41–8-43',
      effekter: {
        rettighetskategori: ['R', 'slutt å forkaste'],
        sykepengegrunnlag: ['R', 'differansen'],
        agp: ['R', 'AGP og ventetid'],
        dekning: ['R', 'per yrkesaktivitet'],
        forsikring: ['R', 'tredje ledd'],
      },
    },
    {
      id: 'inaktiv', navn: 'Inaktiv', kort: 'Inaktiv', hjemmel: '§ 8-47',
      effekter: {
        rettighetskategori: ['R', 'variant a eller b'],
        opptjening: ['R', 'variant b'],
        sykepengegrunnlag: ['R', 'som SN'],
        minsteinntekt: ['R', '1 G'],
        agp: ['R', 'fra dag 15'],
        arbeidsuforhet: ['R', 'fra legebesøk'],
        dekning: ['R', '65 % eller 100 %'],
      },
    },
    {
      id: 'dagpenger', navn: 'Dagpenger', kort: 'Dagp.', hjemmel: '§ 8-49',
      effekter: {
        inntekt: ['D', 'dagpenger per uke'],
        rettighetskategori: ['R', 'kombineres'],
        opptjening: ['R', 'likestilt arbeid'],
        sykepengegrunnlag: ['R', 'tredje ledd'],
        agp: ['R', 'fra dag 1'],
        arbeidsuforhet: ['R', 'fra legebesøk'],
        dekning: ['R', 'uavklart'],
      },
    },
    {
      id: 'verneplikt', navn: 'Vernepliktig', kort: 'Verne', hjemmel: '§ 8-46',
      effekter: {
        inntekt: ['D', 'før tjenesten'],
        rettighetskategori: ['R', 'ny hovedkategori'],
        opptjening: ['R', 'unntak'],
        sykepengegrunnlag: ['R', 'minst 2 G'],
        minsteinntekt: ['R', 'unntak'],
        agp: ['R', 'fra dimittering'],
      },
    },
    {
      id: 'bladb', navn: 'Fisker på blad B', kort: 'Blad B', hjemmel: '§ 8-45',
      effekter: {
        rettighetskategori: ['R', 'tilleggskategori'],
        opptjening: ['R', 'unntak'],
      },
    },
    {
      id: 'skip', navn: 'Arbeidstaker på skip', kort: 'Skip', hjemmel: '§ 8-44',
      effekter: {
        rettighetskategori: ['R', 'tilleggskategori'],
        opptjening: ['R', 'unntak'],
        arbeidsuforhet: ['R', 'ufør på skip'],
      },
    },
    {
      id: 'yrkesskade', navn: 'Yrkesskade', kort: 'Yrkessk.', hjemmel: '§ 8-55',
      effekter: {
        rettighetskategori: ['R', 'tilleggskategori'],
        opptjening: ['R', 'unntak'],
        sykepengegrunnlag: ['R', 'minst ved skaden'],
        avslagsdager: ['R', 'ikke § 8-9'],
        maksdato: ['R', 'egne regler'],
      },
    },
  ];

  // Fra første commit til første versjon i prod (toggle på eller deploy til prod).
  // Dette er ikke tiden til ferdig funksjonalitet.
  const fart = [
    { navn: 'Selvstendig', under: 'gammelt spor, forsøk 2', fra: '2025-04-28', til: '2025-09-16', gammel: true, notat: 'toggle på i prod' },
    { navn: 'Forsikring for selvstendige', under: 'startet under delingen', fra: '2025-10-13', til: '2026-09-07', gammel: true, notat: 'toggle på i prod' },
    { navn: 'sp-forsikring', under: 'første kapabilitet', fra: '2026-05-19', til: '2026-06-15', notat: 'skrudd på i prod' },
    { navn: 'sp-vilkarsproving', under: 'opptjening', fra: '2026-08-18', til: '2026-10-01', notat: 'i bruk fra Spleis i prod' },
    { navn: 'sp-medlemskap', under: 'kopi av sp-vilkarsproving', fra: '2026-10-19', til: '2026-11-04', notat: 'i bruk fra Spleis i prod' },
    { navn: 'sp-rettighetskategori', under: 'ny tilstand i Spleis', fra: '2026-10-26', til: '2026-11-02', notat: 'toggle fjernet i Spleis' },
  ];

  return { spor, storeLoft, takt, ledetid, teamperioder, apper, sporIApper, kapabiliteter, kategorier, fart, idag: '2026-11-06' };
})();
