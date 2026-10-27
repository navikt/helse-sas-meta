# Avklare rettighetskategori i sp-rettighetskategori

[Tickets](../tickets/avklare-rettighetskategori/) · [ADR 0001](../adr/0001-spleis-lagrer-bare-id-for-rettighetskategori.md) · [ADR 0002](../adr/0002-alle-vilkarsgrunnlag-far-rettighetskategori-id.md) · [ADR 0003](../adr/0003-minimalt-vilkarsgrunnlag-for-rettighetskategori.md)

## Problem

Spleis avgjør i dag ikke rettighetskategorien eksplisitt. Spleis utleder om en periode gjelder arbeidstaker eller selvstendig næringsdrivende fra yrkesaktivitetstypen på søknaden. Kombinasjoner av yrkesaktiviteter fanger Spleis opp i det søknaden kommer inn, og forkaster da perioden med RV_SØ_53. Avgjørelsen er spredt i sjekker ved søknadshåndteringen, er ikke lagret noe sted og kan ikke overstyres av saksbehandler.

Vi trenger rettighetskategorien som eget begrep for å kunne behandle kombinerte yrkesaktiviteter (§§ 8-40 til 8-43) og for å la opptjening og senere regler bruke den. Saksbehandler skal også kunne overstyre den, på samme måte som opptjening.

## Løsning

En ny tjeneste, sp-rettighetskategori, avgjør rettighetskategorien én gang per skjæringstidspunkt. Spleis får en ny tilstand, `AvventerRettighetskategori`, mellom `AvventerBlokkerendePeriode` og `AvventerVilkårsprøving`. Der spør Spleis tjenesten og får tilbake en ID. Spleis lagrer ID-en i et minimalt vilkårsgrunnlag for skjæringstidspunktet. Det fulle vilkårsgrunnlaget som lages i `AvventerVilkårsprøving`, erstatter det minimale og tar med seg ID-en. Når Spleis trenger kategorien, slår den opp med ID-en.

I første versjon gir løsningen samme resultat som i dag. Kombinerte hovedkategorier forkastes med RV_SØ_53. Arbeidstaker og selvstendig næringsdrivende avgjøres like presist som før.

Alle vilkårsgrunnlag skal ha en rettighetskategori-ID, også de som finnes fra før. Spleis gir eksisterende vilkårsgrunnlag en deterministisk ID med en JSON-migrering, slik den gjorde for `opptjeningsvurderingId`. sp-rettighetskategori fyller inn avgjørelsene bak disse ID-ene i ettertid, med data fra spleis-api. Uten dette ville Spleis hoppe over RV_SØ_53 når søknaden kommer inn, og så hoppe over konsistenssjekken senere fordi skjæringstidspunktet mangler ID. Da slipper kombinasjoner gjennom.

### Faser

Vi ruller ut i fire faser. Hver fase rulles ut i dev før prod, med én toggle i Spleis per fase. Togglen fra én fase er fjernet før neste fase får sin.

1. **Lage ID-er uten å bruke dem.** Alle vilkårsgrunnlag får rettighetskategori-ID. sp-rettighetskategori avgjør og lagrer nye rettighetskategorier, og Spleis går gjennom `AvventerRettighetskategori` og lagrer ID-en i et minimalt vilkårsgrunnlag. Spleis bruker ikke kategorien, og RV_SØ_53 kjører når søknaden kommer inn, som i dag.
2. **Fylle inn historikken.** sp-rettighetskategori lager avgjørelser for ID-er som bare finnes i Spleis. Det skjer ved `person_avstemming` og når tjenesten får et oppslag på en ID den ikke kjenner.
3. **Flytte valideringen.** RV_SØ_53 flyttes fra søknadshåndteringen til `AvventerVilkårsprøving` og `AvventerHistorikk`. Fase 3 krever ikke at fase 2 er ferdig for alle personer, fordi oppslag på ukjente ID-er fyller inn avgjørelsen med en gang.
4. **Rydde opp.** Når migreringsloggen viser at alle personer er fylt inn, fjerner vi innfyllingen i sp-rettighetskategori og endepunktet i spleis-api.

