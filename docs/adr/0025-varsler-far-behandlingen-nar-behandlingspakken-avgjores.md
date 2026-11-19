---
status: akseptert
---

# Et varsel hører til vedtaksperioden til behandlingspakken avgjøres

**Forfattere:** Christian Skovborg Gule (@chsko)

Spesialist har knyttet et varsel til den nyeste behandlingen av vedtaksperioden når varselet opprettes. Når Spleis oppretter en ny behandling, flyttes varselet. Det krever at Spesialist vet hvilken behandling som er nyest, og det er nettopp den kunnskapen ADR 0024 fjerner. Vi bestemmer derfor at et varsel bare hører til vedtaksperioden fram til behandlingspakken det inngår i, godkjennes eller avvises, manuelt eller automatisk. Da får varselet `behandlingId` for sin vedtaksperiode fra godkjenningsbehovet. Varselet får ID-en uansett status, også `INAKTIV`, men ikke når det er `AVVIKLET`.

Spleis oppretter ikke en ny behandling så lenge vedtaksperioden har en åpen behandling. Derfor er behandlingen som godkjennes, den samme som varselet ble vurdert på.

## Vurderte alternativer

- **Bruk `behandlingId` fra konteksten i aktivitetsloggen når varselet opprettes.** Spleis bestemmer da behandlingen, men varsler må fortsatt flyttes når en ny behandling opprettes.
- **Gi varselet ID-en når saksbehandler vurderer det (`VURDERT`).** Vurderingen kan slettes. Varselet får ikke vite hvilken behandling det faktisk ble godtatt for.

## Konsekvenser

- Det kan være høyst ett varsel per kode uten `behandlingId` på en vedtaksperiode, og høyst ett per kode på en `behandlingId`. Reaktivering ser bare på varsler uten `behandlingId`.
- Saksbildet viser varslene uten `behandlingId` på den åpne perioden, og varslene med `behandlingId` på perioden med samme behandling.
- Eksisterende varsler tilpasses med behandlingskoblingen fra Spleis. Varsler med status `AKTIV`, `VURDERT` eller `INAKTIV` på en åpen behandling mister ID-en. Tabellen `behandling` i Spesialist brukes ikke som fasit.
- Nye varsler kobles ikke lenger til tabellen `behandling`. En app av den gamle versjonen finner ikke disse varslene, og derfor kan vi ikke rulle tilbake etter at den nye modellen er ute. Feil rettes framover.
- Flyttingen av avviksvarselet blir værende. Den bytter bare vedtaksperiode. Et avviksvarsel hører på sikt til sykefraværstilfellet, ikke til én vedtaksperiode, men det løser vi ikke her.
