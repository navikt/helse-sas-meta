# 02: sp-andre-ytelser svarer med versjon og trekk fra sykdomsgrad

**Spec:** [Graderte andre ytelser fra saksbehandler](../../specs/graderte-andre-ytelser.md)

**Repo:** `sp-andre-ytelser`

**Hva skal lages:** Løsningen på `GraderteAndreYtelserForBeregning` har `versjon` per yrkesaktivitet og `trekkFraSykdomsgrad` og `sykdomsgradFørFordeling` per dag, slik specen beskriver. Spleis kan da spore hvilke fordelinger en beregning bygde på, og bruke trekket uten å kjenne reglene for fordelingen.

**Blokkeres av:** [01: sp-andre-ytelser lagrer sykdomsgraden før fordeling og håndhever reglene](01-sykdomsgrad-for-fordeling-og-regler.md)

**Status:** pågår

## Akseptansekriterier

- [x] Hvert element i løsningen har `versjon`, som er versjonen til den siste hendelsen for yrkesaktiviteten.
- [x] Hver dag har `trekkFraSykdomsgrad` (`sykdomsgradFørFordeling − sykdomsgrad`) og `sykdomsgradFørFordeling`.
- [x] Dagene er avgrenset til `fom`–`tom` og sortert på dato. Yrkesaktiviteter uten dager i perioden er ikke med.
- [x] En dag der ytelsene er fjernet, har `trekkFraSykdomsgrad` 0.
- [x] Tester i `GraderteAndreYtelserBehovRiverTest` dekker versjon, trekk fra sykdom, ytelser tatt fra arbeid (trekk 0), flere yrkesaktiviteter og avgrensning til perioden.
- [ ] Rullet ut i dev og prod.
