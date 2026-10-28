# Avklare rettighetskategori i sp-rettighetskategori

[Tickets](../tickets/avklare-rettighetskategori/) · [ADR 0001](../adr/0001-spleis-lagrer-bare-id-for-rettighetskategori.md) · [ADR 0002](../adr/0002-alle-vilkarsgrunnlag-far-rettighetskategori-id.md) · [ADR 0003](../adr/0003-minimalt-vilkarsgrunnlag-for-rettighetskategori.md)

## Problem

Spleis avgjør i dag ikke rettighetskategorien eksplisitt. Spleis utleder om en periode gjelder arbeidstaker eller selvstendig næringsdrivende fra yrkesaktivitetstypen på søknaden. Kombinasjoner av yrkesaktiviteter fanger Spleis opp i det søknaden kommer inn, og forkaster da perioden med RV_SØ_53. Avgjørelsen er spredt i sjekker ved søknadshåndteringen, er ikke lagret noe sted og kan ikke overstyres av saksbehandler.

Vi trenger rettighetskategorien som eget begrep for å kunne behandle kombinerte yrkesaktiviteter (§§ 8-40 til 8-43) og for å la opptjening og senere regler bruke den. Saksbehandler skal også kunne overstyre den, på samme måte som opptjening.

## Løsning

En ny tjeneste, sp-rettighetskategori, avgjør rettighetskategorien én gang per skjæringstidspunkt. Spleis får en ny tilstand, `AvventerRettighetskategori`, mellom `AvventerBlokkerendePeriode` og `AvventerVilkårsprøving`. Der spør Spleis tjenesten og får tilbake en ID og hovedkategorien. Spleis lagrer bare ID-en, i et minimalt vilkårsgrunnlag for skjæringstidspunktet. Hovedkategorien bruker Spleis bare når løsningen tas imot, til å forkaste kategorier den ikke støtter. Det fulle vilkårsgrunnlaget som lages i `AvventerVilkårsprøving`, erstatter det minimale og tar med seg ID-en. Når Spleis trenger kategorien senere, slår den opp med ID-en.

I første versjon forkaster Spleis de samme periodene som i dag, men med egne varsler. sp-rettighetskategori gir bare hovedkategoriene Arbeidstaker, Selvstendig næringsdrivende og Arbeidstaker og selvstendig næringsdrivende, og avgjør dem like presist som Spleis gjør i dag. Hver hovedkategori Spleis ikke støtter, får sitt eget varsel. Arbeidstaker og selvstendig næringsdrivende forkastes med RV_RK_1. Når Spleis ser i løsningen i `AvventerRettighetskategori` at hovedkategorien ikke støttes, forkastes alle periodene i sykefraværstilfellet med en gang, og alle får varselet. Spleis vilkårsprøver ikke før den forkaster, og de andre periodene går ikke gjennom `AvventerHistorikk` først, så Spleis henter ikke ytelser og beregner ikke perioder som uansett skal forkastes. En periode der hovedkategorien ikke stemmer med yrkesaktivitetstypen, forkastes med RV_RK_2. RV_SØ_53 ved søknadshåndteringen blir værende for skjæringstidspunkter som har fullt vilkårsgrunnlag.

Alle vilkårsgrunnlag skal ha en rettighetskategori-ID, også de som finnes fra før. Spleis gir eksisterende vilkårsgrunnlag en deterministisk ID med en JSON-migrering, slik den gjorde for `opptjeningsvurderingId`. sp-rettighetskategori fyller inn avgjørelsene bak disse ID-ene i ettertid, med data fra spleis-api. Uten dette ville Spleis hoppe over RV_SØ_53 når søknaden kommer inn, og så hoppe over konsistenssjekken senere fordi skjæringstidspunktet mangler ID. Da slipper kombinasjoner gjennom.

### Faser

Vi ruller ut i fire faser. Hver fase rulles ut i dev før prod, med én toggle i Spleis per fase. Togglen fra én fase er fjernet før neste fase får sin.

1. **Lage ID-er uten å bruke dem.** Alle vilkårsgrunnlag får rettighetskategori-ID. sp-rettighetskategori avgjør og lagrer nye rettighetskategorier, og Spleis går gjennom `AvventerRettighetskategori` og lagrer ID-en i et minimalt vilkårsgrunnlag. Spleis bruker ikke kategorien, heller ikke hovedkategorien i løsningen, og RV_SØ_53 kjører når søknaden kommer inn, som i dag.
2. **Fylle inn historikken.** sp-rettighetskategori lager avgjørelser for ID-er som bare finnes i Spleis. Det skjer ved `person_avstemming` og når tjenesten får et oppslag på en ID den ikke kjenner.
3. **Flytte valideringen.** Valideringen flyttes fra søknadshåndteringen til `AvventerRettighetskategori` og `AvventerHistorikk`, med de nye varslene RV_RK_1 og RV_RK_2. RV_SØ_53 kjører bare når skjæringstidspunktet har fullt vilkårsgrunnlag. Fase 3 krever ikke at fase 2 er ferdig for alle personer, fordi oppslag på ukjente ID-er fyller inn avgjørelsen med en gang.
4. **Rydde opp.** Når migreringsloggen viser at alle personer er fylt inn, fjerner vi innfyllingen i sp-rettighetskategori og endepunktet i spleis-api.

## Brukerhistorier

