# Tickets: fastsette sykepengegrunnlag

Tickets for [Fastsette sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/fastsette-sykepengegrunnlag.md). Statusen står i hver ticket og i tabellen under. Fasene står i specen og er felles med [tickets: avklare inntekt](../avklare-inntekt/index.md). Grå bokser i diagrammet er tickets derfra. Hver fase rulles ut i dev før prod.

Tickets som gjelder begge specene, ligger der de først trengs. Byttet og opprydningen (22–24) ligger her.

| # | Ticket | Fase | Repo | Blokkeres av | Status |
|---|---|---|---|---|---|
| 01 | [Skjelett for sp-sykepengegrunnlag for én arbeidstaker](01-skjelett-sp-sykepengegrunnlag.md) | 2 | sp-sykepengegrunnlag | inntekt 05 | klar |
| 02 | [Flere arbeidsgivere, a-ordningen, korrigerte inntekter og deaktiverte arbeidsforhold](02-flere-arbeidsgivere-korrigert-og-deaktivert.md) | 2 | sp-sykepengegrunnlag | 01 | klar |
| 03 | [Avviksvurdering for arbeidstakere](03-avviksvurdering.md) | 2 | sp-sykepengegrunnlag | 02 | klar |
| 04 | [Selvstendig næringsdrivende etter § 8-35](04-selvstendig-naeringsdrivende.md) | 2 | sp-sykepengegrunnlag | 01, inntekt 03 | klar |
| 05 | [Behovet `SykepengegrunnlagResultat`](05-sykepengegrunnlag-resultat.md) | 2 | sp-sykepengegrunnlag | 03, 04 | klar |
| 06 | [`AvventerSykepengegrunnlag` i Spleis bak toggle for skyggekjøring](06-spleis-avventer-sykepengegrunnlag.md) | 2 | spleis | inntekt 07, inntekt 09 | klar |
| 07 | [Endepunkt for avviksvurderinger i Spinnvill](07-spinnvill-avviksvurderinger.md) | 2 | spinnvill | Ingen | klar |
| 08 | [Endepunkt for skjønnsfastsettelser i Spesialist](08-spesialist-skjonnsfastsettelser.md) | 2 | spesialist | Ingen | klar |
| 09 | [Backfill i sp-sykepengegrunnlag](09-backfill-i-sp-sykepengegrunnlag.md) | 2 | sp-sykepengegrunnlag | 05, 07, 08, inntekt 11 | klar |
| 10 | [Skyggesammenligning mot grunnlaget fra Spleis](10-skyggesammenligning.md) | 2 | sp-sykepengegrunnlag | 09 | klar |
| 11 | [Rulle ut fase 2](11-rulle-ut-fase-2.md) | 2 | spleis, sp-inntekt, sp-sykepengegrunnlag | 06, 10, inntekt 10, inntekt 13 | klar |
| 12 | [Skjønnsfastsettelse i sp-sykepengegrunnlag](12-skjonnsfastsettelse.md) | 3 | sp-sykepengegrunnlag | 03 | klar |
| 13 | [Visning av sykepengegrunnlaget for Speil](13-visning-av-sykepengegrunnlaget.md) | 3 | sp-sykepengegrunnlag | 12 | klar |
| 14 | [Grunnbeløpsregulering i sp-sykepengegrunnlag](14-grunnbelopsregulering.md) | 3 | sp-sykepengegrunnlag | 12 | klar |
| 15 | [Oppslag på sykepengegrunnlaget for Spesialist](15-oppslag-for-spesialist.md) | 3 | sp-sykepengegrunnlag | 04, 09, 12 | klar |
| 16 | [Sykepengegrunnlag-ID i godkjenningsbehovet og `avsluttet_med_vedtak`](16-id-i-godkjenning-og-avsluttet-med-vedtak.md) | 3 | spleis | inntekt 06 | klar |
| 17 | [Spesialist henter sykepengegrunnlaget fra sp-sykepengegrunnlag bak toggle](17-spesialist-henter-sykepengegrunnlaget.md) | 3 | spesialist | 15, 16 | klar |
| 18 | [Spleis revurderer ved `endret_sykepengegrunnlag`](18-spleis-revurderer-ved-endret-sykepengegrunnlag.md) | 3 | spleis | 06 | klar |
| 19 | [Spleis bruker grunnlaget fra sp-sykepengegrunnlag bak bytte-togglen](19-spleis-bruker-grunnlaget-fra-tjenesten.md) | 3 | spleis | 06 | klar |
| 20 | [Spleis avviser overstyringer av inntekt og grunnlag etter byttet](20-spleis-avviser-overstyringer.md) | 3 | spleis | 19 | klar |
| 21 | [Speil viser sykepengegrunnlaget og sender skjønnsfastsettelser til sp-sykepengegrunnlag bak toggle](21-speil-sykepengegrunnlag-mot-tjenesten.md) | 3 | speil | 13, inntekt 14 | klar |
| 22 | [Bytte (fase 3)](22-bytte.md) | 3 | spleis, spesialist, speil, sp-inntekt, sp-sykepengegrunnlag, spregulering | 11, 14, 17, 18, 20, 21, inntekt 15, inntekt 17 | klar |
| 23 | [Fjerne backfill](23-fjerne-backfill.md) | 4 | sp-inntekt, sp-sykepengegrunnlag, spleis, spinnvill, spesialist | 22 | klar |
| 24 | [Fjerne den gamle løsningen](24-fjerne-den-gamle-losningen.md) | 4 | spleis, spesialist, spinnvill, spregulering | 23 | klar |

