# Avklare inntekt i sp-inntekt

[Tickets](../tickets/avklare-inntekt/) · [ADR 0008](../adr/0008-inntekt-og-sykepengegrunnlag-er-to-domenetjenester.md) · [ADR 0010](../adr/0010-pensjonsgivende-inntekt-hentes-fra-sigrun.md) · [Spec: fastsette sykepengegrunnlag](fastsette-sykepengegrunnlag.md)

## Problem

Spleis henter og samler inntektene for et skjæringstidspunkt selv, og blander dem med beregningen av sykepengegrunnlaget i ett objekt (`Inntektsgrunnlag`). Inntekt fra a-ordningen hentes i `AvventerVilkårsprøving`. Inntekten fra inntektsmeldingen ligger på behandlingen. Pensjonsgivende inntekt kommer fra søknaden, som sykepengesoknad-backend har fylt med tall fra Sigrun. Sammenligningsgrunnlaget hentes av Spinnvill, først når Spesialist får godkjenningsbehovet. Saksbehandlers korrigerte inntekter og deaktiverte arbeidsforhold lagres inne i sykepengegrunnlaget i Spleis, og begrunnelsene ligger i Spesialist.

Ingen tjeneste eier altså inntektene. Sykepengegrunnlaget kan ikke trekkes ut av Spleis før inntektene har en egen eier. Sp-rettighetskategori, opptjening og Inaktiv vil senere trenge de samme inntektene.

## Løsning

En ny tjeneste, sp-inntekt, lager en inntektsavklaring per skjæringstidspunkt. Inntektsavklaringen samler alle relevante inntekter: inntektsmeldinger, inntekt fra a-ordningen for beregningsperioden og for sammenligningsgrunnlaget, arbeidsforhold fra Aa-registeret og pensjonsgivende inntekt fra Sigrun. Den inneholder også saksbehandlers korrigerte inntekter og aktiverte og deaktiverte arbeidsforhold. Inntektsavklaringen inneholder ingen beregninger.

Spleis får en ny tilstand, `AvventerInntektsavklaring`, før `AvventerRettighetskategori`. Der spør Spleis sp-inntekt og får tilbake en inntektsavklarings-ID. Spleis bestemmer fortsatt hvilken inntekt som skal brukes for hver arbeidsgiver: inntektsmeldingen eller a-ordningen. Spleis sender valget i behovet. Spleis lagrer bare ID-en og sender den videre til sp-rettighetskategori og sp-sykepengegrunnlag.

Saksbehandler korrigerer inntekter og aktiverer og deaktiverer arbeidsforhold i sp-inntekt. En endring gir en ny inntektsavklaring og hendelsen `endret_inntektsavklaring`. Spleis revurderer da gjennom `AvventerInntektsavklaring`, `AvventerRettighetskategori` og `AvventerSykepengegrunnlag`.

Alle vilkårsgrunnlag får en inntektsavklarings-ID, også de som finnes fra før. sp-inntekt lager inntektsavklaringene bak de gamle ID-ene med backfill fra spleis-api, Spesialist og Spinnvill.

### Faser

Fasene er felles for sp-inntekt og sp-sykepengegrunnlag. Hver fase rulles ut i dev før prod.

1. **sp-inntekt svarer, og Spleis går gjennom `AvventerInntektsavklaring`.** Spleis lagrer ID-en fra sp-inntekt bare for å sende den videre. De fulle vilkårsgrunnlagene får en deterministisk inntektsavklarings-ID, og Spleis beregner som før. Toggle i Spleis.
2. **Backfill og skyggekjøring.** sp-inntekt og sp-sykepengegrunnlag lager inntektsavklaringene og sykepengegrunnlagene bak de deterministiske ID-ene. Spleis går gjennom `AvventerSykepengegrunnlag` og spør `SykepengegrunnlagResultat` uten å bruke svaret. sp-sykepengegrunnlag sammenligner sin egen fastsettelse med grunnlaget fra Spleis og logger forskjeller. Toggle i Spleis. Se specen for sykepengegrunnlaget.
3. **Bytte.** Spleis bruker grunnlaget fra sp-sykepengegrunnlag. Speil og Spesialist sender saksbehandlers inntektsendringer til sp-inntekt og skjønnsfastsettelser til sp-sykepengegrunnlag. Selvstendig næringsdrivende får grunnlaget fra Sigrun. Avviksvurderingen og grunnbeløpsreguleringen flyttes. Alt skjer med én toggle i Spleis og en toggle i Spesialist og Speil, som skrus på samtidig.
4. **Rydde opp.** Når migreringsloggene ikke får nye rader etter en full runde med `person_avstemming`, fjerner vi backfill. Deretter fjerner vi `Inntektsgrunnlag` fra Spleis, Spinnvill, Spregulering og inntektsfeltene i overstyringene i Spesialist.

Byttet er én fase fordi alt som endrer et sykepengegrunnlag, må flyttes samtidig. Korrigerer saksbehandler en inntekt i Spleis etter byttet, bruker ikke Spleis sitt eget grunnlag lenger. Korrigerer saksbehandler i sp-inntekt før byttet, bruker ikke Spleis endringen.

