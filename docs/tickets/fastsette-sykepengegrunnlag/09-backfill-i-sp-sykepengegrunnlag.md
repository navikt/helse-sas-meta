# 09: Backfill i sp-sykepengegrunnlag

**Spec:** [Fastsette sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/fastsette-sykepengegrunnlag.md)

**Fase:** 2

**Repo:** `sp-sykepengegrunnlag`

**Hva skal lages:** sp-sykepengegrunnlag lager grunnlag for de deterministiske ID-ene fra Spleis, med tallene fra spleis-api, avviksvurderingene fra Spinnvill og skjønnsfastsettelsene fra Spesialist. Backfill kjører ved `person_avstemming` og ved `SykepengegrunnlagResultat` eller `GET /api/sykepengegrunnlag/{id}` for en ukjent ID.

**Blokkeres av:** [05: Behovet `SykepengegrunnlagResultat`](05-sykepengegrunnlag-resultat.md), [07: Endepunkt for avviksvurderinger i Spinnvill](07-spinnvill-avviksvurderinger.md), [08: Endepunkt for skjønnsfastsettelser i Spesialist](08-spesialist-skjonnsfastsettelser.md), [Inntekt 11: Endepunkt for backfill i spleis-api](../avklare-inntekt/11-spleis-api-sykepengegrunnlag.md)

**Status:** klar

## Akseptansekriterier

- [ ] Grunnlag fra backfill lagres med ID-en fra Spleis, kilde `spleis` eller `infotrygd` og tidspunktet `opprettet` fra Spleis. Lagringen er idempotent på ID.
- [ ] Avviksvurderingen kobles med `vilkårsgrunnlagId`, og skjønnsfastsettelsen med `meldingsreferanseId`. Mangler en kobling, lagres grunnlaget uten den, og det logges.
- [ ] `SykepengegrunnlagResultat` for en ukjent ID kjører backfill synkront og svarer. Finnes ID-en heller ikke i Spleis, svarer ikke tjenesten, og feilen logges.
- [ ] Svarer ikke spleis-api, Spinnvill eller Spesialist, svarer ikke tjenesten, og feilen logges.
- [ ] Migreringsloggen har én rad per backfill som lagrer minst én ny ID.
- [ ] Rapid-tester dekker de to utløserne, med og uten avviksvurdering og skjønnsfastsettelse, manglende koblinger og to avstemminger etter hverandre.
- [ ] Backfill er rullet ut i dev og så i prod.
