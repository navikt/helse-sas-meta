# 06: Sykepengegrunnlag-ID på alle vilkårsgrunnlag i Spleis

**Spec:** [Avklare sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/avklare-sykepengegrunnlag.md)

**Fase:** 1

**Repo:** `spleis`

**Hva skal lages:** Alle vilkårsgrunnlag i Spleis har en sykepengegrunnlag-ID, både de som finnes fra før og de nye. Én ID står aldri for to ulike sett med beløp. Godkjenningsbehovet sender ID-en. Dette må være på plass før tilstanden kommer i [07](07-spleis-avventer-sykepengegrunnlag.md), og før backfill i [11](11-spleis-api-sykepengegrunnlag.md).

**Blokkeres av:** Ingen (kan starte med en gang). Forutsetter at ticketene for rettighetskategori er ferdige.

**Status:** klar

## Akseptansekriterier

- [ ] Vilkårsgrunnlaget har feltet `sykepengegrunnlagId`, og det er aldri tomt.
- [ ] En JSON-migrering setter `UUID.nameUUIDFromBytes("$vilkårsgrunnlagId:Sykepengegrunnlag")` på alle eksisterende vilkårsgrunnlag, også de fra Infotrygd.
- [ ] Et nytt vilkårsgrunnlag uten ID fra tjenesten får den deterministiske ID-en.
- [ ] Endrer Spleis selv inntektsgrunnlaget, for eksempel ved skjønnsfastsettelse eller overstyring fra Spesialist, får det nye vilkårsgrunnlaget den deterministiske ID-en fra sin egen `vilkårsgrunnlagId`.
- [ ] Et kopiert vilkårsgrunnlag med uendret inntektsgrunnlag beholder ID-en.
- [ ] Det minimale vilkårsgrunnlaget har det valgfrie feltet `sykepengegrunnlagId`. Typen i JSON-en er fortsatt `Rettighetskategori`.
- [ ] Det fulle vilkårsgrunnlaget tar med seg ID-en fra det minimale når den finnes.
- [ ] Godkjenningsbehovet har feltet `sykepengegrunnlagId`.
- [ ] Serde håndterer det nye feltet, og eldre versjoner av Spleis er ikke ute når feltet tas i bruk.
- [ ] E2e-tester dekker migreringen, nye vilkårsgrunnlag, ny ID når Spleis endrer inntektsgrunnlaget, kopier som beholder ID-en og feltet i godkjenningsbehovet.
