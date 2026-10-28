# 22: `endret_sykepengegrunnlag` og refusjon alene i Spleis

**Spec:** [Avklare sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/avklare-sykepengegrunnlag.md)

**Fase:** 3

**Repo:** `spleis`

**Hva skal lages:** Spleis tar imot `endret_sykepengegrunnlag` og revurderer fra skjæringstidspunktet med den nye ID-en. Med togglen for fase 3 på tar Spleis bare imot refusjonsdelen av `overstyr_inntekt_og_refusjon` og bruker ikke `skjønnsmessig_fastsettelse` og `overstyr_arbeidsforhold`.

**Blokkeres av:** [21: Beregne med beløpene fra oppslaget i `AvventerHistorikk`](21-beregne-med-oppslag.md)

**Status:** klar

## Akseptansekriterier

- [ ] `endret_sykepengegrunnlag` leses med `fødselsnummer`, `skjæringstidspunkt`, `sykepengegrunnlagId` og `manuellVurdering`, med den eksisterende mekanismen for endret vurdering på skjæringstidspunkt.
- [ ] Hendelsen gir et nytt vilkårsgrunnlag med den nye ID-en og en revurdering fra skjæringstidspunktet, som `endret_opptjeningsvurdering`.
- [ ] Med togglen på ignoreres inntektsdelen av `overstyr_inntekt_og_refusjon`, og refusjonsdelen virker som før.
- [ ] Med togglen på brukes ikke `skjønnsmessig_fastsettelse` og `overstyr_arbeidsforhold`.
- [ ] E2e-tester dekker en skjønnsfastsettelse som revurderer og fjerner RV_IV_2, en overstyrt inntekt, et deaktivert arbeidsforhold og refusjon alene.
