# 01: Skjelett for sp-sykepengegrunnlag for én arbeidstaker

**Spec:** [Fastsette sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/fastsette-sykepengegrunnlag.md)

**Fase:** 2

**Repo:** `sp-sykepengegrunnlag`

**Hva skal lages:** sp-sykepengegrunnlag finnes som app med egen database og svarer på behovet `Sykepengegrunnlag` for en arbeidstaker med én arbeidsgiver og inntektsmelding. Tjenesten slår opp inntektsavklaringen i sp-inntekt og hovedkategorien med `RettighetskategoriResultat`, regner om til årsinntekt, begrenser til 6G og lagrer grunnlaget. Samme resultat gir samme ID.

**Blokkeres av:** [Inntekt 05: Oppslag på inntektsavklaring for andre tjenester](../avklare-inntekt/05-oppslag-pa-inntektsavklaring.md)

**Status:** klar

## Akseptansekriterier

- [ ] Appen er satt opp etter sykepenger-standarden med egen Postgres-database og Nais-manifester for dev og prod, og deployer.
- [ ] Behovet `Sykepengegrunnlag` leses med feltene i specen. Løsningen har `id` og `utfall: FASTSATT`.
- [ ] Inntektsavklaringen hentes med `GET /api/inntektsavklaringer/{id}` og maskin-til-maskin-token. Hovedkategorien hentes med `RettighetskategoriResultat` og `opprinneligBehov`. Begge svarene caches.
- [ ] Tjenesten har sin egen tabell over grunnbeløp med de samme verdiene som Spleis, og bruker grunnbeløpet på skjæringstidspunktet til 6G.
- [ ] Lagringen skiller mellom sykepengegrunnlag og fastsettelse, etter ADR 0006. Fastsettelsen har inntektsavklarings-ID, rettighetskategori-ID, tidspunkt og kodeversjon.
- [ ] En ny fastsettelse med samme resultat føyes til det gjeldende grunnlaget og gir samme ID. Et nytt resultat gir et nytt grunnlag med ny ID.
- [ ] Modellen fastsetter per yrkesaktivitet med en egen fastsettelsesmåte for hver type, slik at nye typer kan legges til uten å endre kontrakten.
- [ ] Svarer ikke sp-inntekt eller sp-rettighetskategori, svarer ikke tjenesten, og feilen logges. `ARBEIDSTAKER_OG_SELVSTENDIG_NÆRINGSDRIVENDE` gir ubesvart behov og logget feil.
- [ ] Rapid-tester med ekte Postgres og sp-inntekt fakt dekker grunnlag under og over 6G, samme og nytt resultat, kombinert hovedkategori og feil fra sp-inntekt.
