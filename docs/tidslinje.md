# Tidslinje for team SAS (tidligere tbd / Team Bømlo), 2019–2026

Sist oppdatert: 2026-11-05.

Tidslinjen viser når større features, nye apper og avviklinger kom i sykepengeløsningen. Datoen er når featuren ble aktiv i prod. Det betyr at en toggle ble slått på eller fjernet. Når det ikke finnes et slikt signal, er datoen første commit med featuren.

**Kilder:** 64 repoer der CODEOWNERS er `@navikt/team-sas` eller `@navikt/tbd`, analysert fra lokal git-historikk (52 085 commits uten merges). I tillegg kommer 16 arkiverte repoer, analysert via GitHub-API-et.

## Aktivitet per år

| År | Commits (uten bots) | Typisk |
|---|---|---|
| 2019 | 2 232 | Spleis, Speil og Spenn bygges |
| 2020 | 4 916 | Spesialist, første automatisering, mange småapper |
| 2021 | 4 730 | Monorepoer, Aiven, flere arbeidsgivere, revurdering |
| 2022 | 6 026 | GCP-flytting, ny tilstandsflyt, totrinnsvurdering |
| 2023 | 7 178 | Arbeidsgiverforespørsel, skjønnsfastsettelse, ny oppgaveliste |
| 2024 | 9 085 | Spinnvill, Spekemat, Next.js, minimum sykdomsgrad |
| 2025 | 6 678 | Selvstendig næringsdrivende, tilkommen inntekt, Spillerom |
| 2026 | 6 147 | Domenetjenester rundt Spleis, REST, ny byggestandard, SAS-navnet |

## 2019: Grunnmuren

| Dato | Feature | Repo |
|---|---|---|
| 2019-03-14 | Speil opprettes som saksbehandlerflate | speil |
| 2019-03-20 | Spenn opprettes: utbetaling til Oppdrag via MQ | spenn |
| 2019-05-13 | Spenn i prod: vedtak blir utbetalingsoppdrag | spenn |
| 2019-06-26 | Spleis opprettes | spleis |
| 2019-07-10 | Simulering mot Oppdrag i prod | spenn |
| 2019-10 | Tilstandsmaskin for vedtaksperioden og første søknadshåndtering | spleis |
| 2019-10-15 | Saksoversikt med tildeling i Speil | speil |
| 2019-11-06 | Spleis leser søknader og inntektsmeldinger i prod | spleis |
| 2019-11 | Maksdato, utbetalingslinjer og godkjenning med simulering | spleis, speil |
| 2019-11 | Spock (påminnelser), behovsakkumulator og vedtaksfeed til Infotrygd | flere |
| 2019-12-17 | Annullering av utbetaling | speil, spenn |

## 2020: Saksbehandling og første automatisering

| Dato | Feature | Repo |
|---|---|---|
| 2020-01 | Vilkårsgrunnlag og 6G-begrensning | spleis |
| 2020-02 | Rapids & Rivers innføres | spleis m.fl. |
| 2020-03-04 | Spesialist opprettes som backend for saksbehandling | spesialist |
| 2020-03-05 | Gradert sykmelding gir redusert utbetaling | spleis |
| 2020-03-06 | Spedisjon: mottak av søknader og inntektsmeldinger | spedisjon |
| 2020-03 | Spokelse, spammer, speider og spetakkel opprettes | flere |
| 2020-04-20 | Speil bytter backend fra Spade til Spesialist | speil |
| 2020-05-13 | Sprinter: vedtaks-PDF til arkiv | sprinter |
| 2020-06 | Forlengelse av saker fra Infotrygd | spleis |
| 2020-06-11 | Sporbar: vedtak ut til eksterne konsumenter. Flex (spinnsyn) kobles på i august | sporbar |
| 2020-09-22 | Overstyring av dager i prod | spleis, speil, spesialist |
| 2020-10-14 | **Første automatiske godkjenning** (Infotrygd-forlengelser med risikovurdering) | spesialist |
| 2020-10-21 | Egen ansatt holdes utenfor automatisk behandling | spesialist |
| 2020-11 | Utbetaling som egen entitet, etterbetaling og første G-regulering | spleis |
| 2020-11-17 | Speil v2: nytt design av saksbildet | speil |

