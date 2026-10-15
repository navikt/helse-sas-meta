# Abstraksjoner for folketrygdloven kapittel 8

Dette dokumentet definerer abstraksjonene vi bruker for å modellere sykepengereglene i [folketrygdloven kapittel 8](folketrygdloven-kap8.md). Til sammen skal abstraksjonene kunne dekke alle situasjonene kapitlet regulerer.

## Grunnprinsipp: hjemmelen bevares

Hver avgjørelse lagrer hvilke paragrafer, ledd og bokstaver den bygger på. Vi skal alltid kunne forklare hvorfor en sak ble behandlet slik den ble, med henvisning til loven.

Derfor slår vi aldri sammen tolkninger av loven, selv når to bestemmelser gir samme resultat. Noen eksempler:

- Arbeidstaker og frilanser behandles etter reglene for arbeidstakere, men er likevel en egen hovedkategori. Vi må kunne vise at § 8-40 er brukt.
- Ventetid for selvstendig næringsdrivende (§ 8-34 andre ledd) og for frilansere (§ 8-38 andre ledd) har samme innhold, men to ulike hjemler.
- Opptjeningstiden i § 8-2 faller bort av fire ulike grunner (§§ 8-44, 8-45, 8-46 og 8-55). Hver av dem er en egen hjemmel.

Prinsippet gjelder alle abstraksjonene under.

## Begreper

**Sykefraværstilfelle** er en sammenhengende periode der personen er arbeidsufør. Én frisk dag avslutter sykefraværstilfellet, og neste sykedag starter et nytt. Helg og ferie i en sykmeldt periode avbryter ikke sykefraværstilfellet, og ferie etter § 8-17 andre ledd regnes ikke som en frisk dag. Arbeidsgiverperioden og ventetiden kan gå på tvers av flere sykefraværstilfeller.

**Skjæringstidspunkt** er første dag i sykefraværstilfellet. Det er det samme som første dag med arbeidsuførhet. Egenmeldingsdager og dager som en selvstendig næringsdrivende har meldt til Nav før sykmeldingen, er med. Opplysningene som avgjørelsene bygger på, hentes ut fra skjæringstidspunktet.

**Avgjort per sykefraværstilfelle** betyr at avgjørelsen tas én gang og gjelder hele sykefraværstilfellet. Rettighetskategori og sykepengegrunnlag er eksempler.

**Vurdert per dato** betyr at avgjørelsen kan gi ulikt resultat for ulike dager i samme sykefraværstilfelle. Opplysningene kan likevel være hentet på skjæringstidspunktet. Et eksempel er fødselsdatoen: Den endrer seg ikke, men personen kan fylle 67 eller 70 år midt i sykefraværstilfellet.

**Periodisert opplysning** er en opplysning som kan starte og slutte midt i et sykefraværstilfelle, for eksempel et fengselsopphold eller uføretrygd som innvilges.

**G** er grunnbeløpet i folketrygden.

## Oversikt

| Abstraksjon | Avgjør | Gjelder | Sentrale hjemler |
|---|---|---|---|
| Inntekt | Opplysninger om hva personen har tjent | Per sykefraværstilfelle | §§ 8-28, 8-29, 8-30, 8-35, 8-49 |
| Rettighetskategori | Hvilke regelsett som gjelder for personen | Per sykefraværstilfelle | §§ 8-15, 8-34, 8-38, 8-40 til 8-47, 8-49, 8-55 |
| Andre ytelser | Uføretrygd og AFP i perioder | Periodisert | §§ 8-48, 8-50, 8-52 |
| Institusjonsopphold | Opphold i helseinstitusjon og fengsel | Periodisert | §§ 8-53, 8-54 |
| Sykepengegrunnlag | Inntektsgrunnlaget, fordelt på deler | Per sykefraværstilfelle | §§ 8-10, 8-28 til 8-30, 8-35, 8-38, 8-41, 8-43, 8-46, 8-47, 8-49 |
| Inngangsvilkår | Om personen har rett til sykepenger i det hele tatt | Per sykefraværstilfelle | §§ 8-2, 8-3, 8-4 |
| Minsteinntekt (inngangsvilkår) | Om grunnlaget er høyt nok | Per sykefraværstilfelle | §§ 8-3, 8-47 |
| Arbeidsgiverperiode/ventetid | Perioden før trygden normalt dekker | På tvers av sykefraværstilfeller | §§ 8-19, 8-31, 8-34, 8-38, 8-46, 8-47, 8-54 |
| Dekning | Dekningsgrad og fra-dag per grunnlagsdel | Per sykefraværstilfelle | §§ 8-16, 8-17, 8-20, 8-21, 8-34, 8-36, 8-38, 8-39, 8-41, 8-47 |
| Løpende vilkår | Dager uten rett til sykepenger | Per dato | §§ 8-3, 8-5, 8-7, 8-8, 8-9, 8-15, 8-17, 8-31, 8-34, 8-38, 8-47, 8-51, 8-54 |
| Utbetalingsgrad | Delvis utbetaling på grunn av gradering eller reduksjon | Per dato | §§ 8-6, 8-13, 8-53, 8-54 |
| Sykepengedager/maksdato | Datoen retten tar slutt | På tvers av sykefraværstilfeller | §§ 8-3, 8-11, 8-12, 8-51, 8-55 |
| Reisetilskudd | Tilskudd til reise i stedet for sykepenger | Per dato | § 8-14 |

