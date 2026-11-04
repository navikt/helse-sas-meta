# 11: Rulle ut fase 2

**Spec:** [Fastsette sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/fastsette-sykepengegrunnlag.md)

**Fase:** 2

**Repo:** `spleis`, `sp-inntekt`, `sp-sykepengegrunnlag`

**Hva skal lages:** Backfill kjører i begge tjenestene, og togglen for skyggekjøring er på i Spleis i dev og prod. Skyggesammenligningen viser at arbeidstakere får samme resultat som i dag.

**Blokkeres av:** [06: `AvventerSykepengegrunnlag` i Spleis bak toggle for skyggekjøring](06-spleis-avventer-sykepengegrunnlag.md), [10: Skyggesammenligning mot grunnlaget fra Spleis](10-skyggesammenligning.md), [Inntekt 10: Rulle ut fase 1](../avklare-inntekt/10-rulle-ut-fase-1.md), [Inntekt 13: Backfill i sp-inntekt](../avklare-inntekt/13-backfill-i-sp-inntekt.md)

**Status:** klar

## Akseptansekriterier

- [ ] sp-sykepengegrunnlag har tilgang til sp-inntekt, spleis-api, Spinnvill, Spesialist og rapiden i dev og prod.
- [ ] Togglen for skyggekjøring er skrudd på i dev og så i prod.
- [ ] Vi har fulgt med på perioder i `AVVENTER_SYKEPENGEGRUNNLAG` i spammer uten at noen står fast.
- [ ] Alle forskjeller for arbeidstakere er forklart eller rettet.
- [ ] Det åpne spørsmålet nedenfor er besvart, og svaret står i specen.

## Merknader

- **Åpent spørsmål fra specen:** Hvor lenge skal skyggekjøringen ha vært stille før vi bytter, og hvilke forskjeller kan vi forklare og godta?
