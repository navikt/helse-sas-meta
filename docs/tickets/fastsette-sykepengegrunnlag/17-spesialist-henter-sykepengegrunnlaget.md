# 17: Spesialist henter sykepengegrunnlaget fra sp-sykepengegrunnlag bak toggle

**Spec:** [Fastsette sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/fastsette-sykepengegrunnlag.md)

**Fase:** 3

**Repo:** `spesialist`

**Hva skal lages:** Med togglen på henter Spesialist sykepengegrunnlaget fra sp-sykepengegrunnlag med ID-en i godkjenningsbehovet og `avsluttet_med_vedtak`, og lager `vedtak_fattet` med de samme feltene som i dag. Spesialist sender ikke `Avviksvurdering` og lager ikke RV_IV_2, og endepunktet for skjønnsfastsettelse er stengt.

**Blokkeres av:** [15: Oppslag på sykepengegrunnlaget for Spesialist](15-oppslag-for-spesialist.md), [16: Sykepengegrunnlag-ID i godkjenningsbehovet og `avsluttet_med_vedtak`](16-id-i-godkjenning-og-avsluttet-med-vedtak.md)

**Status:** klar

## Akseptansekriterier

- [ ] Spesialist har en HTTP-klient for sp-sykepengegrunnlag med maskin-til-maskin-token, og prøver igjen når tjenesten ikke svarer.
- [ ] `vedtak_fattet` er lik med data fra sp-sykepengegrunnlag og med `sykepengegrunnlagsfakta` fra Spleis og avviksvurderingen fra Spinnvill.
- [ ] Begrunnelsene for skjønnsfastsettelsen i `vedtak_fattet` kommer fra sp-sykepengegrunnlag.
- [ ] Med togglen på sendes ikke `Avviksvurdering`, RV_IV_2 lages ikke, og endepunktet for skjønnsfastsettelse avviser kall.
- [ ] Med togglen av fungerer Spesialist som i dag.
- [ ] E2e-tester dekker hovedregel, skjønn, Infotrygd og selvstendig næringsdrivende med togglen av og på.
