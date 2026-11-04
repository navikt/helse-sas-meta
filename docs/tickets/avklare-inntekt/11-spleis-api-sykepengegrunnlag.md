# 11: Endepunkt for backfill i spleis-api

**Spec:** [Avklare inntekt i sp-inntekt](../../specs/avklare-inntekt.md)

**Fase:** 2

**Repo:** `spleis`

**Hva skal lages:** spleis-api har `POST /api/sykepengegrunnlag`, som gir inntektene og grunnlaget i alle fulle vilkårsgrunnlag for en person, med de deterministiske ID-ene. sp-inntekt og sp-sykepengegrunnlag bruker det til backfill.

**Blokkeres av:** [06: Inntektsavklarings-ID og sykepengegrunnlag-ID på alle vilkårsgrunnlag i Spleis](06-ider-pa-alle-vilkarsgrunnlag.md)

**Status:** klar

## Akseptansekriterier

- [ ] Endepunktet tar `{ "fødselsnummer": string }` og svarer med feltene i specen for inntektsavklaring, med de typene og verdiene som står der.
- [ ] Bare sp-inntekt og sp-sykepengegrunnlag har tilgang i Nais-manifestene.
- [ ] `meldingsreferanseId` på korrigert inntekt og skjønnsfastsettelse er ID-en til hendelsen fra Spesialist.
- [ ] Tester dekker arbeidstakere, selvstendig næringsdrivende, deaktiverte arbeidsforhold, korrigerte inntekter, skjønnsfastsettelse og vilkårsgrunnlag fra Infotrygd. Tester å bygge videre på: `OpptjeningApi` og endepunktet for rettighetskategorier.
- [ ] Det åpne spørsmålet nedenfor er besvart, og svaret står i specen.

## Merknader

- **Åpent spørsmål fra specen:** Har alle korrigerte inntekter og skjønnsfastsettelser i Spleis en meldingsreferanse-ID som Spesialist kjenner igjen? Sjekk det i prod-data før backfill bygges i ticket [13](13-backfill-i-sp-inntekt.md) og [09 i sykepengegrunnlaget](../fastsette-sykepengegrunnlag/09-backfill-i-sp-sykepengegrunnlag.md).
