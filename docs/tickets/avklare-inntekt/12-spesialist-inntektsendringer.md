# 12: Endepunkt for inntektsendringer i Spesialist

**Spec:** [Avklare inntekt i sp-inntekt](../../specs/avklare-inntekt.md)

**Fase:** 2

**Repo:** `spesialist`

**Hva skal lages:** Spesialist har `POST /api/inntektsendringer`, som gir begrunnelsene for korrigerte inntekter og deaktiverte og aktiverte arbeidsforhold for en person. sp-inntekt bruker det til backfill, slik at historikken ikke mister begrunnelsene.

**Blokkeres av:** Ingen (kan starte med en gang)

**Status:** klar

## Akseptansekriterier

- [ ] Endepunktet tar `{ "fødselsnummer": string }` og svarer med en liste med `meldingsreferanseId`, `type` (`KORRIGERT_INNTEKT`, `ARBEIDSFORHOLD_DEAKTIVERT` eller `ARBEIDSFORHOLD_AKTIVERT`), `skjæringstidspunkt`, `organisasjonsnummer`, `saksbehandlerIdent`, `tidspunkt`, `begrunnelse`, `forklaring` og `lovhjemmel`.
- [ ] Endepunktet krever maskin-til-maskin-token, og bare sp-inntekt har tilgang.
- [ ] `meldingsreferanseId` er den samme ID-en som Spleis har på korrigert inntekt og deaktivering.
- [ ] Tester dekker en person med korrigert inntekt, deaktivering og aktivering, og en person uten endringer.
