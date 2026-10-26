# 06: Rettighetskategori-ID i opptjeningsbehovet

**Spec:** [Avklare rettighetskategori i sp-rettighetskategori](../../specs/avklare-rettighetskategori.md)

**Repo:** `spleis`, `sp-vilkarsproving`

**Hva skal lages:** Spleis sender rettighetskategori-ID-en med i opptjeningsbehovet, slik at sp-vilkarsproving senere kan slå opp kategorien selv. sp-vilkarsproving tar imot ID-en, men bruker den ikke ennå.

**Blokkeres av:** [03: `AvventerRettighetskategori` i Spleis bak toggle](03-spleis-avventer-rettighetskategori.md)

**Status:** klar

## Akseptansekriterier

- [ ] sp-vilkarsproving tar imot et valgfritt felt med rettighetskategori-ID i opptjeningsbehovet og virker som før med og uten feltet.
- [ ] Spleis sender ID-en i opptjeningsbehovet fra `AvventerVilkårsprøving` når skjæringstidspunktet har en rettighetskategori-ID.
- [ ] sp-vilkarsproving er deployet før Spleis begynner å sende feltet.
- [ ] Feltet er lagt inn i `BehovkontraktTest` i Spleis og i river-testene i sp-vilkarsproving.
