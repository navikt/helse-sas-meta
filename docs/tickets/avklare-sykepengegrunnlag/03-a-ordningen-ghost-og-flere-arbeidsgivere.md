# 03: A-ordningen, ghost-arbeidsforhold og flere arbeidsgivere

**Spec:** [Avklare sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/avklare-sykepengegrunnlag.md)

**Fase:** 1

**Repo:** `sp-sykepengegrunnlag`

**Hva skal lages:** Tjenesten avgjør sykepengegrunnlaget for arbeidstakere med flere arbeidsgivere, for arbeidsgivere uten inntektsmelding og når det finnes ghost-arbeidsforhold. Den ber selv om `InntekterForSykepengegrunnlag` og `ArbeidsforholdV2` og bruker de samme reglene som Spleis.

**Blokkeres av:** [02: Skjelett for sp-sykepengegrunnlag som svarer på behov](02-skjelett-sp-sykepengegrunnlag.md)

**Status:** klar

## Akseptansekriterier

- [ ] Tjenesten sender `InntekterForSykepengegrunnlag` med `skjæringstidspunkt`, `beregningStart` og `beregningSlutt` for de tre månedene før måneden med skjæringstidspunktet.
- [ ] Tjenesten sender `ArbeidsforholdV2` med `skjæringstidspunkt`.
- [ ] Det opprinnelige behovet følger med i begge behovene, som i sp-vilkarsproving.
- [ ] De eksisterende løserne svarer på behovene uten endringer.
- [ ] En arbeidsgiver med `inntektsmelding` `null` får omregnet årsinntekt fra a-ordningen etter reglene i Spleis, med `inntektskilde` `A_ORDNINGEN`.
- [ ] Ghost-arbeidsforhold avgjøres etter reglene i Spleis og lagres med `ghost` `true`.
- [ ] Beregningsgrunnlaget er summen for alle yrkesaktivitetene.
- [ ] Flere arbeidsgivere med samme skjæringstidspunkt gir én avgjørelse.
- [ ] Mangler svaret fra en løser, forblir `Sykepengegrunnlag` ubesvart, slik at Spleis prøver igjen ved påminnelse.
- [ ] Testene dekker de samme tilfellene som Spleis har tester for i dag: inntekt fra a-ordningen, flere arbeidsgivere og ghost-arbeidsforhold.