## Brukerhistorier

### Spleis spør om inntektsavklaring

1. Som Spleis vil jeg få en inntektsavklaring for et skjæringstidspunkt før rettighetskategorien avgjøres, slik at sp-rettighetskategori og sp-sykepengegrunnlag kan bruke de samme inntektene.
2. Som Spleis vil jeg gå gjennom `AvventerInntektsavklaring` på vei fra `AvventerBlokkerendePeriode` til `AvventerRettighetskategori`, slik at alle sykefraværstilfeller som skal vilkårsprøves, får en inntektsavklaring.
3. Som Spleis vil jeg sende én linje per arbeidsgiver med samme skjæringstidspunkt, med inntektskilden jeg har valgt, slik at sp-inntekt bruker den samme inntekten som jeg ville brukt i dag.
4. Som Spleis vil jeg sende meldingsreferanse-ID-en til inntektsmeldingen eller arbeidsgiveropplysningene når kilden er arbeidsgiver, slik at sp-inntekt kan hente meldingen fra Spedisjon.
5. Som Spleis vil jeg sende `A_ORDNINGEN` som kilde når jeg har gitt opp å vente på inntektsmelding, når arbeidsgiverperioden ikke er betalt av Nav, når skjæringstidspunktet er vilkårsprøvd før, eller når skatt skal beholdes fordi første fraværsdag er i en annen måned, slik at reglene for når a-ordningen brukes, blir i Spleis.
6. Som Spleis vil jeg sende en linje for selvstendig næringsdrivende når sykefraværstilfellet har en selvstendig periode, slik at sp-inntekt henter pensjonsgivende inntekt.
7. Som Spleis vil jeg si i behovet om sp-inntekt skal hente opplysningene fra registrene på nytt, slik at en vilkårsprøving får ferske opplysninger, mens en revurdering bruker de samme opplysningene som før, som i dag.
8. Som Spleis vil jeg lagre inntektsavklarings-ID-en i det gjeldende vilkårsgrunnlaget for skjæringstidspunktet, slik at jeg kan sende den videre i behovene `Rettighetskategori` og `Sykepengegrunnlag`.
9. Som Spleis vil jeg lage et minimalt vilkårsgrunnlag i `AvventerInntektsavklaring` når skjæringstidspunktet ikke har vilkårsgrunnlag, slik at ID-en gjelder hele sykefraværstilfellet fra første stund.
10. Som Spleis vil jeg sende inntektsavklarings-ID-en med i behovet `Rettighetskategori`, slik at sp-rettighetskategori kan bruke inntektene senere.
11. Som Spleis vil jeg gå gjennom `AvventerInntektsavklaring` også når en ny inntektsmelding kommer for et skjæringstidspunkt med fullt vilkårsgrunnlag, slik at sp-inntekt får den nye inntekten og sykepengegrunnlaget fastsettes på nytt.
12. Som Spleis vil jeg revurdere gjennom `AvventerInntektsavklaring` når jeg får `endret_inntektsavklaring`, slik at saksbehandlers endringer gir et nytt sykepengegrunnlag.
13. Som Spleis vil jeg sende behovet på nytt ved påminnelse når det ikke er besvart, slik at midlertidige feil i sp-inntekt, Spedisjon, Sigrun eller a-ordningen ikke stopper saken.
14. Som Spleis vil jeg gi alle eksisterende vilkårsgrunnlag en deterministisk inntektsavklarings-ID med en JSON-migrering, slik at ingen skjæringstidspunkt mangler ID.
15. Som Spleis vil jeg lage en ny deterministisk ID når jeg selv lager eller endrer et vilkårsgrunnlag før byttet, slik at ID-en alltid peker på inntektene jeg faktisk har brukt.
16. Som Spleis vil jeg avvise inntektsdelen av `overstyr_inntekt_og_refusjon` og hele `overstyr_arbeidsforhold` etter byttet, slik at inntektsendringer bare kan skje i sp-inntekt.

### sp-inntekt lager inntektsavklaringen

