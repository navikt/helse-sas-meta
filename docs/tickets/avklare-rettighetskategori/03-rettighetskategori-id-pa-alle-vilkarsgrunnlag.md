# 03: Rettighetskategori-ID på alle vilkårsgrunnlag i Spleis

**Spec:** [Avklare rettighetskategori i sp-rettighetskategori](../../specs/avklare-rettighetskategori.md)

**Fase:** 1

**Repo:** `spleis`

**Hva skal lages:** Alle vilkårsgrunnlag i Spleis får feltet `rettighetskategoriId`, som aldri er tomt. En JSON-migrering setter en deterministisk ID på eksisterende vilkårsgrunnlag, og Spleis lager samme ID for nye. Spleis bruker ikke ID-en ennå. Se ADR 0002.

**Blokkeres av:** Ingen (kan starte med en gang)

**Status:** klar

## Akseptansekriterier

- [ ] En JSON-migrering setter `rettighetskategoriId` til `UUID.nameUUIDFromBytes("$vilkårsgrunnlagId:Rettighetskategori")` på alle vilkårsgrunnlag i historikken, både fra Spleis og fra Infotrygd. Den følger V345 og V346 for `opptjeningsvurderingId`.
- [ ] Nye vilkårsgrunnlag, også fra Infotrygd, får samme deterministiske ID når Spleis ikke har en ID fra sp-rettighetskategori.
- [ ] Et kopiert vilkårsgrunnlag beholder ID-en.
- [ ] Feltet ligger i `VilkårsgrunnlagElement` og ikke i undertypene, slik at også det minimale vilkårsgrunnlaget i [04](04-spleis-avventer-rettighetskategori.md) får det.
- [ ] Feltet er med i DTO-ene og i serialiseringen av personen, og det er ikke nullbart.
- [ ] En migreringstest sjekker at ID-en fra migreringen er den samme som Spleis lager for et nytt vilkårsgrunnlag med samme `vilkårsgrunnlagId`.
- [ ] Migreringen har kjørt for alle personer i dev og prod.