## Brukerhistorier

1. Som Spleis vil jeg få avgjort rettighetskategorien for et sykefraværstilfelle før vilkårsprøving, slik at vilkårsprøvingen vet hvilke regler som gjelder.
2. Som Spleis vil jeg spørre om rettighetskategorien først når alle nye søknader som overlapper skjæringstidspunktet er blitt sendte søknader, slik at avgjørelsen bygger på alle yrkesaktivitetene.
3. Som Spleis vil jeg sende referanse-ID-ene til de sendte søknadene som overlapper skjæringstidspunktet, slik at tjenesten vet nøyaktig hvilke søknader avgjørelsen skal bygge på.
4. Som Spleis vil jeg sende søknader fra alle yrkesaktiviteter med samme skjæringstidspunkt, slik at tjenesten ser kombinasjonene.
5. Som Spleis vil jeg holde søknader fra forkastede perioder utenfor, slik at forkastede yrkesaktiviteter ikke påvirker kategorien.
6. Som Spleis vil jeg holde forlengelser utenfor, slik at bare søknadene som overlapper skjæringstidspunktet avgjør kategorien.
7. Som Spleis vil jeg få tilbake bare en ID, slik at sp-rettighetskategori er den eneste eieren av avgjørelsen.
8. Som Spleis vil jeg lagre ID-en i et minimalt vilkårsgrunnlag for skjæringstidspunktet når løsningen kommer, slik at ID-en gjelder hele sykefraværstilfellet fra første stund og er tilgjengelig når vilkårsgrunnlaget lages.
9. Som Spleis vil jeg at det fulle vilkårsgrunnlaget erstatter det minimale ved vilkårsprøving og tar med seg ID-en, slik at det bare finnes ett vilkårsgrunnlag per skjæringstidspunkt.
10. Som Spleis vil jeg alltid gå gjennom `AvventerRettighetskategori` på vei til `AvventerVilkårsprøving`, og stole på at sp-rettighetskategori gir samme ID for samme søknadssett, slik at Spleis ikke trenger egen logikk for når den skal spørre.
11. Som Spleis vil jeg gå gjennom `AvventerRettighetskategori` på vei til `AvventerVilkårsprøvingRevurdering`, slik at et flyttet skjæringstidspunkt får sin egen avgjørelse.
12. Som Spleis vil jeg slå opp hovedkategorien med ID-en i `AvventerVilkårsprøving`, slik at jeg kan forkaste kombinerte kategorier før vilkårsprøvingen.
13. Som Spleis vil jeg forkaste hele sykefraværstilfellet med RV_SØ_53 når hovedkategorien er en kombinasjon, slik at saken går til Infotrygd som i dag.
14. Som Spleis vil jeg slå opp hovedkategorien med ID-en i `AvventerHistorikk`, slik at også forlengelser og revurderinger blir sjekket.
15. Som Spleis vil jeg forkaste en periode med RV_SØ_53 når hovedkategorien ikke stemmer med periodens yrkesaktivitetstype, slik at en selvstendig forlengelse i et arbeidstakertilfelle blir forkastet som i dag.
16. Som Spleis vil jeg forkaste bare den nye perioden når en søknad fra en annen yrkesaktivitet kommer etter at skjæringstidspunktet har fått fullt vilkårsgrunnlag, slik at allerede behandlede perioder ikke endres.
17. Som Spleis vil jeg sende rettighetskategori-ID-en med i opptjeningsbehovet, slik at sp-vilkarsproving senere kan bruke kategorien.
18. Som Spleis vil jeg gi alle eksisterende vilkårsgrunnlag en deterministisk rettighetskategori-ID med en JSON-migrering, slik at ingen skjæringstidspunkt mangler ID når valideringen flyttes.
19. Som Spleis vil jeg lage samme deterministiske ID når et nytt vilkårsgrunnlag lages uten ID fra sp-rettighetskategori, for eksempel med togglen av eller fra Infotrygd, slik at feltet aldri er tomt.
20. Som Spleis vil jeg fortsatt sjekke `andreInntektskilder` på søknaden selv, slik at varsler og forkasting for andre inntektskilder virker som i dag.
21. Som Spleis vil jeg fortsatt forkaste frilans og arbeidsledig i `Start`, slik at RV_SØ_39 virker som i dag.
22. Som Spleis vil jeg at togglen for fase 1 styrer overgangen til `AvventerRettighetskategori`, slik at vi kan prøve den i dev før prod.
23. Som Spleis vil jeg at togglen for fase 3 slår av RV_SØ_53 ved søknadshåndtering før skjæringstidspunktet har fullt vilkårsgrunnlag, og slår på oppslag og forkasting, slik at tjenesten får se kombinasjonene.
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
37. Som utvikler vil jeg kunne sammenligne antall forkastinger med RV_SØ_53 før og etter togglen for fase 3, slik at vi ser at løsningen virker like godt som i dag.
38. Som Spleis vil jeg tilby et endepunkt i spleis-api som gir alle rettighetskategori-ID-ene til en person med skjæringstidspunkt og yrkesaktivitetstyper, slik at sp-rettighetskategori kan fylle inn historikken.
39. Som sp-rettighetskategori vil jeg avgjøre hovedkategorien for en historisk ID ut fra yrkesaktivitetstypene til periodene som bruker vilkårsgrunnlaget, slik at resultatet blir det samme som Spleis kom fram til.
40. Som sp-rettighetskategori vil jeg hente og lagre historikken for personen synkront når jeg får `RettighetskategoriResultat` for en ID jeg ikke kjenner, slik at Spleis får svar selv om personen ikke er fylt inn ennå.
41. Som sp-rettighetskategori vil jeg hente historikken for personen ved hver `person_avstemming` og lagre ID-ene som mangler, slik at ID-er Spleis har laget siden sist også blir fylt inn.
42. Som sp-rettighetskategori vil jeg føre en migreringslogg per person, slik at vi vet når alle er fylt inn og kan slutte å hente fra Spleis.
43. Som utvikler vil jeg fjerne innfyllingen når alle personer er fylt inn, slik at sp-rettighetskategori ikke lenger er avhengig av spleis-api.
44. Som Spleis vil jeg skille det minimale vilkårsgrunnlaget fra de fulle med det eksisterende feltet `type` i JSON-en, slik at eksisterende vilkårsgrunnlag kan leses uten migrering.
45. Som Spleis vil jeg at bare `AvventerVilkårsprøving` og `AvventerVilkårsprøvingRevurdering` ser det minimale vilkårsgrunnlaget, slik at all annen kode som spør etter vilkårsgrunnlaget, virker som i dag.

