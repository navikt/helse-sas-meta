# 13: Saksbehandler får presise feilmeldinger fra sp-andre-ytelser

**Spec:** [Graderte andre ytelser fra saksbehandler](../../specs/graderte-andre-ytelser.md)

**Repo:** `speil`

**Brukerhistorier:** 4, 5, 6, 7, 9, 13

**Hva skal lages:** Hvis sp-andre-ytelser avviser en fordeling, ser saksbehandler hvilken regel som ble brutt, ikke en generell feilmelding.

**Blokkeres av:** [09: Speil lagrer fordelingene i sp-andre-ytelser med sykdomsgraden før fordeling](09-speil-lagrer-fordelinger-i-sp-andre-ytelser.md)

**Status:** klar

## Akseptansekriterier

- [ ] `GRAD_UTENFOR_GRENSER`, `SUM_ER_IKKE_100`, `ARBEIDSGRAD_OKER`, `YTELSER_MANGLER_TREKK` og `MANGLER_ENDRINGER` får hver sin melding.
- [ ] `UTDATERT_TILSTAND` beholder meldingen om at noen andre har endret fordelingene.
- [ ] 403 fra sp-andre-ytelser, når saksbehandler mangler skrivetilgang til personen, gir en melding om manglende tilgang.
- [ ] Ukjente feilkoder gir den generelle meldingen.
- [ ] Når lagringen feiler, forsvinner «visningen oppdateres», og saksbehandler kan rette og prøve igjen.
- [ ] Tester dekker hver feilkode.
