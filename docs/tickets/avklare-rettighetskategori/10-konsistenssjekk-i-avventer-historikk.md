# 10: Konsistenssjekk av rettighetskategori i `AvventerHistorikk`

**Spec:** [Avklare rettighetskategori i sp-rettighetskategori](../../specs/avklare-rettighetskategori.md)

**Fase:** 3

**Repo:** `spleis`

**Hva skal lages:** Med togglen for fase 3 på forkaster Spleis perioder der hovedkategorien ikke stemmer med periodens yrkesaktivitetstype. Det gjelder også forlengelser og revurderinger, som ikke går gjennom vilkårsprøving, og perioder med vilkårsgrunnlag fra før fase 1. En selvstendig forlengelse av et sykefraværstilfelle med hovedkategorien Arbeidstaker blir forkastet med det nye varselet RV_RK_2. I dag forkastes den med RV_SØ_53.

**Blokkeres av:** [06: Rulle ut fase 1](06-rulle-ut-fase-1.md), [08: Innfylling av historikken i sp-rettighetskategori](08-innfylling-i-sp-rettighetskategori.md)

**Status:** klar

## Akseptansekriterier

- [ ] `AvventerHistorikk` slår opp hovedkategorien med `RettighetskategoriResultat` sammen med ytelsene, slik opptjening gjør.
- [ ] Ny varselkode `RV_RK_2("Perioden har en annen yrkesaktivitetstype enn rettighetskategorien")`.
- [ ] Stemmer ikke hovedkategorien med periodens yrkesaktivitetstype, forkastes perioden med RV_RK_2.
- [ ] Konsistenssjekken er ikke det som forkaster de andre periodene i et kombinert sykefraværstilfelle. De forkastes i mottaket av løsningen i `AvventerRettighetskategori` (ticket 09) og kommer aldri til `AvventerHistorikk`.
- [ ] `AvventerHistorikk` er det eneste stedet Spleis slår opp hovedkategorien med `RettighetskategoriResultat`. Spleis slår alltid opp hovedkategorien når togglen er på. Det finnes ingen vei utenom sjekken for perioder uten rettighetskategori-ID.
- [ ] `RettighetskategoriResultat` er lagt inn i `BehovkontraktTest`.
- [ ] Er `RettighetskategoriResultat` ubesvart, står perioden i `AvventerHistorikk` og sender behovet på nytt ved påminnelse.
- [ ] E2e-tester dekker: AT 1.–31. januar og SN 1.–28. februar med samme skjæringstidspunkt, der SN-søknaden kommer mens AT-perioden står i `AvventerVilkårsprøving` med et minimalt vilkårsgrunnlag. SN-perioden er ikke med i søknadssettet, venter til vilkårsgrunnlaget er fullt og forkastes med RV_RK_2, mens AT behandles videre. Testene dekker også en forlengelse av et vilkårsgrunnlag fra før fase 1 med deterministisk ID.