1. Som Spleis vil jeg få avgjort rettighetskategorien for et sykefraværstilfelle før vilkårsprøving, slik at vilkårsprøvingen vet hvilke regler som gjelder.
2. Som Spleis vil jeg spørre om rettighetskategorien først når alle nye søknader som overlapper skjæringstidspunktet er blitt sendte søknader, slik at avgjørelsen bygger på alle yrkesaktivitetene.
3. Som Spleis vil jeg sende referanse-ID-en til den siste sendte søknaden for den første perioden til hver yrkesaktivitet med samme skjæringstidspunkt, slik at tjenesten vet nøyaktig hvilke søknader avgjørelsen skal bygge på.
4. Som Spleis vil jeg sende søknader fra alle yrkesaktiviteter med samme skjæringstidspunkt, slik at tjenesten ser kombinasjonene.
5. Som Spleis vil jeg holde søknader fra forkastede perioder utenfor, slik at forkastede yrkesaktiviteter ikke påvirker kategorien.
6. Som Spleis vil jeg holde forlengelser utenfor ved å bare sende søknaden for den første perioden til hver yrkesaktivitet, slik at starten på hver yrkesaktivitet i sykefraværstilfellet avgjør kategorien, og en forlengelse ikke endrer søknadssettet.
7. Som Spleis vil jeg få tilbake en ID og hovedkategorien, men bare lagre ID-en, slik at sp-rettighetskategori er den eneste eieren av avgjørelsen.
8. Som Spleis vil jeg lagre ID-en i et minimalt vilkårsgrunnlag for skjæringstidspunktet når løsningen kommer, slik at ID-en gjelder hele sykefraværstilfellet fra første stund og er tilgjengelig når vilkårsgrunnlaget lages.
9. Som Spleis vil jeg at det fulle vilkårsgrunnlaget erstatter det minimale ved vilkårsprøving og tar med seg ID-en, slik at det bare finnes ett vilkårsgrunnlag per skjæringstidspunkt.
10. Som Spleis vil jeg alltid gå gjennom `AvventerRettighetskategori` på vei til `AvventerVilkårsprøving`, og stole på at sp-rettighetskategori gir samme ID for samme søknadssett, slik at Spleis ikke trenger egen logikk for når den skal spørre.
11. Som Spleis vil jeg gå gjennom `AvventerRettighetskategori` på vei til `AvventerVilkårsprøvingRevurdering`, slik at et flyttet skjæringstidspunkt får sin egen avgjørelse.
12. Som Spleis vil jeg bruke hovedkategorien fra løsningen på `Rettighetskategori` når jeg tar imot den i `AvventerRettighetskategori`, slik at jeg kan forkaste kombinerte kategorier før vilkårsprøvingen, uten et eget oppslag.
13. Som Spleis vil jeg forkaste hele sykefraværstilfellet når hovedkategorien ikke støttes, med et eget varsel for hver hovedkategori jeg ikke støtter, slik at saken går til Infotrygd som i dag, og vi ser hvor mange som forkastes for hver kombinasjon. Arbeidstaker og selvstendig næringsdrivende gir RV_RK_1 på alle periodene i sykefraværstilfellet.
14. Som Spleis vil jeg slå opp hovedkategorien med ID-en i `AvventerHistorikk`, slik at også forlengelser og revurderinger blir sjekket.
15. Som Spleis vil jeg forkaste en periode med RV_RK_2 når hovedkategorien ikke stemmer med periodens yrkesaktivitetstype, slik at en selvstendig forlengelse i et arbeidstakertilfelle blir forkastet som i dag.
16. Som Spleis vil jeg forkaste bare den nye perioden når en søknad fra en annen yrkesaktivitet kommer etter at skjæringstidspunktet har fått fullt vilkårsgrunnlag, slik at allerede behandlede perioder ikke endres.
17. Som Spleis vil jeg sende rettighetskategori-ID-en med i opptjeningsbehovet, slik at sp-vilkarsproving senere kan bruke kategorien.
18. Som Spleis vil jeg gi alle eksisterende vilkårsgrunnlag en deterministisk rettighetskategori-ID med en JSON-migrering, slik at ingen skjæringstidspunkt mangler ID når valideringen flyttes.
19. Som Spleis vil jeg lage samme deterministiske ID når et nytt vilkårsgrunnlag lages uten ID fra sp-rettighetskategori, for eksempel med togglen av eller fra Infotrygd, slik at feltet aldri er tomt.
20. Som Spleis vil jeg fortsatt sjekke `andreInntektskilder` på søknaden selv, slik at varsler og forkasting for andre inntektskilder virker som i dag.
21. Som Spleis vil jeg fortsatt forkaste frilans og arbeidsledig i `Start`, slik at RV_SØ_39 virker som i dag.
22. Som Spleis vil jeg at togglen for fase 1 styrer overgangen til `AvventerRettighetskategori`, slik at vi kan prøve den i dev før prod.
23. Som Spleis vil jeg at togglen for fase 3 slår av RV_SØ_53 ved søknadshåndtering før skjæringstidspunktet har fullt vilkårsgrunnlag, og slår på forkastingen i `AvventerRettighetskategori` og oppslaget i `AvventerHistorikk`, slik at tjenesten får se kombinasjonene.
24. Som Spleis vil jeg at RV_SØ_53 ved søknadshåndtering virker som i dag når togglen for fase 3 er av, slik at vi kan gå tilbake.
25. Som Spleis vil jeg sende behovet på nytt ved påminnelse når det ikke er besvart, slik at midlertidige feil i sp-rettighetskategori eller Spedisjon ikke stopper saken.
26. Som sp-rettighetskategori vil jeg hente søknadene synkront fra Spedisjon med referanse-ID-ene, slik at jeg får hele søknaden uten at Spleis må lagre den.
27. Som sp-rettighetskategori vil jeg mappe hver søknad til yrkesaktivitet på samme måte som Spleis gjør i dag, slik at presisjonen blir som før.
28. Som sp-rettighetskategori vil jeg avgjøre en presis hovedkategori, for eksempel Arbeidstaker og selvstendig næringsdrivende, ikke en generell «Kombinert», slik at kontrakten ikke må endres når § 8-41 skal støttes.
29. Som sp-rettighetskategori vil jeg bare klassifisere, ikke avgjøre hva Spleis støtter, slik at tjenesten ikke trenger å kjenne til Spleis' begrensninger.
30. Som sp-rettighetskategori vil jeg lagre hver avgjørelse som en ny rad med person, skjæringstidspunkt, hovedkategori, kilde og søknads-ID-ene som ble brukt, slik at historikken kan etterprøves.
31. Som sp-rettighetskategori vil jeg returnere den gjeldende ID-en når jeg får samme sett med søknads-ID-er for samme skjæringstidspunkt, slik at påminnelser ikke lager nye avgjørelser.
32. Som sp-rettighetskategori vil jeg lage en ny avgjørelse når settet med søknads-ID-er er endret, slik at endrede søknader blir vurdert.
33. Som sp-rettighetskategori vil jeg aldri overskrive en avgjørelse fra saksbehandler med en automatisk avgjørelse for samme søknadssett, slik at overstyringer står seg.
34. Som sp-rettighetskategori vil jeg la behovet være ubesvart når Spedisjon ikke svarer eller mangler en søknad, slik at Spleis prøver igjen.
35. Som sp-rettighetskategori vil jeg svare på oppslag fra ID til hovedkategori, slik at Spleis kan bruke kategorien uten egen kopi.
36. Som sp-vilkarsproving vil jeg få rettighetskategori-ID-en i opptjeningsbehovet, slik at jeg kan slå opp kategorien når vi tar den i bruk.
37. Som utvikler vil jeg kunne sammenligne antall forkastinger med RV_SØ_53 før togglen for fase 3 med antall forkastinger med RV_RK_1, RV_RK_2 og RV_SØ_53 etter, slik at vi ser at løsningen virker like godt som i dag.
38. Som Spleis vil jeg tilby et endepunkt i spleis-api som gir alle rettighetskategori-ID-ene til en person med skjæringstidspunkt og yrkesaktivitetstyper, slik at sp-rettighetskategori kan fylle inn historikken.
39. Som sp-rettighetskategori vil jeg avgjøre hovedkategorien for en historisk ID ut fra yrkesaktivitetstypene til den første perioden for hver yrkesaktivitet som bruker vilkårsgrunnlaget, slik at innfyllingen bruker samme utvalg som nye avgjørelser, og resultatet blir det samme som Spleis kom fram til.
40. Som sp-rettighetskategori vil jeg hente og lagre historikken for personen synkront når jeg får `RettighetskategoriResultat` for en ID jeg ikke kjenner, slik at Spleis får svar selv om personen ikke er fylt inn ennå.
41. Som sp-rettighetskategori vil jeg hente historikken for personen ved hver `person_avstemming` og lagre ID-ene som mangler, slik at ID-er Spleis har laget siden sist også blir fylt inn.
42. Som sp-rettighetskategori vil jeg føre en migreringslogg per person, slik at vi vet når alle er fylt inn og kan slutte å hente fra Spleis.
43. Som utvikler vil jeg fjerne innfyllingen når alle personer er fylt inn, slik at sp-rettighetskategori ikke lenger er avhengig av spleis-api.
44. Som Spleis vil jeg skille det minimale vilkårsgrunnlaget fra de fulle med det eksisterende feltet `type` i JSON-en, slik at eksisterende vilkårsgrunnlag kan leses uten migrering.
45. Som Spleis vil jeg at bare `AvventerVilkårsprøving` og `AvventerVilkårsprøvingRevurdering` ser det minimale vilkårsgrunnlaget, slik at all annen kode som spør etter vilkårsgrunnlaget, virker som i dag.
46. Som Spock vil jeg påminne perioder i `AVVENTER_RETTIGHETSKATEGORI` etter én time, som i `AVVENTER_VILKÅRSPRØVING`, slik at Spleis sender ubesvarte behov på nytt like raskt som andre behov.
47. Som utvikler vil jeg få melding i Slack fra spammer når en periode er påminnet mange ganger i `AVVENTER_RETTIGHETSKATEGORI`, slik at vi oppdager perioder som står fast fordi sp-rettighetskategori ikke svarer.
48. Som saksbehandler vil jeg se perioder i `AvventerRettighetskategori` som «Forbereder godkjenning» i Speil, som perioder i `AvventerVilkårsprøving`.
49. Som sp-rettighetskategori vil jeg bare gi hovedkategoriene Arbeidstaker, Selvstendig næringsdrivende og Arbeidstaker og selvstendig næringsdrivende i første versjon, slik at Spleis bare må håndtere kategoriene den kan få.
50. Som sp-rettighetskategori vil jeg la behovet være ubesvart og logge feil når en søknad gir en annen yrkesaktivitet enn arbeidstaker eller selvstendig næringsdrivende, slik at vi oppdager det i stedet for å avgjøre feil kategori.
51. Som Spleis vil jeg velge varselet med en uttømmende `when` over hovedkategoriene, slik at en ny hovedkategori i kontrakten ikke kompilerer før den har fått sitt eget varsel eller blir støttet.
52. Som Spleis vil jeg forkaste alle periodene i sykefraværstilfellet med en gang når jeg ser i løsningen at hovedkategorien ikke støttes, slik at ingen av periodene blir vilkårsprøvd eller går gjennom `AvventerHistorikk` og henter ytelser før de uansett forkastes.
53. Som utvikler vil jeg at alle periodene som forkastes fordi hovedkategorien ikke støttes, får varselet for hovedkategorien, slik at vi kan telle forkastingene. Det er greit at søknader som kommer inn etter forkastingen, får et av varslene for forkastede perioder (RV_SØ_31 til RV_SØ_38).
54. Som Spleis vil jeg aldri lagre hovedkategorien fra løsningen på `Rettighetskategori`, verken i vilkårsgrunnlaget, på behandlingen eller noe annet sted, slik at Spleis ikke har en egen kopi som kan bli utdatert når saksbehandler overstyrer.
55. Som Spleis vil jeg ikke forkaste på grunnlag av hovedkategorien i `AvventerVilkårsprøving`, slik at sjekken bare finnes ett sted før vilkårsprøvingen.

