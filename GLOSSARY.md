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

**Backfill**:
Når sp-rettighetskategori lager avgjørelser for rettighetskategori-ID-er som bare finnes i Spleis, med data fra spleis-api. Avgjørelser fra backfill har kilden `spleis`.
_Unngå_: Innfylling, migrering (migreringsloggen er bare loggen over backfill per person)

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