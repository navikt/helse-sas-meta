# 09: Forkaste kombinerte rettighetskategorier i Spleis

**Spec:** [Avklare rettighetskategori i sp-rettighetskategori](../../specs/avklare-rettighetskategori.md)

**Fase:** 3

**Repo:** `spleis`

**Hva skal lages:** Med togglen for fase 3 på forkaster Spleis kombinerte sykefraværstilfeller på grunnlag av rettighetskategorien, ikke når søknaden kommer inn. Spleis bruker hovedkategorien i løsningen på `Rettighetskategori` når løsningen tas imot i `AvventerRettighetskategori`, men lagrer den ikke. En person med arbeidstaker og selvstendig næringsdrivende med samme skjæringstidspunkt får hele sykefraværstilfellet forkastet med en gang. Alle periodene får det nye varselet RV_RK_1, og ingen av dem blir vilkårsprøvd eller henter ytelser først. Hver hovedkategori Spleis ikke støtter, får sitt eget varsel. I første versjon er Arbeidstaker og selvstendig næringsdrivende den eneste.

**Blokkeres av:** [06: Rulle ut fase 1](06-rulle-ut-fase-1.md)

**Status:** klar

## Akseptansekriterier

- [ ] Spleis bruker hovedkategorien i løsningen på `Rettighetskategori` når løsningen tas imot i `AvventerRettighetskategori`. Det er ikke noe eget oppslag med `RettighetskategoriResultat`.
- [ ] Spleis lagrer aldri hovedkategorien, verken i vilkårsgrunnlaget, på behandlingen eller noe annet sted (ADR 0001). Bare ID-en lagres i det minimale vilkårsgrunnlaget.
- [ ] Ny varselkode `RV_RK_1("Støtter ikke kombinasjonen arbeidstaker og selvstendig næringsdrivende")`.
- [ ] Er hovedkategorien Arbeidstaker og selvstendig næringsdrivende, forkaster Spleis hele sykefraværstilfellet i mottaket av løsningen, på tvers av yrkesaktiviteter. Alle periodene forkastes i samme operasjon, og alle får RV_RK_1. Spleis lagrer ikke noe minimalt vilkårsgrunnlag, og et eldre minimalt vilkårsgrunnlag for skjæringstidspunktet forsvinner med forkastingen.
- [ ] Ingen av periodene i sykefraværstilfellet blir vilkårsprøvd eller går gjennom `AvventerHistorikk` før de forkastes. Spleis ber ikke om opptjening, medlemskap eller ytelser og beregner ikke perioder i et tilfelle som forkastes med RV_RK_1.
- [ ] Forkastingen tar også med perioder som står i `AvventerVilkårsprøving` med et minimalt vilkårsgrunnlag, og perioder som kom inn etter søknaden, men før løsningen. Sjekken mot forkastede perioder fanger dem ikke.
- [ ] `AvventerVilkårsprøving` slår ikke opp hovedkategorien og forkaster ikke på grunnlag av den.
- [ ] Forkastingen gjelder bare perioder på vei til `AvventerVilkårsprøving`. På vei til `AvventerVilkårsprøvingRevurdering` bruker ikke Spleis hovedkategorien i løsningen.
- [ ] Spleis gir ikke RV_RK_1 til søknader som kommer inn etter forkastingen, og slår ikke opp hovedkategorien for dem. De forkastes av sjekken mot forkastede perioder med et av varslene RV_SØ_31 til RV_SØ_38.
- [ ] Spleis velger varselet med en uttømmende `when` over hovedkategoriene i løsningen. Kommer det en ny hovedkategori i kontrakten, kompilerer ikke Spleis før den har fått sitt eget varsel eller blir støttet.
- [ ] Med togglen på kjører ikke RV_SØ_53 når søknaden kommer inn, så lenge skjæringstidspunktet ikke har et fullt vilkårsgrunnlag. Et minimalt vilkårsgrunnlag teller ikke.
- [ ] Når skjæringstidspunktet har et fullt vilkårsgrunnlag, kjører RV_SØ_53 som i dag og forkaster bare den nye perioden.
- [ ] Med togglen av kjører RV_SØ_53 som i dag, og Spleis bruker ikke hovedkategorien i løsningen.
- [ ] Sjekken av `andreInntektskilder` og RV_SØ_39 i `Start` er uendret.
- [ ] E2e-tester dekker: AT og SN som overlapper skjæringstidspunktet, der alle periodene forkastes med RV_RK_1 i samme hendelse som løsningen og ingen blir vilkårsprøvd eller ber om ytelser, AT 1.–31. januar og SN 1.–28. februar med samme skjæringstidspunkt der begge søknadene er sendt før AT-perioden spør, som også forkaster begge periodene med RV_RK_1, en søknad som overlapper eller forlenger tilfellet etter forkastingen og får et av varslene RV_SØ_31 til RV_SØ_38, en søknad som kommer inn mens perioden står i `AvventerRettighetskategori`, en søknad som overlapper skjæringstidspunktet og kommer inn mens perioden står i `AvventerVilkårsprøving` med et minimalt vilkårsgrunnlag, revurdering som flytter skjæringstidspunktet uten forkasting, at hovedkategorien ikke finnes i person-JSON-en, en ny yrkesaktivitet etter utbetaling, og togglen av. Tester å bygge videre på: `KombinertTest`.