## Inntekt

Inntekt er ett objekt med rå opplysninger om det personen har tjent. Objektet inneholder alt de andre avgjørelsene trenger. Hver inntektstype har sitt eget typede felt, for eksempel `PensjonsgivendeInntekt`. Feltene er ikke en generell liste over beløp og kilder.

Inntekt inneholder ingen beregninger. G-regulering, gjennomsnitt, 6G-tak, avviksvurdering og skjønn hører til Sykepengegrunnlag.

Inntektstyper kapitlet bruker:

- Arbeidsinntekt per arbeidsforhold, slik den er rapportert til a-ordningen (§§ 8-28 og 8-29). Inntekten trengs for beregningsperioden, normalt de tre siste kalendermånedene.
- Rapportert inntekt de siste tolv kalendermånedene, som er sammenligningsgrunnlaget (§ 8-30 andre ledd). Sammenligningsgrunnlaget omfatter også enkelte ytelser og feriepenger.
- Pensjonsgivende årsinntekt for de tre siste årene (§ 8-35 andre ledd).
- Dagpenger per uke, ventelønn eller vartpenger (§ 8-49 tredje ledd).
- Inntekt før permittering (§ 8-49 tredje ledd), før militærtjeneste (§ 8-46 bokstav b) og før en gå-sakte-aksjon (§ 8-32).
- Inntekt på innsettelsestidspunktet og under et fengselsopphold (§ 8-54 tredje ledd).

## Rettighetskategori

Rettighetskategorien beskriver de egenskapene ved personen som avgjør hvilke regler som gjelder videre. Kategorien avgjøres per sykefraværstilfelle, ut fra forholdene på skjæringstidspunktet. Den består av én hovedkategori og null eller flere tilleggskategorier.

### Skillet mellom hovedkategori og tilleggskategori

En tilleggskategori endrer enkelte detaljer, men reglene for hovedkategorien gjelder fortsatt. Hvis en egenskap gjør reglene for hovedkategorien uten betydning, er den ikke en tilleggskategori. Da er den en egen hovedkategori.

En egenskap som kan begynne eller slutte midt i et sykefraværstilfelle, er ingen kategori. Den modelleres som en periodisert opplysning eller vurderes per dato. Eksempler er alder (Sykepengedager/maksdato og Løpende vilkår), fengsel (Institusjonsopphold) og uføretrygd (Andre ytelser).

### Hovedkategorier

| Hovedkategori | Hjemmel | Merknad |
|---|---|---|
| Arbeidstaker | §§ 8-15 til 8-33 | |
| Selvstendig næringsdrivende | §§ 8-34 til 8-37 | |
| Frilanser | §§ 8-38 og 8-39 | |
| Arbeidstaker og frilanser | § 8-40 | Behandles etter reglene for arbeidstakere |
| Arbeidstaker og selvstendig næringsdrivende | § 8-41 | Grunnlaget har en del for hver inntektstype, og hver del har egen dekning |
| Selvstendig næringsdrivende og frilanser | § 8-42 | Behandles etter § 8-41 |
| Arbeidstaker, selvstendig næringsdrivende og frilanser | § 8-43 | Behandles etter § 8-41 |
| Vernepliktig | § 8-46 | Behandles etter reglene for arbeidstakere, uansett hva personen var før tjenesten |
| Inaktiv | § 8-47 | Variant a (fortsatt ute av arbeid) eller b (i arbeid uten opptjeningstid). Gjelder bare når ingen annen bestemmelse gir rett |
| Dagpengemottaker | § 8-49 første til tredje ledd | Omfatter også ventelønn og vartpenger |
| Dagpengemottaker i deltidsarbeid | § 8-49 fjerde ledd | Sykepenger av både arbeidsinntekten og dagpengene |

