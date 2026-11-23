---
status: akseptert
---

# Domenetjenestene melder saksbehandlerhandlinger til Spesialist

**Forfattere:** Øydis Kind Refsum (@oydisrefsum), Elias Andreassen Thøgersen (@elitho)

Når saksbehandler gjør eller setter i gang en endring i en domenetjeneste, sender domenetjenesten hendelsen `saksbehandlerhandling` på rapid. Spesialist bruker den til å føre historikken og starte totrinnsvurdering. Spesialist kjenner ikke innholdet i endringen. Når saksbehandler eller beslutter åpner et innslag i historikken, henter Speil detaljene fra domenetjenesten som en ferdig formatert visning. Beslutningen ble tatt 16. oktober 2026 og gjelder team SAS.

Før gikk alle endringer fra saksbehandler gjennom Spesialist. Speil kalte Spesialist, som lagret handlingen, startet totrinnsvurderingen og sendte endringen videre til Spleis. Nå kaller Speil domenetjenesten direkte (ADR 0004), og Spesialist får ikke vite om endringen uten et eget mønster.

## Ansvar

- **Domenetjenesten** lagrer hva saksbehandler gjorde, med begrunnelse og dokumentasjon. Den bestemmer om handlingen krever totrinnsvurdering, fordi den kjenner reglene for fagområdet. En ny automatisk vurdering som saksbehandler ber om, er også en saksbehandlerhandling. Domenetjenesten legger hendelsen i en outbox i samme transaksjon som endringen. Spesialist får dermed vite om alle endringer som er lagret, og bare dem.
- **Spesialist** lagrer handlingen i historikken og starter totrinnsvurdering når `kreverTotrinnsvurdering` er `true`. Den tolker ikke innholdet, men kjenner `handlingType` og sender `handlingType` og `handlingId` videre til Speil.
- **Speil** bruker `handlingType` til å finne domenetjenesten og henter detaljene med `GET /api/personer/{personPseudoId}/saksbehandlerhandlinger/{handlingId}/visning`. Svaret er en liste med felter, for eksempel `TEKST` og `LISTE`, med tekst Speil viser uten å tolke. Speil hopper over felttyper den ikke kjenner, så nye typer bryter ingenting.

Hendelsen har bare det Spesialist trenger: `fødselsnummer`, `skjæringstidspunkt`, `behandlingId`, `saksbehandlerIdent`, `handlingId`, `handlingType`, `kreverTotrinnsvurdering` og `tidspunkt`. `handlingId` er domenetjenestens egen ID for endringen. `skjæringstidspunkt` og `behandlingId` kan begge mangle, og da gjelder handlingen hele personen.

Når beslutter sender saken i retur, sender Spesialist den tilbake til saksbehandler som for alle andre saker. Domenetjenesten får ikke beskjed. Saksbehandler retter opp med en ny endring, som gir en ny handling.

Endringer som fortsatt går gjennom Spesialist, for eksempel overstyring av inntekt og skjønnsfastsettelse (ADR 0020), gir ingen `saksbehandlerhandling`. Spesialist fører historikken og totrinnsvurderingen for dem selv, som før.

## Eierskap til kontraktene

- Spesialist eier hendelsen `saksbehandlerhandling` og listen over `handlingType`-verdier. En domenetjeneste som tar i bruk mønsteret, avtaler nye verdier med Spesialist.
- Speil eier visningsmodellen: endepunktet, felttypene og hva Speil gjør med dem. Alle domenetjenester leverer det samme formatet, og nye felttyper avtales med Speil først.
- Domenetjenesten eier innholdet i feltene og dokumenterer endepunktet i OpenAPI-spesifikasjonen sin. sp-vilkarsproving har tester som sjekker at diskriminatoren `type` er med både i JSON-en og i spesifikasjonen.

## Vurderte alternativer

- **Spesialist som inngang, som før.** Speil kaller Spesialist, som sender endringen videre til domenetjenesten. Da må Spesialist kjenne API-et til hver domenetjeneste, og hver ny type endring krever en endring i Spesialist. Det er denne koblingen domenetjenestene skal fjerne.

## Konsekvenser

- Spesialist og Speil må få vite om hver nye `handlingType` og hvilken domenetjeneste den hører til.
- Hver `handlingType` må ha et visningsendepunkt, også handlinger som ikke krever totrinnsvurdering. Domenetjenesten sjekker at saksbehandler har tilgang til personen, og at handlingen tilhører personen.
- Domenetjenesten publiserer `saksbehandlerhandling` før meldingen til Spleis, med fødselsnummer som nøkkel. Meldingene havner da på samme partisjon i riktig rekkefølge, og Spesialist registrerer handlingen før saken kan godkjennes. Domenetjenester som tar i bruk mønsteret, må publisere i denne rekkefølgen.
- Domenetjenesten må ta vare på handlingene og kunne vise dem så lenge Spesialist viser dem i historikken. Den kan ikke slette eller skrive om en handling.
- Er en domenetjeneste nede, viser historikken i Spesialist fortsatt alle innslag, men Speil får ikke hentet detaljene for den tjenestens handlinger.
- Domenetjenestene sjekker bare tilgang til personen, ikke tildeling, oppgave eller totrinnsvurdering. Spesialist hindrer ikke at en beslutter selv gjør en handling som krever totrinnsvurdering, og så godkjenner saken. I dag hindrer Speil dette, men det er en risiko hvis andre klienter kan gjøre endringer, eller hvis Speil endres.
