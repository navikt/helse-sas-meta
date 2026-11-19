# Kodestandarder

Code-review-skillen leser denne filen når den gjennomgår endringer i app-repoene i sas-meta. Reglene er skjønnsvurderinger. Det som kan sjekkes automatisk, hører hjemme i et verktøy.

## Databaseskjema

- **Hver indeks har en spørring.** En ny indeks skal brukes av en spørring i samme endring. Indekser for spørringer som kommer i en senere ticket, legges til i den ticketen.
- **Én identitet per rad.** Velg enten en UUID eller et løpenummer som primærnøkkel, ikke begge. Bruk UUID når ID-en sendes ut av appen.
- **Skill mellom når noe skjedde og når det ble lagret.** Et fagtidspunkt (for eksempel `vurderingstidspunkt`) settes av applikasjonen og kan komme fra et annet system. Lagringstidspunktet heter `opprettet`, settes med `DEFAULT now()` og leses eller skrives ikke av applikasjonen.
- **Hver kolonne har en grunn i specen.** Når skjemaet bygger på en tabell i en annen app, skal hver kolonne ha et behov i specen eller ticketen. Kolonner som bare finnes fordi forbildet har dem, fjernes.
- **Tidspunkter lagres som `timestamptz`.** En `timestamp`-kolonne uten tidssone tolkes i sesjonens tidssone, så samme `Instant` kan bli lagret ulikt fra pod og fra lokal maskin. Datoer uten klokkeslett er `date`.
- **Beløp lagres som `numeric(19, 2)`.** Vi regner ikke med brøkdeler av øre, så kroner og øre har alltid to desimaler. Kolonnen runder av i stillhet hvis verdien har flere desimaler, så avrund i Kotlin med `setScale(2, RoundingMode...)` før lagring, slik `UtbetalingPerForsikringstypeDao` i sp-forsikring gjør. Andre desimaltall, som satser, prosenter og grunnbeløp med flere desimaler, lagres som `numeric` uten presisjon og skala. Bruk aldri `double precision`, `real` eller `money`.

## Penger og desimaltall

- **Desimaltall er `BigDecimal`.** Bruk `BigDecimal` for penger, satser, prosenter og andre desimaltall, også i domenet. `Double` og `Float` runder av, og hører bare hjemme der en ekstern kontrakt sender dem. Heltall, som antall dager eller hele kroner fra Spleis, kan være `Int` eller `Long`.
- **Konverter i kanten.** Gjør om en `Double` til `BigDecimal` der meldingen tolkes, med `toBigDecimal()` eller `BigDecimal.valueOf(...)`. Ikke bruk konstruktøren `BigDecimal(0.1)`, den tar med hele binærfeilen.
- **Sammenlign med `compareTo`.** I Kotlin kaller `==` `equals`, som også sammenligner skalaen, så `1.0` og `1.00` er ulike. Bruk `compareTo`, `<`, `>=` eller `signum()`.
- **Avrund én gang, med valgt skala og avrundingsregel.** `divide` og `setScale` får alltid skala og `RoundingMode`. Regn med full presisjon underveis og avrund først når resultatet lagres eller sendes ut, slik `VedtakFattetRiver` i sp-forsikring gjør.

## Tid

- **Et tidspunkt er en `Instant`.** Bruk `Instant` for alt som har skjedd på et bestemt øyeblikk, også i domenet og i databaselaget. `LocalDateTime` hører bare hjemme der en ekstern kontrakt krever den, for eksempel `@opprettet` på rapiden eller `vedtakFattetTidspunkt` fra Spleis.
- **Konverter i kanten, med Oslo-tid.** Når en `LocalDateTime` kommer inn eller må ut, konverter med `ZoneId.of("Europe/Oslo")` der meldingen eller responsen tolkes eller bygges. Ikke bruk `ZoneId.systemDefault()` eller la JVM-ens tidssone avgjøre.
- **Dager avgrenses i Kotlin, ikke i SQL.** Skal en spørring finne tidspunkter innenfor en periode med `LocalDate`, regn ut døgngrensene med `atStartOfDay(Europe/Oslo).toInstant()` og spør med `>= fra AND < til`. Da påvirker ikke databasens tidssone resultatet. Se `UtbetalingPerForsikringstypeDao` i sp-forsikring.
- **Beslutninger som avhenger av nåtid, får `nå` som parameter.** Kode som sammenligner med nåtid, for eksempel om en frist er passert eller om et nytt forsøk skal kjøres, tar `nå: Instant` eller `nå: () -> Instant = Instant::now` som parameter, slik `PurringJob` og `KommandoJobb` i sporhund gjør. Da kan testen bestemme tiden. Å stemple et nytt objekt med `Instant.now()` i `ny(...)` er greit.