### Tilleggskategorier

| Tilleggskategori | Hjemmel | Hva den endrer |
|---|---|---|
| Arbeidstaker på skip | § 8-44 | Kan få sykepenger selv om personen bare er arbeidsufør som arbeidstaker på skip. Ingen opptjeningstid etter § 8-2 |
| Fisker på blad B | § 8-45 | Ingen opptjeningstid etter § 8-2 |
| Yrkesskade | § 8-55 | Ingen opptjeningstid. Grunnlaget skal minst svare til grunnlaget på skadetidspunktet. Oppholdskravet i § 8-9 gjelder ikke. Egne regler for antall sykepengedager |

Forsikring etter §§ 8-36 og 8-39 er ingen tilleggskategori. Den er en del av avgjørelsen om dekning.

## Andre ytelser

Andre ytelser beskriver hvilke ytelser fra folketrygden personen har i hvilke perioder. Ytelsene kan innvilges midt i et sykefraværstilfelle, og derfor er dette en periodisert opplysning. Hver ytelse har sin egen hjemmel.

- Uføretrygd (§ 8-50) gir sykepenger bare av arbeidsinntekten personen har i tillegg til uføretrygden. Uføretrygd påvirker også når personen får ny rett etter § 8-12 tredje ledd.
- Ugradert AFP gir ingen sykepenger (§ 8-52 første ledd første punktum). Unntaket er AFP med statstilskudd, AFP fra Statens pensjonskasse og kommunal AFP for personer over 65 år i privat sektor. Disse gir sykepenger etter § 8-51.
- Gradert AFP (§ 8-52 andre ledd) gir sykepenger bare av arbeidsinntekten personen har i tillegg til den graderte pensjonen.
- Arbeidsavklaringspenger (§ 8-48 andre ledd): Personen skal bruke opp retten til sykepenger først. Hvis grunnlaget er under 2G, kan personen velge ytelse.

Dagpenger er ikke med her. Dagpengemottaker er en hovedkategori, fordi dagpengene bestemmer hele grunnlaget.

### Uavklart: Andre ytelser og sykepengegrunnlaget

Sykepengegrunnlaget fastsettes per sykefraværstilfelle. Etter § 8-50 og § 8-52 andre ledd skal grunnlaget likevel bare bygge på arbeidsinntekten ved siden av ytelsen. Vi har ikke avklart hva som skjer med grunnlaget når uføretrygd eller gradert AFP innvilges midt i et sykefraværstilfelle. Ett alternativ er at grunnlaget får perioder. Et annet er at grunnlaget står fast, mens ytelsen påvirker utbetalingen per dato.

## Institusjonsopphold

Institusjonsopphold beskriver perioder der personen er innlagt i helseinstitusjon eller sitter i fengsel. Begge deler står i kapittel VIII og kan starte og slutte midt i et sykefraværstilfelle.

Helseinstitusjon (§ 8-53):

- Reglene gjelder når personen får fri forpleining av det offentlige. De gjelder ikke når personen forsørger ektefelle eller barn som er medlemmer i trygden.
- Sykepengene reduseres ikke i innleggelsesmåneden og de tre neste månedene. Deretter reduseres de med 50 %, men ikke til under det et grunnlag på 0,5G gir.
- Nav kan bestemme mindre eller ingen reduksjon når personen har faste og nødvendige utgifter.
- Hvis personen legges inn på nytt innen tre måneder etter utskrivning, reduseres sykepengene fra og med innleggelsesdagen.

Fengsel (§ 8-54):

- Varetekt, soning og særreaksjon gir ingen rett til sykepenger. Det samme gjelder når formuen er satt under forvaltning.
- Personen har rett til sykepenger ved arbeid utenfor anstalten etter straffegjennomføringsloven § 20. Da reduseres sykepengene etter § 8-53, og personen får ingen arbeidsgiverperiode.
- Etter løslatelse bygger grunnlaget på forholdene ved innsettelsen, eller på forholdene under oppholdet hvis det gir et bedre resultat.

Institusjonsopphold leverer perioder til Løpende vilkår (ingen rett), Utbetalingsgrad (reduksjon) og Arbeidsgiverperiode/ventetid (ingen arbeidsgiverperiode).

## Sykepengegrunnlag

