# 05: Oppslag på inntektsavklaring for andre tjenester

**Spec:** [Avklare inntekt i sp-inntekt](../../specs/avklare-inntekt.md)

**Fase:** 2

**Repo:** `sp-inntekt`

**Hva skal lages:** Andre tjenester kan slå opp en inntektsavklaring med `GET /api/inntektsavklaringer/{inntektsavklaringId}` og maskin-til-maskin-token. Svaret er innholdet slik specen beskriver det, felt for felt. sp-sykepengegrunnlag er den første som bruker det.

**Blokkeres av:** [02: A-ordningen, sammenligningsgrunnlag og arbeidsforhold uten søknad](02-a-ordningen-og-arbeidsforhold-uten-soknad.md), [03: Pensjonsgivende inntekt fra Sigrun](03-pensjonsgivende-inntekt-fra-sigrun.md)

**Status:** klar

## Akseptansekriterier

- [ ] Endepunktet krever maskin-til-maskin-token, og bare sp-sykepengegrunnlag har tilgang i Nais-manifestene.
- [ ] Svaret har alle feltene i specen med de typene og verdiene som står der.
- [ ] En ukjent ID gir 404. Backfill ved ukjent ID kommer i ticket [13](13-backfill-i-sp-inntekt.md).
- [ ] REST-tester dekker arbeidstaker med inntektsmelding, a-ordningen, arbeidsforhold uten søknad, selvstendig næringsdrivende og ukjent ID.
