# 13: `AVVENTER_RETTIGHETSKATEGORI` i Spock og spammer

**Spec:** [Avklare rettighetskategori i sp-rettighetskategori](../../specs/avklare-rettighetskategori.md)

**Fase:** 1

**Repo:** `spock`, `spammer`

**Hva skal lages:** Spock påminner perioder i `AVVENTER_RETTIGHETSKATEGORI` etter én time, og spammer sender melding til Slack når en periode er påminnet mange ganger i tilstanden. Begge apper lister tilstandsnavnene eksplisitt, så kompilatoren i Spleis fanger dem ikke. Uten endringen havner tilstanden i `else` i Spock: Spock logger en advarsel for hver tilstandsendring og påminner først etter 12 til 30 timer. Et ubesvart behov `Rettighetskategori` blir da liggende i opptil et døgn før Spleis sender det på nytt.

**Blokkeres av:** Ingen. Endringene kan deployes før Spleis sender tilstanden.

**Status:** ferdig

## Akseptansekriterier

- [x] `nestePåminnelsetidspunkt` i `Tilstandsendringer.kt` i Spock gir påminnelse etter én time for `AVVENTER_RETTIGHETSKATEGORI`, sammen med `AVVENTER_VILKÅRSPRØVING`.
- [x] En test i `PåminnelseplanleggerTest` sjekker intervallet for `AVVENTER_RETTIGHETSKATEGORI`.
- [x] `AVVENTER_RETTIGHETSKATEGORI` er med i `interessanteTilstander` i `PåminnelseMonitor` i spammer.
- [x] Spock og spammer er deployet i dev og prod før togglen for fase 1 skrus på i dev.
