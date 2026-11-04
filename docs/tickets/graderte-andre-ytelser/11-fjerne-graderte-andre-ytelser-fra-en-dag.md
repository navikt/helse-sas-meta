# 11: Saksbehandler kan fjerne graderte andre ytelser fra en dag

**Spec:** [Graderte andre ytelser fra saksbehandler](../../specs/graderte-andre-ytelser.md)

**Repo:** `speil`

**Brukerhistorier:** 8

**Hva skal lages:** Når saksbehandler endrer en dag med graderte andre ytelser tilbake til en vanlig sykedag, fjernes fordelingen i sp-andre-ytelser. Trekket for dagen blir 0.

**Blokkeres av:** [08: Speil videresender og mocker API-et til sp-andre-ytelser](08-speil-videresender-og-mocker-api-et.md)

**Status:** klar

## Akseptansekriterier

- [ ] Speil sender dagen med tom `andreYtelserGrader` og `sykdomsgrad` lik `sykdomsgradFørFordeling`.
- [ ] Dagen vises uten graderte andre ytelser etter lagring.
- [ ] Dager som aldri har hatt graderte andre ytelser, sendes ikke til sp-andre-ytelser.
- [ ] Tester dekker fjerning, og at uendrede dager ikke sendes.
