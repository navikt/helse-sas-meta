# 07: `AvventerSykepengegrunnlag` i Spleis bak toggle

**Spec:** [Avklare sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/avklare-sykepengegrunnlag.md)

**Fase:** 1

**Repo:** `spleis`

**Hva skal lages:** Med togglen for fase 1 på går perioden gjennom den nye tilstanden `AvventerSykepengegrunnlag` på vei til `AvventerVilkårsprøving` og `AvventerVilkårsprøvingRevurdering`. Der sender Spleis behovet `Sykepengegrunnlag` og lagrer ID-en fra løsningen. Spleis beregner fortsatt med sitt eget inntektsgrunnlag.

**Blokkeres av:** [06: Sykepengegrunnlag-ID på alle vilkårsgrunnlag i Spleis](06-sykepengegrunnlag-id-pa-alle-vilkarsgrunnlag.md)

**Status:** klar

## Akseptansekriterier

- [ ] Tilstanden ligger mellom `AvventerRettighetskategori` og `AvventerVilkårsprøving`, og tilsvarende før `AvventerVilkårsprøvingRevurdering`.
- [ ] Perioden går alltid gjennom tilstanden når togglen er på.
- [ ] Behovet har `skjæringstidspunkt`, `rettighetskategoriId` og én rad i `arbeidsgivere` per arbeidsgiver med en periode som ikke er forkastet og har samme skjæringstidspunkt.
- [ ] `inntektsmelding` er referanse-ID-en til hendelsen bak den faktaavklarte inntekten som gjelder, eller `null` når inntekten fra a-ordningen er lagt til grunn.
- [ ] Selvstendig næringsdrivende sender en tom liste i `arbeidsgivere`.
- [ ] Løsningen lagrer ID-en i det minimale vilkårsgrunnlaget, og perioden går videre. Det fulle vilkårsgrunnlaget tar med seg ID-en.
- [ ] I fase 1 går perioden videre også ved `FÆRRE_ENN_TRE_FERDIGLIGNEDE_ÅR`, men uten å lagre ID-en, slik at den deterministiske ID-en brukes.
- [ ] Påminnelse sender behovet på nytt.
- [ ] En ny eller korrigert inntektsmelding som endrer hvilken inntektsmelding som gjelder, sender perioden gjennom tilstanden på vei til `AvventerVilkårsprøvingRevurdering`. Det nye vilkårsgrunnlaget får den nye ID-en.
- [ ] `AVVENTER_SYKEPENGEGRUNNLAG` finnes i `TilstandType`, `TilstandTypeData`, `VedtaksperiodetilstandDto` og `SpannerPersonDto`. spleis-api mapper den til `Periodetilstand.ForberederGodkjenning`.
- [ ] Serde for tilstanden er ute i prod før togglen skrus på.
- [ ] E2e-tester med togglen av og på dekker én arbeidsgiver med inntektsmelding, inntekt fra a-ordningen, to arbeidsgivere, selvstendig næringsdrivende, påminnelse og korrigert inntektsmelding.