17. Som sp-inntekt vil jeg hente inntektsmeldinger og arbeidsgiveropplysninger synkront fra Spedisjon med meldingsreferanse-ID-ene, slik at Spleis ikke må sende innholdet.
18. Som sp-inntekt vil jeg hente inntekt fra a-ordningen for de tre siste kalendermånedene før skjæringstidspunktet for alle arbeidsgivere, slik at både arbeidsgivere med `A_ORDNINGEN` og arbeidsforhold uten søknad får inntekt.
19. Som sp-inntekt vil jeg hente inntekt fra a-ordningen for de tolv siste kalendermånedene før skjæringstidspunktet når sykefraværstilfellet har arbeidstakere, slik at sp-sykepengegrunnlag har sammenligningsgrunnlaget for avviksvurderingen.
20. Som sp-inntekt vil jeg hente arbeidsforholdene fra Aa-registeret, slik at jeg kan finne arbeidsforhold uten søknad med de samme reglene som Spleis bruker i dag.
21. Som sp-inntekt vil jeg ta med et arbeidsforhold uten søknad når personen var ansatt på skjæringstidspunktet og har inntekt i de to siste månedene før, eller arbeidsforholdet er nytt, slik at grunnlaget blir som i dag.
22. Som sp-inntekt vil jeg hente pensjonsgivende inntekt fra Sigrun for selvstendig næringsdrivende, slik at grunnlaget ikke bygger på tallene på søknaden.
23. Som sp-inntekt vil jeg starte med året før skjæringstidspunktet, hoppe over år i starten som ikke er fastsatt, og bruke de tre nyeste årene etter det, slik at grunnlaget bygger på de tre siste fastsatte årene.
24. Som sp-inntekt vil jeg regne et år der Sigrun svarer «ingen inntekt» som fastsatt med 0 kr, slik at et år uten inntekt ikke hoppes over.
25. Som sp-inntekt vil jeg bruke opplysningene fra registrene i den gjeldende inntektsavklaringen når Spleis ikke ber om ny innhenting, slik at en revurdering ikke endrer inntekter fra a-ordningen eller Sigrun i det stille.
26. Som sp-inntekt vil jeg ta med saksbehandlers korrigerte inntekter og deaktiverte arbeidsforhold fra den gjeldende inntektsavklaringen når jeg lager en ny, slik at saksbehandlers vurderinger står seg.
27. Som sp-inntekt vil jeg fjerne den korrigerte inntekten for en arbeidsgiver når en ny inntektsmelding med et annet beløp kommer, slik Spleis gjør i dag, slik at den nye inntekten blir vurdert.
28. Som sp-inntekt vil jeg gi samme inntektsavklarings-ID tilbake når en ny inntektsavklaring har de samme beløpene som den gjeldende, slik at Spleis og sp-sykepengegrunnlag ikke får en ny ID som betyr det samme.
29. Som sp-inntekt vil jeg føye en ny innhenting med samme beløp til den gjeldende inntektsavklaringen, slik at vi kan vise hvilke opplysninger som ble sett på, og når.
30. Som sp-inntekt vil jeg la behovet være ubesvart når Spedisjon, Sigrun, a-ordningen eller Aa-registeret ikke svarer, slik at Spleis prøver igjen.
31. Som sp-inntekt vil jeg be om inntekter og arbeidsforhold med egne behov på rapiden og svare på behovet fra Spleis når alle løsningene er kommet, slik sp-vilkarsproving gjør med `ArbeidsforholdV2`, slik at vi bruker de samme løserne som i dag.

### Andre tjenester leser inntektsavklaringen

32. Som sp-sykepengegrunnlag vil jeg slå opp en inntektsavklaring med ID, slik at jeg kan fastsette grunnlaget uten at Spleis sender inntektene.
33. Som sp-inntekt vil jeg kjøre backfill synkront når jeg får et oppslag på en ID jeg ikke kjenner, slik at tjenestene får svar selv om personen ikke har fått backfill ennå.
34. Som sp-inntekt vil jeg kjøre backfill synkront når Spleis spør uten ny innhenting og jeg ikke har noen inntektsavklaring for skjæringstidspunktet, slik at en revurdering av et gammelt skjæringstidspunkt bygger på inntektene Spleis brukte.

### Saksbehandler

35. Som saksbehandler vil jeg se inntektene for skjæringstidspunktet med kilde, beløp per måned og omregnet månedsinntekt, slik at jeg ser hva grunnlaget bygger på.
36. Som saksbehandler vil jeg korrigere månedsinntekten for en arbeidsgiver med begrunnelse og lovhjemmel, slik at jeg kan rette en inntekt som ikke er riktig.
37. Som saksbehandler vil jeg deaktivere et arbeidsforhold med begrunnelse, slik at et arbeidsforhold som ikke er relevant, ikke tas med i grunnlaget.
38. Som saksbehandler vil jeg aktivere et deaktivert arbeidsforhold igjen, slik at jeg kan gjøre om en deaktivering.
39. Som saksbehandler vil jeg at endringene mine krever totrinnsvurdering, som i dag, slik at en beslutter kontrollerer dem.
40. Som saksbehandler vil jeg se historikken over endringer i inntektsavklaringen, slik at jeg ser hvem som endret hva, og når.
41. Som saksbehandler vil jeg se perioder i `AvventerInntektsavklaring` som «Forbereder godkjenning» i Speil, slik som perioder i `AvventerVilkårsprøving`.

### Backfill

42. Som Spleis vil jeg tilby et endepunkt i spleis-api som gir inntektene i alle vilkårsgrunnlag for en person med de deterministiske ID-ene, slik at sp-inntekt og sp-sykepengegrunnlag kan kjøre backfill.
43. Som sp-inntekt vil jeg lage inntektsavklaringer for deterministiske ID-er med inntektene Spleis brukte, slik at de gamle skjæringstidspunktene får en inntektsavklaring som stemmer med utbetalingen.
44. Som sp-inntekt vil jeg hente begrunnelsene for korrigerte inntekter og deaktiverte arbeidsforhold fra Spesialist, slik at historikken ikke mister dem.
45. Som sp-inntekt vil jeg hente sammenligningsgrunnlaget fra Spinnvill, slik at en ny avviksvurdering etter byttet sammenligner med det samme sammenligningsgrunnlaget som før.
46. Som sp-inntekt vil jeg hente historikken for personen ved hver `person_avstemming` og lagre ID-ene som mangler, slik at ID-er Spleis har laget siden sist også får backfill.
47. Som sp-inntekt vil jeg føre en migreringslogg per person, slik at vi vet når alle har fått backfill.

