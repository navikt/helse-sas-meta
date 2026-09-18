---
name: sykepenger-logging
description: "Bruk ved skriving, endring og gjennomgang av Kotlin-kode som bruker sykepenger-libs/logging, no.nav.sykepenger.libs.logging, loggInfo, loggWarn, loggError, loggDebug, loggTrace eller NavngittLogger. Hold personopplysninger ute av meldingsteksten som går til nav-logs, og bruk Team Logs-detaljer, Throwable og MDC riktig."
---

# Logging uten personopplysninger i nav-logs

Første argument (`melding`) til loggfunksjonene skal aldri inneholde personidentifiserende informasjon eller andre personopplysninger. Meldingen går til både nav-logs og Team Logs. Biblioteket sladder ikke meldingsteksten.

## Les kilden først

Les [README for logging](../../../sykepenger-libs/logging/README.md) før du endrer loggkall. Stien er relativ til denne skillen i sas-meta. Hvis du arbeider fra et underrepo, finn filen i sas-meta i stedet for å anta at arbeidsmappen er roten.

README-en beskriver kontrakten:

- `melding` går til begge loggsystemer.
- `teamLogsDetaljer` er `Pair<String, String?>` og går bare til Team Logs.
- `Throwable` som andre argument gir stacktrace bare i Team Logs.
- MDC-felter går bare til Team Logs med bibliotekets logback-oppsett.

Ved behov, les signaturene i `sykepenger-libs/logging/src/main/kotlin/no/nav/sykepenger/libs/logging/`. Hvis kilden ikke er tilgjengelig, si fra. Ikke gjett API-er eller påstå at loggrutingen er bekreftet.

## Regler for loggkall

Reglene gjelder alle overloads av `loggError`, `loggWarn`, `loggInfo`, `loggDebug` og `loggTrace`, og metodene `error`, `warn`, `info`, `debug` og `trace` på `NavngittLogger`. De gjelder også navngitt argument `melding =`, importaliaser og lokale hjelpefunksjoner som sender meldinger videre.

1. Bruk som hovedregel en fast melding som beskriver hendelsen uten personopplysninger. Dynamisk tekst er bare tillatt når du har fulgt verdien tilbake til kilden og kan fastslå at den er personfri.
2. Hold identitetsnummer, fødselsnummer, D-nummer, navn, kontaktopplysninger, saksbehandlerident og personrelaterte saks- og behandlings-ID-er ute av meldingen. UUID-er, pseudonymer og hashverdier er ikke automatisk anonyme.
3. Ikke legg objekter, payloads, request-/response-body, fritekst eller URL-er med mulige personopplysninger i meldingen. Dette gjelder også strenginterpolasjon, sammenkjeding, formatering, serialisering og `toString()`.
4. Ikke bygg inn `exception.message`, `localizedMessage`, `exception.toString()` eller `stackTraceToString()` i meldingen. Send exception som `Throwable`-argument.
5. Legg nødvendige personrelaterte detaljer i key/value-par etter meldingen og eventuell `Throwable`. Bruk faste, beskrivende nøkler og `String?`-verdier. Konverter andre typer eksplisitt. Ikke logg mer data enn nødvendig, heller ikke i Team Logs. Passord, tokens og andre hemmeligheter skal ikke logges.
6. Bruk `medMdc` eller `coMedMdc` med eksisterende `MdcKey` for korrelasjon gjennom flere kall. Ikke gjenta ID-en i meldingsteksten når den allerede finnes i MDC.
7. Ikke omgå reglene ved å bytte loggnivå, bruke direkte SLF4J-logging eller legge personopplysninger i logger-navnet. Direkte SLF4J-meldinger kan også havne i nav-logs. Kontroller mottakertypen før du antar at `logger.info(...)` er en `NavngittLogger`.

Hvis du ikke kan fastslå at meldingen er personfri, bruk en fast melding og flytt bare nødvendige detaljer til Team Logs.

## Eksempler

Eksemplene forutsetter import fra `no.nav.sykepenger.libs.logging` og at variablene finnes i kallstedet.

### Personopplysninger som detaljer

Ikke:

```kotlin
loggInfo("Behandler person $identitetsnummer")
loggDebug("Mottok svar: $responseBody")
```

Bruk:

```kotlin
loggInfo("Behandler person", "identitetsnummer" to identitetsnummer)
loggDebug("Mottok svar", "httpStatusCode" to status.toString())
```

Ta bare med `responseBody` som Team Logs-detalj hvis innholdet er nødvendig å logge og ikke inneholder hemmeligheter.

### Exceptions

Ikke:

```kotlin
loggError("Klarte ikke hente snapshot: ${exception.message}")
```

Bruk:

```kotlin
loggError("Klarte ikke hente snapshot", exception, "identitetsnummer" to identitetsnummer)
```

### Navngitt logger

```kotlin
private val logger = navngittLogger("no.nav.helse.snapshot")

fun loggHentefeil(exception: Throwable, identitetsnummer: String) {
    logger.warn("Klarte ikke hente snapshot", exception, "identitetsnummer" to identitetsnummer)
}
```

### Korrelasjon med MDC

```kotlin
medMdc(MdcKey.VEDTAKSPERIODE_ID to vedtaksperiodeId.toString()) {
    loggWarn("Feil vedtaksperiode")
}
```

Bruk `coMedMdc` i coroutine-kode. Les `MdcKey` før du velger nøkkel.

## Gjennomgang før du avslutter

- Finn alle nye og endrede loggkall i oppgaven, også multiline-kall, aliaser og hjelpefunksjoner.
- Les hele uttrykket for `melding`, og følg variabler og funksjonsreturer tilbake til kilden. Et søk etter `$` alene er ikke nok.
- Kontroller at meldingen er personfri, at `Throwable` står i riktig argument, og at detaljer bruker `Pair<String, String?>`.
- Rett utrygge kall innenfor oppgaven. Ved en ren kodegjennomgang, oppgi fil, linje og hva som kan lekke uten å gjengi faktiske personopplysninger.
- Kjør relevante eksisterende tester når du endrer kode. Hvis du endrer loggruting, kontroller at nav-logs ikke får detaljer, MDC eller stacktrace, mens Team Logs får forventet innhold.

Skillen veileder agenten og erstatter ikke automatisk håndheving i bygg eller CI.
