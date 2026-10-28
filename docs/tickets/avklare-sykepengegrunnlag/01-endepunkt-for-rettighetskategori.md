# 01: Endepunkt for én rettighetskategori i sp-rettighetskategori

**Spec:** [Avklare sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/avklare-sykepengegrunnlag.md)

**Fase:** 1

**Repo:** `sp-rettighetskategori`

**Hva skal lages:** sp-sykepengegrunnlag kan slå opp hovedkategorien og skjæringstidspunktet for en rettighetskategori-ID med `GET /api/rettighetskategorier/{rettighetskategoriId}`. Kjenner ikke sp-rettighetskategori ID-en, kjører den backfill for personen først, som ved `RettighetskategoriResultat`.

**Blokkeres av:** Ingen (kan starte med en gang)

**Status:** klar

## Akseptansekriterier

- [ ] Endepunktet krever maskin-til-maskin-token, og bare sp-sykepengegrunnlag har tilgang.
- [ ] Svaret har `hovedkategori` (`ARBEIDSTAKER`, `SELVSTENDIG_NÆRINGSDRIVENDE` eller `ARBEIDSTAKER_OG_SELVSTENDIG_NÆRINGSDRIVENDE`) og `skjæringstidspunkt` (dato).
- [ ] En ukjent ID gir backfill for personen og deretter svar.
- [ ] En ID som heller ikke finnes i Spleis, gir 404, og feilen logges.
- [ ] Nais-manifestet gir sp-sykepengegrunnlag tilgang.
- [ ] REST-tester dekker kjent ID, ukjent ID med backfill, 404 og manglende tilgang.
