// Tallene er hentet fra git log i spleis, speil, spesialist og sp-*-repoene 4. november 2026.
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
      under: '217 commits i tre apper',
      fra: '2020-05-14', til: '2022-08-10',
      merker: [{ dato: '2022-08-10', tekst: 'siste toggle fjernet' }],
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
      under: '255 commits · 15 egne tilstander',
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
      prikker: ['2026-05-19', '2026-08-18', '2026-10-19', '2026-10-28', '2026-11-02', '2026-11-03'],
      merker: [],
    },
  ];

  const apper = ['Spleis', 'Speil', 'Spesialist'];
  const sporIApper = [
    { navn: ['Flere', 'arbeidsgivere'], commits: [155, 49, 13], tilstander: 0 },
    { navn: ['Selvstendig', 'næringsdrivende'], commits: [180, 39, 36], tilstander: 15 },
    { navn: ['Jordbruker, fisker,', 'barnepasser'], commits: [32, 3, 4], tilstander: 0 },
    { navn: ['Arbeidsledig', 'og frilans'], commits: [62, 3, 11], tilstander: 6 },
  ];

  // status: prod | pågår | spec | spleis (regelen bor fortsatt i Spleis og er ikke trukket ut ennå)
  const kapabiliteter = [
    { id: 'inntekt', navn: ['Inntekt'], tjeneste: 'sp-inntekt', status: 'spec', rad: 0 },
    { id: 'medlemskap', navn: ['Medlemskap'], tjeneste: 'sp-medlemskap', status: 'pågår', rad: 0 },
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
    { navn: 'sp-forsikring', under: 'første kapabilitet', fra: '2026-05-19', til: '2026-06-15', notat: 'skrudd på i prod' },
    { navn: 'sp-vilkarsproving', under: 'opptjening', fra: '2026-08-18', til: '2026-08-27', notat: 'deployet i prod' },
    { navn: 'sp-rettighetskategori', under: 'ny tilstand i Spleis', fra: '2026-10-28', til: '2026-11-02', notat: 'toggle fjernet i Spleis' },
    { navn: 'sp-andre-ytelser', under: 'graderte andre ytelser', fra: '2026-11-02', til: '2026-11-02', notat: 'dev og prod første dag' },
    { navn: 'sp-avslagsdager', under: 'oppholdskravet', fra: '2026-11-03', til: '2026-11-04', notat: 'fire tickets ferdig' },
  ];

  return { spor, apper, sporIApper, kapabiliteter, kategorier, fart, idag: '2026-11-04' };
})();
