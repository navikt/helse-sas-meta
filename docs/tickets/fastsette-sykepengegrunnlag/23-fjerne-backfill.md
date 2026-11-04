# 23: Fjerne backfill

**Spec:** [Fastsette sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/fastsette-sykepengegrunnlag.md)

**Fase:** 4

**Repo:** `sp-inntekt`, `sp-sykepengegrunnlag`, `spleis`, `spinnvill`, `spesialist`

**Hva skal lages:** Når migreringsloggene ikke får nye rader etter en full runde med `person_avstemming`, fjerner vi backfill i begge tjenestene og endepunktene for backfill i spleis-api, Spinnvill og Spesialist. Ticketen gjelder begge specene.

**Blokkeres av:** [22: Bytte (fase 3)](22-bytte.md)

**Status:** klar

## Akseptansekriterier

- [ ] Migreringsloggene i sp-inntekt og sp-sykepengegrunnlag har ikke fått nye rader etter en full runde med `person_avstemming` i prod.
- [ ] Backfill og migreringslogg er fjernet fra begge tjenestene.
- [ ] `POST /api/sykepengegrunnlag` i spleis-api, `POST /api/avviksvurderinger` i Spinnvill og `POST /api/inntektsendringer` og `POST /api/skjonnsfastsettelser` i Spesialist er fjernet, med tilgangene i Nais-manifestene.
- [ ] Spleis lager ikke lenger deterministiske ID-er for nye vilkårsgrunnlag.
