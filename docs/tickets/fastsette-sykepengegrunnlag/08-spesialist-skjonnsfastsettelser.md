# 08: Endepunkt for skjønnsfastsettelser i Spesialist

**Spec:** [Fastsette sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/fastsette-sykepengegrunnlag.md)

**Fase:** 2

**Repo:** `spesialist`

**Hva skal lages:** Spesialist har `POST /api/skjonnsfastsettelser`, som gir skjønnsfastsettelsene med begrunnelse for en person. sp-sykepengegrunnlag bruker det til backfill.

**Blokkeres av:** Ingen (kan starte med en gang)

**Status:** klar

## Akseptansekriterier

- [ ] Endepunktet tar `{ "fødselsnummer": string }` og svarer med en liste med feltene i specen.
- [ ] `meldingsreferanseId` er den samme ID-en som Spleis har på skjønnsfastsettelsen.
- [ ] Endepunktet krever maskin-til-maskin-token, og bare sp-sykepengegrunnlag har tilgang.
- [ ] Tester dekker en person med flere skjønnsfastsettelser og en person uten.