Sykepengegrunnlaget er inntektsgrunnlaget sykepengene beregnes ut fra. Det fastsettes per sykefraværstilfelle, ut fra rettighetskategorien og inntekten.

Grunnlaget består av én eller flere grunnlagsdeler. Hver del har en inntektstype og egen dekning. Etter § 8-41 tredje ledd gjelder reglene for selvstendig næringsdrivende bare for differansen mellom pensjonsgivende inntekt og den aktuelle månedsinntekten. Etter § 8-49 fjerde ledd får dagpengemottakere i deltidsarbeid én del for arbeidsinntekten og én for dagpengene.

Abstraksjonen omfatter:

- Aktuell månedsinntekt for arbeidstakere og frilansere, omregnet til årsinntekt (§§ 8-28 til 8-30 og § 8-38 femte ledd).
- Pensjonsgivende inntekt for selvstendig næringsdrivende og for kategorien Inaktiv. Inntekten G-reguleres, og bare en tredel av inntekten mellom 6G og 12G tas med (§ 8-35 andre ledd og § 8-47 sjette ledd).
- Grunnlag av dagpenger, ventelønn eller vartpenger, og grunnlaget fra før en permittering (§ 8-49 tredje ledd).
- Kombinerte inntekter (§§ 8-41 og 8-43).
- Særregler for vernepliktige. Grunnlaget bygger på inntekten før tjenesten og skal minst være 2G hvis tjenesten varte, eller skulle vare, mer enn 28 dager (§ 8-46 bokstav b).
- Grunnlaget ved yrkesskade skal minst svare til grunnlaget på skadetidspunktet (§ 8-55 bokstav b).
- Grunnlaget under og etter streik og lockout (§ 8-31 tredje ledd) og gå-sakte-aksjon (§ 8-32).
- Skjønnsfastsettelse når avviket er større enn 25 % (§ 8-30 andre ledd og § 8-35 tredje ledd). Det samme gjelder når rapporteringen til a-ordningen er mangelfull (§ 8-30 tredje ledd). Tidsbegrensede arbeidsforhold på under seks måneder er unntatt fra skjønn (§ 8-30 fjerde ledd).
- Taket på 6G (§ 8-10 andre ledd). I arbeidsgiverperioden gjelder taket per arbeidsgiver.
- Dagsats på 1/260 av årlig grunnlag (§ 8-10 tredje ledd).

## Inngangsvilkår

Inngangsvilkår er en fellesbetegnelse for vilkår personen må oppfylle for å ha rett til sykepenger i det hele tatt. Hvert vilkår er en egen abstraksjon med sine egne hjemler. Vilkårene lar seg ikke slå sammen til én abstraksjon. Noen regler gjelder både på skjæringstidspunktet og som løpende vilkår senere i sykefraværstilfellet.

Aldersgrensen viser forskjellen. Er personen 70 år eller eldre på skjæringstidspunktet, får personen avslag for hele sykefraværstilfellet (§ 8-3 første ledd). Fyller personen 70 år midt i sykefraværstilfellet, gjelder avslaget fra og med den dagen. Den delen hører til Sykepengedager/maksdato.

Vilkår som hører under fellesbetegnelsen:

- Opptjening (§ 8-2): Personen må ha vært i arbeid de fire siste ukene før arbeidsuførheten. Visse ytelser regnes som arbeid. Kravet faller bort for Arbeidstaker på skip (§ 8-44), Fisker på blad B (§ 8-45), Vernepliktig (§ 8-46) og ved Yrkesskade (§ 8-55 bokstav a).
- Tap av pensjonsgivende inntekt og aldersgrensen på 70 år på skjæringstidspunktet (§ 8-3 første ledd).
- Arbeidsuførhet som skyldes sykdom eller skade (§ 8-4).
- Minsteinntekt, beskrevet under.

Vernepliktige har rett uten hensyn til §§ 8-2 og 8-3 hvis arbeidsuførheten oppstår under tjenesten (§ 8-46 første ledd).

### Minsteinntekt

Minsteinntekt avgjør om sykepengegrunnlaget er høyt nok til at personen får sykepenger. Vilkåret er et inngangsvilkår og vurderes én gang per sykefraværstilfelle.

| Grense | Hjemmel | Gjelder |
|---|---|---|
| 0,5G | § 8-3 andre ledd | Hovedregelen |
| 1G | § 8-47 femte ledd | Inaktiv |

Grensen gjelder ikke for sykepenger i arbeidsgiverperioden (§ 8-3 andre ledd andre punktum). Vernepliktige er unntatt fra § 8-3 hvis arbeidsuførheten oppstår under tjenesten (§ 8-46 første ledd).

