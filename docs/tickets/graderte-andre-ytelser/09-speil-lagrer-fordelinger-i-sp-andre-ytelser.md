# 09: Speil lagrer fordelingene i sp-andre-ytelser med sykdomsgraden før fordeling

**Spec:** [Graderte andre ytelser fra saksbehandler](../../specs/graderte-andre-ytelser.md)

**Repo:** `speil`

**Brukerhistorier:** 1, 14, 27

**Hva skal lages:** Saksbehandler kan hente og lagre fordelinger av dagen mot sp-andre-ytelser i dev, og lokalt mot mocken. Hver dag i forespørselen har `sykdomsgradFørFordeling`. Spesialist har fjernet sin løsning, så Speil kan ikke lenger bruke Spesialist-stien og Spesialist-typene for graderte andre ytelser. API-et krever `sykdomsgradFørFordeling`, så byttet og det nye feltet må komme samtidig.

**Blokkeres av:** [08: Speil videresender og mocker API-et til sp-andre-ytelser](08-speil-videresender-og-mocker-api-et.md)

**Status:** klar

## Akseptansekriterier

- [ ] Henting og lagring av fordelinger i dagoversikten bruker de genererte hooksene mot `/api/andre-ytelser/...`.
- [ ] Stubben og ruten under `/api/spesialist/personer/[pseudoId]/graderte-andre-ytelser` og mocklagringen i `spesialist-mock` er fjernet, sammen med bruken av Spesialist-typene og de gamle feilkodene `NEGATIV_GRAD` og `TOTAL_GRAD_OVER_100`.
- [ ] `sykdomsgradFørFordeling` er sykdomsgraden til dagen i Spleis, slik den vises i dagoversikten. Saksbehandler skriver den ikke inn selv. I dag finnes feltet «Innvilget grad» (`innvigletGrad`) i skjemaet, men verdien sendes ikke.
- [ ] Når saksbehandler fordeler flere dager samtidig, får hver dag sin egen `sykdomsgradFørFordeling`.
- [ ] `arbeidsgrad` regnes ut som `100 − sykdomsgrad − summen av andreYtelserGrader`, som i dag.
- [ ] Tester dekker henting, lagring av én dag og av flere dager med ulik sykdomsgrad, en dag som allerede har en fordeling, og 409 `UTDATERT_TILSTAND`.
