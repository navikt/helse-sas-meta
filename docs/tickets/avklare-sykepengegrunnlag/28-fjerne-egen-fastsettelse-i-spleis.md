# 28: Fjerne Spleis' egen fastsettelse av inntekt

**Spec:** [Avklare sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/avklare-sykepengegrunnlag.md)

**Fase:** 4

**Repo:** `spleis`

**Hva skal lages:** Spleis har ikke lenger egen kode for å fastsette inntekt, og togglen for fase 3 er borte. Beløpene finnes bare i sp-sykepengegrunnlag.

**Blokkeres av:** [26: Fjerne backfill](26-fjerne-backfill.md)

**Status:** klar

## Akseptansekriterier

- [ ] Togglen for fase 3 er fjernet, og koden for tilfellet der den er av, er borte.
- [ ] Riverne for `skjønnsmessig_fastsettelse` og `overstyr_arbeidsforhold` er fjernet.
- [ ] Inntektsdelen av `overstyr_inntekt_og_refusjon` er fjernet.
- [ ] Spleis' egen fastsettelse av omregnet årsinntekt, skatteopplysninger, ghost-arbeidsforhold og § 8-35 er fjernet. Det samme gjelder RV_IV_12 når søknaden kommer inn.
- [ ] Inntektsgrunnlaget i person-JSON er fjernet med en JSON-migrering, eller beholdt som historikk etter avtale.
- [ ] Alle e2e-tester er grønne.