```mermaid
flowchart LR
    subgraph F2[Fase 2]
        T01["01 Skjelett for sp-sykepengegrunnlag for én a..."]
        T02["02 Flere arbeidsgivere, a-ordningen, korriger..."]
        T03["03 Avviksvurdering for arbeidstakere"]
        T04["04 Selvstendig næringsdrivende etter § 8-35"]
        T05["05 Behovet SykepengegrunnlagResultat"]
        T06["06 AvventerSykepengegrunnlag i Spleis bak tog..."]
        T07["07 Endepunkt for avviksvurderinger i Spinnvill"]
        T08["08 Endepunkt for skjønnsfastsettelser i Spesi..."]
        T09["09 Backfill i sp-sykepengegrunnlag"]
        T10["10 Skyggesammenligning mot grunnlaget fra Spleis"]
        T11["11 Rulle ut fase 2"]
    end
    subgraph F3[Fase 3]
        T12["12 Skjønnsfastsettelse i sp-sykepengegrunnlag"]
        T13["13 Visning av sykepengegrunnlaget for Speil"]
        T14["14 Grunnbeløpsregulering i sp-sykepengegrunnlag"]
        T15["15 Oppslag på sykepengegrunnlaget for Spesialist"]
        T16["16 Sykepengegrunnlag-ID i godkjenningsbehovet..."]
        T17["17 Spesialist henter sykepengegrunnlaget fra ..."]
        T18["18 Spleis revurderer ved endret_sykepengegrun..."]
        T19["19 Spleis bruker grunnlaget fra sp-sykepengeg..."]
        T20["20 Spleis avviser overstyringer av inntekt og..."]
        T21["21 Speil viser sykepengegrunnlaget og sender ..."]
        T22["22 Bytte fase 3"]
    end
    subgraph F4[Fase 4]
        T23["23 Fjerne backfill"]
        T24["24 Fjerne den gamle løsningen"]
    end
    XI03["Inntekt 03 Pensjonsgivende inntekt fra Sigrun"]:::ekstern
    XI05["Inntekt 05 Oppslag på inntektsavklaring for andre tje..."]:::ekstern
    XI06["Inntekt 06 Inntektsavklarings-ID og sykepengegrunnlag..."]:::ekstern
    XI07["Inntekt 07 AvventerInntektsavklaring i Spleis bak toggle"]:::ekstern
    XI09["Inntekt 09 Revurdering gjennom AvventerInntektsavklaring"]:::ekstern
    XI10["Inntekt 10 Rulle ut fase 1"]:::ekstern
    XI11["Inntekt 11 Endepunkt for backfill i spleis-api"]:::ekstern
    XI13["Inntekt 13 Backfill i sp-inntekt"]:::ekstern
    XI14["Inntekt 14 Nye verdier i HandlingType i Spesialist"]:::ekstern
    XI15["Inntekt 15 Saksbehandlers endringer i sp-inntekt"]:::ekstern
    XI17["Inntekt 17 Speil viser inntektene og sender endringer..."]:::ekstern
    XI05 --> T01
    T01 --> T02
    T02 --> T03
    T01 --> T04
    XI03 --> T04
    T03 --> T05
    T04 --> T05
    XI07 --> T06
    XI09 --> T06
    T05 --> T09
    T07 --> T09
    T08 --> T09
    XI11 --> T09
    T09 --> T10
    T06 --> T11
    T10 --> T11
    XI10 --> T11
    XI13 --> T11
    T03 --> T12
    T12 --> T13
    T12 --> T14
    T04 --> T15
    T09 --> T15
    T12 --> T15
    XI06 --> T16
    T15 --> T17
    T16 --> T17
    T06 --> T18
    T06 --> T19
    T19 --> T20
    T13 --> T21
    XI14 --> T21
    T11 --> T22
    T14 --> T22
    T17 --> T22
    T18 --> T22
    T20 --> T22
    T21 --> T22
    XI15 --> T22
    XI17 --> T22
    T22 --> T23
    T23 --> T24
    T07 --> XI13
    classDef ekstern fill:#eeeeee,stroke:#9e9e9e,color:#424242,stroke-dasharray: 4 2
```
