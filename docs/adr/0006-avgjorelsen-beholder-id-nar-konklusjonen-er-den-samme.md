---
status: til vurdering
---

# En avgjørelse beholder ID-en så lenge konklusjonen er den samme, og nye vurderinger føyes til

sp-rettighetskategori skiller mellom en avgjørelse og vurderingene bak den. Avgjørelsen er konklusjonen, altså hovedkategorien og tilleggskategoriene, og har rettighetskategori-ID-en. En vurdering er én gjennomgang av faktaene: hvilke søknader som ble brukt, når, med hvilken versjon av koden og hva resultatet ble. Kommer det nye fakta, for eksempel en ny søknad med samme skjæringstidspunkt, vurderer tjenesten på nytt. Gir vurderingen samme konklusjon som gjeldende avgjørelse, føyes den til avgjørelsen, og ID-en blir den samme. Bare en ny konklusjon eller en overstyring fra saksbehandler gir en ny avgjørelse med ny ID.

Grunnen er at vi vil kunne vise hvilke fakta som lå til grunn, uten at hver ny fakta gir ringvirkninger i Spleis og domenetjenestene. Nye fakta må vurderes, ellers kan vi ikke si at de ble sett på. Men når konklusjonen er den samme, er det ingen grunn til at Spleis og domenetjenestene skal få en ny ID og selv finne ut om den betyr noe annet enn den gamle.

## Eksempel

1. En arbeidstakersøknad kommer inn. sp-rettighetskategori avgjør Arbeidstaker med ID 1. Opptjening bruker ID 1, henter arbeidsforhold fra Aa-registeret og lager opptjeningsvurdering 1.
2. En arbeidstakersøknad fra en annen arbeidsgiver kommer inn med samme skjæringstidspunkt. sp-rettighetskategori vurderer begge søknadene, kommer igjen til Arbeidstaker og føyer vurderingen til avgjørelse 1.
3. Spleis vilkårsprøver på nytt og sender ID 1 til opptjening, samme ID som sist. Hva opptjening gjør da, er et åpent spørsmål (se under).

Avgjørelse 1 viser nå begge vurderingene. For et vedtak fattet på tidspunktet T viser vi vurderingene fram til T.

## Vurderte alternativer

- **Ny avgjørelse for hvert nytt søknadssett.** Det står i specen i dag. Da er sporingen enkel, fordi hver avgjørelse har ett søknadssett. Men Spleis og hver domenetjeneste får nye ID-er som ofte betyr det samme som før, og må hver for seg avgjøre om de skal vurdere på nytt. Opptjening må da også registrere at den gjenbrukte en vurdering mot en ny ID, ellers mister vi sporingen der i stedet.
- **Gjenbruke avgjørelsen uten å registrere den nye vurderingen.** Det er enklest, men da viser avgjørelsen bare faktaene fra første gang. Vi kan ikke vise at den nye søknaden ble vurdert. Opptjening gjør i praksis dette i dag når kategorien er den samme.

## Konsekvenser

- sp-rettighetskategori lagrer avgjørelser og vurderinger hver for seg. I dag er hver avgjørelse én rad med søknadssettet sitt.
- Disse reglene i specen endres: «Samme søknadssett gir gjeldende ID tilbake. Et nytt søknadssett gir en ny automatisk avgjørelse.» Nytt søknadssett gir en ny vurdering, og en ny avgjørelse bare når konklusjonen endres.
- Det første behovet etter backfill gir ikke lenger alltid en ny avgjørelse. Gir vurderingen samme konklusjon, føyes den til avgjørelsen fra backfill, og Spleis beholder ID-en.
- Spleis trenger ingen endring. Den får bare samme ID tilbake oftere.
- Vi sammenligner med gjeldende avgjørelse. Går konklusjonen fra A til B og tilbake til A, blir det tre avgjørelser, ikke en tilbakevending til den første.
- «Samme konklusjon» betyr samme hovedkategori og samme tilleggskategorier. Når vi legger til tilleggskategorier, endrer det hva som teller som en ny konklusjon.

## Åpne spørsmål

- **Skal domenetjenestene følge samme mønster?** Ett alternativ er at de bare vurderer på nytt når sine egne fakta endres, og bare lager en ny vurdering med ny ID når konklusjonen endres. Da vurderer ikke opptjening på nytt fordi rettighetskategorien har fått en ny vurdering. Om opptjening skal hente arbeidsforhold fra Aa-registeret på nytt ved ny vilkårsprøving, blir en egen regel i opptjening, og en ny henting med samme resultat føyes til den eksisterende opptjeningsvurderingen. Det må vurderes for hver domenetjeneste, blant annet fordi en vurdering kan være gjort manuelt.
- **Når gjeldende avgjørelse er fra saksbehandler** og en ny automatisk vurdering kommer til en annen konklusjon, skal ikke den automatiske vurderingen overstyre saksbehandleren i det stille. Hva skal skje i stedet: varsel i Spleis, ny oppgave, eller at behovet blir liggende?
- **Når vurderingen gir samme konklusjon som en saksbehandleravgjørelse**, føyes den til som en bekreftelse. Skal saksbehandleren få vite om det?
- **Ny kodeversjon som gir samme konklusjon**: skal den gi en ny vurdering når søknadssettet er det samme, eller bare når faktaene endres?
- **Sporing fra vedtaket**: holder det å finne vurderingene ut fra tidspunktet for vedtaket, eller skal Spleis vise til en bestemt vurdering?
