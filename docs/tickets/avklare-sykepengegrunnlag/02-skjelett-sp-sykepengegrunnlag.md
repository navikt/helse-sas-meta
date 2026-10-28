# 02: Skjelett for sp-sykepengegrunnlag som svarer på behov

**Spec:** [Avklare sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/avklare-sykepengegrunnlag.md)

**Fase:** 1

**Repo:** `sp-sykepengegrunnlag` (nytt)

**Hva skal lages:** Den nye tjenesten svarer på behovet `Sykepengegrunnlag` for en arbeidstaker med én arbeidsgiver og inntektsmelding. Den svarer også på `SykepengegrunnlagResultat` for ID-en den har laget. Tjenesten slår opp hovedkategorien hos sp-rettighetskategori, henter inntektsmeldingen fra Spedisjon og fastsetter omregnet årsinntekt, beregningsgrunnlaget og sykepengegrunnlaget. Så lagrer den avgjørelsen. Samme input gir samme ID.

**Blokkeres av:** Ingen (kan starte med en gang). Klienten mot sp-rettighetskategori testes mot en falsk tjeneste til [01](01-endepunkt-for-rettighetskategori.md) er ute.

**Status:** klar

## Akseptansekriterier

- [ ] Repoet er satt opp etter sykepenger-standarden med de samme modulene som sp-rettighetskategori: appen, `migreringer` og `opprydding-dev`.
- [ ] Appen har egen Postgres-database og Azure-tilgang til Spedisjon og sp-rettighetskategori.
- [ ] Behovet `Sykepengegrunnlag` leses med feltene i specen og løses med `id` og `utfall` `FASTSATT`.
- [ ] Avgjørelsen lagres som en ny rad med feltene i specen, med kilde `automatisk`, inputen og tom `byggerPå`.
- [ ] Omregnet årsinntekt fra inntektsmeldingen fastsettes etter de samme reglene som Spleis bruker i dag, og 6G-begrensningen er den samme.
- [ ] Samme rettighetskategori-ID og samme sett med arbeidsgiver og inntektsmelding gir den gjeldende ID-en uten nye kall.
- [ ] En ny input gir en ny automatisk avgjørelse med ny ID.
- [ ] En annen hovedkategori enn Arbeidstaker eller Selvstendig næringsdrivende gir ubesvart behov, og feilen logges.
- [ ] Feil fra Spedisjon eller sp-rettighetskategori gir ubesvart behov, og feilen logges.
- [ ] `SykepengegrunnlagResultat` løses med alle feltene i specen. `harAkseptabeltAvvik` er `null` til [04](04-avviksvurdering.md) er ferdig.
- [ ] Integrasjonstester på rapiden dekker løsningene, idempotens, ny input og feil. De bruker falske klienter og Postgres i Testcontainers.
