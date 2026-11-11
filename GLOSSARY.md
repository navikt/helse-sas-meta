# Sykepenger

Fagspråket for saksbehandling av sykepenger etter folketrygdloven kapittel 8, slik det brukes på tvers av tjenestene i sas-meta.

## Språk

### Sykefravær

**Sykefraværstilfelle**:
Sammenhengende sykefravær med ett felles skjæringstidspunkt. Avgjørelser som gjelder hele tilfellet, tas én gang per skjæringstidspunkt.
_Unngå_: Sykefraværsperiode, sak

**Yrkesaktivitet**:
Det personen er sykmeldt fra: et arbeidsforhold som arbeidstaker, eller virksomhet som selvstendig næringsdrivende, frilanser eller arbeidsledig.
_Unngå_: Inntektskilde, arbeidssituasjon

### Søknader

**Ny søknad**:
En søknad som er opprettet fra sykmeldingen, men ikke sendt inn. Den forteller at en sendt søknad er ventet for perioden.
_Unngå_: Åpen søknad, sykmeldingsperiode

**Sendt søknad**:
En søknad personen har sendt inn, med svarene på spørsmålene i søknaden.
_Unngå_: Innsendt søknad, ferdig søknad

### Rettighetskategori

**Rettighetskategori**:
Egenskapene ved personen som avgjør hvilke regler i kapittel 8 som gjelder. Den består av én hovedkategori og null eller flere tilleggskategorier, og avgjøres per sykefraværstilfelle.
_Unngå_: Yrkesaktivitetstype, kategori

**Hovedkategori**:
Den delen av rettighetskategorien som velger hovedregelsettet, for eksempel Arbeidstaker, Selvstendig næringsdrivende eller Arbeidstaker og selvstendig næringsdrivende. «Ingen» når personen ikke passer i noen.
_Unngå_: Kombinert (bruk den presise kombinasjonen)

**Tilleggskategori**:
En egenskap ved personen som gir egne regler i tillegg til hovedkategorien, uten å endre den. En rettighetskategori kan ha null eller flere tilleggskategorier. Jordbruker er den første.
_Unngå_: Spesiell yrkesgruppe, undertype

**Jordbruker**:
Tilleggskategorien for en person som driver jordbruk som selvstendig næringsdrivende. Den gjelder sammen med hovedkategorien Selvstendig næringsdrivende eller Arbeidstaker og selvstendig næringsdrivende. Den avgjøres automatisk når personen har sendt minst én søknad med arbeidssituasjonen jordbruker i sykefraværstilfellet, og saksbehandler kan vurdere den manuelt. Reindrift og fiske er ikke jordbruker.
_Unngå_: Jordbruker som yrkesaktivitetstype eller hovedkategori

**Arbeidstaker på skip**:
Tilleggskategorien for en person som er ansatt på et norsk skip i utenriksfart, og som er sykmeldt fra det arbeidsforholdet på skjæringstidspunktet (§ 8-44). Den gjelder sammen med hovedkategorien Arbeidstaker eller Arbeidstaker og selvstendig næringsdrivende. Personen har rett til sykepenger uten opptjeningstid. Den avgjøres automatisk ut fra arbeidsforholdene i Aa-registeret, og saksbehandler kan legge den til eller fjerne den.
_Unngå_: Sjømann, maritimt arbeidsforhold (det er Aa-registerets navn på arbeidsforholdet, ikke på kategorien)

**Manuell vurdering av rettighetskategori**:
En vurdering saksbehandler gjør som overstyrer en eksisterende automatisk vurdering. Den gir en ny avgjørelse med ny ID og kilden `saksbehandler`. Saksbehandler må begrunne vurderingen.
_Unngå_: Endring av rettighetskategori, korrigering

**Backfill**:
Når en domenetjeneste fyller inn historikk den skal eie, men som i dag bare finnes i Spleis eller en annen tjeneste. Eksempler er avgjørelser for rettighetskategori-ID-er som bare finnes i Spleis, og hvilke rettighetskategori-ID-er en vurdering gjelder for. Avgjørelser fra backfill har kilden `spleis`.
_Unngå_: Innfylling, migrering (migreringsloggen er bare loggen over backfill per person)

### Inntekt og sykepengegrunnlag

**Inntektsavklaring**:
Alle inntektene som er relevante for ett skjæringstidspunkt, samlet på ett sted: inntektsmeldinger, inntekt fra a-ordningen og pensjonsgivende inntekt, med saksbehandlerens aktivering og deaktivering av inntekter og arbeidsforhold og korrigerte inntekter. Inntektsavklaringen inneholder ingen beregninger.
_Unngå_: Inntektsgrunnlag, inntektsopplysninger

