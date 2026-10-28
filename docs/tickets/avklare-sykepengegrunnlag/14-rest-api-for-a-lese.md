# 14: REST-API for å lese sykepengegrunnlaget

**Spec:** [Avklare sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/avklare-sykepengegrunnlag.md)

**Fase:** 3

**Repo:** `sp-sykepengegrunnlag`

**Hva skal lages:** Speil og Spesialist kan lese en avgjørelse med avviksvurderingen, de pensjonsgivende inntektene og skjønnsfastsettelsen fra sp-sykepengegrunnlag.

**Blokkeres av:** [13: Backfill av historikken i sp-sykepengegrunnlag](13-backfill-i-sp-sykepengegrunnlag.md)

**Status:** klar

## Akseptansekriterier

- [ ] `GET /api/personer/{personPseudoId}/sykepengegrunnlag/{sykepengegrunnlagId}` krever OBO-token og sjekker populasjonstilgangskontroll, som i sp-vilkarsproving.
- [ ] `GET /api/sykepengegrunnlag/{sykepengegrunnlagId}` krever maskin-til-maskin-token, og bare Spesialist har tilgang.
- [ ] Begge svarer med alle feltene i specen.
- [ ] For en skjønnsfastsettelse er `avviksvurdering` avviksvurderingen i avgjørelsen den bygger på.
- [ ] En ukjent ID gir backfill synkront, og 404 hvis ID-en heller ikke finnes i Spleis.
- [ ] REST-tester dekker arbeidstaker, selvstendig næringsdrivende, skjønnsfastsettelse, backfill, 404 og manglende tilgang.
