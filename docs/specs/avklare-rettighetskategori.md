# Avklare rettighetskategori i sp-rettighetskategori

## Problem

Spleis avgjør i dag ikke rettighetskategorien eksplisitt. Spleis utleder om en periode gjelder arbeidstaker eller selvstendig næringsdrivende fra yrkesaktivitetstypen på søknaden. Kombinasjoner av yrkesaktiviteter fanger Spleis opp i det søknaden kommer inn, og forkaster da perioden med RV_SØ_53. Avgjørelsen er spredt i sjekker ved søknadshåndteringen, er ikke lagret noe sted og kan ikke overstyres av saksbehandler.

Vi trenger rettighetskategorien som eget begrep for å kunne behandle kombinerte yrkesaktiviteter (§§ 8-40 til 8-43) og for å la opptjening og senere regler bruke den. Saksbehandler skal også kunne overstyre den, på samme måte som opptjening.

## Løsning

En ny tjeneste, sp-rettighetskategori, avgjør rettighetskategorien én gang per skjæringstidspunkt. Spleis får en ny tilstand, `AvventerRettighetskategori`, mellom `AvventerBlokkerendePeriode` og `AvventerVilkårsprøving`. Der spør Spleis tjenesten og får tilbake en ID. Når Spleis trenger kategorien, slår den opp med ID-en.

I første versjon gir løsningen samme resultat som i dag. Kombinerte hovedkategorier forkastes med RV_SØ_53. Arbeidstaker og selvstendig næringsdrivende avgjøres like presist som før. Vi slår løsningen av og på med en toggle i overgangene i Spleis.

## Brukerhistorier

1. Som Spleis vil jeg få avgjort rettighetskategorien for et sykefraværstilfelle før vilkårsprøving, slik at vilkårsprøvingen vet hvilke regler som gjelder.
2. Som Spleis vil jeg spørre om rettighetskategorien først når alle nye søknader som overlapper skjæringstidspunktet er blitt sendte søknader, slik at avgjørelsen bygger på alle yrkesaktivitetene.
3. Som Spleis vil jeg sende referanse-ID-ene til de sendte søknadene som overlapper skjæringstidspunktet, slik at tjenesten vet nøyaktig hvilke søknader avgjørelsen skal bygge på.
4. Som Spleis vil jeg sende søknader fra alle yrkesaktiviteter med samme skjæringstidspunkt, slik at tjenesten ser kombinasjonene.
5. Som Spleis vil jeg holde søknader fra forkastede perioder utenfor, slik at forkastede yrkesaktiviteter ikke påvirker kategorien.
6. Som Spleis vil jeg holde forlengelser utenfor, slik at bare søknadene som overlapper skjæringstidspunktet avgjør kategorien.
7. Som Spleis vil jeg få tilbake bare en ID, slik at sp-rettighetskategori er den eneste eieren av avgjørelsen.
8. Som Spleis vil jeg lagre ID-en på behandlingen mens perioden venter på vilkårsprøving, slik at den er tilgjengelig når vilkårsgrunnlaget lages.
9. Som Spleis vil jeg legge ID-en i vilkårsgrunnlaget ved vilkårsprøving, slik at den gjelder hele sykefraværstilfellet.
10. Som Spleis vil jeg hoppe over `AvventerRettighetskategori` når skjæringstidspunktet allerede har en rettighetskategori, slik at forlengelser ikke spør på nytt.
11. Som Spleis vil jeg gå gjennom `AvventerRettighetskategori` i revurdering når skjæringstidspunktet mangler rettighetskategori, slik at et flyttet skjæringstidspunkt får sin egen avgjørelse.
12. Som Spleis vil jeg slå opp hovedkategorien med ID-en i `AvventerVilkårsprøving`, slik at jeg kan forkaste kombinerte kategorier før vilkårsprøvingen.
13. Som Spleis vil jeg forkaste hele sykefraværstilfellet med RV_SØ_53 når hovedkategorien er en kombinasjon, slik at saken går til Infotrygd som i dag.
14. Som Spleis vil jeg slå opp hovedkategorien med ID-en i `AvventerHistorikk`, slik at også forlengelser og revurderinger blir sjekket.
15. Som Spleis vil jeg forkaste en periode med RV_SØ_53 når hovedkategorien ikke stemmer med periodens yrkesaktivitetstype, slik at en selvstendig forlengelse i et arbeidstakertilfelle blir forkastet som i dag.
16. Som Spleis vil jeg forkaste bare den nye perioden når en søknad fra en annen yrkesaktivitet kommer etter at kategorien er avgjort, slik at allerede behandlede perioder ikke endres.
17. Som Spleis vil jeg sende rettighetskategori-ID-en med i opptjeningsbehovet, slik at sp-vilkarsproving senere kan bruke kategorien.
18. Som Spleis vil jeg behandle perioder uten rettighetskategori-ID ut fra yrkesaktivitetstypen, slik at perioder fra før togglen virker som før.
19. Som Spleis vil jeg hoppe over konsistenssjekken når rettighetskategori-ID mangler, slik at gamle perioder ikke forkastes.
20. Som Spleis vil jeg fortsatt sjekke `andreInntektskilder` på søknaden selv, slik at varsler og forkasting for andre inntektskilder virker som i dag.
21. Som Spleis vil jeg fortsatt forkaste frilans og arbeidsledig i `Start`, slik at RV_SØ_39 virker som i dag.
22. Som Spleis vil jeg at togglen styrer overgangen til `AvventerRettighetskategori`, slik at vi kan slå løsningen av og på uten å deploye på nytt.
23. Som Spleis vil jeg at samme toggle slår av RV_SØ_53 ved søknadshåndtering for perioder uten rettighetskategori, slik at tjenesten får se kombinasjonene.
24. Som Spleis vil jeg at RV_SØ_53 ved søknadshåndtering virker som i dag når togglen er av, slik at vi kan gå tilbake.
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
37. Som utvikler vil jeg kunne sammenligne antall forkastinger med RV_SØ_53 før og etter togglen, slik at vi ser at løsningen virker like godt som i dag.

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
- Lagring følger mønsteret fra `opptjeningsvurdering` i sp-vilkarsproving. Hver avgjørelse er en ny rad med egen ID, person, skjæringstidspunkt, hovedkategori, kilde (`automatisk` eller `saksbehandler`), tidspunkt og søknads-ID-ene som ble brukt. Gjeldende avgjørelse er den nyeste for person og skjæringstidspunkt.
- Samme søknadssett gir gjeldende ID tilbake. Et nytt søknadssett gir en ny automatisk avgjørelse.
- Hvis Spedisjon feiler eller mangler en søknad, svarer ikke tjenesten på behovet.

