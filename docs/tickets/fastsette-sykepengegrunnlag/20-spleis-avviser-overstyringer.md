# 20: Spleis avviser overstyringer av inntekt og grunnlag etter byttet

**Spec:** [Fastsette sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/fastsette-sykepengegrunnlag.md)

**Fase:** 3

**Repo:** `spleis`

**Hva skal lages:** Med bytte-togglen på avviser Spleis `skjønnsmessig_fastsettelse`, `grunnbeløpsregulering`, `overstyr_arbeidsforhold` og inntektsdelen av `overstyr_inntekt_og_refusjon`. Endringene skjer bare i sp-inntekt og sp-sykepengegrunnlag. Refusjonsdelen behandles som i dag. Ticketen gjelder begge specene.

**Blokkeres av:** [19: Spleis bruker grunnlaget fra sp-sykepengegrunnlag bak bytte-togglen](19-spleis-bruker-grunnlaget-fra-tjenesten.md)

**Status:** klar

## Akseptansekriterier

- [ ] De fire hendelsene avvises med en logget feil, og ingenting endres.
- [ ] Refusjonsdelen av `overstyr_inntekt_og_refusjon` behandles som før.
- [ ] Med togglen av behandles hendelsene som i dag.
- [ ] E2e-tester dekker hver hendelse med togglen av og på.
