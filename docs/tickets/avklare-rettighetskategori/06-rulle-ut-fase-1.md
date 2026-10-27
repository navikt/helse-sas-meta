# 06: Rulle ut fase 1

**Spec:** [Avklare rettighetskategori i sp-rettighetskategori](../../specs/avklare-rettighetskategori.md)

**Fase:** 1

**Repo:** `spleis`, `sp-rettighetskategori`

**Hva skal lages:** Spleis går gjennom `AvventerRettighetskategori` i dev og prod. sp-rettighetskategori lager og lagrer avgjørelser, men Spleis bruker dem ikke. RV_SØ_53 kjører når søknaden kommer inn, som i dag. Togglen for fase 1 fjernes til slutt, slik at bare én toggle er i bruk om gangen.

**Blokkeres av:** [02: Alle søknadstyper, kombinasjoner og idempotens i sp-rettighetskategori](02-alle-soknadstyper-kombinasjoner-og-idempotens.md), [04: `AvventerRettighetskategori` i Spleis bak toggle](04-spleis-avventer-rettighetskategori.md), [05: Rettighetskategori-ID i opptjeningsbehovet](05-rettighetskategori-id-til-opptjening.md), [13: `AVVENTER_RETTIGHETSKATEGORI` i Spock og spammer](13-tilstanden-i-spock-og-spammer.md)

**Status:** klar

## Akseptansekriterier

- [ ] Spock og spammer håndterer `AVVENTER_RETTIGHETSKATEGORI` i dev og prod før togglen skrus på. Spock logger ikke «Har ikke påminnelseregler for tilstand AVVENTER_RETTIGHETSKATEGORI».
- [ ] Togglen for fase 1 er på i dev, og bare AT, bare SN og AT og SN som overlapper skjæringstidspunktet er verifisert ende til ende med ekte søknader. Kombinasjonen forkastes fortsatt med RV_SØ_53 når søknaden kommer inn.
- [ ] Togglen er på i prod, og antall forkastinger med RV_SØ_53 er uendret.
- [ ] Ingen perioder står fast i `AvventerRettighetskategori`.
- [ ] Vilkårsgrunnlag som er laget i prod etter at togglen ble skrudd på, har rettighetskategori-ID-en fra det minimale vilkårsgrunnlaget, og ingen minimale vilkårsgrunnlag ligger igjen for perioder som er forbi vilkårsprøving.
- [ ] Togglen og koden for togglen-av er fjernet fra Spleis.