## Domenemodell

- **ID-er har egne typer.** En ID er en `@JvmInline value class` (for eksempel `Forsikringsvurdering.Id`, `PåVentId`), ikke en løs `UUID` eller `Long` som kan byttes om med en annen ID.
- **Aggregater opprettes gjennom fabrikkfunksjoner.** Konstruktøren er `private`. `ny(...)`, eller et navn fra domenet som `utførVurdering(...)`, lager et nytt objekt og setter selv ID og tidspunkt med `Instant.now()`. `fraLagring(...)` gjenoppretter et lagret objekt, og repositoriet bruker bare den.
- **Tilstand endres gjennom domenemetoder.** Felter som kan endres, er `var` med `private set`, og endres med en metode som sier hva som skjer (`nyFrist(...)`), ikke ved å sette feltet utenfra.
- **Strenger fra andre systemer valideres i kanten.** Gjør dem om til domenetyper med `fraString(...)` (for eksempel `Identitetsnummer.fraString`) når meldingen eller requesten tolkes, slik at domenet aldri får en ugyldig verdi.
- **Aggregater peker på hverandre med ID.** Et aggregat holder ID-en til et annet aggregat (`Behandling.vedtaksperiodeId`), ikke selve objektet. Trenger koden begge, henter den dem fra hvert sitt repository.
- **ID-en lages i domenet.** Nye aggregater får ID-en sin i `ny(...)`. Et løpenummer fra databasen (`LateIdAggregateRoot` i spesialist) brukes bare der tabellen allerede har det.
- **Aggregater samler domenehendelser.** Et aggregat som har endret seg på en måte omverdenen skal vite om, legger en hendelse i en liste (`Oppgave.hendelser`). Applikasjonslaget lagrer aggregatet og gjør hendelsene om til utgående meldinger. Domenet kjenner verken Kafka eller observere.
- **API og meldinger har egne typer.** Domeneklasser serialiseres ikke direkte. API-et har egne typer (`Api*` i `spesialist-api-schema`) og mapper eksplisitt til og fra domenet, slik `DomainToApiMapping` i sporhund gjør.

## Persistering og meldinger

- **Den som kaller, eier transaksjonen.** Et repository får sesjonen eller transaksjonen i konstruktøren og åpner aldri en egen. Riveren eller API-behandleren åpner én transaksjon per melding eller kall og sender den videre. Har appen en `SessionContext`, henter kommandoer og use caser repositoriene derfra i stedet for å få dem i konstruktøren.
- **Ett repository per aggregat.** Interfacet ligger i applikasjonslaget, Postgres-implementasjonen heter `Pg*Repository`, og testene bruker en `InMemory*Repository`. Repositoriet lagrer og henter hele aggregatet. `finn` kaster hvis aggregatet mangler, `finnOrNull` returnerer `null`, og `lagre` både oppretter og oppdaterer.
- **SQL er rå SQL med navngitte parametere.** Skriv SQL-strengen med `@Language("PostgreSQL")` og bruk `:navn`-parametere, ikke strengsammenslåing. Enum-verdier lagres med `name`.
- **Meldinger publiseres etter commit.** En Kafka-melding som følger av en endring i databasen, sendes først når transaksjonen er committet. Ikke kall `publish` midt i en transaksjon. Om meldingen trenger en outbox-tabell, kommer an på hva som skjer hvis appen stopper mellom commit og publisering: tåler use caset at meldingen går tapt eller blir sendt på nytt ved neste forsøk, holder det å samle meldingene i minnet og sende dem etter commit, slik spesialist gjør. Må meldingen garantert komme fram, bruk `outbox` fra sykepenger-libs, slik sp-rettighetskategori gjør.
- **Kall til andre systemer som må lykkes, går gjennom en kommandokø.** Når en endring skal følges av et kall som kan feile, for eksempel journalføring eller PDF-generering, lagres en kommando i samme transaksjon som endringen. En jobb utfører kommandoene én og én i hver sin transaksjon og prøver igjen med økende ventetid. Se `KommandoKø` og `KommandoJobb` i sporhund.

## Felleskode

- **Bruk sykepenger-libs før du skriver eget.** Finnes det en modul i `libs/` (for eksempel `outbox`, `leader-election`, `postgres`, `logging` eller `testing`), bruk den i stedet for en egen variant i appen.

