---
status: akseptert
---

# Domenetjenestene lagrer opplysningene de bruker, ikke dokumentet

**Forfattere:** Håvard Andersen (@nav-havard), Christian Skovborg Gule (@chsko), Eirik Gallefoss (@ejgal)

En domenetjeneste som bygger en beregning eller vurdering på et dokument i Spedisjon, for eksempel en inntektsmelding eller en søknad, lagrer bare opplysningene den bruker. Den lagrer dem strukturert, sammen med ID-en til dokumentet og tidspunktet den hentet det. Den lagrer ikke en kopi av hele dokumentet. Vil noen se hele dokumentet, for eksempel Speil, henter de det fra Spedisjon med ID-en.

Dokumentene i Spedisjon endres ikke, så ID-en er nok til å finne igjen det tjenesten leste. Beslutningen gjelder derfor bare dokumenter som har en egen ID og ikke endres, for vår del inntektsmeldinger og søknader. De strukturerte opplysningene gjør det mulig å se hva en beregning bygger på uten å tolke dokumentet på nytt. Tjenesten lagrer da heller ikke flere personopplysninger enn den trenger.

Tjenesten lagrer hele den delen av dokumentet den bruker, ikke bare tallene beregningen ender med. sp-sykepengegrunnlag lagrer for eksempel hele blokken med pensjonsgivende inntekt fra søknaden, både lønnsinntekt og næringsinntekt per år, selv om beregningen etter § 8-35 bare bruker summen. Spleis lagrer i dag bare summen per år, og da går resten tapt.

## Opplysninger fra registre

Opplysninger tjenesten henter fra et register, for eksempel inntektene fra a-ordningen i inntektskomponenten eller den pensjonsgivende inntekten i Sigrun, har ingen ID vi kan slå opp på senere, og registeret kan svare noe annet neste gang. Her lagrer tjenesten hele svaret den fikk, i en egen tabell. Raden har en egen ID, tidspunktet for oppslaget og det tjenesten spurte om. Opplysningene beregningen bruker, lagres strukturert i beregningen eller vurderingen, med ID-en til oppslaget. sp-forsikring gjør det samme med råkopien fra Infotrygd.

Presiseringen ble gjort 19. november 2026.

## Vurderte alternativer

- **Lagre en kopi av hele dokumentet.** Tjenesten har da alt hvis den senere trenger flere felter. Men den lagrer mange personopplysninger den ikke bruker, og sp-sykepengegrunnlag bruker bare en liten del av inntektsmeldingen. Trenger tjenesten flere felter senere, kan den hente dokumentet fra Spedisjon på nytt.
- **Lagre bare opplysningene vi bruker, også fra registre.** Da kan vi ikke vise hva registeret svarte hvis svaret endrer seg, og vi kan ikke hente det samme svaret på nytt.
- **Lagre bare ID-en og hente dokumentet ved behov.** Det lagrer minst, men da må dokumentet tolkes på nytt hver gang noen vil se hva beregningen bygger på, og tolkningen kan ha endret seg.

## Konsekvenser

- sp-sykepengegrunnlag lagrer orgnummer, beløp og mottatt-tidspunkt fra inntektsmeldingen, og hele blokken med pensjonsgivende inntekt fra søknaden, med dokument-ID og tidspunktet for oppslaget.
- sp-sykepengegrunnlag lagrer hele svaret fra inntektskomponenten i en egen tabell. Grunnlaget har ID-en til oppslaget og de månedlige inntektene for arbeidsgiverne det bruker.
- Backfill henter dokumentene fra Spedisjon med ID-ene og lagrer de samme opplysningene som når tjenesten beregner selv.
- Speil henter hele inntektsmeldingen eller søknaden fra Spedisjon når den skal vises.
- Trenger tjenesten et nytt felt fra et dokument, må den hente dokumentene fra Spedisjon på nytt for grunnlag som allerede er lagret.
