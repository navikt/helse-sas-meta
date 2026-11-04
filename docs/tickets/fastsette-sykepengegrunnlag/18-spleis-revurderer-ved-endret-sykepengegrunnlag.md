# 18: Spleis revurderer ved `endret_sykepengegrunnlag`

**Spec:** [Fastsette sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/fastsette-sykepengegrunnlag.md)

**Fase:** 3

**Repo:** `spleis`

**Hva skal lages:** Spleis tar imot `endret_sykepengegrunnlag` med den samme mekanismen som `endret_opptjeningsvurdering`, kopierer vilkårsgrunnlaget med den nye ID-en og revurderer sykefraværstilfellet.

**Blokkeres av:** [06: `AvventerSykepengegrunnlag` i Spleis bak toggle for skyggekjøring](06-spleis-avventer-sykepengegrunnlag.md)

**Status:** klar

## Akseptansekriterier

- [ ] Hendelsen leses med `fødselsnummer`, `skjæringstidspunkt`, `sykepengegrunnlagId` og `manuellVurdering`.
- [ ] Ukjente skjæringstidspunkter ignoreres.
- [ ] Før byttet ignoreres hendelsen, fordi Spleis bruker sitt eget grunnlag.
- [ ] E2e-tester dekker hendelsen med togglen av og på, og ukjent skjæringstidspunkt. Tester å bygge videre på: `EndretVurderingPåSkjæringstidspunktTest`.
