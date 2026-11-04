# 10: Saksbehandler får presise feilmeldinger fra sp-andre-ytelser

**Spec:** [Graderte andre ytelser fra saksbehandler](../../specs/graderte-andre-ytelser.md)

**Repo:** `speil`

**Brukerhistorier:** 4, 5, 6, 7, 9

**Hva skal lages:** Hvis sp-andre-ytelser avviser en fordeling, ser saksbehandler hvilken regel som ble brutt, ikke en generell feilmelding.

**Blokkeres av:** [08: Speil videresender og mocker API-et til sp-andre-ytelser](08-speil-videresender-og-mocker-api-et.md)

**Status:** klar

## Akseptansekriterier

- [ ] `GRAD_UTENFOR_GRENSER`, `SUM_ER_IKKE_100`, `ARBEIDSGRAD_OKER`, `YTELSER_MANGLER_TREKK` og `MANGLER_ENDRINGER` får hver sin melding.
- [ ] `UTDATERT_TILSTAND` beholder meldingen om at noen andre har endret fordelingene.
- [ ] Ukjente feilkoder gir den generelle meldingen.
- [ ] Tester dekker hver feilkode.