## Beslutninger om implementasjon

### Ny tjeneste: sp-rettighetskategori

- Ny Kotlin-app med egen Postgres-database, satt opp etter sykepenger-standarden.
- Tjenesten lytter på rapiden og svarer på to behov:
  - `Rettighetskategori`: inn kommer person, skjæringstidspunkt og referanse-ID-ene (Spedisjons `@id`) til de sendte søknadene. Ut kommer en rettighetskategori-ID og hovedkategorien. Samme søknadssett gir samme ID og samme hovedkategori.
  - `RettighetskategoriResultat`: inn kommer en rettighetskategori-ID. Ut kommer hovedkategorien.
- Feltene i behovene og løsningene:
  - `Rettighetskategori`: `fødselsnummer`, `Rettighetskategori.skjæringstidspunkt` og `Rettighetskategori.søknader` (liste med referanse-ID-er). Løsningen er `@løsning.Rettighetskategori.id` og `@løsning.Rettighetskategori.hovedkategori`.
  - `RettighetskategoriResultat`: `fødselsnummer` og `RettighetskategoriResultat.rettighetskategoriId`. Løsningen er `@løsning.RettighetskategoriResultat.hovedkategori`.
  - Hovedkategorien er `ARBEIDSTAKER`, `SELVSTENDIG_NÆRINGSDRIVENDE` eller `ARBEIDSTAKER_OG_SELVSTENDIG_NÆRINGSDRIVENDE`.
- Tjenesten henter søknadene synkront fra Spedisjons API for meldinger med de interne dokument-ID-ene. Spleis trenger ikke den eksterne søknads-ID-en.
- Hver søknad mappes til yrkesaktivitet på samme måte som Spleis gjør i dag, ut fra søknadstypen og `arbeidssituasjon`. Dette gjelder også fisker, jordbruker, barnepasser og «annet». Unntaket er søknader fra arbeidsledig med `tidligereArbeidsgiverOrgnummer`, som Spleis behandler som arbeidstaker. De gjelder i praksis bare forlengelser, som Spleis ikke sender, så tjenesten behandler dem som andre søknader fra arbeidsledig. I Spleis står mappingen tre steder:
  - preconditions i `sykepenger-mediators/.../spleis/meldinger/Sendt*SøknaderRiver.kt`
  - kallet til `builder.arbeidstaker`, `selvstendig`, `frilans` eller `arbeidsledig` i `.../meldinger/model/SendtSøknad*Message.kt`
  - RV_SØ_39 for frilans og arbeidsledig i `sykepenger-model/.../person/Yrkesaktivitet.kt`
