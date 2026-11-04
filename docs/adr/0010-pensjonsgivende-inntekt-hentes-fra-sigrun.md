# Pensjonsgivende inntekt hentes fra Sigrun i sp-inntekt, ikke fra søknaden

I dag henter sykepengesoknad-backend pensjonsgivende inntekt for tre år fra Sigrun og legger tallene på søknaden. Spleis beregner grunnlaget for selvstendig næringsdrivende etter § 8-35 ut fra dem. I den nye løsningen henter sp-inntekt pensjonsgivende inntekt fra Sigrun selv og legger den i inntektsavklaringen. sp-sykepengegrunnlag bruker bare disse tallene. Tallene på søknaden brukes ikke, og vi sammenligner ikke med dem.

Grunnen er at inntekten er rå opplysninger som hører til inntektsavklaringen, og at sp-inntekt må kunne hente den på nytt, også for Inaktiv og kombinerte kategorier, som ikke har en næringssøknad med tallene. Én kilde gjør også at saksbehandler kan se og korrigere den samme inntekten som grunnlaget bygger på.

## Vurderte alternativer

- **Bruke tallene på søknaden først og hente fra Sigrun i skyggen**, og bytte når avvikene i loggen har vært borte en stund. Det gir samme resultat som i dag fra første dag, men vi må holde to kilder ved like og ta stilling til hver forskjell.
- **Fortsette med søknaden.** Det virker bare for næringssøknader, og tallene kan ikke hentes på nytt.

## Konsekvenser

- Grunnlaget for selvstendig næringsdrivende kan bli et annet enn det Spleis ville kommet fram til, når Sigrun svarer noe annet enn da søknaden ble laget. For arbeidstakere er det ingen endring.
- Reglene for år som mangler, er ulike i sykepengesoknad-backend og bakrommet i dag. sp-inntekt starter med året før skjæringstidspunktet, hopper over år i starten som ikke er fastsatt ennå (`PGIF-006`), og bruker de tre nyeste årene etter det. Et år med svaret «ingen inntekt» (`PGIF-008`) regnes som fastsatt med 0 kr. Regelen gjelder inntil videre. Vi må avstemme den med team flex når vi implementerer, fordi sykepengesoknad-backend bruker egne regler for de samme årene når den lager spørsmålene i søknaden.
- Beregningen etter § 8-35 flyttes fra Spleis (`SelvstendigFaktaavklartInntekt`) til sp-sykepengegrunnlag.
- sp-inntekt trenger tilgang til Sigrun.
