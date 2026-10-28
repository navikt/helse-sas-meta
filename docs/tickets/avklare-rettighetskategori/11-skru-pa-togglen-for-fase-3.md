# 11: Skru på togglen for fase 3

**Spec:** [Avklare rettighetskategori i sp-rettighetskategori](../../specs/avklare-rettighetskategori.md)

**Fase:** 3

**Repo:** `spleis`, `sp-rettighetskategori`

**Hva skal lages:** Spleis validerer rettighetskategorien med sp-rettighetskategori i dev og prod, i stedet for når søknaden kommer inn. Kombinerte sykefraværstilfeller forkastes like godt som før. Ikke alle personer trenger å være fylt inn før togglen skrus på, fordi oppslag på ukjente ID-er fyller dem inn.

**Blokkeres av:** [09: Forkaste kombinerte rettighetskategorier i Spleis](09-forkaste-kombinerte-kategorier.md), [10: Konsistenssjekk av rettighetskategori i `AvventerHistorikk`](10-konsistenssjekk-i-avventer-historikk.md)

**Status:** klar

## Akseptansekriterier

- [ ] Togglen for fase 3 er på i dev, og scenarioene fra specen er verifisert ende til ende med ekte søknader: bare AT, bare SN, AT og SN som overlapper skjæringstidspunktet, AT og SN som ligger inntil hverandre med samme skjæringstidspunkt, selvstendig forlengelse av et arbeidstakertilfelle og forlengelse av et vilkårsgrunnlag fra før fase 1.
- [ ] Vi har tall for forkastinger med RV_SØ_53 før togglen skrus på i prod.
- [ ] Innfyllingen er rullet ut i prod, og det åpne spørsmålet om forkastede perioder i specen er avklart.
- [ ] Togglen er på i prod.
- [ ] Forkastinger med RV_RK_1, RV_RK_2 og RV_SØ_53 til sammen etter togglen er sammenlignet med forkastingene med RV_SØ_53 fra før, og avvikene er forklart. Vi teller forkastede sykefraværstilfeller, ikke perioder eller varsler, fordi RV_RK_1 kommer på alle periodene i tilfellet, mens RV_SØ_53 bare kommer på søknaden som gir kombinasjonen. Avviket for perioder som ligger inntil hverandre, er beskrevet i specen.
- [ ] Vi følger med på `RettighetskategoriResultat` som går til spleis-api, og på behov som ikke blir besvart.
- [ ] Ingen hovedkategori er lagret i Spleis. Person-JSON-en har bare rettighetskategori-ID-en.
- [ ] Vi vet hvordan vi skrur av togglen hvis noe går galt, og perioder som venter på `RettighetskategoriResultat` når togglen skrus av, går videre.
