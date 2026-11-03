# Spleis lagrer vurderings-ID per dag, ikke avslagsdagene

Saksbehandler skal kunne avslå dager etter løpende vilkår, først oppholdskravet i § 8-9. sp-avslagsdager eier vurderingene og historikken deres. Spleis lagrer bare hvilken vurdering som gjelder for hver dag. Det samme mønsteret brukes for rettighetskategori (ADR 0001) og opptjening. Spleis får vurderings-ID-en og alle dagene som er vurdert, i meldingen `avslagsdager_endret`. Når Spleis beregner, spør den sp-avslagsdager med behovet `Avslagsdager` og vurderings-ID-ene. Løsningen gir dagene som er avslått, og Spleis fyller avslagstidslinjen på behandlingen fra den, med kilden `sp-avslagsdager`. Byggerne av utbetalingstidslinjen leser avslagstidslinjen som før.

En vurdering endres aldri. En omgjøring er en ny vurdering med ny ID. ID-en er derfor like god som et øyeblikksbilde av hva et vedtak bygde på, og utfallet, svarene og begrunnelsen finnes bare ett sted.

Avslagsdagen gjelder personen, ikke én yrkesaktivitet. Derfor lagrer Spleis koblingen mellom dag og vurderings-ID på personen og kopierer den til behandlinger som overlapper, også behandlinger som opprettes etter meldingen.

## Vurderte alternativer

- **Spleis lagrer avslagsdagene med begrunnelse og spør med periode.** Det var første versjon av denne ADR-en. Da har Spleis en egen kopi av utfallet, og behovet må spørre om alt for perioden hver gang. Det bryter med mønsteret fra ADR 0001.
- **Meldingen inneholder bare dagene som er avslått.** Da vet ikke Spleis hvilke avslag som skal fjernes når saksbehandler gjør om en vurdering. Meldingen inneholder derfor alle dagene som er vurdert, og utfallet hentes med behovet.
- **Overstyre via spesialist med en ny dagtype i `OverstyrTidslinje`.** Det krever minst kode, men da havner svarene, lovreferansen og begrunnelsen i en overstyring av tidslinjen, og ingen domeneapp eier vurderingen.
- **Flytte hele avslagstidslinjen til sp-avslagsdager.** Avslag for melding til Nav (`AvslattMeldingTilNavdag`) har ingenting med § 8-9 å gjøre og settes fortsatt gjennom overstyring av tidslinjen.

## Konsekvenser

- Spleis kan ikke beregne en periode med vurderings-ID-er uten svar fra sp-avslagsdager. Hvis appen ikke svarer, blir behovet liggende til en påminnelse sender det på nytt.
- Bare løsningen på behovet kan legge inn eller fjerne avslagsdager med kilden `sp-avslagsdager`. En overstyring av tidslinjen må la dem være.
- Spleis får en ny kobling mellom dag og vurderings-ID på personen.
