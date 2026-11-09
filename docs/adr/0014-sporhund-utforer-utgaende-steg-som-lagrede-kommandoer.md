# Sporhund utfører utgående steg som lagrede kommandoer

Når Sporhund sender en forespørsel eller en purring, lager den først en PDF i Sprinter. Deretter sender den dialogmeldingen med PDF-en som vedlegg på Kafka og journalfører PDF-en i Dokarkiv. Behandleren og arkivet skal få den samme PDF-en, og ingen dialogmelding skal sendes uten vedlegg. Sporhund lagrer derfor hvert steg som en kommando i databasen, i samme transaksjon som endringen som utløser steget. Én generisk jobb utfører én kommando per transaksjon. Håndtereren for en kommando returnerer de neste stegene, og jobben lagrer dem i samme transaksjon.

Kjeden er:

```
LagDialogmeldingPdf ──┬─> SendDialogmeldingPåKafka
                      └─> JournalførDialogmelding
```

- PDF-en lages én gang og lagres i en egen tabell. Kommandoene inneholder ID-er, og hvert steg henter meldingen og dialogen fra databasen. Det går fordi verken meldingen eller søker og fagområde på dialogen endres etter at de er lagret. Unntaket er navnet på saksbehandleren. Det lagres ikke i dialogen og følger derfor med `LagDialogmeldingPdf`.
- En kommando venter på kommandoen som laget den og på eldre kommandoer av samme type i samme dialog. En feil stopper bare dialogen den gjelder. Kafka-sending og journalføring stopper ikke hverandre.
- En kommando som feiler, prøves på nytt i det uendelige med eksponentiell backoff og blir aldri forkastet. Etter mange forsøk logges en feil, og det går en alarm. Kafka-sending skjer minst én gang. Mottakeren tåler duplikater med samme `dialogmeldingUuid`, og Dokarkiv tåler gjentatte kall fordi vi sender `eksternReferanseId`.
- En utført kommando slettes ikke. Den får et tidspunkt for når den ble utført, slik at vi i etterkant kan se hvilke steg som er kjørt for en dialog.

## Vurderte alternativer

- **Kjede av outbox-meldinger.** Sporhund bruker dette mønsteret i dag. Rekkefølgen finnes bare implisitt i koden, hver type trenger sin egen jobb, og `PgOutbox` låser alle usendte rader på tvers av typer.
- **Outbox med PDF-en laget når meldingen opprettes.** Endepunktet og purringsjobben lager PDF-en i Sprinter og lagrer den i samme transaksjon som outbox-meldingene. Kafka-senderen og journalføreren henter den fra tabellen. Kjeden blir flat, så en vanlig outbox holder, og mønsteret er kjent for teamet. Vi valgte det bort fordi Sprinter da blir en del av arbeidsflyten til saksbehandleren: er Sprinter nede eller treg, kan hun ikke sende. Vi vil ha så få avhengigheter som mulig der. Purringsjobben måtte også kalle Sprinter og ville stoppe for dialogen når Sprinter er nede. Outboxen ville også trengt rekkefølge per dialog og backoff, og dermed fått det meste av det kommandokøen har.
- **Status for utsending på dialogmeldingen.** Teknisk framdrift blir blandet med domenet, og de parallelle stegene trenger hver sin status.
- **Bibliotek for jobbkø** (db-scheduler, JobRunr). Det er et nytt mønster og en ny avhengighet for tre steg. Hvis behovet vokser, kan vi bytte senere, fordi kommandoene allerede er data.

## Konsekvenser

- Kommandokøen er et mønster teamet ikke kjenner fra før. I praksis er den en outbox der et steg kan legge til nye steg.
- Kommandoene erstatter `NyDialogmeldingFraNav` og `OpprettUtgåendeJournalpost` i outboxen. Den gamle outbox-løkka kjører til køen er tom og fjernes deretter. `KnyttInnkommendeJournalpost` flyttes senere.
- Meldinger som ligger i outboxen ved overgangen, og meldinger som allerede er sendt, får ikke vedlegg.
- Purringer journalføres nå på samme måte som forespørsler, med sin egen Sprinter-mal.
