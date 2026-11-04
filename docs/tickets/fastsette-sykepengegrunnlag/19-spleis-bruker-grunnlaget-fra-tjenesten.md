# 19: Spleis bruker grunnlaget fra sp-sykepengegrunnlag bak bytte-togglen

**Spec:** [Fastsette sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/fastsette-sykepengegrunnlag.md)

**Fase:** 3

**Repo:** `spleis`

**Hva skal lages:** Med bytte-togglen på bruker Spleis svaret på `SykepengegrunnlagResultat` i beregningen i stedet for `Inntektsgrunnlag`. Spleis lager RV_IV_2 når grunnlaget må skjønnsfastsettes, forkaster ved `IKKE_FASTSATT`, og beholder ID-ene fra tjenestene i det fulle vilkårsgrunnlaget. Selvstendig næringsdrivende får grunnlaget fra Sigrun.

**Blokkeres av:** [06: `AvventerSykepengegrunnlag` i Spleis bak toggle for skyggekjøring](06-spleis-avventer-sykepengegrunnlag.md)

**Status:** klar

## Akseptansekriterier

- [ ] Perioden venter på `SykepengegrunnlagResultat` i `AvventerHistorikk` og `AvventerHistorikkRevurdering`.
- [ ] Beregningen bruker `fastsattÅrsinntekt` per yrkesaktivitet, `sykepengegrunnlag`, `seksG` og `grunnbeløp`. 6G-begrensningen og minsteinntekten gir de samme utbetalingene som før for de samme tallene.
- [ ] Arbeidsgivere med søknad som mangler i `yrkesaktiviteter`, får varselet de får i dag.
- [ ] `trengerSkjønnsfastsettelse: true` gir RV_IV_2 på behandlingen.
- [ ] `IKKE_FASTSATT` forkaster sykefraværstilfellet med RV_IV_12 for `MANGLER_PENSJONSGIVENDE_INNTEKT` og RV_IV_13 for `INNTEKT_FRA_ANNEN_YRKESAKTIVITET`, med en uttømmende `when`.
- [ ] Det fulle vilkårsgrunnlaget beholder `inntektsavklaringId` og `sykepengegrunnlagId` fra tjenestene.
- [ ] Spleis lager ikke grunnlaget for selvstendig næringsdrivende fra søknaden, og RV_IV_12 kommer bare fra løsningen. Varslene for varig endring, ny i arbeidslivet og avvikling er uendret.
- [ ] Spleis lager fortsatt sitt eget `Inntektsgrunnlag`.
- [ ] Med togglen av beregner Spleis som i dag.
- [ ] E2e-tester dekker begge utfallene, begge årsakene, `trengerSkjønnsfastsettelse`, 6G-begrensning, minsteinntekt og selvstendig næringsdrivende, med togglen av og på.
