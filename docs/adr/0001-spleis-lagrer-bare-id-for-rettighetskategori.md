# Spleis lagrer bare ID-en til rettighetskategorien

Den nye tjenesten sp-rettighetskategori avgjør rettighetskategorien én gang per skjæringstidspunkt. Spleis lagrer bare ID-en til avgjørelsen, ikke hovedkategorien. Når Spleis trenger kategorien, slår den opp med ID-en. Det gjør den i `AvventerVilkårsprøving` for å forkaste kombinerte kategorier, og i `AvventerHistorikk` for å sjekke at kategorien stemmer med periodens yrkesaktivitetstype. Vi følger samme mønster som opptjening i sp-vilkarsproving.

Grunnen er at saksbehandler senere skal kunne overstyre rettighetskategorien. Da lagrer sp-rettighetskategori overstyringen som en ny avgjørelse med ny ID. Avgjørelsen og historikken har bare én eier. Spleis får den nye ID-en og vurderer saken på nytt, uten å ha en egen kopi av kategorien som kan bli utdatert. Spleis sender også ID-en videre til opptjening, slik at sp-vilkarsproving kan slå opp kategorien selv.

## Vurderte alternativer

- **Spleis lagrer hovedkategorien i vilkårsgrunnlaget.** Det er enklere å lese og krever ikke oppslag. Men da finnes kategorien to steder. En overstyring må føres inn begge steder, og andre tjenester må hente kategorien fra Spleis.

## Konsekvenser

- Spleis kan ikke bruke rettighetskategorien uten å spørre sp-rettighetskategori. Hvis tjenesten ikke svarer, blir behovet liggende, og en påminnelse sender det på nytt.
- Perioder som gikk gjennom vilkårsprøving før vi skrudde på `AvventerRettighetskategori`, har ingen ID. Spleis behandler dem ut fra yrkesaktivitetstypen, som før. Vi fyller ikke inn ID-er i ettertid.
