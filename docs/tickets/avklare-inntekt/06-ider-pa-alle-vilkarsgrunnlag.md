# 06: Inntektsavklarings-ID og sykepengegrunnlag-ID på alle vilkårsgrunnlag i Spleis

**Spec:** [Avklare inntekt i sp-inntekt](../../specs/avklare-inntekt.md)

**Fase:** 1

**Repo:** `spleis`

**Hva skal lages:** Alle vilkårsgrunnlag i Spleis får `inntektsavklaringId` og `sykepengegrunnlagId`. De fulle vilkårsgrunnlagene får deterministiske ID-er fra sin egen `vilkårsgrunnlagId`, både de som finnes og de Spleis lager eller kopierer. Det minimale vilkårsgrunnlaget får de samme feltene, og `rettighetskategoriId` blir nullbar for den minimale typen. Ingen oppførsel endres. Ticketen gjelder begge specene, slik at vi bare trenger én migrering.

**Blokkeres av:** Ingen (kan starte med en gang)

**Status:** klar

## Akseptansekriterier

- [ ] En JSON-migrering setter `inntektsavklaringId` til `UUID.nameUUIDFromBytes("$vilkårsgrunnlagId:Inntektsavklaring")` og `sykepengegrunnlagId` til `UUID.nameUUIDFromBytes("$vilkårsgrunnlagId:Sykepengegrunnlag")` på alle fulle vilkårsgrunnlag, både fra Spleis og fra Infotrygd.
- [ ] Alle fulle vilkårsgrunnlag som Spleis lager eller kopierer, får deterministiske ID-er fra sin egen `vilkårsgrunnlagId`.
- [ ] Det minimale vilkårsgrunnlaget (typen `Rettighetskategori` i JSON-en) har de nullbare feltene `inntektsavklaringId` og `sykepengegrunnlagId`. `rettighetskategoriId` er nullbar bare for den minimale typen.
- [ ] spleis-api tar med `inntektsavklaringId` og `sykepengegrunnlagId` i vilkårsgrunnlaget til Speil.
- [ ] Serde-tester viser at de nye feltene kan lagres og leses igjen, og migreringstesten viser deterministiske ID-er.
- [ ] Ingen eksisterende e2e-tester endrer oppførsel.

## Merknader

- Dette er prefaktoreringen før de nye tilstandene. Ticket [11](11-spleis-api-sykepengegrunnlag.md) bruker de samme ID-ene i spleis-api.
