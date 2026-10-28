# 26: Fjerne backfill

**Spec:** [Avklare sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/avklare-sykepengegrunnlag.md)

**Fase:** 4

**Repo:** `sp-sykepengegrunnlag`, `spleis`, `spesialist`

**Hva skal lages:** Backfill og endepunktene den bruker, er fjernet, fordi alle ID-er i Spleis har en avgjørelse i sp-sykepengegrunnlag.

**Blokkeres av:** [25: Skru på togglene for fase 3](25-skru-pa-togglene-for-fase-3.md)

**Status:** klar

## Akseptansekriterier

- [ ] Migreringsloggen har ikke fått nye rader etter en full runde med `person_avstemming` etter fase 3.
- [ ] Nye vilkårsgrunnlag fra Infotrygd har en plan for å få en avgjørelse uten backfill, eller backfill for dem beholdes. Valget er ført inn i specen.
- [ ] Backfill og migreringsloggen er fjernet fra sp-sykepengegrunnlag.
- [ ] `POST /api/sykepengegrunnlag` er fjernet fra spleis-api.
- [ ] `POST /api/avviksvurderinger` er fjernet fra Spesialist.
- [ ] Tilgangene i Nais-manifestene er fjernet.
