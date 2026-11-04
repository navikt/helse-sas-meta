# 02: A-ordningen, sammenligningsgrunnlag og arbeidsforhold uten søknad

**Spec:** [Avklare inntekt i sp-inntekt](../../specs/avklare-inntekt.md)

**Fase:** 1

**Repo:** `sp-inntekt`

**Hva skal lages:** sp-inntekt henter inntekt fra a-ordningen for beregningsperioden og for sammenligningsgrunnlaget, og arbeidsforholdene fra Aa-registeret. Den gjør det med egne behov på rapiden, slik sp-vilkarsproving gjør med `ArbeidsforholdV2`, og svarer Spleis når alle løsningene er kommet. Arbeidsforhold uten søknad finnes med den samme regelen som Spleis bruker i dag.

**Blokkeres av:** [01: Skjelett for sp-inntekt med inntektsmelding fra Spedisjon](01-skjelett-sp-inntekt.md)

**Status:** klar

## Akseptansekriterier

- [ ] sp-inntekt sender `InntekterForSykepengegrunnlag` (tre måneder), `InntekterForSammenligningsgrunnlag` (tolv måneder, bare når det finnes arbeidstakere) og `ArbeidsforholdV2`, med det opprinnelige behovet i `opprinneligBehov`.
- [ ] Behovet fra Spleis besvares først når alle løsningene er kommet.
- [ ] Arbeidsgivere med `A_ORDNINGEN` får inntektene fra a-ordningen per måned med type, fordel og beskrivelse.
- [ ] Et arbeidsforhold uten søknad tas med når personen er ansatt på skjæringstidspunktet og har inntekt i de to siste månedene før, eller arbeidsforholdet startet i løpet av de to siste månedene uten inntekt ennå. Regelen er flyttet fra Spleis uten endringer.
- [ ] Inntektsavklaringen har ansettelsesperiodene og `harSøknad` for hver arbeidsgiver, og sammenligningsgrunnlaget per måned og arbeidsgiver.
- [ ] Inntekter fra a-ordningen og arbeidsforhold er med når tjenesten sammenligner beløp for å avgjøre om ID-en er den samme.
- [ ] Rapid-tester dekker a-ordningen, inntektsmelding og a-ordningen for ulike arbeidsgivere, arbeidsforhold uten søknad med og uten inntekt, nytt arbeidsforhold og et behov uten arbeidstakere. Tilfellene fra testene for arbeidsforhold uten søknad i Spleis er tatt med.

## Merknader

- **Åpent spørsmål fra specen:** Skal sp-inntekt sende subsumsjonsmeldinger for § 8-28 og § 8-29? Det må avklares før byttet (ticket [22](../fastsette-sykepengegrunnlag/22-bytte.md)), ikke før denne ticketen.