## 2021: Flere arbeidsgivere og revurdering

| Dato | Feature | Repo |
|---|---|---|
| 2021-01-22 | Korrigerende søknad før utbetaling | spleis |
| 2021-01 | Stikkprøver av automatiserbare saker. Faresignaler fra risikovurdering i Speil | spesialist, speil |
| 2021-02 | Opptegnelser: Speil oppdateres når Spleis har behandlet | spesialist, speil |
| 2021-02-15 | Flere arbeidsgivere i prod for utvalgte saksbehandlere | spleis, speil |
| 2021-02-24 | Sparkelapper og spre samles i monorepoer | sparkelapper, spre |
| 2021-03-02 | Kafka flyttes fra on-prem til Aiven | alle |
| 2021-03-03 | Legg på vent med egen fane | speil, spesialist |
| 2021-05 | Første feriepengekjøring til Oppdrag | sparker-feriepenger, spleis, spenn |
| 2021-06-02 | Førstegangsbehandling med flere arbeidsgivere | spleis |
| 2021-06-15 | Revurdering av utbetalte perioder. Saksbehandlingsstatistikk til DVH | spleis, spre |
| 2021-07-29 | Ghost-arbeidsforhold og flere arbeidsgivere med ulik fom | spleis |
| 2021-08 | Notater på oppgaver. Spanner (Spleis-JSON for utviklere) i prod | spesialist, spanner |
| 2021-10-20 | Overstyring av inntekt | spleis, speil, spesialist |
| 2021-11-16 | Utbetaling direkte til bruker (personoppdrag) | spenn, sporbar |
| 2021-12-01 | Personopplysninger fra PDL i stedet for TPS. Egen oppgavetype for fortrolig adresse | sparkelapper, spesialist |

## 2022: GCP, GraphQL og ny flyt

| Dato | Feature | Repo |
|---|---|---|
| 2022-02 | Brukerutbetaling og delvis refusjon | spleis |
| 2022-02-08 | GraphQL-API mellom Speil og Spesialist | spesialist, speil |
| 2022-02-15 | Subsumsjoner (lovsporing) publiseres | spre-subsumsjon |
| 2022-03 | Spleis og Spesialist flyttes fra on-prem til GCP | spleis, spesialist |
| 2022-03-08 | Overstyring av arbeidsforhold (deaktivere ghost) | speil, spesialist |
| 2022-04-25 | **Ny tilstandsflyt:** vedtaksperioden opprettes ved søknad, og AUU-perioder avsluttes uten utbetaling | spleis |
| 2022-06-13 | Generelle notater i saksbildet | speil |
| 2022-06-30 | **Totrinnsvurdering med beslutterrolle** | speil, spesialist |
| 2022-06 | Red team-app, Spydig (validering av subsumsjoner) | redteam, spydig |
| 2022-08 | Sparsom (aktivitetslogg) og Speaker (varselkatalog) | sparsom, speaker |
| 2022-08-26 | AAP og esyfovarsel blir konsumenter av `tbd.utbetaling` | sporbar |
| 2022-09-08 | Alle saksbehandlere får tilgang til flere arbeidsgivere, revurdering og annullering | speil |
| 2022-09-14 | Ny medlemskapsintegrasjon | sparkelapper |
| 2022-10-18 | Out-of-order-søknader med revurdering | spleis |
| 2022-11 | Resten av appene flyttes fra FSS til GCP | flere |
| 2022-11-18 | Revurdering av inntekt med flere arbeidsgivere | spleis |
| 2022-12-01 | Generasjoner (behandlinger) i Spesialist | spesialist |

## 2023: Arbeidsgiver, varsler og skjønn