- Hovedkategoriene følger `abstraksjoner-kap8.md`. Første versjon gir bare Arbeidstaker, Selvstendig næringsdrivende og Arbeidstaker og selvstendig næringsdrivende, og ingen tilleggskategorier. De andre hovedkategoriene legges til i kontrakten når Spleis kan få dem.
- Gir en søknad en annen yrkesaktivitet, for eksempel frilanser eller arbeidsledig, svarer ikke tjenesten på behovet, og feilen logges. Det skal ikke skje, fordi Spleis forkaster slike perioder i `Start` med RV_SØ_39 og ikke sender søknader fra forkastede perioder.
- Tjenesten ser ikke på `andreInntektskilder`.
- Lagring følger mønsteret fra `opptjeningsvurdering` i sp-vilkarsproving. Hver avgjørelse er en ny rad med egen ID, person, skjæringstidspunkt, hovedkategori, kilde (`automatisk`, `saksbehandler` eller `spleis`), vurderingstidspunkt og søknads-ID-ene som ble brukt. Vurderingstidspunktet er når avgjørelsen ble tatt, også når den er hentet fra Spleis. I tillegg har raden `opprettet`, som databasen setter når raden lagres. Applikasjonen leser og skriver ikke `opprettet`. Gjeldende avgjørelse er den med nyest vurderingstidspunkt for person og skjæringstidspunkt. En innfylt avgjørelse har vurderingstidspunktet fra Spleis. Fylles den inn etter en automatisk avgjørelse for samme skjæringstidspunkt, er den automatiske avgjørelsen fortsatt gjeldende. Det er riktig, fordi den automatiske avgjørelsen er den Spleis har spurt om sist.
- Samme søknadssett gir gjeldende ID tilbake. Et nytt søknadssett gir en ny automatisk avgjørelse. En innfylt avgjørelse har ikke noe søknadssett, så det første behovet etter innfyllingen gir alltid en ny avgjørelse.
- Hvis Spedisjon feiler eller mangler en søknad, svarer ikke tjenesten på behovet.

### Innfylling av historikken i sp-rettighetskategori

- Innfyllingen følger mønsteret for opptjening i sp-vilkarsproving: `SpleisClient`, `PersonAvstemmingService` og fallbacken i `OpptjeningsvurderingResultatRiver`.
- Nytt endepunkt i spleis-api, `POST /api/rettighetskategorier`, med fødselsnummer inn. For hver rettighetskategori-ID i de fulle vilkårsgrunnlagene i historikken svarer det med ID, skjæringstidspunkt, opprettet, kilden til vilkårsgrunnlaget (`SPLEIS` eller `INFOTRYGD`), om inntektsgrunnlaget har selvstendig inntekt og yrkesaktivitetstypene til den første vedtaksperioden for hver yrkesaktivitet som bruker vilkårsgrunnlaget, delt i aktive og forkastede perioder. Spleis velger den første perioden slik den gjør i behovet `Rettighetskategori`, hver for seg blant de aktive og de forkastede periodene. Opprettet tas fra det første historikkinnslaget med ID-en, som i `OpptjeningApi`.
- sp-rettighetskategori avgjør hovedkategorien slik Spleis gjorde:
  - Yrkesaktivitetstypene til de første periodene som ikke er forkastet, gir hovedkategorien. Arbeidstaker gir Arbeidstaker. Selvstendig, fisker, jordbruker og barnepasser gir Selvstendig næringsdrivende. Begge deler gir Arbeidstaker og selvstendig næringsdrivende.
  - Vilkårsgrunnlag fra Infotrygd gir Arbeidstaker, som for opptjening.
  - Bruker ingen aktive perioder vilkårsgrunnlaget, bruker vi de første forkastede periodene. Bruker ingen perioder det, gir selvstendig inntekt i inntektsgrunnlaget Selvstendig næringsdrivende og ellers Arbeidstaker.
- Innfylte avgjørelser lagres med ID-en fra Spleis, kilde `spleis`, vurderingstidspunktet fra opprettet i Spleis og uten søknads-ID-er. Lagringen er idempotent på ID.
- `RettighetskategoriResultat` slår først opp lokalt. Finnes ikke ID-en, henter tjenesten historikken for personen synkront, lagrer ID-ene som mangler, fører migreringsloggen og svarer. Finnes ID-en heller ikke i Spleis, svarer ikke tjenesten, og feilen logges.
- `person_avstemming` henter historikken hver gang og lagrer ID-ene som mangler. sp-vilkarsproving hopper over personer som står i migreringsloggen. Det gjør ikke sp-rettighetskategori, fordi Spleis kan lage nye deterministiske ID-er etter forrige avstemming, for eksempel for vilkårsgrunnlag fra Infotrygd.
- Migreringsloggen har én rad per innfylling med fødselsnummer, tidspunkt, antall ID-er fra Spleis og antall nye. Når alle personer med vilkårsgrunnlag står i loggen, og nye ID-er ikke lenger dukker opp, kan vi fjerne innfyllingen (fase 4).
- Spleis sender `person_avstemming` for hver person én gang i måneden. Fase 3 venter ikke på en full runde, fordi `RettighetskategoriResultat` fyller inn ID-en med en gang. Fase 4 venter på den.

### Endringer i Spleis

- Vilkårsgrunnlaget får feltet `rettighetskategoriId`, som aldri er tomt. En JSON-migrering setter det på alle eksisterende vilkårsgrunnlag, både fra Spleis og fra Infotrygd, til `UUID.nameUUIDFromBytes("$vilkårsgrunnlagId:Rettighetskategori")`. Det følger V345 og V346 for `opptjeningsvurderingId`.
- Lages et vilkårsgrunnlag uten ID fra sp-rettighetskategori, bruker Spleis samme deterministiske ID. Det gjelder vilkårsgrunnlag fra Infotrygd, perioder med togglen for fase 1 av og perioder som allerede var forbi `AvventerRettighetskategori` da togglen ble skrudd på. Spleis bruker ikke tilfeldige ID-er, slik opptjening gjør i dag.
- Et kopiert vilkårsgrunnlag beholder ID-en, slik det gjør med `opptjeningsvurderingId`.
- Ny tilstand `AvventerRettighetskategori` mellom `AvventerBlokkerendePeriode` og `AvventerVilkårsprøving`, og tilsvarende før `AvventerVilkårsprøvingRevurdering`. Perioden går alltid gjennom tilstanden på vei til vilkårsprøving. Spleis sjekker ikke om skjæringstidspunktet allerede har rettighetskategori-ID, men stoler på at sp-rettighetskategori gir samme ID for samme søknadssett. Forlengelser går ikke til vilkårsprøving og kommer derfor aldri til tilstanden.
- Tilstanden sender behovet `Rettighetskategori` med én referanse-ID per yrkesaktivitet med samme skjæringstidspunkt:
  - Spleis velger den første perioden for hver yrkesaktivitet, det vil si perioden med tidligste fom blant periodene som ikke er forkastet og har samme skjæringstidspunkt. Hvert arbeidsforhold er en egen yrkesaktivitet.
  - For den første perioden sender Spleis den siste sendte søknaden. En korrigert søknad gir derfor et nytt søknadssett.
  - Forlengelser er ikke med. En forlengelse endrer derfor ikke søknadssettet, og en ny vilkårsprøving gir samme ID.
  - Perioden trenger ikke å overlappe skjæringstidspunktet. Eksempel: AT 1.–31. januar og SN 1.–28. februar med samme skjæringstidspunkt gir begge søknadene. Det samme gjør en arbeidsgiver som kommer til 15. januar.