## Beslutninger om implementasjon

### Ny tjeneste: sp-rettighetskategori

- Ny Kotlin-app med egen Postgres-database, satt opp etter sykepenger-standarden.
- Tjenesten lytter på rapiden og svarer på to behov:
  - `Rettighetskategori`: inn kommer person, skjæringstidspunkt og referanse-ID-ene (Spedisjons `@id`) til de sendte søknadene. Ut kommer en rettighetskategori-ID.
  - `RettighetskategoriResultat`: inn kommer en rettighetskategori-ID. Ut kommer hovedkategorien.
- Tjenesten henter søknadene synkront fra Spedisjons API for meldinger med de interne dokument-ID-ene. Spleis trenger ikke den eksterne søknads-ID-en.
- Hver søknad mappes til yrkesaktivitet på samme måte som Spleis gjør i dag, ut fra søknadstypen og `arbeidssituasjon`. Dette gjelder også fisker, jordbruker, barnepasser og «annet».
- Hovedkategoriene følger `abstraksjoner-kap8.md`: Arbeidstaker, Selvstendig næringsdrivende, Frilanser, Arbeidstaker og frilanser, Arbeidstaker og selvstendig næringsdrivende, Selvstendig næringsdrivende og frilanser, Arbeidstaker, selvstendig næringsdrivende og frilanser, og Ingen. Første versjon har ingen tilleggskategorier.
- Tjenesten ser ikke på `andreInntektskilder`.
- Lagring følger mønsteret fra `opptjeningsvurdering` i sp-vilkarsproving. Hver avgjørelse er en ny rad med egen ID, person, skjæringstidspunkt, hovedkategori, kilde (`automatisk`, `saksbehandler` eller `spleis`), tidspunkt og søknads-ID-ene som ble brukt. Gjeldende avgjørelse er den nyeste for person og skjæringstidspunkt.
- Samme søknadssett gir gjeldende ID tilbake. Et nytt søknadssett gir en ny automatisk avgjørelse. En innfylt avgjørelse har ikke noe søknadssett, så det første behovet etter innfyllingen gir alltid en ny avgjørelse.
- Hvis Spedisjon feiler eller mangler en søknad, svarer ikke tjenesten på behovet.

