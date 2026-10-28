# 21: Beregne med beløpene fra oppslaget i `AvventerHistorikk`

**Spec:** [Avklare sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/avklare-sykepengegrunnlag.md)

**Fase:** 3

**Repo:** `spleis`

**Hva skal lages:** Med togglen for fase 3 på slår `AvventerHistorikk` og `AvventerHistorikkRevurdering` opp beløpene med `SykepengegrunnlagResultat` sammen med ytelsene. Beregningen bruker beløpene fra tjenesten for alle vilkårsgrunnlag, også de eldre og de fra Infotrygd. Spleis gir RV_IV_2 og RV_VV_2 ut fra oppslaget og sender ikke `sykepengegrunnlagsfakta` i godkjenningsbehovet.

**Blokkeres av:** [20: Minsteinntekt med sykepengegrunnlaget fra oppslaget](20-minsteinntekt-med-oppslag.md)

**Status:** klar

## Akseptansekriterier

- [ ] `SykepengegrunnlagResultat` sendes sammen med ytelsene for vilkårsgrunnlaget til perioden.
- [ ] Dagsatsen per arbeidsgiver bygger på `fastsattÅrsinntekt`, også for ghost-arbeidsforhold, og på `sykepengegrunnlag` og `seksG` fra oppslaget.
- [ ] Spleis gir RV_VV_2 når oppslaget har ghost-arbeidsforhold som ikke er deaktivert.
- [ ] RV_IV_2 tas i bruk igjen med teksten «Har mer enn 25 % avvik» og gis når `fastsatt` er `ETTER_HOVEDREGEL` og `harAkseptabeltAvvik` er `false`.
- [ ] Godkjenningsbehovet har ikke `sykepengegrunnlagsfakta`.
- [ ] De andre leserne fra [19](19-samle-lesingen-av-inntektsgrunnlaget.md) bruker oppslaget eller slutter å sende beløpene, slik det ble avgjort der.
- [ ] Med togglen av virker alt som før.
- [ ] E2e-tester med togglen av og på dekker én og to arbeidsgivere, ghost-arbeidsforhold, selvstendig næringsdrivende, Infotrygd og avvik over 25 prosent.
- [ ] En e2e-test viser at utbetalingen blir den samme med beløpene fra oppslaget som med Spleis' eget inntektsgrunnlag for de samme beløpene.
