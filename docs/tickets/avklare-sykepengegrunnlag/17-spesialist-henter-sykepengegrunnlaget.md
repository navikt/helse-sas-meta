# 17: Spesialist henter sykepengegrunnlaget fra sp-sykepengegrunnlag

**Spec:** [Avklare sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/avklare-sykepengegrunnlag.md)

**Fase:** 3

**Repo:** `spesialist`

**Hva skal lages:** Mangler godkjenningsbehovet `sykepengegrunnlagsfakta`, henter Spesialist sykepengegrunnlaget fra sp-sykepengegrunnlag og bygger `sykepengegrunnlagsfakta` i `vedtak_fattet` selv. Da ber Spesialist ikke om `Avviksvurdering`. Har godkjenningsbehovet `sykepengegrunnlagsfakta`, virker alt som i dag.

**Blokkeres av:** [14: REST-API for å lese sykepengegrunnlaget](14-rest-api-for-a-lese.md)

**Status:** klar

## Akseptansekriterier

- [ ] Spesialist leser `sykepengegrunnlagId` fra godkjenningsbehovet.
- [ ] Mangler `sykepengegrunnlagsfakta`, kaller Spesialist `GET /api/sykepengegrunnlag/{sykepengegrunnlagId}` med maskin-til-maskin-token.
- [ ] `sykepengegrunnlagsfakta` i `vedtak_fattet` har samme form som i dag, for `ETTER_HOVEDREGEL`, `ETTER_SKJØNN`, `I_INFOTRYGD` og selvstendig næringsdrivende.
- [ ] Spesialist sender ikke `Avviksvurdering` når `sykepengegrunnlagsfakta` mangler.
- [ ] Har godkjenningsbehovet `sykepengegrunnlagsfakta`, er flyten uendret.
- [ ] Feil fra sp-sykepengegrunnlag gjør at godkjenningsbehovet prøves på nytt.
- [ ] Testene i spesialist-e2e-tests dekker begge veiene med en falsk sp-sykepengegrunnlag.