Kravet om inntekt over 2G for personer mellom 67 og 70 år (§ 8-51 andre ledd) er ikke et inngangsvilkår. Det er et løpende vilkår som gjelder fra og med 67-årsdagen, og står under Løpende vilkår.

## Arbeidsgiverperiode/ventetid

Abstraksjonen beskriver perioden i starten av et sykefravær der trygden normalt ikke dekker sykepenger. For arbeidstakere er perioden arbeidsgiverperioden. For selvstendig næringsdrivende og frilansere er den ventetiden. Vi modellerer begge med samme abstraksjon, fordi det ikke har betydning hvem som betaler så lenge det ikke er Nav.

Vi må gi beskjed om at en dag er i arbeidsgiverperioden eller ventetiden, også når Nav likevel dekker dagen. Det skjer for eksempel ved forsikring etter § 8-36. Om dagen gir utbetaling, avgjøres i Dekning.

Perioden kan gå på tvers av sykefraværstilfeller.

| Regel | Hjemmel |
|---|---|
| Arbeidsgiverperioden er opptil 16 kalenderdager og starter første hele fraværsdag. Nytt fravær innen 16 dager regnes inn i samme periode. Etter en full periode starter ingen ny ved sykdom innen 16 dager etter at arbeidet ble gjenopptatt | § 8-19 |
| Arbeidstakeren må ha vært ansatt i fire uker og må ha meldt fra til arbeidsgiveren | § 8-18 |
| Dager med sykepenger fra trygden under streik og lockout regnes ikke med | § 8-31 første og tredje ledd |
| Ingen arbeidsgiverperiode under arbeid utenfor fengselet | § 8-54 andre ledd |
| Ventetid på 16 kalenderdager for selvstendig næringsdrivende. Ingen ny ventetid ved ny arbeidsuførhet innen 16 dager etter at trygden har utbetalt | § 8-34 andre ledd |
| Samme ventetid for frilansere | § 8-38 andre ledd |
| Sykepenger fra dag 15 etter sykmeldingstidspunktet for Inaktiv | § 8-47 sjette ledd |
| Sykepenger fra dagen etter dimittering for Vernepliktig | § 8-46 bokstav a |

## Dekning

Dekning avgjør dekningsgraden (hvor mange prosent av grunnlaget som dekkes) og fra-dagen (fra hvilken dag dekningen gjelder). Dekning fastsettes per grunnlagsdel, ikke per person.

| Dekning | Hjemmel |
|---|---|
| Arbeidstaker: 100 % | § 8-16 |
| Selvstendig næringsdrivende: 80 % etter ventetiden | § 8-34 første ledd |
| Selvstendig næringsdrivende med forsikring: 80 % fra første dag, 100 % fra dag 17 eller 100 % fra første dag | § 8-36 første ledd bokstav a, b og c |
| Frilanser: 100 % etter ventetiden | § 8-38 første ledd |
| Frilanser med forsikring: 100 % fra første dag | § 8-39 |
| Differansedelen etter § 8-41 får dekningen til selvstendig næringsdrivende | § 8-41 tredje ledd |
| Inaktiv: 65 % (variant a) eller 100 % (variant b) | § 8-47 sjette ledd |

Trygden dekker også dager i arbeidsgiverperioden i disse situasjonene:

- Arbeidstakeren har rett til sykepenger, men arbeidsgiveren har ikke plikt til å betale (§ 8-17 første ledd bokstav b).
- Streik eller lockout, kontrollundersøkelse eller donasjon (§ 8-17 første ledd bokstav c, d og e).
- Nav har innvilget søknad om dekning av arbeidsgiverperioden på grunn av kronisk eller svangerskapsrelatert sykdom (§ 8-20).
- Arbeidsgiveren har forsikring mot ansvar for sykepenger i arbeidsgiverperioden. Forsikringen dekker fravær utover tre kalenderdager (§ 8-21).

Forsikringene har en opptjeningstid på fire uker fra Nav mottok søknaden (§ 8-36 andre ledd og § 8-39 andre ledd). Den faller bort ved yrkesskade (§ 8-55 bokstav a). Forsikringen opphører etter § 8-37.

## Løpende vilkår

Løpende vilkår er perioder i et sykefraværstilfelle der personen ikke har rett til sykepenger. Abstraksjonen gir bare stans, ikke delvis utbetaling. Delvis utbetaling hører til Utbetalingsgrad.

