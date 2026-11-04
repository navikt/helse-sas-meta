# 14: Graderte andre ytelser i Speil i prod

**Spec:** [Graderte andre ytelser fra saksbehandler](../../specs/graderte-andre-ytelser.md)

**Repo:** `speil`

**Hva skal lages:** Saksbehandlere i prod kan fordele dager og se historikken.

**Blokkeres av:** [02: sp-andre-ytelser svarer med versjon og trekk fra sykdomsgrad](02-versjon-og-trekk-i-losningen.md), [08: Speil videresender og mocker API-et til sp-andre-ytelser](08-speil-videresender-og-mocker-api-et.md), [09: Skjemaet stopper fordelinger som bryter reglene](09-skjemaet-stopper-ugyldige-fordelinger.md), [10: Saksbehandler får presise feilmeldinger fra sp-andre-ytelser](10-presise-feilmeldinger.md), [11: Saksbehandler kan fjerne graderte andre ytelser fra en dag](11-fjerne-graderte-andre-ytelser-fra-en-dag.md), [12: Lagring uten reelle endringer venter ikke på oppdatering](12-lagring-uten-endringer-venter-ikke.md), [13: Beslutter ser historikken for fordelingene i endringsloggen](13-historikk-i-endringsloggen.md)

**Status:** klar

## Akseptansekriterier

- [ ] sp-andre-ytelser er satt opp som backend i prod, med tilgangspolicy og miljøvariabler.
- [ ] Backenden er ikke lenger begrenset til dev.
- [ ] Rullet ut i prod, og en fordeling er lagret og vist uten feil.
