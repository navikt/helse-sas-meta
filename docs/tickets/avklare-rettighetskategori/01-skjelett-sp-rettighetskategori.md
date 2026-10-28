# 01: Skjelett for sp-rettighetskategori som svarer på behov

**Spec:** [Avklare rettighetskategori i sp-rettighetskategori](../../specs/avklare-rettighetskategori.md)

**Fase:** 1

**Repo:** `sp-rettighetskategori` (nytt), `spedisjon` (bare tilgang)

**Hva skal lages:** En ny app, sp-rettighetskategori, svarer på behovet `Rettighetskategori` for et sykefraværstilfelle med én sendt søknad fra arbeidstaker eller selvstendig næringsdrivende. Appen henter søknaden fra Spedisjon med referanse-ID-en (`@id`), avgjør hovedkategorien, lagrer avgjørelsen og svarer med en rettighetskategori-ID og hovedkategorien. Appen svarer også på `RettighetskategoriResultat`, som slår opp hovedkategorien for en ID.

**Blokkeres av:** Ingen (kan starte med en gang)

**Status:** pågår

## Akseptansekriterier

- [ ] Appen er satt opp med sykepenger-gradle-plugins, standard workflows og Nais-manifester i `.nais/`, og er deployet til dev.
- [x] Appen har egen Postgres-database med Flyway-migreringer.
- [x] Appen har tilgang til Spedisjons API for meldinger, og Spedisjon tillater kall fra appen.
- [x] Behovet `Rettighetskategori` med person, skjæringstidspunkt og én søknads-ID gir en løsning med en rettighetskategori-ID og hovedkategorien. Spleis bruker hovedkategorien til å forkaste kategorier den ikke støtter i mottaket av løsningen, men lagrer den ikke.
- [x] En søknad fra arbeidstaker gir hovedkategorien Arbeidstaker, og en søknad fra selvstendig næringsdrivende gir Selvstendig næringsdrivende.
- [x] Hver avgjørelse lagres som en ny rad med ID, person, skjæringstidspunkt, hovedkategori, kilde `automatisk`, tidspunkt og søknads-ID-ene som ble brukt.
- [x] Behovet `RettighetskategoriResultat` med en ID gir hovedkategorien i løsningen.
- [x] Rapid-tester sender behov inn og sjekker løsningen, med Spedisjon faket i HTTP-klienten og ekte Postgres. Tester å bygge videre på: `OpptjeningsvurderingRiverTest` og `OpptjeningsvurderingResultatRiverTest` i sp-vilkarsproving.