### Innfylling av historikken i sp-rettighetskategori

- Innfyllingen følger mønsteret for opptjening i sp-vilkarsproving: `SpleisClient`, `PersonAvstemmingService` og fallbacken i `OpptjeningsvurderingResultatRiver`.
- Nytt endepunkt i spleis-api, `POST /api/rettighetskategorier`, med fødselsnummer inn. For hver rettighetskategori-ID i de fulle vilkårsgrunnlagene i historikken svarer det med ID, skjæringstidspunkt, opprettet, kilden til vilkårsgrunnlaget (`SPLEIS` eller `INFOTRYGD`), om inntektsgrunnlaget har selvstendig inntekt og yrkesaktivitetstypene til vedtaksperiodene som bruker vilkårsgrunnlaget, delt i aktive og forkastede perioder. Opprettet tas fra det første historikkinnslaget med ID-en, som i `OpptjeningApi`.
- sp-rettighetskategori avgjør hovedkategorien slik Spleis gjorde:
  - Yrkesaktivitetstypene til periodene som ikke er forkastet, gir hovedkategorien. Arbeidstaker gir Arbeidstaker. Selvstendig, fisker, jordbruker og barnepasser gir Selvstendig næringsdrivende. Begge deler gir Arbeidstaker og selvstendig næringsdrivende.
  - Vilkårsgrunnlag fra Infotrygd gir Arbeidstaker, som for opptjening.
  - Bruker ingen aktive perioder vilkårsgrunnlaget, bruker vi de forkastede periodene. Bruker ingen perioder det, gir selvstendig inntekt i inntektsgrunnlaget Selvstendig næringsdrivende og ellers Arbeidstaker.
- Innfylte avgjørelser lagres med ID-en fra Spleis, kilde `spleis`, tidspunktet fra opprettet og uten søknads-ID-er. Lagringen er idempotent på ID.
- `RettighetskategoriResultat` slår først opp lokalt. Finnes ikke ID-en, henter tjenesten historikken for personen synkront, lagrer ID-ene som mangler, fører migreringsloggen og svarer. Finnes ID-en heller ikke i Spleis, svarer ikke tjenesten, og feilen logges.
- `person_avstemming` henter historikken hver gang og lagrer ID-ene som mangler. sp-vilkarsproving hopper over personer som står i migreringsloggen. Det gjør ikke sp-rettighetskategori, fordi Spleis kan lage nye deterministiske ID-er etter forrige avstemming, for eksempel for vilkårsgrunnlag fra Infotrygd.
- Migreringsloggen har én rad per innfylling med fødselsnummer, tidspunkt, antall ID-er fra Spleis og antall nye. Når alle personer med vilkårsgrunnlag står i loggen, og nye ID-er ikke lenger dukker opp, kan vi fjerne innfyllingen (fase 4).
- Spleis sender `person_avstemming` for hver person én gang i måneden. Fase 3 venter ikke på en full runde, fordi `RettighetskategoriResultat` fyller inn ID-en med en gang. Fase 4 venter på den.

### Endringer i Spleis

