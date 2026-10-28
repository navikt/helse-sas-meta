# Saksbildet deles opp i én ressurs per begrep, og Speil henter dem direkte fra domenetjenestene

Saksbildet har vært ett stort kall, `GET /api/personer/{pseudoId}/saksbilde`. Der henter Spesialist snapshotet fra Spleis og legger egne data på det. Vi deler det opp i én ressurs per begrep, og Speil henter ressursene fra tjenesten som eier dataene. Dataene fra Spleis hentes fra spleis-api, og spesialist-data hentes fra Spesialist, for eksempel `aktiv-oppgave`, `totrinnsvurdering` og `tildeling` under `/api/personer/{pseudoId}`. Målet er først og fremst raskere sidevisning, fordi Speil kan hente bare det den valgte perioden og fanen trenger. I tillegg blir koblingen mellom tjenestene mindre.

## Vurderte alternativer

- **Spesialist som port foran Spleis.** Alle nye endepunkter ville ligget i Spesialist og videresendt til Spleis. Da må hver endring i Spleis-dataene gjøres tre steder: i Speil, i Spesialist og i Spleis.
- **Ett samlet metadata-endepunkt i Spesialist.** Det gir færre kall, men «metadata» er ikke et begrep i domenet, og endepunktet ville blitt et nytt, lite saksbilde. Dataene endres heller ikke samtidig: en tildeling endres alene, mens «send til beslutter» endrer oppgaven og totrinnsvurderingen. Med én ressurs per begrep kan Speil invalidere bare det som er endret.

## Konsekvenser

- Hver tjeneste som Speil kaller, må selv gjøre tilgangskontroll per person (populasjonstilgangskontroll) og auditlogging. spleis-api har ikke det i dag.
- En sidevisning gir flere kall, og dataene fra Spleis og Spesialist leses på ulike tidspunkt. Speil må tåle at de en kort stund ikke stemmer med hverandre, for eksempel at en periode er til godkjenning før oppgaven finnes.
- En ressurs som kan mangle, svarer 200 med innpakning, for eksempel `{ tildeling: null }`, ikke 404.
