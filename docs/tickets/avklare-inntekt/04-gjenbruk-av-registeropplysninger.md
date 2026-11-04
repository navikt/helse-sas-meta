# 04: Gjenbruk av registeropplysninger ved `nyInnhenting: false`

**Spec:** [Avklare inntekt i sp-inntekt](../../specs/avklare-inntekt.md)

**Fase:** 1

**Repo:** `sp-inntekt`

**Hva skal lages:** Når Spleis revurderer et skjæringstidspunkt med fullt vilkårsgrunnlag, sender den `nyInnhenting: false`. sp-inntekt bruker da opplysningene fra a-ordningen, Aa-registeret og Sigrun i den gjeldende inntektsavklaringen, og henter bare inntektsmeldingene på nytt. En revurdering endrer altså ikke registeropplysningene i det stille.

**Blokkeres av:** [02: A-ordningen, sammenligningsgrunnlag og arbeidsforhold uten søknad](02-a-ordningen-og-arbeidsforhold-uten-soknad.md), [03: Pensjonsgivende inntekt fra Sigrun](03-pensjonsgivende-inntekt-fra-sigrun.md)

**Status:** klar

## Akseptansekriterier

- [ ] Ved `nyInnhenting: true` hentes alle opplysningene på nytt.
- [ ] Ved `nyInnhenting: false` og en gjeldende inntektsavklaring brukes registeropplysningene fra den, og bare meldingene fra Spedisjon hentes.
- [ ] Ved `nyInnhenting: false` uten gjeldende inntektsavklaring henter tjenesten alt på nytt fram til backfill finnes (ticket [13](13-backfill-i-sp-inntekt.md)), og logger det.
- [ ] En ny inntektsmelding med samme beløp gir samme ID. Et nytt beløp gir ny ID.
- [ ] Rapid-tester dekker begge verdiene av `nyInnhenting`, med og uten gjeldende inntektsavklaring.
