# Spleis lagrer bare ID-en til rettighetskategorien

Den nye tjenesten sp-rettighetskategori avgjør rettighetskategorien én gang per skjæringstidspunkt. Løsningen på behovet gir både ID-en og hovedkategorien, men Spleis lagrer bare ID-en. Hovedkategorien bruker Spleis bare i mottaket av løsningen i `AvventerRettighetskategori`, til å forkaste kombinerte kategorier før vilkårsprøvingen. Når Spleis trenger kategorien senere, slår den opp med ID-en. Det gjør den i `AvventerHistorikk` for å sjekke at kategorien stemmer med periodens yrkesaktivitetstype. Vi følger samme mønster som opptjening i sp-vilkarsproving.

Grunnen er at saksbehandler senere skal kunne overstyre rettighetskategorien. Da lagrer sp-rettighetskategori overstyringen som en ny avgjørelse med ny ID. Avgjørelsen og historikken har bare én eier. Spleis får den nye ID-en og vurderer saken på nytt, uten å ha en egen kopi av kategorien som kan bli utdatert. Spleis sender også ID-en videre til opptjening, slik at sp-vilkarsproving kan slå opp kategorien selv.

## Vurderte alternativer

- **Spleis lagrer hovedkategorien i vilkårsgrunnlaget.** Det er enklere å lese og krever ikke oppslag. Men da finnes kategorien to steder. En overstyring må føres inn begge steder, og andre tjenester må hente kategorien fra Spleis.
- **Løsningen gir bare ID-en, og `AvventerVilkårsprøving` slår opp hovedkategorien med `RettighetskategoriResultat`.** Det var planen først. Det gir en ekstra runde på rapiden for noe Spleis allerede kan få i løsningen, og Spleis må forholde seg til forkastingen i vilkårsprøvingen. Når hovedkategorien følger med i løsningen og bare brukes i mottaket, forkaster Spleis før den vilkårsprøver, uten å lagre kategorien.

## Konsekvenser

- Spleis kan ikke bruke rettighetskategorien uten å spørre sp-rettighetskategori. Hvis tjenesten ikke svarer, blir behovet liggende, og en påminnelse sender det på nytt.
- Perioder som gikk gjennom vilkårsprøving før vi skrudde på `AvventerRettighetskategori`, får en deterministisk ID fra en JSON-migrering i Spleis. sp-rettighetskategori fyller inn avgjørelsene bak dem i ettertid. Se ADR 0002.
