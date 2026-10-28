# 08: Innfylling av historikken i sp-rettighetskategori

**Spec:** [Avklare rettighetskategori i sp-rettighetskategori](../../specs/avklare-rettighetskategori.md)

**Fase:** 2

**Repo:** `sp-rettighetskategori`

**Hva skal lages:** sp-rettighetskategori lager avgjørelser for rettighetskategori-ID-er som bare finnes i Spleis. Den henter historikken fra spleis-api ved `person_avstemming` og synkront når den får `RettighetskategoriResultat` for en ID den ikke kjenner. Hovedkategorien blir den samme som Spleis kom fram til. Løsningen følger `PersonAvstemmingService` og fallbacken i `OpptjeningsvurderingResultatRiver` i sp-vilkarsproving.

**Blokkeres av:** [01: Skjelett for sp-rettighetskategori som svarer på behov](01-skjelett-sp-rettighetskategori.md), [07: Endepunkt for rettighetskategorier i spleis-api](07-spleis-api-rettighetskategorier.md)

**Status:** klar

## Akseptansekriterier

- [ ] Hovedkategorien avgjøres slik specen beskriver, ut fra den første perioden for hver yrkesaktivitet: aktive perioder først, så forkastede perioder, så inntektsgrunnlaget. Vilkårsgrunnlag fra Infotrygd gir Arbeidstaker.
- [ ] Innfylte avgjørelser lagres med ID-en fra Spleis, kilde `spleis`, vurderingstidspunktet fra opprettet i Spleis og uten søknads-ID-er. Lagringen er idempotent på ID.
- [ ] `RettighetskategoriResultat` for en ukjent ID henter historikken for personen, lagrer ID-ene som mangler og svarer. Finnes ID-en heller ikke i Spleis, svarer ikke tjenesten, og feilen logges.
- [ ] `person_avstemming` henter historikken hver gang og lagrer ID-ene som mangler, også for personer som står i migreringsloggen.
- [ ] Hver innfylling føres i migreringsloggen med fødselsnummer, tidspunkt, antall ID-er fra Spleis og antall nye.
- [ ] Rapid-tester dekker ukjent ID, ID som ikke finnes i Spleis, to avstemminger etter hverandre og hovedkategorien for de samme personene som i testene for spleis-api. spleis-api fakes i HTTP-klienten.
- [ ] Innfyllingen er rullet ut i dev og så i prod.
- [ ] Vi har sjekket et utvalg personer i prod der hovedkategorien fra innfyllingen er sammenlignet med hva Spleis gjorde, også for vilkårsgrunnlag der bare forkastede perioder finnes.
