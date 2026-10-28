# 09: Forkaste kombinerte rettighetskategorier i Spleis

**Spec:** [Avklare rettighetskategori i sp-rettighetskategori](../../specs/avklare-rettighetskategori.md)

**Fase:** 3

**Repo:** `spleis`

**Hva skal lages:** Med togglen for fase 3 på forkaster Spleis kombinerte sykefraværstilfeller på grunnlag av rettighetskategorien, ikke når søknaden kommer inn. En person med arbeidstaker og selvstendig næringsdrivende med samme skjæringstidspunkt får hele sykefraværstilfellet forkastet med en gang. Alle periodene får det nye varselet RV_RK_1, og ingen av dem henter ytelser først. Hver hovedkategori Spleis ikke støtter, får sitt eget varsel. I første versjon er Arbeidstaker og selvstendig næringsdrivende den eneste.

**Blokkeres av:** [06: Rulle ut fase 1](06-rulle-ut-fase-1.md), [08: Innfylling av historikken i sp-rettighetskategori](08-innfylling-i-sp-rettighetskategori.md)

**Status:** klar

## Akseptansekriterier

- [ ] `AvventerVilkårsprøving` slår opp hovedkategorien med behovet `RettighetskategoriResultat`, med ID-en fra det minimale vilkårsgrunnlaget.
- [ ] Ny varselkode `RV_RK_1("Støtter ikke kombinasjonen arbeidstaker og selvstendig næringsdrivende")`.
- [ ] Er hovedkategorien Arbeidstaker og selvstendig næringsdrivende, forkaster Spleis hele sykefraværstilfellet med en gang, på tvers av yrkesaktiviteter. Alle periodene forkastes i samme operasjon, og alle får RV_RK_1.
- [ ] De andre periodene i sykefraværstilfellet går ikke gjennom `AvventerHistorikk` før de forkastes. Spleis ber ikke om ytelser og beregner ikke perioder i et tilfelle som forkastes med RV_RK_1.
- [ ] Spleis gir ikke RV_RK_1 til søknader som kommer inn etter forkastingen, og slår ikke opp hovedkategorien for dem. De forkastes av sjekken mot forkastede perioder med et av varslene RV_SØ_31 til RV_SØ_38.
- [ ] Spleis velger varselet med en uttømmende `when` over hovedkategoriene i løsningen. Kommer det en ny hovedkategori i kontrakten, kompilerer ikke Spleis før den har fått sitt eget varsel eller blir støttet.
- [ ] Forkastingen tar også med perioder som kom inn etter søknaden, men før `AvventerVilkårsprøving`. Sjekken mot forkastede perioder fanger dem ikke.
- [ ] Med togglen på kjører ikke RV_SØ_53 når søknaden kommer inn, så lenge skjæringstidspunktet ikke har et fullt vilkårsgrunnlag. Et minimalt vilkårsgrunnlag teller ikke.
- [ ] Når skjæringstidspunktet har et fullt vilkårsgrunnlag, kjører RV_SØ_53 som i dag og forkaster bare den nye perioden.
- [ ] Med togglen av kjører RV_SØ_53 som i dag, og Spleis slår ikke opp hovedkategorien.
- [ ] Sjekken av `andreInntektskilder` og RV_SØ_39 i `Start` er uendret.
- [ ] `RettighetskategoriResultat` er lagt inn i `BehovkontraktTest`.
- [ ] E2e-tester dekker: AT og SN som overlapper skjæringstidspunktet, der alle periodene forkastes i samme hendelse med RV_RK_1 og ingen ber om ytelser, AT 1.–31. januar og SN 1.–28. februar med samme skjæringstidspunkt der begge søknadene er sendt før AT-perioden spør, som også forkaster begge periodene med RV_RK_1, en søknad som overlapper eller forlenger tilfellet etter forkastingen og får et av varslene RV_SØ_31 til RV_SØ_38, en søknad som kommer inn mens perioden står i `AvventerRettighetskategori`, en søknad som kommer inn mens perioden står i `AvventerVilkårsprøving` med et minimalt vilkårsgrunnlag, en ny yrkesaktivitet etter utbetaling, og togglen av. Tester å bygge videre på: `KombinertTest`.
