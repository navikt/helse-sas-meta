# 13: Beslutter ser historikken for fordelingene i endringsloggen

**Spec:** [Graderte andre ytelser fra saksbehandler](../../specs/graderte-andre-ytelser.md)

**Repo:** `speil`

**Brukerhistorier:** 12

**Hva skal lages:** Beslutter kan åpne en saksbehandlerhandling av typen `GRADERTE_ANDRE_YTELSER_ENDRET` og se hvem som endret, når, notatet til beslutter og endringene per dag.

**Blokkeres av:** [08: Speil videresender og mocker API-et til sp-andre-ytelser](08-speil-videresender-og-mocker-api-et.md)

**Status:** klar

## Akseptansekriterier

- [ ] Visningen hentes fra sp-andre-ytelser, med videresending i dev og mock lokalt.
- [ ] `GRADERTE_ANDRE_YTELSER_ENDRET` hentes fra sp-andre-ytelser.
- [ ] Felttypen `ENDRINGER` vises som grupper med rader fra og til, i tillegg til `TEKST`.
- [ ] Ukjent eller ugyldig handling gir samme melding som andre handlinger som ikke finnes.
- [ ] Tester dekker visningen av begge felttypene.
