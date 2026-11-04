# 06: `AvventerSykepengegrunnlag` i Spleis bak toggle for skyggekjøring

**Spec:** [Fastsette sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/fastsette-sykepengegrunnlag.md)

**Fase:** 2

**Repo:** `spleis`

**Hva skal lages:** Med togglen for skyggekjøring på går en periode fra `AvventerRettighetskategori` gjennom `AvventerSykepengegrunnlag`. Spleis sender `Sykepengegrunnlag` med skjæringstidspunktet, inntektsavklarings-ID-en og rettighetskategori-ID-en, og lagrer ID-en fra løsningen. `AvventerHistorikk` og `AvventerHistorikkRevurdering` sender `SykepengegrunnlagResultat` med den deterministiske ID-en, uten å bruke svaret. Spleis beregner som før.

**Blokkeres av:** [Inntekt 07: `AvventerInntektsavklaring` i Spleis bak toggle](../avklare-inntekt/07-spleis-avventer-inntektsavklaring.md), [Inntekt 09: Revurdering gjennom `AvventerInntektsavklaring`](../avklare-inntekt/09-revurdering-gjennom-avventer-inntektsavklaring.md)

**Status:** klar

## Akseptansekriterier

- [ ] Den nye tilstanden heter `AVVENTER_SYKEPENGEGRUNNLAG` i `TilstandType`, `TilstandTypeData`, `VedtaksperiodetilstandDto` og `SpannerPersonDto`, og spleis-api mapper den til `Periodetilstand.ForberederGodkjenning`. Serde-endringen er deployet før togglen skrus på.
- [ ] Med fullt vilkårsgrunnlag går perioden videre til `AvventerHistorikkRevurdering`. Ellers går den til `AvventerVilkårsprøving`.
- [ ] ID-en fra løsningen lagres i det minimale vilkårsgrunnlaget. Det fulle vilkårsgrunnlaget beholder den deterministiske ID-en før byttet.
- [ ] Før byttet ignorerer Spleis `utfall` og `årsak`.
- [ ] `SykepengegrunnlagResultat` sendes sammen med de andre behovene i `AvventerHistorikk` og `AvventerHistorikkRevurdering`, med `sykepengegrunnlagId` fra det fulle vilkårsgrunnlaget. Perioden venter ikke på svaret før byttet.
- [ ] Behovene sendes på nytt ved påminnelse når de ikke er besvart.
- [ ] Med togglen av går perioden rett til `AvventerVilkårsprøving` eller `AvventerHistorikkRevurdering` som i dag.
- [ ] `Sykepengegrunnlag` og `SykepengegrunnlagResultat` er med i `BehovkontraktTest`.
- [ ] E2e-tester dekker førstegangsbehandling, revurdering, påminnelse og togglen av og på.

## Merknader

- At perioden ikke venter på `SykepengegrunnlagResultat` før byttet, er et valg i denne ticketen, slik at feil i skyggekjøringen ikke stopper saker. Ticket [19](19-spleis-bruker-grunnlaget-fra-tjenesten.md) gjør svaret påkrevd bak bytte-togglen.
