# 09: Forkaste kombinerte rettighetskategorier i Spleis

**Spec:** [Avklare rettighetskategori i sp-rettighetskategori](../../specs/avklare-rettighetskategori.md)

**Fase:** 3

**Repo:** `spleis`

**Hva skal lages:** Med togglen for fase 3 på forkaster Spleis kombinerte sykefraværstilfeller på grunnlag av rettighetskategorien, ikke når søknaden kommer inn. Spleis bruker hovedkategorien i løsningen på `Rettighetskategori` når løsningen tas imot i `AvventerRettighetskategori`, men lagrer den ikke. En person med arbeidstaker og selvstendig næringsdrivende med samme skjæringstidspunkt får hele sykefraværstilfellet forkastet med en gang. Perioden som tar imot løsningen, får det nye varselet RV_RK_1, og ingen av periodene blir vilkårsprøvd eller henter ytelser først. Hver hovedkategori Spleis ikke støtter, får sitt eget varsel. I første versjon er Arbeidstaker og selvstendig næringsdrivende den eneste.

**Blokkeres av:** [06: Rulle ut fase 1](06-rulle-ut-fase-1.md)

**Status:** ferdig

## Akseptansekriterier

- [x] Spleis bruker hovedkategorien i løsningen på `Rettighetskategori` når løsningen tas imot i `AvventerRettighetskategori`. Det er ikke noe eget oppslag med `RettighetskategoriResultat`.
- [x] Spleis lagrer aldri hovedkategorien, verken i vilkårsgrunnlaget, på behandlingen eller noe annet sted (ADR 0001). Bare ID-en lagres i det minimale vilkårsgrunnlaget.
- [x] Ny varselkode `RV_RK_1("Støtter ikke kombinasjonen arbeidstaker og selvstendig næringsdrivende")`.
- [x] Er hovedkategorien Arbeidstaker og selvstendig næringsdrivende, forkaster Spleis sykefraværstilfellet i mottaket av løsningen, på tvers av yrkesaktiviteter. Perioden som tar imot løsningen, får RV_RK_1 og forkastes med den vanlige forkastingen, som tar med overlappende og etterfølgende perioder i samme operasjon. De andre periodene får ingen egen funksjonell feil (avvik fra specen, se merknadene). Spleis lagrer ikke noe minimalt vilkårsgrunnlag, og et eldre minimalt vilkårsgrunnlag for skjæringstidspunktet forsvinner med forkastingen.
- [x] Ingen av periodene i sykefraværstilfellet blir vilkårsprøvd eller går gjennom `AvventerHistorikk` før de forkastes. Spleis ber ikke om opptjening, medlemskap eller ytelser og beregner ikke perioder i et tilfelle som forkastes med RV_RK_1.
- [x] Forkastingen tar også med perioder som står i `AvventerVilkårsprøving` med et minimalt vilkårsgrunnlag, og perioder som kom inn etter søknaden, men før løsningen. Sjekken mot forkastede perioder fanger dem ikke.
- [x] `AvventerVilkårsprøving` slår ikke opp hovedkategorien og forkaster ikke på grunnlag av den.
- [x] Forkastingen gjelder bare perioder på vei til `AvventerVilkårsprøving`. På vei til `AvventerVilkårsprøvingRevurdering` bruker ikke Spleis hovedkategorien i løsningen.
- [x] Spleis gir ikke RV_RK_1 til søknader som kommer inn etter forkastingen, og slår ikke opp hovedkategorien for dem. De forkastes av sjekken mot forkastede perioder med et av varslene RV_SØ_31 til RV_SØ_38.
- [x] Spleis velger varselet med en uttømmende `when` over hovedkategoriene i løsningen. Kommer det en ny hovedkategori i kontrakten, kompilerer ikke Spleis før den har fått sitt eget varsel eller blir støttet.
- [x] Med togglen på kjører ikke RV_SØ_53 når søknaden kommer inn, så lenge skjæringstidspunktet ikke har et fullt vilkårsgrunnlag og den første perioden i sykefraværstilfellet vil spørre med den nye søknaden. Et minimalt vilkårsgrunnlag teller ikke som fullt.
- [x] Når skjæringstidspunktet har et fullt vilkårsgrunnlag, kjører RV_SØ_53 som i dag og forkaster bare den nye perioden.
- [x] Når den første perioden i sykefraværstilfellet allerede har spurt og slutter før den nye perioden starter, kjører RV_SØ_53 som i dag. At den har spurt, betyr at den står i `AvventerRettighetskategori` eller at skjæringstidspunktet har et minimalt vilkårsgrunnlag. Overlapper den nye perioden den første, spør den første perioden på nytt med begge søknadene, og RV_SØ_53 kjører ikke.
- [x] Med togglen av kjører RV_SØ_53 som i dag, og Spleis bruker ikke hovedkategorien i løsningen.
- [x] Ny varselkode `RV_RK_3("Perioden overlapper med eller ligger inntil en forkastet periode med en annen yrkesaktivitetstype")`. Med togglen på får en periode varselet når den beregnes i `AvventerHistorikk` eller `AvventerHistorikkRevurdering`, og en forkastet periode med en annen yrkesaktivitetstype overlapper eller ligger inntil den. Varselet hindrer at perioden går automatisk.
- [x] Sjekken av `andreInntektskilder` og RV_SØ_39 i `Start` er uendret.
- [x] Vilkårsprøvingen er uendret. Får en periode inntekt fra en annen yrkesaktivitet på skjæringstidspunktet, forkastes den med RV_IV_13 som i dag.
- [x] E2e-tester for samspillet med konsistenssjekken fra ticket 10, flyttet fra ticket 10:
  - AT 1.–31. januar og SN 1.–28. februar med samme skjæringstidspunkt, der SN-søknaden kommer mens AT-perioden står i `AvventerVilkårsprøving` med et minimalt vilkårsgrunnlag. SN-perioden forkastes med RV_SØ_53 når søknaden kommer inn, og AT-perioden får RV_RK_3 når den beregnes.
  - Det samme med togglen av, der SN-perioden forkastes med RV_SØ_53 og AT-perioden ikke får RV_RK_3.
  - Omvendt rekkefølge: SN 1.–31. januar står i `AvventerVilkårsprøving` med et minimalt vilkårsgrunnlag, og AT 1.–28. februar kommer inn. AT forkastes med RV_SØ_53, og SN får RV_RK_3 når den beregnes.
