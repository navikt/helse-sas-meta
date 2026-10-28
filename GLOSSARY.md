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

### Sykepengegrunnlag

**Fastsatt årsinntekt**:
Årsinntekten som gjelder for én yrkesaktivitet på skjæringstidspunktet, etter eventuell overstyring eller skjønnsfastsettelse.
_Unngå_: Inntekt, omregnet årsinntekt (det er bare utgangspunktet før skjønn)

**Beregningsgrunnlag**:
Summen av de fastsatte årsinntektene for et sykefraværstilfelle, før begrensningen til 6G.
_Unngå_: Inntektsgrunnlag, totalinntekt

**Sykepengegrunnlag**:
Beregningsgrunnlaget begrenset til 6G. Det avgjøres per skjæringstidspunkt, sammen med de fastsatte årsinntektene, og hver avgjørelse har sin egen ID.
_Unngå_: Grunnlag, inntektsgrunnlag, forslag (alle avgjørelser er avgjørelser, også de som skal skjønnsfastsettes)

**Ghost**:
Et arbeidsforhold på skjæringstidspunktet med inntekt i a-ordningen, men uten sykefravær. Inntekten er med i beregningsgrunnlaget.
_Unngå_: Spøkelse, arbeidsgiver uten søknad

**Sammenligningsgrunnlag**:
Rapportert inntekt til a-ordningen de tolv kalendermånedene før måneden med skjæringstidspunktet. Brukes bare i avviksvurderingen.

**Avviksvurdering**:
Sammenligningen av beregningsgrunnlaget med sammenligningsgrunnlaget for arbeidstaker (§ 8-30 andre ledd). Den hører til den første avgjørelsen av sykepengegrunnlaget, og avvik over 25 prosent krever skjønnsfastsettelse.
_Unngå_: Avviksberegning

**Skjønnsfastsettelse**:
Når saksbehandler fastsetter årsinntekten ved skjønn, for eksempel ved avvik over 25 prosent. Gir en ny avgjørelse av sykepengegrunnlaget med ny ID, som viser til avgjørelsen den bygger på.
_Unngå_: Skjønnsvurdering, skjønnsmessig fastsettelse

**Pensjonsgivende inntekt**:
Inntekten Skatteetaten har fastsatt per inntektsår, summert over lønn, næring og skatteordninger. Grunnlaget for selvstendig næringsdrivende (§ 8-35).

**Ferdiglignet år**:
Et inntektsår der Skatteetaten har fastsatt den pensjonsgivende inntekten. Et ferdiglignet år uten inntekt teller som 0 kroner.
_Unngå_: Fastsatt år, lignet år

### Overgang til nye tjenester

**Backfill**:
Når en ny tjeneste, for eksempel sp-rettighetskategori eller sp-sykepengegrunnlag, lager avgjørelser for ID-er som bare finnes i Spleis, med data fra spleis-api. Avgjørelser fra backfill har kilden `spleis`.
_Unngå_: Innfylling, migrering (migreringsloggen er bare loggen over backfill per person)
