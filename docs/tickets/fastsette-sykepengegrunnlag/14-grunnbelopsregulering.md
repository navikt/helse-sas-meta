# 14: Grunnbeløpsregulering i sp-sykepengegrunnlag

**Spec:** [Fastsette sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/fastsette-sykepengegrunnlag.md)

**Fase:** 3

**Repo:** `sp-sykepengegrunnlag`

**Hva skal lages:** En jobb i sp-sykepengegrunnlag finner gjeldende grunnlag med et grunnbeløp som ikke lenger gjelder for skjæringstidspunktet, lager nye grunnlag med riktig grunnbeløp og sender `endret_sykepengegrunnlag`. Jobben er bak en toggle som skrus på ved byttet.

**Blokkeres av:** [12: Skjønnsfastsettelse i sp-sykepengegrunnlag](12-skjonnsfastsettelse.md)

**Status:** klar

## Akseptansekriterier

- [ ] Jobben kjører ved `midnatt` og ved `kjør_grunnbeløpsregulering`, når togglen er på.
- [ ] Grunnlag med kilde `infotrygd` og skjæringstidspunkter før 21. september 2020 hoppes over, som i Spregulering.
- [ ] Hvert regulert grunnlag får kilde `grunnbeløpsregulering`. Skjønnsfastsettelsen og avviksvurderingen blir med uendret.
- [ ] `endret_sykepengegrunnlag` sendes gjennom outboxen med `manuellVurdering: false`.
- [ ] Jobben sender en oppsummering til Slack med `slackmelding`, som Spregulering.
- [ ] Rapid-tester dekker et nytt grunnbeløp, et grunnlag som allerede er riktig, Infotrygd, et grunnlag med skjønnsfastsettelse og togglen av.
