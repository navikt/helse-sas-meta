# 09: Skjemaet stopper fordelinger som bryter reglene

**Spec:** [Graderte andre ytelser fra saksbehandler](../../specs/graderte-andre-ytelser.md)

**Repo:** `speil`

**Brukerhistorier:** 4, 5, 6, 7

**Hva skal lages:** Saksbehandler får feilmelding i skjemaet før lagring når fordelingen ikke går opp, i stedet for en feil fra backend.

**Blokkeres av:** [08: Speil videresender og mocker API-et til sp-andre-ytelser](08-speil-videresender-og-mocker-api-et.md)

**Status:** klar

## Akseptansekriterier

- [ ] Sykdomsgraden må være mellom 1 og sykdomsgraden før fordeling.
- [ ] Sykdomsgrad + ytelsesgrad må være minst sykdomsgraden før fordeling, altså at arbeidsgraden ikke øker.
- [ ] Ytelsesgraden må være mellom 1 og 99.
- [ ] Feilmeldingene sier hva saksbehandler må rette.
- [ ] Tester dekker grensene rundt hver regel.
