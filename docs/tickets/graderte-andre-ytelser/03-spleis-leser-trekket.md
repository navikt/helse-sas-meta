# 03: Spleis leser løsningen fra sp-andre-ytelser og bruker trekket

**Spec:** [Graderte andre ytelser fra saksbehandler](../../specs/graderte-andre-ytelser.md)

**Repo:** `spleis`

**Hva skal lages:** Når togglen er på, leser Spleis løsningen på `GraderteAndreYtelserForBeregning` i formatet fra specen, for alle yrkesaktivitetstypene, også `ARBEIDSLEDIG`. Trekket blir `andreYtelserGrad` for dagen og yrkesaktiviteten, og den justerte sykdomsgraden gir utbetalingen. Det gamle formatet er fjernet. Spleis revurderer allerede ved `graderte_andre_ytelser_endret`, så når ticket 02 er ute, gir saksbehandlers fordeling en ny beregning i dev.

**Blokkeres av:** Ingen (kan starte med en gang, med testløsninger)

**Status:** klar

## Akseptansekriterier

- [ ] Mottaket av `Ytelser` leser `yrkesaktivitetstype`, `organisasjonsnummer`, `versjon` og `dager` med `dato`, `trekkFraSykdomsgrad` og `sykdomsgradFørFordeling`. Feltene `yrkesaktivitet`, `graderteAndreYtelserType` og `graderteAndreYtelserPerioder` leses ikke lenger.
- [ ] `ARBEIDSTAKER` med organisasjonsnummer, `FRILANS`, `SELVSTENDIG` og `ARBEIDSLEDIG` blir riktig yrkesaktivitet.
- [ ] Tidslinjen per yrkesaktivitet har trekket og sykdomsgraden før fordeling per dag, og trekket blir `andreYtelserGrad` i `Økonomi`.
- [ ] Et trekk som er større enn sykdomsgraden, gir justert sykdomsgrad 0.
- [ ] Behovet sendes fortsatt bare når togglen er på, med beregningsperioden som `fom` og `tom`.
- [ ] `BehovkontraktTest`, `YtelserRiverTest` og `YtelserRiverMappingTest` er oppdatert.
- [ ] E2e-tester i `GraderteAndreYtelserTest` dekker trekk fra sykdom, trekk som er større enn sykdomsgraden, to arbeidsgivere der bare én har trekk og 20 %-regelen mot totalgraden, revurdering etter `graderte_andre_ytelser_endret` og togglen av og på.
