# 05: Spleis lagrer `trekkFraSykdomsgrad` per utbetalingsdag

**Spec:** [Graderte andre ytelser fra saksbehandler](../../specs/graderte-andre-ytelser.md)

**Repo:** `spleis`

**Hva skal lages:** `andreYtelserGrad` i `Økonomi` får navnet `trekkFraSykdomsgrad`, og feltet lagres på hver utbetalingsdag, slik at et vedtak med trekk kan leses og beregnes på nytt uten å spørre sp-andre-ytelser.

**Blokkeres av:** Ingen (kan starte med en gang)

**Status:** ferdig

## Akseptansekriterier

- [x] `Økonomi` bruker `trekkFraSykdomsgrad` i stedet for `andreYtelserGrad`.
- [x] `ØkonomiUtDto` og `ØkonomiInnDto` har `trekkFraSykdomsgrad`, og serde lagrer feltet per utbetalingsdag.
- [x] Utbetalingsdager uten feltet leses som 0.
- [x] En person med trekk som lagres og leses inn igjen, får samme utbetalingstidslinje.
- [x] En serde-test dekker både nye og gamle data.
