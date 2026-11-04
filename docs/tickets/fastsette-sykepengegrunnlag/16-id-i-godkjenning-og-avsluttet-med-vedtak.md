# 16: Sykepengegrunnlag-ID i godkjenningsbehovet og `avsluttet_med_vedtak`

**Spec:** [Fastsette sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/fastsette-sykepengegrunnlag.md)

**Fase:** 3

**Repo:** `spleis`

**Hva skal lages:** Godkjenningsbehovet får `Godkjenning.sykepengegrunnlagId`, og `avsluttet_med_vedtak` får `sykepengegrunnlagId`, slik at Spesialist kan hente grunnlaget selv. `sykepengegrunnlagsfakta` sendes fortsatt fram til opprydningen.

**Blokkeres av:** [Inntekt 06: Inntektsavklarings-ID og sykepengegrunnlag-ID på alle vilkårsgrunnlag i Spleis](../avklare-inntekt/06-ider-pa-alle-vilkarsgrunnlag.md)

**Status:** klar

## Akseptansekriterier

- [ ] Begge feltene har ID-en fra det fulle vilkårsgrunnlaget.
- [ ] `sykepengegrunnlagsfakta` er uendret.
- [ ] De nye feltene er med i `BehovkontraktTest` og i testene for `avsluttet_med_vedtak`.