**Sykepengegrunnlag**:
Inntektsgrunnlaget sykepengene beregnes ut fra, fastsatt per sykefraværstilfelle ut fra rettighetskategorien og inntektsavklaringen. Det er fordelt på yrkesaktivitetene og begrenset til 6G.
_Unngå_: Inntektsgrunnlag (Spleis' gamle navn på det samme), grunnlag alene

**Beregningsgrunnlag**:
Årsinntekten før 6G-begrensningen: summen av fastsatt årsinntekt for yrkesaktivitetene, eller den G-justerte pensjonsgivende inntekten for selvstendig næringsdrivende.
_Unngå_: Omregnet årsinntekt (det er inntekten før korrigering og skjønn)

**Sammenligningsgrunnlag**:
Inntekten rapportert til a-ordningen de tolv siste kalendermånedene før skjæringstidspunktet. Det er inntekten avviksvurderingen sammenligner med (§ 8-30 andre ledd).
_Unngå_: Innrapportert årsinntekt

**Avviksvurdering**:
Sammenligningen av beregningsgrunnlaget med sammenligningsgrunnlaget. Et avvik på mer enn 25 % gjør at sykepengegrunnlaget må skjønnsfastsettes.
_Unngå_: Avviksberegning

**Korrigert inntekt**:
En månedsinntekt som saksbehandler har lagt inn for én yrkesaktivitet fordi inntekten fra inntektsmeldingen eller a-ordningen ikke er riktig (§ 8-28 tredje ledd). Den er en del av inntektsavklaringen, ikke en fastsettelse av sykepengegrunnlaget.
_Unngå_: Overstyrt inntekt, saksbehandlerinntekt

**Skjønnsfastsettelse**:
Saksbehandlerens fastsettelse av sykepengegrunnlaget ved skjønn når avviksvurderingen viser mer enn 25 % avvik. Den gjelder alle yrkesaktivitetene eller ingen.
_Unngå_: Skjønnsmessig fastsettelse, skjønnsfastsetting

**Grunnbeløpsregulering**:
Ny fastsettelse av et sykepengegrunnlag når grunnbeløpet som gjaldt på skjæringstidspunktet, er endret etter at grunnlaget ble fastsatt.
_Unngå_: G-regulering (greit i tale), regulering

### Avslagsdager

**Løpende vilkår**:
Et vilkår som vurderes for hver dag, ikke én gang per skjæringstidspunkt. Oppholdskravet i § 8-9 er det første.
_Unngå_: Dagvilkår, inngangsvilkår (inngangsvilkår vurderes per skjæringstidspunkt)

**Avslagsdag**:
En dag der saksbehandler har vurdert et løpende vilkår som ikke oppfylt. Avslagsdagen gjelder personen, ikke én yrkesaktivitet, og har en lovreferanse og en begrunnelse. Dager som Spleis avviser etter egne regler, for eksempel etter maksdato, er ikke avslagsdager.
_Unngå_: Avslått dag. «Avvist dag» er Spleis' ord for alle dager som ikke gir utbetaling, også avslagsdager

**Vurdering av løpende vilkår**:
Saksbehandlerens vurdering av ett løpende vilkår for en mengde dager, med svar, utfall per vilkårskode, fritekstbegrunnelse og journalposter. Den gjeldende vurderingen for en dag er den nyeste som omfatter dagen. En omgjøring er en ny vurdering, og ingen vurdering slettes.
_Unngå_: Overstyring (brukes om endringer i Spleis' tidslinje), avslag

### Andre ytelser

**Sykdomsgrad**:
Hvor mye av dagen personen er sykmeldt fra én yrkesaktivitet, slik sykmeldingen og søknaden sier.
_Unngå_: Utbetalingsgrad, grad

**Justert sykdomsgrad**:
Sykdomsgraden etter justering for andre forhold, blant annet graderte andre ytelser. Det er denne graden som gir sykepenger for dagen.
_Unngå_: Ny sykdomsgrad, utbetalingsgrad

**Annen ytelse**:
En dag der en annen ytelse fra Nav dekker hele inntektstapet. Dagen regnes som arbeid, gir avslag på sykepenger og avslutter sykefraværstilfellet.
_Unngå_: 100 % gradert annen ytelse

**Gradert annen ytelse**:
En annen ytelse fra Nav, for eksempel foreldrepenger eller omsorgspenger, som dekker en del av dagen for én yrkesaktivitet. Personen kan ha flere graderte andre ytelser samme dag.
_Unngå_: Delvis annen ytelse, gradert ytelse

**Fordeling av dagen**:
Saksbehandlerens oppdeling av en dag for én yrkesaktivitet i sykdom, arbeid og graderte andre ytelser, til sammen 100 %. Saksbehandler velger om ytelsene tas fra sykdommen eller fra arbeidet. Det finnes høyst én gjeldende fordeling per dag og yrkesaktivitet.
_Unngå_: Registrering, gradering

**Trekk fra sykdomsgrad**:
Den delen av de graderte andre ytelsene en dag som saksbehandler har tatt fra sykdommen, ikke fra arbeidet. Trekket gjør sykdomsgraden om til justert sykdomsgrad.
_Unngå_: Sum andre ytelser, andre ytelser-grad

### Saksbehandling

**Aktiv oppgave**:
Oppgaven som venter på at en saksbehandler skal vurdere en vedtaksperiode. En person har høyst én aktiv oppgave.
_Unngå_: Sak, periodeoppgave

**Tildeling**:
At en bestemt saksbehandler har ansvaret for personen. Tildelingen gjelder personen, ikke én bestemt oppgave.
_Unngå_: Reservasjon, tildelt oppgave

**Totrinnsvurdering**:
Kontrollen der en beslutter må godkjenne saksbehandlerens vurdering før vedtaket fattes. En person har høyst én aktiv totrinnsvurdering. Den har bare betydning når personen har en aktiv oppgave, men blir liggende til neste oppgave.
_Unngå_: Totrinnskontroll, beslutterkontroll

**Subsumsjon**:
Anvendelsen av én lovregel på fakta i en sak, med lovreferanse, fakta og utfall. Det er en subsumsjon også når den ikke endrer sykepengene, for eksempel når en gradert annen ytelse bare tas fra arbeidet.
_Unngå_: Etterlevelse, hjemmel (hjemmelen er bare lovreferansen)

### Dialogmeldinger

**Dialogmelding**:
En melding om en person, sendt mellom Nav og en behandler.

**Forespørsel**:
En dialogmelding som en saksbehandler sender til en behandler. En dialog kan ha flere forespørsler.

**Purring**:
En dialogmelding som Nav sender automatisk til en behandler når en forespørsel ikke er besvart innen fristen.
_Unngå_: Påminnelse

**Svar**:
En dialogmelding fra en behandler som svarer på en forespørsel. Et svar er tatt inn når det er knyttet til en dialog og saksbehandler kan se det.
_Unngå_: Svarmelding, melding fra behandler

**Behandler**:
Helsepersonellet som Nav sender dialogmeldinger til og mottar dialogmeldinger fra.
_Unngå_: Lege, fastlege

### Sykepengedager

**Gjenstående sykedager**:
Antall sykepengedager personen har igjen før maksdato.
_Unngå_: Resterende sykepengedager, restdager

**Grunnlag for gjenstående sykedager**:
Hva tallet for gjenstående sykedager bygger på: siste vedtak i ny løsning, siste utbetaling i Infotrygd eller maksdato i Infotrygd. Grunnlaget sier også fra når det ikke finnes noe tall, fordi Infotrygd mangler maksdato eller personen ikke har hatt sykepenger de siste 26 ukene.
_Unngå_: Kilde, grunnlag alene (det er sykepengegrunnlaget)

**Maksdato**:
Siste dag personen kan få sykepenger hvis sykdommen fortsetter uten opphold.
_Unngå_: Sluttdato

**Opphold**:
Dager uten sykepenger. Ikke det samme som opphold i Norge, som oppholdskravet i § 8-9 gjelder.
_Unngå_: Pause, gap

**Ny rett**:
Personen har hatt minst 26 uker opphold, og tellingen av sykepengedager starter på nytt ved ny sykdom.
_Unngå_: Nullstilling, ny maksdato

**Vurdert til og med**:
Dagen tallet for gjenstående sykedager gjelder for. Dager etter denne dagen er ikke regnet med.
_Unngå_: Beregningsdato, per dato

**Vedtak uten utbetaling**:
Et vedtak der ingen dager utbetales, for eksempel fordi alle dagene er etter maksdato.
_Unngå_: Nullutbetaling

**Siste vedtak**:
Vedtaket i ny løsning med den seneste siste dagen.
_Unngå_: Nyeste vedtak, gjeldende vedtak

### Infotrygd

**Infotrygdperiode**:
En periode i sykepengehistorikken i Infotrygd, enten en utbetaling eller ferie.
_Unngå_: Infotrygd-historikk (det er alle periodene samlet), Infotrygd-vedtak

**Utbetaling i Infotrygd**:
En infotrygdperiode der sykepenger er utbetalt. Ferie og andre typer er ikke utbetalinger.
_Unngå_: Infotrygdperiode (når bare utbetalinger er ment), utbetalingsperiode

**Siste utbetaling i Infotrygd**:
Utbetalingen i Infotrygd med den seneste siste dagen.
_Unngå_: Siste infotrygdperiode
