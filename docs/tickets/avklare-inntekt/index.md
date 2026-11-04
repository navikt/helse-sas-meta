# Tickets: avklare inntekt

Tickets for [Avklare inntekt i sp-inntekt](../../specs/avklare-inntekt.md). Statusen står i hver ticket og i tabellen under. Fasene står i specen og er felles med [tickets: fastsette sykepengegrunnlag](../fastsette-sykepengegrunnlag/index.md). Grå bokser i diagrammet er tickets derfra. Hver fase rulles ut i dev før prod.

Tickets som gjelder begge specene, ligger der de først trengs. Ticket 06 og 08 gjelder også sykepengegrunnlaget, og byttet og opprydningen ligger i sykepengegrunnlaget (22–24).

| # | Ticket | Fase | Repo | Blokkeres av | Status |
|---|---|---|---|---|---|
| 01 | [Skjelett for sp-inntekt med inntektsmelding fra Spedisjon](01-skjelett-sp-inntekt.md) | 1 | sp-inntekt | Ingen | klar |
| 02 | [A-ordningen, sammenligningsgrunnlag og arbeidsforhold uten søknad](02-a-ordningen-og-arbeidsforhold-uten-soknad.md) | 1 | sp-inntekt | 01 | klar |
| 03 | [Pensjonsgivende inntekt fra Sigrun](03-pensjonsgivende-inntekt-fra-sigrun.md) | 1 | sp-inntekt | 01 | klar |
| 04 | [Gjenbruk av registeropplysninger ved `nyInnhenting: false`](04-gjenbruk-av-registeropplysninger.md) | 1 | sp-inntekt | 02, 03 | klar |
| 05 | [Oppslag på inntektsavklaring for andre tjenester](05-oppslag-pa-inntektsavklaring.md) | 2 | sp-inntekt | 02, 03 | klar |
| 06 | [Inntektsavklarings-ID og sykepengegrunnlag-ID på alle vilkårsgrunnlag i Spleis](06-ider-pa-alle-vilkarsgrunnlag.md) | 1 | spleis | Ingen | klar |
| 07 | [`AvventerInntektsavklaring` i Spleis bak toggle](07-spleis-avventer-inntektsavklaring.md) | 1 | spleis, sp-rettighetskategori | 06 | klar |
| 08 | [`AVVENTER_INNTEKTSAVKLARING` og `AVVENTER_SYKEPENGEGRUNNLAG` i Spock og spammer](08-tilstandene-i-spock-og-spammer.md) | 1 | spock, spammer | Ingen | klar |
| 09 | [Revurdering gjennom `AvventerInntektsavklaring`](09-revurdering-gjennom-avventer-inntektsavklaring.md) | 1 | spleis | 07 | klar |
| 10 | [Rulle ut fase 1](10-rulle-ut-fase-1.md) | 1 | spleis, sp-inntekt | 04, 07, 08, 09 | klar |
| 11 | [Endepunkt for backfill i spleis-api](11-spleis-api-sykepengegrunnlag.md) | 2 | spleis | 06 | klar |
| 12 | [Endepunkt for inntektsendringer i Spesialist](12-spesialist-inntektsendringer.md) | 2 | spesialist | Ingen | klar |
| 13 | [Backfill i sp-inntekt](13-backfill-i-sp-inntekt.md) | 2 | sp-inntekt | 05, 11, 12, sykepengegrunnlag 07 | klar |
| 14 | [Nye verdier i `HandlingType` i Spesialist](14-nye-handlingstyper-i-spesialist.md) | 3 | spesialist | Ingen | klar |
| 15 | [Saksbehandlers endringer i sp-inntekt](15-saksbehandlers-endringer-i-sp-inntekt.md) | 3 | sp-inntekt | 04 | klar |
| 16 | [Visning av inntektsavklaringen for Speil](16-visning-av-inntektsavklaringen.md) | 3 | sp-inntekt | 15 | klar |
| 17 | [Speil viser inntektene og sender endringer til sp-inntekt bak toggle](17-speil-inntekter-mot-sp-inntekt.md) | 3 | speil | 14, 16 | klar |

```mermaid
flowchart LR
    subgraph F1[Fase 1]
        T01["01 Skjelett for sp-inntekt med inntektsmeldin..."]
        T02["02 A-ordningen, sammenligningsgrunnlag og arb..."]
        T03["03 Pensjonsgivende inntekt fra Sigrun"]
        T04["04 Gjenbruk av registeropplysninger ved nyInn..."]
        T06["06 Inntektsavklarings-ID og sykepengegrunnlag..."]
        T07["07 AvventerInntektsavklaring i Spleis bak toggle"]
        T08["08 AVVENTER_INNTEKTSAVKLARING og AVVENTER_SYK..."]
        T09["09 Revurdering gjennom AvventerInntektsavklaring"]
        T10["10 Rulle ut fase 1"]
    end
    subgraph F2[Fase 2]
        T05["05 Oppslag på inntektsavklaring for andre tje..."]
        T11["11 Endepunkt for backfill i spleis-api"]
        T12["12 Endepunkt for inntektsendringer i Spesialist"]
        T13["13 Backfill i sp-inntekt"]
    end
    subgraph F3[Fase 3]
        T14["14 Nye verdier i HandlingType i Spesialist"]
        T15["15 Saksbehandlers endringer i sp-inntekt"]
        T16["16 Visning av inntektsavklaringen for Speil"]
        T17["17 Speil viser inntektene og sender endringer..."]
    end
    XS01["Sykepengegrunnlag 01 Skjelett for sp-sykepengegrunnlag for én a..."]:::ekstern
    XS04["Sykepengegrunnlag 04 Selvstendig næringsdrivende etter § 8-35"]:::ekstern
    XS06["Sykepengegrunnlag 06 AvventerSykepengegrunnlag i Spleis bak tog..."]:::ekstern
    XS07["Sykepengegrunnlag 07 Endepunkt for avviksvurderinger i Spinnvill"]:::ekstern
    XS09["Sykepengegrunnlag 09 Backfill i sp-sykepengegrunnlag"]:::ekstern
    XS11["Sykepengegrunnlag 11 Rulle ut fase 2"]:::ekstern
    XS16["Sykepengegrunnlag 16 Sykepengegrunnlag-ID i godkjenningsbehovet..."]:::ekstern
    XS21["Sykepengegrunnlag 21 Speil viser sykepengegrunnlaget og sender ..."]:::ekstern
    XS22["Sykepengegrunnlag 22 Bytte fase 3"]:::ekstern
    T01 --> T02
    T01 --> T03
    T02 --> T04
    T03 --> T04
    T02 --> T05
    T03 --> T05
    T06 --> T07
    T07 --> T09
    T04 --> T10
    T07 --> T10
    T08 --> T10
    T09 --> T10
    T06 --> T11
    T05 --> T13
    T11 --> T13
    T12 --> T13
    XS07 --> T13
    T04 --> T15
    T15 --> T16
    T14 --> T17
    T16 --> T17
    T05 --> XS01
    T03 --> XS04
    T07 --> XS06
    T09 --> XS06
    T11 --> XS09
    T10 --> XS11
    T13 --> XS11
    T06 --> XS16
    T14 --> XS21
    T15 --> XS22
    T17 --> XS22
    classDef ekstern fill:#eeeeee,stroke:#9e9e9e,color:#424242,stroke-dasharray: 4 2
```