- Vilkårsgrunnlaget får feltet `rettighetskategoriId`, som aldri er tomt. En JSON-migrering setter det på alle eksisterende vilkårsgrunnlag, både fra Spleis og fra Infotrygd, til `UUID.nameUUIDFromBytes("$vilkårsgrunnlagId:Rettighetskategori")`. Det følger V345 og V346 for `opptjeningsvurderingId`.
- Lages et vilkårsgrunnlag uten ID fra sp-rettighetskategori, bruker Spleis samme deterministiske ID. Det gjelder vilkårsgrunnlag fra Infotrygd, perioder med togglen for fase 1 av og perioder som allerede var forbi `AvventerRettighetskategori` da togglen ble skrudd på. Spleis bruker ikke tilfeldige ID-er, slik opptjening gjør i dag.
- Et kopiert vilkårsgrunnlag beholder ID-en, slik det gjør med `opptjeningsvurderingId`.
- Ny tilstand `AvventerRettighetskategori` mellom `AvventerBlokkerendePeriode` og `AvventerVilkårsprøving`, og tilsvarende før `AvventerVilkårsprøvingRevurdering`. Perioden går alltid gjennom tilstanden på vei til vilkårsprøving. Spleis sjekker ikke om skjæringstidspunktet allerede har rettighetskategori-ID, men stoler på at sp-rettighetskategori gir samme ID for samme søknadssett. Forlengelser går ikke til vilkårsprøving og kommer derfor aldri til tilstanden.
- Tilstanden sender behovet `Rettighetskategori` med referanse-ID-ene til sendte søknader fra perioder som ikke er forkastet, overlapper skjæringstidspunktet og har samme skjæringstidspunkt, på tvers av yrkesaktiviteter.
- Løsningen er bare en ID. Spleis lagrer aldri hovedkategorien (se ADR 0001). Når løsningen kommer, lagrer Spleis ID-en i et minimalt vilkårsgrunnlag for skjæringstidspunktet, og perioden går videre til vilkårsprøving. Se ADR 0003 og avsnittet om det minimale vilkårsgrunnlaget under.
- `AvventerVilkårsprøving` og `AvventerVilkårsprøvingRevurdering` henter rettighetskategori-ID-en fra det minimale vilkårsgrunnlaget for skjæringstidspunktet. Det fulle vilkårsgrunnlaget får samme ID, ved siden av `opptjeningsvurderingId`, og erstatter det minimale i et nytt historikkinnslag. Finnes det ikke noe minimalt vilkårsgrunnlag, for eksempel med togglen for fase 1 av, får det fulle vilkårsgrunnlaget den deterministiske ID-en.
- `AvventerVilkårsprøving` slår opp hovedkategorien med `RettighetskategoriResultat`, med ID-en fra det minimale vilkårsgrunnlaget. Er hovedkategorien en kombinasjon, forkastes hele sykefraværstilfellet med RV_SØ_53.
- `AvventerVilkårsprøving` sender rettighetskategori-ID-en med i opptjeningsbehovet.
- `AvventerHistorikk` slår opp hovedkategorien med `RettighetskategoriResultat` sammen med ytelsene, slik opptjening gjør. Stemmer ikke hovedkategorien med periodens yrkesaktivitetstype, forkastes perioden med RV_SØ_53.
- Spleis slår alltid opp hovedkategorien, fordi alle vilkårsgrunnlag har rettighetskategori-ID. Det finnes ingen vei utenom oppslaget og konsistenssjekken.
- Togglen for fase 1 styrer overgangen til `AvventerRettighetskategori`. Den fjernes før fase 3.
- Togglen for fase 3 styrer oppslagene i `AvventerVilkårsprøving` og `AvventerHistorikk` og RV_SØ_53 når en søknad kommer inn og en annen yrkesaktivitet har en periode som overlapper eller ligger inntil:
  - **Før skjæringstidspunktet har et fullt vilkårsgrunnlag**, kjører ikke RV_SØ_53. Et minimalt vilkårsgrunnlag teller ikke. Begge periodene kommer da til `AvventerRettighetskategori`, sp-rettighetskategori ser kombinasjonen, og Spleis forkaster hele sykefraværstilfellet i `AvventerVilkårsprøving`. Eksempel: AT 1.–31. januar står i `AvventerBlokkerendePeriode` eller `AvventerVilkårsprøving`, og en søknad for SN 1.–31. januar kommer inn. Rekker AT-perioden å bli vilkårsprøvd med den gamle ID-en før SN-perioden er gjennom `AvventerRettighetskategori`, fanger konsistenssjekken i `AvventerHistorikk` SN-perioden.
  - **Når skjæringstidspunktet har et fullt vilkårsgrunnlag**, kjører RV_SØ_53 som i dag og forkaster bare den nye perioden. Eksempel: AT 1.–31. januar er utbetalt, og en søknad for SN 1.–31. januar kommer inn.
  - **Når togglen for fase 3 er av**, kjører RV_SØ_53 som i dag i begge tilfellene, og Spleis slår ikke opp hovedkategorien.
