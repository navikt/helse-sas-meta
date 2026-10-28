# 25: Skru på togglene for fase 3

**Spec:** [Avklare sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/avklare-sykepengegrunnlag.md)

**Fase:** 3

**Repo:** `spleis`, `speil`, `sp-sykepengegrunnlag`

**Hva skal lages:** Spleis beregner med beløpene fra sp-sykepengegrunnlag, og Speil viser og sender sykepengegrunnlaget dit, i dev og prod. Spesialist ber ikke lenger om avviksvurdering fra Spinnvill.

**Blokkeres av:** [17: Spesialist henter sykepengegrunnlaget fra sp-sykepengegrunnlag](17-spesialist-henter-sykepengegrunnlaget.md), [22: `endret_sykepengegrunnlag` og refusjon alene i Spleis](22-endret-sykepengegrunnlag-i-spleis.md), [24: Speil sender skjønnsfastsettelse og overstyring til sp-sykepengegrunnlag](24-speil-sender-overstyringer.md)

**Status:** klar

## Akseptansekriterier

- [ ] Backfill har gått gjennom alle personer, og migreringsloggen får ikke nye rader fra eldre vilkårsgrunnlag.
- [ ] Skyggen viser ingen uforklarte forskjeller.
- [ ] Togglen for fase 3 i Spleis og togglen i Speil er på i dev, og en saksbehandler har testet skjønnsfastsettelse, overstyring av inntekt og arbeidsforhold, refusjon og selvstendig næringsdrivende.
- [ ] Togglene er på i prod, skrudd på samtidig.
- [ ] Spesialist sender ikke `Avviksvurdering` for nye godkjenningsbehov.
- [ ] Skyggen i sp-sykepengegrunnlag er skrudd av.
