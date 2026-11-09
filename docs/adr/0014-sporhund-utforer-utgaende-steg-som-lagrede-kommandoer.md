# Sporhund utfører utgående steg som lagrede kommandoer

Når Sporhund sender en forespørsel eller en purring, lager den først en PDF i Sprinter. Deretter sender den dialogmeldingen med PDF-en som vedlegg på Kafka og journalfører PDF-en i Dokarkiv. Behandleren og arkivet skal få den samme PDF-en, og ingen dialogmelding skal sendes uten vedlegg. Sporhund lagrer derfor hvert steg som en kommando i databasen, i samme transaksjon som endringen som utløser steget. Én generisk jobb utfører én kommando per transaksjon. Håndtereren for en kommando returnerer de neste stegene, og jobben lagrer dem i samme transaksjon.

Kjeden er:

```
LagDialogmeldingPdf ──┬─> SendDialogmeldingPåKafka
                      └─> JournalførDialogmelding
```

- PDF-en lages én gang fra et øyeblikksbilde av meldingen og lagres i en egen tabell. Kommandoene inneholder bare ID-er.
- En kommando venter på kommandoen som laget den og på eldre kommandoer av samme type i samme dialog. En feil stopper bare dialogen den gjelder. Kafka-sending og journalføring stopper ikke hverandre.
- En kommando som feiler, prøves på nytt i det uendelige med eksponentiell backoff og blir aldri forkastet. Etter mange forsøk logges en feil, og det går en alarm. Kafka-sending skjer minst én gang. Mottakeren tåler duplikater med samme `dialogmeldingUuid`, og Dokarkiv tåler gjentatte kall fordi vi sender `eksternReferanseId`.

## Vurderte alternativer

- **Kjede av outbox-meldinger.** Sporhund bruker dette mønsteret i dag. Rekkefølgen finnes bare implisitt i koden, hver type trenger sin egen jobb, og `PgOutbox` låser alle usendte rader på tvers av typer.
- **Status for utsending på dialogmeldingen.** Teknisk framdrift blir blandet med domenet, og de parallelle stegene trenger hver sin status.
- **Bibliotek for jobbkø** (db-scheduler, JobRunr). Det er et nytt mønster og en ny avhengighet for tre steg. Hvis behovet vokser, kan vi bytte senere, fordi kommandoene allerede er data.
- **Lage PDF-en synkront når meldingen opprettes.** Da får saksbehandleren en feil hvis Sprinter er nede, og purringsjobben stopper.

## Konsekvenser

- Kommandoene erstatter `NyDialogmeldingFraNav` og `OpprettUtgåendeJournalpost` i outboxen. Den gamle outbox-løkka kjører til køen er tom og fjernes deretter. `KnyttInnkommendeJournalpost` flyttes senere.
- Meldinger som ligger i outboxen ved overgangen, og meldinger som allerede er sendt, får ikke vedlegg.
- Purringer journalføres nå på samme måte som forespørsler, med sin egen Sprinter-mal.
