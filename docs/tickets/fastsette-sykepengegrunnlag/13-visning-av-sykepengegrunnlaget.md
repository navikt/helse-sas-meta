# 13: Visning av sykepengegrunnlaget for Speil

**Spec:** [Fastsette sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/fastsette-sykepengegrunnlag.md)

**Fase:** 3

**Repo:** `sp-sykepengegrunnlag`

**Hva skal lages:** Speil kan hente sykepengegrunnlaget med avviksvurderingen, sammenligningsgrunnlaget, skjønnsfastsettelsen og historikken med `GET /api/personer/{pseudoId}/sykepengegrunnlag/{sykepengegrunnlagId}`.

**Blokkeres av:** [12: Skjønnsfastsettelse i sp-sykepengegrunnlag](12-skjonnsfastsettelse.md)

**Status:** klar

## Akseptansekriterier

- [ ] Svaret har feltene i specen.
- [ ] Endepunktet har tilgangskontroll per person og auditlogging, etter ADR 0004.
- [ ] En ID som tilhører en annen person, gir 404.
- [ ] REST-tester dekker arbeidstaker med og uten skjønnsfastsettelse, selvstendig næringsdrivende, grunnlag fra Infotrygd og manglende tilgang.
