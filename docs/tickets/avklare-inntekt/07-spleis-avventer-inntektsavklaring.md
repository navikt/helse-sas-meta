# 07: `AvventerInntektsavklaring` i Spleis bak toggle

**Spec:** [Avklare inntekt i sp-inntekt](../../specs/avklare-inntekt.md)

**Fase:** 1

**Repo:** `spleis`, `sp-rettighetskategori`

**Hva skal lages:** Med togglen på går en periode fra `AvventerBlokkerendePeriode` gjennom `AvventerInntektsavklaring` til `AvventerRettighetskategori`. Spleis sender behovet `Inntektsavklaring` med én linje per arbeidsgiver og inntektskilden den har valgt, og en linje for selvstendig næringsdrivende. Spleis lagrer ID-en fra løsningen i det minimale vilkårsgrunnlaget og sender den videre i `Rettighetskategori`. Spleis beregner som før.

**Blokkeres av:** [06: Inntektsavklarings-ID og sykepengegrunnlag-ID på alle vilkårsgrunnlag i Spleis](06-ider-pa-alle-vilkarsgrunnlag.md)

**Status:** klar

## Akseptansekriterier

- [ ] Den nye tilstanden heter `AVVENTER_INNTEKTSAVKLARING` i `TilstandType`, `TilstandTypeData`, `VedtaksperiodetilstandDto` og `SpannerPersonDto`, og spleis-api mapper den til `Periodetilstand.ForberederGodkjenning`. Serde-endringen er deployet før togglen skrus på.
- [ ] Behovet har `skjæringstidspunkt`, `nyInnhenting` og `yrkesaktiviteter` med feltene og verdiene i specen.
- [ ] Spleis velger kilden for hver arbeidsgiver med den samme logikken som i dag (`Inntektssituasjon`), og sender meldingsreferanse-ID-en til inntekten på den første behandlingen når kilden er `ARBEIDSGIVER`.
- [ ] Arbeidsforhold uten søknad sendes ikke.
- [ ] Det minimale vilkårsgrunnlaget lages i `AvventerInntektsavklaring` med `inntektsavklaringId`. `rettighetskategoriId` legges til i `AvventerRettighetskategori`.
- [ ] Behovet `Rettighetskategori` har feltet `Rettighetskategori.inntektsavklaringId`. sp-rettighetskategori tåler feltet uten å bruke det.
- [ ] Behovet sendes på nytt ved påminnelse når det ikke er besvart.
- [ ] Med togglen av går perioden rett til `AvventerRettighetskategori` som i dag.
- [ ] `Inntektsavklaring` og det nye feltet i `Rettighetskategori` er med i `BehovkontraktTest`.
- [ ] E2e-tester i sykepenger-model dekker én og flere arbeidsgivere, selvstendig næringsdrivende, hver grunn til å bruke a-ordningen, forlengelser som ikke går gjennom tilstanden, påminnelse og togglen av og på.