| Vilkår | Hjemmel |
|---|---|
| Oppholdskrav. Unntak gjelder for medlemmer etter §§ 2-5, 2-6 og 2-8, for opphold i helseinstitusjon for norsk offentlig regning og for godkjent opphold i inntil fire uker i løpet av tolv måneder | § 8-9 |
| Unntak fra oppholdskravet ved yrkesskade | § 8-55 bokstav d |
| Personen har trukket seg tilbake fra yrkeslivet | § 8-3 tredje ledd |
| Sykepengegrunnlaget er ikke over 2G, fra og med 67-årsdagen | § 8-51 andre ledd |
| Personen medvirker ikke | § 8-8 tredje ledd |
| Mangler legeerklæring etter åtte uker uten arbeidsrelatert aktivitet | § 8-7 sjuende og åttende ledd |
| Arbeidsforholdet er avbrutt i mer enn 14 dager | § 8-15 andre ledd |
| Lovbestemt ferie og permisjon | § 8-17 andre ledd |
| Arbeidsuførheten oppsto etter at streik eller lockout startet | § 8-31 andre ledd |
| Ingen sykepenger før personen søkte lege, for selvstendig næringsdrivende, frilansere og Inaktiv | § 8-34 fjerde ledd, § 8-38 fjerde ledd og § 8-47 sjuende ledd |
| Friskmelding til arbeidsformidling i mer enn 12 uker | § 8-5 |
| Varetekt, soning eller formue under forvaltning, fra Institusjonsopphold | § 8-54 første ledd |
| Ugradert AFP, fra Andre ytelser | § 8-52 første ledd |

## Utbetalingsgrad

Utbetalingsgrad avgjør hvor stor del av dagsatsen som utbetales en gitt dag. Den vurderes per dato.

- Gradert sykmelding: Personen kan delvis gjøre arbeidet sitt. Arbeidsevnen må være redusert med minst 20 % (§§ 8-6 og 8-13).
- Reduksjon på 50 % under opphold i helseinstitusjon, med en nedre grense på 0,5G (§ 8-53 tredje og fjerde ledd).
- Reduksjon under arbeid utenfor fengselet (§ 8-54 andre ledd, som viser til § 8-53).

## Sykepengedager/maksdato

Abstraksjonen avgjør fra hvilken dato personen ikke lenger har rett til sykepenger. Datoen kan følge av tidligere sykefravær og antall dager som allerede er utbetalt, eller av alder. Abstraksjonen går derfor på tvers av sykefraværstilfeller.

| Regel | Hjemmel |
|---|---|
| Sykepenger gis for hverdager, ikke for lørdager og søndager | § 8-11 |
| 248 dager for arbeidstakere, selvstendig næringsdrivende og frilansere og 250 dager for andre, regnet over de siste tre årene. Antallet er 260 hvis trygden dekker de første 16 kalenderdagene | § 8-12 første ledd |
| Ny rett etter 26 uker som helt arbeidsfør | § 8-12 andre ledd |
| Ny rett for mottakere av uføretrygd etter 26 uker som arbeidsfør med arbeidsinntekt | § 8-12 tredje ledd |
| 60 dager fra og med 67-årsdagen | § 8-12 fjerde ledd og § 8-51 tredje ledd |
| Ingen rett fra og med 70-årsdagen | § 8-3 første ledd |
| Antallet dager ved yrkesskade gjelder uten hensyn til § 8-12 | § 8-55 bokstav e |

Antallet dager (248, 250 eller 260) avhenger av hovedkategorien og av om trygden dekker de første 16 dagene.

## Reisetilskudd

Reisetilskudd gis i stedet for sykepenger når personen ikke kan reise til og fra jobb på vanlig måte, men ellers kan arbeide (§ 8-14).

- Tilskuddet dekker nødvendige ekstra transportutgifter.
- Det gis tidligst fra og med dag 17 etter at arbeidsuførheten oppsto.
- Beløpet kan ikke være høyere enn sykepengene personen ville fått for samme periode.

## Utenfor omfanget

- Feriepenger (§ 8-33) og ferietillegg til dagpengemottakere (§ 8-49 tredje ledd).
- Egenmelding og egenerklæring overfor arbeidsgiver (§§ 8-23 til 8-27). Egenmeldingsdager er likevel med når vi fastsetter skjæringstidspunktet.
- Oppfølging, dialogmøter og tilretteleggingstilskudd (§ 8-7 a).
- Tilbakekreving fra arbeidsgiver som ikke betaler (§ 8-22).
