# 12: Skjemaet stopper fordelinger som bryter reglene

**Spec:** [Graderte andre ytelser fra saksbehandler](../../specs/graderte-andre-ytelser.md)

**Repo:** `speil`

**Brukerhistorier:** 4, 5, 6, 7

**Hva skal lages:** Saksbehandler får feilmelding i skjemaet før lagring når fordelingen ikke går opp, i stedet for en feil fra backend.

**Blokkeres av:** [09: Speil lagrer fordelingene i sp-andre-ytelser med sykdomsgraden før fordeling](09-speil-lagrer-fordelinger-i-sp-andre-ytelser.md)

**Status:** klar

## Akseptansekriterier

- [ ] Sykdomsgraden må være mellom 1 og sykdomsgraden før fordeling.
- [ ] Sykdomsgrad + ytelsesgrad må være minst sykdomsgraden før fordeling, altså at arbeidsgraden ikke øker.
- [ ] Sykdomsgrad + ytelsesgrad kan ikke være over 100, altså at arbeidsgraden ikke blir negativ.
- [ ] Ytelsesgraden må være mellom 1 og 99. I dag godtar skjemaet 100.
- [ ] Feilmeldingene sier hva saksbehandler må rette.
- [ ] Tester dekker grensene rundt hver regel.
