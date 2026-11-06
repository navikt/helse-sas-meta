// Tallene kommer fra git log i alle repoer med @navikt/team-sas eller @navikt/tbd i CODEOWNERS,
// uten merges og uten bots (dependabot, github-actions, renovate). Hentet 2026-11-05.
window.TAKT = (() => {
  // [kvartal, commits per uke i alle repoer, Spleis + Spenn, Speil + Spesialist]
  // 2026-4 gjelder 1. oktober til 5. november.
  const kvartal = [
    ['2020-1', 121.5, 72.9, 20.2], ['2020-2', 108.0, 50.8, 32.8], ['2020-3', 62.3, 19.2, 34.5], ['2020-4', 84.4, 36.9, 35.7],
    ['2021-1', 95.6, 26.3, 37.1], ['2021-2', 86.9, 27.8, 31.8], ['2021-3', 75.8, 23.0, 19.8], ['2021-4', 104.5, 50.9, 24.3],
    ['2022-1', 124.7, 59.5, 29.9], ['2022-2', 109.9, 35.5, 35.3], ['2022-3', 115.4, 40.1, 31.9], ['2022-4', 112.4, 42.6, 33.6],
    ['2023-1', 161.2, 58.6, 49.8], ['2023-2', 136.5, 37.5, 63.2], ['2023-3', 102.6, 26.1, 49.7], ['2023-4', 151.0, 27.1, 62.2],
    ['2024-1', 206.6, 34.0, 60.3], ['2024-2', 127.5, 27.3, 53.5], ['2024-3', 115.0, 30.5, 43.1], ['2024-4', 245.8, 56.6, 82.8],
    ['2025-1', 181.9, 42.2, 84.3], ['2025-2', 101.7, 26.9, 46.3], ['2025-3', 103.3, 19.9, 34.5], ['2025-4', 126.3, 44.4, 53.6],
    ['2026-1', 146.4, 21.1, 71.1], ['2026-2', 125.9, 19.9, 33.5], ['2026-3', 114.4, 16.1, 40.9], ['2026-4', 218.6, 20.6, 57.7],
  ];

  const perioder = [
    {
      id: 'ett', navn: 'Ett team', tid: '2019 til september 2020', fra: '2020-1', til: '2020-3',
      commitsUke: 97,
    },
    {
      id: 'tiger', navn: 'Tigerteam', tid: 'oktober 2020 til september 2022', fra: '2020-4', til: '2022-3',
      commitsUke: 100,
    },
    {
      id: 'to', navn: 'Speilvendt og Spleiselaget', tid: 'oktober 2022 til mars 2026', fra: '2022-4', til: '2026-1',
      commitsUke: 144,
    },
    {
      id: 'igjen', navn: 'Ett team igjen', tid: 'fra april 2026', fra: '2026-2', til: '2026-4',
      commitsUke: 136,
    },
  ];

  // Utviklere med minst 3 commits både i Spleis/Spenn og i Speil/Spesialist samme kvartal. Samme rekkefølge som kvartal.
  const broKvartal = [10, 10, 11, 11, 12, 11, 10, 15, 13, 7, 5, 6, 2, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 6, 9, 6];

  // Dager per uke der samme person committet både i Spleis/Spenn og i Speil/Spesialist.
  const sammeDag = { ett: '2,3', tiger: '2,3', to: '0,3', igjen: '2,0' };

  // Når en produsent endrer kontrakten: hvor ofte gjør samme person konsumentendringen innen 14 dager.
  // Spleis-API-et og Spesialist-skjemaet kom etter oktober 2020, så ett team mangler tall.
  const kontrakt = [
    { navn: 'Spleis-API → Spesialist', grense: 'over teamgrensen', verdier: { tiger: 53, to: 7, igjen: 42 }, median: { tiger: 3, to: 6, igjen: 0 } },
    { navn: 'Spesialist-skjema → Speil', grense: 'inne i Speilvendt', verdier: { tiger: 62, to: 70, igjen: 88 }, median: { tiger: 0, to: 0, igjen: 0 } },
  ];

  // Dager med commits om featuren, regnet fra første commit. S = Spleis-siden, V = Speil-siden,
  // bro = dager med commits fra noen som jobbet på begge sider i featuren.
  // Prod er datoen Spleis tok featuren i bruk i prod. Avslagsdager og graderte andre ytelser er ikke ferdige og er ikke med.
  const stafett = [
    { navn: "Revurdering", start: '2021-02-02', prod: '2021-06-15', S: [8, 16, 30, 31, 77, 88, 89, 90, 91, 127, 133], V: [0, 1, 52, 70, 79, 80, 91, 92, 107, 122, 126, 132], bro: [0, 8, 16, 30, 31, 52, 70, 77, 79, 80, 90, 91, 92, 126, 127, 133] },
    { navn: "Overstyring av inntekt", start: '2021-06-22', prod: '2021-10-20', S: [45, 48, 70, 71, 105, 106, 107, 111], V: [0, 50, 51, 55, 106, 107, 119, 120], bro: [45, 48, 50, 51, 55, 70, 71, 105, 106, 107, 111, 120] },
    { navn: "Skjønnsfastsettelse", start: '2023-05-19', prod: '2024-01-05', S: [0, 4, 11, 12, 13, 14, 17, 21, 24, 25, 26, 32, 33, 34, 35, 38, 47, 48, 76, 82, 83, 94, 97, 122, 138, 139, 213, 214, 216, 228, 229], V: [14, 24, 27, 31, 33, 38, 39, 41, 42, 53, 76, 81, 82, 83, 87, 88, 89, 90, 91, 94, 95, 96, 97, 98, 105, 108, 109, 111, 116, 117, 118, 119, 122, 137, 157, 164, 165, 166, 171, 180, 187, 206, 214, 215, 216, 217, 231], bro: [] },
    { navn: "Minimum sykdomsgrad", start: '2024-06-20', prod: '2024-09-24', S: [0, 20, 69], V: [55, 63, 64, 67, 68, 96], bro: [] },
    { navn: "Inntekt fra A-ordningen", start: '2024-09-20', prod: '2025-02-13', S: [0, 12, 48, 60, 61, 63, 71, 82, 87, 126, 143], V: [48, 82], bro: [] },
    { navn: "Selvstendig næringsdrivende", start: '2025-04-30', prod: '2025-09-16', S: [0, 2, 6, 9, 19, 20, 22, 25, 27, 28, 33, 36, 97, 98, 104, 105, 107, 110, 111, 112, 113, 117, 118, 120, 121, 123, 125, 127, 128, 134, 135, 138, 139], V: [27, 28, 33, 48, 50, 51, 58, 96, 99, 103, 111, 118, 120, 125, 138, 139], bro: [] },
    { navn: "Tilkommen inntekt", start: '2023-11-14', prod: '2025-10-22', S: [0, 1, 196, 197, 198, 203, 204, 209, 212, 219, 287, 294, 297, 300, 301, 304, 307, 309, 337, 339, 343, 345, 350, 351, 363, 422, 443, 444, 447, 448, 450, 451, 455, 456, 461, 471, 472, 476, 477, 478, 483, 553, 554, 708], V: [290, 293, 294, 295, 297, 300, 307, 310, 351, 352, 353, 356, 358, 360, 364, 379, 384, 391, 392, 394, 483, 484, 505, 511, 512, 514, 519, 525, 527, 528, 531, 532, 533, 538, 539, 540, 541, 542, 545, 549, 550, 552, 553, 554, 555, 556, 559, 560, 561, 597, 598, 679, 680, 681, 682, 689, 692, 698, 701, 702, 706, 707, 708], bro: [] },
    { navn: "Forsikring for selvstendige", start: '2025-10-13', prod: '2026-09-07', S: [0, 1, 11, 14, 15, 16, 18, 21, 23, 42, 122, 127, 128, 137, 142, 147, 149, 151, 197, 218, 219, 220, 221, 222, 225, 227, 228, 231, 232, 238, 239, 240, 241, 242, 245, 246, 247, 248, 249, 252, 253, 254, 255, 259, 260, 261, 262, 263, 266, 267, 268, 270, 273, 280, 281, 288, 294, 295, 296, 297, 302, 303, 304, 307, 308, 309, 310, 311, 312, 314, 315, 316, 317, 324, 325, 326, 329], V: [86, 128, 136, 219, 259, 260, 270, 302, 303, 304, 305, 308, 316, 317, 325], bro: [197, 218, 219, 221, 222, 225, 227, 228, 231, 232, 238, 239, 245, 246, 247, 248, 249, 252, 253, 254, 255, 259, 260, 261, 262, 263, 266, 267, 280, 281, 288, 294, 295, 296, 302, 303, 304, 305, 307, 308, 309, 310, 311, 312, 314, 315, 316, 317, 324, 325, 326, 329] },
    { navn: "Vilkårsprøving", start: '2026-08-12', prod: '2026-10-01', S: [0, 2, 5, 6, 7, 8, 9, 12, 13, 14, 15, 19, 20, 21, 29, 30, 36, 38, 40, 41, 42, 43, 47, 48, 49, 50], V: [9, 12, 13, 14, 15, 20, 21, 29, 47, 48, 49, 50], bro: [0, 2, 5, 6, 7, 8, 9, 12, 13, 14, 15, 19, 20, 21, 29, 30, 36, 40, 41, 42, 43, 47, 48, 49, 50] },
    { navn: "Medlemskap", start: '2026-10-19', prod: '2026-11-04', S: [0, 1, 2, 3, 4, 8, 9, 15, 16], V: [9, 15], bro: [0, 1, 2, 3, 4, 8, 9, 15, 16] },
    { navn: "Rettighetskategori", start: '2026-10-26', prod: '2026-11-02', S: [2, 3, 4, 7], V: [3], bro: [2, 3, 4, 7] },
  ];

  // Utviklere med minst 5 commits i Spleis/Spenn etter april 2026, etter hvor de jobbet under delingen.
  const spleisNa = [
    { navn: 'Var på Speil-siden', antall: 8, klasse: 'speilvendt' },
    { navn: 'Var på Spleis-siden', antall: 5, klasse: 'spleiselaget' },
    { navn: 'Ny', antall: 1, klasse: 'ny' },
  ];

  // Utvalg fra docs/tidslinje.md. Datoen er når funksjonen kom i prod.
  const milepaler = [
    ['2019-05-13', 'Spenn i prod'],
    ['2019-11-06', 'Spleis i prod'],
    ['2020-10-14', 'Første automatiske godkjenning'],
    ['2020-11-17', 'Speil v2'],
    ['2021-02-15', 'Flere arbeidsgivere'],
    ['2021-06-15', 'Revurdering'],
    ['2021-10-20', 'Overstyring av inntekt'],
    ['2022-06-30', 'Totrinnsvurdering'],
    ['2022-09-08', 'Flere arbeidsgivere for alle'],
    ['2023-01-09', 'Avhukbare varsler'],
    ['2023-04-17', 'Forespørsel til arbeidsgiver'],
    ['2023-11-08', 'Ny oppgaveoversikt'],
    ['2024-01-05', 'Skjønnsfastsettelse'],
    ['2024-09-24', 'Minimum sykdomsgrad'],
    ['2025-02-13', 'Inntekt fra A-ordningen'],
    ['2025-09-16', 'Selvstendig og tilkommen inntekt'],
    ['2026-09-07', 'Forsikring for selvstendige'],
    ['2026-10-01', 'Vilkårsprøving'],
    ['2026-11-04', 'Medlemskap og rettighetskategori'],
  ];

  return { kvartal, perioder, broKvartal, sammeDag, kontrakt, stafett, spleisNa, milepaler };
})();
