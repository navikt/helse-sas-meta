# 07: Spleis tar imot `avslagsdager_endret` og revurderer

**Spec:** [Avslå dager etter oppholdskravet i sp-avslagsdager](../../specs/avslagsdager-oppholdskrav.md)

**Repo:** `spleis`

**Hva skal lages:** Når saksbehandler avslår eller gjør om dager, får Spleis `avslagsdager_endret` med vurderings-ID-en og alle dagene som er vurdert. Spleis lagrer vurderings-ID-en for hver dag på personen og starter revurdering av vedtaksperiodene som overlapper dagene, for alle yrkesaktiviteter. Revurderingen henter utfallet med behovet fra ticket 06.

**Blokkeres av:** [06: Spleis avslår dager med `Oppholdskrav` fra behovet](06-spleis-avslar-dager-med-oppholdskrav.md)

**Status:** klar

## Akseptansekriterier

- [ ] En ny river tar imot `avslagsdager_endret` med `fødselsnummer`, `vurderingId` og `perioder` (`{fom, tom}`).
- [ ] Vurderings-ID-en lagres for hver dag i `perioder` på personen og erstatter den forrige.
- [ ] Vedtaksperioder som overlapper dagene, revurderes for alle yrkesaktiviteter. Perioder som ikke overlapper, røres ikke.
- [ ] Perioder som ikke er beregnet ennå, går videre som vanlig og får vurderings-ID-en når de beregnes.
- [ ] Meldingen gjør ingenting når togglen fra ticket 06 er av.
- [ ] E2e-tester dekker avslag etter utbetaling som gir revurdering, omgjøring etter utbetaling, dager som ikke henger sammen, og to arbeidsgivere. Tester å bygge videre på: `EndretVurderingPåSkjæringstidspunktTest`.
