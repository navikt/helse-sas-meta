# Sykepenger

Fagspråket for saksbehandling av sykepenger etter folketrygdloven kapittel 8, slik det brukes på tvers av tjenestene i sas-meta.

## Språk

### Sykefravær

**Skjæringstidspunkt**:
Første dag i et sykefraværstilfelle.
_Unngå_: Første fraværsdag, sykmeldt fra og med

**Sykefraværstilfelle**:
Sammenhengende sykefravær med ett felles skjæringstidspunkt. Avgjørelser som gjelder hele tilfellet, tas én gang per skjæringstidspunkt. Ferie, permisjon og helg avbryter ikke sykefraværstilfellet, men én dag med arbeid, andre ytelser eller ukjent status gjør det.
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

### Dokumenter

**Meldingsreferanse-ID**:
Den interne dokument-ID-en Spedisjon gir et innkommende dokument, som en søknad eller en inntektsmelding, og som er `@id` på meldingen Spedisjon sender videre. Dokumentet hentes fra Spedisjon med denne ID-en. I behov og eventer heter feltet `<dokument>MeldingsreferanseId`, for eksempel `søknadMeldingsreferanseId` og `inntektsmeldingMeldingsreferanseId`. ID-en dokumentet fikk der det ble laget, som `søknadId` fra flex eller `inntektsmeldingId`, er en annen ID.
_Unngå_: Hendelse-ID

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

**Manuell vurdering av rettighetskategori**:
En vurdering saksbehandler gjør som overstyrer en eksisterende automatisk vurdering. Den gir en ny avgjørelse med ny ID og kilden `saksbehandler`. Saksbehandler må begrunne vurderingen.
_Unngå_: Endring av rettighetskategori, korrigering

**Backfill**:
Når en domenetjeneste fyller inn historikk den skal eie, men som i dag bare finnes i Spleis eller en annen tjeneste. Eksempler er avgjørelser for rettighetskategori-ID-er som bare finnes i Spleis, og hvilke rettighetskategori-ID-er en vurdering gjelder for. Avgjørelser fra backfill har kilden `spleis`.
_Unngå_: Innfylling, migrering (migreringsloggen er bare loggen over backfill per person)

### Sykepengegrunnlag

**Sykepengegrunnlag**:
Grunnlaget sykepengene beregnes fra i ett sykefraværstilfelle, sammen med inntektene det bygger på. Det er beregningsgrunnlaget begrenset til 6G. Hver endring gir et nytt sykepengegrunnlag, og det gamle beholdes.
_Unngå_: Inntektsgrunnlag, vilkårsgrunnlag (vilkårsgrunnlaget i Spleis har også andre vilkår)

**Beregningsgrunnlag**:
Sykepengegrunnlaget før det begrenses til 6G. For arbeidstakere er det summen av de omregnede årsinntektene. For selvstendig næringsdrivende er det gjennomsnittet av den pensjonsgivende inntekten etter § 8-35.
_Unngå_: Grunnlag alene, totalinntekt

**Omregnet årsinntekt**:
Inntekten fra ett arbeidsforhold regnet om til et årsbeløp. Begrepet brukes ikke for selvstendig næringsdrivende.
_Unngå_: Årsinntekt alene, fastsatt årsinntekt

**Opphav**:
Hvorfor et sykepengegrunnlag ble laget, for eksempel vilkårsprøving, skjønnsfastsettelse eller backfill. Det er ikke det samme som inntektskilden, som sier hvor inntekten til en arbeidsgiver kommer fra.
_Unngå_: Kilde, årsak

**Avvik**:
Hvor mye den omregnede årsinntekten skiller seg fra sammenligningsgrunnlaget i avviksvurderingen etter § 8-30.
_Unngå_: Avvik om andre forskjeller, for eksempel mellom to beregninger av det samme grunnlaget

**Forskjell i skyggedrift**:
Når en ny tjeneste fastsetter et annet sykepengegrunnlag enn Spleis for det samme skjæringstidspunktet, mens Spleis fortsatt bruker sitt eget grunnlag.
_Unngå_: Avvik (det er avviksvurderingen etter § 8-30), differanse

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

**Syk utenfor EØS**:
En sykedag der brukeren har oppgitt i søknaden at hen var utenfor EØS. Dagen teller som syk, og saksbehandler må vurdere oppholdskravet for den før perioden kan godkjennes. Dagtypen kommer bare fra søknaden. Saksbehandler kan endre den til en annen dagtype, men ikke velge den.
_Unngå_: Utlandsdag, ukjent dag (det Spleis brukte for utenlandsopphold før)

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

**Annullering**:
Et vedtak i ny løsning eller en gammel utbetaling som er trukket tilbake. Dagene i det regnes ikke lenger som utbetalt, og vedtaket teller ikke med i gjenstående sykedager.
_Unngå_: Tilbaketrekking, kansellering

**Siste vedtak**:
Vedtaket i ny løsning med den seneste siste dagen.
_Unngå_: Nyeste vedtak, gjeldende vedtak

**Gammel utbetaling**:
En utbetaling fra Spleis vedtatt før overgangen til ny løsning 16.03.2022. Den får ikke nye data, men brukes fortsatt ved oppslag og kan annulleres.
_Unngå_: Eldre Spleis-utbetaling, old vedtak

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
