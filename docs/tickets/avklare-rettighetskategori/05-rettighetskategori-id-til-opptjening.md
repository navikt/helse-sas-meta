# 05: Rettighetskategori-ID i opptjeningsbehovet

**Spec:** [Avklare rettighetskategori i sp-rettighetskategori](../../specs/avklare-rettighetskategori.md)

**Fase:** 5

**Repo:** `spleis`, `sp-vilkarsproving`

**Hva skal lages:** Spleis sender rettighetskategori-ID-en med i opptjeningsbehovet, slik at sp-vilkarsproving senere kan slå opp kategorien selv. sp-vilkarsproving tar imot ID-en, men bruker den ikke ennå. Ticketen starter når fase 1 er rullet ut. Feltet gjøres påkrevd i [14: Påkrevd rettighetskategori-ID i opptjeningsbehovet](14-pakrevd-rettighetskategori-id-i-opptjening.md).

**Blokkeres av:** [06: Rulle ut fase 1](06-rulle-ut-fase-1.md)

**Status:** ferdig

## Akseptansekriterier

- [x] sp-vilkarsproving tar imot feltet med rettighetskategori-ID i opptjeningsbehovet. Feltet er påkrevd, se ticket 14.
- [x] Spleis sender ID-en fra det minimale vilkårsgrunnlaget i opptjeningsbehovet fra `AvventerVilkårsprøving`. Finnes det ikke noe minimalt vilkårsgrunnlag, sendes ikke feltet.
- [ ] Spleis er deployet først. sp-vilkarsproving deployes etterpå, når kriteriene for deploy i ticket 14 er oppfylt. Spleis kan gå først fordi rivere ignorerer felter de ikke kjenner.
- [x] Feltet er lagt inn i `BehovkontraktTest` i Spleis og i river-testene i sp-vilkarsproving.
