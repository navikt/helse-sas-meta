# 20: Minsteinntekt med sykepengegrunnlaget fra oppslaget

**Spec:** [Avklare sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/avklare-sykepengegrunnlag.md)

**Fase:** 3

**Repo:** `spleis`

**Hva skal lages:** Med togglen for fase 3 på slår `AvventerVilkårsprøving` og `AvventerVilkårsprøvingRevurdering` opp beløpene med `SykepengegrunnlagResultat` og vurderer minsteinntekt etter §§ 8-3 og 8-47 med sykepengegrunnlaget fra oppslaget. Nye fulle vilkårsgrunnlag får ikke eget inntektsgrunnlag.

**Blokkeres av:** [10: Rulle ut fase 1](10-rulle-ut-fase-1.md), [13: Backfill av historikken i sp-sykepengegrunnlag](13-backfill-i-sp-sykepengegrunnlag.md), [18: Forkaste med RV_IV_12 i `AvventerSykepengegrunnlag`](18-forkaste-med-rv-iv-12.md), [19: Kartlegge og samle lesingen av inntektsgrunnlaget i Spleis](19-samle-lesingen-av-inntektsgrunnlaget.md)

**Status:** klar

## Akseptansekriterier

- [ ] `SykepengegrunnlagResultat` sendes med `sykepengegrunnlagId` sammen med de andre behovene for vilkårsprøving.
- [ ] Minsteinntekten vurderes med `sykepengegrunnlag` fra løsningen.
- [ ] Det fulle vilkårsgrunnlaget lages uten eget inntektsgrunnlag og med ID-en fra tjenesten.
- [ ] Med togglen av virker alt som før.
- [ ] E2e-tester med togglen av og på dekker sykepengegrunnlag over og under minsteinntekten.
