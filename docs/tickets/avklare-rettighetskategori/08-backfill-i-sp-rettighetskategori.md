# 08: Backfill av historikken i sp-rettighetskategori

**Spec:** [Avklare rettighetskategori i sp-rettighetskategori](../../specs/avklare-rettighetskategori.md)

**Fase:** 2

**Repo:** `sp-rettighetskategori`

**Hva skal lages:** sp-rettighetskategori lager avgjørelser for rettighetskategori-ID-er som bare finnes i Spleis. Den henter historikken fra spleis-api ved `person_avstemming` og synkront når den får `RettighetskategoriResultat` for en ID den ikke kjenner. Hovedkategorien blir den samme som Spleis kom fram til. Løsningen følger `PersonAvstemmingService` og fallbacken i `OpptjeningsvurderingResultatRiver` i sp-vilkarsproving.

**Blokkeres av:** [01: Skjelett for sp-rettighetskategori som svarer på behov](01-skjelett-sp-rettighetskategori.md), [07: Endepunkt for rettighetskategorier i spleis-api](07-spleis-api-rettighetskategorier.md)

**Status:** pågår

## Akseptansekriterier

- [x] Hovedkategorien avgjøres slik specen beskriver, ut fra den første perioden for hver yrkesaktivitet: aktive perioder først, så forkastede perioder, så inntektsgrunnlaget. Vilkårsgrunnlag fra Infotrygd gir Arbeidstaker.
- [x] Avgjørelser fra backfill lagres med ID-en fra Spleis, kilde `spleis`, vurderingstidspunktet fra opprettet i Spleis og uten søknads-ID-er. Lagringen er idempotent på ID.
- [x] En avgjørelse fra backfill blir ikke gjeldende når det finnes en automatisk avgjørelse med nyere vurderingstidspunkt for samme person og skjæringstidspunkt.
- [x] `RettighetskategoriResultat` for en ukjent ID henter historikken for personen, lagrer ID-ene som mangler og svarer. Finnes ID-en heller ikke i Spleis, svarer ikke tjenesten, og feilen logges.
- [x] `person_avstemming` henter historikken hver gang og lagrer ID-ene som mangler, også for personer som står i migreringsloggen.
- [x] Hver backfill som lagrer minst én ny ID, føres i migreringsloggen med fødselsnummer, tidspunkt, antall ID-er fra Spleis og antall nye. En backfill uten nye ID-er føres ikke.
- [x] Rapid-tester dekker ukjent ID, ID som ikke finnes i Spleis, to avstemminger etter hverandre og hovedkategorien for de samme personene som i testene for spleis-api. spleis-api fakes i HTTP-klienten.
- [ ] Backfill er rullet ut i dev og så i prod.
- [ ] Vi har sjekket et utvalg personer i prod der hovedkategorien fra backfill er sammenlignet med hva Spleis gjorde, også for vilkårsgrunnlag der bare forkastede perioder finnes.

## Merknader

- Backfill er laget i sp-rettighetskategori (commit `3ca2770`, omdøpt i `a122058`). Utrullingen og sjekken i prod gjenstår. Tilgangen til spleis-api i `.nais/sp-rettighetskategori.yaml` og tilgangen for sp-rettighetskategori i `.nais/spleis-api.yaml` i spleis må være deployet før backfill virker.
- Får en ID fra Spleis yrkesaktivitetstypen `FRILANS` eller `ARBEIDSLEDIG` blant periodene som brukes, feiler backfill for hele personen, og feilen logges. Ingenting lagres, og ingenting føres i migreringsloggen.
- Feiler backfill ved `person_avstemming`, logges feilen, og meldingen hoppes over. Neste avstemming prøver igjen.
- En ID som allerede er lagret, blir ikke endret, heller ikke når den er avgjort automatisk. Er ID-en lagret for en annen person, feiler backfill for personen.
- Migreringsloggen har kolonnene `fødselsnummer`, `opprettet`, `antall_fra_spleis` og `antall_nye`. Om en avgjørelse kommer fra backfill eller er avgjort i sp-rettighetskategori, står i kolonnen `kilde` i `rettighetskategori`.
- `opprydding-dev` sletter også migreringsloggen til personen.
