# 07: Skru på togglen for rettighetskategori

**Spec:** [Avklare rettighetskategori i sp-rettighetskategori](../../specs/avklare-rettighetskategori.md)

**Repo:** `spleis`, `sp-rettighetskategori`

**Hva skal lages:** Spleis avklarer rettighetskategorien med sp-rettighetskategori i dev og prod. Kombinerte sykefraværstilfeller forkastes like godt som før.

**Blokkeres av:** [02: Alle søknadstyper, kombinasjoner og idempotens i sp-rettighetskategori](02-alle-soknadstyper-kombinasjoner-og-idempotens.md), [04: Forkaste kombinerte rettighetskategorier i Spleis](04-forkaste-kombinerte-kategorier.md), [05: Konsistenssjekk av rettighetskategori i `AvventerHistorikk`](05-konsistenssjekk-i-avventer-historikk.md)

**Status:** klar

## Akseptansekriterier

- [ ] Togglen er på i dev, og scenarioene fra specen er verifisert ende til ende med ekte søknader: bare AT, bare SN, AT og SN som overlapper skjæringstidspunktet, og selvstendig forlengelse av et arbeidstakertilfelle.
- [ ] Vi har tall for forkastinger med RV_SØ_53 før togglen skrus på i prod.
- [ ] Togglen er på i prod.
- [ ] Forkastinger med RV_SØ_53 etter togglen er sammenlignet med tallene fra før, og avvikene er forklart.
- [ ] Vi vet hvordan vi skrur av togglen hvis noe går galt, og perioder som står i `AvventerRettighetskategori` når togglen skrus av, går videre.
