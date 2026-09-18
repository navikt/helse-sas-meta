---
name: sykepenger-logging-api
description: "Bruk ved skriving, endring og gjennomgang av logging i prosjekter som allerede bruker sykepenger-libs/logging. All egen applikasjonslogging skal bruke dette API-et, ikke SLF4J, Logback eller andre loggwrappere direkte. Gjelder også LoggerFactory, Logger, MDC og KotlinLogging."
---

# Bruk sykepenger-libs til all applikasjonslogging

Denne skillen gjelder bare prosjekter som allerede bruker `sykepenger-libs/logging`. All egen applikasjonslogging skal gå gjennom dette API-et. Ikke bruk SLF4J eller Logback direkte til å logge, selv om meldingsteksten er personfri.

## Avklar hvilket prosjekt regelen gjelder for

Kontroller at prosjektet allerede bruker `no.nav.sykepenger.libs:logging` eller en lokal prosjektavhengighet til logging-modulen. Følg eventuelle versjonskataloger, convention plugins og prosjektavhengigheter. En annen modul fra sykepenger-libs eller et klonet søsterrepo er ikke nok.

## Bruk bibliotekets API

Les [README for logging](../../../sykepenger-libs/logging/README.md) før du endrer kode. Bruk:

- `loggError`, `loggWarn`, `loggInfo`, `loggDebug` og `loggTrace` fra `no.nav.sykepenger.libs.logging` i klasser og på objekter.
- `navngittLogger(...)` og `NavngittLogger` der du trenger en navngitt logger, for eksempel i toppnivåfunksjoner.
- `medMdc`, `coMedMdc` og `MdcKey` for MDC, ikke direkte kall til `org.slf4j.MDC`.

Ikke opprett loggere med `LoggerFactory.getLogger(...)`, bruk SLF4J sitt fluent API eller logg gjennom `ch.qos.logback.*`. Ikke omgå regelen med KotlinLogging, egne wrappere rundt SLF4J/Logback, `println` eller `System.out`/`System.err` som erstatning for applikasjonslogging.

Følg [skillen for personfri meldingstekst](../sykepenger-logging/SKILL.md) for meldinger, detaljer og exceptions. Personvernreglene vedlikeholdes der.

## Avgrensninger

Regelen gjelder applikasjonens egne loggkall. SLF4J og Logback er fortsatt underliggende teknologi:

- Ikke skriv om logging inne i tredjepartsbiblioteker eller rammeverk. Bibliotekets felles logback-oppsett håndterer denne loggingen.
- `logback.xml` med bibliotekets include og dokumenterte innstillinger er tillatt og nødvendig. Dette er ikke et direkte loggkall.
- Implementasjonen av selve `sykepenger-libs/logging` må kunne bruke SLF4J og Logback internt.
- Tester kan bruke SLF4J-/Logback-verktøy for å fange og inspisere logghendelser eller teste rutingen. Dette er ikke et unntak for applikasjonskode som kjøres av testen.

## Før du avslutter

Søk i koden du har endret etter direkte logging, også via aliaser, fullt kvalifiserte navn og hjelpefunksjoner. Les mottakertypen og implementasjonen; et importsøk alene er ikke nok. `logger.info(...)` er tillatt når mottakeren er en `NavngittLogger`.

Ved kodeendringer, kjør relevante eksisterende tester. Ved kodegjennomgang, rapporter direkte applikasjonslogging med fil og linje. Ikke merk legitim intern bruk eller loggfangst i tester som brudd.

Skillen er en agentinstruksjon, ikke automatisk håndheving i bygg eller CI.
