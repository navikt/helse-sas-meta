---
name: readme
description: Bruk når du skriver eller gjennomgår en README, eller vurderer å oppdatere README som del av en kodeendring. Hold appens formål og integrasjoner på overordnet nivå.
---

# README på overordnet nivå

README gir leseren oversikt over hva appen gjør, og hvordan den henger sammen med andre tjenester. Den er ikke en endringslogg eller en detaljert kontrakt.

## Innhold og detaljnivå

- Beskriv appens ansvar og hvilke tjenester den samarbeider med.
- Forklar integrasjonene grovt: hvem appen mottar data fra, hva den henter, og hvem den sender resultater til.
- Behold relevant informasjon om å komme i gang, kjøre appen og kontakte teamet.
- Bruk lenker til eksisterende detaljdokumentasjon når leseren trenger mer enn oversikten.

Feltkrav, valideringsregler, klassenavn, tilstandsnavn og tekniske detaljer i meldingsflyten hører ikke hjemme i README. Det gjør heller ikke akseptansekriterier, midlertidige deploy-forutsetninger eller status for en ticket.

## Når koden endres

1. Les README og vurder om endringen påvirker appens overordnede ansvar, integrasjoner eller hvordan utviklere kommer i gang.
2. Oppdater bare det som faktisk har endret seg på dette nivået. En kodeendring krever ikke i seg selv en README-endring.
3. La kode og tester beskrive detaljert oppførsel. Oppdater eksisterende kontraktdokumentasjon ved behov. Før deploy-forutsetninger og akseptansekriterier i issuet som eier arbeidet.
4. Les diffen. Hver ny opplysning i README skal hjelpe leseren å forstå eller ta i bruk appen, ikke forklare implementasjonen av den siste ticketen.

## Eksempel på nivå

Passende: «Appen mottar behov om opptjeningsvurdering fra Spleis og henter arbeidsforhold før den svarer.»

For detaljert: «`OpptjeningsvurderingRiver` krever `Opptjeningsvurdering.rettighetskategoriId` og ignorerer behov der feltet mangler eller er `null`.»
