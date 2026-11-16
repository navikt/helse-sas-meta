# Vi bygger ikke sp-inntekt, og hver tjeneste henter inntektene den trenger

**Forfattere:** Håvard Andersen (@nav-havard), Eirik Gallefoss (@ejgal), Christian Skovborg Gule (@chsko), Magdalini Fotiadou (@magdalinif)

Vi lager ikke sp-inntekt. Inntekt blir ikke en egen domenetjeneste, og Spleis får ikke tilstanden `AvventerInntektsavklaring`. Hver tjeneste henter inntektene den trenger, fra kilden, når den trenger dem, og lagrer dem selv.

Vi hadde to grunner til å lage sp-inntekt:

- **Deaktivering av arbeidsforhold skulle kunne endre rettighetskategorien.** Det gjelder bare et smalt tilfelle: personen sender søknad som selvstendig næringsdrivende, og vi finner arbeidsinntekt i a-ordningen i månedene før. Vi løser det når vi avgjør kombinerte kategorier. Flyten blir enklere uten at deaktiveringen ligger i en egen tjeneste og derfra endrer kategorien fra kombinert til selvstendig næringsdrivende.
- **sp-rettighetskategori og sp-sykepengegrunnlag skulle bruke de samme dataene.** De trenger ikke de samme dataene. Rettighetskategorien trenger trolig bare pensjonsgivende inntekt for året før, mens sykepengegrunnlaget etter § 8-35 trenger de tre siste årene. Det samme gjelder a-ordningen: Vi trenger ikke de fire siste månedene med arbeidsinntekt for å se om en person som bare søker som selvstendig næringsdrivende, er kombinert.

En felles tjeneste ville gitt en ekstra tilstand i Spleis, et nytt behov, backfill og en ID som andre tjenester må utvide etter behov. Det er mye kompleksitet for lite gevinst.

Beslutningen kan gjøres om. Den hindrer oss ikke i å lage sp-inntekt senere. Gjør vi det, kjører sp-inntekt backfill av inntektene fra sp-sykepengegrunnlag, som da har lagret inntektene grunnlagene bygger på, og ikke fra Spleis.

## Vurderte alternativer

- **sp-inntekt som et lager for rådata.** Spleis sender inntektsmelding-ID-er og søknads-ID-en i en ny tilstand før `AvventerRettighetskategori` og får en inntektsavklarings-ID tilbake. sp-inntekt svarer på `InntekterForSykepengegrunnlag` i stedet for sparkel-inntekt, og andre tjenester kan be sp-inntekt utvide dataene bak ID-en. Dette var forslaget vi grillet før vi landet på denne beslutningen. Det gir én kilde til inntektene per skjæringstidspunkt, men krever en ny tjeneste, ruting av behov mellom sp-inntekt og sparkel-inntekt, ny tilstand og backfill. Ingen av tjenestene som skulle bruke dataene, trenger det samme utvalget.
- **sp-inntekt som eier av alle inntektene.** Den samme tjenesten, men i tillegg skulle sp-inntekt hente fra Sigrun og Aa-registeret og ta imot saksbehandlers korrigerte inntekter og aktivering og deaktivering av arbeidsforhold. Det er enda større enn alternativet over, av de samme grunnene.

## Konsekvenser

- Tilstandene i Spleis blir `AvventerBlokkerendePeriode → AvventerRettighetskategori → AvventerSykepengegrunnlag → AvventerVilkårsprøving`. Behovet `Rettighetskategori` får ikke noen inntektsavklarings-ID.
- sp-sykepengegrunnlag henter inntektene selv og lagrer dem sammen med sykepengegrunnlaget. Det gjelder inntektsmeldingene fra Spedisjon med ID-ene fra Spleis, a-ordningen for beregningsperioden og sammenligningsgrunnlaget, og pensjonsgivende inntekt fra Sigrun.
- sp-rettighetskategori henter inntektene den trenger, når vi avgjør kombinerte kategorier, frilanser og Inaktiv. Det kan for eksempel være pensjonsgivende inntekt for året før fra Sigrun eller de siste månedene fra a-ordningen.
- Hvem som eier saksbehandlers korrigerte inntekter og aktiverte og deaktiverte arbeidsforhold, avgjør vi når vi spesifiserer sp-sykepengegrunnlag.
- Speil må hente inntektene fra tjenesten som brukte dem, ikke fra ett felles sted.

## Når tjenestene får ulike svar for den samme inntekten

Uten en felles tjeneste kan sp-rettighetskategori og sp-sykepengegrunnlag hente den samme inntekten på ulike tidspunkter og få ulike svar. Det skjer for eksempel når arbeidsgiveren korrigerer en a-melding, eller når Skatteetaten fastsetter pensjonsgivende inntekt for et nytt år i mellomtiden. Da kan rettighetskategorien bygge på én versjon av inntekten og sykepengegrunnlaget på en annen. Et eksempel er at kategorien blir kombinert fordi a-ordningen viste arbeidsinntekt, mens sykepengegrunnlaget senere ikke finner den samme inntekten.

Dette er ikke nytt. I dag henter Spleis, Spesialist og Spinnvill inntekt fra a-ordningen hver for seg, og sykepengesoknad-backend henter pensjonsgivende inntekt fra Sigrun. Med denne beslutningen blir det færre slike oppslag enn i dag.

Vi vurderer hvert tilfelle for seg når vi tar i bruk en ny inntekt: kan tjenestene få ulike svar, og hva skjer i så fall? Hver tjeneste lagrer svaret den fikk, med tidspunktet for oppslaget, så vi kan se hva hver avgjørelse bygger på.

Blir det viktig at alle tjenestene får samme svar, kan vi lage en intern mellomlagringstjeneste foran Sigrun og a-ordningen. Den lagrer det første svaret for en person og en periode og gir det samme svaret til alle som spør etterpå. Den skal ikke ha regler for hvilke inntekter som brukes, og blir derfor ikke det sp-inntekt skulle være.
