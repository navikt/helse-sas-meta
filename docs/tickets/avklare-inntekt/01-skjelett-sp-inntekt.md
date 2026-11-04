# 01: Skjelett for sp-inntekt med inntektsmelding fra Spedisjon

**Spec:** [Avklare inntekt i sp-inntekt](../../specs/avklare-inntekt.md)

**Fase:** 1

**Repo:** `sp-inntekt`

**Hva skal lages:** sp-inntekt finnes som app med egen database og svarer på behovet `Inntektsavklaring` for arbeidstakere med `inntektskilde: ARBEIDSGIVER`. Den henter inntektsmeldingen eller arbeidsgiveropplysningene fra Spedisjon med meldingsreferanse-ID-en, lagrer inntektsavklaringen og innhentingen bak den, og svarer med en ID. Samme beløp gir samme ID. Appen følger oppsettet til sp-rettighetskategori og sykepenger-standarden.

**Blokkeres av:** Ingen (kan starte med en gang)

**Status:** klar

## Akseptansekriterier

- [ ] Appen er satt opp etter sykepenger-standarden med egen Postgres-database og Nais-manifester for dev og prod, og deployer.
- [ ] Behovet `Inntektsavklaring` leses med feltene i specen. Løsningen er `@løsning.Inntektsavklaring.id`.
- [ ] For hver linje med `inntektskilde: ARBEIDSGIVER` hentes meldingen synkront fra Spedisjon, og månedsinntekten lagres med meldingsreferanse-ID-en.
- [ ] Lagringen skiller mellom inntektsavklaring og innhenting, etter ADR 0006. Inntektsavklaringen har ID, fødselsnummer, skjæringstidspunkt, kilde `automatisk`, tidspunkt og innholdet.
- [ ] En ny innhenting med samme beløp føyes til den gjeldende inntektsavklaringen og gir samme ID. Et nytt beløp gir en ny inntektsavklaring med ny ID.
- [ ] Svarer ikke Spedisjon, eller mangler meldingen, svarer ikke tjenesten, og feilen logges.
- [ ] Løsningen sendes først etter at inntektsavklaringen er lagret.
- [ ] Rapid-tester med ekte Postgres og Spedisjon fakt i HTTP-klienten dekker én og flere arbeidsgivere, samme og nytt beløp og feil fra Spedisjon.

## Merknader

- Linjer med `A_ORDNINGEN` og `SELVSTENDIG` kommer i ticket 02 og 03. Fram til da kan tjenesten la slike behov være ubesvart.