- [x] E2e-tester dekker: AT og SN som overlapper skjæringstidspunktet, der begge periodene forkastes i samme hendelse som løsningen og ingen blir vilkårsprøvd eller ber om ytelser, AT 1.–31. januar og SN 1.–28. februar med samme skjæringstidspunkt der begge søknadene er sendt før AT-perioden spør, som også forkaster begge periodene, en søknad som overlapper eller forlenger tilfellet etter forkastingen og får et av varslene RV_SØ_31 til RV_SØ_38, en søknad som kommer inn mens perioden står i `AvventerRettighetskategori`, en søknad som overlapper skjæringstidspunktet og kommer inn mens perioden står i `AvventerVilkårsprøving` med et minimalt vilkårsgrunnlag, en løsning på et eldre behov, en søknad som forlenger en senere periode når den første perioden har spurt, revurdering som flytter skjæringstidspunktet uten forkasting, at hovedkategorien ikke finnes i person-JSON-en, en ny yrkesaktivitet etter utbetaling, en selvstendig søknad rett før en utbetalt arbeidstakerperiode, og togglen av. Testene ligger i `KombinertTest`.

## Fra ticket 10

- Togglen for fase 3 finnes allerede: `Toggle.ValidereRettighetskategori`.
- Gatingen av RV_SØ_53 hører hit. Løst i `Vedtaksperiode.håndterSøknadFørsteGang`: med togglen på kjører RV_SØ_53 etter at søknaden er lagt til. Den kjører når skjæringstidspunktet til den nye perioden har fullt vilkårsgrunnlag, når en periode av en annen type som overlapper eller ligger inntil, hadde fullt vilkårsgrunnlag før søknaden kom, eller når den første perioden i sykefraværstilfellet har spurt og slutter før den nye perioden.
- Inntektsfilteret i `Vedtaksperiode.avklarSykepengegrunnlag` er droppet. Se merknadene.

## Åpne spørsmål

- **Lukket: Når Spleis ikke lagrer det minimale vilkårsgrunnlaget (fra ticket 04).** `VilkårsgrunnlagHistorikk.lagre` for `Rettighetskategorigrunnlag` lagrer ikke det minimale vilkårsgrunnlaget hvis skjæringstidspunktet allerede har et fullt vilkårsgrunnlag. Vi har bestemt at hovedkategorien vinner: Sier løsningen at hovedkategorien ikke støttes, forkaster Spleis sykefraværstilfellet med varselet for hovedkategorien, også når skjæringstidspunktet har et fullt vilkårsgrunnlag. Forkastingen skjer før Spleis prøver å lagre noe. Perioden kommer bare til `AvventerRettighetskategori` på vei til `AvventerVilkårsprøving` når skjæringstidspunktet mangler fullt vilkårsgrunnlag, så tilfellet skal sjelden eller aldri skje. Når løsningen støttes, logger Spleis fortsatt bare en info-melding, som før.

