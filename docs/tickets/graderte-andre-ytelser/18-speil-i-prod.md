# 18: Graderte andre ytelser i Speil i prod

**Spec:** [Graderte andre ytelser fra saksbehandler](../../specs/graderte-andre-ytelser.md)

**Repo:** `speil`

**Hva skal lages:** Saksbehandlere i prod kan fordele dager og se historikken.

**Blokkeres av:** [02: sp-andre-ytelser svarer med versjon og trekk fra sykdomsgrad](02-versjon-og-trekk-i-losningen.md), [08: Speil videresender og mocker API-et til sp-andre-ytelser](08-speil-videresender-og-mocker-api-et.md), [09: Speil lagrer fordelingene i sp-andre-ytelser med sykdomsgraden før fordeling](09-speil-lagrer-fordelinger-i-sp-andre-ytelser.md), [10: Dagoversikten får kolonnen «Andre ytelser» med fordelingen for hver dag](10-visning-av-fordelingen-per-dag.md), [11: Saksbehandler og beslutter ser endringsloggen for fordelingen per dag](11-endringslogg-for-fordelingen-per-dag.md), [12: Skjemaet stopper fordelinger som bryter reglene](12-skjemaet-stopper-ugyldige-fordelinger.md), [13: Saksbehandler får presise feilmeldinger fra sp-andre-ytelser](13-presise-feilmeldinger.md), [14: Saksbehandler kan fjerne graderte andre ytelser fra en dag](14-fjerne-graderte-andre-ytelser-fra-en-dag.md), [15: Lagring uten reelle endringer venter ikke på oppdatering](15-lagring-uten-endringer-venter-ikke.md), [16: Beslutter ser endringer av fordelingene i historikkpanelet](16-historikk-i-historikkpanelet.md), [17: Saksbehandler kan registrere flere graderte andre ytelser samme dag](17-flere-ytelser-samme-dag.md)

**Status:** klar

## Akseptansekriterier

- [ ] sp-andre-ytelser er satt opp som backend i prod, med tilgangspolicy og miljøvariabler.
- [ ] Backenden er ikke lenger begrenset til dev.
- [ ] Det er avklart hvem som skal se funksjonen i prod. I dag viser togglen den bare til coach, fagkoordinator og supersaksbehandler.
- [ ] Rullet ut i prod, og en fordeling er lagret og vist uten feil.