### Drift

48. Som Spock vil jeg påminne perioder i `AVVENTER_INNTEKTSAVKLARING` etter én time, slik at ubesvarte behov sendes på nytt like raskt som andre behov.
49. Som utvikler vil jeg få melding i Slack fra spammer når en periode er påminnet mange ganger i `AVVENTER_INNTEKTSAVKLARING`, slik at vi oppdager perioder som står fast.

## Beslutninger om implementasjon

### Ny tjeneste: sp-inntekt

- Ny Kotlin-app med egen Postgres-database, satt opp etter sykepenger-standarden og etter mønsteret fra sp-vilkarsproving og sp-rettighetskategori.
- Lagringen skiller mellom en inntektsavklaring og innhentingene bak den, etter prinsippet i ADR 0006. En inntektsavklaring har ID, fødselsnummer, skjæringstidspunkt, kilde (`automatisk`, `saksbehandler` eller `spleis`), tidspunkt og innholdet. En innhenting er én gjennomgang av opplysningene: meldingsreferanse-ID-ene fra Spleis, svarene fra registrene, tidspunktet og kodeversjonen. Gjeldende inntektsavklaring er den nyeste for person og skjæringstidspunkt.
- To inntektsavklaringer har samme beløp når hver yrkesaktivitet har samme månedsinntekt, samme korrigerte inntekt og samme status (aktiv eller deaktivert), og pensjonsgivende inntekt er lik for de samme årene. Da føyes innhentingen til den gjeldende, og ID-en er den samme. Ellers lages en ny inntektsavklaring med ny ID.
- Innholdet i en inntektsavklaring:
  - per arbeidsgiver: organisasjonsnummer, valgt kilde (`ARBEIDSGIVER` eller `A_ORDNINGEN`), om arbeidsforholdet har søknad, månedsinntekten fra inntektsmeldingen eller arbeidsgiveropplysningene med meldingsreferanse-ID, inntektene fra a-ordningen for beregningsperioden per måned, ansettelsesperiodene, korrigert inntekt og om arbeidsforholdet er deaktivert
  - for selvstendig næringsdrivende: pensjonsgivende inntekt per år med de fire inntektstypene fra Sigrun, om året er fastsatt, og kilden (`SIGRUN` eller `SØKNAD`, der `SØKNAD` bare kommer fra backfill)
  - sammenligningsgrunnlaget: inntektene fra a-ordningen for de tolv siste kalendermånedene, per måned og arbeidsgiver, med inntektstype, fordel og beskrivelse
- Inntektsavklaringen regner ikke om til årsinntekt. Det gjør sp-sykepengegrunnlag.

### Behovet `Inntektsavklaring`

- Inn:
  - `fødselsnummer`: string
  - `Inntektsavklaring.skjæringstidspunkt`: dato
  - `Inntektsavklaring.nyInnhenting`: boolean. `true` når skjæringstidspunktet ikke har fullt vilkårsgrunnlag, ellers `false`.
  - `Inntektsavklaring.yrkesaktiviteter`: liste med objekter:
    - `type`: `ARBEIDSTAKER` eller `SELVSTENDIG`
    - `organisasjonsnummer`: string, påkrevd for `ARBEIDSTAKER`, mangler for `SELVSTENDIG`
    - `inntektskilde`: `ARBEIDSGIVER` eller `A_ORDNINGEN`, påkrevd for `ARBEIDSTAKER`
    - `meldingsreferanseId`: UUID, påkrevd når `inntektskilde` er `ARBEIDSGIVER`
- Ut: `@løsning.Inntektsavklaring.id`: UUID.
- Spleis sender én linje per arbeidsgiver med en periode som ikke er forkastet og har samme skjæringstidspunkt, og én linje for selvstendig næringsdrivende hvis sykefraværstilfellet har en selvstendig periode. Arbeidsforhold uten søknad sendes ikke. Dem finner sp-inntekt selv.
- Spleis velger kilde for hver arbeidsgiver med den samme logikken som i dag (`Inntektssituasjon`). `ARBEIDSGIVER` bruker meldingsreferanse-ID-en til inntekten som ligger på den første behandlingen til arbeidsgiveren.
- Ved `nyInnhenting: true`, eller når sp-inntekt ikke har noen inntektsavklaring for skjæringstidspunktet, henter sp-inntekt opplysningene fra registrene. Ved `nyInnhenting: false` bruker den opplysningene fra registrene i den gjeldende inntektsavklaringen og henter bare inntektsmeldingene på nytt. Finnes det ingen gjeldende inntektsavklaring og `nyInnhenting` er `false`, kjører sp-inntekt backfill for personen først.
- sp-inntekt henter opplysningene med egne behov på rapiden, med det opprinnelige behovet i feltet `opprinneligBehov`, slik sp-vilkarsproving gjør:
  - `InntekterForSykepengegrunnlag` med `skjæringstidspunkt`, `beregningStart` (tre måneder før skjæringstidspunktet) og `beregningSlutt` (måneden før)
  - `InntekterForSammenligningsgrunnlag` med `skjæringstidspunkt`, `beregningStart` (tolv måneder før) og `beregningSlutt` (måneden før), bare når det finnes arbeidstakere
  - `ArbeidsforholdV2` med `skjæringstidspunkt`
