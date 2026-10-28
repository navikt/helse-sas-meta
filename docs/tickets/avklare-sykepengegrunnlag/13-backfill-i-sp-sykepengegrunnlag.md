# 13: Backfill av historikken i sp-sykepengegrunnlag

**Spec:** [Avklare sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/avklare-sykepengegrunnlag.md)

**Fase:** 2

**Repo:** `sp-sykepengegrunnlag`

**Hva skal lages:** sp-sykepengegrunnlag har en avgjørelse for alle sykepengegrunnlag-ID-er som finnes i Spleis, med avviket fra Spesialist der det finnes. Backfill kjører ved `person_avstemming` og synkront når tjenesten får et oppslag på en ID den ikke kjenner.

**Blokkeres av:** [02: Skjelett for sp-sykepengegrunnlag som svarer på behov](02-skjelett-sp-sykepengegrunnlag.md), [11: Endepunkt for sykepengegrunnlag i spleis-api](11-spleis-api-sykepengegrunnlag.md), [12: Endepunkt for avviksvurderinger i Spesialist](12-spesialist-avviksvurderinger.md)

**Status:** klar

## Akseptansekriterier

- [ ] Tjenesten henter historikken fra spleis-api og Spesialist ved hver `person_avstemming`.
- [ ] Avgjørelsene lagres med ID-en fra Spleis, kilde `spleis`, vurderingstidspunkt fra `opprettet` og uten input og `byggerPå`. Lagringen er idempotent på ID.
- [ ] Avviksvurderingen knyttes til ID-en med `vilkårsgrunnlagId`.
- [ ] Eldre skjønnsfastsettelser lagres med `fastsatt` `ETTER_SKJØNN`, uten begrunnelser.
- [ ] Et oppslag med `SykepengegrunnlagResultat` på en ukjent ID kjører backfill synkront før svaret. Finnes ID-en heller ikke i Spleis, svarer ikke tjenesten, og feilen logges.
- [ ] Det første behovet `Sykepengegrunnlag` etter backfill gir en ny automatisk avgjørelse.
- [ ] Migreringsloggen får én rad per backfill som lagrer minst én ny ID, med fødselsnummer, tidspunkt, antall ID-er fra Spleis og antall nye.
- [ ] Integrasjonstester dekker avstemming, synkron backfill, idempotens, avvik fra Spesialist og Infotrygd.
- [ ] Backfill har gått gjennom alle personer i prod.