### Endringer i Spleis

- Ny tilstand `AvventerRettighetskategori` mellom `AvventerBlokkerendePeriode` og `AvventerVilkårsprøving`, og tilsvarende før `AvventerVilkårsprøvingRevurdering`. Perioden går bare dit når skjæringstidspunktet ikke har rettighetskategori-ID.
- Tilstanden sender behovet `Rettighetskategori` med referanse-ID-ene til sendte søknader fra perioder som ikke er forkastet, overlapper skjæringstidspunktet og har samme skjæringstidspunkt, på tvers av yrkesaktiviteter.
- Løsningen er bare en ID. Spleis lagrer ID-en på behandlingen og flytter den inn i vilkårsgrunnlaget ved vilkårsprøving, ved siden av `opptjeningsvurderingId`. Spleis lagrer aldri hovedkategorien (se ADR 0001).
- `AvventerVilkårsprøving` slår opp hovedkategorien med `RettighetskategoriResultat`. Er hovedkategorien en kombinasjon, forkastes hele sykefraværstilfellet med RV_SØ_53.
- `AvventerVilkårsprøving` sender rettighetskategori-ID-en med i opptjeningsbehovet.
- `AvventerHistorikk` slår opp hovedkategorien med `RettighetskategoriResultat` sammen med ytelsene, slik opptjening gjør. Stemmer ikke hovedkategorien med periodens yrkesaktivitetstype, forkastes perioden med RV_SØ_53.
- Mangler skjæringstidspunktet rettighetskategori-ID, hopper Spleis over oppslaget og konsistenssjekken og bruker yrkesaktivitetstypen som før.
- En toggle styrer overgangen til `AvventerRettighetskategori`. Når togglen er på, kjører ikke RV_SØ_53 ved søknadshåndtering for perioder som ikke har rettighetskategori. Når skjæringstidspunktet allerede har rettighetskategori, forkaster RV_SØ_53 fortsatt bare den nye perioden, som i dag.
- `andreInntektskilder` og RV_SØ_39 i `Start` er uendret.
- Ubesvarte behov sendes på nytt ved påminnelse.

