# 16: Visning av inntektsavklaringen for Speil

**Spec:** [Avklare inntekt i sp-inntekt](../../specs/avklare-inntekt.md)

**Fase:** 3

**Repo:** `sp-inntekt`

**Hva skal lages:** Speil kan hente en inntektsavklaring med historikken over endringer med `GET /api/personer/{pseudoId}/inntektsavklaringer/{inntektsavklaringId}`. Saksbehandler ser inntektene med kilde og beløp per måned, og hvem som endret hva, og når.

**Blokkeres av:** [15: Saksbehandlers endringer i sp-inntekt](15-saksbehandlers-endringer-i-sp-inntekt.md)

**Status:** klar

## Akseptansekriterier

- [ ] Svaret har innholdet i specen uten `fødselsnummer`, og `historikk` med feltene i specen.
- [ ] Endepunktet har tilgangskontroll per person og auditlogging, etter ADR 0004.
- [ ] En ID som tilhører en annen person, gir 404.
- [ ] REST-tester dekker en inntektsavklaring med og uten endringer fra saksbehandler, med backfill i historikken, og manglende tilgang.