- sp-inntekt svarer på behovet fra Spleis først når alle løsningene er kommet, og bare etter at inntektsavklaringen er lagret.
- Sigrun kalles over HTTP med client credentials, med samme endepunkt som sykepengesoknad-backend: `/api/v1/pensjonsgivendeinntektforfolketrygden` og `rettighetspakke=navSykepenger`. `PGIF-008` betyr fastsatt med 0 kr. `PGIF-006` betyr ikke fastsatt.
- Spedisjon kalles over HTTP med meldingsreferanse-ID-ene, slik sp-rettighetskategori henter søknader.
- Regelen for arbeidsforhold uten søknad flyttes fra Spleis uten endringer: personen er ansatt på skjæringstidspunktet, og har inntekt i de to siste månedene før skjæringstidspunktet eller et arbeidsforhold som startet i løpet av de to siste månedene uten inntekt ennå.

### Endringer i Spleis

- Ny tilstand `AvventerInntektsavklaring` mellom `AvventerBlokkerendePeriode` og `AvventerRettighetskategori`. Perioden går alltid gjennom tilstanden på vei til `AvventerRettighetskategori`.
- Spleis går også gjennom `AvventerInntektsavklaring`, `AvventerRettighetskategori` og `AvventerSykepengegrunnlag` i revurdering når skjæringstidspunktet har fullt vilkårsgrunnlag og:
  - en ny inntektsmelding eller nye arbeidsgiveropplysninger kommer for en arbeidsgiver i sykefraværstilfellet, eller
  - Spleis får `endret_inntektsavklaring`.
  Med fullt vilkårsgrunnlag går perioden videre til `AvventerHistorikkRevurdering` etter `AvventerSykepengegrunnlag`, uten ny vilkårsprøving. Ellers går den til `AvventerVilkårsprøving` som i dag.
- Det minimale vilkårsgrunnlaget fra ADR 0003 får feltene `inntektsavklaringId` og `sykepengegrunnlagId`. Det lages i `AvventerInntektsavklaring`, og rettighetskategori-ID-en legges til i `AvventerRettighetskategori`. Feltet `rettighetskategoriId` er nullbart bare for den minimale typen. Typen beholder verdien `Rettighetskategori` i JSON-en, så vi slipper migrering.
- Har skjæringstidspunktet fullt vilkårsgrunnlag, lagrer Spleis den nye ID-en med en gang i en kopi av det fulle vilkårsgrunnlaget.
- De fulle vilkårsgrunnlagene får feltet `inntektsavklaringId`, som aldri er tomt.
  - En JSON-migrering setter det på alle eksisterende vilkårsgrunnlag, både fra Spleis og fra Infotrygd, til `UUID.nameUUIDFromBytes("$vilkårsgrunnlagId:Inntektsavklaring")`.
  - Før byttet får alle fulle vilkårsgrunnlag som Spleis lager eller kopierer, den deterministiske ID-en fra sin egen `vilkårsgrunnlagId`. ID-en fra sp-inntekt brukes da bare til å sende videre i behovene. Grunnen er at Spleis fortsatt bruker sitt eget `Inntektsgrunnlag`, og at backfill skal gi sp-inntekt nøyaktig de inntektene Spleis brukte.
  - Etter byttet beholder det fulle vilkårsgrunnlaget ID-en fra sp-inntekt.
- Ny hendelse `endret_inntektsavklaring`: `fødselsnummer` (string), `skjæringstidspunkt` (dato) og `inntektsavklaringId` (UUID). Spleis starter en revurdering av sykefraværstilfellet. ID-en i hendelsen brukes bare til logging. Spleis får den samme ID-en igjen i løsningen på `Inntektsavklaring`.
- Behovet `Rettighetskategori` får det nye feltet `Rettighetskategori.inntektsavklaringId` (UUID). sp-rettighetskategori tar imot feltet, men bruker det ikke ennå.
- Etter byttet avviser Spleis `overstyr_arbeidsforhold` og inntektsdelen av `overstyr_inntekt_og_refusjon`. Refusjonsdelen behandles som i dag.
- `AvventerVilkårsprøving` sender `InntekterForSykepengegrunnlag` fram til opprydningen, fordi Spleis lager sitt eget `Inntektsgrunnlag` til da.
- Tilstanden heter `AVVENTER_INNTEKTSAVKLARING` i `TilstandType`, i `TilstandTypeData` i person-JSON, i `VedtaksperiodetilstandDto` og i `SpannerPersonDto`. Det er én tilstand for både førstegangsbehandling og revurdering. Den må være med i serde i samme deploy som de nye feltene, før togglen for fase 1 skrus på.
- spleis-api mapper tilstanden til `Periodetilstand.ForberederGodkjenning`, som `AVVENTER_VILKÅRSPRØVING`.

