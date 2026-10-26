# 05: Konsistenssjekk av rettighetskategori i `AvventerHistorikk`

**Spec:** [Avklare rettighetskategori i sp-rettighetskategori](../../specs/avklare-rettighetskategori.md)

**Repo:** `spleis`

**Hva skal lages:** Spleis forkaster perioder der hovedkategorien ikke stemmer med periodens yrkesaktivitetstype. Det gjelder også forlengelser og revurderinger, som ikke går gjennom vilkårsprøving. En selvstendig forlengelse av et sykefraværstilfelle med hovedkategorien Arbeidstaker blir forkastet med RV_SØ_53, som i dag.

**Blokkeres av:** [03: `AvventerRettighetskategori` i Spleis bak toggle](03-spleis-avventer-rettighetskategori.md)

**Status:** klar

## Akseptansekriterier

- [ ] `AvventerHistorikk` slår opp hovedkategorien med `RettighetskategoriResultat` sammen med ytelsene, slik opptjening gjør.
- [ ] Stemmer ikke hovedkategorien med periodens yrkesaktivitetstype, forkastes perioden med RV_SØ_53.
- [ ] Mangler skjæringstidspunktet rettighetskategori-ID, hopper Spleis over oppslaget og sjekken og bruker yrkesaktivitetstypen som før.
- [ ] E2e-tester dekker: AT 1.–31. januar og SN 1.–28. februar med samme skjæringstidspunkt, der SN forkastes og AT behandles videre, og en periode fra før togglen uten rettighetskategori-ID.
