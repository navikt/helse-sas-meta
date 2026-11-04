# 17: Saksbehandler kan registrere flere graderte andre ytelser samme dag

**Spec:** [Graderte andre ytelser fra saksbehandler](../../specs/graderte-andre-ytelser.md)

**Repo:** `speil`

**Brukerhistorier:** 3

**Hva skal lages:** Saksbehandler kan legge flere ytelser på samme dag, for eksempel 20 % foreldrepenger og 20 % omsorgspenger. I dag har skjemaet bare én ytelse per dag, og Speil sender bare én ytelse i `andreYtelserGrader`.

**Blokkeres av:** [10: Dagoversikten får kolonnen «Andre ytelser» med fordelingen for hver dag](10-visning-av-fordelingen-per-dag.md)

**Status:** klar

## Akseptansekriterier

- [ ] Saksbehandler kan legge til og fjerne ytelser for dagen. Hver ytelsestype kan bare velges én gang per dag.
- [ ] Alle ytelsene sendes i `andreYtelserGrader`, og `arbeidsgrad` blir `100 − sykdomsgrad − summen av ytelsene`.
- [ ] Reglene fra [12](12-skjemaet-stopper-ugyldige-fordelinger.md) bruker summen av ytelsene, og hver ytelse må være mellom 1 og 99.
- [ ] Kolonnen «Andre ytelser» viser summen av gradene, og Merknader viser alle ytelsene for dagen.
- [ ] En endring av bare én av ytelsene regnes som en reell endring.
- [ ] Tester dekker to ytelser på samme dag, fjerning av én av dem og visningen.