### Endepunkt i spleis-api for backfill

- `POST /api/sykepengegrunnlag` med `{ "fødselsnummer": string }`. Endepunktet brukes av både sp-inntekt og sp-sykepengegrunnlag.
- Svaret er `{ "sykepengegrunnlag": [...] }` med ett element per fullt vilkårsgrunnlag i historikken som har deterministiske ID-er:
  - `vilkårsgrunnlagId`, `sykepengegrunnlagId` og `inntektsavklaringId` (UUID)
  - `skjæringstidspunkt` (dato), `opprettet` (tidspunkt) og `kilde` (`SPLEIS` eller `INFOTRYGD`)
  - `grunnbeløp` (desimaltall, årlig) og `seksG` (desimaltall)
  - `arbeidsgivere`: liste med `organisasjonsnummer`, `deaktivert` (boolean), `inntektskilde` (`ARBEIDSGIVER`, `A_ORDNINGEN` eller `INFOTRYGD`), `meldingsreferanseId` (UUID eller null), `månedsinntekt` (desimaltall), `skatteopplysninger` (liste med `måned`, `beløp`, `type`, `fordel` og `beskrivelse`, eller null), `korrigertInntekt` (`{ månedsinntekt, meldingsreferanseId }` eller null) og `skjønnsfastsatt` (`{ årsinntekt, meldingsreferanseId }` eller null)
  - `selvstendig`: `{ pensjonsgivendeInntekter: [{ år, næringsinntekt, lønnsinntekt, lønnsinntektBarePensjonsdel, næringsinntektFraFiskeFangstEllerFamiliebarnehage, erFerdigLignet }], anvendtGrunnbeløp, skjønnsfastsatt }` eller null
- `meldingsreferanseId` på korrigert inntekt og skjønnsfastsettelse er ID-en til hendelsen fra Spesialist. Backfill bruker den til å finne begrunnelsen i Spesialist.

### Backfill i sp-inntekt

- Backfill følger mønsteret fra sp-vilkarsproving og sp-rettighetskategori: `SpleisClient`, `PersonAvstemmingService` og en migreringslogg.
- Inntektsavklaringer fra backfill lagres med ID-en fra Spleis, kilde `spleis` og tidspunktet `opprettet` fra Spleis. Lagringen er idempotent på ID.
- Pensjonsgivende inntekt fra backfill får kilden `SØKNAD`.
- sp-inntekt henter begrunnelsene for korrigerte inntekter og deaktiverte arbeidsforhold fra Spesialist med `POST /api/inntektsendringer` og `{ "fødselsnummer": string }`. Svaret er en liste med `meldingsreferanseId` (UUID), `type` (`KORRIGERT_INNTEKT`, `ARBEIDSFORHOLD_DEAKTIVERT` eller `ARBEIDSFORHOLD_AKTIVERT`), `skjæringstidspunkt`, `organisasjonsnummer`, `saksbehandlerIdent`, `tidspunkt`, `begrunnelse`, `forklaring` og `lovhjemmel` (`paragraf`, `ledd`, `bokstav`, `lovverk` og `lovverksversjon`, eller null).
- sp-inntekt henter sammenligningsgrunnlaget fra Spinnvill med `POST /api/avviksvurderinger`. Kontrakten står i specen for sykepengegrunnlaget. sp-inntekt bruker sammenligningsgrunnlaget fra avviksvurderingen som er koblet til `vilkårsgrunnlagId`.
- Backfill kjører ved `person_avstemming`, ved oppslag på en ukjent ID og ved behovet `Inntektsavklaring` uten ny innhenting når skjæringstidspunktet mangler inntektsavklaring. Svarer ikke spleis-api, Spesialist eller Spinnvill, svarer ikke sp-inntekt.
- Migreringsloggen har én rad per backfill som lagrer minst én ny ID, med fødselsnummer, tidspunkt, antall ID-er fra Spleis og antall nye.

### API for andre tjenester og Speil