- Løsningen har ID-en og hovedkategorien. Spleis lagrer aldri hovedkategorien (se ADR 0001). Den brukes bare i mottaket av løsningen, til å avgjøre om sykefraværstilfellet skal forkastes, og finnes ikke i Spleis etterpå. Når løsningen kommer og perioden ikke forkastes, lagrer Spleis ID-en i et minimalt vilkårsgrunnlag for skjæringstidspunktet, og perioden går videre til vilkårsprøving. Se ADR 0003 og avsnittet om det minimale vilkårsgrunnlaget under.
- Med togglen for fase 3 på velger Spleis i mottaket av løsningen, med en uttømmende `when` over hovedkategorien, om perioden kan gå videre til `AvventerVilkårsprøving`. Er hovedkategorien Arbeidstaker og selvstendig næringsdrivende, forkastes hele sykefraværstilfellet med RV_RK_1. Spleis lagrer da ikke noe minimalt vilkårsgrunnlag, og et eldre minimalt vilkårsgrunnlag for skjæringstidspunktet forsvinner med forkastingen.
- Forkastingen i `AvventerRettighetskategori` tar med alle periodene i sykefraværstilfellet på tvers av yrkesaktiviteter i samme operasjon, med den vanlige forkastingen av overlappende og etterfølgende perioder. Alle periodene får RV_RK_1. Perioder som står i `AvventerVilkårsprøving` med et minimalt vilkårsgrunnlag, forkastes også. Ingen av periodene blir vilkårsprøvd eller går gjennom `AvventerHistorikk` først.
- Forkastingen gjelder bare perioder på vei til `AvventerVilkårsprøving`, som før. På vei til `AvventerVilkårsprøvingRevurdering` bruker ikke Spleis hovedkategorien i løsningen. Der fanger konsistenssjekken i `AvventerHistorikk` en periode med feil yrkesaktivitetstype.
- `AvventerVilkårsprøving` slår ikke opp hovedkategorien og forkaster ikke på grunnlag av den.
- `AvventerVilkårsprøving` og `AvventerVilkårsprøvingRevurdering` henter rettighetskategori-ID-en fra det minimale vilkårsgrunnlaget for skjæringstidspunktet. Det fulle vilkårsgrunnlaget får samme ID, ved siden av `opptjeningsvurderingId`, og erstatter det minimale i et nytt historikkinnslag. Finnes det ikke noe minimalt vilkårsgrunnlag, for eksempel med togglen for fase 1 av, får det fulle vilkårsgrunnlaget den deterministiske ID-en.
- Spleis gir ikke RV_RK_1 til perioder som kommer inn etter forkastingen. Når behandlingen gjenopptas for slike perioder, har Spleis ikke hovedkategorien, fordi den ikke er lagret, og vi vil ikke slå den opp på nytt bare for å velge varsel. Søknaden fanges av sjekken mot forkastede perioder og forkastes med et av varslene RV_SØ_31 til RV_SØ_38.
- `AvventerVilkårsprøving` sender rettighetskategori-ID-en med i opptjeningsbehovet.
- `AvventerHistorikk` slår opp hovedkategorien med `RettighetskategoriResultat` sammen med ytelsene, slik opptjening gjør. Stemmer ikke hovedkategorien med periodens yrkesaktivitetstype, forkastes perioden med RV_RK_2.
- Nye varselkoder i Spleis:
  - `RV_RK_1("Støtter ikke kombinasjonen arbeidstaker og selvstendig næringsdrivende")`
  - `RV_RK_2("Perioden har en annen yrkesaktivitetstype enn rettighetskategorien")`
- Hver hovedkategori Spleis ikke støtter, får sin egen varselkode, for eksempel Arbeidstaker og frilanser når den kommer. Spleis velger varselet med en uttømmende `when` over hovedkategoriene i løsningen. En ny hovedkategori i kontrakten kompilerer derfor ikke før den har fått sitt eget varsel eller blir støttet.
- Spleis slår alltid opp hovedkategorien i `AvventerHistorikk`, fordi alle vilkårsgrunnlag har rettighetskategori-ID. Det finnes ingen vei utenom oppslaget og konsistenssjekken. `RettighetskategoriResultat` brukes bare her.
- Togglen for fase 1 styrer overgangen til `AvventerRettighetskategori`. Den fjernes før fase 3.
- Før togglen for fase 3 er på, bruker ikke Spleis hovedkategorien i løsningen.
- Togglen for fase 3 styrer forkastingen i `AvventerRettighetskategori`, oppslaget i `AvventerHistorikk` og RV_SØ_53 når en søknad kommer inn og en annen yrkesaktivitet har en periode som overlapper eller ligger inntil:
  - **Før skjæringstidspunktet har et fullt vilkårsgrunnlag**, kjører ikke RV_SØ_53. Et minimalt vilkårsgrunnlag teller ikke. Begge periodene kommer da til `AvventerRettighetskategori`, sp-rettighetskategori ser kombinasjonen, og Spleis forkaster hele sykefraværstilfellet når løsningen kommer. Eksempel: AT 1.–31. januar står i `AvventerBlokkerendePeriode` eller `AvventerVilkårsprøving`, og en søknad for SN 1.–31. januar kommer inn. SN-perioden spør med begge søknadene, og løsningen forkaster også AT-perioden. Rekker AT-perioden å bli vilkårsprøvd med den gamle ID-en før SN-perioden er gjennom `AvventerRettighetskategori`, fanger konsistenssjekken i `AvventerHistorikk` SN-perioden.
  - **Når skjæringstidspunktet har et fullt vilkårsgrunnlag**, kjører RV_SØ_53 som i dag og forkaster bare den nye perioden. Eksempel: AT 1.–31. januar er utbetalt, og en søknad for SN 1.–31. januar kommer inn.
  - **Når togglen for fase 3 er av**, kjører RV_SØ_53 som i dag i begge tilfellene. Spleis bruker ikke hovedkategorien i løsningen og slår den ikke opp.