- `andreInntektskilder` og RV_SØ_39 i `Start` er uendret.
- Ubesvarte behov sendes på nytt ved påminnelse.

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
- **Spleis, e2e i sykepenger-model.** Testene sender søknader inn, svarer på `Rettighetskategori` og `RettighetskategoriResultat` med testløsninger og sjekker tilstand, forkasting og RV_SØ_53. Scenarioene for fase 1 kjøres med togglen for fase 1 av og på, og scenarioene for fase 3 med togglen for fase 3 av og på. Scenarioer:
  - Bare arbeidstaker, og bare selvstendig næringsdrivende.
  - Arbeidstaker og selvstendig næringsdrivende som overlapper skjæringstidspunktet.
  - Selvstendig forlengelse av et arbeidstakertilfelle.
  - En søknad fra en annen yrkesaktivitet etter at kategorien er avgjort og perioden er utbetalt.
  - En søknad fra en annen yrkesaktivitet mens perioden står i `AvventerVilkårsprøving` med et minimalt vilkårsgrunnlag.
  - At løsningen på `Rettighetskategori` gir et minimalt vilkårsgrunnlag, og at det fulle vilkårsgrunnlaget erstatter det med samme rettighetskategori-ID.
  - Et sykefraværstilfelle som forkastes i `AvventerVilkårsprøving`, der det minimale vilkårsgrunnlaget forsvinner.
  - Forlengelse som ikke går gjennom `AvventerRettighetskategori`.
  - Ny vilkårsprøving med samme søknadssett, som gir samme rettighetskategori-ID.
  - Revurdering som flytter skjæringstidspunktet.
  - Et vilkårsgrunnlag fra før fase 1, med deterministisk ID, der Spleis slår opp hovedkategorien og sjekker forlengelser.
  - Et vilkårsgrunnlag som lages med togglen for fase 1 av, og et fra Infotrygd, som begge får deterministisk ID.
  - Ubesvart behov og påminnelse.
  Tester å bygge videre på: `KombinertTest` og `EndretVurderingPåSkjæringstidspunktTest`.
- **Spleis, serde.** En test sjekker at en person med minimalt vilkårsgrunnlag (`type: Rettighetskategori`) kan lagres og leses igjen, og at eksisterende JSON med `Vilkårsprøving` og `Infotrygd` leses som før.
- **Spleis, JSON-migrering.** En migreringstest sjekker at alle vilkårsgrunnlag får `rettighetskategoriId`, og at ID-en er den samme som Spleis lager for et nytt vilkårsgrunnlag med samme `vilkårsgrunnlagId`.
- **Spleis, spleis-api.** Endepunktet testes med personer som har arbeidstaker, selvstendig, kombinerte og forkastede perioder og vilkårsgrunnlag fra Infotrygd. Tester å bygge videre på: testene for `OpptjeningApi`.
- **sp-rettighetskategori, på rapidnivå.** Testene sender behov og `person_avstemming` inn og sjekker løsningen og databasen. Spedisjon og spleis-api fakes i HTTP-klienten, og databasen er ekte Postgres. Testene dekker:
  - mappingen av alle søknadstyper og alle kombinasjoner
  - samme og endret søknadssett, og at en overstyring ikke overskrives
  - at Spedisjon-feil gir ubesvart behov
  - `RettighetskategoriResultat` for en ukjent ID, som fyller inn personen og svarer
  - en ID som ikke finnes i Spleis heller, som gir ubesvart behov
  - `person_avstemming` to ganger, der andre gang bare lagrer nye ID-er og begge gangene føres i migreringsloggen
  - hovedkategorien for historiske ID-er, med de samme personene som i testene for spleis-api

  Tester å bygge videre på: `OpptjeningsvurderingRiverTest`, `OpptjeningsvurderingResultatRiverCallthroughTest` og `PersonAvstemmingRiverTest` i sp-vilkarsproving.