- `GET /api/inntektsavklaringer/{inntektsavklaringId}` for andre tjenester, med maskin-til-maskin-token. sp-sykepengegrunnlag er den første som bruker det. Finnes ikke ID-en, kjører sp-inntekt backfill og svarer 404 hvis den fortsatt ikke finnes. Svaret er innholdet i inntektsavklaringen:
  - `id` (UUID), `fødselsnummer` (string), `skjæringstidspunkt` (dato), `kilde` (`AUTOMATISK`, `SAKSBEHANDLER` eller `SPLEIS`) og `opprettet` (tidspunkt)
  - `arbeidsgivere`: liste med objekter:
    - `organisasjonsnummer`: string
    - `inntektskilde`: `ARBEIDSGIVER`, `A_ORDNINGEN` eller `INFOTRYGD`. `INFOTRYGD` kommer bare fra backfill.
    - `harSøknad`: boolean. `false` for arbeidsforhold uten søknad.
    - `deaktivert`: boolean
    - `inntektFraArbeidsgiver`: `{ meldingsreferanseId: UUID, månedsinntekt: desimaltall }` eller null
    - `inntektFraInfotrygd`: `{ månedsinntekt: desimaltall }` eller null
    - `inntekterFraAOrdningen`: liste med `måned` (år og måned), `beløp` (desimaltall), `type` (`LØNNSINNTEKT`, `NÆRINGSINNTEKT`, `PENSJON_ELLER_TRYGD` eller `YTELSE_FRA_OFFENTLIGE`), `fordel` (string) og `beskrivelse` (string), for de tre månedene i beregningsperioden
    - `ansettelsesperioder`: liste med `fom` (dato) og `tom` (dato eller null)
    - `korrigertInntekt`: `{ månedsinntekt: desimaltall, endringId: UUID }` eller null
  - `selvstendig`: `{ pensjonsgivendeInntekter: [...] }` eller null. Hvert år har `år` (heltall), `næringsinntekt`, `lønnsinntekt`, `lønnsinntektBarePensjonsdel` og `næringsinntektFraFiskeFangstEllerFamiliebarnehage` (desimaltall), `erFastsatt` (boolean) og `kilde` (`SIGRUN` eller `SØKNAD`).
  - `sammenligningsgrunnlag`: liste med `organisasjonsnummer` (string) og `inntekter` (samme felter som `inntekterFraAOrdningen`) for de tolv månedene, eller null når sykefraværstilfellet ikke har arbeidstakere
- Endepunkter for Speil under `/api/personer/{pseudoId}`, med tilgangskontroll per person og auditlogging (ADR 0004):
  - `GET .../inntektsavklaringer/{inntektsavklaringId}` gir det samme innholdet uten `fødselsnummer`, og i tillegg `historikk`: liste med `inntektsavklaringId` (UUID), `tidspunkt`, `kilde`, og `endring` (`{ endringId, type, organisasjonsnummer, saksbehandlerIdent, begrunnelse, forklaring }` eller null for innhentinger og backfill). `type` er `KORRIGERT_INNTEKT`, `ARBEIDSFORHOLD_DEAKTIVERT` eller `ARBEIDSFORHOLD_AKTIVERT`.
  - `POST .../sykefravaerstilfeller/{skjæringstidspunkt}/korrigert-inntekt` med `organisasjonsnummer` (string), `månedsinntekt` (desimaltall), `begrunnelse` (string), `forklaring` (string) og `lovhjemmel` (`{ paragraf: string, ledd: string eller null, bokstav: string eller null, lovverk: string, lovverksversjon: string }`).
  - `POST .../sykefravaerstilfeller/{skjæringstidspunkt}/arbeidsforhold/{organisasjonsnummer}/deaktivering` og `.../aktivering` med `begrunnelse` (string) og `forklaring` (string).
  - De tre `POST`-endepunktene svarer `{ "inntektsavklaringId": UUID }`. De svarer 404 når skjæringstidspunktet ikke har inntektsavklaring, og 400 når arbeidsgiveren ikke er i inntektsavklaringen eller endringen ikke endrer noe.
  - `GET .../saksbehandlerhandlinger/{handlingId}/visning` gir `{ felter: [...] }` med felter av typen `TEKST` (`tittel`, `tekst`) og `LISTE` (`tittel`, `elementer`), som i sp-vilkarsproving. Speil viser feltene ved totrinnsvurderingen.
- En endring fra saksbehandler gir en ny inntektsavklaring med kilde `saksbehandler` og en ny `endringId`. sp-inntekt publiserer gjennom en outbox, slik sp-vilkarsproving gjør:
  - `endret_inntektsavklaring` til Spleis
  - `saksbehandlerhandling` til Spesialist med `fødselsnummer`, `skjæringstidspunkt`, `saksbehandlerIdent`, `kreverTotrinnsvurdering: true`, `handlingId` (lik `endringId`), `handlingType` (`KORRIGERT_INNTEKT`, `ARBEIDSFORHOLD_DEAKTIVERT` eller `ARBEIDSFORHOLD_AKTIVERT`) og `tidspunkt`. Spesialist får de tre nye verdiene i `HandlingType`.
- Speil går til sp-inntekt for visningen når `handlingType` er en av de tre verdiene.

### Endringer i Spock, spammer og Speil

- Spock: `AVVENTER_INNTEKTSAVKLARING` legges i gruppen med påminnelse etter én time, sammen med `AVVENTER_VILKÅRSPRØVING`.
- spammer: `AVVENTER_INNTEKTSAVKLARING` legges til i `interessanteTilstander`.
- Speil: inntektsvisningen og skjemaene for korrigert inntekt og deaktivering bruker sp-inntekt bak en toggle som skrus på ved byttet. Refusjonsskjemaet går fortsatt til Spesialist.

## Beslutninger om testing