## Merknader fra implementasjonen

- Togglen heter `Toggle.ValidereRettighetskategori` (`VALIDERE_RETTIGHETSKATEGORI`). Den er av som standard og er ikke lagt inn i Nais. Ticket 10 bruker den samme togglen, og ticket 11 skrur den på.
- Bevisst avvik fra specen: Bare perioden som tar imot løsningen, får RV_RK_1. Den forkastes med den vanlige forkastingen (`forkast`), som tar med overlappende og etterfølgende perioder på tvers av yrkesaktiviteter. De andre periodene får ingen egen funksjonell feil. Slik er det ellers i Spleis også: når RV_SØ_53 eller andre feil forkaster, er det bare perioden som utløser forkastingen som får feilen. Sammenligningen i brukerhistorie 37 teller sykefraværstilfeller, og hvert tilfelle har fortsatt minst én RV_RK_1. En tidligere periode som ikke overlapper perioden som spør, forkastes ikke i samme operasjon. Den gjenopptar behandlingen, spør selv og forkastes på sin egen løsning. Normalt er det den første perioden i tilfellet som spør.
- Med togglen på kjører RV_SØ_53 etter at søknaden er lagt til, fordi skjæringstidspunktet til den nye perioden først er kjent da. Har perioden allerede en funksjonell feil, for eksempel RV_SØ_39 eller et av varslene for forkastede perioder, får den ikke RV_SØ_53 i tillegg. Med togglen av er rekkefølgen som før.
- En SN-søknad som overlapper en utbetalt AT-periode, forkastes med RV_SØ_53, og AT-perioden blir åpnet for revurdering. Det er det samme som skjer med togglen av.
- En SN-søknad som ligger rett før en utbetalt AT-periode, flytter skjæringstidspunktet til en dato uten fullt vilkårsgrunnlag. Derfor teller også perioder av en annen type som hadde fullt vilkårsgrunnlag før søknaden kom. Slike søknader forkastes med RV_SØ_53, som i dag. AT-perioden revurderes og får RV_RK_3.
- Når en selvstendig periode vilkårsprøves, tas ikke arbeidstakerperiodene med samme skjæringstidspunkt med. Har arbeidsgiveren deres inntekt i skatt, blir den regnet som ghost, og perioden forkastes med RV_IV_13. Det er det samme som skjer med togglen av, der arbeidstakerperioden er forkastet med RV_SØ_53 før vilkårsprøvingen.
- Vi droppet inntektsfilteret i `avklarSykepengegrunnlag`. Det fantes bare for å la en periode som var avgjort, gå videre, slik at kombinasjonen ble forkastet senere med RV_RK_2. I stedet forkaster RV_SØ_53 søknader som den første perioden ikke spør med. Det ligner mer på hvordan Spleis virker med togglen av, og RV_RK_2 fra ticket 10 slår til sjeldnere enn specen først la opp til.
- RV_RK_3 er nytt. Uten det går en periode automatisk når en periode med en annen yrkesaktivitetstype som overlapper eller ligger inntil, er forkastet med RV_SØ_53. Det gjelder både en periode som forlenges, og en utbetalt periode som revurderes fordi en søknad rett før den er forkastet. Varselet kommer når perioden beregnes, slik at det havner på den åpne behandlingen. Med togglen av gis ikke varselet.
- Kjent hull med togglen på: SN 1.–31. januar står i `AvventerRettighetskategori`, og en AT-søknad for januar kommer inn. SN-perioden spør på nytt med begge søknadene. Kommer løsningen på det gamle behovet (Selvstendig næringsdrivende) før den nye, tar Spleis den imot, fordi den ikke sjekker hvilket behov løsningen svarer på. Mangler AT-perioden inntektsmelding, feiler vilkårsprøvingen av SN med «Fant ikke noen periode i forventet tilstand». I omvendt rekkefølge (AT først) forkastes AT-perioden med RV_IV_13 i vilkårsprøvingen.
- En revurdering der løsningen gir Arbeidstaker og selvstendig næringsdrivende, forkastes ikke. Den får RV_RK_2 som varsel i `AvventerHistorikkRevurdering` (ticket 10), så den går ikke automatisk.
- Testene ligger i `KombinertTest` i sykepenger-model.
