# 16: Beslutter ser endringer av fordelingene i historikkpanelet

**Spec:** [Graderte andre ytelser fra saksbehandler](../../specs/graderte-andre-ytelser.md)

**Repo:** `speil`

**Brukerhistorier:** 12

**Hva skal lages:** I historikkpanelet kan beslutter åpne en saksbehandlerhandling av typen `GRADERTE_ANDRE_YTELSER_ENDRET` og se hvem som endret, når, notatet til beslutter og endringene per dag. Endringsloggen per dag i dagoversikten er [11](11-endringslogg-for-fordelingen-per-dag.md).

**Blokkeres av:** [08: Speil videresender og mocker API-et til sp-andre-ytelser](08-speil-videresender-og-mocker-api-et.md)

**Status:** klar

## Akseptansekriterier

- [ ] Visningen hentes fra sp-andre-ytelser, med videresending i dev og mock lokalt.
- [ ] `tilVisningUrl` gir en URL til sp-andre-ytelser for `GRADERTE_ANDRE_YTELSER_ENDRET`. I dag gir den `null`, så innslaget kan ikke åpnes.
- [ ] `handlingsvisningSchema` støtter felttypen `ENDRINGER`, som vises som grupper med rader fra og til, i tillegg til `TEKST`.
- [ ] Ukjent eller ugyldig handling gir samme melding som andre handlinger som ikke finnes.
- [ ] Tester dekker visningen av begge felttypene.
