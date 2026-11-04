# 03: Avviksvurdering for arbeidstakere

**Spec:** [Fastsette sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/fastsette-sykepengegrunnlag.md)

**Fase:** 2

**Repo:** `sp-sykepengegrunnlag`

**Hva skal lages:** sp-sykepengegrunnlag gjør avviksvurderingen når den fastsetter grunnlaget for arbeidstakere. Den sammenligner summen av omregnet årsinntekt med sammenligningsgrunnlaget fra inntektsavklaringen, med grensen på 25 % og grensen på én krone for ny vurdering fra Spinnvill.

**Blokkeres av:** [02: Flere arbeidsgivere, a-ordningen, korrigerte inntekter og deaktiverte arbeidsforhold](02-flere-arbeidsgivere-korrigert-og-deaktivert.md)

**Status:** klar

## Akseptansekriterier

- [ ] Avviksprosenten regnes ut som i Spinnvill, og mer enn 25 % er ikke akseptabelt.
- [ ] Er summen av omregnet årsinntekt endret med mindre enn én krone fra det gjeldende grunnlaget, beholdes avviksvurderingen og skjønnsfastsettelsen.
- [ ] Er summen endret med én krone eller mer, vurderes avviket på nytt, og skjønnsfastsettelsen fjernes.
- [ ] Selvstendig næringsdrivende og grunnlag fra Infotrygd har ingen avviksvurdering.
- [ ] Tilfellene i testene for avviksvurderingen i Spinnvill er flyttet hit og gir de samme tallene.
- [ ] Rapid-tester dekker avvik under og over 25 %, endring under og over én krone, og flere arbeidsgivere.
