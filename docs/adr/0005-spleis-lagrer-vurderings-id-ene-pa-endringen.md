# Spleis lagrer vurderings-ID-ene på endringen, ikke avslagsdagene

Saksbehandler skal kunne avslå dager etter løpende vilkår, først oppholdskravet i § 8-9. sp-avslagsdager eier vurderingene og historikken deres. Spleis lagrer ikke avslagsdagene. Når Spleis beregner en periode, sender den behovet `Avslagsdager` med beregningsperioden. Løsningen gir ID-ene til vurderingene som gjelder for dager i perioden, også vurderinger der vilkåret er oppfylt, og dagene som er avslått, med vurderings-ID og vilkårskoder. Spleis bytter ut avslagsdagene med kilden `sp-avslagsdager` i beregningsperioden med dagene fra løsningen og lagrer vurderings-ID-ene på endringen i behandlingen. Byggerne av utbetalingstidslinjen leser avslagstidslinjen som før.

Dette er det samme mønsteret som for graderte andre ytelser (ADR 0007). Spleis spør på nytt hver gang den beregner, så også perioder som opprettes etter at saksbehandler har vurdert dagene, får avslaget. Avslagsdagen gjelder personen, ikke én yrkesaktivitet, men sp-avslagsdager svarer for personen, og Spleis beregner overlappende perioder samlet.

En vurdering endres aldri. En omgjøring er en ny vurdering med ny ID. ID-ene på endringen sier derfor nøyaktig hvilke vurderinger behandlingen bygde på, og utfallet, svarene og begrunnelsen finnes bare ett sted. Når saksbehandler vurderer dager, sender sp-avslagsdager `avslagsdager_endret` med den første dagen som er vurdert. Spleis revurderer fra den dagen, slik den gjør når graderte andre ytelser er endret.

En dag har høyst én avslagsårsak på avslagstidslinjen. Et avslag for oppholdskrav må gjøres om i sp-avslagsdager før saksbehandler kan overstyre dagen. Et avslag fra saksbehandler (`AvslattMeldingTilNavdag`) må fjernes før dagen kan avslås for oppholdskrav. Speil sperrer begge deler. Kommer det likevel en konflikt, kaster Spleis en feil før noe er endret, og hendelsen blir ikke behandlet. Maskinelle avvisninger, for eksempel etter maksdato, legges på den avviste dagen som før og kan stå sammen med `Oppholdskrav`.

## Vurderte alternativer

- **Spleis lagrer koblingen mellom dag og vurderings-ID på personen og spør med ID-ene.** Det var forrige versjon av denne ADR-en. Behovet sendes da bare for personer med vurderinger, så sp-avslagsdager blir ikke en avhengighet for alle beregninger. Men Spleis må holde en kopi av hvilken vurdering som gjelder for hver dag i takt med sp-avslagsdager, og koblingen må inn i person-JSON-en.
- **Spleis lagrer avslagsdagene med begrunnelse.** Da har Spleis en egen kopi av utfallet. Det bryter med mønsteret fra ADR 0001.
- **Løsningen gir bare dagene som er avslått.** Da lagrer ikke endringen vurderinger der vilkåret er oppfylt, og det går ikke å se i ettertid at en behandling bygde på dem.
- **Overstyre via spesialist med en ny dagtype i `OverstyrTidslinje`.** Det krever minst kode, men da havner svarene, lovreferansen og begrunnelsen i en overstyring av tidslinjen, og ingen domeneapp eier vurderingen.
- **Løsningen erstatter saksbehandlers avslag, eller siste overstyring vinner.** Da kan en dag skifte avslagsårsak uten at saksbehandler har tatt stilling til det forrige avslaget. Med én avslagsårsak per dag må saksbehandler rydde først.
- **Spleis beholder saksbehandlers avslag og gir et varsel.** Perioden kan da beregnes videre, men sp-avslagsdager og Spleis er uenige om dagen uten at noe stopper saken.
- **Flytte hele avslagstidslinjen til sp-avslagsdager.** Avslag for melding til Nav (`AvslattMeldingTilNavdag`) har ingenting med § 8-9 å gjøre og settes fortsatt gjennom overstyring av tidslinjen.

## Konsekvenser

- Spleis kan ikke beregne en periode uten svar fra sp-avslagsdager. Hvis appen ikke svarer, blir behovet liggende til en påminnelse sender det på nytt. sp-avslagsdager må derfor svare for alle personer før Spleis tar behovet i bruk.
- Bare løsningen på behovet kan legge inn eller fjerne avslagsdager med kilden `sp-avslagsdager`. Spleis avviser en overstyring av tidslinjen som treffer en slik dag.
- Spleis avviser en løsning som vil avslå en dag som allerede har et avslag fra saksbehandler. Perioden blir stående i `AvventerHistorikk` til vurderingen er gjort om eller avslaget er fjernet, og påminnelsene sender behovet på nytt så lenge.
- Avslagsdager med kilden `sp-avslagsdager` utenfor beregningsperioden blir stående til en beregning som dekker dem.