- Gode tester sjekker ytre oppførsel: behov inn, løsninger og hendelser ut, innholdet i API-svarene og tilstandene i Spleis. De tester ikke interne klasser.
- **sp-inntekt, på rapid- og REST-nivå.** Testene sender behov og `person_avstemming` inn, svarer på de utgående behovene og sjekker løsningen, hendelsene og databasen. Spedisjon, Sigrun, spleis-api, Spesialist og Spinnvill fakes i HTTP-klientene, og databasen er ekte Postgres. Testene dekker:
  - arbeidstaker med inntektsmelding, med a-ordningen og med begge for ulike arbeidsgivere
  - arbeidsforhold uten søknad, med og uten inntekt de to siste månedene, og nytt arbeidsforhold
  - selvstendig næringsdrivende med tre fastsatte år, med siste år ikke fastsatt (`PGIF-006`) og med et år uten inntekt (`PGIF-008`)
  - samme beløp gir samme ID, og nytt beløp gir ny ID
  - `nyInnhenting: false` som bruker opplysningene fra registrene i den gjeldende inntektsavklaringen
  - korrigert inntekt som står seg ved en ny inntektsmelding med samme beløp og forsvinner ved et nytt beløp
  - feil fra Spedisjon eller Sigrun som gir ubesvart behov
  - endringer fra saksbehandler som gir `endret_inntektsavklaring` og `saksbehandlerhandling` gjennom outboxen
  - backfill ved `person_avstemming`, ved oppslag på ukjent ID og ved behov uten ny innhenting

  Tester å bygge videre på: `OpptjeningsvurderingRiverTest`, `PersonAvstemmingRiverTest` og testene for `PostManuellOpptjeningsvurderingBehandler` i sp-vilkarsproving, og testene i sp-rettighetskategori.
- **Spleis, e2e i sykepenger-model.** Testene svarer på `Inntektsavklaring` med testløsninger og sjekker tilstandene, innholdet i behovet og ID-ene i vilkårsgrunnlaget. Scenarioene dekker:
  - én og flere arbeidsgivere, selvstendig næringsdrivende og hver av grunnene til å bruke a-ordningen
  - ny inntektsmelding for et skjæringstidspunkt med fullt vilkårsgrunnlag
  - `endret_inntektsavklaring`
  - togglen av og på
  - forlengelser som ikke går gjennom tilstanden
  - påminnelse

  Tester å bygge videre på: testene for `AvventerRettighetskategori` og `EndretVurderingPåSkjæringstidspunktTest`.
- **Spleis, serde og migrering.** Det minimale vilkårsgrunnlaget med de nye feltene kan lagres og leses igjen. Migreringen gir alle vilkårsgrunnlag en deterministisk `inntektsavklaringId`.
- **Spleis, spleis-api.** Endepunktet testes med arbeidstakere, selvstendig, deaktiverte arbeidsforhold, korrigerte inntekter, skjønnsfastsettelse og vilkårsgrunnlag fra Infotrygd. Tester å bygge videre på: testene for `OpptjeningApi` og endepunktet for rettighetskategorier.
- **Behovkontrakt.** `Inntektsavklaring` og det nye feltet i `Rettighetskategori` legges inn i `BehovkontraktTest`.

## Utenfor omfang

- At sp-rettighetskategori bruker inntektsavklaringen. Den tar bare imot ID-en.
- Inntekter for kombinerte kategorier, Inaktiv, dagpenger, frilanser og vernepliktige. Modellen har én type per yrkesaktivitet, slik at de kan legges til uten å endre kontrakten med Spleis.
- Varig endring og ny i arbeidslivet for selvstendig næringsdrivende. Spleis forkaster fortsatt ut fra svarene på søknaden.
- Refusjon. Den blir i Spleis.
- Inntektsendringer under sykefraværet (`InntekterForBeregning`). De er ikke en del av sykepengegrunnlaget.
- Å flytte reglene for når a-ordningen brukes, ut av Spleis.

## Andre merknader

- Regelen for hvilke år fra Sigrun som brukes, gjelder inntil videre. Vi må avstemme den med team flex når vi implementerer, fordi sykepengesoknad-backend har egne regler for de samme årene.
- **Åpent spørsmål:** Er det riktig etter loven å regne `PGIF-008` som et fastsatt år med 0 kr? Det må avklares med fag før sp-inntekt tar regelen i bruk.
- **Åpent spørsmål:** Hva betyr det at saksbehandler kan «aktivere og deaktivere inntekter», ut over arbeidsforhold? Hvis det betyr å holde enkeltinntekter fra a-ordningen utenfor sammenligningsgrunnlaget eller beregningsperioden, trenger vi et eget endepunkt og en egen `handlingType`.
- **Åpent spørsmål:** Har alle korrigerte inntekter og skjønnsfastsettelser i Spleis en meldingsreferanse-ID som Spesialist kjenner igjen? Må sjekkes før backfill bygges.
- **Åpent spørsmål:** Skal sp-inntekt sende subsumsjonsmeldinger for § 8-28 og § 8-29 når a-ordningen brukes, slik Spleis gjør i dag, eller er den lagrede inntektsavklaringen sporingen (som i ADR 0006 for sp-avslagsdager)?
- Etter byttet kan vi ikke rulle tilbake ved å skru av togglen uten å miste endringer saksbehandler har gjort i sp-inntekt. Spleis beholder `Inntektsgrunnlag` fram til opprydningen, så det gjelder bare skjæringstidspunkter som er endret etter byttet.
