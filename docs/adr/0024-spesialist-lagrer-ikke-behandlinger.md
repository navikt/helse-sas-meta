---
status: akseptert
---

# Spesialist lagrer ikke behandlinger, men refererer til dem med ID-en fra Spleis

**Forfattere:** Christian Skovborg Gule (@chsko)

Spleis eier behandlingen. Spesialist har likevel hatt sin egen kopi i tabellen `behandling`, med egen ID (`BehandlingUnikId`), fom, tom, skjæringstidspunkt, tags, utbetaling og en egen tilstand. Kopien er allerede ute av synk med Spleis, og tilstandsmaskinen er tung å vedlikeholde. Vi fjerner tabellen helt. Varsler, oppgaver, periodehistorikk og individuelle begrunnelser refererer til behandlingen med `spleisBehandlingId`.

Spesialist henter behandlingsdata der de trengs. Automatiseringen, totrinnsvurderingen og fatting av vedtak bruker godkjenningsbehovet, som allerede lagres. Behandlingspakken lages fra `perioderMedSammeSkjæringstidspunkt`, og Spleis sender `førsteVedtakFattetTidspunkt` for seksmånedersregelen. Saksbildet henter fra Spleis som i dag. Spesialist utleder ikke en egen tilstand. Svarene kommer fra varsler, vedtak og oppgave.

## Vurderte alternativer

- **Behold en tynn koblingstabell (`spleisBehandlingId` til vedtaksperiode).** Den trengs ikke. Varsler og oppgaver har allerede vedtaksperioden, og den nye varselmodellen (ADR 0025) fjerner behovet for å vite hvilken behandling som er nyest.
- **Behold tabellen, men slutt å oppdatere felt Spesialist ikke eier.** Da lever to ID-er og en kopi som ikke kan stoles på, videre.

## Konsekvenser

- `BehandlingUnikId` forsvinner, også fra API-et mot Speil (`ApiVarselDTO.behandlingId`).
- Tilgangskontrollen i API-et finner personen via vedtaksperioden på varselet, eller via oppgaven for `spleisBehandlingId`, ikke via behandlingen.
- `BehandlingOpprettetRiver` oppretter fortsatt vedtaksperioden og lagrer meldingen, men lagrer ingen behandling.
- Godkjenningsbehovet blir kilden til behandlingspakken lenge etter at det ble mottatt. Endrer Spleis innholdet, må Spesialist tåle både gamle og nye godkjenningsbehov.