| Dato | Feature | Repo |
|---|---|---|
| 2023-01-09 | **Avhukbare varsler:** saksbehandler må vurdere varslene | speil, spesialist |
| 2023-02-20 | Overstyring av refusjon og utbetaling til bruker | speil |
| 2023-03 | Spout, Spoiler og Sprute opprettes. Stønadsstatistikk avvikles | flere |
| 2023-04-17 | **Forespørsel om arbeidsgiveropplysninger** (ny inntektsmeldingsflyt med HAG) | spleis, sparkelapper |
| 2023-05-05 | Endring av arbeidsgiverperioden fra Speil | speil |
| 2023-06-07 | Egenmeldingsdager fra søknaden | spleis |
| 2023-06-13 | Spre-styringsinfo | spre |
| 2023-07-05 | Automatisering av utbetaling til sykmeldt | spesialist |
| 2023-08 | Nytt vedtaksformat med begrunnelser. Sigrun-integrasjon | sporbar, sparkelapper |
| 2023-08-21 | Utkast til vedtak og `avsluttet_med_vedtak` | spleis |
| 2023-11-08 | **Ny oppgaveoversikt** med egenskaper og filtre | speil, spesialist |
| 2023-12-15 | Spapi: API for Fellesordningen for AFP via Maskinporten | spapi |
| 2023-12-18 | Søknader fra arbeidsledige tas inn | spedisjon |
| 2023-12-22 | Visning av inntektsmelding og søknad i Speil | speil, sparkelapper |

## 2024: Utskilling og ny frontend-plattform

| Dato | Feature | Repo |
|---|---|---|
| 2024-01-02 | **Spinnvill tar over avviksvurderingen** fra Spleis | spinnvill |
| 2024-01-05 | **Skjønnsfastsettelse av sykepengegrunnlaget** | speil, spesialist, spleis |
| 2024-01 | tbd-libs (felles biblioteker) og Spalten (Sanity for driftsmeldinger og nyheter) | tbd-libs, spalten |
| 2024-02-14 | Spekemat bygger behandlingstreet («pølsene») til Speil | spekemat |
| 2024-02 | Spill-av-im spiller av inntektsmeldinger | spill-av-im |
| 2024-03-08 | Spotlight finner kommandokjeder som sitter fast | spotlight |
| 2024-04 | Stoppknapp: veileder kan stanse automatisk behandling. Nytt topic `tbd.sis` | sparkelapper, spesialist, sporbar |
| 2024-05 | Avslag i vedtak. Individuell begrunnelse fra juni | spesialist, speil |
| 2024-06-05 | **Speil migreres til Next.js** | speil |
| 2024-06 | Fullmakt og vergemål fra PDL. dbt-prosjekt for datavarehuset | sparkelapper, sp-dbt |
| 2024-07-31 | Spregulering: automatisk G-regulering | spregulering |
| 2024-09-24 | Vurdering av minimum sykdomsgrad | speil, spleis, spesialist |
| 2024-10-01 | Offentlig AFP (Statens pensjonskasse) på Spapi | spapi |
| 2024-11-05 | Speed: mellomlagring av PDL-oppslag | speed |
| 2024-11-13 | Subsumsjoner på eget topic. Sparkiv-subsumsjon arkiverer dem | spleis, sparkiv-subsumsjon |
| 2024-12-18 | Refusjonstidslinje på behandlingen | spleis |

## 2025: Nye grupper og Spillerom

| Dato | Feature | Repo |
|---|---|---|
| 2025-01-13 | Inntektsmeldinger fra nav.no (HAG) | spedisjon |
| 2025-02-13 | Inntekt fra A-ordningen når inntektsmeldingen ikke kommer | spleis |
| 2025-02 | Taktisk DDD i Spesialist | spesialist |
| 2025-03-17 | Revurdering når Infotrygd-historikken endres | spleis |
| 2025-04-07 | **Spillerom og Bakrommet starter:** nytt saksbehandlingskonsept, aldri i prod | helse-spillerom, helse-bakrommet |
| 2025-04-24 | Saksbehandler kan stanse automatisk behandling | speil, spesialist |
| 2025-09-16 | **Selvstendig næringsdrivende behandles i Spleis** (beta i Speil) | spleis, spedisjon, speil, spesialist |
| 2025-09-17 | Ny annulleringsløype | spleis, speil |
| 2025-10 | Overgangen fra GraphQL til REST starter | spesialist, speil |
| 2025-10-20 | Spesidaler: inntektsendringer underveis i sykefraværet | spesidaler |
| 2025-10-22 | **Tilkommen inntekt** for alle saksbehandlere | speil, spesialist, spleis |
| 2025-11-21 | Automatisering av forlengelser for selvstendig næringsdrivende | spesialist |

