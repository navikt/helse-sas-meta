# 23: Speil viser sykepengegrunnlaget fra sp-sykepengegrunnlag

**Spec:** [Avklare sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/avklare-sykepengegrunnlag.md)

**Fase:** 3

**Repo:** `speil`

**Hva skal lages:** Bak en egen toggle henter fanen Sykepengegrunnlag i Speil avgjørelsen fra sp-sykepengegrunnlag med `sykepengegrunnlagId` fra vilkårsgrunnlaget. Saksbehandler ser sykepengegrunnlaget, beregningsgrunnlaget, sammenligningsgrunnlaget og avviket, og for selvstendig næringsdrivende de pensjonsgivende inntektene fra Sigrun.

**Blokkeres av:** [14: REST-API for å lese sykepengegrunnlaget](14-rest-api-for-a-lese.md)

**Status:** klar

## Akseptansekriterier

- [ ] Speil kaller `GET /api/personer/{personPseudoId}/sykepengegrunnlag/{sykepengegrunnlagId}` med OBO-token.
- [ ] Med togglen på viser fanen beløpene og avviket fra tjenesten i stedet for beløpene fra Spleis og avviket fra Spesialist.
- [ ] Selvstendig næringsdrivende viser de pensjonsgivende inntektene per år, og om året er ferdiglignet.
- [ ] En skjønnsfastsettelse viser begrunnelsene fra tjenesten.
- [ ] Med togglen av er fanen som før.
- [ ] Testene i Speil dekker arbeidstaker, selvstendig næringsdrivende, skjønnsfastsatt grunnlag og grunnlag uten avviksvurdering.
