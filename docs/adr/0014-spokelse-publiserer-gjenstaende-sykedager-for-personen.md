# Spøkelse publiserer gjenstående sykedager for personen på en egen topic

Team-esyfo vil vite hvor mange sykedager en person har igjen, og hva maksdatoen er. Det gjelder også når siste utbetaling er i Infotrygd. I dag utleder de tallet fra `tbd.utbetaling`, og den har bare tallet slik det var ved hver utbetaling i ny løsning. Tallet blir feil så snart Infotrygd har en senere utbetaling. Personer som bare har sykepenger fra Infotrygd, får ikke noe tall i det hele tatt.

Vi har bestemt at spøkelse publiserer det tallet som gjelder for personen nå, på en egen topic. Spøkelse bruker den samme beregningen som `POST /gjenstaende-sykedager` (navikt/sas-issues#132). Det gjør at topicen og oppslaget alltid gir samme svar, og at reglene for å sette sammen ny løsning og Infotrygd bare finnes ett sted.

- Topicen er en strøm av hendelser, ikke compacted. Nøkkelen er fødselsnummer, så meldingene for én person kommer i rekkefølge. Konsumenten holder selv rede på tilstanden den trenger, og den siste meldingen for en person er den som gjelder.
- Verdien er svaret fra oppslaget (`grunnlag`, `gjenståendeDager` og `vurdertTilOgMed`) og i tillegg `tidspunkt`.
- Spøkelse beregner på nytt ved `utbetaling_utbetalt`, `utbetaling_uten_utbetaling`, annullering og `infotrygdendring` for alle personer. Spøkelse lytter direkte på `infotrygdendring`, fordi spleis ikke sier fra når bare maksdatoen i Infotrygd endres. Det sendes bare en melding når resultatet er endret siden forrige melding for personen.
- Det kommer ingen melding når personen får ny rett fordi tiden går. Konsumenten regner selv ut ny rett fra `vurdertTilOgMed`, slik det står i OpenAPI-beskrivelsen.

## Vurderte alternativer

- **Gjenstående sykedager på hendelsen om fattet vedtak (`tbd.vedtak`) eller fortsatt bruk av `tbd.utbetaling`.** Sporbar kjenner bare ny løsning. Et tall som gjelder ved én utbetaling, er noe annet enn et tall som gjelder for personen.
- **En egen Infotrygd-hendelse ved siden av `tbd.utbetaling`.** Da må konsumenten selv sette sammen to kilder og kunne reglene for maksdato. Det er akkurat dette #132 flytter til oss.
- **Spleis som avsender.** Spleis kjenner ikke personer som bare har sykepenger fra Infotrygd, og har bare Infotrygd-historikken fra siste gang den ble hentet.
- **En ny app.** Det ville gitt ny drift for noe spøkelse allerede har: utløserne, oppslaget mot Infotrygd og beregningen.
- **`tbd.boo` og oppslag.** Boo gir falske positiver, for eksempel første gang spleis henter Infotrygd-historikk, og sendes ikke ved vedtak uten utbetaling. I tillegg måtte konsumenten gjort et synkront kall for hvert signal.

## Konsekvenser

- Spøkelse må lagre siste publiserte resultat per person for å kunne sende bare endringer.
- Når siste utbetaling er i Infotrygd, kaller spøkelse spleis-api for hver relevant hendelse, ikke bare ved oppslag.
- `tbd.boo` og `tbd.utbetaling` er uendret.