- `andreInntektskilder` og RV_SØ_39 i `Start` er uendret.
- Ubesvarte behov sendes på nytt ved påminnelse. Spock bestemmer når påminnelsen kommer, se under.
- Tilstanden heter `AVVENTER_RETTIGHETSKATEGORI` i `TilstandType`, i `TilstandTypeData` i person-JSON, i `VedtaksperiodetilstandDto` og i `SpannerPersonDto`. Det er én tilstand for både førstegangsbehandling og revurdering.
- Eldre versjoner av Spleis kan ikke lese person-JSON med den nye tilstanden, på samme måte som med `type: Rettighetskategori`. Tilstanden må derfor være med i serde i samme deploy som støtten for det minimale vilkårsgrunnlaget, før togglen for fase 1 skrus på.
- spleis-api mapper tilstanden til `Periodetilstand.ForberederGodkjenning` for Speil, som `AVVENTER_VILKÅRSPRØVING`. I mappingen av utbetalingstatus havner den i grenen som kaster feil, sammen med `AVVENTER_VILKÅRSPRØVING`. Kompilatoren krever begge, fordi `when` er uttømmende.

### Endringer i Spock og spammer

Spock og spammer lister tilstandsnavnene fra `vedtaksperiode_endret` og `påminnelse` eksplisitt. Kompilatoren i Spleis fanger ikke disse listene, så de må endres for hånd.

- **Spock.** `nestePåminnelsetidspunkt` i `Tilstandsendringer.kt` velger påminnelsesintervall ut fra tilstandsnavnet. En ukjent tilstand havner i `else`: Spock logger en advarsel for hver tilstandsendring og påminner først etter 12 til 30 timer. Det betyr at et ubesvart behov `Rettighetskategori` blir liggende i opptil et døgn før Spleis sender det på nytt. `AVVENTER_RETTIGHETSKATEGORI` legges i gruppen med én time, sammen med `AVVENTER_VILKÅRSPRØVING`.
- **spammer.** `PåminnelseMonitor` sender melding til Slack for hver 20. påminnelse, men bare for tilstandene i `interessanteTilstander`. `AVVENTER_RETTIGHETSKATEGORI` legges til, slik at perioder som står fast fordi sp-rettighetskategori ikke svarer, gir alarm. Det skjer for eksempel når Spedisjon feiler eller mangler en søknad.
- Begge må være deployet før togglen for fase 1 skrus på i dev.

### Minimalt vilkårsgrunnlag i Spleis

- `VilkårsgrunnlagElement` er allerede en sealed class med `Grunnlagsdata` og `InfotrygdVilkårsgrunnlag`. Felles for alle typer blir bare `vilkårsgrunnlagId`, `skjæringstidspunkt` og `rettighetskategoriId`. De to fulle typene får en felles sealed overklasse med `inntektsgrunnlag`, `opptjeningsvurderingId` og `medlemskapsvurderingId`, slik at koden som bruker dem, ikke må håndtere at feltene mangler.
- Den nye typen, `Rettighetskategorigrunnlag`, har bare de felles feltene. `vilkårsgrunnlagId` er tilfeldig, og `rettighetskategoriId` er ID-en fra sp-rettighetskategori.
- Spleis lagrer det minimale vilkårsgrunnlaget i et nytt innslag i vilkårsgrunnlagshistorikken, slik den gjør med fulle vilkårsgrunnlag. Det erstatter et eldre minimalt vilkårsgrunnlag for samme skjæringstidspunkt, men aldri et fullt. Perioden kommer bare til `AvventerRettighetskategori` når skjæringstidspunktet mangler fullt vilkårsgrunnlag.
- JSON-en bruker det eksisterende feltet `type` som diskriminator. I dag har feltet verdiene `Vilkårsprøving` og `Infotrygd`, og den nye typen får `Rettighetskategori`. Alle eksisterende vilkårsgrunnlag har allerede `type`, så de trenger ingen migrering. I `VilkårsgrunnlagElementData` blir `inntektsgrunnlag`, `opptjeningsvurderingId` og `medlemskapsvurderingId` nullbare, og de mangler bare for den nye typen. DTO-ene `VilkårsgrunnlagInnDto` og `VilkårsgrunnlagUtDto` får en ny undertype.
- Eldre versjoner av Spleis kan ikke lese `type: Rettighetskategori`. Støtten for typen må derfor være deployet med togglen for fase 1 av før togglen skrus på. Etter det går vi tilbake ved å skru av togglen, ikke ved å rulle Spleis tilbake til en versjon uten støtten.
- `vilkårsgrunnlagFor(skjæringstidspunkt)` og annen kode som spør etter vilkårsgrunnlaget, ser bare fulle vilkårsgrunnlag. Dermed virker sjekker som «trenger perioden vilkårsprøving?», beregning, overstyringer og RV_SØ_53 som i dag. Bare `AvventerVilkårsprøving` og `AvventerVilkårsprøvingRevurdering` henter det minimale vilkårsgrunnlaget, med et eget oppslag.
- Konsumentene av historikken hopper over den nye typen: byggerne for Speil, `OpptjeningApi`, `MedlemskapApi`, `UtkastTilVedtakBuilder`, Spanner-DTO-en og endepunktet for rettighetskategorier i spleis-api. ID-ene i minimale vilkårsgrunnlag kommer fra sp-rettighetskategori og trenger ikke fylles inn.
- Ryddingen av vilkårsgrunnlag for skjæringstidspunkter som ikke lenger finnes (`oppdaterHistorikk`), gjelder også minimale vilkårsgrunnlag. Forkastes sykefraværstilfellet før vilkårsprøving, forsvinner det minimale vilkårsgrunnlaget med det.

### Endringer i sp-vilkarsproving

- Opptjeningsbehovet får et nytt, valgfritt felt med rettighetskategori-ID. sp-vilkarsproving tar imot feltet, men bruker det ikke i første versjon.

## Beslutninger om testing

