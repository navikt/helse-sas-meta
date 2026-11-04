# 13: Backfill i sp-inntekt

**Spec:** [Avklare inntekt i sp-inntekt](../../specs/avklare-inntekt.md)

**Fase:** 2

**Repo:** `sp-inntekt`

**Hva skal lages:** sp-inntekt lager inntektsavklaringer for de deterministiske ID-ene fra Spleis, med inntektene Spleis brukte, begrunnelsene fra Spesialist og sammenligningsgrunnlaget fra Spinnvill. Backfill kjører ved `person_avstemming`, ved oppslag på en ukjent ID og ved `Inntektsavklaring` med `nyInnhenting: false` når skjæringstidspunktet mangler inntektsavklaring. Løsningen følger `PersonAvstemmingService` i sp-vilkarsproving og sp-rettighetskategori.

**Blokkeres av:** [05: Oppslag på inntektsavklaring for andre tjenester](05-oppslag-pa-inntektsavklaring.md), [11: Endepunkt for backfill i spleis-api](11-spleis-api-sykepengegrunnlag.md), [12: Endepunkt for inntektsendringer i Spesialist](12-spesialist-inntektsendringer.md), [Sykepengegrunnlag 07: Endepunkt for avviksvurderinger i Spinnvill](../fastsette-sykepengegrunnlag/07-spinnvill-avviksvurderinger.md)

**Status:** klar

## Akseptansekriterier

- [ ] Inntektsavklaringer fra backfill lagres med ID-en fra Spleis, kilde `spleis` og tidspunktet `opprettet` fra Spleis. Lagringen er idempotent på ID.
- [ ] Pensjonsgivende inntekt fra backfill får kilden `SØKNAD`. Vilkårsgrunnlag fra Infotrygd gir `inntektskilde: INFOTRYGD`.
- [ ] Korrigerte inntekter og deaktiverte arbeidsforhold får begrunnelsen fra Spesialist, koblet med `meldingsreferanseId`. Mangler en kobling, lagres inntektsavklaringen uten begrunnelsen, og det logges.
- [ ] Sammenligningsgrunnlaget hentes fra Spinnvill, fra avviksvurderingen som er koblet til `vilkårsgrunnlagId`.
- [ ] `GET /api/inntektsavklaringer/{id}` for en ukjent ID kjører backfill synkront før den svarer.
- [ ] `Inntektsavklaring` med `nyInnhenting: false` uten inntektsavklaring for skjæringstidspunktet kjører backfill først.
- [ ] Svarer ikke spleis-api, Spesialist eller Spinnvill, svarer ikke sp-inntekt, og feilen logges.
- [ ] Migreringsloggen har én rad per backfill som lagrer minst én ny ID, med fødselsnummer, tidspunkt, antall ID-er fra Spleis og antall nye.
- [ ] Rapid- og REST-tester med fakte HTTP-klienter dekker de tre utløserne, to avstemminger etter hverandre, manglende koblinger og feil fra hver av de tre tjenestene.
- [ ] Backfill er rullet ut i dev og så i prod.
