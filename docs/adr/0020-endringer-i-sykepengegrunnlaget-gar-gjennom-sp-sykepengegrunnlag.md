---
status: til vurdering
---

# Endringer i sykepengegrunnlaget går gjennom sp-sykepengegrunnlag

**Forfattere:** Håvard Andersen (@nav-havard), Camilla Bårnes Roark (@cbroark), Eirik Gallefoss (@ejgal), Martin Remøy Solheim (@MartinMekk), Morten Jonassen Netland (@mnetland), Preben Aandahl (@paandahl), Øydis Kind Refsum (@oydisrefsum), Jørgen Engesvold (@engesvold)

Et sykepengegrunnlag kan endres etter vilkårsprøvingen uten at perioden blir vilkårsprøvd på nytt. Det skjer ved korrigert inntektsmelding, overstyring av inntekt, overstyring av arbeidsforhold, skjønnsfastsettelse og grunnbeløpsregulering. Signalene om slike endringer går til sp-sykepengegrunnlag. Tjenesten lager et nytt sykepengegrunnlag med ny ID og sender `endret_sykepengegrunnlag` til Spleis. Spleis får dermed endringer i grunnlaget fra én inngang, og sp-sykepengegrunnlag eier hele historikken for grunnlaget.

Spesialist og Spregulering sender signalene direkte til sp-sykepengegrunnlag, fordi de allerede kjenner fødselsnummeret og skjæringstidspunktet. Det er bare Spleis som vet hvilket skjæringstidspunkt en korrigert inntektsmelding gjelder for, så Spleis sender signalet om korrigert inntektsmelding når den har koblet meldingen til et skjæringstidspunkt.

## Vurderte alternativer

- **Spleis behandler endringene og ber om et nytt grunnlag.** Spleis tar imot alle endringene som i dag og sender behovet `Sykepengegrunnlag` på nytt. Det endrer lite i Spesialist og Spregulering, men Spleis blir mellomledd for opplysninger den ikke skal eie, og hver ny type endring krever en endring i Spleis. Dette er det samme som ADR 0005 forkaster for rettighetskategorien.

## Konsekvenser

- Spleis behandler `endret_sykepengegrunnlag` på samme måte som andre endrede vurderinger og revurderer perioden.
- I skyggedrift behandler ikke Spleis `endret_sykepengegrunnlag`. Spleis behandler endringene selv som i dag og fjerner sykepengegrunnlag-ID-en når inntektsgrunnlaget endres uten ny vilkårsprøving. sp-sykepengegrunnlag sammenligner sitt nyeste grunnlag med `sykepengegrunnlagsfakta` i godkjenningsbehovet.
- Avviksvurderingen og skjønnslogikken blir i Spinnvill og Spesialist inntil videre. sp-sykepengegrunnlag lagrer bare beløpene og begrunnelsen fra skjønnsfastsettelsen.
- Hvert sykepengegrunnlag har en kilde: `vilkårsprøving`, `korrigert_inntektsmelding`, `overstyring_inntekt`, `overstyring_arbeidsforhold`, `skjønnsfastsettelse`, `grunnbeløpsregulering`, `spleis` (backfill) eller `infotrygd`.
