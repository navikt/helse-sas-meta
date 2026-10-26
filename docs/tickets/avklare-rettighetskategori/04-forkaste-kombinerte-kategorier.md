# 04: Forkaste kombinerte rettighetskategorier i Spleis

**Spec:** [Avklare rettighetskategori i sp-rettighetskategori](../../specs/avklare-rettighetskategori.md)

**Repo:** `spleis`

**Hva skal lages:** Med togglen på forkaster Spleis kombinerte sykefraværstilfeller på grunnlag av rettighetskategorien, ikke når søknaden kommer inn. En person med arbeidstaker og selvstendig næringsdrivende som overlapper skjæringstidspunktet, får hele sykefraværstilfellet forkastet med RV_SØ_53, som i dag.

**Blokkeres av:** [03: `AvventerRettighetskategori` i Spleis bak toggle](03-spleis-avventer-rettighetskategori.md)

**Status:** klar

## Akseptansekriterier

- [ ] `AvventerVilkårsprøving` slår opp hovedkategorien med behovet `RettighetskategoriResultat`.
- [ ] Er hovedkategorien en kombinasjon, forkaster Spleis hele sykefraværstilfellet med RV_SØ_53, på tvers av yrkesaktiviteter.
- [ ] Forkastingen tar også med perioder som kom inn etter søknaden, men før `AvventerVilkårsprøving`. Sjekken mot forkastede perioder fanger dem ikke.
- [ ] Med togglen på kjører ikke RV_SØ_53 når søknaden kommer inn, så lenge rettighetskategorien ikke er avgjort for skjæringstidspunktet.
- [ ] Når rettighetskategorien er avgjort, kjører RV_SØ_53 som i dag og forkaster bare den nye perioden.
- [ ] Med togglen av kjører RV_SØ_53 som i dag.
- [ ] Sjekken av `andreInntektskilder` og RV_SØ_39 i `Start` er uendret.
- [ ] `RettighetskategoriResultat` er lagt inn i `BehovkontraktTest`.
- [ ] E2e-tester dekker: AT og SN som overlapper skjæringstidspunktet, en søknad som kommer inn mens perioden står i `AvventerRettighetskategori`, en ny yrkesaktivitet etter utbetaling, og togglen av. Tester å bygge videre på: `KombinertTest`.