## 2026: Domenetjenester og Team SAS

| Dato | Feature | Repo |
|---|---|---|
| 2026-01 | AAP og dagpenger som behovsløsere. Flyttes til spleisesparkel i februar | sparkelapper, spleisesparkel |
| 2026-02 | Mørk modus, lesemodus- og saksbehandlerroller, ny tidslinje, SSE i stedet for polling | speil, spesialist |
| 2026-02-05 | Sparkel-arena avvikles | sparkelapper |
| 2026-03-12 | Oppgavelister («Liste til NKS» først) | speil |
| 2026-04 | **Spillerom legges ned:** «spillerom-konseptet skal bakes inn i eksisterende løype» | helse-bakrommet m.fl. |
| 2026-04-08 | **Team Bømlo blir Team SAS** i dokumentasjon og Slack | nesten alle |
| 2026-06-15 | **sp-forsikring:** forsikringsvurdering (§ 8-36/8-39) i prod, erstatter sparkel-forsikring fra oktober 2025 | sp-forsikring, spleis |
| 2026-09-07 | Forsikring for selvstendige slås på i prod | spleis, sp-forsikring |
| 2026-06-16 | Sporhund: dialogmeldinger med behandler i Speil | sporhund, speil |
| 2026-06-18 | Spredning: PDF-brev til bruker, først om for mye utbetalte feriepenger | spredning |
| 2026-07-01 | Alle saksbehandlere kan behandle selvstendig næringsdrivende | spesialist |
| 2026-07-02 | Tilgangsmaskinen for populasjonstilgangskontroll | spesialist, tbd-libs |
| 2026-07–10 | **Ny byggestandard:** sykepenger-gradle-plugins, deploy-v2 med `nais apply`, sykepenger-libs | gradle-plugins, github-workflows, libs |
| 2026-10-01 | **sp-vilkarsproving:** opptjening vurderes utenfor Spleis | sp-vilkarsproving, spleis, speil |
| 2026-10-02 | CODEOWNERS byttes fra `@navikt/tbd` til `@navikt/team-sas` | flere |
| 2026-10-21 | GraphQL fjernes. API-et mellom Speil og Spesialist er rent REST | spesialist, speil |
| 2026-11-02 | **sp-rettighetskategori** i bruk fra Spleis | sp-rettighetskategori, spleis |
| 2026-11-02 | sp-andre-ytelser (graderte andre ytelser) opprettes | sp-andre-ytelser |
| 2026-11-03 | sp-avslagsdager opprettes, først for oppholdskravet i § 8-9 | sp-avslagsdager |
| 2026-11-04 | **sp-medlemskap** i prod | sp-medlemskap, spleis |

## Forbehold

- Sparkelapper og spre ble opprettet i februar 2021 som kopier av eldre enkeltrepoer uten historikk. Behovsløsere som fantes før det, har derfor ikke egen lanseringsdato her.
- GitHub viser ikke når et repo ble arkivert. Avviklingsdatoer for arkiverte repoer er satt ut fra siste commit med innhold.
- Kodesøket finner ikke CODEOWNERS i arkiverte repoer. Spillerom-sporet mangler CODEOWNERS og er tatt med fordi README-ene peker til teamets Slack-kanal.
- Datoer merket med måned (YYYY-MM) har middels sikkerhet. Featuren ble enten åpnet gradvis, eller så viser loggen ikke én tydelig dato.
- Nais-namespacet `tbd` og Kafka-topicene `tbd.*` har ikke fått nytt navn.
