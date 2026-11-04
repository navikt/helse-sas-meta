# 15: Oppslag på sykepengegrunnlaget for Spesialist

**Spec:** [Fastsette sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/fastsette-sykepengegrunnlag.md)

**Fase:** 3

**Repo:** `sp-sykepengegrunnlag`

**Hva skal lages:** Spesialist kan hente sykepengegrunnlaget med `GET /api/sykepengegrunnlag/{sykepengegrunnlagId}`. `sykepengegrunnlagsfakta` i svaret har nøyaktig samme form som i godkjenningsbehovet fra Spleis i dag, og svaret har avviksvurderingen og skjønnsfastsettelsen som Spesialist trenger til `vedtak_fattet`.

**Blokkeres av:** [04: Selvstendig næringsdrivende etter § 8-35](04-selvstendig-naeringsdrivende.md), [09: Backfill i sp-sykepengegrunnlag](09-backfill-i-sp-sykepengegrunnlag.md), [12: Skjønnsfastsettelse i sp-sykepengegrunnlag](12-skjonnsfastsettelse.md)

**Status:** klar

## Akseptansekriterier

- [ ] Svaret har feltene i specen med de typene og verdiene som står der.
- [ ] Endepunktet krever maskin-til-maskin-token, og bare Spesialist har tilgang.
- [ ] En ukjent ID kjører backfill, og gir 404 hvis den fortsatt ikke finnes.
- [ ] REST-tester sammenligner `sykepengegrunnlagsfakta` med det Spleis sender i dag for de samme tilfellene: hovedregel, skjønn, Infotrygd og selvstendig næringsdrivende.
