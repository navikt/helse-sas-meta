# 27: Skru av Spinnvill og fjerne avvik og skjønn i Spesialist

**Spec:** [Avklare sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/avklare-sykepengegrunnlag.md)

**Fase:** 4

**Repo:** `spinnvill`, `spesialist`

**Hva skal lages:** Spinnvill er skrudd av. Spesialist har ikke lenger kode for avviksvurdering eller for å skjønnsfastsette og overstyre inntekt og arbeidsforhold. Historikken for eldre overstyringer blir værende.

**Blokkeres av:** [25: Skru på togglene for fase 3](25-skru-pa-togglene-for-fase-3.md)

**Status:** klar

## Akseptansekriterier

- [ ] Ingen godkjenningsbehov i prod har `sykepengegrunnlagsfakta`.
- [ ] Spesialist tar ikke imot løsningen på `Avviksvurdering` og har ikke `VurderBehovForAvviksvurdering`.
- [ ] Spesialist bygger alltid `sykepengegrunnlagsfakta` fra sp-sykepengegrunnlag.
- [ ] Flyten for skjønnsfastsettelse og overstyring av inntekt og arbeidsforhold er fjernet. Overstyring av refusjon virker som før.
- [ ] Historikken for eldre overstyringer og begrunnelser vises fortsatt.
- [ ] Spinnvill er fjernet fra Nais, og databasen er tatt vare på eller slettet etter avtale.