### Endringer i sp-vilkarsproving

- Opptjeningsbehovet får et nytt, valgfritt felt med rettighetskategori-ID. sp-vilkarsproving tar imot feltet, men bruker det ikke i første versjon.

## Beslutninger om testing

- Gode tester sjekker ytre oppførsel: hendelser inn, behov og løsninger, tilstander, forkasting og varsler. De sjekker ikke interne klasser eller hjelpefunksjoner.
- **Spleis, e2e i sykepenger-model.** Testene sender søknader inn, svarer på `Rettighetskategori` og `RettighetskategoriResultat` med testløsninger og sjekker tilstand, forkasting og RV_SØ_53. Hvert scenario kjøres med togglen både av og på. Scenarioer:
  - Bare arbeidstaker, og bare selvstendig næringsdrivende.
  - Arbeidstaker og selvstendig næringsdrivende som overlapper skjæringstidspunktet.
  - Selvstendig forlengelse av et arbeidstakertilfelle.
  - En søknad fra en annen yrkesaktivitet etter at kategorien er avgjort og perioden er utbetalt.
  - Forlengelse som hopper over `AvventerRettighetskategori`.
  - Revurdering som flytter skjæringstidspunktet.
  - En periode fra før togglen uten rettighetskategori-ID.
  - Ubesvart behov og påminnelse.
  Tester å bygge videre på: `KombinertTest` og `EndretVurderingPåSkjæringstidspunktTest`.
- **sp-rettighetskategori, på rapidnivå.** Testene sender behov inn og sjekker løsningen. Spedisjon fakes i HTTP-klienten, og databasen er ekte Postgres. Testene dekker mappingen av alle søknadstyper, alle kombinasjoner, samme og endret søknadssett, at en overstyring ikke overskrives, og at Spedisjon-feil gir ubesvart behov. Tester å bygge videre på: `OpptjeningsvurderingRiverTest` og `OpptjeningsvurderingResultatRiverTest` i sp-vilkarsproving.
- **Behovkontrakt i Spleis.** De nye behovene og det nye feltet i opptjeningsbehovet legges inn i `BehovkontraktTest` i sykepenger-mediators.

## Utenfor omfang

- Overstyring fra saksbehandler. Lagringen er klar for det, men REST-endepunkt, visning i Speil, `saksbehandlerhandling` til Spesialist og `endret_rettighetskategori` til Spleis kommer senere.
- At opptjening bruker rettighetskategorien til å velge sin `Kategori`.
- Tilleggskategorier, Dagpenger og Inaktiv.
- Behandling av kombinerte hovedkategorier etter § 8-41. De forkastes fortsatt.
- Ny avgjørelse og revurdering av hele sykefraværstilfellet når en søknad fra en annen yrkesaktivitet kommer etter avgjørelsen. Den nye perioden forkastes som i dag.
- Rettighetskategori-ID for perioder som ble vilkårsprøvd før togglen.
- Oppslag fra andre tjenester enn Spleis.
- `andreInntektskilder` i sp-rettighetskategori.

## Andre merknader

- Begrepene følger `GLOSSARY.md`, og hovedkategoriene følger `docs/abstraksjoner-kap8.md`.
- ADR 0001 forklarer hvorfor Spleis bare lagrer ID-en.
- `docs/forenkle-tilstandsmaskin.md` er oppdatert med ny plassering av `AvventerRettighetskategori`. Tilstanden kommer etter at tilstandsmaskinen er slått sammen.
- I dag forkaster RV_SØ_53 også perioder som ligger inntil hverandre. Med løsningen fanger konsistenssjekken i `AvventerHistorikk` dem opp. Resultatet blir det samme: perioden fra den andre yrkesaktiviteten forkastes, mens den første behandles videre.
