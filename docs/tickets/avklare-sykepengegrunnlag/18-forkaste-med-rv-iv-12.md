# 18: Forkaste med RV_IV_12 i `AvventerSykepengegrunnlag`

**Spec:** [Avklare sykepengegrunnlag i sp-sykepengegrunnlag](../../specs/avklare-sykepengegrunnlag.md)

**Fase:** 3

**Repo:** `spleis`

**Hva skal lages:** Med togglen for fase 3 på forkaster Spleis hele sykefraværstilfellet i `AvventerSykepengegrunnlag` med RV_IV_12 når løsningen er `FÆRRE_ENN_TRE_FERDIGLIGNEDE_ÅR`. RV_IV_12 når søknaden kommer inn, er slått av.

**Blokkeres av:** [10: Rulle ut fase 1](10-rulle-ut-fase-1.md)

**Status:** klar

## Akseptansekriterier

- [ ] Togglen for fase 3 finnes i Spleis og er av i alle miljøer.
- [ ] Med togglen på forkastes hele sykefraværstilfellet med RV_IV_12, på samme måte som RV_RK_1 i `AvventerRettighetskategori`. ID-en lagres ikke.
- [ ] Med togglen på gir ikke søknaden RV_IV_12.
- [ ] Med togglen av virker alt som i fase 1.
- [ ] E2e-tester med togglen av og på dekker selvstendig næringsdrivende med og uten tre ferdiglignede år.
