// Tallene er hentet fra git log i repoene som er sjekket ut i sas-meta, 6. november 2026.
// Commits uten bots og merge-commits. Kategorier er funnet med nøkkelord i commit-emnet.
window.KLOSSER = (() => {
  const perioder = [
    {
      id: 'ett', navn: 'Ett team', tid: '2019 – høsten 2020',
      fokus: 'Arbeidstaker',
      tekst: 'Spleis i prod 6. november 2019. Én kategori og én arbeidsgiver.',
    },
    {
      id: 'tiger', navn: 'Tigerteam', tid: 'høsten 2020 – høsten 2022',
      fokus: 'Flere arbeidsgivere',
      tekst: 'Et eget tigerteam. På for alle saksbehandlere 8. september 2022.',
    },
    {
      id: 'to', navn: 'To team', tid: 'høsten 2022 – mars 2026',
      fokus: 'Selvstendig, frilans, arbeidsledig og jordbruker',
      tekst: 'Ett spor per kategori gjennom Spleis, Speil og Spesialist.',
    },
    {
      id: 'igjen', navn: 'Ett team igjen', tid: 'fra april 2026',
      fokus: 'Kapabiliteter',
      tekst: 'Seks sp-tjenester på seks måneder. Kategorien er et svar, ikke et spor.',
    },
  ];

  // Første og siste commit om kategorien i spleis, speil, spesialist og appene rundt.
  // deler: perioder med arbeid. merker: hendelser fra commit-meldingene.
  const spor = [
    {
      id: 'at', navn: 'Arbeidstaker', under: 'grunnmuren', periode: 'ett',
      deler: [['2019-06-26', '2019-11-06']],
      merker: [{ dato: '2019-11-06', tekst: 'Spleis i prod' }],
    },
    {
      id: 'flere', navn: 'Flere arbeidsgivere', under: 'eget tigerteam', periode: 'tiger',
      deler: [['2020-05-14', '2022-09-08']],
      merker: [{ dato: '2021-02-15', tekst: 'utvalgte' }, { dato: '2022-09-08', tekst: 'alle' }],
    },
    {
      id: 'fl', navn: 'Frilans og arbeidsledig', under: 'tatt inn, men forkastes', periode: 'to',
      deler: [['2023-07-06', '2023-12-18'], ['2025-09-24', '2025-11-11']],
      merker: [{ dato: '2026-10-19', tekst: 'tilstander fjernet', stopp: true }],
    },
    {
      id: 'sn1', navn: 'Selvstendig, forsøk 1', under: 'stoppet etter fire måneder', periode: 'to',
      deler: [['2023-08-14', '2023-12-01']],
      merker: [{ dato: '2023-12-01', tekst: 'stopp', stopp: true }],
    },
    {
      id: 'sn2', navn: 'Selvstendig, forsøk 2', under: '13 egne tilstander i Spleis', periode: 'to',
      deler: [['2025-04-28', '2026-07-01']],
      merker: [{ dato: '2025-09-16', tekst: 'i prod' }, { dato: '2026-10-20', tekst: 'tilstander fjernet', stopp: true }],
    },
    {
      id: 'jb', navn: 'Jordbruker, fisker, barnepasser', under: 'varianter av selvstendig', periode: 'to',
      deler: [['2025-08-05', '2025-12-18']],
      merker: [{ dato: '2025-11-14', tekst: 'barnepasser skrudd av' }],
    },
  ];

  // start: repoet ble opprettet. prod: Spleis tok tjenesten i bruk i prod. planlagt: beskrevet i ADR 0008, ikke laget ennå.
  const kapabiliteter = [
    { navn: 'sp-forsikring', regel: 'Forsikring', start: '2026-05-19', prod: '2026-06-15' },
    { navn: 'sp-vilkarsproving', regel: 'Opptjening', start: '2026-08-18', prod: '2026-10-01' },
    { navn: 'sp-medlemskap', regel: 'Medlemskap', start: '2026-10-19', prod: '2026-11-04' },
    { navn: 'sp-rettighetskategori', regel: 'Rettighetskategori', start: '2026-10-26', prod: '2026-11-02' },
    { navn: 'sp-andre-ytelser', regel: 'Andre ytelser', start: '2026-11-02' },
    { navn: 'sp-avslagsdager', regel: 'Avslagsdager', start: '2026-11-03' },
    { navn: 'sp-inntekt', regel: 'Inntektsavklaring', planlagt: true },
    { navn: 'sp-sykepengegrunnlag', regel: 'Sykepengegrunnlag', planlagt: true },
  ];

  // Commits om kategorien fram til april 2026, per app.
  const apper = ['Spleis', 'Speil', 'Spesialist', 'Spedisjon', 'Sparkel', 'Spre', 'Sporbar', 'Spekemat', 'Spenn'];
  const stacken = [
    { navn: 'Flere arbeidsgivere', periode: 'tiger', commits: [132, 41, 7, 0, 0, 0, 0, 0, 0] },
    { navn: 'Selvstendig', periode: 'to', commits: [142, 49, 45, 7, 4, 9, 5, 2, 1] },
    { navn: 'Frilans og arbeidsledig', periode: 'to', commits: [48, 2, 6, 8, 6, 0, 1, 0, 0] },
    { navn: 'Jordbruker, fisker, barnepasser', periode: 'to', commits: [22, 3, 4, 1, 2, 0, 0, 2, 2] },
  ];

  // TilstandType i Spleis 18. oktober 2026, før kategori-tilstandene ble fjernet.
  const tilstander = {
    felles: 22,
    kategori: [
      { navn: 'SELVSTENDIG_', antall: 13 },
      { navn: 'FRILANS_', antall: 3 },
      { navn: 'ARBEIDSLEDIG_', antall: 3 },
    ],
    ny: 'AVVENTER_RETTIGHETSKATEGORI',
  };

  // Linjer i sykepenger-model/src/main i Spleis som nevner Selvstendig, Frilans, Arbeidsledig eller Jordbruker.
  const kategorilinjer = [
    ['2025-01-01', 27], ['2025-02-01', 27], ['2025-03-01', 27], ['2025-04-01', 27], ['2025-05-01', 44],
    ['2025-06-01', 131], ['2025-07-01', 299], ['2025-08-01', 299], ['2025-09-01', 424], ['2025-10-01', 384],
    ['2025-11-01', 380], ['2025-12-01', 841], ['2026-01-01', 818], ['2026-02-01', 869], ['2026-03-01', 872],
    ['2026-04-01', 873], ['2026-05-01', 876], ['2026-06-01', 879], ['2026-07-01', 857], ['2026-08-01', 859],
    ['2026-09-01', 859], ['2026-10-01', 851], ['2026-10-19', 840], ['2026-10-21', 682], ['2026-10-23', 247],
    ['2026-11-03', 235], ['2026-11-06', 215],
  ];
  const linjemerker = [
    { dato: '2025-05-27', tekst: 'tilstander for selvstendig' },
    { dato: '2025-11-10', tekst: 'tilstander for frilans og arbeidsledig' },
    { dato: '2026-10-20', tekst: 'kategori-tilstandene fjernes' },
  ];

  // sp-forsikring 22. mai 2026: én regel per commit. filer, linjer lagt til, linjer fjernet.
  const enDag = [
    { hash: '1346247', tekst: 'Støtt 100% fra dag 1 for jordbruker', filer: 2, pluss: 27, minus: 1 },
    { hash: 'f7cf0e0', tekst: 'Gi feil med jordbrukerforsikring dersom personen ikke er jordbruker', filer: 2, pluss: 19, minus: 4 },
    { hash: '7fe48ab', tekst: 'Støtt 100% fra dag 1 for frilansere', filer: 2, pluss: 43, minus: 3 },
    { hash: '7509b81', tekst: 'Feil hvis selvstendig har frilanserforsikring', filer: 1, pluss: 24, minus: 0 },
    { hash: 'f48f51e', tekst: 'Støtt kollektiv forsikring for jordbrukere', filer: 2, pluss: 35, minus: 2 },
    { hash: 'e7a2611', tekst: 'Støtt kollektiv forsikring for fiskere på blad B', filer: 2, pluss: 31, minus: 1 },
  ];

  // Fra docs/abstraksjoner-kap8.md: hva hver kategori trenger. R = ny regel, D = ny datakilde.
  // Kapabiliteter som ikke er nevnt, gjenbrukes uendret. Dette er en plan, ikke målt.
  const kolonner = [
    ['inntekt', 'Inntekt'], ['rettighetskategori', 'Rettighets\u00adkategori'], ['opptjening', 'Opptjening'],
    ['medlemskap', 'Medlemskap'], ['sykepengegrunnlag', 'Sykepenge\u00adgrunnlag'], ['minsteinntekt', 'Minste\u00adinntekt'],
    ['agp', 'AGP og ventetid'], ['arbeidsuforhet', 'Arbeids\u00aduførhet'], ['dekning', 'Dekning'], ['forsikring', 'Forsikring'],
    ['andreYtelser', 'Andre ytelser'], ['avslagsdager', 'Avslags\u00addager'], ['maksdato', 'Maksdato'],
  ];
  const nyeKategorier = [
    { navn: 'Frilanser', hjemmel: '§§ 8-38–8-39', effekter: { inntekt: 'D', rettighetskategori: 'R', sykepengegrunnlag: 'R', agp: 'R', arbeidsuforhet: 'R', dekning: 'R', forsikring: 'R' } },
    { navn: 'Inaktiv', hjemmel: '§ 8-47', effekter: { rettighetskategori: 'R', opptjening: 'R', sykepengegrunnlag: 'R', minsteinntekt: 'R', agp: 'R', arbeidsuforhet: 'R', dekning: 'R' } },
    { navn: 'Dagpenger', hjemmel: '§ 8-49', effekter: { inntekt: 'D', rettighetskategori: 'R', opptjening: 'R', sykepengegrunnlag: 'R', agp: 'R', arbeidsuforhet: 'R', dekning: 'R' } },
    { navn: 'Vernepliktig', hjemmel: '§ 8-46', effekter: { inntekt: 'D', rettighetskategori: 'R', opptjening: 'R', sykepengegrunnlag: 'R', minsteinntekt: 'R', agp: 'R' } },
    { navn: 'Fisker på blad B', hjemmel: '§ 8-45', effekter: { rettighetskategori: 'R', opptjening: 'R' } },
    { navn: 'Yrkesskade', hjemmel: '§ 8-55', effekter: { rettighetskategori: 'R', opptjening: 'R', sykepengegrunnlag: 'R', avslagsdager: 'R', maksdato: 'R' } },
  ];

  return { perioder, spor, kapabiliteter, apper, stacken, tilstander, kategorilinjer, linjemerker, enDag, kolonner, nyeKategorier, idag: '2026-11-06' };
})();