- Gode tester sjekker ytre oppførsel: hendelser inn, behov og løsninger, tilstander, forkasting og varsler. De sjekker ikke interne klasser eller hjelpefunksjoner.
- **Spleis, e2e i sykepenger-model.** Testene sender søknader inn, svarer på `Rettighetskategori` (med ID og hovedkategori) og `RettighetskategoriResultat` med testløsninger og sjekker tilstand, forkasting og varslene RV_RK_1, RV_RK_2 og RV_SØ_53. Scenarioene for fase 1 kjøres med togglen for fase 1 av og på, og scenarioene for fase 3 med togglen for fase 3 av og på. Scenarioer:
  - Bare arbeidstaker, og bare selvstendig næringsdrivende.
  - Arbeidstaker og selvstendig næringsdrivende som overlapper skjæringstidspunktet, der alle periodene i sykefraværstilfellet forkastes med RV_RK_1 i samme hendelse som løsningen på `Rettighetskategori`, og ingen av periodene blir vilkårsprøvd eller ber om ytelser.
  - AT 1.–31. januar og SN 1.–28. februar med samme skjæringstidspunkt, der begge søknadene er sendt før AT-perioden spør. Begge er med i behovet, og begge periodene forkastes med RV_RK_1 i samme hendelse som løsningen, uten å bli vilkårsprøvd eller be om ytelser.
  - En søknad som overlapper eller forlenger et sykefraværstilfelle som er forkastet med RV_RK_1, og som forkastes med et av varslene RV_SØ_31 til RV_SØ_38.
  - To arbeidsgivere med samme skjæringstidspunkt, der den andre starter etter skjæringstidspunktet. Begge søknadene er med i behovet.
  - Selvstendig forlengelse av et arbeidstakertilfelle. SN 1.–28. februar kommer mens AT 1.–31. januar står i `AvventerVilkårsprøving` med et minimalt vilkårsgrunnlag, venter til vilkårsgrunnlaget er fullt og forkastes med RV_RK_2 i `AvventerHistorikk`.
  - Flere perioder for samme yrkesaktivitet, der bare den siste søknaden for den første perioden er med i behovet.
  - En korrigert søknad for den første perioden, som gir et nytt søknadssett.
  - En søknad fra en annen yrkesaktivitet etter at kategorien er avgjort og perioden er utbetalt.
  - En søknad fra en annen yrkesaktivitet som overlapper skjæringstidspunktet, mens perioden står i `AvventerVilkårsprøving` med et minimalt vilkårsgrunnlag. Kommer den nye perioden til `AvventerRettighetskategori` først, forkaster løsningen også perioden i `AvventerVilkårsprøving`.
  - At løsningen på `Rettighetskategori` gir et minimalt vilkårsgrunnlag med bare ID-en, og at det fulle vilkårsgrunnlaget erstatter det med samme rettighetskategori-ID. Hovedkategorien finnes ikke i person-JSON-en.
  - Et sykefraværstilfelle som forkastes før vilkårsprøving, der det minimale vilkårsgrunnlaget forsvinner.
  - Forlengelse som ikke går gjennom `AvventerRettighetskategori`.
  - Ny vilkårsprøving med samme søknadssett, som gir samme rettighetskategori-ID.
  - Revurdering som flytter skjæringstidspunktet, der Spleis ikke forkaster på grunnlag av hovedkategorien i løsningen.
  - Et vilkårsgrunnlag fra før fase 1, med deterministisk ID, der Spleis slår opp hovedkategorien og sjekker forlengelser.
  - Et vilkårsgrunnlag som lages med togglen for fase 1 av, og et fra Infotrygd, som begge får deterministisk ID.
  - Ubesvart behov og påminnelse.
  Tester å bygge videre på: `KombinertTest` og `EndretVurderingPåSkjæringstidspunktTest`.
- **Spleis, serde.** En test sjekker at en person med minimalt vilkårsgrunnlag (`type: Rettighetskategori`) kan lagres og leses igjen, og at eksisterende JSON med `Vilkårsprøving` og `Infotrygd` leses som før.
- **Spleis, JSON-migrering.** En migreringstest sjekker at alle vilkårsgrunnlag får `rettighetskategoriId`, og at ID-en er den samme som Spleis lager for et nytt vilkårsgrunnlag med samme `vilkårsgrunnlagId`.
- **Spleis, spleis-api.** Endepunktet testes med personer som har arbeidstaker, selvstendig, kombinerte og forkastede perioder, flere perioder for samme yrkesaktivitet og vilkårsgrunnlag fra Infotrygd. Tester å bygge videre på: testene for `OpptjeningApi`.
- **sp-rettighetskategori, på rapidnivå.** Testene sender behov og `person_avstemming` inn og sjekker løsningen og databasen. Spedisjon og spleis-api fakes i HTTP-klienten, og databasen er ekte Postgres. Testene dekker:
  - mappingen av alle søknadstyper og kombinasjonen AT og SN, med hovedkategorien i løsningen på `Rettighetskategori`
  - at en søknad fra en annen yrkesaktivitet enn AT eller SN gir ubesvart behov
  - samme og endret søknadssett, der samme søknadssett gir samme ID og hovedkategori, og at en overstyring ikke overskrives
  - at Spedisjon-feil gir ubesvart behov
  - `RettighetskategoriResultat` for en ukjent ID, som fyller inn personen og svarer
  - en ID som ikke finnes i Spleis heller, som gir ubesvart behov
  - `person_avstemming` to ganger, der andre gang bare lagrer nye ID-er og begge gangene føres i migreringsloggen
  - hovedkategorien for historiske ID-er, med de samme personene som i testene for spleis-api

  Tester å bygge videre på: `OpptjeningsvurderingRiverTest`, `OpptjeningsvurderingResultatRiverCallthroughTest` og `PersonAvstemmingRiverTest` i sp-vilkarsproving.
- **Behovkontrakt i Spleis.** De nye behovene, hovedkategorien i løsningen på `Rettighetskategori` og det nye feltet i opptjeningsbehovet legges inn i `BehovkontraktTest` i sykepenger-mediators.
- **Spock.** En test i `PåminnelseplanleggerTest` sjekker at `AVVENTER_RETTIGHETSKATEGORI` gir påminnelse etter én time.

## Utenfor omfang

- Overstyring fra saksbehandler. Lagringen er klar for det, men REST-endepunkt, visning i Speil, `saksbehandlerhandling` til Spesialist og `endret_rettighetskategori` til Spleis kommer senere.
- At opptjening bruker rettighetskategorien til å velge sin `Kategori`.
- Tilleggskategorier, Dagpenger og Inaktiv.
- Behandling av kombinerte hovedkategorier etter § 8-41. De forkastes fortsatt.
- Hovedkategoriene Frilanser, Arbeidstaker og frilanser, Selvstendig næringsdrivende og frilanser, Arbeidstaker, selvstendig næringsdrivende og frilanser, og Ingen. sp-rettighetskategori gir dem ikke ennå, og Spleis har ingen varsler for dem. Hver av dem får sitt eget varsel når den kommer inn i kontrakten.
- Ny avgjørelse og revurdering av hele sykefraværstilfellet når en søknad fra en annen yrkesaktivitet kommer etter avgjørelsen. Den nye perioden forkastes som i dag.
- Oppslag fra andre tjenester enn Spleis.
- `andreInntektskilder` i sp-rettighetskategori.

## Andre merknader

