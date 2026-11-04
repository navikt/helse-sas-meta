# Spleis lagrer versjonen av graderte andre ytelser, og sp-andre-ytelser regner ut trekket

Saksbehandler fordeler en dag for én yrkesaktivitet mellom sykdom, arbeid og graderte andre ytelser. sp-andre-ytelser eier fordelingene og historikken som en hendelseslogg per person og yrkesaktivitet. Hver hendelse har en `versjon`. Spleis lagrer ikke fordelingene.

Når Spleis beregner en periode, sender den behovet `GraderteAndreYtelserForBeregning` med beregningsperioden. Løsningen gir per yrkesaktivitet den gjeldende `versjon` og, for hver dag i perioden, trekket fra sykdomsgraden og sykdomsgraden saksbehandler så da dagen ble fordelt. Spleis lagrer versjonen for behandlingens egen yrkesaktivitet på endringen i behandlingen og bruker trekket som `trekkFraSykdomsgrad` i `Økonomi`. Spleis regner selv ut den justerte sykdomsgraden, fordi Spleis eier sykdomsgraden.

Ansvaret er delt etter hvem som vet hva. Bare sp-andre-ytelser vet om saksbehandler tok ytelsene fra sykdommen eller fra arbeidet, så den regner ut trekket. Bare Spleis vet hva sykdomsgraden er nå, så den trekker fra og lager et varsel når sykdomsgraden ikke er den saksbehandler så.

Sporingen ligger på endringen i behandlingen, ikke på hver dag. Alle dagene i en endring kommer fra samme løsning, så versjonen sier nøyaktig hvilke fordelinger behandlingen bygde på. Totalgraden avhenger også av de andre yrkesaktivitetene, men Spleis beregner overlappende perioder samlet, og endringene i de andre behandlingene lagrer sine egne versjoner. Historikken per dag finnes i hendelsesloggen i sp-andre-ytelser. Dette skiller seg fra ADR 0005, der én vurdering gjelder personen og må kopieres til nye behandlinger. Her gjelder fordelingen én yrkesaktivitet, og Spleis spør på nytt hver gang den beregner.

Graderte andre ytelser ligger heller ikke på sykdomstidslinjen. De endrer bare graden, ikke hva dagen er, så skjæringstidspunkt og arbeidsgiverperiode påvirkes ikke.

## Vurderte alternativer

- **To behov med en ID til et øyeblikksbilde.** Det første behovet gir en ID for innholdet i perioden, og det andre slår opp gradene med ID-en. Det følger ADR 0001 tettere, men gir en ekstra runde på rapiden og krever at sp-andre-ytelser lager og husker øyeblikksbilder. Versjonen i hendelsesloggen gir den samme sporingen uten noe nytt.
- **Spleis regner ut trekket fra gradene til ytelsene.** Da må Spleis vite om ytelsene er tatt fra sykdom eller arbeid, og den må kjenne reglene for fordelingen. Hvis ytelser senere kan overlappe, må Spleis også endres. Med trekket i løsningen merker ikke Spleis en slik endring.
- **sp-andre-ytelser sender justert sykdomsgrad.** Da bruker Spleis en grad som kan være utdatert hvis sykdomsgraden er endret etter fordelingen, uten å merke det.
- **Kilde per dag, som i `Beløpstidslinje`.** Det trengs når Spleis slår sammen data fra flere meldinger. Her byttes hele perioden ut med én løsning, så en kilde per dag sier ikke noe mer enn versjonen på endringen.
- **Versjonene for alle yrkesaktivitetene på hver endring.** Det ville samlet sporingen for totalgraden på ett sted, men det gjentar det de andre behandlingene allerede lagrer. Endringen beskriver da også data som ikke hører til behandlingen.
- **Graderte andre ytelser som dagtype på sykdomstidslinjen.** Det ville blandet grad inn i en tidslinje som sier hva dagen er, og påvirket skjæringstidspunkt og arbeidsgiverperiode.

## Konsekvenser

- Spleis kan ikke beregne en periode uten svar fra sp-andre-ytelser. Hvis appen ikke svarer, blir behovet liggende til en påminnelse sender det på nytt. sp-andre-ytelser må derfor svare i prod før Spleis tar behovet i bruk.
- Spleis lagrer `trekkFraSykdomsgrad` per utbetalingsdag, slik at et vedtak kan leses uten å spørre sp-andre-ytelser. Gamle data uten feltet leses som 0.
- Behandlinger uten versjon har ingen graderte andre ytelser. Ingen versjoner fylles inn i ettertid.
- Hvis graderte andre ytelser senere kan overlappe hverandre, endres bare valideringen i sp-andre-ytelser. Kontrakten med Spleis er den samme.
