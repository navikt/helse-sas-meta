# 10: Rulle ut fase 1

**Spec:** [Avklare sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/avklare-sykepengegrunnlag.md)

**Fase:** 1

**Repo:** `spleis`, `sp-sykepengegrunnlag`

**Hva skal lages:** sp-sykepengegrunnlag kjører i dev og prod, og togglen for fase 1 er på i begge miljøene. Alle nye vilkårsgrunnlag får en ID fra tjenesten, og skyggen viser hvor godt tjenesten treffer.

**Blokkeres av:** [01: Endepunkt for én rettighetskategori i sp-rettighetskategori](01-endepunkt-for-rettighetskategori.md), [07: `AvventerSykepengegrunnlag` i Spleis bak toggle](07-spleis-avventer-sykepengegrunnlag.md), [08: `AVVENTER_SYKEPENGEGRUNNLAG` i Spock og spammer](08-tilstanden-i-spock-og-spammer.md), [09: Skygge mot Spleis og Spinnvill](09-skygge-mot-spleis-og-spinnvill.md)

**Status:** klar

## Akseptansekriterier

- [ ] sp-sykepengegrunnlag er deployet i dev og prod med tilgang til Spedisjon, sp-rettighetskategori og Sigrun.
- [ ] Togglen for fase 1 er på i dev, og perioder går gjennom `AvventerSykepengegrunnlag` uten å bli stående.
- [ ] Togglen for fase 1 er på i prod.
- [ ] Skyggen har gått lenge nok til at forskjellene er forklart eller rettet.
- [ ] Togglen for fase 1 er fjernet fra koden i Spleis.