- Begrepene følger `GLOSSARY.md`, og hovedkategoriene følger `docs/abstraksjoner-kap8.md`.
- ADR 0001 forklarer hvorfor Spleis bare lagrer ID-en. ADR 0002 forklarer hvorfor alle vilkårsgrunnlag får ID, og hvorfor sp-rettighetskategori fyller inn historikken. ADR 0003 forklarer hvorfor ID-en lagres i et minimalt vilkårsgrunnlag og ikke på behandlingen.
- `docs/forenkle-tilstandsmaskin.md` er oppdatert med ny plassering av `AvventerRettighetskategori`. Tilstanden kommer etter at tilstandsmaskinen er slått sammen.
- Vi har gått gjennom de andre konsumentene av tilstandsnavnene. De trenger ikke endringer:
  - spetakkel, spaghet, `spre/oppgaver`, `VedtaksperiodeReberegnetRiver` i Spesialist og modellene i bomlo-dbt filtrerer på enkelttilstander som ikke berøres.
  - `OverlappendeInfotrygdperioderRiver` i spoiler regner revurderingstilstandene som «tidligere avsluttet». En revurdering som står i `AVVENTER_RETTIGHETSKATEGORI` når Infotrygd-perioden kommer, blir derfor ikke regnet som tidligere avsluttet i Slack-meldingen. Perioden står der i kort tid, så vi godtar det.
  - `GraphvizFormatter` i sporing farger tilstander i grafen. Listene er utdaterte allerede, og en ukjent tilstand tegnes utenfor fargegruppene.
- I dag forkaster RV_SØ_53 også perioder som ligger inntil hverandre. Da forkastes bare perioden fra den andre yrkesaktiviteten, og den første behandles videre. Med løsningen avhenger resultatet av når søknaden fra den andre yrkesaktiviteten kommer:
  - Er den sendt før den første perioden spør om rettighetskategori, er den med i søknadssettet. Hovedkategorien blir Arbeidstaker og selvstendig næringsdrivende, og hele sykefraværstilfellet forkastes med RV_RK_1. Det er strengere enn i dag. Vi godtar det, fordi personen har begge yrkesaktivitetene i samme sykefraværstilfelle.
  - Kommer den etter at skjæringstidspunktet har fått et minimalt vilkårsgrunnlag, men før det fulle, venter perioden til vilkårsgrunnlaget er fullt. Konsistenssjekken i `AvventerHistorikk` forkaster den så med RV_RK_2, som i dag.
  - Kommer den etter at skjæringstidspunktet har fullt vilkårsgrunnlag, forkaster RV_SØ_53 den når søknaden kommer inn, som i dag.

  Spleis venter bare på nye søknader som overlapper skjæringstidspunktet (brukerhistorie 2). En ny søknad som ligger inntil, venter den ikke på. I sammenligningen før og etter togglen for fase 3 telles tilfellet likt, men nå forkastes hele tilfellet der RV_SØ_53 i dag bare forkaster perioden fra den andre yrkesaktiviteten. Det er et kjent avvik.
- Forkastingen av kombinerte tilfeller skjer senere enn i dag. I dag forkaster RV_SØ_53 perioden i det søknaden kommer inn. Andre søknader som forlenger eller overlapper perioden, forkastes deretter når de kommer inn (RV_SØ_31 til RV_SØ_38). Med løsningen forkaster Spleis først når løsningen på `Rettighetskategori` kommer. Søknader som kommer inn før det, blir vanlige aktive perioder og fanges ikke av sjekken mot forkastede perioder. Når Spleis forkaster hele sykefraværstilfellet, må den derfor også ta med disse periodene. De forkastes i samme operasjon som perioden i `AvventerRettighetskategori`, også med RV_RK_1. Søknader som kommer inn etter forkastingen, fanges av sjekken mot forkastede perioder (RV_SØ_31 til RV_SØ_38), som i dag.
- Vi vurderte å la hver periode i sykefraværstilfellet finne ut selv at kategorien ikke støttes, ved å slå opp `RettighetskategoriResultat` i `AvventerHistorikk`. Vi valgte det bort, fordi oppslaget i `AvventerHistorikk` er en del av behovet for ytelser. Hver periode ville da hentet ytelser og blitt beregnet før den ble forkastet. Vi forkaster heller alle periodene med en gang, og gir hver av dem RV_RK_1.
- Vi vurderte å la `AvventerVilkårsprøving` slå opp hovedkategorien med `RettighetskategoriResultat` og forkaste der. Vi valgte det bort. Spleis har allerede hovedkategorien i løsningen på `Rettighetskategori`, så et eget oppslag gir bare en ekstra runde på rapiden. Forkaster vi i mottaket av løsningen, vilkårsprøver ikke Spleis før den forkaster. Det er samme rekkefølgeproblem som for `AvventerHistorikk`. Det blir også enklere å legge inn en ny tilstand mellom `AvventerRettighetskategori` og `AvventerVilkårsprøving` senere, for eksempel for sykepengegrunnlaget. Kravet er at Spleis ikke lagrer hovedkategorien, bare bruker den i mottaket (ADR 0001). Forkastingen er forhåpentligvis midlertidig, fordi Spleis etter hvert skal behandle de kombinerte kategoriene.
- Konsistenssjekken i `AvventerHistorikk` (RV_RK_2) blir værende. Den sjekker om yrkesaktiviteten til en bestemt periode stemmer med rettighetskategorien, og fanger perioder som ikke går gjennom `AvventerRettighetskategori`, for eksempel forlengelser og perioder som kommer etter at skjæringstidspunktet har fått vilkårsgrunnlag.
- Sammenligningen i brukerhistorie 37 teller forkastede sykefraværstilfeller, det vil si person og skjæringstidspunkt med minst én RV_RK_1, RV_RK_2 eller RV_SØ_53. Den teller ikke perioder eller varsler. Etter togglen får alle periodene i tilfellet RV_RK_1, mens RV_SØ_53 i dag bare kommer på søknaden som gir kombinasjonen, og de andre periodene forkastes med RV_SØ_31 til RV_SØ_38. Antall varsler kan derfor ikke sammenlignes direkte.
- Åpent spørsmål for overstyringsflyten: Et endret søknadssett gir en ny automatisk avgjørelse. Når saksbehandler kan overstyre, vil en korrigert søknad dermed kunne erstatte en overstyring uten at noen ser det. Vi må avklare hva som skal skje før overstyring tas i bruk.
- Åpent spørsmål for innfyllingen: Vi bruker forkastede perioder bare når ingen aktive perioder bruker vilkårsgrunnlaget. Vi må sjekke mot data i prod at det gir samme hovedkategori som Spleis kom fram til, før fase 3 rulles ut i prod. Spesielt gjelder det vilkårsgrunnlag der både arbeidstaker- og selvstendig-perioder er aktive. Etter dagens RV_SØ_53 skal det ikke finnes slike.
