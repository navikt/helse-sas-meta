# 11: Saksbehandler og beslutter ser endringsloggen for fordelingen per dag

**Spec:** [Graderte andre ytelser fra saksbehandler](../../specs/graderte-andre-ytelser.md)

**Repo:** `speil`

**Brukerhistorier:** 12

**Hva skal lages:** I kolonnen «Andre ytelser» står et ikon for endringsloggen ved siden av graden, som for overstyringer i Kilde-kolonnen. Endringsloggen viser endringer av fordelingen for dagen: hvem som endret, når, notatet til beslutter og hva som ble endret fra og til. I dag har Speil bare endringslogg for overstyringer av tidslinjen fra Spleis (`KildeCell`). Dager med graderte andre ytelser sendes ikke som overstyring, så de får ingen endringslogg.

**Blokkeres av:** [10: Dagoversikten får kolonnen «Andre ytelser» med fordelingen for hver dag](10-visning-av-fordelingen-per-dag.md)

**Status:** klar

## Akseptansekriterier

- [ ] Endringsloggen bygges fra `events` i `GET` fra sp-andre-ytelser, med `tidspunkt`, `utfortAvSaksbehandlerIdent`, `notatTilBeslutter` og dagene i hver hendelse.
- [ ] Hver endring viser ytelsene, sykdomsgraden og arbeidsgraden fra og til. Den første fordelingen av en dag har ingen `fra`-verdier.
- [ ] Ikonet vises bare for dager med endringer av fordelingen, ved siden av graden i kolonnen «Andre ytelser».
- [ ] Endringene vises sortert på tidspunkt.
- [ ] Endringsloggen for overstyringer av tidslinjen i Kilde-kolonnen er som før.
- [ ] Tester dekker én endring, flere endringer av samme dag, fjerning av ytelser og en dag som også har en overstyring av tidslinjen.
