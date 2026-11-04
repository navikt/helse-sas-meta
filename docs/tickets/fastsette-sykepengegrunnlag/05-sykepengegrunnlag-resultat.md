# 05: Behovet `SykepengegrunnlagResultat`

**Spec:** [Fastsette sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/fastsette-sykepengegrunnlag.md)

**Fase:** 2

**Repo:** `sp-sykepengegrunnlag`

**Hva skal lages:** sp-sykepengegrunnlag svarer på `SykepengegrunnlagResultat` med tallene Spleis trenger i beregningen: fastsettelsesmåten, grunnbeløpet, 6G, beregningsgrunnlaget, sykepengegrunnlaget, årsinntekt per yrkesaktivitet, deaktiverte arbeidsforhold, avviksvurderingen og om grunnlaget må skjønnsfastsettes.

**Blokkeres av:** [03: Avviksvurdering for arbeidstakere](03-avviksvurdering.md), [04: Selvstendig næringsdrivende etter § 8-35](04-selvstendig-naeringsdrivende.md)

**Status:** klar

## Akseptansekriterier

- [ ] Løsningen har alle feltene i specen med de typene og verdiene som står der.
- [ ] `fastsattÅrsinntekt` er den skjønnsfastsatte årsinntekten hvis den finnes, ellers omregnet årsinntekt.
- [ ] `trengerSkjønnsfastsettelse` er `true` når avviket ikke er akseptabelt og `fastsettelse` ikke er `ETTER_SKJØNN`.
- [ ] En ukjent ID gir ubesvart behov og logget feil. Backfill ved ukjent ID kommer i ticket [09](09-backfill-i-sp-sykepengegrunnlag.md).
- [ ] Rapid-tester dekker arbeidstaker, selvstendig næringsdrivende, grunnlag over 6G, avvik over 25 % og ukjent ID.