## API

- **Feil returneres som Problem Details.** Feilsvar følger RFC 9457 med `type`, `title`, `status` og `detail`, slik `ApiHttpProblemDetails` i spesialist og `ProblemResponse` i sp-forsikring gjør.

## Tester

- **Testdata lages med `lag*`-funksjoner.** En fixture som `lagForsikringsvurdering(...)` har standardverdier for alt, og testen overstyrer bare det den handler om.
- **Fakes framfor mockk.** Test mot en in-memory-implementasjon av interfacet (`InMemoryDialogRepository`, `FakeSpleis`) eller en ekte database. Ikke bruk mockk i ny kode.
- **Postgres og Kafka i tester kommer fra sykepenger-libs.** Bruk `TestDatabase` fra test fixtures i `postgres` og `TestKafka` fra `kafka-test`, slik sp-rettighetskategori gjør. De bruker serverne i `TEST_POSTGRES_JDBC_URL` og `TEST_KAFKA_BOOTSTRAP_SERVERS` når variablene er satt, og starter bare testcontainere når de mangler. Da kan testene kjøre i sandkassen til en kodeagent, der Docker ikke er tilgjengelig. Mange repoer bruker fortsatt `postgres-testdatabaser` (`DatabaseContainers`) fra tbd-libs eller egne testcontainere. Bytt dem ut når du likevel endrer repoet, som i spock. Det trengs ingen egen ticket.
- **Identitetsnumre genereres.** Bruk `lagIdentitetsnummer()` fra `sykepenger-libs/testing`, ikke hardkodede elleve siffer.

## Rapiden

- **Behov heter det de spør om, i PascalCase.** En domenetjeneste som vurderer et vilkår, svarer på to behov: `<Vilkår>vurdering` gjør vurderingen og svarer med ID-en til den, og `<Vilkår>vurderingResultat` tar ID-en og svarer med utfallet. Eksempler er `Opptjeningsvurdering` og `OpptjeningsvurderingResultat`, og `Forsikringsvurdering` og `ForsikringsvurderingResultat`. Endrer et behov kontrakten på en måte som ikke er bakoverkompatibel, får det nytt navn med `V2`-suffiks (`ArbeidsforholdV2`).
- **Input ligger under behovsnavnet, felles felter på toppnivå.** Input til behovet ligger i et objekt med samme navn som behovet (`Rettighetskategori.skjæringstidspunkt`). `fødselsnummer`, `vedtaksperiodeId`, `behandlingId`, `organisasjonsnummer` og `yrkesaktivitetstype` ligger på toppnivå, slik Spleis sender dem, og slik MDC-oppsettet leser dem.
- **Løsningen ligger under `@løsning.<Behov>`.** Løsningen er et objekt, også når den bare har ett felt. ID-en til vurderingen heter `id` (`@løsning.Opptjeningsvurdering.id`).
- **Personen heter `fødselsnummer` på rapiden.** Feltet heter `fødselsnummer` også når verdien er et D-nummer, og meldingen publiseres med fødselsnummeret som key.
- **Hendelser heter `endret_<vurdering>` i snake_case.** Når en vurdering endrer seg utenom et behov, for eksempel etter en manuell vurdering, publiserer tjenesten `endret_<vilkår>vurdering` med `fødselsnummer`, `skjæringstidspunkt`, `<vilkår>vurderingId` og eventuelt `manuellVurdering`. Spleis tar imot alle disse i `EndretVurderingPåSkjæringstidspunktRiver`, så en ny vurdering må bare legges til der.
- **Et behov som ikke kan løses, får ikke svar.** Klarer ikke tjenesten å løse behovet, logger den feilen med `loggError` og publiserer ingen løsning. Den svarer aldri med en halv eller gjettet løsning.

## Integrasjoner

- **Scope og URL kommer fra miljøvariabler.** En klient mot en annen tjeneste leser scopet og base-URL-en fra miljøvariabler som er satt i Nais-manifestet, for eksempel `SP_RETTIGHETSKATEGORI_SCOPE` og `SP_RETTIGHETSKATEGORI_BASE_URL`. Les dem med `env.getValue(...)`, så appen feiler ved oppstart hvis en mangler. Koden skal ikke regne ut scope eller URL fra `NAIS_CLUSTER_NAME` eller ha dem som konstanter. Base-URL-en står i fellesmanifestet, og scopet står i miljøfilene for dev og prod.
