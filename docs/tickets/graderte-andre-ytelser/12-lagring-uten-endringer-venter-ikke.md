# 12: Lagring uten reelle endringer venter ikke på oppdatering

**Spec:** [Graderte andre ytelser fra saksbehandler](../../specs/graderte-andre-ytelser.md)

**Repo:** `speil`

**Hva skal lages:** Når sp-andre-ytelser svarer med samme versjon som før, vet Speil at ingenting ble endret. Saksbehandler ser ikke «visningen oppdateres» og blir ikke stående og vente.

**Blokkeres av:** [08: Speil videresender og mocker API-et til sp-andre-ytelser](08-speil-videresender-og-mocker-api-et.md)

**Status:** klar

## Akseptansekriterier

- [ ] Speil sammenligner versjonen i svaret med versjonen som ble sendt.
- [ ] Ved samme versjon venter ikke Speil på oppdatering for fordelingene, men lagrer fortsatt eventuelle endringer i tidslinjen.
- [ ] Tester dekker samme versjon, ny versjon og lagring sammen med endringer i tidslinjen.