- **Behovkontrakt i Spleis.** De nye behovene og det nye feltet i opptjeningsbehovet legges inn i `BehovkontraktTest` i sykepenger-mediators.

## Utenfor omfang

- Overstyring fra saksbehandler. Lagringen er klar for det, men REST-endepunkt, visning i Speil, `saksbehandlerhandling` til Spesialist og `endret_rettighetskategori` til Spleis kommer senere.
- At opptjening bruker rettighetskategorien til å velge sin `Kategori`.
- Tilleggskategorier, Dagpenger og Inaktiv.
- Behandling av kombinerte hovedkategorier etter § 8-41. De forkastes fortsatt.
- Ny avgjørelse og revurdering av hele sykefraværstilfellet når en søknad fra en annen yrkesaktivitet kommer etter avgjørelsen. Den nye perioden forkastes som i dag.
- Oppslag fra andre tjenester enn Spleis.
- `andreInntektskilder` i sp-rettighetskategori.

## Andre merknader

- Begrepene følger `GLOSSARY.md`, og hovedkategoriene følger `docs/abstraksjoner-kap8.md`.
- ADR 0001 forklarer hvorfor Spleis bare lagrer ID-en. ADR 0002 forklarer hvorfor alle vilkårsgrunnlag får ID, og hvorfor sp-rettighetskategori fyller inn historikken. ADR 0003 forklarer hvorfor ID-en lagres i et minimalt vilkårsgrunnlag og ikke på behandlingen.
- `docs/forenkle-tilstandsmaskin.md` er oppdatert med ny plassering av `AvventerRettighetskategori`. Tilstanden kommer etter at tilstandsmaskinen er slått sammen.
- I dag forkaster RV_SØ_53 også perioder som ligger inntil hverandre. Med løsningen fanger konsistenssjekken i `AvventerHistorikk` dem opp. Resultatet blir det samme: perioden fra den andre yrkesaktiviteten forkastes, mens den første behandles videre.
- Forkastingen av kombinerte tilfeller skjer senere enn i dag. I dag forkaster RV_SØ_53 perioden i det søknaden kommer inn. Andre søknader som forlenger eller overlapper perioden, forkastes deretter når de kommer inn (RV_SØ_31 til RV_SØ_38). Med løsningen forkaster Spleis først i `AvventerVilkårsprøving`. Søknader som kommer inn før det, blir vanlige aktive perioder og fanges ikke av sjekken mot forkastede perioder. Når Spleis forkaster hele sykefraværstilfellet, må den derfor også ta med disse periodene.
- Åpent spørsmål for overstyringsflyten: Et endret søknadssett gir en ny automatisk avgjørelse. Når saksbehandler kan overstyre, vil en korrigert søknad dermed kunne erstatte en overstyring uten at noen ser det. Vi må avklare hva som skal skje før overstyring tas i bruk.
- Åpent spørsmål for innfyllingen: Vi bruker forkastede perioder bare når ingen aktive perioder bruker vilkårsgrunnlaget. Vi må sjekke mot data i prod at det gir samme hovedkategori som Spleis kom fram til, før fase 3 rulles ut i prod. Spesielt gjelder det vilkårsgrunnlag der både arbeidstaker- og selvstendig-perioder er aktive. Etter dagens RV_SØ_53 skal det ikke finnes slike.
